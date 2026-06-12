from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from apps.groups.models import Group, GroupMember
from .models import Expense, ExpenseSplit, SplitType
from .serializers import ExpenseSerializer
from services.splitting import compute_equal_split, compute_unequal_split, compute_percentage_split, compute_share_split
from decimal import Decimal

class ExpenseListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, gid):
        group = get_object_or_404(Group, pk=gid)
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        expenses = Expense.objects.filter(group=group)
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    def post(self, request, gid):
        group = get_object_or_404(Group, pk=gid)
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        paid_by_id = request.data.get('paid_by_id')
        if not GroupMember.objects.filter(group=group, user_id=paid_by_id).exists():
            return Response({"error": "paid_by_id is not a group member"}, status=status.HTTP_400_BAD_REQUEST)
            
        splits_data = request.data.get('splits', [])
        split_type = request.data.get('split_type')
        try:
            total_amount = Decimal(str(request.data.get('total_amount')))
        except Exception:
            return Response({"error": "Invalid total_amount"}, status=status.HTTP_400_BAD_REQUEST)
        
        user_ids = [s.get('user_id') for s in splits_data if 'user_id' in s]
        members_count = GroupMember.objects.filter(group=group, user_id__in=user_ids).count()
        if members_count != len(set(user_ids)):
            return Response({"error": "One or more users in splits are not group members"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            if split_type == SplitType.EQUAL:
                computed_splits = compute_equal_split(total_amount, user_ids)
            elif split_type == SplitType.UNEQUAL:
                parsed_splits = [{"user_id": s["user_id"], "amount_owed": Decimal(str(s.get("amount_owed", 0)))} for s in splits_data]
                computed_splits = compute_unequal_split(total_amount, parsed_splits)
            elif split_type == SplitType.PERCENTAGE:
                parsed_splits = [{"user_id": s["user_id"], "percentage": Decimal(str(s.get("percentage", 0)))} for s in splits_data]
                computed_splits = compute_percentage_split(total_amount, parsed_splits)
            elif split_type == SplitType.SHARE:
                parsed_splits = [{"user_id": s["user_id"], "shares": Decimal(str(s.get("shares", 0)))} for s in splits_data]
                computed_splits = compute_share_split(total_amount, parsed_splits)
            else:
                return Response({"error": "Invalid split_type"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except AssertionError as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        with transaction.atomic():
            expense = Expense.objects.create(
                group=group,
                description=request.data.get('description'),
                total_amount=total_amount,
                paid_by_id=paid_by_id,
                split_type=split_type
            )
            
            ExpenseSplit.objects.bulk_create([
                ExpenseSplit(
                    expense=expense,
                    user_id=cs['user_id'],
                    amount_owed=cs['amount_owed']
                ) for cs in computed_splits
            ])
            
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ExpenseDetailView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, gid, eid):
        group = get_object_or_404(Group, pk=gid)
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        expense = get_object_or_404(Expense, pk=eid, group=group)
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data)

    def delete(self, request, gid, eid):
        group = get_object_or_404(Group, pk=gid)
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        expense = get_object_or_404(Expense, pk=eid, group=group)
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
