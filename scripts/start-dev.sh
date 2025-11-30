#!/bin/bash

# BookShop Library Development Environment Startup Script
echo "🚀 Starting BookShop Library Development Environment..."
echo "======================================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is open
port_is_open() {
    (echo >/dev/tcp/localhost/$1) >/dev/null 2>&1
}

# Check if Docker is running
echo "🔍 Checking Docker..."
if ! command_exists docker; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker Desktop is not running. Please start Docker Desktop first."
    exit 1
fi
echo "✅ Docker is running"

# Start SQL Server container
echo "🐳 Starting SQL Server container..."
docker start bookshop-sql >/dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "📦 SQL Server container not found, creating new one..."
    docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=MyStrongPassword123!" -p 1433:1433 --name bookshop-sql -d mcr.microsoft.com/mssql/server:2022-latest >/dev/null 2>&1
    echo "⏳ Waiting for SQL Server to start (this can take 20-30 seconds)..."
    sleep 30
fi

# Wait for SQL Server to be ready using port check
echo "⏳ Waiting for SQL Server to be ready..."
MAX_ATTEMPTS=12
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if port_is_open 1433; then
        echo "✅ SQL Server is ready and accepting connections!"
        break
    else
        echo "   Still waiting for SQL Server... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
        sleep 5
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    echo "❌ SQL Server failed to start within 60 seconds."
    echo "   Check Docker logs: docker logs bookshop-sql"
    exit 1
fi

# Setup Python backend
echo "🐍 Setting up Python backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install requirements if needed
if [ ! -f ".requirements_installed" ]; then
    echo "📥 Installing Python dependencies..."
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        touch .requirements_installed
    else
        echo "❌ Failed to install Python dependencies"
        exit 1
    fi
fi

# Test database connection before starting backend - with retries
echo "🔌 Testing database connection..."
MAX_DB_ATTEMPTS=10
DB_ATTEMPT=1

while [ $DB_ATTEMPT -le $MAX_DB_ATTEMPTS ]; do
    python -c "
import pymssql
try:
    conn = pymssql.connect(
        server='localhost',
        port=1433,
        user='sa',
        password='MyStrongPassword123!',
        database='master'
    )
    print('✅ Database connection test passed!')
    conn.close()
    exit(0)
except Exception as e:
    print(f'   Attempt $DB_ATTEMPT/$MAX_DB_ATTEMPTS: Database not ready yet...')
    exit(1)
" && break || sleep 5
    DB_ATTEMPT=$((DB_ATTEMPT + 1))
done

if [ $DB_ATTEMPT -gt $MAX_DB_ATTEMPTS ]; then
    echo "⚠️  Database connection test failed, but continuing anyway..."
    echo "   The backend will retry connection automatically"
fi

# Start backend server in background
echo "🌐 Starting FastAPI backend server..."
uvicorn app.main:app --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid
echo "✅ Backend server started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "⏳ Waiting for backend API to be ready..."
sleep 5

# Setup frontend
echo "⚛️  Setting up React frontend..."
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Node.js dependencies"
        exit 1
    fi
fi

# Kill any Windows Node processes first to avoid conflicts
echo "🛑 Ensuring no Windows Node processes are running..."
cmd.exe /c "taskkill /f /im node.exe 2>nul" 2>/dev/null

# Start frontend server in background using WSL Node.js
echo "🌐 Starting React frontend server in WSL..."
./node_modules/.bin/react-scripts start > ../frontend.log 2>&1 &
# Wait for React to start and capture the correct PID
sleep 5
REACT_PID=$(ps aux | grep "react-scripts" | grep -v grep | awk '{print $2}' | head -1)
if [ -n "$REACT_PID" ]; then
    echo $REACT_PID > ../frontend.pid
    FRONTEND_PID=$REACT_PID
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
else
    # Fallback to the background process PID
    echo $! > ../frontend.pid
    FRONTEND_PID=$!
    echo "✅ Frontend server started (PID: $FRONTEND_PID - fallback)"
fi
cd ..

echo ""
echo "🔧 Virtual Environment Activation (Optional)"
echo "============================================"
echo "Do you want to activate the Python virtual environment in this shell?"
echo "This will allow you to run 'python' and 'pip' commands directly."
echo "If you choose no, you can activate it later with:"
echo "  cd backend && source venv/bin/activate"
echo ""
read -p "Activate virtual environment? (y/N): " activate_venv

if [[ $activate_venv == "y" || $activate_venv == "Y" ]]; then
    echo "🐍 Activating virtual environment..."
    source backend/venv/bin/activate
    
    # Verify activation worked
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        echo "✅ Virtual environment activated!"
        echo "   You can now run: python backend/scripts/test_auth_and_db.py"
        
        # Offer to run the test script directly
        echo ""
        read -p "Run authentication test script now? (y/N): " run_test
        if [[ $run_test == "y" || $run_test == "Y" ]]; then
            echo "🧪 Running authentication test..."
            cd backend/scripts
            python test_auth_and_db.py
            cd ../..
        fi
    else
        echo "❌ Failed to activate virtual environment"
    fi
else
    echo "💡 To activate later: cd backend && source venv/bin/activate"
fi

echo ""
echo "🎯 Quick Commands:"
echo "   ./dev.sh stop            - Stop all services"
echo "   ./dev.sh status          - Check service status"
echo "   ./dev.sh test-auth       - Test authentication"
echo "   ./dev.sh items           - List all items"
echo "   ./dev.sh create          - Create new item"
echo "   ./dev.sh admin           - Run admin panel"

echo ""
echo "🎉 Development environment started successfully!"
echo "================================================="
echo "📊 Backend API: http://localhost:8000"
echo "📚 Backend Docs: http://localhost:8000/docs" 
echo "🖥️  Frontend App: http://localhost:3000"
echo "📝 Backend logs: tail -f backend.log"
echo "📝 Frontend logs: tail -f frontend.log"
echo ""
echo "To stop everything, run: ./scripts/stop-dev.sh"
echo "To check status, run: ./scripts/status.sh"
echo "================================================="