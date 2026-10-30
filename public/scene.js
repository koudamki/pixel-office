(() => {
  const stage = document.querySelector('.stage') || document.getElementById('office-stage');
  if (!stage) return;

  const O = window.__office || {
    DESKS: ['desk-1', 'desk-2', 'desk-3', 'desk-4', 'desk-5', 'desk-6'],
    agents: new Map(),
    feed: (...args) => console.debug('[office]', ...args),
    addAgent: (id, name) => {
      if (!O.agents.has(id)) {
        O.agents.set(id, { id, name, x: 35, y: 60, state: 'work', bubble: '', bubbleUntil: 0 });
      }
    },
  };

  const root = window;
  root.__office = O;

  const CDN = 'https://cdn.jsdelivr.net/gh/W17ant/Claude-Office@1a9ba71251326b34c3caa90d49468e75420d0dd4/public/';
  const BASES = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ? ['assets/', CDN] : [CDN, 'assets/'];
  const S = 1.5, W = 1200, H = 900, PX = W / 100, PY = H / 100;

  const loadImg = (p) => new Promise((res) => {
    let tries = 0;
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => {
      if (++tries < BASES.length) {
        im.src = BASES[tries] + p;
      } else {
        res(null);
      }
    };
    im.src = BASES[0] + p;
  });

  const SP = 'sprites/';
  const ART = {
    room: ['rooms/office-day.png'],
    night: ['rooms/office-night.png'],
    dlf: [SP + 'furniture/standing-desk-left-front.png', 84, 106],
    dlr: [SP + 'furniture/standing-desk-left-rear.png', 84, 102],
    drf: [SP + 'furniture/standing-desk-right-front.png', 84, 106],
    drr: [SP + 'furniture/standing-desk-right-rear.png', 84, 102],
    filC: [SP + 'furniture/filling-closed.png', 42, 56],
    filO: [SP + 'furniture/filling-open.png', 46, 60],
    cofOff: [SP + 'appliances/coffee-off.png', 40, 51],
    cofOn: [SP + 'appliances/coffee-on.png', 40, 51],
    snake: [SP + 'decoration/snake-plant.png', 40, 63],
    monstera: [SP + 'decoration/monstera-plant.png', 50, 71],
    money: [SP + 'decoration/money-tree.png', 42, 63],
    prOk: [SP + 'decoration/printer-working.png', 55, 69],
    prBad: [SP + 'decoration/printer-broken.png', 55, 69],
    typing: [SP + 'effects/typing.png', 24, 24],
    sleeping: [SP + 'effects/sleeping.png', 24, 24],
    star: [SP + 'effects/star.png', 24, 24],
    rocket: [SP + 'effects/rocket.png', 24, 24],
    'thumb-up': [SP + 'effects/thumb-up.png', 24, 24],
    'watering-can': [SP + 'effects/watering-can.png', 24, 24],
    'glass-water': [SP + 'effects/glass-water.png', 24, 24],
    'need-coffee': [SP + 'effects/need-coffee.png', 24, 24],
    fire: [SP + 'effects/fire.png', 24, 24],
    party: [SP + 'effects/party.png', 24, 24],
    pizza: [SP + 'effects/pizza.png', 24, 24],
  };

  const img = {};
  const FURN = [
    ['dlr', 42.4, 50.4], ['dlf', 46.7, 53], ['drf', 39.9, 55.2], ['dlr', 31.4, 64.8],
    ['dlf', 35.4, 67.5], ['drf', 27.9, 70], ['dlr', 59, 73.7], ['dlf', 62.6, 76],
    ['drf', 55.4, 78.7], ['drr', 66.6, 71.1], ['filC', 45, 56.5, 'filing'], ['snake', 43.2, 37.9, 'plant2'],
    ['monstera', 91.9, 64.7, 'plant1'], ['money', 32, 71.2, 'plant3'], ['money', 89.2, 65.7, 'plant4'],
    ['monstera', 60.2, 80.4, 'plant5'], ['prOk', 85.4, 56.8, 'printer'], ['cofOff', 78.5, 50.2, 'coffee']
  ];

  const HOT = [
    ['coffee', 'Coffee machine', 78.5, 46, 6, 9], ['filing', 'Filing cabinet', 45, 52, 6, 9],
    ['printer', 'Printer', 85.4, 52, 7, 10], ['plant1', 'Plant', 91.9, 60, 6, 10], ['plant2', 'Plant', 43.2, 33, 5, 9],
    ['plant3', 'Plant', 32, 66, 5, 9], ['plant4', 'Plant', 89.2, 61, 5, 9], ['plant5', 'Plant', 60.2, 75, 6, 10],
    ['cooler', 'Water cooler', 53, 43, 6, 10], ['bell', 'Bell', 63, 37, 4, 8], ['kanban', 'Kanban board', 80, 40, 9, 13],
    ['tv', 'Dashboard', 90, 42, 7, 10], ['poster', 'Ship It poster', 8, 45, 6, 14], ['ext', 'Fire extinguisher', 8, 60, 4, 9],
    ['window', 'Windows: day and night', 24, 33, 26, 34], ['door', 'Door', 69, 35, 6, 16]
  ];

  const N = {
    door: [67.5, 48.9, 'front-right'], door2: [64, 46.6], door3: [69.9, 50.8],
    water1: [53.3, 46.6, 'rear-left'], water2: [56, 47.7, 'front-right'], filing: [47.8, 57.6, 'front-right'],
    coffee1: [73.5, 56.7, 'rear-left'], coffee2: [76.2, 58.4, 'front-right'], printer: [81, 63, 'rear-left'],
    spot1: [25.8, 71, 'rear-left', 85], spot2: [37.9, 68.2, 'rear-right', 85], spot3: [26.9, 59.2, 'front-left', 40],
    spot4: [38.5, 55.2, 'rear-left', 58], spot5: [48.9, 52.9, 'rear-right', 70], spot6: [38.8, 43.6, 'front-left', 30],
    spot7: [52.7, 78.8, 'rear-left', 95], spot8: [65.9, 75.8, 'rear-right', 95], spot9: [55.2, 66.8, 'front-left', 55],
    spot10: [68.7, 66.2, 'front-right', 55]
  };

  const G = {};
  const edges = 'door-door2 door-door3 door2-water1 door3-coffee1 door3-spot10 water1-water2 water1-spot5 spot6-spot4 spot6-water1 spot4-spot5 spot4-spot3 spot4-filing spot5-filing spot5-spot9 filing-spot9 spot3-spot1 spot1-spot2 spot2-spot4 spot2-spot7 spot9-spot7 spot9-spot10 spot10-spot8 spot10-coffee1 spot7-spot8 coffee1-coffee2 coffee2-printer'.split(' ');
  for (const e of edges) {
    const [a, b] = e.split('-');
    (G[a] ||= []).push(b);
    (G[b] ||= []).push(a);
  }

  const dist = (a, b) => Math.hypot((a[0] - b[0]) * 8, (a[1] - b[1]) * 6);
  const nearest = (x, y) => Object.keys(N).reduce((m, k) => (dist([x, y], N[k]) < dist([x, y], N[m]) ? k : m));

  function route(from, to) {
    const d = { [from]: 0 }, prev = {}, todo = new Set(Object.keys(N));
    while (todo.size) {
      let u = null;
      for (const k of todo) if (d[k] !== undefined && (u === null || d[k] < d[u])) u = k;
      if (u === null || u === to) break;
      todo.delete(u);
      for (const v of G[u] || []) {
        const nd = d[u] + dist(N[u], N[v]);
        if (d[v] === undefined || nd < d[v]) {
          d[v] = nd;
          prev[v] = u;
        }
      }
    }
    const p = [to];
    while (prev[p[0]]) p.unshift(prev[p[0]]);
    return p;
  }

  const SET = { Atlas: 'Me-1', Nova: 'dev-1', Sage: 'explore-1', Pixel: 'Frontend-dev-1', Echo: 'employee-1', Bolt: 'security-audit-1', Iris: 'employee-2', Juno: 'dev-2', Claude: 'Claude-1' };
  const FACES = ['front-left', 'front-right', 'rear-left', 'rear-right'];
  const MIRROR = { 'front-left': 'front-right', 'front-right': 'front-left', 'rear-left': 'rear-right', 'rear-right': 'rear-left' };
  const chars = {};

  function sprite(set, face) {
    const k = set + face;
    if (!(k in chars)) {
      chars[k] = null;
      loadImg('sprites/characters/' + set + '-' + face + '.png').then((im) => { chars[k] = im || false; });
    }
    if (chars[k]) return [chars[k], false];
    const m = set + MIRROR[face];
    if (chars[m]) return [chars[m], true];
    if (!(m in chars)) {
      chars[m] = null;
      loadImg('sprites/characters/' + set + '-' + MIRROR[face] + '.png').then((im) => { chars[m] = im || false; });
    }
    return [null, false];
  }

  const cv = document.createElement('canvas');
  cv.id = 'scene';
  cv.width = W;
  cv.height = H;
  cv.setAttribute('aria-label', 'Illustrated office scene');
  stage.appendChild(cv);

  const g = cv.getContext('2d');
  const V = new Map();
  const floats = [];
  const pops = [];
  const state = { cof: 0, fil: 0, jam: false, alert: false, hover: null, mx: 0, my: 0 };

  const dark = () => {
    const d = new Date();
    const h = d.getHours() + d.getMinutes() / 60;
    const day = h >= 6 && h <= 18 ? Math.sin(Math.PI * (h - 6) / 12) : 0;
    return 1 - Math.min(1, day * 1.6);
  };

  function ensureAgent(id, name) {
    if (!O.agents.has(id)) {
      O.agents.set(id, { id, name, x: N.door[0], y: N.door[1], state: 'work', bubble: '', bubbleUntil: 0, desk: 'desk-1' });
    }
    const a = O.agents.get(id);
    a.name ||= name;
    if (!a.desk) a.desk = 'desk-1';
    return a;
  }

  if (O.agents.size === 0) {
    ['Atlas', 'Nova', 'Sage'].forEach((name, idx) => ensureAgent(`char-${name}`, name));
  }

  function want(a) {
    if (a.state === 'leave') return 'door';
    if (a.state === 'goBreak' || a.state === 'break') return a.bubble === 'coffee' ? 'coffee1' : a.bubble === 'water' ? 'water1' : 'water2';
    return 'spot' + (O.DESKS.indexOf(a.desk) + 1 || 1);
  }

  function step(dt) {
    for (const [id, v] of V) if (!O.agents.has(id)) V.delete(id);
    for (const a of O.agents.values()) {
      let v = V.get(a.id);
      if (!v) {
        v = { x: N.door[0], y: N.door[1], path: [], target: null, face: 'front-right', moving: false }; 
        V.set(a.id, v);
      }
      const t = want(a);
      if (v.target !== t) {
        v.target = t;
        v.path = route(nearest(v.x, v.y), t);
      }
      const nx = v.path[0];
      if (nx) {
        const [px, py] = N[nx];
        const dx = (px - v.x) * 8;
        const dy = (py - v.y) * 6;
        const d = Math.hypot(dx, dy);
        if (d < 1) {
          v.x = px;
          v.y = py;
          v.path.shift();
        } else {
          const s = Math.min(d, 75 * dt) / d;
          v.x += dx * s / 8;
          v.y += dy * s / 6;
          v.face = (dy > 0 ? 'front' : 'rear') + (dx > 0 ? '-right' : '-left');
        }
        v.moving = true;
      } else {
        v.moving = false;
        const n = N[v.target];
        if (n && n[2]) v.face = n[2];
      }
    }
  }

  function hit(x, y) {
    for (const a of [...O.agents.values()].reverse()) {
      const v = V.get(a.id);
      if (v && Math.abs(x - v.x) < 3 && y < v.y + 1 && y > v.y - 15) return { agent: a, v };
    }
    for (const h of HOT) {
      if (Math.abs(x - h[2]) < h[4] / 2 && Math.abs(y - h[3]) < h[5] / 2) return { hot: h };
    }
    return null;
  }

  const say = (text, x, y) => floats.push({ text, x, y, t: performance.now() });
  const pop = (name, x, y) => pops.push({ name, x, y, t: performance.now() });

  function bubble(text, x, y, ctx = g) {
    ctx.font = '600 20px sans-serif';
    ctx.textBaseline = 'middle';
    const w = ctx.measureText(text).width + 18;
    const bx = Math.max(4, Math.min(W - w - 4, x - w / 2));
    ctx.fillStyle = '#fffdf6';
    ctx.strokeStyle = '#1b2030';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, y - 15, w, 30, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1b2030';
    ctx.fillText(text, bx + 9, y);
  }

  function draw(now, t) {
    g.clearRect(0, 0, W, H);
    g.drawImage(img.room, 0, 0, W, H);
    const dk = dark();
    if (dk > 0.01 && img.night) {
      g.globalAlpha = Math.min(1, dk);
      g.drawImage(img.night, 0, 0, W, H);
      g.globalAlpha = 1;
    }

    const list = [];
    for (const [k, x, y, id] of FURN) {
      let key = k;
      if (id === 'coffee' && state.cof > 0) key = 'cofOn';
      if (id === 'filing' && state.fil > 0) key = 'filO';
      if (id === 'printer' && state.jam) key = 'prBad';
      const im = img[key];
      const sz = ART[key];
      if (!im || !sz) continue;
      const sway = id && state['b' + id] ? Math.sin(t * 14) * 3 : 0;
      list.push([y, () => g.drawImage(im, x * PX - sz[1] * S / 2 + sway, y * PY - sz[2] * S, sz[1] * S, sz[2] * S)]);
    }

    for (const a of O.agents.values()) {
      const v = V.get(a.id);
      if (!v) continue;
      const set = SET[a.name] || 'employee-3';
      const [im, flip] = sprite(set, v.face);
      const n = N[v.target];
      const z = !v.moving && n && n[3] ? n[3] : v.y;
      const hh = (a.name === 'Atlas' ? 85 : 78) * S;
      const bob = v.moving ? Math.abs(Math.sin(t * 12)) * 4 : 0;
      list.push([z, () => {
        const fx = v.x * PX;
        const fy = v.y * PY - bob;
        g.fillStyle = 'rgba(0,0,0,.25)';
        g.beginPath();
        g.ellipse(fx, v.y * PY, 20, 7, 0, 0, 7);
        g.fill();

        if (im) {
          const ww = hh * im.width / im.height;
          if (flip) {
            g.save();
            g.translate(fx, 0);
            g.scale(-1, 1);
            g.drawImage(im, -ww / 2, fy - hh, ww, hh);
            g.restore();
          } else {
            g.drawImage(im, fx - ww / 2, fy - hh, ww, hh);
          }
        } else {
          g.fillStyle = '#7fe0b5';
          g.fillRect(fx - 10, fy - 50, 20, 50);
        }

        const bubbleText = Date.now() < (a.bubbleUntil || 0) && a.bubble ? a.bubble : null;
        if (bubbleText) bubble(bubbleText, fx, fy - hh - 24);
      }]);
    }

    list.sort((p, q) => p[0] - q[0]).forEach((it) => it[1]());

    for (const p of pops.slice()) {
      const a = (now - p.t) / 1600;
      if (a > 1) {
        pops.splice(pops.indexOf(p), 1);
        continue;
      }
      if (img[p.name]) {
        g.globalAlpha = 1 - a;
        g.drawImage(img[p.name], p.x * PX - 20, p.y * PY - a * 40, 40, 40);
        g.globalAlpha = 1;
      }
    }

    for (const f of floats.slice()) {
      const a = (now - f.t) / 1800;
      if (a > 1) {
        floats.splice(floats.indexOf(f), 1);
        continue;
      }
      g.globalAlpha = 1 - a * a;
      bubble(f.text, f.x * PX, f.y * PY - a * 30);
      g.globalAlpha = 1;
    }

    const h = state.hover;
    if (h && h.hot) {
      const [, label, x, y, w, hh2] = h.hot;
      g.strokeStyle = '#7fe0b5';
      g.lineWidth = 3;
      g.beginPath();
      g.roundRect((x - w / 2) * PX, (y - hh2 / 2) * PY, w * PX, hh2 * PY, 10);
      g.stroke();
      bubble(label, state.mx * PX, state.my * PY - 28);
    } else if (h && h.agent) {
      bubble(h.agent.name, h.v.x * PX, h.v.y * PY - 150);
    }
  }

  function respond(hot) {
    const [id, label, x, y] = hot;
    const w = [...O.agents.values()].filter((a) => a.state !== 'leave');
    if (id === 'coffee') {
      state.cof = 6;
      say('Fresh coffee!', x, y - 8);
      pop('need-coffee', x, y - 12);
      O.feed?.(new Date(), 'Office', 'the coffee machine is brewing');
    } else if (id === 'cooler') {
      say('Stay hydrated', x, y - 8);
      pop('glass-water', x, y - 12);
      O.feed?.(new Date(), 'Office', 'someone is getting water');
    } else if (id === 'bell') {
      for (const a of w) {
        a.bubble = 'ding!';
        a.bubbleUntil = Date.now() + 2500;
      }
      say('DING!', x, y - 6);
      pop('star', x, y - 10);
      O.feed?.(new Date(), 'Office', 'the bell rang, everyone cheers');
    } else if (id === 'kanban') {
      say('Opening the board', x, y - 8);
    } else if (id === 'tv') {
      say(state.alert ? 'Server alert!' : 'All systems green', x, y - 8);
    } else if (id === 'poster') {
      say('Ship it!', x, y - 6);
      pop('rocket', x, y - 10);
    } else if (id === 'ext') {
      say('Safety first', x, y - 6); pop('fire', x, y - 4);
    } else if (id === 'printer') {
      if (state.jam) {
        state.jam = false;
        say('Fixed!', x, y - 8);
      } else {
        state.jam = Math.random() < 0.4;
        say(state.jam ? 'Paper jam!' : 'Page printed', x, y - 8);
      }
    } else if (id === 'filing') {
      state.fil = 3; say('Only paperwork', x, y - 8);
    } else if (id.startsWith('plant')) {
      say('Thanks, hydrated', x, y - 10);
      pop('watering-can', x, y - 14);
    } else if (id === 'window') {
      say(dark() > 0.5 ? 'Good morning' : 'Lights out', x, y);
    } else if (id === 'door') {
      const names = ['Atlas', 'Nova', 'Sage', 'Pixel', 'Echo'];
      const available = names.find((k) => ![...O.agents.keys()].some((idKey) => O.agents.get(idKey).name === k));
      if (available) {
        O.addAgent?.(`char-${available}`, available);
        say(`${available} walks in`, x, y - 4);
      }
    }
  }

  cv.addEventListener('pointerdown', (e) => {
    const r = cv.getBoundingClientRect();
    const x = (e.clientX - r.left) * 100 / r.width;
    const y = (e.clientY - r.top) * 100 / r.height;
    const h = hit(x, y);
    if (!h) return;
    if (h.agent) {
      const a = h.agent;
      a.bubble = ['Ready when you are.', 'What should we build?', 'Give me a task!'][Math.floor(Math.random() * 3)];
      a.bubbleUntil = Date.now() + 2500;
      pop('thumb-up', h.v.x, h.v.y - 17);
      say(a.name, h.v.x, h.v.y - 18);
    } else {
      respond(h.hot);
    }
  });

  cv.addEventListener('pointermove', (e) => {
    const r = cv.getBoundingClientRect();
    const x = (e.clientX - r.left) * 100 / r.width;
    const y = (e.clientY - r.top) * 100 / r.height;
    const h = hit(x, y);
    state.hover = h; state.mx = x; state.my = y;
    cv.style.cursor = h ? 'pointer' : 'default';
  });

  cv.addEventListener('pointerleave', () => { state.hover = null; });

  async function boot() {
    const keys = Object.entries(ART);
    const loads = keys.map(async ([k, value]) => {
      img[k] = await loadImg(value[0]);
    });
    await Promise.all(loads);

    if (!img.room) {
      console.warn('Office art could not be loaded; demo will keep running without it.');
      return;
    }

    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      for (const key of ['cof', 'fil']) state[key] = Math.max(0, state[key] - dt);
      for (const key in state) {
        if (key[0] === 'b' && state[key] > 0) state[key] = Math.max(0, state[key] - dt);
      }
      step(dt);
      draw(now, now / 1000);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  boot();
})();
