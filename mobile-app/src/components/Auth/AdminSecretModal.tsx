import {
  IonModal,
  IonButton,
  IonInput,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { useState } from 'react';
import * as authService from '../../services/auth.service';
import '../../styles/auth.css';

interface AdminSecretModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  secretCode: string;
  onSuccess: (accessToken: string, accessLevel: string) => void;
}

const AdminSecretModal: React.FC<AdminSecretModalProps> = ({
  isOpen,
  onDismiss,
  secretCode,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await authService.validateAdminSecret(
        secretCode,
        username,
        password
      );

      if (result.success && result.accessToken && result.accessLevel) {
        onSuccess(result.accessToken, result.accessLevel);
        onDismiss();
      } else {
        setError('Credenciales de administrador inválidas');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al validar credenciales');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setError('');
    onDismiss();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleCancel} className="admin-secret-modal">
      <div className="admin-secret-content">
        <div className="admin-secret-header">
          <div className="admin-secret-icon">🔐</div>
          <h2 className="admin-secret-title">Acceso Administrativo</h2>
        </div>

        <div className="admin-secret-form">
          <IonInput
            type="text"
            placeholder="Usuario"
            value={username}
            onIonInput={(e: any) => setUsername(e.target.value)}
            className="admin-secret-input"
            disabled={loading}
          />

          <IonInput
            type="password"
            placeholder="Contraseña"
            value={password}
            onIonInput={(e: any) => setPassword(e.target.value)}
            className="admin-secret-input"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />

          {error && (
            <IonText color="danger">
              <p style={{ fontSize: '14px', margin: '0' }}>{error}</p>
            </IonText>
          )}

          <div className="admin-secret-buttons">
            <IonButton
              expand="block"
              onClick={handleCancel}
              fill="outline"
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancelar
            </IonButton>

            <IonButton
              expand="block"
              onClick={handleSubmit}
              disabled={loading || !username || !password}
              style={{ flex: 1 }}
            >
              {loading ? <IonSpinner name="crescent" /> : 'Acceder'}
            </IonButton>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default AdminSecretModal;
