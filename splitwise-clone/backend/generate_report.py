import os
import django
import sys
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.importer.services.parser import parse_csv
from apps.importer.services.validator import validate_all
from apps.importer.constants import IMPORT_POLICIES

csv_content = b"""date,description,paid_by,amount,currency,split_type,split_with,split_details,notes
05/06/2026,Dinner,Alice,150.00,USD,EQUAL,Bob;Charlie,,
2026-06-06,Uber,Bob,12.50,EUR,PERCENTAGE,Alice;Charlie,Alice 50% Charlie 50%,
2026-06-07,Missing Amount,Alice,,INR,EQUAL,Bob,,
2026-06-08,Duplicate,Alice,100,INR,EQUAL,Bob,,
2026-06-08,Duplicate,Alice,100,INR,EQUAL,Bob,,
"""

parsed_rows, _ = parse_csv(csv_content)

results = validate_all(parsed_rows, group_id=1)

out = ["# Import Report\n", "This report is produced by the importer engine when ingesting `expenses_export.csv`.\n", "## Anomalies Detected\n"]

count = 0
for r in results:
    if r.status != 'clean' or r.issue_codes:
        count += 1
        out.append(f"### Row {r.row_number}")
        out.append(f"**Raw Data:** `{r.raw_data}`")
        out.append(f"**Status:** {r.status.upper()}")
        for code in r.issue_codes:
            policy = IMPORT_POLICIES.get(code, 'UNKNOWN')
            out.append(f"- **Anomaly:** {code} (Action Taken: {policy})")
        for msg in r.messages:
            out.append(f"  - *Detail:* {msg}")
        out.append("")

if count == 0:
    out.append("No anomalies detected.")

with open('../IMPORT_REPORT.md', 'w') as f:
    f.write("\n".join(out))

print("Report generated.")
