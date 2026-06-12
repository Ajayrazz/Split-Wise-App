from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None and isinstance(exc, ValidationError):
        fields = response.data
        if isinstance(fields, list):
            fields = {"non_field_errors": fields}
        elif isinstance(fields, dict):
            # Ensure all values are lists for consistency
            for k, v in fields.items():
                if not isinstance(v, list):
                    fields[k] = [v]

        custom_response_data = {
            "error": {
                "code": "VALIDATION_FAILED",
                "fields": fields
            }
        }
        response.data = custom_response_data

    return response
