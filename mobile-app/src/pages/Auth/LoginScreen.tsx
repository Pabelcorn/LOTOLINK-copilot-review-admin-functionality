import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonInput,
  IonText,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSecretModal from '../../components/Auth/AdminSecretModal';
import './styles.css';

const LoginScreen: React.FC = () => {
  const history = useHistory();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Admin secret modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminSecretCode, setAdminSecretCode] = useState('');

  // Check if phone matches admin secret codes
  const ADMIN_SECRET_CODES = ['LOT20041227', 'LOTOLINK2024'];

  const checkAdminSecret = (phoneInput: string): boolean => {
    return ADMIN_SECRET_CODES.includes(phoneInput);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    
    // Check for admin secret code
    if (checkAdminSecret(value)) {
      setAdminSecretCode(value);
      setShowAdminModal(true);
    }
  };

  const handleAdminSuccess = (accessToken: string, accessLevel: string) => {
    // Redirect to admin panel
    window.location.href = '/admin-panel.html';
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(phone, password);
      
      setToastMessage('Inicio de sesión exitoso');
      setShowToast(true);

      // Redirect to home
      setTimeout(() => {
        history.push('/home');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    history.push('/auth');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/auth" />
          </IonButtons>
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="auth-content">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">
              <span role="img" aria-label="Logo LOTOLINK" style={{ fontSize: '64px' }}>
                🎰
              </span>
            </div>
            <h2 className="auth-step-title">Bienvenido de nuevo</h2>
            <p className="auth-step-description">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <div className="auth-step-content">
            <IonInput
              type="tel"
              placeholder="Teléfono"
              value={phone}
              onIonInput={(e: any) => handlePhoneChange(e.target.value)}
              className="auth-input"
              disabled={loading}
            />

            <IonInput
              type="password"
              placeholder="Contraseña"
              value={password}
              onIonInput={(e: any) => setPassword(e.target.value)}
              className="auth-input"
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />

            {error && (
              <IonText color="danger">
                <p className="auth-error">{error}</p>
              </IonText>
            )}

            <IonButton
              expand="block"
              className="auth-button auth-button-phone"
              onClick={handleLogin}
              disabled={loading || !phone || !password}
            >
              {loading ? <IonSpinner name="crescent" /> : 'Iniciar Sesión'}
            </IonButton>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <IonText color="medium">
                <p style={{ margin: '0 0 16px 0', fontSize: '15px' }}>
                  ¿No tienes cuenta?{' '}
                  <a href="#" onClick={handleRegister} className="auth-link">
                    Regístrate
                  </a>
                </p>
              </IonText>

              <IonButton fill="clear" size="small">
                ¿Olvidaste tu contraseña?
              </IonButton>
            </div>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
          color="success"
        />

        {/* Hidden Admin Secret Modal */}
        <AdminSecretModal
          isOpen={showAdminModal}
          onDismiss={() => {
            setShowAdminModal(false);
            setPhone('');
            setAdminSecretCode('');
          }}
          secretCode={adminSecretCode}
          onSuccess={handleAdminSuccess}
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginScreen;
