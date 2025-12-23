#!/bin/bash

# ============================================
# Script de Despliegue Automatizado - LOTOLINK
# ============================================
# Este script facilita el despliegue de LOTOLINK
# tanto en desarrollo como en producción
# ============================================

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
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

# Banner
print_banner() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║          LOTOLINK - Script de Despliegue                ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
}

# Verificar prerrequisitos
check_prerequisites() {
    log_info "Verificando prerrequisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado. Por favor instala Docker primero."
        log_info "Visita: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose no está instalado."
        log_info "Visita: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    log_success "Prerrequisitos verificados correctamente"
}

# Verificar variables de entorno
check_env_files() {
    log_info "Verificando archivos de configuración..."
    
    if [ ! -f "backend/.env" ]; then
        log_warning "Archivo backend/.env no encontrado"
        
        if [ "$ENVIRONMENT" = "production" ]; then
            if [ -f "backend/.env.production.example" ]; then
                log_info "Copiando .env.production.example a .env..."
                cp backend/.env.production.example backend/.env
                log_warning "IMPORTANTE: Edita backend/.env con tus valores de producción"
                log_warning "Presiona Enter cuando hayas editado el archivo..."
                read -r
            else
                log_error "No se encontró backend/.env.production.example"
                exit 1
            fi
        else
            if [ -f "backend/.env.example" ]; then
                log_info "Copiando .env.example a .env..."
                cp backend/.env.example backend/.env
                log_success "Archivo .env creado para desarrollo"
            else
                log_error "No se encontró backend/.env.example"
                exit 1
            fi
        fi
    fi
    
    log_success "Archivos de configuración verificados"
}

# Construir imágenes
build_images() {
    log_info "Construyendo imágenes Docker..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ -f "docker-compose.prod.yml" ]; then
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
        else
            docker-compose build
        fi
    else
        docker-compose build
    fi
    
    log_success "Imágenes construidas correctamente"
}

# Iniciar servicios
start_services() {
    log_info "Iniciando servicios..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ -f "docker-compose.prod.yml" ]; then
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        else
            docker-compose up -d
        fi
    else
        docker-compose up -d
    fi
    
    log_success "Servicios iniciados"
}

# Esperar a que los servicios estén listos
wait_for_services() {
    log_info "Esperando a que los servicios estén listos..."
    
    # Esperar PostgreSQL
    log_info "Esperando PostgreSQL..."
    timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U lotolink; do sleep 2; done' || {
        log_error "PostgreSQL no está listo después de 60 segundos"
        exit 1
    }
    
    # Esperar Redis
    log_info "Esperando Redis..."
    timeout 30 bash -c 'until docker-compose exec -T redis redis-cli ping 2>/dev/null; do sleep 2; done' || {
        log_error "Redis no está listo después de 30 segundos"
        exit 1
    }
    
    # Esperar Backend
    log_info "Esperando Backend..."
    sleep 10
    timeout 60 bash -c 'until curl -s http://localhost:3000/health > /dev/null 2>&1; do sleep 2; done' || {
        log_warning "Backend no respondió en /health, pero continuando..."
    }
    
    log_success "Servicios listos"
}

# Ejecutar migraciones
run_migrations() {
    log_info "Ejecutando migraciones de base de datos..."
    
    # Crear tablas si no existen
    docker-compose exec -T postgres psql -U lotolink -d lotolink_db << 'EOF'
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  password VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  wallet_balance DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  play_data JSONB NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DOP',
  status VARCHAR(50) DEFAULT 'pending',
  play_id_banca VARCHAR(255),
  ticket_code VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  integration_type VARCHAR(50) DEFAULT 'api',
  endpoint VARCHAR(500),
  auth_type VARCHAR(50) DEFAULT 'hmac',
  client_id VARCHAR(255),
  secret VARCHAR(255),
  public_key TEXT,
  sla_ms INTEGER DEFAULT 30000,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_plays_user_id ON plays(user_id);
CREATE INDEX IF NOT EXISTS idx_plays_status ON plays(status);
CREATE INDEX IF NOT EXISTS idx_bancas_status ON bancas(status);
EOF
    
    log_success "Migraciones ejecutadas correctamente"
}

# Mostrar información de despliegue
show_deployment_info() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║          ¡Despliegue Completado Exitosamente!          ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    
    log_success "LOTOLINK está corriendo"
    echo ""
    
    log_info "Servicios disponibles:"
    echo "  • Frontend:    http://localhost:8080"
    echo "  • Admin Panel: http://localhost:8080/admin-panel.html"
    echo "  • API:         http://localhost:3000"
    echo "  • API Health:  http://localhost:3000/health"
    echo ""
    
    if [ "$ENVIRONMENT" = "development" ]; then
        echo "  • Adminer:     http://localhost:8080 (gestión de BD)"
        echo "  • RabbitMQ:    http://localhost:15672 (usuario: lotolink)"
        echo ""
    fi
    
    log_info "Comandos útiles:"
    echo "  • Ver logs:           docker-compose logs -f"
    echo "  • Ver estado:         docker-compose ps"
    echo "  • Detener servicios:  docker-compose down"
    echo "  • Reiniciar:          docker-compose restart"
    echo ""
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log_warning "RECORDATORIOS IMPORTANTES:"
        echo "  1. Configura un dominio y certificado SSL"
        echo "  2. Configura backups automáticos de la base de datos"
        echo "  3. Revisa backend/.env y actualiza todos los secrets"
        echo "  4. Configura Stripe en modo LIVE"
        echo "  5. Configura monitoreo y alertas"
        echo ""
        log_info "Ver guía completa: DEPLOYMENT_GUIDE.md"
    fi
}

# Menú principal
show_menu() {
    echo ""
    echo "Selecciona el tipo de despliegue:"
    echo ""
    echo "  1) Desarrollo (con herramientas de debug)"
    echo "  2) Producción (optimizado y seguro)"
    echo "  3) Detener todos los servicios"
    echo "  4) Ver logs"
    echo "  5) Ver estado de servicios"
    echo "  6) Salir"
    echo ""
    echo -n "Opción: "
    read -r option
    echo ""
    
    case $option in
        1)
            ENVIRONMENT="development"
            deploy_application
            ;;
        2)
            ENVIRONMENT="production"
            log_warning "¡Vas a desplegar en modo PRODUCCIÓN!"
            echo -n "¿Estás seguro? (y/N): "
            read -r confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                deploy_application
            else
                log_info "Despliegue cancelado"
            fi
            ;;
        3)
            stop_services
            ;;
        4)
            docker-compose logs -f
            ;;
        5)
            docker-compose ps
            show_menu
            ;;
        6)
            log_info "¡Hasta luego!"
            exit 0
            ;;
        *)
            log_error "Opción inválida"
            show_menu
            ;;
    esac
}

# Función principal de despliegue
deploy_application() {
    check_prerequisites
    check_env_files
    build_images
    start_services
    wait_for_services
    run_migrations
    show_deployment_info
}

# Detener servicios
stop_services() {
    log_info "Deteniendo servicios..."
    docker-compose down
    log_success "Servicios detenidos"
}

# Verificar si se pasó un argumento
if [ $# -eq 0 ]; then
    print_banner
    show_menu
else
    case $1 in
        dev|development)
            ENVIRONMENT="development"
            print_banner
            deploy_application
            ;;
        prod|production)
            ENVIRONMENT="production"
            print_banner
            log_warning "Desplegando en modo PRODUCCIÓN"
            deploy_application
            ;;
        stop)
            print_banner
            stop_services
            ;;
        logs)
            docker-compose logs -f
            ;;
        status)
            docker-compose ps
            ;;
        help|--help|-h)
            print_banner
            echo "Uso: $0 [comando]"
            echo ""
            echo "Comandos:"
            echo "  dev, development    Desplegar en modo desarrollo"
            echo "  prod, production    Desplegar en modo producción"
            echo "  stop                Detener todos los servicios"
            echo "  logs                Ver logs en tiempo real"
            echo "  status              Ver estado de servicios"
            echo "  help                Mostrar esta ayuda"
            echo ""
            echo "Sin argumentos, se muestra el menú interactivo"
            ;;
        *)
            log_error "Comando desconocido: $1"
            log_info "Usa '$0 help' para ver los comandos disponibles"
            exit 1
            ;;
    esac
fi
