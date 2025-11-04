# Project Tracker Frontend

React + TypeScript frontend for the Project Tracker Portal.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)

Create `.env` file if you need to override API URL:

```env
VITE_API_URL=http://192.168.50.107:6510/api
```

**Note:** By default, the app uses the proxy configuration in `vite.config.ts` which points to `http://192.168.50.107:6510`.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at:
- **Local:** http://localhost:3000
- **Network:** http://192.168.50.107:3000

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── routes/         # Routing configuration
│   ├── services/       # API services
│   ├── store/          # State management (Zustand)
│   ├── theme/          # Theme configuration
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
└── vite.config.ts      # Vite configuration
```

## Features

- ✨ Glassmorphism UI design
- 🌓 Dark/Light theme toggle
- 📱 Responsive design
- 🔐 Authentication
- 📊 Dashboard with charts
- 🏢 Brand & Company management
- 📁 Project management
- ✅ Kanban-style task board
- 👥 Team management
- 🔍 Search functionality

## Network Access

The Vite dev server is configured to listen on `0.0.0.0` to allow access from other devices on the same network.

**Windows Firewall Setup:**
To allow external access, run PowerShell as Administrator:
```powershell
New-NetFirewallRule -DisplayName "Allow Project Tracker Frontend Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Any
```

## Troubleshooting

### Cannot Access from Another Device
1. Check if frontend is running: `http://localhost:3000`
2. Verify Windows Firewall rules for port 3000
3. Ensure both devices are on the same network
4. Check backend is accessible: `http://192.168.50.107:6510/health`

### API Calls Failing
- Verify backend is running on port 6510
- Check `vite.config.ts` proxy configuration
- Verify `VITE_API_URL` in `.env` (if used)
