#!/bin/bash

echo "🐍 Activating Python Virtual Environment..."
echo "==========================================="

if [ -f "backend/venv/bin/activate" ]; then
    source backend/venv/bin/activate
    echo "✅ Virtual environment activated!"
    echo "   Python path: $(which python)"
    echo "   Pip path: $(which pip)"
    
    echo ""
    echo "🎯 You can now run Python scripts like:"
    echo "   python backend/scripts/test_auth_and_db.py"
    echo "   python backend/scripts/admin_panel.py"
else
    echo "❌ Virtual environment not found. Run ./scripts/start-dev.sh first."
    exit 1
fi