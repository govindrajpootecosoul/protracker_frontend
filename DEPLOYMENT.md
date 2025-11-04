# Frontend Deployment Guide

## Git Repository Setup

### Initial Setup

1. **Create a new Git repository** (GitHub, GitLab, Bitbucket, etc.)
   - Repository name: `project-tracker-frontend` (or your preferred name)

2. **Initialize Git in the frontend folder:**

```bash
cd frontend
git init
git add .
git commit -m "Initial commit: Project Tracker Frontend"
```

3. **Add remote repository:**

```bash
git remote add origin https://github.com/yourusername/project-tracker-frontend.git
# or
git remote add origin git@github.com:yourusername/project-tracker-frontend.git
```

4. **Push to remote:**

```bash
git branch -M main
git push -u origin main
```

### Environment Variables

**IMPORTANT:** Never commit `.env` file to Git!

1. Copy `.env.example` to `.env` (if needed):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your backend API URL:
   ```
   VITE_API_URL=http://your-backend-url:6510/api
   ```

**Note:** In development, Vite proxy configuration in `vite.config.ts` handles API routing. You only need `.env` for production builds or to override the default proxy.

### Production Build

1. **Build the project:**
   ```bash
   npm install
   npm run build
   ```

2. **The built files are in `dist/` folder**

3. **Deploy `dist/` folder** to:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront
   - Any static hosting service

### Files Included in Git

- Source code (`src/`)
- Configuration files (`package.json`, `vite.config.ts`, etc.)
- Documentation (`README.md`, `DEPLOYMENT.md`, `SETUP.md`)
- Public assets
- `.env.example` (template)

### Files Excluded from Git

- `.env` (actual API URL if used)
- `node_modules/`
- `dist/` (build output)
- Log files
- Temporary files

