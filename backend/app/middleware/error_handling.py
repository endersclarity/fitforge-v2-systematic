"""
Error Handling Middleware
Centralized error handling and logging for the application
"""

import logging
import traceback
from typing import Callable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("fitforge.middleware.error_handling")


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle and log all unhandled exceptions
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request with error handling
        
        Args:
            request: FastAPI request object
            call_next: Next middleware or endpoint
            
        Returns:
            Response object or error response
        """
        try:
            response = await call_next(request)
            return response
            
        except Exception as exc:
            return await self._handle_exception(request, exc)
    
    async def _handle_exception(self, request: Request, exc: Exception) -> JSONResponse:
        """
        Handle and log exceptions
        
        Args:
            request: FastAPI request object
            exc: Exception that occurred
            
        Returns:
            JSON error response
        """
        # Extract request information
        method = request.method
        url = str(request.url)
        client_ip = request.client.host if request.client else "unknown"
        
        # Log the error with full traceback
        logger.error(
            f"Unhandled exception in {method} {url} from {client_ip}: {exc}",
            exc_info=True,
            extra={
                "method": method,
                "url": url,
                "client_ip": client_ip,
                "exception_type": type(exc).__name__,
                "exception_message": str(exc)
            }
        )
        
        # Determine response based on exception type
        if isinstance(exc, ValueError):
            status_code = status.HTTP_400_BAD_REQUEST
            error_type = "validation_error"
            message = str(exc)
        elif isinstance(exc, PermissionError):
            status_code = status.HTTP_403_FORBIDDEN
            error_type = "permission_error"
            message = "Access denied"
        elif isinstance(exc, FileNotFoundError):
            status_code = status.HTTP_404_NOT_FOUND
            error_type = "not_found_error"
            message = "Resource not found"
        elif isinstance(exc, TimeoutError):
            status_code = status.HTTP_408_REQUEST_TIMEOUT
            error_type = "timeout_error"
            message = "Request timeout"
        else:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            error_type = "internal_error"
            message = "An unexpected error occurred"
        
        # Prepare error response
        error_response = {
            "error": {
                "type": error_type,
                "message": message,
                "request_id": getattr(request.state, "request_id", None)
            }
        }
        
        # Add debug information in development
        from app.core.config import get_settings
        settings = get_settings()
        
        if settings.DEBUG:
            error_response["error"]["debug"] = {
                "exception_type": type(exc).__name__,
                "exception_message": str(exc),
                "traceback": traceback.format_exc()
            }
        
        return JSONResponse(
            status_code=status_code,
            content=error_response
        )