// Application entry point
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State Sync
    const store = window.AppStore;
    const ui = window.AppUI;
    
    if (!store || !ui) {
        console.error('Store or UI module is missing. Initialization halted.');
        return;
    }
    
    // Initialize members and display in the header
    const currentMembers = store.getMembers();
    ui.renderHeaderTeamList('header-team-group', currentMembers);
    
    // 2. DOM Elements
    const manageTeamBtn = document.getElementById('manage-team-btn');
    const closeMemberModal = document.getElementById('close-member-modal');
    const memberModal = document.getElementById('member-modal');
    const memberListContainer = document.getElementById('member-list-container');
    const memberForm = document.getElementById('member-form');
    
    // Form inputs
    const idInput = document.getElementById('member-id-input');
    const nameInput = document.getElementById('member-name-input');
    const emailInput = document.getElementById('member-email-input');
    const avatarInput = document.getElementById('member-avatar-input');
    
    // Form buttons and UI headers
    const formTitle = document.getElementById('form-action-title');
    const cancelEditBtn = document.getElementById('btn-cancel-edit');
    const submitBtn = document.getElementById('btn-submit-member');
    
    // Error elements
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const avatarError = document.getElementById('avatar-error');
    
    // 3. Modal Toggles
    function openModal() {
        memberModal.classList.add('active');
        memberModal.setAttribute('aria-hidden', 'false');
        
        // Render updated list
        ui.renderMemberList('member-list-container', store.getMembers(), idInput.value || null);
        
        // Focus first field
        nameInput.focus();
        
        // Accessibility focus trap setup
        document.addEventListener('keydown', trapFocus);
    }
    
    function closeModal() {
        memberModal.classList.remove('active');
        memberModal.setAttribute('aria-hidden', 'true');
        resetForm();
        
        // Remove focus trap listener
        document.removeEventListener('keydown', trapFocus);
        
        // Return focus to opening button
        manageTeamBtn.focus();
    }
    
    // Reset Add/Edit Form
    function resetForm() {
        idInput.value = '';
        memberForm.reset();
        hideErrors();
        formTitle.textContent = 'Add New Member';
        submitBtn.textContent = 'Save Member';
        cancelEditBtn.style.display = 'none';
        
        // If modal is open, redraw member items to remove selected highlight
        if (memberModal.classList.contains('active')) {
            ui.renderMemberList('member-list-container', store.getMembers(), null);
        }
    }
    
    // Hide all validation error indicators
    function hideErrors() {
        nameError.style.display = 'none';
        emailError.style.display = 'none';
        avatarError.style.display = 'none';
    }
    
    // 4. Modal Event Listeners
    manageTeamBtn.addEventListener('click', openModal);
    closeMemberModal.addEventListener('click', closeModal);
    
    // Close modal when clicking outside modal-container
    memberModal.addEventListener('click', (e) => {
        if (e.target === memberModal) {
            closeModal();
        }
    });
    
    // Esc key closes modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && memberModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Focus trapping function for accessibility (a11y)
    function trapFocus(e) {
        if (e.key !== 'Tab') return;
        
        const focusableElements = memberModal.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
    
    // 5. Member Form Actions (Submit)
    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideErrors();
        
        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const avatarVal = avatarInput.value.trim();
        const memberId = idInput.value;
        
        let hasError = false;
        
        // Name validation
        if (!nameVal) {
            nameError.style.display = 'block';
            if (!hasError) { nameInput.focus(); hasError = true; }
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailVal || !emailRegex.test(emailVal)) {
            emailError.textContent = 'Please enter a valid email address.';
            emailError.style.display = 'block';
            if (!hasError) { emailInput.focus(); hasError = true; }
        }
        
        // Avatar URL validation (optional, check valid URL structure if provided)
        if (avatarVal) {
            try {
                new URL(avatarVal);
            } catch (_) {
                avatarError.style.display = 'block';
                if (!hasError) { avatarInput.focus(); hasError = true; }
            }
        }
        
        if (hasError) return;
        
        try {
            if (memberId) {
                // Update existing record
                store.updateMember(memberId, {
                    name: nameVal,
                    email: emailVal,
                    avatarUrl: avatarVal
                });
            } else {
                // Add new record
                store.addMember({
                    name: nameVal,
                    email: emailVal,
                    avatarUrl: avatarVal
                });
            }
            
            // Re-render and reset
            resetForm();
            const updated = store.getMembers();
            ui.renderMemberList('member-list-container', updated, null);
            ui.renderHeaderTeamList('header-team-group', updated);
            
        } catch (error) {
            // Display error from state layer (e.g. duplicate email)
            emailError.textContent = error.message;
            emailError.style.display = 'block';
            emailInput.focus();
        }
    });
    
    // 6. Member Action Delegation (Edit & Delete click events)
    memberListContainer.addEventListener('click', (e) => {
        const actionButton = e.target.closest('button[data-action]');
        if (!actionButton) return;
        
        const action = actionButton.getAttribute('data-action');
        const memberItem = actionButton.closest('.member-item');
        if (!memberItem) return;
        
        const memberId = memberItem.getAttribute('data-member-id');
        
        if (action === 'edit') {
            const member = store.getMemberById(memberId);
            if (!member) return;
            
            // Populate form
            idInput.value = member.id;
            nameInput.value = member.name;
            emailInput.value = member.email;
            avatarInput.value = member.avatarUrl;
            
            // Update form UI state
            formTitle.textContent = 'Edit Member Info';
            submitBtn.textContent = 'Update Member';
            cancelEditBtn.style.display = 'inline-flex';
            hideErrors();
            
            // Render selected highlight on list item
            ui.renderMemberList('member-list-container', store.getMembers(), memberId);
            
            nameInput.focus();
            
        } else if (action === 'delete') {
            const member = store.getMemberById(memberId);
            if (!member) return;
            
            if (confirm(`Are you sure you want to delete ${member.name}? This will unassign them from any tasks.`)) {
                try {
                    store.deleteMember(memberId);
                    
                    // If the user was editing the deleted member, reset the form
                    if (idInput.value === memberId) {
                        resetForm();
                    }
                    
                    const updated = store.getMembers();
                    ui.renderMemberList('member-list-container', updated, idInput.value || null);
                    ui.renderHeaderTeamList('header-team-group', updated);
                } catch (error) {
                    alert('Error deleting member: ' + error.message);
                }
            }
        }
    });
    
    // Cancel Edit action
    cancelEditBtn.addEventListener('click', resetForm);
    
    // 7. Subscribe to global storage sync events (in case state changes on another screen/tab)
    document.addEventListener('app:members-changed', () => {
        const updated = store.getMembers();
        ui.renderHeaderTeamList('header-team-group', updated);
        if (memberModal.classList.contains('active')) {
            ui.renderMemberList('member-list-container', updated, idInput.value || null);
        }
    });
});
