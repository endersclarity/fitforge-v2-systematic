"""
FitForge Backend Configuration Management
Pydantic settings for environment variable management with validation
"""

import os
from functools import lru_cache
from typing import List, Optional, Dict, Any
from enum import Enum

from pydantic import Field, field_validator, SecretStr, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    """Available application environments"""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"


class LogLevel(str, Enum):
    """Available log levels"""
    CRITICAL = "CRITICAL"
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"
    DEBUG = "DEBUG"


class FeatureFlags(BaseSettings):
    """Feature flags for A/B testing and gradual rollouts"""
    
    model_config = SettingsConfigDict(env_prefix="FEATURE_")
    
    # Core features
    ENABLE_AI_RECOMMENDATIONS: bool = Field(default=True, description="Enable AI workout recommendations")
    ENABLE_MUSCLE_HEATMAP: bool = Field(default=True, description="Enable muscle fatigue heatmap")
    ENABLE_SOCIAL_FEATURES: bool = Field(default=False, description="Enable social sharing features")
    ENABLE_ADVANCED_ANALYTICS: bool = Field(default=True, description="Enable advanced analytics")
    
    # Experimental features
    ENABLE_VOICE_LOGGING: bool = Field(default=False, description="Enable voice-based workout logging")
    ENABLE_AR_EXERCISES: bool = Field(default=False, description="Enable AR exercise demonstrations")
    ENABLE_NUTRITION_TRACKING: bool = Field(default=False, description="Enable nutrition tracking")
    
    # A/B testing
    AB_TEST_NEW_DASHBOARD: bool = Field(default=False, description="A/B test new dashboard design")
    AB_TEST_PERCENTAGE: int = Field(default=50, ge=0, le=100, description="Percentage of users in test group")


class DatabaseSettings(BaseSettings):
    """Database configuration settings"""
    
    model_config = SettingsConfigDict(env_prefix="DB_")
    
    # Connection settings
    HOST: str = Field(default="localhost", description="Database host")
    PORT: int = Field(default=5432, description="Database port")
    NAME: str = Field(default="fitforge", description="Database name")
    USER: str = Field(default="postgres", description="Database user")
    PASSWORD: SecretStr = Field(default=SecretStr("password"), description="Database password")
    
    # Pool settings
    POOL_MIN_SIZE: int = Field(default=5, ge=1, le=20, description="Minimum pool size")
    POOL_MAX_SIZE: int = Field(default=20, ge=1, le=100, description="Maximum pool size")
    POOL_TIMEOUT: int = Field(default=30, ge=1, le=300, description="Pool timeout in seconds")
    COMMAND_TIMEOUT: int = Field(default=30, ge=1, le=300, description="Command timeout in seconds")
    
    # Advanced settings
    ECHO_QUERIES: bool = Field(default=False, description="Echo SQL queries (debug only)")
    SLOW_QUERY_THRESHOLD: float = Field(default=1.0, ge=0.1, description="Slow query log threshold in seconds")
    
    @computed_field
    @property
    def connection_url(self) -> str:
        """Build database connection URL"""
        return f"postgresql://{self.USER}:{self.PASSWORD.get_secret_value()}@{self.HOST}:{self.PORT}/{self.NAME}"
    
    @computed_field
    @property
    def async_connection_url(self) -> str:
        """Build async database connection URL"""
        return f"postgresql+asyncpg://{self.USER}:{self.PASSWORD.get_secret_value()}@{self.HOST}:{self.PORT}/{self.NAME}"


class CacheSettings(BaseSettings):
    """Cache configuration settings"""
    
    model_config = SettingsConfigDict(env_prefix="CACHE_")
    
    # Redis settings
    REDIS_HOST: str = Field(default="localhost", description="Redis host")
    REDIS_PORT: int = Field(default=6379, description="Redis port")
    REDIS_DB: int = Field(default=0, description="Redis database number")
    REDIS_PASSWORD: Optional[SecretStr] = Field(default=None, description="Redis password")
    
    # Cache settings
    DEFAULT_TTL: int = Field(default=3600, ge=1, description="Default cache TTL in seconds")
    MAX_CONNECTIONS: int = Field(default=50, ge=1, description="Maximum Redis connections")
    
    # Cache keys
    USER_SESSION_TTL: int = Field(default=86400, description="User session TTL (24 hours)")
    WORKOUT_CACHE_TTL: int = Field(default=300, description="Workout cache TTL (5 minutes)")
    ANALYTICS_CACHE_TTL: int = Field(default=3600, description="Analytics cache TTL (1 hour)")
    
    @computed_field
    @property
    def redis_url(self) -> str:
        """Build Redis connection URL"""
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD.get_secret_value()}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"


class MonitoringSettings(BaseSettings):
    """Monitoring and observability settings"""
    
    model_config = SettingsConfigDict(env_prefix="MONITORING_")
    
    # Metrics
    ENABLE_METRICS: bool = Field(default=True, description="Enable metrics collection")
    METRICS_ENDPOINT: str = Field(default="/metrics", description="Metrics endpoint path")
    METRICS_TOKEN: Optional[SecretStr] = Field(default=None, description="Metrics endpoint auth token")
    
    # Tracing
    ENABLE_TRACING: bool = Field(default=False, description="Enable distributed tracing")
    JAEGER_ENDPOINT: Optional[str] = Field(default=None, description="Jaeger collector endpoint")
    
    # Error tracking
    SENTRY_DSN: Optional[SecretStr] = Field(default=None, description="Sentry DSN for error tracking")
    SENTRY_ENVIRONMENT: Optional[str] = Field(default=None, description="Sentry environment name")
    SENTRY_TRACES_SAMPLE_RATE: float = Field(default=0.1, ge=0.0, le=1.0, description="Sentry traces sample rate")


class Settings(BaseSettings):
    """
    Application settings with environment variable support
    All settings can be overridden via environment variables
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    # Application settings
    APP_NAME: str = "FitForge API"
    VERSION: str = "0.1.0"
    ENVIRONMENT: Environment = Field(default=Environment.DEVELOPMENT, description="Application environment")
    DEBUG: bool = Field(default=False, description="Enable debug mode")
    
    # Server settings
    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, ge=1, le=65535, description="Server port")
    
    # Database settings
    DATABASE_URL: str = Field(
        default="postgresql://postgres:password@localhost:5432/fitforge",
        description="Database connection URL"
    )
    DATABASE_POOL_SIZE: int = Field(default=10, ge=1, le=50, description="Database connection pool size")
    DATABASE_MAX_OVERFLOW: int = Field(default=20, ge=0, le=100, description="Database max overflow connections")
    
    # Supabase settings (if using Supabase)
    SUPABASE_URL: Optional[str] = Field(default=None, description="Supabase project URL")
    SUPABASE_ANON_KEY: Optional[str] = Field(default=None, description="Supabase anon key")
    SUPABASE_SERVICE_KEY: Optional[str] = Field(default=None, description="Supabase service role key")
    
    # Database connection pool settings
    DB_POOL_MIN_SIZE: int = Field(default=5, ge=1, le=20, description="Minimum database pool size")
    DB_POOL_MAX_SIZE: int = Field(default=20, ge=1, le=100, description="Maximum database pool size")
    DB_COMMAND_TIMEOUT: int = Field(default=30, ge=1, le=300, description="Database command timeout in seconds")
    
    # Security settings
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        min_length=32,
        description="Secret key for JWT tokens and encryption"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=1, description="JWT access token expiration in minutes")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, ge=1, description="JWT refresh token expiration in days")
    
    # CORS settings
    CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001"
        ],
        description="Allowed CORS origins"
    )
    
    # Security - Trusted hosts
    ALLOWED_HOSTS: List[str] = Field(
        default=["*"],
        description="Allowed host headers"
    )
    
    # Logging settings
    LOG_LEVEL: LogLevel = Field(default=LogLevel.INFO, description="Logging level")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Log format string"
    )
    LOG_FILE: Optional[str] = Field(default="logs/fitforge.log", description="Log file path")
    LOG_MAX_BYTES: int = Field(default=10485760, description="Max log file size (10MB)")
    LOG_BACKUP_COUNT: int = Field(default=5, description="Number of log backup files")
    
    # Redis settings (for caching, sessions)
    REDIS_URL: Optional[str] = Field(default=None, description="Redis connection URL")
    REDIS_EXPIRE_SECONDS: int = Field(default=3600, ge=1, description="Default Redis key expiration")
    
    # API rate limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, ge=1, description="API rate limit per minute per IP")
    
    # File upload settings
    MAX_UPLOAD_SIZE: int = Field(default=10 * 1024 * 1024, ge=1, description="Max file upload size in bytes (10MB)")
    UPLOAD_DIRECTORY: str = Field(default="uploads", description="Directory for file uploads")
    
    # Analytics settings
    MUSCLE_RECOVERY_DAYS: int = Field(default=5, ge=1, le=14, description="Default muscle recovery period in days")
    TARGET_VOLUME_INCREASE_PERCENTAGE: float = Field(
        default=3.0, 
        ge=0.1, 
        le=20.0, 
        description="Target volume increase percentage for progressive overload"
    )
    
    # External API settings
    OPENAI_API_KEY: Optional[SecretStr] = Field(default=None, description="OpenAI API key for AI features")
    
    # Nested configuration instances
    _features: Optional[FeatureFlags] = None
    _database: Optional[DatabaseSettings] = None
    _cache: Optional[CacheSettings] = None
    _monitoring: Optional[MonitoringSettings] = None
    
    @property
    def features(self) -> FeatureFlags:
        """Get feature flags configuration"""
        if self._features is None:
            self._features = FeatureFlags()
        return self._features
    
    @property
    def database(self) -> DatabaseSettings:
        """Get database configuration"""
        if self._database is None:
            self._database = DatabaseSettings()
        return self._database
    
    @property
    def cache(self) -> CacheSettings:
        """Get cache configuration"""
        if self._cache is None:
            self._cache = CacheSettings()
        return self._cache
    
    @property
    def monitoring(self) -> MonitoringSettings:
        """Get monitoring configuration"""
        if self._monitoring is None:
            self._monitoring = MonitoringSettings()
        return self._monitoring
    
    @field_validator('ENVIRONMENT', mode='before')
    @classmethod
    def validate_environment(cls, v: Any) -> Environment:
        """Validate environment setting"""
        if isinstance(v, Environment):
            return v
        if isinstance(v, str):
            try:
                return Environment(v.lower())
            except ValueError:
                raise ValueError(f'Environment must be one of: {[e.value for e in Environment]}')
        raise ValueError(f'Invalid environment type: {type(v)}')
    
    @field_validator('LOG_LEVEL', mode='before')
    @classmethod
    def validate_log_level(cls, v: Any) -> LogLevel:
        """Validate log level setting"""
        if isinstance(v, LogLevel):
            return v
        if isinstance(v, str):
            try:
                return LogLevel(v.upper())
            except ValueError:
                raise ValueError(f'Log level must be one of: {[l.value for l in LogLevel]}')
        raise ValueError(f'Invalid log level type: {type(v)}')
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @field_validator('ALLOWED_HOSTS', mode='before')
    @classmethod
    def parse_allowed_hosts(cls, v):
        """Parse allowed hosts from string or list"""
        if isinstance(v, str):
            return [host.strip() for host in v.split(',')]
        return v
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.ENVIRONMENT == "development"
    
    @property
    def is_testing(self) -> bool:
        """Check if running in testing environment"""
        return self.ENVIRONMENT == "testing"
    
    @property
    def database_url_async(self) -> str:
        """Get async database URL (for SQLAlchemy async)"""
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
        return self.DATABASE_URL
    
    def get_feature_flag(self, flag_name: str, default: bool = False) -> bool:
        """Get a feature flag value by name"""
        return getattr(self.features, flag_name, default)
    
    def is_feature_enabled_for_user(self, feature: str, user_id: str) -> bool:
        """Check if a feature is enabled for a specific user (for A/B testing)"""
        if not self.features.AB_TEST_NEW_DASHBOARD:
            return False
        
        # Simple hash-based A/B testing
        import hashlib
        user_hash = int(hashlib.md5(f"{user_id}{feature}".encode()).hexdigest(), 16)
        return (user_hash % 100) < self.features.AB_TEST_PERCENTAGE
    
    def get_log_config(self) -> Dict[str, Any]:
        """Get logging configuration dict"""
        return {
            "level": self.LOG_LEVEL.value,
            "format": self.LOG_FORMAT,
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "level": self.LOG_LEVEL.value,
                    "formatter": "default"
                }
            }
        }
    
    @computed_field
    @property
    def is_secure(self) -> bool:
        """Check if running with secure settings"""
        return (
            self.is_production and
            self.SECRET_KEY != "your-secret-key-change-in-production" and
            len(self.SECRET_KEY) >= 32 and
            not self.DEBUG
        )
    
    def validate_production_settings(self) -> List[str]:
        """Validate settings for production deployment"""
        issues = []
        
        if self.is_production:
            # Security checks
            if self.SECRET_KEY == "your-secret-key-change-in-production":
                issues.append("SECRET_KEY must be changed for production")
            if len(self.SECRET_KEY) < 32:
                issues.append("SECRET_KEY must be at least 32 characters")
            if self.DEBUG:
                issues.append("DEBUG must be False in production")
            
            # CORS checks
            if "*" in self.CORS_ORIGINS:
                issues.append("CORS_ORIGINS should not allow all origins in production")
            if "*" in self.ALLOWED_HOSTS:
                issues.append("ALLOWED_HOSTS should not allow all hosts in production")
            
            # Database checks
            if "password" in self.DATABASE_URL:
                issues.append("Default database password detected")
            
            # Monitoring checks
            if not self.monitoring.SENTRY_DSN:
                issues.append("Sentry error tracking should be configured for production")
        
        return issues


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    Uses lru_cache to ensure single instance throughout application
    """
    return Settings()


# Export settings instance for direct import
settings = get_settings()