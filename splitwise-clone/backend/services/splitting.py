from decimal import Decimal, ROUND_DOWN

def compute_equal_split(total_amount: Decimal, user_ids: list[int]) -> list[dict]:
    """
    Divide total_amount equally. Last user absorbs remainder.
    Returns: [{"user_id": int, "amount_owed": Decimal}, ...]
    """
    if not user_ids:
        raise ValueError("user_ids list cannot be empty")
        
    n = Decimal(len(user_ids))
    base = (total_amount / n).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
    remainder = total_amount - (base * n)
    splits = [{"user_id": uid, "amount_owed": base} for uid in user_ids]
    splits[-1]["amount_owed"] += remainder
    _assert_zero_sum(splits, total_amount)
    return splits

def compute_unequal_split(total_amount: Decimal, splits: list[dict]) -> list[dict]:
    """
    splits: [{"user_id": int, "amount_owed": Decimal}, ...]
    Validates that sum(amount_owed) == total_amount exactly.
    Raises ValueError if not.
    """
    total = sum(s["amount_owed"] for s in splits)
    if total != total_amount:
        raise ValueError(f"Unequal split amounts sum to {total}, expected {total_amount}")
    _assert_zero_sum(splits, total_amount)
    return splits

def compute_percentage_split(total_amount: Decimal, pct_splits: list[dict]) -> list[dict]:
    """
    pct_splits: [{"user_id": int, "percentage": Decimal}, ...]
    Validates percentages sum to Decimal('100.00').
    Last user absorbs rounding remainder.
    """
    if not pct_splits:
        raise ValueError("pct_splits list cannot be empty")

    total_pct = sum(s["percentage"] for s in pct_splits)
    if total_pct != Decimal('100.00'):
        raise ValueError(f"Percentages sum to {total_pct}, must equal 100.00")
        
    results = []
    for s in pct_splits:
        share = (s["percentage"] / Decimal('100') * total_amount).quantize(
            Decimal('0.01'), rounding=ROUND_DOWN)
        results.append({"user_id": s["user_id"], "amount_owed": share})
        
    remainder = total_amount - sum(r["amount_owed"] for r in results)
    results[-1]["amount_owed"] += remainder
    _assert_zero_sum(results, total_amount)
    return results

def compute_share_split(total_amount: Decimal, share_splits: list[dict]) -> list[dict]:
    """
    share_splits: [{"user_id": int, "shares": Decimal}, ...]
    Computes proportional split by share weight.
    Last user absorbs rounding remainder.
    """
    if not share_splits:
        raise ValueError("share_splits list cannot be empty")

    total_shares = sum(s["shares"] for s in share_splits)
    if total_shares == Decimal('0'):
        raise ValueError("Total shares cannot be zero")

    results = []
    for s in share_splits:
        share = (s["shares"] / total_shares * total_amount).quantize(
            Decimal('0.01'), rounding=ROUND_DOWN)
        results.append({"user_id": s["user_id"], "amount_owed": share})
        
    remainder = total_amount - sum(r["amount_owed"] for r in results)
    results[-1]["amount_owed"] += remainder
    _assert_zero_sum(results, total_amount)
    return results

def _assert_zero_sum(splits: list[dict], total_amount: Decimal) -> None:
    """
    Hard invariant check. Raises AssertionError if violated.
    This must NEVER be bypassed.
    """
    computed = sum(s["amount_owed"] for s in splits)
    assert computed == total_amount, (
        f"ZERO-SUM VIOLATION: splits sum to {computed}, "
        f"expected {total_amount}"
    )
