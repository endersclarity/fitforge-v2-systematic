"""
FitForge Pydantic Data Models
Created: December 21, 2024
Purpose: Python data validation models matching exact database schema

CRITICAL: These models MUST match the database schema exactly
Column names, types, and validation rules are verified against database-schema.sql
Any changes here must be reflected in the database schema and TypeScript interfaces

Schema verification: All validation rules mirror database CHECK constraints
"""

from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, ConfigDict


# ============================================================================
# ENUMS AND CONSTANTS
# ============================================================================

class Sex(str, Enum):
    """User sex/gender options"""
    MALE = "M"
    FEMALE = "F"
    OTHER = "Other"


class ExperienceLevel(str, Enum):
    """User fitness experience levels"""
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class Difficulty(str, Enum):
    """Exercise difficulty levels"""
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class Variation(str, Enum):
    """Exercise variations for A/B periodization"""
    A = "A"
    B = "B"
    AB = "A/B"


class WorkoutType(str, Enum):
    """Workout type categorizations"""
    PUSH = "Push"
    PULL = "Pull"
    LEGS = "Legs"
    FULL_BODY = "Full Body"
    CUSTOM = "Custom"


# ============================================================================
# USER PROFILE MODELS
# ============================================================================

class UserBase(BaseModel):
    """Base user model with common fields"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    email: str = Field(..., min_length=1, max_length=255)
    display_name: Optional[str] = Field(None, max_length=255)
    
    # Personal metrics for volume calculations
    height_inches: Optional[int] = Field(None, ge=1, le=119)
    weight_lbs: Optional[Decimal] = Field(None, ge=Decimal('0.01'), le=Decimal('999.99'))
    age: Optional[int] = Field(None, ge=1, le=149)
    sex: Optional[Sex] = None
    
    # Fitness preferences
    experience_level: ExperienceLevel = ExperienceLevel.BEGINNER
    primary_goals: List[str] = Field(default_factory=lambda: ["General Fitness"])
    available_equipment: List[str] = Field(default_factory=list)
    
    # Progressive disclosure tracking
    workout_count: int = Field(default=0, ge=0)
    feature_level: int = Field(default=1, ge=1, le=4)


class UserCreate(UserBase):
    """User creation model"""
    id: UUID  # Must match auth.users.id


class UserUpdate(BaseModel):
    """User update model - all fields optional"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    display_name: Optional[str] = Field(None, max_length=255)
    height_inches: Optional[int] = Field(None, ge=1, le=119)
    weight_lbs: Optional[Decimal] = Field(None, ge=Decimal('0.01'), le=Decimal('999.99'))
    age: Optional[int] = Field(None, ge=1, le=149)
    sex: Optional[Sex] = None
    experience_level: Optional[ExperienceLevel] = None
    primary_goals: Optional[List[str]] = None
    available_equipment: Optional[List[str]] = None


class User(UserBase):
    """Complete user model with system fields"""
    id: UUID
    created_at: datetime
    updated_at: datetime
    last_active_at: datetime


# ============================================================================
# EXERCISE LIBRARY MODELS
# ============================================================================

class ExerciseBase(BaseModel):
    """Base exercise model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    id: str = Field(..., min_length=1, max_length=100)  # e.g., 'single_arm_upright_row'
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)  # Push, Pull, Legs, etc.
    equipment: str = Field(..., min_length=1, max_length=100)
    difficulty: Difficulty
    variation: Optional[Variation] = None
    
    # Instructions and guidance
    instructions: List[str] = Field(default_factory=list)
    setup_tips: List[str] = Field(default_factory=list)
    safety_notes: List[str] = Field(default_factory=list)
    
    # Muscle engagement data (percentages 0-100)
    muscle_engagement: Dict[str, int] = Field(..., min_length=1)
    primary_muscles: List[str] = Field(..., min_length=1)
    secondary_muscles: List[str] = Field(default_factory=list)
    
    # Exercise metadata
    is_compound: bool = True
    is_unilateral: bool = False
    movement_pattern: Optional[str] = Field(None, max_length=50)  # 'Push', 'Pull', 'Squat', etc.
    
    @field_validator('muscle_engagement')
    @classmethod
    def validate_muscle_engagement(cls, v: Dict[str, int]) -> Dict[str, int]:
        """Validate muscle engagement percentages"""
        if not v:
            raise ValueError("muscle_engagement cannot be empty")
        
        for muscle, percentage in v.items():
            if not isinstance(percentage, int) or percentage < 0 or percentage > 100:
                raise ValueError(f"muscle_engagement[{muscle}] must be integer 0-100, got {percentage}")
        
        # Ensure at least one muscle has engagement > 0
        if not any(percentage > 0 for percentage in v.values()):
            raise ValueError("At least one muscle must have engagement > 0")
        
        return v


class ExerciseCreate(ExerciseBase):
    """Exercise creation model"""
    pass


class ExerciseUpdate(BaseModel):
    """Exercise update model - all fields optional except muscle_engagement validation"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    equipment: Optional[str] = Field(None, min_length=1, max_length=100)
    difficulty: Optional[Difficulty] = None
    variation: Optional[Variation] = None
    instructions: Optional[List[str]] = None
    setup_tips: Optional[List[str]] = None
    safety_notes: Optional[List[str]] = None
    muscle_engagement: Optional[Dict[str, int]] = None
    primary_muscles: Optional[List[str]] = None
    secondary_muscles: Optional[List[str]] = None
    is_compound: Optional[bool] = None
    is_unilateral: Optional[bool] = None
    movement_pattern: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None
    
    @field_validator('muscle_engagement')
    @classmethod
    def validate_muscle_engagement(cls, v: Optional[Dict[str, int]]) -> Optional[Dict[str, int]]:
        """Validate muscle engagement percentages if provided"""
        if v is None:
            return v
        
        if not v:
            raise ValueError("muscle_engagement cannot be empty if provided")
        
        for muscle, percentage in v.items():
            if not isinstance(percentage, int) or percentage < 0 or percentage > 100:
                raise ValueError(f"muscle_engagement[{muscle}] must be integer 0-100, got {percentage}")
        
        # Ensure at least one muscle has engagement > 0
        if not any(percentage > 0 for percentage in v.values()):
            raise ValueError("At least one muscle must have engagement > 0")
        
        return v


class Exercise(ExerciseBase):
    """Complete exercise model with system fields"""
    created_at: datetime
    updated_at: datetime
    is_active: bool = True


# ============================================================================
# WORKOUT SESSION MODELS
# ============================================================================

class WorkoutBase(BaseModel):
    """Base workout model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    name: Optional[str] = Field(None, max_length=255)
    workout_type: Optional[WorkoutType] = None
    variation: Optional[Variation] = None
    
    # Session timing
    started_at: datetime = Field(default_factory=datetime.now)
    ended_at: Optional[datetime] = None
    
    # Session notes and feedback
    notes: Optional[str] = None
    energy_level: Optional[int] = Field(None, ge=1, le=5)
    perceived_exertion: Optional[int] = Field(None, ge=1, le=10)
    
    # Progressive overload tracking
    previous_workout_id: Optional[UUID] = None


class WorkoutCreate(WorkoutBase):
    """Workout creation model"""
    user_id: UUID


class WorkoutUpdate(BaseModel):
    """Workout update model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    name: Optional[str] = Field(None, max_length=255)
    workout_type: Optional[WorkoutType] = None
    variation: Optional[Variation] = None
    ended_at: Optional[datetime] = None
    notes: Optional[str] = None
    energy_level: Optional[int] = Field(None, ge=1, le=5)
    perceived_exertion: Optional[int] = Field(None, ge=1, le=10)
    is_completed: Optional[bool] = None


class Workout(WorkoutBase):
    """Complete workout model with calculated fields"""
    id: UUID
    user_id: UUID
    
    # Calculated session metrics
    duration_seconds: Optional[int] = None
    total_volume_lbs: Decimal = Field(default=Decimal('0.00'))
    total_sets: int = 0
    total_reps: int = 0
    exercises_count: int = 0
    
    # Progressive overload tracking
    volume_increase_percentage: Optional[Decimal] = Field(None)
    
    # System fields
    created_at: datetime
    updated_at: datetime
    is_completed: bool = False


# ============================================================================
# WORKOUT SET MODELS
# ============================================================================

class WorkoutSetBase(BaseModel):
    """Base workout set model with strict validation"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    set_number: int = Field(..., ge=1, le=20)
    reps: int = Field(..., ge=1, le=50)  # Prevents impossible rep counts
    weight_lbs: Decimal = Field(..., ge=Decimal('0.00'), le=Decimal('500.00'))
    
    # Performance metrics
    time_under_tension_seconds: Optional[int] = Field(None, gt=0)
    rest_seconds: Optional[int] = Field(None, ge=0, le=600)  # Max 10 min rest
    perceived_exertion: Optional[int] = Field(None, ge=1, le=10)
    
    # Progressive tracking
    estimated_one_rep_max: Optional[Decimal] = Field(None)
    is_personal_best: bool = False
    improvement_vs_last: Optional[Decimal] = Field(None)
    
    @field_validator('weight_lbs')
    @classmethod
    def validate_weight_increment(cls, v: Decimal) -> Decimal:
        """Ensure weight is in 0.25 lb increments"""
        # Check if weight * 4 is a whole number (0.25 lb increments)
        if (v * 4) != int(v * 4):
            raise ValueError(f"Weight must be in 0.25 lb increments, got {v}")
        return v


class WorkoutSetCreate(WorkoutSetBase):
    """Workout set creation model"""
    workout_id: UUID
    exercise_id: str
    user_id: UUID


class WorkoutSetUpdate(BaseModel):
    """Workout set update model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    reps: Optional[int] = Field(None, ge=1, le=50)
    weight_lbs: Optional[Decimal] = Field(None, ge=Decimal('0.00'), le=Decimal('500.00'))
    time_under_tension_seconds: Optional[int] = Field(None, gt=0)
    rest_seconds: Optional[int] = Field(None, ge=0, le=600)
    perceived_exertion: Optional[int] = Field(None, ge=1, le=10)
    estimated_one_rep_max: Optional[Decimal] = Field(None)
    is_personal_best: Optional[bool] = None
    improvement_vs_last: Optional[Decimal] = Field(None)
    
    @field_validator('weight_lbs')
    @classmethod
    def validate_weight_increment(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        """Ensure weight is in 0.25 lb increments if provided"""
        if v is None:
            return v
        # Check if weight * 4 is a whole number (0.25 lb increments)
        if (v * 4) != int(v * 4):
            raise ValueError(f"Weight must be in 0.25 lb increments, got {v}")
        return v


class WorkoutSet(WorkoutSetBase):
    """Complete workout set model with calculated fields"""
    id: UUID
    workout_id: UUID
    exercise_id: str
    user_id: UUID
    
    # Calculated metrics
    volume_lbs: Decimal = Field(...)  # Generated: weight_lbs * reps
    
    # System fields
    created_at: datetime
    updated_at: datetime


# ============================================================================
# MUSCLE STATE MODELS
# ============================================================================

class MuscleStateBase(BaseModel):
    """Base muscle state model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    muscle_name: str = Field(..., min_length=1, max_length=100)  # e.g., 'Biceps_Brachii'
    muscle_group: str = Field(..., min_length=1, max_length=50)  # 'Push', 'Pull', 'Legs'
    
    # Fatigue calculation (0-100 scale)
    fatigue_percentage: Decimal = Field(..., ge=Decimal('0.00'), le=Decimal('100.00'))
    recovery_percentage: Decimal = Field(..., ge=Decimal('0.00'), le=Decimal('100.00'))
    
    # Volume tracking (7-day rolling window)
    weekly_volume_lbs: Decimal = Field(default=Decimal('0.00'))
    weekly_sets: int = Field(default=0, ge=0)
    weekly_frequency: int = Field(default=0, ge=0)  # How many days this week
    
    # Recovery modeling (5-day recovery curve)
    last_trained_date: Optional[date] = None
    expected_recovery_date: Optional[date] = None
    
    # Progressive overload recommendations
    target_volume_increase_percentage: Decimal = Field(default=Decimal('3.00'))
    recommended_next_weight: Optional[Decimal] = Field(None)
    recommended_next_reps: Optional[int] = Field(None, ge=1, le=50)
    
    # Associated workout
    last_workout_id: Optional[UUID] = None


class MuscleStateCreate(MuscleStateBase):
    """Muscle state creation model"""
    user_id: UUID


class MuscleStateUpdate(BaseModel):
    """Muscle state update model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    fatigue_percentage: Optional[Decimal] = Field(None, ge=Decimal('0.00'), le=Decimal('100.00'))
    recovery_percentage: Optional[Decimal] = Field(None, ge=Decimal('0.00'), le=Decimal('100.00'))
    weekly_volume_lbs: Optional[Decimal] = Field(None)
    weekly_sets: Optional[int] = Field(None, ge=0)
    weekly_frequency: Optional[int] = Field(None, ge=0)
    last_trained_date: Optional[date] = None
    expected_recovery_date: Optional[date] = None
    target_volume_increase_percentage: Optional[Decimal] = Field(None)
    recommended_next_weight: Optional[Decimal] = Field(None)
    recommended_next_reps: Optional[int] = Field(None, ge=1, le=50)
    last_workout_id: Optional[UUID] = None


class MuscleState(MuscleStateBase):
    """Complete muscle state model with calculated fields"""
    id: UUID
    user_id: UUID
    
    # Calculated field
    days_since_trained: Optional[int] = None  # Generated: CURRENT_DATE - last_trained_date
    
    # Calculation metadata
    calculation_timestamp: datetime = Field(default_factory=datetime.now)
    
    # System fields
    created_at: datetime
    updated_at: datetime


# ============================================================================
# VALIDATION UTILITIES
# ============================================================================

def validate_exercise_data(exercise_data: dict) -> bool:
    """Validate exercise data against schema"""
    try:
        Exercise.model_validate(exercise_data)
        return True
    except Exception:
        return False


def validate_workout_set_data(set_data: dict) -> bool:
    """Validate workout set data against schema"""
    try:
        WorkoutSet.model_validate(set_data)
        return True
    except Exception:
        return False


# ============================================================================
# EXPORT LIST
# ============================================================================

__all__ = [
    # Enums
    'Sex', 'ExperienceLevel', 'Difficulty', 'Variation', 'WorkoutType',
    
    # User models
    'UserBase', 'UserCreate', 'UserUpdate', 'User',
    
    # Exercise models
    'ExerciseBase', 'ExerciseCreate', 'ExerciseUpdate', 'Exercise',
    
    # Workout models
    'WorkoutBase', 'WorkoutCreate', 'WorkoutUpdate', 'Workout',
    
    # Workout set models
    'WorkoutSetBase', 'WorkoutSetCreate', 'WorkoutSetUpdate', 'WorkoutSet',
    
    # Muscle state models
    'MuscleStateBase', 'MuscleStateCreate', 'MuscleStateUpdate', 'MuscleState',
    
    # Utilities
    'validate_exercise_data', 'validate_workout_set_data'
]