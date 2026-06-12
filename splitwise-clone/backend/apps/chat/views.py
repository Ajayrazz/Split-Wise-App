from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.expenses.models import Expense
from apps.groups.models import GroupMember
from .models import ChatMessage
from .serializers import ChatMessageSerializer

class ExpenseMessagesView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, eid):
        expense = get_object_or_404(Expense, pk=eid)
        if not GroupMember.objects.filter(group=expense.group, user=request.user).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        messages = ChatMessage.objects.filter(expense=expense).select_related('user').order_by('-timestamp')[:50]
        messages = reversed(list(messages))
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
