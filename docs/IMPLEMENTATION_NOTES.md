# Developer Implementation Notes & Architecture Guide

This document captures architectural trade-offs, known limitations, extension points, and guides for developers onboarding onto the **Project Management Board** codebase.

---

## 1. Core Architecture Decisions & Trade-offs

### 1.1. No Build Framework (Vanilla ESM)
*   **Decision**: The project utilizes native ES6 JavaScript modules loaded directly in the browser via `<script type="module">`.
*   **Trade-off**:
    *   *Pros*: Zero build time, instant local debugging, no complex setup configurations (Webpack, Babel, or Vite).
    *   *Cons*: No bundling optimization (dead-code elimination, tree-shaking, asset compilation), no CSS nesting/pre-processors (like SASS), and lack of polyfills for legacy web browsers.

### 1.2. LocalStorage as DB Engine
*   **Decision**: State data is serialized and stored directly in the browser's `localStorage`.
*   **Trade-off**:
    *   *Pros*: Zero backend overhead, offline-first execution, and simple database CRUD wrapper utilities.
    *   *Cons*: Limited to ~5MB storage per origin. If a user clears their browser cache, project data is lost. No multi-user real-time collaboration.

### 1.3. Unidirectional Re-rendering Pattern
*   **Decision**: On any state change, the main event subscriber (`boardStateChanged` in `main.js`) triggers a complete DOM redraw of all active panels.
*   **Trade-off**:
    *   *Pros*: Guarantee of synchronization. No complex state sync issues between views.
    *   *Cons*: Rendering performance decreases as task counts grow. Re-creating hundreds of DOM nodes on every keypress (during auto-save) can trigger layout shifts if not properly debounced.

---

## 2. Key Extension Points

### 2.1. Adding a New View Tab
To add a new view tab (e.g., "Settings View" or "Sprint Settings"):
1.  **HTML Layout**: Add a new button in `index.html` inside the sidebar navigation `.sidebar-nav` container with a `data-section="sprint-settings"` attribute. Add a corresponding view panel `<div class="view-container" id="sprint-settings-view">`.
2.  **Navigation Wiring**: The nav-item click handler in `main.js` will automatically switch views by toggling `.active` classes based on `data-section`.
3.  **State Recovery**: Add the new view key to the `restorePersistedState()` handler in `main.js`.

### 2.2. Adding a Database Entity
To add a new state model entity (e.g., "Labels" or "Milestones"):
1.  **Update Default Schema**: Add the initial dictionary/array to `DEFAULT_STATE` inside `js/data.js`.
2.  **Migration Script**: Increment the migration version code and add an updater step in `migrateData()` in `data.js` to ensure legacy client caches receive the new schema keys.
3.  **CRUD API**: Write accessor wrappers (e.g., `createLabel()`, `deleteLabel()`) in `js/data.js` that call `saveMockData()` internally.

---

## 3. Known Limitations & Edge Cases

1.  **Multi-tab Synchronization Conflict**: If a developer has the board open in two browser tabs and modifies tasks in both, updates in one tab will override the other on save because the local storage operations are synchronous and do not merge state changes dynamically.
2.  **Auto-save Debounce Boundary**: Auto-saving in the side-peek task editor is debounced by 1000ms. If a user types into the task description and immediately hits the close button or presses Esc, the debounce timeout is cleared, but a validation check runs to capture any unsaved edits.
3.  **CSS Reflow in Responsive Layouts**: Moving columns or resizing the browser window on mobile layouts relies on flexbox wrapping. On viewports below 480px, columns stack vertically, and task editors slide up as full-screen modal overlays to improve tap targeting.
