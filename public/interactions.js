(() => {
  const stage = document.getElementById('office-stage');
  const list = document.getElementById('agent-list');
  const panel = document.getElementById('office-panel');
  if (!stage || !list) return;

  const office = window.__office;
  const title = document.getElementById('panel-title');
  const hint = document.getElementById('panel-hint');
  const profile = document.getElementById('profile-view');
  const board = document.getElementById('board-view');
  const activity = document.getElementById('activity-list');
  const status = document.getElementById('office-status');
  const search = document.getElementById('office-search');
  const rows = new Map();
  const localTasks = new Map();
  const events = ['Office is ready to explore.'];
  let selected = null;
  let boardOpen = false;
  let labelsVisible = false;
  const pageLoadAt = Date.now();

  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const agents = () => office?.agents ? [...office.agents.values()] : [];

  const addEvent = (text) => {
    events.unshift(text);
    events.splice(5);
    activity.replaceChildren(...events.map((event) => {
      const li = document.createElement('li'); li.textContent = event; return li;
    }));
  };

  const stateLabel = (agent) => agent.state === 'break' ? 'On a break' : agent.state === 'idle' ? 'Available' : agent.state === 'leave' ? 'Away' : 'Working';

  function renderList() {
    const query = search.value.trim().toLowerCase();
    const visible = agents().filter((agent) => `${agent.name} ${agent.role || ''} ${agent.task || ''}`.toLowerCase().includes(query));

    for (const [id, row] of rows) {
      if (!agents().some((agent) => agent.id === id)) {
        row.remove();
        rows.delete(id);
      }
    }

    for (const agent of visible) {
      let row = rows.get(agent.id);
      if (!row) {
        row = document.createElement('button');
        row.type = 'button';
        row.className = 'agent-row';
        row.dataset.agentId = agent.id;
        row.innerHTML = '<span class="agent-dot" aria-hidden="true"></span><span class="agent-row-copy"><strong></strong><small></small></span>';
        row.addEventListener('click', () => selectAgent(agent.id));
        rows.set(agent.id, row);
      }
      row.querySelector('strong').textContent = agent.name;
      row.querySelector('small').textContent = `${stateLabel(agent)} · ${agent.role || 'Teammate'}`;
      row.setAttribute('aria-current', String(selected === agent.id));
      list.append(row);
    }

    if (!visible.length && !list.querySelector('.empty-result')) {
      const empty = document.createElement('p');
      empty.className = 'panel-muted empty-result';
      empty.textContent = 'No teammates match that search.';
      list.append(empty);
    } else if (visible.length) {
      list.querySelector('.empty-result')?.remove();
    }
  }

  function selectAgent(id) {
    const agent = agents().find((item) => item.id === id);
    if (!agent) return;
    selected = id;
    boardOpen = false;
    title.textContent = agent.name;
    hint.textContent = 'Teammate profile';
    profile.hidden = false;
    board.hidden = true;

    const task = localTasks.get(id) || agent.task || 'Checking current priorities';
    profile.innerHTML = `
      <div class="profile-card">
        <h2>${escape(agent.name)}</h2>
        <p class="role">${escape(agent.role || 'Teammate')} · ${escape(agent.mode || 'team member')}</p>
        <dl>
          <div><dt>Status</dt><dd>${escape(stateLabel(agent))}</dd></div>
          <div><dt>Current work</dt><dd>${escape(task)}</dd></div>
          <div><dt>Desk tools</dt><dd>${escape(agent.tool || 'Office workspace')}</dd></div>
        </dl>
        <div class="panel-actions">
          <button type="button" id="profile-task">View task board</button>
          <button type="button" id="profile-activity">Log activity</button>
        </div>
      </div>
    `;

    profile.querySelector('#profile-task').addEventListener('click', openBoard);
    profile.querySelector('#profile-activity').addEventListener('click', () => {
      addEvent(`${agent.name} · ${task}`);
      status.textContent = `Activity noted for ${agent.name}`;
    });

    renderList();
  }

  function openBoard() {
    boardOpen = true;
    title.textContent = 'Task board';
    hint.textContent = 'Sample tasks for this office demo; changes stay in this page.';
    profile.hidden = true;
    board.hidden = false;

    const cards = agents().slice(0, 8).map((agent, index) => {
      const task = localTasks.get(agent.id) || agent.task || 'Review current priorities';
      const done = localTasks.has(`${agent.id}:done`);
      return `<article class="task-card"><strong>${escape(task)}</strong><p>${escape(agent.name)} · ${done ? 'Completed in this demo' : (index % 3 === 0 ? 'Needs review' : 'In progress')}</p><button type="button" data-complete="${escape(agent.id)}" ${done ? 'disabled' : ''}>${done ? 'Done' : 'Mark complete'}</button></article>`;
    }).join('');

    board.innerHTML = `<h3>Team tasks</h3><div class="task-board">${cards || '<p class="panel-muted">No teammates are available yet.</p>'}</div>`;
    board.querySelectorAll('[data-complete]').forEach((button) => {
      button.addEventListener('click', () => {
        const agent = agents().find((item) => item.id === button.dataset.complete);
        if (!agent) return;
        localTasks.set(`${agent.id}:done`, true);
        addEvent(`${agent.name} completed a demo task.`);
        status.textContent = `Task completed · ${agent.name}`;
        openBoard();
      });
    });

    document.getElementById('toggle-board').setAttribute('aria-expanded', 'true');
  }

  document.getElementById('toggle-board').addEventListener('click', () => {
    if (boardOpen) {
      boardOpen = false;
      if (selected) {
        selectAgent(selected);
      } else {
        title.textContent = 'Your teammates';
        hint.textContent = 'Select a character in the office or use this list to explore their work.';
        board.hidden = true;
        profile.hidden = true;
      }
    } else {
      openBoard();
    }
    document.getElementById('toggle-board').setAttribute('aria-expanded', String(boardOpen));
  });

  document.getElementById('close-panel').addEventListener('click', () => {
    panel.hidden = true;
    document.getElementById('toggle-board').focus();
  });

  search.addEventListener('input', renderList);
  document.getElementById('toggle-labels').addEventListener('click', (event) => {
    labelsVisible = !labelsVisible;
    event.currentTarget.setAttribute('aria-pressed', String(labelsVisible));
    event.currentTarget.textContent = labelsVisible ? 'Hide labels' : 'Show labels';
  });

  const canvas = stage.querySelector('canvas');
  if (canvas) {
    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * 100 / rect.width;
      const y = (event.clientY - rect.top) * 100 / rect.height;
      const match = agents()
        .map((agent) => ({
          agent,
          distance: Math.hypot((x - Number(agent.x || 0)) * 1.2, (y - Number(agent.y || 0)) * .9),
        }))
        .filter(({ distance }) => distance < 8)
        .sort((a, b) => a.distance - b.distance)[0];

      if (match) {
        selectAgent(match.agent.id);
        status.textContent = `${match.agent.name} selected`;
      }
    });
  }

  const labels = new Map();
  function updateLabels() {
    if (!canvas) return;
    for (const agent of agents()) {
      let label = labels.get(agent.id);
      if (!label) {
        label = document.createElement('span');
        label.className = 'scene-label';
        label.setAttribute('aria-hidden', 'true');
        stage.append(label);
        labels.set(agent.id, label);
      }
      label.textContent = agent.name;
      label.hidden = !labelsVisible || panel.hidden;
      label.style.left = `${Math.max(3, Math.min(97, Number(agent.x || 0)))}%`;
      label.style.top = `${Math.max(8, Number(agent.y || 0) - 10)}%`;
    }
  }

  const form = document.getElementById('agent-chat-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('agent-chat-input');
    const text = input.value.trim();
    if (!text) return;

    const match = text.match(/^(\w+)/);
    const agent = agents().find((item) => item.name.toLowerCase() === (match?.[1] || '').toLowerCase());
    if (!agent) {
      status.textContent = 'Try a teammate name, e.g. Atlas, review the release';
      return;
    }

    localTasks.set(agent.id, text.replace(/^\w+\s*[:,]?\s*/, '') || agent.task);
    addEvent(`${agent.name} received a local demo instruction.`);
    status.textContent = `Demo instruction noted for ${agent.name}`;
    selectAgent(agent.id);
    input.value = '';
  });

  const welcome = document.getElementById('welcome-overlay');
  welcome?.addEventListener('animationend', () => welcome.remove(), { once: true });
  renderList();
  window.setInterval(() => { renderList(); updateLabels(); }, 500);
  window.addEventListener('resize', updateLabels);

  const deskSeats = {
    Atlas: { x: 20, y: 64 }, Nova: { x: 32, y: 64 }, Sage: { x: 46, y: 64 }, Pixel: { x: 58, y: 64 },
    Echo: { x: 72, y: 64 }, Bolt: { x: 30, y: 80 }, Iris: { x: 52, y: 82 }, Juno: { x: 68, y: 82 },
    Milo: { x: 18, y: 88 }, Astra: { x: 30, y: 90 }, Hux: { x: 42, y: 90 }, Lena: { x: 55, y: 90 },
    Orion: { x: 68, y: 90 }, Vera: { x: 80, y: 88 }, Theo: { x: 88, y: 80 }, Dahlia: { x: 90, y: 68 },
  };

  const chairStyle = document.createElement('style');
  chairStyle.textContent = `
    .office-chair {
      position: absolute;
      z-index: 7;
      width: 22px;
      height: 22px;
      display: grid;
      place-items: center;
      font-size: 20px;
      transform: translate(-50%, -50%);
      filter: drop-shadow(0 4px 1px rgba(0,0,0,0.35));
      opacity: 0.95;
      pointer-events: none;
      transition: left .4s ease, top .4s ease, transform .25s ease;
    }
    .office-chair.sit {
      transform: translate(-50%, -50%) scale(1.08);
    }
    .office-chair .chair-low {
      display: block;
      opacity: 0.92;
    }
    .office-dog {
      position: absolute;
      z-index: 12;
      width: clamp(36px, 4.6vw, 72px);
      height: auto;
      left: 68%;
      top: 48%;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: left 2s ease-in-out, top 2s ease-in-out, opacity .5s ease;
      filter: drop-shadow(0 5px 12px rgba(0,0,0,0.35));
      pointer-events: none;
    }
    .office-dog.visible {
      opacity: 1;
    }
    .office-dog svg {
      display: block;
      width: 100%;
      height: auto;
    }
  `;
  document.head.appendChild(chairStyle);

  const chairMap = new Map();
  const seatedAgents = new Set();

  function ensureChair(agent, seat) {
    let chair = chairMap.get(agent.id);
    if (!chair) {
      chair = document.createElement('div');
      chair.className = 'office-chair';
      chair.innerHTML = '<span class="chair-low">🪑</span>';
      chairMap.set(agent.id, chair);
      stage.appendChild(chair);
    }
    chair.style.left = `${seat.x}%`;
    chair.style.top = `${seat.y}%`;
    chair.classList.toggle('sit', seatedAgents.has(agent.id));
    chair.title = `${agent.name} ${seatedAgents.has(agent.id) ? 'is seated' : 'has a chair'}`;
    return chair;
  }

  function updateChairs() {
    for (const agent of agents()) {
      const seat = deskSeats[agent.name] || { x: Number(agent.x || 20), y: Number(agent.y || 64) + 2 };
      ensureChair(agent, seat);
    }
  }

  const dog = document.createElement('div');
  dog.className = 'office-dog';
  dog.setAttribute('aria-label', 'Atlas’s Saint Bernard');
  dog.innerHTML = `
    <svg viewBox="0 0 80 56" aria-hidden="true">
      <g>
        <ellipse cx="46" cy="25" rx="15" ry="12" fill="#8d5f3f"/>
        <ellipse cx="52" cy="18" rx="10" ry="9" fill="#9a6a47"/>
        <circle cx="58" cy="17" r="2" fill="#1e1e1e"/>
        <ellipse cx="21" cy="21" rx="13" ry="10" fill="#8a5a3a"/>
        <ellipse cx="14" cy="28" rx="2" ry="8" fill="#7d4d32"/>
        <ellipse cx="23" cy="28" rx="2" ry="8" fill="#7d4d32"/>
        <ellipse cx="35" cy="30" rx="2" ry="8" fill="#7d4d32"/>
        <ellipse cx="48" cy="30" rx="2" ry="8" fill="#7d4d32"/>
        <ellipse cx="53" cy="24" rx="7" ry="5" fill="#f4d4a3"/>
        <ellipse cx="60" cy="16" rx="4" ry="3" fill="#f4d4a3"/>
        <circle cx="61" cy="16" r="1.2" fill="#1e1e1e"/>
        <path d="M14 14 Q 20 8 28 12 L 30 15 L 18 18 Z" fill="#8b5b3d"/>
      </g>
    </svg>
  `;
  stage.appendChild(dog);

  const dogDoor = { x: 69, y: 49 };
  const dogWaitMs = 60000;
  let dogReady = false;
  let dogHasEntered = false;

  function updateDog() {
    const atlas = agents().find((agent) => agent.name === 'Atlas');
    if (!atlas) return;

    const elapsed = Date.now() - pageLoadAt;
    const atlasX = Number(atlas.x || 20);
    const atlasY = Number(atlas.y || 64);

    if (elapsed >= dogWaitMs) {
      dogReady = true;
      if (!dogHasEntered) {
        dogHasEntered = true;
        dog.style.left = `${dogDoor.x}%`;
        dog.style.top = `${dogDoor.y}%`;
        dog.classList.add('visible');
        addEvent('Atlas’s Saint Bernard has entered the office.');
        status.textContent = 'Atlas’s Saint Bernard is entering the office';
      }
    }

    if (dogReady) {
      const targetX = Math.min(96, Math.max(10, atlasX + 7));
      const targetY = Math.min(86, Math.max(18, atlasY + 9));
      dog.style.left = `${targetX}%`;
      dog.style.top = `${targetY}%`;
      dog.classList.add('visible');
    }
  }

  // Default: all agents are seated at their desks, but can still be toggled via the panel.
  for (const agent of agents()) {
    seatedAgents.add(agent.id);
  }

  updateChairs();
  updateLabels();
  updateDog();
  window.setInterval(() => {
    updateChairs();
    updateLabels();
    updateDog();
  }, 250);
})();
