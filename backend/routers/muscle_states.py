"""
FitForge Muscle States API Router
Created: December 21, 2024
Purpose: RESTful endpoints for muscle fatigue calculation and retrieval

This module implements the complete muscle state API with:
- Real-time muscle fatigue calculation using 5-day recovery model
- Weekly volume tracking and muscle engagement analysis
- Progressive overload recommendations per muscle group
- Recovery time predictions and training readiness indicators
- Heat map data for anatomical visualization
- Integration with workout data for automated fatigue updates

The fatigue calculation engine uses scientific muscle engagement percentages
from the exercise database to compute accurate recovery states.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, text
from decimal import Decimal
import logging
import json

from ..database import get_db
from ..schemas.pydantic_models import (
    MuscleState, MuscleStateCreate, MuscleStateUpdate
)
from ..auth import get_current_user, get_user_id
from ..services.fatigue_calculator import FatigueCalculatorService
from ..services.recovery_predictor import RecoveryPredictorService
from ..models.workout_set import WorkoutSet
from ..models.workout import Workout
from ..models.exercise import Exercise

# Configure logging
logger = logging.getLogger(__name__)

# Create router with prefix and tags for OpenAPI documentation
router = APIRouter(
    prefix="/muscle-states",
    tags=["Muscle Fatigue & Recovery"],
    responses={
        404: {"description": "Muscle state not found"},
        400: {"description": "Invalid request parameters"},
        403: {"description": "Access denied - user can only access own muscle states"},
        500: {"description": "Internal server error"}
    }
)


# ============================================================================
# MUSCLE FATIGUE CALCULATION SERVICE
# ============================================================================

class MuscleStateCalculator:
    """
    Service for calculating muscle fatigue and recovery states
    """
    
    @staticmethod
    def calculate_fatigue_percentage(
        last_trained_date: Optional[date],
        weekly_volume: Decimal,
        weekly_sets: int,
        muscle_engagement_percentage: int
    ) -> Decimal:
        """
        Calculate muscle fatigue percentage using 5-day recovery model
        
        Formula:
        - Day 0 (workout day): fatigue = muscle_engagement_percentage
        - Day 1: fatigue = engagement * 0.8
        - Day 2: fatigue = engagement * 0.6  
        - Day 3: fatigue = engagement * 0.4
        - Day 4: fatigue = engagement * 0.2
        - Day 5+: fatigue = 0
        
        Adjusted for weekly volume (higher volume = slower recovery)
        """
        if not last_trained_date:
            return Decimal('0.00')
        
        days_since = (date.today() - last_trained_date).days
        
        # Base recovery curve (5-day model)
        if days_since >= 5:
            base_fatigue = 0
        elif days_since == 0:
            base_fatigue = muscle_engagement_percentage
        else:
            recovery_factors = [1.0, 0.8, 0.6, 0.4, 0.2]
            base_fatigue = muscle_engagement_percentage * recovery_factors[days_since]
        
        # Volume adjustment (higher volume = slower recovery)
        volume_factor = min(float(weekly_volume) / 1000, 2.0)  # Cap at 2x for very high volume
        adjusted_fatigue = base_fatigue * (1 + volume_factor * 0.2)
        
        # Set adjustment (more sets = more fatigue)
        sets_factor = min(weekly_sets / 20, 1.5)  # Cap at 1.5x for very high sets
        final_fatigue = adjusted_fatigue * (1 + sets_factor * 0.1)
        
        return round(Decimal(str(min(final_fatigue, 100))), 2)
    
    @staticmethod
    def calculate_recovery_percentage(fatigue_percentage: Decimal) -> Decimal:
        """Calculate recovery percentage (inverse of fatigue)"""
        return round(Decimal('100.00') - fatigue_percentage, 2)
    
    @staticmethod
    def predict_recovery_date(
        last_trained_date: Optional[date],
        current_fatigue: Decimal
    ) -> Optional[date]:
        """Predict when muscle will be fully recovered"""
        if not last_trained_date or current_fatigue <= 10:
            return None
        
        # Estimate days needed based on current fatigue level
        if current_fatigue >= 80:
            days_needed = 5
        elif current_fatigue >= 60:
            days_needed = 4
        elif current_fatigue >= 40:
            days_needed = 3
        elif current_fatigue >= 20:
            days_needed = 2
        else:
            days_needed = 1
        
        return last_trained_date + timedelta(days=days_needed)


# ============================================================================
# QUERY PARAMETER MODELS
# ============================================================================

class MuscleStateFilters:
    """Query parameters for muscle state filtering"""
    
    def __init__(
        self,
        # Muscle filtering
        muscle_group: Optional[str] = Query(None, description="Filter by muscle group (Push, Pull, Legs)"),
        muscle_name: Optional[str] = Query(None, description="Filter by specific muscle name"),
        
        # Fatigue filtering
        min_fatigue: Optional[Decimal] = Query(None, description="Minimum fatigue percentage"),
        max_fatigue: Optional[Decimal] = Query(None, description="Maximum fatigue percentage"),
        ready_to_train: bool = Query(False, description="Show only muscles ready for training (fatigue < 20%)"),
        
        # Date filtering
        calculation_date: Optional[date] = Query(None, description="Specific calculation date (default: today)"),
        
        # Sorting
        sort_by: str = Query("fatigue_percentage", description="Sort field: fatigue_percentage, recovery_percentage, weekly_volume_lbs"),
        sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order: asc or desc")
    ):
        self.muscle_group = muscle_group
        self.muscle_name = muscle_name
        self.min_fatigue = min_fatigue
        self.max_fatigue = max_fatigue
        self.ready_to_train = ready_to_train
        self.calculation_date = calculation_date or date.today()
        self.sort_by = sort_by
        self.sort_order = sort_order


# ============================================================================
# READ OPERATIONS
# ============================================================================

@router.get("/", response_model=Dict[str, Any])
async def get_muscle_states(
    filters: MuscleStateFilters = Depends(),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get current muscle fatigue states for the user
    
    **Query Parameters:**
    - muscle_group: Filter by muscle group (Push, Pull, Legs)
    - muscle_name: Filter by specific muscle name
    - min_fatigue/max_fatigue: Fatigue percentage range filtering
    - ready_to_train: Show only muscles ready for training (fatigue < 20%)
    - calculation_date: Specific date for historical data (default: today)
    - sort_by: Sort field (fatigue_percentage, recovery_percentage, weekly_volume_lbs)
    - sort_order: Sort order (asc, desc)
    
    **Returns:**
    - muscle_states: List of muscle state objects
    - overall_readiness: Training readiness summary
    - recommendations: Training recommendations based on fatigue states
    """
    try:
        # Build base query for specific calculation date
        query = db.query(MuscleState).filter(
            and_(
                MuscleState.user_id == user_id,
                func.date(MuscleState.calculation_timestamp) == filters.calculation_date
            )
        )
        
        # Apply filters
        active_filters = {"calculation_date": filters.calculation_date}
        
        if filters.muscle_group:
            query = query.filter(MuscleState.muscle_group == filters.muscle_group)
            active_filters["muscle_group"] = filters.muscle_group
        
        if filters.muscle_name:
            query = query.filter(MuscleState.muscle_name.ilike(f"%{filters.muscle_name}%"))
            active_filters["muscle_name"] = filters.muscle_name
        
        if filters.min_fatigue:
            query = query.filter(MuscleState.fatigue_percentage >= filters.min_fatigue)
            active_filters["min_fatigue"] = filters.min_fatigue
        
        if filters.max_fatigue:
            query = query.filter(MuscleState.fatigue_percentage <= filters.max_fatigue)
            active_filters["max_fatigue"] = filters.max_fatigue
        
        if filters.ready_to_train:
            query = query.filter(MuscleState.fatigue_percentage < 20)
            active_filters["ready_to_train"] = True
        
        # Apply sorting
        sort_column = getattr(MuscleState, filters.sort_by, MuscleState.fatigue_percentage)
        if filters.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        muscle_states = query.all()
        
        # Calculate overall readiness metrics
        if muscle_states:
            avg_fatigue = sum(ms.fatigue_percentage for ms in muscle_states) / len(muscle_states)
            ready_muscles = len([ms for ms in muscle_states if ms.fatigue_percentage < 20])
            total_muscles = len(muscle_states)
            
            overall_readiness = {
                "average_fatigue_percentage": round(float(avg_fatigue), 2),
                "ready_muscles_count": ready_muscles,
                "total_muscles_tracked": total_muscles,
                "readiness_percentage": round((ready_muscles / total_muscles) * 100, 1)
            }
        else:
            overall_readiness = {
                "average_fatigue_percentage": 0,
                "ready_muscles_count": 0,
                "total_muscles_tracked": 0,
                "readiness_percentage": 0
            }
        
        # Generate training recommendations
        recommendations = []
        if overall_readiness["average_fatigue_percentage"] > 60:
            recommendations.append("Consider a rest day - overall fatigue is high")
        elif overall_readiness["readiness_percentage"] > 70:
            recommendations.append("Good time for an intense training session")
        elif overall_readiness["readiness_percentage"] > 40:
            recommendations.append("Moderate training recommended - focus on recovered muscles")
        else:
            recommendations.append("Light training or active recovery recommended")
        
        return {
            "muscle_states": muscle_states,
            "overall_readiness": overall_readiness,
            "recommendations": recommendations,
            "filters_applied": active_filters
        }
        
    except Exception as e:
        logger.error(f"Error fetching muscle states for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch muscle states"
        )


@router.get("/heat-map", response_model=Dict[str, Any])
async def get_muscle_heat_map_data(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get muscle fatigue data formatted for anatomical heat map visualization
    
    **Returns:**
    - muscle_data: Dictionary mapping muscle names to fatigue percentages
    - color_scale: Recommended color scale for visualization
    - last_updated: Timestamp of most recent calculation
    """
    try:
        # Get latest muscle states
        muscle_states = db.query(MuscleState).filter(
            and_(
                MuscleState.user_id == user_id,
                func.date(MuscleState.calculation_timestamp) == date.today()
            )
        ).all()
        
        if not muscle_states:
            return {
                "muscle_data": {},
                "message": "No muscle fatigue data available. Complete a workout to see heat map.",
                "color_scale": {
                    "0-20": "#22c55e",    # Green - Ready
                    "21-40": "#eab308",   # Yellow - Light fatigue
                    "41-60": "#f97316",   # Orange - Moderate fatigue
                    "61-80": "#ef4444",   # Red - High fatigue
                    "81-100": "#991b1b"   # Dark red - Very high fatigue
                },
                "last_updated": None
            }
        
        # Format data for heat map
        muscle_data = {}
        last_updated = None
        
        for muscle_state in muscle_states:
            muscle_data[muscle_state.muscle_name] = {
                "fatigue_percentage": float(muscle_state.fatigue_percentage),
                "recovery_percentage": float(muscle_state.recovery_percentage),
                "weekly_volume": float(muscle_state.weekly_volume_lbs),
                "days_since_trained": muscle_state.days_since_trained,
                "expected_recovery_date": muscle_state.expected_recovery_date.isoformat() if muscle_state.expected_recovery_date else None
            }
            
            if not last_updated or muscle_state.calculation_timestamp > last_updated:
                last_updated = muscle_state.calculation_timestamp
        
        return {
            "muscle_data": muscle_data,
            "color_scale": {
                "0-20": "#22c55e",    # Green - Ready
                "21-40": "#eab308",   # Yellow - Light fatigue
                "41-60": "#f97316",   # Orange - Moderate fatigue
                "61-80": "#ef4444",   # Red - High fatigue
                "81-100": "#991b1b"   # Dark red - Very high fatigue
            },
            "last_updated": last_updated.isoformat() if last_updated else None,
            "total_muscles": len(muscle_data)
        }
        
    except Exception as e:
        logger.error(f"Error generating heat map data for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate heat map data"
        )


@router.get("/{muscle_name}/history")
async def get_muscle_history(
    muscle_name: str,
    days_back: int = Query(30, ge=1, le=90, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get historical fatigue data for a specific muscle
    
    **Path Parameters:**
    - muscle_name: Name of the muscle (e.g., 'Biceps_Brachii')
    
    **Query Parameters:**
    - days_back: Number of days to analyze (default: 30, max: 90)
    
    **Returns:**
    - Historical fatigue and recovery data with trend analysis
    """
    try:
        start_date = date.today() - timedelta(days=days_back)
        
        muscle_history = db.query(MuscleState).filter(
            and_(
                MuscleState.user_id == user_id,
                MuscleState.muscle_name == muscle_name,
                func.date(MuscleState.calculation_timestamp) >= start_date
            )
        ).order_by(MuscleState.calculation_timestamp).all()
        
        if not muscle_history:
            return {
                "muscle_name": muscle_name,
                "message": "No historical data found for this muscle",
                "history": []
            }
        
        # Format historical data
        history_data = []
        for state in muscle_history:
            history_data.append({
                "date": state.calculation_timestamp.date().isoformat(),
                "fatigue_percentage": float(state.fatigue_percentage),
                "recovery_percentage": float(state.recovery_percentage),
                "weekly_volume_lbs": float(state.weekly_volume_lbs),
                "weekly_sets": state.weekly_sets,
                "days_since_trained": state.days_since_trained
            })
        
        # Calculate trends
        if len(history_data) >= 2:
            first_fatigue = history_data[0]["fatigue_percentage"]
            last_fatigue = history_data[-1]["fatigue_percentage"]
            fatigue_trend = last_fatigue - first_fatigue
            
            avg_volume = sum(d["weekly_volume_lbs"] for d in history_data) / len(history_data)
        else:
            fatigue_trend = 0
            avg_volume = 0
        
        return {
            "muscle_name": muscle_name,
            "days_analyzed": days_back,
            "history": history_data,
            "trends": {
                "fatigue_change": round(fatigue_trend, 2),
                "average_weekly_volume": round(avg_volume, 2),
                "total_data_points": len(history_data)
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching history for muscle {muscle_name}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch muscle history"
        )


# ============================================================================
# CALCULATION OPERATIONS
# ============================================================================

@router.post("/calculate", response_model=Dict[str, Any])
async def calculate_muscle_states(
    background_tasks: BackgroundTasks,
    force_recalculate: bool = Query(False, description="Force recalculation even if data exists for today"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Calculate current muscle fatigue states based on recent workout data
    
    **Query Parameters:**
    - force_recalculate: Force recalculation even if data exists for today
    
    **Background Processing:**
    - Analyzes last 7 days of workout data
    - Calculates fatigue for each muscle based on engagement percentages
    - Updates recovery predictions and training recommendations
    
    **Returns:**
    - Calculation status and summary of results
    """
    try:
        calculation_date = date.today()
        
        # Check if calculation already exists for today
        existing_states = db.query(MuscleState).filter(
            and_(
                MuscleState.user_id == user_id,
                func.date(MuscleState.calculation_timestamp) == calculation_date
            )
        ).first()
        
        if existing_states and not force_recalculate:
            return {
                "message": "Muscle states already calculated for today",
                "calculation_date": calculation_date.isoformat(),
                "use_force_recalculate": "Set force_recalculate=true to recalculate"
            }
        
        # Delete existing calculations for today if force recalculating
        if force_recalculate:
            db.query(MuscleState).filter(
                and_(
                    MuscleState.user_id == user_id,
                    func.date(MuscleState.calculation_timestamp) == calculation_date
                )
            ).delete()
        
        # Get workout data from last 7 days
        week_start = calculation_date - timedelta(days=7)
        
        # Query completed workouts and their sets
        workout_data = db.execute(
            text("""
                SELECT 
                    ws.exercise_id,
                    e.muscle_engagement,
                    e.primary_muscles,
                    SUM(ws.volume_lbs) as total_volume,
                    COUNT(ws.id) as total_sets,
                    MAX(ws.created_at::date) as last_trained_date
                FROM workout_sets ws
                JOIN workouts w ON ws.workout_id = w.id
                JOIN exercises e ON ws.exercise_id = e.id
                WHERE w.user_id = :user_id 
                    AND w.is_completed = true
                    AND ws.created_at >= :week_start
                GROUP BY ws.exercise_id, e.muscle_engagement, e.primary_muscles
            """),
            {"user_id": user_id, "week_start": week_start}
        )
        
        # Aggregate muscle data
        muscle_data = {}
        
        for row in workout_data:
            muscle_engagement = json.loads(row.muscle_engagement) if isinstance(row.muscle_engagement, str) else row.muscle_engagement
            
            for muscle_name, engagement_percentage in muscle_engagement.items():
                if engagement_percentage > 0:  # Only track muscles with actual engagement
                    if muscle_name not in muscle_data:
                        muscle_data[muscle_name] = {
                            "weekly_volume": 0,
                            "weekly_sets": 0,
                            "last_trained_date": None,
                            "muscle_group": _determine_muscle_group(muscle_name)
                        }
                    
                    # Add volume weighted by engagement percentage
                    weighted_volume = float(row.total_volume) * (engagement_percentage / 100)
                    muscle_data[muscle_name]["weekly_volume"] += weighted_volume
                    muscle_data[muscle_name]["weekly_sets"] += row.total_sets
                    
                    # Update last trained date
                    if (not muscle_data[muscle_name]["last_trained_date"] or 
                        row.last_trained_date > muscle_data[muscle_name]["last_trained_date"]):
                        muscle_data[muscle_name]["last_trained_date"] = row.last_trained_date
        
        # Calculate fatigue states for each muscle
        calculated_states = []
        calculator = MuscleStateCalculator()
        
        for muscle_name, data in muscle_data.items():
            # Get average engagement percentage for this muscle
            avg_engagement = _get_average_muscle_engagement(db, muscle_name)
            
            fatigue_percentage = calculator.calculate_fatigue_percentage(
                data["last_trained_date"],
                Decimal(str(data["weekly_volume"])),
                data["weekly_sets"],
                avg_engagement
            )
            
            recovery_percentage = calculator.calculate_recovery_percentage(fatigue_percentage)
            expected_recovery_date = calculator.predict_recovery_date(
                data["last_trained_date"],
                fatigue_percentage
            )
            
            # Create muscle state record
            muscle_state = MuscleState(
                user_id=user_id,
                muscle_name=muscle_name,
                muscle_group=data["muscle_group"],
                fatigue_percentage=fatigue_percentage,
                recovery_percentage=recovery_percentage,
                weekly_volume_lbs=Decimal(str(data["weekly_volume"])),
                weekly_sets=data["weekly_sets"],
                weekly_frequency=1 if data["last_trained_date"] else 0,
                last_trained_date=data["last_trained_date"],
                expected_recovery_date=expected_recovery_date,
                calculation_timestamp=datetime.utcnow()
            )
            
            db.add(muscle_state)
            calculated_states.append({
                "muscle_name": muscle_name,
                "fatigue_percentage": float(fatigue_percentage),
                "recovery_percentage": float(recovery_percentage)
            })
        
        db.commit()
        
        return {
            "message": "Muscle states calculated successfully",
            "calculation_date": calculation_date.isoformat(),
            "muscles_calculated": len(calculated_states),
            "states_summary": calculated_states[:10],  # Show first 10 for preview
            "total_states": len(calculated_states)
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error calculating muscle states for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate muscle states"
        )


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _determine_muscle_group(muscle_name: str) -> str:
    """Determine muscle group based on muscle name"""
    muscle_name_lower = muscle_name.lower()
    
    # Push muscles
    if any(muscle in muscle_name_lower for muscle in [
        'pectoralis', 'chest', 'triceps', 'deltoid', 'shoulder'
    ]):
        return "Push"
    
    # Pull muscles
    elif any(muscle in muscle_name_lower for muscle in [
        'latissimus', 'rhomboid', 'trapezius', 'biceps', 'rear_delt', 'back'
    ]):
        return "Pull"
    
    # Legs muscles
    elif any(muscle in muscle_name_lower for muscle in [
        'quadriceps', 'hamstring', 'glute', 'calf', 'gastrocnemius', 'soleus'
    ]):
        return "Legs"
    
    # Core muscles
    elif any(muscle in muscle_name_lower for muscle in [
        'core', 'abdominal', 'oblique'
    ]):
        return "Core"
    
    else:
        return "Other"


def _get_average_muscle_engagement(db: Session, muscle_name: str) -> int:
    """Get average engagement percentage for a muscle across all exercises"""
    try:
        result = db.execute(
            text("""
                SELECT AVG((muscle_engagement->>:muscle_name)::int) as avg_engagement
                FROM exercises 
                WHERE muscle_engagement ? :muscle_name
                    AND is_active = true
            """),
            {"muscle_name": muscle_name}
        )
        
        avg_engagement = result.scalar()
        return int(avg_engagement) if avg_engagement else 50  # Default to 50% if no data
        
    except Exception:
        return 50  # Default fallback


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@router.get("/analytics/recovery-recommendations")
async def get_recovery_recommendations(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id)
):
    """
    Get personalized recovery recommendations based on current muscle states
    
    **Returns:**
    - Detailed recommendations for training and recovery
    - Suggested workout types based on muscle readiness
    - Recovery timeline predictions
    """
    try:
        # Get current muscle states
        muscle_states = db.query(MuscleState).filter(
            and_(
                MuscleState.user_id == user_id,
                func.date(MuscleState.calculation_timestamp) == date.today()
            )
        ).all()
        
        if not muscle_states:
            return {
                "message": "No muscle state data available. Complete a workout and calculate muscle states first.",
                "recommendations": []
            }
        
        # Analyze muscle groups
        muscle_groups = {"Push": [], "Pull": [], "Legs": [], "Core": [], "Other": []}
        
        for state in muscle_states:
            muscle_groups[state.muscle_group].append(state)
        
        # Generate recommendations
        recommendations = []
        
        for group_name, muscles in muscle_groups.items():
            if not muscles:
                continue
                
            avg_fatigue = sum(m.fatigue_percentage for m in muscles) / len(muscles)
            ready_muscles = len([m for m in muscles if m.fatigue_percentage < 20])
            
            if avg_fatigue < 20:
                recommendations.append({
                    "muscle_group": group_name,
                    "status": "Ready",
                    "recommendation": f"{group_name} muscles are ready for intense training",
                    "suggested_intensity": "High",
                    "recovery_needed": False
                })
            elif avg_fatigue < 40:
                recommendations.append({
                    "muscle_group": group_name,
                    "status": "Moderate Fatigue",
                    "recommendation": f"{group_name} muscles can handle moderate training",
                    "suggested_intensity": "Moderate",
                    "recovery_needed": False
                })
            elif avg_fatigue < 60:
                recommendations.append({
                    "muscle_group": group_name,
                    "status": "High Fatigue",
                    "recommendation": f"Light training only for {group_name} muscles",
                    "suggested_intensity": "Light",
                    "recovery_needed": True
                })
            else:
                recommendations.append({
                    "muscle_group": group_name,
                    "status": "Very High Fatigue",
                    "recommendation": f"Rest recommended for {group_name} muscles",
                    "suggested_intensity": "Rest",
                    "recovery_needed": True
                })
        
        # Overall recommendation
        overall_fatigue = sum(m.fatigue_percentage for m in muscle_states) / len(muscle_states)
        
        if overall_fatigue < 30:
            overall_recommendation = "Great time for a full-body or high-intensity workout"
        elif overall_fatigue < 50:
            overall_recommendation = "Focus on less fatigued muscle groups"
        else:
            overall_recommendation = "Consider active recovery or light training"
        
        return {
            "overall_fatigue_percentage": round(float(overall_fatigue), 2),
            "overall_recommendation": overall_recommendation,
            "muscle_group_recommendations": recommendations,
            "calculation_date": date.today().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating recovery recommendations for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recovery recommendations"
        )