# AI_CONTEXT.md — Splitwise Clone Living System Document
**Version:** 1.0  
**Last Updated:** 2026-06-12T10:29:00Z  
**Phase:** 0 — Blueprint Complete

## 1. PROJECT MISSION
A simplified, production-grade Splitwise clone built as a full-stack web application. Core mechanics: group expense tracking, 4 split strategies with zero-sum mathematical guarantees, peer-to-peer balance ledgers, settlement logging, and real-time per-expense chat via WebSockets.

## 2. EVALUATION CONTEXT
This project is evaluated by Spreetail. The evaluator will paste this AI_CONTEXT.md into an identical AI agent to reconstruct the app. Any ambiguity or missing detail in this document constitutes a failure condition.

## 3. ABSOLUTE TECH STACK
| Layer              | Technology                                  |
|--------------------|---------------------------------------------|
| Backend API        | Python 3.11+, Django 4.2, Django REST Framework 3.14 |
| Real-Time          | Django Channels 4.x, Daphne ASGI server     |
| Database           | PostgreSQL 15 (hosted on Supabase)          |
| Frontend           | React 18, Vite 5, Tailwind CSS 3.4          |
| State Management   | React Context API + useReducer              |
| Auth               | djangorestframework-simplejwt               |
| Deployment         | Frontend → Vercel; Backend → Render         |

## 4. REPOSITORY STRUCTURE
splitwise-clone/
├── backend/
│   ├── core/                  # Django project config package
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── exceptions.py      # Custom DRF exception handler
│   ├── apps/
│   │   ├── users/             # Authentication app
│   │   │   ├── migrations/
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py      # Custom User model
│   │   │   ├── serializers.py # Auth serializers
│   │   │   ├── urls.py        # Auth routes
│   │   │   ├── views.py       # Auth views
│   │   │   └── tests.py
│   │   ├── groups/            # Groups & membership app
│   │   ├── expenses/          # Expenses & splits app
│   │   ├── settlements/       # Settlement ledger app
│   │   └── chat/              # WebSocket chat app
│   ├── services/
│   │   ├── splitting.py       # Math engine for zero-sum splits
│   │   └── balances.py        # Balance computation engine
│   ├── tests/
│   │   ├── test_splitting.py  # Unit tests for splitting logic
│   │   └── test_balances.py   # Unit tests for balances
│   ├── requirements.txt       # Python dependencies
│   ├── manage.py              # Django entry point
│   └── .env.example           # Environment variables template
├── frontend/                  # React Vite frontend (empty for now)
├── AI_CONTEXT.md              # THE LIVING SYSTEM DOCUMENT
└── .gitignore                 # Git ignore patterns

## 5. ENVIRONMENT VARIABLES
DATABASE_URL=<supabase_postgres_connection_string>  # Full Postgres URL from Supabase dashboard
SECRET_KEY=<django_secret_key>                       # Django SECRET_KEY, min 50 chars
DEBUG=False                                          # Set True for local dev only
ALLOWED_HOSTS=<render_domain>,localhost              # Comma-separated allowed hosts
CORS_ALLOWED_ORIGINS=<vercel_url>,http://localhost:5173  # Frontend origins
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60                 # Access token TTL
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7                    # Refresh token TTL
DJANGO_CHANNEL_LAYERS_URL=redis://localhost:6379     # Redis URL for Channels layer

## 6. DATABASE SCHEMA (COMPLETE)
**User**
- id (Primary Key)
- email (EmailField, unique)
- password (CharField)
- first_name (CharField)
- last_name (CharField)
- created_at (DateTimeField)

**Group**
- id (Primary Key)
- name (CharField)
- created_by (ForeignKey to User, CASCADE)
- created_at (DateTimeField)

**GroupMember**
- id (Primary Key)
- group_id (ForeignKey to Group, CASCADE)
- user_id (ForeignKey to User, CASCADE)
- joined_at (DateTimeField)
- **Constraint:** UNIQUE constraint on (group_id, user_id)

**Expense**
- id (Primary Key)
- group_id (ForeignKey to Group, CASCADE)
- description (CharField)
- total_amount (DecimalField)
- paid_by (ForeignKey to User, CASCADE)
- created_by (ForeignKey to User, CASCADE)
- split_type (CharField)
- created_at (DateTimeField)

**ExpenseSplit**
- id (Primary Key)
- expense_id (ForeignKey to Expense, CASCADE)
- user_id (ForeignKey to User, CASCADE)
- amount_owed (DecimalField)
- **Index:** Composite index on (expense_id, user_id)

**ChatMessage**
- id (Primary Key)
- expense_id (ForeignKey to Expense, CASCADE)
- user_id (ForeignKey to User, CASCADE)
- message (TextField)
- timestamp (DateTimeField)
- **Index:** Composite index on (expense_id, timestamp)

**Settlement**
- id (Primary Key)
- group_id (ForeignKey to Group, CASCADE)
- payer_id (ForeignKey to User, CASCADE)
- payee_id (ForeignKey to User, CASCADE)
- amount (DecimalField)
- created_at (DateTimeField)
- **Constraint:** Settlement amounts are always positive; reversals are new records

## 7. API ENDPOINT REGISTRY
POST    /api/v1/auth/login/              —  Login and get JWT          —  Auth Required: No ✅ IMPLEMENTED
POST    /api/v1/auth/register/           —  Register new user          —  Auth Required: No ✅ IMPLEMENTED
POST    /api/v1/auth/refresh/            —  Refresh JWT token          —  Auth Required: No ✅ IMPLEMENTED
POST    /api/v1/auth/logout/             —  Logout and clear cookie    —  Auth Required: No ✅ IMPLEMENTED

GET     /api/v1/auth/me/                 —  Get current user details   —  Auth Required: Yes ✅ IMPLEMENTED

GET     /api/v1/groups/                  —  List user's groups         —  Auth Required: Yes
POST    /api/v1/groups/                  —  Create a new group         —  Auth Required: Yes
GET     /api/v1/groups/<id>/             —  Get group details          —  Auth Required: Yes
POST    /api/v1/groups/<id>/members/     —  Add member to group        —  Auth Required: Yes

GET     /api/v1/groups/<id>/expenses/    —  List group expenses        —  Auth Required: Yes
POST    /api/v1/groups/<id>/expenses/    —  Create new expense         —  Auth Required: Yes
GET     /api/v1/expenses/<id>/           —  Get expense and splits     —  Auth Required: Yes

GET     /api/v1/groups/<id>/settlements/ —  List group settlements     —  Auth Required: Yes
POST    /api/v1/groups/<id>/settlements/ —  Create a settlement        —  Auth Required: Yes

GET     /api/v1/groups/<id>/balances/    —  Get peer-to-peer balances  —  Auth Required: Yes
GET     /api/v1/expenses/<id>/chat/      —  Get chat history           —  Auth Required: Yes

## 8. WEBSOCKET PROTOCOL
- Connection URL pattern: ws://<host>/ws/chat/<expense_id>/
- Auth: JWT passed as query parameter ?token=<access_token>
- Message payload schema (JSON):
  { "type": "chat_message", "message": "<text>", "user_id": <int>, 
    "username": "<str>", "timestamp": "<ISO8601>" }
- Server broadcast: same schema echoed to all connected clients in room

## 9. MATHEMATICAL ZERO-SUM ENGINE
EQUAL:
  base = floor(total_amount / num_users * 100) / 100
  remainder = total_amount - (base * num_users)
  all users get base; LAST USER gets base + remainder

UNEQUAL:
  amounts are user-provided; validate sum == total_amount before saving
  if sum != total_amount: raise ValidationError

PERCENTAGE:
  validate percentages sum to exactly 100.00 before computing
  each_share = floor((pct / 100) * total_amount * 100) / 100
  remainder = total_amount - sum(all shares)
  LAST USER absorbs remainder

SHARE:
  each_unit = floor(total_amount / total_shares * 100) / 100
  each user gets their_shares * each_unit
  remainder = total_amount - sum(all computed amounts)
  LAST USER absorbs remainder

Mathematical invariant enforced: sum(ExpenseSplit.amount_owed) == Expense.total_amount
This is enforced at the service layer in services/splitting.py AND validated 
in the DRF serializer before any database write.

## 10. BALANCE COMPUTATION ALGORITHM
For a given group_id, the peer-to-peer balance between user A and user B is:

  net(A→B) = 
    SUM(ExpenseSplit.amount_owed WHERE user_id=A AND expense paid_by=B)
  - SUM(ExpenseSplit.amount_owed WHERE user_id=B AND expense paid_by=A)
  - SUM(Settlement.amount WHERE payer_id=A AND payee_id=B)
  + SUM(Settlement.amount WHERE payer_id=B AND payee_id=A)

If net > 0: A owes B that amount.
If net < 0: B owes A that amount.
Implemented in services/balances.py, called by the /api/v1/groups/<id>/balances/ endpoint.

## 11. FRONTEND ARCHITECTURE
- Layout: Fixed left sidebar (240px) + top metrics banner (64px) + main 
  workspace viewport + optional right contextual pane (320px)
- Routing: React Router v6, routes: /, /login, /register, /groups/:id, 
  /groups/:id/expenses/:expenseId
- Auth flow: JWT stored in memory (React Context). Refresh token stored in 
  HttpOnly cookie (set by backend). On app load, call /api/v1/auth/refresh/ 
  to silently restore session.
- Unread chat: tracked client-side only; badge resets on expense pane open.

## 12. PHASE COMPLETION LOG
| Phase | Status | Completion Timestamp |
|-------|--------|---------------------|
| 0     | ✅ Complete | 2026-06-12T10:29:00Z |
| 1     | ✅ Complete | 2026-06-12T10:40:00Z |
| 2     | ⏳ Pending  |             |
| 3     | ⏳ Pending  |             |
| 4     | ⏳ Pending  |             |
| 5     | ⏳ Pending  |             |
