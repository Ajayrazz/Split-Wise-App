from rest_framework import serializers
from .models import Expense, ExpenseSplit, SplitType

class ExpenseSplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseSplit
        fields = ['id', 'user_id', 'amount_owed']

class ExpenseSerializer(serializers.ModelSerializer):
    splits = ExpenseSplitSerializer(source='expensesplit_set', many=True, read_only=True)
    
    class Meta:
        model = Expense
        fields = ['id', 'group', 'description', 'total_amount', 'currency', 'exchange_rate', 'converted_amount', 'paid_by', 'split_type', 'created_at', 'splits']
