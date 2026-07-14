# Project Management Board

## Project Description
The Project Management Board is a frontend-only web application designed to help teams organize and track their work visually. It functions as a Kanban-style board, providing an intuitive and interactive interface for task management, collaboration, and progress tracking.

## Objectives
- Build a robust and responsive web application using only core web technologies.
- Maintain a clean, maintainable, and modular code architecture.
- Create an intuitive user experience with smooth interactions.

## Planned Features
- [ ] Create tasks
- [ ] Edit tasks
- [ ] Delete tasks
- [ ] Assign team members
- [ ] Set priorities
- [ ] Manage due dates
- [ ] Move tasks between columns using drag and drop
- [ ] Search tasks
- [ ] Filter tasks
- [ ] View an activity log
- [ ] Responsive layout for various screen sizes

## Tech Stack
- **HTML5**: Semantic markup for application structure.
- **CSS3**: Modular styling and responsive design.
- **Vanilla JavaScript**: Core application logic and DOM manipulation.

## Folder Structure
```text
project-management-board/
├── index.html
├── assets/
│   ├── icons/
│   ├── images/
│   └── avatars/
├── css/
│   ├── style.css
│   ├── layout.css
│   ├── board.css
│   ├── task.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── data.js
│   ├── ui.js
│   └── dragdrop.js
├── README.md
└── .gitignore
```

## Getting Started
Follow these steps to run the project locally on your machine.

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Open the project**
   Navigate to the project directory in your terminal:
   ```bash
   cd project-management-board
   ```
   Open the directory in your preferred code editor (e.g., VS Code).

3. **Run using Live Server**
   To experience the application with auto-reload capabilities, use an extension like **Live Server** in VS Code:
   - Right-click on `index.html` and select **"Open with Live Server"**.
   - The application will automatically open in your default web browser.

## Project Status
Development is currently in progress. The project is in its initial setup stage, and features are actively being developed according to the planned features checklist.

## Team Collaboration Guidelines
To ensure a smooth development process, all team members should adhere to the following workflow:

1. **Create a feature branch before working**
   Always create a new branch from `main` for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make meaningful commits**
   Write clear, concise commit messages that describe what was changed.
3. **Raise a Pull Request for review**
   Once your work is complete, push your branch and open a Pull Request (PR) against the `main` branch.
4. **Do not push directly to the main branch**
   All code must be reviewed and merged via PRs. Direct commits to `main` are not permitted.

## Future Enhancements
- Integration with a database for persistent data storage.
- User authentication and authorization.
- Dark mode support.
- Real-time collaborative updates.
- Exporting board data for reporting.

## Contributing
As this is a team project, please ensure you follow the Team Collaboration Guidelines. If you identify a bug or have a feature suggestion, please discuss it with the team before starting work.

## License
No license has been added yet.
