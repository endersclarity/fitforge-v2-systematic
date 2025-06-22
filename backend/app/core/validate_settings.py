#!/usr/bin/env python3
"""
FitForge Settings Validation Script
Validates configuration settings for different environments
"""

import sys
import os
from typing import List, Tuple

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.config import get_settings, Environment


def validate_settings() -> Tuple[bool, List[str]]:
    """
    Validate current settings configuration
    
    Returns:
        Tuple of (is_valid, list_of_issues)
    """
    settings = get_settings()
    issues = []
    
    print(f"🔍 Validating settings for environment: {settings.ENVIRONMENT.value}")
    print("-" * 50)
    
    # Basic validation
    print("✓ Settings loaded successfully")
    
    # Environment-specific validation
    if settings.is_production:
        print("\n🏭 Production environment detected - running strict validation...")
        prod_issues = settings.validate_production_settings()
        issues.extend(prod_issues)
    
    # Database validation
    print("\n📊 Database Configuration:")
    print(f"  - URL: {settings.DATABASE_URL[:50]}...")
    print(f"  - Pool size: {settings.DATABASE_POOL_SIZE}")
    print(f"  - Using nested config: {settings.database.HOST}:{settings.database.PORT}/{settings.database.NAME}")
    
    # Feature flags
    print("\n🚩 Feature Flags:")
    print(f"  - AI Recommendations: {settings.features.ENABLE_AI_RECOMMENDATIONS}")
    print(f"  - Muscle Heatmap: {settings.features.ENABLE_MUSCLE_HEATMAP}")
    print(f"  - Social Features: {settings.features.ENABLE_SOCIAL_FEATURES}")
    print(f"  - Advanced Analytics: {settings.features.ENABLE_ADVANCED_ANALYTICS}")
    
    # Cache configuration
    print("\n💾 Cache Configuration:")
    if settings.cache.redis_url:
        print(f"  - Redis URL: {settings.cache.redis_url}")
        print(f"  - Default TTL: {settings.cache.DEFAULT_TTL}s")
    else:
        print("  - Redis not configured")
    
    # Security
    print("\n🔒 Security Configuration:")
    print(f"  - Secret key length: {len(settings.SECRET_KEY)} characters")
    print(f"  - Access token expiry: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
    print(f"  - Is secure: {settings.is_secure}")
    
    # Monitoring
    print("\n📈 Monitoring Configuration:")
    print(f"  - Metrics enabled: {settings.monitoring.ENABLE_METRICS}")
    print(f"  - Tracing enabled: {settings.monitoring.ENABLE_TRACING}")
    print(f"  - Sentry configured: {bool(settings.monitoring.SENTRY_DSN)}")
    
    # CORS
    print("\n🌐 CORS Configuration:")
    print(f"  - Allowed origins: {settings.CORS_ORIGINS}")
    print(f"  - Allowed hosts: {settings.ALLOWED_HOSTS}")
    
    # Summary
    print("\n" + "=" * 50)
    if issues:
        print(f"❌ Validation failed with {len(issues)} issue(s):")
        for i, issue in enumerate(issues, 1):
            print(f"   {i}. {issue}")
        return False, issues
    else:
        print("✅ All settings validated successfully!")
        return True, []


def main():
    """Main entry point"""
    try:
        is_valid, issues = validate_settings()
        
        # Exit with appropriate code
        if not is_valid:
            sys.exit(1)
        else:
            sys.exit(0)
            
    except Exception as e:
        print(f"\n❌ Error validating settings: {e}")
        sys.exit(2)


if __name__ == "__main__":
    main()