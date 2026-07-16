// DOM manipulation and UI rendering
window.AppUI = window.AppUI || {};

/**
 * Creates and returns an Avatar DOM element.
 * @param {Object} member - The team member object
 * @param {string} member.name - Name of the team member
 * @param {string} [member.avatarUrl] - Optional avatar image URL
 * @param {string} [member.bgColor] - Optional background color for initials
 * @param {Object} [options] - Avatar rendering configuration
 * @param {string} [options.size='sm'] - Size class ('xs', 'sm', 'md', 'lg', 'xl')
 * @returns {HTMLElement} - The avatar DOM element
 */
window.AppUI.createAvatar = function(member, options = {}) {
    const size = options.size || 'sm';
    
    // Create container
    const avatar = document.createElement('div');
    avatar.className = `avatar avatar--${size}`;
    avatar.setAttribute('title', member.name);
    avatar.setAttribute('data-member-id', member.id);
    
    // Compute Initials
    const nameParts = member.name.trim().split(/\s+/);
    let initials = '';
    if (nameParts.length > 0 && nameParts[0]) {
        initials += nameParts[0].charAt(0).toUpperCase();
        if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
            initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        }
    } else {
        initials = '?';
    }
    
    // Render either image or initials
    if (member.avatarUrl) {
        const img = document.createElement('img');
        img.src = member.avatarUrl;
        img.alt = member.name;
        img.onerror = function() {
            // Fallback if image fails to load
            img.remove();
            avatar.textContent = initials;
            avatar.style.backgroundColor = member.bgColor || '#4f46e5';
        };
        avatar.appendChild(img);
    } else {
        avatar.textContent = initials;
        avatar.style.backgroundColor = member.bgColor || '#4f46e5';
    }
    
    return avatar;
};

/**
 * Creates an avatar group display list.
 * @param {Array<Object>} members - List of member objects to display
 * @param {Object} [options] - Options configuration
 * @param {string} [options.size='sm'] - Avatar size
 * @param {number} [options.max=4] - Max number of avatars before showing counter
 * @returns {HTMLElement} - Avatar group container
 */
window.AppUI.createAvatarGroup = function(members, options = {}) {
    const size = options.size || 'sm';
    const max = options.max || 4;
    
    const groupContainer = document.createElement('div');
    groupContainer.className = 'avatar-group';
    
    const displayCount = Math.min(members.length, max);
    const extraCount = members.length - max;
    
    // If there is an overflow, add the counter block first
    // Note: because the container is row-reverse (flex-direction: row-reverse)
    // to preserve overlap rendering, adding the counter first places it at the rightmost side!
    if (extraCount > 0) {
        const counter = document.createElement('div');
        counter.className = `avatar-counter avatar-counter--${size}`;
        counter.textContent = `+${extraCount}`;
        counter.setAttribute('title', `${extraCount} more member(s)`);
        groupContainer.appendChild(counter);
    }
    
    // Add avatars in reverse order so the flex row-reverse displays them in correct order
    // with proper visual overlap shadows.
    for (let i = displayCount - 1; i >= 0; i--) {
        const avatarEl = window.AppUI.createAvatar(members[i], { size });
        groupContainer.appendChild(avatarEl);
    }
    
    return groupContainer;
};

/**
 * Renders the list of team members in the management modal pane.
 * @param {string} containerId - ID of the container element
 * @param {Array<Object>} members - List of team members
 * @param {string|null} activeEditId - ID of the member currently being edited
 */
window.AppUI.renderMemberList = function(containerId, members, activeEditId = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (members.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'flex-center';
        emptyState.style.flexDirection = 'column';
        emptyState.style.padding = 'var(--spacing-xl) var(--spacing-md)';
        emptyState.style.color = 'var(--text-muted)';
        emptyState.style.fontSize = '0.9rem';
        emptyState.style.textAlign = 'center';
        emptyState.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="margin-bottom: var(--spacing-sm); color: var(--text-muted);">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>No team members yet. Create one on the right.</p>
        `;
        container.appendChild(emptyState);
        return;
    }
    
    members.forEach(member => {
        const item = document.createElement('div');
        item.className = 'member-item';
        if (activeEditId === member.id) {
            item.className += ' member-item--selected';
        }
        item.setAttribute('data-member-id', member.id);
        
        // Left side: Info
        const info = document.createElement('div');
        info.className = 'member-item__info';
        
        const avatarEl = window.AppUI.createAvatar(member, { size: 'sm' });
        
        const details = document.createElement('div');
        details.className = 'member-item__details';
        
        const name = document.createElement('span');
        name.className = 'member-item__name';
        name.textContent = member.name;
        
        const email = document.createElement('span');
        email.className = 'member-item__email';
        email.textContent = member.email;
        
        details.appendChild(name);
        details.appendChild(email);
        
        info.appendChild(avatarEl);
        info.appendChild(details);
        
        // Right side: Actions
        const actions = document.createElement('div');
        actions.className = 'member-item__actions';
        
        // Edit Action button
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-icon';
        editBtn.setAttribute('data-action', 'edit');
        editBtn.setAttribute('aria-label', `Edit ${member.name}`);
        editBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        `;
        
        // Delete Action button
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-icon btn-icon--danger';
        deleteBtn.setAttribute('data-action', 'delete');
        deleteBtn.setAttribute('aria-label', `Delete ${member.name}`);
        deleteBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        `;
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        item.appendChild(info);
        item.appendChild(actions);
        
        container.appendChild(item);
    });
};

/**
 * Renders the list of active team avatars in the header layout.
 * @param {string} containerId - ID of the container element
 * @param {Array<Object>} members - List of team members
 */
window.AppUI.renderHeaderTeamList = function(containerId, members) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    if (members.length === 0) return;
    
    const avatarGroup = window.AppUI.createAvatarGroup(members, { size: 'sm', max: 5 });
    container.appendChild(avatarGroup);
};

/**
 * Shows an assignment dropdown positioned relative to the target element.
 * @param {HTMLElement} triggerEl - The button or element that triggered the dropdown
 * @param {Array<string>} assignedIds - List of currently assigned member IDs
 * @param {Function} onAssignChange - Callback function `(memberId, isSelected)` when an item is toggled
 */
window.AppUI.showAssignDropdown = function(triggerEl, assignedIds = [], onAssignChange) {
    // 1. Close any open dropdown first
    window.AppUI.closeDropdown();
    
    // 2. Create Dropdown Elements
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.id = 'assign-dropdown';
    
    // Search Box
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'dropdown-search-wrapper';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'dropdown-search';
    searchInput.placeholder = 'Search members...';
    searchWrapper.appendChild(searchInput);
    dropdown.appendChild(searchWrapper);
    
    // Options List
    const list = document.createElement('div');
    list.className = 'dropdown-list';
    
    const members = window.AppStore.getMembers();
    
    if (members.length === 0) {
        const noMembers = document.createElement('div');
        noMembers.className = 'dropdown-item';
        noMembers.style.color = 'var(--text-muted)';
        noMembers.style.cursor = 'default';
        noMembers.textContent = 'No members. Click "Manage Team" to add.';
        list.appendChild(noMembers);
    } else {
        members.forEach(member => {
            const isSelected = assignedIds.includes(member.id);
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            if (isSelected) {
                item.className += ' dropdown-item--selected';
            }
            item.setAttribute('data-member-id', member.id);
            
            const avatar = window.AppUI.createAvatar(member, { size: 'xs' });
            
            const name = document.createElement('span');
            name.style.marginLeft = 'var(--spacing-xs)';
            name.textContent = member.name;
            
            const check = document.createElement('span');
            check.className = 'dropdown-item__check';
            check.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            `;
            
            item.appendChild(avatar);
            item.appendChild(name);
            item.appendChild(check);
            
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const selected = item.classList.toggle('dropdown-item--selected');
                
                if (onAssignChange) {
                    onAssignChange(member.id, selected);
                }
            });
            
            list.appendChild(item);
        });
    }
    
    dropdown.appendChild(list);
    document.body.appendChild(dropdown);
    
    // 3. Position the dropdown relative to triggerEl
    const rect = triggerEl.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
    
    // Default left align
    let dropdownLeft = rect.left + window.scrollX;
    const dropdownWidth = 240; // match CSS width
    if (rect.left + dropdownWidth > window.innerWidth) {
        // align to right side of trigger element if it overflows screen
        dropdownLeft = rect.right + window.scrollX - dropdownWidth;
    }
    dropdown.style.left = `${dropdownLeft}px`;
    
    // 4. Animation Frame Trigger
    requestAnimationFrame(() => {
        dropdown.classList.add('active');
    });
    
    // Focus search input
    setTimeout(() => searchInput.focus(), 50);
    
    // 5. Search filtering logic
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const items = list.querySelectorAll('.dropdown-item[data-member-id]');
        items.forEach(item => {
            const nameEl = item.querySelector('span:not(.dropdown-item__check)');
            if (nameEl && nameEl.textContent.toLowerCase().includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // 6. Register dismiss events
    function handleOutsideClick(e) {
        if (!dropdown.contains(e.target) && !triggerEl.contains(e.target)) {
            window.AppUI.closeDropdown();
        }
    }
    
    function handleScroll() {
        window.AppUI.closeDropdown();
    }
    
    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            window.AppUI.closeDropdown();
            triggerEl.focus();
        }
    }
    
    // Delay adding listeners so opening click doesn't trigger close
    setTimeout(() => {
        window.addEventListener('click', handleOutsideClick);
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('keydown', handleKeyDown);
        
        // Cache event removal functions on the element itself for easy cleanup!
        dropdown._cleanup = function() {
            window.removeEventListener('click', handleOutsideClick);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, 100);
};

/**
 * Closes the active assignment dropdown and cleans up listeners.
 */
window.AppUI.closeDropdown = function() {
    const activeDropdown = document.getElementById('assign-dropdown');
    if (activeDropdown) {
        if (activeDropdown._cleanup) {
            activeDropdown._cleanup();
        }
        activeDropdown.remove();
    }
};
