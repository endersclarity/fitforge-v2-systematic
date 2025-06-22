"""
Users API Router
User management and profile endpoints with comprehensive authentication
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, List, Optional, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.core.database import DatabaseManager, get_database
from app.core.dependencies import (
    get_current_user,
    require_admin,
    PaginationParams,
    get_config
)
from app.core.config import Settings
from app.models.schemas import User, UserCreate, UserUpdate


router = APIRouter()


# ============================================================================
# RESPONSE MODELS
# ============================================================================

class UserStats(BaseModel):
    """User statistics response model"""
    total_workouts: int = Field(default=0, description="Total number of workouts completed")
    total_volume_lbs: Decimal = Field(default=Decimal('0.00'), description="Total weight lifted across all workouts")
    total_sets: int = Field(default=0, description="Total number of sets completed")
    total_reps: int = Field(default=0, description="Total number of reps completed")
    workout_frequency: Dict[str, int] = Field(default_factory=dict, description="Workouts per week for last 12 weeks")
    favorite_exercises: List[Dict[str, Any]] = Field(default_factory=list, description="Top 5 most performed exercises")
    personal_records: List[Dict[str, Any]] = Field(default_factory=list, description="Personal best lifts by exercise")
    muscle_group_distribution: Dict[str, float] = Field(default_factory=dict, description="Percentage of volume by muscle group")
    last_workout_date: Optional[datetime] = Field(None, description="Date of most recent workout")
    average_workout_duration: Optional[int] = Field(None, description="Average workout duration in seconds")
    consistency_score: float = Field(default=0.0, description="Workout consistency score (0-100)")


class UserResponse(User):
    """Enhanced user response with additional computed fields"""
    is_premium: bool = Field(default=False, description="Whether user has premium features")
    days_since_last_workout: Optional[int] = Field(None, description="Days since last workout")


# ============================================================================
# USER PROFILE ENDPOINTS
# ============================================================================

@router.get("/me", response_model=UserResponse, summary="Get current user profile")
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database),
    settings: Settings = Depends(get_config)
) -> UserResponse:
    """Get the currently authenticated user's profile.
    
    Requires authentication via Bearer token.
    Returns enhanced user data including computed fields.
    """
    # Calculate days since last workout
    last_workout = await db.execute_query(
        """
        SELECT started_at FROM workouts 
        WHERE user_id = $1 AND is_completed = true
        ORDER BY started_at DESC LIMIT 1
        """,
        current_user.id,
        fetch_one=True
    )
    
    days_since_last_workout = None
    if last_workout:
        days_diff = (datetime.now(timezone.utc) - last_workout['started_at']).days
        days_since_last_workout = days_diff
    
    # Determine premium status based on feature level
    is_premium = current_user.feature_level >= 3
    
    return UserResponse(
        **current_user.model_dump(),
        is_premium=is_premium,
        days_since_last_workout=days_since_last_workout
    )


@router.put("/me", response_model=UserResponse, summary="Update current user profile")
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
) -> UserResponse:
    """Update the currently authenticated user's profile.
    
    Requires authentication. Users can only update their own profile.
    All fields in the update payload are optional.
    """
    # Build update query dynamically based on provided fields
    update_fields = []
    update_values = []
    param_count = 1
    
    update_dict = user_update.model_dump(exclude_unset=True)
    
    for field, value in update_dict.items():
        update_fields.append(f"{field} = ${param_count}")
        update_values.append(value)
        param_count += 1
    
    if not update_fields:
        # No fields to update, return current user
        return await get_current_user_profile(current_user, db, await get_config())
    
    # Add updated_at timestamp
    update_fields.append(f"updated_at = ${param_count}")
    update_values.append(datetime.now(timezone.utc))
    param_count += 1
    
    # Add user_id for WHERE clause
    update_values.append(current_user.id)
    
    # Execute update query
    updated_user = await db.execute_query(
        f"""
        UPDATE users 
        SET {', '.join(update_fields)}
        WHERE id = ${param_count}
        RETURNING *
        """,
        *update_values,
        fetch_one=True
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return enhanced response
    return await get_current_user_profile(
        User(**updated_user), 
        db, 
        await get_config()
    )


@router.get("/me/stats", response_model=UserStats, summary="Get current user statistics")
async def get_current_user_stats(
    current_user: User = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
) -> UserStats:
    """Get comprehensive statistics for the current user.
    
    Includes workout metrics, personal records, and consistency data.
    Requires authentication.
    """
    stats = UserStats()
    
    # Get basic workout statistics
    workout_stats = await db.execute_query(
        """
        SELECT 
            COUNT(*) as total_workouts,
            COALESCE(SUM(total_volume_lbs), 0) as total_volume_lbs,
            COALESCE(SUM(total_sets), 0) as total_sets,
            COALESCE(SUM(total_reps), 0) as total_reps,
            MAX(started_at) as last_workout_date,
            AVG(duration_seconds) as avg_duration
        FROM workouts
        WHERE user_id = $1 AND is_completed = true
        """,
        current_user.id,
        fetch_one=True
    )
    
    if workout_stats:
        stats.total_workouts = workout_stats['total_workouts']
        stats.total_volume_lbs = workout_stats['total_volume_lbs'] or Decimal('0.00')
        stats.total_sets = workout_stats['total_sets'] or 0
        stats.total_reps = workout_stats['total_reps'] or 0
        stats.last_workout_date = workout_stats['last_workout_date']
        stats.average_workout_duration = int(workout_stats['avg_duration']) if workout_stats['avg_duration'] else None
    
    # Get workout frequency by week for last 12 weeks
    frequency_data = await db.execute_query(
        """
        SELECT 
            DATE_TRUNC('week', started_at) as week,
            COUNT(*) as workout_count
        FROM workouts
        WHERE user_id = $1 
            AND is_completed = true
            AND started_at >= NOW() - INTERVAL '12 weeks'
        GROUP BY week
        ORDER BY week DESC
        """,
        current_user.id
    )
    
    stats.workout_frequency = {
        row['week'].strftime('%Y-%m-%d'): row['workout_count'] 
        for row in frequency_data
    }
    
    # Get favorite exercises (top 5 by set count)
    favorite_exercises = await db.execute_query(
        """
        SELECT 
            e.id,
            e.name,
            e.category,
            COUNT(*) as set_count,
            SUM(ws.volume_lbs) as total_volume
        FROM workout_sets ws
        JOIN exercises e ON ws.exercise_id = e.id
        WHERE ws.user_id = $1
        GROUP BY e.id, e.name, e.category
        ORDER BY set_count DESC
        LIMIT 5
        """,
        current_user.id
    )
    
    stats.favorite_exercises = [
        {
            'exercise_id': ex['id'],
            'name': ex['name'],
            'category': ex['category'],
            'set_count': ex['set_count'],
            'total_volume': float(ex['total_volume'] or 0)
        }
        for ex in favorite_exercises
    ]
    
    # Get personal records (max weight × reps for each exercise)
    personal_records = await db.execute_query(
        """
        SELECT DISTINCT ON (e.id)
            e.id,
            e.name,
            e.category,
            ws.weight_lbs,
            ws.reps,
            ws.volume_lbs,
            ws.created_at
        FROM workout_sets ws
        JOIN exercises e ON ws.exercise_id = e.id
        WHERE ws.user_id = $1
        ORDER BY e.id, ws.volume_lbs DESC, ws.created_at DESC
        LIMIT 10
        """,
        current_user.id
    )
    
    stats.personal_records = [
        {
            'exercise_id': pr['id'],
            'name': pr['name'],
            'category': pr['category'],
            'weight_lbs': float(pr['weight_lbs']),
            'reps': pr['reps'],
            'volume_lbs': float(pr['volume_lbs']),
            'achieved_date': pr['created_at'].isoformat()
        }
        for pr in personal_records
    ]
    
    # Get muscle group distribution
    muscle_distribution = await db.execute_query(
        """
        SELECT 
            e.category,
            SUM(ws.volume_lbs) as category_volume
        FROM workout_sets ws
        JOIN exercises e ON ws.exercise_id = e.id
        WHERE ws.user_id = $1
        GROUP BY e.category
        """,
        current_user.id
    )
    
    total_volume = sum(row['category_volume'] for row in muscle_distribution)
    if total_volume > 0:
        stats.muscle_group_distribution = {
            row['category']: float(row['category_volume'] / total_volume * 100)
            for row in muscle_distribution
        }
    
    # Calculate consistency score (workouts per week average)
    if stats.total_workouts > 0:
        weeks_since_first = await db.execute_query(
            """
            SELECT EXTRACT(WEEK FROM (NOW() - MIN(started_at))) as weeks
            FROM workouts
            WHERE user_id = $1 AND is_completed = true
            """,
            current_user.id,
            fetch_one=True
        )
        
        if weeks_since_first and weeks_since_first['weeks']:
            avg_per_week = stats.total_workouts / max(1, weeks_since_first['weeks'])
            # Score: 3+ workouts/week = 100, 2/week = 66, 1/week = 33
            stats.consistency_score = min(100, (avg_per_week / 3) * 100)
    
    return stats


# ============================================================================
# ADMIN USER MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/", response_model=List[UserResponse], summary="List all users (admin only)")
async def list_users(
    pagination: PaginationParams = Depends(),
    search: Optional[str] = Query(None, description="Search by email or display name"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(require_admin),
    db: DatabaseManager = Depends(get_database)
) -> List[UserResponse]:
    """List all users with pagination and filtering.
    
    Requires admin authentication.
    Supports searching by email or display name.
    """
    # Build WHERE clause
    where_conditions = []
    params = []
    param_count = 1
    
    if search:
        where_conditions.append(
            f"(email ILIKE ${param_count} OR display_name ILIKE ${param_count})"
        )
        params.append(f"%{search}%")
        param_count += 1
    
    if is_active is not None:
        # Note: is_active column doesn't exist in current schema
        # This is for future implementation when soft delete is added
        pass
    
    where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
    
    # Add pagination parameters
    params.extend([pagination.limit, pagination.offset])
    
    users = await db.execute_query(
        f"""
        SELECT * FROM users
        {where_clause}
        ORDER BY {pagination.order_clause}
        LIMIT ${param_count} OFFSET ${param_count + 1}
        """,
        *params
    )
    
    # Convert to response models
    return [UserResponse(**user, is_premium=user['feature_level'] >= 3) for user in users]


@router.get("/{user_id}", response_model=UserResponse, summary="Get user by ID")
async def get_user_by_id(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
) -> UserResponse:
    """Get a specific user by ID.
    
    Regular users can only access their own profile.
    Admins can access any user profile.
    """
    # Check if user is accessing their own profile or is admin
    if str(user_id) != str(current_user.id):
        # For now, only allow users to view their own profile
        # In future, add admin check here
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    user_data = await db.execute_query(
        "SELECT * FROM users WHERE id = $1",
        user_id,
        fetch_one=True
    )
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**user_data, is_premium=user_data['feature_level'] >= 3)


@router.put("/{user_id}", response_model=UserResponse, summary="Update user by ID (admin only)")
async def update_user_by_id(
    user_id: UUID,
    user_update: UserUpdate,
    current_user: User = Depends(require_admin),
    db: DatabaseManager = Depends(get_database)
) -> UserResponse:
    """Update a specific user's profile.
    
    Requires admin authentication.
    All fields in the update payload are optional.
    """
    # Build update query
    update_fields = []
    update_values = []
    param_count = 1
    
    update_dict = user_update.model_dump(exclude_unset=True)
    
    for field, value in update_dict.items():
        update_fields.append(f"{field} = ${param_count}")
        update_values.append(value)
        param_count += 1
    
    if not update_fields:
        # No fields to update
        return await get_user_by_id(user_id, current_user, db)
    
    # Add updated_at timestamp
    update_fields.append(f"updated_at = ${param_count}")
    update_values.append(datetime.now(timezone.utc))
    param_count += 1
    
    # Add user_id for WHERE clause
    update_values.append(user_id)
    
    # Execute update
    updated_user = await db.execute_query(
        f"""
        UPDATE users 
        SET {', '.join(update_fields)}
        WHERE id = ${param_count}
        RETURNING *
        """,
        *update_values,
        fetch_one=True
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**updated_user, is_premium=updated_user['feature_level'] >= 3)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Deactivate user (soft delete)")
async def deactivate_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
) -> None:
    """Deactivate a user account (soft delete).
    
    Users can deactivate their own account.
    Admins can deactivate any account.
    
    Note: This currently performs a hard delete as the schema
    doesn't have an is_active column yet.
    """
    # Check if user is deleting their own account or is admin
    if str(user_id) != str(current_user.id):
        # Check for admin role
        await require_admin(current_user)
    
    # For now, perform hard delete
    # In production, this should be a soft delete by setting is_active = false
    result = await db.execute_query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        user_id,
        fetch_one=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Future implementation:
    # UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1
    return None


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@router.post("/me/update-last-active", status_code=status.HTTP_204_NO_CONTENT, summary="Update last active timestamp")
async def update_last_active(
    current_user: User = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
) -> None:
    """Update the current user's last active timestamp.
    
    Called periodically by the frontend to track user activity.
    """
    await db.execute_query(
        "UPDATE users SET last_active_at = $1 WHERE id = $2",
        datetime.now(timezone.utc),
        current_user.id
    )
    return None