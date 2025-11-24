#!/bin/bash

# BookShop Library Development Environment Stop Script
echo "🛑 Stopping BookShop Library Development Environment..."
echo "======================================================"

# Function to kill Windows Node.js processes
kill_windows_node() {
    echo "🖥️  Stopping Windows Node.js processes..."
    # Kill React/Node processes in Windows
    cmd.exe /c "taskkill /f /im node.exe 2>nul" 2>/dev/null
    cmd.exe /c "taskkill /f /im npm.cmd 2>nul" 2>/dev/null
    cmd.exe /c "taskkill /f /im nodejs.exe 2>nul" 2>/dev/null
}

# Function to kill process by PID file
kill_by_pid_file() {
    local service_name=$1
    local pid_file=$2
    local port=$3
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "🛑 Stopping $service_name (PID: $pid)..."
            kill "$pid" 2>/dev/null
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null
            fi
            echo "✅ Stopped $service_name"
        else
            echo "⚠️  $service_name PID file exists but process not running"
        fi
        rm -f "$pid_file"
    else
        echo "⚠️  No $service_name PID file found"
    fi
}

# Kill Windows Node.js processes first
kill_windows_node

# Stop backend
kill_by_pid_file "backend server" "backend.pid" 8000

# Stop frontend  
kill_by_pid_file "frontend server" "frontend.pid" 3000

# Kill any remaining Node processes in WSL
echo "🐍 Stopping any remaining Node processes in WSL..."
pkill -f "react-scripts" 2>/dev/null
pkill -f "node.*start" 2>/dev/null

# Ask about SQL Server
echo ""
read -p "🐳 Stop SQL Server container too? (y/N): " stop_sql
if [[ $stop_sql == "y" || $stop_sql == "Y" ]]; then
    echo "🛑 Stopping SQL Server container..."
    docker stop bookshop-sql
    echo "✅ SQL Server container stopped"
else
    echo "💡 SQL Server container left running"
    echo "   To stop later: docker stop bookshop-sql"
fi

# Clean up any remaining artifacts
echo ""
echo "🧹 Cleaning up..."
rm -f backend.pid frontend.pid .requirements_installed 2>/dev/null

echo ""
echo "🎯 All development services stopped!"
echo "===================================="
echo "To start again: ./scripts/start-dev.sh"