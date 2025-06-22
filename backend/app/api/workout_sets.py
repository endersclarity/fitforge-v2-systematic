"""
Workout Sets API Router
Individual set tracking for workout sessions with comprehensive CRUD operations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from uuid import UUID, uuid4
from decimal import Decimal

from app.models.schemas import WorkoutSet, WorkoutSetCreate, WorkoutSetUpdate
from ..core.database import get_database, DatabaseManager, DatabaseUtils

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/",
    response_model=List[WorkoutSet],
    summary="List workout sets",
    description="Retrieve workout sets with filtering by workout_id or exercise_id. Results include calculated volume and are ordered by creation time.",
    response_description="List of workout sets",
    responses={
        200: {
            "description": "Workout sets retrieved successfully",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": "123e4567-e89b-12d3-a456-426614174000",
                            "workout_id": "550e8400-e29b-41d4-a716-446655440000",
                            "exercise_id": "bench_press",
                            "user_id": "550e8400-e29b-41d4-a716-446655440001",
                            "set_number": 1,
                            "reps": 10,
                            "weight_lbs": 135.0,
                            "time_under_tension_seconds": 30,
                            "rest_seconds": 90,
                            "perceived_exertion": 7,
                            "volume_lbs": 1350.0,
                            "estimated_one_rep_max": 180.0,
                            "is_personal_best": True,
                            "improvement_vs_last": 5.5,
                            "created_at": "2025-06-22T09:30:00Z",
                            "updated_at": "2025-06-22T09:30:00Z"
                        }
                    ]
                }
            }
        },
        500: {
            "description": "Server error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Failed to retrieve workout sets: Database connection error"
                    }
                }
            }
        }
    }
)
async def get_workout_sets(
    workout_id: Optional[str] = Query(None, description="Filter by workout ID"),
    exercise_id: Optional[str] = Query(None, description="Filter by exercise ID"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    limit: int = Query(100, ge=1, le=500, description="Number of sets to return"),
    offset: int = Query(0, ge=0, description="Number of sets to skip"),
    db: DatabaseManager = Depends(get_database)
):
    """
    Get workout sets with optional filtering
    Supports filtering by workout, exercise, or user
    """
    logger.info("🔥 get_workout_sets ENTRY", extra={
        "workout_id": workout_id, "exercise_id": exercise_id, 
        "user_id": user_id, "limit": limit, "offset": offset
    })
    
    try:
        # Build secure parameterized query
        query_conditions = ["1=1"]
        params = []
        
        if workout_id:
            query_conditions.append("workout_id = $" + str(len(params) + 1))
            params.append(workout_id)
        
        if exercise_id:
            query_conditions.append("exercise_id = $" + str(len(params) + 1))
            params.append(exercise_id)
        
        if user_id:
            query_conditions.append("user_id = $" + str(len(params) + 1))
            params.append(user_id)
        
        # Build final query with pagination
        where_clause = " AND ".join(query_conditions)
        base_query = f"""
            SELECT id, workout_id, exercise_id, user_id, set_number,
                   reps, weight_lbs, time_under_tension_seconds, rest_seconds,
                   perceived_exertion, volume_lbs, estimated_one_rep_max,
                   is_personal_best, improvement_vs_last, created_at, updated_at
            FROM workout_sets 
            WHERE {where_clause}
        """
        
        # Add ORDER BY, LIMIT, OFFSET as parameters
        params.extend([limit, offset])
        limit_param = "$" + str(len(params) - 1)
        offset_param = "$" + str(len(params))
        
        paginated_query = f"{base_query} ORDER BY created_at DESC LIMIT {limit_param} OFFSET {offset_param}"
        
        logger.info("🔧 Executing workout sets query", extra={
            "query": paginated_query, "params": params
        })
        
        results = await db.execute_query(paginated_query, *params, fetch=True)
        
        logger.info("🔧 Query results", extra={
            "count": len(results) if results else 0
        })
        
        return results or []
        
    except Exception as e:
        logger.error(f"🚨 get_workout_sets FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve workout sets: {str(e)}"
        )


@router.get(
    "/{set_id}",
    response_model=WorkoutSet,
    summary="Get workout set by ID",
    description="Retrieve a specific workout set by its unique identifier. Includes all set details and calculated metrics.",
    responses={
        200: {
            "description": "Workout set found and returned successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "workout_id": "550e8400-e29b-41d4-a716-446655440000",
                        "exercise_id": "bench_press",
                        "user_id": "550e8400-e29b-41d4-a716-446655440001",
                        "set_number": 1,
                        "reps": 10,
                        "weight_lbs": 135.0,
                        "time_under_tension_seconds": 30,
                        "rest_seconds": 90,
                        "perceived_exertion": 7,
                        "volume_lbs": 1350.0,
                        "estimated_one_rep_max": 180.0,
                        "is_personal_best": True,
                        "improvement_vs_last": 5.5,
                        "created_at": "2025-06-22T09:30:00Z",
                        "updated_at": "2025-06-22T09:30:00Z"
                    }
                }
            }
        },
        404: {
            "description": "Workout set not found",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Workout set not found"
                    }
                }
            }
        }
    }
)
async def get_workout_set(
    set_id: str,
    db: DatabaseManager = Depends(get_database)
):
    """Get workout set by ID with full details"""
    logger.info("🔥 get_workout_set ENTRY", extra={"set_id": set_id})
    
    try:
        # Verify set exists
        set_data = await db.execute_query(
            """
            SELECT id, workout_id, exercise_id, user_id, set_number,
                   reps, weight_lbs, time_under_tension_seconds, rest_seconds,
                   perceived_exertion, volume_lbs, estimated_one_rep_max,
                   is_personal_best, improvement_vs_last, created_at, updated_at
            FROM workout_sets 
            WHERE id = $1
            """,
            set_id,
            fetch_one=True
        )
        
        if not set_data:
            logger.warning("🚨 Workout set not found", extra={"set_id": set_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout set with ID {set_id} not found"
            )
        
        logger.info("🔧 Workout set retrieved successfully", extra={
            "set_id": set_id, "exercise_id": set_data.get("exercise_id")
        })
        
        return set_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 get_workout_set FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve workout set: {str(e)}"
        )


@router.post(
    "/",
    response_model=WorkoutSet,
    status_code=status.HTTP_201_CREATED,
    summary="Create workout set",
    description="Create a new workout set with validation for weight increments (0.25 lb), reps (1-50), and RPE (1-10). Set number is auto-calculated sequentially.",
    responses={
        201: {
            "description": "Workout set created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "workout_id": "550e8400-e29b-41d4-a716-446655440000",
                        "exercise_id": "bench_press",
                        "user_id": "550e8400-e29b-41d4-a716-446655440001",
                        "set_number": 1,
                        "reps": 10,
                        "weight_lbs": 135.0,
                        "time_under_tension_seconds": 30,
                        "rest_seconds": 90,
                        "perceived_exertion": 7,
                        "volume_lbs": 1350.0,
                        "estimated_one_rep_max": 180.0,
                        "is_personal_best": False,
                        "improvement_vs_last": 0.0,
                        "created_at": "2025-06-22T09:30:00Z",
                        "updated_at": "2025-06-22T09:30:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Invalid input data",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Weight must be in 0.25 lb increments"
                    }
                }
            }
        },
        404: {
            "description": "Related resource not found",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Workout with ID 550e8400-e29b-41d4-a716-446655440000 not found"
                    }
                }
            }
        }
    }
)
async def create_workout_set(
    workout_set: WorkoutSetCreate,
    db: DatabaseManager = Depends(get_database)
):
    """Create new workout set with validation"""
    logger.info("🔥 create_workout_set ENTRY", extra={
        "workout_id": workout_set.workout_id,
        "exercise_id": workout_set.exercise_id,
        "weight": float(workout_set.weight_lbs),
        "reps": workout_set.reps
    })
    
    try:
        # Verify workout exists
        workout_exists = await db.execute_query(
            "SELECT id FROM workouts WHERE id = $1",
            workout_set.workout_id,
            fetch_one=True
        )
        if not workout_exists:
            logger.warning("🚨 Workout not found", extra={"workout_id": workout_set.workout_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout with ID {workout_set.workout_id} not found"
            )
        
        # Verify exercise exists
        exercise_exists = await db.execute_query(
            "SELECT id FROM exercises WHERE id = $1",
            workout_set.exercise_id,
            fetch_one=True
        )
        if not exercise_exists:
            logger.warning("🚨 Exercise not found", extra={"exercise_id": workout_set.exercise_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exercise with ID {workout_set.exercise_id} not found"
            )
        
        # Verify user exists
        user_exists = await DatabaseUtils.verify_user_exists(workout_set.user_id, db)
        if not user_exists:
            logger.warning("🚨 User not found", extra={"user_id": workout_set.user_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {workout_set.user_id} not found"
            )
        
        # Validate weight increment (0.25 lb increments) - handled by Pydantic
        # Validate reps range (1-50) - handled by Pydantic
        # Validate RPE range (1-10) if provided - handled by Pydantic
        
        # Get next set number if not provided
        if not workout_set.set_number:
            next_set_query = """
                SELECT COALESCE(MAX(set_number), 0) + 1 as next_set_number
                FROM workout_sets 
                WHERE workout_id = $1 AND exercise_id = $2
            """
            result = await db.execute_query(
                next_set_query,
                workout_set.workout_id,
                workout_set.exercise_id,
                fetch_one=True
            )
            set_number = result["next_set_number"]
        else:
            set_number = workout_set.set_number
            
            # Verify set number is sequential
            existing_set = await db.execute_query(
                """
                SELECT id FROM workout_sets 
                WHERE workout_id = $1 AND exercise_id = $2 AND set_number = $3
                """,
                workout_set.workout_id,
                workout_set.exercise_id,
                set_number,
                fetch_one=True
            )
            if existing_set:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Set number {set_number} already exists for this exercise in this workout"
                )
        
        # Calculate estimated one rep max using Epley formula if weight > 0 and reps > 1
        estimated_1rm = None
        if workout_set.weight_lbs > 0 and workout_set.reps > 1:
            estimated_1rm = float(workout_set.weight_lbs) * (1 + float(workout_set.reps) / 30)
            estimated_1rm = round(estimated_1rm, 2)
        
        # Check for personal best
        is_pb = await check_personal_best(
            db, 
            workout_set.user_id, 
            workout_set.exercise_id, 
            workout_set.weight_lbs,
            workout_set.reps
        )
        
        # Calculate improvement vs last
        improvement = await calculate_improvement(
            db,
            workout_set.user_id,
            workout_set.exercise_id,
            workout_set.weight_lbs,
            workout_set.reps
        )
        
        # Generate set ID
        set_id = str(uuid4())
        current_time = datetime.utcnow()
        
        logger.info("🔧 Creating workout set", extra={
            "set_id": set_id, "set_number": set_number,
            "estimated_1rm": estimated_1rm, "is_pb": is_pb
        })
        
        # Insert workout set record
        insert_query = """
            INSERT INTO workout_sets (
                id, workout_id, exercise_id, user_id, set_number,
                reps, weight_lbs, time_under_tension_seconds, rest_seconds,
                perceived_exertion, estimated_one_rep_max, is_personal_best,
                improvement_vs_last, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            ) RETURNING *
        """
        
        created_set = await db.execute_query(
            insert_query,
            set_id,
            workout_set.workout_id,
            workout_set.exercise_id,
            workout_set.user_id,
            set_number,
            workout_set.reps,
            workout_set.weight_lbs,
            workout_set.time_under_tension_seconds,
            workout_set.rest_seconds,
            workout_set.perceived_exertion,
            estimated_1rm,
            is_pb,
            improvement,
            current_time,
            current_time,
            fetch_one=True
        )
        
        logger.info("🔧 Workout set created successfully", extra={
            "set_id": set_id, "volume_lbs": created_set.get("volume_lbs")
        })
        
        return created_set
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 create_workout_set FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workout set: {str(e)}"
        )


@router.put(
    "/{set_id}",
    response_model=WorkoutSet,
    summary="Update workout set",
    description="Update an existing workout set. Supports updating weight, reps, RPE, and other metrics. Validates weight increments and recalculates volume.",
    responses={
        200: {
            "description": "Workout set updated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "workout_id": "550e8400-e29b-41d4-a716-446655440000",
                        "exercise_id": "bench_press",
                        "user_id": "550e8400-e29b-41d4-a716-446655440001",
                        "set_number": 1,
                        "reps": 12,
                        "weight_lbs": 140.0,
                        "time_under_tension_seconds": 35,
                        "rest_seconds": 90,
                        "perceived_exertion": 8,
                        "volume_lbs": 1680.0,
                        "estimated_one_rep_max": 196.0,
                        "is_personal_best": True,
                        "improvement_vs_last": 10.5,
                        "created_at": "2025-06-22T09:30:00Z",
                        "updated_at": "2025-06-22T09:45:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Invalid input data",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Weight must be in 0.25 lb increments"
                    }
                }
            }
        },
        404: {
            "description": "Workout set not found",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Workout set not found"
                    }
                }
            }
        }
    }
)
async def update_workout_set(
    set_id: str,
    set_update: WorkoutSetUpdate,
    db: DatabaseManager = Depends(get_database)
):
    """Update workout set details"""
    logger.info("🔥 update_workout_set ENTRY", extra={
        "set_id": set_id, "update_fields": set_update.model_dump(exclude_unset=True)
    })
    
    try:
        # Verify set exists
        existing_set = await db.execute_query(
            """
            SELECT id, user_id, exercise_id, weight_lbs, reps 
            FROM workout_sets WHERE id = $1
            """,
            set_id,
            fetch_one=True
        )
        
        if not existing_set:
            logger.warning("🚨 Workout set not found", extra={"set_id": set_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout set with ID {set_id} not found"
            )
        
        # Build update query dynamically based on provided fields
        update_fields = []
        params = [set_id]  # $1 is the set_id for WHERE clause
        param_count = 1
        
        # Process each update field
        update_data = set_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            param_count += 1
            update_fields.append(f"{field} = ${param_count}")
            params.append(value)
        
        # If weight or reps changed, recalculate metrics
        new_weight = update_data.get("weight_lbs", existing_set["weight_lbs"])
        new_reps = update_data.get("reps", existing_set["reps"])
        
        # Recalculate estimated 1RM if needed
        if new_weight > 0 and new_reps > 1 and ("weight_lbs" in update_data or "reps" in update_data):
            estimated_1rm = float(new_weight) * (1 + float(new_reps) / 30)
            estimated_1rm = round(estimated_1rm, 2)
            param_count += 1
            update_fields.append(f"estimated_one_rep_max = ${param_count}")
            params.append(estimated_1rm)
        
        # Check for new personal best if weight or reps changed
        if "weight_lbs" in update_data or "reps" in update_data:
            is_pb = await check_personal_best(
                db,
                existing_set["user_id"],
                existing_set["exercise_id"],
                new_weight,
                new_reps,
                exclude_set_id=set_id
            )
            param_count += 1
            update_fields.append(f"is_personal_best = ${param_count}")
            params.append(is_pb)
            
            # Calculate improvement
            improvement = await calculate_improvement(
                db,
                existing_set["user_id"],
                existing_set["exercise_id"],
                new_weight,
                new_reps,
                exclude_set_id=set_id
            )
            param_count += 1
            update_fields.append(f"improvement_vs_last = ${param_count}")
            params.append(improvement)
        
        # Always update updated_at
        param_count += 1
        update_fields.append(f"updated_at = ${param_count}")
        params.append(datetime.utcnow())
        
        # Build and execute update query
        update_query = f"""
            UPDATE workout_sets 
            SET {', '.join(update_fields)}
            WHERE id = $1
            RETURNING *
        """
        
        logger.info("🔧 Updating workout set", extra={
            "query": update_query, "params": params
        })
        
        updated_set = await db.execute_query(
            update_query,
            *params,
            fetch_one=True
        )
        
        logger.info("🔧 Workout set updated successfully", extra={
            "set_id": set_id, "volume_lbs": updated_set.get("volume_lbs")
        })
        
        return updated_set
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 update_workout_set FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update workout set: {str(e)}"
        )


@router.delete(
    "/{set_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete workout set",
    description="Delete a workout set by ID. This will trigger recalculation of workout metrics.",
    responses={
        204: {
            "description": "Workout set deleted successfully"
        },
        404: {
            "description": "Workout set not found",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Workout set not found"
                    }
                }
            }
        }
    }
)
async def delete_workout_set(
    set_id: str,
    db: DatabaseManager = Depends(get_database)
):
    """Delete workout set"""
    logger.info("🔥 delete_workout_set ENTRY", extra={"set_id": set_id})
    
    try:
        # Verify set exists
        existing_set = await db.execute_query(
            "SELECT id FROM workout_sets WHERE id = $1",
            set_id,
            fetch_one=True
        )
        
        if not existing_set:
            logger.warning("🚨 Workout set not found", extra={"set_id": set_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout set with ID {set_id} not found"
            )
        
        # Delete the set (workout metrics will be updated by trigger)
        await db.execute_query(
            "DELETE FROM workout_sets WHERE id = $1",
            set_id
        )
        
        logger.info("🔧 Workout set deleted successfully", extra={"set_id": set_id})
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 delete_workout_set FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete workout set: {str(e)}"
        )


async def check_personal_best(
    db: DatabaseManager,
    user_id: str,
    exercise_id: str,
    weight_lbs: Decimal,
    reps: int,
    exclude_set_id: Optional[str] = None
) -> bool:
    """
    Check if this set is a personal best for the user/exercise combination
    Personal best is determined by highest weight at same or higher reps
    """
    query = """
        SELECT MAX(weight_lbs) as max_weight
        FROM workout_sets
        WHERE user_id = $1 AND exercise_id = $2 AND reps >= $3
    """
    params = [user_id, exercise_id, reps]
    
    if exclude_set_id:
        query += " AND id != $4"
        params.append(exclude_set_id)
    
    result = await db.execute_query(query, *params, fetch_one=True)
    max_weight = result.get("max_weight") if result else None
    
    return max_weight is None or weight_lbs > max_weight


async def calculate_improvement(
    db: DatabaseManager,
    user_id: str,
    exercise_id: str,
    weight_lbs: Decimal,
    reps: int,
    exclude_set_id: Optional[str] = None
) -> Optional[Decimal]:
    """
    Calculate percentage improvement vs last similar set
    Improvement is based on volume (weight * reps)
    """
    # Find the most recent set for same exercise and similar rep range (±2 reps)
    query = """
        SELECT weight_lbs, reps, volume_lbs
        FROM workout_sets
        WHERE user_id = $1 AND exercise_id = $2 
        AND reps BETWEEN $3 AND $4
    """
    params = [user_id, exercise_id, reps - 2, reps + 2]
    
    if exclude_set_id:
        query += " AND id != $5"
        params.append(exclude_set_id)
    
    query += " ORDER BY created_at DESC LIMIT 1"
    
    result = await db.execute_query(query, *params, fetch_one=True)
    
    if not result:
        return None
    
    previous_volume = float(result["volume_lbs"])
    current_volume = float(weight_lbs) * float(reps)
    
    if previous_volume == 0:
        return None
    
    improvement = ((current_volume - previous_volume) / previous_volume) * 100
    return round(Decimal(str(improvement)), 2)