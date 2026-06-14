"""
Import Executor
Writes approved StagedExpense rows to the live Expense/Settlement tables.
Uses a single transaction.atomic() — any failure rolls back ALL writes.
Calls services/splitting.py directly (not the HTTP endpoint).
"""
import logging
from decimal import Decimal
from datetime import datetime
from django.db import transaction
from apps.expenses.models import Expense, ExpenseSplit
from apps.settlements.models import Settlement
from apps.importer.models import StagedExpense, ImportBatch
from services.splitting import (
    compute_equal_split, compute_unequal_split,
    compute_percentage_split, compute_share_split,
)

logger = logging.getLogger(__name__)


def execute_approved_rows(batch: ImportBatch,
                          approved_rows: list[StagedExpense]) -> int:
    imported = 0
    with transaction.atomic():
        for row in approved_rows:
            try:
                if row.import_as in ('settlement', 'refund'):
                    _write_settlement(row, batch)
                else:
                    _write_expense(row, batch)
                row.status = 'imported'
                row.save(update_fields=['status', 'updated_at'])
                imported += 1
            except Exception as exc:
                logger.error("Row %d failed: %s", row.row_number, exc)
                raise  # triggers rollback of entire transaction
    return imported


def _write_expense(row: StagedExpense, batch: ImportBatch):
    pd = row.parsed_data
    total     = Decimal(str(pd['amount_decimal']))
    expense_d = pd['date_parsed']
    if isinstance(expense_d, str):
        expense_d = datetime.strptime(expense_d, '%Y-%m-%d').date()
    split_type = (pd.get('split_type') or 'equal').upper()
    parts      = pd['participants']
    user_ids   = [p['user_id'] for p in parts]
    split_det  = pd.get('split_details_raw', '')
    desc       = (row.raw_data.get('description') or '').strip() or '(imported)'

    if split_type == 'EQUAL':
        splits = compute_equal_split(total, user_ids)
    elif split_type == 'UNEQUAL':
        import re
        amount_map = {}
        for match in re.finditer(r'([\w\s]+?)\s+(\d+(?:\.\d+)?)', split_det):
            amount_map[match.group(1).strip().lower()] = Decimal(match.group(2))
        splits = compute_unequal_split(total, [
            {'user_id': uid,
             'amount_owed': amount_map.get(p['username'].lower(), Decimal('0'))}
            for uid, p in zip(user_ids, parts)
        ])
    elif split_type == 'PERCENTAGE':
        import re
        pct_map = {}
        for match in re.finditer(r'([\w\s]+?)\s+(\d+(?:\.\d+)?)%', split_det):
            pct_map[match.group(1).strip().lower()] = Decimal(match.group(2))
        splits = compute_percentage_split(total, [
            {'user_id': uid,
             'percentage': pct_map.get(p['username'].lower(), Decimal('0'))}
            for uid, p in zip(user_ids, parts)
        ])
    elif split_type == 'SHARE':
        import re
        share_map = {}
        for match in re.finditer(r'([\w\s]+?)\s+(\d+(?:\.\d+)?)', split_det):
            share_map[match.group(1).strip().lower()] = Decimal(match.group(2))
        splits = compute_share_split(total, [
            {'user_id': uid,
             'shares': share_map.get(p['username'].lower(), Decimal('1'))}
            for uid, p in zip(user_ids, parts)
        ])
    else:
        splits = compute_equal_split(total, user_ids)

    expense = Expense.objects.create(
        group_id=batch.group_id,
        description=desc,
        total_amount=total,
        paid_by_id=pd['paid_by_user_id'],
        split_type=split_type,
        created_at=datetime.combine(expense_d, datetime.min.time()),
    )
    for sp in splits:
        ExpenseSplit.objects.create(
            expense=expense,
            user_id=sp['user_id'],
            amount_owed=sp['amount_owed'],
        )


def _write_settlement(row: StagedExpense, batch: ImportBatch):
    pd     = row.parsed_data
    parts  = pd.get('participants', [])
    payer  = pd['paid_by_user_id']
    payee  = next((p['user_id'] for p in parts if p['user_id'] != payer), None)
    if not payee:
        raise ValueError(f"Row {row.row_number}: Cannot determine payee.")
    Settlement.objects.create(
        group_id=batch.group_id,
        payer_id=payer,
        payee_id=payee,
        amount=Decimal(str(pd['amount_decimal'])),
    )
