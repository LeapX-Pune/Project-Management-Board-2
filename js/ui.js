// DOM manipulation and UI rendering
import { TEAM_MEMBERS, MOCK_DATA } from './data.js';

/**
 * Shows a custom confirmation dialog modal. Returns a Promise that resolves
 * to true (confirmed) or false (cancelled).
 */
export function showConfirmDialog(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirm-dialog');
    const messageEl = document.getElementById('confirm-dialog-message');
    const okBtn = document.getElementById('confirm-dialog-ok');
    const cancelBtn = document.getElementById('confirm-dialog-cancel');
    const closeBtn = document.getElementById('confirm-dialog-close');

    messageEl.textContent = message;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');

    function okClick() { cleanup(true); }
    function cancelClick() { cleanup(false); }
    function overlayClick(e) { if (e.target === overlay) cleanup(false); }
    function keydown(e) { if (e.key === 'Escape') cleanup(false); }

    function cleanup(result) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      okBtn.removeEventListener('click', okClick);
      cancelBtn.removeEventListener('click', cancelClick);
      closeBtn.removeEventListener('click', cancelClick);
      overlay.removeEventListener('click', overlayClick);
      document.removeEventListener('keydown', keydown);
      resolve(result);
    }

    okBtn.addEventListener('click', okClick);
    cancelBtn.addEventListener('click', cancelClick);
    closeBtn.addEventListener('click', cancelClick);
    overlay.addEventListener('click', overlayClick);
    document.addEventListener('keydown', keydown);
  });
}

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

  // Populate the board header filter select
  const boardFilterAssignee = document.getElementById('board-filter-assignee');
  if (boardFilterAssignee) {
    const currentValue = boardFilterAssignee.value;
    boardFilterAssignee.innerHTML = '<option value="">All Assignees</option>';
    members.forEach(member => {
      const option = document.createElement('option');
      option.value = member.id;
      option.textContent = member.name;
      boardFilterAssignee.appendChild(option);
    });
    if (members.some(m => m.id === currentValue)) {
      boardFilterAssignee.value = currentValue;
    } else {
      boardFilterAssignee.value = '';
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
      <div class="task-subtask-bar-fill" style="transform: scaleX(${progress.pct / 100})"></div>
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
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 4.5H13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M6 4.5V3.25C6 2.836 6.336 2.5 6.75 2.5H9.25C9.664 2.5 10 2.836 10 3.25V4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M12.5 4.5L12 13C12 13.553 11.553 14 11 14H5C4.447 14 4 13.553 4 13L3.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.5 7V11M9.5 7V11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
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
      tr.dataset.taskId = task.id;
      tr.style.cursor = 'pointer';
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
      div.dataset.taskId = task.id;
      div.style.cursor = 'pointer';
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
  const controlsRow = document.createElement('div');
  controlsRow.className = 'team-controls-row';
  controlsRow.style.display = 'flex';
  controlsRow.style.gap = 'var(--space-md)';
  controlsRow.style.marginBottom = 'var(--space-md)';
  controlsRow.style.flexWrap = 'wrap';

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

  const metricsContainer = document.createElement('div');
  metricsContainer.className = 'metrics-grid team-metrics-grid';
  metricsContainer.style.padding = '0';
  metricsContainer.style.marginBottom = 'var(--space-lg)';
  metricsContainer.style.gap = 'var(--space-md)';
  container.appendChild(metricsContainer);

  const grid = document.createElement('div');
  grid.className = 'team-grid';
  container.appendChild(grid);

  function updateFilteredView() {
    const tasks = Object.values(MOCK_DATA.tasks || {});
    members.forEach(m => {
      const assigned = tasks.filter(t => t.assignee === m.id);
      m.tasksInProgress = assigned.filter(t => t.status !== 'done').length;
      m.tasksCompleted = assigned.filter(t => t.status === 'done').length;
    });

    const searchVal = document.getElementById('team-search-input')?.value.toLowerCase().trim() || '';
    const roleVal = document.getElementById('team-role-filter')?.value || '';
    const workloadVal = document.getElementById('team-workload-filter')?.value || '';

    const filtered = members.filter(member => {
      const nameMatch = member.name.toLowerCase().includes(searchVal) || member.role.toLowerCase().includes(searchVal);
      const roleMatch = !roleVal || member.role === roleVal;

      let workload = 'low';
      if (member.tasksInProgress >= 4) workload = 'high';
      else if (member.tasksInProgress >= 2) workload = 'medium';
      const workloadMatch = !workloadVal || workload === workloadVal;

      return nameMatch && roleMatch && workloadMatch;
    });

    const activeCount = filtered.filter(m => m.tasksInProgress > 0).length;
    const highWorkloadCount = filtered.filter(m => m.tasksInProgress >= 3).length;
    const totalTasksCount = filtered.reduce((sum, m) => sum + m.tasksInProgress, 0);

    metricsContainer.innerHTML = `
      <div class="metric-card" data-type="members">
        <div class="metric-label">Filtered Members</div>
        <div class="metric-value">${filtered.length}</div>
        <span class="metric-badge neutral">Registered profiles</span>
      </div>
      <div class="metric-card" data-type="active">
        <div class="metric-label">Active Members</div>
        <div class="metric-value">${activeCount}</div>
        <span class="metric-badge success">Assigned to tasks</span>
      </div>
      <div class="metric-card" data-type="workload">
        <div class="metric-label">High Workload</div>
        <div class="metric-value">${highWorkloadCount}</div>
        <span class="metric-badge danger">Needs attention</span>
      </div>
      <div class="metric-card" data-type="tasks">
        <div class="metric-label">Assigned Tasks</div>
        <div class="metric-value">${totalTasksCount}</div>
        <span class="metric-badge info">Active board tasks</span>
      </div>
    `;

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

      let workloadClass = 'low';
      let workloadText = 'Low Workload';
      if (member.tasksInProgress >= 4) {
        workloadClass = 'high';
        workloadText = 'High Workload';
      } else if (member.tasksInProgress >= 2) {
        workloadClass = 'medium';
        workloadText = 'Moderate Workload';
      }

      const totalTasks = member.tasksCompleted + member.tasksInProgress;
      const pct = totalTasks > 0 ? Math.round((member.tasksCompleted / totalTasks) * 100) : 0;

      card.innerHTML = `
        <div class="team-card-header" style="position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);">
          <div class="team-card-avatar-placeholder"></div>
          <button class="btn-icon team-github-btn" data-member-id="${member.id}" style="position: absolute; top: -6px; right: -6px; border-radius: 50%; border: 1px solid var(--color-border); background: var(--color-surface); width: 28px; height: 28px;" title="${member.githubId ? 'Edit GitHub ID' : 'Add GitHub ID'}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          </button>
        </div>
        <div class="team-card-info" style="width: 100%;">
          <div class="team-card-name">${member.name}</div>
          <div class="team-card-role">${member.role}</div>
          <div style="margin-top: var(--space-sm); display: flex; justify-content: center; gap: var(--space-xs); flex-wrap: wrap;">
            <span class="workload-badge ${workloadClass}">${workloadText}</span>
            ${member.githubId ? `<span class="team-card-github" title="GitHub user: ${member.githubId}">@${member.githubId}</span>` : ''}
          </div>
        </div>
        <div class="team-card-stats" style="width: 100%; border-top: 1px solid var(--color-border); padding-top: var(--space-md); margin-top: auto;">
          <div class="progress-cell" style="flex-direction: column; align-items: stretch; width: 100%; gap: var(--space-xs);">
<div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
                <span class="team-card-stat-value" style="color: var(--color-text-muted);">Assigned Tasks</span>
                <span class="team-card-stat-value" style="font-weight: 600; color: var(--color-text-muted);">${member.tasksCompleted}/${totalTasks} completed</span>
            </div>
            <div class="progress-bar" style="height: 6px; width: 100%; background: var(--color-border);">
              <div class="progress-bar-fill" style="transform: scaleX(${pct / 100}); background: var(--color-accent);"></div>
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

  setTimeout(() => {
    document.getElementById('team-search-input')?.addEventListener('input', updateFilteredView);
    document.getElementById('team-role-filter')?.addEventListener('change', updateFilteredView);
    document.getElementById('team-workload-filter')?.addEventListener('change', updateFilteredView);
  }, 10);

  updateFilteredView();
}

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

export function renderDashboardMetrics(data) {
  const tasks = Object.values(data.tasks);
  const doneCol = data.columns.find(c => c.id === 'col-done');
  const inProgressCols = data.columns.filter(c => c.id === 'col-in-progress' || c.id === 'col-review');
  const doneIds = new Set(doneCol?.taskIds || []);
  const inProgressIds = new Set(inProgressCols.flatMap(c => c.taskIds));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let overdue = 0;
  tasks.forEach(t => {
    if (doneIds.has(t.id)) return;
    if (!t.dueDate) return;
    const due = new Date(t.dueDate + 'T00:00:00');
    if (due < today) overdue++;
  });

  const setValue = (metric, val) => {
    const el = document.querySelector(`.metric-card[data-metric="${metric}"] .metric-value`);
    if (el) el.textContent = val;
  };

  setValue('total', tasks.length);
  setValue('completed', doneIds.size);
  setValue('in-progress', inProgressIds.size);
  setValue('overdue', overdue);
}

export function renderKPICards(data) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const toMidnight = iso => {
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const doneCol = data.columns.find(c => c.id === 'col-done');
  const doneIds = new Set(doneCol ? doneCol.taskIds : []);

  const completedToday = Object.values(data.tasks).filter(t =>
    doneIds.has(t.id) && t.dueDate && toMidnight(t.dueDate).getTime() === today.getTime()
  ).length;

  const completedYesterday = Object.values(data.tasks).filter(t =>
    doneIds.has(t.id) && t.dueDate && toMidnight(t.dueDate).getTime() === yesterday.getTime()
  ).length;

  const dueTomorrow = Object.values(data.tasks).filter(
    t => t.dueDate && toMidnight(t.dueDate).getTime() === tomorrow.getTime()
  ).length;

  const dueToday = Object.values(data.tasks).filter(
    t => t.dueDate && toMidnight(t.dueDate).getTime() === today.getTime()
  ).length;

  animateValue('kpi-today', completedToday);
  animateValue('kpi-tomorrow', dueTomorrow);

  const avgEl = document.getElementById('kpi-avg');
  if (avgEl) {
    const doneCount = doneIds.size;
    avgEl.textContent = doneCount > 0 ? `${doneCount}` : '—';
  }

  updateTrend('kpi-today-trend', completedToday, completedYesterday);
  updateTrend('kpi-tomorrow-trend', dueTomorrow, dueToday, true);
}

function animateValue(elementId, newValue) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  const current = parseInt(el.textContent) || 0;
  if (current === newValue) return;
  
  const duration = 500;
  const start = performance.now();
  
  function update(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(current + (newValue - current) * eased);
    el.textContent = value;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

function updateTrend(elementId, current, previous, invertColors = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  let trendClass = 'kpi-trend--neutral';
  let arrow = '';
  
  if (current > previous) {
    trendClass = invertColors ? 'kpi-trend--warning' : 'kpi-trend--up';
    arrow = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 8L6 4L10 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  } else if (current < previous) {
    trendClass = invertColors ? 'kpi-trend--up' : 'kpi-trend--down';
    arrow = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  } else {
    arrow = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  }
  
  el.className = `kpi-trend ${trendClass}`;
  el.innerHTML = arrow;
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
        <div class="member-bar-fill" style="transform: scaleX(${pct / 100});background:hsl(${hue},65%,50%)"></div>
      </div>`;
    container.appendChild(row);
  });
}

export function initAnalyticsFilters(data) {
  const statusSelect = document.getElementById('filter-status');
  const prioritySelect = document.getElementById('filter-priority');
  if (!statusSelect || !prioritySelect) return;

  const prevStatus = statusSelect.value;
  const prevPriority = prioritySelect.value;

  Array.from(statusSelect.options).forEach(opt => {
    if (opt.value !== 'all') opt.remove();
  });

  data.columns.forEach(col => {
    const opt = document.createElement('option');
    opt.value = col.id;
    opt.textContent = col.title;
    statusSelect.appendChild(opt);
  });

  if (prevStatus && [...statusSelect.options].some(o => o.value === prevStatus)) {
    statusSelect.value = prevStatus;
  }
  if (prevPriority) prioritySelect.value = prevPriority;

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

  applyFilters();
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
              <div class="member-stats-progress-fill" style="transform: scaleX(${pct / 100});background:${color}"></div>
            </div>
            <span class="member-stats-pct">${pct}%</span>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getRelativeTime(dateStr) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getTypeIcon(type) {
  const icons = {
    created: '<svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    moved: '<svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M4 4h8v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    edited: '<svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5a1.414 1.414 0 112 2L5 13l-3 1 1-3 8.5-8.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  return icons[type] || icons.created;
}

export function renderRecentActivity(data) {
  const list = document.getElementById('recent-activity-list');
  if (!list) return;
  const recent = data.activityLog
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 6);

  list.innerHTML = recent.map(entry => {
    const color = getColorForUser(entry.user);
    const initials = getInitials(entry.user);
    return `
      <div class="recent-activity-item">
        <span class="recent-activity-dot" style="background:${color}"></span>
        <div class="recent-activity-avatar-wrap">
          <span class="recent-activity-avatar" style="background:${color}">${initials}</span>
          <span class="recent-activity-type-icon">${getTypeIcon(entry.type)}</span>
        </div>
        <div class="recent-activity-body">
          <span class="recent-activity-text"><strong>${escapeHtml(entry.user)}</strong> ${escapeHtml(entry.action)}</span>
          <span class="recent-activity-area">${escapeHtml(entry.area || 'Board')}</span>
        </div>
        <span class="recent-activity-time">${getRelativeTime(entry.timestamp)}</span>
      </div>`;
  }).join('');
}
