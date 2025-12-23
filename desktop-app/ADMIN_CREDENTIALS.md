# 🔐 Credenciales de Acceso al Panel de Administración

## Acceso al Panel Admin

### Desde la Aplicación Desktop

1. **Inicia sesión** con una cuenta de administrador:
   - Email que contenga `admin@` o `administrador@`
   - Ejemplo: `admin@lotolink.com`

2. **Ve al Perfil** (haz clic en el icono 👤 en la barra de navegación)

3. **Haz clic en el botón "⚙️ Panel Admin"** (color morado)

4. **Ingresa las credenciales de administrador** en el modal que aparece

### Credenciales Predeterminadas

```
Usuario: admin
Contraseña: lotolink2024
```

## ⚠️ IMPORTANTE - Seguridad

### Para Desarrollo/Demo
Las credenciales actuales son suficientes para pruebas y desarrollo local.

### Para Producción
**DEBES** cambiar estas credenciales antes de desplegar en producción:

1. **Cambia las credenciales** en el archivo `index.html`:
   - Busca `ADMIN_CREDENTIALS` (línea aproximadamente 6520)
   - Modifica el objeto con nuevas credenciales:
   ```javascript
   const ADMIN_CREDENTIALS = {
     username: 'tu_nuevo_usuario',
     password: 'tu_nueva_contraseña_segura'
   };
   ```

2. **Implementa autenticación robusta**:
   - Conecta con tu backend de autenticación
   - Usa JWT/OAuth para verificar permisos
   - Almacena credenciales de forma segura (hash bcrypt en BD)
   - Implementa rate limiting para prevenir ataques de fuerza bruta
   - Agrega autenticación de dos factores (2FA)

3. **Otras medidas de seguridad**:
   - HTTPS obligatorio en producción
   - Logs de auditoría para accesos al panel
   - IP whitelisting si es posible
   - Sesiones con timeout automático

## Cómo Funciona

### Flujo de Autenticación

1. Usuario hace clic en "Panel Admin" en el perfil
2. Se muestra modal de login con campos:
   - Usuario
   - Contraseña
3. Se validan las credenciales contra `ADMIN_CREDENTIALS`
4. Si son correctas: se abre el panel admin en nueva pestaña
5. Si son incorrectas: se muestra mensaje de error

### Código de Validación

El código de validación se encuentra en `index.html` aproximadamente en la línea 6520:

```javascript
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'lotolink2024'
};

if(username === ADMIN_CREDENTIALS.username && 
   password === ADMIN_CREDENTIALS.password) {
  // Acceso concedido
  window.open('admin-panel.html', '_blank');
} else {
  // Acceso denegado
  alert('❌ Credenciales incorrectas');
}
```

## Preguntas Frecuentes

### ¿Por qué no veo el botón "Panel Admin"?

El botón solo es visible para usuarios administradores. Tu cuenta debe:
- Tener `isAdmin: true` en el objeto de usuario
- O tener un email que contenga `admin@` o `administrador@`

### ¿Puedo agregar más usuarios administradores?

Sí. Hay dos formas:

1. **Forma Simple (Solo email)**:
   - Registra usuarios con email tipo `admin@lotolink.com`
   - Verán el botón automáticamente

2. **Forma Robusta (Recomendada para producción)**:
   - Implementa roles en tu backend
   - Verifica roles con JWT al hacer login
   - Actualiza el flag `isAdmin` basado en la respuesta del backend

### ¿Las credenciales son seguras?

**En desarrollo**: Sí, son suficientes para pruebas locales.

**En producción**: NO. Debes:
- Cambiar las credenciales predeterminadas
- Implementar hash de contraseñas
- Usar autenticación del backend
- Implementar medidas de seguridad adicionales

### ¿Puedo tener múltiples credenciales admin?

En la versión actual, solo hay un par de credenciales hardcoded. 

Para múltiples administradores:
1. Conecta con un backend que gestione usuarios admin
2. Valida contra una base de datos de usuarios
3. Implementa roles y permisos

### ¿Qué pasa si olvido las credenciales?

1. **Desarrollo**: Revisa este archivo o `index.html`
2. **Producción**: Implementa un sistema de recuperación de contraseña

## Mejoras Futuras Recomendadas

- [ ] Autenticación con backend (JWT)
- [ ] Hash de contraseñas (bcrypt)
- [ ] Autenticación de dos factores (2FA)
- [ ] Rate limiting para login
- [ ] Logs de auditoría
- [ ] Recuperación de contraseña
- [ ] Gestión de múltiples admins
- [ ] Roles y permisos granulares
- [ ] Sesiones con timeout
- [ ] Notificaciones de login

## Soporte

Para más información sobre el panel de administración, consulta:
- `COMO_ACCEDER_AL_PANEL.md` en la raíz del proyecto
- `docs/ADMIN_PANEL_ACCESS.md`
- `docs/ADMIN_PANEL_FAQ.md`

---

**Última actualización**: 2024
**Versión**: 1.0.0
