# 🚀 Guía Completa de Despliegue - LOTOLINK

Esta guía te ayudará a desplegar LOTOLINK en producción paso a paso, ya sea en un VPS, servidor dedicado o servicios cloud.

---

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#-prerrequisitos)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Preparación del Servidor](#-preparación-del-servidor)
4. [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
5. [Opción 1: Despliegue con Docker Compose](#opción-1-despliegue-con-docker-compose)
6. [Opción 2: Despliegue Manual en VPS](#opción-2-despliegue-manual-en-vps)
7. [Configuración de Base de Datos](#-configuración-de-base-de-datos)
8. [Configuración de Dominio y HTTPS](#-configuración-de-dominio-y-https)
9. [Configuración de Servicios Externos](#-configuración-de-servicios-externos)
10. [Despliegue del Frontend](#-despliegue-del-frontend)
11. [Monitoreo y Mantenimiento](#-monitoreo-y-mantenimiento)
12. [Troubleshooting](#-troubleshooting)
13. [Checklist de Producción](#-checklist-de-producción)

---

## 🔧 Prerrequisitos

### Infraestructura Mínima

**Para Desarrollo/Testing:**
- 2 GB RAM
- 2 CPU cores
- 20 GB almacenamiento
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+

**Para Producción:**
- 4 GB RAM (mínimo) / 8 GB (recomendado)
- 4 CPU cores
- 50 GB almacenamiento SSD
- Ubuntu 22.04 LTS (recomendado)

### Software Requerido

- **Docker** v20.10+ y **Docker Compose** v2.0+
- **Node.js** v18+ (si no usas Docker)
- **PostgreSQL** 15+
- **Redis** 7+
- **Git**
- **Nginx** (para reverse proxy)
- **Certbot** (para HTTPS)

### Servicios Externos (Producción)

- Cuenta de **Stripe** (procesamiento de pagos)
- Cuenta de **Gmail/SMTP** (envío de emails)
- Dominio propio
- (Opcional) Cuenta de **Sentry** (monitoreo de errores)

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                      Internet                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│               Nginx (Reverse Proxy + SSL)               │
│              Puerto 80/443 → Backend/Frontend           │
└─────────────────────────────────────────────────────────┘
                          │
              ┌───────────┴────────────┐
              ▼                        ▼
┌──────────────────────┐    ┌─────────────────────┐
│   Frontend (Static)  │    │  Backend API        │
│   HTML/JS/CSS        │    │  (NestJS)           │
│   Puerto 8080        │    │  Puerto 3000        │
└──────────────────────┘    └─────────────────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     ▼                ▼                ▼
            ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
            │ PostgreSQL  │  │   Redis     │  │  RabbitMQ    │
            │ Puerto 5432 │  │ Puerto 6379 │  │ Puerto 5672  │
            └─────────────┘  └─────────────┘  └──────────────┘
```

---

## 🖥️ Preparación del Servidor

### 1. Conectar al Servidor

```bash
# Conectar por SSH
ssh root@tu-servidor-ip

# O con usuario específico
ssh usuario@tu-servidor-ip
```

### 2. Actualizar el Sistema

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 3. Instalar Docker y Docker Compose

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version

# Agregar usuario al grupo docker (opcional)
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar para aplicar cambios
```

### 4. Instalar Git

```bash
sudo apt install git -y
```

### 5. Clonar el Repositorio

```bash
# Crear directorio para la aplicación
sudo mkdir -p /opt/lotolink
sudo chown $USER:$USER /opt/lotolink
cd /opt/lotolink

# Clonar repositorio
git clone https://github.com/Pabelcorn/LOTOLINK.git .

# O si tienes acceso privado
git clone https://tu-usuario@github.com/Pabelcorn/LOTOLINK.git .
```

---

## ⚙️ Configuración de Variables de Entorno

### 1. Backend - Configuración Principal

```bash
cd /opt/lotolink/backend
cp .env.example .env
nano .env
```

Edita el archivo `.env` con tus valores de producción:

```bash
# ============================================
# CONFIGURACIÓN DE PRODUCCIÓN - LOTOLINK
# ============================================

# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1
CORS_ORIGIN=https://tu-dominio.com

# Database (PostgreSQL)
DATABASE_HOST=postgres  # 'postgres' si usas Docker, 'localhost' si instalación manual
DATABASE_PORT=5432
DATABASE_USERNAME=lotolink
DATABASE_PASSWORD=TU_PASSWORD_SEGURO_AQUI_123!
DATABASE_NAME=lotolink_db

# Redis
REDIS_HOST=redis  # 'redis' si usas Docker, 'localhost' si instalación manual
REDIS_PORT=6379
REDIS_PASSWORD=TU_REDIS_PASSWORD_SEGURO

# RabbitMQ
RABBITMQ_URL=amqp://lotolink:TU_RABBITMQ_PASSWORD@rabbitmq:5672
RABBITMQ_QUEUE_PLAYS=plays_queue
RABBITMQ_DLQ=plays_dlq

# JWT - IMPORTANTE: Usa valores únicos y seguros
JWT_SECRET=GENERA_UN_SECRET_MUY_LARGO_Y_SEGURO_AQUI_min_32_caracteres
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# HMAC for Banca Integration - IMPORTANTE: Cambia esto
HMAC_SECRET=OTRO_SECRET_MUY_LARGO_Y_DIFERENTE_min_32_caracteres
HMAC_TIMESTAMP_TOLERANCE_SECONDS=120

# Banca Configuration
USE_MOCK_BANCA=false  # false en producción
BANCA_API_URL=https://banca-api.ejemplo.com
BANCA_HMAC_SECRET=secret_compartido_con_banca
BANCA_TIMEOUT_MS=30000

# Payment Gateway (Stripe) - PRODUCCIÓN
USE_MOCK_PAYMENT=false  # false en producción
STRIPE_SECRET_KEY=sk_live_TU_CLAVE_SECRETA_DE_STRIPE
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_DE_STRIPE

# Commission Configuration
COMMISSION_STRIPE_ACCOUNT_ID=acct_TU_CUENTA_DE_COMISIONES
COMMISSION_PERCENTAGE=5.0
CARD_PROCESSING_ACCOUNT_ID=acct_TU_CUENTA_PROCESSING

# Lottery Results Provider
USE_MOCK_LOTTERY_RESULTS=false  # false cuando tengas proveedor real
LOTTERY_RESULTS_API_URL=https://api-resultados-loteria.com
LOTTERY_RESULTS_API_KEY=tu_api_key_aqui

# Email Configuration - IMPORTANTE para notificaciones
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_gmail
EMAIL_FROM=noreply@lotolink.com
ADMIN_EMAIL=admin@lotolink.com

# Play Worker
PLAY_WORKER_MAX_RETRIES=3
PLAY_WORKER_RETRY_DELAY_MS=5000
```

### 2. Generar Secrets Seguros

Para generar secrets aleatorios seguros:

```bash
# JWT_SECRET y HMAC_SECRET
openssl rand -base64 48

# O usando Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### 3. Variables para Docker Compose

Crea un archivo `.env` en la raíz del proyecto:

```bash
cd /opt/lotolink
nano .env
```

Contenido:

```bash
# PostgreSQL
POSTGRES_USER=lotolink
POSTGRES_PASSWORD=TU_PASSWORD_POSTGRES_SEGURO_123!
POSTGRES_DB=lotolink_db

# RabbitMQ
RABBITMQ_USER=lotolink
RABBITMQ_PASSWORD=TU_PASSWORD_RABBITMQ_SEGURO_123!

# Redis
REDIS_PASSWORD=TU_PASSWORD_REDIS_SEGURO_123!
```

---

## Opción 1: Despliegue con Docker Compose

### 1. Verificar docker-compose.yml

El archivo `docker-compose.yml` ya está configurado. Para producción, crea un override:

```bash
cd /opt/lotolink
nano docker-compose.prod.yml
```

Contenido:

```yaml
version: '3.8'

services:
  postgres:
    restart: always
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  
  redis:
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
  
  rabbitmq:
    restart: always
    environment:
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
  
  backend:
    restart: always
    environment:
      NODE_ENV: production
      USE_MOCK_BANCA: "false"
      USE_MOCK_PAYMENTS: "false"
      USE_MOCK_LOTTERY_RESULTS: "false"
    volumes:
      - ./backend/logs:/app/logs
  
  # Remover adminer en producción
  adminer:
    profiles:
      - debug
```

### 2. Construir e Iniciar los Servicios

```bash
# Construir las imágenes
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Iniciar todos los servicios
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verificar que todo esté corriendo
docker-compose ps
```

### 3. Ver Logs

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs solo del backend
docker-compose logs -f backend

# Logs solo de postgres
docker-compose logs -f postgres
```

### 4. Ejecutar Migraciones de Base de Datos

```bash
# Entrar al contenedor del backend
docker-compose exec backend sh

# Ejecutar migraciones (si existen)
npm run migration:run

# Salir del contenedor
exit
```

---

## Opción 2: Despliegue Manual en VPS

Si prefieres instalar todo sin Docker:

### 1. Instalar PostgreSQL

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib -y

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear usuario y base de datos
sudo -u postgres psql

-- En el prompt de PostgreSQL:
CREATE USER lotolink WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE lotolink_db OWNER lotolink;
GRANT ALL PRIVILEGES ON DATABASE lotolink_db TO lotolink;
\q
```

### 2. Instalar Redis

```bash
# Ubuntu/Debian
sudo apt install redis-server -y

# Configurar contraseña
sudo nano /etc/redis/redis.conf

# Descomentar y establecer:
requirepass tu_redis_password

# Reiniciar
sudo systemctl restart redis
sudo systemctl enable redis
```

### 3. Instalar RabbitMQ

```bash
# Ubuntu/Debian
sudo apt install rabbitmq-server -y

# Iniciar
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server

# Habilitar management plugin
sudo rabbitmq-plugins enable rabbitmq_management

# Crear usuario
sudo rabbitmqctl add_user lotolink tu_rabbitmq_password
sudo rabbitmqctl set_user_tags lotolink administrator
sudo rabbitmqctl set_permissions -p / lotolink ".*" ".*" ".*"
```

### 4. Instalar Node.js

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Instalar Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Verificar
node --version
npm --version
```

### 5. Instalar el Backend

```bash
cd /opt/lotolink/backend

# Instalar dependencias
npm ci --only=production

# Compilar TypeScript
npm run build

# Ejecutar migraciones
npm run migration:run
```

### 6. Configurar como Servicio con PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación
cd /opt/lotolink/backend
pm2 start dist/main.js --name lotolink-backend

# Guardar configuración
pm2 save

# Configurar para inicio automático
pm2 startup
# Sigue las instrucciones que muestra el comando anterior

# Ver logs
pm2 logs lotolink-backend

# Ver estado
pm2 status
```

---

## 🗄️ Configuración de Base de Datos

### Migraciones Iniciales

Crea el archivo de migración para las tablas principales:

```bash
cd /opt/lotolink/backend
```

Ejecuta este script SQL directamente en PostgreSQL:

```sql
-- Conectar a la base de datos
psql -U lotolink -d lotolink_db

-- Crear tablas principales
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

CREATE TABLE IF NOT EXISTS outgoing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  banca_id UUID REFERENCES bancas(id),
  path VARCHAR(500),
  payload JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  retries INTEGER DEFAULT 0,
  last_response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(255),
  event_type VARCHAR(100),
  payload JSONB,
  signature_valid BOOLEAN,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_plays_user_id ON plays(user_id);
CREATE INDEX IF NOT EXISTS idx_plays_status ON plays(status);
CREATE INDEX IF NOT EXISTS idx_plays_created_at ON plays(created_at);
CREATE INDEX IF NOT EXISTS idx_bancas_status ON bancas(status);
CREATE INDEX IF NOT EXISTS idx_outgoing_requests_status ON outgoing_requests(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);

\q
```

### Backup de Base de Datos

Configura backups automáticos:

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-lotolink-db.sh
```

Contenido:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/lotolink"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup completo
pg_dump -U lotolink lotolink_db | gzip > $BACKUP_DIR/lotolink_db_$DATE.sql.gz

# Mantener solo los últimos 7 días
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completado: lotolink_db_$DATE.sql.gz"
```

```bash
# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/backup-lotolink-db.sh

# Configurar cron para backup diario a las 2 AM
sudo crontab -e

# Agregar esta línea:
0 2 * * * /usr/local/bin/backup-lotolink-db.sh >> /var/log/lotolink-backup.log 2>&1
```

---

## 🌐 Configuración de Dominio y HTTPS

### 1. Configurar DNS

En tu proveedor de dominio (Namecheap, GoDaddy, etc.), crea estos registros DNS:

```
Tipo    Nombre      Valor                 TTL
A       @           IP_DE_TU_SERVIDOR     3600
A       www         IP_DE_TU_SERVIDOR     3600
A       api         IP_DE_TU_SERVIDOR     3600
```

Espera 10-30 minutos para que se propaguen los cambios.

### 2. Instalar Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. Configurar Nginx como Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/lotolink
```

Contenido:

```nginx
# Configuración para LOTOLINK
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir a HTTPS (se configurará después con certbot)
    return 301 https://$server_name$request_uri;
}

# API Backend
server {
    listen 80;
    server_name api.tu-dominio.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Frontend
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    root /opt/lotolink;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

Habilita el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/lotolink /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Instalar Certificado SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com -d api.tu-dominio.com

# Seguir las instrucciones en pantalla
# Selecciona la opción 2 para redirigir todo el tráfico a HTTPS

# Verificar renovación automática
sudo certbot renew --dry-run
```

### 5. Verificar HTTPS

Abre tu navegador y visita:
- `https://tu-dominio.com` (Frontend)
- `https://api.tu-dominio.com/health` (Backend)

---

## 🔌 Configuración de Servicios Externos

### 1. Configurar Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Cambia a modo Live
3. Ve a Developers → API Keys
4. Copia tu **Secret Key** (empieza con `sk_live_`)
5. Ve a Developers → Webhooks
6. Crea un nuevo endpoint: `https://api.tu-dominio.com/api/v1/webhooks/stripe`
7. Selecciona eventos: `payment_intent.succeeded`, `payment_intent.failed`
8. Copia el **Webhook Secret** (empieza con `whsec_`)
9. Actualiza tu archivo `.env` con estos valores

### 2. Configurar Email (Gmail)

1. Ve a tu cuenta de Google
2. Habilita verificación en 2 pasos
3. Ve a Seguridad → Contraseñas de aplicaciones
4. Genera una contraseña para "Correo"
5. Usa esta contraseña en `EMAIL_PASSWORD` de tu `.env`

### 3. Configurar Sentry (Opcional pero recomendado)

```bash
npm install @sentry/node --save
```

Agrega a tu `.env`:

```bash
SENTRY_DSN=https://tu-dsn@sentry.io/proyecto
SENTRY_ENVIRONMENT=production
```

---

## 📱 Despliegue del Frontend

### Opción 1: Servir archivos estáticos con Nginx

Ya está configurado en la sección de Nginx. Solo asegúrate de que los archivos HTML estén en `/opt/lotolink/`.

### Opción 2: Usar CDN (Recomendado para mejor rendimiento)

```bash
# Subir archivos a S3/CloudFront o similar
# O usar servicios como Netlify/Vercel para el frontend

# Si usas Netlify:
# 1. Conecta tu repositorio
# 2. Build command: (vacío, ya que es HTML estático)
# 3. Publish directory: /
# 4. Actualiza API_BASE en los archivos HTML al dominio de tu API
```

### Actualizar URL del API en el Frontend

```bash
cd /opt/lotolink

# Buscar y reemplazar localhost por tu dominio
sed -i 's|http://localhost:3000|https://api.tu-dominio.com|g' index.html
sed -i 's|http://localhost:3000|https://api.tu-dominio.com|g' admin-panel.html
```

---

## 📊 Monitoreo y Mantenimiento

### 1. Configurar Prometheus (Opcional)

Ver guía completa en: [docs/OBSERVABILITY_GUIDE.md](docs/OBSERVABILITY_GUIDE.md)

### 2. Logs del Sistema

```bash
# Ver logs del backend (si usas Docker)
docker-compose logs -f backend

# Ver logs del backend (si usas PM2)
pm2 logs lotolink-backend

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### 3. Monitoreo de Recursos

```bash
# Instalar htop para monitoreo en tiempo real
sudo apt install htop -y
htop

# Ver uso de disco
df -h

# Ver uso de memoria
free -h

# Ver procesos de Docker
docker stats
```

### 4. Actualizar la Aplicación

```bash
cd /opt/lotolink

# Hacer backup antes de actualizar
./scripts/backup-lotolink-db.sh

# Pull de los últimos cambios
git pull origin main

# Si usas Docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Si usas PM2
cd backend
npm install
npm run build
pm2 restart lotolink-backend
```

---

## 🔧 Troubleshooting

### Problema: Backend no inicia

**Síntomas:** Error al ejecutar `docker-compose up` o `pm2 start`

**Soluciones:**
```bash
# 1. Verificar logs
docker-compose logs backend

# 2. Verificar variables de entorno
docker-compose exec backend env | grep DATABASE

# 3. Verificar conexión a PostgreSQL
docker-compose exec backend sh
psql -h postgres -U lotolink -d lotolink_db
# Ingresa la contraseña cuando lo pida

# 4. Reiniciar servicios
docker-compose restart
```

### Problema: "Cannot connect to database"

**Síntomas:** Error de conexión a PostgreSQL

**Soluciones:**
```bash
# 1. Verificar que PostgreSQL esté corriendo
docker-compose ps postgres
# o
sudo systemctl status postgresql

# 2. Verificar credenciales en .env
cat backend/.env | grep DATABASE

# 3. Probar conexión manual
psql -h localhost -U lotolink -d lotolink_db

# 4. Verificar que el usuario tenga permisos
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE lotolink_db TO lotolink;
\q
```

### Problema: 502 Bad Gateway en Nginx

**Síntomas:** Error 502 al acceder al sitio

**Soluciones:**
```bash
# 1. Verificar que el backend esté corriendo
curl http://localhost:3000/health

# 2. Verificar logs de Nginx
sudo tail -f /var/log/nginx/error.log

# 3. Verificar configuración de Nginx
sudo nginx -t

# 4. Reiniciar Nginx
sudo systemctl restart nginx
```

### Problema: Certificado SSL no se renueva

**Síntomas:** Advertencia de certificado expirado

**Soluciones:**
```bash
# 1. Renovar manualmente
sudo certbot renew

# 2. Verificar que el cron esté activo
sudo systemctl status certbot.timer

# 3. Probar renovación
sudo certbot renew --dry-run

# 4. Ver logs de certbot
sudo journalctl -u certbot
```

### Problema: Alta latencia o lentitud

**Síntomas:** Respuestas lentas del API

**Soluciones:**
```bash
# 1. Verificar recursos del servidor
htop
df -h
free -h

# 2. Verificar conexiones a la base de datos
docker-compose exec postgres psql -U lotolink -d lotolink_db
SELECT count(*) FROM pg_stat_activity;

# 3. Optimizar PostgreSQL
# Editar postgresql.conf para aumentar recursos

# 4. Agregar índices faltantes
# Ver sección de Base de Datos

# 5. Implementar cache con Redis
# Ya está configurado en la aplicación
```

### Problema: Errores de CORS

**Síntomas:** "CORS policy blocked" en el navegador

**Soluciones:**
```bash
# 1. Verificar CORS_ORIGIN en backend/.env
CORS_ORIGIN=https://tu-dominio.com

# 2. Verificar que el frontend use el dominio correcto
cat index.html | grep API_BASE

# 3. Agregar dominio a whitelist en backend
# Editar backend/.env y agregar tu dominio
```

---

## ✅ Checklist de Producción

Antes de lanzar a producción, verifica:

### Seguridad
- [ ] JWT_SECRET es único y seguro (min 48 caracteres)
- [ ] HMAC_SECRET es único y diferente al JWT_SECRET
- [ ] Contraseñas de base de datos son seguras
- [ ] HTTPS está configurado y funcionando
- [ ] Firewall configurado (solo puertos 80, 443, 22 abiertos)
- [ ] Stripe está en modo Live (no Test)
- [ ] Variables de entorno sensibles no están en el código
- [ ] Rate limiting está habilitado
- [ ] CORS configurado solo para tu dominio

### Base de Datos
- [ ] PostgreSQL corriendo y accesible
- [ ] Backups automáticos configurados
- [ ] Migraciones ejecutadas correctamente
- [ ] Índices creados
- [ ] Usuario de BD tiene permisos correctos

### Backend
- [ ] Backend inicia sin errores
- [ ] `/health` endpoint responde correctamente
- [ ] USE_MOCK_* están en false
- [ ] Logs se guardan correctamente
- [ ] PM2 o Docker configurado para auto-restart
- [ ] Email envío funciona

### Frontend
- [ ] API_BASE apunta a tu dominio de producción
- [ ] Archivos estáticos se sirven correctamente
- [ ] HTTPS funciona sin advertencias
- [ ] Login/registro funciona
- [ ] Panel de admin accesible

### Infraestructura
- [ ] Nginx configurado correctamente
- [ ] Certificado SSL instalado y auto-renovación funciona
- [ ] DNS configurado y propagado
- [ ] Monitoreo configurado (logs, métricas)
- [ ] Backups funcionando

### Servicios Externos
- [ ] Stripe configurado en modo Live
- [ ] Webhooks de Stripe configurados
- [ ] Email SMTP configurado
- [ ] (Opcional) Sentry configurado

### Testing
- [ ] Crear una cuenta de prueba funciona
- [ ] Login funciona
- [ ] Crear una jugada funciona
- [ ] Recibir notificación por email funciona
- [ ] Panel de admin accesible para cuentas admin
- [ ] Procesar un pago con Stripe funciona

### Documentación
- [ ] README actualizado con instrucciones de producción
- [ ] Credenciales documentadas de forma segura
- [ ] Runbooks creados para equipo de soporte
- [ ] Plan de recuperación ante desastres documentado

---

## 🆘 Soporte

### Recursos Útiles

- **Documentación del Proyecto:** [README.md](README.md)
- **Guía de Inicio Rápido:** [QUICK_START.md](QUICK_START.md)
- **Guía de Seguridad:** [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md)
- **Guía de Testing:** [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)
- **Guía de Observabilidad:** [docs/OBSERVABILITY_GUIDE.md](docs/OBSERVABILITY_GUIDE.md)

### Comandos Útiles de Referencia Rápida

```bash
# Ver status de todos los servicios (Docker)
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar un servicio específico
docker-compose restart backend

# Ejecutar comando en contenedor
docker-compose exec backend sh

# Backup de base de datos
docker-compose exec postgres pg_dump -U lotolink lotolink_db > backup.sql

# Restaurar base de datos
docker-compose exec -T postgres psql -U lotolink lotolink_db < backup.sql

# Ver uso de recursos
docker stats

# Limpiar contenedores e imágenes no usadas
docker system prune -a
```

---

## 🎯 Próximos Pasos

Después de completar el despliegue:

1. **Testing exhaustivo:** Ejecuta todas las pruebas en producción
2. **Monitoreo:** Configura alertas para errores críticos
3. **Optimización:** Revisa métricas y optimiza según necesidad
4. **Documentación:** Documenta cualquier configuración específica
5. **Capacitación:** Entrena a tu equipo en el uso del sistema
6. **Marketing:** ¡Lanza oficialmente tu plataforma!

---

## 📞 Contacto y Ayuda

Si encuentras problemas durante el despliegue:

1. Revisa los logs del sistema
2. Consulta la sección de [Troubleshooting](#-troubleshooting)
3. Revisa la documentación en `/docs`
4. Crea un issue en GitHub con detalles del problema

---

**¡Felicidades por desplegar LOTOLINK!** 🎉

---

**Última actualización:** 2025-12-19  
**Versión:** 1.0.0  
**Mantenido por:** LOTOLINK Team
