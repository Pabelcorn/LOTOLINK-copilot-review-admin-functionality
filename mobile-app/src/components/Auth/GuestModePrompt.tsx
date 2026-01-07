import {
  IonModal,
  IonButton,
  IonText,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import '../pages/Auth/styles.css';

interface GuestModePromptProps {
  isOpen: boolean;
  onDismiss: () => void;
  title?: string;
  message?: string;
  selectionDetails?: {
    lottery: string;
    numbers: string;
    amount: string;
  };
}

const GuestModePrompt: React.FC<GuestModePromptProps> = ({
  isOpen,
  onDismiss,
  title = '🎫 ¡Excelente selección!',
  message = 'Para guardar tu ticket y poder cobrar tus premios, necesitas una cuenta.',
  selectionDetails,
}) => {
  const history = useHistory();

  const handleRegister = () => {
    onDismiss();
    history.push('/auth');
  };

  const handleContinueExploring = () => {
    onDismiss();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="guest-prompt-modal">
      <div className="guest-prompt-content">
        <div className="guest-prompt-icon">{title.split(' ')[0]}</div>
        
        <h2 className="guest-prompt-title">
          {title.split(' ').slice(1).join(' ')}
        </h2>

        <p className="guest-prompt-message">{message}</p>

        {selectionDetails && (
          <div className="guest-prompt-selection">
            <div className="guest-prompt-selection-title">Tu selección:</div>
            <div className="guest-prompt-selection-item">
              <span>{selectionDetails.lottery}</span>
            </div>
            <div className="guest-prompt-selection-item">
              <span>Números:</span>
              <strong>{selectionDetails.numbers}</strong>
            </div>
            <div className="guest-prompt-selection-item">
              <span>Monto:</span>
              <strong>{selectionDetails.amount}</strong>
            </div>
          </div>
        )}

        <div className="guest-prompt-actions">
          <IonButton
            expand="block"
            className="auth-button auth-button-phone"
            onClick={handleRegister}
          >
            📱 Registrarme ahora
          </IonButton>

          <IonButton
            expand="block"
            fill="outline"
            onClick={handleContinueExploring}
          >
            ⏸️ Continuar explorando
          </IonButton>
        </div>
      </div>
    </IonModal>
  );
};

export default GuestModePrompt;
