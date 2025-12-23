# 🧪 Guía de Prueba del Panel de Administración

Esta guía te ayudará a probar todas las funcionalidades del Panel de Administración de LOTOLINK.

## ✅ Pre-requisitos

Antes de comenzar, verifica que tienes:

1. **Node.js v18+** instalado: `node --version`
2. **PostgreSQL** instalado y ejecutándose: `pg_isready`
3. **Git** para clonar el repositorio: `git --version`

## 🚀 Configuración Inicial

### Paso 1: Clonar y Preparar

```bash
# Clonar el repositorio
git clone https://github.com/Pabelcorn/LOTOLINK.git
cd LOTOLINK

# Configurar la base de datos
psql -U postgres
```

```sql
CREATE DATABASE lotolink_db;
CREATE USER lotolink WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE lotolink_db TO lotolink;
\q
```

### Paso 2: Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
```

Edita `backend/.env` con tus configuraciones:

```env
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=lotolink
DATABASE_PASSWORD=password
DATABASE_NAME=lotolink_db
```

### Paso 3: Instalar Dependencias

```bash
cd backend
npm install
cd ..
```

## 🎯 Pruebas del Sistema

### Prueba 1: Iniciar el Sistema Completo

```bash
npm start
```

**Resultado Esperado:**
- ✅ Backend inicia en http://localhost:3000
- ✅ Panel inicia en http://localhost:8080
- ✅ Se abre el navegador automáticamente
- ✅ El indicador de conexión muestra "✅ Conectado"

**Verificación:**
```bash
# En otra terminal
curl http://localhost:3000/health
```

Debe responder: `{"status":"ok","timestamp":"..."}`

### Prueba 2: Registrar una Banca

1. **Acceder al Panel:**
   - URL: http://localhost:8080/admin-panel.html
   - Debería ver el panel con 4 pestañas

2. **Ir a "Registrar Nueva Banca"**

3. **Completar el formulario:**
   - Nombre: `Banca Test 1`
   - Tipo de Integración: `api`
   - RNC: `123456789`
   - Email: `test@bancatest.com`
   - Teléfono: `809-555-1234`
   - Dirección: `Calle Principal #123`
   - Endpoint: `https://api.bancatest.com/plays`

4. **Hacer clic en "Registrar Banca"**

**Resultado Esperado:**
- ✅ Mensaje: "Banca 'Banca Test 1' registrada exitosamente"
- ✅ Formulario se limpia
- ✅ Estado de la banca: Pendiente de aprobación

**Verificación API:**
```bash
curl http://localhost:3000/admin/bancas | jq
```

### Prueba 3: Ver Solicitudes Pendientes

1. **Ir a la pestaña "Solicitudes Pendientes"**

**Resultado Esperado:**
- ✅ Lista con la banca registrada
- ✅ Botones "✅ Aprobar" y "❌ Rechazar" visibles
- ✅ Información completa de la banca

**Verificación API:**
```bash
curl http://localhost:3000/admin/bancas/pending | jq
```

### Prueba 4: Aprobar una Banca

1. **En "Solicitudes Pendientes", hacer clic en "✅ Aprobar"**
2. **Confirmar en el diálogo**

**Resultado Esperado:**
- ✅ Modal con credenciales aparece
- ✅ Credenciales generadas:
  - Client ID: `client_xxxxxxxxxxxxxxxx`
  - Client Secret: `base64_string`
  - HMAC Secret: `base64_string`
- ✅ Botón "📋 Copiar Todo" funciona
- ✅ Banca ya no aparece en pendientes

**Verificación:**
- Copiar las credenciales
- Cerrar el modal
- Ir a "Todas las Bancas"
- La banca debe aparecer con estado "active"

### Prueba 5: Ver Todas las Bancas

1. **Ir a la pestaña "Todas las Bancas"**

**Resultado Esperado:**
- ✅ Lista con todas las bancas
- ✅ Columnas: Nombre, Email, Tipo, Estado, Activa, Fecha
- ✅ Badges de estado con colores
- ✅ Botón "⏸️ Suspender" disponible para bancas activas

**Verificación API:**
```bash
curl http://localhost:3000/admin/bancas | jq
```

### Prueba 6: Suspender una Banca

1. **En "Todas las Bancas", hacer clic en "⏸️ Suspender"**
2. **Confirmar en el diálogo**

**Resultado Esperado:**
- ✅ Mensaje: "Banca suspendida"
- ✅ Estado cambia a "suspended"
- ✅ Badge cambia de color
- ✅ Botón cambia a "▶️ Activar"

### Prueba 7: Reactivar una Banca

1. **Hacer clic en "▶️ Activar"**
2. **Confirmar en el diálogo**

**Resultado Esperado:**
- ✅ Mensaje: "Banca activada"
- ✅ Estado vuelve a "active"
- ✅ Botón vuelve a "⏸️ Suspender"

### Prueba 8: Ver Estadísticas

1. **Ir a la pestaña "Estadísticas"**

**Resultado Esperado:**
- ✅ Total de bancas: 1
- ✅ Bancas pendientes: 0
- ✅ Bancas activas: 1
- ✅ Bancas suspendidas: 0

### Prueba 9: Rechazar una Banca

1. **Registrar otra banca (Banca Test 2)**
2. **Ir a "Solicitudes Pendientes"**
3. **Hacer clic en "❌ Rechazar"**
4. **Confirmar**

**Resultado Esperado:**
- ✅ Mensaje: "Banca rechazada"
- ✅ Ya no aparece en pendientes
- ✅ En "Todas las Bancas" aparece con estado "rejected"

### Prueba 10: Verificar Indicador de Conexión

1. **Detener el backend (Ctrl+C en la terminal del backend)**
2. **Esperar 5 segundos**

**Resultado Esperado:**
- ✅ Indicador cambia a "❌ Sin conexión al backend"
- ✅ Mensaje de error aparece con instrucciones

3. **Reiniciar el backend**

**Resultado Esperado:**
- ✅ Indicador vuelve a "✅ Conectado" (puede tardar hasta 30 segundos)

## 🔧 Pruebas de API Directas

Puedes probar los endpoints directamente:

```bash
# Health check
curl http://localhost:3000/health

# Crear banca
curl -X POST http://localhost:3000/admin/bancas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Banca API Test",
    "integrationType": "api",
    "authType": "hmac",
    "email": "api@test.com"
  }'

# Listar todas las bancas
curl http://localhost:3000/admin/bancas | jq

# Listar pendientes
curl http://localhost:3000/admin/bancas/pending | jq

# Obtener una banca por ID
curl http://localhost:3000/admin/bancas/{BANCA_ID} | jq

# Aprobar banca
curl -X POST http://localhost:3000/admin/bancas/{BANCA_ID}/approve \
  -H "Content-Type: application/json"

# Suspender banca
curl -X POST http://localhost:3000/admin/bancas/{BANCA_ID}/suspend

# Activar banca
curl -X POST http://localhost:3000/admin/bancas/{BANCA_ID}/activate
```

## 🐛 Solución de Problemas en Pruebas

### Error: "Cannot connect to database"

**Solución:**
```bash
# Verificar PostgreSQL
pg_isready
psql -U postgres -l | grep lotolink

# Si no existe la DB
psql -U postgres
CREATE DATABASE lotolink_db;
```

### Error: "Port 3000 already in use"

**Solución:**
```bash
# Encontrar el proceso
lsof -i :3000
# O en Windows
netstat -ano | findstr :3000

# Matar el proceso
kill -9 {PID}
# O cambiar el puerto en backend/.env
PORT=4000
```

### Error: "CORS policy blocked"

**Solución:**
Edita `backend/.env`:
```env
CORS_ORIGIN=*
```

Reinicia el backend.

### Panel no carga estilos

**Solución:**
No abras el archivo directamente. Usa:
```bash
npm run admin-panel
```

## ✅ Checklist de Pruebas Completadas

Marca cada prueba al completarla:

- [ ] Instalación y configuración inicial
- [ ] Backend inicia correctamente
- [ ] Panel se abre en el navegador
- [ ] Indicador de conexión muestra "Conectado"
- [ ] Registrar nueva banca funciona
- [ ] Ver solicitudes pendientes funciona
- [ ] Aprobar banca genera credenciales
- [ ] Copiar credenciales funciona
- [ ] Ver todas las bancas funciona
- [ ] Suspender banca funciona
- [ ] Activar banca funciona
- [ ] Ver estadísticas funciona
- [ ] Rechazar banca funciona
- [ ] Indicador de desconexión funciona
- [ ] Todos los endpoints API responden

## 📊 Resultado Final Esperado

Después de completar todas las pruebas, deberías tener:

- ✅ Backend ejecutándose sin errores
- ✅ Panel accesible y funcional
- ✅ Al menos 2 bancas registradas (1 activa, 1 rechazada)
- ✅ Todas las funcionalidades probadas
- ✅ Credenciales guardadas para una banca aprobada

## 📞 Reporte de Problemas

Si encuentras problemas:

1. Revisa los logs del backend
2. Abre DevTools del navegador (F12) y revisa la consola
3. Verifica las configuraciones en `.env`
4. Consulta la [Guía de Solución de Problemas](docs/ADMIN_PANEL_ACCESS.md#-solución-de-problemas)

---

**¡Pruebas completadas!** 🎉

Si todas las pruebas pasaron exitosamente, tu instalación de LOTOLINK está funcionando correctamente y lista para producción.
