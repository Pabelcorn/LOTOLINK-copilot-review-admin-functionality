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
  IonToggle,
  IonAvatar,
  IonToast,
  IonAlert
} from '@ionic/react';
import { 
  person, 
  card, 
  notifications, 
  moon, 
  fingerPrint,
  language,
  informationCircle,
  logOut,
  chevronForward,
  wallet,
} from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_INFO } from '../constants';
import {
  checkBiometricAvailability,
  getBiometricTypeName,
  enableBiometricLogin,
  disableBiometricLogin,
  isBiometricEnabled
} from '../services/biometric.service';
import {
  checkNotificationPermissions,
  requestNotificationPermissions,
  initializePushNotifications
} from '../services/notifications.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const Profile: React.FC = () => {
  const history = useHistory();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biométrico');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
    checkNotificationStatus();
    checkDarkModeStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const info = await checkBiometricAvailability();
    setBiometricAvailable(info.isAvailable);
    setBiometricType(getBiometricTypeName(info.biometryType));
    
    const enabled = await isBiometricEnabled();
    setBiometricEnabled(enabled);
  };

  const checkNotificationStatus = async () => {
    const enabled = await checkNotificationPermissions();
    setNotificationsEnabled(enabled);
  };

  const checkDarkModeStatus = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkModeEnabled(prefersDark.matches);
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      
      if (enabled) {
        // TODO: In production, retrieve credentials from authenticated session
        // For demo purposes only - replace with actual user credentials
        const success = await enableBiometricLogin('demo_user', 'demo_password');
        if (success) {
          setBiometricEnabled(true);
          setToastMessage(`${biometricType} habilitado correctamente`);
          setShowToast(true);
        } else {
          setToastMessage('No se pudo habilitar la autenticación biométrica');
          setShowToast(true);
        }
      } else {
        await disableBiometricLogin();
        setBiometricEnabled(false);
        setToastMessage('Autenticación biométrica deshabilitada');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      setToastMessage('Error al cambiar configuración biométrica');
      setShowToast(true);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      
      if (enabled) {
        const granted = await requestNotificationPermissions();
        if (granted) {
          await initializePushNotifications();
          setNotificationsEnabled(true);
          setToastMessage('Notificaciones habilitadas correctamente');
          setShowToast(true);
        } else {
          setToastMessage('Permiso de notificaciones denegado');
          setShowToast(true);
        }
      } else {
        setNotificationsEnabled(false);
        setToastMessage('Notificaciones deshabilitadas');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      setToastMessage('Error al cambiar configuración de notificaciones');
      setShowToast(true);
    }
  };

  const handleDarkModeToggle = async (enabled: boolean) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    setDarkModeEnabled(enabled);
    document.body.classList.toggle('dark', enabled);
    setToastMessage(`Modo ${enabled ? 'oscuro' : 'claro'} activado`);
    setShowToast(true);
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = async () => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    // TODO: Implement logout functionality
    // - Clear authentication tokens from storage
    // - Reset user state
    // - Redirect to login screen
    // - Invalidate server session
    setToastMessage('Sesión cerrada correctamente');
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-header">
          <IonTitle style={{ fontWeight: '700' }}>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* User Info Card */}
        <div style={{ padding: '16px' }}>
          <IonCard className="glass-card">
            <IonCardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <IonAvatar style={{ width: '72px', height: '72px' }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #0071e3 0%, #5856d6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    color: 'white',
                    fontWeight: '700'
                  }}
                  aria-label="Avatar del usuario">
                    JD
                  </div>
                </IonAvatar>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                    Juan Díaz
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--ion-color-medium)' }}>
                    +1 809-555-0123
                  </div>
                  <div className="premium-badge" style={{ marginTop: '8px' }}>
                    ✓ Verificado
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Wallet Card */}
        <div style={{ padding: '0 16px 16px' }}>
          <IonCard className="premium-card" style={{
            background: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
            color: 'white'
          }}>
            <IonCardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
                    Balance Disponible
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>
                    RD$ 1,250.00
                  </div>
                </div>
                <IonIcon icon={card} style={{ fontSize: '48px', opacity: 0.3 }} aria-hidden="true" />
              </div>
              <IonButton 
                expand="block" 
                color="light" 
                style={{ marginTop: '16px', '--border-radius': '12px' }}
                aria-label="Recargar saldo de la billetera"
              >
                Recargar Wallet
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Settings List */}
        <div style={{ padding: '0 16px 100px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', marginLeft: '4px' }}>
            Configuración
          </h3>
          
          <IonCard className="premium-card">
            <IonList lines="full">
              <IonItem button detail={false}>
                <IonIcon icon={person} slot="start" color="primary" />
                <IonLabel>Información Personal</IonLabel>
                <IonIcon icon={chevronForward} slot="end" color="medium" />
              </IonItem>
              
              <IonItem 
                button 
                detail={false}
                onClick={() => {
                  Haptics.impact({ style: ImpactStyle.Light });
                  history.push('/payment-methods');
                }}
              >
                <IonIcon icon={wallet} slot="start" color="primary" />
                <IonLabel>
                  <h2>Métodos de Pago</h2>
                  <p>Gestionar tarjetas de crédito/débito</p>
                </IonLabel>
                <IonIcon icon={chevronForward} slot="end" color="medium" />
              </IonItem>
              
              <IonItem detail={false}>
                <IonIcon icon={fingerPrint} slot="start" color="primary" />
                <IonLabel>
                  <h2>Autenticación Biométrica</h2>
                  <p>{biometricAvailable ? biometricType : 'No disponible en este dispositivo'}</p>
                </IonLabel>
                <IonToggle 
                  slot="end" 
                  checked={biometricEnabled}
                  onIonChange={(e) => handleBiometricToggle(e.detail.checked)}
                  disabled={!biometricAvailable}
                  aria-label={`${biometricEnabled ? 'Deshabilitar' : 'Habilitar'} autenticación biométrica`}
                />
              </IonItem>
              
              <IonItem detail={false}>
                <IonIcon icon={notifications} slot="start" color="primary" />
                <IonLabel>
                  <h2>Notificaciones Push</h2>
                  <p>Recibe alertas de sorteos y premios</p>
                </IonLabel>
                <IonToggle 
                  slot="end" 
                  checked={notificationsEnabled}
                  onIonChange={(e) => handleNotificationToggle(e.detail.checked)}
                  aria-label={`${notificationsEnabled ? 'Deshabilitar' : 'Habilitar'} notificaciones push`}
                />
              </IonItem>
              
              <IonItem detail={false}>
                <IonIcon icon={moon} slot="start" color="primary" />
                <IonLabel>
                  <h2>Modo Oscuro</h2>
                  <p>{darkModeEnabled ? 'Activado' : 'Desactivado'}</p>
                </IonLabel>
                <IonToggle 
                  slot="end" 
                  checked={darkModeEnabled}
                  onIonChange={(e) => handleDarkModeToggle(e.detail.checked)}
                  aria-label={`${darkModeEnabled ? 'Desactivar' : 'Activar'} modo oscuro`}
                />
              </IonItem>
              
              <IonItem button detail={false}>
                <IonIcon icon={language} slot="start" color="primary" />
                <IonLabel>Idioma</IonLabel>
                <div slot="end" style={{ color: 'var(--ion-color-medium)' }}>
                  Español
                </div>
                <IonIcon icon={chevronForward} slot="end" color="medium" />
              </IonItem>
            </IonList>
          </IonCard>

          {/* Help Section */}
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px', marginLeft: '4px' }}>
            Ayuda y Soporte
          </h3>
          
          <IonCard className="premium-card">
            <IonList lines="full">
              <IonItem button detail={false}>
                <IonIcon icon={informationCircle} slot="start" color="primary" />
                <IonLabel>Preguntas Frecuentes</IonLabel>
                <IonIcon icon={chevronForward} slot="end" color="medium" />
              </IonItem>
              
              <IonItem button detail={false}>
                <IonIcon icon={informationCircle} slot="start" color="primary" />
                <IonLabel>Términos y Condiciones</IonLabel>
                <IonIcon icon={chevronForward} slot="end" color="medium" />
              </IonItem>
              
              <IonItem button detail={false}>
                <IonIcon icon={informationCircle} slot="start" color="primary" />
                <IonLabel>Política de Privacidad</IonLabel>
                <IonIcon icon={chevronForward} slot="end" color="medium" />
              </IonItem>
            </IonList>
          </IonCard>

          {/* Logout Button */}
          <IonButton
            expand="block"
            color="danger"
            fill="outline"
            style={{ marginTop: '24px', '--border-radius': '12px' }}
            onClick={handleLogout}
            aria-label="Cerrar sesión de la aplicación"
          >
            <IonIcon slot="start" icon={logOut} />
            Cerrar Sesión
          </IonButton>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '24px',
            color: 'var(--ion-color-medium)',
            fontSize: '12px'
          }}>
            Version {APP_INFO.VERSION} • {APP_INFO.NAME} © {APP_INFO.COPYRIGHT_YEAR}
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
        />

        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Cerrar Sesión"
          message="¿Estás seguro que deseas cerrar sesión?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Cerrar Sesión',
              role: 'destructive',
              handler: confirmLogout
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
