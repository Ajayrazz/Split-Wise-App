# Architectural Decision Log (ADR)

This document captures the critical architectural, infrastructure, and product decisions made during the lifecycle of the Splitwise Clone project. 

---

## ADR 001: Abstracting Business Logic into a Service Layer
**Date:** 2026-06-11  
**Status:** Approved & Implemented  

**Context:** Django applications traditionally put business logic in Views or Models (`fat models, skinny views`). However, expense splitting and ledger balancing require strict mathematical guarantees and are invoked from multiple places (REST API, WebSocket actions, CSV Importer).  
**Options Considered:** 
1. Keep logic in DRF Serializers.
2. Put logic in Django Models using `save()` overrides.  
**Final Decision:** Extract all core math and validation into a distinct `/services/` directory (e.g., `services/splitting.py`, `services/validator.py`).  
**Why we chose it:** Promotes DRY (Don't Repeat Yourself) principles. Allows the CSV Importer to invoke the exact same zero-sum math engine as the REST API without making internal HTTP requests, guaranteeing atomic database transactions.  
**Trade-offs:** Adds slight overhead to the folder structure and requires developers to understand the abstraction.  
**Risks:** If developers bypass the service layer and write to models directly, the zero-sum invariant could be violated.  
**Impacted Systems:** Backend API, Importer Engine.  
**Future Review Requirements:** Review if GraphQL is introduced, to ensure resolvers continue using the service layer.

---

## ADR 002: Client-Side Aggregation for Analytics
**Date:** 2026-06-12  
**Status:** Approved & Implemented  

**Context:** The application features an "Analytics" and "Recent Activity" dashboard. We needed to decide where the aggregation (summing totals, merging timelines) should occur.  
**Options Considered:** 
1. Create complex SQL `GROUP BY` endpoints in Django.
2. Calculate everything on the React frontend using existing generic endpoints.  
**Final Decision:** Utilize Client-Side Aggregation (Alternative 2).  
**Why we chose it:** Keeps the backend API thin and generic. React's state management is highly capable of sorting and reducing arrays of a few thousand objects instantly.  
**Trade-offs:** Moves compute load to the user's browser. Will not scale infinitely.  
**Risks:** A user with 10,000+ expenses may experience noticeable UI lag or browser memory bloat due to the lack of server-side pagination.  
**Impacted Systems:** React Frontend (`useActivityFeed.js`).  
**Future Review Requirements:** Must be reviewed if average user expense rows exceed 2,000. Server-side pagination will be required at scale.

---

## ADR 003: SQLite vs. PostgreSQL Fallback Strategy
**Date:** 2026-06-12  
**Status:** Approved & Implemented  

**Context:** Production requires a robust database (PostgreSQL 15 via Supabase), but forcing developers to run Dockerized Postgres locally creates onboarding friction.  
**Options Considered:** 
1. Force Postgres usage via Docker Compose for all environments.
2. Use `dj_database_url` to fallback to SQLite if `DATABASE_URL` is omitted.  
**Final Decision:** Implement the `dj_database_url` fallback to SQLite3 (Alternative 2).  
**Why we chose it:** Maximizes developer velocity. New contributors can run the app immediately using just a Python virtual environment.  
**Trade-offs:** Risk of environment disparity (e.g., SQLite does not enforce strict data types like Postgres does for `JSONField`).  
**Risks:** A bug might only appear in production if it relies on Postgres-specific SQL syntax.  
**Impacted Systems:** Backend configurations (`settings.py`), Database Migrations.  
**Future Review Requirements:** If advanced Postgres features (like Trigram search or PostGIS) are utilized, this decision must be revoked.

---

## ADR 004: Two-Step Immutable CSV Ingestion
**Date:** 2026-06-13  
**Status:** Approved & Implemented  

**Context:** Users need to import financial data via CSV. Data is often messy (missing names, conflicting duplicates). The system must never silently guess financial data.  
**Options Considered:** 
1. Auto-ingest everything and flag errors in the UI later.
2. Two-step staging process: Upload -> Preview & Validate -> Confirm.  
**Final Decision:** Use the two-step staging process (Alternative 2).  
**Why we chose it:** Financial ledgers demand high auditability. By holding parsed data in a `StagedExpense` table and forcing human review for things like `CONFLICTING_DUPLICATE`, we protect the ledger's integrity.  
**Trade-offs:** Heavier initial database writes (writing to a staging table, then rewriting to the live table).  
**Risks:** Staged data can bloat the database if users abandon imports halfway through.  
**Impacted Systems:** Backend Importer App, React Frontend hooks (`useImport.js`).  
**Future Review Requirements:** Implement a celery task to clear orphaned `ImportBatch` records older than 24 hours.

---

## ADR 005: Epsilon-Based Floating Point Safety
**Date:** 2026-06-13  
**Status:** Approved & Implemented  

**Context:** Users cannot be removed from a group if they have an outstanding balance. In JS, `0.1 + 0.2 !== 0.3`.  
**Options Considered:** 
1. Strict equality `balance === 0`.
2. Epsilon checking `Math.abs(balance) > 0.001`.  
**Final Decision:** Use Epsilon checking (Alternative 2).  
**Why we chose it:** Standard computing practice for float comparisons. Prevents users from being permanently locked in a group due to a $0.0000000001 precision artifact.  
**Trade-offs:** Slightly more verbose code.  
**Risks:** None, as currency operations generally only require 2 decimal precision.  
**Impacted Systems:** React Frontend (`useGroupMembers.js`).  
**Future Review Requirements:** None.

---

## ADR 006: WebSockets via Django Channels
**Date:** 2026-06-13  
**Status:** Approved & Implemented  

**Context:** The application requires real-time per-expense chat.  
**Options Considered:** 
1. Integrate Firebase Realtime Database / Socket.io microservice.
2. Keep the stack unified using Django Channels + Daphne.  
**Final Decision:** Use Django Channels (Alternative 2).  
**Why we chose it:** Allows the chat system to natively leverage Django's ORM and existing JWT authentication. Reduces the number of cloud services required.  
**Trade-offs:** Requires running an ASGI server (`daphne`) rather than standard WSGI (`gunicorn`), making deployment slightly more complex. Requires Redis.  
**Risks:** Chrome DevTools IPv6 resolution issues caused local Daphne binding crashes. Hardcoded `127.0.0.1` mitigations were required.  
**Impacted Systems:** Backend Infrastructure, Frontend API calls.  
**Future Review Requirements:** Monitor Redis memory usage as chat history grows.

---

## ADR 007: Treating Negative Imports as Refunds
**Date:** 2026-06-14  
**Status:** Approved & Implemented  

**Context:** The CSV Importer frequently encounters negative amounts (representing refunds or bank reversals).  
**Options Considered:** 
1. Reject the row outright.
2. Convert to an absolute value and log as an Expense.
3. Convert to absolute value and log as a `Settlement` (refund).  
**Final Decision:** Convert to absolute value and log as a Settlement (Alternative 3).  
**Why we chose it:** Reversing an expense mathematically is identical to a settlement payout. This preserves ledger accuracy without confusing the zero-sum engine.  
**Trade-offs:** Slightly obscures the semantic difference between a "refund" and a "settlement" in the database.  
**Risks:** None identified.  
**Impacted Systems:** Importer Validator Service.  
**Future Review Requirements:** None.
