# Study Planner Architecture & Implementation Plan

This document outlines the architecture, tech stack, and implementation strategy for the Study Planner application based on the initial requirements.

## 1. Tech Stack Recommendation

For a lightweight, local-first study planner with a rich UI, the following stack is recommended:

- **Framework**: [Electron](https://www.electronjs.org/) (Desktop App)
- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [SQLite](https://sqlite.org/) (via `better-sqlite3`)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Client state) + [TanStack Query](https://tanstack.com/query/latest) (DB state)
- **Icons**: [Lucide React](https://lucide.dev/)

## 2. Project Structure

```text
/
├── docs/                # Documentation (Requirements, Architecture)
├── src/
│   ├── main/            # Electron Main Process (SQLite, IPC handlers)
│   │   ├── db/          # Database connection & Migrations
│   │   └── services/    # Business logic (Conflict detection, Feedback)
│   ├── preload/         # Electron Preload Script (Safe IPC bridge)
│   └── renderer/        # React Application
│       ├── components/  # Reusable UI components (Pastel theme)
│       ├── features/    # Feature-based modules (Calendar, Task, Feedback)
│       ├── hooks/       # Custom hooks (Queries, Mutations)
│       ├── store/       # Zustand stores
│       └── styles/      # Tailwind & Global styles
└── package.json
```

## 3. UI/UX Strategy: Pink Pastel Theme

The application will use a consistent "Pink Pastel" theme using Tailwind CSS configuration.

### Color Palette (Examples)
- **Primary Pink**: `#FFB6C1` (Light Pink)
- **Secondary Pastel**: `#FFD1DC` (Pink Lace)
- **Background**: `#FFF5F7` (Very Light Pink)
- **Accent (Lavender)**: `#E6E6FA`
- **Success (Mint)**: `#B2F2BB`
- **Warning (Peach)**: `#FFD8B1`

### Component Highlights
- **Main Calendar**: Month-view grid with pastel-colored task indicators.
- **Task Modal**: Clean, rounded inputs with a focus on simplicity.
- **Timeline View (Daily)**: Vertical or horizontal timeline in the day modal to visualize overlaps.
- **Feedback Cards**: Emoji-based mood selection and pastel-colored charts for monthly reviews.

## 4. Database Schema (SQLite)

### Table: `tasks`
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | |
| `title` | TEXT | Task title |
| `description` | TEXT | Details (optional) |
| `date` | TEXT | YYYY-MM-DD |
| `start_time` | INTEGER | Minutes from start of day (e.g., 1080 for 6 PM) |
| `duration` | INTEGER | Minutes (30, 60, ..., 240) |
| `is_completed` | INTEGER | 0 or 1 |
| `category_color`| TEXT | Pastel color code |

### Table: `feedback`
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | |
| `date` | TEXT UNIQUE | YYYY-MM-DD |
| `mood` | INTEGER | 1-5 Scale |
| `content` | TEXT | User's feedback notes |
| `monthly_summary`| TEXT | (Optional) Monthly reflection |

## 5. Key Logic Implementations

### A. Time Conflict Detection
When adding a task:
1. Calculate `start` and `end` times.
2. Query DB: `SELECT * FROM tasks WHERE date = ? AND NOT (end <= new_start OR start >= new_end)`.
3. If results exist, trigger an alert to the user.

### B. Daily/Monthly Feedback
- **Daily**: A dedicated section in the day modal to save mood and notes.
- **Monthly**: A summary view triggered from the main calendar, aggregating completion rates and common feedback patterns.

## 6. Development Roadmap

1. **Phase 1: Foundation** (Project setup, Electron/Vite config, SQLite initialization).
2. **Phase 2: Core Calendar** (Monthly grid view, navigation).
3. **Phase 3: Task Management** (Add/Edit/Delete modals, Conflict detection logic).
4. **Phase 4: Feedback System** (Daily input, Monthly summary view).
5. **Phase 5: Polish** (Refining Pink Pastel UI, animations, and final testing).
