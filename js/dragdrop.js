import { MOCK_DATA, addActivityLogEntry } from './data.js';

let dragSource = null;

function initDragDrop() {
  document.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.task-card');
    if (!card) return;

    dragSource = card;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  document.addEventListener('dragend', (e) => {
    const card = e.target.closest('.task-card');
    if (!card) return;

    card.classList.remove('dragging');
    document.querySelectorAll('.task-list').forEach(el => el.classList.remove('drag-over'));
    dragSource = null;
  });

  document.addEventListener('dragover', (e) => {
    const taskList = e.target.closest('.task-list');
    if (!taskList) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    document.querySelectorAll('.task-list').forEach(el => {
      if (el !== taskList) el.classList.remove('drag-over');
    });
    taskList.classList.add('drag-over');
  });

  document.addEventListener('dragleave', (e) => {
    const taskList = e.target.closest('.task-list');
    if (!taskList) return;
    taskList.classList.remove('drag-over');
  });

  document.addEventListener('drop', (e) => {
    const taskList = e.target.closest('.task-list');
    if (!taskList || !dragSource) return;

    e.preventDefault();

    const column = taskList.closest('.column');
    if (column && dragSource) {
      const taskId = dragSource.dataset.taskId;
      const targetColumnId = column.dataset.columnId;
      const taskTitle = dragSource.querySelector('.task-title')?.textContent || 'Unnamed Task';
      const columnTitle = column.querySelector('.column-title')?.textContent || 'Unknown Column';

      const sourceColumn = MOCK_DATA.columns.find(col => col.taskIds.includes(taskId));
      const targetColumn = MOCK_DATA.columns.find(col => col.id === targetColumnId);

      if (sourceColumn && targetColumn && sourceColumn.id !== targetColumnId) {
        // Move task in model
        sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== taskId);
        targetColumn.taskIds.push(taskId);

        if (MOCK_DATA.tasks[taskId]) {
          MOCK_DATA.tasks[taskId].status = targetColumnId;
        }

        // Log task movement
        addActivityLogEntry('Alice Chen', `moved '${taskTitle}' to ${columnTitle}`, 'moved', 'Board');

        // Dispatch event to re-render all views
        window.dispatchEvent(new CustomEvent('boardStateChanged'));
      }
    }

    document.querySelectorAll('.task-list').forEach(el => el.classList.remove('drag-over'));
    dragSource = null;
  });
}

export { initDragDrop };
