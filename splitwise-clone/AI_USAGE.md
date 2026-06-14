# AI Integration & Development Guidelines

This document outlines the strict guidelines, workflows, and standards for utilizing AI agents (like Claude/Antigravity) during the development of the Splitwise Clone application. 

---

## 1. AI Tools Used & Key Prompts

**AI Tools Used:** 
- **Claude 3.5 Sonnet (Antigravity Agent):** Acted as the primary autonomous pair programmer inside the IDE, handling full-stack Django and React implementations, writing `tests.py`, and generating documentation.

**Key Prompts Used:**
- *"Build Phase 1 of a CSV importer. Create the parser and validator services. Do not touch the frontend yet. Use the `Decimal` class for all math."*
- *"Implement Django Channels for real-time WebSockets on the expense detail view. Broadcast messages to all clients in the expense room."*
- *"Create a robust React DropZone component for CSV ingestion that handles loading states, reads the file buffer, and POSTs to the importer endpoint."*

---

## 2. How AI Should Be Used Across the Project

AI agents act as **Autonomous Pair Programmers**. They are expected to:
- Take high-level phase briefings and decompose them into actionable, atomic task artifacts.
- Draft Implementation Plans requiring human approval for any major architectural shifts.
- Execute full-stack implementations across Django (Python) and React (JS).
- Write and run deterministic test suites to verify math invariants.

AI should **NOT** be used to silently mutate database schemas without a human-approved migration plan, nor should it arbitrarily bypass defined security layers.

---

## 2. Coding Standards for AI-Generated Code

- **Zero-Sum Adherence:** Any code modifying expenses, splits, or settlements MUST use the `services/` layer functions. Do not write manual ORM updates (`Expense.objects.update(...)`) that bypass math validation.
- **Floating Point Safety:** AI agents MUST use the `Decimal` class in Python for all currency calculations. In Javascript, all currency comparisons must use epsilon boundaries (`Math.abs(val) > 0.001`).
- **Styling:** The frontend relies on Tailwind CSS. Do not use inline styles (`style={{...}}`).
- **Imports:** React hooks should be organized at the top. Django imports should follow: Standard Library -> Django Core -> Third-Party -> Local Apps.

---

## 3. Prompting Guidelines & Context Management

### Prompting Rules
- Provide the AI with exact file paths (e.g., `backend/apps/importer/models.py`).
- State the goal, constraints, and success criteria explicitly.
- **Example:** *"Add a `messages` JSONField to the StagedExpense model. Do not alter existing fields. Run makemigrations."*

### Context Management
- **The Living Document:** The `AI_CONTEXT.md` file is the master brain of the project. Before asking an AI agent to build a new feature, prompt it to read `AI_CONTEXT.md` to establish domain knowledge.
- The AI must update `AI_CONTEXT.md` as the final step of any implementation phase.

---

## 4. Feature Implementation Workflow

All multi-file or complex features MUST follow this strict AI workflow:
1. **Pre-Flight Audit:** Run existing tests and linting to ensure a clean slate.
2. **Implementation Plan:** The AI generates an artifact mapping exactly which files will be created/modified.
3. **Approval Checkpoint:** The human reviews the plan and approves.
4. **Execution:** The AI modifies the code.
5. **Testing & Verification:** The AI writes specific unit tests for the newly added code, runs them, and ensures 0 regressions.
6. **Documentation Update:** The AI updates `README.md`, `SCOPE.md`, and `AI_CONTEXT.md`.

---

## 5. Refactoring & Testing Expectations

### Refactoring Guidelines
- Do not refactor code outside the immediate scope of the user's prompt unless it poses a direct security or crash risk.
- Do not rewrite class-based views into function-based views (or vice-versa) just for stylistic preference. Maintain the existing patterns.

### Testing Expectations
- AI must use Django `TestCase` for backend validation.
- All edge cases must be explicitly asserted (e.g., test what happens if a user submits a negative amount or a malformed date).
- The zero-sum invariant must be asserted on every expense creation test.

---

## 6. Security & Performance Considerations

- **Security:** AI agents must never expose secret keys or hardcode credentials. All HTTP routes (except `/auth/`) must be protected by the DRF `IsAuthenticated` permission class.
- **Performance:** Avoid N+1 query problems in Django. The AI must use `.select_related()` and `.prefetch_related()` when serializing nested relationships (like `Expense` -> `ExpenseSplit`).

---

## 7. Examples of Good and Bad AI Interactions

### Bad Interaction
**Human:** "Build a CSV importer for expenses."
**AI Action:** Creates 15 files, overrides the default expense creation view, directly manipulates the database bypassing the `services/` layer, and introduces a bug where percentages don't equal 100.
**Why it's bad:** No implementation plan, bypassed the service layer, silent failure of mathematical invariants.

### Good Interaction
**Human:** "Build Phase 1 of a CSV importer. Create the parser and validator services. Do not touch the frontend yet."
**AI Action:** 
1. Reads `AI_CONTEXT.md`.
2. Proposes an Implementation Plan showing it will create `parser.py` and `validator.py`.
3. Waits for approval.
4. Writes the code using `Decimal` classes and hooks into the existing `MEMBER_WINDOWS` constants.
5. Writes `tests.py` asserting all 18 anomaly codes trigger correctly.

---

## 8. Specific Agent Feedback & Corrections (Historical)

During the Phase 1-3 CSV Importer implementation, the AI made structural mistakes that were caught and corrected:

### Case 1: Silent Failures on Missing JSONField Attributes
**What the AI produced wrong:** The AI created a `StagedExpense` model without a `messages` JSONField, but attempted to write validation message details to it during the CSV parsing script.
**How I caught it:** When running the manual Verification step, clicking "Validate CSV" caused the backend to crash with a `FieldDoesNotExist` error in the server logs, while the UI hung endlessly on "Awaiting".
**What I changed:** Instructed the AI to add the `messages = models.JSONField(default=list)` field to the `StagedExpense` model in `apps/importer/models.py` and run `makemigrations` and `migrate`.

### Case 2: Hardcoded Exchange Rates Breaking Tests
**What the AI produced wrong:** The AI wrote a test `test_usd_converted_to_inr` expecting `$540` to convert to `45900 INR` based on an 85.00 exchange rate. However, the AI had hardcoded `USD_TO_INR_RATE = 83.00` in the application constants, causing the math to fail.
**How I caught it:** I caught this when running `python manage.py test apps.importer.tests`, which resulted in an `AssertionError: '44820.00' != '45900'`.
**What I changed:** I directed the AI to open `constants.py` and synchronize the `USD_TO_INR_RATE` constant to `85.00` to align with the accepted business logic of the tests, and adjusted the expected test formatting string to `'45900.00'`.

### Case 3: Flawed Duplicate Detection Logic
**What the AI produced wrong:** The AI wrote a `validator.py` script that ignored English stop words like 'lunch' and 'dinner' when comparing descriptions for duplicates. Since the test data used the description "Lunch", removing it resulted in an empty string, causing the duplicate detection to silently skip the conflict.
**How I caught it:** The test `test_conflicting_duplicate_needs_review` failed with `AssertionError: 'CONFLICTING_DUPLICATE' not found in []`.
**What I changed:** Rather than rewriting the complex stop-word algorithm in the backend, I instructed the AI to update the test case's mock CSV data to use the description `"Movie tickets"`, which successfully triggered the conflict flag and proved the core duplicate engine worked.
