# RAG_v2 – collaborationV2 Feature Roadmap
## Future Development Plan

**Project:** RAG_v2 – AI Study Companion & Collaboration Platform  
**Version:** V2 – Proposed Development Roadmap  
**Status:** Planning and feature exploration  
**Scope:** Study Companion, Collaboration, Workbench, and shared productivity features

---

# 1. Vision

RAG_v2 is intended to grow beyond an AI-powered study companion into a broader platform for learning, planning, organizing, and collaborating.

V2 will focus on connecting three major experiences:

1. **Study Companion:** Personal learning, document understanding, AI assistance, and study analytics.
2. **Collaboration:** Workspace communication, tasks, polls, members, and resource sharing.
3. **Workbench:** Brainstorming, visual planning, shared boards, project organization, and collaborative creation.

The objective is to create an environment where students and teams can manage their learning and work without constantly switching between different applications.

---

# 2. Smart Task & Poll Scheduler

**Purpose:** Extend the existing task and poll systems with scheduled reminders and notifications.

The system should automatically notify relevant users about approaching deadlines, expiring polls, and important workspace events.

## 2.1 Task Reminders

- Schedule reminders for individual tasks.
- Notify relevant workspace members before deadlines.
- Send notifications when deadlines are approaching.
- Notify users when a task becomes overdue.
- Allow custom reminder intervals.
- Support recurring reminders where appropriate.

## 2.2 Poll Reminders

- Notify users when a poll is created.
- Remind members when a poll is about to expire.
- Notify poll creators when voting closes.
- Notify workspace members when important polls are pinned or closed.

## 2.3 Notification Types

| Event | Example |
|---|---|
| Upcoming task | Task is due tomorrow |
| Task deadline | Task deadline has arrived |
| Overdue task | This task is overdue |
| Poll expiration | Poll closes in 2 hours |
| Poll closed | Voting has ended |
| Workspace event | Upcoming workspace event |

## 2.4 Additional Capabilities

- In-app notification center.
- Notification history.
- Optional email notifications.
- Browser push notifications, subject to user permission.
- User-specific notification preferences.
- Daily and weekly workspace summaries.
- Read and unread notification status.

**Important consideration:** Notifications should be configurable to avoid overwhelming users with repeated alerts.

---

# 3. Collaborative Workbench

**Purpose:** Introduce a shared environment where workspace members can brainstorm, plan projects, organize ideas, and collaborate.

The Workbench should act as a central planning area rather than relying entirely on chat messages and individual notes.

## 3.1 Shared Brainstorming Space

Potential capabilities:

- Create brainstorming sessions.
- Add ideas as individual cards.
- Edit, move, group, and organize ideas.
- Allow multiple members to contribute.
- Add comments and reactions to ideas.
- Vote on ideas to prioritize them.
- Categorize ideas using labels.
- Convert selected ideas into workspace tasks.

## 3.2 Planning Boards

- Create boards for projects, assignments, events, or research.
- Divide projects into sections.
- Add tasks, notes, links, and resources.
- Connect ideas to existing workspace tasks.
- Attach shared documents and reference materials.
- Organize project requirements and milestones.

## 3.3 Collaborative Editing

- Multiple members working on the same board.
- Live activity and active-member indicators.
- Real-time object updates.
- Basic revision history.
- Identify who created or modified an item.
- Board-level permissions.

## 3.4 Example Workflow

A group of students is planning a college project.

1. A member creates a project board.
2. Members add their ideas.
3. The team groups related ideas.
4. Members discuss and vote on approaches.
5. Selected ideas become tasks.
6. Resources are attached to the board.
7. The team tracks progress through existing Collaboration features.

---

# 4. Interactive Collaborative Whiteboard

**Purpose:** Provide a flexible visual workspace for brainstorming, diagrams, project planning, and organizing information.

The whiteboard should be a core component of the Workbench.

## 4.1 Canvas and Objects

- Large or infinite scrollable canvas.
- Add text boxes and sticky notes.
- Freehand drawing using a mouse or stylus.
- Add shapes, arrows, connectors, and diagrams.
- Move, resize, rotate, and group objects.
- Change object colors and styles.
- Copy, duplicate, and delete objects.
- Zoom and pan around the canvas.

## 4.2 File and Resource Support

Users should be able to place different types of content directly onto the whiteboard.

| File type | Possible interaction |
|---|---|
| PDF | Preview pages and place selected pages on the board |
| TXT | Display text in a movable block |
| Markdown (.md) | Render formatted content |
| Images | Display, resize, and reposition images |
| Links | Display link previews or reference cards |

## 4.3 Collaboration

- Multiple users editing the same board.
- Live cursor and selection indicators.
- Real-time object updates.
- Comments on individual objects.
- Board permissions.
- Save and restore previous board versions.

## 4.4 Planning Tools

- Flowcharts.
- Mind maps.
- Diagrams.
- Project timelines.
- System architecture diagrams.
- Visual research organization.
- Connected notes and reference documents.

## 4.5 Example Workflow

A team is designing an application.

They can place PDF documentation, reference screenshots, text notes, flowcharts, and sticky notes on the same board. Arrows can connect related components and help the team understand how the entire project fits together.

---

# 5. Enhanced Resource Sharing & Viewer

**Purpose:** Upgrade the existing resource-sharing feature from primarily note-based sharing into a general workspace file-sharing system.

## 5.1 Supported File Formats

| Format | Viewer support |
|---|---|
| PNG, JPG, JPEG, WebP | Image preview |
| PDF | Embedded PDF viewer |
| TXT | Plain-text viewer |
| Markdown (.md) | Rendered Markdown viewer |
| Existing notes | Current shared-note viewer |

Additional formats such as DOCX and PPTX can be considered later.

## 5.2 Resource Management

- Upload and share supported files.
- Preview files without downloading them.
- Download original files.
- Display file name, size, type, uploader, and upload date.
- Organize resources into folders or categories.
- Search resources by name.
- Remove or revoke shared resources.
- Attach resources to tasks, polls, and Workbench boards.
- Open shared resources directly from the whiteboard.

## 5.3 Viewer Improvements

The resource viewer should identify the file type and load the appropriate interface.

Examples:

- Images open in an image viewer with zoom support.
- PDFs open in an embedded document viewer.
- TXT files open in a readable text interface.
- Markdown files render headings, lists, tables, links, and code blocks.

## 5.4 Access and Security

- Respect workspace membership and resource permissions.
- Prevent unauthorized access to private files.
- Validate uploaded file types and sizes.
- Use secure storage access.
- Ensure resource revocation also prevents further shared access.

---

# 6. Unified Workspace & Academic Calendar

**Purpose:** Create a centralized calendar where students and workspace members can organize academic schedules, project deadlines, meetings, and important events.

This feature should support both individual planning and shared scheduling within a workspace.

## 6.1 Academic Scheduling

Designed for students to manage their academic activities.

Potential capabilities:

- Schedule upcoming presentations and seminars.
- Track examination dates and preparation deadlines.
- Schedule practical examinations and lab sessions.
- Add regular lectures and class timetables.
- Track assignment and submission deadlines.
- Schedule study sessions and revision periods.
- Add internal assessments, viva sessions, and other academic events.

## 6.2 Workspace & Team Scheduling

For collaborative projects and group activities.

Potential capabilities:

- Scheduled team meetings.
- Project milestones.
- Task deadlines.
- Poll expiration dates.
- Group study sessions.
- Custom workspace events.
- Event invitations and attendance tracking.

## 6.3 Calendar Views

- Monthly calendar view.
- Weekly calendar view.
- Daily schedule.
- Agenda/list view.
- Separate filters for academic, personal, and workspace events.
- Color-coded event categories.

## 6.4 Smart Notifications & Reminders

Integrate the calendar with the notification scheduler.

| Event | Example notification |
|---|---|
| Presentation | Presentation tomorrow at 10 AM |
| Examination | Mathematics exam in 3 days |
| Practical | Lab practical starts in 1 hour |
| Lecture | Your lecture starts in 15 minutes |
| Assignment | Submission deadline is tomorrow |
| Team meeting | Workspace meeting starts in 30 minutes |
| Project milestone | Project milestone is approaching |

Additional capabilities:

- Custom reminder intervals.
- Recurring events for regular lectures.
- Multiple reminders for important events.
- Daily schedule summaries.
- Notification preferences for each event category.

## 6.5 Event Management

Each event could contain:

- Event title and description.
- Date and start/end time.
- Event category.
- Location or meeting link.
- Attached resources such as PDFs, notes, or presentations.
- Reminder settings.
- Recurrence settings.
- Visibility: private or shared with a workspace.

## 6.6 Academic and Collaboration Integration

- Convert a task deadline into a calendar event.
- Display poll expiration dates.
- Attach shared resources to academic events.
- Link presentation events to preparation tasks.
- Create group study sessions from a workspace.
- Link meetings to Workbench planning boards.

## 6.7 Example Use Case

A student has an upcoming week:

- Monday: Regular lectures.
- Tuesday: Practical examination.
- Wednesday: Group project meeting.
- Thursday: Presentation.
- Friday: Internal examination.

They can view the entire week in one calendar, attach study materials to events, receive reminders, and connect group activities to their Collaboration workspace.

**Privacy consideration:** Personal academic events should remain private by default. Students should explicitly choose which events or schedules they want to share with their workspace.

---

# 7. Additional Potential Features

These features complement the main V2 development tracks.

## 7.1 Kanban Task Board

A visual alternative to the current task list.

Potential columns:

- Backlog
- To Do
- In Progress
- Blocked
- Completed

Capabilities:

- Drag and drop tasks between columns.
- Open task details.
- View progress across a project.
- Filter by member, status, and deadline.
- Link tasks to Workbench boards.

## 7.2 Workspace Search

A unified search system across workspace content.

Search through:

- Messages.
- Tasks.
- Polls.
- Shared notes.
- Uploaded resources.
- Workbench boards.
- Activity history.

## 7.3 Project Progress Dashboard

A dashboard for understanding the overall state of a workspace project.

Potential information:

- Total and completed tasks.
- Overdue tasks.
- Tasks grouped by status.
- Upcoming deadlines.
- Member contributions.
- Recent activity.
- Project milestones.

## 7.4 Workspace Templates

Allow users to create workspaces using predefined templates.

Possible templates:

- College group project.
- Research team.
- Study group.
- Event planning.
- Software development project.
- Personal productivity.

Templates could automatically create a workspace structure with relevant tasks, boards, and sections.

## 7.5 AI-Assisted Planning

Use the existing AI and document-processing capabilities of RAG_v2 to assist with collaborative planning.

Potential capabilities:

- Summarize brainstorming sessions.
- Turn meeting notes into tasks.
- Generate task suggestions from project descriptions.
- Summarize long discussions.
- Extract action items from shared documents.
- Generate mind-map structures from notes.
- Search workspace documents using natural language.
- Generate study plans from upcoming academic events.

AI-generated changes should require user confirmation before creating or modifying tasks, events, or other shared content.

---

# 8. Proposed Development Priorities

The following is a suggested development order based on dependencies and potential value. It is not a fixed release schedule.

| Priority | Feature | Reason |
|---|---|---|
| High | Enhanced Resource Sharing and Viewer | Foundation for sharing different file types |
| High | Smart Task and Poll Scheduler | Extends existing tasks and polls |
| High | Unified Workspace and Academic Calendar | Connects academic and team scheduling |
| High | Collaborative Workbench | Introduces the next major collaboration experience |
| High | Interactive Whiteboard | Core visual component of Workbench |
| Medium | Kanban Task Board | Improves task management |
| Medium | Workspace Search | Makes growing content easier to navigate |
| Medium | Project Progress Dashboard | Helps teams monitor progress |
| Medium | Workspace Templates | Improves workspace creation |
| Later | AI-Assisted Planning | Builds on existing AI capabilities |

---

# 9. Technical Considerations

Before implementation, each feature should have its own data model, API requirements, permission rules, and frontend interaction design.

## 9.1 Real-Time Collaboration

The Workbench and Whiteboard will require reliable synchronization between multiple users.

Important considerations:

- Concurrent editing.
- Conflict handling.
- Reconnection behavior.
- Efficient object-level updates.
- Avoiding unnecessary full-board synchronization.

## 9.2 File Storage

- Use Supabase Storage with appropriate access controls.
- Store file metadata separately in the database.
- Validate uploaded file types and sizes.
- Use secure access for private and shared resources.
- Support previews without exposing private storage paths.

## 9.3 Notifications

- Scheduled backend process for checking deadlines and expirations.
- Persistent notification records.
- User-specific notification preferences.
- Reliable handling of recurring reminders.
- Avoid sending duplicate notifications.

## 9.4 Calendar Architecture

- Support personal and workspace events.
- Handle recurring events.
- Store timezone-aware event dates.
- Support event visibility and sharing permissions.
- Integrate with existing tasks and polls without duplicating their source data.

## 9.5 Permissions

- Reuse existing workspace membership and role checks where appropriate.
- Introduce permissions for Workbench boards and shared files.
- Keep personal events private by default.
- Ensure new capabilities do not bypass existing authorization rules.

## 9.6 Extensibility

The resource system and Workbench should support additional file formats, object types, and collaborative tools without requiring a complete redesign.

---

# 10. Long-Term Product Structure

The intended V2 platform can be organized into three connected experiences.

## A. Study Companion

Focus: Personal learning and academic productivity.

- Document uploads and understanding.
- Grounded AI question answering.
- Quizzes and learning analytics.
- Study roadmaps.
- Academic calendar.
- Examination and presentation planning.
- Personal study scheduling.

## B. Collaboration

Focus: Communication and teamwork.

- Workspaces and members.
- Invitations and role management.
- Shared resources.
- Tasks and comments.
- Polls and voting.
- Workspace chat.
- Activity feed.
- Notifications.
- Shared calendar events.

## C. Workbench

Focus: Planning and collaborative creation.

- Brainstorming spaces.
- Interactive whiteboards.
- Shared planning boards.
- Visual diagrams and mind maps.
- Project organization.
- Resource attachments.
- Real-time collaboration.
- AI-assisted planning.

These three experiences should share common foundations such as authentication, storage, notifications, permissions, and workspace membership.

---

# 11. Development Strategy

A practical implementation approach would be:

### Track 1 – Strengthen Existing Collaboration

1. Upgrade resource sharing and viewing.
2. Introduce the notification system.
3. Add task and poll reminders.
4. Connect tasks and polls to calendar events.

### Track 2 – Academic and Workspace Planning

1. Build the unified calendar.
2. Add personal academic events.
3. Add workspace events.
4. Introduce recurring lectures and reminders.
5. Integrate presentations, practicals, exams, and assignments.

### Track 3 – Workbench Foundation

1. Define Workbench data models.
2. Build shared boards.
3. Implement brainstorming cards.
4. Connect boards to workspace resources and tasks.
5. Add collaborative editing.

### Track 4 – Interactive Whiteboard

1. Build the canvas and object system.
2. Add text, shapes, notes, and connectors.
3. Add image, PDF, TXT, and Markdown support.
4. Implement real-time synchronization.
5. Add history and board permissions.

### Track 5 – Advanced Productivity

1. Kanban task board.
2. Workspace search.
3. Project progress dashboard.
4. Workspace templates.
5. AI-assisted planning.

---

**Planning note:** This is a proposed feature roadmap, not a commitment to implement every item. Individual features should be scoped, designed, and evaluated before development. The existing Collaboration V1 functionality is treated as complete; V2 focuses on extending and connecting it with the new experiences described above.