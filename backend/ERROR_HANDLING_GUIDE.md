# FitForge Error Handling Guide

## Overview

FitForge uses a comprehensive error handling system that provides:
- Consistent error responses across all endpoints
- User-friendly error messages
- Correlation IDs for tracking errors
- Recovery suggestions for users
- Detailed debug information in development

## Error Response Format

All errors follow this consistent format:

```json
{
  "error": {
    "error_code": "RESOURCE_NOT_FOUND",
    "message": "The requested workout could not be found",
    "details": {
      "resource_type": "workout",
      "resource_id": "123e4567-e89b-12d3-a456-426614174000"
    },
    "timestamp": "2024-01-01T12:00:00Z",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440000",
    "recovery_suggestions": [
      "Check if the workout ID is correct",
      "Ensure the workout has not been deleted",
      "Verify you have access to this workout"
    ]
  }
}
```

## Custom Exception Classes

Located in `app/core/exceptions.py`:

### ValidationError (400)
```python
raise ValidationError(
    message="Invalid email format",
    field_errors={
        "email": ["Email must contain @ symbol"]
    }
)
```

### NotFoundError (404)
```python
raise NotFoundError(
    resource_type="workout",
    resource_id=workout_id
)
```

### ConflictError (409)
```python
raise ConflictError(
    message="Email already exists",
    conflicting_field="email",
    conflicting_value="user@example.com"
)
```

### DatabaseError (500)
```python
raise DatabaseError(
    message="Failed to execute query",
    operation="insert"
)
```

### AuthorizationError (403)
```python
raise AuthorizationError(
    message="Cannot access other users' workouts",
    required_permission="workouts.read.others",
    resource_type="workout"
)
```

### BusinessLogicError (422)
```python
raise BusinessLogicError(
    message="Workout cannot start in the future",
    rule_violated="workout_start_time_validation"
)
```

### ExternalServiceError (502)
```python
raise ExternalServiceError(
    service_name="Exercise Database API"
)
```

### RateLimitError (429)
```python
raise RateLimitError(
    retry_after=60,
    limit=100,
    window="1 hour"
)
```

## Migration Guide

### Before (using HTTPException)
```python
from fastapi import HTTPException

if not workout:
    raise HTTPException(
        status_code=404,
        detail="Workout not found"
    )
```

### After (using custom exceptions)
```python
from app.core.exceptions import NotFoundError

if not workout:
    raise NotFoundError(
        resource_type="workout",
        resource_id=workout_id
    )
```

## Correlation IDs

Every request gets a unique correlation ID:
- Generated automatically by middleware
- Available in `request.state.correlation_id`
- Included in all error responses
- Added to all log entries
- Returned in `X-Correlation-ID` response header

## Error Handling Best Practices

1. **Use specific exceptions**: Choose the most appropriate exception class
2. **Provide context**: Include relevant details in the error
3. **User-friendly messages**: Write messages that users can understand
4. **Recovery suggestions**: Help users resolve the issue
5. **Log appropriately**: Errors are logged automatically with correlation IDs

## Testing Error Handling

In debug mode, test endpoints are available at `/api/test-errors/`:
- `GET /api/test-errors/validation-error?email=invalid`
- `GET /api/test-errors/not-found/123`
- `POST /api/test-errors/conflict`
- `GET /api/test-errors/database-error`
- `GET /api/test-errors/authorization-error`
- `POST /api/test-errors/business-logic-error`
- `GET /api/test-errors/external-service-error`
- `GET /api/test-errors/rate-limit-error`
- `GET /api/test-errors/unhandled-error`

## Database Error Handling

The system automatically handles common database errors:
- Connection failures → DatabaseError
- Constraint violations → ConflictError or ValidationError
- Query timeouts → DatabaseError with timeout details

## Debug Mode

In debug mode (`DEBUG=true`), error responses include:
- Full exception type and message
- Stack traces
- Additional technical details

**Never enable debug mode in production!**

## Monitoring and Alerting

Use correlation IDs to:
- Track errors across multiple services
- Group related errors in logging systems
- Create alerts for specific error patterns
- Debug user-reported issues

## Example Implementation

See `app/api/workouts_updated.py` for a complete example of migrating an endpoint to use the new error handling system.