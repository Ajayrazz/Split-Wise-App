from django.urls import path
from .views import GroupViewSet, GroupMemberView, GroupBalancesView
from apps.expenses.views import ExpenseListView, ExpenseDetailView
from apps.settlements.views import SettlementListView

group_list = GroupViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
group_detail = GroupViewSet.as_view({
    'get': 'retrieve',
    'delete': 'destroy'
})

urlpatterns = [
    path('', group_list, name='group-list'),
    path('<int:pk>/', group_detail, name='group-detail'),
    path('<int:pk>/members/', GroupMemberView.as_view(), name='group-members'),
    path('<int:pk>/members/<int:uid>/', GroupMemberView.as_view(), name='group-member-delete'),
    path('<int:pk>/balances/', GroupBalancesView.as_view(), name='group-balances'),
    
    path('<int:gid>/expenses/', ExpenseListView.as_view(), name='expense-list'),
    path('<int:gid>/expenses/<int:eid>/', ExpenseDetailView.as_view(), name='expense-detail'),
    
    path('<int:gid>/settlements/', SettlementListView.as_view(), name='settlement-list'),
]
