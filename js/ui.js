// UI Rendering & Manipulation
const UI = {
    // Relative date formatting helper
    formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 0) return 'Just now';
        if (seconds < 60) return 'Just now';
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        
        return new Date(date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        });
    },

    // Render list of team members on sidebar
    renderSidebarMembers() {
        const container = document.getElementById('sidebar-members-list');
        if (!container) return;
        
        container.innerHTML = AppState.members.map(member => `
            <div class="member-item">
                <div class="avatar" style="background-color: ${member.color}" title="${member.name}">
                    ${member.initials}
                </div>
                <span>${member.name}</span>
            </div>
        `).join('');
    },

    // Render activity log entries
    renderActivities() {
        const container = document.getElementById('activity-list');
        const countBadge = document.getElementById('activity-count');
        if (!container) return;

        const activities = AppState.getSortedActivities();
        
        // Update count badge
        if (countBadge) {
            countBadge.textContent = `${activities.length} ${activities.length === 1 ? 'entry' : 'entries'}`;
        }

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">📋</span>
                    <p style="font-size: 0.875rem;">No activity logged yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(act => `
            <div class="activity-entry" data-id="${act.id}">
                <div class="avatar" style="background-color: ${act.user.color}" title="${act.user.name}">
                    ${act.user.initials}
                </div>
                <div class="activity-content">
                    <span class="activity-text">
                        <strong>${act.user.name}</strong> ${act.actionText}
                    </span>
                    <span class="activity-time" data-timestamp="${new Date(act.timestamp).toISOString()}">
                        ${this.formatTimeAgo(act.timestamp)}
                    </span>
                </div>
            </div>
        `).join('');
    },

    // Setup periodic updates for timestamps
    startTimestampAutoRefresh() {
        setInterval(() => {
            const timeLabels = document.querySelectorAll('.activity-time');
            timeLabels.forEach(label => {
                const timestampStr = label.getAttribute('data-timestamp');
                if (timestampStr) {
                    label.textContent = this.formatTimeAgo(new Date(timestampStr));
                }
            });
        }, 30000); // refresh relative time labels every 30 seconds
    }
};
