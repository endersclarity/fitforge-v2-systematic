#!/usr/bin/env python3
"""
Test script for FitForge error handling system
Run this to verify all error handlers are working correctly
"""

import asyncio
import httpx
import json
from typing import Dict, Any

# Base URL for the API (adjust if needed)
BASE_URL = "http://localhost:8000"

# ANSI color codes for output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"


def print_response(title: str, response: httpx.Response, expected_status: int):
    """Pretty print API response"""
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{YELLOW}{title}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")
    
    status_color = GREEN if response.status_code == expected_status else RED
    print(f"Status: {status_color}{response.status_code}{RESET} (expected: {expected_status})")
    
    if "X-Correlation-ID" in response.headers:
        print(f"Correlation ID: {response.headers['X-Correlation-ID']}")
    
    try:
        data = response.json()
        print(f"\nResponse:")
        print(json.dumps(data, indent=2))
        
        # Validate error response structure
        if response.status_code >= 400 and "error" in data:
            error = data["error"]
            required_fields = ["error_code", "message", "timestamp", "correlation_id"]
            missing = [field for field in required_fields if field not in error]
            if missing:
                print(f"{RED}Missing required fields: {missing}{RESET}")
            else:
                print(f"{GREEN}✓ All required error fields present{RESET}")
    except:
        print(f"Response: {response.text}")


async def test_error_endpoints():
    """Test all error handling endpoints"""
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        # Test successful endpoint first
        print(f"\n{GREEN}Testing Successful Response...{RESET}")
        response = await client.get("/api/test-errors/success")
        print_response("Success Response", response, 200)
        
        # Test validation error
        print(f"\n{GREEN}Testing Validation Error...{RESET}")
        response = await client.get("/api/test-errors/validation-error", params={"email": "invalid"})
        print_response("Validation Error (400)", response, 400)
        
        # Test not found error
        print(f"\n{GREEN}Testing Not Found Error...{RESET}")
        response = await client.get("/api/test-errors/not-found/test-id-123")
        print_response("Not Found Error (404)", response, 404)
        
        # Test conflict error
        print(f"\n{GREEN}Testing Conflict Error...{RESET}")
        response = await client.post("/api/test-errors/conflict")
        print_response("Conflict Error (409)", response, 409)
        
        # Test database error
        print(f"\n{GREEN}Testing Database Error...{RESET}")
        response = await client.get("/api/test-errors/database-error")
        print_response("Database Error (500)", response, 500)
        
        # Test authorization error
        print(f"\n{GREEN}Testing Authorization Error...{RESET}")
        response = await client.get("/api/test-errors/authorization-error")
        print_response("Authorization Error (403)", response, 403)
        
        # Test business logic error
        print(f"\n{GREEN}Testing Business Logic Error...{RESET}")
        response = await client.post("/api/test-errors/business-logic-error")
        print_response("Business Logic Error (422)", response, 422)
        
        # Test external service error
        print(f"\n{GREEN}Testing External Service Error...{RESET}")
        response = await client.get("/api/test-errors/external-service-error")
        print_response("External Service Error (502)", response, 502)
        
        # Test rate limit error
        print(f"\n{GREEN}Testing Rate Limit Error...{RESET}")
        response = await client.get("/api/test-errors/rate-limit-error")
        print_response("Rate Limit Error (429)", response, 429)
        
        # Test unhandled error
        print(f"\n{GREEN}Testing Unhandled Error...{RESET}")
        response = await client.get("/api/test-errors/unhandled-error")
        print_response("Unhandled Error (500)", response, 500)
        
        # Test correlation ID propagation
        print(f"\n{GREEN}Testing Correlation ID Propagation...{RESET}")
        correlation_id = "test-correlation-id-12345"
        response = await client.get(
            "/api/test-errors/not-found/test", 
            headers={"X-Correlation-ID": correlation_id}
        )
        print_response("Correlation ID Test", response, 404)
        if response.headers.get("X-Correlation-ID") == correlation_id:
            print(f"{GREEN}✓ Correlation ID propagated correctly{RESET}")
        else:
            print(f"{RED}✗ Correlation ID not propagated{RESET}")


async def test_real_endpoints():
    """Test error handling on real endpoints"""
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        print(f"\n\n{YELLOW}Testing Real Endpoints...{RESET}")
        
        # Test getting non-existent workout
        print(f"\n{GREEN}Testing Non-existent Workout...{RESET}")
        response = await client.get("/api/workouts/non-existent-id")
        print_response("Get Non-existent Workout", response, 404)
        
        # Test creating workout with invalid data
        print(f"\n{GREEN}Testing Invalid Workout Creation...{RESET}")
        response = await client.post("/api/workouts", json={})
        print_response("Create Workout with Missing Fields", response, 400)


async def main():
    """Run all tests"""
    print(f"{YELLOW}FitForge Error Handling Test Suite{RESET}")
    print(f"{YELLOW}={'='*60}{RESET}")
    
    try:
        # Check if API is running
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            response = await client.get("/")
            if response.status_code != 200:
                print(f"{RED}Error: API is not running at {BASE_URL}{RESET}")
                return
    except Exception as e:
        print(f"{RED}Error: Cannot connect to API at {BASE_URL}{RESET}")
        print(f"Details: {e}")
        return
    
    print(f"{GREEN}✓ API is running{RESET}")
    
    # Run tests
    await test_error_endpoints()
    await test_real_endpoints()
    
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{GREEN}Test suite completed!{RESET}")
    print(f"\nTo test in production mode (without debug info):")
    print(f"  Set DEBUG=false in your environment")
    print(f"  The test error endpoints will not be available")


if __name__ == "__main__":
    asyncio.run(main())