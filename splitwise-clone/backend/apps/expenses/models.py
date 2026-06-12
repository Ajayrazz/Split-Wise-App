from django.db import models
from django.conf import settings
from apps.groups.models import Group

class SplitType(models.TextChoices):
    EQUAL = 'EQUAL'
    UNEQUAL = 'UNEQUAL'
    PERCENTAGE = 'PERCENTAGE'
    SHARE = 'SHARE'

class Expense(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='expenses_paid')
    split_type = models.CharField(max_length=20, choices=SplitType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

class ExpenseSplit(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='expense_splits')
    amount_owed = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        indexes = [models.Index(fields=['expense', 'user'])]
