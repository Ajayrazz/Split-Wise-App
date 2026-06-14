import csv
import io

def parse_csv(file_bytes: bytes):
    try:
        text = file_bytes.decode('utf-8')
    except UnicodeDecodeError:
        text = file_bytes.decode('latin-1')
        
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        return [], ["Empty file"]
        
    headers = [h.strip().lower() for h in reader.fieldnames]
    reader.fieldnames = headers
    
    rows = []
    warnings = []
    
    for idx, row in enumerate(reader, start=2):
        try:
            if all(not str(v).strip() for v in row.values() if v is not None):
                rows.append({'row_number': idx, 'raw_data': {}, 'is_blank': True})
                continue
            
            raw_data = {str(k): str(v).strip() for k, v in row.items() if k is not None}
            rows.append({
                'row_number': idx,
                'raw_data': raw_data,
                'is_blank': False
            })
        except Exception as e:
            warnings.append(f"Row {idx} failed to parse: {str(e)}")
            
    return rows, warnings
