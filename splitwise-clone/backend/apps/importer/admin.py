from django.contrib import admin
from .models import ImportBatch, StagedExpense

@admin.register(ImportBatch)
class ImportBatchAdmin(admin.ModelAdmin):
    list_display = ['id', 'file_name', 'group', 'status', 'total_rows',
                    'invalid_rows', 'review_rows', 'created_at']
    list_filter  = ['status']

@admin.register(StagedExpense)
class StagedExpenseAdmin(admin.ModelAdmin):
    list_display = ['id', 'batch', 'row_number', 'status', 'severity',
                    'import_as', 'action_taken']
    list_filter  = ['status', 'severity', 'import_as']
