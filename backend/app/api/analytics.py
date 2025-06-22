"""
Analytics API Router
Muscle fatigue analytics and progressive overload endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, date, timedelta
from decimal import Decimal
from uuid import UUID
import logging
import json

from app.core.dependencies import get_current_user, get_database, PaginationParams
from app.core.database import DatabaseManager
from app.models.schemas import (
    MuscleState, MuscleStateCreate, MuscleStateUpdate,
    User, WorkoutType, Exercise
)

logger = logging.getLogger(__name__)
router = APIRouter()

# Constants for muscle fatigue calculations
RECOVERY_DAYS = 5  # Full recovery in 5 days
RECOVERY_RATE_PER_DAY = 20  # 20% recovery per day (100% / 5 days)
MIN_FATIGUE_THRESHOLD = 10  # Minimum fatigue percentage to track
PROGRESSIVE_OVERLOAD_TARGET = 3.0  # 3% target increase
MUSCLE_GROUP_MAPPING = {
    # Back/Biceps muscles
    "Latissimus_Dorsi": "Pull",
    "Biceps_Brachii": "Pull",
    "Rhomboids": "Pull",
    "Trapezius": "Pull",
    "Brachialis": "Pull",
    "Brachioradialis": "Pull",
    "Rear_Deltoids": "Pull",
    "Rotator_Cuff": "Pull",
    "Levator_Scapulae": "Pull",
    
    # Push muscles
    "Pectoralis_Major": "Push",
    "Pectoralis_Minor": "Push",
    "Triceps_Brachii": "Push",
    "Deltoids": "Push",
    "Serratus_Anterior": "Push",
    
    # Leg muscles
    "Quadriceps": "Legs",
    "Hamstrings": "Legs",
    "Glutes": "Legs",
    "Calves": "Legs",
    "Hip_Flexors": "Legs",
    "Adductors": "Legs",
    "Abductors": "Legs",
    
    # Core and other
    "Core": "Core",
    "Abs": "Core",
    "Obliques": "Core",
    "Lower_Back": "Core",
    "Erector_Spinae": "Core",
    "Grip_Forearms": "Other"
}


async def calculate_muscle_fatigue_from_workouts(
    db: DatabaseManager,
    user_id: UUID,
    target_date: date = None
) -> List[Dict[str, Any]]:
    """
    Calculate muscle fatigue based on recent workouts and recovery model
    
    Returns muscle states with fatigue percentages based on:
    - Exercise muscle engagement percentages
    - Workout volume and intensity
    - Time since last training (5-day recovery model)
    """
    if target_date is None:
        target_date = date.today()
    
    # Get workouts from last 7 days
    start_date = target_date - timedelta(days=7)
    
    # Query recent workout sets with exercise data
    query = """
        SELECT 
            ws.created_at,
            ws.exercise_id,
            ws.weight_lbs,
            ws.reps,
            ws.volume_lbs,
            ws.perceived_exertion,
            e.muscle_engagement,
            e.primary_muscles,
            e.name as exercise_name
        FROM workout_sets ws
        JOIN exercises e ON ws.exercise_id = e.id
        JOIN workouts w ON ws.workout_id = w.id
        WHERE ws.user_id = $1
          AND ws.created_at::date >= $2
          AND ws.created_at::date <= $3
          AND w.is_completed = true
        ORDER BY ws.created_at DESC
    """
    
    workout_data = await db.execute_query(
        query,
        user_id,
        start_date,
        target_date,
        fetch_all=True
    )
    
    # Calculate fatigue per muscle
    muscle_fatigue_data = {}
    
    for row in workout_data:
        workout_date = row['created_at'].date()
        days_ago = (target_date - workout_date).days
        
        # Calculate base recovery (20% per day)
        recovery_percentage = min(100, days_ago * RECOVERY_RATE_PER_DAY)
        remaining_fatigue = 100 - recovery_percentage
        
        # Parse muscle engagement
        muscle_engagement = json.loads(row['muscle_engagement']) if isinstance(row['muscle_engagement'], str) else row['muscle_engagement']
        
        # Calculate fatigue contribution from this set
        volume = float(row['volume_lbs'])
        exertion_factor = (row['perceived_exertion'] or 5) / 10.0
        
        for muscle, engagement_pct in muscle_engagement.items():
            if engagement_pct > 0:
                # Calculate fatigue contribution
                # Higher volume and exertion = more fatigue
                # Higher engagement = more fatigue for that muscle
                fatigue_contribution = (
                    (engagement_pct / 100.0) *  # Muscle engagement factor
                    (volume / 1000.0) *          # Volume factor (normalized)
                    exertion_factor *            # Perceived exertion factor
                    remaining_fatigue / 100.0    # Recovery factor
                )
                
                if muscle not in muscle_fatigue_data:
                    muscle_fatigue_data[muscle] = {
                        'fatigue_percentage': 0,
                        'last_trained_date': workout_date,
                        'weekly_volume': 0,
                        'weekly_sets': 0,
                        'training_days': set()
                    }
                
                # Update muscle data
                muscle_fatigue_data[muscle]['fatigue_percentage'] += fatigue_contribution * 10  # Scale up
                muscle_fatigue_data[muscle]['weekly_volume'] += volume * (engagement_pct / 100.0)
                muscle_fatigue_data[muscle]['weekly_sets'] += 1
                muscle_fatigue_data[muscle]['training_days'].add(workout_date)
                
                # Update last trained date
                if workout_date > muscle_fatigue_data[muscle]['last_trained_date']:
                    muscle_fatigue_data[muscle]['last_trained_date'] = workout_date
    
    # Convert to list format and cap fatigue at 100%
    muscle_states = []
    for muscle_name, data in muscle_fatigue_data.items():
        fatigue_pct = min(100, data['fatigue_percentage'])
        recovery_pct = 100 - fatigue_pct
        days_since = (target_date - data['last_trained_date']).days
        expected_recovery = data['last_trained_date'] + timedelta(days=RECOVERY_DAYS)
        
        muscle_states.append({
            'muscle_name': muscle_name,
            'muscle_group': MUSCLE_GROUP_MAPPING.get(muscle_name, 'Other'),
            'fatigue_percentage': round(fatigue_pct, 2),
            'recovery_percentage': round(recovery_pct, 2),
            'weekly_volume_lbs': round(data['weekly_volume'], 2),
            'weekly_sets': data['weekly_sets'],
            'weekly_frequency': len(data['training_days']),
            'last_trained_date': data['last_trained_date'],
            'days_since_trained': days_since,
            'expected_recovery_date': expected_recovery if fatigue_pct > MIN_FATIGUE_THRESHOLD else None,
            'calculation_timestamp': datetime.now()
        })
    
    return muscle_states


@router.get("/muscle-fatigue/{user_id}", response_model=List[MuscleState])
async def get_muscle_fatigue_state(
    user_id: str,
    muscle_group: Optional[str] = Query(None, description="Filter by muscle group"),
    date_filter: Optional[date] = Query(None, description="Get state for specific date"),
    current_user: User = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
):
    """
    Get current muscle fatigue state for user
    
    Returns fatigue percentages and recovery status for all muscles based on:
    - Recent workout history (7-day window)
    - Exercise muscle engagement percentages
    - 5-day recovery model (20% recovery per day)
    - Workout volume and perceived exertion
    
    **Response includes:**
    - Muscle fatigue percentage (0-100%)
    - Recovery percentage (0-100%)
    - Days since last trained
    - Expected recovery date
    - Weekly volume and frequency
    """
    # Verify user access
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's data"
        )
    
    # Calculate current muscle states
    muscle_states = await calculate_muscle_fatigue_from_workouts(
        db, UUID(user_id), date_filter
    )
    
    # Filter by muscle group if specified
    if muscle_group:
        muscle_states = [
            ms for ms in muscle_states 
            if ms['muscle_group'].lower() == muscle_group.lower()
        ]
    
    # Sort by fatigue percentage (highest first)
    muscle_states.sort(key=lambda x: x['fatigue_percentage'], reverse=True)
    
    # Store in database for tracking
    for state in muscle_states:
        await db.execute_query(
            """
            INSERT INTO muscle_states (
                user_id, muscle_name, muscle_group, fatigue_percentage,
                recovery_percentage, weekly_volume_lbs, weekly_sets,
                weekly_frequency, last_trained_date, expected_recovery_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (user_id, muscle_name, DATE(calculation_timestamp))
            DO UPDATE SET
                fatigue_percentage = EXCLUDED.fatigue_percentage,
                recovery_percentage = EXCLUDED.recovery_percentage,
                weekly_volume_lbs = EXCLUDED.weekly_volume_lbs,
                weekly_sets = EXCLUDED.weekly_sets,
                weekly_frequency = EXCLUDED.weekly_frequency,
                last_trained_date = EXCLUDED.last_trained_date,
                expected_recovery_date = EXCLUDED.expected_recovery_date,
                updated_at = NOW()
            """,
            UUID(user_id),
            state['muscle_name'],
            state['muscle_group'],
            state['fatigue_percentage'],
            state['recovery_percentage'],
            state['weekly_volume_lbs'],
            state['weekly_sets'],
            state['weekly_frequency'],
            state['last_trained_date'],
            state['expected_recovery_date']
        )
    
    # Convert to MuscleState models
    return [MuscleState(
        id=UUID('00000000-0000-0000-0000-000000000000'),  # Placeholder
        user_id=UUID(user_id),
        **state
    ) for state in muscle_states]


@router.post("/calculate-fatigue")
async def calculate_muscle_fatigue(
    current_user: User = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
):
    """
    Trigger muscle fatigue calculation for current user
    
    Analyzes recent workouts and updates muscle state based on:
    - Exercise muscle engagement data
    - Workout volume and intensity
    - Time-based recovery (5-day model)
    
    **Returns:** Updated muscle fatigue states
    """
    # Calculate and store muscle states
    muscle_states = await calculate_muscle_fatigue_from_workouts(
        db, current_user.id
    )
    
    # Store all states in database
    for state in muscle_states:
        await db.execute_query(
            """
            INSERT INTO muscle_states (
                user_id, muscle_name, muscle_group, fatigue_percentage,
                recovery_percentage, weekly_volume_lbs, weekly_sets,
                weekly_frequency, last_trained_date, expected_recovery_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (user_id, muscle_name, DATE(calculation_timestamp))
            DO UPDATE SET
                fatigue_percentage = EXCLUDED.fatigue_percentage,
                recovery_percentage = EXCLUDED.recovery_percentage,
                weekly_volume_lbs = EXCLUDED.weekly_volume_lbs,
                weekly_sets = EXCLUDED.weekly_sets,
                weekly_frequency = EXCLUDED.weekly_frequency,
                last_trained_date = EXCLUDED.last_trained_date,
                expected_recovery_date = EXCLUDED.expected_recovery_date,
                updated_at = NOW()
            """,
            current_user.id,
            state['muscle_name'],
            state['muscle_group'],
            state['fatigue_percentage'],
            state['recovery_percentage'],
            state['weekly_volume_lbs'],
            state['weekly_sets'],
            state['weekly_frequency'],
            state['last_trained_date'],
            state['expected_recovery_date']
        )
    
    return {
        "message": "Muscle fatigue calculation completed",
        "muscles_analyzed": len(muscle_states),
        "timestamp": datetime.now()
    }


@router.get("/workout-recommendations/{user_id}")
async def get_workout_recommendations(
    user_id: str,
    workout_type: Optional[WorkoutType] = Query(None, description="Preferred workout type"),
    available_time_minutes: Optional[int] = Query(60, ge=15, le=180, description="Available workout time"),
    current_user: User = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
):
    """
    Get AI-powered workout recommendations based on muscle fatigue and recovery
    
    **Algorithm considers:**
    - Current muscle fatigue levels
    - Recovery status (muscles < 30% fatigue are ready)
    - Previous workout patterns
    - Progressive overload targets (3% increase)
    - Available time and equipment
    
    **Returns:** Recommended exercises with sets, reps, and weights
    """
    # Verify user access
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's data"
        )
    
    # Get current muscle states
    muscle_states = await calculate_muscle_fatigue_from_workouts(
        db, UUID(user_id)
    )
    
    # Identify recovered muscles (< 30% fatigue)
    recovered_muscles = [
        ms for ms in muscle_states 
        if ms['fatigue_percentage'] < 30
    ]
    
    # Get user's recent performance data
    recent_performance = await db.execute_query(
        """
        SELECT 
            ws.exercise_id,
            e.name as exercise_name,
            e.muscle_engagement,
            e.category,
            e.equipment,
            e.difficulty,
            MAX(ws.weight_lbs) as max_weight,
            MAX(ws.reps) as max_reps,
            AVG(ws.weight_lbs) as avg_weight,
            AVG(ws.reps) as avg_reps,
            COUNT(*) as total_sets,
            MAX(ws.created_at) as last_performed
        FROM workout_sets ws
        JOIN exercises e ON ws.exercise_id = e.id
        WHERE ws.user_id = $1
          AND ws.created_at > NOW() - INTERVAL '30 days'
        GROUP BY ws.exercise_id, e.name, e.muscle_engagement, e.category, e.equipment, e.difficulty
        """,
        UUID(user_id),
        fetch_all=True
    )
    
    # Build recommendations
    recommendations = []
    target_muscles = set()
    
    # Determine target muscles based on workout type
    if workout_type:
        if workout_type == WorkoutType.PUSH:
            target_muscles = {"Pectoralis_Major", "Triceps_Brachii", "Deltoids"}
        elif workout_type == WorkoutType.PULL:
            target_muscles = {"Latissimus_Dorsi", "Biceps_Brachii", "Rhomboids", "Trapezius"}
        elif workout_type == WorkoutType.LEGS:
            target_muscles = {"Quadriceps", "Hamstrings", "Glutes", "Calves"}
    else:
        # Full body - pick least fatigued from each group
        for group in ["Push", "Pull", "Legs"]:
            group_muscles = [
                ms for ms in recovered_muscles 
                if ms['muscle_group'] == group
            ]
            if group_muscles:
                target_muscles.add(group_muscles[0]['muscle_name'])
    
    # Get exercises that target recovered muscles
    available_exercises = []
    for perf in recent_performance:
        muscle_engagement = json.loads(perf['muscle_engagement']) if isinstance(perf['muscle_engagement'], str) else perf['muscle_engagement']
        
        # Check if exercise targets any recovered muscles
        targets_recovered = any(
            muscle in [ms['muscle_name'] for ms in recovered_muscles]
            and engagement > 30  # At least 30% engagement
            for muscle, engagement in muscle_engagement.items()
        )
        
        if targets_recovered:
            # Calculate progressive overload recommendation
            current_weight = float(perf['max_weight'])
            current_reps = int(perf['max_reps'])
            
            # 3% increase in volume
            new_weight = round(current_weight * 1.03 / 0.25) * 0.25  # Round to 0.25 lb increments
            new_reps = current_reps
            
            # If weight increase is too small, increase reps instead
            if new_weight - current_weight < 0.25:
                new_reps = current_reps + 1
                new_weight = current_weight
            
            available_exercises.append({
                'exercise_id': perf['exercise_id'],
                'exercise_name': perf['exercise_name'],
                'category': perf['category'],
                'equipment': perf['equipment'],
                'difficulty': perf['difficulty'],
                'recommended_sets': 3 if available_time_minutes >= 45 else 2,
                'recommended_reps': new_reps,
                'recommended_weight': float(new_weight),
                'previous_max_weight': current_weight,
                'previous_max_reps': current_reps,
                'volume_increase_percentage': 3.0,
                'muscle_targets': [
                    muscle for muscle, engagement in muscle_engagement.items()
                    if engagement > 20
                ],
                'priority_score': sum(
                    100 - ms['fatigue_percentage']
                    for ms in recovered_muscles
                    if ms['muscle_name'] in muscle_engagement
                )
            })
    
    # Sort by priority score and limit based on available time
    available_exercises.sort(key=lambda x: x['priority_score'], reverse=True)
    
    # Estimate exercises based on time (average 8-10 minutes per exercise)
    max_exercises = min(len(available_exercises), available_time_minutes // 8)
    recommendations = available_exercises[:max_exercises]
    
    # Add variation (A/B) recommendation
    last_workout_variation = await db.execute_query(
        """
        SELECT variation
        FROM workouts
        WHERE user_id = $1 AND variation IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 1
        """,
        UUID(user_id),
        fetch_one=True
    )
    
    next_variation = 'B' if last_workout_variation and last_workout_variation['variation'] == 'A' else 'A'
    
    return {
        "workout_type": workout_type or "Mixed",
        "recommended_variation": next_variation,
        "available_time_minutes": available_time_minutes,
        "total_exercises": len(recommendations),
        "estimated_duration_minutes": len(recommendations) * 8,
        "recovery_status": {
            "recovered_muscles": len(recovered_muscles),
            "fatigued_muscles": len(muscle_states) - len(recovered_muscles),
            "average_fatigue": round(
                sum(ms['fatigue_percentage'] for ms in muscle_states) / len(muscle_states)
                if muscle_states else 0,
                2
            )
        },
        "exercises": recommendations
    }


@router.get("/progress/{user_id}")
async def get_progress_analytics(
    user_id: str,
    weeks: int = Query(12, ge=1, le=52, description="Number of weeks to analyze"),
    muscle_group: Optional[str] = Query(None, description="Filter by muscle group"),
    current_user: User = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
):
    """
    Get comprehensive progress tracking and trends
    
    **Analyzes:**
    - Volume progression over time
    - Strength gains by muscle group
    - Personal records and milestones
    - Workout frequency and consistency
    - Progressive overload achievement
    
    **Returns:** Detailed progress metrics and trends
    """
    # Verify user access
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's data"
        )
    
    start_date = date.today() - timedelta(weeks=weeks)
    
    # Get volume trends
    volume_query = """
        SELECT 
            DATE_TRUNC('week', w.started_at) as week,
            SUM(ws.volume_lbs) as total_volume,
            COUNT(DISTINCT w.id) as workout_count,
            COUNT(ws.id) as total_sets,
            SUM(ws.reps) as total_reps,
            AVG(ws.weight_lbs) as avg_weight,
            AVG(ws.perceived_exertion) as avg_exertion
        FROM workouts w
        JOIN workout_sets ws ON w.id = ws.workout_id
        WHERE w.user_id = $1
          AND w.started_at >= $2
          AND w.is_completed = true
        GROUP BY DATE_TRUNC('week', w.started_at)
        ORDER BY week
    """
    
    volume_trends = await db.execute_query(
        volume_query,
        UUID(user_id),
        start_date,
        fetch_all=True
    )
    
    # Get strength progression by exercise
    strength_query = """
        SELECT 
            ws.exercise_id,
            e.name as exercise_name,
            e.category,
            e.primary_muscles,
            DATE_TRUNC('week', ws.created_at) as week,
            MAX(ws.weight_lbs) as max_weight,
            MAX(ws.reps) as max_reps,
            MAX(ws.estimated_one_rep_max) as max_1rm,
            COUNT(*) as set_count
        FROM workout_sets ws
        JOIN exercises e ON ws.exercise_id = e.id
        WHERE ws.user_id = $1
          AND ws.created_at >= $2
        GROUP BY ws.exercise_id, e.name, e.category, e.primary_muscles, 
                 DATE_TRUNC('week', ws.created_at)
        ORDER BY ws.exercise_id, week
    """
    
    strength_data = await db.execute_query(
        strength_query,
        UUID(user_id),
        start_date,
        fetch_all=True
    )
    
    # Get personal records
    pr_query = """
        SELECT 
            ws.exercise_id,
            e.name as exercise_name,
            MAX(ws.weight_lbs) as max_weight,
            MAX(ws.reps) as max_reps_single_set,
            MAX(ws.volume_lbs) as max_volume_single_set,
            MAX(ws.estimated_one_rep_max) as estimated_1rm,
            MAX(ws.created_at) as last_pr_date
        FROM workout_sets ws
        JOIN exercises e ON ws.exercise_id = e.id
        WHERE ws.user_id = $1
          AND ws.is_personal_best = true
        GROUP BY ws.exercise_id, e.name
        ORDER BY MAX(ws.created_at) DESC
        LIMIT 10
    """
    
    personal_records = await db.execute_query(
        pr_query,
        UUID(user_id),
        fetch_all=True
    )
    
    # Calculate progress metrics
    if volume_trends:
        first_week_volume = float(volume_trends[0]['total_volume'] or 0)
        last_week_volume = float(volume_trends[-1]['total_volume'] or 0)
        volume_change_pct = (
            ((last_week_volume - first_week_volume) / first_week_volume * 100)
            if first_week_volume > 0 else 0
        )
    else:
        volume_change_pct = 0
    
    # Group strength progression by exercise
    strength_by_exercise = {}
    for row in strength_data:
        exercise_id = row['exercise_id']
        if exercise_id not in strength_by_exercise:
            strength_by_exercise[exercise_id] = {
                'exercise_name': row['exercise_name'],
                'category': row['category'],
                'primary_muscles': row['primary_muscles'],
                'progression': []
            }
        
        strength_by_exercise[exercise_id]['progression'].append({
            'week': row['week'].isoformat(),
            'max_weight': float(row['max_weight']),
            'max_reps': row['max_reps'],
            'max_1rm': float(row['max_1rm']) if row['max_1rm'] else None,
            'set_count': row['set_count']
        })
    
    # Calculate strength gains
    strength_gains = []
    for exercise_id, data in strength_by_exercise.items():
        if len(data['progression']) >= 2:
            first = data['progression'][0]
            last = data['progression'][-1]
            
            weight_gain = last['max_weight'] - first['max_weight']
            weight_gain_pct = (weight_gain / first['max_weight'] * 100) if first['max_weight'] > 0 else 0
            
            strength_gains.append({
                'exercise_name': data['exercise_name'],
                'category': data['category'],
                'starting_weight': first['max_weight'],
                'current_weight': last['max_weight'],
                'weight_gain': weight_gain,
                'weight_gain_percentage': round(weight_gain_pct, 2),
                'weeks_trained': len(data['progression'])
            })
    
    # Sort strength gains by percentage
    strength_gains.sort(key=lambda x: x['weight_gain_percentage'], reverse=True)
    
    return {
        "analysis_period": {
            "weeks": weeks,
            "start_date": start_date.isoformat(),
            "end_date": date.today().isoformat()
        },
        "volume_metrics": {
            "total_volume_change_percentage": round(volume_change_pct, 2),
            "weekly_trends": [
                {
                    "week": row['week'].isoformat(),
                    "total_volume": float(row['total_volume'] or 0),
                    "workout_count": row['workout_count'],
                    "total_sets": row['total_sets'],
                    "total_reps": row['total_reps'],
                    "avg_weight": float(row['avg_weight'] or 0),
                    "avg_exertion": float(row['avg_exertion'] or 0)
                }
                for row in volume_trends
            ]
        },
        "strength_gains": strength_gains[:10],  # Top 10 improvements
        "personal_records": [
            {
                "exercise_name": row['exercise_name'],
                "max_weight": float(row['max_weight']),
                "max_reps_single_set": row['max_reps_single_set'],
                "max_volume_single_set": float(row['max_volume_single_set']),
                "estimated_1rm": float(row['estimated_1rm']) if row['estimated_1rm'] else None,
                "achieved_date": row['last_pr_date'].isoformat()
            }
            for row in personal_records
        ],
        "consistency_metrics": {
            "total_workouts": sum(row['workout_count'] for row in volume_trends),
            "average_workouts_per_week": round(
                sum(row['workout_count'] for row in volume_trends) / len(volume_trends)
                if volume_trends else 0,
                2
            ),
            "total_sets": sum(row['total_sets'] for row in volume_trends),
            "total_reps": sum(row['total_reps'] for row in volume_trends)
        }
    }


@router.get("/muscle-heatmap/{user_id}")
async def get_muscle_heatmap_data(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
):
    """
    Get muscle fatigue data formatted for heatmap visualization
    
    **Returns data optimized for UI rendering:**
    - Muscle groups with fatigue levels
    - Color coding suggestions (green to red)
    - Individual muscle breakdown
    - Recovery timeline visualization data
    
    **Format:** Ready for SVG overlay or heatmap rendering
    """
    # Verify user access
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's data"
        )
    
    # Get current muscle states
    muscle_states = await calculate_muscle_fatigue_from_workouts(
        db, UUID(user_id)
    )
    
    # Group by muscle groups for visualization
    heatmap_data = {
        "Push": [],
        "Pull": [],
        "Legs": [],
        "Core": [],
        "Other": []
    }
    
    # Color scale (CSS colors or hex)
    def get_fatigue_color(fatigue_pct):
        if fatigue_pct < 20:
            return "#00FF00"  # Green - fully recovered
        elif fatigue_pct < 40:
            return "#7FFF00"  # Light green - mostly recovered
        elif fatigue_pct < 60:
            return "#FFFF00"  # Yellow - moderate fatigue
        elif fatigue_pct < 80:
            return "#FF7F00"  # Orange - high fatigue
        else:
            return "#FF0000"  # Red - extreme fatigue
    
    # Process muscle states
    for state in muscle_states:
        muscle_data = {
            "muscle_name": state['muscle_name'],
            "display_name": state['muscle_name'].replace('_', ' '),
            "fatigue_percentage": state['fatigue_percentage'],
            "recovery_percentage": state['recovery_percentage'],
            "color": get_fatigue_color(state['fatigue_percentage']),
            "days_until_recovered": max(0, RECOVERY_DAYS - state['days_since_trained']),
            "last_trained": state['last_trained_date'].isoformat() if state['last_trained_date'] else None,
            "weekly_volume": state['weekly_volume_lbs'],
            "status": "Ready" if state['fatigue_percentage'] < 30 else "Recovering"
        }
        
        group = state['muscle_group']
        if group in heatmap_data:
            heatmap_data[group].append(muscle_data)
    
    # Calculate group summaries
    group_summaries = {}
    for group, muscles in heatmap_data.items():
        if muscles:
            avg_fatigue = sum(m['fatigue_percentage'] for m in muscles) / len(muscles)
            group_summaries[group] = {
                "average_fatigue": round(avg_fatigue, 2),
                "color": get_fatigue_color(avg_fatigue),
                "muscle_count": len(muscles),
                "ready_count": sum(1 for m in muscles if m['status'] == "Ready")
            }
    
    # Recovery timeline (next 7 days)
    recovery_timeline = []
    for i in range(8):
        future_date = date.today() + timedelta(days=i)
        
        # Recalculate fatigue for future date
        future_states = await calculate_muscle_fatigue_from_workouts(
            db, UUID(user_id), future_date
        )
        
        ready_muscles = sum(1 for ms in future_states if ms['fatigue_percentage'] < 30)
        
        recovery_timeline.append({
            "date": future_date.isoformat(),
            "days_from_now": i,
            "ready_muscles": ready_muscles,
            "total_muscles": len(future_states),
            "recovery_percentage": round(
                (ready_muscles / len(future_states) * 100) if future_states else 0,
                2
            )
        })
    
    return {
        "timestamp": datetime.now().isoformat(),
        "muscle_groups": heatmap_data,
        "group_summaries": group_summaries,
        "recovery_timeline": recovery_timeline,
        "legend": {
            "colors": [
                {"range": "0-20%", "color": "#00FF00", "label": "Fully Recovered"},
                {"range": "20-40%", "color": "#7FFF00", "label": "Mostly Recovered"},
                {"range": "40-60%", "color": "#FFFF00", "label": "Moderate Fatigue"},
                {"range": "60-80%", "color": "#FF7F00", "label": "High Fatigue"},
                {"range": "80-100%", "color": "#FF0000", "label": "Extreme Fatigue"}
            ]
        },
        "summary": {
            "total_muscles_tracked": len(muscle_states),
            "muscles_ready": sum(1 for ms in muscle_states if ms['fatigue_percentage'] < 30),
            "average_fatigue": round(
                sum(ms['fatigue_percentage'] for ms in muscle_states) / len(muscle_states)
                if muscle_states else 0,
                2
            )
        }
    }