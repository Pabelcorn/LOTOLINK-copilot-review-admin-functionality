#!/bin/bash

# Desktop App Build Validation Script
# Validates that all necessary files and configurations are in place

set -e

echo "🔍 Validating Desktop App Build Configuration"
echo "=============================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Change to desktop-app directory
cd "$(dirname "$0")"

echo -e "${YELLOW}📂 Checking required files...${NC}"

# Check required files
REQUIRED_FILES=(
    "package.json"
    "main.js"
    "preload.js"
    "index.html"
    "lotolink-logo.png"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (missing)"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo -e "${YELLOW}📦 Checking package.json configuration...${NC}"

# Check package.json has required fields
if [ -f "package.json" ]; then
    # Check for electron dependency
    if grep -q '"electron"' package.json; then
        echo -e "${GREEN}✓${NC} electron dependency found"
    else
        echo -e "${RED}✗${NC} electron dependency missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check for electron-builder dependency
    if grep -q '"electron-builder"' package.json; then
        echo -e "${GREEN}✓${NC} electron-builder dependency found"
    else
        echo -e "${RED}✗${NC} electron-builder dependency missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check for build configuration
    if grep -q '"build":' package.json; then
        echo -e "${GREEN}✓${NC} build configuration found"
    else
        echo -e "${RED}✗${NC} build configuration missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check for build scripts
    if grep -q '"build":' package.json && grep -q '"build:win":' package.json; then
        echo -e "${GREEN}✓${NC} build scripts found"
    else
        echo -e "${RED}✗${NC} build scripts missing"
        ERRORS=$((ERRORS + 1))
    fi
fi

echo ""
echo -e "${YELLOW}🖼️  Checking icon file...${NC}"

if [ -f "lotolink-logo.png" ]; then
    # Check if file is a valid PNG
    if file lotolink-logo.png | grep -q "PNG image data"; then
        echo -e "${GREEN}✓${NC} Valid PNG icon file"
        
        # Check icon dimensions (should be at least 512x512 for best results)
        # Use portable grep approach for dimensions
        DIMENSIONS=$(file lotolink-logo.png | sed -n 's/.*PNG image data, \([0-9]* x [0-9]*\).*/\1/p' | head -1)
        echo -e "  Dimensions: $DIMENSIONS"
        
        WIDTH=$(echo "$DIMENSIONS" | cut -d' ' -f1)
        if [ -n "$WIDTH" ] && [ "$WIDTH" -ge 512 ] 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Icon size is adequate (>= 512px)"
        elif [ -n "$WIDTH" ]; then
            echo -e "${YELLOW}⚠${NC} Icon size is small (< 512px), consider using larger icon"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "${YELLOW}⚠${NC} Could not determine icon dimensions"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${RED}✗${NC} Icon file is not a valid PNG"
        ERRORS=$((ERRORS + 1))
    fi
fi

echo ""
echo -e "${YELLOW}📝 Checking main.js configuration...${NC}"

if [ -f "main.js" ]; then
    # Check for BrowserWindow
    if grep -q "BrowserWindow" main.js; then
        echo -e "${GREEN}✓${NC} BrowserWindow found"
    else
        echo -e "${RED}✗${NC} BrowserWindow not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check for preload
    if grep -q "preload" main.js; then
        echo -e "${GREEN}✓${NC} Preload script configured"
    else
        echo -e "${YELLOW}⚠${NC} Preload script not configured"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for context isolation
    if grep -q "contextIsolation: true" main.js; then
        echo -e "${GREEN}✓${NC} Context isolation enabled (secure)"
    else
        echo -e "${YELLOW}⚠${NC} Context isolation not enabled (security concern)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""
echo -e "${YELLOW}🔧 Checking Node.js and npm...${NC}"

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo -e "${GREEN}✓${NC} Node.js version is compatible (>= 18)"
    else
        echo -e "${RED}✗${NC} Node.js version is too old (< 18)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} Node.js not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not installed"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${YELLOW}📜 Checking build scripts...${NC}"

if [ -f "build.sh" ]; then
    if [ -x "build.sh" ]; then
        echo -e "${GREEN}✓${NC} build.sh is executable"
    else
        echo -e "${YELLOW}⚠${NC} build.sh is not executable"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

if [ -f "build-all.sh" ]; then
    if [ -x "build-all.sh" ]; then
        echo -e "${GREEN}✓${NC} build-all.sh is executable"
    else
        echo -e "${YELLOW}⚠${NC} build-all.sh is not executable"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""
echo "=============================================="
echo -e "${YELLOW}📊 Validation Summary${NC}"
echo "=============================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Desktop app is ready to build.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Validation passed with $WARNINGS warning(s).${NC}"
    echo -e "${YELLOW}   The app should build successfully, but review warnings above.${NC}"
    exit 0
else
    echo -e "${RED}❌ Validation failed with $ERRORS error(s) and $WARNINGS warning(s).${NC}"
    echo -e "${RED}   Please fix the errors above before building.${NC}"
    exit 1
fi
