# Project Scope & Requirements

This document defines the comprehensive scope, functional boundaries, and success criteria for the Splitwise Clone application. It serves as the definitive reference for what is (and is not) included in the product ecosystem.

---

## 1. Executive Summary

The Splitwise Clone is a full-stack, real-time financial ledger application designed to eliminate the friction of shared expenses among friends, roommates, and travel groups. The core value proposition relies on mathematically rigorous zero-sum debt calculations, contextual real-time communication via WebSockets, and seamless bulk data ingestion.

---

## 2. Scope Boundaries

### 2.1 In-Scope Features
- **User Authentication:** JWT-based secure login, registration, and session management.
- **Group Management:** Creation, viewing, and membership management of specific expense groups.
- **Expense Engine:** Creation, tracking, and multi-way splitting (Equal, Exact, Percentage, Shares).
- **Balance Calculation:** Peer-to-peer debt resolution using an optimized zero-sum algorithm.
- **Settlements:** Logging partial or full repayments to offset ledger balances.
- **Real-Time Communication:** Per-expense WebSocket chat rooms with persistent history.
- **Data Ingestion:** A robust, two-step CSV import engine with 18-rule anomaly detection.
- **Analytics & Feeds:** Client-computed activity logs and spending trend analytics.

### 2.2 Out-of-Scope Items
- **Real Money Transfers:** No integration with Stripe, Plaid, or bank APIs. The app acts purely as a ledger, not a payment gateway.
- **Email/SMS Notifications:** Backend SMTP and SMS push notifications are deferred. (External invites use native `mailto:` fallback).
- **Push Notifications:** Web Push/Mobile APNs are not implemented.
- **File Attachments:** Uploading receipt images or PDFs to an S3 bucket is deferred to a future phase.
- **Multi-Group Settlements:** You cannot settle a debt across two distinct groups simultaneously.

---

## 3. Product Phases

### 3.1 MVP Requirements (Phase 1)
- User registration and JWT authentication.
- Basic CRUD operations for Groups and Group Members.
- Basic CRUD operations for Expenses (EQUAL split only).
- Foundational PostgreSQL/SQLite database schema.
- Global and Group-level balance aggregation logic.

### 3.2 Database Schema Overview
The system relies on a relational architecture to maintain zero-sum invariants:
- `User` (id, username, email, password)
- `Group` (id, name, created_at)
- `GroupMember` (id, group_id, user_id, join_date, leave_date)
- `Expense` (id, group_id, description, amount, currency, date, split_type, created_by)
- `ExpenseSplit` (id, expense_id, user_id, amount_owed, share_value, percentage)
- `Settlement` (id, group_id, payer_id, payee_id, amount, date)
- `StagedExpense` (id, batch_id, raw_data, parsed_data, status, issue_codes, messages)

### 3.3 CSV Import Anomaly Log
During data ingestion, the system validates against the following 18 known data anomalies. Each problem triggers a strict policy action to guarantee ledger safety:

| Issue Code | Policy Action | Description |
|------------|---------------|-------------|
| `MISSING_PAYER` | **Rejected** | Payer missing |
| `MISSING_CURRENCY` | **Rejected** | Currency missing |
| `MISSING_DATE` | **Rejected** | Date missing |
| `MISSING_AMOUNT` | **Rejected** | Amount missing |
| `MISSING_SPLIT_WITH` | **Rejected** | Split with missing |
| `EMPTY_DESCRIPTION` | **Rejected** | Description empty |
| `INVALID_DATE_FORMAT` | **Rejected** | Date cannot be parsed |
| `ZERO_AMOUNT` | **Rejected** | Amount is zero |
| `INVALID_AMOUNT_FORMAT` | **Rejected** | Amount cannot be parsed |
| `UNSUPPORTED_CURRENCY` | **Rejected** | Currency other than INR/USD |
| `INVALID_SPLIT_TYPE` | **Rejected** | Split type invalid |
| `UNKNOWN_PAYER` | **Rejected** | Payer not in group |
| `UNKNOWN_PARTICIPANT` | **Warning** | Participant not in group |
| `NO_VALID_PARTICIPANTS` | **Rejected** | No valid participants |
| `PERCENTAGE_SUM_MISMATCH`| **Rejected** | Percentages do not sum to 100 |
| `EXACT_DUPLICATE` | **Skipped** | Identical date, amount, and payer |
| `CONFLICTING_DUPLICATE` | **Warning** | Similar dates/amounts needing human review |
| `AMBIGUOUS_DATE` | **Warning** | Date format ambiguous (e.g., 05/06/2026) |
| `AMOUNT_COMMA_FORMATTED` | **Cleaned** | Commas stripped automatically before parsing |
| `NEGATIVE_AMOUNT` | **Transformed**| Converted to absolute value and logged as a Settlement refund |
| `EXCESS_PRECISION` | **Cleaned** | Rounded to 2 decimal places |
| `FOREIGN_CURRENCY_USD` | **Cleaned** | Auto-converted to INR using hardcoded 85.00 rate |
| `MEMBER_BEFORE_JOIN_DATE`| **Warning** | Member was not in the group at the time of the expense |

### 3.4 Enhanced Ledger & Splitting (Phase 2)
- Advanced splitting logic (EXACT, PERCENTAGE, SHARES).
- Settlement logging to zero out balances.
- "Defense in Depth" validation (blocking user removal if debts exist).
- Frontend UI utilizing Tailwind CSS and React Context.

### 3.3 Real-Time & Bulk Operations (Phase 3 & 4)
- **WebSockets:** Implementation of Django Channels and Daphne for per-expense real-time chat.
- **CSV Importer:** Full implementation of the multi-layer CSV anomaly validation engine with interactive UI.
- **Analytics View:** Client-side computation of spending trends and group breakdowns.

### 3.4 Future Enhancements (Roadmap)
- Recurring expenses (e.g., monthly rent).
- Export to PDF/Excel for group audits.
- Multi-currency live exchange rate syncing (currently locked at 85.00 INR/USD).
- Receipt OCR scanning for automatic expense generation.

---

## 4. Requirements Breakdown

### 4.1 Functional Requirements
- **FR1:** The system MUST ensure the sum of all split amounts exactly equals the total expense amount (Zero-Sum Invariant).
- **FR2:** Users MUST be able to authenticate securely. Tokens must refresh seamlessly on the client.
- **FR3:** The system MUST allow a user to participate in multiple independent groups.
- **FR4:** The CSV importer MUST NOT automatically ingest rows that contain conflicting duplicates; human intervention is required.
- **FR5:** Users MUST be able to send and receive chat messages in real-time without refreshing the page.

### 4.2 Non-Functional Requirements
- **NFR1 (Performance):** Frontend REST API calls must resolve in under 300ms (p95).
- **NFR2 (Scalability):** The WebSocket infrastructure must support at least 50 concurrent active chat connections per group without dropping messages.
- **NFR3 (Security):** All API endpoints except `/auth/*` must strictly require a valid Bearer JWT.
- **NFR4 (Reliability):** Floating-point currency math must be handled using `Decimal` on the backend and an epsilon boundary (`0.001`) on the frontend to prevent precision lockups.

---

## 5. User Journeys

### Journey A: The Group Vacation
1. **Alice** logs in and creates a group called "Goa Trip".
2. Alice adds **Bob** and **Charlie** using their usernames.
3. Alice pays $300 for a hotel and splits it EQUALLY. The ledger shows Bob and Charlie each owe Alice $100.
4. Bob clicks on the expense and uses the real-time chat to say, "I actually slept on the couch!"
5. Alice updates the expense to an EXACT split: Alice ($120), Charlie ($120), Bob ($60). The ledger recalculates instantly.

### Journey B: The Roommate Utility Bill (CSV Import)
1. **Dave** downloads a CSV of 42 utility/grocery expenses from his bank.
2. Dave navigates to the "Import CSV" dashboard and drops the file.
3. The system validates the rows. 38 are marked clean, 2 are missing dates (rejected), and 2 are conflicting duplicates (flagged).
4. Dave resolves the conflicts manually, then clicks "Confirm Ingestion".
5. The global ledger instantly updates his balances against his roommates.

---

## 6. Deliverables & Criteria

### 6.1 Technical Deliverables
- Fully functioning React 18 SPA (Vite).
- Django 4.x Backend exposing a unified REST API.
- Daphne ASGI Server configuration for WebSockets.
- Comprehensive Test Suite (`tests.py` covering math and validation layers).
- Definitive single-source-of-truth documentation suite.

### 6.2 Acceptance Criteria
- [x] Zero-Sum math holds across all splitting logic (verified by backend test suites).
- [x] CSV Importer correctly processes all 18 documented anomalies without crashing.
- [x] WebSockets successfully broadcast messages to multiple connected clients in the same expense room.
- [x] Client-side analytics update immediately upon navigation without requiring a hard refresh.

### 6.3 Operational Requirements
- The backend MUST run via standard ASGI protocols to support simultaneous HTTP and WS requests.
- Environment variables (`DATABASE_URL`, `SECRET_KEY`, `VITE_API_BASE_URL`) MUST dictate configuration to support environment parity (Dev vs. Prod).

---

## 7. Known Limitations
- **Client-Side Compute:** Analytics and Activity feeds are computed client-side. A user with >10,000 expenses may experience UI stuttering due to the lack of server-side pagination for these derived views.
- **Local Dev vs Prod DB:** The application defaults to SQLite locally but is architected for PostgreSQL in production. This risks minor SQL syntax discrepancies if developers do not use Dockerized Postgres locally.
- **Avatar Storage:** Avatars are generated dynamically using initials. User-uploaded images are not currently supported.
