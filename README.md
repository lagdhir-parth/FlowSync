# 🧩 FlowSync
**AI-powered project & task management with voice commands, workspaces, and a modern dashboard.**

FlowSync is a full-stack productivity app for individuals or small teams to organize **workspaces → projects → tasks**, visualize work in a **Kanban board**, and interact using an **AI voice assistant** and **chat bot**.

> Note: Some behavior is **assumed based on structure** where the code paths were present but not fully verifiable from the available repository scan (e.g., exact auth cookie names, some UI subcomponents).

---

## 🚀 Features

### ✅ Core Productivity
- 🗂️ **Workspaces** — create, view, manage members (invite/remove)
- 📁 **Projects** — create projects inside workspaces, update details, manage members
- ✅ **Tasks** — project tasks, edit/update, delete, reorder
- 🧱 **Kanban board** — drag & drop task workflow (DnD Kit)

### 📊 Dashboard & Analytics
- 📈 **Dashboard stats** endpoint + UI widgets (assumed from `/api/stats/dashboard` usage)
- 📉 **Charts & insights** (Recharts dependency)

### 🔐 Authentication & Accounts
- 🔑 **JWT auth** (access + refresh tokens)
- 🍪 **Cookie-based session support** (`cookie-parser` + `withCredentials: true` on client)
- 🧩 **Google OAuth** login/signup (client uses `@react-oauth/google`, server validates via `google-auth-library`)

### 🤖 AI + Voice
- 🎤 **Voice assistant** UI widget: records audio in-browser and submits to backend
- 🧠 **AI parsing/execution pipeline** (services for parsing + action execution)
- 💬 **Chat bot** endpoint + UI component

### 🛡️ Production-ready backend middleware
- 🧰 Security middleware: `helmet`, `cors`, `compression`
- 🚦 Rate limiting present (currently commented out in server `app.js`)

---

## 🛠 Tech Stack

### Frontend (client/)
- **React 19** + **Vite**
- **React Router** (routing + protected sections)
- **Tailwind CSS v4** (custom theme + animations)
- **Axios** (API calls, centralized interceptor)
- **Framer Motion** (UI animations)
- **DnD Kit** (Kanban drag & drop)
- **Recharts** (charts)
- **Google OAuth** (`@react-oauth/google`)
- **@xenova/transformers** (present as dependency; usage appears related to AI/voice features)

### Backend (server/)
- **Node.js** (ESM) + **Express v5**
- **MongoDB + Mongoose**
- **JWT** (`jsonwebtoken`) + password hashing (`bcrypt`)
- **Google auth verification** (`google-auth-library`)
- **Security/ops**: `helmet`, `cors`, `compression`, optional `express-rate-limit`

### Database
- **MongoDB** (via `MONGODB_URI` + `DB_NAME`)

### Tools / Config
- Vite + ESLint
- Vercel config present for frontend (`client/vercel.json`)

---

## 📂 Project Structure

```text
FlowSync/
├─ client/                      # React + Vite frontend
│  ├─ index.html
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ tailwind.config.js
│  ├─ vercel.json
│  └─ src/
│     ├─ main.jsx               # App bootstrap + providers (Auth, Toast, Google OAuth)
│     ├─ App.jsx                # Router + lazy-loaded pages
│     ├─ api/
│     │  ├─ axios.js            # Axios instance (baseURL + interceptor)
│     │  └─ dataApi.js          # Typed-ish API wrappers (projects/workspaces/tasks/stats/chat)
│     ├─ context/
│     │  ├─ AuthContext.jsx     # Auth state + actions
│     │  └─ ToastProvider.jsx   # Toast notifications
│     ├─ components/
│     │  ├─ ProtectedRoutes.jsx # Route guard wrapper
│     │  ├─ VoiceAssistant.jsx  # Records audio + sends voice commands
│     │  ├─ kanban/             # Kanban board UI
│     │  ├─ auth/               # Auth layouts + form controls
│     │  ├─ landing/            # Landing page sections
│     │  └─ app/                # Dashboard layout + app components
│     ├─ pages/
│     │  ├─ Landing.jsx
│     │  ├─ Login.jsx
│     │  ├─ Register.jsx
│     │  └─ app/                # Authenticated pages (dashboard/projects/tasks/workspaces)
│     ├─ hooks/
│     │  └─ useOptimisticTasks.js
│     └─ ai/
│        ├─ speechToText.js
│        └─ voiceAssistant.js
│
└─ server/                      # Express backend
   ├─ server.js                 # Bootstraps DB + starts server
   ├─ app.js                    # Express app + routes + global error handler
   ├─ package.json
   └─ src/
      ├─ config/
      │  ├─ env.js              # Required env validation + parsing
      │  ├─ db.js               # Mongoose connection
      │  └─ openrouter.js       # OpenRouter API client
      ├─ routes/                # Express routers
      ├─ controllers/           # Request handlers
      ├─ models/                # Mongoose models
      ├─ middlewares/           # Auth + request validators
      ├─ services/              # AI parsing/execution + STT/TTS helpers
      └─ utils/                 # ApiError/ApiResponse helpers + token generator
```

---

## ⚙️ Installation & Setup

### 1) Clone the repo
```bash
git clone https://github.com/lagdhir-parth/FlowSync.git
cd FlowSync
```

### 2) Install dependencies

#### Frontend
```bash
cd client
npm install
```

#### Backend
```bash
cd ../server
npm install
```

### 3) Configure environment variables

The backend **requires** environment variables at startup (it exits if missing). Create a file:

```bash
cd server
touch .env
```

Add the variables described in the **🔐 Environment Variables** section below.

For the frontend, Vite environment variables must be prefixed with `VITE_`:

```bash
cd ../client
touch .env
```

### 4) Run the app

#### Start backend (API)
```bash
cd server
npm run dev
```

#### Start frontend (Vite)
```bash
cd ../client
npm run dev
```

Frontend will run on a Vite dev port (commonly `5173`), and the API defaults to `http://localhost:3000`.

---

## 🔐 Environment Variables

### Backend (server/.env)

These are required by `server/src/config/env.js`:

| Variable | Required | Description |
|---------|----------|-------------|
| `PORT` | ✅ | Express server port (must be a number) |
| `MONGODB_URI` | ✅ | MongoDB connection string (host part) |
| `DB_NAME` | ✅ | MongoDB database name appended in code (`${MONGODB_URI}/${DB_NAME}`) |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated list of allowed frontend origins for CORS |
| `OPENROUTER_API_KEY` | ✅ | API key for OpenRouter AI requests |
| `SARVAM_API_KEY` | ✅ | API key for Sarvam (used by STT/TTS services based on naming) |
| `ACCESS_TOKEN_SECRET` | ✅ | Secret used to sign JWT access tokens |
| `ACCESS_TOKEN_EXPIRY` | ✅ | Access token expiry (string passed to JWT library, e.g., `15m`) |
| `REFRESH_TOKEN_SECRET` | ✅ | Secret used to sign refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | ✅ | Refresh token expiry (e.g., `7d`) |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client id (server-side verification) |

Example (fill with your values):
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=flowsync
ALLOWED_ORIGINS=http://localhost:5173

OPENROUTER_API_KEY=...
SARVAM_API_KEY=...

ACCESS_TOKEN_SECRET=...
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=...
REFRESH_TOKEN_EXPIRY=7d

GOOGLE_CLIENT_ID=...
```

### Frontend (client/.env)
Detected usage:
- `VITE_GOOGLE_CLIENT_ID` (used by `GoogleOAuthProvider`)

Example:
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> Note: The frontend API base URL is currently hardcoded in `client/src/api/axios.js` to `http://localhost:3000/api`. For production deployments, you’ll likely want to make this configurable via `VITE_API_BASE_URL` (see **🧪 Future Improvements**).

---

## 🔑 Authentication

FlowSync uses **JWT-based authentication** with:
- **Access token** + **Refresh token** (secrets + expiries required)
- Client sends requests with `withCredentials: true`, indicating auth is likely stored in **HTTP-only cookies** (assumed from backend + axios settings)
- Google OAuth is supported:
  - Frontend uses `@react-oauth/google` to obtain an ID credential
  - Backend uses `google-auth-library` to validate and sign-in/up users (based on dependencies + routes)

**Flows**
- 🧾 Register: email/username/password (+ optional avatar URL)
- 🔓 Login: username + password
- 🌐 Google sign-in: credential passed from client to server

---

## 📊 Key Features Breakdown

### 🏠 Dashboard
- Central home for insights and quick navigation
- Stats pulled from `/api/stats/dashboard` (used by client API wrapper)
- Visual charts (Recharts dependency)

### 🗂️ Workspaces
- Create and manage workspaces
- Invite/remove members
- Workspace details page to inspect membership and linked projects

### 📁 Projects
- Create projects within a workspace: `/api/projects/:workspaceId/create`
- Manage project details and membership (invite/remove)
- Project details page includes project overview + associated tasks

### ✅ Tasks & Kanban
- Fetch tasks by project: `/api/tasks/project/:projectId`
- Update task attributes, delete tasks
- Reorder tasks for a project (Kanban ordering): `/api/tasks/:projectId/reorder`
- Drag-and-drop board built with DnD Kit

### 🎤 Voice Assistant (AI)
- In-app floating widget records audio using `MediaRecorder`
- Sends audio + page context (projectId/workspaceId) to backend
- Backend responds with transcript and an interpreted action (assumed based on custom response headers and services)
- Global event dispatched on completion: `VOICE_COMMAND_EXECUTED_EVENT`

### 💬 Chat Bot
- Client sends messages to `/api/chat`
- Backend provides response (controller + service present)

---

## 🌐 API Endpoints (Backend)

Base URL (local): `http://localhost:3000/api`

> Endpoints listed are inferred from server route mounting in `server/app.js` and client `dataApi.js`.

### Health
- `GET /health` — health check

### Auth (`/api/auth`)
- `POST /api/auth/register` — create account (assumed from typical routing)
- `POST /api/auth/login` — login (assumed)
- `POST /api/auth/google` — Google login/signup (assumed)
- `POST /api/auth/logout` — logout (assumed)
- `POST /api/auth/refresh` — refresh tokens (assumed)

### Users (`/api/users`)
- `GET /api/users/` — list users
- `PATCH /api/users/updateProfile` — update profile
- `PATCH /api/users/updatePassword` — update password

### Workspaces (`/api/workspaces`)
- `POST /api/workspaces/` — create workspace
- `GET /api/workspaces/` — list workspaces
- `GET /api/workspaces/:workspaceId` — get workspace by id
- `GET /api/workspaces/:workspaceId/members` — list workspace members
- `PATCH /api/workspaces/:workspaceId/invite` — invite member
- `PATCH /api/workspaces/:workspaceId/remove-member` — remove member
- `DELETE /api/workspaces/:workspaceId` — delete workspace

### Projects (`/api/projects`)
- `POST /api/projects/:workspaceId/create` — create project in workspace
- `GET /api/projects/` — list projects
- `GET /api/projects/:projectId` — get project by id
- `GET /api/projects/:projectId/members` — list project members
- `GET /api/projects/:workspaceId/all` — list projects under workspace
- `PATCH /api/projects/:projectId` — update project
- `PATCH /api/projects/:projectId/invite` — invite member
- `PATCH /api/projects/:projectId/remove-member` — remove member
- `DELETE /api/projects/:projectId` — delete project

### Tasks (`/api/tasks`)
- `GET /api/tasks/` — list tasks
- `GET /api/tasks/project/:projectId` — list tasks for project
- `PATCH /api/tasks/:taskId` — update task
- `PATCH /api/tasks/:projectId/reorder` — reorder tasks for a project
- `DELETE /api/tasks/:projectId/delete-task/:taskId` — delete task

### Stats (`/api/stats`)
- `GET /api/stats/dashboard` — dashboard analytics/stats

### AI (`/api/ai`)
- `POST /api/ai/...` — voice command parsing/execution (exact route assumed; router exists)

### Chat (`/api/chat`)
- `POST /api/chat` — chatbot message endpoint

---

## 🎨 UI Overview

### Public pages
- 🪐 **Landing** (`/`) — modern multi-section marketing page (Navbar, Hero, Features, How it works, Preview, Testimonials, CTA)
- 🔐 **Login** (`/login`) — animated form + Google sign-in
- 🧾 **Register** (`/register`) — validation + password strength UI + Google sign-up

### App shell (authenticated area)
- 🧭 `DashboardLayout` hosts:
  - Sidebar navigation
  - Top navbar
  - Main outlet content
  - In-app assistants (ChatBot + VoiceAssistant, based on component presence)

### App pages
- 🏠 Dashboard Home (`/app`)
- 📁 Projects (`/app/projects`) + Project Details (`/app/projects/:projectId`)
- ✅ My Tasks (`/app/my-tasks`)
- 🗂️ Workspaces (`/app/workspaces`) + Workspace Details (`/app/workspaces/:workspaceId`)
- 👤 Profile (`/app/profile`)
- ⚙️ Settings (`/app/settings`)

### UX / UI Notes
- ✨ Animations: **Framer Motion**
- 🎨 Styling: **Tailwind CSS** with a custom dark theme palette and animation keyframes
- 📱 Layout is designed to be responsive (assumed from Tailwind usage and component patterns)

---

## 🚀 Deployment

### Frontend (Vercel recommended)
The repo includes `client/vercel.json`, indicating Vercel deployment is supported.

Typical Vercel setup:
- Root directory: `client`
- Build command: `npm run build`
- Output: `dist`

### Backend (Render / Railway / Fly.io / VPS)
Recommended production steps:
1. Set all required `server/.env` variables in your hosting platform
2. Ensure MongoDB is reachable (Atlas recommended)
3. Configure CORS `ALLOWED_ORIGINS` to include your frontend URL
4. Run:
   - `npm install`
   - `npm start`

> Important: The client currently uses a hardcoded API base URL (`http://localhost:3000/api`). For production, update it to use an environment variable (see below).

---

## 🧪 Future Improvements

- 🔧 Make API base URL configurable via `VITE_API_BASE_URL` (remove hardcoded localhost)
- 🛡️ Enable and tune `express-rate-limit` (currently commented)
- ✅ Add automated tests (API + UI)
- 🐳 Add Docker + docker-compose for local full-stack + MongoDB
- 🔁 Improve ProtectedRoutes enforcement (currently does not redirect, only shows toast)
- 📦 Add shared types/contracts between client and server (OpenAPI/Swagger or TS types)
- 🔍 Add request logging + tracing for production debugging
- 🎙️ Add streaming transcription + better error states for voice flows

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature
   ```
3. Commit changes:
   ```bash
   git commit -m "feat: add your feature"
   ```
4. Push and open a PR:
   ```bash
   git push origin feat/your-feature
   ```

---

## 📄 License

MIT (default).

> If you add a `LICENSE` file later, update this section to match it.