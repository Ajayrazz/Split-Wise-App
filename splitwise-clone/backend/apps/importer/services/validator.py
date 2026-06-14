import re
from datetime import datetime, date
from decimal import Decimal, InvalidOperation
from apps.groups.models import GroupMember
from apps.importer.constants import MEMBER_WINDOWS, USD_TO_INR_RATE

class ValidationResult:
    def __init__(self, row_number, raw_data):
        self.row_number = row_number
        self.raw_data = raw_data
        self.parsed_data = {}
        self.status = 'pending'
        self.severity = 'none'
        self.issue_codes = []
        self.messages = []
        self.import_as = 'expense'

    def reject(self, code, message):
        self.status = 'rejected'
        if code not in self.issue_codes:
            self.issue_codes.append(code)
        self.messages.append(message)

    def warn(self, code, message):
        self.severity = 'warning'
        if code not in self.issue_codes:
            self.issue_codes.append(code)
        self.messages.append(message)

def validate_all(rows, group_id):
    members = GroupMember.objects.filter(group_id=group_id).select_related('user')
    member_map = {m.user.username.lower(): m.user.id for m in members}
    member_objs = {m.user.username.lower(): m.user for m in members}
    
    results = []
    seen_rows = {}
    
    for row in rows:
        if row.get('is_blank'):
            continue
            
        vr = ValidationResult(row['row_number'], row['raw_data'])
        raw = row['raw_data']
        
        is_settlement = str(raw.get('split_type', '')).upper() == 'SETTLEMENT' or 'settle' in raw.get('description', '').lower() or ('paid' in raw.get('description', '').lower() and 'back' in raw.get('description', '').lower())

        # Layer 1: Structural
        if not raw.get('paid_by'):
            vr.reject('MISSING_PAYER', 'Payer missing.')
        if not raw.get('currency'):
            vr.reject('MISSING_CURRENCY', 'Currency missing.')
        if not raw.get('date'):
            vr.reject('MISSING_DATE', 'Date missing.')
        if not raw.get('amount'):
            vr.reject('MISSING_AMOUNT', 'Amount missing.')
        if not raw.get('split_with') and not is_settlement:
            vr.reject('MISSING_SPLIT_WITH', 'Split with missing.')
        if not raw.get('description'):
            vr.reject('EMPTY_DESCRIPTION', 'Description empty.')
            
        if vr.status == 'rejected':
            results.append(vr)
            continue
            
        # Layer 2: Data Types
        date_str = raw['date'].strip()
        parsed_date = None
        try:
            parsed_date = datetime.strptime(date_str, '%m/%d/%Y').date()
        except ValueError:
            try:
                parsed_date = datetime.strptime(date_str, '%m-%d-%Y').date()
            except ValueError:
                pass
        
        if parsed_date and parsed_date.day <= 12 and parsed_date.month <= 12 and parsed_date.day != parsed_date.month:
            vr.warn('AMBIGUOUS_DATE', 'Date ambiguous.')
            
        if not parsed_date:
            try:
                parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                try:
                    parsed_date = datetime.strptime(date_str, '%d/%m/%Y').date()
                except ValueError:
                    try:
                        parsed_date = datetime.strptime(date_str, '%d-%m-%Y').date()
                    except ValueError:
                        vr.reject('INVALID_DATE_FORMAT', 'Invalid date.')
                    
        if parsed_date:
            vr.parsed_data['date_parsed'] = parsed_date.strftime('%Y-%m-%d')
        
        amount_str = raw['amount'].strip()
        if ',' in amount_str:
            vr.warn('AMOUNT_COMMA_FORMATTED', 'Amount has commas.')
            amount_str = amount_str.replace(',', '')
            
        try:
            amount_val = Decimal(amount_str)
            if amount_val.as_tuple().exponent < -2:
                vr.warn('EXCESS_DECIMAL_PRECISION', 'Excess precision.')
                amount_val = amount_val.quantize(Decimal('0.01'))
            if amount_val == 0:
                vr.reject('ZERO_AMOUNT', 'Zero amount.')
            elif amount_val < 0:
                vr.warn('NEGATIVE_AMOUNT', 'Negative amount.')
                amount_val = abs(amount_val)
                vr.import_as = 'refund'
            vr.parsed_data['amount_decimal'] = str(amount_val)
        except InvalidOperation:
            vr.reject('INVALID_AMOUNT_FORMAT', 'Invalid amount.')
            
        curr = raw['currency'].upper()
        if curr == 'USD':
            vr.warn('FOREIGN_CURRENCY_USD', 'Currency is USD.')
            if 'amount_decimal' in vr.parsed_data:
                vr.parsed_data['amount_decimal'] = str(Decimal(vr.parsed_data['amount_decimal']) * USD_TO_INR_RATE)
        elif curr != 'INR':
            vr.reject('UNSUPPORTED_CURRENCY', 'Currency unsupported.')
            
        split_type = raw.get('split_type', 'EQUAL').upper()
        if split_type not in ['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARE', 'UNEQUAL', 'SETTLEMENT']:
            if raw.get('split_type'):
                vr.reject('INVALID_SPLIT_TYPE', 'Split type invalid.')
            else:
                vr.warn('MISSING_SPLIT_TYPE', 'Missing split type.')
                split_type = 'EQUAL'
                
        if split_type == 'SETTLEMENT' or 'settle' in raw['description'].lower() or ('paid' in raw['description'].lower() and 'back' in raw['description'].lower()):
            if 'settle' not in raw['description'].lower() and split_type != 'SETTLEMENT':
                vr.warn('SETTLEMENT_AS_EXPENSE', 'Settlement as expense.')
            vr.import_as = 'settlement'
            split_type = 'SETTLEMENT'
            
        vr.parsed_data['split_type'] = split_type
        
        if vr.status == 'rejected':
            results.append(vr)
            continue
            
        # Layer 3: Business
        payer_raw = raw['paid_by']
        if payer_raw != payer_raw.strip():
            vr.warn('TRAILING_WHITESPACE_PAYER', 'Payer has trailing whitespace.')
        payer_clean = payer_raw.strip().lower()
        if payer_clean not in member_map:
            vr.reject('UNKNOWN_PAYER', 'Unknown payer.')
        else:
            if payer_raw.strip() != member_objs[payer_clean].username:
                vr.warn('PAID_BY_CASE_MISMATCH', 'Payer case mismatch.')
            vr.parsed_data['paid_by_user_id'] = member_map[payer_clean]
            
        split_with_str = raw.get('split_with', '')
        participants = []
        if split_type == 'SETTLEMENT':
            # Payee might be in split_with, or description "Rohan paid Aisha back" -> payee is Aisha
            payee_clean = split_with_str.strip().lower()
            if not payee_clean:
                # Try to extract from description
                desc_lower = raw['description'].lower()
                for member_name in member_map:
                    if member_name in desc_lower and member_name != payer_clean:
                        payee_clean = member_name
                        break
            if payee_clean in member_map:
                participants.append({'username': member_objs[payee_clean].username, 'user_id': member_map[payee_clean]})
            else:
                vr.reject('UNKNOWN_PARTICIPANT', 'Unknown participant.')
        else:
            parts = [p.strip() for p in split_with_str.split(';') if p.strip()]
            if not parts and ',' in split_with_str:
                parts = [p.strip() for p in split_with_str.split(',') if p.strip()]
            for p in parts:
                p_clean = p.lower()
                if p_clean in member_map:
                    participants.append({'username': member_objs[p_clean].username, 'user_id': member_map[p_clean]})
                else:
                    vr.warn('UNKNOWN_PARTICIPANT', f'Unknown participant: {p}')
                    
        if not participants and split_type != 'SETTLEMENT':
            vr.reject('NO_VALID_PARTICIPANTS', 'No valid participants.')
            
        vr.parsed_data['participants'] = participants
        
        if parsed_date:
            for p in participants + [{'username': payer_clean}]:
                u = p['username'].lower()
                if u in MEMBER_WINDOWS:
                    if 'leave_date' in MEMBER_WINDOWS[u] and parsed_date > MEMBER_WINDOWS[u]['leave_date']:
                        vr.warn('MEMBER_AFTER_LEAVE_DATE', 'Member after leave date.')
                    if 'join_date' in MEMBER_WINDOWS[u] and parsed_date < MEMBER_WINDOWS[u]['join_date']:
                        vr.warn('MEMBER_BEFORE_JOIN_DATE', 'Member before join date.')
                        
        if split_type == 'PERCENTAGE':
            split_det = raw.get('split_details', '')
            vr.parsed_data['split_details_raw'] = split_det
            pct_map = {}
            for match in re.finditer(r'([\w\s]+?)\s+(\d+(?:\.\d+)?)%', split_det):
                pct_map[match.group(1).strip().lower()] = Decimal(match.group(2))
            # Wait, maybe they didn't write % sign.
            if not pct_map:
                for match in re.finditer(r'([\w\s]+?)\s+(\d+(?:\.\d+)?)', split_det):
                    pct_map[match.group(1).strip().lower()] = Decimal(match.group(2))
            if pct_map and sum(pct_map.values()) != Decimal('100'):
                vr.reject('PERCENTAGE_SUM_MISMATCH', 'Percentage sum mismatch.')
            elif not pct_map:
                # If no map, just let it fail at splitting or warn
                pass
        else:
            vr.parsed_data['split_details_raw'] = raw.get('split_details', '')

        if vr.status == 'rejected':
            results.append(vr)
            continue
            
        # Layer 4: Duplicates
        # Same date, any payer
        dup_key = vr.parsed_data.get('date_parsed')
        
        if dup_key in seen_rows:
            prev_rows = seen_rows[dup_key]
            for prev_row in prev_rows:
                # If payer is same and amount is same => EXACT_DUPLICATE
                if prev_row.parsed_data.get('paid_by_user_id') == vr.parsed_data.get('paid_by_user_id') and prev_row.parsed_data.get('amount_decimal') == vr.parsed_data.get('amount_decimal'):
                    vr.reject('EXACT_DUPLICATE', 'Exact duplicate.')
                    break
                else:
                    # Not exact duplicate, but maybe conflicting?
                    words1 = set(raw['description'].lower().replace('-', ' ').split())
                    words2 = set(prev_row.raw_data['description'].lower().replace('-', ' ').split())
                    # Ignore common words
                    stop_words = {'at', 'the', 'for', 'dinner', 'lunch', 'breakfast'}
                    w1_sig = words1 - stop_words
                    w2_sig = words2 - stop_words
                    if len(w1_sig.intersection(w2_sig)) >= 1:
                        vr.warn('CONFLICTING_DUPLICATE', 'Conflicting duplicate.')
                        if 'CONFLICTING_DUPLICATE' not in prev_row.issue_codes:
                            prev_row.warn('CONFLICTING_DUPLICATE', 'Conflicting duplicate.')
                        
        if dup_key not in seen_rows:
            seen_rows[dup_key] = []
        seen_rows[dup_key].append(vr)
        
        results.append(vr)
        
    return results
