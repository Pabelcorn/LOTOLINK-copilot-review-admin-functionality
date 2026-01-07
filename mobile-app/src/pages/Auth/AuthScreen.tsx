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

  const handleGoogleAuth = () => {
    // TODO: Implement Google OAuth
    console.log('Google auth not yet implemented');
  };

  const handleAppleAuth = () => {
    // TODO: Implement Apple Sign In
    console.log('Apple auth not yet implemented');
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
