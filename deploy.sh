#!/bin/bash

set -e

PROJECT_ROOT="/home/azureuser/miners"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
PIDS_FILE="$PROJECT_ROOT/.deployment_pids"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

check_mongodb() {
    log_info "Checking MongoDB status..."
    if pgrep -x mongod > /dev/null; then
        log_info "MongoDB is running"
        return 0
    else
        log_error "MongoDB is not running. Starting MongoDB..."
        sudo systemctl start mongod
        sleep 2
        if pgrep -x mongod > /dev/null; then
            log_info "MongoDB started successfully"
            return 0
        else
            log_error "Failed to start MongoDB"
            return 1
        fi
    fi
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 is not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if [ ! -d "$BACKEND_DIR/venv" ]; then
        log_warn "Python virtual environment not found. Creating..."
        cd "$BACKEND_DIR"
        python3 -m venv venv
    fi
    
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        log_warn "Frontend node_modules not found. Installing..."
        cd "$FRONTEND_DIR"
        yarn install
    fi
    
    log_info "Dependencies check complete"
}

start_backend_api() {
    log_info "Starting Backend API on port 8001..."
    cd "$BACKEND_DIR"
    source venv/bin/activate
    nohup uvicorn server:app --reload --host 0.0.0.0 --port 8001 > "$PROJECT_ROOT/backend_api.log" 2>&1 &
    BACKEND_PID=$!
    echo "BACKEND_API=$BACKEND_PID" >> "$PIDS_FILE"
    log_info "Backend API started (PID: $BACKEND_PID)"
    sleep 3
}

start_admin_server() {
    log_info "Starting Admin Server on port 8000..."
    cd "$BACKEND_DIR"
    source venv/bin/activate
    nohup python admin_server.py > "$PROJECT_ROOT/admin_server.log" 2>&1 &
    ADMIN_PID=$!
    echo "ADMIN_SERVER=$ADMIN_PID" >> "$PIDS_FILE"
    log_info "Admin Server started (PID: $ADMIN_PID)"
    sleep 3
}

start_frontend() {
    log_info "Starting Frontend on port 3000..."
    cd "$FRONTEND_DIR"
    nohup yarn start > "$PROJECT_ROOT/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo "FRONTEND=$FRONTEND_PID" >> "$PIDS_FILE"
    log_info "Frontend started (PID: $FRONTEND_PID)"
    sleep 5
}

verify_services() {
    log_info "Verifying services..."
    
    if curl -s http://localhost:8001/health > /dev/null 2>&1; then
        log_info "✓ Backend API is accessible at http://172.206.32.165:8001"
    else
        log_warn "✗ Backend API health check failed"
    fi
    
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        log_info "✓ Admin Server is accessible at http://172.206.32.165:8000"
    else
        log_warn "✗ Admin Server health check failed"
    fi
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_info "✓ Frontend is accessible at http://172.206.32.165:3000"
    else
        log_warn "✗ Frontend health check failed"
    fi
}

stop_services() {
    log_info "Stopping all services..."
    
    if [ -f "$PIDS_FILE" ]; then
        while IFS='=' read -r service pid; do
            if [ ! -z "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                log_info "Stopping $service (PID: $pid)"
                kill "$pid"
            fi
        done < "$PIDS_FILE"
        rm "$PIDS_FILE"
    fi
    
    pkill -f "uvicorn server:app"
    pkill -f "admin_server.py"
    pkill -f "react-scripts start"
    
    log_info "All services stopped"
}

status_services() {
    log_info "Service Status:"
    echo ""
    
    if pgrep -f "uvicorn server:app" > /dev/null; then
        log_info "✓ Backend API: Running (PID: $(pgrep -f 'uvicorn server:app'))"
    else
        log_error "✗ Backend API: Not running"
    fi
    
    if pgrep -f "admin_server.py" > /dev/null; then
        log_info "✓ Admin Server: Running (PID: $(pgrep -f 'admin_server.py'))"
    else
        log_error "✗ Admin Server: Not running"
    fi
    
    if pgrep -f "react-scripts start" > /dev/null; then
        log_info "✓ Frontend: Running (PID: $(pgrep -f 'react-scripts start'))"
    else
        log_error "✗ Frontend: Not running"
    fi
    
    if pgrep -x mongod > /dev/null; then
        log_info "✓ MongoDB: Running (PID: $(pgrep -x mongod))"
    else
        log_error "✗ MongoDB: Not running"
    fi
    
    echo ""
    log_info "Service URLs:"
    echo "  Frontend: http://172.206.32.165:3000"
    echo "  Backend API: http://172.206.32.165:8001"
    echo "  Admin Dashboard: http://172.206.32.165:8000"
}

case "$1" in
    start)
        log_info "Starting deployment..."
        rm -f "$PIDS_FILE"
        check_dependencies
        check_mongodb
        start_backend_api
        start_admin_server
        start_frontend
        echo ""
        verify_services
        echo ""
        log_info "Deployment complete!"
        status_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        log_info "Restarting..."
        "$0" start
        ;;
    status)
        status_services
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
