# FitForge Backend API

Production-ready FastAPI backend for FitForge fitness tracking application with muscle fatigue analytics and progressive overload targeting.

## Features

- **FastAPI Framework**: Modern, fast, and highly performant Python web framework
- **Pydantic Validation**: Strong data validation and serialization
- **Muscle Fatigue Analytics**: Advanced algorithms for tracking muscle recovery
- **Progressive Overload**: Smart recommendations for strength progression
- **Exercise Library**: Comprehensive database with muscle engagement data
- **Real-time Analytics**: Live muscle state visualization and recommendations
- **Production Ready**: Proper logging, error handling, and monitoring

## Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL 12+ (or Supabase)
- Redis (optional, for caching)

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd fitforge-v2-systematic/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the development server**
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`

### API Documentation

- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── app/
│   ├── __init__.py
│   ├── api/               # API route handlers
│   │   ├── health.py      # Health check endpoints
│   │   ├── users.py       # User management
│   │   ├── exercises.py   # Exercise library
│   │   ├── workouts.py    # Workout tracking
│   │   └── analytics.py   # Fatigue analytics
│   ├── core/              # Core application logic
│   │   ├── config.py      # Configuration management
│   │   └── logging.py     # Logging setup
│   ├── middleware/        # Custom middleware
│   │   ├── request_logging.py
│   │   └── error_handling.py
│   ├── models/            # Database models (TODO)
│   └── services/          # Business logic services (TODO)
└── tests/                 # Test suite (TODO)
```

## API Endpoints

### Health Check
- `GET /api/health/` - Application health status
- `GET /api/health/ready` - Readiness check
- `GET /api/health/live` - Liveness check
- `GET /api/health/metrics` - Basic metrics

### Users
- `GET /api/users/` - List users
- `GET /api/users/me` - Current user profile
- `POST /api/users/` - Create user
- `PUT /api/users/{id}` - Update user

### Exercises
- `GET /api/exercises/` - List exercises with filtering
- `GET /api/exercises/search` - Search exercises
- `GET /api/exercises/{id}` - Get exercise details
- `GET /api/exercises/{id}/muscle-engagement` - Muscle data

### Workouts
- `GET /api/workouts/` - List workouts
- `POST /api/workouts/` - Create workout
- `GET /api/workouts/{id}` - Get workout details
- `POST /api/workouts/{id}/complete` - Complete workout
- `GET /api/workouts/{id}/sets` - Get workout sets
- `POST /api/workouts/{id}/sets` - Add workout set

### Analytics
- `GET /api/analytics/muscle-fatigue/{user_id}` - Muscle fatigue state
- `GET /api/analytics/progressive-overload/{user_id}` - Progression recommendations
- `GET /api/analytics/volume-analysis/{user_id}` - Volume trends
- `GET /api/analytics/recovery-timeline/{user_id}` - Recovery projections
- `GET /api/analytics/dashboard/{user_id}` - Analytics dashboard

## Configuration

### Environment Variables

Key configuration options (see `.env.example` for full list):

- `ENVIRONMENT`: Application environment (development/production)
- `DEBUG`: Enable debug mode
- `DATABASE_URL`: Database connection string
- `SUPABASE_URL`: Supabase project URL (if using Supabase)
- `SECRET_KEY`: JWT secret key
- `CORS_ORIGINS`: Allowed CORS origins

### Database Setup

**Option 1: Local PostgreSQL**
```bash
# Create database
createdb fitforge

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/fitforge
```

**Option 2: Supabase**
```bash
# Set Supabase configuration in .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

## Development

### Running Tests
```bash
pytest
pytest --cov=app  # With coverage
```

### Code Quality
```bash
# Format code
black .
isort .

# Lint code
flake8
mypy .
```

### Development Server
```bash
# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run with specific log level
uvicorn main:app --reload --log-level debug
```

## Production Deployment

### Using Docker
```bash
# Build image
docker build -t fitforge-backend .

# Run container
docker run -p 8000:8000 --env-file .env fitforge-backend
```

### Using Gunicorn
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Environment Setup
1. Set `ENVIRONMENT=production` in `.env`
2. Configure strong `SECRET_KEY`
3. Set appropriate `CORS_ORIGINS`
4. Configure production database
5. Set `DEBUG=false`

## Architecture Decisions

### FastAPI Framework
- **Type Safety**: Automatic validation with Pydantic models
- **Performance**: High-performance async/await support
- **Documentation**: Auto-generated OpenAPI/Swagger docs
- **Standards**: Based on OpenAPI and JSON Schema standards

### Pydantic Models
- **Schema Integration**: Imports from `../schemas/pydantic-models.py`
- **Validation**: Strong runtime validation and type checking
- **Serialization**: Automatic JSON serialization/deserialization

### Middleware Stack
- **CORS**: Configured for Next.js frontend integration
- **Error Handling**: Centralized exception handling
- **Request Logging**: Comprehensive request/response logging
- **Security**: Trusted host validation

### Configuration Management
- **Environment Variables**: Pydantic Settings for type-safe config
- **Validation**: Runtime validation of all configuration
- **Development/Production**: Environment-specific defaults

## Contributing

1. Follow FastAPI best practices
2. Maintain type hints and Pydantic models
3. Add comprehensive error handling
4. Include appropriate logging
5. Update documentation for new endpoints

## License

[Add your license information here]