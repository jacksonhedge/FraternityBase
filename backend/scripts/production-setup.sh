#!/bin/bash

# Production Setup Script for Fraternity Base
# This script prepares the system for production deployment

set -e

echo "🚀 Setting up Fraternity Base for Production..."

PROJECT_ROOT="/Users/jacksonfitzgerald/CollegeOrgNetwork"
BACKEND_PATH="$PROJECT_ROOT/backend"
FRONTEND_PATH="$PROJECT_ROOT/frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."

    command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed. Aborting."; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed. Aborting."; exit 1; }
    command -v sqlite3 >/dev/null 2>&1 || { log_error "sqlite3 is required but not installed. Aborting."; exit 1; }

    log_success "All dependencies are installed"
}

# Install PM2 globally if not already installed
install_pm2() {
    if ! command -v pm2 >/dev/null 2>&1; then
        log_info "Installing PM2 process manager..."
        npm install -g pm2
        log_success "PM2 installed"
    else
        log_info "PM2 already installed"
    fi
}

# Setup backend for production
setup_backend() {
    log_info "Setting up backend..."

    cd "$BACKEND_PATH"

    # Install dependencies
    log_info "Installing backend dependencies..."
    npm install

    # Build TypeScript
    log_info "Building backend..."
    npm run build

    # Verify build
    if [ ! -f "dist/server-enhanced.js" ]; then
        log_error "Backend build failed - server-enhanced.js not found"
        exit 1
    fi

    log_success "Backend setup complete"
}

# Setup frontend for production
setup_frontend() {
    log_info "Setting up frontend..."

    cd "$FRONTEND_PATH"

    # Install dependencies
    log_info "Installing frontend dependencies..."
    npm install

    # Build for production
    log_info "Building frontend for production..."
    npm run build

    # Verify build
    if [ ! -d "dist" ]; then
        log_error "Frontend build failed - dist directory not found"
        exit 1
    fi

    log_success "Frontend setup complete"
}

# Create production directories
create_directories() {
    log_info "Creating production directories..."

    mkdir -p "$BACKEND_PATH/logs"
    mkdir -p "$PROJECT_ROOT/backups"

    log_success "Directories created"
}

# Set file permissions
set_permissions() {
    log_info "Setting file permissions..."

    chmod +x "$BACKEND_PATH/scripts/"*.sh
    chmod +x "$BACKEND_PATH/scripts/"*.js

    log_success "Permissions set"
}

# Initialize database with proper structure
init_database() {
    log_info "Initializing production database..."

    cd "$BACKEND_PATH"

    # Start the server briefly to initialize database
    node -e "
        require('dotenv').config();
        const { initializeDatabase } = require('./dist/database.js');
        initializeDatabase();
        console.log('Database initialized successfully');
    "

    log_success "Database initialized"
}

# Create systemd service (optional, for Linux)
create_systemd_service() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log_info "Creating systemd service..."

        cat > /tmp/fraternity-base.service << EOF
[Unit]
Description=Fraternity Base Backend
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=$BACKEND_PATH
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server-enhanced.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=fraternity-base

[Install]
WantedBy=multi-user.target
EOF

        log_info "Systemd service file created at /tmp/fraternity-base.service"
        log_warning "Please manually copy to /etc/systemd/system/ with sudo privileges"
    fi
}

# Setup monitoring and backups
setup_monitoring() {
    log_info "Setting up monitoring and backups..."

    # Run initial backup
    "$BACKEND_PATH/scripts/backup-database.sh"

    # Run initial health check
    node "$BACKEND_PATH/scripts/health-check.js"

    log_success "Monitoring setup complete"
}

# Main setup function
main() {
    echo "=========================================="
    echo "🧢 Fraternity Base Production Setup"
    echo "=========================================="
    echo

    check_dependencies
    install_pm2
    create_directories
    setup_backend
    setup_frontend
    set_permissions
    init_database
    create_systemd_service
    setup_monitoring

    echo
    echo "=========================================="
    log_success "Production setup completed successfully!"
    echo "=========================================="
    echo
    echo "Next steps:"
    echo "1. Review .env.production configuration"
    echo "2. Start the application: npm run start:prod"
    echo "3. Setup cron jobs: ./scripts/setup-cron.sh"
    echo "4. Test the application thoroughly"
    echo "5. Configure your domain and SSL"
    echo
    echo "Available commands:"
    echo "- Start production: cd backend && pm2 start ecosystem.config.js --env production"
    echo "- Stop production: pm2 stop fraternity-base-backend"
    echo "- View logs: pm2 logs fraternity-base-backend"
    echo "- Monitor: pm2 monit"
    echo "- Manual backup: ./scripts/backup-database.sh"
    echo "- Health check: node ./scripts/health-check.js"
    echo
}

# Run main function
main "$@"