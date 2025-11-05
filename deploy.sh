#!/bin/bash

# Project Tracker Frontend Deployment Script
# Usage: ./deploy.sh [dev|build|install]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_MIN_VERSION=18

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_node_version() {
    print_info "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        print_info "Please install Node.js >= ${NODE_MIN_VERSION}"
        print_info "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt "$NODE_MIN_VERSION" ]; then
        print_error "Node.js version ${NODE_VERSION} is less than required ${NODE_MIN_VERSION}"
        print_info "Please upgrade Node.js"
        exit 1
    fi
    
    print_info "Node.js version: $(node --version) ✓"
}

check_npm() {
    print_info "Checking npm..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        exit 1
    fi
    
    print_info "npm version: $(npm --version) ✓"
}

install_dependencies() {
    print_info "Installing dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found! Are you in the correct directory?"
        exit 1
    fi
    
    npm install
    
    # Verify critical packages
    print_info "Verifying critical packages..."
    
    if [ ! -d "node_modules/vite" ]; then
        print_error "vite not installed!"
        exit 1
    fi
    
    if [ ! -d "node_modules/@types/node" ]; then
        print_warning "@types/node not found. Installing..."
        npm install --save-dev @types/node
    fi
    
    print_info "Dependencies installed successfully ✓"
}

build_project() {
    print_info "Building project for production..."
    
    # Check if .env exists, warn if not
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Using default proxy configuration from vite.config.ts"
    fi
    
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Build failed! dist folder not created."
        exit 1
    fi
    
    print_info "Build completed successfully ✓"
    print_info "Build output: $(du -sh dist | cut -f1)"
}

start_dev_server() {
    print_info "Starting development server..."
    
    # Check if port 6511 is already in use
    if lsof -Pi :6511 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 6511 is already in use!"
        print_info "Checking if it's the same application..."
        # Kill existing process on port 6511 (optional, uncomment if needed)
        # lsof -ti:6511 | xargs kill -9
        # print_info "Killed existing process on port 6511"
    fi
    
    npm run dev
}

# Main execution
cd "$FRONTEND_DIR"

ACTION=${1:-install}

case $ACTION in
    install)
        print_info "=== Frontend Dependencies Installation ==="
        check_node_version
        check_npm
        install_dependencies
        print_info "Installation completed successfully!"
        ;;
    
    build)
        print_info "=== Frontend Production Build ==="
        check_node_version
        check_npm
        
        if [ ! -d "node_modules" ]; then
            print_warning "node_modules not found. Installing dependencies first..."
            install_dependencies
        fi
        
        build_project
        print_info "Build completed! Files are in ./dist/"
        print_info "Deploy the dist/ folder to your web server."
        ;;
    
    dev)
        print_info "=== Starting Frontend Development Server ==="
        check_node_version
        check_npm
        
        if [ ! -d "node_modules" ]; then
            print_warning "node_modules not found. Installing dependencies first..."
            install_dependencies
        fi
        
        start_dev_server
        ;;
    
    *)
        print_error "Invalid action: $ACTION"
        echo ""
        echo "Usage: ./deploy.sh [install|build|dev]"
        echo ""
        echo "Actions:"
        echo "  install  - Install all dependencies (default)"
        echo "  build    - Build for production"
        echo "  dev      - Start development server"
        exit 1
        ;;
esac

