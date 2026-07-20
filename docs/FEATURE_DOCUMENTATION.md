# Feature Documentation: Modules & Systems

This document explains the purpose, implementation details, data sources, and rendering flows of every major module in the **Project Management Board** application.

---

## 1. Dashboard Overview

*   **Purpose**: Provides a high-level summary of active sprints, key progress trends, recent activity, and team statuses.
*   **Files Involved**:
    *   `index.html` (Layout container: `#dashboard-view`, metrics cards, SVG grid)
    *   `js/ui.js` (`renderDashboardMetrics`, `renderKPICards`, `renderWeeklyLineGraph`, `renderRecentActivity`)
    *   `js/main.js` (Event subscriber)
*   **Implementation Logic**:
    *   **Metric Cards**: Dynamically filters tasks in `MOCK_DATA.tasks` to calculate Total, Completed, In Progress, and Overdue tasks.
    *   **KPI Easing Animations**: Real-time numerical counter increases/decreases are rendered using ease-out cubic interpolation (`animateValue`) inside `ui.js` over 500ms intervals via `requestAnimationFrame`.
    *   **Trend Badges**: Up/down trend indicators are computed dynamically by comparing today's status metrics against yesterday's metrics (`updateTrend`).
    *   **Weekly Line Graph**: Renders a dynamic vector path (`<path class="line-path">` and `<polygon class="area-fill">`) inside an SVG element. The chart caches its computed point coordinates in `localStorage` under `dashboard-weekly-data` to prevent excessive coordinate math on view changes. It plots the count of activity events generated over the past 7 days.
    *   **Recent Activity**: Renders the 6 most recent timeline items from `MOCK_DATA.activityLog` complete with user initials, color badges, action descriptors, and helper indicators for task state transitions (created, moved, edited).

---

## 2. Kanban Board Workspace

*   **Purpose**: Primary task interaction grid where columns represent status pipelines and cards represent individual tasks.
*   **Files Involved**:
    *   `index.html` (Workspace container: `#workspace-view` -> `#board-container`)
    *   `js/ui.js` (`renderBoard`, `createColumn`, `createTaskCard`)
    *   `js/dragdrop.js` (HTML5 Drag & Drop handlers)
    *   `js/main.js` (Rename and delete listeners, state syncing)
*   **Implementation Logic**:
    *   **DOM Generation**: `renderBoard()` clears the container and iterates through columns in `MOCK_DATA.columns`. Each column calls `createColumn()`, which appends individual task list items generated via `createTaskCard()`.
    *   **Drag & Drop**: Native drag events (`dragstart`, `dragover`, `dragleave`, `drop`) are initialized on all cards via `initDragDrop()` in `dragdrop.js`. When a card is dropped:
        1.  The card element is appended to the target column's list element in the DOM.
        2.  `syncBoardDOMToState()` is invoked. It reads the new DOM order, maps column IDs (e.g. `col-in-progress`) to task statuses (`in-progress`), updates `MOCK_DATA.tasks`, and saves to storage.
        3.  A `boardStateChanged` event is dispatched.
    *   **Priority Color Coding**: Priority levels map to custom utility classes (`high`, `medium`, `low`) that style badges using background values configured in CSS variables.

---

## 3. Team Member Module & Management CRUD

*   **Purpose**: Manages the project's developer directory, assigns avatar tags, evaluates task loads, and edits profiles.
*   **Files Involved**:
    *   `index.html` (Grid container `#team-view`, Modal form `#member-modal`)
    *   `js/data.js` (`TEAM_MEMBERS` array, `addMember`, `updateMember`, `deleteMember`)
    *   `js/ui.js` (`renderTeam`, `renderMemberList`, `renderHeaderTeamList`, `populateAssigneeSelects`)
    *   `js/main.js` (Modal triggers, form handlers, input validation)
*   **Implementation Logic**:
    *   **Team View**: Renders member profile blocks. Individual cards display the developer's role, availability status, active task progress ratios, and workload bars.
    *   **Management Modal**: Toggled via `#manage-team-btn`. Displays an editable table of team members (`renderMemberList`) side-by-side with an input form.
    *   **Input Validation**: `handleMemberFormSubmit` checks fields before saving:
        *   Checks for empty names.
        *   Regex-checks email addresses (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
        *   Verifies image link URLs.
        If validation fails, `.has-error` classes are applied to style the inputs in red, and error messages are rendered dynamically.
    *   **Header Avatar Strip**: A visual avatar stack (`#header-team-group`) is rendered on the top header, indicating who is currently assigned to this sprint project.

---

## 4. Calendar View

*   **Purpose**: Visual grid for checking due dates, scheduling tasks, and viewing monthly workloads.
*   **Files Involved**:
    *   `index.html` (Container: `#calendar-view`)
    *   `js/calendar.js` (`initCalendar`, `renderCalendarGrid`, `refreshCalendar`)
    *   `js/main.js` (Event integration)
*   **Implementation Logic**:
    *   **Date Calculations**: Generates a standard monthly layout grid. It computes the offset days of the previous month needed to pad the grid, fills in all active days of the target month, and appends padding days for the next month to create a consistent grid of 35 or 42 cells.
    *   **Event Plotting**: Iterates through tasks in `MOCK_DATA.tasks`. Tasks containing valid due dates matching the cell's date are rendered inside the calendar cell as clickable list badges, styled with priority markers.
    *   **Navigation**: Supported via previous/next monthly header controls.
    *   **Interaction**: Double-clicking a day block opens the task creation modal pre-populated with that day's date. Clicking an event badge opens the Task Side-Peek drawer.

---

## 5. Analytics & Visual Reporting

*   **Purpose**: Multi-dimensional statistics dashboards including priority distributions, workloads, completion rates, and status segments.
*   **Files Involved**:
    *   `index.html` (Container: `#analytics-view`, SVG filters)
    *   `js/ui.js` (`renderQuickStats`, `renderStatusDistribution`, `renderPriorityDoughnut`, `renderMemberWorkload`, `renderMemberStatsTable`, `initAnalyticsFilters`)
*   **Implementation Logic**:
    *   **Status Distribution**: Renders a stacked progress bar with segment widths proportional to column task counts.
    *   **Doughnut Chart**: Handled via vector mathematics in `ui.js`. It calculates arc coordinates (`polarToCartesian`, `makeArcPath`) for each priority segment (High, Medium, Low), rendering a clean SVG path group. A text label is positioned in the center, reporting total tasks.
    *   **Member Workload**: Displays developer task loading metrics. Renders a horizontal bar chart where the width matches task count percentages, and the color automatically transitions from green (low load) to red (high load) using dynamic HSL color shifts (`hsl(140 - loadRatio * 120, 65%, 50%)`).
    *   **Filters**: Status and Priority filters allow developers to narrow down metrics. Changing filters triggers updates of the underlying tables and SVGs.

---

## 6. Task Edit Side-Peek Drawer

*   **Purpose**: Form drawer displaying checklist subtasks, assignees, priorities, and dates.
*   **Files Involved**:
    *   `js/task-editor-modal.js` (Core rendering, inputs, validations, checklist arrays)
    *   `js/main.js` (Open trigger listener)
    *   `css/task-editor-modal.css` (Styles and sliding animations)
*   **Implementation Logic**:
    *   **Lazy Loading**: The element `#task-editor-side-peek` is not present in index.html initially. It is dynamically generated in the DOM on the first request to edit a task, and event listeners are bound once (`bindEventListeners`).
    *   **Due Date Restriction**: Validates inputs to ensure due dates cannot be scheduled in the past, prompting errors in the UI.
    *   **Checklist Subtasks**: Subtasks are managed as checklist item inputs. Checking/unchecking a subtask updates the checkbox state in `localStorage` and re-renders the progress bar indicator (`getSubtaskProgress`).
    *   **Auto-Save**: Changes to the task title, description, assignee, priority, status, or due date trigger an auto-save loop. A debounce timer waits for 1000ms after the user stops typing, commits changes to the database, flashes a "Saved" indicator, and triggers `boardStateChanged`.
