from rest_framework import serializers
from .models import Settlement

class SettlementSerializer(serializers.ModelSerializer):
    payer_username = serializers.CharField(source='payer.username', read_only=True)
    payee_username = serializers.CharField(source='payee.username', read_only=True)
    created_at = serializers.DateTimeField(source='timestamp', read_only=True)

    class Meta:
        model = Settlement
        fields = ['id', 'group', 'payer', 'payee', 'amount', 'timestamp', 'payer_username', 'payee_username', 'created_at']
