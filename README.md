# Pace ⚡

Pace is a modern, personal productivity command center designed to help you **Plan, Schedule, Execute, and Review** your work seamlessly. It's more than just a to-do list; it's a comprehensive tool for managing your time, projects, and goals without the clutter of team-collaboration overhead.

## ✨ Features

- **Plan:** Break down goals into manageable projects and tasks. Use the **AI Planner** to instantly generate task lists for complex goals.
- **Schedule:** Block out time for your tasks on a visual daily schedule to ensure you stay on top of what's coming.
- **Execute:** A highly focused dashboard answering one question: *What needs attention right now?*
- **Review:** Get weekly productivity summaries detailing your completion rates, scheduled hours, and non-judgmental AI-powered pattern analysis.
- **Fully Responsive:** Sleek desktop sidebar interface that gracefully transforms into a native-feeling bottom navigation bar on mobile.
- **Theming:** Full Light & Dark mode support with persistent user preferences.

## 🛠️ Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Dark/Light mode native)
- **State Management:** Zustand (UI, Theme, and Auth state)
- **Data Fetching & Caching:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Forms & Validation:** React Hook Form + Zod
- **Icons:** Lucide React
- **API Mocking:** Custom Axios Adapter for frontend-only development (simulating the Django REST Framework backend).

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Navigate into the project directory (if not already there):
   ```bash
   cd Pace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

### Building for Production

To create a production-ready build:
```bash
npm run build
```
This will generate optimized static assets in the `dist/` directory. You can preview the production build using `npm run preview`.

## 📂 Project Structure

```text
src/
├── api/           # API clients and Mock Interceptors
├── components/    # Reusable UI elements and layout components
│   ├── auth/      # Protected/Public route wrappers
│   ├── layout/    # AppShell, Sidebar, TopBar, MobileBottomNav
│   ├── tasks/     # Task cards, forms, and modals
│   └── ui/        # Buttons, Inputs, Modals, Selects, etc.
├── lib/           # Utility functions (Tailwind cn, formatters)
├── pages/         # Page-level components (Dashboard, Tasks, Settings, etc.)
├── store/         # Zustand global state (Auth, UI, Theme)
└── types/         # Global TypeScript interfaces
```

## 💡 Philosophy

Pace was built on the principle of individual focus. There are no comments, shared projects, or team notifications. The backend is designed as a strict REST API source of truth, ensuring the frontend remains light, fast, and entirely focused on delivering a polished user experience.
