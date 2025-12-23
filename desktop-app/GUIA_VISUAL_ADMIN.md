# 🎯 Guía Visual: Acceso al Panel de Administración

## 📖 Cómo Acceder al Panel de Admin - Paso a Paso

### Paso 1: Iniciar Sesión como Administrador

```
┌─────────────────────────────────────────┐
│  👋 Bienvenido a LotoLink              │
│  Ingresa tus datos para continuar      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Tu nombre                         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ admin@lotolink.com                │ │ ⬅️ Email con "admin@"
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Tu teléfono                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ••••••••                          │ │
│  └───────────────────────────────────┘ │
│                                         │
│         [ Entrar ]                      │
└─────────────────────────────────────────┘
```

> 💡 **Nota**: Usa un email que contenga `admin@` o `administrador@` para que se active el botón de admin.

---

### Paso 2: Ir al Perfil

```
┌─────────────────────────────────────────┐
│  🏠  🎰  🏪  [👤]  ⚙️                  │ ⬅️ Haz clic en el icono de perfil
└─────────────────────────────────────────┘
```

---

### Paso 3: Localizar el Botón "Panel Admin"

```
┌───────────────────────────────────────────────────┐
│  Perfil de Usuario                                │
│  ───────────────────────────────────────────      │
│                                                   │
│  👤 Juan Admin                                    │
│  📧 admin@lotolink.com                            │
│  📱 809-123-4567                                  │
│                                                   │
│  ┌─────────────┐  ┌─────────────┐               │
│  │ 💰 Recargar │  │ 🏦 Retirar  │               │
│  └─────────────┘  └─────────────┘               │
│                                                   │
│  ┌───────────────────────────────────────┐       │
│  │     ⚙️  Panel Admin                  │ ⬅️   │
│  └───────────────────────────────────────┘       │
│         (Botón morado/purple)                    │
│                                                   │
└───────────────────────────────────────────────────┘
```

> ⚡ **Este botón SOLO aparece si iniciaste sesión con email de admin**

---

### Paso 4: Modal de Autenticación

Al hacer clic en "Panel Admin", aparece el modal:

```
              ┌─────────────────────────────────┐
              │           🔐                    │
              │   Panel de Administración       │
              │ Ingresa tus credenciales de     │
              │      administrador              │
              │                                 │
              │   ┌─────────────────────────┐  │
              │   │ admin                   │  │ ⬅️ Usuario
              │   └─────────────────────────┘  │
              │                                 │
              │   ┌─────────────────────────┐  │
              │   │ ••••••••••••            │  │ ⬅️ Contraseña
              │   └─────────────────────────┘  │
              │                                 │
              │   ┌───────────────────────┐    │
              │   │ Acceder al Panel      │    │
              │   └───────────────────────┘    │
              │                                 │
              │         Cancelar                │
              │                                 │
              │ 🔒 Área restringida solo para   │
              │      administradores            │
              └─────────────────────────────────┘
```

---

### Paso 5: Ingresar Credenciales

**Credenciales predeterminadas:**

```
┌──────────────────────────────┐
│  Usuario:    admin           │
│  Contraseña: lotolink2024    │
└──────────────────────────────┘
```

---

### Paso 6: Resultado

#### ✅ Si las credenciales son CORRECTAS:

```
┌─────────────────────────────────────────┐
│                                         │
│  ✓ Credenciales correctas               │
│                                         │
│  Abriendo panel de administración...    │
│                                         │
└─────────────────────────────────────────┘

       ↓
       
🌐 Nueva pestaña se abre con admin-panel.html
```

#### ❌ Si las credenciales son INCORRECTAS:

```
┌─────────────────────────────────────────┐
│                                         │
│  ❌ Credenciales incorrectas.           │
│  Por favor verifica tu usuario y        │
│  contraseña.                            │
│                                         │
│            [ OK ]                       │
│                                         │
└─────────────────────────────────────────┘

Modal permanece abierto, campo de contraseña se limpia
```

---

## 🎨 Características del Modal

### Diseño
- **Color**: Morado/Purple (from-purple-600 to-purple-700)
- **Icono**: 🔐 (cerradura con llave)
- **Animación**: Fade-in suave
- **Estilo**: Glass morphism con bordes redondeados

### Seguridad
- ✅ Campos de contraseña ocultos (••••)
- ✅ Autocomplete deshabilitado
- ✅ Validación antes de abrir panel
- ✅ Mensaje de error sin revelar información sensible
- ✅ Campos se limpian después de error

---

## 🔄 Flujo Completo Visual

```
┌──────────────┐
│ 1. LOGIN     │
│ admin@       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 2. PERFIL    │
│ Clic 👤      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 3. BOTÓN     │
│ Panel Admin  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 4. MODAL     │
│ 🔐 Login     │
└──────┬───────┘
       │
       ▼
┌──────────────┬──────────────┐
│ 5a. CORRECTO │ 5b. ERROR    │
│ ✅ Abrir     │ ❌ Retry     │
│ admin-panel  │ Limpia campo │
└──────────────┴──────────────┘
```

---

## 📝 Notas Importantes

### 🟢 Para Usuarios
- Solo usuarios con email `admin@` o `administrador@` ven el botón
- Se requiere usuario Y contraseña para acceder
- Los intentos fallidos no bloquean la cuenta (por ahora)
- Las credenciales son case-sensitive

### 🔴 Para Desarrolladores
- Credenciales están hardcoded en `index.html`
- Buscar `ADMIN_CREDENTIALS` para modificar
- **CAMBIAR** antes de producción
- Considerar mover a archivo de configuración

### ⚠️ Para Producción
- [ ] Cambiar credenciales predeterminadas
- [ ] Implementar backend de autenticación
- [ ] Usar hash de contraseñas
- [ ] Agregar rate limiting
- [ ] Implementar 2FA
- [ ] Usar HTTPS obligatorio

---

## 🎯 Casos de Uso

### Caso 1: Administrador de Sistema
```
Objetivo: Acceder al panel para gestionar bancas
1. Login con admin@lotolink.com
2. Ir a Perfil
3. Clic en "Panel Admin"
4. Ingresar: admin / lotolink2024
5. ✅ Acceso concedido
```

### Caso 2: Usuario Regular
```
Objetivo: Intentar acceder al panel
1. Login con usuario@lotolink.com
2. Ir a Perfil
3. ❌ Botón "Panel Admin" NO aparece
4. No puede acceder al panel
```

### Caso 3: Admin con Credenciales Incorrectas
```
Objetivo: Protección contra acceso no autorizado
1. Login con admin@lotolink.com
2. Ir a Perfil
3. Clic en "Panel Admin"
4. Ingresar: admin / wrongpassword
5. ❌ Acceso denegado
6. Modal permanece abierto para retry
```

---

## 🔗 Enlaces Útiles

- **Documentación completa**: `ADMIN_CREDENTIALS.md`
- **Guía de implementación**: `IMPLEMENTACION_ACCESO_ADMIN.md`
- **README principal**: `README.md`

---

## 💡 Tips y Trucos

### Para Recordar Credenciales
1. Están documentadas en `ADMIN_CREDENTIALS.md`
2. Buscar `ADMIN_CREDENTIALS` en el código
3. Usar gestor de contraseñas para producción

### Para Cambiar Credenciales
1. Abrir `desktop-app/index.html`
2. Buscar `ADMIN_CREDENTIALS` (línea ~6520)
3. Modificar objeto:
   ```javascript
   const ADMIN_CREDENTIALS = {
     username: 'nuevo_usuario',
     password: 'nueva_contraseña'
   };
   ```
4. Guardar y reiniciar app

### Para Testing
- Usuario de prueba: `admin@test.com`
- Asegurarse de tener email con `admin@`
- Probar tanto casos exitosos como fallidos

---

**Última actualización**: 2024  
**Versión del documento**: 1.0
