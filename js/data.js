// State management and data logic

const STORAGE_KEY_MEMBERS = 'pm_board_team_members_v2';
const STORAGE_KEY_MOCK_DATA = 'pm_board_mock_data_v2';
const STORAGE_KEY_VERSION   = 'pm_board_data_version';
const CURRENT_DATA_VERSION  = 1;
const MAX_ACTIVITY_LOG      = 200;

const PRESET_COLORS = [
  '#7C3AED', // Violet
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#ef4444', // Red
  '#0f766e', // Teal
];

// Initial defaults
const DEFAULT_TEAM_MEMBERS = [
  { id: 'sai', name: 'Sai Shendge', email: 'sai.shendge@example.com', role: 'Frontend Developer', initials: 'SS', color: '#7C3AED', githubId: '', tasksCompleted: 4, tasksInProgress: 1, avatarUrl: '' },
  { id: 'aditya', name: 'Aditya Vawhal', email: 'aditya.vawhal@example.com', role: 'Backend Developer', initials: 'AV', color: '#3B82F6', githubId: '', tasksCompleted: 3, tasksInProgress: 2, avatarUrl: '' },
  { id: 'ankit', name: 'Ankit Bhalke', email: 'ankit.bhalke@example.com', role: 'Full Stack Developer', initials: 'AB', color: '#10B981', githubId: '', tasksCompleted: 5, tasksInProgress: 1, avatarUrl: '' },
  { id: 'devansh', name: 'Devansh Mittal', email: 'devansh.mittal@example.com', role: 'UI/UX Designer', initials: 'DM', color: '#EC4899', githubId: '', tasksCompleted: 6, tasksInProgress: 0, avatarUrl: '' },
  { id: 'khushi', name: 'Khushi Shah', email: 'khushi.shah@example.com', role: 'QA Engineer', initials: 'KS', color: '#F59E0B', githubId: '', tasksCompleted: 2, tasksInProgress: 1, avatarUrl: '' },
  { id: 'kshitij', name: 'Kshitij Das', email: 'kshitij.das@example.com', role: 'Frontend Developer', initials: 'KD', color: '#06B6D4', githubId: '', tasksCompleted: 3, tasksInProgress: 2, avatarUrl: '' },
  { id: 'rehan', name: 'Mohammed Rehan', email: 'mohammed.rehan@example.com', role: 'DevOps Engineer', initials: 'MR', color: '#ef4444', githubId: '', tasksCompleted: 2, tasksInProgress: 0, avatarUrl: '' },
  { id: 'pulak', name: 'Pulak Saha', email: 'pulak.saha@example.com', role: 'Backend Developer', initials: 'PS', color: '#0f766e', githubId: '', tasksCompleted: 4, tasksInProgress: 1, avatarUrl: '' },
  { id: 'sankalp', name: 'Sankalp Tiwari', email: 'sankalp.tiwari@example.com', role: 'Full Stack Developer', initials: 'ST', color: '#4F46E5', githubId: '', tasksCompleted: 5, tasksInProgress: 3, avatarUrl: '' },
  { id: 'sauryaman', name: 'Sauryaman Bisen', email: 'sauryaman.bisen@example.com', role: 'QA Engineer', initials: 'SB', color: '#8B5CF6', githubId: '', tasksCompleted: 1, tasksInProgress: 1, avatarUrl: '' },
  { id: 'sumit', name: 'Sumit Tiwari', email: 'sumit.tiwari@example.com', role: 'Product Manager', initials: 'SM', color: '#F97316', githubId: '', tasksCompleted: 4, tasksInProgress: 0, avatarUrl: '' },
];

const DEFAULT_MOCK_DATA = {
  columns: [
    { id: 'col-backlog',     title: 'Backlog',     taskIds: ['task-1', 'task-14', 'task-16'] },
    { id: 'col-todo',        title: 'To Do',       taskIds: ['task-5', 'task-9', 'task-12'] },
    { id: 'col-review',      title: 'Review',       taskIds: ['task-3', 'task-7'] },
    { id: 'col-in-progress', title: 'In Progress', taskIds: ['task-2', 'task-6', 'task-8', 'task-10', 'task-11'] },
    { id: 'col-done',        title: 'Done',         taskIds: ['task-4', 'task-13', 'task-15'] },
  ],
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Project Architecture & Repository Setup',
      description: 'Initialize monorepo structure, configure linting, commit conventions, and branch protection rules across all services.',
      assignee: 'ankit',
      dueDate: '2026-07-07',
      priority: 'high',
      status: 'backlog',
      subtasks: [
        { id: 'sub-1-1', text: 'Create repo scaffolding', completed: true },
        { id: 'sub-1-2', text: 'Set up CI pipeline', completed: true },
        { id: 'sub-1-3', text: 'Write CONTRIBUTING.md', completed: true },
      ],
    },
    'task-2': {
      id: 'task-2',
      title: 'Design Token System & Color Palette',
      description: 'Define semantic SCSS/CSS variables for brand colors, spacing scale, typography scale, and elevation tokens.',
      assignee: 'devansh',
      dueDate: '2026-07-09',
      priority: 'high',
      status: 'in-progress',
      subtasks: [
        { id: 'sub-2-1', text: 'Audit existing color usage', completed: true },
        { id: 'sub-2-2', text: 'Draft token spreadsheet', completed: true },
        { id: 'sub-2-3', text: 'Validate WCAG contrast ratios', completed: false },
        { id: 'sub-2-4', text: 'Get stakeholder sign-off', completed: false },
      ],
    },
    'task-3': {
      id: 'task-3',
      title: 'Database Schema & Migration Scripts',
      description: 'Model tables for users, projects, tasks, comments, and audit logs. Write up/down Flyway migrations.',
      assignee: 'pulak',
      dueDate: '2026-07-11',
      priority: 'high',
      status: 'review',
      subtasks: [
        { id: 'sub-3-1', text: 'ER diagram review', completed: true },
        { id: 'sub-3-2', text: 'Migration scripts', completed: true },
        { id: 'sub-3-3', text: 'Seed default roles', completed: false },
      ],
    },
    'task-4': {
      id: 'task-4',
      title: 'JWT Auth Flow with Refresh Tokens',
      description: 'Implement login, signup, password-reset endpoints. Issue short-lived access tokens and rotating refresh tokens.',
      assignee: 'aditya',
      dueDate: '2026-07-08',
      priority: 'high',
      status: 'done',
      subtasks: [
        { id: 'sub-4-1', text: 'bcrypt hashing', completed: true },
        { id: 'sub-4-2', text: 'JWT middleware', completed: true },
        { id: 'sub-4-3', text: 'Refresh token rotation', completed: true },
        { id: 'sub-4-4', text: 'Integration tests', completed: true },
      ],
    },
    'task-5': {
      id: 'task-5',
      title: 'Responsive Sidebar & Mobile Navigation',
      description: 'Build collapsible sidebar, hamburger drawer, and bottom nav for tablet/phone breakpoints.',
      assignee: 'sai',
      dueDate: '2026-07-14',
      priority: 'medium',
      status: 'todo',
      subtasks: [
        { id: 'sub-5-1', text: 'Desktop sidebar component', completed: false },
        { id: 'sub-5-2', text: 'Mobile drawer', completed: false },
        { id: 'sub-5-3', text: 'Route active-state logic', completed: false },
      ],
    },
    'task-6': {
      id: 'task-6',
      title: 'Kanban Drag-and-Drop on Board View',
      description: 'Wire HTML5 DnD events for moving cards between columns. Persist new column order and update task status atomically.',
      assignee: 'kshitij',
      dueDate: '2026-07-12',
      priority: 'high',
      status: 'in-progress',
      subtasks: [
        { id: 'sub-6-1', text: 'dnd-kit integration', completed: true },
        { id: 'sub-6-2', text: 'Column drop-zone visuals', completed: true },
        { id: 'sub-6-3', text: 'Optimistic update + rollback', completed: false },
      ],
    },
    'task-7': {
      id: 'task-7',
      title: 'WebSocket Realtime Subscriptions',
      description: 'Set up Socket.IO namespaces for task-update and project-update channels. Handle reconnect and missed events.',
      assignee: 'aditya',
      dueDate: '2026-07-13',
      priority: 'high',
      status: 'review',
      subtasks: [
        { id: 'sub-7-1', text: 'Namespace design', completed: true },
        { id: 'sub-7-2', text: 'Server echo test', completed: true },
        { id: 'sub-7-3', text: 'Client reconnection with backoff', completed: false },
      ],
    },
    'task-8': {
      id: 'task-8',
      title: 'Team Member CRUD Modal',
      description: 'Build the add/edit/delete member flow with avatar upload, email uniqueness check, and role assignment.',
      assignee: 'sai',
      dueDate: '2026-07-12',
      priority: 'medium',
      status: 'in-progress',
      subtasks: [
        { id: 'sub-8-1', text: 'Form validation schema', completed: true },
        { id: 'sub-8-2', text: 'Avatar preview crop', completed: false },
        { id: 'sub-8-3', text: 'Soft-delete + audit trail', completed: false },
      ],
    },
    'task-9': {
      id: 'task-9',
      title: 'Toast & Error Boundary Components',
      description: 'Create global toast provider and error boundaries for route and component-level failures with retry actions.',
      assignee: 'sankalp',
      dueDate: '2026-07-16',
      priority: 'medium',
      status: 'todo',
      subtasks: [
        { id: 'sub-9-1', text: 'Toast provider + hook', completed: false },
        { id: 'sub-9-2', text: 'Error boundary class', completed: false },
        { id: 'sub-9-3', text: 'Logging integration', completed: false },
      ],
    },
    'task-10': {
      id: 'task-10',
      title: 'Analytics Dashboard Charts',
      description: 'Implement burndown, throughput, and cumulative-flow diagrams using the shared chart primitive library.',
      assignee: 'devansh',
      dueDate: '2026-07-18',
      priority: 'medium',
      status: 'in-progress',
      subtasks: [
        { id: 'sub-10-1', text: 'Chart primitive tokens', completed: true },
        { id: 'sub-10-2', text: 'Burndown data aggregator', completed: false },
        { id: 'sub-10-3', text: 'Export to PNG/SVG', completed: false },
      ],
    },
    'task-11': {
      id: 'task-11',
      title: 'Activity Log & Audit Trail',
      description: 'Record create/update/delete/move events per task and project. Expose filterable, sortable feed in side panel.',
      assignee: 'sankalp',
      dueDate: '2026-07-15',
      priority: 'medium',
      status: 'in-progress',
      subtasks: [
        { id: 'sub-11-1', text: 'Event schema design', completed: true },
        { id: 'sub-11-2', text: 'Redux slice + selectors', completed: false },
        { id: 'sub-11-3', text: 'Pagination + infinite scroll', completed: false },
      ],
    },
    'task-12': {
      id: 'task-12',
      title: 'Command Palette (+ Keyboard Shortcuts)',
      description: 'Add Cmd+K modal with fuzzy search over tasks, members, and commands (switch view, create task, jump to project).',
      assignee: 'sankalp',
      dueDate: '2026-07-17',
      priority: 'low',
      status: 'todo',
      subtasks: [
        { id: 'sub-12-1', text: 'KBar wrapper component', completed: false },
        { id: 'sub-12-2', text: 'Global shortcut listener', completed: false },
        { id: 'sub-12-3', text: 'Custom route registration', completed: false },
      ],
    },
    'task-13': {
      id: 'task-13',
      title: 'Dark Mode & Contrast Validations',
      description: 'Ship system-aware theme toggle with persisted preference. Run axe-core scans and fix contrast + focus-ring issues.',
      assignee: 'devansh',
      dueDate: '2026-07-10',
      priority: 'medium',
      status: 'done',
      subtasks: [
        { id: 'sub-13-1', text: 'Theme context + tokens', completed: true },
        { id: 'sub-13-2', text: 'Persist to localStorage', completed: true },
        { id: 'sub-13-3', text: 'axe-core CI gate', completed: true },
      ],
    },
    'task-14': {
      id: 'task-14',
      title: 'Sprint Retro Template & Export',
      description: 'Add retros module with start/stop/continue columns, anonymous submission, and PDF export via Puppeteer.',
      assignee: 'sumit',
      dueDate: '2026-07-21',
      priority: 'low',
      status: 'backlog',
      subtasks: [],
    },
    'task-15': {
      id: 'task-15',
      title: 'Email Invitation Notifications',
      description: 'Send transactional invites via Resend with project-scoped deep links and RSVP tracking.',
      assignee: 'sumit',
      dueDate: '2026-07-09',
      priority: 'medium',
      status: 'done',
      subtasks: [
        { id: 'sub-15-1', text: 'Resend API client', completed: true },
        { id: 'sub-15-2', text: 'Invite template + i18n', completed: true },
        { id: 'sub-15-3', text: 'Accept/decline webhook handler', completed: true },
      ],
    },
    'task-16': {
      id: 'task-16',
      title: 'Onboarding Tutorial for New Users',
      description: 'Design interactive 3-step walkthrough (board, calendar, profile) using Shepherd.js with skip and replay support.',
      assignee: 'ankit',
      dueDate: '2026-07-25',
      priority: 'low',
      status: 'backlog',
      subtasks: [
        { id: 'sub-16-1', text: 'Shepherd tour config', completed: false },
        { id: 'sub-16-2', text: 'Empty-state illustrations', completed: false },
        { id: 'sub-16-3', text: 'Progress gating logic', completed: false },
      ],
    },
  },
  members: {
    sai: { name: 'Sai Shendge', color: '#7C3AED' },
    aditya: { name: 'Aditya Vawhal', color: '#3B82F6' },
    ankit: { name: 'Ankit Bhalke', color: '#10B981' },
    devansh: { name: 'Devansh Mittal', color: '#EC4899' },
    khushi: { name: 'Khushi Shah', color: '#F59E0B' },
    kshitij: { name: 'Kshitij Das', color: '#06B6D4' },
    rehan: { name: 'Mohammed Rehan', color: '#ef4444' },
    pulak: { name: 'Pulak Saha', color: '#0f766e' },
    sankalp: { name: 'Sankalp Tiwari', color: '#4F46E5' },
    sauryaman: { name: 'Sauryaman Bisen', color: '#8B5CF6' },
    sumit: { name: 'Sumit Tiwari', color: '#F97316' },
  },
  activityLog: [
    { timestamp: '2026-07-18T16:40:00', user: 'Kshitij Das', action: 'Moved Kanban DnD → In Progress', area: 'Board', type: 'moved' },
    { timestamp: '2026-07-18T14:22:00', user: 'Sai Shendge', action: 'Updated sidebar mobile breakpoints', area: 'Board', type: 'edited' },
    { timestamp: '2026-07-18T11:05:00', user: 'Sumit Tiwari', action: 'Marked Email Invitations as Done', area: 'Board', type: 'moved' },
    { timestamp: '2026-07-17T18:30:00', user: 'Mohammed Rehan', action: 'Created CI/CD Pipeline task', area: 'Board', type: 'created' },
    { timestamp: '2026-07-17T15:10:00', user: 'Ankit Bhalke', action: 'Uploaded architecture decision record', area: 'Backlog', type: 'edited' },
    { timestamp: '2026-07-17T10:45:00', user: 'Devansh Mittal', action: 'Finished theme contrast validation', area: 'Design', type: 'moved' },
    { timestamp: '2026-07-16T17:20:00', user: 'Pulak Saha', action: 'Submitted DB schema for review', area: 'Review', type: 'moved' },
    { timestamp: '2026-07-16T09:00:00', user: 'Kshitij Das', action: 'Started Kanban DnD implementation', area: 'Board', type: 'created' },
    { timestamp: '2026-07-15T14:35:00', user: 'Aditya Vawhal', action: 'Completed JWT middleware tests', area: 'Board', type: 'moved' },
    { timestamp: '2026-07-15T11:00:00', user: 'Sumit Tiwari', action: 'Assigned Email Invitations to self', area: 'Board', type: 'edited' },
    { timestamp: '2026-07-14T16:50:00', user: 'Sankalp Tiwari', action: 'Created Activity Log task', area: 'Board', type: 'created' },
    { timestamp: '2026-07-14T08:20:00', user: 'Khushi Shah', action: 'Ran E2E smoke tests across Chrome + Firefox', area: 'QA', type: 'created' },
    { timestamp: '2026-07-13T13:40:00', user: 'Devansh Mittal', action: 'Delivered chart primitives to Analytics', area: 'Analytics', type: 'moved' },
    { timestamp: '2026-07-13T09:15:00', user: 'Ankit Bhalke', action: 'Added project README template', area: 'Docs', type: 'edited' },
  ],
};

// Mutable exports
export const TEAM_MEMBERS = [];
export const MOCK_DATA = {};

// Sync and initialization
export function initData() {
  try {
    const storedMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (storedMembers) {
      const parsed = JSON.parse(storedMembers);
      TEAM_MEMBERS.length = 0;
      TEAM_MEMBERS.push(...parsed);
    } else {
      TEAM_MEMBERS.length = 0;
      TEAM_MEMBERS.push(...DEFAULT_TEAM_MEMBERS);
      saveTeamMembers();
    }

    const storedMock = localStorage.getItem(STORAGE_KEY_MOCK_DATA);
    if (storedMock) {
      const parsed = JSON.parse(storedMock);
      Object.keys(MOCK_DATA).forEach(k => delete MOCK_DATA[k]);
      Object.assign(MOCK_DATA, parsed);
    } else {
      Object.keys(MOCK_DATA).forEach(k => delete MOCK_DATA[k]);
      Object.assign(MOCK_DATA, DEFAULT_MOCK_DATA);
      saveMockData();
    }
    migrateData();
  } catch (error) {
    console.error('Failed to initialize local data, resetting defaults:', error);
    TEAM_MEMBERS.length = 0;
    TEAM_MEMBERS.push(...DEFAULT_TEAM_MEMBERS);
    Object.keys(MOCK_DATA).forEach(k => delete MOCK_DATA[k]);
    Object.assign(MOCK_DATA, DEFAULT_MOCK_DATA);
    saveTeamMembers();
    saveMockData();
  }
}

export function saveTeamMembers() {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(TEAM_MEMBERS));
  } catch (error) {
    console.error('Failed to save team members:', error);
  }
}

export function saveMockData() {
  try {
    const dataToSave = JSON.stringify(MOCK_DATA);
    localStorage.setItem(STORAGE_KEY_MOCK_DATA, dataToSave);
  } catch (error) {
    console.error('Failed to save mock data:', error);
    document.dispatchEvent(new CustomEvent('app:save-error', {
      detail: { error: error.message, type: 'mock-data' }
    }));
  }
}

function getRandomColor() {
  return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// CRUD Operations
export function addMember(memberData) {
  if (!memberData.name || !memberData.email) {
    throw new Error('Name and email are required fields.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(memberData.email)) {
    throw new Error('Please enter a valid email address.');
  }

  const isDuplicate = TEAM_MEMBERS.some(m => m.email.toLowerCase() === memberData.email.toLowerCase());
  if (isDuplicate) {
    throw new Error('A team member with this email already exists.');
  }

  const id = `member-${Date.now()}`;
  const color = memberData.bgColor || getRandomColor();
  const newMember = {
    id,
    name: memberData.name.trim(),
    email: memberData.email.trim().toLowerCase(),
    role: memberData.role ? memberData.role.trim() : 'Team Member',
    initials: getInitials(memberData.name),
    color,
    githubId: memberData.githubId ? memberData.githubId.trim() : '',
    avatarUrl: memberData.avatarUrl ? memberData.avatarUrl.trim() : '',
    tasksCompleted: 0,
    tasksInProgress: 0
  };

  TEAM_MEMBERS.push(newMember);
  saveTeamMembers();

  // Sync to MOCK_DATA members lookup
  MOCK_DATA.members[id] = { name: newMember.name, color: newMember.color };
  saveMockData();

  document.dispatchEvent(new CustomEvent('app:members-changed', {
    detail: { action: 'add', member: newMember, members: TEAM_MEMBERS }
  }));

  return newMember;
}

export function updateMember(id, updates) {
  const index = TEAM_MEMBERS.findIndex(m => m.id === id);
  if (index === -1) {
    throw new Error('Member not found.');
  }

  const original = TEAM_MEMBERS[index];

  if (updates.email && updates.email.toLowerCase() !== original.email.toLowerCase()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.email)) {
      throw new Error('Please enter a valid email address.');
    }
    const isDuplicate = TEAM_MEMBERS.some(m => m.id !== id && m.email.toLowerCase() === updates.email.toLowerCase());
    if (isDuplicate) {
      throw new Error('A team member with this email already exists.');
    }
  }

  const updatedMember = {
    ...original,
    name: updates.name !== undefined ? updates.name.trim() : original.name,
    email: updates.email !== undefined ? updates.email.trim().toLowerCase() : original.email,
    role: updates.role !== undefined ? updates.role.trim() : original.role,
    avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl.trim() : original.avatarUrl,
    color: updates.bgColor !== undefined ? updates.bgColor : original.color,
    githubId: updates.githubId !== undefined ? updates.githubId.trim() : original.githubId,
    tasksCompleted: original.tasksCompleted,
    tasksInProgress: original.tasksInProgress
  };
  updatedMember.initials = getInitials(updatedMember.name);

  TEAM_MEMBERS[index] = updatedMember;
  saveTeamMembers();

  // Sync to MOCK_DATA members lookup
  MOCK_DATA.members[id] = { name: updatedMember.name, color: updatedMember.color };
  saveMockData();

  document.dispatchEvent(new CustomEvent('app:members-changed', {
    detail: { action: 'update', member: updatedMember, members: TEAM_MEMBERS }
  }));

  return updatedMember;
}

export function deleteMember(id) {
  const index = TEAM_MEMBERS.findIndex(m => m.id === id);
  if (index === -1) {
    throw new Error('Member not found.');
  }

  const deletedMember = TEAM_MEMBERS[index];
  TEAM_MEMBERS.splice(index, 1);
  saveTeamMembers();

  // Sync to MOCK_DATA members lookup
  delete MOCK_DATA.members[id];

  // Unassign tasks from this member in MOCK_DATA
  Object.keys(MOCK_DATA.tasks).forEach(taskId => {
    if (MOCK_DATA.tasks[taskId].assignee === id) {
      MOCK_DATA.tasks[taskId].assignee = '';
    }
  });
  saveMockData();

  document.dispatchEvent(new CustomEvent('app:members-changed', {
    detail: { action: 'delete', member: deletedMember, id, members: TEAM_MEMBERS }
  }));

  // Fire specialized deletion trigger for task managers to unassign tasks
  document.dispatchEvent(new CustomEvent('app:member-deleted', {
    detail: { id }
  }));

  return deletedMember;
}

export function getMemberById(id) {
  return TEAM_MEMBERS.find(m => m.id === id) || null;
}

// Initial self bootstrap on load
initData();

export function addActivityLogEntry(user, action, type, area = 'Board') {
  const newEntry = {
    timestamp: new Date().toISOString(),
    user,
    action,
    type,
    area
  };
  if (!Array.isArray(MOCK_DATA.activityLog)) MOCK_DATA.activityLog = [];
  MOCK_DATA.activityLog.unshift(newEntry);
  if (MOCK_DATA.activityLog.length > MAX_ACTIVITY_LOG) MOCK_DATA.activityLog.length = MAX_ACTIVITY_LOG;
  saveMockData();
  window.dispatchEvent(new CustomEvent('activityLogUpdated', { detail: newEntry }));
  return newEntry;
}

export function updateTask(taskId, updates) {
  if (!MOCK_DATA.tasks[taskId]) {
    console.error('Task not found:', taskId);
    return null;
  }

  // Store original for comparison
  const original = { ...MOCK_DATA.tasks[taskId] };

  // Apply updates to the task
  Object.assign(MOCK_DATA.tasks[taskId], updates);

  // If status changed, move task between columns
  if (updates.status && updates.status !== original.status) {
    const targetColumn = MOCK_DATA.columns.find(col => col.id === `col-${updates.status}`);
    const currentColumn = MOCK_DATA.columns.find(col => col.taskIds.includes(taskId));

    if (targetColumn && currentColumn && currentColumn.id !== targetColumn.id) {
      // Remove from current column
      currentColumn.taskIds = currentColumn.taskIds.filter(id => id !== taskId);
      // Add to target column at the end
      targetColumn.taskIds.push(taskId);
    }
  }

  // Persist to localStorage
  saveMockData();

  // Dispatch real-time sync event
  document.dispatchEvent(new CustomEvent('app:task-updated', {
    detail: { taskId, task: MOCK_DATA.tasks[taskId], original, updates }
  }));

  return MOCK_DATA.tasks[taskId];
}

export function createTask(taskData) {
  // Normalize status: accept either a status key ("backlog") or a column id ("col-backlog")
  const rawStatus = taskData.status || 'todo';
  const statusKey = rawStatus.startsWith('col-') ? rawStatus.slice(4) : rawStatus;
  const columnId = `col-${statusKey}`;

  const newTask = {
    id: `task-${Date.now()}`,
    title: taskData.title || 'Untitled Task',
    description: taskData.description || '',
    assignee: taskData.assignee || '',
    dueDate: taskData.dueDate || '',
    priority: taskData.priority || 'medium',
    status: statusKey,
    subtasks: taskData.subtasks || [],
    createdAt: new Date().toISOString()
  };

  MOCK_DATA.tasks[newTask.id] = newTask;

  // Add to appropriate column
  const targetColumn = MOCK_DATA.columns.find(col => col.id === columnId);
  if (targetColumn) {
    targetColumn.taskIds.push(newTask.id);
  }

  saveMockData();

  // Dispatch event
  document.dispatchEvent(new CustomEvent('app:task-created', {
    detail: { task: newTask }
  }));

  return newTask;
}

export function deleteTask(taskId) {
  if (!MOCK_DATA.tasks[taskId]) {
    console.error('Task not found:', taskId);
    return false;
  }

  const deletedTask = MOCK_DATA.tasks[taskId];

  // Remove from column
  MOCK_DATA.columns.forEach(col => {
    col.taskIds = col.taskIds.filter(id => id !== taskId);
  });

  // Remove task
  delete MOCK_DATA.tasks[taskId];

  saveMockData();

  // Dispatch event
  document.dispatchEvent(new CustomEvent('app:task-deleted', {
    detail: { taskId, task: deletedTask }
  }));

  return true;
}

// ======= DATA LAYER: MIGRATION / QUERIES / RESET =================================

/**
 * Run any schema migrations when the stored version lags behind CURRENT_DATA_VERSION.
 * Each migration step is idempotent.
 */
export function migrateData() {
  const storedVersion = parseInt(localStorage.getItem(STORAGE_KEY_VERSION) || '0', 10);
  if (storedVersion >= CURRENT_DATA_VERSION) {
    localStorage.setItem(STORAGE_KEY_VERSION, String(CURRENT_DATA_VERSION));
    return;
  }
  for (let v = storedVersion + 1; v <= CURRENT_DATA_VERSION; v++) {
    switch (v) {
      case 1:
        if (Array.isArray(MOCK_DATA.activityLog) && MOCK_DATA.activityLog.length > MAX_ACTIVITY_LOG) {
          MOCK_DATA.activityLog = MOCK_DATA.activityLog.slice(-MAX_ACTIVITY_LOG);
          saveMockData();
        }
        break;
    }
  }
  localStorage.setItem(STORAGE_KEY_VERSION, String(CURRENT_DATA_VERSION));
}

try {
  function hasRealData() {
    const raw = localStorage.getItem(STORAGE_KEY_MOCK_DATA);
    if (!raw) return false;
    try { const p = JSON.parse(raw); return Boolean(p && typeof p === 'object' && p.tasks); } catch { return false; }
  }
  if (!hasRealData()) {
    localStorage.setItem(STORAGE_KEY_MOCK_DATA, JSON.stringify(DEFAULT_MOCK_DATA));
  }
  if (!localStorage.getItem(STORAGE_KEY_MEMBERS)) {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(DEFAULT_TEAM_MEMBERS));
  }
  if (!localStorage.getItem(STORAGE_KEY_VERSION)) {
    localStorage.setItem(STORAGE_KEY_VERSION, String(CURRENT_DATA_VERSION));
  }
} catch {}

/**
 * Return all tasks whose column matches the given status (id or title, with or without "col-" prefix).
 */
export function getTasksByStatus(status) {
  const key = String(status || '').trim().toLowerCase();
  if (!key) return [];
  return Object.values(MOCK_DATA.tasks).filter(task => {
    const col = MOCK_DATA.columns.find(c => c.taskIds.includes(task.id));
    if (!col) return false;
    const colId = col.id.toLowerCase();
    const colTitle = col.title.toLowerCase();
    const q = key.replace(/^col-/, '');
    return colId === key || colId === `col-${q}` || colTitle === q || colTitle === key;
  });
}

/**
 * Return tasks assigned to the given member id.
 */
export function getTasksByAssignee(assigneeId) {
  if (!assigneeId) return [];
  return Object.values(MOCK_DATA.tasks).filter(t => t.assignee === assigneeId);
}

/**
 * Wipe stored local data and reload defaults. Useful for development / debug workflows.
 */
export function resetData() {
  try {
    localStorage.removeItem(STORAGE_KEY_MEMBERS);
    localStorage.removeItem(STORAGE_KEY_MOCK_DATA);
    localStorage.removeItem(STORAGE_KEY_VERSION);
    TEAM_MEMBERS.length = 0;
    TEAM_MEMBERS.push(...DEFAULT_TEAM_MEMBERS);
    Object.keys(MOCK_DATA).forEach(k => delete MOCK_DATA[k]);
    Object.assign(MOCK_DATA, DEFAULT_MOCK_DATA);
    saveTeamMembers();
    saveMockData();
    localStorage.setItem(STORAGE_KEY_VERSION, String(CURRENT_DATA_VERSION));
    return true;
  } catch (error) {
    console.error('Failed to reset data:', error);
    return false;
  }
}
