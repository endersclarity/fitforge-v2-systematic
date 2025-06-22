"""
Example: Updated Workouts API Router with New Error Handling
This shows how to refactor existing endpoints to use the new error handling system
"""

from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from datetime import datetime, date
import logging
from uuid import uuid4

from app.models.schemas import Workout, WorkoutCreate, WorkoutUpdate
from app.core.database import get_database, DatabaseManager, DatabaseUtils
from app.core.exceptions import (
    NotFoundError,
    ValidationError,
    DatabaseError,
    BusinessLogicError
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{workout_id}", response_model=Workout)
async def get_workout(
    workout_id: str,
    db: DatabaseManager = Depends(get_database)
):
    """
    Get workout by ID with full details
    Now using custom exceptions for better error handling
    """
    logger.info("🔥 get_workout ENTRY", extra={"workout_id": workout_id})
    
    try:
        # Verify workout exists
        workout = await db.execute_query(
            "SELECT * FROM workouts WHERE id = $1",
            workout_id,
            fetch_one=True
        )
        
        if not workout:
            # Use custom NotFoundError instead of HTTPException
            raise NotFoundError(
                resource_type="workout",
                resource_id=workout_id
            )
        
        logger.info("🔧 Workout retrieved successfully", extra={
            "workout_id": workout_id, 
            "workout_type": workout.get("workout_type")
        })
        
        return workout
        
    except (NotFoundError, ValidationError, BusinessLogicError):
        # Re-raise our custom exceptions
        raise
    except Exception as e:
        # Wrap unexpected errors in DatabaseError
        logger.error(f"🚨 get_workout FAILURE - {str(e)}", exc_info=True)
        raise DatabaseError(
            message="Failed to retrieve workout",
            operation="query",
            details={"workout_id": workout_id}
        )


@router.post("/", response_model=Workout, status_code=201)
async def create_workout(
    workout: WorkoutCreate,
    db: DatabaseManager = Depends(get_database)
):
    """
    Create new workout session
    Demonstrates business logic validation with custom exceptions
    """
    logger.info("🔥 create_workout ENTRY", extra={
        "user_id": workout.user_id, 
        "workout_type": workout.workout_type
    })
    
    try:
        # Verify user exists
        user_exists = await DatabaseUtils.verify_user_exists(workout.user_id, db)
        if not user_exists:
            raise NotFoundError(
                resource_type="user",
                resource_id=workout.user_id,
                message=f"Cannot create workout for non-existent user"
            )
        
        # Business logic validation example
        if workout.started_at and workout.started_at > datetime.utcnow():
            raise BusinessLogicError(
                message="Workout cannot be scheduled in the future",
                rule_violated="workout_start_time_must_be_past_or_present",
                details={
                    "provided_start_time": workout.started_at.isoformat(),
                    "current_time": datetime.utcnow().isoformat()
                }
            )
        
        # Validate workout type
        valid_workout_types = ["push", "pull", "legs", "upper", "lower", "full_body", "cardio", "custom"]
        if workout.workout_type not in valid_workout_types:
            raise ValidationError(
                message="Invalid workout type",
                field_errors={
                    "workout_type": [
                        f"Must be one of: {', '.join(valid_workout_types)}",
                        f"Received: {workout.workout_type}"
                    ]
                }
            )
        
        # Generate workout ID
        workout_id = str(uuid4())
        current_time = datetime.utcnow()
        
        # Insert workout record
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
            workout.variation,
            workout.notes,
            False,
            fetch_one=True
        )
        
        logger.info("🔧 Workout created successfully", extra={
            "workout_id": workout_id, 
            "user_id": workout.user_id
        })
        
        return created_workout
        
    except (NotFoundError, ValidationError, BusinessLogicError):
        # Re-raise our custom exceptions
        raise
    except Exception as e:
        logger.error(f"🚨 create_workout FAILURE - {str(e)}", exc_info=True)
        
        # Check for database constraint violations
        if "duplicate key" in str(e).lower():
            raise ValidationError(
                message="A workout with these details already exists",
                field_errors={"workout": ["Duplicate workout entry"]}
            )
        
        raise DatabaseError(
            message="Failed to create workout",
            operation="insert",
            details={"user_id": workout.user_id}
        )