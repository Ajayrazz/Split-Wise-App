from decimal import Decimal
from datetime import date

IMPORT_POLICIES = {
    'FOREIGN_CURRENCY_USD': 'CONVERT_TO_INR',
    'EXACT_DUPLICATE': 'SKIP',
    'CONFLICTING_DUPLICATE': 'WARN',
    'SETTLEMENT_AS_EXPENSE': 'CONVERT_TO_SETTLEMENT',
    'NEGATIVE_AMOUNT': 'REJECT',
    'ZERO_AMOUNT': 'REJECT',
    'MISSING_PAYER': 'REJECT',
    'MEMBER_AFTER_LEAVE_DATE': 'REJECT',
    'MEMBER_BEFORE_JOIN_DATE': 'REJECT',
}

USD_TO_INR_RATE = Decimal('85.00')

MEMBER_WINDOWS = {
    'meera': {'leave_date': date(2026, 3, 31)},
    'sam': {'join_date': date(2026, 4, 15)},
}
