from django.urls import path
from .views import ExpenseMessagesView

urlpatterns = [
    path('<int:eid>/messages/', ExpenseMessagesView.as_view(), name='expense-messages'),
]
