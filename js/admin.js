// Key used for saving/loading events from Browser LocalStorage
const LOCAL_STORAGE_KEY = 'events_data';

// Initial Mock Data to populate the dashboard if LocalStorage is empty
const defaultEvents = [
    {
        id: 1,
        title: "Frontend Bootcamp",
        category: "Technology",
        date: "2026-06-20",
        time: "10:00",
        venue: "Community Hall",
        attendees: 120,
        maxAttendees: 200,
        description: "Hands-on frontend workshop covering HTML, CSS, and JS.",
        image: ""
    },
    {
        id: 2,
        title: "Jazz Music Night",
        category: "Music",
        date: "2026-07-25",
        time: "19:00",
        venue: "Downtown Club",
        attendees: 45,
        maxAttendees: 100,
        description: "An evening filled with soothing jazz performances.",
        image: ""
    }
];

// Global State
let events = [];
let isEditing = false;

// DOM Elements
const eventForm = document.getElementById('event-form');
const eventIdInput = document.getElementById('event-id');
const titleInput = document.getElementById('event-title');
const descriptionInput = document.getElementById('event-description');
const categoryInput = document.getElementById('event-category');
const dateInput = document.getElementById('event-date');
const timeInput = document.getElementById('event-time');
const venueInput = document.getElementById('event-venue');
const imageInput = document.getElementById('event-image');
const maxAttendeesInput = document.getElementById('event-max-attendees');

const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const eventsList = document.getElementById('events-list');
const noEventsMsg = document.getElementById('no-events-msg');

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    renderEvents();
    
    // Add Event Listeners
    eventForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
});

// Load events from LocalStorage or load defaults
function loadEvents() {
    const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedEvents) {
        events = JSON.parse(storedEvents);
    } else {
        events = [...defaultEvents];
        saveEventsToStorage();
    }
}

// Save events to LocalStorage
function saveEventsToStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
}

// Render the events table dynamically
function renderEvents() {
    eventsList.innerHTML = '';
    
    if (events.length === 0) {
        noEventsMsg.style.display = 'block';
        return;
    } else {
        noEventsMsg.style.display = 'none';
    }

    events.forEach(event => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><strong>${escapeHTML(event.title)}</strong></td>
            <td>${escapeHTML(event.category)}</td>
            <td>${escapeHTML(event.date)} at ${escapeHTML(event.time)}</td>
            <td>${escapeHTML(event.venue)}</td>
            <td>${event.attendees || 0} / ${event.maxAttendees}</td>
            <td>
                <button class="btn btn-edit" onclick="startEditEvent(${event.id})">Edit</button>
                <button class="btn btn-delete" onclick="deleteEvent(${event.id})">Delete</button>
            </td>
        `;
        
        eventsList.appendChild(row);
    });
}

// Handle Form Submission (Create / Update)
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate inputs
    const isValid = validateForm();
    if (!isValid) return;

    // Get input values
    const id = eventIdInput.value;
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const category = categoryInput.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const venue = venueInput.value.trim();
    const image = imageInput.value.trim();
    const maxAttendees = parseInt(maxAttendeesInput.value, 10);

    if (isEditing) {
        // Update existing event
        const eventIndex = events.findIndex(event => event.id == id);
        if (eventIndex > -1) {
            events[eventIndex] = {
                ...events[eventIndex],
                title,
                description,
                category,
                date,
                time,
                venue,
                image,
                maxAttendees
            };
            alert("Event updated successfully!");
        }
    } else {
        // Create new event
        const newEvent = {
            id: Date.now(), // Unique ID using timestamp
            title,
            description,
            category,
            date,
            time,
            venue,
            image,
            maxAttendees,
            attendees: 0 // New events start with 0 registrations
        };
        events.push(newEvent);
        alert("Event created successfully!");
    }

    // Save, Re-render, and Reset the form
    saveEventsToStorage();
    renderEvents();
    resetForm();
}

// Form Validation logic
function validateForm() {
    let isValid = true;
    
    // Reset errors
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

    // Validate Event Title
    if (titleInput.value.trim() === '') {
        document.getElementById('error-title').textContent = 'Event Title is required.';
        isValid = false;
    }

    // Validate Description
    if (descriptionInput.value.trim() === '') {
        document.getElementById('error-description').textContent = 'Description is required.';
        isValid = false;
    }

    // Validate Category
    if (categoryInput.value === '') {
        document.getElementById('error-category').textContent = 'Please select a Category.';
        isValid = false;
    }

    // Validate Date
    if (dateInput.value === '') {
        document.getElementById('error-date').textContent = 'Date is required.';
        isValid = false;
    } else {
        const selectedDate = new Date(dateInput.value);
        if (isNaN(selectedDate.getTime())) {
            document.getElementById('error-date').textContent = 'Please enter a valid Date.';
            isValid = false;
        }
    }

    // Validate Time
    if (timeInput.value === '') {
        document.getElementById('error-time').textContent = 'Time is required.';
        isValid = false;
    }

    // Validate Venue
    if (venueInput.value.trim() === '') {
        document.getElementById('error-venue').textContent = 'Venue is required.';
        isValid = false;
    }

    // Validate Maximum Attendees
    const maxAttendeesVal = maxAttendeesInput.value;
    if (maxAttendeesVal === '') {
        document.getElementById('error-max-attendees').textContent = 'Maximum Attendees is required.';
        isValid = false;
    } else {
        const num = parseInt(maxAttendeesVal, 10);
        if (isNaN(num) || num <= 0) {
            document.getElementById('error-max-attendees').textContent = 'Attendees must be greater than zero.';
            isValid = false;
        }
    }

    return isValid;
}

// Populate form for Editing
window.startEditEvent = function(id) {
    const event = events.find(e => e.id == id);
    if (!event) return;

    isEditing = true;
    formTitle.textContent = "Edit Event";
    submitBtn.textContent = "Update Event";
    cancelBtn.style.display = "inline-block";

    // Fill inputs
    eventIdInput.value = event.id;
    titleInput.value = event.title;
    descriptionInput.value = event.description;
    categoryInput.value = event.category;
    dateInput.value = event.date;
    timeInput.value = event.time;
    venueInput.value = event.venue;
    imageInput.value = event.image || '';
    maxAttendeesInput.value = event.maxAttendees;

    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
};

// Delete Event
window.deleteEvent = function(id) {
    if (confirm("Are you sure you want to delete this event?")) {
        events = events.filter(event => event.id != id);
        saveEventsToStorage();
        renderEvents();
        // If we are currently editing the deleted event, reset form
        if (isEditing && eventIdInput.value == id) {
            resetForm();
        }
    }
};

// Reset Form to Create mode
function resetForm() {
    isEditing = false;
    eventForm.reset();
    eventIdInput.value = '';
    
    formTitle.textContent = "Create New Event";
    submitBtn.textContent = "Create Event";
    cancelBtn.style.display = "none";

    // Clear error messages
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}

// Helper to escape HTML characters to prevent simple XSS
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
