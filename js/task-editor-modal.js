import { MOCK_DATA, TEAM_MEMBERS, updateTask, deleteTask, addActivityLogEntry } from './data.js';

/**
 * Task Editor Modal Component
 * A modern modal-based editor for tasks with proper data binding and UI feedback.
 */

let currentTaskId = null;
let isSaving = false;

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
            <input type="text" class="task-editor-title" id="task-editor-title" placeholder="Task title" autocomplete="off">
            <div class="task-editor-status-badge" id="task-editor-status-badge">To Do</div>
          </div>
          <div class="task-editor-header-actions">
            <button class="task-editor-btn-icon" id="task-editor-delete" title="Delete task" aria-label="Delete task">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 5H14M6 5V4C6 3.44772 6.44772 3 7 3H11C11.5523 3 12 3.44772 12 4V5M7 8V13M11 8V13M5 5L5.5 14C5.5 14.5523 5.94772 15 6.5 15H11.5C12.0523 15 12.5 14.5523 12.5 14L13 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="task-editor-btn-icon" id="task-editor-close" title="Close" aria-label="Close editor">
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
                <select class="task-editor-select" id="task-editor-status">
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div class="task-editor-field">
                <label class="task-editor-label" for="task-editor-priority">Priority</label>
                <select class="task-editor-select" id="task-editor-priority">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div class="task-editor-field-row">
              <div class="task-editor-field">
                <label class="task-editor-label" for="task-editor-assignee">Assignee</label>
                <select class="task-editor-select" id="task-editor-assignee">
                  <option value="">Unassigned</option>
                </select>
              </div>
              <div class="task-editor-field">
                <label class="task-editor-label" for="task-editor-due-date">Due Date</label>
                <input type="date" class="task-editor-input" id="task-editor-due-date">
              </div>
            </div>
          </div>

          <div class="task-editor-section">
            <h3 class="task-editor-section-title">Description</h3>
            <textarea class="task-editor-textarea" id="task-editor-description" rows="3" placeholder="Add a more detailed description..."></textarea>
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
              <input type="text" class="task-editor-input" id="task-editor-new-subtask" placeholder="Add a subtask...">
              <button class="task-editor-btn-secondary" id="task-editor-add-subtask-btn">Add</button>
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
            <button class="task-editor-btn-danger" id="task-editor-delete-btn">Delete Task</button>
          </div>
          <div class="task-editor-footer-right">
            <button class="task-editor-btn-secondary" id="task-editor-cancel-btn">Cancel</button>
            <button class="task-editor-btn-primary" id="task-editor-save-btn">
              <span class="task-editor-btn-text">Save Changes</span>
              <div class="task-editor-spinner" style="display: none;"></div>
            </button>
          </div>
        </div>

        <div class="task-editor-toast" id="task-editor-toast">
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

  // Clear existing options except the first one
  select.innerHTML = '<option value="">Unassigned</option>';

  // Add team members
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

  // Set title
  const titleInput = document.getElementById('task-editor-title');
  if (titleInput) titleInput.value = task.title || '';

  // Set status
  const statusSelect = document.getElementById('task-editor-status');
  if (statusSelect) statusSelect.value = task.status || 'todo';

  // Update status badge
  const statusBadge = document.getElementById('task-editor-status-badge');
  if (statusBadge) {
    statusBadge.textContent = getStatusLabel(task.status);
    statusBadge.className = `task-editor-status-badge status-${task.status}`;
  }

  // Set priority
  const prioritySelect = document.getElementById('task-editor-priority');
  if (prioritySelect) prioritySelect.value = task.priority || 'medium';

  // Set assignee
  const assigneeSelect = document.getElementById('task-editor-assignee');
  if (assigneeSelect) assigneeSelect.value = task.assignee || '';

  // Set due date
  const dueDateInput = document.getElementById('task-editor-due-date');
  if (dueDateInput) dueDateInput.value = task.dueDate || '';

  // Set description
  const descriptionTextarea = document.getElementById('task-editor-description');
  if (descriptionTextarea) descriptionTextarea.value = task.description || '';

  // Populate subtasks
  populateSubtasks(task.subtasks || []);

  // Populate activity log
  populateActivityLog(taskId);
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
      <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
      <span class="task-editor-checkmark"></span>
    </label>
    <input type="text" class="task-editor-subtask-text" value="${escapeHtml(subtask.text)}" placeholder="Subtask text">
    <button class="task-editor-btn-icon task-editor-subtask-delete" title="Remove subtask" aria-label="Remove subtask">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  `;

  // Add event listeners
  const checkbox = item.querySelector('input[type="checkbox"]');
  const textInput = item.querySelector('.task-editor-subtask-text');
  const deleteBtn = item.querySelector('.task-editor-subtask-delete');

  checkbox.addEventListener('change', updateSubtaskProgress);
  textInput.addEventListener('input', updateSubtaskProgress);
  deleteBtn.addEventListener('click', () => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(20px)';
    setTimeout(() => {
      item.remove();
      updateSubtaskProgress();
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
  if (!text) return;

  const subtask = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: text,
    completed: false
  };

  const item = createSubtaskItem(subtask);
  list.appendChild(item);

  // Clear input
  input.value = '';
  input.focus();

  updateSubtaskProgress();
}

/**
 * Populates the activity log.
 */
function populateActivityLog(taskId) {
  const logContainer = document.getElementById('task-editor-activity-log');
  if (!logContainer) return;

  // Get recent activity for this task
  const taskActivity = MOCK_DATA.activityLog
    .filter(entry => entry.action && entry.action.includes(MOCK_DATA.tasks[taskId]?.title || ''))
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
  
  // Update icon based on type
  if (toastIcon) {
    if (type === 'success') {
      toastIcon.innerHTML = '<path d="M3 8L7 12L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    } else if (type === 'error') {
      toastIcon.innerHTML = '<path d="M4 4L14 14M14 4L4 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
    }
  }

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * Shows/hides the saving spinner.
 */
function setSavingState(saving) {
  isSaving = saving;
  const saveBtn = document.getElementById('task-editor-save-btn');
  const btnText = saveBtn?.querySelector('.task-editor-btn-text');
  const spinner = saveBtn?.querySelector('.task-editor-spinner');
  
  if (!saveBtn) return;

  saveBtn.disabled = saving;
  
  if (btnText) btnText.style.display = saving ? 'none' : 'inline';
  if (spinner) spinner.style.display = saving ? 'inline-block' : 'none';
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

  // Collect subtasks
  const subtaskItems = document.querySelectorAll('.task-editor-subtask-item');
  const subtasks = Array.from(subtaskItems).map(item => ({
    id: item.dataset.subtaskId || `sub-${Date.now()}`,
    text: item.querySelector('.task-editor-subtask-text')?.value.trim() || '',
    completed: item.querySelector('input[type="checkbox"]')?.checked || false
  }));

  return { title, status, priority, assignee, dueDate, description, subtasks };
}

/**
 * Validates the form data.
 */
function validateFormData(data) {
  if (!data.title) {
    showToast('Please enter a task title', 'error');
    const titleInput = document.getElementById('task-editor-title');
    if (titleInput) {
      titleInput.focus();
      titleInput.classList.add('error');
      setTimeout(() => titleInput.classList.remove('error'), 2000);
    }
    return false;
  }
  return true;
}

/**
 * Saves the task data.
 */
async function saveTask() {
  if (isSaving || !currentTaskId) return;

  const formData = collectFormData();
  
  if (!validateFormData(formData)) return;

  setSavingState(true);

  try {
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get the original task for comparison
    const originalTask = MOCK_DATA.tasks[currentTaskId];
    
    // Update the task
    const success = updateTask(currentTaskId, {
      title: formData.title,
      status: formData.status,
      priority: formData.priority,
      assignee: formData.assignee,
      dueDate: formData.dueDate,
      description: formData.description,
      subtasks: formData.subtasks
    });

    if (success) {
      // Log activity if something changed
      if (originalTask && originalTask.status !== formData.status) {
        const column = MOCK_DATA.columns.find(col => col.id === `col-${formData.status}`);
        const columnName = column ? column.title : formData.status;
        addActivityLogEntry('Sankalp Tiwari', `moved '${formData.title}' to ${columnName}`, 'moved', 'Board');
      }

      showToast('Changes saved successfully!');
      
      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('boardStateChanged'));
      
      // Close modal after a short delay
      setTimeout(closeModal, 500);
    } else {
      showToast('Failed to save changes', 'error');
    }
  } catch (error) {
    console.error('Error saving task:', error);
    showToast('An error occurred while saving', 'error');
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

  // Confirm deletion
  if (!confirm(`Are you sure you want to delete "${task.title}"?`)) {
    return;
  }

  try {
    const success = deleteTask(currentTaskId);
    
    if (success) {
      showToast('Task deleted successfully');
      
      // Log activity
      addActivityLogEntry('Sankalp Tiwari', `deleted '${task.title}'`, 'deleted', 'Board');
      
      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('boardStateChanged'));
      
      // Close modal
      closeModal();
    } else {
      showToast('Failed to delete task', 'error');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    showToast('An error occurred while deleting', 'error');
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

  // Create modal if it doesn't exist
  let modal = document.getElementById('task-editor-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.innerHTML = createModalHTML();
    document.body.appendChild(modal.firstElementChild);
    
    // Bind event listeners
    bindEventListeners();
  }

  // Populate assignee dropdown
  populateAssigneeDropdown();

  // Populate modal with task data
  populateModal(taskId);

  // Show modal
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus title input
  setTimeout(() => {
    const titleInput = document.getElementById('task-editor-title');
    if (titleInput) {
      titleInput.focus();
      titleInput.select();
    }
  }, 100);
}

/**
 * Closes the modal.
 */
export function closeModal() {
  const modal = document.getElementById('task-editor-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    currentTaskId = null;
  }
}

/**
 * Binds event listeners to modal elements.
 */
function bindEventListeners() {
  // Close button
  document.getElementById('task-editor-close')?.addEventListener('click', closeModal);
  
  // Backdrop click
  document.getElementById('task-editor-backdrop')?.addEventListener('click', closeModal);
  
  // Cancel button
  document.getElementById('task-editor-cancel-btn')?.addEventListener('click', closeModal);
  
  // Save button
  document.getElementById('task-editor-save-btn')?.addEventListener('click', saveTask);
  
  // Delete buttons
  document.getElementById('task-editor-delete-btn')?.addEventListener('click', deleteCurrentTask);
  document.getElementById('task-editor-delete')?.addEventListener('click', deleteCurrentTask);
  
  // Add subtask button
  document.getElementById('task-editor-add-subtask-btn')?.addEventListener('click', addNewSubtask);
  
  // Add subtask on Enter key
  document.getElementById('task-editor-new-subtask')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewSubtask();
    }
  });

  // Update status badge when status changes
  document.getElementById('task-editor-status')?.addEventListener('change', (e) => {
    const statusBadge = document.getElementById('task-editor-status-badge');
    if (statusBadge) {
      statusBadge.textContent = getStatusLabel(e.target.value);
      statusBadge.className = `task-editor-status-badge status-${e.target.value}`;
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('task-editor-modal')?.classList.contains('open')) return;
    
    if (e.key === 'Escape') {
      closeModal();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      saveTask();
    }
  });
}

/**
 * Escapes HTML special characters.
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export for use in main.js
export { openTaskEditor as openSidePeek };
