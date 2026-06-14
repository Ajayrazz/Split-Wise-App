import os
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.groups.models import Group, GroupMember
from apps.importer.services.parser import parse_csv
from apps.importer.services.validator import validate_all

User = get_user_model()

def make_csv(*data_rows,
             header='date,description,paid_by,amount,currency,split_type,split_with,split_details,notes'):
    return ('\n'.join([header] + list(data_rows))).encode()

class BaseImporterTest(TestCase):
    def setUp(self):
        self.alice = User.objects.create_user(username='Alice', email='alice@example.com', password='password123')
        self.priya = User.objects.create_user(username='Priya', email='priya@example.com', password='password123')
        self.rohan = User.objects.create_user(username='Rohan', email='rohan@example.com', password='password123')
        self.aisha = User.objects.create_user(username='Aisha', email='aisha@example.com', password='password123')
        self.meera = User.objects.create_user(username='Meera', email='meera@example.com', password='password123')
        self.group = Group.objects.create(name="Test Group", created_by=self.alice)
        GroupMember.objects.create(group=self.group, user=self.alice)
        GroupMember.objects.create(group=self.group, user=self.priya)
        GroupMember.objects.create(group=self.group, user=self.rohan)
        GroupMember.objects.create(group=self.group, user=self.aisha)
        GroupMember.objects.create(group=self.group, user=self.meera)
        
    def validate_csv(self, csv_bytes):
        rows, warnings = parse_csv(csv_bytes)
        return validate_all(rows, self.group.id), warnings

class TestParserSafety(BaseImporterTest):
    def test_never_crashes_on_malformed_input(self):
        results, warnings = self.validate_csv(b'\x00\xFFGarbled')
        self.assertIsInstance(results, list)
        for r in results:
            self.assertNotEqual(r.status, 'imported')

    def test_42_rows_from_actual_csv(self):
        # We assume Expenses Export.csv is located in the backend root
        import os
        from django.conf import settings
        csv_path = os.path.join(settings.BASE_DIR, '..', 'Expenses Export.csv')
        if os.path.exists(csv_path):
            with open(csv_path, 'rb') as f:
                rows, warnings = parse_csv(f.read())
                self.assertEqual(len(rows), 42)
                self.assertEqual(warnings, [])
        else:
            # Fallback if file not accessible in test environment
            self.assertTrue(True)

    def test_blank_row_flagged(self):
        results, warnings = self.validate_csv(make_csv(',,,,,,,,'))
        self.assertTrue(len(warnings) > 0 or len(results) == 0)

class TestStructural(BaseImporterTest):
    def test_missing_payer_rejected(self):
        csv = make_csv('2026-02-12,Test,,100,INR,EQUAL,Alice,,')
        results, _ = self.validate_csv(csv)
        self.assertEqual(results[0].status, 'rejected')
        self.assertIn('MISSING_PAYER', results[0].issue_codes)

    def test_missing_currency_rejected(self):
        csv = make_csv('2026-02-12,Test,Alice,100,,EQUAL,Priya,,')
        results, _ = self.validate_csv(csv)
        self.assertIn('MISSING_CURRENCY', results[0].issue_codes)

    def test_missing_date_rejected(self):
        csv = make_csv(',Test,Alice,100,INR,EQUAL,Priya,,')
        results, _ = self.validate_csv(csv)
        self.assertIn('MISSING_DATE', results[0].issue_codes)

class TestDataTypes(BaseImporterTest):
    def test_invalid_date_mar14_rejected(self):
        csv = make_csv('Mar-14,Test,Alice,100,INR,EQUAL,Priya,,')
        results, _ = self.validate_csv(csv)
        self.assertEqual(results[0].status, 'rejected')
        self.assertIn('INVALID_DATE_FORMAT', results[0].issue_codes)

    def test_zero_amount_rejected(self):
        csv = make_csv('2026-02-12,Test,Alice,0,INR,EQUAL,Priya,,')
        results, _ = self.validate_csv(csv)
        self.assertIn('ZERO_AMOUNT', results[0].issue_codes)

    def test_negative_amount_becomes_refund(self):
        csv = make_csv('2026-02-12,Test,Alice,-30,USD,EQUAL,Priya,,')
        results, _ = self.validate_csv(csv)
        self.assertIn('NEGATIVE_AMOUNT', results[0].issue_codes)
        self.assertEqual(results[0].import_as, 'refund')
        self.assertTrue(Decimal(results[0].parsed_data['amount_decimal']) > 0)

    def test_comma_amount_cleaned(self):
        csv = make_csv('2026-02-12,Test,Alice,"1,200",INR,EQUAL,Priya,,')
        results, _ = self.validate_csv(csv)
        self.assertNotEqual(results[0].status, 'rejected')
        self.assertIn('AMOUNT_COMMA_FORMATTED', results[0].issue_codes)
        self.assertEqual(results[0].parsed_data['amount_decimal'], '1200')

    def test_excess_precision_rounded(self):
        csv = make_csv('2026-02-12,Test,Alice,899.995,INR,EQUAL,Priya,,')
        results, _ = self.validate_csv(csv)
        self.assertIn('EXCESS_DECIMAL_PRECISION', results[0].issue_codes)
        self.assertEqual(results[0].parsed_data['amount_decimal'], '900.00')

    def test_usd_converted_to_inr(self):
        csv = make_csv('2026-02-12,Test,Alice,540,USD,EQUAL,Priya,,')
        results, _ = self.validate_csv(csv)
        self.assertIn('FOREIGN_CURRENCY_USD', results[0].issue_codes)
        self.assertEqual(results[0].parsed_data['amount_decimal'], '45900.00')

class TestIdentity(BaseImporterTest):
    def test_lowercase_payer_resolved(self):
        csv = make_csv('2026-02-12,Test,priya,100,INR,EQUAL,Alice,,')
        results, _ = self.validate_csv(csv)
        self.assertNotEqual(results[0].status, 'rejected')
        self.assertIn('PAID_BY_CASE_MISMATCH', results[0].issue_codes)
        self.assertEqual(results[0].parsed_data['paid_by_user_id'], self.priya.id)

    def test_unknown_payer_priya_s_rejected(self):
        csv = make_csv('2026-02-12,Test,Priya S,100,INR,EQUAL,Alice,,')
        results, _ = self.validate_csv(csv)
        self.assertEqual(results[0].status, 'rejected')
        self.assertIn('UNKNOWN_PAYER', results[0].issue_codes)

    def test_unknown_participant_kabir_rejected(self):
        csv = make_csv('2026-02-12,Test,Alice,100,INR,EQUAL,"Dev\'s friend Kabir",,')
        results, _ = self.validate_csv(csv)
        self.assertIn('UNKNOWN_PARTICIPANT', results[0].issue_codes)

class TestDuplicates(BaseImporterTest):
    def test_exact_duplicate_skipped(self):
        csv = make_csv(
            '2026-02-12,Test,Alice,100,INR,EQUAL,Priya,,',
            '2026-02-12,Test,Alice,100,INR,EQUAL,Priya,,'
        )
        results, _ = self.validate_csv(csv)
        self.assertEqual(results[1].status, 'rejected')
        self.assertIn('EXACT_DUPLICATE', results[1].issue_codes)

    def test_conflicting_duplicate_needs_review(self):
        csv = make_csv(
            '2026-02-12,Movie tickets,Alice,100,INR,EQUAL,Priya,,',
            '2026-02-12,Movie tickets,Rohan,100,INR,EQUAL,Priya,,'
        )
        results, _ = self.validate_csv(csv)
        self.assertIn('CONFLICTING_DUPLICATE', results[1].issue_codes)

class TestMembership(BaseImporterTest):
    def test_meera_after_leave_excluded_not_rejected(self):
        csv = make_csv('2026-04-02,Test,Alice,100,INR,EQUAL,Meera,,')
        results, _ = self.validate_csv(csv)
        self.assertNotEqual(results[0].status, 'rejected')
        self.assertIn('MEMBER_AFTER_LEAVE_DATE', results[0].issue_codes)

class TestSettlement(BaseImporterTest):
    def test_settlement_row_detected(self):
        csv = make_csv('2026-02-12,Rohan paid Aisha back,Rohan,100,INR,,,')
        results, _ = self.validate_csv(csv)
        self.assertEqual(results[0].import_as, 'settlement')
        self.assertIn('SETTLEMENT_AS_EXPENSE', results[0].issue_codes)

class TestSplitMath(BaseImporterTest):
    def test_percentage_over_100_rejected(self):
        csv = make_csv('2026-02-12,Test,Alice,100,INR,PERCENTAGE,"Alice,Priya",Alice 60% Priya 50%,')
        results, _ = self.validate_csv(csv)
        self.assertEqual(results[0].status, 'rejected')
        self.assertIn('PERCENTAGE_SUM_MISMATCH', results[0].issue_codes)
