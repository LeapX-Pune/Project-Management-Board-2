# Responsive Implementation Plan

## Breakpoints Strategy
- **Mobile**: `<= 480px`
- **Tablet**: `481px - 768px`
- **Desktop**: `>= 769px`

---

## 1. Navigation Architecture
- **Current**: Fixed left sidebar.
- **Tablet (`481px - 768px`)**: Collapse sidebar to icon-only state (`width: 64px`). Hover expands the sidebar as an overlay if needed.
- **Mobile (`<= 480px`)**: Hide sidebar completely. Implement a fixed **Bottom Navigation Bar** with 4-5 primary icons (Dashboard, Board, Calendar, Team). 
- **Impact**: Provides a native app-like experience and maximizes horizontal screen space.

## 2. Kanban Board
- **Current**: Horizontal scrolling flex container.
- **Tablet**: Allow horizontal scroll, but ensure column widths are at least `280px` to prevent extreme squishing. 
- **Mobile**: 
  - **Layout**: Show only one column at a time.
  - **Redesign**: Add a horizontal tab/pill navigation at the top to switch between columns (To Do | In Progress | Done).
  - **Interactions**: Remove drag-and-drop dependency. Add a `...` action menu on each card to allow state transitions via dropdown.
- **Impact**: Solves touch interaction failures and prevents horizontal scrolling fatigue.

## 3. Dashboard & Analytics
- **Current**: CSS Grid / Flex row layout.
- **Tablet**: Convert 4-column statistic cards to a 2x2 grid. 
- **Mobile**: 
  - Stack all charts and statistic cards in a single vertical column (`100%` width).
  - Use `aspect-ratio` or fixed height for charts to prevent layout shift during loading.
- **Impact**: Ensures data visualizations remain readable without horizontal scrolling.

## 4. Calendar
- **Current**: Desktop monthly grid.
- **Tablet**: Maintain grid but hide task titles (show only coloured dots/indicators for tasks). Tap day to view tasks.
- **Mobile**:
  - **Redesign**: Replace grid with a vertical **Agenda View**.
  - Show a horizontally scrollable week strip at the top to select days.
  - Selected day displays a vertical list of task cards below.
- **Impact**: Makes the calendar usable on narrow screens where a 7-column grid fails.

## 5. Task Editor / Team Modals
- **Current**: Right-side peek drawer or centered modal.
- **Tablet**: Center modal with `width: 80%`.
- **Mobile**: 
  - **Redesign**: Convert to a **Bottom Sheet** (sliding up from the bottom) taking 90-95% of the viewport height. 
  - Include a sticky header with a "Save" and "Close" button.
  - Ensure the virtual keyboard does not obscure input fields by using `padding-bottom` and scrolling containers.
- **Impact**: Easier to reach with thumbs, feels like a native mobile interaction.
