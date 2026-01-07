# 🔐 Guía de Configuración de Autenticación para Producción

## Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
3. [Generación de Secretos](#generación-de-secretos)
4. [Configuración de SMS (OTP)](#configuración-de-sms-otp)
5. [Configuración de OAuth](#configuración-de-oauth)
6. [Configuración de SSL/HTTPS](#configuración-de-sslhttps)
7. [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
8. [Testing de Flujos](#testing-de-flujos)
9. [Checklist Pre-Producción](#checklist-pre-producción)

---

## Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 14+ configurado
- Nginx instalado (para reverse proxy)
- Dominio configurado (lotolink.com)
- Cuenta Twilio o AWS para SMS

---

## Configuración de Variables de Entorno

### 1. Copiar archivo de ejemplo

```bash
cp .env.production.example .env.production
```

### 2. Editar con valores reales

```bash
nano .env.production
```

### Variables críticas de seguridad

| Variable | Descripción | Cómo generar |
|----------|-------------|--------------|
| `JWT_SECRET` | Secreto para tokens JWT | `node scripts/generate-admin-hash.js --jwt` |
| `ADMIN_SECRET_HASH_SUPER` | Hash del código admin | `node scripts/generate-admin-hash.js LOT20041227` |
| `DATABASE_PASSWORD` | Password de PostgreSQL | Generado en instalación de DB |

---

## Generación de Secretos

### Método rápido (todos los secretos)

```bash
node scripts/generate-admin-hash.js --all
```

Esto genera:
- JWT_SECRET
- JWT_REFRESH_SECRET
- SESSION_SECRET
- Hash para LOT20041227
- Hash para LOTOLINK2024

### Método individual

```bash
# Generar hash para un código específico
node scripts/generate-admin-hash.js LOT20041227

# Generar solo JWT secret
node scripts/generate-admin-hash.js --jwt
```

### Ejemplo de salida

```
🔐 LOTOLINK - Generador de Hash Seguro

📝 Texto a hashear: LOT********
🔢 Rounds de bcrypt: 12

✅ Hash generado:
────────────────────────────────────────────────────────────
$2b$12$X7VYKxH8vZpN3qR5mT2wOeYbC4dF6gH8jK0lM2nO4pQ6rS8tU0vW
────────────────────────────────────────────────────────────
```

---

## Configuración de SMS (OTP)

### Opción A: Twilio (Recomendado)

#### 1. Crear cuenta en Twilio
- Ir a [twilio.com](https://www.twilio.com)
- Registrarse y verificar cuenta
- Obtener número de teléfono (+1809 para RD)

#### 2. Configurar variables

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+18091234567
```

#### 3. Probar envío

```bash
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json \
  --data-urlencode "Body=Tu código LOTOLINK es: 123456" \
  --data-urlencode "From=+18091234567" \
  --data-urlencode "To=+18091234567" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

### Opción B: AWS SNS

```env
SMS_PROVIDER=aws_sns
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
```

---

## Configuración de OAuth

### Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear proyecto o seleccionar existente
3. APIs & Services → Credentials → Create OAuth Client ID
4. Configurar:
   - Application type: Web application
   - Authorized redirect URIs: `https://lotolink.com/auth/google/callback`

```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=https://lotolink.com/auth/google/callback
```

### Apple Sign In

1. Ir a [Apple Developer](https://developer.apple.com)
2. Certificates, Identifiers & Profiles
3. Crear App ID con Sign In with Apple
4. Crear Service ID para web

```env
APPLE_CLIENT_ID=com.lotolink.app
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY_PATH=/path/to/AuthKey.p8
```

---

## Configuración de SSL/HTTPS

### Con Let's Encrypt (gratuito)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d lotolink.com -d www.lotolink.com

# Renovación automática (ya configurada por certbot)
sudo certbot renew --dry-run
```

### Configuración Nginx

Ver archivo `config/nginx.conf` para configuración completa.

---

## Migraciones de Base de Datos

```bash
# Conectar a PostgreSQL
psql -U lotolink_user -d lotolink_prod

# Ejecutar migración
\i backend/database/migrations/005_auth_system.sql

# Verificar tablas creadas
\dt
```

Tablas nuevas:
- `otp_codes` - Códigos OTP pendientes
- `admin_access_logs` - Log de accesos admin
- `user_sessions` - Sesiones activas
- Campos nuevos en `users`: `birth_date`, `age_verified`, `auth_provider`

---

## Testing de Flujos

### 1. Registro con teléfono

```bash
# Solicitar OTP
curl -X POST https://api.lotolink.com/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phone": "+18091234567"}'

# Verificar OTP
curl -X POST https://api.lotolink.com/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+18091234567", "code": "123456"}'
```

### 2. Verificación de edad

```bash
curl -X POST https://api.lotolink.com/auth/verify-age \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-01-15", "acceptTerms": true, "acceptPrivacy": true}'
```

### 3. Código admin secreto

```bash
# En la app, escribir LOT20041227 en el campo de teléfono
# Debe aparecer modal de credenciales admin
```

---

## Checklist Pre-Producción

### Seguridad
- [ ] JWT_SECRET generado (64+ caracteres)
- [ ] Hashes bcrypt para códigos admin
- [ ] HTTPS habilitado
- [ ] CORS configurado
- [ ] Rate limiting activo
- [ ] Logs de auditoría funcionando

### SMS/OTP
- [ ] Cuenta Twilio/AWS activa
- [ ] Número verificado
- [ ] Créditos disponibles
- [ ] Probado con números RD

### OAuth
- [ ] Google OAuth configurado
- [ ] Apple Sign In configurado
- [ ] Callbacks funcionando

### Base de Datos
- [ ] Migración ejecutada
- [ ] Índices creados
- [ ] Backup configurado

### Testing
- [ ] Registro teléfono ✓
- [ ] Login teléfono ✓
- [ ] Google OAuth ✓
- [ ] Apple Sign In ✓
- [ ] Verificación 18+ ✓
- [ ] Modo guest ✓
- [ ] Código admin secreto ✓
- [ ] Logout ✓

---

## Comandos Útiles

```bash
# Generar todos los secretos
node scripts/generate-admin-hash.js --all

# Setup completo
./scripts/setup-production.sh

# Verificar configuración
npm run verify:config

# Iniciar en producción
NODE_ENV=production npm run start:prod
```

---

## Soporte

- 📧 Email: soporte@lotolink.com
- 📚 Docs: https://docs.lotolink.com
- 🐛 Issues: https://github.com/Pabelcorn/LOTOLINK/issues
