#!/bin/bash

# LotoLink Desktop App Build Script
# Builds the desktop application for all platforms

set -e

echo "🚀 Building LotoLink Desktop Application"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the desktop-app directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Build for current platform
echo "🏗️  Building for current platform..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Distribution files can be found in: ./dist/"
echo ""

# List the built files
if [ -d "dist" ]; then
    echo "Built files:"
    ls -lh dist/ | grep -E '\.(exe|dmg|AppImage|deb|rpm|zip)$' || echo "No distribution files found"
fi

echo ""
echo "🎉 Build process finished successfully!"
