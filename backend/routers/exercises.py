"""
FitForge Exercise Library API Router
Created: December 21, 2024
Purpose: RESTful endpoints for exercise library CRUD operations

This module implements the complete exercise library API with:
- CRUD operations for exercise management
- Advanced filtering by muscle groups, equipment, difficulty
- Search functionality across exercise names and descriptions
- Pagination support for large exercise databases
- Proper HTTP status codes and error handling
- Request/response validation using Pydantic models

All endpoints follow RESTful conventions and use dependency injection
for database connections and authentication.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, text
import logging

from ..database import get_db, get_supabase_client
from ..schemas.pydantic_models import (
    Exercise, ExerciseCreate, ExerciseUpdate,
    Difficulty, Variation
)
from ..auth import get_current_user, require_admin_user

# Configure logging
logger = logging.getLogger(__name__)

# Create router with prefix and tags for OpenAPI documentation
router = APIRouter(
    prefix="/exercises",
    tags=["Exercise Library"],
    responses={
        404: {"description": "Exercise not found"},
        400: {"description": "Invalid request parameters"},
        500: {"description": "Internal server error"}
    }
)


# ============================================================================
# QUERY PARAMETER MODELS
# ============================================================================

class ExerciseFilters:
    """Query parameters for exercise filtering and search"""
    
    def __init__(
        self,
        # Search and filtering
        search: Optional[str] = Query(None, description="Search exercise names and descriptions"),
        category: Optional[str] = Query(None, description="Filter by exercise category (Push, Pull, Legs, etc.)"),
        equipment: Optional[str] = Query(None, description="Filter by required equipment"),
        difficulty: Optional[Difficulty] = Query(None, description="Filter by difficulty level"),
        variation: Optional[Variation] = Query(None, description="Filter by A/B variation"),
        muscle_group: Optional[str] = Query(None, description="Filter by primary muscle group"),
        
        # Advanced filtering
        is_compound: Optional[bool] = Query(None, description="Filter compound vs isolation exercises"),
        is_unilateral: Optional[bool] = Query(None, description="Filter unilateral exercises"),
        movement_pattern: Optional[str] = Query(None, description="Filter by movement pattern"),
        
        # Pagination
        page: int = Query(1, ge=1, description="Page number (1-based)"),
        page_size: int = Query(50, ge=1, le=200, description="Items per page (max 200)"),
        
        # Sorting
        sort_by: str = Query("name", description="Sort field: name, difficulty, category, created_at"),
        sort_order: str = Query("asc", regex="^(asc|desc)$", description="Sort order: asc or desc")
    ):
        self.search = search
        self.category = category
        self.equipment = equipment
        self.difficulty = difficulty
        self.variation = variation
        self.muscle_group = muscle_group
        self.is_compound = is_compound
        self.is_unilateral = is_unilateral
        self.movement_pattern = movement_pattern
        self.page = page
        self.page_size = page_size
        self.sort_by = sort_by
        self.sort_order = sort_order


# ============================================================================
# READ OPERATIONS
# ============================================================================

@router.get("/", response_model=Dict[str, Any])
async def get_exercises(
    filters: ExerciseFilters = Depends(),
    db: Session = Depends(get_db)
):
    """
    Get paginated list of exercises with advanced filtering
    
    **Query Parameters:**
    - search: Search in exercise names and instructions
    - category: Filter by category (Push, Pull, Legs, etc.)
    - equipment: Filter by required equipment
    - difficulty: Filter by difficulty level (Beginner, Intermediate, Advanced)
    - variation: Filter by A/B periodization variation
    - muscle_group: Filter by primary muscle engagement
    - is_compound: Filter compound movements (true/false)
    - is_unilateral: Filter unilateral exercises (true/false)
    - movement_pattern: Filter by movement pattern (Push, Pull, Squat, etc.)
    - page: Page number (default: 1)
    - page_size: Items per page (default: 50, max: 200)
    - sort_by: Sort field (name, difficulty, category, created_at)
    - sort_order: Sort order (asc, desc)
    
    **Returns:**
    - exercises: List of exercise objects
    - pagination: Page metadata (current_page, total_pages, total_items, page_size)
    - filters_applied: Summary of active filters
    """
    try:
        # Build base query
        query = db.query(Exercise).filter(Exercise.is_active == True)
        
        # Apply filters
        active_filters = {}
        
        if filters.search:
            # Search in name, instructions, and setup tips
            search_term = f"%{filters.search.lower()}%"
            query = query.filter(
                or_(
                    Exercise.name.ilike(search_term),
                    Exercise.instructions.cast(text("text")).ilike(search_term),
                    Exercise.setup_tips.cast(text("text")).ilike(search_term)
                )
            )
            active_filters["search"] = filters.search
        
        if filters.category:
            query = query.filter(Exercise.category.ilike(f"%{filters.category}%"))
            active_filters["category"] = filters.category
        
        if filters.equipment:
            query = query.filter(Exercise.equipment.ilike(f"%{filters.equipment}%"))
            active_filters["equipment"] = filters.equipment
        
        if filters.difficulty:
            query = query.filter(Exercise.difficulty == filters.difficulty)
            active_filters["difficulty"] = filters.difficulty
        
        if filters.variation:
            query = query.filter(Exercise.variation == filters.variation)
            active_filters["variation"] = filters.variation
        
        if filters.muscle_group:
            # Search in primary_muscles array
            query = query.filter(Exercise.primary_muscles.contains([filters.muscle_group]))
            active_filters["muscle_group"] = filters.muscle_group
        
        if filters.is_compound is not None:
            query = query.filter(Exercise.is_compound == filters.is_compound)
            active_filters["is_compound"] = filters.is_compound
        
        if filters.is_unilateral is not None:
            query = query.filter(Exercise.is_unilateral == filters.is_unilateral)
            active_filters["is_unilateral"] = filters.is_unilateral
        
        if filters.movement_pattern:
            query = query.filter(Exercise.movement_pattern.ilike(f"%{filters.movement_pattern}%"))
            active_filters["movement_pattern"] = filters.movement_pattern
        
        # Get total count before pagination
        total_items = query.count()
        
        # Apply sorting
        sort_column = getattr(Exercise, filters.sort_by, Exercise.name)
        if filters.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        exercises = query.offset(offset).limit(filters.page_size).all()
        
        # Calculate pagination metadata
        total_pages = (total_items + filters.page_size - 1) // filters.page_size
        
        return {
            "exercises": exercises,
            "pagination": {
                "current_page": filters.page,
                "total_pages": total_pages,
                "total_items": total_items,
                "page_size": filters.page_size
            },
            "filters_applied": active_filters,
            "sort": {
                "sort_by": filters.sort_by,
                "sort_order": filters.sort_order
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching exercises: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch exercises"
        )


@router.get("/{exercise_id}", response_model=Exercise)
async def get_exercise(
    exercise_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific exercise by ID
    
    **Path Parameters:**
    - exercise_id: Unique exercise identifier (e.g., 'single_arm_upright_row')
    
    **Returns:**
    - Complete exercise object with all metadata
    """
    try:
        exercise = db.query(Exercise).filter(
            and_(Exercise.id == exercise_id, Exercise.is_active == True)
        ).first()
        
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exercise '{exercise_id}' not found"
            )
        
        return exercise
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching exercise {exercise_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch exercise"
        )


@router.get("/muscle-groups/", response_model=List[str])
async def get_muscle_groups(db: Session = Depends(get_db)):
    """
    Get list of all available muscle groups from exercises
    
    **Returns:**
    - List of unique muscle group names
    """
    try:
        # Get all unique values from primary_muscles arrays
        result = db.execute(
            text("SELECT DISTINCT unnest(primary_muscles) as muscle_group FROM exercises WHERE is_active = true ORDER BY muscle_group")
        )
        muscle_groups = [row.muscle_group for row in result]
        
        return muscle_groups
        
    except Exception as e:
        logger.error(f"Error fetching muscle groups: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch muscle groups"
        )


@router.get("/equipment/", response_model=List[str])
async def get_equipment_types(db: Session = Depends(get_db)):
    """
    Get list of all available equipment types
    
    **Returns:**
    - List of unique equipment types
    """
    try:
        result = db.query(Exercise.equipment).filter(Exercise.is_active == True).distinct().all()
        equipment_types = [row.equipment for row in result]
        
        return sorted(equipment_types)
        
    except Exception as e:
        logger.error(f"Error fetching equipment types: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch equipment types"
        )


# ============================================================================
# CREATE OPERATIONS (Admin Only)
# ============================================================================

@router.post("/", response_model=Exercise, status_code=status.HTTP_201_CREATED)
async def create_exercise(
    exercise_data: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_user)  # Admin only
):
    """
    Create a new exercise (Admin only)
    
    **Request Body:**
    - Complete exercise data following ExerciseCreate schema
    - muscle_engagement: JSON object with muscle percentages (0-100)
    - primary_muscles: Array of primary muscle names
    - All validation rules from schema apply
    
    **Returns:**
    - Created exercise object with system fields
    """
    try:
        # Check if exercise ID already exists
        existing = db.query(Exercise).filter(Exercise.id == exercise_data.id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Exercise with ID '{exercise_data.id}' already exists"
            )
        
        # Create new exercise
        exercise = Exercise(**exercise_data.dict())
        db.add(exercise)
        db.commit()
        db.refresh(exercise)
        
        logger.info(f"Created exercise: {exercise.id} by user {current_user.id}")
        return exercise
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating exercise: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create exercise"
        )


# ============================================================================
# UPDATE OPERATIONS (Admin Only)
# ============================================================================

@router.put("/{exercise_id}", response_model=Exercise)
async def update_exercise(
    exercise_id: str,
    exercise_update: ExerciseUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_user)  # Admin only
):
    """
    Update an existing exercise (Admin only)
    
    **Path Parameters:**
    - exercise_id: Exercise to update
    
    **Request Body:**
    - Partial exercise data following ExerciseUpdate schema
    - Only provided fields will be updated
    
    **Returns:**
    - Updated exercise object
    """
    try:
        exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exercise '{exercise_id}' not found"
            )
        
        # Update only provided fields
        update_data = exercise_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(exercise, field, value)
        
        db.commit()
        db.refresh(exercise)
        
        logger.info(f"Updated exercise: {exercise_id} by user {current_user.id}")
        return exercise
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating exercise {exercise_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update exercise"
        )


# ============================================================================
# DELETE OPERATIONS (Admin Only)
# ============================================================================

@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(
    exercise_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_user)  # Admin only
):
    """
    Soft delete an exercise (Admin only)
    
    Sets is_active = false instead of hard deletion to preserve data integrity
    
    **Path Parameters:**
    - exercise_id: Exercise to delete
    
    **Returns:**
    - HTTP 204 No Content on success
    """
    try:
        exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exercise '{exercise_id}' not found"
            )
        
        # Soft delete by setting is_active = false
        exercise.is_active = False
        db.commit()
        
        logger.info(f"Deleted exercise: {exercise_id} by user {current_user.id}")
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content={})
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting exercise {exercise_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete exercise"
        )


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@router.get("/analytics/muscle-engagement/{muscle_name}")
async def get_exercises_by_muscle_engagement(
    muscle_name: str,
    min_engagement: int = Query(20, ge=0, le=100, description="Minimum engagement percentage"),
    db: Session = Depends(get_db)
):
    """
    Get exercises that target a specific muscle above a threshold
    
    **Path Parameters:**
    - muscle_name: Target muscle name (e.g., 'Biceps_Brachii')
    
    **Query Parameters:**
    - min_engagement: Minimum engagement percentage (default: 20)
    
    **Returns:**
    - List of exercises with engagement percentages
    """
    try:
        # Query exercises with muscle engagement above threshold
        exercises = db.query(Exercise).filter(
            and_(
                Exercise.is_active == True,
                Exercise.muscle_engagement[muscle_name].astext.cast(Integer) >= min_engagement
            )
        ).order_by(
            Exercise.muscle_engagement[muscle_name].astext.cast(Integer).desc()
        ).all()
        
        # Format response with engagement percentages
        result = []
        for exercise in exercises:
            engagement = exercise.muscle_engagement.get(muscle_name, 0)
            result.append({
                "exercise": exercise,
                "engagement_percentage": engagement
            })
        
        return {
            "muscle_name": muscle_name,
            "min_engagement": min_engagement,
            "exercises": result,
            "total_count": len(result)
        }
        
    except Exception as e:
        logger.error(f"Error fetching muscle engagement for {muscle_name}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch muscle engagement data"
        )


@router.get("/analytics/categories/")
async def get_exercise_categories_stats(db: Session = Depends(get_db)):
    """
    Get statistics about exercise distribution by category
    
    **Returns:**
    - Category breakdown with counts and percentages
    """
    try:
        result = db.execute(
            text("""
                SELECT 
                    category,
                    COUNT(*) as count,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
                FROM exercises 
                WHERE is_active = true 
                GROUP BY category 
                ORDER BY count DESC
            """)
        )
        
        categories = [
            {
                "category": row.category,
                "count": row.count,
                "percentage": float(row.percentage)
            }
            for row in result
        ]
        
        total_exercises = sum(cat["count"] for cat in categories)
        
        return {
            "categories": categories,
            "total_exercises": total_exercises
        }
        
    except Exception as e:
        logger.error(f"Error fetching category stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch category statistics"
        )