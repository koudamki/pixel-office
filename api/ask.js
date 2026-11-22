import fs from 'node:fs/promises'
import path from 'node:path'

const CLAUDE_MODEL = process.env.MODEL_CLAUDE || 'claude-sonnet-5-5'
const GROQ_MODEL = process.env.MODEL_GROQ || 'llama-3.3-70b-versatile'
const WEB_TOOL = process.env.WEB_SEARCH_TOOL || 'web_search_20250305'
const MAX_STEPS = 5
const hits = new Map()
let registry = null

function parseFrontmatter(raw) {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!m) return { body: raw.trim() }
  const pick = (k) => { const x = m[1].match(new RegExp('^' + k + ':\\s*(.+)$', 'm')); return x ? x[1].trim().replace(/^["']|["']$/g, '') : undefined }
  return { name: pick('name'), description: pick('description'), body: m[2].trim() }
}

async function discoverSkills() {
  if (registry) return registry
  registry = new Map()
  const root = path.join(process.cwd(), 'skills')
  let dirs = []
  try { dirs = (await fs.readdir(root, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name) } catch { return registry }
  for (const dir of dirs) {
    try {
      const file = path.join(root, dir, 'SKILL.md')
      const p = parseFrontmatter(await fs.readFile(file, 'utf8'))
      const name = p.name || dir
      registry.set(name, { name, description: p.description || 'Skill: ' + name, file })
    } catch { /* skip folders without a SKILL.md */ }
  }
  return registry
}

async function loadSkill(reg, name) {
  const meta = reg.get(String(name))
  if (!meta) return 'Error: skill "' + name + '" not found. Available: ' + ([...reg.keys()].join(', ') || 'none') + '. Answer directly instead.'
  return parseFrontmatter(await fs.readFile(meta.file, 'utf8')).body
}

function systemPrompt(reg) {
  const idx = reg.size ? [...reg.values()].map((s) => '- **' + s.name + '**: ' + s.description).join('\n') : 'No extra skills loaded. Answer directly.'
  return `You are the AI assistant built into Pixel Office, a pixel-art office simulation. You help with any request: questions, writing, coding, analysis, planning, maths, translation and advice. Today is ${new Date().toISOString().slice(0, 10)}.

Rules:
- Answer the request directly, in the user's language. Match depth to the question: short for simple ones, structured for complex ones.
- Format in Markdown: short paragraphs, lists, tables for comparisons or schedules, and fenced code blocks with a language for code.
- Use the conversation so far. If a request is ambiguous, state your assumption, answer, and ask one short follow-up question.
- Never invent facts, URLs, file paths, prices or quotes. If you do not know or cannot check, say so. If you used web search, base claims on it and say what you could not verify.
- Do not claim to have run code or taken actions you cannot take.

Skills (load one only when the request clearly matches):
${idx}

When a skill matches, call load_skill first and follow it. Otherwise answer directly.`
}

const SKILL_TOOL_DESC = 'Load the full instructions for a named skill when the request matches its description.'

async function runClaude(key, msgs, reg) {
  const steps = [], sources = new Map()
  let messages = msgs.map((m) => ({ role: m.role, content: m.content })), search = true
  for (let i = 0; i < MAX_STEPS + 1; i++) {
    const tools = [{ name: 'load_skill', description: SKILL_TOOL_DESC, input_schema: { type: 'object', properties: { skillName: { type: 'string', description: 'Exact skill name' } }, required: ['skillName'] } }]
    if (search) tools.push({ type: WEB_TOOL, name: 'web_search', max_uses: 3 })
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 2500, system: systemPrompt(reg), tools, messages }) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) {
      if (search && r.status === 400) { search = false; continue }          // web search not enabled for this key: carry on without it
      throw new Error((j.error && j.error.message) || 'Claude API ' + r.status)
    }
    for (const b of j.content || []) if (b.type === 'text') for (const c of b.citations || []) if (c.url) sources.set(c.url, { title: c.title || c.url, url: c.url })
    if (j.stop_reason === 'tool_use') {
      const results = []
      for (const b of j.content) if (b.type === 'tool_use') {
        if (b.name === 'load_skill') steps.push(String(b.input && b.input.skillName))
        results.push({ type: 'tool_result', tool_use_id: b.id, content: b.name === 'load_skill' ? await loadSkill(reg, b.input && b.input.skillName) : 'Unknown tool.' })
      }
      messages = [...messages, { role: 'assistant', content: j.content }, { role: 'user', content: results }]
      continue
    }
    if (j.stop_reason === 'pause_turn') { messages = [...messages, { role: 'assistant', content: j.content }]; continue }
    return { text: (j.content || []).filter((b) => b.type === 'text').map((b) => b.text).join(''), steps, sources: [...sources.values()].slice(0, 8), provider: 'claude' }
  }
  throw new Error('The assistant took too many steps.')
}

async function runGroq(key, msgs, reg) {
  const steps = []
  const tools = [{ type: 'function', function: { name: 'load_skill', description: SKILL_TOOL_DESC, parameters: { type: 'object', properties: { skillName: { type: 'string' } }, required: ['skillName'] } } }]
  const messages = [{ role: 'system', content: systemPrompt(reg) }, ...msgs.map((m) => ({ role: m.role, content: m.content }))]
  for (let i = 0; i < MAX_STEPS; i++) {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' }, body: JSON.stringify({ model: GROQ_MODEL, messages, tools, tool_choice: 'auto', max_tokens: 2000, temperature: 0.4 }) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error((j.error && (j.error.message || j.error)) || 'Groq API ' + r.status)
    const m = j.choices[0].message
    if (m.tool_calls && m.tool_calls.length) {
      messages.push({ role: 'assistant', content: m.content || '', tool_calls: m.tool_calls })
      for (const tc of m.tool_calls) {
        let args = {}; try { args = JSON.parse(tc.function.arguments || '{}') } catch { /* ignore bad arguments */ }
        steps.push(String(args.skillName))
        messages.push({ role: 'tool', tool_call_id: tc.id, content: await loadSkill(reg, args.skillName) })
      }
      continue
    }
    return { text: m.content || '', steps, sources: [], provider: 'groq' }
  }
  throw new Error('The assistant took too many steps.')
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).end()
  const origin = req.headers.origin
  if (origin) { try { if (new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'forbidden' }) } catch { return res.status(403).json({ error: 'forbidden' }) } }
  if (!String(req.headers['content-type'] || '').includes('application/json')) return res.status(415).json({ error: 'json only' })
  if (Number(req.headers['content-length'] || 0) > 60000) return res.status(413).json({ error: 'too large' })

  const vk = req.headers['x-groq-key']
  const own = typeof vk === 'string' && vk.startsWith('gsk_')
  const provider = own ? 'groq' : process.env.ANTHROPIC_API_KEY ? 'claude' : process.env.GROQ_API_KEY ? 'groq' : null
  if (!provider) return res.status(503).json({ error: 'no-key' })
  const key = own ? vk : provider === 'claude' ? process.env.ANTHROPIC_API_KEY : process.env.GROQ_API_KEY
  if (!own) {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0] || 'x', now = Date.now()
    const recent = (hits.get(ip) || []).filter((t) => now - t < 60000)
    if (recent.length >= 10) return res.status(429).json({ error: 'slow-down' })
    hits.set(ip, [...recent, now])
  }
  const raw = Array.isArray((req.body || {}).messages) ? req.body.messages : []
  let msgs = raw.slice(-20).filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim()).map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }))
  while (msgs.length && msgs[0].role !== 'user') msgs.shift()
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return res.status(400).json({ error: 'empty' })
  try {
    const reg = await discoverSkills()
    const out = provider === 'claude' ? await runClaude(key, msgs, reg) : await runGroq(key, msgs, reg)
    return res.status(200).json(out)
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e).slice(0, 200) })
  }
}
