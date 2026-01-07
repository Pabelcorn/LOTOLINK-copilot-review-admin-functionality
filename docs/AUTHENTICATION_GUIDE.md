# Authentication System - LOTOLINK

## Overview

LOTOLINK now supports multiple authentication methods across Web, Mobile, and Desktop platforms, providing a seamless and secure user experience while maintaining regulatory compliance.

## Authentication Methods

### 1. **Email & Password**
Traditional registration with email and password.

**Features:**
- Email validation with regex
- Password strength requirements (min 8 characters)
- Account recovery options

**Usage:**
```javascript
// Web/JavaScript
const response = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+18095551234',
    password: 'SecurePass123'
  })
});
```

### 2. **Phone/OTP Authentication**
Secure phone number verification using one-time passwords.

**Features:**
- SMS-based OTP (6-digit code)
- 5-minute expiration
- Rate limiting (3 attempts per minute)
- Resend functionality

**Flow:**
1. Send OTP: `POST /api/v1/auth/send-otp`
2. Verify OTP: `POST /api/v1/auth/verify-otp`
3. Complete registration/login

**Usage:**
```javascript
// Step 1: Send OTP
await fetch('/api/v1/auth/send-otp', {
  method: 'POST',
  body: JSON.stringify({
    phone: '+18095551234',
    purpose: 'login'
  })
});

// Step 2: Verify OTP
await fetch('/api/v1/auth/verify-otp', {
  method: 'POST',
  body: JSON.stringify({
    phone: '+18095551234',
    code: '123456',
    purpose: 'login'
  })
});
```

### 3. **Google Sign-In**
OAuth 2.0 integration with Google.

**Features:**
- One-tap sign-in
- Automatic email verification
- No password required

**Setup:**
1. Configure `GOOGLE_CLIENT_ID` in environment variables
2. Add Google OAuth credentials in Google Cloud Console

**Usage:**
```javascript
// Initialize Google Sign-In (Web)
google.accounts.id.initialize({
  client_id: GOOGLE_CLIENT_ID,
  callback: handleGoogleCallback
});

// Handle callback
async function handleGoogleCallback(response) {
  await fetch('/api/v1/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken: response.credential })
  });
}
```

### 4. **Apple Sign-In**
Native Apple ID integration for iOS/macOS.

**Features:**
- Native Apple ID authentication
- Privacy-focused (hide email option)
- Biometric support (Face ID/Touch ID)

**Setup:**
1. Configure `APPLE_CLIENT_ID` in environment variables
2. Set up Apple Sign-In in Apple Developer Console
3. Add redirect URIs

**Usage:**
```javascript
// Initialize Apple Sign-In (Web)
AppleID.auth.init({
  clientId: APPLE_CLIENT_ID,
  scope: 'name email',
  redirectURI: window.location.origin,
  usePopup: true
});

// Sign in
const data = await AppleID.auth.signIn();
await fetch('/api/v1/auth/apple', {
  method: 'POST',
  body: JSON.stringify({
    identityToken: data.authorization.id_token,
    authorizationCode: data.authorization.code
  })
});
```

### 5. **Guest Mode**
Explore features without registration.

**Features:**
- 30-day session expiration
- Seamless conversion to full account
- Limited features (no ticket saving)

**Usage:**
```javascript
// Start guest session
const response = await fetch('/api/v1/auth/guest', {
  method: 'POST',
  body: JSON.stringify({
    deviceId: generateDeviceId()
  })
});

// Convert to full account
await fetch('/api/v1/auth/guest/convert', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${guestToken}`
  },
  body: JSON.stringify({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+18095551234',
    password: 'SecurePass123'
  })
});
```

## Age Verification

**Requirement:** All users must be 18+ years old to purchase lottery tickets.

**Features:**
- Date of birth collection
- Automatic age calculation
- Terms & privacy acceptance
- Enforced at ticket purchase

**Usage:**
```javascript
await fetch('/api/v1/auth/verify-age', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user-id',
    birthDate: '1990-01-15',
    acceptTerms: true,
    acceptPrivacy: true
  })
});
```

**Enforcement:**
- Guest users prompted to register when saving tickets
- Age verification required before first purchase
- Validation on backend for ticket creation

## Admin Access

**Secret Code:** `LOT20041227`

**Features:**
- Discreet access (keyboard shortcut: Ctrl+Shift+A)
- Rate limiting (3 attempts per hour)
- Audit logging of all access attempts
- Access levels: `super_admin`, `admin`

**Usage:**
```javascript
await fetch('/api/v1/auth/admin-secret', {
  method: 'POST',
  body: JSON.stringify({
    secretCode: 'LOT20041227',
    username: 'admin',
    password: 'admin123'
  })
});
```

## Security Features

### Rate Limiting
- Login attempts: 5 per minute
- OTP requests: 3 per minute
- Admin attempts: 3 per hour

### Token Management
- JWT with 1-hour expiration
- Refresh tokens (7-day expiration)
- Automatic token refresh

### Password Security
- bcrypt hashing (10 rounds)
- Minimum 8 characters
- No password requirements for social auth

### Session Security
- HttpOnly cookies (production)
- Secure flag for HTTPS
- CSRF protection

## Configuration

### Environment Variables

```bash
# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
APPLE_CLIENT_ID=your.apple.client.id

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=super123

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=lotolink
DATABASE_PASSWORD=password
DATABASE_NAME=lotolink_db
```

### Production Setup

1. **Generate secure secrets:**
```bash
npm run generate:secrets
```

2. **Configure OAuth providers:**
   - Google: https://console.cloud.google.com
   - Apple: https://developer.apple.com

3. **Run database migrations:**
```bash
cd backend
npm run migration:run
```

4. **Configure SMS provider (for OTP):**
   - Update `OtpService` with Twilio/AWS SNS credentials

## Platform-Specific Implementation

### Web Application
- Component: `auth-modal.html`
- Features: All methods supported
- Integration: Embed in `index.html`

### Mobile Application (React Native/Ionic)
- Service: `mobile-app/src/services/auth.service.ts`
- Features: All methods supported
- Native SDKs for Google/Apple

### Desktop Application (Electron)
- Location: `desktop-app/`
- Features: Email, OTP, Guest, Admin
- OAuth via system browser

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Email/password registration |
| `/api/v1/auth/login` | POST | Email/password login |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/auth/send-otp` | POST | Send OTP to phone |
| `/api/v1/auth/verify-otp` | POST | Verify OTP code |
| `/api/v1/auth/google` | POST | Google OAuth authentication |
| `/api/v1/auth/apple` | POST | Apple Sign-In authentication |
| `/api/v1/auth/guest` | POST | Create guest session |
| `/api/v1/auth/guest/convert` | POST | Convert guest to full account |
| `/api/v1/auth/verify-age` | POST | Verify user age (18+) |
| `/api/v1/auth/admin-secret` | POST | Admin access validation |

## Testing

### Unit Tests
```bash
cd backend
npm test
```

### E2E Tests
```bash
cd e2e
npm test
```

### Manual Testing Checklist

- [ ] Email registration flow
- [ ] Phone OTP verification
- [ ] Google Sign-In (web & mobile)
- [ ] Apple Sign-In (iOS/macOS)
- [ ] Guest mode exploration
- [ ] Guest to registered conversion
- [ ] Age verification enforcement
- [ ] Admin secret access
- [ ] Token refresh flow
- [ ] Session persistence
- [ ] Rate limiting
- [ ] Error handling

## Troubleshooting

### Common Issues

**Issue:** Google Sign-In not working
- **Solution:** Check `GOOGLE_CLIENT_ID` configuration and OAuth consent screen

**Issue:** OTP not received
- **Solution:** Check SMS provider configuration in `OtpService`

**Issue:** Age verification failing
- **Solution:** Ensure date format is `YYYY-MM-DD`

**Issue:** Admin access denied
- **Solution:** Verify secret code and check rate limit

### Debug Mode

Enable detailed logging:
```bash
NODE_ENV=development npm run start:dev
```

## Migration Guide

### From Old Auth System

1. Backup existing user data
2. Run migration: `npm run migration:run`
3. Update client applications with new auth endpoints
4. Test authentication flows
5. Deploy to production

### Database Schema Changes

New columns in `users` table:
- `email_verified` (boolean)
- `provider` (varchar)
- `provider_id` (varchar)

New tables:
- `otp_codes`
- `guest_sessions`
- `admin_secret_codes`
- `admin_access_logs`

## Support

For issues or questions:
- GitHub Issues: https://github.com/Pabelcorn/LOTOLINK/issues
- Documentation: `/docs/`
- Email: support@lotolink.com

## License

MIT License - See LICENSE file for details
