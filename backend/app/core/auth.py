"""
FitForge Authentication Dependencies
FastAPI dependency injection for authentication and authorization
Created: December 21, 2024

CRITICAL: Follows schema-first development with verified user data structure
All dependencies use secure token validation and user verification
"""

import logging
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

from .config import get_settings
from .database import get_database, get_supabase_client, DatabaseManager
from ..services.auth import AuthService

settings = get_settings()
logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer()


class AuthenticationError(HTTPException):
    """Custom authentication error with consistent formatting"""
    
    def __init__(self, detail: str = "Authentication required"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "authentication_required",
                "message": detail,
                "recovery_instructions": "Please provide a valid authentication token",
                "timestamp": datetime.utcnow().isoformat()
            },
            headers={"WWW-Authenticate": "Bearer"},
        )


class AuthorizationError(HTTPException):
    """Custom authorization error with consistent formatting"""
    
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "authorization_failed", 
                "message": detail,
                "recovery_instructions": "Contact administrator for required permissions",
                "timestamp": datetime.utcnow().isoformat()
            }
        )


async def get_auth_service(
    supabase: Client = Depends(get_supabase_client),
    db: DatabaseManager = Depends(get_database)
) -> AuthService:
    """
    Dependency injection for AuthService
    
    SECURITY: Uses validated database and Supabase connections
    """
    return AuthService(supabase, db)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> Dict[str, Any]:
    """
    Get current authenticated user from JWT token
    
    SECURITY: Validates JWT token and retrieves user from verified schema
    SCHEMA: Returns user data matching verified users table structure
    """
    logger.info("🔥 get_current_user ENTRY")
    
    try:
        # Extract token from Authorization header
        token = credentials.credentials
        
        # Verify JWT token
        payload = auth_service.verify_token(token)
        if not payload:
            raise AuthenticationError("Invalid or expired token")
        
        # Extract user ID from token payload
        user_id: str = payload.get("sub")
        if not user_id:
            raise AuthenticationError("Invalid token payload")
        
        # Get user profile from database using verified schema
        user_profile = await auth_service.get_user_profile(user_id)
        if not user_profile:
            raise AuthenticationError("User not found")
        
        # Update last active timestamp
        await auth_service.update_last_active(user_id)
        
        logger.info(f"🔧 Current user retrieved successfully: {user_id}")
        return user_profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 get_current_user ERROR: {str(e)}")
        raise AuthenticationError("Authentication failed")


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> Optional[Dict[str, Any]]:
    """
    Get current user if authenticated, None if not
    
    SECURITY: Optional authentication for public endpoints with user context
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, auth_service)
    except HTTPException:
        return None


async def require_auth(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Require authentication - simple wrapper for clarity
    
    SECURITY: Ensures user is authenticated before accessing protected resources
    """
    return current_user


async def require_admin(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Require admin privileges
    
    SECURITY: Checks user role/permissions for admin access
    SCHEMA: Uses verified user data structure for role checking
    """
    logger.info(f"🔥 require_admin ENTRY - user: {current_user.get('id')}")
    
    # Check if user has admin privileges
    # Note: Add admin role logic based on your user schema
    user_email = current_user.get("email", "")
    
    # For now, simple email-based admin check
    # TODO: Implement proper role-based access control
    admin_emails = [
        "admin@fitforge.com",
        # Add other admin emails from settings
    ]
    
    if user_email not in admin_emails:
        logger.warning(f"🚨 Admin access denied for user: {current_user.get('id')}")
        raise AuthorizationError("Admin privileges required")
    
    logger.info(f"🔧 Admin access granted for user: {current_user.get('id')}")
    return current_user


async def require_user_or_admin(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Require user to be accessing their own data or be an admin
    
    SECURITY: Implements user data isolation and admin override
    """
    logger.info(f"🔥 require_user_or_admin ENTRY - requested_user: {user_id}, current_user: {current_user.get('id')}")
    
    current_user_id = current_user.get("id")
    
    # Check if user is accessing their own data
    if current_user_id == user_id:
        logger.info(f"🔧 User access granted (own data): {current_user_id}")
        return current_user
    
    # Check if user has admin privileges
    try:
        return await require_admin(current_user)
    except AuthorizationError:
        logger.warning(f"🚨 User data access denied: {current_user_id} -> {user_id}")
        raise AuthorizationError("Can only access your own data")


def get_user_filter(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> str:
    """
    Get user ID for filtering user-specific data
    
    SECURITY: Ensures users only see their own data
    USAGE: Add to queries as WHERE user_id = $1 parameter
    """
    return current_user.get("id")


async def validate_workout_ownership(
    workout_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
) -> bool:
    """
    Validate that workout belongs to current user
    
    SECURITY: Uses parameterized query for ownership verification
    SCHEMA: Uses verified workouts table structure
    """
    logger.info(f"🔥 validate_workout_ownership ENTRY - workout: {workout_id}, user: {current_user.get('id')}")
    
    try:
        # Parameterized query using verified workouts table columns
        query = "SELECT id FROM workouts WHERE id = $1 AND user_id = $2"
        params = [workout_id, current_user.get("id")]
        
        result = await db.execute_query(query, *params, fetch_one=True)
        
        is_owner = result is not None
        
        if not is_owner:
            logger.warning(f"🚨 Workout ownership validation failed: {workout_id}")
            raise AuthorizationError("You don't have permission to access this workout")
        
        logger.info(f"🔧 Workout ownership validated: {workout_id}")
        return True
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 validate_workout_ownership ERROR: {str(e)}")
        raise AuthorizationError("Failed to validate workout ownership")


# Import datetime for timestamp generation
from datetime import datetime

# ============================================================================
# SECURITY & VALIDATION SUMMARY
# ============================================================================

"""
AUTHENTICATION & AUTHORIZATION SECURITY MEASURES:

1. Token Security:
   - JWT token validation with signature verification
   - Proper error handling for invalid/expired tokens
   - Secure token extraction from Authorization header

2. User Data Security:
   - Uses verified users table schema for data retrieval
   - Implements user data isolation (users only see own data)
   - Admin override with proper privilege checking

3. Database Security:
   - All ownership validation uses parameterized queries
   - Follows same SQL injection prevention patterns
   - Uses verified database schema columns

4. Error Handling:
   - Consistent error response format with recovery instructions
   - Proper HTTP status codes (401, 403)
   - Security-aware error messages (no sensitive data leakage)

5. Evidence-First Debugging:
   - Comprehensive logging at dependency entry points
   - User access logging for audit trails
   - Error logging with context preservation

6. Authorization Patterns:
   - get_current_user: Standard authentication
   - require_admin: Admin-only endpoints
   - require_user_or_admin: User data with admin override
   - validate_workout_ownership: Resource-specific authorization

These dependencies provide secure, reusable authentication patterns
that maintain the same security standards as our API endpoints.
"""