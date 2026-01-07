/**
 * Sucursal Selector Component
 * Modal for selecting a banca/sucursal based on user's location
 */

import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonText,
  IonSearchbar,
} from '@ionic/react';
import { close, location, call, checkmarkCircle } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useSucursal } from '../contexts/SucursalContext';
import { calculateDistance, formatDistance, getCurrentPosition } from '../services/geolocation.service';

// Configuration constants
const DEFAULT_LOCATION = { latitude: 18.4861, longitude: -69.9312 }; // Santo Domingo

interface SucursalSelectorProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const SucursalSelector: React.FC<SucursalSelectorProps> = ({ isOpen, onDismiss }) => {
  const { selectedSucursal, setSelectedSucursal, nearbyBancas, loadNearbyBancas, isLoading } = useSucursal();
  const [searchText, setSearchText] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBancas();
    }
  }, [isOpen]);

  const loadBancas = async () => {
    // Get user location
    try {
      const position = await getCurrentPosition();
      setUserLocation({
        latitude: position.coordinates.latitude,
        longitude: position.coordinates.longitude,
      });
    } catch (err) {
      console.log('Could not get user location:', err);
      setUserLocation(DEFAULT_LOCATION);
    }

    // Load nearby bancas
    await loadNearbyBancas();
  };

  const handleSelectBanca = async (bancaId: string) => {
    const banca = nearbyBancas.find(b => b.id === bancaId);
    if (!banca) return;

    const sucursal = {
      id: banca.id,
      bancaId: banca.id,
      bancaName: banca.name,
      name: 'Principal',
      code: '0001',
      address: banca.address,
      phone: banca.phone,
      city: banca.city,
      province: banca.region,
    };

    await setSelectedSucursal(sucursal);
    onDismiss();
  };

  // Filter bancas by search text
  const filteredBancas = nearbyBancas.filter(banca =>
    banca.name.toLowerCase().includes(searchText.toLowerCase()) ||
    banca.address.toLowerCase().includes(searchText.toLowerCase()) ||
    banca.city?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Calculate distances for filtered bancas
  const bancasWithDistance = filteredBancas.map(banca => {
    let distance: string | undefined;
    if (userLocation && banca.location?.latitude && banca.location?.longitude) {
      const distKm = calculateDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: banca.location.latitude, longitude: banca.location.longitude }
      );
      distance = formatDistance(distKm);
    }
    return { ...banca, distanceStr: distance };
  });

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Seleccionar Sucursal</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value || '')}
            placeholder="Buscar banca..."
            animated
          />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner />
          </div>
        ) : bancasWithDistance.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <IonText color="medium">
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                No se encontraron bancas
              </div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Intenta con otro término de búsqueda
              </div>
            </IonText>
          </div>
        ) : (
          <IonList>
            {bancasWithDistance.map((banca) => (
              <IonItem
                key={banca.id}
                button
                onClick={() => handleSelectBanca(banca.id)}
                detail={false}
              >
                <div style={{ width: '100%', padding: '8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '24px' }}>🏪</div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>
                          {banca.name}
                        </div>
                        {banca.distanceStr && (
                          <div style={{ fontSize: '12px', color: 'var(--ion-color-primary)' }}>
                            📍 {banca.distanceStr}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedSucursal?.bancaId === banca.id && (
                      <IonIcon icon={checkmarkCircle} color="primary" style={{ fontSize: '24px' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ion-color-medium)', marginBottom: '4px' }}>
                    <IonIcon icon={location} style={{ fontSize: '14px', marginRight: '4px' }} />
                    {banca.address}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ion-color-medium)' }}>
                    <IonIcon icon={call} style={{ fontSize: '14px', marginRight: '4px' }} />
                    {banca.phone}
                  </div>
                  {banca.hours && (
                    <div style={{ fontSize: '12px', color: 'var(--ion-color-success)', marginTop: '4px' }}>
                      🕒 {banca.hours.open} - {banca.hours.close}
                    </div>
                  )}
                </div>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonModal>
  );
};

export default SucursalSelector;
