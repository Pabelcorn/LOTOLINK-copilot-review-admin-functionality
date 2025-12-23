import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonSpinner,
  IonAlert,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { 
  card as cardIcon, 
  add, 
  trash, 
  checkmarkCircle,
  close,
} from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { 
  createCardToken, 
  validateCardNumber, 
  validateExpiry, 
  validateCvc,
  formatCardNumber as formatCardNumberHelper,
  formatExpiry as formatExpiryHelper,
} from '../services/stripe.service';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

const PaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call when backend authentication is integrated
      // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      // const userId = 'user_123'; // Get from auth context
      // const response = await fetch(`${apiUrl}/api/v1/users/${userId}/payment-methods`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const methods = await response.json();
      
      // Mock data for demonstration
      // This will be replaced when authentication is fully integrated
      const mockMethods: PaymentMethod[] = [
        {
          id: 'pm_1',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
        },
        {
          id: 'pm_2',
          type: 'card',
          last4: '5555',
          brand: 'mastercard',
          expiryMonth: 8,
          expiryYear: 2026,
          isDefault: false,
        },
      ];
      
      setPaymentMethods(mockMethods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setToastMessage('Error al cargar métodos de pago');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!cardNumber || !cardExpiry || !cardCvc || !cardholderName) {
      setToastMessage('Por favor complete todos los campos');
      setShowToast(true);
      return;
    }

    // Validate card number
    if (!validateCardNumber(cardNumber)) {
      setToastMessage('Número de tarjeta inválido');
      setShowToast(true);
      return;
    }

    // Parse expiry
    const [expMonth, expYear] = cardExpiry.split('/').map(s => parseInt(s.trim()));
    if (!validateExpiry(expMonth, expYear)) {
      setToastMessage('Fecha de vencimiento inválida');
      setShowToast(true);
      return;
    }

    // Validate CVC
    if (!validateCvc(cardCvc)) {
      setToastMessage('Código CVC inválido');
      setShowToast(true);
      return;
    }

    try {
      setSubmitting(true);
      await Haptics.impact({ style: ImpactStyle.Medium });

      // Tokenize card details using server-side tokenization
      // This creates the payment method directly on the backend
      const tokenResult = await createCardToken({
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear < 100 ? 2000 + expYear : expYear,
        cvc: cardCvc,
        name: cardholderName,
      });

      if (!tokenResult.success) {
        setToastMessage(tokenResult.error || 'Error al procesar la tarjeta');
        setShowToast(true);
        return;
      }

      // Payment method was created on the backend during tokenization
      // Reload the payment methods list to show the new card
      await loadPaymentMethods();
      
      setShowAddModal(false);
      resetForm();
      setToastMessage('Tarjeta agregada exitosamente');
      setShowToast(true);
      
    } catch (error) {
      console.error('Error adding card:', error);
      setToastMessage(error instanceof Error ? error.message : 'Error al agregar tarjeta');
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCard = async (methodId: string) => {
    setSelectedMethodId(methodId);
    setShowDeleteAlert(true);
  };

  const confirmDeleteCard = async () => {
    if (!selectedMethodId) return;

    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      
      // TODO: API call to delete
      // await fetch(`/api/v1/users/me/payment-methods/${selectedMethodId}`, {
      //   method: 'DELETE',
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      setPaymentMethods(paymentMethods.filter(m => m.id !== selectedMethodId));
      setToastMessage('Tarjeta eliminada');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting card:', error);
      setToastMessage('Error al eliminar tarjeta');
      setShowToast(true);
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardholderName('');
    setSetAsDefault(false);
  };

  const formatCardNumber = (value: string) => {
    return formatCardNumberHelper(value);
  };

  const formatExpiry = (value: string) => {
    return formatExpiryHelper(value);
  };

  const getBrandIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '🔵'; // Blue circle for Visa
      case 'mastercard':
        return '🔴'; // Red circle for Mastercard
      case 'amex':
      case 'american express':
        return '🟢'; // Green circle for Amex
      case 'discover':
        return '🟠'; // Orange circle for Discover
      case 'diners':
      case 'diners club':
        return '⚪'; // White circle for Diners
      case 'jcb':
        return '🟣'; // Purple circle for JCB
      case 'unionpay':
        return '🔵'; // Blue for UnionPay
      default:
        return '💳'; // Generic card
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-header">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle style={{ fontWeight: '700' }}>Métodos de Pago</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <div style={{ padding: '16px' }}>
          {/* Add Card Button */}
          <IonButton
            expand="block"
            onClick={() => {
              Haptics.impact({ style: ImpactStyle.Light });
              setShowAddModal(true);
            }}
            style={{ '--border-radius': '12px', marginBottom: '16px' }}
          >
            <IonIcon slot="start" icon={add} />
            Agregar Tarjeta
          </IonButton>

          {/* Payment Methods List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <IonSpinner name="crescent" />
            </div>
          ) : paymentMethods.length === 0 ? (
            <IonCard className="glass-card">
              <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
                <IonIcon 
                  icon={cardIcon} 
                  style={{ fontSize: '64px', color: 'var(--ion-color-medium)', marginBottom: '16px' }} 
                />
                <div style={{ color: 'var(--ion-color-medium)' }}>
                  No tienes tarjetas registradas
                </div>
              </IonCardContent>
            </IonCard>
          ) : (
            <IonList>
              {paymentMethods.map((method) => (
                <IonCard key={method.id} className="premium-card" style={{ marginBottom: '12px' }}>
                  <IonItem lines="none" className="ion-no-padding">
                    <div slot="start" style={{ fontSize: '32px', padding: '0 8px' }}>
                      {getBrandIcon(method.brand)}
                    </div>
                    <IonLabel>
                      <h2 style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                        {method.brand || 'Tarjeta'} •••• {method.last4}
                      </h2>
                      <p>
                        Vence {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                      </p>
                      {method.isDefault && (
                        <div 
                          className="premium-badge" 
                          style={{ 
                            marginTop: '8px', 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <IonIcon icon={checkmarkCircle} style={{ fontSize: '14px' }} />
                          Predeterminada
                        </div>
                      )}
                    </IonLabel>
                    <IonButton
                      fill="clear"
                      color="danger"
                      slot="end"
                      onClick={() => handleDeleteCard(method.id)}
                    >
                      <IonIcon slot="icon-only" icon={trash} />
                    </IonButton>
                  </IonItem>
                </IonCard>
              ))}
            </IonList>
          )}

          {/* Security Notice */}
          <IonCard className="glass-card" style={{ marginTop: '24px' }}>
            <IonCardContent>
              <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', textAlign: 'center' }}>
                🔒 Tus datos de pago están protegidos con encriptación de nivel bancario.
                Procesamos pagos a través de Stripe, certificado PCI DSS nivel 1.
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Add Card Modal */}
        <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Agregar Tarjeta</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowAddModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{ padding: '16px' }}>
              <IonCard className="premium-card">
                <IonCardContent>
                  <IonList lines="none">
                    <IonItem>
                      <IonLabel position="stacked">Número de Tarjeta</IonLabel>
                      <IonInput
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onIonChange={(e) => setCardNumber(formatCardNumber(e.detail.value!))}
                        maxlength={19}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="stacked">Nombre del Titular</IonLabel>
                      <IonInput
                        type="text"
                        placeholder="Como aparece en la tarjeta"
                        value={cardholderName}
                        onIonChange={(e) => setCardholderName(e.detail.value!)}
                      />
                    </IonItem>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <IonItem style={{ flex: 1 }}>
                        <IonLabel position="stacked">Vencimiento</IonLabel>
                        <IonInput
                          type="text"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onIonChange={(e) => setCardExpiry(formatExpiry(e.detail.value!))}
                          maxlength={5}
                        />
                      </IonItem>

                      <IonItem style={{ flex: 1 }}>
                        <IonLabel position="stacked">CVC</IonLabel>
                        <IonInput
                          type="text"
                          placeholder="123"
                          value={cardCvc}
                          onIonChange={(e) => setCardCvc(e.detail.value!.replace(/\D/g, '').slice(0, 4))}
                          maxlength={4}
                        />
                      </IonItem>
                    </div>

                    <IonItem>
                      <IonLabel>Establecer como predeterminada</IonLabel>
                      <IonSelect 
                        value={setAsDefault} 
                        onIonChange={(e) => setSetAsDefault(e.detail.value)}
                      >
                        <IonSelectOption value={false}>No</IonSelectOption>
                        <IonSelectOption value={true}>Sí</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>

              <IonButton
                expand="block"
                onClick={handleAddCard}
                disabled={submitting}
                style={{ '--border-radius': '12px', marginTop: '16px' }}
              >
                {submitting ? <IonSpinner name="crescent" /> : 'Agregar Tarjeta'}
              </IonButton>

              <div style={{ 
                fontSize: '12px', 
                color: 'var(--ion-color-medium)', 
                textAlign: 'center',
                marginTop: '16px',
              }}>
                🔒 Conexión segura. Tu información está protegida.
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Eliminar Tarjeta"
          message="¿Estás seguro que deseas eliminar esta tarjeta?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: confirmDeleteCard,
            },
          ]}
        />

        {/* Toast */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default PaymentMethods;
