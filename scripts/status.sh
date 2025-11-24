#!/bin/bash

# BookShop Library Development Environment Status Script
echo "📊 Development Environment Status"
echo "================================="

# Function to check if a port is open
port_is_open() {
    (echo >/dev/tcp/localhost/$1) >/dev/null 2>&1
}

# Function to check if process is running by PID file
check_pid_file() {
    local service=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "   ✅ Running (PID: $pid)"
            return 0
        else
            echo "   ❌ PID file exists but process not running"
            rm -f "$pid_file"
            return 1
        fi
    fi
    return 1
}

# Function to check virtual environment
check_virtual_env() {
    echo "🐍 Virtual Environment:"
    if [ -n "$VIRTUAL_ENV" ]; then
        echo "   ✅ Active: $(basename "$VIRTUAL_ENV")"
    elif [ -f "backend/venv/bin/activate" ]; then
        echo "   ✅ Available (run: source backend/venv/bin/activate)"
    else
        echo "   ❌ Not found"
    fi
}

# Function to get safe log tail (handles null bytes)
get_log_tail() {
    local log_file=$1
    if [ -f "$log_file" ] && [ -s "$log_file" ]; then
        tail -1 "$log_file" | tr -d '\000' | cut -c1-50
    fi
}

# Check Docker container
echo "🐳 SQL Server Container:"
if docker ps | grep -q bookshop-sql; then
    echo "   ✅ Running"
    
    # Test SQL Server connection
    if docker exec bookshop-sql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P MyStrongPassword123! -Q "SELECT 1" &> /dev/null; then
        echo "   🔌 Database: Accepting connections"
    else
        echo "   ⚠️  Database: Connection issues"
    fi
else
    echo "   ❌ Stopped"
fi

# Check backend
echo "🌐 Backend API:"
backend_running=0
if check_pid_file "backend" "backend.pid"; then
    backend_running=1
elif port_is_open 8000; then
    echo "   ✅ Running (port 8000 active)"
    backend_running=1
else
    echo "   ❌ Stopped"
fi

# Check frontend  
echo "⚛️  Frontend App:"
frontend_running=0
if check_pid_file "frontend" "frontend.pid"; then
    frontend_running=1
elif port_is_open 3000; then
    echo "   ✅ Running (port 3000 active)"
    frontend_running=1
else
    echo "   ❌ Stopped"
fi

# Check virtual environment
check_virtual_env

echo ""
echo "🔗 Quick Links:"
if [ $backend_running -eq 1 ]; then
    echo "   📊 Backend API:    http://localhost:8000"
    echo "   📚 API Docs:       http://localhost:8000/docs"
    echo "   📝 Items Endpoint: http://localhost:8000/items"
    echo "   👥 Users Endpoint: http://localhost:8000/users"
    echo "   📈 Analytics:      http://localhost:8000/analytics"
    echo "   ❤️  Health Check:   http://localhost:8000/health"
fi

# Always show frontend link if port 3000 is open
if port_is_open 3000; then
    echo "   🖥️  Frontend App:   http://localhost:3000"
    frontend_running=1
fi

if docker ps | grep -q bookshop-sql; then
    echo "   🗄️  SQL Server:     localhost:1433"
fi

echo ""
echo "🔧 Quick Commands:"
echo "   ./scripts/start-dev.sh    - Start all services"
echo "   ./scripts/stop-dev.sh     - Stop all services" 
echo "   ./scripts/status.sh       - Show current status"
echo "   ./run-admin-test.sh       - Test authentication"
echo "   ./run-item-listing.sh     - List all items"
echo "   ./run-item-creation.sh    - Create new item"

# Show recent logs if available
echo ""
echo "📋 Recent Logs:"
backend_log=$(get_log_tail "backend.log")
frontend_log=$(get_log_tail "frontend.log")

if [ -n "$backend_log" ]; then
    echo "   Backend:  $backend_log"
fi
if [ -n "$frontend_log" ]; then
    echo "   Frontend: $frontend_log"
fi

# Show process info for debugging
echo ""
echo "🔍 Process Info:"
if port_is_open 3000; then
    process_name=$(lsof -ti:3000 2>/dev/null | xargs ps -o comm= -p 2>/dev/null | head -1 || echo "unknown process")
    echo "   Port 3000: Occupied by $process_name"
else
    echo "   Port 3000: No process detected"
fi

if port_is_open 8000; then
    process_name=$(lsof -ti:8000 2>/dev/null | xargs ps -o comm= -p 2>/dev/null | head -1 || echo "unknown process")
    echo "   Port 8000: Occupied by $process_name"
else
    echo "   Port 8000: No process detected"
fi

echo ""
echo "💡 Tip: Click the links above or copy them to your browser!"