# Splitwise Clone 🚀

A full-stack, modern, and beautiful web application inspired by Splitwise. This app helps you effortlessly track shared expenses, calculate net balances, and settle debts with friends, family, and housemates. It features a stunning 3D glassmorphism UI, real-time expense chat, and robust group management.

---

## 🎯 What is it?
This project is a complete reimplementation of the core features of Splitwise. It solves the awkwardness and complexity of shared finances. Whether you're planning a trip with friends, managing household bills with roommates, or tracking dinner debts, this app tracks *who owes whom* and calculates the most efficient way to settle up.

## 💡 How is it helpful?
- **Simplifies Math:** No more spreadsheets. Just enter the total cost and who paid, and the app calculates the exact debts automatically.
- **Reduces Awkwardness:** Keep a transparent ledger of debts so you never have to remind people to pay you back manually.
- **Contextual Communication:** Discuss specific expenses directly in real-time using the built-in expense chat feature.
- **Centralized Tracking:** Manage all your different groups (Trips, Apartment, Couples) in one unified dashboard.

---

## ✨ Features Added

### 1. Modern Auth & Dashboard
- **JWT Authentication:** Secure login and registration using JSON Web Tokens.
- **3D Glassmorphism UI:** A stunning, premium aesthetic on the Auth pages featuring floating geometric animations, frosted glass panels, and glowing focus states.
- **Landing Dashboard:** A beautiful, responsive home dashboard giving you quick access to all your groups, balances, and expenses.

### 2. Group Management
- Create custom groups for different scenarios (e.g., "Goa Trip", "LPU Students").
- Dynamically add members to groups via their registered username or email.

### 3. Expense Tracking & Splitting
- Add expenses to specific groups.
- Supports both **EQUAL** (split evenly among everyone) and **EXACT** (custom amounts per person) split types.
- A dedicated Expenses tab with detailed, searchable data tables.

### 4. Advanced Balance Calculation
- **Global Ledger:** View your total net balances across *all* groups at once.
- **Group-Specific Ledger:** See exactly who owes who within a specific group.
- The backend automatically calculates the most efficient debt paths (A owes B, B owes C -> simplifies debts).

### 5. Settlements
- Easily "Settle Up" when someone pays you back in cash or via a third-party app.
- Settle specific amounts, automatically adjusting the live debt ledger.

### 6. 💬 Real-Time Expense Chat
- Every single expense comes with a dedicated **Real-Time Chat Room**.
- Powered by **WebSockets**, allowing users to discuss an expense (e.g., "Why was the dinner bill so high?", "I ordered the extra fries!") instantly without refreshing the page.
- Beautiful slide-out drawer UI for the chat panel that doesn't obstruct the main view.

---

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite):** Lightning-fast modern frontend framework.
- **Tailwind CSS:** Utility-first CSS framework used for the beautiful 3D effects, gradients, and responsive layouts.
- **Lucide React:** Beautiful, consistent iconography.
- **React Router DOM:** Client-side routing for seamless page transitions.
- **Axios:** For handling REST API requests to the backend.
- **Native WebSockets:** Used for the real-time chat infrastructure.

### Backend
- **Django & Django REST Framework (DRF):** Robust, scalable Python backend API.
- **Django Channels:** Asynchronous WebSocket handling for real-time features.
- **Daphne:** ASGI server to run the asynchronous Python application.
- **SimpleJWT:** JSON Web Token authentication standard.
- **SQLite:** Lightweight relational database (easily swappable for PostgreSQL).

---

## 🚀 How it Works (Under the Hood)

1. **The Ledger System:** When an expense is added, the backend calculates `ExpenseSplits`. It records who paid and who owes. 
2. **Net Balance Algorithm:** The `compute_group_balances` service dynamically aggregates all historical expenses and settlements in a group. It cancels out reciprocal debts (if I owe you $10, and you owe me $10, it zeroes out) and returns a clean list of net debts.
3. **Real-time Protocol:** When you open an expense chat, the React frontend upgrades the HTTP connection to a WebSocket connection via Django Channels. Messages are broadcasted to all users currently subscribed to that specific `expense_id` channel.

## ⚙️ Running Locally

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
# Run the ASGI server for WebSockets + HTTP
daphne -p 8000 core.asgi:application
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and communicates with the backend on `http://localhost:8000`.
