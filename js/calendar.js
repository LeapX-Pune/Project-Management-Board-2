import { MOCK_DATA, TEAM_MEMBERS } from './data.js';
import { openTaskEditor } from './task-editor-modal.js';

let currentYear, currentMonth, selectedDateKey;
let currentView = 'month';
let focusDate = new Date();

export function initCalendar() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  focusDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  bindNavButtons();
  bindViewToggles();
  bindContentClicks();
  updateViewToggle();
  renderCalendar();
}

function bindNavButtons() {
  document.querySelector('.calendar-nav-prev')?.addEventListener('click', () => {
    navigate(-1);
  });

  document.querySelector('.calendar-nav-next')?.addEventListener('click', () => {
    navigate(1);
  });

  document.getElementById('calendar-today-btn')?.addEventListener('click', () => {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    focusDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    currentView = 'month';
    updateViewToggle();
    renderCalendar();
    const todayKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    selectDay(todayKey);
  });
}

function bindViewToggles() {
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const newView = e.currentTarget.dataset.view;
      if (['month', 'week', 'day'].includes(newView)) {
        currentView = newView;
        updateViewToggle();
        renderCalendar();
        clearDayPanel();
      }
    });
  });
}

function updateViewToggle() {
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    const isActive = btn.dataset.view === currentView;
    btn.classList.toggle('active', isActive);
  });

  ['month', 'week', 'day'].forEach(view => {
    const content = document.getElementById(`calendar-content-${view}`);
    if (content) {
      content.style.display = view === currentView ? 'block' : 'none';
    }
  });
}

function bindContentClicks() {
  document.addEventListener('click', (e) => {
    const eventEl = e.target.closest('.calendar-event');
    if (eventEl) {
      const taskId = eventEl.dataset.taskId;
      if (taskId) openTaskSidePeek(taskId);
    }

    const dayEl = e.target.closest('.calendar-day, .calendar-week-day, .calendar-day-column');
    if (!dayEl) return;

    const dateKey = dayEl.dataset.dateKey;
    if (!dateKey) return;

    if (dayEl.classList.contains('other-month')) {
      const [y, m, d] = dateKey.split('-').map(Number);
      if (d > 15) {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      } else {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      }
      renderCalendar();
    }

    selectDay(dateKey);
  });

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('#calendar-day-add-btn, #calendar-day-add-task');
    if (addBtn) {
      const modal = document.getElementById('task-modal');
      const dateInput = document.getElementById('task-dueDate');
      if (dateInput && selectedDateKey) dateInput.value = selectedDateKey;
      if (modal) modal.classList.add('open');
    }
  });
}

function navigate(direction) {
  if (currentView === 'month') {
    currentMonth += direction;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  } else if (currentView === 'week') {
    focusDate.setDate(focusDate.getDate() + (7 * direction));
    currentYear = focusDate.getFullYear();
    currentMonth = focusDate.getMonth();
  } else if (currentView === 'day') {
    focusDate.setDate(focusDate.getDate() + direction);
    currentYear = focusDate.getFullYear();
    currentMonth = focusDate.getMonth();
  }
  renderCalendar();
  clearDayPanel();
}

function openTaskSidePeek(taskId) {
  const task = MOCK_DATA.tasks[taskId];
  if (!task) return;

  openTaskEditor(taskId);
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES_SHORT = MONTH_NAMES.map(m => m.substring(0, 3));

function getTasksByDate() {
  const map = {};
  Object.values(MOCK_DATA.tasks).forEach(task => {
    if (!task.dueDate) return;
    if (!map[task.dueDate]) map[task.dueDate] = [];
    map[task.dueDate].push(task);
  });
  return map;
}

function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function renderCalendar() {
  if (currentView === 'month') {
    renderMonthView();
  } else if (currentView === 'week') {
    renderWeekView();
  } else if (currentView === 'day') {
    renderDayView();
  }
}

function getTaskPriorityClass(task) {
  return task.priority || 'medium';
}

// ===================== MONTH VIEW =====================

function renderMonthView() {
  const container = document.getElementById('calendar-content-month');
  if (!container) return;

  const label = document.createElement('div');
  label.className = 'calendar-month-label';
  label.id = 'calendar-month-label';
  label.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  const weekdays = document.createElement('div');
  weekdays.className = 'calendar-weekdays';
  weekdays.innerHTML = DAY_NAMES.map(d => `<div class="calendar-weekday">${d}</div>`).join('');

  const grid = document.createElement('div');
  grid.className = 'calendar-month-grid';
  grid.id = 'calendar-month-grid';

  const tasksByDate = getTasksByDate();
  const todayKey = getTodayKey();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  const startDow = firstDayOfMonth.getDay();

  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const days = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, dateKey, otherMonth: true });
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, dateKey, otherMonth: false });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    for (let d = 1; d <= remaining; d++) {
      const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateKey, otherMonth: true });
    }
  }

  grid.innerHTML = days.map(({ day, dateKey, otherMonth }) => {
    const todayClass = dateKey === todayKey ? ' today' : '';
    const otherClass = otherMonth ? ' other-month' : '';
    const tasksOnDay = tasksByDate[dateKey] || [];
    const MAX_VISIBLE = 3;
    const eventHtml = tasksOnDay.slice(0, MAX_VISIBLE).map(t => {
      const title = t.title.length > 18 ? t.title.substring(0, 16) + '…' : t.title;
      return `<div class="calendar-event ${getTaskPriorityClass(t)}" data-task-id="${t.id}">${title}</div>`;
    }).join('');
    const moreCount = tasksOnDay.length - MAX_VISIBLE;
    const moreHtml = moreCount > 0 ? `<div class="calendar-event-more">+${moreCount} more</div>` : '';
    const selectedClass = dateKey === selectedDateKey ? ' selected' : '';

    return `
      <div class="calendar-day${todayClass}${otherClass}${selectedClass}" data-date-key="${dateKey}">
        <div class="calendar-day-number">${day}</div>
        ${eventHtml}${moreHtml}
      </div>
    `;
  }).join('');

  container.innerHTML = '';
  container.appendChild(label);
  container.appendChild(weekdays);
  container.appendChild(grid);

  if (selectedDateKey) updateDayPanel(selectedDateKey);
}

// ===================== WEEK VIEW =====================

function renderWeekView() {
  const container = document.getElementById('calendar-content-week');
  if (!container) return;

  const label = document.createElement('div');
  label.className = 'calendar-month-label';
  label.id = 'calendar-week-label';
  label.textContent = getWeekRangeLabel();

  const grid = document.createElement('div');
  grid.className = 'calendar-week-grid';

  const weekDays = getWeekDays();
  const tasksByDate = getTasksByDate();

  grid.innerHTML = weekDays.map(({ date, dateKey, isToday, isCurrentMonth }) => {
    const tasksOnDay = tasksByDate[dateKey] || [];
    const todayClass = isToday ? ' today' : '';
    const otherClass = !isCurrentMonth ? ' other-month' : '';
    const selectedClass = dateKey === selectedDateKey ? ' selected' : '';

    const eventsHtml = tasksOnDay.map(t => {
      const title = t.title.length > 12 ? t.title.substring(0, 10) + '…' : t.title;
      return `<div class="calendar-event ${getTaskPriorityClass(t)}" data-task-id="${t.id}">${title}</div>`;
    }).join('');

    return `
      <div class="calendar-week-day${todayClass}${otherClass}${selectedClass}" data-date-key="${dateKey}">
        <div class="calendar-week-day-header">
          <div class="calendar-week-day-name">${DAY_NAMES[date.getDay()]}</div>
          <div class="calendar-week-day-number">${date.getDate()}</div>
        </div>
        <div class="calendar-week-day-events">
          ${eventsHtml}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = '';
  container.appendChild(label);
  container.appendChild(grid);

  if (selectedDateKey) updateDayPanel(selectedDateKey);
}

function getWeekDays() {
  const dayOfWeek = focusDate.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(focusDate);
  monday.setDate(focusDate.getDate() - diffToMonday);

  const days = [];
  const todayKey = getTodayKey();

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    days.push({
      date,
      dateKey,
      isToday: dateKey === todayKey,
      isCurrentMonth: date.getMonth() === currentMonth
    });
  }

  return days;
}

function getWeekRangeLabel() {
  const weekDays = getWeekDays();
  const start = weekDays[0].date;
  const end = weekDays[6].date;
  const startLabel = `${MONTH_NAMES_SHORT[start.getMonth()]} ${start.getDate()}`;
  const endLabel = `${MONTH_NAMES_SHORT[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  return `${startLabel} – ${endLabel}`;
}

// ===================== DAY VIEW =====================

function renderDayView() {
  const container = document.getElementById('calendar-content-day');
  if (!container) return;

  const refDate = focusDate;
  const dateKey = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, '0')}-${String(refDate.getDate()).padStart(2, '0')}`;
  const todayKey = getTodayKey();

  const label = document.createElement('div');
  label.className = 'calendar-month-label';
  label.id = 'calendar-day-label';
  label.textContent = `${DAY_NAMES[refDate.getDay()]}, ${MONTH_NAMES[refDate.getMonth()]} ${refDate.getDate()}, ${refDate.getFullYear()}`;

  const grid = document.createElement('div');
  grid.className = 'calendar-day-view-grid';

  const tasksByDate = getTasksByDate();
  const tasks = tasksByDate[dateKey] || [];

  const todayClass = dateKey === todayKey ? ' today' : '';
  const selectedClass = dateKey === selectedDateKey ? ' selected' : '';

  const eventsHtml = tasks.length > 0
    ? tasks.map(t => {
        const col = MOCK_DATA.columns.find(c => c.taskIds.includes(t.id));
        const statusLabel = col ? col.title : 'Backlog';
        const priorityClass = getTaskPriorityClass(t);
        const member = TEAM_MEMBERS ? TEAM_MEMBERS.find(m => m.id === t.assignee) : null;
        const initials = member ? getMemberInitials(member.name) : '?';
        return `
          <div class="calendar-day-event ${priorityClass}" data-task-id="${t.id}">
            <div class="calendar-day-event-time">
              <span class="priority-dot priority-${priorityClass}"></span>
              <span class="calendar-day-event-priority">${priorityClass}</span>
            </div>
            <div class="calendar-day-event-body">
              <div class="calendar-day-event-title">${t.title}</div>
              <div class="calendar-day-event-meta">
                <span class="calendar-day-event-status status-${statusLabel.replace(/s+$/, '').toLowerCase()}">${statusLabel}</span>
                ${initials ? `<span class="avatar calendar-day-event-avatar">${initials}</span>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('')
    : '<div class="calendar-day-empty">No tasks due on this day</div>';

  grid.innerHTML = `
    <div class="calendar-day-column${todayClass}${selectedClass}" data-date-key="${dateKey}">
      <div class="calendar-day-column-header">
        <div class="calendar-day-column-date">${MONTH_NAMES[refDate.getMonth()].substring(0, 3)} ${refDate.getDate()}</div>
      </div>
      <div class="calendar-day-column-events">
        ${eventsHtml}
      </div>
    </div>
  `;

  container.innerHTML = '';
  container.appendChild(label);
  container.appendChild(grid);

  if (selectedDateKey) updateDayPanel(selectedDateKey);
}

// ===================== DAY PANEL =====================

function selectDay(dateKey) {
  selectedDateKey = dateKey;
  document.querySelectorAll('.calendar-day.selected, .calendar-week-day.selected, .calendar-day-column.selected').forEach(el => {
    el.classList.remove('selected');
  });
  const dayEl = document.querySelector(`[data-date-key="${dateKey}"]`);
  if (dayEl) dayEl.classList.add('selected');
  updateDayPanel(dateKey);

  if (window.innerWidth <= 768) {
    const panel = document.getElementById('calendar-day-panel');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

function clearDayPanel() {
  selectedDateKey = null;
  document.querySelectorAll('.calendar-day.selected, .calendar-week-day.selected, .calendar-day-column.selected').forEach(el => {
    el.classList.remove('selected');
  });
  const panel = document.getElementById('calendar-day-panel');
  if (panel) {
    panel.innerHTML = `
      <div class="calendar-day-panel-empty flex-center" style="flex-direction: column; gap: var(--space-xs); padding: var(--space-xl) var(--space-sm);">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-text-subtle); opacity: 0.7;">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        <div style="font-weight: 600; color: var(--color-text); font-size: 0.875rem;">Tap a day to see tasks</div>
      </div>
    `;
  }
}

function updateDayPanel(dateKey) {
  const panel = document.getElementById('calendar-day-panel');
  if (!panel) return;

  const tasks = Object.values(MOCK_DATA.tasks).filter(t => t.dueDate === dateKey);
  const [y, m, d] = dateKey.split('-').map(Number);
  const dateLabel = `${DAY_NAMES[new Date(y, m - 1, d).getDay()]}, ${MONTH_NAMES[m - 1]} ${d}, ${y}`;

  const statusOrder = { 'backlog': 0, 'in-progress': 1, 'review': 2, 'done': 3 };
  const sorted = tasks.sort((a, b) => {
    const sa = statusOrder[a.status] ?? 4;
    const sb = statusOrder[b.status] ?? 4;
    if (sa !== sb) return sa - sb;
    return (a.priority === 'high' ? 0 : a.priority === 'medium' ? 1 : 2) -
           (b.priority === 'high' ? 0 : b.priority === 'medium' ? 1 : 2);
  });

  const emptyStateHtml = `
    <div class="calendar-day-panel-empty flex-center" style="flex-direction: column; gap: var(--space-xs); padding: var(--space-lg) var(--space-sm);">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-text-subtle); opacity: 0.7;">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
      <div style="font-weight: 600; color: var(--color-text); font-size: 0.875rem;">No tasks scheduled</div>
      <div style="font-size: 0.75rem; color: var(--color-text-muted); text-align: center;">Tap the button below to add a new task for this day.</div>
    </div>
  `;

  panel.innerHTML = `
    <div class="calendar-day-panel-header">
      <span class="calendar-day-panel-date">${dateLabel}</span>
      <span class="calendar-day-panel-count">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</span>
    </div>
    <div class="calendar-day-panel-tasks">
      ${sorted.length > 0 ? sorted.map(task => renderPanelTaskItem(task)).join('') : emptyStateHtml}
    </div>
    <button class="calendar-day-panel-add-btn" id="calendar-day-add-btn">+ Add Task for This Day</button>
  `;

  panel.querySelectorAll('.calendar-panel-task').forEach(el => {
    el.addEventListener('click', () => {
      const taskId = el.dataset.taskId;
      if (taskId) openTaskSidePeek(taskId);
    });
  });
}

function renderPanelTaskItem(task) {
  const col = MOCK_DATA.columns.find(c => c.taskIds.includes(task.id));
  const statusLabel = col ? col.title : 'Backlog';
  const priorityClass = getTaskPriorityClass(task);
  const member = TEAM_MEMBERS ? TEAM_MEMBERS.find(m => m.id === task.assignee) : null;
  const initials = member ? getMemberInitials(member.name) : '?';

  return `
    <div class="calendar-panel-task ${priorityClass}" data-task-id="${task.id}">
      <div class="calendar-panel-task-left">
        <div class="calendar-panel-task-status">
          <span class="status-dot status-${statusLabel.replace(/s+$/, '').toLowerCase()}"></span>
          <span class="status-text">${statusLabel}</span>
        </div>
        <div class="calendar-panel-task-title">${task.title}</div>
        ${task.subtasks && task.subtasks.length > 0 ? `
          <div class="calendar-panel-task-subtasks">${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} subtasks</div>
        ` : ''}
      </div>
      <div class="calendar-panel-task-right">
        <div class="calendar-panel-task-priority priority-${priorityClass}">${priorityClass}</div>
        ${initials ? `<div class="avatar calendar-panel-avatar">${initials}</div>` : ''}
      </div>
    </div>
  `;
}

function getMemberInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

export function renderCalendarExport() {
  renderCalendar();
}

export function refreshCalendar() {
  renderCalendar();
  if (selectedDateKey) updateDayPanel(selectedDateKey);
}