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
import * as authService from '../../services/auth.service';
import OTPInput from '../../components/Auth/OTPInput';
import './../../styles/auth.css';

enum AuthStep {
  PHONE = 'phone',
  OTP = 'otp',
  PASSWORD = 'password',
}

const PhoneAuthScreen: React.FC = () => {
  const history = useHistory();
  const { register } = useAuth();

  const [step, setStep] = useState<AuthStep>(AuthStep.PHONE);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Por favor ingresa un número de teléfono válido');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.sendOtp(phone, 'registration');
      setToastMessage('Código OTP enviado a tu teléfono');
      setShowToast(true);
      setStep(AuthStep.OTP);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Por favor ingresa el código de 6 dígitos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await authService.verifyOtp(phone, otp, 'registration');
      
      if (result.success) {
        setToastMessage('Código verificado correctamente');
        setShowToast(true);
        setStep(AuthStep.PASSWORD);
      } else {
        setError('Código OTP inválido o expirado');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al verificar OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(name, phone, password);
      
      // Redirect to age verification
      history.push('/auth/verify-age');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const renderPhoneStep = () => (
    <div className="auth-step-content">
      <h2 className="auth-step-title">Ingresa tu número de teléfono</h2>
      <p className="auth-step-description">
        Te enviaremos un código de verificación por SMS
      </p>

      <IonInput
        type="tel"
        placeholder="+1 (809) 555-0123"
        value={phone}
        onIonInput={(e: any) => setPhone(e.target.value)}
        className="auth-input"
        disabled={loading}
      />

      {error && (
        <IonText color="danger">
          <p className="auth-error">{error}</p>
        </IonText>
      )}

      <IonButton
        expand="block"
        className="auth-button auth-button-phone"
        onClick={handleSendOtp}
        disabled={loading || !phone}
      >
        {loading ? <IonSpinner name="crescent" /> : 'Enviar Código'}
      </IonButton>
    </div>
  );

  const renderOtpStep = () => (
    <div className="auth-step-content">
      <h2 className="auth-step-title">Verifica tu teléfono</h2>
      <p className="auth-step-description">
        Ingresa el código de 6 dígitos que enviamos a {phone}
      </p>

      <OTPInput
        length={6}
        value={otp}
        onChange={setOtp}
        onComplete={handleVerifyOtp}
      />

      {error && (
        <IonText color="danger">
          <p className="auth-error">{error}</p>
        </IonText>
      )}

      <IonButton
        expand="block"
        className="auth-button auth-button-phone"
        onClick={handleVerifyOtp}
        disabled={loading || otp.length !== 6}
      >
        {loading ? <IonSpinner name="crescent" /> : 'Verificar Código'}
      </IonButton>

      <IonButton
        fill="clear"
        expand="block"
        onClick={() => setStep(AuthStep.PHONE)}
        disabled={loading}
      >
        Cambiar número
      </IonButton>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="auth-step-content">
      <h2 className="auth-step-title">Completa tu registro</h2>
      <p className="auth-step-description">
        Crea tu cuenta LOTOLINK
      </p>

      <IonInput
        type="text"
        placeholder="Nombre completo"
        value={name}
        onIonInput={(e: any) => setName(e.target.value)}
        className="auth-input"
        disabled={loading}
      />

      <IonInput
        type="password"
        placeholder="Contraseña (mínimo 8 caracteres)"
        value={password}
        onIonInput={(e: any) => setPassword(e.target.value)}
        className="auth-input"
        disabled={loading}
      />

      {error && (
        <IonText color="danger">
          <p className="auth-error">{error}</p>
        </IonText>
      )}

      <IonButton
        expand="block"
        className="auth-button auth-button-phone"
        onClick={handleRegister}
        disabled={loading || !name || !password}
      >
        {loading ? <IonSpinner name="crescent" /> : 'Crear Cuenta'}
      </IonButton>
    </div>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/auth" />
          </IonButtons>
          <IonTitle>Registro con Teléfono</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="auth-content">
        <div className="auth-container">
          {step === AuthStep.PHONE && renderPhoneStep()}
          {step === AuthStep.OTP && renderOtpStep()}
          {step === AuthStep.PASSWORD && renderPasswordStep()}
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default PhoneAuthScreen;
