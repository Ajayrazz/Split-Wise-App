import requests
import time
from decimal import Decimal

BASE_URL = 'http://localhost:8000/api/v1'

def create_user(email, password, username):
    res = requests.post(f"{BASE_URL}/auth/register/", json={"email": email, "password": password, "username": username})
    if res.status_code == 400:
        return requests.post(f"{BASE_URL}/auth/login/", json={"email": email, "password": password}).json()['access']
    return res.json().get('access')

print("CHECK 1: Register users")
token_a = create_user("alice6@example.com", "Pass123!", "Alice6")
token_b = create_user("bob6@example.com", "Pass123!", "Bob6")
token_c = create_user("charlie6@example.com", "Pass123!", "Charlie6")

headers_a = {"Authorization": f"Bearer {token_a}"}

print("CHECK 2: Create group and add members")
res_group = requests.post(f"{BASE_URL}/groups/", json={"name": "Test Group 6"}, headers=headers_a)
group_id = res_group.json()['id']
requests.post(f"{BASE_URL}/groups/{group_id}/members/", json={"user": "bob6@example.com"}, headers=headers_a)
requests.post(f"{BASE_URL}/groups/{group_id}/members/", json={"user": "charlie6@example.com"}, headers=headers_a)
group_data = requests.get(f"{BASE_URL}/groups/{group_id}/", headers=headers_a).json()
print("Group members:", [m['username'] for m in group_data['members']])
u_ids = {m['username']: m['user_id'] for m in group_data['members']}

print("CHECK 3: Create EQUAL expense")
res_exp1 = requests.post(f"{BASE_URL}/groups/{group_id}/expenses/", json={
    "description": "Lunch",
    "total_amount": "100.00",
    "paid_by_id": u_ids["Alice6"],
    "split_type": "EQUAL",
    "splits": [
        {"user_id": u_ids["Alice6"]},
        {"user_id": u_ids["Bob6"]},
        {"user_id": u_ids["Charlie6"]}
    ]
}, headers=headers_a)
print("EQUAL expense created:", res_exp1.status_code, res_exp1.json())

print("CHECK 4: Create PERCENTAGE expense")
res_exp2 = requests.post(f"{BASE_URL}/groups/{group_id}/expenses/", json={
    "description": "Dinner",
    "total_amount": "100.00",
    "paid_by_id": u_ids["Bob6"],
    "split_type": "PERCENTAGE",
    "splits": [
        {"user_id": u_ids["Alice6"], "percentage": "33.33"},
        {"user_id": u_ids["Bob6"], "percentage": "33.33"},
        {"user_id": u_ids["Charlie6"], "percentage": "33.34"}
    ]
}, headers=headers_a)
print("PERCENTAGE expense created:", res_exp2.status_code, res_exp2.json())
exp2_id = res_exp2.json()['id']

print("CHECK 6: Check balances")
bals = requests.get(f"{BASE_URL}/groups/{group_id}/balances/", headers=headers_a).json()
print("Balances before settlement:", bals)

print("RECORD SETTLEMENT")
requests.post(f"{BASE_URL}/groups/{group_id}/settlements/", json={
    "payer_id": u_ids["Bob6"],
    "payee_id": u_ids["Alice6"],
    "amount": "16.66"
}, headers=headers_a)

bals2 = requests.get(f"{BASE_URL}/groups/{group_id}/balances/", headers=headers_a).json()
print("Balances after settlement:", bals2)

