# 👑 Guía de Acceso al Panel de Administrador - LotoLink

## 🎯 Resumen Rápido

Para acceder al Panel de Administrador de LotoLink, necesitas iniciar sesión con credenciales especiales de administrador.

### 🔑 Credenciales de Administrador

```
Usuario:    admin
Contraseña: Admin@LotoLink2024
```

---

## 📋 Pasos para Acceder al Panel

### Paso 1: Abrir la Aplicación Principal
1. Abre `index.html` en tu navegador
2. Haz clic en el botón **"Entrar / Registrarse"** en la esquina superior derecha

### Paso 2: Iniciar Sesión como Administrador
1. En el modal de inicio de sesión, completa los campos:
   - **Nombre:** Cualquier nombre (ej: "Administrador", "Admin", etc.)
   - **Email o usuario:** `admin` o `administrador`
   - **Teléfono:** Cualquier número (ej: 8091234567)
   - **Contraseña:** `Admin@LotoLink2024`

2. Haz clic en **"Entrar"**

3. Verás un mensaje de confirmación: "✅ Bienvenido, Administrador!"

### Paso 3: Acceder al Panel de Administración
1. Una vez iniciada la sesión, ve a tu perfil haciendo clic en el ícono de usuario o en "Mi Perfil"
2. En las pestañas del perfil, verás un botón morado especial: **"⚙️ Panel Admin"**
3. Haz clic en este botón para abrir el Panel de Administración en una nueva pestaña

---

## 🎨 Características del Panel de Administrador

### ✅ Funcionalidades Disponibles

1. **📝 Registrar Nueva Banca**
   - Formulario completo para registrar bancas
   - Validación de datos
   - Generación automática de credenciales

2. **⏳ Solicitudes Pendientes**
   - Ver todas las bancas pendientes de aprobación
   - Aprobar o rechazar solicitudes
   - Visualización de información completa

3. **📋 Todas las Bancas**
   - Lista completa de bancas registradas
   - Filtrar por estado
   - Suspender o activar bancas

4. **📊 Estadísticas**
   - Total de bancas
   - Bancas pendientes
   - Bancas activas
   - Bancas suspendidas

### 🔐 Seguridad

- **Sesión Protegida:** La sesión de administrador dura 24 horas
- **Verificación Automática:** El panel verifica automáticamente las credenciales al abrirse
- **Redirección Segura:** Si no estás autenticado, serás redirigido a la página principal

---

## 🔧 Solución de Problemas

### ❌ No puedo ver el botón "Panel Admin"

**Solución:** Asegúrate de que:
1. Has iniciado sesión correctamente con las credenciales de administrador
2. Has usado el usuario `admin` y la contraseña correcta
3. Has recargado la página después de iniciar sesión

### ❌ El panel me redirige a la página principal

**Solución:** 
1. Cierra sesión completamente
2. Vuelve a iniciar sesión con las credenciales de administrador
3. Asegúrate de usar exactamente:
   - Usuario: `admin`
   - Contraseña: `Admin@LotoLink2024` (respeta mayúsculas y minúsculas)

### ❌ La sesión expiró

**Solución:**
- Las sesiones de administrador duran 24 horas
- Si ha pasado más tiempo, simplemente vuelve a iniciar sesión con las credenciales de administrador

---

## 💡 Consejos de Uso

### Para Usuarios Normales
- Los usuarios normales NO verán el botón "Panel Admin"
- Solo pueden ver: Resumen, Cartera, Tarjetas, Historial, Cobrar, Retirar

### Para Administradores
- El botón "⚙️ Panel Admin" aparece en color morado
- Se encuentra junto a las otras pestañas del perfil
- Al hacer clic, se abre en una nueva pestaña del navegador

### Mejor Experiencia
- Usa Chrome, Firefox o Edge para mejor compatibilidad
- Mantén tu sesión abierta mientras trabajas
- Cierra sesión cuando termines de usar el panel

---

## 📞 Soporte

Si tienes problemas para acceder al panel de administrador:

1. Verifica que estés usando las credenciales correctas
2. Limpia la caché y cookies del navegador
3. Intenta en modo incógnito/privado
4. Verifica que JavaScript esté habilitado

---

## 🔒 Información de Seguridad

**⚠️ IMPORTANTE:**

1. **NO compartas las credenciales de administrador** con usuarios no autorizados
2. **Cambia la contraseña** en el código fuente para producción
3. **Las credenciales actuales son para desarrollo/demostración**
4. **En producción**, implementa un sistema de autenticación más robusto

### Cambiar la Contraseña de Administrador

Para cambiar la contraseña en el código:

1. Abre `index.html`
2. Busca la línea que dice: `const ADMIN_PASSWORD = 'Admin@LotoLink2024';`
3. Cambia el valor a tu contraseña deseada
4. Guarda el archivo

```javascript
// Ejemplo de cambio de contraseña
const ADMIN_PASSWORD = 'TuNuevaContraseñaSegura123!';
```

---

## ✨ Resumen Visual

```
┌─────────────────────────────────────────┐
│   1. Abre index.html                    │
│   2. Haz clic en "Entrar"               │
│   3. Ingresa credenciales de admin      │
│      - Usuario: admin                   │
│      - Contraseña: Admin@LotoLink2024   │
│   4. Ve a "Mi Perfil"                   │
│   5. Haz clic en "⚙️ Panel Admin"       │
│   6. ¡Listo! Acceso completo al panel   │
└─────────────────────────────────────────┘
```

---

**Creado para:** LotoLink v1.0  
**Fecha:** Diciembre 2024  
**Actualizado:** [Fecha actual]
