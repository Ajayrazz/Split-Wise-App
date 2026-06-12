import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import ChatMessage
from apps.expenses.models import Expense
from apps.groups.models import GroupMember

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.expense_id = self.scope['url_route']['kwargs']['expense_id']
        self.room_group_name = f'chat_{self.expense_id}'
        self.user = self.scope['user']

        print(f"Connecting user {self.user} to expense {self.expense_id}")

        if not self.user.is_authenticated:
            print("User is not authenticated!")
            await self.close(code=4003)
            return

        exists, is_member = await self.verify_expense_and_membership()
        print(f"Exists: {exists}, Is Member: {is_member}")
        if not exists:
            await self.close(code=4004)
            return
        if not is_member:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        history = await self.get_chat_history()
        await self.send(text_data=json.dumps({
            'type': 'chat_history',
            'messages': history
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_text = text_data_json.get('message', '')

        if message_text:
            msg_obj = await self.save_message(message_text)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': msg_obj.message,
                    'user_id': msg_obj.user_id,
                    'username': msg_obj.user.username,
                    'timestamp': msg_obj.timestamp.isoformat()
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'user_id': event['user_id'],
            'username': event['username'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def verify_expense_and_membership(self):
        try:
            expense = Expense.objects.select_related('group').get(id=self.expense_id)
            is_member = GroupMember.objects.filter(group=expense.group, user=self.user).exists()
            return True, is_member
        except Expense.DoesNotExist:
            return False, False

    @database_sync_to_async
    def get_chat_history(self):
        messages = ChatMessage.objects.filter(expense_id=self.expense_id).select_related('user').order_by('-timestamp')[:50]
        history = []
        for msg in reversed(list(messages)):
            history.append({
                'type': 'chat_message',
                'message': msg.message,
                'user_id': msg.user_id,
                'username': msg.user.username,
                'timestamp': msg.timestamp.isoformat()
            })
        return history

    @database_sync_to_async
    def save_message(self, message_text):
        return ChatMessage.objects.create(
            expense_id=self.expense_id,
            user=self.user,
            message=message_text,
            timestamp=timezone.now()
        )
