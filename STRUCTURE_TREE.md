# Frontend Project Structure - Visual Tree

```
frontend/
│
├── 📁 public/                    # Static assets
│
├── 📁 src/                       # Source code directory
│   │
│   ├── 📄 main.tsx               # Entry point - React app initialization
│   ├── 📄 App.tsx                # Root component
│   ├── 📄 index.css              # Global styles & Tailwind imports
│   ├── 📄 vite-env.d.ts          # Vite TypeScript definitions
│   │
│   ├── 📁 components/            # 🎨 Reusable UI Components
│   │   ├── 📄 BrandModal.tsx
│   │   ├── 📄 EmailModal.tsx
│   │   ├── 📄 EmailsChipsInput.tsx
│   │   ├── 📄 GlassCard.tsx
│   │   ├── 📄 Header.tsx
│   │   ├── 📄 InviteModal.tsx
│   │   ├── 📄 KanbanBoard.tsx
│   │   ├── 📄 Layout.tsx
│   │   ├── 📄 NotificationsModal.tsx
│   │   ├── 📄 ProjectModal.tsx
│   │   ├── 📄 ProtectedRoute.tsx
│   │   ├── 📄 Sidebar.tsx
│   │   ├── 📄 TaskCard.tsx
│   │   ├── 📄 TaskColumn.tsx
│   │   └── 📄 TaskModal.tsx
│   │
│   ├── 📁 pages/                 # 📄 Page Components (Routes)
│   │   ├── 📄 Login.tsx          #   → /login
│   │   ├── 📄 Register.tsx       #   → /register
│   │   ├── 📄 Dashboard.tsx       #   → Router component
│   │   ├── 📄 SuperadminDashboard.tsx  # → / (superadmin)
│   │   ├── 📄 AdminDashboard.tsx       # → / (admin)
│   │   ├── 📄 UserDashboard.tsx         # → / (user)
│   │   ├── 📄 Brands.tsx         #   → /brands
│   │   ├── 📄 Projects.tsx       #   → /projects
│   │   ├── 📄 ProjectDetail.tsx  #   → /projects/:id
│   │   ├── 📄 MyTasks.tsx        #   → /my-tasks
│   │   ├── 📄 SendTasksEmail.tsx #   → /send-tasks-email
│   │   └── 📄 TeamManagement.tsx #   → /team
│   │
│   ├── 📁 routes/                # 🛣️ Routing Configuration
│   │   └── 📄 AppRoutes.tsx      # Main route definitions
│   │
│   ├── 📁 services/              # 🔌 API Service Layer
│   │   ├── 📄 authService.ts     # Authentication APIs
│   │   ├── 📄 brandService.ts    # Brand APIs
│   │   ├── 📄 companyService.ts  # Company APIs
│   │   ├── 📄 dashboardService.ts # Dashboard APIs
│   │   ├── 📄 departmentService.ts # Department APIs
│   │   ├── 📄 employeeService.ts # Employee/User APIs
│   │   ├── 📄 projectService.ts  # Project APIs
│   │   ├── 📄 searchService.ts   # Search APIs
│   │   └── 📄 taskService.ts     # Task APIs
│   │
│   ├── 📁 store/                 # 🗄️ State Management (Zustand)
│   │   ├── 📄 authStore.ts       # Auth state (user, token, login/logout)
│   │   └── 📄 themeStore.ts      # Theme state (dark/light mode)
│   │
│   ├── 📁 theme/                 # 🎨 Theme Configuration
│   │   ├── 📄 colors.ts          # Color palette
│   │   └── 📄 glassmorphism.ts   # Glassmorphism styles
│   │
│   ├── 📁 types/                 # 📝 TypeScript Types
│   │   └── 📄 index.ts           # Shared type definitions
│   │
│   └── 📁 utils/                 # 🛠️ Utility Functions
│       ├── 📄 api.ts             # Axios instance & interceptors
│       └── 📄 cn.ts              # Class name utility
│
├── 📁 dist/                      # 🏗️ Production build output
│
├── 📁 node_modules/              # 📦 Dependencies (auto-generated)
│
├── 📄 index.html                 # HTML entry point
├── 📄 package.json               # Dependencies & scripts
├── 📄 package-lock.json          # Dependency lock file
│
├── ⚙️ tsconfig.json              # TypeScript config
├── ⚙️ tsconfig.node.json         # TypeScript config (Node files)
├── ⚙️ vite.config.ts            # Vite configuration
├── ⚙️ tailwind.config.js         # Tailwind CSS config
├── ⚙️ postcss.config.js          # PostCSS config
│
├── 🚀 deploy.sh                  # Deployment script
│
└── 📚 Documentation
    ├── 📄 README.md
    ├── 📄 DEPLOYMENT.md
    ├── 📄 SETUP.md
    └── 📄 PROJECT_STRUCTURE.md
```

## Quick Reference

### Entry Points
- **`main.tsx`** → Initializes React app, renders `<App />`
- **`App.tsx`** → Root component, wraps `<AppRoutes />`
- **`index.html`** → HTML template

### Component Flow
```
App.tsx
  └── AppRoutes.tsx
      ├── Public Routes (Login, Register)
      └── ProtectedRoute
          └── Layout
              ├── Sidebar
              ├── Header
              └── Page Components
```

### Data Flow
```
Pages → Services → Utils/api.ts → Backend API
  ↓
Store (Zustand) ← Services
```

### File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `TaskCard.tsx`)
- Services: `camelCase.ts` (e.g., `authService.ts`)
- Utils: `camelCase.ts` (e.g., `api.ts`)
- Stores: `camelCase.ts` (e.g., `authStore.ts`)

### Import Patterns
```typescript
// Component imports
import { TaskCard } from '@/components/TaskCard';

// Service imports
import { taskService } from '@/services/taskService';

// Store imports
import { useAuthStore } from '@/store/authStore';

// Type imports
import { Task } from '@/types';

// Utility imports
import { api } from '@/utils/api';
import { cn } from '@/utils/cn';
```

