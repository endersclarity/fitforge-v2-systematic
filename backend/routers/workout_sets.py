"""
FitForge Workout Sets API Router
Created: December 21, 2024
Purpose: RESTful endpoints for individual set logging and management

This module implements the complete workout set API with:
- CRUD operations for individual sets within workouts
- Real-time performance tracking and personal bests
- One-rep max calculations using Epley formula
- Set-by-set progression analysis
- Volume calculations and rest period tracking
- Integration with workout metrics updates

All endpoints maintain data integrity with automatic workout metric updates
and provide detailed performance analytics for each set.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, text
from decimal import Decimal
import logging

from ..database import get_db
from ..schemas.pydantic_models import (
    WorkoutSet, WorkoutSetCreate, WorkoutSetUpdate
)
from ..auth import get_current_user, get_user_id
from ..services.performance_calculator import PerformanceCalculatorService
from ..models.workout import Workout as WorkoutModel

# Configure logging
logger = logging.getLogger(__name__)

# Create router with prefix and tags for OpenAPI documentation
router = APIRouter(
    prefix="/workout-sets",
    tags=["Workout Sets"],
    responses={
        404: {"description": "Workout set not found"},
        400: {"description": "Invalid set data or workout constraints"},
        403: {"description": "Access denied - user can only access own sets"},
        500: {"description": "Internal server error"}
    }
)


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_one_rep_max(weight: Decimal, reps: int) -> Decimal:
    """
    Calculate estimated 1RM using Epley formula: weight * (1 + reps/30)
    """
    if reps <= 0 or weight <= 0:
        return Decimal('0.00')
    
    return round(weight * (1 + Decimal(reps) / 30), 2)


def check_personal_best(db: Session, user_id: str, exercise_id: str, weight: Decimal, reps: int) -> bool:
    """
    Check if this set represents a personal best for the exercise
    """
    try:
        # Get best previous performance for this exercise
        best_set = db.query(WorkoutSet).join(WorkoutModel).filter(
            and_(
                WorkoutSet.user_id == user_id,
                WorkoutSet.exercise_id == exercise_id,
                WorkoutModel.is_completed == True
            )
        ).order_by(
            desc(WorkoutSet.estimated_one_rep_max)
        ).first()
        
        if not best_set:
            return True  # First time doing this exercise
        
        current_1rm = calculate_one_rep_max(weight, reps)
        return current_1rm > best_set.estimated_one_rep_max
        
    except Exception:
        return False


# ============================================================================
# QUERY PARAMETER MODELS
# ============================================================================

class WorkoutSetFilters:
    """Query parameters for workout set filtering"""
    
    def __init__(
        self,
        # Workout filtering
        workout_id: Optional[str] = Query(None, description="Filter by specific workout ID"),
        exercise_id: Optional[str] = Query(None, description="Filter by specific exercise"),
        
        # Date filtering
        start_date: Optional[datetime] = Query(None, description="Filter sets after this date"),
        end_date: Optional[datetime] = Query(None, description="Filter sets before this date"),
        
        # Performance filtering
        min_weight: Optional[Decimal] = Query(None, description="Minimum weight filter"),
        max_weight: Optional[Decimal] = Query(None, description="Maximum weight filter"),
        min_reps: Optional[int] = Query(None, description="Minimum reps filter"),
        max_reps: Optional[int] = Query(None, description="Maximum reps filter"),
        personal_bests_only: bool = Query(False, description="Show only personal best sets"),
        
        # Pagination
        page: int = Query(1, ge=1, description="Page number (1-based)"),
        page_size: int = Query(50, ge=1, le=200, description="Items per page (max 200)"),
        
        # Sorting
        sort_by: str = Query("created_at", description="Sort field: created_at, weight_lbs, volume_lbs, estimated_one_rep_max"),
        sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order: asc or desc")
    ):
        self.workout_id = workout_id
        self.exercise_id = exercise_id
        self.start_date = start_date
        self.end_date = end_date
        self.min_weight = min_weight
        self.max_weight = max_weight
        self.min_reps = min_reps
        self.max_reps = max_reps
        self.personal_bests_only = personal_bests_only
        self.page = page
        self.page_size = page_size
        self.sort_by = sort_by
        self.sort_order = sort_order


# ============================================================================
# READ OPERATIONS
# ============================================================================

@router.get("/", response_model=Dict[str, Any])
async def get_workout_sets(
    filters: WorkoutSetFilters = Depends(),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get paginated list of user's workout sets with filtering
    
    **Query Parameters:**
    - workout_id: Filter by specific workout UUID
    - exercise_id: Filter by specific exercise
    - start_date: Filter sets after this date (ISO format)
    - end_date: Filter sets before this date (ISO format)
    - min_weight/max_weight: Weight range filtering
    - min_reps/max_reps: Rep range filtering
    - personal_bests_only: Show only personal best sets (true/false)
    - page: Page number (default: 1)
    - page_size: Items per page (default: 50, max: 200)
    - sort_by: Sort field (created_at, weight_lbs, volume_lbs, estimated_one_rep_max)
    - sort_order: Sort order (asc, desc)
    
    **Returns:**
    - sets: List of workout set objects
    - pagination: Page metadata
    - analytics: Summary statistics for filtered sets
    """
    try:
        # Build base query - user can only see their own sets
        query = db.query(WorkoutSet).filter(WorkoutSet.user_id == user_id)
        
        # Apply filters
        active_filters = {}
        
        if filters.workout_id:
            query = query.filter(WorkoutSet.workout_id == filters.workout_id)
            active_filters["workout_id"] = filters.workout_id
        
        if filters.exercise_id:
            query = query.filter(WorkoutSet.exercise_id == filters.exercise_id)
            active_filters["exercise_id"] = filters.exercise_id
        
        if filters.start_date:
            query = query.filter(WorkoutSet.created_at >= filters.start_date)
            active_filters["start_date"] = filters.start_date
        
        if filters.end_date:
            query = query.filter(WorkoutSet.created_at <= filters.end_date)
            active_filters["end_date"] = filters.end_date
        
        if filters.min_weight:
            query = query.filter(WorkoutSet.weight_lbs >= filters.min_weight)
            active_filters["min_weight"] = filters.min_weight
        
        if filters.max_weight:
            query = query.filter(WorkoutSet.weight_lbs <= filters.max_weight)
            active_filters["max_weight"] = filters.max_weight
        
        if filters.min_reps:
            query = query.filter(WorkoutSet.reps >= filters.min_reps)
            active_filters["min_reps"] = filters.min_reps
        
        if filters.max_reps:
            query = query.filter(WorkoutSet.reps <= filters.max_reps)
            active_filters["max_reps"] = filters.max_reps
        
        if filters.personal_bests_only:
            query = query.filter(WorkoutSet.is_personal_best == True)
            active_filters["personal_bests_only"] = True
        
        # Get total count and analytics before pagination
        total_items = query.count()
        
        # Calculate summary analytics
        analytics_result = query.with_entities(
            func.count(WorkoutSet.id).label("total_sets"),
            func.sum(WorkoutSet.volume_lbs).label("total_volume"),
            func.avg(WorkoutSet.weight_lbs).label("avg_weight"),
            func.avg(WorkoutSet.reps).label("avg_reps"),
            func.max(WorkoutSet.estimated_one_rep_max).label("max_1rm")
        ).first()
        
        analytics = {
            "total_sets": analytics_result.total_sets or 0,
            "total_volume_lbs": float(analytics_result.total_volume or 0),
            "avg_weight_lbs": round(float(analytics_result.avg_weight or 0), 2),
            "avg_reps": round(float(analytics_result.avg_reps or 0), 1),
            "max_estimated_1rm": float(analytics_result.max_1rm or 0)
        }
        
        # Apply sorting
        sort_column = getattr(WorkoutSet, filters.sort_by, WorkoutSet.created_at)
        if filters.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        sets = query.offset(offset).limit(filters.page_size).all()
        
        # Calculate pagination metadata
        total_pages = (total_items + filters.page_size - 1) // filters.page_size
        
        return {
            "sets": sets,
            "pagination": {
                "current_page": filters.page,
                "total_pages": total_pages,
                "total_items": total_items,
                "page_size": filters.page_size
            },
            "analytics": analytics,
            "filters_applied": active_filters
        }
        
    except Exception as e:
        logger.error(f"Error fetching workout sets for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch workout sets"
        )


@router.get("/workout/{workout_id}", response_model=List[WorkoutSet])
async def get_sets_by_workout(
    workout_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get all sets for a specific workout, ordered by set number
    
    **Path Parameters:**
    - workout_id: UUID of the workout
    
    **Returns:**
    - List of workout sets ordered by exercise and set number
    """
    try:
        # Verify user owns the workout
        workout = db.query(WorkoutModel).filter(
            and_(
                WorkoutModel.id == workout_id,
                WorkoutModel.user_id == user_id
            )
        ).first()
        
        if not workout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout '{workout_id}' not found"
            )
        
        sets = db.query(WorkoutSet).filter(
            WorkoutSet.workout_id == workout_id
        ).order_by(
            WorkoutSet.exercise_id,
            WorkoutSet.set_number
        ).all()
        
        return sets
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching sets for workout {workout_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch workout sets"
        )


@router.get("/{set_id}", response_model=WorkoutSet)
async def get_workout_set(
    set_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get a specific workout set by ID
    
    **Path Parameters:**
    - set_id: UUID of the workout set
    
    **Returns:**
    - Complete workout set object
    """
    try:
        workout_set = db.query(WorkoutSet).filter(
            and_(
                WorkoutSet.id == set_id,
                WorkoutSet.user_id == user_id
            )
        ).first()
        
        if not workout_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout set '{set_id}' not found"
            )
        
        return workout_set
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching workout set {set_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch workout set"
        )


# ============================================================================
# CREATE OPERATIONS
# ============================================================================

@router.post("/", response_model=WorkoutSet, status_code=status.HTTP_201_CREATED)
async def create_workout_set(
    set_data: WorkoutSetCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Create a new workout set
    
    **Request Body:**
    - Set data following WorkoutSetCreate schema
    - user_id is automatically set from authentication
    - estimated_one_rep_max and is_personal_best are calculated automatically
    
    **Returns:**
    - Created workout set with calculated metrics
    """
    try:
        # Verify user owns the workout
        workout = db.query(WorkoutModel).filter(
            and_(
                WorkoutModel.id == set_data.workout_id,
                WorkoutModel.user_id == user_id
            )
        ).first()
        
        if not workout:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot add sets to a workout you don't own"
            )
        
        if workout.is_completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot add sets to a completed workout"
            )
        
        # Check if set number already exists for this exercise in this workout
        existing_set = db.query(WorkoutSet).filter(
            and_(
                WorkoutSet.workout_id == set_data.workout_id,
                WorkoutSet.exercise_id == set_data.exercise_id,
                WorkoutSet.set_number == set_data.set_number
            )
        ).first()
        
        if existing_set:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Set {set_data.set_number} already exists for exercise {set_data.exercise_id} in this workout"
            )
        
        # Set user_id from authentication
        set_dict = set_data.dict()
        set_dict["user_id"] = user_id
        
        # Calculate estimated 1RM
        set_dict["estimated_one_rep_max"] = calculate_one_rep_max(
            set_data.weight_lbs, 
            set_data.reps
        )
        
        # Check if this is a personal best
        set_dict["is_personal_best"] = check_personal_best(
            db, user_id, set_data.exercise_id, set_data.weight_lbs, set_data.reps
        )
        
        # Calculate improvement vs last set if available
        last_set = db.query(WorkoutSet).join(WorkoutModel).filter(
            and_(
                WorkoutSet.user_id == user_id,
                WorkoutSet.exercise_id == set_data.exercise_id,
                WorkoutModel.is_completed == True
            )
        ).order_by(desc(WorkoutSet.created_at)).first()
        
        if last_set and last_set.estimated_one_rep_max > 0:
            improvement = (
                (set_dict["estimated_one_rep_max"] - last_set.estimated_one_rep_max) 
                / last_set.estimated_one_rep_max * 100
            )
            set_dict["improvement_vs_last"] = round(improvement, 2)
        
        # Create new workout set
        workout_set = WorkoutSet(**set_dict)
        db.add(workout_set)
        
        # Commit to generate the set ID and trigger workout metrics update
        db.commit()
        db.refresh(workout_set)
        
        logger.info(f"Created workout set: {workout_set.id} for user {user_id}")
        return workout_set
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating workout set for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create workout set"
        )


# ============================================================================
# UPDATE OPERATIONS
# ============================================================================

@router.put("/{set_id}", response_model=WorkoutSet)
async def update_workout_set(
    set_id: str,
    set_update: WorkoutSetUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Update an existing workout set
    
    **Path Parameters:**
    - set_id: UUID of the workout set to update
    
    **Request Body:**
    - Partial set data following WorkoutSetUpdate schema
    - Calculated fields (1RM, personal best) are recalculated automatically
    
    **Returns:**
    - Updated workout set with recalculated metrics
    """
    try:
        workout_set = db.query(WorkoutSet).filter(
            and_(
                WorkoutSet.id == set_id,
                WorkoutSet.user_id == user_id
            )
        ).first()
        
        if not workout_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout set '{set_id}' not found"
            )
        
        # Check if the workout is completed
        workout = db.query(WorkoutModel).filter(
            WorkoutModel.id == workout_set.workout_id
        ).first()
        
        if workout.is_completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update sets in a completed workout"
            )
        
        # Update only provided fields
        update_data = set_update.dict(exclude_unset=True)
        
        # If weight or reps changed, recalculate derived fields
        weight_changed = "weight_lbs" in update_data
        reps_changed = "reps" in update_data
        
        if weight_changed or reps_changed:
            new_weight = update_data.get("weight_lbs", workout_set.weight_lbs)
            new_reps = update_data.get("reps", workout_set.reps)
            
            # Recalculate 1RM
            update_data["estimated_one_rep_max"] = calculate_one_rep_max(new_weight, new_reps)
            
            # Recalculate personal best status
            update_data["is_personal_best"] = check_personal_best(
                db, user_id, workout_set.exercise_id, new_weight, new_reps
            )
        
        # Apply updates
        for field, value in update_data.items():
            setattr(workout_set, field, value)
        
        db.commit()
        db.refresh(workout_set)
        
        logger.info(f"Updated workout set: {set_id} for user {user_id}")
        return workout_set
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating workout set {set_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update workout set"
        )


# ============================================================================
# DELETE OPERATIONS
# ============================================================================

@router.delete("/{set_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout_set(
    set_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Delete a workout set
    
    This will automatically update the parent workout's calculated metrics
    
    **Path Parameters:**
    - set_id: UUID of the workout set to delete
    
    **Returns:**
    - HTTP 204 No Content on success
    """
    try:
        workout_set = db.query(WorkoutSet).filter(
            and_(
                WorkoutSet.id == set_id,
                WorkoutSet.user_id == user_id
            )
        ).first()
        
        if not workout_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout set '{set_id}' not found"
            )
        
        # Check if the workout is completed
        workout = db.query(WorkoutModel).filter(
            WorkoutModel.id == workout_set.workout_id
        ).first()
        
        if workout.is_completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete sets from a completed workout"
            )
        
        db.delete(workout_set)
        db.commit()  # This will trigger the workout metrics update via database trigger
        
        logger.info(f"Deleted workout set: {set_id} for user {user_id}")
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content={})
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting workout set {set_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete workout set"
        )


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@router.get("/analytics/personal-bests/{exercise_id}")
async def get_personal_bests_for_exercise(
    exercise_id: str,
    limit: int = Query(10, ge=1, le=50, description="Number of personal bests to return"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get personal best sets for a specific exercise
    
    **Path Parameters:**
    - exercise_id: Exercise to analyze
    
    **Query Parameters:**
    - limit: Number of personal bests to return (default: 10, max: 50)
    
    **Returns:**
    - List of personal best sets ordered by estimated 1RM
    """
    try:
        personal_bests = db.query(WorkoutSet).join(WorkoutModel).filter(
            and_(
                WorkoutSet.user_id == user_id,
                WorkoutSet.exercise_id == exercise_id,
                WorkoutSet.is_personal_best == True,
                WorkoutModel.is_completed == True
            )
        ).order_by(
            desc(WorkoutSet.estimated_one_rep_max)
        ).limit(limit).all()
        
        return {
            "exercise_id": exercise_id,
            "personal_bests": personal_bests,
            "total_count": len(personal_bests)
        }
        
    except Exception as e:
        logger.error(f"Error fetching personal bests for exercise {exercise_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch personal bests"
        )


@router.get("/analytics/progression/{exercise_id}")
async def get_exercise_progression(
    exercise_id: str,
    days_back: int = Query(90, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get progression analysis for a specific exercise
    
    **Path Parameters:**
    - exercise_id: Exercise to analyze
    
    **Query Parameters:**
    - days_back: Number of days to analyze (default: 90, max: 365)
    
    **Returns:**
    - Progression data with volume and strength trends
    """
    try:
        start_date = datetime.utcnow() - timedelta(days=days_back)
        
        sets = db.query(WorkoutSet).join(WorkoutModel).filter(
            and_(
                WorkoutSet.user_id == user_id,
                WorkoutSet.exercise_id == exercise_id,
                WorkoutSet.created_at >= start_date,
                WorkoutModel.is_completed == True
            )
        ).order_by(WorkoutSet.created_at).all()
        
        if not sets:
            return {
                "exercise_id": exercise_id,
                "message": "No data found for the specified period",
                "progression": []
            }
        
        # Calculate weekly aggregations
        weekly_data = {}
        for workout_set in sets:
            week_key = workout_set.created_at.strftime("%Y-W%U")
            if week_key not in weekly_data:
                weekly_data[week_key] = {
                    "week": week_key,
                    "total_volume": 0,
                    "max_weight": 0,
                    "max_1rm": 0,
                    "total_sets": 0
                }
            
            weekly_data[week_key]["total_volume"] += float(workout_set.volume_lbs)
            weekly_data[week_key]["max_weight"] = max(
                weekly_data[week_key]["max_weight"], 
                float(workout_set.weight_lbs)
            )
            weekly_data[week_key]["max_1rm"] = max(
                weekly_data[week_key]["max_1rm"], 
                float(workout_set.estimated_one_rep_max)
            )
            weekly_data[week_key]["total_sets"] += 1
        
        progression_data = list(weekly_data.values())
        
        # Calculate trends
        if len(progression_data) >= 2:
            first_week = progression_data[0]
            last_week = progression_data[-1]
            
            volume_trend = (
                (last_week["total_volume"] - first_week["total_volume"]) 
                / first_week["total_volume"] * 100
            ) if first_week["total_volume"] > 0 else 0
            
            strength_trend = (
                (last_week["max_1rm"] - first_week["max_1rm"]) 
                / first_week["max_1rm"] * 100
            ) if first_week["max_1rm"] > 0 else 0
        else:
            volume_trend = 0
            strength_trend = 0
        
        return {
            "exercise_id": exercise_id,
            "days_analyzed": days_back,
            "total_sets": len(sets),
            "progression": progression_data,
            "trends": {
                "volume_change_percentage": round(volume_trend, 2),
                "strength_change_percentage": round(strength_trend, 2)
            }
        }
        
    except Exception as e:
        logger.error(f"Error analyzing progression for exercise {exercise_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze exercise progression"
        )