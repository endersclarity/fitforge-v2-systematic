"""
Request Logging Middleware
Logs all HTTP requests with timing and response information
"""

import time
import logging
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import log_request

logger = logging.getLogger("fitforge.middleware.request_logging")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all HTTP requests with timing information
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and log information
        
        Args:
            request: FastAPI request object
            call_next: Next middleware or endpoint
            
        Returns:
            Response object
        """
        start_time = time.time()
        
        # Extract request information
        method = request.method
        url = str(request.url)
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Log request start (debug level)
        logger.debug(f"[{client_ip}] {method} {url} - Started")
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log request completion
            log_request(method, url, response.status_code, duration_ms)
            
            # Add custom headers
            response.headers["X-Process-Time"] = str(duration_ms)
            
            return response
            
        except Exception as exc:
            # Calculate duration for failed requests
            duration_ms = (time.time() - start_time) * 1000
            
            # Log request failure
            logger.error(f"[{client_ip}] {method} {url} - FAILED - {duration_ms:.2f}ms - {exc}")
            
            # Re-raise the exception
            raise exc