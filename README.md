# 📋 Project Management Board

> A comprehensive, modern, Trello-style Kanban board built purely with core web technologies. Designed for small teams, students, and freelancers to visually manage tasks across different stages of work, track deadlines, and monitor project activity dynamically.

![Project Status](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-HTML5_|_CSS3_|_Vanilla_JS-blue?style=for-the-badge)

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Deep Dive into Features](#-deep-dive-into-features)
3. [Architecture and Tech Stack](#-architecture-and-tech-stack)
4. [Folder Structure in Detail](#-folder-structure-in-detail)
5. [Getting Started (Local Development)](#-getting-started-local-development)
6. [Team Collaboration & Git Workflow](#-team-collaboration--git-workflow)
7. [Future Roadmap](#-future-roadmap)
8. [License](#-license)

---

## 🎯 Project Overview

Teams often struggle to keep track of work when communication is scattered across chats, spreadsheets, and notes. The **Project Management Board** solves this problem by giving everyone a clear, real-time picture of what is pending, in progress, and completed. 

This frontend-only application recreates the experience of modern productivity tools where users can move tasks like sticky notes across workflow columns. The application feels interactive, fast, simple to use, and is built without the overhead of heavy frameworks like React or Angular.

---

## ✨ Deep Dive into Features

### 1. Interactive Project Board (Kanban)
- **Dynamic Columns**: Tasks are organized into logical default columns (`Backlog`, `To Do`, `In Progress`, `Review`, `Done`).
- **Real-Time Task Counts**: Each column header displays the exact number of tasks it currently holds.

### 2. Advanced Drag and Drop
- Implements the native **HTML5 Drag and Drop API** for butter-smooth interactions.
- **Visual Feedback**: Dragged items show a ghost image, and target drop zones highlight when hovered to guide the user.
- **Instant State Updates**: Moving a task immediately updates the local data state and triggers UI re-renders without refreshing the page.

### 3. Comprehensive Task Management
- **Task Cards**: Clean UI cards displaying titles, short descriptions, assigned members, due dates, priority badges, and status indicators.
- **Creation & Editing**: Dedicated modal forms for creating new tasks or editing existing ones with robust validation (e.g., titles cannot be empty, dates cannot be strictly in the past).
- **Assignees & Avatars**: Visually distinguish who is working on what with team member avatars. If no image exists, dynamic initials with unique background colors are generated.

### 4. Smart Deadline Tracking
- **Color-Coded Urgency**: 
  - 🟢 **Green**: Deadline is far away.
  - 🟡 **Yellow**: Deadline is approaching (within 48 hours).
  - 🔴 **Red**: Task is overdue.

### 5. Live Activity Log
- A dedicated side-panel that maintains a chronological list of actions taken by users.
- Automatically records events like: *"John moved 'Landing Page Design' to Review"* or *"Sarah assigned task 'Fix Navbar Bug' to Mike"*.
- Actions are timestamped and displayed dynamically via the centralized state manager.

### 6. Search and Filtering
- **Universal Search**: Instantly find tasks by typing titles or descriptions in the header search bar.
- **Advanced Filters**: Toggle tasks based on assignee, priority level, or specific due status to declutter large boards.

### 7. Responsive Design (Mobile First)
- **Desktop/Tablet Layouts**: Optimized grid layouts maximizing screen real estate.
- **Mobile Experience**: Implements horizontal scrolling for workflow columns, responsive task cards, and a sticky header to ensure usability on smaller screens.

---

## 🛠 Architecture and Tech Stack

The project relies purely on vanilla web technologies to ensure a deep understanding of core frontend mechanics.

- **HTML5**: Semantic tags, ARIA labels for accessibility, and native Drag and Drop API.
- **CSS3**: 
  - **CSS Variables (Custom Properties)** for theming and easy maintenance.
  - **Flexbox & CSS Grid** for complex, responsive 2D layouts.
  - **BEM Methodology** for predictable and scalable CSS class naming.
- **Vanilla JavaScript (ES6+)**:
  - **Modular Architecture**: Code is split into ES6 Modules (`import`/`export`).
  - **Centralized State**: The application uses a central state store (`state.js`) which broadcasts custom DOM events (`boardStateChanged`, `activityLogUpdated`) to decouple data logic from UI rendering.
  - **Event Delegation**: Efficient DOM event handling attaching listeners to parent containers rather than individual nodes.

---

## 📂 Folder Structure in Detail

```text
project-management-board/
├── index.html           # Main entry point; contains the base application shell
├── css/                 # Highly modularized CSS
│   ├── style.css        # CSS variables, resets, and global styles
│   ├── layout.css       # Structure for the sidebar, header, and main container
│   ├── board.css        # Kanban column grids and scrollbars
│   ├── task.css         # Styling for task cards, badges, and avatars
│   ├── other-views.css  # Styles for list, table, or dashboard views
│   └── responsive.css   # Media queries targeting mobile and tablet breakpoints
├── js/                  # JavaScript logic layer
│   ├── main.js          # App initialization and wiring of core event listeners
│   ├── data.js          # Mock data models, team member schemas, and mock DB logic
│   ├── state.js         # Central state manager (State updates & event dispatching)
│   ├── ui.js            # Functions purely responsible for rendering HTML dynamically
│   └── dragdrop.js      # Isolated logic for drag start, drag over, and drop events
└── README.md            # You are reading this!
```

---

## 🚦 Getting Started (Local Development)

Because this project uses ES6 Modules (`import/export`), you cannot simply open `index.html` from the file system (`file://`). It must be served over HTTP/HTTPS.

1. **Clone the Repository**
   ```bash
   git clone https://github.com/LeapX-Pune/Project-Management-Board.git
   cd Project-Management-Board
   ```

2. **Serve the Application**
   - **Using VS Code (Recommended)**: Install the [Live Server Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), right-click `index.html`, and select "Open with Live Server".
   - **Using Python**:
     ```bash
     python3 -m http.server 8000
     ```
   - **Using Node (http-server)**:
     ```bash
     npx http-server
     ```

3. **Open the browser** and navigate to `http://localhost:8000` (or the port provided by your server).

---

## 🧑‍💻 Team Collaboration & Git Workflow

We enforce a strict Branching Strategy to keep `main` and `develop` clean and stable.

### The Workflow:

1. **Update your local `develop` branch**:
   Always branch off the most recent version of `develop`.
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create a descriptive Feature Branch**:
   Use standard prefixes: `feat/` for features, `fix/` for bugs, `refactor/` for code improvements.
   ```bash
   git checkout -b feat/add-dark-mode
   ```

3. **Commit your changes**:
   Write clear, imperative commit messages.
   ```bash
   git commit -m "feat: implement dark mode toggle in header"
   ```

4. **Push and Create a Pull Request (PR)**:
   ```bash
   git push -u origin feat/add-dark-mode
   ```
   Open a PR on GitHub targeting the `develop` branch. Ensure you link any relevant issue tickets.

5. **Review Phase**:
   - Do **NOT** push directly to `develop` or `main`.
   - At least one code review approval is required before merging.

---

## 🔮 Future Roadmap (Out of Scope for V1)

While V1 focuses on a robust frontend experience, the following enhancements are planned for subsequent iterations:

- **Backend Integration**: Connecting to a Node.js/Express backend with a MongoDB database for true data persistence.
- **WebSockets**: Real-time collaborative updates (seeing teammates move cards live).
- **Authentication**: User login, registration, and personalized workspaces.
- **Rich Task Details**: Markdown support in task descriptions, file attachments, and nested sub-tasks/checklists.
- **Dark Mode**: System-aware and user-toggleable themes.

---

## 📄 License
This project is currently unlicensed. Designed and developed as part of the LeapX Internship Program.
