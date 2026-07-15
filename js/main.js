import { MOCK_DATA } from './data.js';
import { renderBoard, renderActivity, renderTable, renderList } from './ui.js';
import { initDragDrop } from './dragdrop.js';

function init() {
  renderBoard(MOCK_DATA);
  renderActivity(MOCK_DATA.activityLog);
  renderTable(MOCK_DATA);
  renderList(MOCK_DATA);
  initDragDrop();
  wireEventListeners();
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

  const sidePeekTriggers = document.querySelectorAll('[data-action="edit"]');
  sidePeekTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('side-peek').classList.add('open');
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

  document.getElementById('activity-close')?.addEventListener('click', () => {
    document.getElementById('activity-sidebar').classList.toggle('open');
  });

  document.getElementById('add-column-btn')?.addEventListener('click', () => {
    const board = document.getElementById('board-container');
    const colId = 'col-new-' + Date.now();
    const newCol = document.createElement('article');
    newCol.className = 'column';
    newCol.dataset.columnId = colId;
    newCol.innerHTML = `
      <div class="column-header">
        <div class="column-header-left">
          <h2 class="column-title">New Column</h2>
          <span class="column-count">0</span>
        </div>
        <div class="column-options">
          <button class="column-option-btn" aria-label="Rename column">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 1.5L12.5 4L4.5 12H2V9.5L10 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
          </button>
          <button class="column-option-btn destructive" aria-label="Delete column">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5H12M5 3.5V2C5 1.72386 5.22386 1.5 5.5 1.5H8.5C8.77614 1.5 9 1.72386 9 2V3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
      <ul class="task-list"></ul>
    `;
    const addBtn = board.querySelector('.add-column-placeholder');
    board.insertBefore(newCol, addBtn);
  });
}

document.addEventListener('DOMContentLoaded', init);
