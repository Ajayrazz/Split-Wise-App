from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.groups.models import Group, GroupMember
from .models import Settlement
from .serializers import SettlementSerializer
from decimal import Decimal

class SettlementListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, gid):
        group = get_object_or_404(Group, pk=gid)
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        settlements = Settlement.objects.filter(group=group)
        serializer = SettlementSerializer(settlements, many=True)
        return Response(serializer.data)

    def post(self, request, gid):
        group = get_object_or_404(Group, pk=gid)
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        payer_id = request.data.get('payer_id')
        payee_id = request.data.get('payee_id')
        try:
            amount = Decimal(str(request.data.get('amount')))
        except Exception:
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)
        
        if amount <= Decimal('0'):
            return Response({"error": "Amount must be greater than zero"}, status=status.HTTP_400_BAD_REQUEST)
            
        if not GroupMember.objects.filter(group=group, user_id=payer_id).exists() or not GroupMember.objects.filter(group=group, user_id=payee_id).exists():
            return Response({"error": "Payer or payee is not a group member"}, status=status.HTTP_400_BAD_REQUEST)
            
        settlement = Settlement.objects.create(
            group=group,
            payer_id=payer_id,
            payee_id=payee_id,
            amount=amount
        )
        
        serializer = SettlementSerializer(settlement)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
