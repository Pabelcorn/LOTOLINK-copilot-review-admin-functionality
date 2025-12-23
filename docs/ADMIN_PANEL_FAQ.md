# ❓ Preguntas Frecuentes - Panel de Administración LOTOLINK

## 🎯 General

### ¿Qué es el Panel de Administración?

El Panel de Administración es una interfaz web que permite gestionar las bancas en LOTOLINK de forma visual y sencilla. Puedes registrar bancas, aprobar solicitudes, generar credenciales y gestionar estados, todo desde el navegador.

### ¿Necesito instalar algo especial?

Solo necesitas:
- Node.js (v18 o superior)
- PostgreSQL (para la base de datos)
- Un navegador web moderno

### ¿Es gratis?

Sí, es completamente gratuito y de código abierto.

---

## 🚀 Acceso y Configuración

### ¿Cómo accedo al panel?

```bash
npm start
```

Esto abrirá automáticamente el panel en: http://localhost:8080/admin-panel.html

### ¿Puedo cambiar el puerto?

Sí. Usa:

```bash
npx http-server -p 9000 -c-1
```

Y accede a: http://localhost:9000/admin-panel.html

### ¿Cómo cambio la URL del backend?

Edita `admin-panel.html` línea 643:

```javascript
const API_BASE_URL = 'http://tu-servidor:puerto/admin/bancas';
```

### ¿Por qué dice "Sin conexión al backend"?

El backend no está ejecutándose. Inícialo con:

```bash
cd backend
npm run start:dev
```

O verifica que esté en el puerto correcto (3000 por defecto).

---

## 📝 Registro de Bancas

### ¿Qué información necesito para registrar una banca?

**Obligatorio:**
- Nombre de la banca
- Tipo de integración (API, White Label, Middleware)
- Email de contacto

**Opcional:**
- RNC (Número de registro)
- Teléfono
- Dirección
- Endpoint del API

### ¿Qué pasa después de registrar una banca?

La banca queda en estado **"Pendiente"** esperando aprobación. Debes ir a "Solicitudes Pendientes" y aprobarla manualmente.

### ¿Puedo editar una banca después de registrarla?

Actualmente no desde el panel, pero puedes hacerlo vía API:

```bash
curl -X PUT http://localhost:3000/admin/bancas/{BANCA_ID} \
  -H "Content-Type: application/json" \
  -d '{"phone": "nuevo-telefono"}'
```

---

## ✅ Aprobación de Bancas

### ¿Qué hace el botón "Aprobar"?

Al aprobar una banca:
1. Se generan credenciales automáticamente (Client ID, Client Secret, HMAC Secret)
2. La banca pasa a estado "Aprobado"
3. Se activa automáticamente
4. Recibes las credenciales en un modal

### ¿Puedo ver las credenciales después?

**No**. Las credenciales solo se muestran UNA VEZ al aprobar. Debes:
- Copiarlas inmediatamente
- Guardarlas en un lugar seguro
- Enviarlas a la banca por correo cifrado o canal seguro

Si pierdes las credenciales, deberás regenerarlas manualmente en la base de datos.

### ¿Qué pasa si rechazo una banca?

La banca pasa a estado "Rechazado" y se desactiva automáticamente. No podrá usarse.

### ¿Puedo "des-rechazar" una banca?

Sí, pero requiere actualización manual vía API o base de datos.

---

## 🛡️ Gestión de Estados

### ¿Cuáles son los estados posibles?

- **Pending**: Recién registrada, esperando aprobación
- **Approved**: Aprobada pero no activa aún
- **Active**: Funcionando normalmente
- **Suspended**: Temporalmente deshabilitada
- **Rejected**: Rechazada permanentemente

### ¿Qué hace "Suspender"?

Desactiva la banca temporalmente. Puedes reactivarla después. Útil para:
- Mantenimiento
- Investigación de problemas
- Penalizaciones temporales

### ¿Cuál es la diferencia entre Suspender y Desactivar?

- **Suspender**: Cambia el estado a "suspended" y desactiva
- **Desactivar**: Solo marca como inactiva, pero mantiene el estado

En el panel, ambos tienen el mismo efecto práctico.

---

## 🔐 Credenciales y Seguridad

### ¿Para qué sirven las credenciales?

Las bancas usan estas credenciales para:
- **Client ID**: Identificarse en el sistema
- **Client Secret**: Autenticarse (como contraseña)
- **HMAC Secret**: Firmar peticiones (seguridad)

### ¿Son seguras las credenciales?

Sí, pero debes:
- Transmitirlas por canal seguro (email cifrado, no WhatsApp)
- No compartirlas públicamente
- Almacenarlas cifradas en tu lado
- La banca debe almacenarlas como variables de entorno

### ¿Puedo regenerar credenciales?

No desde el panel actualmente. Debes hacerlo vía base de datos o API.

### ¿Cómo envío las credenciales a la banca?

**Recomendado:**
1. Copiar credenciales del modal
2. Enviar por email cifrado o plataforma segura
3. Incluir documentación de integración
4. Solicitar confirmación de recepción

**No recomendado:**
- WhatsApp o SMS (no cifrado)
- Captura de pantalla
- Copiar-pegar en chat público

---

## 📊 Estadísticas

### ¿Cada cuánto se actualizan las estadísticas?

Se actualizan en tiempo real cada vez que cambias de pestaña o recargas la página.

### ¿Puedo exportar las estadísticas?

Actualmente no desde el panel. Puedes obtenerlas vía API:

```bash
curl http://localhost:3000/admin/bancas | jq
```

---

## 🔧 Problemas Técnicos

### El panel está en blanco

**Causa**: Archivo abierto directamente desde el explorador.

**Solución**: Usa un servidor HTTP:
```bash
npm run admin-panel
```

### Error: "Cannot connect to backend"

**Causa**: Backend no está ejecutándose.

**Solución**:
```bash
cd backend
npm run start:dev
```

### Error: "Database connection failed"

**Causa**: PostgreSQL no está ejecutándose o credenciales incorrectas.

**Solución**:
```bash
# Verificar PostgreSQL
pg_isready

# Revisar credenciales en backend/.env
DATABASE_USERNAME=lotolink
DATABASE_PASSWORD=tu_password
DATABASE_NAME=lotolink_db
```

### Error CORS

**Causa**: Navegador bloquea peticiones por política CORS.

**Solución**: Edita `backend/.env`:
```env
CORS_ORIGIN=*
```

Reinicia el backend.

### El indicador de conexión no se actualiza

**Causa**: Verificación periódica cada 30 segundos.

**Solución**: Espera o recarga la página (F5).

---

## 🌐 Despliegue en Producción

### ¿Puedo usar esto en producción?

El backend sí está listo para producción. El panel necesita:
- ✅ Servidor web (Nginx, Apache)
- ⚠️ **Autenticación** (actualmente no tiene)
- ✅ HTTPS obligatorio
- ✅ Configurar CORS apropiadamente

### ¿Cómo agrego autenticación?

Necesitas implementar:
1. Sistema de login (JWT, OAuth)
2. Guard en el backend para rutas `/admin/*`
3. Interfaz de login en el frontend
4. Manejo de tokens

Recomendamos usar NestJS JWT Guard (ya incluido en el proyecto).

### ¿Puedo hostear el panel en Vercel/Netlify?

Sí, simplemente sube `admin-panel.html` y configura la URL del backend:

```javascript
const API_BASE_URL = 'https://api.tu-dominio.com/admin/bancas';
```

### ¿Necesito base de datos separada para el panel?

No. El panel usa la misma base de datos del backend a través de la API REST.

---

## 🎨 Personalización

### ¿Puedo cambiar los colores?

Sí. Edita el CSS en `admin-panel.html`. Los colores principales están definidos al inicio:

```css
.header h1 {
    color: #667eea; /* Cambia este color */
}

.btn-primary {
    background: #667eea; /* Y este */
}
```

### ¿Puedo agregar más campos al formulario?

Sí, pero deberás:
1. Editar el HTML del formulario
2. Actualizar el JavaScript para capturar los nuevos campos
3. Actualizar el DTO en el backend si es necesario

### ¿Puedo agregar mi logo?

Sí. Agrega tu imagen y edita el header:

```html
<div class="header">
    <img src="tu-logo.png" alt="Logo" style="height: 40px;">
    <h1>Tu Empresa - Panel Admin</h1>
</div>
```

---

## 📱 Compatibilidad

### ¿Funciona en móvil?

Sí, el panel es responsive y funciona en tablets y móviles, aunque la experiencia es mejor en desktop.

### ¿Qué navegadores soporta?

- ✅ Chrome/Edge (últimas 2 versiones)
- ✅ Firefox (últimas 2 versiones)
- ✅ Safari (últimas 2 versiones)
- ⚠️ Internet Explorer: No soportado

---

## 🆘 Soporte

### ¿Dónde reporto problemas?

1. Revisa esta FAQ
2. Consulta [Guía de Solución de Problemas](ADMIN_PANEL_ACCESS.md#-solución-de-problemas)
3. Revisa los logs: `tail -f backend.log`
4. Abre un issue en GitHub

### ¿Hay una comunidad?

Consulta el repositorio en GitHub para discusiones y issues.

### ¿Puedo contribuir?

¡Sí! El proyecto es open source. Pull requests son bienvenidos.

---

## 📚 Recursos Adicionales

- [Guía de Inicio Rápido](../QUICK_START.md)
- [Guía Completa de Acceso](ADMIN_PANEL_ACCESS.md)
- [Guía de Pruebas](ADMIN_PANEL_TESTING.md)
- [Documentación de Integración de Bancas](BANCA_INTEGRATION_GUIDE.md)
- [README Principal](../README.md)

---

**¿No encontraste tu pregunta?** Abre un issue en GitHub o consulta la documentación completa.
