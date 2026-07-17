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

  const grid = document.createElement('div');
  grid.className = 'team-grid';

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
  const points = series.map((v, i) => {
    const x = 20 + i * (280 / 6);
    const y = 140 - (v / maxVal) * 120;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const poly = svg.querySelector('.line-path');
  if (poly) poly.setAttribute('points', points);
}

export function renderRecentActivity(data) {
  const list = document.getElementById('recent-activity-list');
  if (!list) return;
  const recent = data.activityLog
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  list.innerHTML = recent.map(entry => {
    const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const txt = `${entry.user} ${entry.action}`;
    return `<div class="recent-activity-item"><span>${txt}</span><span class="time">${time}</span></div>`;
  }).join('');
}
