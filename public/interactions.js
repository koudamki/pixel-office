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
    for (const [id, row] of rows) if (!agents().some((agent) => agent.id === id)) { row.remove(); rows.delete(id); }
    for (const agent of visible) {
      let row = rows.get(agent.id);
      if (!row) {
        row = document.createElement('button'); row.type = 'button'; row.className = 'agent-row'; row.dataset.agentId = agent.id;
        row.innerHTML = '<span class="agent-dot" aria-hidden="true"></span><span class="agent-row-copy"><strong></strong><small></small></span>';
        row.addEventListener('click', () => selectAgent(agent.id)); rows.set(agent.id, row);
      }
      row.querySelector('strong').textContent = agent.name;
      row.querySelector('small').textContent = `${stateLabel(agent)} · ${agent.role || 'Teammate'}`;
      row.setAttribute('aria-current', String(selected === agent.id));
      list.append(row);
    }
    if (!visible.length) {
      if (!list.querySelector('.empty-result')) { const empty = document.createElement('p'); empty.className = 'panel-muted empty-result'; empty.textContent = 'No teammates match that search.'; list.append(empty); }
    } else list.querySelector('.empty-result')?.remove();
  }

  function selectAgent(id) {
    const agent = agents().find((item) => item.id === id);
    if (!agent) return;
    selected = id; boardOpen = false;
    title.textContent = agent.name;
    hint.textContent = 'Teammate profile';
    profile.hidden = false; board.hidden = true;
    const task = localTasks.get(id) || agent.task || 'Checking current priorities';
    profile.innerHTML = `<div class="profile-card"><h2>${escape(agent.name)}</h2><p class="role">${escape(agent.role || 'Teammate')} · ${escape(agent.mode || 'team member')}</p><dl><div><dt>Status</dt><dd>${escape(stateLabel(agent))}</dd></div><div><dt>Current work</dt><dd>${escape(task)}</dd></div><div><dt>Desk tools</dt><dd>${escape(agent.tool || 'Office workspace')}</dd></div></dl><div class="panel-actions"><button type="button" id="profile-task">View task board</button><button type="button" id="profile-activity">Log activity</button></div></div>`;
    profile.querySelector('#profile-task').addEventListener('click', openBoard);
    profile.querySelector('#profile-activity').addEventListener('click', () => { addEvent(`${agent.name} · ${task}`); status.textContent = `Activity noted for ${agent.name}`; });
    renderList();
  }

  function openBoard() {
    boardOpen = true; title.textContent = 'Task board'; hint.textContent = 'Sample tasks for this office demo; changes stay in this page.';
    profile.hidden = true; board.hidden = false;
    const cards = agents().slice(0, 8).map((agent, index) => {
      const task = localTasks.get(agent.id) || agent.task || 'Review current priorities';
      const done = localTasks.has(`${agent.id}:done`);
      return `<article class="task-card"><strong>${escape(task)}</strong><p>${escape(agent.name)} · ${done ? 'Completed in this demo' : (index % 3 === 0 ? 'Needs review' : 'In progress')}</p><button type="button" data-complete="${escape(agent.id)}" ${done ? 'disabled' : ''}>${done ? 'Done' : 'Mark complete'}</button></article>`;
    }).join('');
    board.innerHTML = `<h3>Team tasks</h3><div class="task-board">${cards || '<p class="panel-muted">No teammates are available yet.</p>'}</div>`;
    board.querySelectorAll('[data-complete]').forEach((button) => button.addEventListener('click', () => {
      const agent = agents().find((item) => item.id === button.dataset.complete); if (!agent) return;
      localTasks.set(`${agent.id}:done`, true); addEvent(`${agent.name} completed a demo task.`); status.textContent = `Task completed · ${agent.name}`; openBoard();
    }));
    document.getElementById('toggle-board').setAttribute('aria-expanded', 'true');
  }

  document.getElementById('toggle-board').addEventListener('click', () => {
    if (boardOpen) { boardOpen = false; if (selected) selectAgent(selected); else { title.textContent = 'Your teammates'; hint.textContent = 'Select a character in the office or use this list to explore their work.'; board.hidden = true; profile.hidden = true; } }
    else openBoard();
    document.getElementById('toggle-board').setAttribute('aria-expanded', String(boardOpen));
  });
  document.getElementById('close-panel').addEventListener('click', () => { panel.hidden = true; document.getElementById('toggle-board').focus(); });
  search.addEventListener('input', renderList);
  document.getElementById('toggle-labels').addEventListener('click', (event) => {
    labelsVisible = !labelsVisible; event.currentTarget.setAttribute('aria-pressed', String(labelsVisible)); event.currentTarget.textContent = labelsVisible ? 'Hide labels' : 'Show labels';
  });

  // Canvas characters are also selectable by keyboard through the teammate list.
  const canvas = stage.querySelector('canvas');
  if (canvas) canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * 100 / rect.width;
    const y = (event.clientY - rect.top) * 100 / rect.height;
    const match = agents().map((agent) => ({ agent, distance: Math.hypot((x - Number(agent.x || 0)) * 1.2, (y - Number(agent.y || 0)) * .9) })).filter(({ distance }) => distance < 8).sort((a, b) => a.distance - b.distance)[0];
    if (match) { selectAgent(match.agent.id); status.textContent = `${match.agent.name} selected`; }
  });

  const labels = new Map();
  function updateLabels() {
    if (!canvas) return;
    for (const agent of agents()) {
      let label = labels.get(agent.id);
      if (!label) { label = document.createElement('span'); label.className = 'scene-label'; label.setAttribute('aria-hidden', 'true'); stage.append(label); labels.set(agent.id, label); }
      label.textContent = agent.name;
      label.hidden = !labelsVisible || panel.hidden;
      label.style.left = `${Math.max(3, Math.min(97, Number(agent.x || 0)))}%`;
      label.style.top = `${Math.max(8, Number(agent.y || 0) - 10)}%`;
    }
  }

  const form = document.getElementById('agent-chat-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault(); const input = document.getElementById('agent-chat-input'); const text = input.value.trim(); if (!text) return;
    const match = text.match(/^(\w+)/); const agent = agents().find((item) => item.name.toLowerCase() === (match?.[1] || '').toLowerCase());
    if (!agent) { status.textContent = 'Try a teammate name, e.g. Atlas, review the release'; return; }
    localTasks.set(agent.id, text.replace(/^\w+\s*[:,]?\s*/, '') || agent.task);
    addEvent(`${agent.name} received a local demo instruction.`); status.textContent = `Demo instruction noted for ${agent.name}`; selectAgent(agent.id); input.value = '';
  });

  const welcome = document.getElementById('welcome-overlay');
  welcome?.addEventListener('animationend', () => welcome.remove(), { once: true });
  renderList();
  window.setInterval(() => { renderList(); updateLabels(); }, 500);
  window.addEventListener('resize', updateLabels);
})();
