"""
FitForge User Profile API Router
Created: December 21, 2024
Purpose: RESTful endpoints for user profile management

This module implements the complete user profile API with:
- User profile CRUD operations with fitness-specific data
- Progressive disclosure feature level management
- Personal metrics tracking (weight, height, age)
- Fitness preferences and goal management
- Equipment availability tracking
- Profile analytics and progress summaries

All endpoints include proper authentication and data validation
with integration to Supabase Auth for user management.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, text
from decimal import Decimal
import logging

from ..database import get_db
from ..schemas.pydantic_models import (
    User, UserCreate, UserUpdate,
    Sex, ExperienceLevel
)
from ..auth import get_current_user, get_user_id, require_admin_user
from ..models.workout import Workout
from ..models.workout_set import WorkoutSet

# Configure logging
logger = logging.getLogger(__name__)

# Create router with prefix and tags for OpenAPI documentation
router = APIRouter(
    prefix="/users",
    tags=["User Profiles"],
    responses={
        404: {"description": "User not found"},
        400: {"description": "Invalid user data"},
        403: {"description": "Access denied - users can only access own profile"},
        500: {"description": "Internal server error"}
    }
)


# ============================================================================
# PROFILE READ OPERATIONS
# ============================================================================

@router.get("/me", response_model=User)
async def get_current_user_profile(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get current user's profile
    
    **Returns:**
    - Complete user profile with all fitness data and preferences
    - Progressive disclosure feature level
    - Workout count and activity metrics
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching profile for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile"
        )


@router.get("/{user_id}", response_model=User)
async def get_user_profile(
    target_user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_user)  # Admin only endpoint
):
    """
    Get any user's profile (Admin only)
    
    **Path Parameters:**
    - target_user_id: UUID of the user to fetch
    
    **Returns:**
    - Complete user profile
    """
    try:
        user = db.query(User).filter(User.id == target_user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '{target_user_id}' not found"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching profile for user {target_user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile"
        )


# ============================================================================
# PROFILE CREATE/UPDATE OPERATIONS
# ============================================================================

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user_profile(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new user profile
    
    This endpoint is typically called after Supabase Auth user creation
    to set up the fitness-specific profile data.
    
    **Request Body:**
    - Complete user data following UserCreate schema
    - id must match the Supabase Auth user ID
    
    **Returns:**
    - Created user profile
    """
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.id == user_data.id).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User profile already exists for ID '{user_data.id}'"
            )
        
        # Check if email is already used
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{user_data.email}' is already registered"
            )
        
        # Create new user profile
        user = User(**user_data.dict())
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info(f"Created user profile: {user.id} ({user.email})")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user profile"
        )


@router.put("/me", response_model=User)
async def update_current_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Update current user's profile
    
    **Request Body:**
    - Partial user data following UserUpdate schema
    - Only provided fields will be updated
    - Email cannot be changed through this endpoint
    
    **Returns:**
    - Updated user profile
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Update only provided fields
        update_data = user_update.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        # Update timestamp
        user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user)
        
        logger.info(f"Updated user profile: {user_id}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating user profile {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )


# ============================================================================
# PROGRESSIVE DISCLOSURE OPERATIONS
# ============================================================================

@router.get("/me/feature-level", response_model=Dict[str, Any])
async def get_user_feature_level(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get user's current feature level and unlock status
    
    **Returns:**
    - Current feature level (1-4)
    - Workout count and thresholds for next level
    - Available features for current level
    - Progress toward next unlock
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Define feature levels and requirements
        feature_levels = {
            1: {
                "name": "Beginner",
                "min_workouts": 0,
                "max_workouts": 2,
                "features": [
                    "Basic workout logging",
                    "Exercise library",
                    "Simple progress tracking"
                ]
            },
            2: {
                "name": "Intermediate", 
                "min_workouts": 3,
                "max_workouts": 9,
                "features": [
                    "Muscle fatigue visualization",
                    "Progressive overload tracking",
                    "Workout templates",
                    "Basic analytics"
                ]
            },
            3: {
                "name": "Advanced",
                "min_workouts": 10,
                "max_workouts": 19,
                "features": [
                    "Advanced muscle heat maps",
                    "A/B periodization",
                    "Detailed analytics",
                    "Recovery recommendations"
                ]
            },
            4: {
                "name": "Expert",
                "min_workouts": 20,
                "max_workouts": float('inf'),
                "features": [
                    "All features unlocked",
                    "Advanced fatigue modeling",
                    "Comprehensive analytics",
                    "Export capabilities"
                ]
            }
        }
        
        current_level = feature_levels[user.feature_level]
        next_level = feature_levels.get(user.feature_level + 1)
        
        # Calculate progress to next level
        if next_level:
            workouts_needed = next_level["min_workouts"] - user.workout_count
            progress_percentage = min(
                (user.workout_count / next_level["min_workouts"]) * 100, 
                100
            )
        else:
            workouts_needed = 0
            progress_percentage = 100
        
        return {
            "current_level": user.feature_level,
            "level_name": current_level["name"],
            "workout_count": user.workout_count,
            "available_features": current_level["features"],
            "next_level": {
                "level": user.feature_level + 1 if next_level else None,
                "name": next_level["name"] if next_level else None,
                "workouts_needed": max(workouts_needed, 0),
                "progress_percentage": round(progress_percentage, 1),
                "new_features": next_level["features"] if next_level else []
            } if next_level else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching feature level for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch feature level"
        )


# ============================================================================
# PERSONAL METRICS OPERATIONS
# ============================================================================

@router.put("/me/metrics", response_model=User)
async def update_personal_metrics(
    height_inches: Optional[int] = Query(None, ge=1, le=119, description="Height in inches"),
    weight_lbs: Optional[Decimal] = Query(None, ge=Decimal('0.01'), le=Decimal('999.99'), description="Weight in pounds"),
    age: Optional[int] = Query(None, ge=1, le=149, description="Age in years"),
    sex: Optional[Sex] = Query(None, description="Sex/Gender"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Update user's personal metrics
    
    **Query Parameters:**
    - height_inches: Height in inches (1-119)
    - weight_lbs: Weight in pounds (0.01-999.99) 
    - age: Age in years (1-149)
    - sex: Sex/Gender (M, F, Other)
    
    **Returns:**
    - Updated user profile
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Update provided metrics
        if height_inches is not None:
            user.height_inches = height_inches
        if weight_lbs is not None:
            user.weight_lbs = weight_lbs
        if age is not None:
            user.age = age
        if sex is not None:
            user.sex = sex
        
        user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user)
        
        logger.info(f"Updated personal metrics for user {user_id}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating metrics for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update personal metrics"
        )


@router.get("/me/bmi", response_model=Dict[str, Any])
async def calculate_user_bmi(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Calculate user's BMI and health category
    
    **Returns:**
    - BMI value and health category
    - Requires height and weight to be set in profile
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        if not user.height_inches or not user.weight_lbs:
            return {
                "message": "Height and weight required for BMI calculation",
                "bmi": None,
                "category": None
            }
        
        # BMI = (weight in pounds / (height in inches)²) × 703
        height_squared = user.height_inches * user.height_inches
        bmi = float(user.weight_lbs) / height_squared * 703
        
        # Determine BMI category
        if bmi < 18.5:
            category = "Underweight"
        elif bmi < 25.0:
            category = "Normal weight"
        elif bmi < 30.0:
            category = "Overweight"
        else:
            category = "Obesity"
        
        return {
            "bmi": round(bmi, 1),
            "category": category,
            "height_inches": user.height_inches,
            "weight_lbs": float(user.weight_lbs)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating BMI for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate BMI"
        )


# ============================================================================
# FITNESS PREFERENCES OPERATIONS
# ============================================================================

@router.put("/me/preferences", response_model=User)
async def update_fitness_preferences(
    experience_level: Optional[ExperienceLevel] = Query(None, description="Fitness experience level"),
    primary_goals: Optional[List[str]] = Query(None, description="Primary fitness goals"),
    available_equipment: Optional[List[str]] = Query(None, description="Available equipment"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Update user's fitness preferences
    
    **Query Parameters:**
    - experience_level: Fitness experience (Beginner, Intermediate, Advanced)
    - primary_goals: List of fitness goals
    - available_equipment: List of available equipment
    
    **Returns:**
    - Updated user profile
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Update provided preferences
        if experience_level is not None:
            user.experience_level = experience_level
        if primary_goals is not None:
            user.primary_goals = primary_goals
        if available_equipment is not None:
            user.available_equipment = available_equipment
        
        user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user)
        
        logger.info(f"Updated fitness preferences for user {user_id}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating preferences for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update fitness preferences"
        )


# ============================================================================
# PROFILE ANALYTICS
# ============================================================================

@router.get("/me/analytics", response_model=Dict[str, Any])
async def get_user_analytics(
    days_back: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get comprehensive user profile analytics
    
    **Query Parameters:**
    - days_back: Number of days to analyze (default: 30, max: 365)
    
    **Returns:**
    - Workout frequency and consistency metrics
    - Volume and strength progression
    - Feature usage and engagement
    """
    try:
        start_date = datetime.utcnow() - timedelta(days=days_back)
        
        # Get basic workout analytics
        workout_analytics = db.execute(
            text("""
                SELECT 
                    COUNT(*) as total_workouts,
                    COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_workouts,
                    SUM(total_volume_lbs) as total_volume,
                    AVG(duration_seconds) as avg_duration,
                    COUNT(DISTINCT DATE(started_at)) as active_days
                FROM workouts 
                WHERE user_id = :user_id 
                    AND started_at >= :start_date
            """),
            {"user_id": user_id, "start_date": start_date}
        ).first()
        
        # Get volume progression
        volume_progression = db.execute(
            text("""
                SELECT 
                    DATE_TRUNC('week', started_at) as week,
                    SUM(total_volume_lbs) as weekly_volume
                FROM workouts 
                WHERE user_id = :user_id 
                    AND started_at >= :start_date
                    AND is_completed = true
                GROUP BY DATE_TRUNC('week', started_at)
                ORDER BY week
            """),
            {"user_id": user_id, "start_date": start_date}
        ).fetchall()
        
        # Get personal bests count
        personal_bests = db.query(WorkoutSet).join(Workout).filter(
            and_(
                WorkoutSet.user_id == user_id,
                WorkoutSet.is_personal_best == True,
                WorkoutSet.created_at >= start_date,
                Workout.is_completed == True
            )
        ).count()
        
        # Calculate consistency metrics
        total_possible_days = days_back
        active_days = workout_analytics.active_days or 0
        consistency_percentage = round((active_days / total_possible_days) * 100, 1)
        
        # Calculate weekly volume trend
        if len(volume_progression) >= 2:
            first_week_volume = float(volume_progression[0].weekly_volume or 0)
            last_week_volume = float(volume_progression[-1].weekly_volume or 0)
            
            if first_week_volume > 0:
                volume_trend = ((last_week_volume - first_week_volume) / first_week_volume) * 100
            else:
                volume_trend = 0
        else:
            volume_trend = 0
        
        return {
            "period_analyzed": {
                "days": days_back,
                "start_date": start_date.date().isoformat(),
                "end_date": datetime.utcnow().date().isoformat()
            },
            "workout_metrics": {
                "total_workouts": workout_analytics.total_workouts or 0,
                "completed_workouts": workout_analytics.completed_workouts or 0,
                "completion_rate": round(
                    (workout_analytics.completed_workouts / max(workout_analytics.total_workouts, 1)) * 100, 1
                ),
                "total_volume_lbs": float(workout_analytics.total_volume or 0),
                "avg_duration_minutes": round(float(workout_analytics.avg_duration or 0) / 60, 1)
            },
            "consistency_metrics": {
                "active_days": active_days,
                "total_possible_days": total_possible_days,
                "consistency_percentage": consistency_percentage,
                "workouts_per_week": round((workout_analytics.completed_workouts or 0) / max(days_back / 7, 1), 1)
            },
            "progression_metrics": {
                "personal_bests_achieved": personal_bests,
                "weekly_volume_trend_percentage": round(volume_trend, 2),
                "weekly_volume_data": [
                    {
                        "week": row.week.date().isoformat(),
                        "volume_lbs": float(row.weekly_volume or 0)
                    }
                    for row in volume_progression
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating analytics for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate user analytics"
        )


# ============================================================================
# ADMIN OPERATIONS
# ============================================================================

@router.get("/", response_model=Dict[str, Any])
async def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by email or display name"),
    experience_level: Optional[ExperienceLevel] = Query(None, description="Filter by experience level"),
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_user)  # Admin only
):
    """
    List all users with filtering (Admin only)
    
    **Query Parameters:**
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    - search: Search by email or display name
    - experience_level: Filter by experience level
    
    **Returns:**
    - Paginated list of users with summary metrics
    """
    try:
        # Build base query
        query = db.query(User)
        
        # Apply filters
        if search:
            search_term = f"%{search.lower()}%"
            query = query.filter(
                or_(
                    User.email.ilike(search_term),
                    User.display_name.ilike(search_term)
                )
            )
        
        if experience_level:
            query = query.filter(User.experience_level == experience_level)
        
        # Get total count
        total_items = query.count()
        
        # Apply pagination and sorting
        offset = (page - 1) * page_size
        users = query.order_by(User.created_at.desc()).offset(offset).limit(page_size).all()
        
        # Calculate pagination metadata
        total_pages = (total_items + page_size - 1) // page_size
        
        return {
            "users": users,
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_items": total_items,
                "page_size": page_size
            }
        }
        
    except Exception as e:
        logger.error(f"Error listing users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users"
        )