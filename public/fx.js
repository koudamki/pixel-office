(() => {
  const stage = document.querySelector('.stage') || document.getElementById('office-stage');
  if (!stage) return;

  const AGENT_NAMES = ['Atlas', 'Nova', 'Sage', 'Pixel', 'Echo', 'Bolt', 'Iris', 'Juno', 'Milo', 'Astra', 'Hux', 'Lena', 'Orion', 'Vera', 'Theo', 'Dahlia'];
  const AGENT_TEMPLATES = {
    Atlas: { desk: 'desk-1', role: 'Data Engineering Lead', task: 'reviewing pipeline priorities', tool: 'dbt + SQL + Perplexity', mode: 'lead' },
    Nova: { desk: 'desk-2', role: 'Pipeline Engineer', task: 'optimizing ETL flow', tool: 'Airflow + Python + Perplexity', mode: 'autonomous' },
    Sage: { desk: 'desk-3', role: 'Data Quality Analyst', task: 'checking freshness checks', tool: 'Great Expectations + SQL', mode: 'autonomous' },
    Pixel: { desk: 'desk-4', role: 'Analytics Engineer', task: 'curating semantic models', tool: 'dbt + Looker + Perplexity', mode: 'autonomous' },
    Echo: { desk: 'desk-5', role: 'ML Ops Analyst', task: 'monitoring model workflows', tool: 'MLflow + Kafka + Perplexity', mode: 'autonomous' },
    Bolt: { desk: 'desk-6', role: 'Security & Governance', task: 'reviewing access controls', tool: 'IAM + governance + Perplexity', mode: 'autonomous' },
    Iris: { desk: 'desk-7', role: 'Research Analyst', task: 'summarizing market signals', tool: 'Perplexity + notebooks', mode: 'autonomous' },
    Juno: { desk: 'desk-8', role: 'Ops & Alignment', task: 'coordinating delivery queues', tool: 'task tracking + dashboards', mode: 'sub-agent' },
    Milo: { desk: 'desk-9', role: 'Product Manager', task: 'prioritizing roadmap updates', tool: 'Jira + stakeholder notes', mode: 'lead' },
    Astra: { desk: 'desk-10', role: 'UX Researcher', task: 'reviewing user interviews', tool: 'Miro + feedback synthesis', mode: 'autonomous' },
    Hux: { desk: 'desk-11', role: 'Frontend Engineer', task: 'building UI improvements', tool: 'React + design systems', mode: 'autonomous' },
    Lena: { desk: 'desk-12', role: 'Customer Success', task: 'handling client requests', tool: 'CRM + support tools', mode: 'autonomous' },
    Orion: { desk: 'desk-13', role: 'Operations Analyst', task: 'tracking internal workflows', tool: 'Sheets + process mapping', mode: 'autonomous' },
    Vera: { desk: 'desk-14', role: 'Finance Partner', task: 'reviewing project spend', tool: 'budgets + forecasting', mode: 'autonomous' },
    Theo: { desk: 'desk-15', role: 'QA Specialist', task: 'testing release readiness', tool: 'automation + regression checks', mode: 'autonomous' },
    Dahlia: { desk: 'desk-16', role: 'People Ops', task: 'supporting team needs', tool: 'calendar + policy updates', mode: 'autonomous' },
  };

  const deskMap = {
    'desk-1': { x: 20, y: 64 },
    'desk-2': { x: 32, y: 64 },
    'desk-3': { x: 46, y: 64 },
    'desk-4': { x: 58, y: 64 },
    'desk-5': { x: 72, y: 64 },
    'desk-6': { x: 30, y: 80 },
    'desk-7': { x: 52, y: 82 },
    'desk-8': { x: 68, y: 82 },
    'desk-9': { x: 18, y: 88 },
    'desk-10': { x: 30, y: 90 },
    'desk-11': { x: 42, y: 90 },
    'desk-12': { x: 55, y: 90 },
    'desk-13': { x: 68, y: 90 },
    'desk-14': { x: 80, y: 88 },
    'desk-15': { x: 88, y: 80 },
    'desk-16': { x: 90, y: 68 },
  };

  const TASK_LIBRARY = {
    Atlas: ['reviewing pipeline priorities', 'designing warehouse improvements', 'triaging data issues', 'pairing on architecture', 'benchmarking system health', 'updating the roadmap'],
    Nova: ['optimizing ETL flow', 'fixing pipeline retries', 'debugging orchestration', 'refining data contracts', 'monitoring job health', 'improving automation'],
    Sage: ['checking freshness checks', 'validating data quality', 'auditing anomalies', 'reviewing rules', 'sanity-checking ingestion', 'cleaning pipeline drift'],
    Pixel: ['curating semantic models', 'refining metrics definitions', 'documenting BI logic', 'designing dashboards', 'reviewing dependencies', 'improving model clarity'],
    Echo: ['monitoring model workflows', 'checking feature drift', 'reviewing experiment data', 'tuning serving health', 'triaging alert noise', 'refining retraining loops'],
    Bolt: ['reviewing access controls', 'auditing lineage', 'checking compliance rules', 'refreshing security policy', 'validating IAM changes', 'tracking governance actions'],
    Iris: ['summarizing market signals', 'comparing source intel', 'researching competitive notes', 'mapping opportunity themes', 'building research brief', 'reviewing external inputs'],
    Juno: ['coordinating delivery queues', 'aligning QA updates', 'balancing dependencies', 'tracking cross-team tasks', 'resolving blockers', 'syncing sprint context'],
    Milo: ['prioritizing roadmap updates', 'aligning stakeholders', 'reviewing sprint scope', 'clearing blockers', 'planning delivery milestones', 'updating product notes'],
    Astra: ['reviewing user interviews', 'mapping customer pain points', 'synthesizing feedback', 'refining UX notes', 'testing flows', 'finding usability gaps'],
    Hux: ['building UI improvements', 'refining interface details', 'reviewing frontend changes', 'testing interactions', 'fixing layout issues', 'polishing user flows'],
    Lena: ['handling client requests', 'responding to tickets', 'updating customer notes', 'sharing project updates', 'arranging follow-ups', 'resolving support issues'],
    Orion: ['tracking internal workflows', 'mapping process gaps', 'updating operational notes', 'checking handoffs', 'optimizing work queues', 'reviewing process health'],
    Vera: ['reviewing project spend', 'checking forecast variance', 'tracking budgets', 'updating finance notes', 'monitoring cost drivers', 'balancing resource plans'],
    Theo: ['testing release readiness', 'running regression checks', 'checking edge cases', 'reviewing bug reports', 'verifying fixes', 'signing off quality gates'],
    Dahlia: ['supporting team needs', 'planning onboarding flow', 'reviewing policies', 'scheduling check-ins', 'keeping team aligned', 'organizing team wellbeing']
  };

  const ACTIVITY_BINS = {
    desk: ['deep focus work', 'reviewing task backlog', 'updating notes', 'checking current priorities', 'working through design details', 'refining the latest draft'],
    call: ['taking a quick call', 'joining a customer check-in', 'answering a stakeholder question', 'handling a support request', 'joining an update call', 'on a short collaboration call'],
    meeting: ['in a working session', 'in a team sync', 'in a project review', 'in a standup', 'in a planning huddle', 'in a cross-team meeting'],
    break: ['stepping away for coffee', 'stretching and resetting', 'taking a short break', 'getting water', 'walking to the pantry', 'quietly recharging'],
    idle: ['quietly triaging inbox', 'reviewing notes', 'organizing work items', 'checking the status board', 'waiting for feedback', 'drifting into a calm review']
  };

  const O = window.__office || {
    DESKS: Object.keys(deskMap),
    agents: new Map(),
    memory: { ledger: [], remember: (entry) => {} },
    feed: (...args) => console.debug('[office]', ...args),
    addAgent: (id, name) => {
      if (!O.agents.has(id)) {
        O.agents.set(id, { id, name, x: 35, y: 60, state: 'work', bubble: '', bubbleUntil: 0, desk: 'desk-1', task: 'analysis', mode: 'autonomous', memory: O.memory });
      }
    },
  };
  O.memory.remember = (entry) => {
    O.memory.ledger.push({ ...entry, at: Date.now() });
    if (O.memory.ledger.length > 250) O.memory.ledger.shift();
  };
  window.__office = O;

  const chatLogEl = document.getElementById('chat-log');
  const chatInputEl = document.getElementById('agent-chat-input');
  const sendBtn = document.getElementById('send-chat');

  function appendChat(text, strong = false) {
    if (!chatLogEl) return;
    const row = document.createElement('div');
    row.className = 'chat-entry';
    row.innerHTML = strong ? `<strong>${text}</strong>` : text;
    chatLogEl.appendChild(row);
    while (chatLogEl.children.length > 11) chatLogEl.removeChild(chatLogEl.firstChild);
    chatLogEl.scrollTop = chatLogEl.scrollHeight;
  }

  function parseAgentCommand(raw) {
    const text = String(raw || '').trim();
    if (!text) return null;
    const match = text.match(/^(atlas|nova|sage|pixel|echo|bolt|iris|juno|milo|astra|hux|lena|orion|vera|theo|dahlia)\s*[:,-]?\s*(.*)$/i);
    if (match) {
      const name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      return { name, instruction: (match[2] || '').trim() };
    }
    const fallback = text.match(/^(.*?)(?:\s+do\s+|\s+please\s+|\s*:\s*)(.+)$/i);
    if (fallback) {
      const candidate = fallback[1].trim();
      const known = AGENT_NAMES.find((n) => n.toLowerCase() === candidate.toLowerCase());
      if (known) return { name: known, instruction: (fallback[2] || '').trim() };
    }
    return null;
  }

  function applyCommand(commandText) {
    const parsed = parseAgentCommand(commandText);
    if (!parsed) {
      appendChat('Use format like: Atlas, start coffee break', true);
      return false;
    }
    const agent = [...O.agents.values()].find((a) => a.name.toLowerCase() === parsed.name.toLowerCase());
    if (!agent) {
      appendChat(`Agent ${parsed.name} is not available in this office.`, true);
      return false;
    }

    agent.pendingTask = parsed.instruction;
    agent.bubble = `${parsed.instruction}`;
    agent.bubbleUntil = Date.now() + 4000;
    agent.state = 'manual';
    O.memory.remember({ tag: 'command', actor: agent.name, detail: parsed.instruction });
    appendChat(`${agent.name}: ${parsed.instruction}`, true);
    return true;
  }

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
    spot10: [68.7, 66.2, 'front-right', 55],
    spot11: [21.5, 38.2, 'front-left', 55], spot12: [32.7, 38.9, 'front-right', 55], spot13: [45.4, 39.5, 'rear-left', 55],
    spot14: [60.8, 39.8, 'rear-right', 55], spot15: [76.1, 38.2, 'front-left', 55], spot16: [84.9, 38.8, 'front-right', 55]
  };

  const G = {};
  const edges = 'door-door2 door-door3 door2-water1 door3-coffee1 door3-spot10 water1-water2 water1-spot5 spot6-spot4 spot6-water1 spot4-spot5 spot4-spot3 spot4-filing spot5-filing spot5-spot9 spot7-spot8 spot8-spot10 spot9-spot10 spot11-spot12 spot12-spot13 spot13-spot14 spot14-spot15 spot15-spot16 spot16-door3 spot11-door2 spot16-printer door3-spot16'.split(' ');
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

  const SET = { Atlas: 'Me-1', Nova: 'dev-1', Sage: 'explore-1', Pixel: 'Frontend-dev-1', Echo: 'employee-1', Bolt: 'security-audit-1', Iris: 'employee-2', Juno: 'dev-2', Milo: 'employee-3', Astra: 'employee-4', Hux: 'Frontend-dev-2', Lena: 'employee-5', Orion: 'employee-6', Vera: 'employee-7', Theo: 'employee-8', Dahlia: 'employee-9', Claude: 'Claude-1' };
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

  function ensureAgent(id, name) {
    const template = AGENT_TEMPLATES[name] || { desk: 'desk-1', role: 'Engineer', task: 'analysis', tool: 'local workflow', mode: 'autonomous' };
    if (!O.agents.has(id)) {
      O.agents.set(id, {
        id,
        name,
        x: N.door[0],
        y: N.door[1],
        state: 'work',
        bubble: '',
        bubbleUntil: 0,
        desk: template.desk,
        role: template.role,
        task: template.task,
        tool: template.tool,
        mode: template.mode,
        memory: O.memory,
        lastTask: '',
        routine: null,
        pendingTask: '',
        seed: Math.floor(Math.random() * 1000),
      });
    }

    const a = O.agents.get(id);
    a.name ||= name;
    a.role ||= template.role || 'Engineer';
    a.task ||= template.task || 'analysis';
    a.tool ||= template.tool || 'local workflow';
    a.mode ||= template.mode || 'autonomous';
    a.memory ||= O.memory;
    a.seed ||= (AGENT_NAMES.indexOf(a.name) + 1) * 7;
    if (!a.desk) a.desk = template.desk || 'desk-1';
    return a;
  }

  if (O.agents.size === 0) {
    AGENT_NAMES.forEach((name) => ensureAgent(`char-${name}`, name));
  } else {
    for (const [id, agent] of O.agents.entries()) {
      const template = AGENT_TEMPLATES[agent.name] || { desk: agent.desk || 'desk-1', role: agent.role || 'Engineer', task: agent.task || 'analysis', tool: agent.tool || 'local workflow', mode: agent.mode || 'autonomous' };
      agent.desk ||= template.desk;
      agent.role ||= template.role;
      agent.task ||= template.task;
      agent.tool ||= template.tool;
      agent.mode ||= template.mode;
      agent.memory ||= O.memory;
      agent.seed ||= (AGENT_NAMES.indexOf(agent.name) + 1) * 7;
    }
  }

  function want(a) {
    if (a.state === 'leave') return 'door';
    if (a.state === 'manual') return 'door';
    if (a.state === 'goBreak' || a.state === 'break') return a.bubble === 'coffee' ? 'coffee1' : a.bubble === 'water' ? 'water1' : 'water2';
    const deskIndex = O.DESKS.indexOf(a.desk);
    const slot = deskIndex >= 0 ? deskIndex + 1 : 1;
    return 'spot' + slot;
  }

  function getRotatingTask(agent) {
    const warmList = TASK_LIBRARY[agent.name] || [
      'focusing on current priorities',
      'checking task updates',
      'working through blockers',
      'reviewing project progress',
      'collaborating with the team',
      'sharing status with stakeholders',
      'updating the work log'
    ];

    const cycle = Math.floor(Date.now() / 30000);
    const bucketNames = ['desk', 'call', 'meeting', 'break', 'idle'];
    const bucket = bucketNames[(cycle + (agent.seed || 0)) % bucketNames.length];
    const bucketTasks = ACTIVITY_BINS[bucket] || ACTIVITY_BINS.desk;
    const index = (cycle + (agent.seed || 0)) % bucketTasks.length;
    const task = warmList[(cycle + (agent.seed || 0)) % warmList.length];

    return {
      bucket,
      label: bucket === 'desk' || bucket === 'idle' ? task : bucketTasks[index],
      task
    };
  }

  function updateAgentRoutine(agent) {
    if (agent.pendingTask && agent.pendingTask.trim()) {
      agent.bubble = agent.pendingTask.trim();
      agent.bubbleUntil = Date.now() + 4000;
      agent.lastTask = agent.pendingTask.trim();
      agent.task = agent.lastTask;
      agent.pendingTask = '';
      O.memory.remember({ tag: 'manual', actor: agent.name, detail: agent.lastTask });
      return;
    }

    const cycle = getRotatingTask(agent);
    const label = cycle.label;
    agent.task = label;
    const normalized = label.toLowerCase();

    if (normalized.includes('coffee') || normalized.includes('water') || normalized.includes('break') || normalized.includes('stretch') || normalized.includes('reset') || normalized.includes('pantry')) {
      agent.bubble = label;
      agent.state = 'break';
    } else if (normalized.includes('call') || normalized.includes('sync') || normalized.includes('meeting') || normalized.includes('review') || normalized.includes('standup') || normalized.includes('check-in')) {
      agent.bubble = label;
      agent.state = 'social';
    } else if (normalized.includes('quiet') || normalized.includes('idle') || normalized.includes('notes') || normalized.includes('inbox') || normalized.includes('status') || normalized.includes('brief')) {
      agent.bubble = label;
      agent.state = 'idle';
    } else if (normalized.includes('focus') || normalized.includes('work') || normalized.includes('writing') || normalized.includes('design') || normalized.includes('reviewing') || normalized.includes('updating') || normalized.includes('checking')) {
      agent.bubble = label;
      agent.state = 'work';
    } else {
      agent.bubble = label;
      agent.state = 'focus';
    }

    agent.bubbleUntil = Date.now() + 2200;
  }

  function step(dt) {
    for (const [id, v] of V) if (!O.agents.has(id)) V.delete(id);
    for (const a of O.agents.values()) {
      updateAgentRoutine(a);
      let v = V.get(a.id);
      if (!v) {
        const target = deskMap[a.desk] || { x: 35, y: 60 };
        v = { x: target.x, y: target.y, path: [], target: null, face: 'front-right', moving: false };
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
      const shortLabel = `${h.agent.name} • ${h.agent.task}`;
      bubble(shortLabel, h.v.x * PX, h.v.y * PY - 150);
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
      O.memory?.remember({ tag: 'coffee', actor: 'machine', detail: 'brew started' });
    } else if (id === 'cooler') {
      say('Stay hydrated', x, y - 8);
      pop('glass-water', x, y - 12);
      O.feed?.(new Date(), 'Office', 'someone is getting water');
      O.memory?.remember({ tag: 'hydration', actor: 'agent', detail: 'water break' });
    } else if (id === 'bell') {
      for (const a of w) {
        a.bubble = 'ding!';
        a.bubbleUntil = Date.now() + 2500;
      }
      say('DING!', x, y - 6);
      pop('star', x, y - 10);
      O.feed?.(new Date(), 'Office', 'the bell rang, everyone cheers');
      O.memory?.remember({ tag: 'status', actor: 'bell', detail: 'team sync signal' });
    } else if (id === 'kanban') {
      say('Opening the board', x, y - 8);
      O.memory?.remember({ tag: 'board', actor: 'agent', detail: 'kanban review started' });
    } else if (id === 'tv') {
      say(state.alert ? 'Server alert!' : 'All systems green', x, y - 8);
      O.memory?.remember({ tag: 'monitor', actor: 'dashboard', detail: state.alert ? 'alert active' : 'system green' });
    } else if (id === 'poster') {
      say('Ship it!', x, y - 6);
      pop('rocket', x, y - 10);
      O.memory?.remember({ tag: 'delivery', actor: 'poster', detail: 'launch enthusiasm' });
    } else if (id === 'ext') {
      say('Safety first', x, y - 6); pop('fire', x, y - 4);
    } else if (id === 'printer') {
      if (state.jam) {
        state.jam = false;
        say('Fixed!', x, y - 8);
        O.memory?.remember({ tag: 'printer', actor: 'ops', detail: 'resolved jam' });
      } else {
        state.jam = Math.random() < 0.4;
        say(state.jam ? 'Paper jam!' : 'Page printed', x, y - 8);
        O.memory?.remember({ tag: 'printer', actor: 'ops', detail: state.jam ? 'jam detected' : 'print success' });
      }
    } else if (id === 'filing') {
      state.fil = 3; say('Only paperwork', x, y - 8);
      O.memory?.remember({ tag: 'docs', actor: 'filing', detail: 'records review' });
    } else if (id.startsWith('plant')) {
      say('Thanks, hydrated', x, y - 10);
      pop('watering-can', x, y - 14);
      O.memory?.remember({ tag: 'plant', actor: 'agent', detail: 'plant care' });
    } else if (id === 'window') {
      say(dark() > 0.5 ? 'Good morning' : 'Lights out', x, y);
      O.memory?.remember({ tag: 'lighting', actor: 'window', detail: dark() > 0.5 ? 'day mode' : 'night mode' });
    } else if (id === 'door') {
      const available = AGENT_NAMES.find((k) => ![...O.agents.values()].some((a) => a.name === k));
      if (available) {
        O.addAgent?.(`char-${available}`, available);
        say(`${available} walks in`, x, y - 4);
        O.memory?.remember({ tag: 'arrival', actor: available, detail: 'joined office' });
      } else {
        say('All agents are here', x, y - 4);
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
      a.bubble = `${a.role}: ${a.task}`;
      a.bubbleUntil = Date.now() + 2500;
      pop('thumb-up', h.v.x, h.v.y - 17);
      say(a.name, h.v.x, h.v.y - 18);
      O.memory?.remember({ tag: 'interaction', actor: a.name, detail: a.task });
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

  if (chatInputEl && sendBtn) {
    sendBtn.addEventListener('click', () => { const val = chatInputEl.value; if (val) { applyCommand(val); chatInputEl.value = ''; } });
    chatInputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const val = chatInputEl.value;
        if (val) { applyCommand(val); chatInputEl.value = ''; }
      }
    });
  }

  appendChat('System: local-only mode active. No data collection.', true);
  appendChat('Example: Atlas, start coffee break', false);

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

    O.memory.remember({ tag: 'system', actor: 'PAI Office', detail: 'shared memory online' });

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
