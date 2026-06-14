# Application Scope

The Splitwise Clone application handles group creation, expense tracking, multi-way splitting (EQUAL, PERCENTAGE, EXACT), multi-currency conversion, user balances, and CSV ingestion.

# CSV Import Anomaly Log

| Issue Code | Policy | Status |
|------------|--------|--------|
| `MISSING_PAYER` | Payer missing | Rejected |
| `MISSING_CURRENCY` | Currency missing | Rejected |
| `MISSING_DATE` | Date missing | Rejected |
| `MISSING_AMOUNT` | Amount missing | Rejected |
| `MISSING_SPLIT_WITH` | Split with missing | Rejected |
| `EMPTY_DESCRIPTION` | Description empty | Rejected |
| `INVALID_DATE_FORMAT` | Date cannot be parsed | Rejected |
| `ZERO_AMOUNT` | Amount is zero | Rejected |
| `INVALID_AMOUNT_FORMAT` | Amount cannot be parsed | Rejected |
| `UNSUPPORTED_CURRENCY` | Currency other than INR/USD | Rejected |
| `INVALID_SPLIT_TYPE` | Split type invalid | Rejected |
| `UNKNOWN_PAYER` | Payer not in group | Rejected |
| `UNKNOWN_PARTICIPANT` | Participant not in group | Rejected / Warning |
| `NO_VALID_PARTICIPANTS` | No valid participants | Rejected |
| `PERCENTAGE_SUM_MISMATCH` | Percentages do not sum to 100 | Rejected |
| `EXACT_DUPLICATE` | Identical date/amount/payer | Rejected / Skipped |
| `AMBIGUOUS_DATE` | Date ambiguous (e.g. 05/06/2026) | Warning |
| `AMOUNT_COMMA_FORMATTED` | Amount has commas | Warning |
| `EXCESS_DECIMAL_PRECISION` | More than 2 decimal places | Warning |
| `NEGATIVE_AMOUNT` | Amount is negative | Warning (converted to absolute/refund) |
| `FOREIGN_CURRENCY_USD` | Currency is USD | Warning (converted to INR) |
| `MISSING_SPLIT_TYPE` | Missing split type | Warning (defaults to EQUAL) |
| `SETTLEMENT_AS_EXPENSE` | Settlement logged as expense | Warning (converted to settlement) |
| `TRAILING_WHITESPACE_PAYER` | Payer has whitespace | Warning (stripped) |
| `PAID_BY_CASE_MISMATCH` | Payer case mismatch | Warning (resolved) |
| `MEMBER_AFTER_LEAVE_DATE` | Date after member left | Warning (member excluded) |
| `MEMBER_BEFORE_JOIN_DATE` | Date before member joined | Warning (member excluded) |
| `CONFLICTING_DUPLICATE` | Similar description on same date | Warning (Needs Review) |

# Database Schema Summary

**Existing:**
- `User`: Standard Django user
- `Group`: id, name, created_at, created_by
- `GroupMember`: group, user, joined_at, left_at
- `Expense`: group, description, amount, currency, date, paid_by, split_type, split_details
- `ExpenseSplit`: expense, user, amount_owed

**Importer Additions:**
- `ImportBatch`: group, file_name, status, total_rows, created_at
- `StagedExpense`: batch, row_number, raw_data, parsed_data, status, severity, issue_codes, messages, import_as

# Import Policy Table

- All structural anomalies (missing critical fields) result in immediate rejection.
- All formatting issues (commas, excess precision) are warned and auto-corrected.
- All structural business logic issues (unknown user, zero amount) are rejected.
- All ambiguous data (negative amounts, USD, wrong case) are warned and auto-corrected based on strict predefined policies.
- Conflicting duplicates are marked as 'needs review' and require human intervention.
