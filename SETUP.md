# Frontend Setup Guide

## Quick Start

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and set your API URL (default is already set)
   # VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:6511`

## Features Implemented

✅ **Authentication**
- Login page with email/password
- Register/Signup page
- Protected routes
- JWT token management
- Auto token refresh

✅ **Dashboard**
- Stats cards (Brands, Projects, Tasks, In Progress)
- Task status breakdown
- Charts (Task trends, Progress overview)

✅ **Brands Management**
- List all brands
- Create/Edit/Delete brands
- Brand cards with status indicators
- Modal forms

✅ **Projects Management**
- List projects (filter by brand)
- Create/Edit/Delete projects
- Progress tracking with visual bars
- Project detail page
- Date display

✅ **Task Management (Kanban Board)**
- Drag & drop between statuses (Pending, In Progress, On Hold, Completed)
- Create/Edit tasks
- Priority indicators (Low, Medium, High)
- Due dates
- Assigned users
- Comments (in modal - can be extended)

✅ **My Tasks**
- View assigned tasks
- Filter by status
- Kanban or list view toggle

✅ **Team Management**
- Basic page structure (ready for extension)

✅ **UI/UX Features**
- Glassmorphism design
- Golden-yellow theme (#FFD700)
- Dark/Light theme toggle
- Responsive design (mobile-friendly)
- Smooth animations (Framer Motion)
- Loading states
- Error handling

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── BrandModal.tsx
│   │   ├── GlassCard.tsx
│   │   ├── Header.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── Layout.tsx
│   │   ├── ProjectModal.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskColumn.tsx
│   │   └── TaskModal.tsx
│   ├── pages/              # Page components
│   │   ├── Brands.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── MyTasks.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── Projects.tsx
│   │   ├── Register.tsx
│   │   └── TeamManagement.tsx
│   ├── routes/             # Routing
│   │   └── AppRoutes.tsx
│   ├── services/           # API services
│   │   ├── authService.ts
│   │   ├── brandService.ts
│   │   ├── dashboardService.ts
│   │   ├── projectService.ts
│   │   ├── searchService.ts
│   │   └── taskService.ts
│   ├── store/              # State management
│   │   ├── authStore.ts
│   │   └── themeStore.ts
│   ├── theme/              # Theme config
│   │   ├── colors.ts
│   │   └── glassmorphism.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utilities
│   │   ├── api.ts          # Axios client
│   │   └── cn.ts           # Class name utility
│   ├── App.tsx
│   └── main.tsx
```

## API Integration

All API endpoints are connected:

- ✅ Auth: `/api/auth/*`
- ✅ Brands: `/api/brands/*`
- ✅ Projects: `/api/projects/*`
- ✅ Tasks: `/api/tasks/*`
- ✅ Dashboard: `/api/dashboard/*`
- ✅ Search: `/api/search/*`

The API client automatically:
- Adds JWT tokens to requests
- Handles token refresh
- Manages errors
- Redirects to login on 401

## Customization

### Change Colors
Edit `tailwind.config.js` and `src/theme/colors.ts`

### Change Sidebar Width
Update `w-[280px]` in:
- `src/components/Sidebar.tsx`
- `src/components/Layout.tsx`
- `src/components/Header.tsx`

### Add New Pages
1. Create page in `src/pages/`
2. Add route in `src/routes/AppRoutes.tsx`
3. Add menu item in `src/components/Sidebar.tsx`

## Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Troubleshooting

**Port 6511 already in use?**
- Change port in `vite.config.ts` (currently set to 6511)

**API connection issues?**
- Check backend is running on port 5000
- Verify `VITE_API_URL` in `.env`
- Check browser console for errors

**Styling issues?**
- Ensure Tailwind classes are properly configured
- Check `tailwind.config.js`

**TypeScript errors?**
- Run `npm run build` to see all type errors
- Check type definitions in `src/types/`

