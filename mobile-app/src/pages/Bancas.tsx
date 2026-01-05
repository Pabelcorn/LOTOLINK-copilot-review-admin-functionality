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
  IonLabel,
  IonButtons,
  IonMenuButton,
  IonSpinner
} from '@ionic/react';
import { location, time, call } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCurrentPosition, calculateDistance, formatDistance } from '../services/geolocation.service';
import { getBancas, Banca as BancaType } from '../services/bancas.service';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icon for bancas
const bancaIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMDA3MWUzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iIGZpbGw9IndoaXRlIj7wn4+qPC90ZXh0Pjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to recenter map
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
}

interface DisplayBanca {
  id: string;
  name: string;
  address: string;
  hours?: string;
  phone: string;
  distance?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const Bancas: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [bancas, setBancas] = useState<DisplayBanca[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBancasAndLocation();
  }, []);

  const loadBancasAndLocation = async () => {
    try {
      setLoading(true);
      
      // Get user location
      try {
        const position = await getCurrentPosition();
        setUserLocation({
          lat: position.coordinates.latitude,
          lng: position.coordinates.longitude,
        });
      } catch (err) {
        console.log('Could not get user location, using default');
        setUserLocation({ lat: 18.4861, lng: -69.9312 }); // Default to Santo Domingo
      }
      
      // Get bancas from API
      const response = await getBancas({ status: 'active' });
      
      // Transform to display format and calculate distances
      const displayBancas: DisplayBanca[] = response.bancas.map((banca: BancaType) => {
        let distance: string | undefined;
        
        if (userLocation && banca.location?.latitude && banca.location?.longitude) {
          const distKm = calculateDistance(
            { latitude: userLocation.lat, longitude: userLocation.lng },
            { latitude: banca.location.latitude, longitude: banca.location.longitude }
          );
          distance = formatDistance(distKm);
        }
        
        return {
          id: banca.id,
          name: banca.name,
          address: banca.address || 'Dirección no disponible',
          phone: banca.phone || 'Teléfono no disponible',
          hours: banca.hours ? `Abierta hasta las ${banca.hours.close}` : 'Horario no disponible',
          distance,
          location: banca.location,
        };
      });
      
      setBancas(displayBancas);
      
    } catch (err) {
      console.error('Error loading bancas:', err);
      setError('No se pudo cargar las bancas');
      // Default to Santo Domingo if location fails
      setUserLocation({ lat: 18.4861, lng: -69.9312 });
    } finally {
      setLoading(false);
    }
  };

  const filteredBancas = bancas.filter(banca =>
    banca.name.toLowerCase().includes(searchText.toLowerCase()) ||
    banca.address.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-header">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
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
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner />
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ion-color-danger)' }}>
              {error}
            </div>
          </div>
        ) : viewMode === 'list' ? (
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
                      {banca.hours && (
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
                      )}
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
          <div style={{ height: '100%', width: '100%' }}>
            {userLocation && (
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />
                
                {/* User location marker */}
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>📍 Tu ubicación</Popup>
                </Marker>
                
                {/* Banca markers */}
                {filteredBancas
                  .filter(b => b.location?.latitude && b.location?.longitude)
                  .map(banca => (
                    <Marker
                      key={banca.id}
                      position={[banca.location!.latitude, banca.location!.longitude]}
                      icon={bancaIcon}
                    >
                      <Popup>
                        <div style={{ minWidth: '200px' }}>
                          <h4 style={{ margin: '0 0 8px 0' }}>🏪 {banca.name}</h4>
                          <p style={{ margin: '4px 0', fontSize: '13px' }}>📍 {banca.address}</p>
                          <p style={{ margin: '4px 0', fontSize: '13px' }}>📞 {banca.phone}</p>
                          {banca.distance && (
                            <p style={{ margin: '4px 0', fontSize: '12px', color: '#0071e3' }}>
                              🚶 {banca.distance}
                            </p>
                          )}
                          <IonButton size="small" expand="block" href={`tel:${banca.phone}`}>
                            Llamar
                          </IonButton>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Bancas;
