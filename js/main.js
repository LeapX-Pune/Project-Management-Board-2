import { MOCK_DATA, TEAM_MEMBERS, addMember, updateMember, deleteMember, getMemberById, saveMockData, saveTeamMembers, addActivityLogEntry, createTask } from './data.js';
import {
  renderBoard,
  renderActivity,
  renderTable,
  renderList,
  renderTeam,
  getInitials,
  formatTimestamp,
  getSubtaskProgress,
  renderQuickStats,
  renderByDate,
  renderWeeklyLineGraph,
  renderRecentActivity,
  renderKPICards,
  renderStatusDistribution,
  renderPriorityDoughnut,
  renderMemberWorkload,
  renderMemberStatsTable,
  initAnalyticsFilters,
  createAvatar,
  createAvatarGroup,
  renderMemberList,
  renderHeaderTeamList,
  showAssignDropdown,
  closeDropdown,
  populateAssigneeSelects
} from './ui.js';
import { initDragDrop } from './dragdrop.js';
import { initCalendar, refreshCalendar } from './calendar.js';

// Modal elements cache
let memberModal, idInput, nameInput, emailInput, roleInput, avatarInput;
let formTitle, cancelEditBtn, submitBtn;
let nameError, emailError, avatarError;

let originalSidePeekBodyHTML = '';

export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('active');
  });

  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

function openMemberProfileDrawer(member) {
  const sidePeek = document.getElementById('side-peek');
  const peekBody = sidePeek?.querySelector('.side-peek-body');
  if (!sidePeek || !peekBody) return;

  // Set accessibility label
  sidePeek.setAttribute('aria-label', `Member Profile: ${member.name}`);

  // Calculate statistics
  const totalTasks = member.tasksCompleted + member.tasksInProgress;
  const pct = totalTasks > 0 ? Math.round((member.tasksCompleted / totalTasks) * 100) : 0;

  // Get assigned tasks list
  const memberTasks = Object.values(MOCK_DATA.tasks).filter(t => t.assignee === member.id);
  let tasksHtml = '';
  if (memberTasks.length === 0) {
    tasksHtml = '<p style="color: var(--color-text-muted); font-size: 0.85rem; padding: var(--space-sm) 0;">No tasks assigned currently.</p>';
  } else {
    memberTasks.forEach(task => {
      const priorityClass = task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'medium' : 'low';
      tasksHtml += `
        <div class="list-item" style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-sm); background: var(--color-surface); margin-bottom: var(--space-sm); cursor: pointer;" data-task-link-id="${task.id}">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 600; color: var(--color-text);">${task.title}</span>
            <span class="task-priority ${priorityClass}" style="font-size: 0.7rem; padding: 2px 6px;">${task.priority}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px;">
            <span>Due: ${task.dueDate || 'No Date'}</span>
            <span>Status: ${task.status}</span>
          </div>
        </div>
      `;
    });
  }

  // Get member activity logs
  const memberActivity = (MOCK_DATA.activityLog || []).filter(entry => 
    entry.user.toLowerCase().includes(member.name.toLowerCase()) || 
    (member.githubId && entry.user.toLowerCase().includes(member.githubId.toLowerCase()))
  );
  
  let activityHtml = '';
  if (memberActivity.length === 0) {
    activityHtml = '<p style="color: var(--color-text-muted); font-size: 0.85rem; padding: var(--space-sm) 0;">No recent activity logs.</p>';
  } else {
    memberActivity.slice(0, 5).forEach(entry => {
      const timeStr = formatTimestamp(entry.timestamp);
      activityHtml += `
        <div style="font-size: 0.8125rem; padding: var(--space-sm) 0; border-bottom: 1px dashed var(--color-border); color: var(--color-text-muted);">
          <span style="font-weight: 500; color: var(--color-text);">${entry.action}</span> in <span class="activity-entry-area activity-entry-area--${entry.type}" style="font-size: 0.75rem; padding: 1px 4px; border-radius: 4px;">${entry.area}</span>
          <div style="font-size: 0.7rem; color: var(--color-text-subtle); margin-top: 2px;">${timeStr}</div>
        </div>
      `;
    });
  }

  // Build the details content
  peekBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-lg); padding-bottom: var(--space-xl);">
      <div style="display: flex; align-items: center; gap: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-md);">
        <div id="drawer-avatar-placeholder"></div>
        <div style="min-width: 0;">
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--color-text); line-height: 1.2;">${member.name}</h2>
          <p style="font-size: 0.875rem; color: var(--color-text-muted);">${member.role}</p>
          <p style="font-size: 0.75rem; color: var(--color-text-subtle); margin-top: 2px; word-break: break-all;">${member.email}</p>
        </div>
      </div>

      <div>
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--color-text); margin-bottom: var(--space-sm);">Workload Summary</h3>
        <div class="progress-cell" style="flex-direction: column; align-items: stretch; gap: var(--space-xs);">
          <div style="display: flex; justify-content: space-between; font-size: 0.8125rem;">
            <span>Completed Tasks</span>
            <span style="font-weight: 600;">${member.tasksCompleted}/${totalTasks} tasks (${pct}%)</span>
          </div>
          <div class="progress-bar" style="height: 8px; background: var(--color-border);">
            <div class="progress-bar-fill" style="width: ${pct}%; background: var(--color-accent);"></div>
          </div>
        </div>
      </div>

      <div>
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--color-text); margin-bottom: var(--space-sm);">Assigned Tasks</h3>
        <div class="drawer-tasks-list" style="max-height: 220px; overflow-y: auto;">
          ${tasksHtml}
        </div>
      </div>

      <div>
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--color-text); margin-bottom: var(--space-sm);">Recent Activity</h3>
        <div class="drawer-activity-list" style="max-height: 200px; overflow-y: auto;">
          ${activityHtml}
        </div>
      </div>

      <div style="margin-top: var(--space-md);">
        <button class="btn btn-ghost" id="peek-drawer-close" style="width: 100%;">Close Profile</button>
      </div>
    </div>
  `;

  // Render Avatar
  const avatarPlaceholder = document.getElementById('drawer-avatar-placeholder');
  if (avatarPlaceholder) {
    const avatarEl = createAvatar(member, { size: 'xl' });
    avatarPlaceholder.replaceWith(avatarEl);
  }

  // Bind close action
  document.getElementById('peek-drawer-close')?.addEventListener('click', () => {
    sidePeek.classList.remove('open');
  });

  // Task links navigation listener
  peekBody.querySelectorAll('[data-task-link-id]').forEach(link => {
    link.addEventListener('click', () => {
      const taskId = link.getAttribute('data-task-link-id');
      sidePeek.classList.remove('open');
      setTimeout(() => {
        const cardEditBtn = document.querySelector(`.task-card[data-task-id="${taskId}"] [data-action="edit"]`);
        if (cardEditBtn) {
          cardEditBtn.click();
        }
      }, 350);
    });
  });

  sidePeek.classList.add('open');
}

function init() {
  renderBoard(MOCK_DATA);
  renderActivity(MOCK_DATA.activityLog);
  renderTable(MOCK_DATA);
  renderList(MOCK_DATA);
  renderTeam(TEAM_MEMBERS);
  renderQuickStats(MOCK_DATA);
  renderByDate(MOCK_DATA);
  renderWeeklyLineGraph(MOCK_DATA);
  renderRecentActivity(MOCK_DATA);
  renderKPICards(MOCK_DATA);
  renderStatusDistribution(MOCK_DATA);
  renderPriorityDoughnut(MOCK_DATA);
  renderMemberWorkload(MOCK_DATA);
  renderMemberStatsTable(MOCK_DATA);
  initAnalyticsFilters(MOCK_DATA);

  const peekBody = document.querySelector('#side-peek .side-peek-body');
  if (peekBody) {
    originalSidePeekBodyHTML = peekBody.innerHTML;
  }

  renderHeaderTeamList('header-team-group', TEAM_MEMBERS);
  populateAssigneeSelects(TEAM_MEMBERS);

  initDragDrop();
  initCalendar();
  wireEventListeners();
  restorePersistedState();

  window.addEventListener('boardStateChanged', () => {
    renderBoard(MOCK_DATA);
    renderActivity(MOCK_DATA.activityLog);
    renderTable(MOCK_DATA);
    renderList(MOCK_DATA);
    renderRecentActivity(MOCK_DATA);
    renderTeam(TEAM_MEMBERS);
    refreshCalendar();
  });

  window.addEventListener('activityLogUpdated', () => {
    renderActivity(MOCK_DATA.activityLog);
  });
}

function openSidePeek(card) {
  const taskId = card.dataset.taskId;
  const task = MOCK_DATA.tasks[taskId];
  if (!task) return;

  const sidePeek = document.getElementById('side-peek');
  sidePeek.dataset.taskId = taskId;

  const peekBody = sidePeek.querySelector('.side-peek-body');
  if (peekBody && originalSidePeekBodyHTML) {
    peekBody.innerHTML = originalSidePeekBodyHTML;
  }

  const peekTitle = document.getElementById('peek-title');
  const peekDesc = document.querySelector('.peek-textarea');
  const peekSelects = document.querySelectorAll('.peek-select');
  const peekDate = document.querySelector('.peek-date');

  if (peekTitle) peekTitle.value = task.title || '';
  if (peekDesc) peekDesc.value = task.description || '';
  if (peekDate) peekDate.value = task.dueDate || '';

  const statusSelect = peekSelects[0];
  const prioritySelect = peekSelects[1];
  const assigneeSelect = peekSelects[2];

  if (statusSelect) {
    const column = MOCK_DATA.columns.find(col => col.taskIds.includes(taskId));
    statusSelect.value = column ? column.title : 'Backlog';
  }
  if (prioritySelect) {
    prioritySelect.value = task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium';
  }
  if (assigneeSelect) {
    assigneeSelect.value = task.assignee || 'sankalp';
  }

  const subtaskList = document.getElementById('peek-subtask-list');
  if (subtaskList) {
    subtaskList.innerHTML = '';
    (task.subtasks || []).forEach(sub => {
      const li = document.createElement('li');
      li.className = 'peek-subtask-item';
      li.innerHTML = `
        <label class="peek-subtask-checkbox">
          <input type="checkbox" ${sub.completed ? 'checked' : ''} data-sub-id="${sub.id}">
          <span class="peek-subtask-text">${sub.text}</span>
        </label>
        <button class="peek-subtask-remove" aria-label="Remove subtask">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3H10M4.5 3V1.5C4.5 1.22386 4.72386 1 5 1H7C7.27614 1 7.5 1.22386 7.5 1.5V3M3 3L3.5 10.5H8.5L9 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        </button>
      `;
      subtaskList.appendChild(li);
    });
  }
  updateSubtaskProgress();

  sidePeek.classList.add('open');
}

function syncBoardDOMToState() {
  const columns = document.querySelectorAll('.column');
  const newColumnsState = [];

  columns.forEach(colEl => {
    const colId = colEl.getAttribute('data-column-id');
    const colTitleEl = colEl.querySelector('.column-title');
    const colTitle = colTitleEl ? colTitleEl.textContent.trim() : '';
    const taskCards = colEl.querySelectorAll('.task-card');
    const taskIds = Array.from(taskCards).map(card => card.getAttribute('data-task-id'));

    newColumnsState.push({
      id: colId,
      title: colTitle,
      taskIds
    });

    taskIds.forEach(id => {
      const task = MOCK_DATA.tasks[id];
      if (task) {
        task.status = colId.replace('col-', '');
      }
    });
  });

  MOCK_DATA.columns = newColumnsState;
  saveMockData();
}

function openMemberModal() {
  if (!memberModal) return;
  memberModal.classList.add('active');
  memberModal.setAttribute('aria-hidden', 'false');
  renderMemberList('member-list-container', TEAM_MEMBERS, idInput.value || null);
  nameInput.focus();
  document.addEventListener('keydown', trapMemberModalFocus);
}

function closeMemberModalWindow() {
  if (!memberModal) return;
  memberModal.classList.remove('active');
  memberModal.setAttribute('aria-hidden', 'true');
  resetMemberForm();
  document.removeEventListener('keydown', trapMemberModalFocus);

  const manageBtn = document.getElementById('manage-team-btn');
  if (manageBtn) manageBtn.focus();
}

function resetMemberForm() {
  if (idInput) idInput.value = '';
  const form = document.getElementById('member-form');
  if (form) form.reset();
  hideMemberErrors();
  if (formTitle) formTitle.textContent = 'Add New Member';
  if (submitBtn) submitBtn.textContent = 'Save Member';
  if (cancelEditBtn) cancelEditBtn.style.display = 'none';
  if (memberModal && memberModal.classList.contains('active')) {
    renderMemberList('member-list-container', TEAM_MEMBERS, null);
  }
}

function hideMemberErrors() {
  if (nameError) nameError.style.display = 'none';
  if (emailError) emailError.style.display = 'none';
  if (avatarError) avatarError.style.display = 'none';
}

function trapMemberModalFocus(e) {
  if (e.key !== 'Tab') return;
  const focusableElements = memberModal.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  }
}

function handleMemberFormSubmit(e) {
  e.preventDefault();
  hideMemberErrors();

  const nameVal = nameInput.value.trim();
  const emailVal = emailInput.value.trim();
  const roleVal = roleInput.value.trim();
  const avatarVal = avatarInput.value.trim();
  const memberId = idInput.value;

  let hasError = false;
  if (!nameVal) {
    nameError.style.display = 'block';
    if (!hasError) { nameInput.focus(); hasError = true; }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailVal || !emailRegex.test(emailVal)) {
    emailError.textContent = 'Please enter a valid email address.';
    emailError.style.display = 'block';
    if (!hasError) { emailInput.focus(); hasError = true; }
  }

  if (avatarVal) {
    try {
      new URL(avatarVal);
    } catch (_) {
      avatarError.style.display = 'block';
      if (!hasError) { avatarInput.focus(); hasError = true; }
    }
  }

  if (hasError) return;

  try {
    if (memberId) {
      updateMember(memberId, {
        name: nameVal,
        email: emailVal,
        role: roleVal,
        avatarUrl: avatarVal
      });
      showToast('Member details updated successfully', 'success');
    } else {
      addMember({
        name: nameVal,
        email: emailVal,
        role: roleVal,
        avatarUrl: avatarVal
      });
      showToast('New team member added successfully', 'success');
    }
    resetMemberForm();
    renderMemberList('member-list-container', TEAM_MEMBERS, null);
    renderHeaderTeamList('header-team-group', TEAM_MEMBERS);
    renderTeam(TEAM_MEMBERS);
    populateAssigneeSelects(TEAM_MEMBERS);
  } catch (err) {
    emailError.textContent = err.message;
    emailError.style.display = 'block';
    emailInput.focus();
  }
}

function wireEventListeners() {
  // Cache DOM elements
  memberModal = document.getElementById('member-modal');
  idInput = document.getElementById('member-id-input');
  nameInput = document.getElementById('member-name-input');
  emailInput = document.getElementById('member-email-input');
  roleInput = document.getElementById('member-role-input');
  avatarInput = document.getElementById('member-avatar-input');
  
  formTitle = document.getElementById('form-action-title');
  cancelEditBtn = document.getElementById('btn-cancel-edit');
  submitBtn = document.getElementById('btn-submit-member');
  
  nameError = document.getElementById('name-error');
  emailError = document.getElementById('email-error');
  avatarError = document.getElementById('avatar-error');

  // Trigger button to open modal (event delegation because of dynamic rendering inside team-view header)
  document.addEventListener('click', (e) => {
    if (e.target.closest('#manage-team-btn')) {
      openMemberModal();
    }
  });

  document.getElementById('close-member-modal')?.addEventListener('click', closeMemberModalWindow);

  // Close modal when clicking outside modal-container
  memberModal?.addEventListener('click', (e) => {
    if (e.target === memberModal) {
      closeMemberModalWindow();
    }
  });

  // Cancel edit button click
  cancelEditBtn?.addEventListener('click', resetMemberForm);

  // Form submit
  document.getElementById('member-form')?.addEventListener('submit', handleMemberFormSubmit);

  // Edit/Delete click delegation in the member list
  document.getElementById('member-list-container')?.addEventListener('click', (e) => {
    const actionButton = e.target.closest('button[data-action]');
    if (!actionButton) return;
    
    const action = actionButton.getAttribute('data-action');
    const memberItem = actionButton.closest('.member-item');
    if (!memberItem) return;
    
    const memberId = memberItem.getAttribute('data-member-id');
    
    if (action === 'edit') {
      const member = getMemberById(memberId);
      if (!member) return;
      
      idInput.value = member.id;
      nameInput.value = member.name;
      emailInput.value = member.email;
      roleInput.value = member.role || '';
      avatarInput.value = member.avatarUrl || '';
      
      formTitle.textContent = 'Edit Member Info';
      submitBtn.textContent = 'Update Member';
      cancelEditBtn.style.display = 'inline-flex';
      hideMemberErrors();
      
      renderMemberList('member-list-container', TEAM_MEMBERS, memberId);
      nameInput.focus();
    } else if (action === 'delete') {
      const member = getMemberById(memberId);
      if (!member) return;
      
      if (confirm(`Are you sure you want to delete ${member.name}? This will unassign them from any tasks.`)) {
        try {
          deleteMember(memberId);
          if (idInput.value === memberId) {
            resetMemberForm();
          }
          renderMemberList('member-list-container', TEAM_MEMBERS, idInput.value || null);
          renderHeaderTeamList('header-team-group', TEAM_MEMBERS);
          renderTeam(TEAM_MEMBERS);
          renderBoard(MOCK_DATA);
          renderTable(MOCK_DATA);
          renderList(MOCK_DATA);
          populateAssigneeSelects(TEAM_MEMBERS);
          showToast(`${member.name} removed from team`, 'danger');
        } catch (err) {
          alert('Error deleting member: ' + err.message);
        }
      }
    }
  });

  // Task creation handler
  document.getElementById('add-task-btn')?.addEventListener('click', () => {
    document.getElementById('task-modal').classList.add('open');
  });

  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('task-modal').classList.remove('open');
    });
  });

  document.getElementById('task-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('task-modal').classList.remove('open');
    }
  });

  // Task creation logic (footer submit button)
  document.querySelector('#task-modal .btn-primary')?.addEventListener('click', () => {
    const titleEl = document.getElementById('task-title');
    const descEl = document.getElementById('task-description');
    const assigneeEl = document.getElementById('task-assignee');
    const dueDateEl = document.getElementById('task-dueDate');
    const priorityEl = document.getElementById('task-priority');

    const title = titleEl ? titleEl.value.trim() : '';
    if (!title) {
      titleEl?.closest('.form-group')?.classList.add('has-error');
      return;
    }

    const id = `task-${Date.now()}`;
    const newTask = {
      id,
      title,
      description: descEl ? descEl.value.trim() : '',
      assignee: assigneeEl ? assigneeEl.value : '',
      dueDate: dueDateEl ? dueDateEl.value : '',
      priority: priorityEl ? priorityEl.value : 'medium',
      status: 'backlog',
      subtasks: []
    };

    MOCK_DATA.tasks[id] = newTask;
    const backlogCol = MOCK_DATA.columns.find(c => c.id === 'col-backlog');
    if (backlogCol) {
      backlogCol.taskIds.push(id);
    }
    saveMockData();

    renderBoard(MOCK_DATA);
    renderTable(MOCK_DATA);
    renderList(MOCK_DATA);

    document.getElementById('task-modal').classList.remove('open');
    
    // Clear inputs
    if (titleEl) titleEl.value = '';
    if (descEl) descEl.value = '';
    if (assigneeEl) assigneeEl.value = '';
    if (dueDateEl) dueDateEl.value = '';
    if (priorityEl) priorityEl.value = 'medium';
  });

  // Assignee selection dropdown trigger on task cards
  document.addEventListener('click', (e) => {
    const avatarEl = e.target.closest('.task-card .task-avatar');
    if (avatarEl) {
      const cardEl = avatarEl.closest('.task-card');
      const taskId = cardEl.getAttribute('data-task-id');
      const task = MOCK_DATA.tasks[taskId];
      if (!task) return;

      e.stopPropagation();

      showAssignDropdown(avatarEl, task.assignee ? [task.assignee] : [], (memberId, isSelected) => {
        task.assignee = isSelected ? memberId : '';
        saveMockData();
        renderBoard(MOCK_DATA);
        renderTable(MOCK_DATA);
        renderList(MOCK_DATA);
        closeDropdown();
      });
    }
  });

  // View toggle tabs (Board vs Table vs List)
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const view = btn.dataset.view;
      document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
      document.getElementById(`${view}-view`).classList.add('active');

      localStorage.setItem('boardSubView', view);
    });
  });

  document.getElementById('sidebar-collapse')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  // Sidebar navigation sections toggling
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => {
        b.classList.remove('active-view');
      });
      item.classList.add('active-view');
      
      const section = item.dataset.section;
      const boardHeader = document.querySelector('.board-header');
      
      document.querySelectorAll('.view-container').forEach(v => {
        v.classList.remove('active');
      });
      
      if (section === 'board') {
        if (boardHeader) boardHeader.style.display = '';
        const activeSubViewBtn = document.querySelector('.view-btn.active');
        const activeSubView = activeSubViewBtn ? activeSubViewBtn.dataset.view : 'board';
        const subViewEl = document.getElementById(`${activeSubView}-view`);
        if (subViewEl) subViewEl.classList.add('active');
      } else {
        if (boardHeader) boardHeader.style.display = 'none';
        const viewEl = document.getElementById(`${section}-view`);
        if (viewEl) viewEl.classList.add('active');
      }

      localStorage.setItem('sidebarSection', section);
    });
  });

  // Command palette triggers and filters
  document.querySelectorAll('[data-action="add-task"]').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById('command-palette').classList.remove('open');
      document.getElementById('task-modal').classList.add('open');
    });
  });

  document.querySelectorAll('[data-action="switch-board"]').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById('command-palette').classList.remove('open');
      document.querySelectorAll('.view-btn[data-view="board"]')[0]?.click();
    });
  });

  document.querySelectorAll('[data-action="switch-table"]').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById('command-palette').classList.remove('open');
      document.querySelectorAll('.view-btn[data-view="table"]')[0]?.click();
    });
  });

  document.querySelectorAll('[data-action="toggle-sidebar"]').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById('command-palette').classList.remove('open');
      document.getElementById('sidebar').classList.toggle('collapsed');
    });
  });

  document.getElementById('activity-clear-btn')?.addEventListener('click', () => {
    const list = document.getElementById('activity-list');
    if (list) list.innerHTML = '';
  });

  let commandPaletteOpen = false;

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      commandPaletteOpen = !commandPaletteOpen;
      document.getElementById('command-palette').classList.toggle('open', commandPaletteOpen);
      if (commandPaletteOpen) {
        document.getElementById('command-input')?.focus();
      }
    }

    if (e.key === 'Escape') {
      document.getElementById('command-palette').classList.remove('open');
      document.getElementById('side-peek').classList.remove('open');
      document.getElementById('task-modal').classList.remove('open');
      if (memberModal && memberModal.classList.contains('active')) {
        closeMemberModalWindow();
      }
      if (activityPanel?.classList.contains('open')) setPanelOpen(false);
      commandPaletteOpen = false;
    }
  });

  document.getElementById('command-palette')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('command-palette').classList.remove('open');
      commandPaletteOpen = false;
    }
  });

  document.getElementById('command-input')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.command-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });
  });

  document.getElementById('side-peek-close')?.addEventListener('click', () => {
    document.getElementById('side-peek').classList.remove('open');
  });

  document.getElementById('side-peek-backdrop')?.addEventListener('click', () => {
    document.getElementById('side-peek').classList.remove('open');
  });

  document.getElementById('peek-cancel')?.addEventListener('click', () => {
    document.getElementById('side-peek').classList.remove('open');
  });

  function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    const label = document.querySelector('.theme-label');
    if (label) label.textContent = isDark ? 'Dark' : 'Light';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  document.getElementById('header-theme-toggle')?.addEventListener('click', toggleTheme);

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    const label = document.querySelector('.theme-label');
    if (label) label.textContent = 'Dark';
  }

  // Activity Log Panel
  const activityBtn = document.getElementById('activity-log-btn');
  const activityPanel = document.getElementById('activity-panel');
  const activityClose = document.getElementById('activity-close');
  const STORAGE_KEY = 'activity-log-open';

  function setPanelOpen(open) {
    if (!activityPanel) return;
    if (open) {
      activityPanel.style.height = '';
      const list = document.getElementById('activity-list');
      if (list) list.scrollTop = 0;
    } else {
      activityPanel.style.height = '';
    }
    activityPanel.classList.toggle('open', open);
    if (activityBtn) activityBtn.setAttribute('aria-pressed', String(open));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
  }

  activityBtn?.addEventListener('click', () => {
    setPanelOpen(!activityPanel?.classList.contains('open'));
  });

  activityClose?.addEventListener('click', () => setPanelOpen(false));

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'true') {
    setPanelOpen(true);
  }

  // Resizer for activity log
  const resizer = document.getElementById('activity-resizer');
  let startY = undefined;
  let startHeight = 0;

  resizer?.addEventListener('mousedown', (e) => {
    startY = e.clientY;
    startHeight = activityPanel.getBoundingClientRect().height;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ns-resize';
  });

  document.addEventListener('mousemove', (e) => {
    if (startY === undefined || !activityPanel) return;
    const diff = startY - e.clientY;
    let newHeight = Math.min(Math.max(startHeight + diff, 180), window.innerHeight * 0.65);
    activityPanel.style.height = `${newHeight}px`;
  });

  document.addEventListener('mouseup', () => {
    if (startY === undefined) return;
    startY = undefined;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  });

  document.querySelectorAll('.activity-filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.activity-filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      document.querySelectorAll('.activity-entry').forEach(entry => {
        if (filter === 'all' || entry.dataset.type === filter) {
          entry.style.display = '';
        } else {
          entry.style.display = 'none';
        }
      });
    });
  });

  // Custom board mutation sync
  document.addEventListener('app:board-mutated', () => {
    syncBoardDOMToState();
    renderTable(MOCK_DATA);
    renderList(MOCK_DATA);
  });

  // Column operations (rename, delete, add)
  document.addEventListener('click', (e) => {
    const renameBtn = e.target.closest('[data-action="rename"]');
    if (renameBtn) {
      const header = renameBtn.closest('.column-header');
      if (header) {
        const titleEl = header.querySelector('.column-title');
        const inputEl = header.querySelector('.column-title-input');
        if (titleEl && inputEl) {
          titleEl.classList.add('hidden');
          inputEl.classList.remove('hidden');
          inputEl.focus();
          inputEl.select();
        }
      }
      return;
    }

    const deleteBtn = e.target.closest('[data-action="delete"]');
    if (deleteBtn) {
      const card = deleteBtn.closest('.task-card');
      if (card) {
        const taskId = card.getAttribute('data-task-id');
        card.style.transition = 'all 0.3s ease';
        card.style.transform = 'translateX(100%)';
        card.style.opacity = '0';
        setTimeout(() => {
          card.remove();
          delete MOCK_DATA.tasks[taskId];
          syncBoardDOMToState();
          renderTable(MOCK_DATA);
          renderList(MOCK_DATA);
        }, 300);
        return;
      }
      const column = deleteBtn.closest('.column');
      if (column) {
        column.style.transition = 'all 0.3s ease';
        column.style.transform = 'scale(0.95)';
        column.style.opacity = '0';
        setTimeout(() => {
          column.parentElement?.removeChild(column);
          syncBoardDOMToState();
          renderTable(MOCK_DATA);
          renderList(MOCK_DATA);
        }, 300);
        return;
      }
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('column-title-input')) {
      const titleEl = e.target.closest('.column-header')?.querySelector('.column-title');
      if (titleEl && e.target.value.trim()) {
        titleEl.textContent = e.target.value.trim();
        titleEl.classList.remove('hidden');
        e.target.classList.add('hidden');
        syncBoardDOMToState();
        renderTable(MOCK_DATA);
        renderList(MOCK_DATA);
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('column-title-input')) {
      e.target.blur();
    }
    if (e.key === 'Escape' && e.target.classList.contains('column-title-input')) {
      const titleEl = e.target.closest('.column-header')?.querySelector('.column-title');
      if (titleEl) {
        e.target.value = titleEl.textContent;
        titleEl.classList.remove('hidden');
        e.target.classList.add('hidden');
      }
    }
  });

  // Task details editing panel triggers
  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-action="edit"]');
    if (editBtn) {
      const card = editBtn.closest('.task-card');
      if (card) {
        openSidePeek(card);
      }
      e.stopPropagation();
    }
  });

  // Event delegation for subtask additions
  document.addEventListener('click', (e) => {
    const addSubtaskBtn = e.target.closest('#peek-add-subtask-btn');
    if (addSubtaskBtn) {
      const input = document.getElementById('peek-add-subtask-input');
      const list = document.getElementById('peek-subtask-list');
      if (input && list && input.value.trim()) {
        const li = document.createElement('li');
        li.className = 'peek-subtask-item';
        li.innerHTML = `
          <label class="peek-subtask-checkbox">
            <input type="checkbox" data-sub-id="sub-new-${Date.now()}">
            <span class="peek-subtask-text">${input.value.trim()}</span>
          </label>
          <button class="peek-subtask-remove" aria-label="Remove subtask">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3H10M4.5 3V1.5C4.5 1.22386 4.72386 1 5 1H7C7.27614 1 7.5 1.22386 7.5 1.5V3M3 3L3.5 10.5H8.5L9 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          </button>
        `;
        list.appendChild(li);
        input.value = '';
        updateSubtaskProgress();
      }
    }
  });

  // Event delegation for subtask checkbox updates
  document.addEventListener('change', (e) => {
    if (e.target.closest('#peek-subtask-list') && e.target.type === 'checkbox') {
      updateSubtaskProgress();
    }
  });

  document.querySelector('#side-peek .btn-primary')?.addEventListener('click', (e) => {
    const peekContent = e.target.closest('.side-peek-content');
    if (peekContent) {
      const sidePeek = document.getElementById('side-peek');
      const taskId = sidePeek.dataset.taskId;
      const task = MOCK_DATA.tasks[taskId];

      if (task) {
        const peekTitle = document.getElementById('peek-title');
        const peekDesc = document.querySelector('.peek-textarea');
        const peekSelects = document.querySelectorAll('.peek-select');
        const peekDate = document.querySelector('.peek-date');

        const newTitle = peekTitle ? peekTitle.value.trim() : task.title;
        const newDesc = peekDesc ? peekDesc.value.trim() : task.description;
        const newDate = peekDate ? peekDate.value : task.dueDate;

        const statusSelect = peekSelects[0];
        const prioritySelect = peekSelects[1];
        const assigneeSelect = peekSelects[2];

        const newStatusTitle = statusSelect ? statusSelect.value : '';
        const newPriority = prioritySelect ? prioritySelect.value.toLowerCase() : task.priority;
        const newAssignee = assigneeSelect ? assigneeSelect.value : task.assignee;

        let hasChanged = false;

        // 1. Check Assignee change
        if (newAssignee !== task.assignee) {
          const newName = MOCK_DATA.members[newAssignee]?.name || 'Unassigned';
          addActivityLogEntry('Sankalp Tiwari', `assigned task '${newTitle}' to ${newName}`, 'edited', 'Team');
          task.assignee = newAssignee;
          hasChanged = true;
        }

        // 2. Check Deadline change
        if (newDate !== task.dueDate) {
          addActivityLogEntry('Sankalp Tiwari', `updated deadline on '${newTitle}'`, 'edited', 'Calendar');
          task.dueDate = newDate;
          hasChanged = true;
        }

        // 3. Check Status (Column) change
        const currentColumn = MOCK_DATA.columns.find(col => col.taskIds.includes(taskId));
        const targetColumn = MOCK_DATA.columns.find(col => col.title === newStatusTitle);
        
        if (currentColumn && targetColumn && currentColumn.id !== targetColumn.id) {
          currentColumn.taskIds = currentColumn.taskIds.filter(id => id !== taskId);
          targetColumn.taskIds.push(taskId);
          task.status = targetColumn.id;
          
          addActivityLogEntry('Sankalp Tiwari', `moved '${newTitle}' to ${targetColumn.title}`, 'moved', 'Board');
          hasChanged = true;
        }

        // 4. Update basic fields
        if (task.title !== newTitle || task.description !== newDesc || task.priority !== newPriority) {
          task.title = newTitle;
          task.description = newDesc;
          task.priority = newPriority;
          hasChanged = true;
        }

        // 5. Save subtasks
        const subtaskItems = document.querySelectorAll('.peek-subtask-item');
        const oldSubtasksJSON = JSON.stringify(task.subtasks || []);
        task.subtasks = Array.from(subtaskItems).map(item => {
          const check = item.querySelector('input[type="checkbox"]');
          const text = item.querySelector('.peek-subtask-text').textContent;
          return {
            id: check.getAttribute('data-sub-id') || `sub-${Date.now()}-${Math.random()}`,
            text,
            completed: check.checked
          };
        });
        if (JSON.stringify(task.subtasks) !== oldSubtasksJSON) {
          hasChanged = true;
        }

        if (hasChanged) {
          saveMockData();
          window.dispatchEvent(new CustomEvent('boardStateChanged'));
        }
      }

      sidePeek.classList.remove('open');
      e.preventDefault();
    }
  });

  // Task creation submit listener
  document.querySelector('#task-modal .modal-footer .btn-primary')?.addEventListener('click', (e) => {
    const titleInput = document.getElementById('task-title');
    const descInput = document.getElementById('task-description');
    const assigneeSelect = document.getElementById('task-assignee');
    const dateInput = document.getElementById('task-dueDate');
    const prioritySelect = document.getElementById('task-priority');

    const title = titleInput ? titleInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';
    const assignee = assigneeSelect ? assigneeSelect.value : 'sankalp';
    const dueDate = dateInput ? dateInput.value : '';
    const priority = prioritySelect ? prioritySelect.value : 'medium';

    let hasError = false;

    if (!title) {
      titleInput?.classList.add('error');
      titleInput?.nextElementSibling?.classList.add('show');
      hasError = true;
    } else {
      titleInput?.classList.remove('error');
      titleInput?.nextElementSibling?.classList.remove('show');
    }

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dueDate);
      if (selectedDate < today) {
        dateInput?.classList.add('error');
        dateInput?.nextElementSibling?.classList.add('show');
        hasError = true;
      } else {
        dateInput?.classList.remove('error');
        dateInput?.nextElementSibling?.classList.remove('show');
      }
    } else {
        dateInput?.classList.remove('error');
        dateInput?.nextElementSibling?.classList.remove('show');
    }

    if (hasError) return;

    const newTask = createTask({
      title,
      description: desc,
      assignee,
      dueDate,
      priority,
      status: 'col-backlog'
    });

    addActivityLogEntry('Sankalp Tiwari', `created '${title}'`, 'created', 'Board');

    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (dateInput) dateInput.value = '';
    if (assigneeSelect) assigneeSelect.value = 'sankalp';
    if (prioritySelect) prioritySelect.value = 'medium';

    document.getElementById('task-modal').classList.remove('open');
    window.dispatchEvent(new CustomEvent('boardStateChanged'));
  });

  // Event delegation for subtask removals
  document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('#peek-subtask-list .peek-subtask-remove');
    if (removeBtn) {
      const item = removeBtn.closest('.peek-subtask-item');
      if (item) {
        item.style.transition = 'all 0.2s ease';
        item.style.opacity = '0';
        item.style.transform = 'translateX(-10px)';
        setTimeout(() => {
          item.remove();
          updateSubtaskProgress();
        }, 200);
      }
    }
  });

  // Adding new columns
  document.getElementById('add-column-btn')?.addEventListener('click', () => {
    const placeholder = document.getElementById('add-column-placeholder');
    if (placeholder) {
      placeholder.querySelector('.add-column-btn')?.classList.add('hidden');
      placeholder.querySelector('.add-column-input')?.classList.remove('hidden');
      document.getElementById('new-column-input')?.focus();
    }
  });

  document.getElementById('confirm-add-column')?.addEventListener('click', () => {
    const input = document.getElementById('new-column-input');
    const board = document.getElementById('board-container');
    const placeholder = document.getElementById('add-column-placeholder');
    if (input && input.value.trim() && board && placeholder) {
      const colId = 'col-' + input.value.trim().toLowerCase().replace(/\s+/g, '-');
      const newCol = document.createElement('article');
      newCol.className = 'column';
      newCol.dataset.columnId = colId;
      newCol.style.animation = 'slideUp 0.3s ease';
      newCol.innerHTML = `
        <div class="column-header">
          <div class="column-header-left">
            <h2 class="column-title">${input.value.trim()}</h2>
            <span class="column-count">0</span>
            <input type="text" class="column-title-input hidden" value="${input.value.trim()}">
          </div>
          <div class="column-options">
            <button class="column-option-btn" data-action="rename" aria-label="Rename column">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 1.5L12.5 4L4.5 12H2V9.5L10 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
            </button>
            <button class="column-option-btn destructive" data-action="delete" aria-label="Delete column">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5H12M5 3.5V2C5 1.72386 5.22386 1.5 5.5 1.5H8.5C8.77614 1.5 9 1.72386 9 2V3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
        <ul class="task-list"></ul>
      `;
      board.insertBefore(newCol, placeholder);
      input.value = '';
      placeholder.querySelector('.add-column-btn')?.classList.remove('hidden');
      placeholder.querySelector('.add-column-input')?.classList.add('hidden');
      syncBoardDOMToState();
      renderTable(MOCK_DATA);
      renderList(MOCK_DATA);
    }
  });

  document.getElementById('cancel-add-column')?.addEventListener('click', () => {
    const placeholder = document.getElementById('add-column-placeholder');
    if (placeholder) {
      placeholder.querySelector('.add-column-btn')?.classList.remove('hidden');
      placeholder.querySelector('.add-column-input')?.classList.add('hidden');
      document.getElementById('new-column-input').value = '';
    }
  });

  // Search input filtering for tasks, tables, lists
  document.getElementById('search-input')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.task-card').forEach(card => {
      const title = card.querySelector('.task-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.task-description')?.textContent.toLowerCase() || '';
      if (!query || title.includes(query) || desc.includes(query)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
    document.querySelectorAll('.task-table tbody tr').forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = (!query || text.includes(query)) ? '' : 'none';
    });
    document.querySelectorAll('.list-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = (!query || text.includes(query)) ? '' : 'none';
    });
  });

  document.addEventListener('dblclick', (e) => {
    const card = e.target.closest('.task-card');
    if (card) {
      openSidePeek(card);
    }
  });

  // GitHub Username bind/edit modal toggling on team-view cards
  let selectedMemberId = null;
  document.getElementById('team-container')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.team-github-btn');
    if (!btn) return;
    selectedMemberId = btn.dataset.memberId;
    const member = TEAM_MEMBERS.find(m => m.id === selectedMemberId);
    if (!member) return;
    document.getElementById('github-modal-member-name').textContent = member.name;
    document.getElementById('github-modal-title').textContent = member.githubId ? 'Edit GitHub ID' : 'Add GitHub ID';
    document.getElementById('github-id-input').value = member.githubId || '';
    document.getElementById('github-modal').classList.add('open');
  });

  document.querySelectorAll('.github-modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('github-modal').classList.remove('open');
    });
  });

  document.getElementById('github-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('github-modal').classList.remove('open');
    }
  });

  document.getElementById('github-save-btn')?.addEventListener('click', () => {
    const input = document.getElementById('github-id-input');
    const username = input ? input.value.trim() : '';
    if (!username) return;

    const member = TEAM_MEMBERS.find(m => m.id === selectedMemberId);
    if (member) {
      updateMember(selectedMemberId, { githubId: username });
      renderTeam(TEAM_MEMBERS);
    }
    document.getElementById('github-modal').classList.remove('open');
  });

  document.getElementById('github-id-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('github-save-btn')?.click();
    }
  });

  // Click listener on team profile cards to open the side drawer profile details
  document.getElementById('team-container')?.addEventListener('click', (e) => {
    const githubBtn = e.target.closest('.team-github-btn');
    if (githubBtn) return; // let GitHub handler manage it
    
    const card = e.target.closest('.team-card');
    if (!card) return;
    
    const memberId = card.getAttribute('data-member-id');
    const member = TEAM_MEMBERS.find(m => m.id === memberId);
    if (member) {
      openMemberProfileDrawer(member);
    }
  });
}

function updateSubtaskProgress() {
  const list = document.getElementById('peek-subtask-list');
  const progressText = document.querySelector('.peek-subtask-progress-text');
  const progressFill = document.querySelector('.peek-subtask-progress-fill');
  if (!list || !progressText || !progressFill) return;
  const items = list.querySelectorAll('.peek-subtask-item');
  const total = items.length;
  const checked = list.querySelectorAll('.peek-subtask-item input[type="checkbox"]:checked').length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  progressText.textContent = `${checked}/${total}`;
  progressFill.style.width = `${pct}%`;
}

function updateBoardColumnCounts() {
  document.querySelectorAll('.column').forEach(col => {
    const count = col.querySelectorAll('.task-card').length;
    const badge = col.querySelector('.column-count');
    if (badge) badge.textContent = count;
  });
}

function restorePersistedState() {
  const savedSection = localStorage.getItem('sidebarSection');
  if (!savedSection) return;

  const navItem = document.querySelector(`.sidebar-nav .nav-item[data-section="${savedSection}"]`);
  if (!navItem) return;

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => b.classList.remove('active-view'));
  navItem.classList.add('active-view');

  const boardHeader = document.querySelector('.board-header');

  document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));

  if (savedSection === 'board') {
    if (boardHeader) boardHeader.style.display = '';
    const savedSubView = localStorage.getItem('boardSubView') || 'board';
    document.querySelectorAll('.view-btn').forEach(b => {
      const isActive = b.dataset.view === savedSubView;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', String(isActive));
    });
    const subViewEl = document.getElementById(`${savedSubView}-view`);
    if (subViewEl) subViewEl.classList.add('active');
  } else {
    if (boardHeader) boardHeader.style.display = 'none';
    const viewEl = document.getElementById(`${savedSection}-view`);
    if (viewEl) viewEl.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', init);
export { syncBoardDOMToState };
