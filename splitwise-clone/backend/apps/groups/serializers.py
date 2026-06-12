from rest_framework import serializers
from .models import Group, GroupMember
from django.contrib.auth import get_user_model

User = get_user_model()

class GroupMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = GroupMember
        fields = ['id', 'user_id', 'username', 'email', 'joined_at']

class GroupSerializer(serializers.ModelSerializer):
    members = GroupMemberSerializer(source='groupmember_set', many=True, read_only=True)
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'created_by', 'created_at', 'members']
        read_only_fields = ['created_by']
