// State management and data logic

const STORAGE_KEY_MEMBERS = 'pm_board_team_members_v2';
const STORAGE_KEY_MOCK_DATA = 'pm_board_mock_data_v2';

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
    { id: 'col-backlog', title: 'Backlog', taskIds: ['task-6'] },
    { id: 'col-todo', title: 'To Do', taskIds: ['task-5'] },
    { id: 'col-in-progress', title: 'In Progress', taskIds: ['task-1', 'task-7', 'task-8', 'task-10', 'task-11', 'task-12'] },
    { id: 'col-review', title: 'Review', taskIds: ['task-3'] },
    { id: 'col-done', title: 'Done', taskIds: ['task-2', 'task-4', 'task-9'] },
  ],
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Implement JWT Authentication',
      description: 'Configure secure HttpOnly cookies for storing JWT access and refresh tokens, setting up middleware verification.',
      assignee: 'aditya',
      dueDate: '2026-07-28',
      priority: 'high',
      status: 'in-progress',
      subtasks: [
        { id: 'sub-1', text: 'Generate token secrets', completed: true },
        { id: 'sub-2', text: 'Set up express middleware', completed: false }
      ],
    },
    'task-2': {
      id: 'task-2',
      title: 'Design Dashboard UI/UX mockup',
      description: 'Draft landing layout wireframes, select typography variables, and design main kanban board components.',
      assignee: 'devansh',
      dueDate: '2026-07-16',
      priority: 'medium',
      status: 'done',
      subtasks: [
        { id: 'sub-3', text: 'Finalize core layout wireframes', completed: true },
        { id: 'sub-4', text: 'Define color token variables', completed: true }
      ],
    },
    'task-3': {
      id: 'task-3',
      title: 'Optimize Database Queries',
      description: 'Optimize slow JOIN queries on activity feed tables, add indices to foreign keys, and run bench tests.',
      assignee: 'pulak',
      dueDate: '2026-07-22',
      priority: 'high',
      status: 'review',
      subtasks: [],
    },
    'task-4': {
      id: 'task-4',
      title: 'Set up CI/CD Pipeline',
      description: 'Configure GitHub Actions runner, set up automated tests execution on pull request, and configure Docker deployment.',
      assignee: 'rehan',
      dueDate: '2026-07-15',
      priority: 'medium',
      status: 'done',
      subtasks: [],
    },
    'task-5': {
      id: 'task-5',
      title: 'Responsive Sidebar Layout',
      description: 'Apply CSS grid changes, hide secondary elements on mobile screens, and add responsive hamburger menu.',
      assignee: 'sai',
      dueDate: '2026-07-25',
      priority: 'low',
      status: 'todo',
      subtasks: [],
    },
    'task-6': {
      id: 'task-6',
      title: 'E2E Testing Suite',
      description: 'Write Playwright E2E browser tests covering member management modal forms, edits, and error validation states.',
      assignee: 'khushi',
      dueDate: '2026-08-05',
      priority: 'low',
      status: 'backlog',
      subtasks: [],
    },
    'task-7': {
      id: 'task-7',
      title: 'API Integration for Metrics',
      description: 'Integrate REST endpoints for fetching active members counts, tasks in progress, and recent activity logs.',
      assignee: 'ankit',
      dueDate: '2026-07-29',
      priority: 'high',
      status: 'in-progress',
      subtasks: [],
    },
    'task-8': {
      id: 'task-8',
      title: 'Interactive Board Drag and Drop',
      description: 'Integrate HTML5 Drag and Drop API support, bind drag events, and update state objects in localStorage.',
      assignee: 'kshitij',
      dueDate: '2026-07-24',
      priority: 'medium',
      status: 'in-progress',
      subtasks: [],
    },
    'task-9': {
      id: 'task-9',
      title: 'Write API Documentation',
      description: 'Document authentication endpoints, request/response body schemas, and list error responses in Swagger/Postman.',
      assignee: 'sumit',
      dueDate: '2026-07-14',
      priority: 'low',
      status: 'done',
      subtasks: [],
    },
    'task-10': {
      id: 'task-10',
      title: 'Team Profile details peek drawer',
      description: 'Expand side-peek views to render complete member workloads summaries, assigned task list links, and activity logs.',
      assignee: 'sankalp',
      dueDate: '2026-07-20',
      priority: 'high',
      status: 'in-progress',
      subtasks: [],
    },
    'task-11': {
      id: 'task-11',
      title: 'Keyboard Arrow selection on Assignee Picker',
      description: 'Enable WAI-ARIA compliant arrow navigation support inside the task card assignee picker dropdown list.',
      assignee: 'sankalp',
      dueDate: '2026-07-21',
      priority: 'medium',
      status: 'in-progress',
      subtasks: [],
    },
    'task-12': {
      id: 'task-12',
      title: 'Modal Alignment & Toast alerts',
      description: 'Fix vertical alignment inside the header using flexbox rules and add floating alert toast transitions.',
      assignee: 'sankalp',
      dueDate: '2026-07-23',
      priority: 'low',
      status: 'in-progress',
      subtasks: [],
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
    { timestamp: '2026-07-17T09:30:00', user: 'Sankalp Tiwari', action: 'Created task Keyboard Arrow selection', area: 'Board', type: 'created' },
    { timestamp: '2026-07-16T18:15:00', user: 'Devansh Mittal', action: 'Completed Dashboard UI design', area: 'Dashboard', type: 'moved' },
    { timestamp: '2026-07-16T11:45:00', user: 'Mohammed Rehan', action: 'Deployed dev server on port 3000', area: 'Deployment', type: 'created' },
    { timestamp: '2026-07-15T14:20:00', user: 'Sumit Tiwari', action: 'Approved product specifications', area: 'Review', type: 'edited' },
    { timestamp: '2026-07-15T10:15:00', user: 'Khushi Shah', action: 'Ran initial QA test suite', area: 'Analytics', type: 'created' },
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

export function addActivityLogEntry(user, action, type, area = 'Board') {
  const newEntry = {
    timestamp: new Date().toISOString(),
    user: user,
    action: action,
    type: type,
    area: area
  };
  MOCK_DATA.activityLog.push(newEntry);
  window.dispatchEvent(new CustomEvent('activityLogUpdated', { detail: newEntry }));
  return newEntry;
}
