"""
FitForge Core Dependencies
Dependency injection for FastAPI endpoints
"""

import logging
from typing import AsyncGenerator, Optional, Dict, Any
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import redis.asyncio as aioredis
from jose import JWTError, jwt

from .config import get_settings, Settings
from .database import get_database, DatabaseManager
from ..models.schemas import User

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()


async def get_config() -> Settings:
    """Get application configuration"""
    return get_settings()


async def get_redis_client(
    settings: Settings = Depends(get_config)
) -> AsyncGenerator[Optional[aioredis.Redis], None]:
    """Get Redis client for caching"""
    if not settings.cache.redis_url:
        yield None
        return
    
    redis_client = None
    try:
        redis_client = await aioredis.from_url(
            settings.cache.redis_url,
            max_connections=settings.cache.MAX_CONNECTIONS,
            decode_responses=True
        )
        yield redis_client
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        yield None
    finally:
        if redis_client:
            await redis_client.close()


async def verify_feature_flag(flag_name: str):
    """Dependency to check if a feature flag is enabled"""
    async def _verify(settings: Settings = Depends(get_config)):
        if not getattr(settings.features, flag_name, False):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Feature '{flag_name}' is not available"
            )
        return True
    return _verify


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    settings: Settings = Depends(get_config),
    db: DatabaseManager = Depends(get_database)
) -> User:
    """Extract and validate current user from JWT token"""
    token = credentials.credentials
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=["HS256"]
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify token expiration
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(tz=timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    user_data = await db.execute_query(
        """
        SELECT id, email, display_name, height_inches, weight_lbs, age, sex,
               experience_level, primary_goals, available_equipment,
               workout_count, feature_level, created_at, updated_at, last_active_at
        FROM users
        WHERE id = $1
        """,
        user_id,
        fetch_one=True
    )
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User(**user_data)


async def get_optional_current_user(
    request: Request,
    settings: Settings = Depends(get_config),
    db: DatabaseManager = Depends(get_database)
) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    try:
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials=authorization.split(" ")[1]
        )
        return await get_current_user(credentials, settings, db)
    except HTTPException:
        return None


class RateLimiter:
    """Rate limiting dependency"""
    
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
    
    async def __call__(
        self,
        request: Request,
        redis: Optional[aioredis.Redis] = Depends(get_redis_client),
        settings: Settings = Depends(get_config)
    ) -> bool:
        """Check rate limit for request"""
        if not redis:
            # If Redis is not available, allow the request
            return True
        
        # Get client IP
        client_ip = request.client.host
        key = f"rate_limit:{client_ip}"
        
        try:
            # Increment counter
            current = await redis.incr(key)
            
            # Set expiration on first request
            if current == 1:
                await redis.expire(key, 60)  # 1 minute
            
            # Check limit
            limit = settings.RATE_LIMIT_PER_MINUTE or self.requests_per_minute
            if current > limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {limit} requests per minute."
                )
            
            return True
            
        except aioredis.RedisError as e:
            logger.error(f"Redis error during rate limiting: {e}")
            # Allow request if Redis fails
            return True


async def check_ab_test_group(
    test_name: str,
    user: User = Depends(get_current_user),
    settings: Settings = Depends(get_config)
) -> Dict[str, Any]:
    """Check if user is in A/B test group"""
    is_in_test_group = settings.is_feature_enabled_for_user(test_name, user.id)
    
    return {
        "test_name": test_name,
        "user_id": user.id,
        "in_test_group": is_in_test_group,
        "test_percentage": settings.features.AB_TEST_PERCENTAGE
    }


async def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require admin user role"""
    # This is a placeholder - you would implement actual role checking
    # based on your user model
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


class PaginationParams:
    """Common pagination parameters"""
    
    def __init__(
        self,
        skip: int = 0,
        limit: int = 50,
        order_by: str = "created_at",
        order_dir: str = "desc"
    ):
        self.skip = max(0, skip)
        self.limit = max(1, min(limit, 100))  # Max 100 items per page
        self.order_by = order_by
        self.order_dir = order_dir.upper() if order_dir.upper() in ["ASC", "DESC"] else "DESC"
    
    @property
    def offset(self) -> int:
        return self.skip
    
    @property
    def order_clause(self) -> str:
        return f"{self.order_by} {self.order_dir}"


async def get_request_id(request: Request) -> str:
    """Get request correlation ID"""
    return getattr(request.state, "request_id", "unknown")


# Health check dependencies
async def check_database_health(
    db: DatabaseManager = Depends(get_database)
) -> Dict[str, Any]:
    """Check database health status"""
    return await db.health_check()


async def check_redis_health(
    redis: Optional[aioredis.Redis] = Depends(get_redis_client)
) -> Dict[str, Any]:
    """Check Redis health status"""
    if not redis:
        return {"status": "not_configured"}
    
    try:
        await redis.ping()
        info = await redis.info()
        return {
            "status": "healthy",
            "version": info.get("redis_version", "unknown"),
            "connected_clients": info.get("connected_clients", 0)
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


# Export common dependencies
__all__ = [
    "get_config",
    "get_redis_client",
    "get_current_user",
    "get_optional_current_user",
    "verify_feature_flag",
    "RateLimiter",
    "check_ab_test_group",
    "require_admin",
    "PaginationParams",
    "get_request_id",
    "check_database_health",
    "check_redis_health",
]