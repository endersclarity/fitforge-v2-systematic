"""
FitForge Backend Logging Configuration
Production-ready logging setup with structured output
"""

import logging
import logging.config
import sys
from typing import Dict, Any


def setup_logging(log_level: str = "INFO") -> None:
    """
    Set up application logging with structured configuration
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    
    # Logging configuration dictionary
    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "detailed": {
                "format": "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d - %(funcName)s(): %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "json": {
                "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "format": "%(asctime)s %(name)s %(levelname)s %(message)s %(pathname)s %(lineno)d"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": log_level,
                "formatter": "standard",
                "stream": sys.stdout
            },
            "console_detailed": {
                "class": "logging.StreamHandler",
                "level": "DEBUG",
                "formatter": "detailed",
                "stream": sys.stdout
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": log_level,
                "formatter": "detailed",
                "filename": "logs/fitforge.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8"
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "detailed",
                "filename": "logs/fitforge_errors.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8"
            }
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["console"],
                "level": log_level,
                "propagate": False
            },
            "fitforge": {  # Application logger
                "handlers": ["console", "file"],
                "level": log_level,
                "propagate": False
            },
            "fitforge.errors": {  # Error logger
                "handlers": ["console", "error_file"],
                "level": "ERROR",
                "propagate": False
            },
            "uvicorn": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False
            },
            "uvicorn.error": {
                "handlers": ["console", "error_file"],
                "level": "INFO",
                "propagate": False
            },
            "uvicorn.access": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False
            },
            "sqlalchemy": {
                "handlers": ["console"],
                "level": "WARNING",
                "propagate": False
            },
            "sqlalchemy.engine": {
                "handlers": ["console"],
                "level": "INFO" if log_level == "DEBUG" else "WARNING",
                "propagate": False
            }
        }
    }
    
    # Create logs directory if it doesn't exist
    import os
    os.makedirs("logs", exist_ok=True)
    
    # Apply logging configuration
    logging.config.dictConfig(logging_config)
    
    # Log the setup completion
    logger = logging.getLogger("fitforge")
    logger.info(f"Logging initialized with level: {log_level}")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for the given name
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        Logger instance
    """
    return logging.getLogger(f"fitforge.{name}")


def log_request(method: str, url: str, status_code: int, duration_ms: float) -> None:
    """
    Log HTTP request information
    
    Args:
        method: HTTP method
        url: Request URL
        status_code: HTTP status code
        duration_ms: Request duration in milliseconds
    """
    logger = get_logger("requests")
    
    if status_code >= 500:
        logger.error(f"{method} {url} - {status_code} - {duration_ms:.2f}ms")
    elif status_code >= 400:
        logger.warning(f"{method} {url} - {status_code} - {duration_ms:.2f}ms")
    else:
        logger.info(f"{method} {url} - {status_code} - {duration_ms:.2f}ms")


def log_database_operation(operation: str, table: str, duration_ms: float, affected_rows: int = 0) -> None:
    """
    Log database operation information
    
    Args:
        operation: Database operation (SELECT, INSERT, UPDATE, DELETE)
        table: Table name
        duration_ms: Operation duration in milliseconds
        affected_rows: Number of affected rows
    """
    logger = get_logger("database")
    logger.info(f"DB {operation} {table} - {duration_ms:.2f}ms - {affected_rows} rows")


def log_analytics_calculation(calculation_type: str, user_id: str, duration_ms: float) -> None:
    """
    Log analytics calculation information
    
    Args:
        calculation_type: Type of calculation (fatigue, progression, etc.)
        user_id: User ID
        duration_ms: Calculation duration in milliseconds
    """
    logger = get_logger("analytics")
    logger.info(f"Analytics {calculation_type} for user {user_id} - {duration_ms:.2f}ms")