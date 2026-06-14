# Splitwise Clone 🚀

A full-stack, modern, and beautiful web application engineered to seamlessly track shared expenses, calculate net balances, and settle debts. Featuring a stunning 3D glassmorphism UI, mathematically rigorous zero-sum splitting engines, bulk CSV ingestion, and real-time WebSockets communication.

---

## 📖 Project Overview
This project is an advanced reimplementation of the core features of Splitwise. It tracks *who owes whom* and calculates the most mathematically efficient way to settle group debts. Whether you're managing apartment utility bills or a multi-currency group vacation, this app eliminates the friction of shared finances.

### 🎯 Key Capabilities
- **Advanced Expense Splitting:** Supports EQUAL, EXACT, PERCENTAGE, and SHARES splitting strategies.
- **Zero-Sum Ledger:** Guaranteed mathematical integrity. Debts and credits sum to exactly zero.
- **Real-Time Group Chat:** Persistent, per-expense WebSocket chat rooms for context-specific conversations.
- **Smart Data Ingestion:** 18-rule bulk CSV importing engine with interactive duplicate detection and warning resolution.
- **Client-Side Analytics:** Instantaneous group spending trends and activity feeds calculated locally for zero latency.

---

## 🏗️ Architecture & Technology Stack

The application relies on a decoupled Client/Server architecture using a monolithic Django backend and a React SPA.

### Frontend
- **Framework:** React 18 / Vite 5
- **Styling:** Tailwind CSS 3.4 (Glassmorphism design system)
- **State Management:** React Context API + Custom Hooks (`useImport`, `useGlobalBalance`)
- **Networking:** Axios + Native WebSockets

### Backend
- **Framework:** Python 3.11+ / Django 4.2 / Django REST Framework
- **Asynchronous Layer:** Django Channels 4.x / Daphne ASGI Server
- **Database:** PostgreSQL 15 (Supabase) in Production / SQLite3 natively local.
- **Authentication:** JWT (JSON Web Tokens) via `simplejwt`

---

## 🗂️ Repository Structure

```text
splitwise-clone/
├── backend/                  # Django API & Channels 
│   ├── core/                 # Settings, ASGI, WSGI
│   ├── apps/                 
│   │   ├── users/            # JWT Auth & User Model
│   │   ├── groups/           # Group & Membership logic
│   │   ├── expenses/         # Core expense ledgers
│   │   ├── settlements/      # Debt repayment logic
│   │   ├── chat/             # WebSocket implementations
│   │   └── importer/         # CSV bulk ingestion engine
│   ├── services/             # Core Business Logic (Math & Balances)
│   ├── manage.py             # Django entry point
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # Reusable UI elements
│   │   ├── context/          # Global state
│   │   ├── hooks/            # Complex state machines
│   │   ├── pages/            # View components
│   │   └── api/              # Axios configurations
│   ├── vite.config.js        # Build tool config
│   └── tailwind.config.js    # Design system tokens
├── SCOPE.md                  # Project requirements & User Journeys
├── DECISIONS.md              # Architectural Decision Records (ADRs)
├── AI_CONTEXT.md             # The Living System Document
└── AI_USAGE.md               # AI Agent prompting workflows
```

---

## ⚙️ Installation & Environment Setup

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Configuration (.env)
Create a `.env` file in the `backend/` directory:
```env
DEBUG=True
SECRET_KEY=your-super-secret-key
# DATABASE_URL=postgres://user:pass@host:port/dbname (Omit to fallback to local SQLite)
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 💻 Development Workflow & Running Locally

The app requires both the backend ASGI server and the frontend Vite server to run simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
source .venv/bin/activate
daphne -p 8000 core.asgi:application
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Navigate to `http://localhost:5173`.

---

## 🧪 Testing Instructions

The core mathematical invariants and parsing engines are heavily tested in Django.
```bash
cd backend
# Test the Zero-Sum math engine and balance ledgers:
python manage.py test tests.test_splitting tests.test_balances -v 2

# Test the 18-rule CSV Validation pipeline:
python manage.py test apps.importer.tests -v 2
```

---

## 🚀 Build & Deployment Process

### Frontend (Vercel)
The frontend is optimized for deployment on Vercel. 
```bash
cd frontend
npm run build
```
This generates the optimized bundle in `frontend/dist/`. Set `VITE_API_BASE_URL` in your Vercel project environment settings.

### Backend (Render.com)
The backend is designed for Render.com as an ASGI Web Service.
- **Build Command:** `pip install -r requirements.txt && python manage.py migrate`
- **Start Command:** `daphne -b 0.0.0.0 -p 8000 core.asgi:application`
- **Infrastructure:** Requires a connected Redis instance (for Django Channels) and Supabase PostgreSQL instance.

### CI/CD Overview
Currently, deployment is triggered manually via GitHub hooks to Vercel/Render. Future iterations will include GitHub Actions to block deployments if `manage.py test` fails.

---

## 🚨 Troubleshooting Guide

- **WebSocket Connection Fails (`::1` IPv6 error):** Chrome DevTools sometimes forces `localhost` to resolve to IPv6, which Daphne does not bind to by default. **Fix:** Ensure Vite and Axios proxy configurations explicitly point to `127.0.0.1` instead of `localhost`.
- **Foreign Key Constraints (Local DB):** Because local development defaults to SQLite, some strict JSONField constraints may behave differently than in Production Postgres. If encountering weird migrations, delete `db.sqlite3` and re-run `migrate`.
- **Users disappear after test runs:** Running `manage.py flush` clears the database. Register a new user via the UI.

---

## 🔐 Security Considerations

- **JWT Storage:** Access tokens are stored in React memory. Refresh tokens must be stored in `HttpOnly` cookies to prevent XSS exfiltration (WIP configuration for production).
- **Service Layer Abstraction:** Developers must NEVER write direct `.update()` calls to the database regarding balances or expenses. All modifications must pipe through `services/splitting.py` to prevent unauthorized ledger tampering.
- **Auth Gates:** All API endpoints (except `/api/v1/auth/*`) require a valid Bearer token.

---

## 🤝 Contributing Guidelines

1. **Implementation Plans:** All non-trivial PRs require a markdown Implementation Plan attached to the issue before coding begins.
2. **Zero Regressions:** PRs will be rejected if the `test_splitting.py` zero-sum invariant tests fail.

---

## 🤖 AI Tools & Usage

This project heavily leveraged AI tools (specifically **Claude 3.5 Sonnet / Antigravity Agent**) acting as an autonomous pair programmer for full-stack implementation, testing, and documentation generation. 

**Key Prompts Used:**
- *"Build Phase 1 of a CSV importer. Create the parser and validator services. Do not touch the frontend yet. Use the `Decimal` class for all math."*
- *"Implement Django Channels for real-time WebSockets on the expense detail view. Broadcast messages to all clients in the expense room."*
- *"Create a robust React DropZone component for CSV ingestion that handles loading states, reads the file buffer, and POSTs to the importer endpoint."*

For an exhaustive breakdown of the AI integration workflow, the coding standards enforced upon the AI, and a detailed log of 3 specific cases where the AI made a mistake, how it was caught, and how it was corrected, please read the [AI_USAGE.md](./splitwise-clone/AI_USAGE.md) file.

---

## 🗺️ Future Roadmap

- [ ] Multi-currency live API exchange rates (fixing the current 85.00 INR hardcode).
- [ ] Receipt OCR scanning using Vision models.
- [ ] Mobile-responsive PWA (Progressive Web App) manifest enhancements.
- [ ] S3 integration for attaching PDF invoices to expenses.
