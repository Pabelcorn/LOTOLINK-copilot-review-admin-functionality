# 🎯 Guía de Acceso al Panel de Administración de LOTOLINK

## 📋 Descripción General

El Panel de Administración de LOTOLINK es una interfaz web que te permite:

- ✅ **Registrar nuevas bancas** con toda su información
- 📊 **Visualizar todas las bancas** registradas en el sistema
- ⚡ **Aprobar o rechazar** solicitudes de registro pendientes
- 🔐 **Generar credenciales** automáticamente (Client ID, Client Secret, HMAC Secret)
- 🛡️ **Gestionar estados** de las bancas (activar, suspender, etc.)
- 📈 **Ver estadísticas** en tiempo real

## 🚀 Acceso Rápido - 3 Pasos

### Paso 1: Iniciar el Backend

Primero, debes tener el backend ejecutándose:

```bash
cd backend
npm install
npm run start:dev
```

El backend se ejecutará en: **http://localhost:3000**

### Paso 2: Iniciar el Servidor del Panel

En otra terminal, ejecuta:

```bash
npm run admin-panel
```

O manualmente:

```bash
cd /home/runner/work/LOTOLINK/LOTOLINK
npx http-server -p 8080 -c-1
```

### Paso 3: Abrir el Panel en el Navegador

Abre tu navegador web y accede a:

```
http://localhost:8080/admin-panel.html
```

¡Listo! Ya puedes usar el panel de administración.

---

## 🔧 Configuración Detallada

### Requisitos Previos

1. **Node.js** (v18 o superior)
2. **PostgreSQL** (para la base de datos)
3. Navegador web moderno (Chrome, Firefox, Safari, Edge)

### Configurar la Base de Datos

1. Crea la base de datos PostgreSQL:

```bash
psql -U postgres
CREATE DATABASE lotolink_db;
CREATE USER lotolink WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE lotolink_db TO lotolink;
\q
```

2. Copia el archivo de configuración:

```bash
cd backend
cp .env.example .env
```

3. Edita el archivo `.env` con tus credenciales:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=lotolink
DATABASE_PASSWORD=password
DATABASE_NAME=lotolink_db
```

### Iniciar el Backend (Desarrollo)

```bash
cd backend
npm install
npm run start:dev
```

Verás este mensaje cuando esté listo:
```
🚀 Lotolink API is running on http://localhost:3000
📚 Health check: http://localhost:3000/health
```

### Verificar que el Backend Funciona

```bash
curl http://localhost:3000/health
```

Deberías ver: `{"status":"ok","timestamp":"..."}`

---

## 📱 Usando el Panel de Administración

### 1. Registrar una Nueva Banca

1. Ve a la pestaña **"Registrar Banca"**
2. Completa el formulario:
   - **Nombre**: Nombre de la banca
   - **Tipo de Integración**: API, White Label, o Middleware
   - **RNC**: Número de registro (opcional)
   - **Email**: Email de contacto (requerido)
   - **Teléfono**: Número de teléfono (opcional)
   - **Dirección**: Dirección física (opcional)
   - **Endpoint**: URL del API de la banca (opcional)
3. Haz clic en **"Registrar Banca"**
4. La banca quedará en estado **"Pendiente"**

### 2. Aprobar Solicitudes Pendientes

1. Ve a la pestaña **"Solicitudes Pendientes"**
2. Verás una lista de todas las bancas pendientes de aprobación
3. Para aprobar:
   - Haz clic en **"✅ Aprobar"**
   - Se generarán automáticamente las credenciales
   - Aparecerá un modal con las credenciales (¡Cópialas!)
4. Para rechazar:
   - Haz clic en **"❌ Rechazar"**
   - La banca será marcada como rechazada

### 3. Gestionar Todas las Bancas

1. Ve a la pestaña **"Todas las Bancas"**
2. Verás una lista completa con todos los estados
3. Puedes:
   - **Suspender** bancas activas (⏸️)
   - **Activar** bancas suspendidas (▶️)
   - Ver el estado y fecha de creación

### 4. Ver Estadísticas

1. Ve a la pestaña **"Estadísticas"**
2. Verás:
   - Total de bancas
   - Bancas pendientes
   - Bancas activas
   - Bancas suspendidas

---

## 🔌 Endpoints del API (Para Integración)

El panel se conecta automáticamente a estos endpoints:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/admin/bancas` | Registrar nueva banca |
| GET | `/admin/bancas` | Listar todas las bancas |
| GET | `/admin/bancas/pending` | Listar bancas pendientes |
| GET | `/admin/bancas/:id` | Obtener detalles de una banca |
| PUT | `/admin/bancas/:id` | Actualizar información de banca |
| POST | `/admin/bancas/:id/approve` | Aprobar banca y generar credenciales |
| POST | `/admin/bancas/:id/reject` | Rechazar banca |
| POST | `/admin/bancas/:id/suspend` | Suspender banca |
| POST | `/admin/bancas/:id/activate` | Activar banca |

---

## 🛠️ Solución de Problemas

### El panel no carga o muestra "Error de conexión"

**Causa**: El backend no está ejecutándose o está en otro puerto.

**Solución**:
1. Verifica que el backend esté corriendo: `curl http://localhost:3000/health`
2. Si el backend está en otro puerto, edita `admin-panel.html` y cambia:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/admin/bancas';
   ```

### Error: "Cannot connect to database"

**Causa**: PostgreSQL no está ejecutándose o las credenciales son incorrectas.

**Solución**:
1. Verifica que PostgreSQL esté corriendo: `pg_isready`
2. Revisa las credenciales en `backend/.env`
3. Asegúrate de que la base de datos existe: `psql -U postgres -l`

### Error CORS al hacer peticiones

**Causa**: El navegador bloquea peticiones por políticas CORS.

**Solución**:
1. Verifica que en `backend/.env` tengas: `CORS_ORIGIN=*`
2. O específicamente: `CORS_ORIGIN=http://localhost:8080`
3. Reinicia el backend después de cambiar `.env`

### El panel se ve sin estilos

**Causa**: No estás usando un servidor HTTP.

**Solución**:
- No abras `admin-panel.html` directamente desde el explorador de archivos
- Usa el comando: `npm run admin-panel` o `npx http-server`

---

## 🎨 Personalización

### Cambiar el Puerto del Panel

```bash
npx http-server -p 9000 -c-1
```

Luego accede a: `http://localhost:9000/admin-panel.html`

### Cambiar el Puerto del Backend

1. Edita `backend/.env`:
   ```env
   PORT=4000
   ```

2. Edita `admin-panel.html` línea 608:
   ```javascript
   const API_BASE_URL = 'http://localhost:4000/admin/bancas';
   ```

---

## 📦 Despliegue en Producción

### Opción 1: Usando Nginx

```nginx
server {
    listen 80;
    server_name admin.lotolink.com;

    location / {
        root /var/www/lotolink;
        try_files $uri $uri/ /admin-panel.html;
    }
}
```

### Opción 2: Usando Apache

```apache
<VirtualHost *:80>
    ServerName admin.lotolink.com
    DocumentRoot /var/www/lotolink
    
    <Directory /var/www/lotolink>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Opción 3: Usando Vercel/Netlify

Simplemente sube el archivo `admin-panel.html` y configura la variable de entorno:

```javascript
const API_BASE_URL = 'https://api.lotolink.com/admin/bancas';
```

---

## 🔐 Seguridad en Producción

⚠️ **IMPORTANTE**: El panel actual no tiene autenticación. Para producción, debes:

1. **Agregar autenticación** (JWT, OAuth, etc.)
2. **Usar HTTPS** obligatoriamente
3. **Restringir acceso** por IP o VPN
4. **Implementar rate limiting**
5. **Auditar acciones** de administradores

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa los logs del backend: Están en la consola donde ejecutas `npm run start:dev`
2. Abre las DevTools del navegador (F12) y revisa la consola
3. Verifica el estado de los servicios: `docker-compose ps` (si usas Docker)

---

## 🎯 Próximos Pasos

1. ✅ Accede al panel y registra tu primera banca
2. ✅ Aprueba la banca y guarda las credenciales
3. ✅ Prueba la integración con la banca usando las credenciales
4. ✅ Revisa la documentación de integración en `docs/BANCA_INTEGRATION_GUIDE.md`

**¡Feliz administración!** 🚀
