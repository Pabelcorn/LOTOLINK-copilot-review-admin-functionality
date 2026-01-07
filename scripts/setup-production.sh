#!/bin/bash
# =============================================================================
# LOTOLINK - Production Setup Script
# =============================================================================
# Este script prepara el entorno de producción
# Ejecutar como: ./scripts/setup-production.sh
# =============================================================================

set -e

echo ""
echo "🚀 LOTOLINK - Configuración de Producción"
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar Node.js
echo -e "${BLUE}📦 Verificando dependencias...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Crear .env.production si no existe
echo ""
echo -e "${BLUE}📝 Configurando variables de entorno...${NC}"
if [ ! -f ".env.production" ]; then
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.production
        echo -e "${YELLOW}⚠️  Archivo .env.production creado desde ejemplo${NC}"
        echo -e "${YELLOW}   Por favor, edita .env.production con tus valores reales${NC}"
    else
        echo -e "${RED}❌ No se encontró .env.production.example${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env.production ya existe${NC}"
fi

# Generar secretos si es necesario
echo ""
echo -e "${BLUE}🔐 Generando secretos de seguridad...${NC}"
echo ""

# Instalar bcrypt si no está
cd backend
npm install bcrypt --save 2>/dev/null || true
cd ..

# Generar todos los secretos
echo "Ejecutando generador de secretos..."
node scripts/generate-admin-hash.js --all > /tmp/lotolink-secrets.txt 2>&1

echo -e "${GREEN}✅ Secretos generados en /tmp/lotolink-secrets.txt${NC}"
echo -e "${YELLOW}⚠️  Copia los secretos a .env.production y luego elimina el archivo${NC}"

# Instalar dependencias
echo ""
echo -e "${BLUE}📦 Instalando dependencias...${NC}"

echo "Backend..."
cd backend && npm ci --production && cd ..

echo "Mobile app..."
cd mobile-app && npm ci && cd ..

# Build
echo ""
echo -e "${BLUE}🔨 Construyendo aplicación...${NC}"

echo "Backend..."
cd backend && npm run build && cd ..

echo "Mobile app..."
cd mobile-app && npm run build && cd ..

# Migraciones de base de datos
echo ""
echo -e "${BLUE}🗄️  Base de datos...${NC}"
echo -e "${YELLOW}⚠️  Ejecuta las migraciones manualmente:${NC}"
echo "   psql -U lotolink_user -d lotolink_prod -f backend/database/migrations/005_auth_system.sql"

# Verificar SSL
echo ""
echo -e "${BLUE}🔒 Verificando SSL...${NC}"
if [ -f "/etc/letsencrypt/live/lotolink.com/fullchain.pem" ]; then
    echo -e "${GREEN}✅ Certificado SSL encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  Certificado SSL no encontrado${NC}"
    echo "   Ejecuta: sudo certbot --nginx -d lotolink.com"
fi

# Resumen
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Configuración completada${NC}"
echo "=========================================="
echo ""
echo "📋 Próximos pasos:"
echo "   1. Editar .env.production con valores reales"
echo "   2. Copiar secretos de /tmp/lotolink-secrets.txt"
echo "   3. Ejecutar migraciones de base de datos"
echo "   4. Configurar Nginx con SSL"
echo "   5. Configurar cuenta Twilio para SMS"
echo "   6. Configurar OAuth (Google, Apple)"
echo "   7. Iniciar la aplicación: npm run start:prod"
echo ""
echo -e "${YELLOW}🔐 IMPORTANTE: Elimina /tmp/lotolink-secrets.txt después de copiar${NC}"
echo ""
