#!/bin/bash

# LOTOLINK - Script de Inicio Completo
# Este script inicia el backend y el panel de administración

set -e

echo "🚀 Iniciando LOTOLINK Sistema Completo..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js no está instalado${NC}"
    echo "Por favor instala Node.js v18 o superior desde: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js detectado: $(node --version)${NC}"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Directorio 'backend' no encontrado${NC}"
    echo "Asegúrate de ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado. Creando desde .env.example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
    echo -e "${YELLOW}⚠️  Por favor, edita backend/.env con tus configuraciones antes de continuar${NC}"
    echo "Presiona Enter para continuar o Ctrl+C para salir..."
    read -r
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
fi

# Check if PostgreSQL is running (optional, just a warning)
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL no detectado. Asegúrate de que esté instalado y ejecutándose.${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL detectado${NC}"
fi

# Start backend in background
echo ""
echo -e "${BLUE}🔧 Iniciando Backend...${NC}"
cd backend
npm run start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
echo "Esperando 5 segundos para que el backend inicie..."
sleep 5

# Check if backend is running
if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${RED}❌ Error: El backend no pudo iniciarse${NC}"
    echo "Revisa los logs en: backend.log"
    cat backend.log
    exit 1
fi

# Test backend health
if command -v curl &> /dev/null; then
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend ejecutándose correctamente en http://localhost:3000${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend iniciado pero el health check falló. Puede que aún esté iniciando...${NC}"
    fi
fi

# Check if http-server is available globally
if ! command -v http-server &> /dev/null; then
    echo -e "${YELLOW}⚠️  http-server no está instalado globalmente${NC}"
    echo -e "${BLUE}📦 Instalando http-server...${NC}"
    npm install -g http-server
fi

# Start admin panel server
echo ""
echo -e "${BLUE}🎨 Iniciando Panel de Administración...${NC}"
http-server -p 8080 -c-1 --silent > adminpanel.log 2>&1 &
PANEL_PID=$!

# Wait a bit for panel to start
sleep 2

if ! ps -p $PANEL_PID > /dev/null; then
    echo -e "${RED}❌ Error: El panel de administración no pudo iniciarse${NC}"
    exit 1
fi

# Print success message
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ LOTOLINK INICIADO CORRECTAMENTE${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Panel de Administración:${NC} http://localhost:8080/admin-panel.html"
echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:3000"
echo -e "${BLUE}💚 Health Check:${NC} http://localhost:3000/health"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo "  - Backend: tail -f backend.log"
echo "  - Panel: tail -f adminpanel.log"
echo ""
echo -e "${YELLOW}🛑 Para detener:${NC}"
echo "  - Backend PID: $BACKEND_PID"
echo "  - Panel PID: $PANEL_PID"
echo "  - O ejecuta: ./scripts/stop-lotolink.sh"
echo ""

# Save PIDs to file for stop script
echo "$BACKEND_PID" > .lotolink.pids
echo "$PANEL_PID" >> .lotolink.pids

# Open browser (optional)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:8080/admin-panel.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "http://localhost:8080/admin-panel.html" 2>/dev/null || true
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start "http://localhost:8080/admin-panel.html"
fi

echo -e "${GREEN}🌐 Abriendo navegador...${NC}"
echo ""
echo -e "${GREEN}¡Disfruta usando LOTOLINK! 🎉${NC}"
