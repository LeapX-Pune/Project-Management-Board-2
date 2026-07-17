// Define the default JSON structure for tasks and columns
export const DEFAULT_STATE = {
  columns: [
    { id: 'col-backlog', title: 'Backlog', taskIds: [] },
    { id: 'col-todo', title: 'To Do', taskIds: [] },
    { id: 'col-in-progress', title: 'In Progress', taskIds: [] },
    { id: 'col-review', title: 'Review', taskIds: [] },
    { id: 'col-done', title: 'Done', taskIds: [] },
  ],
  tasks: {},
  activityLog: [],
  members: {
    alice: { name: 'Alice Chen', color: '#7C3AED' },
    bob: { name: 'Bob Smith', color: '#3B82F6' },
    carol: { name: 'Carol Davis', color: '#10B981' },
    dave: { name: 'Dave Wilson', color: '#F59E0B' },
  }
};

const STORAGE_KEY = 'pm-board-state';

/**
 * Loads the state from localStorage.
 * If no state is found, it returns a deep copy of DEFAULT_STATE.
 */
export function loadState() {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

/**
 * Saves the current state to localStorage.
 */
export function saveState(state) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

// Create a singleton state object that can be mutated and saved
export let appState = loadState();
