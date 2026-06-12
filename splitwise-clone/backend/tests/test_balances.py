from django.test import TestCase
from decimal import Decimal
from django.contrib.auth import get_user_model
from apps.groups.models import Group, GroupMember
from apps.expenses.models import Expense, ExpenseSplit, SplitType
from apps.settlements.models import Settlement
from services.balances import compute_group_balances

User = get_user_model()

class BalancesTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='A', email='a@test.com', password='pw')
        self.user2 = User.objects.create_user(username='B', email='b@test.com', password='pw')
        
        self.group = Group.objects.create(name='Test Group', created_by=self.user1)
        GroupMember.objects.create(group=self.group, user=self.user1)
        GroupMember.objects.create(group=self.group, user=self.user2)

    def test_balance_one_expense_equal_split(self):
        expense = Expense.objects.create(
            group=self.group,
            description='Test',
            total_amount=Decimal('100.00'),
            paid_by=self.user1,
            split_type=SplitType.EQUAL
        )
        ExpenseSplit.objects.create(expense=expense, user=self.user1, amount_owed=Decimal('50.00'))
        ExpenseSplit.objects.create(expense=expense, user=self.user2, amount_owed=Decimal('50.00'))
        
        balances = compute_group_balances(self.group.id)
        
        self.assertEqual(len(balances), 1)
        b = balances[0]
        self.assertEqual(b['from_user_id'], self.user2.id)
        self.assertEqual(b['to_user_id'], self.user1.id)
        self.assertEqual(b['amount'], Decimal('50.00'))

    def test_balance_after_settlement(self):
        expense = Expense.objects.create(
            group=self.group,
            description='Test',
            total_amount=Decimal('100.00'),
            paid_by=self.user1,
            split_type=SplitType.EQUAL
        )
        ExpenseSplit.objects.create(expense=expense, user=self.user1, amount_owed=Decimal('50.00'))
        ExpenseSplit.objects.create(expense=expense, user=self.user2, amount_owed=Decimal('50.00'))
        
        Settlement.objects.create(
            group=self.group,
            payer=self.user2,
            payee=self.user1,
            amount=Decimal('50.00')
        )
        
        balances = compute_group_balances(self.group.id)
        self.assertEqual(len(balances), 0)
