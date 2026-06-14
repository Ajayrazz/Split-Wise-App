## Tool Used: Claude (Anthropic)

## How It Was Used
Claude was utilized as the primary autonomous agent (Antigravity) to design, architect, and implement the Backend CSV Import Engine and the Frontend Import Dashboard. Claude managed the multi-phase deployment, including database migrations, React state machines, and the complex 18-rule validation engine.

## 3+ Cases Where AI Was Wrong:

1. **Case 1:** Row numbers in briefing were off by 1-2 from actual CSV. AI caught this by reading the CSV directly before accepting the briefing's row references.
2. **Case 2:** `executor.py` first draft used internal HTTP calls to existing expense endpoint. Changed to call splitting service directly for atomic transaction and auth bypass safety.
3. **Case 3:** Conflicting duplicate detection originally only flagged the second row. Fixed to retroactively mark both rows as `needs_review` so neither gets silently imported.
