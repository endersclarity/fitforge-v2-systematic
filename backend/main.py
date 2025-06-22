"""
FitForge FastAPI Backend Application
Production-ready FastAPI server with CORS, middleware, and error handling

Run with: uvicorn main:app --reload
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.utils import get_openapi
from starlette.exceptions import HTTPException as StarletteHTTPException

# Add the schemas directory to the Python path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "schemas"))

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.core.error_handlers import setup_exception_handlers
from app.middleware.request_logging import RequestLoggingMiddleware
from app.middleware.error_handling import ErrorHandlingMiddleware
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.exercises import router as exercises_router
from app.api.workouts import router as workouts_router
from app.api.workout_sets import router as workout_sets_router
from app.api.analytics import router as analytics_router


# Initialize settings
settings = get_settings()

# Set up logging
setup_logging(settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan management
    Handles startup and shutdown events
    """
    # Startup
    logger.info("🚀 FitForge Backend starting up...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"Database URL: {settings.DATABASE_URL[:50]}...")  # Truncate for security
    
    # Initialize database connections
    from app.core.database import db_manager
    await db_manager.initialize()
    logger.info("✅ Database connections initialized")
    
    yield
    
    # Shutdown
    logger.info("🛑 FitForge Backend shutting down...")
    # Clean up database connections
    await db_manager.close()
    logger.info("🔌 Database connections closed")


# Define OpenAPI tags metadata
tags_metadata = [
    {
        "name": "health",
        "description": "Health check and system status endpoints. Monitor API availability and service health.",
    },
    {
        "name": "authentication", 
        "description": "Authentication operations. Handle user login, registration, token management, and password reset.",
    },
    {
        "name": "users",
        "description": "User profile management. Create, read, update user information and preferences.",
    },
    {
        "name": "exercises",
        "description": "Exercise library operations. Access 38+ exercises with **muscle engagement percentages**, equipment requirements, and instructions.",
        "externalDocs": {
            "description": "Exercise science reference",
            "url": "https://www.acefitness.org/resources/everyone/exercise-library/",
        },
    },
    {
        "name": "workouts",
        "description": "Workout session management. Track workout sessions with **A/B variation** support and automatic volume calculations.",
    },
    {
        "name": "workout-sets", 
        "description": "Individual set tracking within workouts. Record weight, reps, and RPE for progressive overload analysis.",
    },
    {
        "name": "analytics",
        "description": "Advanced analytics and insights. Get **muscle fatigue calculations**, progressive overload recommendations, and performance trends.",
        "externalDocs": {
            "description": "Progressive overload methodology",
            "url": "https://www.strongerbyscience.com/progressive-overload/",
        },
    },
    {
        "name": "muscle-states",
        "description": "Real-time muscle fatigue tracking. Monitor recovery status and fatigue levels using our **5-day recovery model**.",
    },
    {
        "name": "system",
        "description": "System endpoints for API information, health checks, and operational status.",
    },
]

# API description with markdown
description = """
# FitForge API - Advanced Fitness Tracking Platform 🏋️

FitForge is a sophisticated personal workout tracker combining cutting-edge sports science with modern software architecture.

## 🚀 Key Features

### Muscle Fatigue Analytics
- **5-day recovery model** based on exercise science research
- Real-time muscle group fatigue calculations
- Visual heat map representation of muscle states

### Progressive Overload Targeting  
- Automatic **3% volume increase** recommendations
- Smart weight/rep adjustments based on performance
- Historical progression tracking

### Exercise Intelligence
- **38+ exercises** with detailed muscle engagement data
- Primary, secondary, and stabilizer muscle percentages
- Equipment requirements and form instructions

### Workout Management
- **A/B workout variations** for periodization
- Automatic volume and intensity calculations  
- Rest timer integration
- Session notes and RPE tracking

## 📊 Technical Highlights

- **FastAPI** backend with async/await support
- **Pydantic V2** models with strict validation
- **PostgreSQL** database with advanced constraints
- **Row Level Security** for data isolation
- Comprehensive error handling with correlation IDs
- OpenTelemetry-ready for observability

## 🔒 Security

- JWT-based authentication
- Rate limiting per user
- SQL injection prevention
- CORS configuration
- Input validation at all layers

## 📈 Performance

- Sub-500ms API response times
- Database query optimization with indexes
- Connection pooling
- Async request handling
- Redis caching ready
"""

# Create FastAPI application with enhanced metadata
app = FastAPI(
    title="FitForge API",
    summary="Advanced fitness tracking with muscle fatigue analytics and progressive overload intelligence",
    description=description,
    version="1.0.0",
    terms_of_service="https://fitforge.app/terms",
    contact={
        "name": "FitForge Development Team",
        "url": "https://fitforge.app/support",
        "email": "dev@fitforge.app",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=tags_metadata,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# Trust host middleware (security)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Custom middleware
app.add_middleware(ErrorHandlingMiddleware)  # This now primarily handles correlation IDs
app.add_middleware(RequestLoggingMiddleware)

# Register all exception handlers
setup_exception_handlers(app)


# Root endpoint with enhanced documentation
@app.get(
    "/",
    response_model=Dict[str, Any],
    summary="API Information",
    description="Get basic information about the FitForge API including version, status, and available features.",
    responses={
        200: {
            "description": "API information retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "name": "FitForge API",
                        "version": "1.0.0",
                        "status": "running",
                        "environment": "development",
                        "docs_url": "/docs",
                        "features": {
                            "muscle_fatigue_analytics": True,
                            "progressive_overload_targeting": True,
                            "exercise_library": True,
                            "workout_tracking": True,
                            "real_time_muscle_visualization": True
                        }
                    }
                }
            }
        }
    },
    tags=["system"]
)
async def root():
    """Root endpoint with API information"""
    return {
        "name": "FitForge API",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs" if settings.DEBUG else None,
        "features": {
            "muscle_fatigue_analytics": True,
            "progressive_overload_targeting": True,
            "exercise_library": True,
            "workout_tracking": True,
            "real_time_muscle_visualization": True
        }
    }


# Include routers
app.include_router(health_router, prefix="/api/health", tags=["health"])
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(exercises_router, prefix="/api/exercises", tags=["exercises"])
app.include_router(workouts_router, prefix="/api/workouts", tags=["workouts"])
app.include_router(workout_sets_router, prefix="/api/workout-sets", tags=["workout-sets"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])

# Include test error endpoints in debug mode
if settings.DEBUG:
    from app.api.test_errors import router as test_errors_router
    app.include_router(test_errors_router, prefix="/api/test-errors", tags=["test-errors"])


# Custom OpenAPI schema
def custom_openapi():
    """Generate custom OpenAPI schema with enhancements"""
    if app.openapi_schema:
        return app.openapi_schema
        
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        summary=app.summary,
        routes=app.routes,
        tags=tags_metadata,
        terms_of_service=app.terms_of_service,
        contact=app.contact,
        license_info=app.license_info,
    )
    
    # Add custom x-logo for ReDoc
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fitforge.app/logo.png",
        "altText": "FitForge Logo"
    }
    
    # Add custom server descriptions
    openapi_schema["servers"] = [
        {
            "url": "/api/v1",
            "description": "Current version"
        },
        {
            "url": "https://api.fitforge.app",
            "description": "Production environment"
        },
        {
            "url": "https://staging-api.fitforge.app",
            "description": "Staging environment"
        }
    ]
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT token obtained from /api/auth/login endpoint"
        }
    }
    
    # Add global security requirement
    openapi_schema["security"] = [{"bearerAuth": []}]
    
    # Cache the schema
    app.openapi_schema = openapi_schema
    return app.openapi_schema


# Override the default OpenAPI function
app.openapi = custom_openapi


if __name__ == "__main__":
    import uvicorn
    
    # Run with uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=settings.DEBUG
    )