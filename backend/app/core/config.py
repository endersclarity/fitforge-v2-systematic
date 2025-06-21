"""
FitForge Backend Configuration Management
Pydantic settings for environment variable management with validation
"""

import os
from functools import lru_cache
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


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
    ENVIRONMENT: str = Field(default="development", description="Application environment")
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
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Log format string"
    )
    
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
    OPENAI_API_KEY: Optional[str] = Field(default=None, description="OpenAI API key for AI features")
    
    @field_validator('ENVIRONMENT')
    @classmethod
    def validate_environment(cls, v: str) -> str:
        """Validate environment setting"""
        allowed_environments = ['development', 'staging', 'production', 'testing']
        if v.lower() not in allowed_environments:
            raise ValueError(f'Environment must be one of: {allowed_environments}')
        return v.lower()
    
    @field_validator('LOG_LEVEL')
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level setting"""
        allowed_levels = ['CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG']
        if v.upper() not in allowed_levels:
            raise ValueError(f'Log level must be one of: {allowed_levels}')
        return v.upper()
    
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


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    Uses lru_cache to ensure single instance throughout application
    """
    return Settings()


# Export settings instance for direct import
settings = get_settings()