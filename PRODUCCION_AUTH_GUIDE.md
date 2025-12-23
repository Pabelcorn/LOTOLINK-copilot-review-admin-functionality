# 🔐 Autenticación de Producción - Guía Completa

## 📋 Resumen

Sistema de autenticación production-ready implementado en LOTOLINK con:
- ✅ Contraseñas hasheadas (PBKDF2, 100,000 iteraciones, SHA-512)
- ✅ Autenticación JWT con tokens access y refresh
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Integración backend-frontend completa
- ✅ Modo offline como fallback

---

## 🏗️ Arquitectura

### Backend (NestJS + TypeScript)

```
backend/
├── domain/
│   └── entities/
│       └── user.entity.ts          # UserRole enum, User domain entity
├── application/
│   ├── dtos/
│   │   ├── auth.dto.ts             # RegisterDto, LoginDto, AuthResponseDto
│   │   └── user.dto.ts             # CreateUserDto with role
│   └── services/
│       └── user.service.ts         # getUserByPhone, createUser with role
├── infrastructure/
│   ├── database/
│   │   ├── entities/
│   │   │   └── user.db-entity.ts   # Password & role columns
│   │   └── repositories/
│   │       └── user.typeorm-repository.ts  # Mapper with password/role
│   ├── security/
│   │   └── password.service.ts     # PBKDF2 hashing & verification
│   └── http/
│       ├── controllers/
│       │   └── auth.controller.ts  # /register, /login, /refresh
│       ├── guards/
│       │   ├── jwt-auth.guard.ts   # JWT verification
│       │   └── roles.guard.ts      # Role-based access control
│       └── decorators/
│           └── roles.decorator.ts  # @Roles('admin') decorator
```

### Frontend (React via Babel)

```
├── index.html                      # Main app
├── index (20) (3).html             # Alternative version
├── desktop-app/index.html          # Desktop variant
└── mobile-app/index.html           # React/Vite (different structure)
```

Cada app HTML incluye:
- Login modal con campo de contraseña
- Integración API con endpoints backend
- Almacenamiento de JWT tokens
- Lógica de migración para usuarios existentes
- Botón admin condicional basado en rol

---

## 🔐 Flujo de Autenticación

### 1. Registro de Usuario

**Frontend → Backend**

```javascript
POST /api/v1/auth/register
Content-Type: application/json

{
  "phone": "8091234567",
  "email": "usuario@lotolink.com",
  "name": "Juan Pérez",
  "password": "miPassword123"
}
```

**Backend → Frontend**

```javascript
{
  "user": {
    "id": "uuid-aqui",
    "phone": "8091234567",
    "email": "usuario@lotolink.com",
    "name": "Juan Pérez",
    "role": "user",      // o "admin"
    "isAdmin": false     // true si role === "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

### 2. Login de Usuario

**Frontend → Backend**

```javascript
POST /api/v1/auth/login
Content-Type: application/json

{
  "phone": "8091234567",
  "password": "miPassword123"
}
```

**Backend → Frontend**

Misma respuesta que registro.

### 3. Refresh Token

**Frontend → Backend**

```javascript
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Backend → Frontend**

```javascript
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 💾 Almacenamiento en Frontend

### LocalStorage Keys

```javascript
// JWT Tokens
localStorage.setItem('ll_access_token', data.accessToken);
localStorage.setItem('ll_refresh_token', data.refreshToken);

// User Data
const userData = {
  id: uid("U"),        // ID local generado
  phone: user.phone,
  email: user.email,
  name: user.name,
  role: user.role,     // "user" | "admin"
  isAdmin: user.isAdmin // boolean
};
localStorage.setItem('ll_user', JSON.stringify(userData));
```

### Uso de Tokens

Para llamadas autenticadas al backend:

```javascript
const token = localStorage.getItem('ll_access_token');

fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 👑 Sistema de Roles

### Roles Disponibles

```typescript
enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}
```

### Asignación de Rol

**Durante Registro**:

```typescript
// Backend: auth.controller.ts
let role = UserRole.USER;
if (registerDto.email) {
  const emailLower = registerDto.email.toLowerCase();
  if (emailLower.includes('admin@') || emailLower.includes('administrador@')) {
    role = UserRole.ADMIN;
  }
}
```

**Migración Manual**:

Para asignar admin a usuario existente:

```sql
UPDATE users SET role = 'admin' WHERE email = 'usuario@example.com';
```

### Protección de Endpoints

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Get('dashboard')
  @Roles('admin')
  getDashboard() {
    // Solo usuarios con role='admin' pueden acceder
    return { message: 'Admin Dashboard' };
  }
}
```

---

## 🔒 Seguridad

### Hashing de Contraseñas

**Algoritmo**: PBKDF2  
**Iteraciones**: 100,000  
**Hash Function**: SHA-512  
**Salt**: 16 bytes aleatorios  
**Formato**: `salt:hash`

```typescript
// password.service.ts
async hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}
```

### JWT Payload

```javascript
{
  "sub": "user-uuid",
  "phone": "8091234567",
  "email": "usuario@lotolink.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Variables de Entorno

```bash
# backend/.env
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

⚠️ **IMPORTANTE**: En producción, usa secretos fuertes y únicos.

---

## 🌐 Configuración Frontend

### API Base URL

**Desarrollo**:
```javascript
const API_BASE = 'http://localhost:3000';
```

**Producción**:
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'https://api.lotolink.com';
```

Para los archivos HTML, actualizar manualmente:

```javascript
// En login modal
const API_BASE = 'https://api.lotolink.com';  // Cambiar antes de deploy
```

---

## 🚀 Modo Offline (Fallback)

Si el backend no está disponible, el sistema funciona en modo offline:

```javascript
try {
  // Intentar autenticación con backend
  const response = await fetch(`${API_BASE}/api/v1/auth/register`, {...});
  // ...
} catch (error) {
  alert('Error: ' + error.message + '. Usando modo offline.');
  
  // Fallback: Autenticación local
  const isAdmin = email.toLowerCase().includes('admin@') || 
                  email.toLowerCase().includes('administrador@');
  const newUser = { 
    name, 
    email, 
    phone, 
    id: uid("U"), 
    isAdmin, 
    role: isAdmin ? 'admin' : 'user' 
  };
  setUser(newUser);
  localStorage.setItem("ll_user", JSON.stringify(newUser));
}
```

⚠️ **Nota**: El modo offline es solo para desarrollo/demo. No usar en producción sin backend.

---

## 🧪 Testing

### 1. Registro de Usuario Normal

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8091234567",
    "email": "usuario@lotolink.com",
    "name": "Usuario Test",
    "password": "test12345"
  }'
```

**Resultado Esperado**: 
- Status: 201 Created
- Role: "user"
- isAdmin: false

### 2. Registro de Administrador

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8091234568",
    "email": "admin@lotolink.com",
    "name": "Admin Test",
    "password": "admin12345"
  }'
```

**Resultado Esperado**:
- Status: 201 Created
- Role: "admin"
- isAdmin: true

### 3. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8091234567",
    "password": "test12345"
  }'
```

**Resultado Esperado**:
- Status: 200 OK
- Incluye accessToken y refreshToken

### 4. Login con Contraseña Incorrecta

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8091234567",
    "password": "wrongpassword"
  }'
```

**Resultado Esperado**:
- Status: 401 Unauthorized
- Message: "Invalid credentials"

### 5. Refresh Token

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."  # Tu refresh token

curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$TOKEN\"}"
```

**Resultado Esperado**:
- Status: 200 OK
- Nuevo accessToken

### 6. Frontend Test

1. Abrir `index.html` en navegador
2. Click "Iniciar Sesión"
3. Ingresar:
   - Nombre: Test User
   - Email: admin@lotolink.com
   - Teléfono: 8091234567
   - Contraseña: test12345
4. Click "Entrar"
5. Ir a Perfil (👤)
6. Verificar que aparece botón "⚙️ Panel Admin"

---

## 📊 Base de Datos

### Migración SQL

```sql
-- Add password column
ALTER TABLE users 
ADD COLUMN password VARCHAR(255) DEFAULT NULL;

-- Add role column
ALTER TABLE users 
ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Add index on role
CREATE INDEX idx_users_role ON users(role);
```

### Schema Actualizado

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  password VARCHAR(255),          -- NEW: Hashed password
  role VARCHAR(20) DEFAULT 'user', -- NEW: user | admin
  wallet_balance DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

## 🔄 Migración de Usuarios Existentes

### Backend

Los usuarios existentes sin contraseña no podrán hacer login hasta que se registren de nuevo o se les asigne una contraseña manualmente.

**Opción 1: Forzar Re-registro**

Usuarios existentes deben registrarse de nuevo con contraseña.

**Opción 2: Asignar Contraseña por Defecto**

```typescript
// Script de migración
import { PasswordService } from './password.service';

async function migrateUsers() {
  const users = await userRepository.find({ where: { password: null } });
  const passwordService = new PasswordService();
  
  for (const user of users) {
    // Opción A: Contraseña temporal basada en teléfono
    const tempPassword = `temp_${user.phone}`;
    const hashedPassword = await passwordService.hashPassword(tempPassword);
    
    // Opción B: Contraseña aleatoria y enviar por email
    // const tempPassword = generateRandomPassword();
    // await sendPasswordResetEmail(user.email, tempPassword);
    
    await userRepository.update(user.id, { 
      password: hashedPassword,
      role: user.email?.includes('admin') ? 'admin' : 'user'
    });
  }
}
```

### Frontend

La migración en frontend es automática mediante el useEffect:

```javascript
useEffect(() => {
  if (user && user.email) {
    // Si tiene role del backend, usar ese
    if (user.role) {
      const isAdmin = user.role === 'admin';
      if (user.isAdmin !== isAdmin) {
        const updatedUser = { ...user, isAdmin };
        setUser(updatedUser);
        localStorage.setItem("ll_user", JSON.stringify(updatedUser));
      }
    } 
    // Si no tiene role, asignar basado en email (offline mode)
    else if (user.isAdmin === undefined) {
      const isAdmin = user.email.toLowerCase().includes('admin@') || 
                     user.email.toLowerCase().includes('administrador@');
      const updatedUser = { ...user, isAdmin, role: isAdmin ? 'admin' : 'user' };
      setUser(updatedUser);
      localStorage.setItem("ll_user", JSON.stringify(updatedUser));
    }
  }
}, [user]);
```

---

## 🎯 Mejoras Futuras

### Seguridad
- [ ] Verificación de email (send verification link)
- [ ] 2FA (Two-Factor Authentication)
- [ ] Rate limiting en endpoints de auth
- [ ] Captcha en registro/login
- [ ] Password strength requirements más estrictos
- [ ] Password history (no reutilizar últimas 5)
- [ ] Account lockout después de X intentos fallidos

### Funcionalidad
- [ ] Forgot Password flow
- [ ] Change Password endpoint
- [ ] Session management (ver sesiones activas)
- [ ] Logout from all devices
- [ ] Social login (Google, Facebook)
- [ ] Phone verification con SMS

### Admin
- [ ] Endpoint separado para crear admins
- [ ] Panel para gestionar roles de usuarios
- [ ] Audit log de acciones admin
- [ ] Permissions granulares (no solo user/admin)

---

## 📚 Referencias

### Documentación

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [JWT.io](https://jwt.io/)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Node.js crypto](https://nodejs.org/api/crypto.html)

### Archivos Clave

```
backend/src/
├── infrastructure/http/controllers/auth.controller.ts
├── infrastructure/security/password.service.ts
├── infrastructure/http/guards/jwt-auth.guard.ts
├── infrastructure/http/guards/roles.guard.ts
├── domain/entities/user.entity.ts
└── application/dtos/auth.dto.ts

frontend/
├── index.html (líneas 5497-5547: login modal)
├── index (20) (3).html (líneas 6215-6265: login modal)
└── desktop-app/index.html (líneas 6195-6245: login modal)
```

---

## ✅ Checklist de Producción

Antes de deployar a producción:

### Backend
- [ ] Cambiar JWT_SECRET a valor seguro y único
- [ ] Configurar JWT_EXPIRES_IN y JWT_REFRESH_EXPIRES_IN apropiadamente
- [ ] Habilitar HTTPS
- [ ] Configurar CORS para dominios permitidos
- [ ] Agregar rate limiting
- [ ] Configurar logging de eventos de auth
- [ ] Implementar monitoring y alerts
- [ ] Backup de base de datos configurado

### Frontend
- [ ] Cambiar API_BASE a URL de producción
- [ ] Remover console.logs
- [ ] Minificar assets
- [ ] Configurar CSP headers
- [ ] Implementar error tracking (Sentry, etc)
- [ ] Agregar analytics

### Database
- [ ] Ejecutar migraciones en producción
- [ ] Verificar índices creados
- [ ] Configurar backups automáticos
- [ ] Configurar replica para alta disponibilidad

### Testing
- [ ] Tests unitarios de PasswordService
- [ ] Tests de integración de AuthController
- [ ] Tests E2E del flujo de auth
- [ ] Load testing de endpoints de auth
- [ ] Security audit (penetration testing)

---

## 🆘 Soporte

Para problemas o preguntas:

1. Revisar logs del backend: `tail -f backend/logs/app.log`
2. Verificar estado de BD: `psql -U lotolink -d lotolink_db`
3. Revisar DevTools en frontend (F12 → Network tab)
4. Consultar esta guía y las referencias
5. Crear issue en GitHub con detalles del problema

---

**Última actualización**: 2025-12-11  
**Versión**: 1.0.0  
**Autor**: LOTOLINK Team
