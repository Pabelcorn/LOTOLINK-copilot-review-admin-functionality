# 🚀 INICIO RÁPIDO - Panel de Administración LOTOLINK

## Opción 1: Inicio Automático (Recomendado)

```bash
# Si es la primera vez, dale permisos de ejecución a los scripts
chmod +x scripts/*.sh

# Inicia el sistema
npm start
```

Este comando iniciará automáticamente:
- ✅ Backend en http://localhost:3000
- ✅ Panel de administración en http://localhost:8080/admin-panel.html
- ✅ Abrirá el navegador automáticamente

## Opción 2: Inicio Manual

### Paso 1: Iniciar el Backend

```bash
cd backend
npm install
npm run start:dev
```

### Paso 2: Iniciar el Panel (en otra terminal)

```bash
npm run admin-panel
```

O alternativamente:

```bash
npx http-server -p 8080 -c-1
```

### Paso 3: Abrir el Navegador

Accede a: http://localhost:8080/admin-panel.html

## Detener los Servicios

```bash
npm stop
```

O manualmente con `Ctrl+C` en cada terminal.

## ⚙️ Primera Configuración

### 1. Configurar la Base de Datos

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE lotolink_db;
CREATE USER lotolink WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE lotolink_db TO lotolink;
\q

# Configurar variables de entorno
cd backend
cp .env.example .env
# Edita .env con tus credenciales
```

### 2. Verificar que Todo Funciona

```bash
# Verificar backend
curl http://localhost:3000/health

# Verificar que puedes acceder al panel
# Abre: http://localhost:8080/admin-panel.html
```

## 📱 Usar el Panel

### Registrar una Banca

1. Ve a "Registrar Banca"
2. Completa el formulario
3. Haz clic en "Registrar Banca"
4. La banca quedará pendiente de aprobación

### Aprobar una Banca

1. Ve a "Solicitudes Pendientes"
2. Haz clic en "✅ Aprobar"
3. Guarda las credenciales generadas
4. ¡Listo!

## 🆘 Solución de Problemas

### Error: "Cannot connect to backend"

Verifica que el backend esté ejecutándose:
```bash
curl http://localhost:3000/health
```

### Error: "Database connection failed"

Verifica PostgreSQL:
```bash
pg_isready
psql -U lotolink -d lotolink_db -c "SELECT 1"
```

### Puerto ya en uso

Si el puerto 3000 o 8080 está ocupado, cámbialos:

Backend (edita `backend/.env`):
```
PORT=4000
```

Panel (usa otro puerto):
```bash
npx http-server -p 9000 -c-1
```

Y actualiza el API_BASE_URL en `admin-panel.html`.

## 📚 Documentación Completa

Para más detalles, consulta:
- [Guía Completa de Acceso](docs/ADMIN_PANEL_ACCESS.md)
- [README Principal](README.md)

## 🎯 Próximos Pasos

1. ✅ Registra tu primera banca
2. ✅ Apruébala y guarda las credenciales
3. ✅ Consulta la guía de integración: [docs/BANCA_INTEGRATION_GUIDE.md](docs/BANCA_INTEGRATION_GUIDE.md)

## 🚀 Despliegue en Producción

Una vez que hayas probado el sistema en desarrollo, consulta la **[Guía Completa de Despliegue](DEPLOYMENT_GUIDE.md)** para:

- 📦 Desplegar con Docker Compose
- 🖥️ Desplegar en VPS/servidor dedicado
- ☁️ Desplegar en servicios cloud (AWS, DigitalOcean, etc.)
- 🔒 Configurar HTTPS con certificado SSL
- 🌐 Configurar dominio personalizado
- 🛡️ Checklist completo de seguridad

**¡Feliz gestión!** 🎉
