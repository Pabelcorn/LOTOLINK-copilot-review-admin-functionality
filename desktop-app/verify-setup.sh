#!/bin/bash

# LotoLink Desktop App - Verification Script
# This script verifies that the desktop app is properly configured

set -e

echo "🔍 LotoLink Desktop App Verification"
echo "====================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track status
ALL_CHECKS_PASSED=true

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is missing${NC}"
        ALL_CHECKS_PASSED=false
        return 1
    fi
}

# Function to check if a directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1 directory exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 directory is missing${NC}"
        ALL_CHECKS_PASSED=false
        return 1
    fi
}

echo "📁 Checking required files..."
echo ""

# Check main files
check_file "package.json"
check_file "main.js"
check_file "preload.js"
check_file "index.html"
check_file "lotolink-logo.png"
check_file "0.png"

echo ""
echo "📋 Checking configuration files..."
echo ""

check_file "build.sh"
check_file "build-all.sh"
check_file ".gitignore"

echo ""
echo "📄 Checking documentation..."
echo ""

check_file "README.md"
check_file "INSTALL.md"
check_file "DISTRIBUTION.md"

echo ""
echo "🔍 Checking HTML file content..."
echo ""

# Check if index.html contains desktop-specific elements
if grep -q "title-bar" index.html; then
    echo -e "${GREEN}✅ index.html contains desktop title bar${NC}"
else
    echo -e "${RED}❌ index.html missing desktop title bar${NC}"
    ALL_CHECKS_PASSED=false
fi

if grep -q "window-btn" index.html; then
    echo -e "${GREEN}✅ index.html contains window control buttons${NC}"
else
    echo -e "${RED}❌ index.html missing window control buttons${NC}"
    ALL_CHECKS_PASSED=false
fi

if grep -q "desktop-window" index.html; then
    echo -e "${GREEN}✅ index.html contains desktop window container${NC}"
else
    echo -e "${RED}❌ index.html missing desktop window container${NC}"
    ALL_CHECKS_PASSED=false
fi

if grep -q "electronAPI" index.html; then
    echo -e "${GREEN}✅ index.html has Electron API integration${NC}"
else
    echo -e "${RED}❌ index.html missing Electron API integration${NC}"
    ALL_CHECKS_PASSED=false
fi

echo ""
echo "🔧 Checking Electron configuration..."
echo ""

# Check if preload.js exposes the necessary APIs
if grep -q "electronAPI" preload.js; then
    echo -e "${GREEN}✅ preload.js exposes electronAPI${NC}"
else
    echo -e "${RED}❌ preload.js missing electronAPI${NC}"
    ALL_CHECKS_PASSED=false
fi

# Check if main.js has window controls handlers
if grep -q "window-minimize" main.js; then
    echo -e "${GREEN}✅ main.js has window control handlers${NC}"
else
    echo -e "${RED}❌ main.js missing window control handlers${NC}"
    ALL_CHECKS_PASSED=false
fi

echo ""
echo "📦 Checking npm dependencies..."
echo ""

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules directory exists${NC}"
    
    # Check for key dependencies
    if [ -d "node_modules/electron" ]; then
        echo -e "${GREEN}✅ electron is installed${NC}"
    else
        echo -e "${YELLOW}⚠️  electron is not installed. Run 'npm install'${NC}"
        ALL_CHECKS_PASSED=false
    fi
    
    if [ -d "node_modules/electron-builder" ]; then
        echo -e "${GREEN}✅ electron-builder is installed${NC}"
    else
        echo -e "${YELLOW}⚠️  electron-builder is not installed. Run 'npm install'${NC}"
        ALL_CHECKS_PASSED=false
    fi
else
    echo -e "${YELLOW}⚠️  node_modules directory not found. Run 'npm install'${NC}"
    ALL_CHECKS_PASSED=false
fi

echo ""
echo "🔨 Checking build output..."
echo ""

if [ -d "dist" ]; then
    echo -e "${GREEN}✅ dist directory exists${NC}"
    
    # Find installer files and store in variable to avoid duplicate searches
    INSTALLER_FILES=$(find dist -type f \( -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" \) 2>/dev/null)
    INSTALLER_COUNT=$(echo "$INSTALLER_FILES" | grep -c .)
    
    if [ $INSTALLER_COUNT -gt 0 ]; then
        echo -e "${GREEN}✅ Found $INSTALLER_COUNT installer file(s)${NC}"
        echo ""
        echo "Installers found:"
        echo "$INSTALLER_FILES" | while read file; do
            if [ -n "$file" ]; then
                echo "  - $(basename "$file")"
            fi
        done
    else
        echo -e "${YELLOW}⚠️  No installer files found. Run 'npm run build' to create installers${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  dist directory not found. Run 'npm run build' to create it${NC}"
fi

echo ""
echo "========================================="
echo ""

if [ "$ALL_CHECKS_PASSED" = true ]; then
    echo -e "${GREEN}✅ All checks passed! Desktop app is properly configured.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npm install' (if not done already)"
    echo "  2. Run 'npm run build' to create installers"
    echo "  3. Check the 'dist' folder for installer files"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please review the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  - Run 'npm install' to install dependencies"
    echo "  - Ensure all required files are present"
    echo "  - Check that index.html contains desktop-specific elements"
    echo ""
    exit 1
fi
