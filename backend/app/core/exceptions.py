"""
FitForge Custom Exception Classes
Provides structured error handling with consistent format and user-friendly messages

All exceptions include:
- Error codes for machine-readable identification
- User-friendly messages
- Technical details for debugging
- Recovery suggestions for users
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from uuid import uuid4


class FitForgeException(Exception):
    """
    Base exception class for all FitForge-specific exceptions
    Provides consistent error structure and metadata
    """
    
    # Default values that can be overridden by subclasses
    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"
    default_message: str = "An unexpected error occurred"
    
    def __init__(
        self,
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        recovery_suggestions: Optional[List[str]] = None,
        correlation_id: Optional[str] = None
    ):
        """
        Initialize FitForge exception
        
        Args:
            message: User-friendly error message (uses default if not provided)
            details: Additional technical details about the error
            recovery_suggestions: List of actionable suggestions for the user
            correlation_id: Unique ID for tracking this error across logs
        """
        self.message = message or self.default_message
        self.details = details or {}
        self.recovery_suggestions = recovery_suggestions or []
        self.correlation_id = correlation_id or str(uuid4())
        self.timestamp = datetime.utcnow().isoformat() + "Z"
        
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert exception to dictionary format for JSON response
        
        Returns:
            Dictionary with error information
        """
        return {
            "error": {
                "error_code": self.error_code,
                "message": self.message,
                "details": self.details,
                "timestamp": self.timestamp,
                "correlation_id": self.correlation_id,
                "recovery_suggestions": self.recovery_suggestions
            }
        }


class ValidationError(FitForgeException):
    """
    Raised when input validation fails
    HTTP Status: 400 Bad Request
    """
    status_code = 400
    error_code = "VALIDATION_ERROR"
    default_message = "The provided data is invalid"
    
    def __init__(
        self,
        message: Optional[str] = None,
        field_errors: Optional[Dict[str, List[str]]] = None,
        **kwargs
    ):
        """
        Initialize validation error
        
        Args:
            message: Overall validation error message
            field_errors: Dictionary mapping field names to list of error messages
            **kwargs: Additional arguments passed to parent class
        """
        if field_errors:
            kwargs["details"] = {"field_errors": field_errors}
            
        if not kwargs.get("recovery_suggestions"):
            kwargs["recovery_suggestions"] = [
                "Check the format of your input data",
                "Ensure all required fields are provided",
                "Verify that field values meet the specified constraints"
            ]
        
        super().__init__(message, **kwargs)


class NotFoundError(FitForgeException):
    """
    Raised when a requested resource cannot be found
    HTTP Status: 404 Not Found
    """
    status_code = 404
    error_code = "RESOURCE_NOT_FOUND"
    default_message = "The requested resource could not be found"
    
    def __init__(
        self,
        resource_type: str,
        resource_id: Optional[str] = None,
        message: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize not found error
        
        Args:
            resource_type: Type of resource that wasn't found (e.g., "workout", "exercise")
            resource_id: ID of the resource that wasn't found
            message: Custom error message
            **kwargs: Additional arguments passed to parent class
        """
        if not message:
            if resource_id:
                message = f"{resource_type.capitalize()} with ID '{resource_id}' not found"
            else:
                message = f"{resource_type.capitalize()} not found"
        
        kwargs["details"] = {
            "resource_type": resource_type,
            "resource_id": resource_id
        }
        
        if not kwargs.get("recovery_suggestions"):
            kwargs["recovery_suggestions"] = [
                f"Check if the {resource_type} ID is correct",
                f"Ensure the {resource_type} has not been deleted",
                f"Verify you have access to this {resource_type}"
            ]
        
        super().__init__(message, **kwargs)


class ConflictError(FitForgeException):
    """
    Raised when an operation conflicts with existing data
    HTTP Status: 409 Conflict
    """
    status_code = 409
    error_code = "RESOURCE_CONFLICT"
    default_message = "The operation conflicts with existing data"
    
    def __init__(
        self,
        message: Optional[str] = None,
        conflicting_field: Optional[str] = None,
        conflicting_value: Optional[Any] = None,
        **kwargs
    ):
        """
        Initialize conflict error
        
        Args:
            message: Custom error message
            conflicting_field: Field that caused the conflict
            conflicting_value: Value that caused the conflict
            **kwargs: Additional arguments passed to parent class
        """
        if conflicting_field:
            kwargs["details"] = {
                "conflicting_field": conflicting_field,
                "conflicting_value": conflicting_value
            }
            
        if not kwargs.get("recovery_suggestions"):
            kwargs["recovery_suggestions"] = [
                "Use a different value for the conflicting field",
                "Update the existing resource instead of creating a new one",
                "Delete the existing resource if it's no longer needed"
            ]
        
        super().__init__(message, **kwargs)


class DatabaseError(FitForgeException):
    """
    Raised when database operations fail
    HTTP Status: 500 Internal Server Error
    """
    status_code = 500
    error_code = "DATABASE_ERROR"
    default_message = "A database error occurred"
    
    def __init__(
        self,
        message: Optional[str] = None,
        operation: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize database error
        
        Args:
            message: Custom error message
            operation: Database operation that failed (e.g., "insert", "update", "query")
            **kwargs: Additional arguments passed to parent class
        """
        if operation:
            kwargs["details"] = {"operation": operation}
            
        if not kwargs.get("recovery_suggestions"):
            kwargs["recovery_suggestions"] = [
                "Please try your request again",
                "If the problem persists, contact support",
                "Check your network connection"
            ]
        
        # Hide technical details in production
        if message and "connection" in message.lower():
            self.message = "Unable to connect to the database"
        elif message and "constraint" in message.lower():
            self.message = "The operation violates data constraints"
        
        super().__init__(message, **kwargs)


class AuthorizationError(FitForgeException):
    """
    Raised when user lacks permission for an operation
    HTTP Status: 403 Forbidden
    """
    status_code = 403
    error_code = "AUTHORIZATION_ERROR"
    default_message = "You don't have permission to perform this action"
    
    def __init__(
        self,
        message: Optional[str] = None,
        required_permission: Optional[str] = None,
        resource_type: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize authorization error
        
        Args:
            message: Custom error message
            required_permission: Permission needed for the operation
            resource_type: Type of resource being accessed
            **kwargs: Additional arguments passed to parent class
        """
        details = {}
        if required_permission:
            details["required_permission"] = required_permission
        if resource_type:
            details["resource_type"] = resource_type
            
        if details:
            kwargs["details"] = details
            
        if not kwargs.get("recovery_suggestions"):
            suggestions = ["Ensure you're logged in with the correct account"]
            if resource_type:
                suggestions.append(f"Verify you have access to this {resource_type}")
            if required_permission:
                suggestions.append(f"Request '{required_permission}' permission from an administrator")
            kwargs["recovery_suggestions"] = suggestions
        
        super().__init__(message, **kwargs)


class BusinessLogicError(FitForgeException):
    """
    Raised when business rules are violated
    HTTP Status: 422 Unprocessable Entity
    """
    status_code = 422
    error_code = "BUSINESS_LOGIC_ERROR"
    default_message = "The operation violates business rules"
    
    def __init__(
        self,
        message: Optional[str] = None,
        rule_violated: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize business logic error
        
        Args:
            message: Custom error message describing the violation
            rule_violated: Name or description of the rule that was violated
            **kwargs: Additional arguments passed to parent class
        """
        if rule_violated:
            kwargs["details"] = {"rule_violated": rule_violated}
        
        super().__init__(message, **kwargs)


class ExternalServiceError(FitForgeException):
    """
    Raised when external service calls fail
    HTTP Status: 502 Bad Gateway
    """
    status_code = 502
    error_code = "EXTERNAL_SERVICE_ERROR"
    default_message = "An external service is unavailable"
    
    def __init__(
        self,
        service_name: str,
        message: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize external service error
        
        Args:
            service_name: Name of the external service that failed
            message: Custom error message
            **kwargs: Additional arguments passed to parent class
        """
        kwargs["details"] = {"service_name": service_name}
        
        if not message:
            message = f"The {service_name} service is currently unavailable"
            
        if not kwargs.get("recovery_suggestions"):
            kwargs["recovery_suggestions"] = [
                "Please try your request again in a few moments",
                f"Check if {service_name} is experiencing any known issues",
                "Contact support if the problem persists"
            ]
        
        super().__init__(message, **kwargs)


class RateLimitError(FitForgeException):
    """
    Raised when rate limits are exceeded
    HTTP Status: 429 Too Many Requests
    """
    status_code = 429
    error_code = "RATE_LIMIT_EXCEEDED"
    default_message = "Too many requests"
    
    def __init__(
        self,
        message: Optional[str] = None,
        retry_after: Optional[int] = None,
        limit: Optional[int] = None,
        window: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize rate limit error
        
        Args:
            message: Custom error message
            retry_after: Seconds until the rate limit resets
            limit: The rate limit that was exceeded
            window: Time window for the rate limit (e.g., "1 hour", "1 day")
            **kwargs: Additional arguments passed to parent class
        """
        details = {}
        if retry_after:
            details["retry_after_seconds"] = retry_after
        if limit:
            details["limit"] = limit
        if window:
            details["window"] = window
            
        if details:
            kwargs["details"] = details
            
        if not kwargs.get("recovery_suggestions"):
            suggestions = ["Please wait before making more requests"]
            if retry_after:
                suggestions.append(f"Try again in {retry_after} seconds")
            kwargs["recovery_suggestions"] = suggestions
        
        super().__init__(message, **kwargs)