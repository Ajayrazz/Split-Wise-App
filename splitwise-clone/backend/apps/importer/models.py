from django.db import models
from apps.groups.models import Group

class ImportBatch(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='pending')
    total_rows = models.IntegerField(default=0)
    invalid_rows = models.IntegerField(default=0)
    review_rows = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class StagedExpense(models.Model):
    batch = models.ForeignKey(ImportBatch, on_delete=models.CASCADE, related_name='staged_rows')
    row_number = models.IntegerField()
    raw_data = models.JSONField(default=dict)
    parsed_data = models.JSONField(default=dict)
    status = models.CharField(max_length=50, default='pending')
    severity = models.CharField(max_length=50, default='none')
    issue_codes = models.JSONField(default=list)
    messages = models.JSONField(default=list)
    import_as = models.CharField(max_length=50, default='expense')
    action_taken = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
