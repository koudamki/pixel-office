const el = (t, x, c) => { const n = document.createElement(t); if (x != null) n.textContent = String(x); if (c) n.className = c; return n; };
let key = '';
try { key = sessionStorage.getItem('po-ai-key') || ''; } catch { /* storage blocked */ }
const msgs = [];          // the conversation so far: { role, content }
let ctl = null, busy = false;

document.head.append(el('style', `
.ai-fab,.ai-panel,.ai-panel *{box-sizing:border-box}
.ai-fab{position:fixed;right:12px;bottom:64px;z-index:50}
.ai-panel{position:fixed;right:12px;bottom:108px;z-index:50;width:min(480px,calc(100vw - 24px));height:min(680px,calc(100dvh - 150px));display:flex;flex-direction:column;background:#12121a;color:#ece8f4;border:2px solid #34344a;font:13px/1.55 'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace}
.ai-panel[hidden]{display:none}
.ai-fab,.ai-panel button{font:inherit;color:#ece8f4;background:#1b1b27;border:2px solid #34344a;padding:5px 12px;cursor:pointer}
.ai-fab:hover,.ai-panel button:hover{border-color:#7fe0b5}
.ai-fab:focus-visible,.ai-panel button:focus-visible,.ai-panel textarea:focus-visible,.ai-panel input:focus-visible,.ai-panel summary:focus-visible{outline:2px solid #7fe0b5;outline-offset:2px}
.ai-panel button:disabled{opacity:.5;cursor:default}
.ai-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;border-bottom:2px solid #34344a}
.ai-head div{display:flex;gap:6px}
.ai-key{padding:6px 10px;border-bottom:1px solid #2b2b3a;color:#a8a8c0;font-size:12px}
.ai-key summary{cursor:pointer}
.ai-key div{display:flex;gap:6px;margin-top:6px}
.ai-panel input,.ai-panel textarea{flex:1;min-width:0;font:inherit;color:#ece8f4;background:#0b0b11;border:2px solid #34344a;padding:6px 8px}
.ai-panel ::placeholder{color:#7a7a92}
.ai-log{flex:1;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:10px}
.ai-msg{max-width:100%;padding:8px 10px;border:2px solid #2b2b3a;overflow-wrap:anywhere}
.ai-user{align-self:flex-end;background:#1b2a26;border-color:#3b8f72;white-space:pre-wrap}
.ai-bot{background:#171722}
.ai-err{color:#ff9a8f;border-color:#a8483d}
.ai-msg>*:first-child{margin-top:0}.ai-msg>*:last-child{margin-bottom:0}
.ai-msg p{margin:6px 0}
.ai-msg h1,.ai-msg h2,.ai-msg h3{margin:10px 0 4px;font-size:14px;color:#fff}
.ai-msg ul,.ai-msg ol{margin:6px 0;padding-left:20px}
.ai-msg a{color:#7fe0b5}
.ai-msg code{background:#0b0b11;padding:0 4px;border:1px solid #2b2b3a}
.ai-msg pre{margin:8px 0;padding:8px;background:#0b0b11;border:1px solid #2b2b3a;overflow:auto}
.ai-msg pre code{border:0;padding:0;background:none}
.ai-msg blockquote{margin:6px 0;padding-left:10px;border-left:3px solid #3b8f72;color:#c9c9dc}
.ai-tablewrap{overflow-x:auto;margin:6px 0}
.ai-msg table{border-collapse:collapse;width:100%;font-size:12px}
.ai-msg th,.ai-msg td{border:1px solid #34344a;padding:4px 6px;text-align:left;vertical-align:top}
.ai-msg th{background:#1d2b27;color:#fff}
.ai-meta{margin-top:8px;font-size:11px;color:#a8a8c0;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.ai-meta span{border:1px solid #34344a;padding:0 6px}
.ai-form{display:flex;gap:6px;padding:8px 10px;border-top:2px solid #34344a}
.ai-form textarea{resize:none}
@media(pointer:coarse){.ai-panel textarea,.ai-panel input{font-size:16px}}
`));

// ---- a small, safe Markdown renderer (DOM nodes only, no innerHTML)
function inline(t, parent) {
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  let last = 0, m;
  while ((m = re.exec(t))) {
    if (m.index > last) parent.append(t.slice(last, m.index));
    const s = m[0];
    if (s[0] === '`') parent.append(el('code', s.slice(1, -1)));
    else if (s.startsWith('**')) parent.append(el('strong', s.slice(2, -2)));
    else if (s[0] === '*') parent.append(el('em', s.slice(1, -1)));
    else { const mm = /^\[([^\]]+)\]\((.+)\)$/.exec(s); const a = el('a', mm[1]); a.href = mm[2]; a.target = '_blank'; a.rel = 'noopener noreferrer'; parent.append(a); }
    last = m.index + s.length;
  }
  if (last < t.length) parent.append(t.slice(last));
}
const isBlockStart = (l) => /^```/.test(l) || /^#{1,3}\s/.test(l) || /^\s*([-*]|\d+[.)])\s+/.test(l) || /^>\s?/.test(l) || /^\s*\|.*\|\s*$/.test(l);
function md(text) {
  const root = document.createDocumentFragment();
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const cells = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (/^```/.test(l)) {
      const buf = []; i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++; const pre = el('pre'); pre.append(el('code', buf.join('\n'))); root.append(pre); continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(l);
    if (h) { const n = el('h' + h[1].length); inline(h[2], n); root.append(n); i++; continue; }
    if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const wrap = el('div', null, 'ai-tablewrap'), tbl = el('table'), head = el('tr');
      cells(l).forEach((c) => { const th = el('th'); inline(c, th); head.append(th); }); tbl.append(head); i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { const tr = el('tr'); cells(lines[i]).forEach((c) => { const td = el('td'); inline(c, td); tr.append(td); }); tbl.append(tr); i++; }
      wrap.append(tbl); root.append(wrap); continue;
    }
    if (/^\s*([-*]|\d+[.)])\s+/.test(l)) {
      const list = el(/^\s*\d/.test(l) ? 'ol' : 'ul');
      while (i < lines.length && /^\s*([-*]|\d+[.)])\s+/.test(lines[i])) { const li = el('li'); inline(lines[i].replace(/^\s*([-*]|\d+[.)])\s+/, ''), li); list.append(li); i++; }
      root.append(list); continue;
    }
    if (/^>\s?/.test(l)) {
      const q = el('blockquote'), buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      inline(buf.join(' '), q); root.append(q); continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !(buf.length && isBlockStart(lines[i]))) buf.push(lines[i++]);
    const p = el('p'); inline(buf.join(' '), p); root.append(p);
  }
  return root;
}

// ---- panel
const btn = el('button', 'Ask AI', 'ai-fab'); btn.type = 'button';
const panel = el('section', null, 'ai-panel'); panel.hidden = true; panel.setAttribute('aria-label', 'AI assistant');
const head = el('div', null, 'ai-head'), tools = el('div'), clear = el('button', 'Clear'), close = el('button', 'Close');
clear.type = 'button'; close.type = 'button'; tools.append(clear, close); head.append(el('strong', 'AI assistant'), tools);
const keyBox = el('details', null, 'ai-key'), ksum = el('summary', 'Use my own Groq key (optional)'), krow = el('div'), ki = el('input'), kb = el('button', 'Save');
ki.type = 'password'; ki.autocomplete = 'off'; ki.placeholder = key ? 'Key saved for this tab' : 'gsk_...'; ki.setAttribute('aria-label', 'Groq API key'); kb.type = 'button';
krow.append(ki, kb); keyBox.append(ksum, krow);
const log = el('div', null, 'ai-log'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
const form = el('form', null, 'ai-form'), ta = el('textarea'), send = el('button', 'Send');
ta.rows = 2; ta.maxLength = 4000; ta.placeholder = 'Ask anything: questions, writing, code, planning...'; ta.setAttribute('aria-label', 'Your message'); send.type = 'submit';
form.append(ta, send); panel.append(head, keyBox, log, form); document.body.append(btn, panel);
const welcome = () => { const d = el('div', null, 'ai-msg ai-bot'); d.append(md('Ask me anything: questions, writing, code, planning, maths or translation. I can also explain how this office works.')); log.append(d); };
welcome();

function render(d) {
  const box = el('div', null, 'ai-msg ai-bot');
  box.append(md(d.text || '(no answer)'));
  const meta = el('div', null, 'ai-meta');
  (d.steps || []).forEach((s) => meta.append(el('span', 'skill: ' + s)));
  (d.sources || []).forEach((s) => { if (String(s.url).startsWith('https://')) { const a = el('a', s.title); a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; meta.append(a); } });
  meta.append(el('span', d.provider === 'claude' ? 'Claude' : d.provider === 'groq' ? 'Groq' : 'basic search'));
  box.append(meta); return box;
}

const cut = (s, n) => { if (s.length <= n) return s; const t = s.slice(0, n), k = Math.max(t.lastIndexOf('. '), t.lastIndexOf('! '), t.lastIndexOf('? ')); return k > n * 0.5 ? t.slice(0, k + 1) : t.replace(/\s+\S*$/, '') + '...'; };
async function basic(q) {
  const stop = new Set('a an and are as at be by can do for from how i in is it me my of on or please the to we what when where which who why with you your about near'.split(' '));
  const parts = q.replace(/[?!;]/g, '.').split('.').map((s) => s.trim()).filter((s) => s.length > 3).slice(0, 3);
  const subs = (parts.length ? parts : [q]).map((s) => s.toLowerCase().split(' ').filter((w) => w.length > 2 && !stop.has(w)).slice(0, 6).join(' ')).filter(Boolean);
  const items = [], seen = new Set();
  await Promise.all(subs.map(async (s) => {
    try {
      const r = await fetch('https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrlimit=2&prop=extracts|info&exintro=1&explaintext=1&exchars=700&exlimit=2&inprop=url&format=json&origin=*&gsrsearch=' + encodeURIComponent(s));
      const j = await r.json();
      Object.values((j.query && j.query.pages) || {}).forEach((p) => { if (!seen.has(p.title)) { seen.add(p.title); items.push({ title: p.title, text: cut(p.extract || '', 600), url: p.fullurl }); } });
    } catch { /* offline or blocked */ }
  }));
  const text = items.length
    ? 'No AI model is connected to this site yet, so this is a basic search. Here is what Wikipedia says:\n\n' + items.map((i) => '**' + i.title + '**\n\n' + i.text + (String(i.url).startsWith('https://') ? ' ([source](' + i.url + '))' : '')).join('\n\n')
    : 'I could not find anything for that, and no AI model is connected to this site yet. Try rewording the question.';
  return { text, steps: [], sources: [], provider: 'basic' };
}

function setBusy(b) { busy = b; send.textContent = b ? 'Stop' : 'Send'; send.type = b ? 'button' : 'submit'; }
async function ask(q) {
  q = String(q).trim(); if (!q || busy) return;
  log.append(el('div', q, 'ai-msg ai-user')); msgs.push({ role: 'user', content: q });
  const wait = el('div', 'Thinking...', 'ai-msg ai-bot'); log.append(wait);
  ta.value = ''; setBusy(true); log.scrollTop = log.scrollHeight;
  ctl = new AbortController();
  let d = null, note = '';
  try {
    const r = await fetch('/api/ask', { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, key ? { 'x-groq-key': key } : {}), body: JSON.stringify({ messages: msgs.slice(-20) }), signal: ctl.signal });
    if (r.ok) d = await r.json();
    else if (r.status === 429) note = 'Too many questions in a minute. Please wait a little and try again.';
    else if (r.status !== 503) { const j = await r.json().catch(() => ({})); note = 'The assistant had a problem' + (j.error ? ': ' + j.error : '') + '.'; }
  } catch (e) {
    if (e && e.name === 'AbortError') { wait.replaceWith(el('div', 'Stopped.', 'ai-msg ai-bot')); msgs.pop(); setBusy(false); return; }
  }
  if (!d && !note) d = await basic(q);            // no key on the server, or offline: fall back to Wikipedia
  if (d) { wait.replaceWith(render(d)); msgs.push({ role: 'assistant', content: d.text || '' }); }
  else { wait.replaceWith(el('div', note, 'ai-msg ai-err')); msgs.pop(); }
  setBusy(false); log.scrollTop = log.scrollHeight;
}
form.onsubmit = (e) => { e.preventDefault(); ask(ta.value); };
send.onclick = () => { if (busy && ctl) ctl.abort(); };
ta.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(ta.value); } };
kb.onclick = () => { key = ki.value.trim(); try { sessionStorage.setItem('po-ai-key', key); } catch { /* ignore */ } ki.value = ''; ki.placeholder = key ? 'Key saved for this tab' : 'gsk_...'; };
clear.onclick = () => { if (ctl) ctl.abort(); msgs.length = 0; log.replaceChildren(); welcome(); };
btn.onclick = () => { panel.hidden = !panel.hidden; if (!panel.hidden) ta.focus(); };
close.onclick = () => { panel.hidden = true; btn.focus(); };
