// DOM manipulation and UI rendering
import { TEAM_MEMBERS, MOCK_DATA } from './data.js';

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
      item.setAttribute('tabindex', '0'); // Enable focus on each dropdown option
      
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

      // Item keyboard navigation listener
      item.addEventListener('keydown', (e) => {
        const items = Array.from(list.querySelectorAll('.dropdown-item')).filter(el => el.style.display !== 'none');
        const currentIndex = items.indexOf(item);
        
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[(currentIndex + 1) % items.length].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          items[(currentIndex - 1 + items.length) % items.length].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
      
      list.appendChild(item);
    });

    // Keyboard navigation helper on search field
    searchInput.addEventListener('keydown', (e) => {
      const items = Array.from(list.querySelectorAll('.dropdown-item')).filter(el => el.style.display !== 'none');
      if (items.length === 0) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[items.length - 1].focus();
      }
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

export function getMemberMetrics(memberId, tasks = MOCK_DATA.tasks) {
  const memberTasks = Object.values(tasks || {}).filter(t => t.assignee === memberId);
  const completedTasks = memberTasks.filter(t => t.status === 'col-done');
  const inProgressTasks = memberTasks.filter(t => t.status === 'col-in-progress');
  const reviewTasks = memberTasks.filter(t => t.status === 'col-review');
  const todoTasks = memberTasks.filter(t => t.status === 'col-todo');
  const backlogTasks = memberTasks.filter(t => t.status === 'col-backlog');
  
  const activeTasks = memberTasks.filter(t => t.status !== 'col-done');

  const now = new Date();
  const overdueTasks = activeTasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate + 'T23:59:59');
    return due < now;
  });

  const highPriorityTasks = memberTasks.filter(t => t.priority === 'high');

  const totalTasks = memberTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return {
    total: totalTasks,
    completed: completedTasks.length,
    inProgress: inProgressTasks.length,
    review: reviewTasks.length,
    todo: todoTasks.length,
    backlog: backlogTasks.length,
    active: activeTasks.length,
    overdue: overdueTasks.length,
    highPriority: highPriorityTasks.length,
    completionPercentage
  };
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

  const sortedEntries = [...entries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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

  sortedEntries.forEach((entry, idx) => {
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
        <span class="activity-entry-area activity-entry-area--${entry.type}">${entry.area || 'Board'}</span>
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
    'Sai Shendge': '#7C3AED',
    'Aditya Vawhal': '#3B82F6',
    'Ankit Bhalke': '#10B981',
    'Devansh Mittal': '#EC4899',
    'Khushi Shah': '#F59E0B',
    'Kshitij Das': '#06B6D4',
    'Mohammed Rehan': '#ef4444',
    'Pulak Saha': '#0f766e',
    'Sankalp Tiwari': '#4F46E5',
    'Sauryaman Bisen': '#8B5CF6',
    'Sumit Tiwari': '#F97316',
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
  
  // Clear container
  container.innerHTML = '';

  // 1. Header
  const header = document.createElement('div');
  header.className = 'team-header flex-between';
  header.innerHTML = `
    <h2>Team Members</h2>
    <button id="manage-team-btn" class="btn btn-ghost flex-center">
      <span>Manage Team</span>
    </button>
  `;
  container.appendChild(header);

  // 2. Controls & Filters Row
  const controlsRow = document.createElement('div');
  controlsRow.className = 'team-controls-row';
  controlsRow.style.display = 'flex';
  controlsRow.style.gap = 'var(--space-md)';
  controlsRow.style.marginBottom = 'var(--space-md)';
  controlsRow.style.flexWrap = 'wrap';

  // Get unique roles from members
  const roles = Array.from(new Set(members.map(m => m.role).filter(Boolean)));
  let roleOptions = '<option value="">All Roles</option>';
  roles.forEach(role => {
    roleOptions += `<option value="${role}">${role}</option>`;
  });

  controlsRow.innerHTML = `
    <div class="search-bar" style="flex: 1; min-width: 240px; margin-bottom: 0;">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M12 12L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <input type="text" class="search-input" id="team-search-input" placeholder="Search team by name or role..." aria-label="Search team">
    </div>
    <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
      <select id="team-role-filter" class="peek-select" style="min-width: 160px; height: 36px; padding: 0 var(--space-sm); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-surface);">
        ${roleOptions}
      </select>
      <select id="team-workload-filter" class="peek-select" style="min-width: 160px; height: 36px; padding: 0 var(--space-sm); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-surface);">
        <option value="">All Workloads</option>
        <option value="low">Low (0-1 task)</option>
        <option value="medium">Medium (2-3 tasks)</option>
        <option value="high">High (4+ tasks)</option>
      </select>
    </div>
  `;
  container.appendChild(controlsRow);

  // 3. Metrics Grid Row Container
  const metricsContainer = document.createElement('div');
  metricsContainer.className = 'metrics-grid team-metrics-grid';
  metricsContainer.style.padding = '0';
  metricsContainer.style.marginBottom = 'var(--space-lg)';
  metricsContainer.style.display = 'grid';
  metricsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
  metricsContainer.style.gap = 'var(--space-md)';
  container.appendChild(metricsContainer);

  // 4. Team Cards Grid Container
  const grid = document.createElement('div');
  grid.className = 'team-grid';
  container.appendChild(grid);

  // Function to filter members and render active components
  function updateFilteredView() {
    const searchVal = document.getElementById('team-search-input')?.value.toLowerCase().trim() || '';
    const roleVal = document.getElementById('team-role-filter')?.value || '';
    const workloadVal = document.getElementById('team-workload-filter')?.value || '';

    // Filter list
    const filtered = members.filter(member => {
      const nameMatch = member.name.toLowerCase().includes(searchVal) || member.role.toLowerCase().includes(searchVal);
      const roleMatch = !roleVal || member.role === roleVal;
      
      const mMetrics = getMemberMetrics(member.id, MOCK_DATA.tasks);
      let workload = 'low';
      if (mMetrics.active >= 4) workload = 'high';
      else if (mMetrics.active >= 2) workload = 'medium';
      const workloadMatch = !workloadVal || workload === workloadVal;

      return nameMatch && roleMatch && workloadMatch;
    });

    // Render Metrics based on filtered list!
    const activeCount = filtered.filter(m => getMemberMetrics(m.id, MOCK_DATA.tasks).active > 0).length;
    const highWorkloadCount = filtered.filter(m => getMemberMetrics(m.id, MOCK_DATA.tasks).active >= 3).length;
    const totalTasksCount = filtered.reduce((sum, m) => sum + getMemberMetrics(m.id, MOCK_DATA.tasks).active, 0);

    metricsContainer.innerHTML = `
      <div class="metric-card" style="min-height: 100px;">
        <div class="metric-label">Filtered Members</div>
        <div class="metric-value">${filtered.length}</div>
        <span class="metric-badge neutral">Registered profiles</span>
      </div>
      <div class="metric-card" style="min-height: 100px;">
        <div class="metric-label">Active Members</div>
        <div class="metric-value">${activeCount}</div>
        <span class="metric-badge success">Assigned to tasks</span>
      </div>
      <div class="metric-card" style="min-height: 100px;">
        <div class="metric-label">High Workload</div>
        <div class="metric-value">${highWorkloadCount}</div>
        <span class="metric-badge danger">Needs attention</span>
      </div>
      <div class="metric-card" style="min-height: 100px;">
        <div class="metric-label">Assigned Tasks</div>
        <div class="metric-value">${totalTasksCount}</div>
        <span class="metric-badge info">Active board tasks</span>
      </div>
    `;

    // Render Team Cards Grid
    grid.innerHTML = '';

    if (filtered.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'flex-center';
      emptyState.style.gridColumn = '1 / -1';
      emptyState.style.flexDirection = 'column';
      emptyState.style.padding = 'var(--space-xl) var(--space-md)';
      emptyState.style.color = 'var(--color-text-muted)';
      emptyState.style.textAlign = 'center';
      emptyState.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="margin-bottom: var(--space-sm); color: var(--color-text-subtle);">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <h3>No matching team members found</h3>
        <p style="font-size: 0.85rem; margin-top: 4px;">Adjust your keywords or select another filter.</p>
      `;
      grid.appendChild(emptyState);
      return;
    }

    filtered.forEach((member, idx) => {
      const card = document.createElement('div');
      card.className = 'team-card';
      card.style.animationDelay = `${idx * 0.03}s`;
      card.dataset.memberId = member.id;

      // Workload assessment
      const mMetrics = getMemberMetrics(member.id, MOCK_DATA.tasks);
      let workloadClass = 'low';
      let workloadText = 'Low Workload';
      if (mMetrics.active >= 4) {
        workloadClass = 'high';
        workloadText = 'High Workload';
      } else if (mMetrics.active >= 2) {
        workloadClass = 'medium';
        workloadText = 'Moderate Workload';
      }

      const totalTasks = mMetrics.total;
      const pct = mMetrics.completionPercentage;

      card.innerHTML = `
        <div class="team-card-header" style="position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);">
          <div class="team-card-avatar-placeholder"></div>
          <button class="btn-icon team-github-btn" data-member-id="${member.id}" style="position: absolute; top: -6px; right: -6px; border-radius: 50%; border: 1px solid var(--color-border); background: var(--color-surface); width: 28px; height: 28px;" title="${member.githubId ? 'Edit GitHub ID' : 'Link GitHub'}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          </button>
        </div>
        <div class="team-card-info" style="width: 100%;">
          <div class="team-card-name">${member.name}</div>
          <div class="team-card-role">${member.role}</div>
          <div style="margin-top: var(--space-sm); display: flex; justify-content: center; gap: var(--space-xs); flex-wrap: wrap;">
            <span class="workload-badge ${workloadClass}">${workloadText}</span>
            ${member.githubId ? `<span class="workload-badge low" style="background: var(--color-accent-soft); color: var(--color-accent);" title="GitHub user: ${member.githubId}">@${member.githubId}</span>` : ''}
          </div>
        </div>
        <div class="team-card-stats" style="width: 100%; border-top: 1px solid var(--color-border); padding-top: var(--space-md); margin-top: auto;">
          <div class="progress-cell" style="flex-direction: column; align-items: stretch; width: 100%; gap: var(--space-xs);">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
              <span style="color: var(--color-text-muted);">Assigned Tasks</span>
              <span style="font-weight: 600; color: var(--color-text-muted);">${mMetrics.completed}/${totalTasks} completed</span>
            </div>
            <div class="progress-bar" style="height: 6px; width: 100%; background: var(--color-border);">
              <div class="progress-bar-fill" style="width: ${pct}%; background: var(--color-accent);"></div>
            </div>
          </div>
        </div>
      `;

      const avatarPlaceholder = card.querySelector('.team-card-avatar-placeholder');
      if (avatarPlaceholder) {
        const avatarEl = createAvatar(member, { size: 'lg' });
        avatarEl.className = 'team-card-avatar';
        avatarEl.setAttribute('tabindex', '0');
        avatarPlaceholder.replaceWith(avatarEl);
      }

      grid.appendChild(card);
    });
  }

  // Bind controls listeners
  setTimeout(() => {
    document.getElementById('team-search-input')?.addEventListener('input', updateFilteredView);
    document.getElementById('team-role-filter')?.addEventListener('change', updateFilteredView);
    document.getElementById('team-workload-filter')?.addEventListener('change', updateFilteredView);
  }, 10);

  // Initial render
  updateFilteredView();
}

export function updateDashboardMetrics() {
  const totalTasksEl = document.getElementById('db-total-tasks');
  const completedTasksEl = document.getElementById('db-completed-tasks');
  const inProgressTasksEl = document.getElementById('db-inprogress-tasks');
  const overdueTasksEl = document.getElementById('db-overdue-tasks');

  if (!totalTasksEl) return;

  const tasksList = Object.values(MOCK_DATA.tasks || {});
  
  // 1. Total tasks
  const totalTasks = tasksList.length;
  totalTasksEl.textContent = totalTasks;

  // 2. Completed tasks
  const completedTasks = tasksList.filter(t => t.status === 'col-done').length;
  completedTasksEl.textContent = completedTasks;

  // 3. In progress tasks
  const inProgressTasks = tasksList.filter(t => t.status === 'col-in-progress').length;
  inProgressTasksEl.textContent = inProgressTasks;

  // 4. Overdue tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = tasksList.filter(t => t.status !== 'col-done' && t.dueDate && (new Date(t.dueDate) < today)).length;
  overdueTasksEl.textContent = overdueTasks;

  // 5. Update Active Team Members list
  const memberListEl = document.getElementById('db-member-list');
  if (memberListEl) {
    memberListEl.innerHTML = '';
    const sortedMembers = [...TEAM_MEMBERS].map(m => {
      const metrics = getMemberMetrics(m.id, MOCK_DATA.tasks);
      return { ...m, activeTasksCount: metrics.active };
    }).sort((a, b) => b.activeTasksCount - a.activeTasksCount);

    sortedMembers.slice(0, 4).forEach(m => {
      const div = document.createElement('div');
      div.className = 'dashboard-member-item';
      
      const avatarEl = createAvatar(m, { size: 'xs' });
      avatarEl.className = 'task-avatar';

      const infoDiv = document.createElement('div');
      infoDiv.style.flex = '1';
      infoDiv.style.minWidth = '0';
      infoDiv.innerHTML = `
        <div style="font-size:0.875rem;font-weight:600;color:var(--color-text)">${m.name}</div>
        <div class="member-status ${m.activeTasksCount > 0 ? 'active' : 'idle'}">
          ${m.activeTasksCount > 0 ? `Active on ${m.activeTasksCount} task${m.activeTasksCount > 1 ? 's' : ''}` : 'Idle'}
        </div>
      `;

      div.appendChild(avatarEl);
      div.appendChild(infoDiv);
      memberListEl.appendChild(div);
    });
  }

  // 6. Update Workload by Member chart
  const workloadChartEl = document.getElementById('db-workload-chart');
  if (workloadChartEl) {
    workloadChartEl.innerHTML = '';
    const activeMembers = TEAM_MEMBERS.map(m => {
      const metrics = getMemberMetrics(m.id, MOCK_DATA.tasks);
      return { ...m, activeTasksCount: metrics.active };
    }).filter(m => m.activeTasksCount > 0).sort((a, b) => b.activeTasksCount - a.activeTasksCount);

    if (activeMembers.length === 0) {
      workloadChartEl.innerHTML = '<p style="color:var(--color-text-muted);font-size:0.85rem;padding:var(--space-sm) 0;text-align:center;">No members assigned to active tasks.</p>';
    } else {
      const maxActive = Math.max(...activeMembers.map(m => m.activeTasksCount), 1);
      
      activeMembers.slice(0, 4).forEach(m => {
        const pct = Math.round((m.activeTasksCount / maxActive) * 100);
        const div = document.createElement('div');
        div.innerHTML = `
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.8125rem">
            <span style="font-weight:500;color:var(--color-text)">${m.name}</span>
            <span style="color:var(--color-text-muted)">${m.activeTasksCount} task${m.activeTasksCount > 1 ? 's' : ''}</span>
          </div>
          <div style="height:8px;background:var(--color-muted);border-radius:999px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${m.color || '#4F46E5'};border-radius:999px"></div>
          </div>
        `;
        workloadChartEl.appendChild(div);
      });
    }
  }

  // 7. Update Member Stats Table
  const statsTbodyEl = document.getElementById('db-stats-tbody');
  if (statsTbodyEl) {
    statsTbodyEl.innerHTML = '';
    const sortedStats = TEAM_MEMBERS.map(m => {
      const metrics = getMemberMetrics(m.id, MOCK_DATA.tasks);
      return { ...m, metrics };
    }).sort((a, b) => b.metrics.completed - a.metrics.completed || b.metrics.completionPercentage - a.metrics.completionPercentage);

    sortedStats.slice(0, 4).forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${m.name}</strong></td>
        <td>${m.metrics.completed}</td>
        <td>${m.metrics.inProgress}</td>
        <td>
          <div class="progress-cell">
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width:${m.metrics.completionPercentage}%;background:${m.color || 'var(--color-accent)'}"></div>
            </div>
            ${m.metrics.completionPercentage}%
          </div>
        </td>
      `;
      statsTbodyEl.appendChild(tr);
    });
  }
}

