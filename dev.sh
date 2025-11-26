#!/bin/bash
# dev.sh - Convenience script for common development tasks

case "$1" in
    start)
        ./scripts/start-dev.sh
        ;;
    stop)
        ./scripts/stop-dev.sh
        ;;
    status)
        ./scripts/status.sh
        ;;
    items)
        ./run-item-listing.sh
        ;;
    create)
        ./run-item-creation.sh
        ;;
    admin)
        ./run-admin-panel.sh
        ;;
    test-auth)
        ./run-admin-test.sh
        ;;
    restart)
        echo "Restarting BookShop services..."
        ./scripts/stop-dev.sh
        echo "Services stopped. Starting again..."
        ./scripts/start-dev.sh
        ;;
    venv)
        ./scripts/activate-venv.sh
        ;;
    fix-ids)
        ./run-python.sh backend/scripts/admin/fix_identity.py
        ;;
    *)
        echo "Usage: $0 {start|stop|status|restart|items|create|admin|test-auth|venv|fix-ids}"
        echo "  start     - Start all services"
        echo "  stop      - Stop all services" 
        echo "  restart   - Stop then start all services"
        echo "  status    - Check service status"
        echo "  items     - List all items"
        echo "  create    - Create a new item"
        echo "  admin     - Open admin panel (interactive)"
        echo "  test-auth - Test authentication"
        echo "  venv      - Activate virtual environment"
        echo "  fix-ids   - Fix item ID sequencing"
        exit 1
        ;;
esac