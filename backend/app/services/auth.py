"""
FitForge Authentication Service
Supabase Auth integration with JWT token management
Created: December 21, 2024

CRITICAL: Follows schema-first development with verified user table structure
All database operations use parameterized queries for security
"""

import logging
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from supabase import Client
import asyncpg

from ..core.config import get_settings
from ..core.database import DatabaseManager

settings = get_settings()
logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """
    Authentication service for Supabase integration
    Handles user authentication, JWT tokens, and session management
    """
    
    def __init__(self, supabase_client: Client, db: DatabaseManager):
        self.supabase = supabase_client
        self.db = db
        self.secret_key = settings.SECRET_KEY
        self.algorithm = "HS256"
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate user with Supabase Auth
        
        SECURITY: Uses Supabase's built-in authentication
        SCHEMA: Returns user data matching verified users table structure
        """
        logger.info(f"🔥 authenticate_user ENTRY - email: {email}")
        
        try:
            # Authenticate with Supabase
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not auth_response.user:
                logger.warning(f"🚨 Authentication failed for email: {email}")
                return None
            
            # Get user profile from our users table using verified schema
            user_profile = await self.get_user_profile(auth_response.user.id)
            
            if not user_profile:
                logger.warning(f"🚨 User profile not found for authenticated user: {auth_response.user.id}")
                return None
            
            logger.info(f"🔧 Authentication successful for user: {auth_response.user.id}")
            
            return {
                "supabase_user": auth_response.user,
                "profile": user_profile,
                "session": auth_response.session
            }
            
        except Exception as e:
            logger.error(f"🚨 authenticate_user ERROR: {str(e)}")
            return None
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile from database using verified schema
        
        SECURITY: Uses parameterized query for SQL injection prevention
        SCHEMA: Uses only verified columns from users table
        """
        logger.info(f"🔥 get_user_profile ENTRY - user_id: {user_id}")
        
        try:
            # Parameterized query using verified users table columns
            query = """
            SELECT 
                id, email, display_name, height_inches, weight_lbs, age, sex,
                experience_level, primary_goals, available_equipment,
                workout_count, feature_level, created_at, updated_at, last_active_at
            FROM users 
            WHERE id = $1
            """
            
            params = [user_id]
            
            logger.info(f"🔧 USER_PROFILE_QUERY: {query[:50]}... with params: {params}")
            
            result = await self.db.execute_query(query, *params, fetch_one=True)
            
            if result:
                logger.info(f"🔧 User profile retrieved successfully for: {user_id}")
                return result
            else:
                logger.warning(f"🚨 User profile not found for: {user_id}")
                return None
                
        except Exception as e:
            logger.error(f"🚨 get_user_profile ERROR: {str(e)}")
            return None
    
    async def create_user_profile(
        self, 
        user_id: str, 
        email: str, 
        display_name: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Create user profile in database after Supabase Auth signup
        
        SECURITY: Uses parameterized INSERT with verified schema columns
        SCHEMA: Uses only verified columns from users table
        """
        logger.info(f"🔥 create_user_profile ENTRY - user_id: {user_id}, email: {email}")
        
        try:
            # Parameterized INSERT using verified users table columns
            insert_query = """
            INSERT INTO users (
                id, email, display_name, created_at, updated_at, last_active_at
            ) VALUES (
                $1, $2, $3, NOW(), NOW(), NOW()
            ) RETURNING *
            """
            
            params = [user_id, email, display_name]
            
            logger.info(f"🔧 CREATE_PROFILE_QUERY: {insert_query[:50]}... with {len(params)} params")
            
            result = await self.db.execute_query(insert_query, *params, fetch_one=True)
            
            if result:
                logger.info(f"🔧 User profile created successfully for: {user_id}")
                return result
            else:
                logger.error(f"🚨 Failed to create user profile for: {user_id}")
                return None
                
        except asyncpg.exceptions.UniqueViolationError:
            logger.warning(f"🚨 User profile already exists for: {user_id}")
            # Return existing profile
            return await self.get_user_profile(user_id)
        except Exception as e:
            logger.error(f"🚨 create_user_profile ERROR: {str(e)}")
            return None
    
    async def update_last_active(self, user_id: str) -> bool:
        """
        Update user's last active timestamp
        
        SECURITY: Uses parameterized UPDATE
        SCHEMA: Uses verified last_active_at column
        """
        try:
            query = "UPDATE users SET last_active_at = NOW() WHERE id = $1"
            params = [user_id]
            
            await self.db.execute_query(query, *params)
            return True
            
        except Exception as e:
            logger.error(f"🚨 update_last_active ERROR: {str(e)}")
            return False
    
    def create_access_token(self, data: Dict[str, Any]) -> str:
        """
        Create JWT access token
        
        SECURITY: Uses configured secret key and expiration
        """
        logger.info("🔥 create_access_token ENTRY")
        
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        
        logger.info("🔧 Access token created successfully")
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode JWT token
        
        SECURITY: Validates token signature and expiration
        """
        logger.info("🔥 verify_token ENTRY")
        
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            user_id: str = payload.get("sub")
            
            if user_id is None:
                logger.warning("🚨 Token verification failed: no user ID in payload")
                return None
            
            logger.info(f"🔧 Token verified successfully for user: {user_id}")
            return payload
            
        except JWTError as e:
            logger.warning(f"🚨 Token verification failed: {str(e)}")
            return None
    
    async def refresh_supabase_session(self, refresh_token: str) -> Optional[Dict[str, Any]]:
        """
        Refresh Supabase session using refresh token
        
        SECURITY: Uses Supabase's built-in token refresh mechanism
        """
        logger.info("🔥 refresh_supabase_session ENTRY")
        
        try:
            auth_response = self.supabase.auth.refresh_session(refresh_token)
            
            if not auth_response.session:
                logger.warning("🚨 Session refresh failed")
                return None
            
            logger.info("🔧 Session refreshed successfully")
            return {
                "session": auth_response.session,
                "user": auth_response.user
            }
            
        except Exception as e:
            logger.error(f"🚨 refresh_supabase_session ERROR: {str(e)}")
            return None
    
    async def sign_out_user(self, access_token: str) -> bool:
        """
        Sign out user from Supabase
        
        SECURITY: Invalidates Supabase session
        """
        logger.info("🔥 sign_out_user ENTRY")
        
        try:
            # Set the session for the logout request
            self.supabase.auth.set_session(access_token, "")
            
            # Sign out from Supabase
            self.supabase.auth.sign_out()
            
            logger.info("🔧 User signed out successfully")
            return True
            
        except Exception as e:
            logger.error(f"🚨 sign_out_user ERROR: {str(e)}")
            return False


# Utility functions for password handling
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password for storage"""
    return pwd_context.hash(password)


# ============================================================================
# SECURITY & VALIDATION SUMMARY  
# ============================================================================

"""
SECURITY MEASURES IMPLEMENTED:

1. Supabase Integration Security:
   - Uses Supabase's built-in authentication system
   - Proper session management with refresh tokens
   - Secure sign-out with session invalidation

2. Database Security:
   - All queries use parameterized statements ($1, $2, etc.)
   - Uses only verified users table columns
   - Handles unique constraint violations gracefully

3. JWT Token Security:
   - Configurable secret key and expiration times
   - Proper token verification with signature validation
   - Handles JWT errors gracefully

4. Password Security:
   - Uses bcrypt for password hashing
   - Secure password verification utilities

5. Evidence-First Debugging:
   - Comprehensive logging at all entry points
   - Query logging with parameter counts
   - Error logging with context preservation

This auth service follows the same security patterns established in
exercises.py and workouts.py implementations.
"""