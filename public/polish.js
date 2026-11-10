// Polish layer: title screen, chiptune blips, CRT toggle, live clock, shortcuts
(() => {
  const $ = (s) => document.querySelector(s);
  const stage = $('.stage'), bar = $('.office-toolbar'), ov = $('#welcome-overlay');
  if (!stage || !bar) return;
  let ac, on = localStorage.getItem('po-sound') !== '0';
  const beep = (f = 660, d = .07, type = 'square') => {
    if (!on) return;
    try {
      ac ||= new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), v = ac.createGain();
      o.type = type; o.frequency.value = f; v.gain.value = .04;
      v.gain.exponentialRampToValueAtTime(.001, ac.currentTime + d);
      o.connect(v); v.connect(ac.destination); o.start(); o.stop(ac.currentTime + d);
    } catch {}
  };
  const mk = (id, label, fn) => {
    const b = document.createElement('button');
    b.type = 'button'; b.id = id; b.textContent = label; b.onclick = () => { fn(b); beep(880, .05); };
    bar.appendChild(b); return b;
  };
  const snd = mk('toggle-sound', on ? 'Sound on' : 'Sound off', (b) => {
    on = !on; localStorage.setItem('po-sound', on ? '1' : '0'); b.textContent = on ? 'Sound on' : 'Sound off';
  });
  snd.setAttribute('aria-pressed', on);
  mk('toggle-crt', 'CRT', (b) => b.setAttribute('aria-pressed', stage.classList.toggle('crt')));
  // title screen: dismiss on click or any key
  if (ov) {
    const box = ov.querySelector('.welcome-box');
    const go = document.createElement('button');
    go.className = 'start-btn'; go.type = 'button'; go.textContent = '▶ ENTER OFFICE';
    box && box.appendChild(go);
    const enter = () => { ov.classList.add('gone'); [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, .12), i * 90)); setTimeout(() => ov.remove(), 600); removeEventListener('keydown', enter); };
    go.onclick = enter; addEventListener('keydown', enter);
  }
  // click blips on every button
  document.addEventListener('click', (e) => { if (e.target.closest('.agent-row,#send-chat')) beep(520, .05); });
  // live clock + status in HUD
  const hud = $('.hud');
  if (hud) {
    const clock = document.createElement('span');
    const tick = () => { clock.innerHTML = '<b>●</b> live demo · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
    tick(); setInterval(tick, 30000);
    hud.insertBefore(clock, hud.children[1]);
  }
  // shortcuts: "/" search, Esc closes panel
  addEventListener('keydown', (e) => {
    if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); $('#office-search')?.focus(); }
    if (e.key === 'Escape') $('#close-panel')?.click();
  });
})();
