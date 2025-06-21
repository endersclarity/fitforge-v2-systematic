"""
FitForge Workout Sessions API Router
Created: December 21, 2024
Purpose: RESTful endpoints for workout session management

This module implements the complete workout session API with:
- CRUD operations for workout sessions
- Session timing and duration tracking
- Progressive overload analysis and recommendations
- Workout templates and A/B periodization support
- Session analytics and volume calculations
- Real-time session state management

All endpoints use proper authentication and include calculated metrics
like total volume, duration, and progressive overload percentages.
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
    Workout, WorkoutCreate, WorkoutUpdate,
    WorkoutType, Variation
)
from ..auth import get_current_user, get_user_id
from ..services.workout_calculator import WorkoutCalculatorService
from ..services.progressive_overload import ProgressiveOverloadService

# Configure logging
logger = logging.getLogger(__name__)

# Create router with prefix and tags for OpenAPI documentation
router = APIRouter(
    prefix="/workouts",
    tags=["Workout Sessions"],
    responses={
        404: {"description": "Workout not found"},
        400: {"description": "Invalid request parameters"},
        403: {"description": "Access denied - user can only access own workouts"},
        500: {"description": "Internal server error"}
    }
)


# ============================================================================
# QUERY PARAMETER MODELS
# ============================================================================

class WorkoutFilters:
    """Query parameters for workout filtering and search"""
    
    def __init__(
        self,
        # Date filtering
        start_date: Optional[datetime] = Query(None, description="Filter workouts after this date"),
        end_date: Optional[datetime] = Query(None, description="Filter workouts before this date"),
        
        # Workout characteristics
        workout_type: Optional[WorkoutType] = Query(None, description="Filter by workout type"),
        variation: Optional[Variation] = Query(None, description="Filter by A/B variation"),
        is_completed: Optional[bool] = Query(None, description="Filter by completion status"),
        
        # Search
        search: Optional[str] = Query(None, description="Search workout names and notes"),
        
        # Pagination
        page: int = Query(1, ge=1, description="Page number (1-based)"),
        page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
        
        # Sorting
        sort_by: str = Query("started_at", description="Sort field: started_at, duration_seconds, total_volume_lbs"),
        sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order: asc or desc")
    ):
        self.start_date = start_date
        self.end_date = end_date
        self.workout_type = workout_type
        self.variation = variation
        self.is_completed = is_completed
        self.search = search
        self.page = page
        self.page_size = page_size
        self.sort_by = sort_by
        self.sort_order = sort_order


# ============================================================================
# READ OPERATIONS
# ============================================================================

@router.get("/", response_model=Dict[str, Any])
async def get_user_workouts(
    filters: WorkoutFilters = Depends(),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get paginated list of user's workouts with filtering
    
    **Query Parameters:**
    - start_date: Filter workouts after this date (ISO format)
    - end_date: Filter workouts before this date (ISO format)
    - workout_type: Filter by type (Push, Pull, Legs, Full Body, Custom)
    - variation: Filter by A/B periodization variation
    - is_completed: Filter by completion status (true/false)
    - search: Search in workout names and notes
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    - sort_by: Sort field (started_at, duration_seconds, total_volume_lbs)
    - sort_order: Sort order (asc, desc)
    
    **Returns:**
    - workouts: List of workout objects with calculated metrics
    - pagination: Page metadata
    - analytics: Summary statistics for filtered workouts
    """
    try:
        # Build base query - user can only see their own workouts
        query = db.query(Workout).filter(Workout.user_id == user_id)
        
        # Apply filters
        active_filters = {}
        
        if filters.start_date:
            query = query.filter(Workout.started_at >= filters.start_date)
            active_filters["start_date"] = filters.start_date
        
        if filters.end_date:
            query = query.filter(Workout.started_at <= filters.end_date)
            active_filters["end_date"] = filters.end_date
        
        if filters.workout_type:
            query = query.filter(Workout.workout_type == filters.workout_type)
            active_filters["workout_type"] = filters.workout_type
        
        if filters.variation:
            query = query.filter(Workout.variation == filters.variation)
            active_filters["variation"] = filters.variation
        
        if filters.is_completed is not None:
            query = query.filter(Workout.is_completed == filters.is_completed)
            active_filters["is_completed"] = filters.is_completed
        
        if filters.search:
            search_term = f"%{filters.search.lower()}%"
            query = query.filter(
                or_(
                    Workout.name.ilike(search_term),
                    Workout.notes.ilike(search_term)
                )
            )
            active_filters["search"] = filters.search
        
        # Get total count and analytics before pagination
        total_items = query.count()
        
        # Calculate summary analytics for filtered results
        analytics_result = query.with_entities(
            func.count(Workout.id).label("total_workouts"),
            func.sum(Workout.total_volume_lbs).label("total_volume"),
            func.avg(Workout.duration_seconds).label("avg_duration"),
            func.avg(Workout.total_volume_lbs).label("avg_volume")
        ).first()
        
        analytics = {
            "total_workouts": analytics_result.total_workouts or 0,
            "total_volume_lbs": float(analytics_result.total_volume or 0),
            "avg_duration_minutes": round(float(analytics_result.avg_duration or 0) / 60, 1),
            "avg_volume_lbs": round(float(analytics_result.avg_volume or 0), 2)
        }
        
        # Apply sorting
        sort_column = getattr(Workout, filters.sort_by, Workout.started_at)
        if filters.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        workouts = query.offset(offset).limit(filters.page_size).all()
        
        # Calculate pagination metadata
        total_pages = (total_items + filters.page_size - 1) // filters.page_size
        
        return {
            "workouts": workouts,
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
        logger.error(f"Error fetching workouts for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch workouts"
        )


@router.get("/current", response_model=Optional[Workout])
async def get_current_workout(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get user's current active (not completed) workout session
    
    **Returns:**
    - Current workout object if exists, null if no active workout
    """
    try:
        current_workout = db.query(Workout).filter(
            and_(
                Workout.user_id == user_id,
                Workout.is_completed == False
            )
        ).order_by(desc(Workout.started_at)).first()
        
        return current_workout
        
    except Exception as e:
        logger.error(f"Error fetching current workout for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch current workout"
        )


@router.get("/{workout_id}", response_model=Workout)
async def get_workout(
    workout_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get a specific workout by ID
    
    **Path Parameters:**
    - workout_id: UUID of the workout
    
    **Returns:**
    - Complete workout object with calculated metrics
    """
    try:
        workout = db.query(Workout).filter(
            and_(
                Workout.id == workout_id,
                Workout.user_id == user_id  # Users can only access their own workouts
            )
        ).first()
        
        if not workout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout '{workout_id}' not found"
            )
        
        return workout
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching workout {workout_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch workout"
        )


# ============================================================================
# CREATE OPERATIONS
# ============================================================================

@router.post("/", response_model=Workout, status_code=status.HTTP_201_CREATED)
async def create_workout(
    workout_data: WorkoutCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Create a new workout session
    
    **Request Body:**
    - workout data following WorkoutCreate schema
    - user_id is automatically set from authentication
    - started_at defaults to current time if not provided
    
    **Returns:**
    - Created workout object
    """
    try:
        # Check if user has an active workout
        active_workout = db.query(Workout).filter(
            and_(
                Workout.user_id == user_id,
                Workout.is_completed == False
            )
        ).first()
        
        if active_workout:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User already has an active workout (ID: {active_workout.id}). Complete it before starting a new one."
            )
        
        # Set user_id from authentication
        workout_dict = workout_data.dict()
        workout_dict["user_id"] = user_id
        
        # Find previous workout for progressive overload tracking
        previous_workout = None
        if workout_data.workout_type:
            previous_workout = db.query(Workout).filter(
                and_(
                    Workout.user_id == user_id,
                    Workout.workout_type == workout_data.workout_type,
                    Workout.is_completed == True
                )
            ).order_by(desc(Workout.started_at)).first()
        
        if previous_workout:
            workout_dict["previous_workout_id"] = previous_workout.id
        
        # Create new workout
        workout = Workout(**workout_dict)
        db.add(workout)
        db.commit()
        db.refresh(workout)
        
        logger.info(f"Created workout: {workout.id} for user {user_id}")
        return workout
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating workout for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create workout"
        )


# ============================================================================
# UPDATE OPERATIONS
# ============================================================================

@router.put("/{workout_id}", response_model=Workout)
async def update_workout(
    workout_id: str,
    workout_update: WorkoutUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Update an existing workout
    
    **Path Parameters:**
    - workout_id: UUID of the workout to update
    
    **Request Body:**
    - Partial workout data following WorkoutUpdate schema
    - Only provided fields will be updated
    
    **Returns:**
    - Updated workout object with recalculated metrics
    """
    try:
        workout = db.query(Workout).filter(
            and_(
                Workout.id == workout_id,
                Workout.user_id == user_id
            )
        ).first()
        
        if not workout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout '{workout_id}' not found"
            )
        
        # Update only provided fields
        update_data = workout_update.dict(exclude_unset=True)
        
        # If completing the workout, calculate progressive overload
        if update_data.get("is_completed") and not workout.is_completed:
            if workout.previous_workout_id:
                previous_workout = db.query(Workout).filter(
                    Workout.id == workout.previous_workout_id
                ).first()
                
                if previous_workout and previous_workout.total_volume_lbs > 0:
                    volume_increase = (
                        (workout.total_volume_lbs - previous_workout.total_volume_lbs) 
                        / previous_workout.total_volume_lbs * 100
                    )
                    update_data["volume_increase_percentage"] = round(volume_increase, 2)
        
        # Apply updates
        for field, value in update_data.items():
            setattr(workout, field, value)
        
        db.commit()
        db.refresh(workout)
        
        logger.info(f"Updated workout: {workout_id} for user {user_id}")
        return workout
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating workout {workout_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update workout"
        )


@router.post("/{workout_id}/complete", response_model=Workout)
async def complete_workout(
    workout_id: str,
    completion_data: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Complete a workout session with optional feedback
    
    **Path Parameters:**
    - workout_id: UUID of the workout to complete
    
    **Request Body (Optional):**
    - notes: Session notes
    - energy_level: Energy level (1-5)
    - perceived_exertion: RPE scale (1-10)
    
    **Returns:**
    - Completed workout with calculated metrics and progressive overload analysis
    """
    try:
        workout = db.query(Workout).filter(
            and_(
                Workout.id == workout_id,
                Workout.user_id == user_id
            )
        ).first()
        
        if not workout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout '{workout_id}' not found"
            )
        
        if workout.is_completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workout is already completed"
            )
        
        # Set completion data
        workout.is_completed = True
        workout.ended_at = datetime.utcnow()
        
        # Apply optional completion data
        if completion_data:
            if "notes" in completion_data:
                workout.notes = completion_data["notes"]
            if "energy_level" in completion_data:
                workout.energy_level = completion_data["energy_level"]
            if "perceived_exertion" in completion_data:
                workout.perceived_exertion = completion_data["perceived_exertion"]
        
        # Calculate progressive overload if there's a previous workout
        if workout.previous_workout_id:
            previous_workout = db.query(Workout).filter(
                Workout.id == workout.previous_workout_id
            ).first()
            
            if previous_workout and previous_workout.total_volume_lbs > 0:
                volume_increase = (
                    (workout.total_volume_lbs - previous_workout.total_volume_lbs) 
                    / previous_workout.total_volume_lbs * 100
                )
                workout.volume_increase_percentage = round(volume_increase, 2)
        
        db.commit()
        db.refresh(workout)
        
        logger.info(f"Completed workout: {workout_id} for user {user_id}")
        return workout
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error completing workout {workout_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete workout"
        )


# ============================================================================
# DELETE OPERATIONS
# ============================================================================

@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout(
    workout_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Delete a workout session
    
    This will also delete all associated workout sets via CASCADE
    
    **Path Parameters:**
    - workout_id: UUID of the workout to delete
    
    **Returns:**
    - HTTP 204 No Content on success
    """
    try:
        workout = db.query(Workout).filter(
            and_(
                Workout.id == workout_id,
                Workout.user_id == user_id
            )
        ).first()
        
        if not workout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout '{workout_id}' not found"
            )
        
        db.delete(workout)
        db.commit()
        
        logger.info(f"Deleted workout: {workout_id} for user {user_id}")
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content={})
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting workout {workout_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete workout"
        )


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@router.get("/analytics/weekly-summary")
async def get_weekly_workout_summary(
    weeks_back: int = Query(4, ge=1, le=12, description="Number of weeks to analyze"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get weekly workout summary analytics
    
    **Query Parameters:**
    - weeks_back: Number of weeks to analyze (default: 4, max: 12)
    
    **Returns:**
    - Weekly breakdown of workout frequency, volume, and duration
    """
    try:
        start_date = datetime.utcnow() - timedelta(weeks=weeks_back)
        
        result = db.execute(
            text("""
                SELECT 
                    DATE_TRUNC('week', started_at) as week_start,
                    COUNT(*) as workout_count,
                    SUM(total_volume_lbs) as total_volume,
                    AVG(duration_seconds) as avg_duration,
                    STRING_AGG(DISTINCT workout_type, ', ') as workout_types
                FROM workouts 
                WHERE user_id = :user_id 
                    AND started_at >= :start_date
                    AND is_completed = true
                GROUP BY DATE_TRUNC('week', started_at)
                ORDER BY week_start DESC
            """),
            {"user_id": user_id, "start_date": start_date}
        )
        
        weekly_data = []
        for row in result:
            weekly_data.append({
                "week_start": row.week_start,
                "workout_count": row.workout_count,
                "total_volume_lbs": float(row.total_volume or 0),
                "avg_duration_minutes": round(float(row.avg_duration or 0) / 60, 1),
                "workout_types": row.workout_types
            })
        
        return {
            "weeks_analyzed": weeks_back,
            "weekly_data": weekly_data,
            "total_workouts": sum(week["workout_count"] for week in weekly_data),
            "total_volume": sum(week["total_volume_lbs"] for week in weekly_data)
        }
        
    except Exception as e:
        logger.error(f"Error fetching weekly summary for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch weekly workout summary"
        )


@router.get("/analytics/progressive-overload")
async def get_progressive_overload_analysis(
    workout_type: Optional[WorkoutType] = Query(None, description="Analyze specific workout type"),
    limit: int = Query(10, ge=1, le=20, description="Number of recent workouts to analyze"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Analyze progressive overload trends
    
    **Query Parameters:**
    - workout_type: Focus on specific workout type (optional)
    - limit: Number of recent workouts to analyze (default: 10, max: 20)
    
    **Returns:**
    - Progressive overload analysis with trends and recommendations
    """
    try:
        query = db.query(Workout).filter(
            and_(
                Workout.user_id == user_id,
                Workout.is_completed == True,
                Workout.volume_increase_percentage.isnot(None)
            )
        )
        
        if workout_type:
            query = query.filter(Workout.workout_type == workout_type)
        
        workouts = query.order_by(desc(Workout.started_at)).limit(limit).all()
        
        if not workouts:
            return {
                "message": "No completed workouts with progressive overload data found",
                "analysis": None
            }
        
        # Calculate trends
        volume_increases = [w.volume_increase_percentage for w in workouts]
        avg_increase = sum(volume_increases) / len(volume_increases)
        positive_increases = [x for x in volume_increases if x > 0]
        
        analysis = {
            "total_workouts_analyzed": len(workouts),
            "avg_volume_increase_percentage": round(avg_increase, 2),
            "positive_progressions": len(positive_increases),
            "positive_progression_rate": round(len(positive_increases) / len(workouts) * 100, 1),
            "recent_workouts": [
                {
                    "workout_id": w.id,
                    "date": w.started_at,
                    "workout_type": w.workout_type,
                    "volume_increase_percentage": w.volume_increase_percentage,
                    "total_volume_lbs": float(w.total_volume_lbs)
                }
                for w in workouts
            ]
        }
        
        # Generate recommendations
        recommendations = []
        if avg_increase < 0:
            recommendations.append("Consider reducing weight/reps temporarily to ensure proper form")
        elif avg_increase < 3:
            recommendations.append("Try increasing weight by 2.5-5lbs or adding 1-2 reps per set")
        elif avg_increase > 10:
            recommendations.append("Great progress! Ensure you're maintaining proper form")
        
        analysis["recommendations"] = recommendations
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing progressive overload for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze progressive overload"
        )