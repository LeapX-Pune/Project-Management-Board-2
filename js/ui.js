function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getPriorityClass(priority) {
  return priority === 'high' ? 'high' : priority === 'medium' ? 'medium' : 'low';
}

function getDueDateClass(dueDate) {
  if (!dueDate) return '';
  const now = new Date();
  const due = new Date(dueDate + 'T23:59:59');
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 2) return 'approaching';
  return 'far';
}

function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getSubtaskProgress(subtasks) {
  if (!subtasks || subtasks.length === 0) return { completed: 0, total: 0, pct: 0 };
  const completed = subtasks.filter(s => s.completed).length;
  const total = subtasks.length;
  const pct = Math.round((completed / total) * 100);
  return { completed, total, pct };
}

function createSubtaskBar(subtasks) {
  const progress = getSubtaskProgress(subtasks);
  if (!progress) return '';
  return `
    <div class="task-subtask-bar" title="${progress.completed}/${progress.total} subtasks">
      <div class="task-subtask-bar-fill" style="width:${progress.pct}%"></div>
      <span class="task-subtask-text">${progress.completed}/${progress.total}</span>
    </div>
  `;
}

function createTaskCard(task, members) {
  const li = document.createElement('li');
  li.className = 'task-card';
  li.draggable = true;
  li.dataset.taskId = task.id;

  const member = members[task.assignee];
  const initials = member ? getInitials(member.name) : '??';
  const avatarColor = member ? member.color : '#71717A';
  const dueDateClass = getDueDateClass(task.dueDate);
  const subtaskHtml = createSubtaskBar(task.subtasks);

  li.innerHTML = `
    <div class="task-priority ${getPriorityClass(task.priority)}">${task.priority}</div>
    <div class="task-title">${task.title}</div>
    <div class="task-description">${task.description}</div>
    ${subtaskHtml}
    <div class="task-meta">
      <div class="task-meta-left">
        <span class="task-due-date ${dueDateClass}">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
            <path d="M1 5H11" stroke="currentColor" stroke-width="1.2"/>
            <path d="M4 1V3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M8 1V3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          ${task.dueDate || 'No date'}
        </span>
      </div>
      <div class="task-avatar" style="background:${avatarColor}" title="${member ? member.name : 'Unknown'}">${initials}</div>
    </div>
    <div class="task-actions">
      <button class="task-action-btn" data-action="edit" aria-label="Edit task">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M10 1.5L12.5 4L4.5 12H2V9.5L10 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="task-action-btn destructive" data-action="delete" aria-label="Delete task">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 3.5H12M5 3.5V2C5 1.72386 5.22386 1.5 5.5 1.5H8.5C8.77614 1.5 9 1.72386 9 2V3.5M3 3.5L3.5 12.5H10.5L11 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  `;

  return li;
}

function createColumn(col, tasks, members) {
  const article = document.createElement('article');
  article.className = 'column';
  article.dataset.columnId = col.id;

  const header = document.createElement('div');
  header.className = 'column-header';
  header.innerHTML = `
    <div class="column-header-left">
      <h2 class="column-title">${col.title}</h2>
      <span class="column-count" id="count-${col.id}">${col.taskIds.length}</span>
      <input type="text" class="column-title-input hidden" value="${col.title}" aria-label="Rename column">
    </div>
    <div class="column-options">
      <button class="column-option-btn" data-action="rename" aria-label="Rename column">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M10 1.5L12.5 4L4.5 12H2V9.5L10 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="column-option-btn destructive" data-action="delete" aria-label="Delete column">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 3.5H12M5 3.5V2C5 1.72386 5.22386 1.5 5.5 1.5H8.5C8.77614 1.5 9 1.72386 9 2V3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  `;

  const taskList = document.createElement('ul');
  taskList.className = 'task-list';

  col.taskIds.forEach(id => {
    const task = tasks[id];
    if (task) {
      taskList.appendChild(createTaskCard(task, members));
    }
  });

  article.appendChild(header);
  article.appendChild(taskList);
  return article;
}

function createAddColumnPlaceholder() {
  const div = document.createElement('div');
  div.className = 'add-column-placeholder';
  div.id = 'add-column-placeholder';
  div.innerHTML = `
    <button class="add-column-btn" id="add-column-btn" aria-label="Add new column">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Add Column
    </button>
    <div class="add-column-input hidden">
      <input type="text" class="column-name-input" placeholder="Column name..." id="new-column-input">
      <div class="add-column-actions">
        <button class="btn btn-primary btn-sm" id="confirm-add-column">Add</button>
        <button class="btn btn-ghost btn-sm" id="cancel-add-column">Cancel</button>
      </div>
    </div>
  `;
  return div;
}

export function renderBoard(data) {
  const container = document.getElementById('board-container');
  container.innerHTML = '';

  data.columns.forEach(col => {
    container.appendChild(createColumn(col, data.tasks, data.members));
  });

  container.appendChild(createAddColumnPlaceholder());
}

export function renderActivity(entries) {
  const list = document.getElementById('activity-list');
  list.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'activity-log-header';
  header.innerHTML = `
    <div class="activity-log-col activity-log-col--member">Member</div>
    <div class="activity-log-col activity-log-col--action">Activity</div>
    <div class="activity-log-col activity-log-col--area">Area</div>
    <div class="activity-log-col activity-log-col--date">Date</div>
    <div class="activity-log-col activity-log-col--time">Time</div>
  `;
  list.appendChild(header);

  entries.forEach((entry, idx) => {
    const d = new Date(entry.timestamp);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const div = document.createElement('div');
    div.className = 'activity-entry';
    div.dataset.type = entry.type || 'all';
    div.style.animationDelay = `${idx * 0.03}s`;
    div.innerHTML = `
      <div class="activity-log-col activity-log-col--member">
        <span class="activity-entry-avatar" style="background:${getColorForUser(entry.user)}">${getInitials(entry.user)}</span>
        <span class="activity-entry-name">${entry.user}</span>
      </div>
      <div class="activity-log-col activity-log-col--action">
        <span class="activity-entry-action">${entry.action}</span>
      </div>
      <div class="activity-log-col activity-log-col--area">
        <span class="activity-entry-area activity-entry-area--${entry.type}">${entry.area}</span>
      </div>
      <div class="activity-log-col activity-log-col--date">
        <span class="activity-entry-date">${dateStr}</span>
      </div>
      <div class="activity-log-col activity-log-col--time">
        <span class="activity-entry-time">${timeStr}</span>
      </div>
    `;
    list.appendChild(div);
  });
}

function getColorForUser(name) {
  const colors = {
    'Alice Chen': '#7C3AED',
    'Bob Smith': '#3B82F6',
    'Carol Davis': '#10B981',
    'Dave Wilson': '#F59E0B',
    'Eve Martin': '#EC4899',
    'Frank Lee': '#06B6D4',
  };
  return colors[name] || '#71717A';
}

export function renderTable(data) {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';

  data.columns.forEach(col => {
    col.taskIds.forEach(id => {
      const task = data.tasks[id];
      if (!task) return;
      const member = data.members[task.assignee];
      const progress = getSubtaskProgress(task.subtasks);
      const subtaskDisplay = progress ? `${progress.completed}/${progress.total}` : '-';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${task.title}</strong></td>
        <td>${col.title}</td>
        <td><span class="task-priority ${getPriorityClass(task.priority)}">${task.priority}</span></td>
        <td>${task.dueDate || '-'}</td>
        <td>${member ? member.name : '-'}</td>
        <td>${subtaskDisplay}</td>
      `;
      tbody.appendChild(tr);
    });
  });
}

export function renderList(data) {
  const container = document.getElementById('list-container');
  container.innerHTML = '';

  data.columns.forEach(col => {
    col.taskIds.forEach(id => {
      const task = data.tasks[id];
      if (!task) return;
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div class="list-item-priority ${getPriorityClass(task.priority)}"></div>
        <div class="list-item-content">
          <div class="list-item-title">${task.title}</div>
          <div class="list-item-meta">${col.title} &middot; ${task.dueDate || 'No date'}</div>
        </div>
      `;
      container.appendChild(div);
    });
  });
}

export function renderTeam(members) {
  const container = document.getElementById('team-container');
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'team-header';
  header.innerHTML = '<h2>Team Members</h2>';
  container.appendChild(header);

  const cols = Math.ceil(members.length / 2);
  const grid = document.createElement('div');
  grid.className = 'team-grid';
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  members.forEach((member, idx) => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.style.animationDelay = `${idx * 0.05}s`;
    card.dataset.memberId = member.id;

    const githubBadge = member.githubId
      ? `<span class="team-card-github">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          ${member.githubId}
        </span>`
      : '';

    card.innerHTML = `
      <div class="team-card-avatar" style="background:${member.color}">${member.initials}</div>
      <div class="team-card-info">
        <div class="team-card-name">${member.name}</div>
        <div class="team-card-role">${member.role}</div>
        ${githubBadge}
      </div>
      <div class="team-card-actions">
        <button class="btn btn-ghost btn-sm team-github-btn" data-member-id="${member.id}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          ${member.githubId ? 'Edit GitHub ID' : 'Add GitHub ID'}
        </button>
      </div>
      <div class="team-card-stats">
        <div class="team-card-stat">
          <span class="team-card-stat-value">${member.tasksCompleted}</span>
          <span class="team-card-stat-label">Done</span>
        </div>
        <div class="team-card-stat">
          <span class="team-card-stat-value">${member.tasksInProgress}</span>
          <span class="team-card-stat-label">Active</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  const remainder = members.length % cols;
  if (remainder > 0) {
    const fillers = cols - remainder;
    for (let i = 0; i < fillers; i++) {
      const filler = document.createElement('div');
      filler.style.visibility = 'hidden';
      filler.style.height = '0';
      filler.style.overflow = 'hidden';
      grid.appendChild(filler);
    }
  }

  container.appendChild(grid);
}

export { getInitials, formatTimestamp, getSubtaskProgress };

export function renderQuickStats(data) {
  const container = document.getElementById('quick-stats');
  if (!container) return;

  const tasks = Object.values(data.tasks);
  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const overdue = tasks.filter(t => new Date(t.dueDate) < new Date()).length;
  const memberCount = data.members ? Object.keys(data.members).length : 0;
  const activityCount = data.activityLog ? data.activityLog.length : 0;
  const latestEntry = data.activityLog?.length
    ? data.activityLog.reduce((latest, cur) =>
        new Date(cur.timestamp) > new Date(latest.timestamp) ? cur : latest
      )
    : null;
  const latestDate = latestEntry ? new Date(latestEntry.timestamp).toLocaleDateString() : '—';

  const cards = [
    { label: 'Total Tasks', value: totalTasks },
    { label: 'Completed', value: completed },
    { label: 'In Progress', value: inProgress },
    { label: 'Overdue', value: overdue },
    { label: 'Members', value: memberCount },
    { label: 'Activity entries', value: activityCount },
    { label: 'Last activity', value: latestDate },
  ];

  container.innerHTML = `
    <div class="quick-stats-header">Quick Stats</div>
    <div class="quick-stats-grid">
      ${cards.map(c => `
        <div class="metric-card">
          <div class="metric-label">${c.label}</div>
          <div class="metric-value">${c.value}</div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderByDate(data) {
  const container = document.getElementById('bydate-view');
  if (!container) return;

  const toMidnight = iso => {
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const dayOfWeek = now.getDay();
  const diffToMon = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diffToMon);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startOfNextWeek = new Date(endOfWeek);
  startOfNextWeek.setDate(endOfWeek.getDate() + 1);
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

  const buckets = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    nextWeek: [],
    later: []
  };

  Object.values(data.tasks).forEach(task => {
    if (!task.dueDate) {
      buckets.later.push(task);
      return;
    }
    const d = toMidnight(task.dueDate);
    if (d.getTime() === now.getTime()) buckets.today.push(task);
    else if (d.getTime() === tomorrow.getTime()) buckets.tomorrow.push(task);
    else if (d >= startOfWeek && d <= endOfWeek) buckets.thisWeek.push(task);
    else if (d >= startOfNextWeek && d <= endOfNextWeek) buckets.nextWeek.push(task);
    else buckets.later.push(task);
  });

  const sections = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'thisWeek', label: 'This Week' },
    { key: 'nextWeek', label: 'Next Week' },
    { key: 'later', label: 'Later' }
  ];

  const html = sections.map(sec => {
    const tasks = buckets[sec.key];
    if (tasks.length === 0) return '';
    const taskList = tasks
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .map(task => {
        const li = createTaskCard(task, data.members);
        return li.outerHTML;
      })
      .join('');
    return `
      <section class="bydate-section" data-section="${sec.key}">
        <h2 class="bydate-section-title">${sec.label}</h2>
        <div class="bydate-tasks">${taskList}</div>
      </section>
    `;
  }).join('');

  container.innerHTML = html;
}

export function renderWeeklyLineGraph(data) {
  const svg = document.querySelector('#dashboard-view .chart-svg.line-graph');
  if (!svg) return;

  const today = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const stored = localStorage.getItem('dashboard-weekly-data');
  let series = stored ? JSON.parse(stored) : null;

  if (!series) {
    series = Array(7).fill(0);
    data.activityLog.forEach(entry => {
      const d = new Date(entry.timestamp);
      const diff = Math.floor((today - d) / msPerDay);
      if (diff >= 0 && diff < 7) {
        const idx = (today.getDay() + 6 - diff) % 7;
        series[idx] += 1;
      }
    });
    localStorage.setItem('dashboard-weekly-data', JSON.stringify(series));
  }

  const maxVal = Math.max(...series, 1);
  const margin = 20;
  const chartW = 280;
  const chartH = 120;

  const pts = series.map((v, i) => {
    const x = margin + i * (chartW / 6);
    const y = margin + chartH - (v / maxVal) * chartH;
    return { x, y };
  });

  const linePoints = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const poly = svg.querySelector('.line-path');
  if (poly) poly.setAttribute('points', linePoints);

  const area = svg.querySelector('.area-fill');
  if (area) {
    const areaPts = [
      `${pts[0].x.toFixed(1)},${(margin + chartH).toFixed(1)}`,
      ...pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `${pts[pts.length - 1].x.toFixed(1)},${(margin + chartH).toFixed(1)}`
    ].join(' ');
    area.setAttribute('points', areaPts);
  }

  const dots = svg.querySelector('.dot-markers');
  if (dots) {
    dots.innerHTML = pts.map(p =>
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" stroke="var(--bg-surface)" stroke-width="2"/>`
    ).join('');
  }
}

export function renderKPICards(data) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const completedToday = data.activityLog.filter(
    e => e.type === 'created' && new Date(e.timestamp).toDateString() === today.toDateString()
  ).length;

  const dueTomorrow = Object.values(data.tasks).filter(
    t => t.dueDate && new Date(t.dueDate).toDateString() === tomorrow.toDateString()
  ).length;

  document.getElementById('kpi-today').textContent = completedToday;
  document.getElementById('kpi-tomorrow').textContent = dueTomorrow;
  document.getElementById('kpi-avg').textContent = '—';
}

const STATUS_COLORS = {
  'col-backlog': '#9CA3AF',
  'col-todo': '#3B82F6',
  'col-in-progress': '#F59E0B',
  'col-review': '#8B5CF6',
  'col-done': '#10B981',
};

export function renderStatusDistribution(data) {
  const container = document.getElementById('status-hbars');
  if (!container) return;
  const cols = data.columns;
  const total = cols.reduce((s, c) => s + c.taskIds.length, 0);
  const nonZero = cols.filter(c => c.taskIds.length > 0);
  const bar = nonZero.map(col => {
    const color = STATUS_COLORS[col.id] || 'var(--color-accent)';
    return `<div class="stacked-segment" style="flex:${col.taskIds.length};background:${color}" title="${col.title}: ${col.taskIds.length} task${col.taskIds.length !== 1 ? 's' : ''}"></div>`;
  }).join('');
  const legend = cols.map(col => {
    const count = col.taskIds.length;
    const color = STATUS_COLORS[col.id] || 'var(--color-accent)';
    return `<span class="stacked-legend-item"><span class="stacked-legend-dot" style="background:${color}"></span>${col.title} ${count}</span>`;
  }).join('');
  const doneCol = cols.find(c => c.id === 'col-done');
  const progressCol = cols.find(c => c.id === 'col-in-progress');
  const doneCount = doneCol ? doneCol.taskIds.length : 0;
  const inProgressCount = progressCol ? progressCol.taskIds.length : 0;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const pendingCount = cols.reduce((s, c) => {
    if (['col-backlog', 'col-todo'].includes(c.id)) return s + c.taskIds.length;
    return s;
  }, 0);
  container.innerHTML = `
    <div class="stacked-bar">${bar || `<div class="stacked-segment" style="flex:1;background:var(--color-muted)"></div>`}</div>
    <div class="stacked-legend">${legend}</div>
    <div class="status-details">
      <div class="status-detail-item">
        <span class="status-detail-value">${total}</span>
        <span class="status-detail-label">Total</span>
      </div>
      <div class="status-detail-item">
        <span class="status-detail-value">${inProgressCount}</span>
        <span class="status-detail-label">Active</span>
      </div>
      <div class="status-detail-item">
        <span class="status-detail-value">${doneCount}</span>
        <span class="status-detail-label">Done</span>
      </div>
      <div class="status-detail-item">
        <span class="status-detail-value">${pct}%</span>
        <span class="status-detail-label">Rate</span>
      </div>
      <div class="status-detail-item">
        <span class="status-detail-value">${pendingCount}</span>
        <span class="status-detail-label">Pending</span>
      </div>
    </div>`;
}

const PRIORITY_CONFIG = {
  high:   { color: 'var(--priority-high-text)',   label: 'High' },
  medium: { color: 'var(--priority-medium-text)', label: 'Medium' },
  low:    { color: 'var(--priority-low-text)',    label: 'Low' },
};
const PRIORITY_ORDER = ['high', 'medium', 'low'];

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function makeArcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export function renderPriorityDoughnut(data) {
  const svg = document.querySelector('#priority-doughnut-card .chart-svg');
  const legend = document.getElementById('priority-legend');
  if (!svg) return;
  const total = Object.values(data.tasks).length || 1;
  const counts = { high: 0, medium: 0, low: 0 };
  Object.values(data.tasks).forEach(t => {
    if (t.priority && counts[t.priority] !== undefined) counts[t.priority]++;
  });

  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const cx = 100, cy = 100, r = 68, sw = 24, innerR = r - sw / 2;

  const segs = [];
  PRIORITY_ORDER.forEach(prio => {
    if (counts[prio] > 0) {
      segs.push({ prio, count: counts[prio] });
    }
  });
  if (segs.length === 0) {
    segs.push({ prio: 'low', count: 0 });
  }

  const totalSeg = segs.reduce((s, c) => s + c.count, 0) || 1;
  let currentAngle = 0;
  segs.forEach((seg, i) => {
    const sweep = (seg.count / totalSeg) * 360;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', makeArcPath(cx, cy, r, currentAngle, currentAngle + sweep));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', seg.count > 0 ? PRIORITY_CONFIG[seg.prio].color : 'var(--color-muted)');
    path.setAttribute('stroke-width', String(sw));
    path.setAttribute('stroke-linecap', 'butt');
    svg.appendChild(path);
    currentAngle += sweep;
  });

  const hole = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  hole.setAttribute('cx', String(cx)); hole.setAttribute('cy', String(cy));
  hole.setAttribute('r', String(innerR + 0.5));
  hole.setAttribute('fill', 'var(--bg-surface)');
  svg.appendChild(hole);

  const holeStroke = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  holeStroke.setAttribute('cx', String(cx)); holeStroke.setAttribute('cy', String(cy));
  holeStroke.setAttribute('r', String(innerR - 0.5));
  holeStroke.setAttribute('fill', 'none');
  holeStroke.setAttribute('stroke', 'var(--border-subtle)');
  holeStroke.setAttribute('stroke-width', '1');
  holeStroke.setAttribute('opacity', '0.5');
  svg.appendChild(holeStroke);

  const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  txt.setAttribute('x', String(cx)); txt.setAttribute('y', String(cy - 7));
  txt.setAttribute('text-anchor', 'middle');
  txt.setAttribute('dominant-baseline', 'central');
  txt.setAttribute('font-size', '24'); txt.setAttribute('font-weight', '800');
  txt.setAttribute('fill', 'var(--text-main)');
  txt.textContent = total;
  svg.appendChild(txt);

  const sub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  sub.setAttribute('x', String(cx)); sub.setAttribute('y', String(cy + 11));
  sub.setAttribute('text-anchor', 'middle');
  sub.setAttribute('dominant-baseline', 'central');
  sub.setAttribute('font-size', '10'); sub.setAttribute('fill', 'var(--text-muted)');
  sub.setAttribute('letter-spacing', '0.06em');
  sub.textContent = 'tasks';
  svg.appendChild(sub);

  if (legend) {
    legend.innerHTML = PRIORITY_ORDER.map(prio => {
      const c = PRIORITY_CONFIG[prio];
      const count = counts[prio];
      return `
        <span class="chart-legend-item">
          <span class="chart-legend-dot" style="background:${c.color}"></span>
          ${c.label} (${count})
        </span>`;
    }).join('');
  }
}

export function renderMemberWorkload(data) {
  const container = document.querySelector('#workload-member-card .member-bar-chart');
  if (!container) return;
  const taskCounts = {};
  Object.values(data.members).forEach(m => { taskCounts[m.name] = 0; });
  Object.values(data.tasks).forEach(t => {
    if (t.assignee && data.members[t.assignee]) {
      taskCounts[data.members[t.assignee].name] = (taskCounts[data.members[t.assignee].name] || 0) + 1;
    }
  });
  const max = Math.max(...Object.values(taskCounts), 1);
  container.innerHTML = '';
  Object.entries(taskCounts).forEach(([name, count]) => {
    const pct = (count / max) * 100;
    const hue = 140 - (count / max) * 120;
    const row = document.createElement('div');
    row.className = 'member-bar-row';
    row.innerHTML = `
      <div class="member-bar-row-top">
        <span class="member-bar-name">${name}</span>
        <span class="member-bar-count">${count} task${count !== 1 ? 's' : ''}</span>
      </div>
      <div class="member-bar-track">
        <div class="member-bar-fill" style="width:${pct}%;background:hsl(${hue},65%,50%)"></div>
      </div>`;
    container.appendChild(row);
  });
}

export function initAnalyticsFilters(data) {
  const statusSelect = document.getElementById('filter-status');
  const prioritySelect = document.getElementById('filter-priority');
  if (!statusSelect || !prioritySelect) return;

  const columns = data.columns;
  columns.forEach(col => {
    const opt = document.createElement('option');
    opt.value = col.id;
    opt.textContent = col.title;
    statusSelect.appendChild(opt);
  });

  const applyFilters = () => {
    const status = statusSelect.value;
    const priority = prioritySelect.value;
    const filtered = { ...data };
    filtered.columns = status === 'all' ? data.columns : data.columns.filter(c => c.id === status);
    if (priority !== 'all') {
      filtered.tasks = Object.fromEntries(
        Object.entries(data.tasks).filter(([, task]) => task.priority === priority)
      );
    }
    renderStatusDistribution(filtered);
    renderPriorityDoughnut(filtered);
    renderMemberWorkload(filtered);
    renderMemberStatsTable(filtered);
  };

  statusSelect.addEventListener('change', applyFilters);
  prioritySelect.addEventListener('change', applyFilters);
}

export function renderMemberStatsTable(data) {
  const tbody = document.getElementById('member-stats-body');
  if (!tbody) return;
  const memberData = {};
  Object.values(data.members).forEach(m => {
    memberData[m.name] = { color: m.color, total: 0, done: 0 };
  });
  Object.values(data.tasks).forEach(t => {
    if (t.assignee && data.members[t.assignee]) {
      const name = data.members[t.assignee].name;
      if (!memberData[name]) memberData[name] = { color: data.members[t.assignee].color, total: 0, done: 0 };
      memberData[name].total++;
      if (t.status === 'done') memberData[name].done++;
    }
  });
  tbody.innerHTML = Object.entries(memberData).map(([name, info]) => {
    const pct = info.total ? Math.round((info.done / info.total) * 100) : 0;
    const initials = getInitials(name);
    const color = info.color || getColorForUser(name);
    return `
      <tr>
        <td>
          <div class="member-stats-name-cell">
            <span class="member-stats-avatar" style="background:${color}">${initials}</span>
            <span class="member-stats-name">${name}</span>
          </div>
        </td>
        <td class="member-stats-tasks-cell">${info.total}</td>
        <td class="member-stats-tasks-cell">${info.done}</td>
        <td>
          <div class="member-stats-progress-cell">
            <div class="member-stats-progress-track">
              <div class="member-stats-progress-fill" style="width:${pct}%;background:${color}"></div>
            </div>
            <span class="member-stats-pct">${pct}%</span>
          </div>
        </td>
      </tr>`;
  }).join('');
}

export function renderRecentActivity(data) {
  const list = document.getElementById('recent-activity-list');
  if (!list) return;
  const recent = data.activityLog
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 6);

  list.innerHTML = recent.map(entry => {
    const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const color = getColorForUser(entry.user);
    const initials = getInitials(entry.user);
    return `
      <div class="recent-activity-item">
        <span class="recent-activity-avatar" style="background:${color}">${initials}</span>
        <span class="recent-activity-text">
          <strong>${entry.user}</strong> ${entry.action}
        </span>
        <span class="recent-activity-time">${time}</span>
      </div>`;
  }).join('');
}
