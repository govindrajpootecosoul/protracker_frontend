# Frontend Project Structure

## Overview
React + TypeScript + Vite frontend application with glassmorphism UI design.

## Directory Structure

```
frontend/
├── public/                          # Static assets (if any)
├── src/                             # Source code
│   ├── main.tsx                     # Application entry point
│   ├── App.tsx                      # Root component
│   ├── index.css                    # Global styles
│   ├── vite-env.d.ts               # Vite type definitions
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── BrandModal.tsx           # Modal for creating/editing brands
│   │   ├── EmailModal.tsx           # Modal for email composition
│   │   ├── EmailsChipsInput.tsx     # Email input with chips/tags
│   │   ├── GlassCard.tsx            # Glassmorphism card component
│   │   ├── Header.tsx               # Top navigation header
│   │   ├── InviteModal.tsx          # Modal for inviting users
│   │   ├── KanbanBoard.tsx          # Kanban board for tasks
│   │   ├── Layout.tsx               # Main layout wrapper
│   │   ├── NotificationsModal.tsx   # Notifications display modal
│   │   ├── ProjectModal.tsx         # Modal for creating/editing projects
│   │   ├── ProtectedRoute.tsx       # Route protection wrapper
│   │   ├── Sidebar.tsx              # Side navigation menu
│   │   ├── TaskCard.tsx             # Individual task card component
│   │   ├── TaskColumn.tsx           # Kanban column component
│   │   └── TaskModal.tsx            # Modal for creating/editing tasks
│   │
│   ├── pages/                       # Page components (routes)
│   │   ├── Login.tsx                # Login page
│   │   ├── Register.tsx             # Registration page
│   │   ├── Dashboard.tsx            # Base dashboard (router)
│   │   ├── SuperadminDashboard.tsx  # Superadmin dashboard
│   │   ├── AdminDashboard.tsx       # Admin dashboard
│   │   ├── UserDashboard.tsx        # Regular user dashboard
│   │   ├── Brands.tsx               # Brands management page
│   │   ├── Projects.tsx             # Projects list page
│   │   ├── ProjectDetail.tsx        # Project details page
│   │   ├── MyTasks.tsx              # User's tasks page
│   │   ├── SendTasksEmail.tsx       # Email tasks page
│   │   └── TeamManagement.tsx       # Team management page
│   │
│   ├── routes/                      # Routing configuration
│   │   └── AppRoutes.tsx            # Main routing setup
│   │
│   ├── services/                    # API service layer
│   │   ├── authService.ts           # Authentication API calls
│   │   ├── brandService.ts          # Brand-related API calls
│   │   ├── companyService.ts        # Company-related API calls
│   │   ├── dashboardService.ts      # Dashboard data API calls
│   │   ├── departmentService.ts     # Department API calls
│   │   ├── employeeService.ts       # Employee/user API calls
│   │   ├── projectService.ts        # Project API calls
│   │   ├── searchService.ts         # Search functionality API
│   │   └── taskService.ts           # Task API calls
│   │
│   ├── store/                       # State management (Zustand)
│   │   ├── authStore.ts             # Authentication state
│   │   └── themeStore.ts            # Theme (dark/light) state
│   │
│   ├── theme/                       # Theme configuration
│   │   ├── colors.ts                # Color palette definitions
│   │   └── glassmorphism.ts         # Glassmorphism styling utilities
│   │
│   ├── types/                       # TypeScript type definitions
│   │   └── index.ts                 # Shared type definitions
│   │
│   └── utils/                       # Utility functions
│       ├── api.ts                   # API client configuration (axios)
│       └── cn.ts                    # Class name utility (tailwind-merge)
│
├── dist/                            # Build output (production)
├── node_modules/                    # Dependencies (auto-generated)
│
├── index.html                       # HTML entry point
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Dependency lock file
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.node.json               # TypeScript config for Node files
├── vite.config.ts                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── deploy.sh                        # Deployment script
│
├── README.md                        # Project documentation
├── DEPLOYMENT.md                    # Deployment guide
└── SETUP.md                         # Setup instructions
```

## Component Details

### Components (`/src/components/`)

| Component | Purpose |
|-----------|---------|
| `BrandModal.tsx` | Modal dialog for creating/editing brands |
| `EmailModal.tsx` | Modal for composing and sending emails |
| `EmailsChipsInput.tsx` | Input component with email chips/tags |
| `GlassCard.tsx` | Reusable glassmorphism card wrapper |
| `Header.tsx` | Top navigation bar with user menu |
| `InviteModal.tsx` | Modal for inviting team members |
| `KanbanBoard.tsx` | Drag-and-drop Kanban board for tasks |
| `Layout.tsx` | Main layout wrapper with sidebar and header |
| `NotificationsModal.tsx` | Modal showing user notifications |
| `ProjectModal.tsx` | Modal for creating/editing projects |
| `ProtectedRoute.tsx` | HOC for protecting authenticated routes |
| `Sidebar.tsx` | Side navigation menu |
| `TaskCard.tsx` | Individual task card component |
| `TaskColumn.tsx` | Column component for Kanban board |
| `TaskModal.tsx` | Modal for creating/editing tasks |

### Pages (`/src/pages/`)

| Page | Route | Access |
|------|-------|--------|
| `Login.tsx` | `/login` | Public |
| `Register.tsx` | `/register` | Public |
| `SuperadminDashboard.tsx` | `/` | Superadmin only |
| `AdminDashboard.tsx` | `/` | Admin only |
| `UserDashboard.tsx` | `/` | All authenticated users |
| `Brands.tsx` | `/brands` | Authenticated |
| `Projects.tsx` | `/projects` | Authenticated |
| `ProjectDetail.tsx` | `/projects/:id` | Authenticated |
| `MyTasks.tsx` | `/my-tasks` | Authenticated |
| `SendTasksEmail.tsx` | `/send-tasks-email` | Authenticated |
| `TeamManagement.tsx` | `/team` | Admin/Superadmin |

### Services (`/src/services/`)

| Service | Purpose |
|---------|---------|
| `authService.ts` | Login, register, logout, token management |
| `brandService.ts` | CRUD operations for brands |
| `companyService.ts` | Company management operations |
| `dashboardService.ts` | Dashboard statistics and data |
| `departmentService.ts` | Department management |
| `employeeService.ts` | Employee/user management |
| `projectService.ts` | Project CRUD operations |
| `searchService.ts` | Global search functionality |
| `taskService.ts` | Task CRUD and status updates |

### Store (`/src/store/`)

| Store | Purpose |
|-------|---------|
| `authStore.ts` | User authentication state, user info, login/logout |
| `themeStore.ts` | Dark/light theme toggle state |

### Utils (`/src/utils/`)

| Utility | Purpose |
|---------|---------|
| `api.ts` | Axios instance with interceptors, base URL configuration |
| `cn.ts` | Utility for merging Tailwind CSS classes |

### Theme (`/src/theme/`)

| File | Purpose |
|------|---------|
| `colors.ts` | Color palette definitions for light/dark themes |
| `glassmorphism.ts` | Glassmorphism effect utilities and styles |

## Technology Stack

### Core
- **React 18.2** - UI library
- **TypeScript 5.2** - Type safety
- **Vite 5.0** - Build tool and dev server

### Routing
- **React Router DOM 6.20** - Client-side routing

### State Management
- **Zustand 4.4** - Lightweight state management

### API & Data Fetching
- **Axios 1.6** - HTTP client
- **@tanstack/react-query 5.8** - Server state management

### UI Libraries
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Framer Motion 10.16** - Animation library
- **Lucide React 0.294** - Icon library
- **Recharts 2.10** - Chart library

### Forms & Validation
- **React Hook Form 7.48** - Form handling
- **Express Validator** - Validation (backend)

### Drag & Drop
- **@dnd-kit/core 6.0** - Drag and drop primitives
- **@dnd-kit/sortable 7.0** - Sortable components
- **@dnd-kit/utilities 3.2** - DnD utilities

### Utilities
- **date-fns 2.30** - Date manipulation
- **clsx 2.0** - Conditional class names
- **tailwind-merge 2.1** - Merge Tailwind classes

## Path Aliases

The project uses path aliases configured in `vite.config.ts` and `tsconfig.json`:

- `@/` → `./src/`

Example usage:
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/utils/api';
```

## Configuration Files

### `vite.config.ts`
- Vite configuration
- Path alias setup (`@/` → `./src/`)
- Proxy configuration for API calls
- Server configuration (host, port)

### `tsconfig.json`
- TypeScript compiler options
- Path mappings
- Strict mode enabled

### `tailwind.config.js`
- Tailwind CSS configuration
- Custom theme extensions
- Content paths

### `package.json`
- Dependencies and dev dependencies
- Scripts: `dev`, `build`, `preview`, `lint`

## Build Process

1. **Development**: `npm run dev`
   - Starts Vite dev server on port 6511
   - Hot module replacement (HMR)
   - Proxy to backend API

2. **Production Build**: `npm run build`
   - TypeScript compilation
   - Vite production build
   - Output to `dist/` folder

3. **Preview**: `npm run preview`
   - Preview production build locally

## Important Notes

- All imports use the `@/` alias for cleaner imports
- Components are organized by feature/type
- Services handle all API communication
- State management is centralized in `/store`
- Theme can be toggled between dark/light modes
- Routes are protected using `ProtectedRoute` component
- Glassmorphism design system is used throughout

