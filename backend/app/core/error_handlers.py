"""
FitForge Global Error Handlers
Provides centralized error handling for all FastAPI endpoints

Features:
- Consistent error response format
- Correlation ID tracking
- User-friendly error messages
- Debug information in development mode
- Comprehensive logging
"""

import logging
import traceback
from typing import Dict, Any, Optional
from uuid import uuid4
from datetime import datetime

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException
from asyncpg.exceptions import PostgresError, IntegrityConstraintViolationError
from pydantic import ValidationError as PydanticValidationError

from .exceptions import (
    FitForgeException,
    ValidationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    AuthorizationError,
    BusinessLogicError,
    ExternalServiceError,
    RateLimitError
)
from .config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def get_correlation_id(request: Request) -> str:
    """
    Get or generate correlation ID for request tracking
    
    Args:
        request: FastAPI request object
        
    Returns:
        Correlation ID string
    """
    # Try to get from request state (set by middleware)
    correlation_id = getattr(request.state, "correlation_id", None)
    
    # Try to get from headers (for distributed tracing)
    if not correlation_id:
        correlation_id = request.headers.get("X-Correlation-ID")
    
    # Generate new one if not found
    if not correlation_id:
        correlation_id = str(uuid4())
        
    return correlation_id


def create_error_response(
    error_code: str,
    message: str,
    status_code: int,
    details: Optional[Dict[str, Any]] = None,
    recovery_suggestions: Optional[list] = None,
    correlation_id: Optional[str] = None,
    debug_info: Optional[Dict[str, Any]] = None
) -> JSONResponse:
    """
    Create standardized error response
    
    Args:
        error_code: Machine-readable error code
        message: User-friendly error message
        status_code: HTTP status code
        details: Additional error details
        recovery_suggestions: List of recovery suggestions
        correlation_id: Request correlation ID
        debug_info: Debug information (only included in debug mode)
        
    Returns:
        JSONResponse with error information
    """
    error_response = {
        "error": {
            "error_code": error_code,
            "message": message,
            "details": details or {},
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "correlation_id": correlation_id or str(uuid4()),
            "recovery_suggestions": recovery_suggestions or []
        }
    }
    
    # Add debug information in development mode
    if settings.DEBUG and debug_info:
        error_response["error"]["debug"] = debug_info
    
    return JSONResponse(
        status_code=status_code,
        content=error_response
    )


async def fitforge_exception_handler(request: Request, exc: FitForgeException) -> JSONResponse:
    """
    Handle FitForge custom exceptions
    
    Args:
        request: FastAPI request object
        exc: FitForgeException instance
        
    Returns:
        JSONResponse with error information
    """
    correlation_id = get_correlation_id(request)
    exc.correlation_id = correlation_id
    
    # Log the error with context
    logger.error(
        f"{exc.error_code}: {exc.message}",
        extra={
            "correlation_id": correlation_id,
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method,
            "details": exc.details
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle FastAPI request validation errors
    
    Args:
        request: FastAPI request object
        exc: RequestValidationError instance
        
    Returns:
        JSONResponse with validation error details
    """
    correlation_id = get_correlation_id(request)
    
    # Extract field errors
    field_errors = {}
    for error in exc.errors():
        loc = error.get("loc", ())
        # Skip the first item (usually "body") and join the rest
        field_path = ".".join(str(x) for x in loc[1:]) if len(loc) > 1 else "root"
        
        if field_path not in field_errors:
            field_errors[field_path] = []
            
        field_errors[field_path].append(error.get("msg", "Invalid value"))
    
    logger.warning(
        f"Validation error on {request.method} {request.url.path}",
        extra={
            "correlation_id": correlation_id,
            "field_errors": field_errors,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return create_error_response(
        error_code="VALIDATION_ERROR",
        message="Request validation failed",
        status_code=status.HTTP_400_BAD_REQUEST,
        details={"field_errors": field_errors},
        recovery_suggestions=[
            "Check the format of your input data",
            "Ensure all required fields are provided",
            "Verify that field values meet the specified constraints"
        ],
        correlation_id=correlation_id,
        debug_info={"errors": exc.errors()} if settings.DEBUG else None
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle HTTPException and StarletteHTTPException
    
    Args:
        request: FastAPI request object
        exc: HTTPException instance
        
    Returns:
        JSONResponse with error information
    """
    correlation_id = get_correlation_id(request)
    
    # Map status codes to error codes
    error_code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        409: "CONFLICT",
        422: "UNPROCESSABLE_ENTITY",
        429: "RATE_LIMIT_EXCEEDED",
        500: "INTERNAL_ERROR",
        502: "BAD_GATEWAY",
        503: "SERVICE_UNAVAILABLE"
    }
    
    error_code = error_code_map.get(exc.status_code, "HTTP_ERROR")
    
    logger.warning(
        f"HTTP {exc.status_code} error on {request.method} {request.url.path}: {exc.detail}",
        extra={
            "correlation_id": correlation_id,
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    # Extract headers if present (useful for rate limit errors)
    headers = getattr(exc, "headers", {})
    details = {}
    if "Retry-After" in headers:
        details["retry_after_seconds"] = int(headers["Retry-After"])
    
    return create_error_response(
        error_code=error_code,
        message=str(exc.detail),
        status_code=exc.status_code,
        details=details,
        correlation_id=correlation_id
    )


async def postgres_exception_handler(request: Request, exc: PostgresError) -> JSONResponse:
    """
    Handle PostgreSQL database exceptions
    
    Args:
        request: FastAPI request object
        exc: PostgresError instance
        
    Returns:
        JSONResponse with error information
    """
    correlation_id = get_correlation_id(request)
    
    # Log the full error for debugging
    logger.error(
        f"PostgreSQL error on {request.method} {request.url.path}",
        exc_info=exc,
        extra={
            "correlation_id": correlation_id,
            "path": request.url.path,
            "method": request.method,
            "pg_code": getattr(exc, "pgcode", None)
        }
    )
    
    # Handle specific PostgreSQL errors
    if isinstance(exc, IntegrityConstraintViolationError):
        # Extract constraint information if available
        constraint_name = getattr(exc, "constraint_name", None)
        details = {"constraint": constraint_name} if constraint_name else {}
        
        return create_error_response(
            error_code="DATABASE_CONSTRAINT_VIOLATION",
            message="The operation violates database constraints",
            status_code=status.HTTP_409_CONFLICT,
            details=details,
            recovery_suggestions=[
                "Check for duplicate values in unique fields",
                "Ensure all referenced records exist",
                "Verify the data meets all database requirements"
            ],
            correlation_id=correlation_id,
            debug_info={"pg_code": getattr(exc, "pgcode", None), "detail": str(exc)} if settings.DEBUG else None
        )
    
    # Generic database error
    return create_error_response(
        error_code="DATABASE_ERROR",
        message="A database error occurred",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        recovery_suggestions=[
            "Please try your request again",
            "If the problem persists, contact support"
        ],
        correlation_id=correlation_id,
        debug_info={"pg_code": getattr(exc, "pgcode", None), "detail": str(exc)} if settings.DEBUG else None
    )


async def pydantic_validation_exception_handler(request: Request, exc: PydanticValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors (usually from response models)
    
    Args:
        request: FastAPI request object
        exc: PydanticValidationError instance
        
    Returns:
        JSONResponse with validation error details
    """
    correlation_id = get_correlation_id(request)
    
    logger.error(
        f"Response validation error on {request.method} {request.url.path}",
        exc_info=exc,
        extra={
            "correlation_id": correlation_id,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return create_error_response(
        error_code="RESPONSE_VALIDATION_ERROR",
        message="Internal data validation error",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        recovery_suggestions=[
            "This is an internal error",
            "Please contact support with the correlation ID"
        ],
        correlation_id=correlation_id,
        debug_info={"errors": exc.errors()} if settings.DEBUG else None
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all unhandled exceptions
    
    Args:
        request: FastAPI request object
        exc: Exception instance
        
    Returns:
        JSONResponse with error information
    """
    correlation_id = get_correlation_id(request)
    
    # Log the full error with traceback
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}",
        exc_info=exc,
        extra={
            "correlation_id": correlation_id,
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__
        }
    )
    
    # Check for common unhandled exceptions
    error_message = "An unexpected error occurred"
    error_code = "INTERNAL_ERROR"
    suggestions = [
        "Please try your request again",
        "If the problem persists, contact support with the correlation ID"
    ]
    
    if isinstance(exc, TimeoutError):
        error_message = "The request timed out"
        error_code = "TIMEOUT_ERROR"
        suggestions = [
            "The operation is taking longer than expected",
            "Please try again with a smaller request",
            "Contact support if the issue persists"
        ]
    elif isinstance(exc, MemoryError):
        error_message = "The server is experiencing high load"
        error_code = "RESOURCE_ERROR"
        suggestions = [
            "Please try your request again in a few moments",
            "Consider breaking up large requests into smaller ones"
        ]
    
    return create_error_response(
        error_code=error_code,
        message=error_message,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        recovery_suggestions=suggestions,
        correlation_id=correlation_id,
        debug_info={
            "exception_type": type(exc).__name__,
            "exception_message": str(exc),
            "traceback": traceback.format_exc()
        } if settings.DEBUG else None
    )


def setup_exception_handlers(app):
    """
    Register all exception handlers with the FastAPI app
    
    Args:
        app: FastAPI application instance
    """
    # Custom FitForge exceptions
    app.add_exception_handler(FitForgeException, fitforge_exception_handler)
    
    # FastAPI/Starlette exceptions
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    
    # Database exceptions
    app.add_exception_handler(PostgresError, postgres_exception_handler)
    
    # Pydantic exceptions
    app.add_exception_handler(PydanticValidationError, pydantic_validation_exception_handler)
    
    # General exception handler (catch-all)
    app.add_exception_handler(Exception, general_exception_handler)
    
    logger.info("✅ Exception handlers registered")