 feature/activity-log-final
import { MOCK_DATA, addActivityLogEntry } from './data.js';
import { renderBoard, renderActivity, renderTable, renderList, getInitials, formatTimestamp, getSubtaskProgress } from './ui.js';

import { MOCK_DATA, TEAM_MEMBERS } from './data.js';
import { renderBoard, renderActivity, renderTable, renderList, renderTeam, getInitials, formatTimestamp, getSubtaskProgress } from './ui.js';
 develop
import { initDragDrop } from './dragdrop.js';

function init() {
  renderBoard(MOCK_DATA);
  renderActivity(MOCK_DATA.activityLog);
  renderTable(MOCK_DATA);
  renderList(MOCK_DATA);
  renderTeam(TEAM_MEMBERS);
  initDragDrop();
  wireEventListeners();

  window.addEventListener('boardStateChanged', () => {
    renderBoard(MOCK_DATA);
    renderActivity(MOCK_DATA.activityLog);
    renderTable(MOCK_DATA);
    renderList(MOCK_DATA);
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
    assigneeSelect.value = task.assignee || 'alice';
  }

  sidePeek.classList.add('open');
}

function wireEventListeners() {
  document.getElementById('add-task-btn').addEventListener('click', () => {
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

  // Sidebar navigation toggling between sections
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => {
        b.classList.remove('active-view');
      });
      item.classList.add('active-view');
      
      const section = item.dataset.section;
      const viewToggle = document.querySelector('.view-toggle');
      
      // Hide all main area view containers
      document.querySelectorAll('.view-container').forEach(v => {
        v.classList.remove('active');
      });
      
      if (section === 'board') {
        if (viewToggle) viewToggle.style.display = '';
        
        // Show the active sub-view based on the active header view tab
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

 feature/activity-log-final
  document.getElementById('activity-close')?.addEventListener('click', () => {
    document.getElementById('activity-sidebar').classList.remove('open');
  });

  document.getElementById('btn-activity-toggle')?.addEventListener('click', () => {
    document.getElementById('activity-sidebar').classList.toggle('open');
  });

  document.getElementById('theme-toggle')?.addEventListener('click', () => {

  function toggleTheme() {
 develop
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

  // Resizer
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
        card.style.transition = 'all 0.3s ease';
        card.style.transform = 'translateX(100%)';
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 300);
        return;
      }
      const column = deleteBtn.closest('.column');
      if (column) {
        column.style.transition = 'all 0.3s ease';
        column.style.transform = 'scale(0.95)';
        column.style.opacity = '0';
        setTimeout(() => {
          column.parentElement?.removeChild(column);
          updateBoardColumnCounts();
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
          addActivityLogEntry('Alice Chen', `assigned task '${newTitle}' to ${newName}`, 'edited');
          task.assignee = newAssignee;
          hasChanged = true;
        }

        // 2. Check Deadline change
        if (newDate !== task.dueDate) {
          addActivityLogEntry('Alice Chen', `updated deadline on '${newTitle}'`, 'edited');
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
          
          addActivityLogEntry('Alice Chen', `moved '${newTitle}' to ${targetColumn.title}`, 'moved');
          hasChanged = true;
        }

        // 4. Update basic fields
        if (task.title !== newTitle || task.description !== newDesc || task.priority !== newPriority) {
          task.title = newTitle;
          task.description = newDesc;
          task.priority = newPriority;
          hasChanged = true;
        }

        if (hasChanged) {
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
    const assignee = assigneeSelect ? assigneeSelect.value : 'alice';
    const dueDate = dateInput ? dateInput.value : '';
    const priority = prioritySelect ? prioritySelect.value : 'medium';

    if (!title) {
      titleInput?.classList.add('error');
      titleInput?.nextElementSibling?.classList.add('show');
      return;
    }

    titleInput?.classList.remove('error');
    titleInput?.nextElementSibling?.classList.remove('show');

    const newTaskId = 'task-' + Date.now();
    const newTask = {
      id: newTaskId,
      title: title,
      description: desc,
      assignee: assignee,
      dueDate: dueDate,
      priority: priority,
      status: 'col-backlog',
      subtasks: []
    };

    MOCK_DATA.tasks[newTaskId] = newTask;
    const backlogCol = MOCK_DATA.columns.find(col => col.id === 'col-backlog');
    if (backlogCol) {
      backlogCol.taskIds.push(newTaskId);
    }

    addActivityLogEntry('Alice Chen', `created '${title}'`, 'created');

    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (dateInput) dateInput.value = '';
    if (assigneeSelect) assigneeSelect.value = 'alice';
    if (prioritySelect) prioritySelect.value = 'medium';

    document.getElementById('task-modal').classList.remove('open');
    window.dispatchEvent(new CustomEvent('boardStateChanged'));
  });

  document.getElementById('peek-add-subtask-btn')?.addEventListener('click', () => {
    const input = document.getElementById('peek-add-subtask-input');
    const list = document.getElementById('peek-subtask-list');
    if (input && list && input.value.trim()) {
      const li = document.createElement('li');
      li.className = 'peek-subtask-item';
      li.innerHTML = `
        <label class="peek-subtask-checkbox">
          <input type="checkbox">
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
    if (input && input.value.trim()) {
      const newCol = document.createElement('article');
      newCol.className = 'column';
      newCol.dataset.columnId = 'col-new-' + Date.now();
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
    const username = input.value.trim();
    if (!username) return;

    const member = TEAM_MEMBERS.find(m => m.id === selectedMemberId);
    if (member) {
      member.githubId = username;
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

function updateBoardColumnCounts() {
  document.querySelectorAll('.column').forEach(col => {
    const count = col.querySelectorAll('.task-card').length;
    const badge = col.querySelector('.column-count');
    if (badge) badge.textContent = count;
  });
}

document.addEventListener('DOMContentLoaded', init);
