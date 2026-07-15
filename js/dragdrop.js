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
      const clone = dragSource.cloneNode(true);
      clone.classList.remove('dragging');
      dragSource.remove();
      taskList.appendChild(clone);

      const countSpan = column.querySelector('.column-count');
      if (countSpan) {
        countSpan.textContent = taskList.querySelectorAll('.task-card').length;
      }
    }

    document.querySelectorAll('.task-list').forEach(el => el.classList.remove('drag-over'));
    dragSource = null;
  });
}

export { initDragDrop };
