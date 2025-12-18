#!/bin/bash
# ============================================================
# TalkStudio Reboot - Project Structure Setup Script
# Transforms the project into a clean frontend/ + backend/ structure
# ============================================================

set -e  # Exit on error

echo "================================================"
echo "TalkStudio Reboot - Project Structure Setup"
echo "================================================"

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================================
# Step 1: Backup current structure (safety net)
# ============================================================
log_info "Creating backup of current structure..."
BACKUP_DIR="${PROJECT_ROOT}/.backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup important files only (not node_modules)
if [ -d "backend" ]; then
    rsync -av --exclude='node_modules' --exclude='coverage' --exclude='*.log' backend/ "$BACKUP_DIR/backend_old/" 2>/dev/null || true
fi
if [ -d "frontend" ]; then
    rsync -av --exclude='node_modules' --exclude='dist' frontend/ "$BACKUP_DIR/frontend_old/" 2>/dev/null || true
fi
log_info "Backup created at: $BACKUP_DIR"

# ============================================================
# Step 2: Remove legacy and unnecessary directories
# ============================================================
log_info "Removing legacy directories..."

DIRS_TO_REMOVE=(
    "legacy"
    "ai_agent_system"
    ".specify"
    "dist"
    "coverage"
)

for dir in "${DIRS_TO_REMOVE[@]}"; do
    if [ -d "$dir" ]; then
        log_warn "Removing: $dir"
        rm -rf "$dir"
    fi
done

# Remove old Node.js backend (will be replaced with FastAPI)
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    log_warn "Removing old Node.js backend (will be replaced with FastAPI)..."
    rm -rf backend
fi

# ============================================================
# Step 3: Create new FastAPI backend structure
# ============================================================
log_info "Creating new FastAPI backend structure..."

mkdir -p backend/{app/{api,core,models,schemas,services},tests}

# Create backend __init__ files
touch backend/app/__init__.py
touch backend/app/api/__init__.py
touch backend/app/core/__init__.py
touch backend/app/models/__init__.py
touch backend/app/schemas/__init__.py
touch backend/app/services/__init__.py
touch backend/tests/__init__.py

# ============================================================
# Step 4: Create environment templates
# ============================================================
log_info "Creating environment templates..."

# Backend .env.example
cat > backend/.env.example << 'EOF'
# ============================================================
# TalkStudio Backend Environment Variables
# ============================================================

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=false
ENVIRONMENT=development

# CORS Settings (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# AI API Keys (choose one or both)
OPENAI_API_KEY=sk-your-openai-key-here
UPSTAGE_API_KEY=up_your-upstage-key-here

# Rate Limiting
RATE_LIMIT_PER_MINUTE=30
RATE_LIMIT_PER_DAY=500

# Redis (optional, for production rate limiting)
REDIS_URL=redis://localhost:6379/0

# Logging
LOG_LEVEL=INFO
EOF

# Frontend .env.example
cat > frontend/.env.example << 'EOF'
# ============================================================
# TalkStudio Frontend Environment Variables
# ============================================================

# Backend API URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Feature Flags
VITE_ENABLE_AI_GENERATION=true
VITE_MAX_MESSAGES_PER_CONVERSATION=100

# Analytics (optional)
VITE_GA_TRACKING_ID=
EOF

# Create actual .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    log_info "Created backend/.env from template"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    log_info "Created frontend/.env from template"
fi

# ============================================================
# Step 5: Create Python requirements
# ============================================================
log_info "Creating Python requirements..."

cat > backend/requirements.txt << 'EOF'
# Core Framework
fastapi==0.115.6
uvicorn[standard]==0.34.0
python-multipart==0.0.20

# Validation & Settings
pydantic==2.10.4
pydantic-settings==2.7.1
email-validator==2.2.0

# Rate Limiting
slowapi==0.1.9

# AI Services
openai==1.58.1
httpx==0.28.1

# Excel Processing
openpyxl==3.1.5

# Database (optional, for persistent rate limiting)
redis==5.2.1

# Testing
pytest==8.3.4
pytest-asyncio==0.25.0
httpx==0.28.1

# Code Quality
ruff==0.8.4
EOF

cat > backend/requirements-dev.txt << 'EOF'
-r requirements.txt
pytest-cov==6.0.0
black==24.10.0
mypy==1.13.0
EOF

# ============================================================
# Step 6: Create pyproject.toml
# ============================================================
cat > backend/pyproject.toml << 'EOF'
[project]
name = "talkstudio-backend"
version = "2.0.0"
description = "TalkStudio API - Viral Chat Generator Backend"
requires-python = ">=3.11"

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]
ignore = ["E501"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]

[tool.mypy]
python_version = "3.11"
strict = true
EOF

# ============================================================
# Step 7: Create Docker files
# ============================================================
log_info "Creating Docker configuration..."

cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=development
      - CORS_ORIGINS=http://localhost:5173
    env_file:
      - ./backend/.env
    volumes:
      - ./backend/app:/app/app:ro
    depends_on:
      - redis

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:8000/api/v1
    volumes:
      - ./frontend/src:/app/src:ro

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
EOF

# ============================================================
# Step 8: Create .gitignore
# ============================================================
log_info "Updating .gitignore..."

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.py[cod]
.venv/
venv/
env/

# Build outputs
dist/
build/
*.egg-info/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# Testing
coverage/
.coverage
htmlcov/
.pytest_cache/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Backup
.backup_*/

# Temp
*.tmp
*.temp
EOF

# ============================================================
# Step 9: Print summary
# ============================================================
echo ""
echo "================================================"
log_info "Project structure setup complete!"
echo "================================================"
echo ""
echo "New structure:"
echo "  backend/           - FastAPI Python backend"
echo "    app/             - Application code"
echo "    tests/           - Test files"
echo "    requirements.txt - Python dependencies"
echo ""
echo "  frontend/          - React Vite frontend"
echo "    src/             - Source code"
echo ""
echo "Next steps:"
echo "  1. cd backend && python -m venv .venv && source .venv/bin/activate"
echo "  2. pip install -r requirements.txt"
echo "  3. Update backend/.env with your API keys"
echo "  4. cd frontend && npm install"
echo "  5. Run: docker-compose up (or run services individually)"
echo ""
log_info "Backup of old structure saved at: $BACKUP_DIR"
