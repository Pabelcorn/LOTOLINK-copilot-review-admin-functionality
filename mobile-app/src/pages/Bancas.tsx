import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonSearchbar,
  IonIcon,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/react';
import { location, time, call } from 'ionicons/icons';
import { useState } from 'react';

interface Banca {
  id: number;
  name: string;
  address: string;
  hours: string;
  phone: string;
  distance?: string;
}

const bancas: Banca[] = [
  { 
    id: 1, 
    name: 'Loteka - Av. Duarte', 
    address: 'Av. Duarte #123, Santo Domingo',
    hours: 'Abierta hasta las 8:00 PM',
    phone: '+1 809-555-0101',
    distance: '0.5 km'
  },
  { 
    id: 2, 
    name: 'Leidsa - Plaza Central', 
    address: 'Plaza Central, Local 45',
    hours: 'Abierta hasta las 8:55 PM',
    phone: '+1 809-555-0102',
    distance: '1.2 km'
  },
  { 
    id: 3, 
    name: 'La Primera - Zona Colonial', 
    address: 'Calle El Conde #67, Zona Colonial',
    hours: 'Abierta hasta las 8:00 PM',
    phone: '+1 809-555-0103',
    distance: '2.1 km'
  },
  { 
    id: 4, 
    name: 'Lotería Nacional - Naco', 
    address: 'Av. Tiradentes, Naco',
    hours: 'Abierta hasta las 6:00 PM',
    phone: '+1 809-555-0104',
    distance: '3.5 km'
  },
];

const Bancas: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredBancas = bancas.filter(banca =>
    banca.name.toLowerCase().includes(searchText.toLowerCase()) ||
    banca.address.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-header">
          <IonTitle style={{ fontWeight: '700' }}>Bancas</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value || '')}
            placeholder="Buscar banca..."
            animated
          />
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={viewMode} onIonChange={(e) => setViewMode(e.detail.value as 'list' | 'map')}>
            <IonSegmentButton value="list">
              <IonLabel>📋 Lista</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="map">
              <IonLabel>🗺️ Mapa</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {viewMode === 'list' ? (
          <div className="banca-list">
            {filteredBancas.map((banca) => (
              <IonCard key={banca.id} className="banca-card premium-card" button>
                <IonCardContent>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #0071e3 0%, #5856d6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      flexShrink: 0
                    }}>
                      🏪
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '700', 
                        marginBottom: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        {banca.name}
                        {banca.distance && (
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '600',
                            color: 'var(--ion-color-primary)',
                            background: 'rgba(0, 113, 227, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            {banca.distance}
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '13px', 
                        color: 'var(--ion-color-medium)',
                        marginBottom: '4px'
                      }}>
                        <IonIcon icon={location} />
                        {banca.address}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '13px', 
                        color: 'var(--ion-color-success)',
                        marginBottom: '8px'
                      }}>
                        <IonIcon icon={time} />
                        {banca.hours}
                      </div>
                      <IonButton
                        size="small"
                        fill="clear"
                        href={`tel:${banca.phone}`}
                        style={{ 
                          '--padding-start': '0',
                          margin: 0,
                          height: 'auto'
                        }}
                      >
                        <IonIcon slot="start" icon={call} />
                        Llamar
                      </IonButton>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
            
            {filteredBancas.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                color: 'var(--ion-color-medium)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  No se encontraron bancas
                </div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                  Intenta con otro término de búsqueda
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                Vista de Mapa
              </div>
              <div style={{ fontSize: '14px', color: 'var(--ion-color-medium)' }}>
                Integración con mapas nativo próximamente
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Bancas;
