// Application Initialization and Events
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial renders
    UI.renderSidebarMembers();
    UI.renderActivities();
    UI.startTimestampAutoRefresh();

    // 2. DOM Elements
    const activityPanel = document.getElementById('activity-panel');
    const btnActivityToggle = document.getElementById('btn-activity-toggle');
    const btnActivityClose = document.getElementById('btn-activity-close');
    const btnClearActivity = document.getElementById('btn-clear-activity');
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const btnAddTask = document.getElementById('btn-add-task');

    // 3. Activity Drawer Controls
    if (btnActivityToggle && activityPanel) {
        btnActivityToggle.addEventListener('click', () => {
            activityPanel.classList.toggle('hidden');
        });
    }

    if (btnActivityClose && activityPanel) {
        btnActivityClose.addEventListener('click', () => {
            activityPanel.classList.add('hidden');
        });
    }

    if (btnClearActivity) {
        btnClearActivity.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all activities?')) {
                AppState.clearActivities();
            }
        });
    }

    // 4. State Event Listeners
    window.addEventListener('activityAdded', () => {
        UI.renderActivities();
    });

    window.addEventListener('activitiesCleared', () => {
        UI.renderActivities();
    });

    // 5. Theme Toggle Logic
    if (btnThemeToggle) {
        // Check local storage or system preferences
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            btnThemeToggle.querySelector('.theme-icon').textContent = '☀️';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            btnThemeToggle.querySelector('.theme-icon').textContent = '🌙';
        }

        btnThemeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'light');
                btnThemeToggle.querySelector('.theme-icon').textContent = '🌙';
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                btnThemeToggle.querySelector('.theme-icon').textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // 6. Interactive Task Addition Simulation
    if (btnAddTask) {
        btnAddTask.addEventListener('click', () => {
            const randomMember = AppState.members[Math.floor(Math.random() * AppState.members.length)];
            const tasks = ['Landing Page Design', 'Fix Navbar Bug', 'Client Dashboard', 'API Integration', 'Database Migration'];
            const task = tasks[Math.floor(Math.random() * tasks.length)];
            
            const actions = [
                `created task '${task}'`,
                `moved '${task}' to In Progress`,
                `moved '${task}' to Done`,
                `assigned task '${task}' to ${randomMember.name}`,
                `updated deadline for '${task}'`
            ];
            const action = actions[Math.floor(Math.random() * actions.length)];
            
            // Random user logs the action
            const actor = AppState.members[Math.floor(Math.random() * AppState.members.length)];
            AppState.addActivity(actor.name, action);
        });
    }

    // Simulate occasional background activity (e.g. from other users)
    setInterval(() => {
        const simulateBackground = Math.random() > 0.6; // 40% chance every 45s
        if (simulateBackground) {
            const actor = AppState.members[Math.floor(Math.random() * AppState.members.length)];
            const task = 'Sprint Retro Document';
            const details = `updated the status of '${task}' to Completed`;
            AppState.addActivity(actor.name, details);
        }
    }, 45000);
});
