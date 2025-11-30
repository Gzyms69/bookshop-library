#!/bin/bash
if [ -f "backend/venv/bin/python" ]; then
    backend/venv/bin/python "$@"
else
    echo "❌ Virtual environment not found. Run ./scripts/start-dev.sh first."
    exit 1
fi
