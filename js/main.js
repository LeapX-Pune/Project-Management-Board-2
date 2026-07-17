import { MOCK_DATA, TEAM_MEMBERS, addMember, updateMember, deleteMember, getMemberById, saveMockData, saveTeamMembers } from './data.js';
import { 
  renderBoard, 
  renderActivity, 
  renderTable, 
  renderList, 
  renderTeam, 
  getInitials, 
  formatTimestamp, 
  getSubtaskProgress,
  createAvatar,
  createAvatarGroup,
  renderMemberList,
  renderHeaderTeamList,
  showAssignDropdown,
  closeDropdown,
  populateAssigneeSelects
} from './ui.js';
import { initDragDrop } from './dragdrop.js';

// Modal elements cache
let memberModal, idInput, nameInput, emailInput, roleInput, avatarInput;
let formTitle, cancelEditBtn, submitBtn;
let nameError, emailError, avatarError;

function init() {
  renderBoard(MOCK_DATA);
  renderActivity(MOCK_DATA.activityLog);
  renderTable(MOCK_DATA);
  renderList(MOCK_DATA);
  renderTeam(TEAM_MEMBERS);
  
  // Render header avatars
  renderHeaderTeamList('header-team-group', TEAM_MEMBERS);
  
  // Populate select boxes with current team members
  populateAssigneeSelects(TEAM_MEMBERS);

  initDragDrop();
  wireEventListeners();
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
    
    // Map column ID to task status
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
    } else {
      addMember({
        name: nameVal,
        email: emailVal,
        role: roleVal,
        avatarUrl: avatarVal
      });
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
      const viewToggle = document.querySelector('.view-toggle');
      
      document.querySelectorAll('.view-container').forEach(v => {
        v.classList.remove('active');
      });
      
      if (section === 'board') {
        if (viewToggle) viewToggle.style.display = '';
        const activeSubViewBtn = document.querySelector('.view-btn.active');
        const activeSubView = activeSubViewBtn ? activeSubViewBtn.dataset.view : 'board';
        const subViewEl = document.getElementById(`${activeSubView}-view`);
        if (subViewEl) subViewEl.classList.add('active');
      } else {
        if (viewToggle) viewToggle.style.display = 'none';
        const viewEl = document.getElementById(`${section}-view`);
        if (viewEl) viewEl.classList.add('active');
      }
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
    document.body.classList.toggle('dark-theme');
    const label = document.querySelector('.theme-label');
    const isDark = document.body.classList.contains('dark-theme');
    if (label) label.textContent = isDark ? 'Dark' : 'Light';
  }

  document.getElementById('header-theme-toggle')?.addEventListener('click', toggleTheme);

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
        const taskId = card.getAttribute('data-task-id');
        const task = MOCK_DATA.tasks[taskId];
        if (!task) return;

        const peekTitle = document.getElementById('peek-title');
        const peekDesc = document.querySelector('.peek-textarea');
        const peekDate = document.querySelector('.peek-date');

        // Status select lookup
        const selectEls = document.querySelectorAll('#side-peek select');
        let statusSelect, prioritySelect, assigneeSelect;
        selectEls.forEach(sel => {
          const label = sel.previousElementSibling;
          if (label) {
            const labelText = label.textContent.toLowerCase();
            if (labelText === 'status') statusSelect = sel;
            else if (labelText === 'priority') prioritySelect = sel;
            else if (labelText === 'assignee') assigneeSelect = sel;
          }
        });

        // Populate peek fields
        if (peekTitle) peekTitle.value = task.title;
        if (peekDesc) peekDesc.value = task.description;
        if (peekDate) peekDate.value = task.dueDate || '';
        
        if (statusSelect) {
          // Normalize status
          const normalizedStatus = task.status || 'backlog';
          const matchOption = Array.from(statusSelect.options).find(o => o.text.toLowerCase().replace(' ', '') === normalizedStatus.replace('-', ''));
          if (matchOption) statusSelect.value = matchOption.value;
          else statusSelect.selectedIndex = 0;
        }
        if (prioritySelect) {
          prioritySelect.value = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        }
        if (assigneeSelect) {
          assigneeSelect.value = task.assignee || '';
        }

        // Render subtasks
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

        // Save action on side-peek
        const saveBtn = document.querySelector('#side-peek .peek-actions .btn-primary');
        if (saveBtn) {
          // Rebind save click
          const newSaveBtn = saveBtn.cloneNode(true);
          saveBtn.replaceWith(newSaveBtn);
          newSaveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            task.title = peekTitle ? peekTitle.value.trim() : task.title;
            task.description = peekDesc ? peekDesc.value.trim() : task.description;
            task.dueDate = peekDate ? peekDate.value : task.dueDate;
            
            if (prioritySelect) task.priority = prioritySelect.value.toLowerCase();
            if (assigneeSelect) task.assignee = assigneeSelect.value;

            // Save subtasks
            const subtaskItems = document.querySelectorAll('.peek-subtask-item');
            task.subtasks = Array.from(subtaskItems).map(item => {
              const check = item.querySelector('input[type="checkbox"]');
              const text = item.querySelector('.peek-subtask-text').textContent;
              return {
                id: check.getAttribute('data-sub-id') || `sub-${Date.now()}-${Math.random()}`,
                text,
                completed: check.checked
              };
            });

            // If status changed, move card columns
            if (statusSelect) {
              const newStatusText = statusSelect.value.toLowerCase().replace(' ', '-');
              const targetColId = `col-${newStatusText}`;
              if (task.status !== newStatusText) {
                // Remove task from old column
                MOCK_DATA.columns.forEach(col => {
                  col.taskIds = col.taskIds.filter(id => id !== task.id);
                });
                // Add task to new column
                const newCol = MOCK_DATA.columns.find(c => c.id === targetColId);
                if (newCol) {
                  newCol.taskIds.push(task.id);
                }
                task.status = newStatusText;
              }
            }

            saveMockData();
            renderBoard(MOCK_DATA);
            renderTable(MOCK_DATA);
            renderList(MOCK_DATA);
            document.getElementById('side-peek').classList.remove('open');
          });
        }

        document.getElementById('side-peek').classList.add('open');
      }
      e.stopPropagation();
    }
  });

  document.getElementById('peek-add-subtask-btn')?.addEventListener('click', () => {
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
  });

  document.getElementById('peek-subtask-list')?.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      updateSubtaskProgress();
    }
  });

  document.getElementById('peek-subtask-list')?.addEventListener('click', (e) => {
    if (e.target.closest('.peek-subtask-remove')) {
      const item = e.target.closest('.peek-subtask-item');
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

  document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('dblclick', () => {
      document.getElementById('side-peek').classList.add('open');
    });
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

document.addEventListener('DOMContentLoaded', init);
export { syncBoardDOMToState };
