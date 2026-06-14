# Import Report

This report is produced by the importer engine when ingesting `expenses_export.csv`.

## Anomalies Detected

### Row 2
**Raw Data:** `{'date': '05/06/2026', 'description': 'Dinner', 'paid_by': 'Alice', 'amount': '150.00', 'currency': 'USD', 'split_type': 'EQUAL', 'split_with': 'Bob;Charlie', 'split_details': '', 'notes': ''}`
**Status:** REJECTED
- **Anomaly:** AMBIGUOUS_DATE (Action Taken: UNKNOWN)
- **Anomaly:** FOREIGN_CURRENCY_USD (Action Taken: CONVERT_TO_INR)
- **Anomaly:** UNKNOWN_PAYER (Action Taken: UNKNOWN)
- **Anomaly:** UNKNOWN_PARTICIPANT (Action Taken: UNKNOWN)
- **Anomaly:** NO_VALID_PARTICIPANTS (Action Taken: UNKNOWN)
  - *Detail:* Date ambiguous.
  - *Detail:* Currency is USD.
  - *Detail:* Unknown payer.
  - *Detail:* Unknown participant: Bob
  - *Detail:* Unknown participant: Charlie
  - *Detail:* No valid participants.

### Row 3
**Raw Data:** `{'date': '2026-06-06', 'description': 'Uber', 'paid_by': 'Bob', 'amount': '12.50', 'currency': 'EUR', 'split_type': 'PERCENTAGE', 'split_with': 'Alice;Charlie', 'split_details': 'Alice 50% Charlie 50%', 'notes': ''}`
**Status:** REJECTED
- **Anomaly:** UNSUPPORTED_CURRENCY (Action Taken: UNKNOWN)
  - *Detail:* Currency unsupported.

### Row 4
**Raw Data:** `{'date': '2026-06-07', 'description': 'Missing Amount', 'paid_by': 'Alice', 'amount': '', 'currency': 'INR', 'split_type': 'EQUAL', 'split_with': 'Bob', 'split_details': '', 'notes': ''}`
**Status:** REJECTED
- **Anomaly:** MISSING_AMOUNT (Action Taken: UNKNOWN)
  - *Detail:* Amount missing.

### Row 5
**Raw Data:** `{'date': '2026-06-08', 'description': 'Duplicate', 'paid_by': 'Alice', 'amount': '100', 'currency': 'INR', 'split_type': 'EQUAL', 'split_with': 'Bob', 'split_details': '', 'notes': ''}`
**Status:** REJECTED
- **Anomaly:** UNKNOWN_PAYER (Action Taken: UNKNOWN)
- **Anomaly:** UNKNOWN_PARTICIPANT (Action Taken: UNKNOWN)
- **Anomaly:** NO_VALID_PARTICIPANTS (Action Taken: UNKNOWN)
  - *Detail:* Unknown payer.
  - *Detail:* Unknown participant: Bob
  - *Detail:* No valid participants.

### Row 6
**Raw Data:** `{'date': '2026-06-08', 'description': 'Duplicate', 'paid_by': 'Alice', 'amount': '100', 'currency': 'INR', 'split_type': 'EQUAL', 'split_with': 'Bob', 'split_details': '', 'notes': ''}`
**Status:** REJECTED
- **Anomaly:** UNKNOWN_PAYER (Action Taken: UNKNOWN)
- **Anomaly:** UNKNOWN_PARTICIPANT (Action Taken: UNKNOWN)
- **Anomaly:** NO_VALID_PARTICIPANTS (Action Taken: UNKNOWN)
  - *Detail:* Unknown payer.
  - *Detail:* Unknown participant: Bob
  - *Detail:* No valid participants.
