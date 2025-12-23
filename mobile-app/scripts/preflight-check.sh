#!/bin/bash
# Pre-flight checks for mobile build workflow
# This script validates the environment before building

set -e

echo "🔍 Running pre-flight checks..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print error
error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo "=== Environment Checks ==="
echo ""

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js version: $NODE_VERSION"
    
    # Verify minimum version (v16+)
    NODE_MAJOR=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 16 ]; then
        error "Node.js version must be 16 or higher (found: $NODE_VERSION)"
    fi
else
    error "Node.js is not installed"
fi

# Check npm version
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "npm version: $NPM_VERSION"
else
    error "npm is not installed"
fi

echo ""
echo "=== Project Structure Checks ==="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    error "package.json not found - are you in the mobile-app directory?"
fi

# Check for required files
REQUIRED_FILES=(
    "package.json"
    "package-lock.json"
    "capacitor.config.ts"
    "tsconfig.json"
    "vite.config.ts"
    "index.html"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "Found: $file"
    else
        error "Missing required file: $file"
    fi
done

# Check for src directory
if [ -d "src" ]; then
    success "Found: src/ directory"
else
    error "Missing src/ directory"
fi

echo ""
echo "=== Dependency Checks ==="
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    success "node_modules directory exists"
    
    # Check if critical packages are installed
    CRITICAL_PACKAGES=(
        "@capacitor/core"
        "@capacitor/cli"
        "vite"
        "react"
        "typescript"
    )
    
    for pkg in "${CRITICAL_PACKAGES[@]}"; do
        if [ -d "node_modules/$pkg" ]; then
            success "Package installed: $pkg"
        else
            error "Missing critical package: $pkg"
        fi
    done
else
    warning "node_modules not found - run 'npm ci --legacy-peer-deps'"
fi

echo ""
echo "=== Configuration Checks ==="
echo ""

# Check Capacitor config
if [ -f "capacitor.config.ts" ]; then
    # Check for required config values
    if grep -q "appId:" capacitor.config.ts && grep -q "appName:" capacitor.config.ts; then
        success "Capacitor configuration has required fields"
    else
        error "Capacitor config missing required fields (appId, appName)"
    fi
    
    # Check webDir
    if grep -q "webDir: 'dist'" capacitor.config.ts; then
        success "Capacitor webDir configured correctly"
    else
        warning "Capacitor webDir may not be set to 'dist'"
    fi
fi

# Check TypeScript version compatibility
if [ -f "package.json" ]; then
    TS_VERSION=$(grep '"typescript"' package.json | sed 's/.*"typescript": "\([^"]*\)".*/\1/')
    # Check if version starts with ~5.3 or is exactly 5.3.x
    if [[ "$TS_VERSION" == "~5.3."* ]] || [[ "$TS_VERSION" == "5.3."* ]]; then
        success "TypeScript version pinned correctly: $TS_VERSION"
    else
        warning "TypeScript version should be ~5.3.3 for @typescript-eslint compatibility (found: $TS_VERSION)"
    fi
fi

echo ""
echo "=== Platform Checks ==="
echo ""

# Check Android platform
if [ -d "android" ]; then
    success "Android platform directory exists"
    
    # Check for gradlew
    if [ -f "android/gradlew" ]; then
        success "Android gradlew found"
        
        # Check if executable
        if [ -x "android/gradlew" ]; then
            success "gradlew is executable"
        else
            warning "gradlew is not executable - run 'chmod +x android/gradlew'"
        fi
    else
        error "Android gradlew not found"
    fi
else
    warning "Android platform not found - run 'npx cap add android'"
fi

# Check iOS platform
if [ -d "ios" ]; then
    success "iOS platform directory exists"
    
    # Check for Podfile
    if [ -f "ios/App/Podfile" ]; then
        success "iOS Podfile found"
        
        # Check deployment target
        if grep -q "platform :ios, '14.0'" ios/App/Podfile; then
            success "iOS deployment target is 14.0"
        else
            warning "iOS deployment target may not be set to 14.0"
        fi
    else
        warning "iOS Podfile not found"
    fi
else
    warning "iOS platform not found - run 'npx cap add ios'"
fi

echo ""
echo "=== Security Checks ==="
echo ""

# Check for .env file (should not be committed)
if [ -f ".env" ]; then
    warning ".env file found - ensure it's in .gitignore and not committed"
else
    success "No .env file found (or properly ignored)"
fi

# Check for common sensitive files
SENSITIVE_FILES=(
    "*.jks"
    "*.keystore"
    "*.p12"
    "keystore.properties"
)

FOUND_SENSITIVE=0
for pattern in "${SENSITIVE_FILES[@]}"; do
    # Use find for safer file matching
    if find . -maxdepth 1 -name "$pattern" 2>/dev/null | grep -q .; then
        warning "Found sensitive file matching: $pattern"
        ((FOUND_SENSITIVE++))
    fi
done

if [ $FOUND_SENSITIVE -eq 0 ]; then
    success "No sensitive files found in project root"
fi

echo ""
echo "=== Summary ==="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Ready to build! Next steps:"
    echo "  1. npm ci --legacy-peer-deps  (if node_modules not found)"
    echo "  2. npm run build"
    echo "  3. npx cap sync"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Pre-flight checks completed with $WARNINGS warning(s)${NC}"
    echo ""
    echo "You can proceed with caution. Review the warnings above."
    exit 0
else
    echo -e "${RED}❌ Pre-flight checks failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before building."
    exit 1
fi
