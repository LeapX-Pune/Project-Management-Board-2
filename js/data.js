// State management and data logic

const STORAGE_KEY_MEMBERS = 'pm_board_team_members';
const STORAGE_KEY_MOCK_DATA = 'pm_board_mock_data';

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
  { id: 'alice', name: 'Alice Chen', email: 'alice.chen@example.com', role: 'Frontend Lead', initials: 'AC', color: '#7C3AED', githubId: '', tasksCompleted: 3, tasksInProgress: 1, avatarUrl: '' },
  { id: 'bob', name: 'Bob Smith', email: 'bob.smith@example.com', role: 'Backend Engineer', initials: 'BS', color: '#3B82F6', githubId: 'bobsmith', tasksCompleted: 1, tasksInProgress: 0, avatarUrl: '' },
  { id: 'carol', name: 'Carol Davis', email: 'carol.davis@example.com', role: 'Full Stack Dev', initials: 'CD', color: '#10B981', githubId: '', tasksCompleted: 2, tasksInProgress: 1, avatarUrl: '' },
  { id: 'dave', name: 'Dave Wilson', email: 'dave.wilson@example.com', role: 'DevOps Engineer', initials: 'DW', color: '#F59E0B', githubId: '', tasksCompleted: 0, tasksInProgress: 1, avatarUrl: '' },
  { id: 'eve', name: 'Eve Martin', email: 'eve.martin@example.com', role: 'UI/UX Designer', initials: 'EM', color: '#EC4899', githubId: 'evemartin', tasksCompleted: 2, tasksInProgress: 2, avatarUrl: '' },
  { id: 'frank', name: 'Frank Lee', email: 'frank.lee@example.com', role: 'QA Engineer', initials: 'FL', color: '#06B6D4', githubId: '', tasksCompleted: 1, tasksInProgress: 0, avatarUrl: '' },
];

const DEFAULT_MOCK_DATA = {
  columns: [
    { id: 'col-backlog', title: 'Backlog', taskIds: ['task-1', 'task-2'] },
    { id: 'col-todo', title: 'To Do', taskIds: ['task-3'] },
    { id: 'col-in-progress', title: 'In Progress', taskIds: ['task-4'] },
    { id: 'col-review', title: 'Review', taskIds: ['task-5'] },
    { id: 'col-done', title: 'Done', taskIds: ['task-6'] },
  ],
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Design landing page mockup',
      description: 'Create high-fidelity landing page designs and component style guides using CSS tokens.',
      assignee: 'alice',
      dueDate: '2026-08-15',
      priority: 'high',
      status: 'backlog',
      subtasks: [
        { id: 'sub-1', text: 'Draft wireframes', completed: true },
        { id: 'sub-2', text: 'Select typography and colors', completed: false },
      ],
    },
    'task-2': {
      id: 'task-2',
      title: 'Evaluate API options',
      description: 'Perform performance benchmarking between REST endpoints and GraphQL queries.',
      assignee: 'bob',
      dueDate: '2026-08-20',
      priority: 'low',
      status: 'backlog',
      subtasks: [],
    },
    'task-3': {
      id: 'task-3',
      title: 'Configure CI/CD workflow',
      description: 'Configure GitHub Actions runner to build the app and trigger automated linting.',
      assignee: 'carol',
      dueDate: '2026-07-25',
      priority: 'medium',
      status: 'todo',
      subtasks: [
        { id: 'sub-3', text: 'Write build scripts', completed: false },
      ],
    },
    'task-4': {
      id: 'task-4',
      title: 'Implement auth cookies',
      description: 'Set up HTTP-only secure cookie storage for access and refresh JWTs.',
      assignee: 'alice',
      dueDate: '2026-07-20',
      priority: 'high',
      status: 'in-progress',
      subtasks: [
        { id: 'sub-4', text: 'Implement login validation', completed: true },
        { id: 'sub-5', text: 'Write auth middleware', completed: true },
      ],
    },
    'task-5': {
      id: 'task-5',
      title: 'Review billing integration PR',
      description: 'Thoroughly review the Stripe webhook handling code and verify error alerts.',
      assignee: 'dave',
      dueDate: '2026-07-18',
      priority: 'medium',
      status: 'review',
      subtasks: [],
    },
    'task-6': {
      id: 'task-6',
      title: 'Cover utility functions with tests',
      description: 'Verify string manipulators, date parsers, and custom math helper coverages reach 90%.',
      assignee: 'carol',
      dueDate: '2026-07-10',
      priority: 'low',
      status: 'done',
      subtasks: [
        { id: 'sub-6', text: 'Write parser tests', completed: true },
        { id: 'sub-7', text: 'Verify mock suite metrics', completed: true },
      ],
    },
  },
  members: {
    alice: { name: 'Alice Chen', color: '#7C3AED' },
    bob: { name: 'Bob Smith', color: '#3B82F6' },
    carol: { name: 'Carol Davis', color: '#10B981' },
    dave: { name: 'Dave Wilson', color: '#F59E0B' },
  },
  activityLog: [
    { timestamp: '2026-07-15T09:30:00', user: 'Alice Chen', action: 'Moved task to In Progress', area: 'Board', type: 'moved' },
    { timestamp: '2026-07-15T08:15:00', user: 'Carol Davis', action: 'Created new task', area: 'Board', type: 'created' },
    { timestamp: '2026-07-14T16:45:00', user: 'Bob Smith', action: 'Updated deadline', area: 'Calendar', type: 'edited' },
    { timestamp: '2026-07-14T14:20:00', user: 'Dave Wilson', action: 'Added comment to PR #42', area: 'Board', type: 'edited' },
    { timestamp: '2026-07-13T11:00:00', user: 'Alice Chen', action: 'Completed auth module review', area: 'Review', type: 'moved' },
    { timestamp: '2026-07-13T09:45:00', user: 'Carol Davis', action: 'Assigned task to Bob', area: 'Team', type: 'edited' },
    { timestamp: '2026-07-12T16:30:00', user: 'Eve Martin', action: 'Uploaded new design mockups', area: 'Dashboard', type: 'created' },
    { timestamp: '2026-07-12T10:15:00', user: 'Frank Lee', action: 'Ran regression test suite', area: 'Analytics', type: 'created' },
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
    localStorage.setItem(STORAGE_KEY_MOCK_DATA, JSON.stringify(MOCK_DATA));
  } catch (error) {
    console.error('Failed to save mock data:', error);
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
    githubId: updates.githubId !== undefined ? updates.githubId.trim() : original.githubId
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
