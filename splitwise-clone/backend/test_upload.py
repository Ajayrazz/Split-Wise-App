import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from apps.groups.models import Group
from apps.importer.views import upload_csv
import io

User = get_user_model()
alice = User.objects.filter(username='alice_upload').first()

factory = APIRequestFactory()
csv_content = b"date,description,amount,paid_by\n2026-06-12,Test Expense,100,alice_upload@example.com\n"
file_obj = io.BytesIO(csv_content)
file_obj.name = 'Expenses Export.csv'

request = factory.post('/api/v1/importer/upload/', {'file': file_obj, 'group_id': 1}, format='multipart')
force_authenticate(request, user=alice)

try:
    response = upload_csv(request)
    print("Response status:", response.status_code)
    if response.status_code == 500:
        print(response.data)
except Exception as e:
    import traceback
    traceback.print_exc()
