"""
Error Handling Middleware
Centralized error handling and logging for the application
Now integrated with the new error handling system - primarily handles correlation IDs
"""

import logging
import traceback
from typing import Callable
from uuid import uuid4

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("fitforge.middleware.error_handling")


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle correlation IDs and integrate with global error handlers
    Most error handling is now done by the global exception handlers
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request with correlation ID tracking
        
        Args:
            request: FastAPI request object
            call_next: Next middleware or endpoint
            
        Returns:
            Response object
        """
        # Generate or extract correlation ID
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid4()))
        request.state.correlation_id = correlation_id
        
        # Add correlation ID to all log records for this request
        import contextvars
        correlation_context = contextvars.ContextVar('correlation_id', default=None)
        correlation_context.set(correlation_id)
        
        try:
            response = await call_next(request)
            # Add correlation ID to response headers
            response.headers["X-Correlation-ID"] = correlation_id
            return response
            
        except Exception as exc:
            # Let the global exception handlers deal with it
            # Just log that we're passing it through
            logger.debug(f"Exception caught in middleware, passing to global handlers", 
                        extra={"correlation_id": correlation_id})
            raise
    
