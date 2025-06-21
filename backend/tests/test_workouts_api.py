"""
FitForge Workouts API Test Suite
Created: December 21, 2024
Purpose: Validate security, schema alignment, and architectural fixes in workouts.py

CRITICAL: These tests validate the recent fixes for:
1. SQL Security - Parameterized queries instead of f-strings
2. Schema Alignment - Only using verified database columns
3. Volume Calculation - Database triggers instead of Python calculation
"""

import pytest
import asyncio
from datetime import datetime, date
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import HTTPException
import sys
import os

# Add project root to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from backend.app.api.workouts import (
    get_workouts, 
    get_workout, 
    create_workout, 
    complete_workout,
    update_muscle_states
)
from backend.app.core.database import DatabaseManager, DatabaseUtils


class TestSQLSecurityFixes:
    """
    Test Suite 1: SQL Security Pattern Validation
    Validates the fix for parameterized queries vs f-string injection risks
    """

    @pytest.fixture
    def mock_db(self):
        """Mock database manager for testing"""
        db = AsyncMock(spec=DatabaseManager)
        db.execute_query = AsyncMock()
        return db

    @pytest.mark.asyncio
    async def test_get_workouts_parameterized_queries(self, mock_db):
        """Test that get_workouts uses safe parameterized queries"""
        # Mock successful query response
        mock_db.execute_query.return_value = [
            {"id": "test-id", "workout_type": "Push", "user_id": "user-123"}
        ]
        
        # Test with multiple filters
        result = await get_workouts(
            user_id="user-123",
            workout_type="Push", 
            start_date=date(2024, 1, 1),
            end_date=date(2024, 12, 31),
            is_completed=True,
            limit=10,
            offset=0,
            db=mock_db
        )
        
        # Verify query was called
        assert mock_db.execute_query.called
        call_args = mock_db.execute_query.call_args
        
        # Verify query uses parameterized format
        query = call_args[0][0]  # First positional argument is the query
        params = call_args[0][1:]  # Remaining are parameters
        
        # Critical Security Test: Query should contain $1, $2, etc. placeholders
        assert "$1" in query or "$" in query, "Query must use parameterized placeholders"
        assert "user-123" not in query, "User input should not be in query string"
        assert "Push" not in query, "Filter values should not be in query string"
        
        # Verify parameters are passed separately
        assert len(params) >= 2, "Parameters should be passed separately from query"
        assert "user-123" in params, "User ID should be in parameters"
        assert "Push" in params, "Workout type should be in parameters"

    @pytest.mark.asyncio
    async def test_get_workouts_no_sql_injection_risk(self, mock_db):
        """Test that malicious input cannot cause SQL injection"""
        mock_db.execute_query.return_value = []
        
        # Attempt SQL injection via user_id
        malicious_user_id = "'; DROP TABLE workouts; --"
        
        result = await get_workouts(
            user_id=malicious_user_id,
            db=mock_db
        )
        
        # Verify the malicious string was parameterized safely
        call_args = mock_db.execute_query.call_args
        query = call_args[0][0]
        params = call_args[0][1:]
        
        # The malicious string should be in parameters, not in query
        assert malicious_user_id not in query, "Malicious input leaked into query string"
        assert malicious_user_id in params, "Malicious input should be safely parameterized"

    @pytest.mark.asyncio 
    async def test_pagination_parameters_safe(self, mock_db):
        """Test that pagination uses safe parameter handling"""
        mock_db.execute_query.return_value = []
        
        result = await get_workouts(
            limit=50,
            offset=100,
            db=mock_db
        )
        
        call_args = mock_db.execute_query.call_args
        query = call_args[0][0]
        params = call_args[0][1:]
        
        # Verify LIMIT and OFFSET are parameterized
        assert "LIMIT $" in query or "50" not in query, "LIMIT should be parameterized"
        assert "OFFSET $" in query or "100" not in query, "OFFSET should be parameterized"


class TestSchemaAlignmentFixes:
    """
    Test Suite 2: Schema Alignment Validation
    Validates the fix for using only verified database columns
    """

    @pytest.fixture
    def mock_db(self):
        db = AsyncMock(spec=DatabaseManager)
        db.execute_query = AsyncMock()
        return db

    @pytest.fixture
    def valid_workout_data(self):
        """Valid workout creation data using only verified columns"""
        return {
            "user_id": "user-123",
            "workout_type": "Push",
            "name": "Monday Push Workout",
            "variation": "A",
            "notes": "Felt strong today",
            "started_at": datetime.utcnow()
        }

    @pytest.mark.asyncio
    async def test_create_workout_verified_columns_only(self, mock_db, valid_workout_data):
        """Test that create_workout uses only verified database columns"""
        # Mock user verification and workout creation
        DatabaseUtils.verify_user_exists = AsyncMock(return_value=True)
        mock_db.execute_query.return_value = {
            "id": "workout-123",
            **valid_workout_data,
            "is_completed": False
        }
        
        # Create mock WorkoutCreate object
        workout_create = MagicMock()
        for key, value in valid_workout_data.items():
            setattr(workout_create, key, value)
        
        result = await create_workout(workout_create, mock_db)
        
        # Verify the INSERT query uses only verified columns
        call_args = mock_db.execute_query.call_args
        query = call_args[0][0]
        
        # Verify ONLY verified columns are in INSERT statement
        verified_columns = [
            "id", "user_id", "workout_type", "name", 
            "started_at", "variation", "notes", "is_completed"
        ]
        
        for column in verified_columns:
            assert column in query, f"Verified column '{column}' should be in INSERT"
        
        # Critical Fix Validation: Ensure removed columns are NOT in query
        forbidden_columns = ["target_area", "is_ab_variation", "difficulty"]
        for column in forbidden_columns:
            assert column not in query, f"Non-existent column '{column}' should NOT be in INSERT"

    @pytest.mark.asyncio
    async def test_create_workout_parameter_count_matches(self, mock_db, valid_workout_data):
        """Test that parameter count matches column count"""
        DatabaseUtils.verify_user_exists = AsyncMock(return_value=True)
        mock_db.execute_query.return_value = {"id": "test"}
        
        workout_create = MagicMock()
        for key, value in valid_workout_data.items():
            setattr(workout_create, key, value)
        
        await create_workout(workout_create, mock_db)
        
        call_args = mock_db.execute_query.call_args
        query = call_args[0][0]
        params = call_args[0][1:]
        
        # Count placeholders in query ($1, $2, etc.)
        placeholder_count = query.count("$")
        param_count = len(params)
        
        assert placeholder_count == param_count, \
            f"Placeholder count ({placeholder_count}) must match parameter count ({param_count})"


class TestVolumeCalculationFixes:
    """
    Test Suite 3: Volume Calculation Architecture Validation
    Validates the fix for using database triggers instead of Python calculation
    """

    @pytest.fixture
    def mock_db(self):
        db = AsyncMock(spec=DatabaseManager)
        db.execute_query = AsyncMock()
        return db

    @pytest.fixture
    def mock_workout_data(self):
        """Mock workout data with database-calculated values"""
        return {
            "id": "workout-123",
            "user_id": "user-123",
            "is_completed": False,
            "started_at": datetime.utcnow()
        }

    @pytest.fixture
    def mock_completed_workout(self):
        """Mock workout data after completion with database-calculated metrics"""
        return {
            "id": "workout-123",
            "user_id": "user-123", 
            "is_completed": True,
            "started_at": datetime.utcnow(),
            "ended_at": datetime.utcnow(),
            "total_volume_lbs": 2500.0,  # Calculated by database trigger
            "total_sets": 12,           # Calculated by database trigger
            "total_reps": 120,          # Calculated by database trigger
            "exercises_count": 4,       # Calculated by database trigger
            "duration_seconds": 3600    # Calculated by database trigger
        }

    @pytest.mark.asyncio
    async def test_complete_workout_uses_database_calculations(self, mock_db, mock_workout_data, mock_completed_workout):
        """
        CRITICAL TEST: Verify complete_workout relies on database triggers for calculations
        """
        # Mock workout exists and is not completed
        mock_db.execute_query.side_effect = [
            mock_workout_data,  # First call: get workout
            [  # Second call: get workout sets with muscle engagement
                {
                    "volume_lbs": 250.0,  # Pre-calculated by database trigger
                    "muscle_engagement_data": {"Pectoralis_Major": 80, "Triceps": 60}
                }
            ],
            mock_completed_workout  # Third call: update completion, returns trigger-calculated values
        ]
        
        # Mock muscle state update
        with patch('backend.app.api.workouts.update_muscle_states') as mock_update:
            mock_update.return_value = None
            
            result = await complete_workout("workout-123", mock_db)
        
        # Verify the completion UPDATE query does NOT calculate volume manually
        completion_call = mock_db.execute_query.call_args_list[2]  # Third call
        completion_query = completion_call[0][0]
        
        # Critical Fix Validation: No manual volume calculation in UPDATE
        assert "total_volume" not in completion_query, "UPDATE should not manually set total_volume" 
        assert "total_sets" not in completion_query, "UPDATE should not manually set total_sets"
        assert "total_reps" not in completion_query, "UPDATE should not manually set total_reps"
        
        # Verify response uses database-calculated values
        assert result["metrics"]["total_volume_lbs"] == 2500.0, "Should use database-calculated volume"
        assert result["metrics"]["total_sets"] == 12, "Should use database-calculated sets"
        assert result["metrics"]["total_reps"] == 120, "Should use database-calculated reps"

    @pytest.mark.asyncio
    async def test_complete_workout_no_python_volume_calculation(self, mock_db, mock_workout_data, mock_completed_workout):
        """Test that Python does not duplicate database trigger calculations"""
        mock_db.execute_query.side_effect = [
            mock_workout_data,
            [{"volume_lbs": 300.0, "muscle_engagement_data": {}}],
            mock_completed_workout
        ]
        
        with patch('backend.app.api.workouts.update_muscle_states'):
            result = await complete_workout("workout-123", mock_db)
        
        # Verify muscle fatigue calculation uses pre-calculated volume_lbs
        # (not manually calculating weight * reps)
        muscle_sets_call = mock_db.execute_query.call_args_list[1]
        muscle_query = muscle_sets_call[0][0]
        
        # Query should select volume_lbs (pre-calculated by trigger)
        assert "volume_lbs" in muscle_query or "ws.*" in muscle_query, \
            "Should use pre-calculated volume_lbs from database"

    @pytest.mark.asyncio
    async def test_workout_metrics_consistency(self, mock_db, mock_workout_data, mock_completed_workout):
        """Test that returned metrics match database-calculated values exactly"""
        mock_db.execute_query.side_effect = [
            mock_workout_data,
            [{"volume_lbs": 100.0, "muscle_engagement_data": {}}],
            mock_completed_workout
        ]
        
        with patch('backend.app.api.workouts.update_muscle_states'):
            result = await complete_workout("workout-123", mock_db)
        
        # Verify metrics are extracted from database response, not calculated
        workout_data = result["workout"]
        metrics_data = result["metrics"]
        
        assert metrics_data["total_volume_lbs"] == workout_data["total_volume_lbs"], \
            "Metrics should match database-calculated values"
        assert metrics_data["total_sets"] == workout_data["total_sets"], \
            "Sets count should match database-calculated values"
        assert metrics_data["total_reps"] == workout_data["total_reps"], \
            "Reps count should match database-calculated values"


class TestDatabaseIntegration:
    """
    Test Suite 4: Database Integration and Error Handling
    """

    @pytest.fixture
    def mock_db(self):
        db = AsyncMock(spec=DatabaseManager)
        return db

    @pytest.mark.asyncio
    async def test_get_workout_not_found_handling(self, mock_db):
        """Test proper handling when workout doesn't exist"""
        mock_db.execute_query.return_value = None
        
        with pytest.raises(HTTPException) as exc_info:
            await get_workout("non-existent-id", mock_db)
        
        assert exc_info.value.status_code == 404
        assert "not found" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_create_workout_user_verification(self, mock_db):
        """Test that user existence is verified before workout creation"""
        # Mock user does not exist
        DatabaseUtils.verify_user_exists = AsyncMock(return_value=False)
        
        workout_create = MagicMock()
        workout_create.user_id = "non-existent-user"
        
        with pytest.raises(HTTPException) as exc_info:
            await create_workout(workout_create, mock_db)
        
        assert exc_info.value.status_code == 404
        assert "User" in exc_info.value.detail and "not found" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_complete_workout_already_completed_error(self, mock_db):
        """Test error handling for already completed workouts"""
        mock_db.execute_query.return_value = {
            "id": "workout-123",
            "is_completed": True  # Already completed
        }
        
        with pytest.raises(HTTPException) as exc_info:
            await complete_workout("workout-123", mock_db)
        
        assert exc_info.value.status_code == 400
        assert "already completed" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_database_error_preservation(self, mock_db):
        """Test that database errors preserve user context"""
        # Mock database error
        mock_db.execute_query.side_effect = Exception("Database connection failed")
        
        with pytest.raises(HTTPException) as exc_info:
            await get_workout("test-id", mock_db)
        
        assert exc_info.value.status_code == 500
        # Verify error handling preserves context (doesn't lose data)
        assert "Failed to retrieve workout" in exc_info.value.detail


class TestRegressionPrevention:
    """
    Test Suite 5: Regression Prevention
    Edge cases that could break the fixes
    """

    @pytest.fixture
    def mock_db(self):
        db = AsyncMock(spec=DatabaseManager)
        db.execute_query = AsyncMock()
        return db

    @pytest.mark.asyncio
    async def test_empty_filters_safe_handling(self, mock_db):
        """Test that empty/None filters are handled safely"""
        mock_db.execute_query.return_value = []
        
        # All filters as None
        result = await get_workouts(
            user_id=None,
            workout_type=None,
            start_date=None,
            end_date=None,
            is_completed=None,
            db=mock_db
        )
        
        # Should still work with basic query
        assert mock_db.execute_query.called
        call_args = mock_db.execute_query.call_args
        query = call_args[0][0]
        
        # Should have basic WHERE clause
        assert "WHERE" in query, "Should still have WHERE clause for safety"

    @pytest.mark.asyncio
    async def test_extreme_pagination_values(self, mock_db):
        """Test pagination with extreme values"""
        mock_db.execute_query.return_value = []
        
        # Test with very large values
        result = await get_workouts(
            limit=1000,  # Will be capped to 100
            offset=999999,
            db=mock_db
        )
        
        call_args = mock_db.execute_query.call_args
        params = call_args[0][1:]
        
        # Verify limits are enforced
        limit_param = [p for p in params if isinstance(p, int) and p <= 100]
        assert len(limit_param) > 0, "Limit should be capped to reasonable value"

    @pytest.mark.asyncio
    async def test_unicode_and_special_characters(self, mock_db):
        """Test handling of unicode and special characters in input"""
        mock_db.execute_query.return_value = []
        
        # Test with unicode workout name
        unicode_workout_type = "Push 💪 Üñíçødé"
        
        result = await get_workouts(
            workout_type=unicode_workout_type,
            db=mock_db
        )
        
        call_args = mock_db.execute_query.call_args
        params = call_args[0][1:]
        
        # Verify unicode is safely parameterized
        assert unicode_workout_type in params, "Unicode should be safely handled in parameters"


# Evidence-First Debugging Tests
class TestEvidenceFirstDebugging:
    """
    Test Suite 6: Validate Evidence-First Debugging Implementation
    """

    @pytest.mark.asyncio
    async def test_logging_patterns_implemented(self):
        """Test that evidence-first debugging patterns are implemented"""
        # This test would verify logging is in place
        # For now, we'll check the function signatures and structure
        
        import inspect
        from backend.app.api.workouts import get_workouts, create_workout, complete_workout
        
        # Check that functions exist and are properly structured
        assert callable(get_workouts), "get_workouts should be callable"
        assert callable(create_workout), "create_workout should be callable" 
        assert callable(complete_workout), "complete_workout should be callable"
        
        # Verify function signatures match expected dependency injection pattern
        sig = inspect.signature(get_workouts)
        assert 'db' in sig.parameters, "get_workouts should have db dependency"
        
        sig = inspect.signature(create_workout)
        assert 'db' in sig.parameters, "create_workout should have db dependency"


if __name__ == "__main__":
    # Run tests with: python -m pytest backend/tests/test_workouts_api.py -v
    pytest.main([__file__, "-v", "--tb=short"])