from decimal import Decimal
from django.db.models import Sum

def compute_group_balances(group_id: int) -> list[dict]:
    """
    For every unique user pair (A, B) in the group where A < B by id,
    compute net amount A owes B using this formula:

    net(A→B) = 
      SUM(ExpenseSplit.amount_owed WHERE user=A AND expense.paid_by=B AND expense.group=group_id)
    - SUM(ExpenseSplit.amount_owed WHERE user=B AND expense.paid_by=A AND expense.group=group_id)
    - SUM(Settlement.amount WHERE payer=A AND payee=B AND group=group_id)
    + SUM(Settlement.amount WHERE payer=B AND payee=A AND group=group_id)

    If net > 0: A owes B net amount.
    If net < 0: B owes A abs(net) amount.
    If net == 0: no balance.

    Returns list of non-zero balances:
    [{"from_user_id": int, "to_user_id": int, "amount": Decimal}, ...]
    """
    from apps.expenses.models import ExpenseSplit
    from apps.settlements.models import Settlement
    
    # 1. Sum of expenses paid by user B where user A is the split user
    expense_aggregates = ExpenseSplit.objects.filter(
        expense__group_id=group_id
    ).values('user_id', 'expense__paid_by_id').annotate(
        total_owed=Sum('amount_owed')
    )
    
    # 2. Sum of settlements paid by payer to payee
    settlement_aggregates = Settlement.objects.filter(
        group_id=group_id
    ).values('payer_id', 'payee_id').annotate(
        total_paid=Sum('amount')
    )
    
    pairwise_nets = {}
    
    for ea in expense_aggregates:
        a_id = ea['user_id']
        b_id = ea['expense__paid_by_id']
        if a_id == b_id:
            continue
            
        pair = (min(a_id, b_id), max(a_id, b_id))
        if pair not in pairwise_nets:
            pairwise_nets[pair] = Decimal('0.00')
            
        amount = ea['total_owed']
        if a_id == pair[0]:
            pairwise_nets[pair] += amount
        else:
            pairwise_nets[pair] -= amount
            
    for sa in settlement_aggregates:
        a_id = sa['payer_id']
        b_id = sa['payee_id']
        if a_id == b_id:
            continue
            
        pair = (min(a_id, b_id), max(a_id, b_id))
        if pair not in pairwise_nets:
            pairwise_nets[pair] = Decimal('0.00')
            
        amount = sa['total_paid']
        if a_id == pair[0]:
            pairwise_nets[pair] -= amount
        else:
            pairwise_nets[pair] += amount
            
    balances = []
    for (a_id, b_id), net in pairwise_nets.items():
        if net > Decimal('0.00'):
            balances.append({
                "from_user_id": a_id,
                "to_user_id": b_id,
                "amount": net
            })
        elif net < Decimal('0.00'):
            balances.append({
                "from_user_id": b_id,
                "to_user_id": a_id,
                "amount": abs(net)
            })
            
    return balances
