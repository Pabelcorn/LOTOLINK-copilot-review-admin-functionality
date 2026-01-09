import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonLoading,
  IonToast,
  IonBackButton,
  IonButtons,
  IonIcon,
} from '@ionic/react';
import { trophyOutline, cashOutline, cardOutline, walletOutline } from 'ionicons/icons';
import { getPrizeById, claimPrize, BankAccountInfo } from '../services/prizes.service';

interface Prize {
  id: string;
  playId: string;
  prizeAmount: number;
  status: string;
  claimedAt?: Date;
  paymentMethod?: string;
}

const ClaimPrize: React.FC = () => {
  const { prizeId } = useParams<{ prizeId: string }>();
  const navigate = useNavigate();
  
  const [prize, setPrize] = useState<Prize | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash' | 'wallet'>('wallet');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPrize();
  }, [prizeId]);

  const loadPrize = async () => {
    try {
      setLoading(true);
      const data = await getPrizeById(prizeId);
      setPrize(data as any);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el premio');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (paymentMethod === 'bank_transfer' && (!bankName || !bankAccount || !accountHolder)) {
      setError('Por favor complete todos los campos bancarios');
      return;
    }

    try {
      setSubmitting(true);
      const bankInfo: BankAccountInfo | undefined = paymentMethod === 'bank_transfer' 
        ? { bank: bankName, account: bankAccount, holder: accountHolder }
        : undefined;
      
      await claimPrize(prizeId, paymentMethod, bankInfo);
      setSuccess(true);
      
      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al reclamar el premio');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonLoading isOpen={loading} message="Cargando..." />
      </IonPage>
    );
  }

  if (!prize) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/my-tickets" />
            </IonButtons>
            <IonTitle>Premio No Encontrado</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>No se pudo cargar la información del premio</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/my-tickets" />
          </IonButtons>
          <IonTitle>Cobrar Premio</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle className="ion-text-center">
              <IonIcon icon={trophyOutline} size="large" color="warning" />
              <h2>¡Felicidades!</h2>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="ion-text-center">
              <h1 style={{ color: 'var(--ion-color-success)', margin: '20px 0' }}>
                RD$ {prize.prizeAmount.toFixed(2)}
              </h1>
              <p>ID del Premio: {prize.id.substring(0, 8)}</p>
            </div>
          </IonCardContent>
        </IonCard>

        {prize.status === 'pending' ? (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Método de Pago</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel>Seleccione método de pago</IonLabel>
                  <IonSelect 
                    value={paymentMethod} 
                    onIonChange={e => setPaymentMethod(e.detail.value)}
                  >
                    <IonSelectOption value="wallet">
                      <IonIcon icon={walletOutline} /> Wallet (Billetera)
                    </IonSelectOption>
                    <IonSelectOption value="bank_transfer">
                      <IonIcon icon={cardOutline} /> Transferencia Bancaria
                    </IonSelectOption>
                    <IonSelectOption value="cash">
                      <IonIcon icon={cashOutline} /> Efectivo en Banca
                    </IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCardContent>
            </IonCard>

            {paymentMethod === 'bank_transfer' && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Información Bancaria</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel position="stacked">Banco</IonLabel>
                    <IonInput
                      value={bankName}
                      onIonChange={e => setBankName(e.detail.value || '')}
                      placeholder="Nombre del banco"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Número de Cuenta</IonLabel>
                    <IonInput
                      value={bankAccount}
                      onIonChange={e => setBankAccount(e.detail.value || '')}
                      placeholder="Número de cuenta"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Titular de la Cuenta</IonLabel>
                    <IonInput
                      value={accountHolder}
                      onIonChange={e => setAccountHolder(e.detail.value || '')}
                      placeholder="Nombre completo del titular"
                    />
                  </IonItem>
                </IonCardContent>
              </IonCard>
            )}

            <div className="ion-padding">
              <IonButton 
                expand="block" 
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Procesando...' : 'Reclamar Premio'}
              </IonButton>
            </div>
          </>
        ) : (
          <IonCard>
            <IonCardContent>
              <p className="ion-text-center">
                Este premio ya ha sido reclamado.
                <br />
                Estado: <strong>{prize.status}</strong>
              </p>
            </IonCardContent>
          </IonCard>
        )}

        <IonToast
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          message={error || ''}
          duration={3000}
          color="danger"
        />

        <IonToast
          isOpen={success}
          message="¡Premio reclamado exitosamente! Será procesado pronto."
          duration={2000}
          color="success"
        />

        <IonLoading isOpen={submitting} message="Enviando solicitud..." />
      </IonContent>
    </IonPage>
  );
};

export default ClaimPrize;
