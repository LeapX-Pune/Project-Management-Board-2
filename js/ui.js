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
