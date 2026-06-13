import os
import sys
import django
from decimal import Decimal

sys.path.append('/Users/ajayrazz/Desktop/Split-wise-App/splitwise-clone/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.groups.models import Group
from apps.expenses.models import Expense, ExpenseSplit
from services.balances import compute_group_balances

User = get_user_model()
user1 = User.objects.first()

group = Group.objects.filter(groupmember__user=user1).first()
if not group:
    print("No group found for user1")
    sys.exit(1)

print(f"Executing Integration Test for USD Transaction in Group: {group.name}")
print("--- Initial Balances ---")
balances_before = compute_group_balances(group.id)
for b in balances_before:
    print(f"User {b['from_user_id']} owes User {b['to_user_id']}: {b['amount']} INR")

# Create USD Expense
exchange_rate = Decimal('95.00')
total_amount = Decimal('500.00')
converted_amount = total_amount * exchange_rate

print("\n1. Simulating API POST Request Payload:")
payload = {
    'groupId': group.id,
    'description': 'International Trip Ingestion Test',
    'total_amount': float(total_amount),
    'currency': 'USD',
    'paid_by_id': user1.id,
    'split_type': 'EQUAL'
}
print(payload)

expense = Expense.objects.create(
    group=group,
    description='International Trip Ingestion Test',
    total_amount=total_amount,
    currency='USD',
    exchange_rate=exchange_rate,
    converted_amount=converted_amount,
    paid_by=user1,
    split_type='EQUAL'
)

members = group.groupmember_set.all()
split_amount = total_amount / len(members)

splits = []
for m in members:
    splits.append(ExpenseSplit(
        expense=expense,
        user=m.user,
        amount_owed=split_amount
    ))
ExpenseSplit.objects.bulk_create(splits)

print("\n2. Database Normalization Audit:")
print(f"Expense ID: {expense.id}")
print(f"Description: {expense.description}")
print(f"Currency: {expense.currency}")
print(f"Raw Amount: {expense.total_amount}")
print(f"Exchange Rate: {expense.exchange_rate}")
print(f"Converted Amount (INR): {expense.converted_amount}")

print("\n3. Frontend Balance Propagation Check (Backend Computation):")
balances_after = compute_group_balances(group.id)
print("--- Final Balances ---")
for b in balances_after:
    print(f"User {b['from_user_id']} owes User {b['to_user_id']}: {b['amount']} INR")
