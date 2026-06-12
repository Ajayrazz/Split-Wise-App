from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Group, GroupMember
from .serializers import GroupSerializer
from services.balances import compute_group_balances

User = get_user_model()

class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Group.objects.filter(groupmember__user=self.request.user).distinct()

    def perform_create(self, serializer):
        with transaction.atomic():
            group = serializer.save(created_by=self.request.user)
            GroupMember.objects.create(group=group, user=self.request.user)

class GroupMemberView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        username_or_email = request.data.get('user')
        user = User.objects.filter(Q(username=username_or_email) | Q(email=username_or_email)).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if GroupMember.objects.filter(group=group, user=user).exists():
            return Response({"error": "User already in group"}, status=status.HTTP_400_BAD_REQUEST)
            
        GroupMember.objects.create(group=group, user=user)
        return Response({"message": "Member added"}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk, uid):
        group = get_object_or_404(Group, pk=pk)
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        balances = compute_group_balances(group.id)
        for b in balances:
            if b['from_user_id'] == int(uid) or b['to_user_id'] == int(uid):
                return Response({
                    "error": {
                        "code": "BALANCE_OUTSTANDING",
                        "detail": "User has outstanding balance and cannot be removed."
                    }
                }, status=status.HTTP_409_CONFLICT)
                
        member = get_object_or_404(GroupMember, group=group, user_id=uid)
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class GroupBalancesView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        balances = compute_group_balances(group.id)
        return Response(balances, status=status.HTTP_200_OK)
