from django.test import TestCase
from decimal import Decimal
import random
from services.splitting import (
    compute_equal_split,
    compute_unequal_split,
    compute_percentage_split,
    compute_share_split,
)

class SplittingTestCase(TestCase):
    def test_equal_split_clean_division(self):
        total = Decimal('90.00')
        splits = compute_equal_split(total, [1, 2, 3])
        for s in splits:
            self.assertEqual(s['amount_owed'], Decimal('30.00'))
        self.assertEqual(sum(s['amount_owed'] for s in splits), total)

    def test_equal_split_with_remainder(self):
        total = Decimal('100.00')
        splits = compute_equal_split(total, [1, 2, 3])
        self.assertEqual(splits[0]['amount_owed'], Decimal('33.33'))
        self.assertEqual(splits[1]['amount_owed'], Decimal('33.33'))
        self.assertEqual(splits[2]['amount_owed'], Decimal('33.34'))
        self.assertEqual(sum(s['amount_owed'] for s in splits), total)

    def test_equal_split_paisa_remainder(self):
        total = Decimal('100.01')
        splits = compute_equal_split(total, [1, 2, 3])
        self.assertEqual(splits[0]['amount_owed'], Decimal('33.33'))
        self.assertEqual(splits[1]['amount_owed'], Decimal('33.33'))
        self.assertEqual(splits[2]['amount_owed'], Decimal('33.35'))
        self.assertEqual(sum(s['amount_owed'] for s in splits), total)

    def test_unequal_split_valid(self):
        total = Decimal('100.00')
        splits = [{"user_id": 1, "amount_owed": Decimal('60.00')}, {"user_id": 2, "amount_owed": Decimal('40.00')}]
        res = compute_unequal_split(total, splits)
        self.assertEqual(sum(s['amount_owed'] for s in res), total)

    def test_unequal_split_invalid(self):
        total = Decimal('100.00')
        splits = [{"user_id": 1, "amount_owed": Decimal('60.00')}, {"user_id": 2, "amount_owed": Decimal('30.00')}]
        with self.assertRaises(ValueError):
            compute_unequal_split(total, splits)

    def test_percentage_split_clean(self):
        total = Decimal('200.00')
        pcts = [{"user_id": 1, "percentage": Decimal('50.00')}, {"user_id": 2, "percentage": Decimal('30.00')}, {"user_id": 3, "percentage": Decimal('20.00')}]
        res = compute_percentage_split(total, pcts)
        self.assertEqual(res[0]['amount_owed'], Decimal('100.00'))
        self.assertEqual(res[1]['amount_owed'], Decimal('60.00'))
        self.assertEqual(res[2]['amount_owed'], Decimal('40.00'))
        self.assertEqual(sum(s['amount_owed'] for s in res), total)

    def test_percentage_split_remainder(self):
        total = Decimal('100.00')
        pcts = [{"user_id": 1, "percentage": Decimal('33.33')}, {"user_id": 2, "percentage": Decimal('33.33')}, {"user_id": 3, "percentage": Decimal('33.34')}]
        res = compute_percentage_split(total, pcts)
        self.assertEqual(res[2]['amount_owed'], Decimal('33.34'))
        self.assertEqual(sum(s['amount_owed'] for s in res), total)

    def test_percentage_invalid_sum(self):
        total = Decimal('100.00')
        pcts = [{"user_id": 1, "percentage": Decimal('50.00')}, {"user_id": 2, "percentage": Decimal('30.00')}]
        with self.assertRaises(ValueError):
            compute_percentage_split(total, pcts)

    def test_share_split(self):
        total = Decimal('100.00')
        shares = [{"user_id": 1, "shares": Decimal('2')}, {"user_id": 2, "shares": Decimal('1')}]
        res = compute_share_split(total, shares)
        self.assertEqual(res[0]['amount_owed'], Decimal('66.66'))
        self.assertEqual(res[1]['amount_owed'], Decimal('33.34'))
        self.assertEqual(sum(s['amount_owed'] for s in res), total)

    def test_zero_sum_invariant_never_violated(self):
        for _ in range(100):
            # random total between 1.00 and 10000.00
            total = Decimal(str(round(random.uniform(1.0, 10000.0), 2)))
            num_users = random.randint(2, 10)
            user_ids = list(range(1, num_users + 1))
            
            splits = compute_equal_split(total, user_ids)
            self.assertEqual(sum(s['amount_owed'] for s in splits), total)

            # test percentage
            pcts = []
            rem = Decimal('100.00')
            for uid in user_ids[:-1]:
                p = Decimal(str(round(random.uniform(1.0, float(rem - Decimal('1.00'))), 2)))
                pcts.append({"user_id": uid, "percentage": p})
                rem -= p
            pcts.append({"user_id": user_ids[-1], "percentage": rem})
            
            res = compute_percentage_split(total, pcts)
            self.assertEqual(sum(s['amount_owed'] for s in res), total)
                
            # test shares
            shares = [{"user_id": uid, "shares": Decimal(str(random.randint(1, 10)))} for uid in user_ids]
            res = compute_share_split(total, shares)
            self.assertEqual(sum(s['amount_owed'] for s in res), total)
