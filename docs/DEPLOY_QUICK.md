# 🚀 LOTOLINK - Guía Rápida de Despliegue

> **Referencia rápida** para desplegar LOTOLINK. Para la guía completa ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## ⚡ Despliegue Rápido con Docker (Recomendado)

### Opción 1: Script Automatizado (Más Fácil)

```bash
# Dar permisos de ejecución
chmod +x scripts/deploy.sh

# Ejecutar el script interactivo
./scripts/deploy.sh

# O directamente en modo desarrollo
./scripts/deploy.sh dev

# O directamente en modo producción
./scripts/deploy.sh prod
```

### Opción 2: Comandos Directos

**Desarrollo:**
```bash
# 1. Preparar variables de entorno
cd backend
cp .env.example .env
# Editar .env si es necesario
cd ..

# 2. Iniciar servicios
docker-compose up -d

# 3. Acceder
# Frontend: http://localhost:8080
# API: http://localhost:3000
# Admin: http://localhost:8080/admin-panel.html
```

**Producción:**
```bash
# 1. Preparar variables de entorno
cd backend
cp .env.production.example .env
nano .env  # Editar con valores de producción
cd ..

# 2. Crear archivo .env en raíz para Docker Compose
cat > .env << EOF
POSTGRES_PASSWORD=TU_PASSWORD_POSTGRES
REDIS_PASSWORD=TU_PASSWORD_REDIS
RABBITMQ_PASSWORD=TU_PASSWORD_RABBITMQ
EOF

# 3. Iniciar con configuración de producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 4. Ver logs
docker-compose logs -f
```

---

## 🖥️ Despliegue en VPS (Sin Docker)

### 1. Instalar Dependencias

```bash
# PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Redis
sudo apt install redis-server -y

# RabbitMQ
sudo apt install rabbitmq-server -y

# Node.js (con NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
```

### 2. Configurar Base de Datos

```bash
sudo -u postgres psql
CREATE USER lotolink WITH PASSWORD 'tu_password';
CREATE DATABASE lotolink_db OWNER lotolink;
\q
```

### 3. Configurar y Ejecutar Backend

```bash
cd backend
npm ci --only=production
npm run build

# Instalar PM2
npm install -g pm2

# Iniciar
pm2 start dist/main.js --name lotolink-backend
pm2 save
pm2 startup
```

---

## 🌐 Configurar Dominio y HTTPS

### 1. Instalar Nginx

```bash
sudo apt install nginx -y
```

### 2. Configurar sitio

```bash
sudo nano /etc/nginx/sites-available/lotolink
```

Contenido básico:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
    
    location / {
        root /opt/lotolink;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/lotolink /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Instalar SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

---

## 📋 Checklist Rápido de Producción

Antes de ir a producción, verifica:

- [ ] Variables de entorno configuradas (JWT_SECRET, HMAC_SECRET, etc.)
- [ ] Contraseñas fuertes en base de datos
- [ ] HTTPS configurado
- [ ] Stripe en modo LIVE
- [ ] Email configurado
- [ ] Backups automáticos configurados
- [ ] Monitoreo configurado
- [ ] Firewall configurado (solo puertos 80, 443, 22)
- [ ] DNS configurado correctamente

---

## 🔧 Comandos Útiles

### Docker

```bash
# Ver logs
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart backend

# Ver estado
docker-compose ps

# Detener todo
docker-compose down

# Backup de base de datos
docker-compose exec postgres pg_dump -U lotolink lotolink_db > backup.sql
```

### PM2

```bash
# Ver logs
pm2 logs lotolink-backend

# Reiniciar
pm2 restart lotolink-backend

# Ver estado
pm2 status

# Ver monitoreo
pm2 monit
```

---

## 🆘 Problemas Comunes

### Backend no inicia
```bash
# Ver logs
docker-compose logs backend
# Verificar variables de entorno
docker-compose exec backend env | grep DATABASE
```

### 502 Bad Gateway
```bash
# Verificar backend
curl http://localhost:3000/health
# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### Base de datos no conecta
```bash
# Verificar PostgreSQL
docker-compose ps postgres
# Probar conexión
psql -h localhost -U lotolink -d lotolink_db
```

---

## 📚 Documentación Completa

- **Guía Completa de Despliegue:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Inicio Rápido:** [QUICK_START.md](QUICK_START.md)
- **README Principal:** [README.md](README.md)
- **Guía de Seguridad:** [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md)

---

## 🎯 URLs de Producción

Después del despliegue:

- **Frontend:** https://tu-dominio.com
- **API:** https://api.tu-dominio.com
- **Panel Admin:** https://tu-dominio.com/admin-panel.html

---

**¿Necesitas ayuda?** Consulta la [guía completa de despliegue](DEPLOYMENT_GUIDE.md) o crea un issue en GitHub.
