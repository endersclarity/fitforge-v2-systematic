# FitForge Backend Configuration Guide

## Overview

The FitForge backend uses a comprehensive Pydantic-based settings management system that supports:

- Environment-based configuration
- Type validation and constraints
- Nested configuration groups
- Feature flags for A/B testing
- Secure secrets management
- Production validation

## Configuration Structure

### Core Settings (`app/core/config.py`)

The configuration is organized into several classes:

1. **Settings** - Main configuration class
2. **FeatureFlags** - Feature toggles and A/B testing
3. **DatabaseSettings** - Database connection and pool settings
4. **CacheSettings** - Redis cache configuration
5. **MonitoringSettings** - Observability and metrics

### Environment Variables

All settings can be configured via environment variables. The system supports:

- `.env` file for local development
- Environment variables for production
- Default values with proper typing
- Validation of required settings

## Configuration Categories

### 1. Application Settings

```env
# Basic application configuration
APP_NAME=FitForge API
VERSION=0.1.0
ENVIRONMENT=development  # development, staging, production, testing
DEBUG=true
```

### 2. Database Configuration

You can configure the database using either a connection URL or individual components:

```env
# Option 1: Connection URL
DATABASE_URL=postgresql://user:password@host:5432/database

# Option 2: Component-based (with DB_ prefix)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitforge
DB_USER=postgres
DB_PASSWORD=password

# Connection pool settings
DB_POOL_MIN_SIZE=5
DB_POOL_MAX_SIZE=20
DB_POOL_TIMEOUT=30
DB_COMMAND_TIMEOUT=30
```

### 3. Feature Flags

Control feature availability and A/B testing:

```env
# Core features
FEATURE_ENABLE_AI_RECOMMENDATIONS=true
FEATURE_ENABLE_MUSCLE_HEATMAP=true
FEATURE_ENABLE_SOCIAL_FEATURES=false
FEATURE_ENABLE_ADVANCED_ANALYTICS=true

# Experimental features
FEATURE_ENABLE_VOICE_LOGGING=false
FEATURE_ENABLE_AR_EXERCISES=false
FEATURE_ENABLE_NUTRITION_TRACKING=false

# A/B testing
FEATURE_AB_TEST_NEW_DASHBOARD=false
FEATURE_AB_TEST_PERCENTAGE=50
```

### 4. Cache Configuration

Redis cache settings with specific TTLs:

```env
# Redis connection
CACHE_REDIS_HOST=localhost
CACHE_REDIS_PORT=6379
CACHE_REDIS_DB=0
CACHE_REDIS_PASSWORD=optional_password

# TTL settings (in seconds)
CACHE_DEFAULT_TTL=3600
CACHE_USER_SESSION_TTL=86400
CACHE_WORKOUT_CACHE_TTL=300
CACHE_ANALYTICS_CACHE_TTL=3600
```

### 5. Security Settings

```env
# JWT and encryption
SECRET_KEY=your-very-secure-secret-key-minimum-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS configuration
CORS_ORIGINS=http://localhost:3000,https://app.fitforge.com
ALLOWED_HOSTS=localhost,app.fitforge.com
```

### 6. Monitoring and Observability

```env
# Metrics
MONITORING_ENABLE_METRICS=true
MONITORING_METRICS_ENDPOINT=/metrics
MONITORING_METRICS_TOKEN=secure_token

# Distributed tracing
MONITORING_ENABLE_TRACING=false
MONITORING_JAEGER_ENDPOINT=http://jaeger:14268/api/traces

# Error tracking
MONITORING_SENTRY_DSN=https://key@sentry.io/project
MONITORING_SENTRY_ENVIRONMENT=production
MONITORING_SENTRY_TRACES_SAMPLE_RATE=0.1
```

## Usage in Code

### 1. Basic Usage

```python
from app.core.config import get_settings
from app.core.dependencies import get_config

# Get settings instance
settings = get_settings()

# Use in FastAPI dependency
@app.get("/example")
async def example(settings: Settings = Depends(get_config)):
    if settings.is_production:
        # Production-specific logic
        pass
```

### 2. Feature Flags

```python
# Check feature flag
if settings.features.ENABLE_AI_RECOMMENDATIONS:
    # AI feature code
    pass

# Use as dependency
@app.get("/ai", dependencies=[Depends(verify_feature_flag("ENABLE_AI_RECOMMENDATIONS"))])
async def ai_endpoint():
    pass
```

### 3. A/B Testing

```python
# Check if user is in test group
if settings.is_feature_enabled_for_user("new_dashboard", user_id):
    # Show new dashboard
    pass
```

### 4. Nested Configuration

```python
# Access nested settings
db_host = settings.database.HOST
cache_ttl = settings.cache.DEFAULT_TTL
metrics_enabled = settings.monitoring.ENABLE_METRICS
```

## Validation

### Development Validation

Run the validation script to check your configuration:

```bash
python app/core/validate_settings.py
```

### Production Validation

The system automatically validates production settings:

```python
issues = settings.validate_production_settings()
if issues:
    print("Configuration issues:", issues)
```

Production checks include:
- Secret key strength
- Debug mode disabled
- CORS properly configured
- Monitoring enabled

## Best Practices

### 1. Environment-Specific Files

Create environment-specific `.env` files:
- `.env.development`
- `.env.staging`
- `.env.production`

### 2. Secrets Management

Never commit secrets to version control:
- Use environment variables in production
- Use secret management services (AWS Secrets Manager, etc.)
- Rotate secrets regularly

### 3. Feature Flag Strategy

- Start with features disabled by default
- Enable gradually with percentage-based rollout
- Monitor metrics before full rollout
- Use feature flags for breaking changes

### 4. Configuration Testing

Always test configuration changes:
```python
# In tests
def test_config():
    settings = get_settings()
    assert settings.is_secure  # For production
    assert len(settings.validate_production_settings()) == 0
```

## Docker Integration

### Docker Compose

```yaml
services:
  backend:
    env_file:
      - .env
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=postgresql://user:pass@db:5432/fitforge
```

### Dockerfile

```dockerfile
# Production build
ENV ENVIRONMENT=production
ENV DEBUG=false
```

## Troubleshooting

### Common Issues

1. **Missing environment variables**
   - Check `.env` file exists
   - Verify variable names match exactly
   - Use `python-dotenv` for loading

2. **Type validation errors**
   - Ensure values match expected types
   - Check constraints (min/max values)
   - Review validation error messages

3. **Production validation failures**
   - Run validation script before deployment
   - Check all required production settings
   - Verify security requirements

### Debug Configuration

Enable configuration debugging:

```python
import os
os.environ["SETTINGS_DEBUG"] = "true"

from app.core.config import get_settings
settings = get_settings()
print(settings.dict())  # Print all settings
```

## Migration Guide

When adding new settings:

1. Add to `config.py` with proper type and default
2. Update `.env.example` with documentation
3. Add validation if needed
4. Update this documentation
5. Test in all environments

## Security Considerations

1. **Secrets**: Use `SecretStr` type for sensitive values
2. **Validation**: Always validate in production
3. **Defaults**: Never use production secrets as defaults
4. **Access**: Limit configuration endpoint access
5. **Monitoring**: Track configuration changes

## References

- [Pydantic Settings Documentation](https://docs.pydantic.dev/latest/usage/pydantic_settings/)
- [FastAPI Settings Guide](https://fastapi.tiangolo.com/advanced/settings/)
- [12-Factor App Config](https://12factor.net/config)