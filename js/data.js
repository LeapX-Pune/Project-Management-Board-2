// State management and data logic
window.AppStore = window.AppStore || {};

(function() {
    const STORAGE_KEY = 'pm_board_members';
    
    // Preset high-contrast background colors for initials avatars (Slate/Tailwind 700 weights)
    const PRESET_COLORS = [
        '#4338ca', // Indigo
        '#0f766e', // Teal
        '#047857', // Emerald
        '#b45309', // Amber
        '#be123c', // Rose
        '#6d28d9', // Violet
        '#0369a1', // Sky
        '#a21caf'  // Fuchsia
    ];
    
    // Initial default members list if localStorage is empty
    const DEFAULT_MEMBERS = [
        {
            id: 'member-1',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            avatarUrl: '',
            bgColor: '#4338ca'
        },
        {
            id: 'member-2',
            name: 'John Smith',
            email: 'john.smith@example.com',
            avatarUrl: '',
            bgColor: '#0f766e'
        },
        {
            id: 'member-3',
            name: 'Alice Johnson',
            email: 'alice.johnson@example.com',
            avatarUrl: '',
            bgColor: '#b45309'
        },
        {
            id: 'member-4',
            name: 'Bob Wilson',
            email: 'bob.wilson@example.com',
            avatarUrl: '',
            bgColor: '#047857'
        }
    ];

    let members = [];

    // Helper: Select random preset color
    function getRandomColor() {
        return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    }

    // Helper: Save current member state to localStorage
    function saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
        } catch (error) {
            console.error('Failed to save members to localStorage:', error);
        }
    }

    // Initialize state
    window.AppStore.initMembers = function() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                members = JSON.parse(stored);
            } else {
                members = [...DEFAULT_MEMBERS];
                saveToStorage();
            }
        } catch (error) {
            console.error('Failed to parse members from localStorage, resetting:', error);
            members = [...DEFAULT_MEMBERS];
            saveToStorage();
        }
        return members;
    };

    // Retrieve all members
    window.AppStore.getMembers = function() {
        if (members.length === 0) {
            return window.AppStore.initMembers();
        }
        return members;
    };

    // Find specific member by ID
    window.AppStore.getMemberById = function(id) {
        return members.find(m => m.id === id) || null;
    };

    // Add a new member
    window.AppStore.addMember = function(memberData) {
        if (!memberData.name || !memberData.email) {
            throw new Error('Name and email are required fields.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(memberData.email)) {
            throw new Error('Please enter a valid email address.');
        }

        const isDuplicate = members.some(m => m.email.toLowerCase() === memberData.email.toLowerCase());
        if (isDuplicate) {
            throw new Error('A team member with this email already exists.');
        }

        const newMember = {
            id: `member-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: memberData.name.trim(),
            email: memberData.email.trim().toLowerCase(),
            avatarUrl: (memberData.avatarUrl || '').trim(),
            bgColor: memberData.bgColor || getRandomColor()
        };

        members.push(newMember);
        saveToStorage();

        // Dispatch a custom event to notify components
        document.dispatchEvent(new CustomEvent('app:members-changed', {
            detail: { action: 'add', member: newMember, members }
        }));

        return newMember;
    };

    // Update an existing member
    window.AppStore.updateMember = function(id, updates) {
        const index = members.findIndex(m => m.id === id);
        if (index === -1) {
            throw new Error('Member not found.');
        }

        const original = members[index];

        if (updates.email && updates.email.toLowerCase() !== original.email.toLowerCase()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updates.email)) {
                throw new Error('Please enter a valid email address.');
            }
            const isDuplicate = members.some(m => m.id !== id && m.email.toLowerCase() === updates.email.toLowerCase());
            if (isDuplicate) {
                throw new Error('A team member with this email already exists.');
            }
        }

        const updatedMember = {
            ...original,
            name: updates.name !== undefined ? updates.name.trim() : original.name,
            email: updates.email !== undefined ? updates.email.trim().toLowerCase() : original.email,
            avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl.trim() : original.avatarUrl,
            bgColor: updates.bgColor !== undefined ? updates.bgColor : original.bgColor
        };

        members[index] = updatedMember;
        saveToStorage();

        // Dispatch a custom event to notify components
        document.dispatchEvent(new CustomEvent('app:members-changed', {
            detail: { action: 'update', member: updatedMember, members }
        }));

        return updatedMember;
    };

    // Delete a member
    window.AppStore.deleteMember = function(id) {
        const index = members.findIndex(m => m.id === id);
        if (index === -1) {
            throw new Error('Member not found.');
        }

        const deletedMember = members[index];
        members.splice(index, 1);
        saveToStorage();

        // Dispatch custom events
        document.dispatchEvent(new CustomEvent('app:members-changed', {
            detail: { action: 'delete', member: deletedMember, id, members }
        }));

        // Fire specialized deletion trigger for task managers to unassign tasks
        document.dispatchEvent(new CustomEvent('app:member-deleted', {
            detail: { id }
        }));

        return deletedMember;
    };
})();
