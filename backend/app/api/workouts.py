"""
Workouts API Router
Workout session management and tracking endpoints with full database integration
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import logging
import sys
import os
from uuid import uuid4

# Add schemas to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", "..", "schemas"))

from pydantic_models import Workout, WorkoutCreate, WorkoutUpdate, WorkoutSet, WorkoutSetCreate, WorkoutSetUpdate
from ..core.database import get_database, DatabaseManager, DatabaseUtils

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[Workout])
async def get_workouts(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    workout_type: Optional[str] = Query(None, description="Filter by workout type"),
    start_date: Optional[date] = Query(None, description="Filter workouts after this date"),
    end_date: Optional[date] = Query(None, description="Filter workouts before this date"),
    is_completed: Optional[bool] = Query(None, description="Filter by completion status"),
    limit: int = Query(50, ge=1, le=100, description="Number of workouts to return"),
    offset: int = Query(0, ge=0, description="Number of workouts to skip"),
    db: DatabaseManager = Depends(get_database)
):
    """
    Get workouts with optional filtering
    Supports filtering by user, type, date range, and completion status
    """
    logger.info("🔥 get_workouts ENTRY", extra={
        "user_id": user_id, "workout_type": workout_type, 
        "start_date": start_date, "end_date": end_date,
        "is_completed": is_completed, "limit": limit, "offset": offset
    })
    
    try:
        # Build secure parameterized query
        query_conditions = ["1=1"]
        params = []
        
        if user_id:
            query_conditions.append("user_id = $" + str(len(params) + 1))
            params.append(user_id)
        
        if workout_type:
            query_conditions.append("workout_type = $" + str(len(params) + 1))
            params.append(workout_type)
        
        if start_date:
            query_conditions.append("started_at >= $" + str(len(params) + 1))
            params.append(start_date)
        
        if end_date:
            query_conditions.append("started_at <= $" + str(len(params) + 1))
            params.append(end_date)
        
        if is_completed is not None:
            query_conditions.append("is_completed = $" + str(len(params) + 1))
            params.append(is_completed)
        
        # Build final query with pagination parameters
        where_clause = " AND ".join(query_conditions)
        base_query = f"SELECT * FROM workouts WHERE {where_clause}"
        
        # Add ORDER BY, LIMIT, OFFSET as parameters
        params.extend([limit, offset])
        limit_param = "$" + str(len(params) - 1)  # limit
        offset_param = "$" + str(len(params))     # offset
        
        paginated_query = f"{base_query} ORDER BY started_at DESC LIMIT {limit_param} OFFSET {offset_param}"
        
        logger.info("🔧 Executing workout query", extra={
            "query": paginated_query, "params": params
        })
        
        results = await db.execute_query(paginated_query, *params, fetch=True)
        
        logger.info("🔧 Query results", extra={
            "count": len(results) if results else 0
        })
        
        return results or []
        
    except Exception as e:
        logger.error(f"🚨 get_workouts FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve workouts: {str(e)}"
        )


@router.get("/{workout_id}", response_model=Workout)
async def get_workout(
    workout_id: str,
    db: DatabaseManager = Depends(get_database)
):
    """Get workout by ID with full details"""
    logger.info("🔥 get_workout ENTRY", extra={"workout_id": workout_id})
    
    try:
        # Verify workout exists
        workout = await db.execute_query(
            "SELECT * FROM workouts WHERE id = $1",
            workout_id,
            fetch_one=True
        )
        
        if not workout:
            logger.warning("🚨 Workout not found", extra={"workout_id": workout_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout with ID {workout_id} not found"
            )
        
        logger.info("🔧 Workout retrieved successfully", extra={
            "workout_id": workout_id, "workout_type": workout.get("workout_type")
        })
        
        return workout
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 get_workout FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve workout: {str(e)}"
        )


@router.post("/", response_model=Workout, status_code=status.HTTP_201_CREATED)
async def create_workout(
    workout: WorkoutCreate,
    db: DatabaseManager = Depends(get_database)
):
    """Create new workout session"""
    logger.info("🔥 create_workout ENTRY", extra={
        "user_id": workout.user_id, "workout_type": workout.workout_type
    })
    
    try:
        # Verify user exists
        user_exists = await DatabaseUtils.verify_user_exists(workout.user_id, db)
        if not user_exists:
            logger.warning("🚨 User not found", extra={"user_id": workout.user_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {workout.user_id} not found"
            )
        
        # Generate workout ID
        workout_id = str(uuid4())
        current_time = datetime.utcnow()
        
        logger.info("🔧 Creating workout", extra={
            "workout_id": workout_id, "timestamp": current_time
        })
        
        # Insert workout record - ONLY using columns that exist in database schema
        insert_query = """
            INSERT INTO workouts (
                id, user_id, workout_type, name, 
                started_at, variation, notes, is_completed
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8
            ) RETURNING *
        """
        
        created_workout = await db.execute_query(
            insert_query,
            workout_id,
            workout.user_id,
            workout.workout_type,
            workout.name,
            workout.started_at or current_time,
            workout.variation,  # A/B periodization variation
            workout.notes,
            False,  # New workouts start as not completed
            fetch_one=True
        )
        
        logger.info("🔧 Workout created successfully", extra={
            "workout_id": workout_id, "user_id": workout.user_id
        })
        
        return created_workout
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 create_workout FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workout: {str(e)}"
        )


@router.put("/{workout_id}", response_model=Workout)
async def update_workout(workout_id: str, workout_update: WorkoutUpdate):
    """Update workout details"""
    # TODO: Implement workout update
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout(workout_id: str):
    """Delete workout session"""
    # TODO: Implement workout deletion
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.post("/{workout_id}/complete")
async def complete_workout(
    workout_id: str,
    db: DatabaseManager = Depends(get_database)
):
    """Mark workout as completed and calculate metrics"""
    logger.info("🔥 complete_workout ENTRY", extra={"workout_id": workout_id})
    
    try:
        # Verify workout exists and is not already completed
        workout = await db.execute_query(
            "SELECT * FROM workouts WHERE id = $1",
            workout_id,
            fetch_one=True
        )
        
        if not workout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout with ID {workout_id} not found"
            )
        
        if workout["is_completed"]:
            logger.warning("🚨 Workout already completed", extra={"workout_id": workout_id})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workout is already completed"
            )
        
        current_time = datetime.utcnow()
        
        # Get workout sets for muscle fatigue calculation (volume calculated by DB trigger)
        workout_sets = await db.execute_query(
            """
            SELECT ws.*, e.muscle_engagement_data
            FROM workout_sets ws
            JOIN exercises e ON ws.exercise_id = e.id
            WHERE ws.workout_id = $1
            """,
            workout_id,
            fetch=True
        )
        
        logger.info("🔧 Processing workout completion", extra={
            "workout_id": workout_id, "sets_count": len(workout_sets) if workout_sets else 0
        })
        
        # Calculate muscle fatigue data (let DB trigger handle volume calculations)
        muscle_fatigue_data = {}
        
        if workout_sets:
            for set_data in workout_sets:
                # Use the pre-calculated volume_lbs from the set (calculated by trigger)
                set_volume = float(set_data.get("volume_lbs", 0))
                
                # Process muscle engagement for fatigue calculation
                muscle_engagement = set_data.get("muscle_engagement_data", {})
                if isinstance(muscle_engagement, dict):
                    for muscle, percentage in muscle_engagement.items():
                        if muscle not in muscle_fatigue_data:
                            muscle_fatigue_data[muscle] = 0.0
                        # Weight fatigue contribution by muscle engagement percentage
                        muscle_fatigue_data[muscle] += set_volume * (float(percentage) / 100.0)
        
        logger.info("🔧 Calculated muscle fatigue data", extra={
            "muscles_engaged": len(muscle_fatigue_data)
        })
        
        # Update workout completion (let DB triggers calculate volume/sets/reps)
        update_query = """
            UPDATE workouts SET
                is_completed = true,
                ended_at = $2,
                updated_at = $2
            WHERE id = $1
            RETURNING *
        """
        
        completed_workout = await db.execute_query(
            update_query,
            workout_id,
            current_time,
            fetch_one=True
        )
        
        # Update user muscle states for fatigue tracking
        user_id = workout["user_id"]
        if muscle_fatigue_data:
            await update_muscle_states(user_id, muscle_fatigue_data, current_time, db)
        
        # Use database-calculated metrics (from triggers)
        db_total_volume = float(completed_workout.get("total_volume_lbs", 0))
        db_total_sets = int(completed_workout.get("total_sets", 0))
        db_total_reps = int(completed_workout.get("total_reps", 0))
        db_exercises_count = int(completed_workout.get("exercises_count", 0))
        
        # Calculate duration from timestamps
        duration_seconds = completed_workout.get("duration_seconds", 0)
        duration_minutes = int(duration_seconds / 60) if duration_seconds else 0
        
        logger.info("🔧 Workout completed successfully", extra={
            "workout_id": workout_id, 
            "total_volume_lbs": db_total_volume,
            "total_sets": db_total_sets,
            "duration_minutes": duration_minutes
        })
        
        return {
            "message": "Workout completed successfully",
            "workout": completed_workout,
            "metrics": {
                "total_volume_lbs": db_total_volume,  # From DB trigger
                "total_sets": db_total_sets,          # From DB trigger  
                "total_reps": db_total_reps,          # From DB trigger
                "exercises_count": db_exercises_count, # From DB trigger
                "duration_minutes": duration_minutes,
                "muscle_engagement": muscle_fatigue_data
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 complete_workout FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete workout: {str(e)}"
        )


async def update_muscle_states(
    user_id: str, 
    muscle_fatigue_data: Dict[str, float], 
    workout_time: datetime,
    db: DatabaseManager
):
    """Update user muscle states based on workout fatigue"""
    logger.info("🔧 Updating muscle states", extra={
        "user_id": user_id, "muscles_count": len(muscle_fatigue_data)
    })
    
    for muscle_name, fatigue_amount in muscle_fatigue_data.items():
        # Upsert muscle state record
        upsert_query = """
            INSERT INTO muscle_states (
                id, user_id, muscle_name, current_fatigue_percentage,
                last_workout_date, total_volume_lifetime, updated_at
            ) VALUES (
                gen_random_uuid(), $1, $2, $3, $4, $5, $4
            )
            ON CONFLICT (user_id, muscle_name) 
            DO UPDATE SET
                current_fatigue_percentage = LEAST(100.0, muscle_states.current_fatigue_percentage + $3),
                last_workout_date = $4,
                total_volume_lifetime = muscle_states.total_volume_lifetime + $5,
                updated_at = $4
        """
        
        await db.execute_query(
            upsert_query,
            user_id,
            muscle_name,
            min(20.0, fatigue_amount / 100.0),  # Cap fatigue increase per workout
            workout_time,
            fatigue_amount
        )


# Workout Sets endpoints
@router.get("/{workout_id}/sets", response_model=List[WorkoutSet])
async def get_workout_sets(workout_id: str):
    """Get all sets for a workout"""
    # TODO: Implement workout sets retrieval
    return []


@router.post("/{workout_id}/sets", response_model=WorkoutSet, status_code=status.HTTP_201_CREATED)
async def create_workout_set(workout_id: str, workout_set: WorkoutSetCreate):
    """Add new set to workout"""
    # TODO: Implement workout set creation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.put("/{workout_id}/sets/{set_id}", response_model=WorkoutSet)
async def update_workout_set(workout_id: str, set_id: str, set_update: WorkoutSetUpdate):
    """Update workout set details"""
    # TODO: Implement workout set update
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.delete("/{workout_id}/sets/{set_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout_set(workout_id: str, set_id: str):
    """Delete workout set"""
    # TODO: Implement workout set deletion
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.get("/{workout_id}/summary")
async def get_workout_summary(workout_id: str):
    """Get workout summary with calculated metrics"""
    # TODO: Implement workout summary calculation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.get("/{workout_id}/muscle-engagement")
async def get_workout_muscle_engagement(workout_id: str):
    """Get muscle engagement data for entire workout"""
    # TODO: Implement workout muscle engagement calculation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )