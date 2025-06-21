#!/usr/bin/env python3
"""
FitForge Test Runner
Quick validation script for recent API fixes
"""

import sys
import subprocess
import os
from pathlib import Path

def run_tests():
    """Run test suite and validate recent fixes"""
    print("🔥 FitForge Backend Test Suite - Validating Recent Fixes")
    print("=" * 60)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    try:
        # Run specific test categories
        test_commands = [
            # Security tests
            ["python", "-m", "pytest", "tests/test_workouts_api.py::TestSQLSecurityFixes", "-v"],
            
            # Schema alignment tests  
            ["python", "-m", "pytest", "tests/test_workouts_api.py::TestSchemaAlignmentFixes", "-v"],
            
            # Volume calculation tests
            ["python", "-m", "pytest", "tests/test_workouts_api.py::TestVolumeCalculationFixes", "-v"],
            
            # Integration tests
            ["python", "-m", "pytest", "tests/test_workouts_api.py::TestDatabaseIntegration", "-v"],
        ]
        
        all_passed = True
        
        for i, cmd in enumerate(test_commands, 1):
            test_name = cmd[2].split("::")[-1] if "::" in cmd[2] else "General Tests"
            print(f"\n🧪 Running Test Suite {i}: {test_name}")
            print("-" * 40)
            
            result = subprocess.run(cmd, capture_output=False, text=True)
            
            if result.returncode != 0:
                print(f"❌ Test Suite {i} FAILED")
                all_passed = False
            else:
                print(f"✅ Test Suite {i} PASSED")
        
        # Summary
        print("\n" + "=" * 60)
        if all_passed:
            print("🎉 ALL TESTS PASSED - Recent fixes validated successfully!")
            print("✅ SQL Security: Parameterized queries working")
            print("✅ Schema Alignment: Using verified columns only") 
            print("✅ Volume Calculation: Database triggers working")
            print("✅ Error Handling: User data preservation working")
            return 0
        else:
            print("❌ SOME TESTS FAILED - Review output above")
            print("🚨 Do not proceed until all tests pass")
            return 1
            
    except FileNotFoundError:
        print("❌ pytest not found. Install with: pip install pytest pytest-asyncio")
        return 1
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())