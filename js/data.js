// Local state management for the Project Board
const AppState = {
    members: [
        { id: '1', name: 'John Doe', initials: 'JD', color: '#4f46e5' },
        { id: '2', name: 'Sarah Connor', initials: 'SC', color: '#10b981' },
        { id: '3', name: 'Mike Ross', initials: 'MR', color: '#f59e0b' },
        { id: '4', name: 'Rachel Zane', initials: 'RZ', color: '#ec4899' }
    ],
    
    // Initial activity log data
    activities: [
        {
            id: 'act-1',
            user: { name: 'John Doe', initials: 'JD', color: '#4f46e5' },
            actionText: "moved 'Landing Page Design' to Review",
            timestamp: new Date(Date.now() - 1000 * 60 * 12) // 12 minutes ago
        },
        {
            id: 'act-2',
            user: { name: 'Sarah Connor', initials: 'SC', color: '#10b981' },
            actionText: "assigned task 'Fix Navbar Bug' to Mike Ross",
            timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
        },
        {
            id: 'act-3',
            user: { name: 'Mike Ross', initials: 'MR', color: '#f59e0b' },
            actionText: "updated deadline for 'Client Dashboard'",
            timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
        }
    ],

    // Add a new activity log entry
    addActivity(memberName, actionText) {
        const member = this.members.find(m => m.name === memberName) || {
            name: memberName,
            initials: memberName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
            color: '#64748b' // default color
        };

        const newActivity = {
            id: 'act-' + Math.random().toString(36).substr(2, 9),
            user: {
                name: member.name,
                initials: member.initials,
                color: member.color
            },
            actionText: actionText,
            timestamp: new Date()
        };

        this.activities.push(newActivity);
        
        // Dispatch custom event to notify UI
        const event = new CustomEvent('activityAdded', { detail: newActivity });
        window.dispatchEvent(event);
        
        return newActivity;
    },

    // Get activity log sorted (latest first)
    getSortedActivities() {
        return [...this.activities].sort((a, b) => b.timestamp - a.timestamp);
    },

    // Clear all activity logs
    clearActivities() {
        this.activities = [];
        window.dispatchEvent(new CustomEvent('activitiesCleared'));
    }
};
