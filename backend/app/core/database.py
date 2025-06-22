"""
FitForge Database Connection and Supabase Integration
Created: December 21, 2024
Purpose: Database connectivity using Supabase with async operations

CRITICAL: Uses exact database schema from schemas/database-schema.sql
All database operations must match the validated schema structure
"""

import asyncio
import logging
from typing import AsyncGenerator, Optional, Dict, Any
from contextlib import asynccontextmanager

import asyncpg
from supabase import create_client, Client
from fastapi import HTTPException

from .config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class DatabaseManager:
    """
    Database connection manager for Supabase PostgreSQL
    Handles both direct asyncpg connections and Supabase client operations
    """
    
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        self.supabase: Optional[Client] = None
        self._initialized = False
    
    async def initialize(self) -> None:
        """Initialize database connections"""
        if self._initialized:
            return
        
        try:
            # Initialize Supabase client
            if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
                self.supabase = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )
                logger.info("✅ Supabase client initialized")
            
            # Initialize direct PostgreSQL connection pool
            # Use nested database settings if DATABASE_URL not provided
            db_url = settings.DATABASE_URL
            if not db_url or db_url == "postgresql://postgres:password@localhost:5432/fitforge":
                # Use component-based configuration
                db_url = settings.database.connection_url
                
            self.pool = await asyncpg.create_pool(
                db_url,
                min_size=settings.database.POOL_MIN_SIZE,
                max_size=settings.database.POOL_MAX_SIZE,
                command_timeout=settings.database.COMMAND_TIMEOUT,
                server_settings={
                    'application_name': 'FitForge_Backend',
                    'timezone': 'UTC'
                }
            )
            logger.info("✅ PostgreSQL connection pool initialized")
            
            self._initialized = True
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Database connection failed: {str(e)}"
            )
    
    async def close(self) -> None:
        """Close database connections"""
        if self.pool:
            await self.pool.close()
            logger.info("🔌 PostgreSQL connection pool closed")
        
        self._initialized = False
    
    @asynccontextmanager
    async def get_connection(self) -> AsyncGenerator[asyncpg.Connection, None]:
        """Get a database connection from the pool"""
        if not self.pool:
            raise HTTPException(
                status_code=500,
                detail="Database pool not initialized"
            )
        
        async with self.pool.acquire() as connection:
            try:
                yield connection
            except Exception as e:
                # Log the error but let it propagate
                logger.error(f"Database operation failed: {e}")
                raise
    
    async def execute_query(
        self,
        query: str,
        *args,
        fetch: bool = False,
        fetch_one: bool = False
    ) -> Optional[Any]:
        """
        Execute a database query with error handling
        
        Args:
            query: SQL query string
            *args: Query parameters
            fetch: Return all results
            fetch_one: Return single result
            
        Returns:
            Query results or None
        """
        async with self.get_connection() as conn:
            try:
                if fetch_one:
                    result = await conn.fetchrow(query, *args)
                    return dict(result) if result else None
                elif fetch:
                    results = await conn.fetch(query, *args)
                    return [dict(row) for row in results]
                else:
                    return await conn.execute(query, *args)
                    
            except asyncpg.exceptions.UniqueViolationError as e:
                logger.warning(f"Unique constraint violation: {e}")
                raise HTTPException(
                    status_code=409,
                    detail="Resource already exists"
                )
            except asyncpg.exceptions.ForeignKeyViolationError as e:
                logger.warning(f"Foreign key violation: {e}")
                raise HTTPException(
                    status_code=400,
                    detail="Invalid reference to related resource"
                )
            except asyncpg.exceptions.CheckViolationError as e:
                logger.warning(f"Check constraint violation: {e}")
                raise HTTPException(
                    status_code=400,
                    detail="Data validation failed"
                )
            except Exception as e:
                logger.error(f"Database query failed: {e}")
                raise HTTPException(
                    status_code=500,
                    detail="Database operation failed"
                )
    
    async def health_check(self) -> Dict[str, Any]:
        """Check database connectivity and return status"""
        status = {
            "database": "unknown",
            "supabase": "unknown",
            "pool_size": 0,
            "timestamp": None
        }
        
        try:
            # Check PostgreSQL pool
            if self.pool:
                async with self.get_connection() as conn:
                    result = await conn.fetchrow("SELECT NOW() as timestamp, version() as version")
                    status["database"] = "connected"
                    status["pool_size"] = self.pool.get_size()
                    status["timestamp"] = result["timestamp"]
                    status["version"] = result["version"]
            
            # Check Supabase client
            if self.supabase:
                try:
                    # Simple health check query
                    response = self.supabase.from_("exercises").select("id").limit(1).execute()
                    status["supabase"] = "connected" if response.data is not None else "error"
                except Exception as e:
                    logger.warning(f"Supabase health check failed: {e}")
                    status["supabase"] = "error"
            
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            status["database"] = "error"
            status["error"] = str(e)
        
        return status


# Global database manager instance
db_manager = DatabaseManager()


async def get_database() -> DatabaseManager:
    """Dependency injection for database manager"""
    if not db_manager._initialized:
        await db_manager.initialize()
    return db_manager


async def get_supabase_client() -> Client:
    """Dependency injection for Supabase client"""
    db = await get_database()
    if not db.supabase:
        raise HTTPException(
            status_code=500,
            detail="Supabase client not available"
        )
    return db.supabase


# Database utilities for common operations
class DatabaseUtils:
    """Utility functions for database operations"""
    
    @staticmethod
    async def verify_user_exists(user_id: str, db: DatabaseManager) -> bool:
        """Verify user exists in database"""
        result = await db.execute_query(
            "SELECT id FROM users WHERE id = $1",
            user_id,
            fetch_one=True
        )
        return result is not None
    
    @staticmethod
    async def verify_exercise_exists(exercise_id: str, db: DatabaseManager) -> bool:
        """Verify exercise exists in database"""
        result = await db.execute_query(
            "SELECT id FROM exercises WHERE id = $1 AND is_active = true",
            exercise_id,
            fetch_one=True
        )
        return result is not None
    
    @staticmethod
    async def verify_workout_belongs_to_user(
        workout_id: str, 
        user_id: str, 
        db: DatabaseManager
    ) -> bool:
        """Verify workout belongs to specified user"""
        result = await db.execute_query(
            "SELECT id FROM workouts WHERE id = $1 AND user_id = $2",
            workout_id,
            user_id,
            fetch_one=True
        )
        return result is not None
    
    @staticmethod
    def build_pagination_query(
        base_query: str,
        limit: int = 50,
        offset: int = 0,
        order_by: str = "created_at DESC"
    ) -> str:
        """Build paginated query with proper ordering"""
        # Validate limit
        limit = max(1, min(limit, 100))  # Between 1 and 100
        
        # Validate offset
        offset = max(0, offset)
        
        # Basic SQL injection prevention for order_by
        allowed_columns = [
            "created_at", "updated_at", "name", "id", 
            "started_at", "ended_at", "difficulty", "category"
        ]
        allowed_directions = ["ASC", "DESC"]
        
        order_parts = order_by.split()
        if len(order_parts) >= 1:
            column = order_parts[0]
            direction = order_parts[1] if len(order_parts) > 1 else "DESC"
            
            if column not in allowed_columns or direction not in allowed_directions:
                order_by = "created_at DESC"  # Safe default
        
        return f"{base_query} ORDER BY {order_by} LIMIT {limit} OFFSET {offset}"


# Export functions and classes
__all__ = [
    'DatabaseManager',
    'DatabaseUtils',
    'db_manager',
    'get_database',
    'get_supabase_client'
]