// DOM manipulation and UI rendering
import { TEAM_MEMBERS } from './data.js';

/**
 * Creates and returns an Avatar DOM element.
 */
export function createAvatar(member, options = {}) {
  const size = options.size || 'sm';
  
  const avatar = document.createElement('div');
  avatar.className = `avatar avatar--${size}`;
  avatar.setAttribute('title', member.name || 'Unassigned');
  avatar.setAttribute('data-member-id', member.id || '');
  
  // Compute Initials
  const nameParts = (member.name || 'Unassigned').trim().split(/\s+/);
  let initials = '';
  if (nameParts.length > 0 && nameParts[0]) {
    initials += nameParts[0].charAt(0).toUpperCase();
    if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
      initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }
  } else {
    initials = '?';
  }
  
  // Render image or initials fallback
  if (member.avatarUrl) {
    const img = document.createElement('img');
    img.src = member.avatarUrl;
    img.alt = member.name || 'Unassigned';
    img.onerror = function() {
      img.remove();
      avatar.textContent = initials;
      avatar.style.backgroundColor = member.color || member.bgColor || '#71717A';
    };
    avatar.appendChild(img);
  } else {
    avatar.textContent = initials;
    avatar.style.backgroundColor = member.color || member.bgColor || '#71717A';
  }
  
  return avatar;
}

/**
 * Creates an avatar group display list.
 */
export function createAvatarGroup(members, options = {}) {
  const size = options.size || 'sm';
  const max = options.max || 4;
  
  const groupContainer = document.createElement('div');
  groupContainer.className = 'avatar-group';
  
  const displayCount = Math.min(members.length, max);
  const extraCount = members.length - max;
  
  if (extraCount > 0) {
    const counter = document.createElement('div');
    counter.className = `avatar-counter avatar-counter--${size}`;
    counter.textContent = `+${extraCount}`;
    counter.setAttribute('title', `${extraCount} more member(s)`);
    groupContainer.appendChild(counter);
  }
  
  // Add avatars in reverse order for correct flex row-reverse overlap
  for (let i = displayCount - 1; i >= 0; i--) {
    const avatarEl = createAvatar(members[i], { size });
    groupContainer.appendChild(avatarEl);
  }
  
  return groupContainer;
}

/**
 * Renders the list of team members in the management modal pane.
 */
export function renderMemberList(containerId, members, activeEditId = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (members.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'flex-center';
    emptyState.style.flexDirection = 'column';
    emptyState.style.padding = 'var(--space-xl) var(--space-md)';
    emptyState.style.color = 'var(--color-text-muted)';
    emptyState.style.fontSize = '0.9rem';
    emptyState.style.textAlign = 'center';
    emptyState.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="margin-bottom: var(--space-sm); color: var(--color-text-muted);">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p>No team members yet. Create one on the right.</p>
    `;
    container.appendChild(emptyState);
    return;
  }
  
  members.forEach(member => {
    const item = document.createElement('div');
    item.className = 'member-item';
    if (activeEditId === member.id) {
      item.className += ' member-item--selected';
    }
    item.setAttribute('data-member-id', member.id);
    
    const info = document.createElement('div');
    info.className = 'member-item__info';
    
    const avatarEl = createAvatar(member, { size: 'sm' });
    
    const details = document.createElement('div');
    details.className = 'member-item__details';
    
    const name = document.createElement('span');
    name.className = 'member-item__name';
    name.textContent = member.name;
    
    const email = document.createElement('span');
    email.className = 'member-item__email';
    email.textContent = member.email;
    
    details.appendChild(name);
    details.appendChild(email);
    
    info.appendChild(avatarEl);
    info.appendChild(details);
    
    const actions = document.createElement('div');
    actions.className = 'member-item__actions';
    
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-icon';
    editBtn.setAttribute('data-action', 'edit');
    editBtn.setAttribute('aria-label', `Edit ${member.name}`);
    editBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    `;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-icon btn-icon--danger';
    deleteBtn.setAttribute('data-action', 'delete');
    deleteBtn.setAttribute('aria-label', `Delete ${member.name}`);
    deleteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    `;
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    item.appendChild(info);
    item.appendChild(actions);
    
    container.appendChild(item);
  });
}

/**
 * Renders the list of active team avatars in the header layout.
 */
export function renderHeaderTeamList(containerId, members) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  if (members.length === 0) return;
  
  const avatarGroup = createAvatarGroup(members, { size: 'sm', max: 5 });
  container.appendChild(avatarGroup);
}

/**
 * Shows an assignment dropdown positioned relative to the target element.
 */
export function showAssignDropdown(triggerEl, assignedIds = [], onAssignChange) {
  closeDropdown();
  
  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown';
  dropdown.id = 'assign-dropdown';
  
  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'dropdown-search-wrapper';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'dropdown-search';
  searchInput.placeholder = 'Search members...';
  searchWrapper.appendChild(searchInput);
  dropdown.appendChild(searchWrapper);
  
  const list = document.createElement('div');
  list.className = 'dropdown-list';
  
  if (TEAM_MEMBERS.length === 0) {
    const noMembers = document.createElement('div');
    noMembers.className = 'dropdown-item';
    noMembers.style.color = 'var(--color-text-muted)';
    noMembers.style.cursor = 'default';
    noMembers.textContent = 'No members. Click "Team" in sidebar to manage.';
    list.appendChild(noMembers);
  } else {
    TEAM_MEMBERS.forEach(member => {
      const isSelected = assignedIds.includes(member.id);
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      if (isSelected) {
        item.className += ' dropdown-item--selected';
      }
      item.setAttribute('data-member-id', member.id);
      
      const avatar = createAvatar(member, { size: 'xs' });
      
      const name = document.createElement('span');
      name.style.marginLeft = 'var(--space-xs)';
      name.textContent = member.name;
      
      const check = document.createElement('span');
      check.className = 'dropdown-item__check';
      check.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      `;
      
      item.appendChild(avatar);
      item.appendChild(name);
      item.appendChild(check);
      
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const selected = item.classList.toggle('dropdown-item--selected');
        if (onAssignChange) {
          onAssignChange(member.id, selected);
        }
      });
      
      list.appendChild(item);
    });
  }
  
  dropdown.appendChild(list);
  document.body.appendChild(dropdown);
  
  const rect = triggerEl.getBoundingClientRect();
  dropdown.style.position = 'fixed';
  dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
  
  let dropdownLeft = rect.left + window.scrollX;
  const dropdownWidth = 240;
  if (rect.left + dropdownWidth > window.innerWidth) {
    dropdownLeft = rect.right + window.scrollX - dropdownWidth;
  }
  dropdown.style.left = `${dropdownLeft}px`;
  
  requestAnimationFrame(() => {
    dropdown.classList.add('active');
  });
  
  setTimeout(() => searchInput.focus(), 50);
  
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    const items = list.querySelectorAll('.dropdown-item[data-member-id]');
    items.forEach(item => {
      const nameEl = item.querySelector('span:not(.dropdown-item__check)');
      if (nameEl && nameEl.textContent.toLowerCase().includes(query)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });
  
  function handleOutsideClick(e) {
    if (!dropdown.contains(e.target) && !triggerEl.contains(e.target)) {
      closeDropdown();
    }
  }
  
  function handleScroll() {
    closeDropdown();
  }
  
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      closeDropdown();
      triggerEl.focus();
    }
  }
  
  setTimeout(() => {
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    
    dropdown._cleanup = function() {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, 100);
}

/**
 * Closes the active assignment dropdown and cleans up listeners.
 */
export function closeDropdown() {
  const activeDropdown = document.getElementById('assign-dropdown');
  if (activeDropdown) {
    if (activeDropdown._cleanup) {
      activeDropdown._cleanup();
    }
    activeDropdown.remove();
  }
}

/**
 * Dynamically populates standard assignee select menus.
 */
export function populateAssigneeSelects(members) {
  // Populate the task addition select modal dropdown
  const taskAssigneeSelect = document.getElementById('task-assignee');
  if (taskAssigneeSelect) {
    const currentValue = taskAssigneeSelect.value;
    taskAssigneeSelect.innerHTML = '<option value="">Unassigned</option>';
    members.forEach(member => {
      const option = document.createElement('option');
      option.value = member.id;
      option.textContent = member.name;
      taskAssigneeSelect.appendChild(option);
    });
    if (members.some(m => m.id === currentValue)) {
      taskAssigneeSelect.value = currentValue;
    } else {
      taskAssigneeSelect.value = '';
    }
  }

  // Populate side peek assignee selects
  const peekSelects = document.querySelectorAll('#side-peek select');
  let peekAssigneeSelect = null;
  peekSelects.forEach(sel => {
    const label = sel.previousElementSibling;
    if (label && label.textContent.toLowerCase() === 'assignee') {
      peekAssigneeSelect = sel;
    }
  });

  if (peekAssigneeSelect) {
    const currentValue = peekAssigneeSelect.value;
    peekAssigneeSelect.innerHTML = '<option value="">Unassigned</option>';
    members.forEach(member => {
      const option = document.createElement('option');
      option.value = member.id;
      option.textContent = member.name;
      peekAssigneeSelect.appendChild(option);
    });
    if (members.some(m => m.id === currentValue)) {
      peekAssigneeSelect.value = currentValue;
    } else {
      peekAssigneeSelect.value = '';
    }
  }
}

// Develop base helper functions
export function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function getPriorityClass(priority) {
  return priority === 'high' ? 'high' : priority === 'medium' ? 'medium' : 'low';
}

export function getDueDateClass(dueDate) {
  if (!dueDate) return '';
  const now = new Date();
  const due = new Date(dueDate + 'T23:59:59');
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 2) return 'approaching';
  return 'far';
}

export function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getSubtaskProgress(subtasks) {
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

export function createTaskCard(task, members) {
  const li = document.createElement('li');
  li.className = 'task-card';
  li.draggable = true;
  li.dataset.taskId = task.id;

  const member = TEAM_MEMBERS.find(m => m.id === task.assignee);
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
      <div class="task-avatar-placeholder"></div>
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

  // Render initials or image avatar and swap placeholder
  const avatarPlaceholder = li.querySelector('.task-avatar-placeholder');
  if (avatarPlaceholder) {
    const memberObj = member ? member : { id: '', name: 'Unassigned', color: '#71717A' };
    const avatarEl = createAvatar(memberObj, { size: 'xs' });
    avatarEl.className = 'task-avatar';
    avatarPlaceholder.replaceWith(avatarEl);
  }

  return li;
}

export function createColumn(col, tasks, members) {
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
  if (!container) return;
  container.innerHTML = '';

  data.columns.forEach(col => {
    container.appendChild(createColumn(col, data.tasks, data.members));
  });

  container.appendChild(createAddColumnPlaceholder());
}

export function renderActivity(entries) {
  const list = document.getElementById('activity-list');
  if (!list) return;
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
  if (!tbody) return;
  tbody.innerHTML = '';

  data.columns.forEach(col => {
    col.taskIds.forEach(id => {
      const task = data.tasks[id];
      if (!task) return;
      const member = TEAM_MEMBERS.find(m => m.id === task.assignee);
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
  if (!container) return;
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
  if (!container) return;
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'team-header flex-between';
  header.innerHTML = `
    <h2>Team Members</h2>
    <button id="manage-team-btn" class="btn btn-ghost flex-center">
      <span>Manage Team</span>
    </button>
  `;
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
      <div class="team-card-avatar-placeholder"></div>
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

    const avatarPlaceholder = card.querySelector('.team-card-avatar-placeholder');
    if (avatarPlaceholder) {
      const avatarEl = createAvatar(member, { size: 'md' });
      avatarEl.className = 'team-card-avatar';
      avatarPlaceholder.replaceWith(avatarEl);
    }

    grid.appendChild(card);
  });

  container.appendChild(grid);
}
