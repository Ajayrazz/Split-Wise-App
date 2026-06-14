from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_csv, name='upload_csv'),
    path('rows/<int:row_id>/', views.update_row, name='update_row'),
    path('<int:batch_id>/confirm/', views.confirm_import, name='confirm_import'),
    path('<int:batch_id>/report/', views.get_report, name='get_report'),
]
