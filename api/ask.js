const FAST = 'llama-3.3-70b-versatile', WEB = 'groq/compound';
const NL = String.fromCharCode(10);
const hits = new Map();
const shape = (o) => JSON.stringify(o);
const PLAN = 'You read long, messy, typo-filled questions in any language. Return ONLY JSON like ' + shape({ language: '', intent: '', constraints: ['every rule or preference the user stated'], sub_queries: ['2-4 short independent searches that together cover every part'] });
const FACTS = 'You are a research assistant. Report only facts you actually know or found, as short bullets with names, numbers and dates. If unsure, write: unknown. Never guess.';
const rules = (p) => `Answer in the user's language (${p.language || 'same as the question'}). Satisfy EVERY constraint: ${shape(p.constraints || [])}. Use ONLY the research given; if something is unsupported, say you could not verify it. Never invent facts, prices or times. Use a table for comparisons, schedules and day-by-day plans. Return ONLY JSON like ` + shape({ blocks: [{ type: 'text', text: '' }, { type: 'table', title: '', columns: [''], rows: [['']] }, { type: 'cards', items: [{ title: '', text: '' }] }], followups: [''] });
const parse = (s) => { try { return JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1)); } catch { return null; } };
const groq = async (key, model, system, user, max) => {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' }, body: JSON.stringify({ model, max_tokens: max, temperature: 0.3, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j.error && (j.error.message || j.error)) || 'HTTP ' + r.status);
  return (j.choices && j.choices[0] && j.choices[0].message.content) || '';
};
export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const vk = req.headers['x-groq-key'];
  const own = typeof vk === 'string' && vk.startsWith('gsk_');
  const key = own ? vk : process.env.GROQ_API_KEY;
  if (!key) return res.status(503).json({ error: 'no-key' });
  if (!own) {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0] || 'x', now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
    if (recent.length >= 10) return res.status(429).json({ error: 'slow-down' });
    hits.set(ip, [...recent, now]);
  }
  const b = req.body || {};
  const q = String(b.message || '').slice(0, 2000).trim();
  if (!q) return res.status(400).json({ error: 'empty' });
  const ctx = (Array.isArray(b.history) ? b.history : []).slice(-3).map((x) => String(x).slice(0, 120)).join(' | ');
  try {
    const plan = parse(await groq(key, FAST, PLAN, (ctx ? 'Earlier questions: ' + ctx + NL : '') + q, 500)) || {};
    const subs = (Array.isArray(plan.sub_queries) && plan.sub_queries.length ? plan.sub_queries : [q]).slice(0, 4).map(String);
    let web = true;
    const found = await Promise.all(subs.map(async (s) => { try { return await groq(key, WEB, FACTS, s, 700); } catch { web = false; try { return await groq(key, FAST, FACTS, s, 700); } catch { return ''; } } }));
    const brief = found.map((f, i) => 'Search ' + (i + 1) + ': ' + subs[i] + NL + (f || '(nothing found)')).join(NL + NL);
    const raw = await groq(key, FAST, rules(plan), (q + NL + NL + 'Research:' + NL + brief).slice(0, 9000), 1500);
    const d = parse(raw) || { blocks: [{ type: 'text', text: raw }] };
    res.status(200).json({ ...d, constraints: plan.constraints || [], searches: subs, web });
  } catch (e) { res.status(502).json({ error: String(e.message || e).slice(0, 160) }); }
};
