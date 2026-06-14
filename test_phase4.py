import requests
import json
import time

BASE_URL = 'http://localhost:8000/api/v1'

def create_user(email, password, username):
    res = requests.post(f"{BASE_URL}/auth/register/", json={"email": email, "password": password, "username": username})
    return res.json().get('access')

print("CHECK 1: Register users")
token_a = create_user("alice@example.com", "Pass123!", "Alice")
token_b = create_user("bob@example.com", "Pass123!", "Bob")
token_c = create_user("charlie@example.com", "Pass123!", "Charlie")

headers_a = {"Authorization": f"Bearer {token_a}"}

print("CHECK 2: Create group and add members")
res_group = requests.post(f"{BASE_URL}/groups/", json={"name": "Test Group"}, headers=headers_a)
group_id = res_group.json()['id']
requests.post(f"{BASE_URL}/groups/{group_id}/members/", json={"user": "bob@example.com"}, headers=headers_a)
requests.post(f"{BASE_URL}/groups/{group_id}/members/", json={"user": "charlie@example.com"}, headers=headers_a)
group_data = requests.get(f"{BASE_URL}/groups/{group_id}/", headers=headers_a).json()
print("Group members:", [m['username'] for m in group_data['members']])
u_ids = {m["username"]: m["user_id"] for m in group_data["members"]}

print("CHECK 3: Create EQUAL expense")
res_exp1 = requests.post(f"{BASE_URL}/groups/{group_id}/expenses/", json={
    "description": "Lunch",
    "total_amount": "100.00",
    "paid_by": u_ids["Alice"],
    "split_type": "EQUAL"
}, headers=headers_a)
print("EQUAL expense created:", res_exp1.status_code)

print("CHECK 4: Create PERCENTAGE expense")
res_exp2 = requests.post(f"{BASE_URL}/groups/{group_id}/expenses/", json={
    "description": "Dinner",
    "total_amount": "100.00",
    "paid_by": u_ids["Bob"],
    "split_type": "PERCENTAGE",
    "splits": [
        {"user_id": u_ids["Alice"], "percentage": "33.33"},
        {"user_id": u_ids["Bob"], "percentage": "33.33"},
        {"user_id": u_ids["Charlie"], "percentage": "33.34"}
    ]
}, headers=headers_a)
print("PERCENTAGE expense created:", res_exp2.status_code)
exp2_id = res_exp2.json()['id']

print("CHECK 6: Check balances")
bals = requests.get(f"{BASE_URL}/groups/{group_id}/balances/", headers=headers_a).json()
print("Balances:", bals)

print("RECORD SETTLEMENT")
requests.post(f"{BASE_URL}/groups/{group_id}/settlements/", json={
    "payer_id": u_ids["Bob"],
    "payee_id": u_ids["Alice"],
    "amount": "16.66"
}, headers=headers_a)

bals2 = requests.get(f"{BASE_URL}/groups/{group_id}/balances/", headers=headers_a).json()
print("Balances after settlement:", bals2)

print("EXP2_ID=", exp2_id)
