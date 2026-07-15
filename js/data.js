const MOCK_DATA = {
  columns: [
    { id: 'col-backlog', title: 'Backlog', taskIds: ['task-1', 'task-2'] },
    { id: 'col-todo', title: 'To Do', taskIds: ['task-3'] },
    { id: 'col-in-progress', title: 'In Progress', taskIds: ['task-4'] },
    { id: 'col-review', title: 'Review', taskIds: ['task-5'] },
    { id: 'col-done', title: 'Done', taskIds: ['task-6'] },
  ],
  tasks: {
    'task-1': { id: 'task-1', title: 'Design landing page', description: 'Create mockup and component list for the new landing page', assignee: 'alice', dueDate: '2026-08-15', priority: 'high', status: 'backlog' },
    'task-2': { id: 'task-2', title: 'Research API options', description: 'Evaluate REST vs GraphQL for the backend service', assignee: 'bob', dueDate: '2026-08-20', priority: 'low', status: 'backlog' },
    'task-3': { id: 'task-3', title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment', assignee: 'carol', dueDate: '2026-07-25', priority: 'medium', status: 'todo' },
    'task-4': { id: 'task-4', title: 'Implement user auth', description: 'Add JWT-based authentication with refresh tokens', assignee: 'alice', dueDate: '2026-07-20', priority: 'high', status: 'in-progress' },
    'task-5': { id: 'task-5', title: 'Code review: payment module', description: 'Review the payment integration PR from the team', assignee: 'dave', dueDate: '2026-07-18', priority: 'medium', status: 'review' },
    'task-6': { id: 'task-6', title: 'Write unit tests for utils', description: 'Achieve 90% coverage on utility functions', assignee: 'carol', dueDate: '2026-07-10', priority: 'low', status: 'done' },
  },
  members: {
    alice: { name: 'Alice Chen', color: '#7C3AED' },
    bob: { name: 'Bob Smith', color: '#3B82F6' },
    carol: { name: 'Carol Davis', color: '#10B981' },
    dave: { name: 'Dave Wilson', color: '#F59E0B' },
  },
  activityLog: [
    { timestamp: '2026-07-15T09:30:00', user: 'Alice Chen', action: 'moved "Implement user auth" to In Progress' },
    { timestamp: '2026-07-15T08:15:00', user: 'Carol Davis', action: 'created "Setup CI/CD pipeline"' },
    { timestamp: '2026-07-14T16:45:00', user: 'Bob Smith', action: 'updated deadline on "Research API options"' },
  ],
};
