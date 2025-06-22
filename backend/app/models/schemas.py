"""
Schema Import Helper
Loads Pydantic models from the schemas directory
"""

import importlib.util
import sys
import os

# Load pydantic models from schemas directory
_schemas_path = "/app/schemas/pydantic-models.py"

if os.path.exists(_schemas_path):
    spec = importlib.util.spec_from_file_location("pydantic_models", _schemas_path)
    pydantic_models = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(pydantic_models)
    
    # Export all model classes and enums
    User = pydantic_models.User
    UserCreate = pydantic_models.UserCreate
    UserUpdate = pydantic_models.UserUpdate
    
    Exercise = pydantic_models.Exercise
    ExerciseCreate = pydantic_models.ExerciseCreate
    ExerciseUpdate = pydantic_models.ExerciseUpdate
    
    Workout = pydantic_models.Workout
    WorkoutCreate = pydantic_models.WorkoutCreate
    WorkoutUpdate = pydantic_models.WorkoutUpdate
    
    WorkoutSet = pydantic_models.WorkoutSet
    WorkoutSetCreate = pydantic_models.WorkoutSetCreate
    WorkoutSetUpdate = pydantic_models.WorkoutSetUpdate
    
    MuscleState = pydantic_models.MuscleState
    MuscleStateCreate = pydantic_models.MuscleStateCreate
    MuscleStateUpdate = pydantic_models.MuscleStateUpdate
    
    # Export enums
    Difficulty = pydantic_models.Difficulty
    Variation = pydantic_models.Variation
    WorkoutType = pydantic_models.WorkoutType
    
else:
    raise ImportError(f"Could not find pydantic models at {_schemas_path}")