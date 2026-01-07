import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/react';
import { phonePortrait, mail, logoGoogle, logoApple } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './../../styles/auth.css';

const AuthScreen: React.FC = () => {
  const history = useHistory();
  const { startGuestMode } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePhoneAuth = () => {
    history.push('/auth/phone');
  };

  const handleEmailAuth = () => {
    history.push('/auth/email');
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      // Google Sign-In using Capacitor plugin
      // For native implementation, use @codetrix-studio/capacitor-google-auth
      // For web, use Google Sign-In JavaScript API
      
      // This is a placeholder - actual implementation requires:
      // 1. Install @codetrix-studio/capacitor-google-auth
      // 2. Configure OAuth client IDs in capacitor.config.ts
      // 3. Get ID token from Google
      // 4. Send to backend
      
      console.log('Google OAuth: Opening Google Sign-In...');
      // const googleUser = await GoogleAuth.signIn();
      // const { authentication } = googleUser;
      // await authenticateWithGoogle(authentication.idToken);
      // history.push('/home');
      
      alert('Google Sign-In: Requiere configuración de OAuth Client ID. Ver docs/AUTHENTICATION_GUIDE.md');
    } catch (error) {
      console.error('Google auth error:', error);
      alert('Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    try {
      setLoading(true);
      // Apple Sign-In using Capacitor plugin
      // For native implementation, use @capacitor-community/apple-sign-in
      
      // This is a placeholder - actual implementation requires:
      // 1. Install @capacitor-community/apple-sign-in
      // 2. Configure App ID and Service ID in Apple Developer Console
      // 3. Get identity token from Apple
      // 4. Send to backend
      
      console.log('Apple Sign-In: Opening Apple authentication...');
      // const result = await SignInWithApple.authorize();
      // const { identityToken, authorizationCode } = result.response;
      // await authenticateWithApple(identityToken, authorizationCode);
      // history.push('/home');
      
      alert('Apple Sign-In: Requiere configuración de Service ID. Ver docs/AUTHENTICATION_GUIDE.md');
    } catch (error) {
      console.error('Apple auth error:', error);
      alert('Error al iniciar sesión con Apple');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    try {
      setLoading(true);
      await startGuestMode();
      history.push('/home');
    } catch (error) {
      console.error('Failed to start guest mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    history.push('/auth/login');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="auth-content">
        <div className="auth-container">
          {/* Logo and Branding */}
          <div className="auth-header">
            <div className="auth-logo">
              <span role="img" aria-label="Logo LOTOLINK" style={{ fontSize: '64px' }}>
                🎰
              </span>
            </div>
            <h1 className="auth-title">LOTOLINK</h1>
            <p className="auth-slogan">Tu suerte, en tus manos</p>
          </div>

          {/* Auth Methods */}
          <div className="auth-methods">
            <IonButton
              expand="block"
              className="auth-button auth-button-phone"
              onClick={handlePhoneAuth}
              disabled={loading}
            >
              <IonIcon slot="start" icon={phonePortrait} />
              Continuar con Teléfono
            </IonButton>

            <IonButton
              expand="block"
              className="auth-button auth-button-google"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <IonIcon slot="start" icon={logoGoogle} />
              Continuar con Google
            </IonButton>

            <IonButton
              expand="block"
              className="auth-button auth-button-apple"
              onClick={handleAppleAuth}
              disabled={loading}
            >
              <IonIcon slot="start" icon={logoApple} />
              Continuar con Apple
            </IonButton>

            <IonButton
              expand="block"
              className="auth-button auth-button-email"
              onClick={handleEmailAuth}
              disabled={loading}
            >
              <IonIcon slot="start" icon={mail} />
              Continuar con Email
            </IonButton>
          </div>

          {/* Login Link */}
          <div className="auth-footer">
            <IonText color="medium">
              <p>
                ¿Ya tienes cuenta?{' '}
                <a href="#" onClick={handleLogin} className="auth-link">
                  Iniciar Sesión
                </a>
              </p>
            </IonText>

            {/* Guest Mode Link */}
            <IonButton
              fill="clear"
              expand="block"
              className="auth-guest-button"
              onClick={handleGuestMode}
              disabled={loading}
            >
              👀 Explorar sin registrarme
            </IonButton>
          </div>

          {/* Legal Notice */}
          <div className="auth-legal">
            <IonText color="medium">
              <p style={{ fontSize: '11px', textAlign: 'center' }}>
                Al continuar, aceptas nuestros{' '}
                <a href="/legal/terms-conditions" className="auth-link">
                  Términos y Condiciones
                </a>{' '}
                y{' '}
                <a href="/legal/privacy-policy" className="auth-link">
                  Política de Privacidad
                </a>
              </p>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthScreen;
