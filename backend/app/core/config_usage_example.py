"""
FitForge Configuration Usage Examples
Demonstrates how to use the enhanced configuration system
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from .config import get_settings, Settings
from .dependencies import (
    get_config,
    get_current_user,
    verify_feature_flag,
    check_ab_test_group,
    RateLimiter,
    PaginationParams
)
from ..models.schemas import User

# Example router showing configuration usage
router = APIRouter()


@router.get("/config/info")
async def get_config_info(settings: Settings = Depends(get_config)) -> Dict[str, Any]:
    """Get non-sensitive configuration information"""
    return {
        "environment": settings.ENVIRONMENT.value,
        "version": settings.VERSION,
        "debug": settings.DEBUG,
        "features": {
            "ai_recommendations": settings.features.ENABLE_AI_RECOMMENDATIONS,
            "muscle_heatmap": settings.features.ENABLE_MUSCLE_HEATMAP,
            "social": settings.features.ENABLE_SOCIAL_FEATURES,
            "advanced_analytics": settings.features.ENABLE_ADVANCED_ANALYTICS,
        },
        "is_secure": settings.is_secure,
        "database": {
            "host": settings.database.HOST,
            "port": settings.database.PORT,
            "pool_size": settings.database.POOL_MAX_SIZE,
        },
        "cache": {
            "enabled": bool(settings.cache.redis_url),
            "default_ttl": settings.cache.DEFAULT_TTL,
        },
        "monitoring": {
            "metrics_enabled": settings.monitoring.ENABLE_METRICS,
            "tracing_enabled": settings.monitoring.ENABLE_TRACING,
            "sentry_configured": bool(settings.monitoring.SENTRY_DSN),
        }
    }


@router.get("/config/validate")
async def validate_config(settings: Settings = Depends(get_config)) -> Dict[str, Any]:
    """Validate configuration for current environment"""
    issues = settings.validate_production_settings()
    
    return {
        "environment": settings.ENVIRONMENT.value,
        "is_valid": len(issues) == 0,
        "issues": issues,
        "is_secure": settings.is_secure,
    }


# Example: Using feature flags
@router.get(
    "/ai-recommendations",
    dependencies=[Depends(verify_feature_flag("ENABLE_AI_RECOMMENDATIONS"))]
)
async def get_ai_recommendations(
    current_user: User = Depends(get_current_user),
    settings: Settings = Depends(get_config)
) -> Dict[str, Any]:
    """Get AI workout recommendations (only if feature is enabled)"""
    return {
        "user_id": current_user.id,
        "recommendations": ["Example recommendation 1", "Example recommendation 2"],
        "model": "gpt-4" if settings.OPENAI_API_KEY else "rule-based"
    }


# Example: A/B testing
@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    ab_test: Dict[str, Any] = Depends(check_ab_test_group("new_dashboard")),
    settings: Settings = Depends(get_config)
) -> Dict[str, Any]:
    """Get dashboard data with A/B testing"""
    
    if ab_test["in_test_group"]:
        # New dashboard for test group
        return {
            "version": "v2",
            "user_id": current_user.id,
            "layout": "modern",
            "features": ["real-time-updates", "advanced-charts"],
            "test_group": True
        }
    else:
        # Classic dashboard for control group
        return {
            "version": "v1",
            "user_id": current_user.id,
            "layout": "classic",
            "features": ["basic-charts"],
            "test_group": False
        }


# Example: Rate limiting
@router.get("/analytics/detailed", dependencies=[Depends(RateLimiter(30))])
async def get_detailed_analytics(
    current_user: User = Depends(get_current_user),
    pagination: PaginationParams = Depends(),
    settings: Settings = Depends(get_config)
) -> Dict[str, Any]:
    """Get detailed analytics with custom rate limiting"""
    
    # Check if advanced analytics is enabled
    if not settings.features.ENABLE_ADVANCED_ANALYTICS:
        raise HTTPException(
            status_code=403,
            detail="Advanced analytics is not enabled"
        )
    
    return {
        "user_id": current_user.id,
        "data": f"Analytics data with offset={pagination.offset}, limit={pagination.limit}",
        "order": pagination.order_clause,
        "cache_ttl": settings.cache.ANALYTICS_CACHE_TTL
    }


# Example: Environment-specific behavior
@router.get("/debug-info")
async def get_debug_info(
    current_user: User = Depends(get_current_user),
    settings: Settings = Depends(get_config)
) -> Dict[str, Any]:
    """Get debug information (only in development)"""
    
    if not settings.is_development:
        raise HTTPException(
            status_code=404,
            detail="Debug endpoint not available in production"
        )
    
    return {
        "user": current_user.dict(),
        "environment": settings.ENVIRONMENT.value,
        "database_url": settings.DATABASE_URL[:30] + "...",  # Truncated for security
        "log_level": settings.LOG_LEVEL.value,
        "features": {
            flag: getattr(settings.features, flag)
            for flag in dir(settings.features)
            if not flag.startswith("_") and flag.isupper()
        }
    }


# Example: Using nested configuration
@router.get("/cache-status")
async def get_cache_status(settings: Settings = Depends(get_config)) -> Dict[str, Any]:
    """Get cache configuration status"""
    
    cache_config = settings.cache
    
    return {
        "enabled": bool(cache_config.redis_url),
        "host": cache_config.REDIS_HOST,
        "port": cache_config.REDIS_PORT,
        "db": cache_config.REDIS_DB,
        "ttl_settings": {
            "default": cache_config.DEFAULT_TTL,
            "user_session": cache_config.USER_SESSION_TTL,
            "workout_cache": cache_config.WORKOUT_CACHE_TTL,
            "analytics_cache": cache_config.ANALYTICS_CACHE_TTL,
        },
        "max_connections": cache_config.MAX_CONNECTIONS,
    }


# Example: Dynamic feature checking
@router.post("/experimental/{feature_name}")
async def use_experimental_feature(
    feature_name: str,
    current_user: User = Depends(get_current_user),
    settings: Settings = Depends(get_config)
) -> Dict[str, Any]:
    """Use an experimental feature if enabled"""
    
    # Map feature names to flags
    feature_map = {
        "voice-logging": "ENABLE_VOICE_LOGGING",
        "ar-exercises": "ENABLE_AR_EXERCISES",
        "nutrition": "ENABLE_NUTRITION_TRACKING",
    }
    
    flag_name = feature_map.get(feature_name)
    if not flag_name:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown feature: {feature_name}"
        )
    
    if not settings.get_feature_flag(flag_name):
        raise HTTPException(
            status_code=403,
            detail=f"Feature '{feature_name}' is not enabled"
        )
    
    return {
        "feature": feature_name,
        "user_id": current_user.id,
        "status": "Feature accessed successfully",
        "beta": True
    }


# Example: Production safety checks
@router.post("/admin/dangerous-operation")
async def dangerous_operation(
    current_user: User = Depends(get_current_user),
    settings: Settings = Depends(get_config)
) -> Dict[str, Any]:
    """Perform a dangerous operation with safety checks"""
    
    # Multiple safety checks
    if settings.is_production and settings.DEBUG:
        raise HTTPException(
            status_code=500,
            detail="Debug mode should not be enabled in production!"
        )
    
    if settings.is_production and not settings.is_secure:
        raise HTTPException(
            status_code=403,
            detail="Security requirements not met for production operation"
        )
    
    # Simulate operation
    return {
        "status": "Operation completed",
        "environment": settings.ENVIRONMENT.value,
        "secure": settings.is_secure,
        "timestamp": "2024-12-21T12:00:00Z"
    }