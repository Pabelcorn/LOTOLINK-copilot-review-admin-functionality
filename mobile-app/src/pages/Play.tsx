import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonChip,
  IonBackButton,
  IonButtons,
  IonToast,
  IonSpinner
} from '@ionic/react';
import { shuffle, cart } from 'ionicons/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

interface GameType {
  id: string;
  name: string;
  icon: string;
  description: string;
  pickCount: number;
  prize: string;
}

const gameTypes: GameType[] = [
  { id: 'quiniela', name: 'Quiniela', icon: '🎯', description: '1 número', pickCount: 1, prize: '60x' },
  { id: 'pale', name: 'Palé', icon: '🎰', description: '2 números', pickCount: 2, prize: '1,000x' },
  { id: 'tripleta', name: 'Tripleta', icon: '🎲', description: '3 números', pickCount: 3, prize: '20,000x' },
];

const Play: React.FC = () => {
  const { lotteryId = 'leidsa' } = useParams<{ lotteryId: string }>();
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [amount] = useState(10);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      // Haptics not available in browser
    }
  };

  const toggleNumber = async (num: number) => {
    if (!selectedGameType) return;
    
    const index = selectedNumbers.indexOf(num);
    if (index > -1) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
      await hapticFeedback(ImpactStyle.Light);
    } else if (selectedNumbers.length < selectedGameType.pickCount) {
      setSelectedNumbers([...selectedNumbers, num]);
      await hapticFeedback(ImpactStyle.Medium);
    } else {
      // Feedback for trying to select more than allowed
      await Haptics.notification({ type: NotificationType.Warning });
    }
  };

  const quickPick = async () => {
    if (!selectedGameType) return;
    const numbers: number[] = [];
    while (numbers.length < selectedGameType.pickCount) {
      const num = Math.floor(Math.random() * 100);
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    setSelectedNumbers(numbers);
    await hapticFeedback(ImpactStyle.Heavy);
  };

  const addToCart = async () => {
    if (selectedNumbers.length === selectedGameType?.pickCount) {
      setIsLoading(true);
      await hapticFeedback(ImpactStyle.Heavy);
      
      // TODO: Replace with actual API call to cart service
      // - POST /api/cart/add with lottery, game type, numbers, amount
      // - Handle errors and show appropriate messages
      // - Update cart count in app state
      setTimeout(() => {
        setShowToast(true);
        setSelectedNumbers([]);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleGameTypeSelection = async (gameType: GameType) => {
    setSelectedGameType(gameType);
    setSelectedNumbers([]);
    await hapticFeedback(ImpactStyle.Medium);
  };

  const lotteryName = lotteryId.charAt(0).toUpperCase() + lotteryId.slice(1);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-header">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/lotteries" text="Atrás" />
          </IonButtons>
          <IonTitle style={{ fontWeight: '700' }}>{lotteryName}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* Game Type Selection */}
        {!selectedGameType ? (
          <div className="game-type-grid">
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Selecciona el tipo de juego
            </h2>
            <p style={{ color: 'var(--ion-color-medium)', marginBottom: '24px' }}>
              ¿Cómo quieres jugar hoy?
            </p>
            
            {gameTypes.map((gameType) => (
              <IonCard
                key={gameType.id}
                className="premium-card"
                button
                onClick={() => handleGameTypeSelection(gameType)}
                style={{ marginBottom: '12px' }}
                aria-label={`Seleccionar ${gameType.name}, ${gameType.description}, premio hasta ${gameType.prize}`}
              >
                <IonCardContent>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #0071e3 0%, #5856d6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px'
                    }}
                    role="img"
                    aria-label={gameType.name}>
                      {gameType.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                        {gameType.name}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--ion-color-medium)', marginBottom: '8px' }}>
                        {gameType.description}
                      </div>
                      <IonChip color="success" style={{ margin: 0 }}>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>
                          💰 Ganas hasta {gameType.prize}
                        </span>
                      </IonChip>
                    </div>
                    <div style={{ fontSize: '24px', color: 'var(--ion-color-primary)' }} aria-hidden="true">
                      →
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px 16px 120px' }}>
            {/* Game Info */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                  {selectedGameType.name}
                </h2>
                <p style={{ color: 'var(--ion-color-medium)', margin: 0, fontSize: '14px' }}>
                  Selecciona {selectedGameType.pickCount} número(s)
                </p>
              </div>
              <IonButton fill="clear" onClick={() => setSelectedGameType(null)}>
                Cambiar
              </IonButton>
            </div>

            {/* Selected Numbers */}
            <IonCard className="glass-card" style={{ marginBottom: '16px' }}>
              <IonCardContent>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', marginBottom: '8px' }}>
                    Números seleccionados
                  </div>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    fontFamily: 'monospace',
                    color: 'var(--ion-color-primary)',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-live="polite"
                  aria-atomic="true">
                    {selectedNumbers.length > 0 
                      ? selectedNumbers.map(n => n.toString().padStart(2, '0')).join(' - ')
                      : '---'
                    }
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', marginTop: '4px' }}>
                    {selectedNumbers.length} de {selectedGameType.pickCount}
                  </div>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Quick Pick Button */}
            <IonButton 
              expand="block" 
              fill="outline" 
              onClick={quickPick}
              style={{ '--border-radius': '12px', marginBottom: '16px' }}
              aria-label="Seleccionar números al azar"
            >
              <IonIcon slot="start" icon={shuffle} />
              Al Azar
            </IonButton>

            {/* Number Grid */}
            <div className="number-grid" role="group" aria-label="Cuadrícula de números para seleccionar">
              {Array.from({ length: 100 }, (_, i) => i).map((num) => (
                <button
                  key={num}
                  className={`number-button ${selectedNumbers.includes(num) ? 'selected' : ''}`}
                  onClick={() => toggleNumber(num)}
                  aria-label={`Número ${num.toString().padStart(2, '0')}${selectedNumbers.includes(num) ? ', seleccionado' : ''}`}
                  aria-pressed={selectedNumbers.includes(num)}
                >
                  {num.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Cart Bar */}
        {selectedGameType && (
          <div style={{
            position: 'fixed',
            bottom: 'calc(65px + env(safe-area-inset-bottom))',
            left: 0,
            right: 0,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--glass-border)',
            padding: '12px 16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            zIndex: 1000
          }}
          role="toolbar"
          aria-label="Barra de carrito de compras">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>
                Total a pagar
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ion-color-primary)' }}>
                RD$ {amount}
              </div>
            </div>
            <IonButton
              expand="block"
              onClick={addToCart}
              disabled={selectedNumbers.length !== selectedGameType.pickCount || isLoading}
              style={{ 
                '--border-radius': '12px',
                flex: 1
              }}
              aria-label={`Agregar jugada al carrito, ${selectedNumbers.length} de ${selectedGameType.pickCount} números seleccionados`}
            >
              {isLoading ? (
                <IonSpinner name="crescent" />
              ) : (
                <>
                  <IonIcon slot="start" icon={cart} />
                  Agregar al Carrito
                </>
              )}
            </IonButton>
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="¡Jugada agregada al carrito!"
          duration={2000}
          position="top"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Play;
