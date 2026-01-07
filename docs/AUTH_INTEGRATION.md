# Integration Guide: Authentication Modal

## Quick Integration into index.html

To integrate the new authentication system into your main `index.html`, follow these steps:

### Step 1: Add Google & Apple SDKs

Add these script tags to the `<head>` section of `index.html`:

```html
<!-- Google Sign-In -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<!-- Apple Sign-In -->
<script type="text/javascript" src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"></script>
```

### Step 2: Include Auth Modal Styles

Add these styles to your existing `<style>` section:

```css
/* Auth Modal Overlay */
.auth-modal-overlay {
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.5);
}

.auth-modal-content {
  max-height: 90vh;
  overflow-y: auto;
}

.social-btn {
  transition: all 0.2s ease;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Step 3: Embed Auth Modal HTML

At the end of your `<body>` tag (before closing `</body>`), add:

```html
<!-- Auth Modal -->
<div id="authModal" class="auth-modal-overlay fixed inset-0 z-50 hidden items-center justify-center p-4">
  <div class="auth-modal-content bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
    <!-- Modal content from auth-modal.html goes here -->
    <!-- Copy the content from auth-modal-template in auth-modal.html -->
  </div>
</div>
```

### Step 4: Add Auth JavaScript

Before the closing `</body>` tag, add:

```html
<script>
  // Configuration
  const API_BASE_URL = 'http://localhost:3000/api/v1'; // Update for production
  const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
  const APPLE_CLIENT_ID = 'YOUR_APPLE_CLIENT_ID';
  
  // Include all authentication functions from auth-modal.html
  // Copy the <script> content from auth-modal.html
</script>
```

### Step 5: Add Login/Register Buttons

Update your header or navigation to include auth triggers:

```html
<!-- Replace existing login button with: -->
<button onclick="openAuthModal()" class="btn-apple-primary">
  <i class="fas fa-user mr-2"></i>
  Iniciar Sesión
</button>

<!-- For guest mode: -->
<button onclick="continueAsGuest()" class="btn-apple-secondary">
  Explorar como invitado
</button>

<!-- For admin access (hidden): -->
<!-- Press Ctrl+Shift+A to open admin login -->
```

### Step 6: Add Guest User Prompts

When a guest user tries to save a ticket, show the conversion prompt:

```javascript
function handleTicketSave() {
  const isGuestUser = localStorage.getItem('ll_guest') === 'true';
  
  if (isGuestUser) {
    // Show conversion modal
    openAuthModal();
    alert('Debes crear una cuenta para guardar tickets. ¡Es gratis y rápido!');
    return;
  }
  
  // Continue with ticket save
  saveTicket();
}
```

### Step 7: Age Verification Check

Before allowing ticket purchases:

```javascript
async function purchaseTicket() {
  const ageVerified = localStorage.getItem('ll_age_verified') === 'true';
  
  if (!ageVerified) {
    openAuthModal();
    showAgeVerification(); // Implemented in auth-modal.html
    alert('Debes verificar tu edad (18+) para comprar tickets.');
    return;
  }
  
  // Continue with purchase
  processPurchase();
}
```

### Step 8: Protected Routes

Add authentication checks:

```javascript
function checkAuth() {
  const token = localStorage.getItem('ll_token');
  
  if (!token) {
    openAuthModal();
    return false;
  }
  
  return true;
}

// Use in protected sections
function viewProfile() {
  if (!checkAuth()) return;
  // Show profile
}
```

## Full Integration Example

Here's a complete minimal example:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>LotoLink</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <script src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"></script>
</head>
<body>
  
  <!-- Your existing app content -->
  <div id="app">
    <nav>
      <button onclick="openAuthModal()">Login</button>
    </nav>
    <!-- ... -->
  </div>
  
  <!-- Auth Modal (copy from auth-modal.html) -->
  <div id="authModal" class="...">
    <!-- Modal content -->
  </div>
  
  <!-- Auth Scripts (copy from auth-modal.html) -->
  <script>
    const API_BASE_URL = 'http://localhost:3000/api/v1';
    // ... all auth functions
  </script>
  
</body>
</html>
```

## Configuration for Production

### 1. Secure API Configuration

**IMPORTANT:** Do not use hostname detection for API URL selection. Instead, inject configuration:

```html
<script>
  // Define configuration before loading auth scripts
  window.CONFIG = {
    API_BASE_URL: 'https://api.lotolink.com/api/v1',
    GOOGLE_CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com',
    APPLE_CLIENT_ID: 'YOUR_ACTUAL_APPLE_CLIENT_ID'
  };
</script>
```

**Best Practice:** Load configuration from environment variables during build:

```javascript
// During build process (webpack/vite/etc)
window.CONFIG = {
  API_BASE_URL: process.env.VITE_API_BASE_URL,
  GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID,
  APPLE_CLIENT_ID: process.env.VITE_APPLE_CLIENT_ID
};
```

### 2. Set OAuth Client IDs

Get your client IDs from:
- **Google**: [Google Cloud Console](https://console.cloud.google.com)
  1. Create a project
  2. Enable Google+ API
  3. Create OAuth 2.0 credentials
  4. Add authorized JavaScript origins
  5. Copy Client ID

- **Apple**: [Apple Developer](https://developer.apple.com)
  1. Register an App ID
  2. Enable Sign In with Apple
  3. Create a Service ID
  4. Configure redirect URLs
  5. Copy Service ID

**Never commit actual credentials to version control!**

### 3. Environment Variables

Create `.env.production`:

```bash
VITE_API_BASE_URL=https://api.lotolink.com/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_APPLE_CLIENT_ID=your.apple.service.id
```

Create `.env.development`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_GOOGLE_CLIENT_ID=your_dev_google_client_id.apps.googleusercontent.com
VITE_APPLE_CLIENT_ID=your.dev.apple.service.id
```

Add to `.gitignore`:

```
.env.production
.env.development
.env.local
```

### 3. HTTPS Requirements

- Apple Sign-In requires HTTPS in production
- Set proper redirect URIs in OAuth consoles
- Use secure cookies for token storage

## Testing Checklist

- [ ] Auth modal opens correctly
- [ ] All auth methods are clickable
- [ ] Google Sign-In popup works
- [ ] Apple Sign-In popup works
- [ ] Phone OTP flow completes
- [ ] Email registration succeeds
- [ ] Age verification modal shows
- [ ] Guest mode functions properly
- [ ] Admin access works (Ctrl+Shift+A)
- [ ] Tokens are stored correctly
- [ ] Page reload preserves session
- [ ] Logout clears all data

## Troubleshooting

### Modal Not Showing
- Check if `authModal` element exists
- Verify `openAuthModal()` function is defined
- Check browser console for errors

### OAuth Not Working
- Verify client IDs are correct
- Check redirect URIs match your domain
- Ensure HTTPS in production
- Check browser console for OAuth errors

### API Errors
- Verify backend is running
- Check API_BASE_URL is correct
- Check CORS settings on backend
- Verify request payload format

## Next Steps

1. Copy `auth-modal.html` content into `index.html`
2. Configure OAuth client IDs
3. Test all authentication flows
4. Deploy backend with migrations
5. Update production environment variables
6. Test in staging environment
7. Deploy to production

## Support

For issues:
- Check [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)
- Review [backend logs](../backend/)
- Submit [GitHub issue](https://github.com/Pabelcorn/LOTOLINK/issues)
