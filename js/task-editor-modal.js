import { MOCK_DATA, TEAM_MEMBERS, updateTask, deleteTask, addActivityLogEntry } from './data.js';

/**
 * Task Editor Modal Component
 * A modern modal-based editor with inline validation, keyboard shortcuts,
 * auto-save indicator, and proper data persistence.
 */

let currentTaskId = null;
let isSaving = false;
let hasUnsavedChanges = false;
let autoSaveTimeout = null;

const AUTO_SAVE_DELAY = 1500;
const DEBOUNCE_DELAY = 300;

/**
 * Creates and returns the modal HTML structure.
 */
function createModalHTML() {
  return `
    <div class="task-editor-modal" id="task-editor-modal" role="dialog" aria-modal="true" aria-label="Edit task">
      <div class="task-editor-backdrop" id="task-editor-backdrop"></div>
      <div class="task-editor-container">
        <div class="task-editor-header">
          <div class="task-editor-title-section">
            <input type="text" class="task-editor-title" id="task-editor-title" placeholder="Task title" autocomplete="off" aria-label="Task title">
            <div class="task-editor-status-badge" id="task-editor-status-badge">To Do</div>
          </div>
          <div class="task-editor-header-actions">
            <div class="task-editor-auto-save" id="task-editor-auto-save">
              <div class="task-editor-auto-save-dot"></div>
              <span>Saved</span>
            </div>
            <button class="task-editor-btn-icon" id="task-editor-delete" title="Delete task (Cmd+Del)" aria-label="Delete task">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 5H14M6 5V4C6 3.44772 6.44772 3 7 3H11C11.5523 3 12 3.44772 12 4V5M7 8V13M11 8V13M5 5L5.5 14C5.5 14.5523 5.94772 15 6.5 15H11.5C12.0523 15 12.5 14.5523 12.5 14L13 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="task-editor-btn-icon" id="task-editor-close" title="Close (Esc)" aria-label="Close editor">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="task-editor-body">
          <div class="task-editor-section">
            <h3 class="task-editor-section-title">Details</h3>
            <div class="task-editor-field-row">
              <div class="task-editor-field">
                <label class="task-editor-label" for="task-editor-status">Status</label>
                <select class="task-editor-select" id="task-editor-status" aria-label="Task status">
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div class="task-editor-field">
                <label class="task-editor-label" for="task-editor-priority">Priority</label>
                <select class="task-editor-select" id="task-editor-priority" aria-label="Task priority">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div class="task-editor-field-row">
              <div class="task-editor-field">
                <label class="task-editor-label" for="task-editor-assignee">Assignee</label>
                <select class="task-editor-select" id="task-editor-assignee" aria-label="Task assignee">
                  <option value="">Unassigned</option>
                </select>
              </div>
              <div class="task-editor-field">
                <label class="task-editor-label" for="task-editor-due-date">Due Date</label>
                <input type="date" class="task-editor-input" id="task-editor-due-date" aria-label="Due date">
              </div>
            </div>
          </div>

          <div class="task-editor-section">
            <h3 class="task-editor-section-title">Description</h3>
            <textarea class="task-editor-textarea" id="task-editor-description" rows="3" placeholder="Add a more detailed description..." aria-label="Task description"></textarea>
          </div>

          <div class="task-editor-section">
            <div class="task-editor-section-header">
              <h3 class="task-editor-section-title">Subtasks</h3>
              <span class="task-editor-subtask-count" id="task-editor-subtask-count">0/0</span>
            </div>
            <div class="task-editor-progress-bar">
              <div class="task-editor-progress-fill" id="task-editor-progress-fill" style="width: 0%"></div>
            </div>
            <div class="task-editor-subtask-list" id="task-editor-subtask-list"></div>
            <div class="task-editor-add-subtask">
              <input type="text" class="task-editor-input" id="task-editor-new-subtask" placeholder="Add a subtask..." aria-label="New subtask">
              <button class="task-editor-btn-secondary" id="task-editor-add-subtask-btn" aria-label="Add subtask">Add</button>
            </div>
          </div>

          <div class="task-editor-section">
            <h3 class="task-editor-section-title">Activity</h3>
            <div class="task-editor-activity-log" id="task-editor-activity-log">
              <div class="task-editor-activity-empty">No recent activity</div>
            </div>
          </div>
        </div>

        <div class="task-editor-footer">
          <div class="task-editor-footer-left">
            <button class="task-editor-btn-danger" id="task-editor-delete-btn" aria-label="Delete task">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6V10M8 6V10M3.5 3.5L4 12C4 12.2761 4.22386 12.5 4.5 12.5H9.5C9.77614 12.5 10 12.2761 10 12L10.5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Delete
            </button>
          </div>
          <div class="task-editor-footer-right">
            <div class="task-editor-shortcuts-hint">
              <kbd>Esc</kbd> close &middot; <kbd>Cmd</kbd>+<kbd>Enter</kbd> save
            </div>
            <button class="task-editor-btn-secondary" id="task-editor-cancel-btn">Cancel</button>
            <button class="task-editor-btn-primary" id="task-editor-save-btn" aria-label="Save changes">
              <svg class="task-editor-btn-icon-svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7L6 10L11 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="task-editor-btn-text">Save Changes</span>
              <div class="task-editor-spinner" style="display: none;"></div>
            </button>
          </div>
        </div>

        <div class="task-editor-toast" id="task-editor-toast" role="alert" aria-live="polite">
          <div class="task-editor-toast-content">
            <svg class="task-editor-toast-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 12L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="task-editor-toast-message">Changes saved successfully!</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Populates the assignee dropdown with team members.
 */
function populateAssigneeDropdown() {
  const select = document.getElementById('task-editor-assignee');
  if (!select) return;

  select.innerHTML = '<option value="">Unassigned</option>';

  TEAM_MEMBERS.forEach(member => {
    const option = document.createElement('option');
    option.value = member.id;
    option.textContent = member.name;
    select.appendChild(option);
  });
}

/**
 * Populates the modal with task data.
 */
function populateModal(taskId) {
  const task = MOCK_DATA.tasks[taskId];
  if (!task) return;

  currentTaskId = taskId;
  hasUnsavedChanges = false;

  const titleInput = document.getElementById('task-editor-title');
  if (titleInput) {
    titleInput.value = task.title || '';
    titleInput.classList.remove('error', 'touched');
  }

  const statusSelect = document.getElementById('task-editor-status');
  if (statusSelect) statusSelect.value = task.status || 'todo';

  updateStatusBadge(task.status);

  const prioritySelect = document.getElementById('task-editor-priority');
  if (prioritySelect) prioritySelect.value = task.priority || 'medium';

  const assigneeSelect = document.getElementById('task-editor-assignee');
  if (assigneeSelect) assigneeSelect.value = task.assignee || '';

  const dueDateInput = document.getElementById('task-editor-due-date');
  if (dueDateInput) dueDateInput.value = task.dueDate || '';

  const descriptionTextarea = document.getElementById('task-editor-description');
  if (descriptionTextarea) descriptionTextarea.value = task.description || '';

  populateSubtasks(task.subtasks || []);
  populateActivityLog(taskId);
  updateAutoSaveIndicator('saved');
}

/**
 * Updates the status badge display.
 */
function updateStatusBadge(status) {
  const statusBadge = document.getElementById('task-editor-status-badge');
  if (statusBadge) {
    statusBadge.textContent = getStatusLabel(status);
    statusBadge.className = `task-editor-status-badge status-${status}`;
  }
}

/**
 * Returns a human-readable status label.
 */
function getStatusLabel(status) {
  const labels = {
    'backlog': 'Backlog',
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'Review',
    'done': 'Done'
  };
  return labels[status] || status;
}

/**
 * Populates the subtask list.
 */
function populateSubtasks(subtasks) {
  const list = document.getElementById('task-editor-subtask-list');
  if (!list) return;

  list.innerHTML = '';

  subtasks.forEach(subtask => {
    const item = createSubtaskItem(subtask);
    list.appendChild(item);
  });

  updateSubtaskProgress();
}

/**
 * Creates a subtask list item.
 */
function createSubtaskItem(subtask) {
  const item = document.createElement('div');
  item.className = 'task-editor-subtask-item';
  item.dataset.subtaskId = subtask.id;

  item.innerHTML = `
    <label class="task-editor-checkbox">
      <input type="checkbox" ${subtask.completed ? 'checked' : ''} aria-label="Mark subtask as complete">
      <span class="task-editor-checkmark"></span>
    </label>
    <input type="text" class="task-editor-subtask-text" value="${escapeHtml(subtask.text)}" placeholder="Subtask text" aria-label="Subtask text">
    <button class="task-editor-btn-icon task-editor-subtask-delete" title="Remove subtask" aria-label="Remove subtask">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  `;

  const checkbox = item.querySelector('input[type="checkbox"]');
  const textInput = item.querySelector('.task-editor-subtask-text');
  const deleteBtn = item.querySelector('.task-editor-subtask-delete');

  checkbox.addEventListener('change', () => {
    markUnsaved();
    updateSubtaskProgress();
  });

  textInput.addEventListener('input', () => {
    markUnsaved();
  });

  deleteBtn.addEventListener('click', () => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(20px)';
    item.style.maxHeight = '0';
    item.style.padding = '0';
    item.style.margin = '0';
    setTimeout(() => {
      item.remove();
      updateSubtaskProgress();
      markUnsaved();
    }, 200);
  });

  return item;
}

/**
 * Updates the subtask progress bar and count.
 */
function updateSubtaskProgress() {
  const list = document.getElementById('task-editor-subtask-list');
  const countEl = document.getElementById('task-editor-subtask-count');
  const progressFill = document.getElementById('task-editor-progress-fill');
  
  if (!list || !countEl || !progressFill) return;

  const items = list.querySelectorAll('.task-editor-subtask-item');
  const total = items.length;
  const checked = list.querySelectorAll('input[type="checkbox"]:checked').length;
  const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

  countEl.textContent = `${checked}/${total}`;
  progressFill.style.width = `${percentage}%`;
}

/**
 * Adds a new subtask to the list.
 */
function addNewSubtask() {
  const input = document.getElementById('task-editor-new-subtask');
  const list = document.getElementById('task-editor-subtask-list');
  
  if (!input || !list) return;

  const text = input.value.trim();
  if (!text) {
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 1500);
    return;
  }

  const subtask = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: text,
    completed: false
  };

  const item = createSubtaskItem(subtask);
  item.style.opacity = '0';
  item.style.transform = 'translateY(-10px)';
  list.appendChild(item);

  requestAnimationFrame(() => {
    item.style.transition = 'all 0.2s ease';
    item.style.opacity = '1';
    item.style.transform = 'translateY(0)';
  });

  input.value = '';
  input.focus();
  updateSubtaskProgress();
  markUnsaved();
}

/**
 * Populates the activity log.
 */
function populateActivityLog(taskId) {
  const logContainer = document.getElementById('task-editor-activity-log');
  if (!logContainer) return;

  const task = MOCK_DATA.tasks[taskId];
  const taskActivity = MOCK_DATA.activityLog
    .filter(entry => entry.action && entry.action.includes(task?.title || ''))
    .slice(-5)
    .reverse();

  if (taskActivity.length === 0) {
    logContainer.innerHTML = '<div class="task-editor-activity-empty">No recent activity</div>';
    return;
  }

  logContainer.innerHTML = taskActivity.map(entry => `
    <div class="task-editor-activity-item">
      <div class="task-editor-activity-user">${escapeHtml(entry.user)}</div>
      <div class="task-editor-activity-action">${escapeHtml(entry.action)}</div>
      <div class="task-editor-activity-time">${formatTime(entry.timestamp)}</div>
    </div>
  `).join('');
}

/**
 * Formats a timestamp to a relative time string.
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Shows a toast notification.
 */
function showToast(message, type = 'success') {
  const toast = document.getElementById('task-editor-toast');
  const toastMessage = toast?.querySelector('.task-editor-toast-message');
  const toastIcon = toast?.querySelector('.task-editor-toast-icon');
  
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  
  if (toastIcon) {
    if (type === 'success') {
      toastIcon.innerHTML = '<path d="M3 8L7 12L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
      toastIcon.style.color = '#10b981';
    } else if (type === 'error') {
      toastIcon.innerHTML = '<path d="M4 4L14 14M14 4L4 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
      toastIcon.style.color = '#ef4444';
    }
  }

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * Updates the auto-save indicator.
 */
function updateAutoSaveIndicator(status) {
  const indicator = document.getElementById('task-editor-auto-save');
  if (!indicator) return;

  indicator.classList.remove('saving', 'saved', 'error');
  indicator.classList.add(status);

  const dot = indicator.querySelector('.task-editor-auto-save-dot');
  const text = indicator.querySelector('span');

  if (status === 'saving') {
    if (text) text.textContent = 'Saving...';
  } else if (status === 'saved') {
    if (text) text.textContent = 'Saved';
  } else if (status === 'error') {
    if (text) text.textContent = 'Error';
  }
}

/**
 * Marks the form as having unsaved changes.
 */
function markUnsaved() {
  hasUnsavedChanges = true;
  updateAutoSaveIndicator('unsaved');
}

/**
 * Shows/hides the saving spinner.
 */
function setSavingState(saving) {
  isSaving = saving;
  const saveBtn = document.getElementById('task-editor-save-btn');
  const btnText = saveBtn?.querySelector('.task-editor-btn-text');
  const btnIcon = saveBtn?.querySelector('.task-editor-btn-icon-svg');
  const spinner = saveBtn?.querySelector('.task-editor-spinner');
  
  if (!saveBtn) return;

  saveBtn.disabled = saving;
  
  if (btnText) btnText.style.display = saving ? 'none' : 'inline';
  if (btnIcon) btnIcon.style.display = saving ? 'none' : 'inline';
  if (spinner) spinner.style.display = saving ? 'inline-block' : 'none';

  updateAutoSaveIndicator(saving ? 'saving' : 'saved');
}

/**
 * Validates a single field on blur.
 */
function validateField(field, value) {
  if (field === 'title') {
    if (!value || value.trim() === '') {
      return { valid: false, message: 'Title is required' };
    }
    if (value.length > 200) {
      return { valid: false, message: 'Title must be under 200 characters' };
    }
  }
  if (field === 'dueDate' && value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { valid: false, message: 'Invalid date' };
    }
  }
  return { valid: true, message: '' };
}

/**
 * Shows inline validation error.
 */
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');

  let errorEl = field.parentElement?.querySelector('.task-editor-field-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'task-editor-field-error';
    errorEl.setAttribute('role', 'alert');
    field.parentElement?.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

/**
 * Clears inline validation error.
 */
function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.classList.remove('error');
  field.removeAttribute('aria-invalid');

  const errorEl = field.parentElement?.querySelector('.task-editor-field-error');
  if (errorEl) errorEl.remove();
}

/**
 * Collects all form data from the modal.
 */
function collectFormData() {
  const title = document.getElementById('task-editor-title')?.value.trim() || '';
  const status = document.getElementById('task-editor-status')?.value || 'todo';
  const priority = document.getElementById('task-editor-priority')?.value || 'medium';
  const assignee = document.getElementById('task-editor-assignee')?.value || '';
  const dueDate = document.getElementById('task-editor-due-date')?.value || '';
  const description = document.getElementById('task-editor-description')?.value.trim() || '';

  const subtaskItems = document.querySelectorAll('.task-editor-subtask-item');
  const subtasks = Array.from(subtaskItems).map(item => ({
    id: item.dataset.subtaskId || `sub-${Date.now()}`,
    text: item.querySelector('.task-editor-subtask-text')?.value.trim() || '',
    completed: item.querySelector('input[type="checkbox"]')?.checked || false
  })).filter(s => s.text !== '');

  return { title, status, priority, assignee, dueDate, description, subtasks };
}

/**
 * Validates the entire form.
 */
function validateFormData(data) {
  let isValid = true;

  const titleValidation = validateField('title', data.title);
  if (!titleValidation.valid) {
    showFieldError('task-editor-title', titleValidation.message);
    isValid = false;
  } else {
    clearFieldError('task-editor-title');
  }

  return isValid;
}

/**
 * Saves the task data.
 */
async function saveTask() {
  if (isSaving || !currentTaskId) return;

  const formData = collectFormData();
  
  if (!validateFormData(formData)) {
    const titleInput = document.getElementById('task-editor-title');
    if (titleInput) {
      titleInput.focus();
      titleInput.select();
    }
    return;
  }

  setSavingState(true);

  try {
    await new Promise(resolve => setTimeout(resolve, 200));

    const originalTask = MOCK_DATA.tasks[currentTaskId];
    
    const updatedTask = updateTask(currentTaskId, {
      title: formData.title,
      status: formData.status,
      priority: formData.priority,
      assignee: formData.assignee,
      dueDate: formData.dueDate,
      description: formData.description,
      subtasks: formData.subtasks
    });

    if (updatedTask) {
      if (originalTask && originalTask.status !== formData.status) {
        const column = MOCK_DATA.columns.find(col => col.id === `col-${formData.status}`);
        const columnName = column ? column.title : formData.status;
        addActivityLogEntry('Kshitij Das', `moved '${formData.title}' to ${columnName}`, 'moved', 'Board');
      } else if (originalTask && JSON.stringify(originalTask) !== JSON.stringify(updatedTask)) {
        addActivityLogEntry('Kshitij Das', `updated '${formData.title}'`, 'edited', 'Board');
      }

      hasUnsavedChanges = false;
      showToast('Changes saved successfully!');
      
      window.dispatchEvent(new CustomEvent('boardStateChanged'));
      
      setTimeout(closeModal, 600);
    } else {
      showToast('Failed to save changes', 'error');
      updateAutoSaveIndicator('error');
    }
  } catch (error) {
    console.error('Error saving task:', error);
    showToast('An error occurred while saving', 'error');
    updateAutoSaveIndicator('error');
  } finally {
    setSavingState(false);
  }
}

/**
 * Deletes the current task.
 */
async function deleteCurrentTask() {
  if (!currentTaskId) return;

  const task = MOCK_DATA.tasks[currentTaskId];
  if (!task) return;

  const deleteBtn = document.getElementById('task-editor-delete-btn');
  const headerDeleteBtn = document.getElementById('task-editor-delete');
  
  if (deleteBtn) deleteBtn.disabled = true;
  if (headerDeleteBtn) headerDeleteBtn.disabled = true;

  try {
    const success = deleteTask(currentTaskId);
    
    if (success) {
      showToast('Task deleted successfully');
      addActivityLogEntry('Kshitij Das', `deleted '${task.title}'`, 'deleted', 'Board');
      
      window.dispatchEvent(new CustomEvent('boardStateChanged'));
      
      setTimeout(closeModal, 400);
    } else {
      showToast('Failed to delete task', 'error');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    showToast('An error occurred while deleting', 'error');
  } finally {
    if (deleteBtn) deleteBtn.disabled = false;
    if (headerDeleteBtn) headerDeleteBtn.disabled = false;
  }
}

/**
 * Opens the modal with a specific task.
 */
export function openTaskEditor(taskId) {
  const task = MOCK_DATA.tasks[taskId];
  if (!task) {
    console.error('Task not found:', taskId);
    return;
  }

  let modal = document.getElementById('task-editor-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.innerHTML = createModalHTML();
    document.body.appendChild(modal.firstElementChild);
    bindEventListeners();
  }

  populateAssigneeDropdown();
  populateModal(taskId);

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    const titleInput = document.getElementById('task-editor-title');
    if (titleInput) {
      titleInput.focus();
      titleInput.select();
    }
  }, 150);
}

/**
 * Closes the modal.
 */
export function closeModal() {
  if (hasUnsavedChanges) {
    if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
      return;
    }
  }

  const modal = document.getElementById('task-editor-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    currentTaskId = null;
    hasUnsavedChanges = false;
    
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = null;
    }
  }
}

/**
 * Binds event listeners to modal elements.
 */
function bindEventListeners() {
  document.getElementById('task-editor-close')?.addEventListener('click', closeModal);
  document.getElementById('task-editor-backdrop')?.addEventListener('click', closeModal);
  document.getElementById('task-editor-cancel-btn')?.addEventListener('click', closeModal);
  document.getElementById('task-editor-save-btn')?.addEventListener('click', saveTask);
  document.getElementById('task-editor-delete-btn')?.addEventListener('click', deleteCurrentTask);
  document.getElementById('task-editor-delete')?.addEventListener('click', deleteCurrentTask);
  document.getElementById('task-editor-add-subtask-btn')?.addEventListener('click', addNewSubtask);
  
  document.getElementById('task-editor-new-subtask')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewSubtask();
    }
  });

  document.getElementById('task-editor-status')?.addEventListener('change', (e) => {
    updateStatusBadge(e.target.value);
    markUnsaved();
  });

  document.getElementById('task-editor-priority')?.addEventListener('change', markUnsaved);
  document.getElementById('task-editor-assignee')?.addEventListener('change', markUnsaved);
  document.getElementById('task-editor-due-date')?.addEventListener('change', markUnsaved);
  document.getElementById('task-editor-description')?.addEventListener('input', markUnsaved);

  const titleInput = document.getElementById('task-editor-title');
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      markUnsaved();
      clearFieldError('task-editor-title');
    });

    titleInput.addEventListener('blur', () => {
      const validation = validateField('title', titleInput.value);
      if (!validation.valid) {
        showFieldError('task-editor-title', validation.message);
      }
    });
  }

  document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handles keyboard shortcuts.
 */
function handleKeyboardShortcuts(e) {
  if (!document.getElementById('task-editor-modal')?.classList.contains('open')) return;
  
  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();
  } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    saveTask();
  } else if ((e.metaKey || e.ctrlKey) && e.key === 'Delete') {
    e.preventDefault();
    deleteCurrentTask();
  }
}

/**
 * Escapes HTML special characters.
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export { openTaskEditor as openSidePeek };
