# FitForge Docker Development Environment

## 🚀 Quick Start

```bash
# Start the complete development stack
./start-fitforge-docker.sh

# Access your application
Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Documentation: http://localhost:8000/docs
Database: localhost:5432
```

## 🏗️ Architecture

- **Frontend**: Next.js with hot reload (port 3000)
- **Backend**: FastAPI with uvicorn reload (port 8000)
- **Database**: PostgreSQL 15 with auto-schema initialization (port 5432)

## 🔧 Development Commands

```bash
# Start development environment
./start-fitforge-docker.sh

# Stop all services
docker-compose -f docker-compose.fast.yml down

# View logs
docker-compose -f docker-compose.fast.yml logs -f

# Rebuild containers
docker-compose -f docker-compose.fast.yml up --build

# Access database directly
psql -h localhost -p 5432 -U fitforge_user -d fitforge_dev
```

## 📝 Hot Reload Features

- **Frontend Changes**: Instant browser refresh on file save
- **Backend Changes**: Automatic FastAPI restart on file save
- **Database Schema**: Automatically loaded from `schemas/database-schema.sql`

## 🛠️ Customization

Edit `docker-compose.override.yml` for local customizations:
- Change port mappings if defaults conflict
- Add environment variables
- Override service configurations

## 🔍 Troubleshooting

**Port conflicts**: Edit `docker-compose.override.yml` to use different ports

**Slow file watching**: Volume mounts include polling for cross-platform compatibility

**Database issues**: Database automatically initializes with your schema on first run

**Service not starting**: Check Docker is running and ports are available

## 📊 Service Health

The startup script checks service health automatically. Services may take a moment to fully initialize on first run.

## 🚀 Production Deployment

This Docker setup is optimized for development. For production:
- Frontend deploys to Vercel (uses existing Next.js configuration)
- Backend deploys to your hosting service of choice
- Database uses Supabase (hosted)