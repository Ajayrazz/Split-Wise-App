# Architectural Decisions

1. **Why we do not silently guess**
   Financial data must be exact. If an anomaly cannot be resolved deterministically using a documented rule, the row must be flagged for review or rejected to prevent silent data corruption.

2. **Why conflicting duplicates require human review (not auto-resolution)**
   Two expenses with similar descriptions and dates could be a genuine duplicate entry, or they could represent two separate meals/purchases on the same day. Only the user can definitively confirm the reality of the situation.

3. **How negative amounts become Settlement refunds (not rejected)**
   A negative amount typically represents a refund or a reversal. Instead of rejecting it, the system logs it as a refund/settlement and takes the absolute value, ensuring the ledger math remains consistent.

4. **Why USD rate is fixed at 85.00 (not live)**
   Using a live exchange rate would violate the predictability and immutability of past expenses. A fixed rate ensures that importing the same CSV twice yields identical mathematical results.

5. **How Meera's leave date affects Row 35 (excluded, not rejected)**
   If a member was part of a group but left, they should not be billed for expenses incurred after their leave date. The system drops them from the split but allows the expense to be imported for the remaining active members.

6. **Why "Priya S" is rejected but "priya" is resolved**
   "priya" is an exact case-insensitive match for the username "Priya", which can be safely resolved deterministically. "Priya S" is a different string entirely and guessing that it means "Priya" is unsafe (there could be a "Priya Sharma" and a "Priya Singh").

7. **Why the executor uses services/splitting.py directly (not HTTP)**
   Calling the internal HTTP endpoints during ingestion would incur massive overhead, bypass atomic transaction guarantees, and complicate authentication. Direct service layer calls ensure ACID compliance for the entire batch.

8. **Why a two-step upload + confirm flow was chosen**
   Bulk financial operations require auditability. Users must have the opportunity to preview anomalies, review warnings, and manually approve or reject edge cases before the immutable ledger is permanently altered.

9. **Why ImportRowIssue and ImportRowPreview were merged into StagedExpense**
   To simplify the database schema and eliminate complex joins when rendering the frontend Staging Report. StagedExpense holds a JSON field for issues and parsed data, which perfectly matches the frontend's needs.
