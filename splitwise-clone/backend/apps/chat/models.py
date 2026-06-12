from django.db import models
from django.contrib.auth import get_user_model
from apps.expenses.models import Expense

User = get_user_model()

class ChatMessage(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['expense', 'timestamp']),
        ]
