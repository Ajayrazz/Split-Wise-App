import sys
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from rest_framework.test import APIClient
from apps.users.models import User
from apps.groups.models import Group, GroupMember
from apps.expenses.models import Expense, ExpenseSplit
from apps.settlements.models import Settlement
from decimal import Decimal

client = APIClient()

print("CHECK 1: Register users")
res_a = client.post('/api/v1/auth/register/', {"email": "alice2@example.com", "password": "Pass123!", "username": "Alice2"})
res_b = client.post('/api/v1/auth/register/', {"email": "bob2@example.com", "password": "Pass123!", "username": "Bob2"})
res_c = client.post('/api/v1/auth/register/', {"email": "charlie2@example.com", "password": "Pass123!", "username": "Charlie2"})

token_a = client.post('/api/v1/auth/login/', {"email": "alice2@example.com", "password": "Pass123!"}).data['access']
client.credentials(HTTP_AUTHORIZATION='Bearer ' + token_a)

print("CHECK 2: Create group and add members")
res_group = client.post('/api/v1/groups/', {"name": "Test Group 2"})
group_id = res_group.data['id']
client.post(f'/api/v1/groups/{group_id}/members/', {"email": "bob2@example.com"})
client.post(f'/api/v1/groups/{group_id}/members/', {"email": "charlie2@example.com"})

group_data = client.get(f'/api/v1/groups/{group_id}/').data
u_ids = {m['user']['username']: m['user']['id'] for m in group_data['members']}
print("Group members:", list(u_ids.keys()))

print("CHECK 3: Create EQUAL expense")
res_exp1 = client.post(f'/api/v1/groups/{group_id}/expenses/', {
    "description": "Lunch 2",
    "total_amount": "100.00",
    "paid_by": u_ids["Alice2"],
    "split_type": "EQUAL"
}, format='json')
print("EQUAL expense status:", res_exp1.status_code)

print("CHECK 4: Create PERCENTAGE expense with rounding")
res_exp2 = client.post(f'/api/v1/groups/{group_id}/expenses/', {
    "description": "Dinner 2",
    "total_amount": "100.00",
    "paid_by": u_ids["Bob2"],
    "split_type": "PERCENTAGE",
    "splits": [
        {"user_id": u_ids["Alice2"], "percentage": "33.33"},
        {"user_id": u_ids["Bob2"], "percentage": "33.33"},
        {"user_id": u_ids["Charlie2"], "percentage": "33.34"}
    ]
}, format='json')
print("PERCENTAGE expense status:", res_exp2.status_code)
exp2_id = res_exp2.data['id']

splits = list(ExpenseSplit.objects.filter(expense_id=exp2_id))
assert sum(s.amount_owed for s in splits) == Decimal('100.00')
print("ZERO-SUM VERIFIED FOR PERCENTAGE SPLIT")

print("CHECK 6: Settlement clears balance")
bals = client.get(f'/api/v1/groups/{group_id}/balances/').data
print("Balances before settlement:", bals)

# Payee Bob2, Payer Alice2 
client.post(f'/api/v1/groups/{group_id}/settlements/', {
    "payer_id": u_ids["Alice2"],
    "payee_id": u_ids["Bob2"],
    "amount": "33.33"
}, format='json')

bals2 = client.get(f'/api/v1/groups/{group_id}/balances/').data
print("Balances after settlement:", bals2)

