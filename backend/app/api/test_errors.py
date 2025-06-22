"""
Test Error Endpoints
Demonstrates the comprehensive error handling system
Only available in DEBUG mode
"""

from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.core.config import get_settings
from app.core.exceptions import (
    ValidationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    AuthorizationError,
    BusinessLogicError,
    ExternalServiceError,
    RateLimitError
)

settings = get_settings()

# Only create router if in DEBUG mode
if settings.DEBUG:
    router = APIRouter()
    
    @router.get("/validation-error")
    async def test_validation_error(
        email: str = Query(..., description="Email to validate")
    ):
        """Test validation error with field-specific errors"""
        if "@" not in email:
            raise ValidationError(
                message="Invalid email format",
                field_errors={
                    "email": ["Email must contain @ symbol", "Email format is invalid"]
                }
            )
        return {"message": "Email is valid", "email": email}
    
    
    @router.get("/not-found/{resource_id}")
    async def test_not_found(resource_id: str):
        """Test resource not found error"""
        raise NotFoundError(
            resource_type="workout",
            resource_id=resource_id
        )
    
    
    @router.post("/conflict")
    async def test_conflict():
        """Test conflict error"""
        raise ConflictError(
            message="A user with this email already exists",
            conflicting_field="email",
            conflicting_value="user@example.com"
        )
    
    
    @router.get("/database-error")
    async def test_database_error():
        """Test database error"""
        raise DatabaseError(
            message="Connection to database timed out",
            operation="query"
        )
    
    
    @router.get("/authorization-error")
    async def test_authorization_error():
        """Test authorization error"""
        raise AuthorizationError(
            message="You don't have permission to view other users' workouts",
            required_permission="workouts.read.others",
            resource_type="workout"
        )
    
    
    @router.post("/business-logic-error")
    async def test_business_logic_error():
        """Test business logic error"""
        raise BusinessLogicError(
            message="Cannot log sets for a workout that hasn't started",
            rule_violated="workout_must_be_started_before_logging_sets"
        )
    
    
    @router.get("/external-service-error")
    async def test_external_service_error():
        """Test external service error"""
        raise ExternalServiceError(
            service_name="Exercise Database API",
            message="The exercise database service is temporarily unavailable"
        )
    
    
    @router.get("/rate-limit-error")
    async def test_rate_limit_error():
        """Test rate limit error"""
        raise RateLimitError(
            message="API rate limit exceeded",
            retry_after=60,
            limit=100,
            window="1 hour"
        )
    
    
    @router.get("/unhandled-error")
    async def test_unhandled_error():
        """Test unhandled exception (will be caught by general handler)"""
        # This will cause a division by zero error
        result = 1 / 0
        return {"result": result}
    
    
    @router.get("/success")
    async def test_success():
        """Test successful response for comparison"""
        return {
            "status": "success",
            "message": "This endpoint demonstrates a successful response",
            "data": {
                "example": "data",
                "timestamp": "2024-01-01T12:00:00Z"
            }
        }
else:
    # Create empty router if not in debug mode
    router = APIRouter()