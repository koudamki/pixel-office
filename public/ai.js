const el = (t, x, c) => { const n = document.createElement(t); if (x != null) n.textContent = String(x); if (c) n.className = c; return n; };
let key = '';
try { key = sessionStorage.getItem('po-ai-key') || ''; } catch {}
const hist = [];

document.head.append(el('style', `.ai-fab{position:fixed;right:12px;bottom:64px;font:inherit;color:#ece8f4;background:#16161e;border:2px solid #2b2b3a;padding:6px 12px;cursor:pointer;z-index:50}
.ai-panel{position:fixed;right:12px;bottom:108px;z-index:50;width:min(440px,calc(100vw - 32px));height:min(620px,calc(100dvh - 150px));display:flex;flex-direction:column;background:var(--panel,#16161e);border:2px solid var(--line,#2b2b3a)}
.ai-panel[hidden]{display:none}
.ai-head,.ai-key,.ai-form{display:flex;gap:6px;padding:8px}
.ai-head{justify-content:space-between;align-items:center;border-bottom:2px solid var(--line,#2b2b3a)}
.ai-key input,.ai-form textarea{flex:1;min-width:0;font:inherit;color:var(--text,#ece8f4);background:var(--ink,#0d0d12);border:2px solid var(--line,#2b2b3a);padding:4px 8px}
.ai-form textarea{resize:none}
.ai-note{margin:0;padding:0 8px 6px;color:var(--dim,#9aa3bd);font-size:12px}
.ai-log{flex:1;overflow:auto;display:grid;gap:8px;align-content:start;padding:8px;font-size:14px;line-height:1.4}
.ai-msg{padding:6px 8px;border:2px solid var(--line,#2b2b3a);overflow-wrap:anywhere}
.ai-msg p{margin:4px 0}
.ai-user{justify-self:end;max-width:85%;border-color:var(--mint,#7fe0b5)}
.ai-err{color:var(--coral,#ff7a6b)}
.ai-chips{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
.ai-chips span,.ai-chips button{font-size:12px;padding:0 6px;border:2px solid var(--line,#2b2b3a)}
.ai-table{overflow-x:auto;margin:4px 0}
.ai-table table{border-collapse:collapse;width:100%;font-size:13px}
.ai-table th,.ai-table td{border:2px solid var(--line,#2b2b3a);padding:3px 6px;text-align:left;vertical-align:top}
.ai-table th{color:var(--mint,#7fe0b5)}
.ai-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px;margin:4px 0}
.ai-card{border:2px solid var(--line,#2b2b3a);padding:6px}
.ai-card p{margin:2px 0 0}`));
const btn = el('button', 'Ask AI', 'ai-fab'); btn.type = 'button';
const panel = el('section', null, 'ai-panel'); panel.hidden = true; panel.setAttribute('aria-label', 'AI assistant');
const head = el('div', null, 'ai-head'), close = el('button', 'Close'); close.type = 'button'; head.append(el('strong', 'AI assistant'), close);
const keyRow = el('div', null, 'ai-key'), ki = el('input'), kb = el('button', 'Save key');
ki.type = 'password'; ki.autocomplete = 'off'; ki.placeholder = key ? 'Key saved for this tab' : 'Optional: your own Groq key (gsk_...)'; ki.setAttribute('aria-label', 'Groq API key'); kb.type = 'button'; keyRow.append(ki, kb);
const note = el('p', 'No key needed. Add your own free Groq key at console.groq.com for AI answers; it stays in this tab.', 'ai-note');
const log = el('div', null, 'ai-log'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
log.append(el('div', 'Ask anything. Long or messy questions and typos are fine. I split the question into several searches, run them together, and answer in your language with tables where they help.', 'ai-msg'));
const form = el('form', null, 'ai-form'), ta = el('textarea'), go = el('button', 'Ask');
ta.rows = 3; ta.maxLength = 2000; ta.placeholder = 'e.g. plan 7 days in Japan, avoid crowds, stay near transit'; ta.setAttribute('aria-label', 'Your question');
form.append(ta, go); panel.append(head, keyRow, note, log, form); document.body.append(btn, panel);

function render(d) {
  const box = el('div', null, 'ai-msg');
  if (d.constraints && d.constraints.length) { const c = el('div', null, 'ai-chips'); d.constraints.forEach((t) => c.append(el('span', t))); box.append(el('small', 'Your rules:'), c); }
  box.append(el('small', (d.basic ? 'Basic search (no AI model on this site yet), Wikipedia results for: ' : d.web ? 'Searched the web: ' : 'Answered from model knowledge, double-check facts: ') + d.searches.join(' | ')));
  for (const b of d.blocks || []) {
    if (b.type === 'table' && Array.isArray(b.columns)) {
      if (b.title) box.append(el('b', b.title));
      const w = el('div', null, 'ai-table'), t = el('table'), h = el('tr');
      b.columns.forEach((c) => h.append(el('th', c))); t.append(h);
      (b.rows || []).forEach((r) => { const tr = el('tr'); (Array.isArray(r) ? r : [r]).forEach((c) => tr.append(el('td', c))); t.append(tr); });
      w.append(t); box.append(w);
    } else if (b.type === 'cards') {
      const g = el('div', null, 'ai-cards');
      (b.items || []).forEach((i) => { const c = el('div', null, 'ai-card'); c.append(el('b', i.title), el('p', i.text)); g.append(c); }); box.append(g);
    } else String(b.text || '').split(String.fromCharCode(10)).filter(Boolean).forEach((p) => box.append(el('p', p)));
  }
  if (d.followups && d.followups.length) { const f = el('div', null, 'ai-chips'); d.followups.slice(0, 3).forEach((t) => { const b = el('button', t); b.type = 'button'; b.onclick = () => ask(t); f.append(b); }); box.append(f); }
  if (d.sources && d.sources.length) { const s = el('div', null, 'ai-chips'); d.sources.forEach((x) => { if (String(x.url).startsWith('https://')) { const a = el('a', x.title); a.href = x.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; s.append(a); } }); box.append(el('small', 'Sources:'), s); }
  return box;
}

async function basic(q) {
  const stop = new Set('a an and are as at be by can do for from how i in is it me my of on or please the to we what when where which who why with you your about near'.split(' '));
  const parts = q.replace(/[?!;]/g, '.').split('.').map((s) => s.trim()).filter((s) => s.length > 3).slice(0, 3);
  const subs = (parts.length ? parts : [q]).map((s) => s.toLowerCase().split(' ').filter((w) => w.length > 2 && !stop.has(w)).slice(0, 6).join(' ')).filter(Boolean);
  const items = [], sources = [], seen = new Set();
  await Promise.all(subs.map(async (s) => {
    try {
      const r = await fetch('https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrlimit=2&prop=extracts|info&exintro=1&explaintext=1&exchars=400&exlimit=2&inprop=url&format=json&origin=*&gsrsearch=' + encodeURIComponent(s));
      const j = await r.json();
      Object.values((j.query && j.query.pages) || {}).forEach((p) => { if (seen.has(p.title)) return; seen.add(p.title); items.push({ title: p.title, text: (p.extract || '').slice(0, 400) }); sources.push({ title: p.title, url: p.fullurl }); });
    } catch {}
  }));
  return { blocks: [{ type: 'text', text: items.length ? 'Here is what I found:' : 'I could not find anything for that. Try rewording it, or add your own Groq key for full AI answers.' }, { type: 'cards', items }], searches: subs.length ? subs : [q], basic: true, sources };
}

async function ask(q) {
  q = String(q).trim(); if (!q) return;
  log.append(el('div', q, 'ai-msg ai-user'));
  const wait = el('div', 'Working on it...', 'ai-msg'); log.append(wait);
  ta.value = ''; go.disabled = true;
  let d = null;
  try {
    const r = await fetch('/api/ask', { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, key ? { 'x-groq-key': key } : {}), body: JSON.stringify({ message: q, history: hist.slice(-3) }) });
    if (r.ok) d = await r.json();
  } catch {}
  try { if (!d) d = await basic(q); wait.replaceWith(render(d)); hist.push(q.slice(0, 120)); }
  catch (e) { wait.replaceWith(el('div', 'Sorry, something went wrong: ' + e.message, 'ai-msg ai-err')); }
  go.disabled = false; log.scrollTop = log.scrollHeight;
}
kb.onclick = () => { key = ki.value.trim(); try { sessionStorage.setItem('po-ai-key', key); } catch {} ki.value = ''; ki.placeholder = key ? 'Key saved for this tab' : 'Groq API key (gsk_...)'; };
form.onsubmit = (e) => { e.preventDefault(); ask(ta.value); };
ta.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(ta.value); } };
btn.onclick = () => { panel.hidden = !panel.hidden; if (!panel.hidden) ta.focus(); };
close.onclick = () => { panel.hidden = true; btn.focus(); };
