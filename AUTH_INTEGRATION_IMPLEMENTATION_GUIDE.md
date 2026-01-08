# Complete Auth Integration Implementation Guide

## Overview

This guide provides the complete code to integrate the full authentication system from `auth-modal.html` into `index.html`, `index mobile.html`, and `desktop-app/index.html`.

## Step 1: State Management (✅ DONE for index.html)

Already added to index.html at line ~4784:
```javascript
const [authModalView, setAuthModalView] = useState('selection');
const [currentPhone, setCurrentPhone] = useState('');
const [currentUserId, setCurrentUserId] = useState('');
const [isGuestMode, setIsGuestMode] = useState(() => localStorage.getItem('ll_guest') === 'true');
```

**TODO**: Add same states to `index mobile.html` and `desktop-app/index.html`

## Step 2: Add Helper Functions

Add these functions BEFORE the main render/return statement (around line ~5000-6000):

```javascript
// ==================== AUTH HELPER FUNCTIONS ====================

// API Base URL configuration
const getApiBaseUrl = () => {
  if (typeof window.CONFIG !== 'undefined' && window.CONFIG.API_BASE_URL) {
    return window.CONFIG.API_BASE_URL;
  }
  return window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api/v1' 
    : 'https://api.lotolink.com/api/v1';
};

// Auth View Navigation
const hideAllAuthForms = () => {
  setAuthModalView('hidden');
};

const showAuthSelection = () => {
  setAuthModalView('selection');
};

const showPhoneAuth = () => {
  setAuthModalView('phone');
};

const showOTPVerification = () => {
  setAuthModalView('otp');
};

const showEmailAuth = () => {
  setAuthModalView('email');
};

const showAgeVerification = () => {
  setAuthModalView('age');
};

const showAdminForm = () => {
  setAuthModalView('admin');
};

// Guest Mode
const continueAsGuest = async () => {
  try {
    const API_BASE = getApiBaseUrl();
    const response = await fetch(`${API_BASE}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'device_' + Math.random().toString(36).substr(2, 9)
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('ll_token', data.accessToken);
      localStorage.setItem('ll_guest', 'true');
      setIsGuestMode(true);
      setShowAuthModal(false);
      alert('Continúa explorando. Recuerda registrarte para guardar tus tickets.');
      window.location.reload();
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al iniciar modo invitado');
  }
};

// Phone OTP Auth
const sendOTP = async (event, resend = false) => {
  if (event) event.preventDefault();
  
  const phone = resend ? currentPhone : document.getElementById('phoneNumber')?.value;
  if (!phone) return;
  
  setCurrentPhone(phone);
  
  try {
    const API_BASE = getApiBaseUrl();
    const response = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, purpose: 'login' })
    });
    
    if (response.ok) {
      showOTPVerification();
    } else {
      alert('Error al enviar código');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
};

const verifyOTP = async (event) => {
  if (event) event.preventDefault();
  
  const code = document.getElementById('otpCode')?.value;
  if (!code) return;
  
  try {
    const API_BASE = getApiBaseUrl();
    const response = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: currentPhone,
        code: code,
        purpose: 'login'
      })
    });
    
    if (response.ok) {
      showAgeVerification();
    } else {
      alert('Código inválido o expirado');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de verificación');
  }
};

// Email Registration
const registerWithEmail = async (event) => {
  if (event) event.preventDefault();
  
  const name = document.getElementById('fullName')?.value;
  const email = document.getElementById('emailAddress')?.value;
  const phone = document.getElementById('emailPhone')?.value;
  const password = document.getElementById('password')?.value;
  
  if (!name || !email || !phone || !password) {
    alert('Por favor completa todos los campos');
    return;
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Email inválido');
    return;
  }
  
  try {
    const API_BASE = getApiBaseUrl();
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setCurrentUserId(data.user.id);
      localStorage.setItem('ll_access_token', data.accessToken);
      localStorage.setItem('ll_refresh_token', data.refreshToken);
      showAgeVerification();
    } else {
      alert(data.message || 'Error al registrar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
};

// Age Verification
const verifyAge = async (event) => {
  if (event) event.preventDefault();
  
  const birthDate = document.getElementById('birthDate')?.value;
  const acceptTerms = document.getElementById('acceptTerms')?.checked;
  const acceptPrivacy = document.getElementById('acceptPrivacy')?.checked;
  
  if (!acceptTerms || !acceptPrivacy) {
    alert('Debes aceptar los términos y condiciones');
    return;
  }
  
  try {
    const API_BASE = getApiBaseUrl();
    const response = await fetch(`${API_BASE}/auth/verify-age`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ll_access_token')}`
      },
      body: JSON.stringify({
        userId: currentUserId,
        birthDate,
        acceptTerms,
        acceptPrivacy
      })
    });
    
    if (response.ok) {
      localStorage.setItem('ll_age_verified', 'true');
      setShowAuthModal(false);
      alert('¡Verificación completada! Ya puedes jugar.');
      window.location.reload();
    } else {
      alert('Debes tener 18 años o más');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de verificación');
  }
};

// Google Sign-In
const signInWithGoogle = async () => {
  const GOOGLE_CLIENT_ID = 'REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID';
  
  if (typeof google === 'undefined') {
    alert('Google Sign-In no disponible');
    return;
  }
  
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCallback
  });
  
  google.accounts.id.prompt();
};

const handleGoogleCallback = async (response) => {
  try {
    const API_BASE = getApiBaseUrl();
    const apiResponse = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: response.credential })
    });
    
    const data = await apiResponse.json();
    
    if (apiResponse.ok) {
      localStorage.setItem('ll_token', data.accessToken);
      localStorage.setItem('ll_user', JSON.stringify(data.user));
      setCurrentUserId(data.user.id);
      setUser(data.user);
      
      if (!data.user.ageVerified) {
        showAgeVerification();
      } else {
        setShowAuthModal(false);
        window.location.reload();
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de autenticación con Google');
  }
};

// Apple Sign-In
const signInWithApple = async () => {
  const APPLE_CLIENT_ID = 'REPLACE_WITH_YOUR_APPLE_CLIENT_ID';
  
  if (typeof AppleID === 'undefined') {
    alert('Apple Sign-In no disponible');
    return;
  }
  
  try {
    AppleID.auth.init({
      clientId: APPLE_CLIENT_ID,
      scope: 'name email',
      redirectURI: window.location.origin,
      usePopup: true
    });
    
    const data = await AppleID.auth.signIn();
    
    const API_BASE = getApiBaseUrl();
    const response = await fetch(`${API_BASE}/auth/apple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identityToken: data.authorization.id_token,
        authorizationCode: data.authorization.code,
        user: data.user ? JSON.stringify(data.user) : undefined
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      localStorage.setItem('ll_token', result.accessToken);
      localStorage.setItem('ll_user', JSON.stringify(result.user));
      setCurrentUserId(result.user.id);
      setUser(result.user);
      
      if (!result.user.ageVerified) {
        showAgeVerification();
      } else {
        setShowAuthModal(false);
        window.location.reload();
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de autenticación con Apple');
  }
};

// Admin Access
const validateAdminAccess = async (event) => {
  if (event) event.preventDefault();
  
  const secretCode = document.getElementById('secretCode')?.value;
  const username = document.getElementById('adminUsername')?.value;
  const password = document.getElementById('adminPassword')?.value;
  
  try {
    const API_BASE = getApiBaseUrl();
    const response = await fetch(`${API_BASE}/auth/admin-secret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secretCode, username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('ll_token', data.accessToken);
      localStorage.setItem('ll_admin', 'true');
      localStorage.setItem('ll_access_level', data.accessLevel);
      setShowAuthModal(false);
      alert('Acceso de administrador concedido');
      window.location.href = '/admin-panel.html';
    } else {
      alert('Credenciales inválidas');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de autenticación');
  }
};

// ==================== END AUTH HELPER FUNCTIONS ====================
```

## Step 3: Add Keyboard Shortcut

Add this after the helper functions (or near other event listeners):

```javascript
// Secret admin code trigger (press Ctrl+Shift+A)
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      setShowAuthModal(true);
      showAdminForm();
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

## Step 4: Replace Auth Modal UI

Find the current auth modal (around line ~6668-6827) and replace it with:

```jsx
{showAuthModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
    <div className="premium-card w-full max-w-md p-8 animate-fade-in relative">
      {/* Close Button */}
      <button 
        onClick={() => setShowAuthModal(false)} 
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
      >
        ×
      </button>
      
      {/* Selection View */}
      {authModalView === 'selection' && (
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-blue-500/30">
            👋
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bienvenido a LotoLink</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">La mejor plataforma de loterías</p>
          
          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-4">
            <button 
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-full hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-white/5 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
                <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853"/>
                <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05"/>
                <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" fill="#EA4335"/>
              </svg>
              <span className="font-medium text-gray-700 dark:text-gray-200">Continuar con Google</span>
            </button>
            
            <button 
              onClick={signInWithApple}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-full hover:bg-gray-900 transition-all"
            >
              <i className="fab fa-apple text-xl"></i>
              <span className="font-medium">Continuar con Apple</span>
            </button>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">o</span>
            </div>
          </div>
          
          {/* Phone/Email Options */}
          <div className="space-y-3">
            <button 
              onClick={showPhoneAuth}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
            >
              <i className="fas fa-mobile-alt"></i>
              <span className="font-medium">Continuar con Teléfono</span>
            </button>
            
            <button 
              onClick={showEmailAuth}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-white/5 transition-all"
            >
              <i className="fas fa-envelope"></i>
              <span className="font-medium">Continuar con Email</span>
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <button 
              onClick={continueAsGuest}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Explorar como invitado →
            </button>
          </div>
        </div>
      )}
      
      {/* Phone Auth Form */}
      {authModalView === 'phone' && (
        <div>
          <button 
            onClick={showAuthSelection}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Volver
          </button>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Iniciar con Teléfono</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Te enviaremos un código de verificación</p>
          
          <form onSubmit={sendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de teléfono</label>
              <input 
                type="tel" 
                id="phoneNumber" 
                placeholder="+1 (809) 555-1234" 
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white transition-all"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition-all"
            >
              Enviar Código
            </button>
          </form>
        </div>
      )}
      
      {/* OTP Verification Form */}
      {authModalView === 'otp' && (
        <div>
          <button 
            onClick={showPhoneAuth}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Volver
          </button>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verificar Código</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Ingresa el código enviado a <span className="font-medium">{currentPhone}</span>
          </p>
          
          <form onSubmit={verifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Código de 6 dígitos</label>
              <input 
                type="text" 
                id="otpCode" 
                placeholder="123456" 
                maxLength="6" 
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-center text-2xl font-mono bg-white dark:bg-white/5 text-gray-900 dark:text-white transition-all"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition-all"
            >
              Verificar
            </button>
            <button 
              type="button"
              onClick={() => sendOTP(null, true)}
              className="w-full text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              Reenviar código
            </button>
          </form>
        </div>
      )}
      
      {/* Email Auth Form */}
      {authModalView === 'email' && (
        <div>
          <button 
            onClick={showAuthSelection}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Volver
          </button>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registrarse con Email</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Crea tu cuenta en segundos</p>
          
          <form onSubmit={registerWithEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre completo</label>
              <input 
                type="text" 
                id="fullName" 
                placeholder="Juan Pérez" 
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input 
                type="email" 
                id="emailAddress" 
                placeholder="tu@email.com" 
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
              <input 
                type="tel" 
                id="emailPhone" 
                placeholder="+1 (809) 555-1234" 
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Mínimo 8 caracteres" 
                minLength="8"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white transition-all"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition-all"
            >
              Crear Cuenta
            </button>
          </form>
        </div>
      )}
      
      {/* Age Verification Form */}
      {authModalView === 'age' && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verificación de Edad</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Debes tener 18 años o más para usar LotoLink</p>
          
          <form onSubmit={verifyAge} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de nacimiento</label>
              <input 
                type="date" 
                id="birthDate" 
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="acceptTerms" required className="mt-1" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Acepto los <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">términos y condiciones</a>
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="acceptPrivacy" required className="mt-1" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Acepto la <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">política de privacidad</a>
                </span>
              </label>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition-all"
            >
              Verificar y Continuar
            </button>
          </form>
        </div>
      )}
      
      {/* Admin Secret Form */}
      {authModalView === 'admin' && (
        <div>
          <button 
            onClick={showAuthSelection}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Volver
          </button>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Administrador</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Ingresa tus credenciales de administrador</p>
          
          <form onSubmit={validateAdminAccess} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Código Secreto</label>
              <input 
                type="password" 
                id="secretCode" 
                placeholder="LOT20041227" 
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usuario</label>
              <input 
                type="text" 
                id="adminUsername" 
                placeholder="admin" 
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
              <input 
                type="password" 
                id="adminPassword" 
                placeholder="••••••••" 
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white transition-all"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-full font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-shield-alt"></i> Acceder
            </button>
          </form>
        </div>
      )}
    </div>
  </div>
)}
```

## Step 5: Repeat for Other Files

Apply Steps 1-4 to:
1. `index mobile.html`
2. `desktop-app/index.html`

## Testing Checklist

After implementation:
- [ ] Simple registration still works
- [ ] Phone/OTP flow works
- [ ] Age verification blocks under-18
- [ ] Guest mode allows browsing
- [ ] OAuth buttons appear (even if not configured)
- [ ] Admin access works (Ctrl+Shift+A)
- [ ] Existing features work (cart, play, tickets)

## Configuration Notes

Before production:
1. Replace `REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID` with actual Google OAuth client ID
2. Replace `REPLACE_WITH_YOUR_APPLE_CLIENT_ID` with actual Apple OAuth client ID
3. Ensure backend endpoints exist and work:
   - `/api/v1/auth/send-otp`
   - `/api/v1/auth/verify-otp`
   - `/api/v1/auth/verify-age`
   - `/api/v1/auth/guest`
   - `/api/v1/auth/google`
   - `/api/v1/auth/apple`
   - `/api/v1/auth/admin-secret`

## File Locations

In each file, make changes at approximately these line numbers:

**index.html:**
- Line ~4784: Add state variables
- Line ~5500: Add helper functions (before render)
- Line ~6668: Replace auth modal

**index mobile.html:**
- Line ~4232: Add state variables
- Line ~5000: Add helper functions
- Line ~6065: Replace auth modal

**desktop-app/index.html:**
- Line ~4517: Add state variables
- Line ~5200: Add helper functions
- Line ~6563: Replace auth modal

---

**Implementation Status**: Guide complete, requires manual application to files.
