# 🎯 Acceso al Panel de Administrador - Guía Paso a Paso

## 📖 Introducción

Esta guía te mostrará exactamente cómo acceder al Panel de Administrador de LotoLink, paso por paso, con capturas visuales y explicaciones detalladas.

---

## 🔑 Credenciales de Acceso

```
┌─────────────────────────────────────────┐
│  CREDENCIALES DEL ADMINISTRADOR         │
├─────────────────────────────────────────┤
│  Usuario:    admin                      │
│  Contraseña: Admin@LotoLink2024         │
└─────────────────────────────────────────┘
```

**⚠️ IMPORTANTE:** Estas credenciales son sensibles. No las compartas con usuarios no autorizados.

---

## 📝 Paso 1: Abrir la Aplicación

1. Navega al directorio del proyecto
2. Abre el archivo `index.html` en tu navegador
3. Verás la página principal de LotoLink

```
🌐 URL Local: file:///ruta/al/proyecto/LOTOLINK/index.html
```

**O si usas el servidor local:**
```bash
cd LOTOLINK
python3 -m http.server 8080
# Luego abre: http://localhost:8080
```

---

## 🔐 Paso 2: Abrir el Modal de Login

1. En la esquina superior derecha, busca el botón **"Entrar / Registrarse"**
2. Haz clic en el botón
3. Se abrirá un modal elegante con el formulario de inicio de sesión

**Elementos del modal:**
```
┌────────────────────────────────────┐
│   👋                               │
│   Bienvenido a LotoLink            │
│   Ingresa tus datos para continuar │
│                                    │
│   [Nombre ____________]            │
│   [Email o usuario ___]            │
│   [Teléfono __________]            │
│   [Contraseña ________]            │
│                                    │
│   [    Entrar    ]                 │
│                                    │
│   👑 Acceso para Administradores   │
│   Usuario: admin                   │
│   Contraseña: Admin@LotoLink2024   │
└────────────────────────────────────┘
```

---

## ✏️ Paso 3: Ingresar Credenciales de Administrador

Completa el formulario con los siguientes datos:

### Campo por Campo:

1. **Nombre:**
   - Escribe: `Administrador` (o cualquier nombre que prefieras)
   - Este será el nombre que se mostrará en el panel

2. **Email o usuario:**
   - Escribe: `admin` (sin comillas)
   - También puedes usar: `administrador`
   - ⚠️ Es sensible a mayúsculas/minúsculas en la contraseña, no en el usuario

3. **Teléfono:**
   - Escribe: cualquier número (ej: `8091234567`)
   - Este campo es requerido pero puede ser cualquier valor

4. **Contraseña:**
   - Escribe: `Admin@LotoLink2024` (exactamente así, con mayúsculas y minúsculas)
   - ⚠️ **MUY IMPORTANTE:** Respeta las mayúsculas y minúsculas
   - Debe ser: `Admin@LotoLink2024` (no `admin@lotolink2024`)

### Ejemplo de Llenado:
```
Nombre:      Administrador
Usuario:     admin
Teléfono:    8091234567
Contraseña:  Admin@LotoLink2024
```

---

## 🎉 Paso 4: Confirmar el Login

1. Haz clic en el botón **"Entrar"**
2. El sistema verificará las credenciales
3. Si son correctas, verás un mensaje de confirmación:

```
┌─────────────────────────────────────┐
│  ✅ Bienvenido, Administrador!      │
│                                     │
│  Ahora puedes acceder al Panel de  │
│  Administración desde tu perfil.   │
└─────────────────────────────────────┘
```

4. El modal se cerrará automáticamente
5. Estarás autenticado como administrador

---

## 👤 Paso 5: Acceder a tu Perfil

Después de iniciar sesión:

1. En la barra de navegación superior, busca el ícono de usuario
2. Haz clic en **"Mi Perfil"** o el ícono de usuario
3. Se abrirá tu página de perfil

**Navegación en Desktop:**
```
[Logo] LotoLink    [Inicio] [Loterías] [Bancas] [Perfil 👤]
                                                    ↑
                                               Haz clic aquí
```

**Navegación en Mobile:**
```
Barra inferior:
[🏠 Inicio] [🎰 Loterías] [🎟️ Jugar] [🏪 Bancas] [👤 Perfil]
                                                      ↑
                                                Haz clic aquí
```

---

## ⚙️ Paso 6: Localizar el Botón del Panel Admin

En la página de perfil, verás varias pestañas:

### Para Usuarios Normales (NO verás):
```
[📊 Resumen] [💼 Mi Cartera] [💳 Mis Tarjetas] 
[📜 Historial] [💰 Cobrar] [🏦 Retirar]
```

### Para Administradores (SÍ verás):
```
[📊 Resumen] [💼 Mi Cartera] [💳 Mis Tarjetas] 
[📜 Historial] [💰 Cobrar] [🏦 Retirar] [⚙️ Panel Admin]
                                              ↑
                                         BOTÓN MORADO
```

**Características del Botón:**
- 🎨 **Color:** Morado/Púrpura (gradiente)
- 📍 **Posición:** Al final de las pestañas
- 🏷️ **Texto:** "⚙️ Panel Admin"
- ✨ **Efecto:** Efecto hover con sombra

---

## 🚀 Paso 7: Abrir el Panel de Administración

1. Haz clic en el botón morado **"⚙️ Panel Admin"**
2. Se abrirá una **nueva pestaña** del navegador
3. El panel verificará automáticamente tu autenticación
4. Si todo está correcto, verás el Panel de Administración

**¿Qué verás en el panel?**
```
┌────────────────────────────────────────────────────────┐
│  🏦 Panel de Administración de Bancas                  │
│  Gestiona y aprueba el registro de bancas en LotoLink │
│                                                        │
│  👑 Administrador                    [🚪 Cerrar Sesión]│
│  [Tu Nombre]                                           │
│                                                        │
│  [📝 Registrar Nueva Banca] [⏳ Solicitudes Pendientes]│
│  [📋 Todas las Bancas] [📊 Estadísticas]              │
└────────────────────────────────────────────────────────┘
```

---

## 📊 Paso 8: Usar el Panel de Administración

### Pestañas Disponibles:

#### 1️⃣ Registrar Nueva Banca
- Formulario completo para agregar nuevas bancas
- Campos: Nombre, Tipo de Integración, RNC, Dirección, Teléfono, Email, Endpoint
- Genera automáticamente credenciales (Client ID, Client Secret, HMAC Secret)

#### 2️⃣ Solicitudes Pendientes
- Lista de bancas esperando aprobación
- Botones de acción:
  - ✅ Aprobar: Genera credenciales y activa la banca
  - ❌ Rechazar: Rechaza la solicitud

#### 3️⃣ Todas las Bancas
- Visualización completa de todas las bancas
- Estados posibles: Pendiente, Activa, Suspendida, Rechazada
- Acciones:
  - ⏸️ Suspender: Desactiva temporalmente una banca
  - ▶️ Activar: Reactiva una banca suspendida

#### 4️⃣ Estadísticas
- **Total de Bancas:** Cantidad total registradas
- **Pendientes:** Bancas esperando aprobación
- **Activas:** Bancas operativas
- **Suspendidas:** Bancas temporalmente desactivadas

---

## 🔒 Paso 9: Cerrar Sesión (Cuando Termines)

Cuando termines de usar el panel:

1. Busca el botón **"🚪 Cerrar Sesión"** en la esquina superior derecha
2. Haz clic en el botón
3. Confirma que deseas cerrar sesión
4. Serás redirigido a la página principal

**Nota sobre la sesión:**
- Las sesiones duran **24 horas**
- Después de 24 horas, deberás volver a iniciar sesión
- La sesión se renueva automáticamente cuando usas el panel

---

## ❓ Preguntas Frecuentes (FAQ)

### 1. ¿Por qué no veo el botón "Panel Admin"?

**Posibles causas:**
- No has iniciado sesión como administrador
- Usaste credenciales incorrectas
- La contraseña no respeta mayúsculas/minúsculas

**Solución:**
1. Cierra sesión
2. Vuelve a iniciar sesión con: `admin` / `Admin@LotoLink2024`
3. Recarga la página si es necesario

### 2. ¿El panel me redirige a la página principal?

**Causa:** Tu sesión no está autenticada o expiró

**Solución:**
1. Inicia sesión nuevamente con las credenciales de administrador
2. Asegúrate de copiar la contraseña exactamente: `Admin@LotoLink2024`

### 3. ¿Puedo cambiar las credenciales?

**Sí, pero requiere editar el código:**

1. Abre `index.html` en un editor de texto
2. Busca estas líneas (alrededor de la línea 5558):
```javascript
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin@LotoLink2024';
```
3. Cambia los valores a tus credenciales preferidas
4. Guarda el archivo

### 4. ¿Cuánto dura la sesión?

- **Duración:** 24 horas desde el último acceso
- **Renovación:** Automática cada vez que usas el panel
- **Expiración:** Después de 24 horas de inactividad

### 5. ¿Los usuarios normales pueden ver el panel?

**No.** El botón "Panel Admin" solo aparece si:
- El usuario tiene `isAdmin: true`
- La autenticación admin está activa
- La sesión es válida

---

## 🔧 Solución de Problemas

### Problema: "No puedo iniciar sesión"

**Verificaciones:**
1. ✅ ¿Usaste `admin` como usuario?
2. ✅ ¿La contraseña es exactamente `Admin@LotoLink2024`?
3. ✅ ¿Respetaste mayúsculas y minúsculas?
4. ✅ ¿Completaste todos los campos?

### Problema: "El panel no carga"

**Verificaciones:**
1. ✅ ¿JavaScript está habilitado en tu navegador?
2. ✅ ¿Estás usando un navegador moderno? (Chrome, Firefox, Edge)
3. ✅ ¿La consola del navegador muestra errores?

**Cómo abrir la consola:**
- Chrome/Edge: `F12` o `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
- Firefox: `F12` o `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

### Problema: "Sesión expirada"

**Solución:**
1. Cierra todas las pestañas de LotoLink
2. Abre `index.html` nuevamente
3. Inicia sesión con las credenciales de administrador
4. Vuelve a abrir el panel

---

## 🛡️ Mejores Prácticas de Seguridad

### Para Desarrollo:
✅ Las credenciales actuales son aceptables

### Para Producción:
⚠️ **CAMBIAR INMEDIATAMENTE:**

1. **Cambiar contraseña:**
   - Usa una contraseña fuerte y única
   - Mínimo 12 caracteres
   - Incluye: mayúsculas, minúsculas, números, símbolos

2. **Implementar autenticación real:**
   - Base de datos de usuarios
   - Hash de contraseñas (bcrypt, argon2)
   - Tokens de sesión seguros (JWT)
   - Autenticación de dos factores (2FA)

3. **Proteger el endpoint:**
   - Backend con autenticación
   - HTTPS obligatorio
   - Rate limiting
   - Logs de acceso

---

## 📞 Soporte Técnico

Si después de seguir esta guía aún tienes problemas:

1. **Revisa los logs del navegador:**
   ```
   F12 → Consola → Busca errores en rojo
   ```

2. **Limpia caché y cookies:**
   ```
   Chrome: Ctrl+Shift+Delete
   Firefox: Ctrl+Shift+Delete
   Edge: Ctrl+Shift+Delete
   ```

3. **Prueba en modo incógnito:**
   ```
   Chrome: Ctrl+Shift+N
   Firefox: Ctrl+Shift+P
   Edge: Ctrl+Shift+N
   ```

4. **Verifica localStorage:**
   ```javascript
   // En la consola del navegador:
   console.log(localStorage.getItem('ll_user'));
   console.log(localStorage.getItem('ll_admin_auth'));
   ```

---

## ✨ Resumen Rápido

Para acceso rápido, aquí está el proceso resumido:

```
1. Abre index.html
   ↓
2. Clic en "Entrar"
   ↓
3. Usuario: admin
   Contraseña: Admin@LotoLink2024
   ↓
4. Clic en "Entrar"
   ↓
5. Ve a "Mi Perfil"
   ↓
6. Clic en "⚙️ Panel Admin"
   ↓
7. ¡Listo! Ya estás en el panel
```

---

**🎯 Objetivo Completado:** Ya sabes cómo acceder al Panel de Administrador de LotoLink

**📚 Documentos Relacionados:**
- [GUIA_ACCESO_ADMIN.md](GUIA_ACCESO_ADMIN.md) - Guía técnica detallada
- [README.md](README.md) - Documentación general del proyecto

**📅 Última Actualización:** Diciembre 2024  
**👨‍💻 Versión:** LotoLink v1.0
