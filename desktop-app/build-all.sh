#!/bin/bash

# LotoLink Desktop App - Build All Platforms
# This script builds installers for Windows, macOS, and Linux
# Note: Building for macOS requires a Mac. Building for Windows from Mac/Linux requires Wine.

set -e

echo "🚀 Building LotoLink Desktop Application for All Platforms"
echo "============================================================"
echo ""

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the desktop-app directory.${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# Detect current platform
PLATFORM=$(uname -s)
echo -e "${BLUE}🖥️  Current platform: $PLATFORM${NC}"
echo ""

# Parse command line arguments
BUILD_WINDOWS=true
BUILD_MACOS=true
BUILD_LINUX=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --windows-only)
            BUILD_MACOS=false
            BUILD_LINUX=false
            shift
            ;;
        --macos-only)
            BUILD_WINDOWS=false
            BUILD_LINUX=false
            shift
            ;;
        --linux-only)
            BUILD_WINDOWS=false
            BUILD_MACOS=false
            shift
            ;;
        --no-windows)
            BUILD_WINDOWS=false
            shift
            ;;
        --no-macos)
            BUILD_MACOS=false
            shift
            ;;
        --no-linux)
            BUILD_LINUX=false
            shift
            ;;
        -h|--help)
            echo "Usage: ./build-all.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --windows-only    Build only Windows installer"
            echo "  --macos-only      Build only macOS installers"
            echo "  --linux-only      Build only Linux installers"
            echo "  --no-windows      Skip Windows build"
            echo "  --no-macos        Skip macOS build"
            echo "  --no-linux        Skip Linux build"
            echo "  -h, --help        Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Clean previous builds
if [ -d "dist" ]; then
    echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
    rm -rf dist
    echo -e "${GREEN}✅ Cleaned${NC}"
    echo ""
fi

BUILD_ERRORS=0

# Build for Windows
if [ "$BUILD_WINDOWS" = true ]; then
    echo -e "${BLUE}🏗️  Building Windows installer...${NC}"
    if [ "$PLATFORM" = "Darwin" ]; then
        echo -e "${YELLOW}⚠️  Building Windows installer on macOS requires Wine${NC}"
    fi
    
    if npm run build:win; then
        echo -e "${GREEN}✅ Windows build complete${NC}"
    else
        echo -e "${RED}❌ Windows build failed${NC}"
        BUILD_ERRORS=$((BUILD_ERRORS + 1))
    fi
    echo ""
fi

# Build for macOS
if [ "$BUILD_MACOS" = true ]; then
    echo -e "${BLUE}🏗️  Building macOS installers...${NC}"
    if [ "$PLATFORM" != "Darwin" ]; then
        echo -e "${YELLOW}⚠️  Building macOS installers requires a Mac${NC}"
        echo -e "${YELLOW}⚠️  Skipping macOS build${NC}"
    else
        if npm run build:mac; then
            echo -e "${GREEN}✅ macOS build complete${NC}"
        else
            echo -e "${RED}❌ macOS build failed${NC}"
            BUILD_ERRORS=$((BUILD_ERRORS + 1))
        fi
    fi
    echo ""
fi

# Build for Linux
if [ "$BUILD_LINUX" = true ]; then
    echo -e "${BLUE}🏗️  Building Linux installers...${NC}"
    if npm run build:linux; then
        echo -e "${GREEN}✅ Linux build complete${NC}"
    else
        echo -e "${RED}❌ Linux build failed${NC}"
        BUILD_ERRORS=$((BUILD_ERRORS + 1))
    fi
    echo ""
fi

echo "=========================================="
echo -e "${BLUE}📦 Build Summary${NC}"
echo "=========================================="

# List the built files
if [ -d "dist" ]; then
    echo ""
    echo -e "${GREEN}Built installers:${NC}"
    echo ""
    
    # Windows
    if [ "$BUILD_WINDOWS" = true ]; then
        WIN_FILES_FOUND=false
        for file in dist/*.exe; do
            if [ -f "$file" ]; then
                WIN_FILES_FOUND=true
                break
            fi
        done
        if [ "$WIN_FILES_FOUND" = true ]; then
            echo -e "${BLUE}Windows:${NC}"
            for file in dist/*.exe; do
                if [ -f "$file" ]; then
                    SIZE=$(du -h "$file" | cut -f1)
                    echo -e "  $(basename "$file") ($SIZE)"
                fi
            done
            echo ""
        fi
    fi
    
    # macOS
    if [ "$BUILD_MACOS" = true ]; then
        MAC_FILES_FOUND=false
        for file in dist/*.dmg dist/*.zip; do
            if [ -f "$file" ]; then
                MAC_FILES_FOUND=true
                break
            fi
        done
        if [ "$MAC_FILES_FOUND" = true ]; then
            echo -e "${BLUE}macOS:${NC}"
            for file in dist/*.dmg dist/*.zip; do
                if [ -f "$file" ]; then
                    SIZE=$(du -h "$file" | cut -f1)
                    echo -e "  $(basename "$file") ($SIZE)"
                fi
            done
            echo ""
        fi
    fi
    
    # Linux
    if [ "$BUILD_LINUX" = true ]; then
        LINUX_FILES_FOUND=false
        for file in dist/*.AppImage dist/*.deb dist/*.rpm; do
            if [ -f "$file" ]; then
                LINUX_FILES_FOUND=true
                break
            fi
        done
        if [ "$LINUX_FILES_FOUND" = true ]; then
            echo -e "${BLUE}Linux:${NC}"
            for file in dist/*.AppImage dist/*.deb dist/*.rpm; do
                if [ -f "$file" ]; then
                    SIZE=$(du -h "$file" | cut -f1)
                    echo -e "  $(basename "$file") ($SIZE)"
                fi
            done
            echo ""
        fi
    fi
    
    echo "=========================================="
    echo -e "${GREEN}📁 All distribution files are in: ./dist/${NC}"
    echo ""
else
    echo -e "${RED}❌ No distribution files found!${NC}"
    BUILD_ERRORS=$((BUILD_ERRORS + 1))
fi

if [ $BUILD_ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 All builds completed successfully!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some builds failed ($BUILD_ERRORS error(s))${NC}"
    exit 1
fi
