import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonSearchbar,
  IonIcon
} from '@ionic/react';
import { time } from 'ionicons/icons';
import { useState } from 'react';

interface Lottery {
  id: string;
  name: string;
  color: string;
  schedule: string;
  logoText: string;
}

const lotteries: Lottery[] = [
  { id: 'leidsa', name: 'Leidsa', color: '#FFD700', schedule: 'Hoy 8:55 PM (dom: 3:55 PM)', logoText: 'LD' },
  { id: 'loteka', name: 'Loteka', color: '#00B0DB', schedule: 'Hoy 7:55 PM (diario)', logoText: 'LK' },
  { id: 'laprimera', name: 'La Primera', color: '#C81F46', schedule: 'Hoy 8:00 PM (y 12:00 PM)', logoText: 'LP' },
  { id: 'nacional', name: 'Lotería Nacional', color: '#496079', schedule: 'Gana Más: 2:30 PM — Lotería: 9:00 PM', logoText: 'LN' },
  { id: 'real', name: 'Lotería Real', color: '#008000', schedule: 'Hoy 12:55 PM (varios sorteos)', logoText: 'LR' },
  { id: 'lasuerte', name: 'La Suerte Dominicana', color: '#FFA500', schedule: '12:30 PM y 6:00 PM (Diario)', logoText: 'LS' },
];

const Lotteries: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  const filteredLotteries = lotteries.filter(lottery =>
    lottery.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-header">
          <IonTitle style={{ fontWeight: '700' }}>Loterías</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value || '')}
            placeholder="Buscar lotería..."
            animated
          />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '16px 16px 100px 16px' }}>
          {filteredLotteries.map((lottery) => (
            <IonCard
              key={lottery.id}
              className="lottery-card"
              routerLink={`/play/${lottery.id}`}
              button
            >
              <IonCardHeader>
                <IonCardTitle>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      className="lottery-logo"
                      style={{ background: lottery.color }}
                    >
                      {lottery.logoText}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                        {lottery.name}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '13px', 
                        color: 'var(--ion-color-medium)',
                        fontWeight: '400'
                      }}>
                        <IonIcon icon={time} style={{ fontSize: '16px' }} />
                        {lottery.schedule}
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', color: 'var(--ion-color-primary)' }}>
                      →
                    </div>
                  </div>
                </IonCardTitle>
              </IonCardHeader>
            </IonCard>
          ))}
          
          {filteredLotteries.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: 'var(--ion-color-medium)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                No se encontraron loterías
              </div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Intenta con otro término de búsqueda
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Lotteries;
