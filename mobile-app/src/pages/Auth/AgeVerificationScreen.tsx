import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonCheckbox,
  IonText,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/auth.service';
import './styles.css';

const AgeVerificationScreen: React.FC = () => {
  const history = useHistory();
  const { user, refreshUser } = useAuth();

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [confirmAge, setConfirmAge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const validateDate = (): boolean => {
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (isNaN(d) || isNaN(m) || isNaN(y)) {
      setError('Por favor ingresa una fecha válida');
      return false;
    }

    if (d < 1 || d > 31) {
      setError('Día inválido');
      return false;
    }

    if (m < 1 || m > 12) {
      setError('Mes inválido');
      return false;
    }

    const currentYear = new Date().getFullYear();
    if (y < 1900 || y > currentYear) {
      setError('Año inválido');
      return false;
    }

    return true;
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleVerifyAge = async () => {
    if (!validateDate()) {
      return;
    }

    if (!confirmAge) {
      setError('Debes confirmar que tienes 18 años o más');
      return;
    }

    if (!acceptTerms || !acceptPrivacy) {
      setError('Debes aceptar los términos y condiciones y la política de privacidad');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create birth date
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const age = calculateAge(birthDate);

      if (age < 18) {
        setError('Debes tener 18 años o más para usar LOTOLINK');
        return;
      }

      // Format date as ISO string
      const birthDateStr = birthDate.toISOString().split('T')[0];

      // Verify age with backend
      await authService.verifyAge(
        user?.id || '',
        birthDateStr,
        acceptTerms,
        acceptPrivacy
      );

      setToastMessage('Edad verificada correctamente');
      setShowToast(true);

      // Refresh user data
      await refreshUser();

      // Redirect to home
      setTimeout(() => {
        history.push('/home');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al verificar edad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Verificación de Edad</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="auth-content">
        <div className="age-verification-container">
          <div className="auth-header" style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
              📅
            </div>
            <h2 className="auth-step-title">Fecha de Nacimiento</h2>
            <p className="auth-step-description">
              Ingresa tu fecha de nacimiento para continuar
            </p>
          </div>

          <div className="age-input-group">
            <input
              type="tel"
              className="age-input"
              placeholder="DD"
              maxLength={2}
              value={day}
              onChange={(e) => setDay(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
            />
            <span className="age-separator">/</span>
            <input
              type="tel"
              className="age-input"
              placeholder="MM"
              maxLength={2}
              value={month}
              onChange={(e) => setMonth(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
            />
            <span className="age-separator">/</span>
            <input
              type="tel"
              className="age-input"
              placeholder="AAAA"
              maxLength={4}
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
            />
          </div>

          <div className="age-warning">
            <div className="age-warning-icon">⚠️</div>
            <div className="age-warning-text">
              <strong>Debes ser mayor de 18 años para usar LOTOLINK</strong>
              <br />
              (Requisito legal de República Dominicana)
            </div>
          </div>

          <div className="age-checkbox-list">
            <div className="age-checkbox-item">
              <IonCheckbox
                checked={confirmAge}
                onIonChange={(e) => setConfirmAge(e.detail.checked)}
                disabled={loading}
              />
              <span className="age-checkbox-label">
                ☑️ Confirmo que tengo 18 años o más
              </span>
            </div>

            <div className="age-checkbox-item">
              <IonCheckbox
                checked={acceptTerms}
                onIonChange={(e) => setAcceptTerms(e.detail.checked)}
                disabled={loading}
              />
              <span className="age-checkbox-label">
                ☑️ Acepto los{' '}
                <a href="/legal/terms-conditions" target="_blank" className="auth-link">
                  Términos y Condiciones
                </a>
              </span>
            </div>

            <div className="age-checkbox-item">
              <IonCheckbox
                checked={acceptPrivacy}
                onIonChange={(e) => setAcceptPrivacy(e.detail.checked)}
                disabled={loading}
              />
              <span className="age-checkbox-label">
                ☑️ Acepto la{' '}
                <a href="/legal/privacy-policy" target="_blank" className="auth-link">
                  Política de Privacidad
                </a>
              </span>
            </div>
          </div>

          {error && (
            <IonText color="danger">
              <p className="auth-error" style={{ textAlign: 'center' }}>{error}</p>
            </IonText>
          )}

          <IonButton
            expand="block"
            className="auth-button auth-button-phone"
            onClick={handleVerifyAge}
            disabled={loading || !day || !month || !year || !confirmAge || !acceptTerms || !acceptPrivacy}
            style={{ marginTop: '24px' }}
          >
            {loading ? <IonSpinner name="crescent" /> : 'CONTINUAR'}
          </IonButton>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default AgeVerificationScreen;
