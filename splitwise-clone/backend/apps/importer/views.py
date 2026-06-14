from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import ImportBatch, StagedExpense
from .services.parser import parse_csv
from .services.validator import validate_all
from .services.executor import execute_approved_rows

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_csv(request):
    if 'file' not in request.FILES:
        return Response({'error': 'No file uploaded'}, status=400)
    group_id = request.data.get('group_id')
    if not group_id:
        return Response({'error': 'group_id required'}, status=400)
        
    file_bytes = request.FILES['file'].read()
    rows, warnings = parse_csv(file_bytes)
    
    validation_results = validate_all(rows, int(group_id))
    
    created_rows = []
    with transaction.atomic():
        batch = ImportBatch.objects.create(
            group_id=group_id,
            file_name=request.FILES['file'].name,
            status='pending'
        )
        for vr in validation_results:
            row = StagedExpense.objects.create(
                batch=batch,
                row_number=vr.row_number,
                raw_data=vr.raw_data,
                parsed_data=vr.parsed_data,
                status=vr.status,
                severity=vr.severity,
                issue_codes=vr.issue_codes,
                messages=vr.messages,
                import_as=vr.import_as
            )
            created_rows.append({
                'id': row.id,
                'row_number': row.row_number,
                'raw_data': row.raw_data,
                'parsed_data': row.parsed_data,
                'status': row.status,
                'severity': row.severity,
                'issue_codes': row.issue_codes,
                'messages': row.messages,
                'import_as': row.import_as
            })
            
    return Response({
        'batch_id': batch.id,
        'parsed_rows': len(rows),
        'warnings': warnings,
        'rows': created_rows
    })

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_row(request, row_id):
    row = get_object_or_404(StagedExpense, id=row_id)
    action = request.data.get('action')
    if action == 'approve':
        row.status = 'approved'
    elif action == 'exclude':
        row.status = 'excluded'
    else:
        return Response({'error': 'invalid action'}, status=400)
    row.save(update_fields=['status', 'updated_at'])
    return Response({'status': row.status})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_import(request, batch_id):
    batch = get_object_or_404(ImportBatch, id=batch_id)
    if batch.status != 'pending':
        return Response({'error': 'Batch not pending'}, status=400)
        
    approved_rows = list(batch.staged_rows.filter(status='approved'))
    if not approved_rows:
        batch.status = 'completed'
        batch.save()
        return Response({'imported': 0})
        
    imported = execute_approved_rows(batch, approved_rows)
    batch.status = 'completed'
    batch.save(update_fields=['status'])
    
    return Response({'imported': imported})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_report(request, batch_id):
    batch = get_object_or_404(ImportBatch, id=batch_id)
    return Response({
        'status': batch.status,
        'imported': batch.staged_rows.filter(status='imported').count(),
        'excluded': batch.staged_rows.filter(status='excluded').count(),
        'rejected': batch.staged_rows.filter(status='rejected').count(),
        'approved': batch.staged_rows.filter(status='approved').count()
    })
