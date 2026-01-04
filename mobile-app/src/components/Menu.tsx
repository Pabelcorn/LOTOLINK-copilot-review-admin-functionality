import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  home,
  trophy,
  storefront,
  personCircle,
  wallet,
  helpCircle,
  document,
  shieldCheckmark,
  informationCircle,
  ticket,
} from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { APP_INFO } from '../constants';

const Menu: React.FC = () => {
  const location = useLocation();

  interface MenuItem {
    title: string;
    url: string;
    icon: string;
  }

  const mainPages: MenuItem[] = [
    { title: 'Inicio', url: '/home', icon: home },
    { title: 'Loterías', url: '/lotteries', icon: trophy },
    { title: 'Mis Tickets', url: '/my-tickets', icon: ticket },
    { title: 'Bancas', url: '/bancas', icon: storefront },
    { title: 'Perfil', url: '/profile', icon: personCircle },
  ];

  const accountPages: MenuItem[] = [
    { title: 'Métodos de Pago', url: '/payment-methods', icon: wallet },
  ];

  const legalPages: MenuItem[] = [
    { title: 'Política de Privacidad', url: '/legal/privacy-policy', icon: shieldCheckmark },
    { title: 'Términos y Condiciones', url: '/legal/terms-conditions', icon: document },
    { title: 'Declaración Legal', url: '/legal/legal-declaration', icon: informationCircle },
  ];

  return (
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }} role="img" aria-label="Icono de lotería">🎰</span>
              <span style={{ fontWeight: '700' }}>LotoLink</span>
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Main Navigation */}
        <IonList>
          <IonListHeader>
            <IonLabel style={{ fontWeight: '700', fontSize: '14px' }}>Navegación</IonLabel>
          </IonListHeader>
          {mainPages.map((page, index) => (
            <IonMenuToggle key={index} autoHide={false}>
              <IonItem
                button
                routerLink={page.url}
                routerDirection="none"
                className={location.pathname === page.url ? 'selected' : ''}
                detail={false}
              >
                <IonIcon slot="start" icon={page.icon} />
                <IonLabel>{page.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>

        {/* Account */}
        <IonList>
          <IonListHeader>
            <IonLabel style={{ fontWeight: '700', fontSize: '14px' }}>Cuenta</IonLabel>
          </IonListHeader>
          {accountPages.map((page, index) => (
            <IonMenuToggle key={index} autoHide={false}>
              <IonItem
                button
                routerLink={page.url}
                routerDirection="none"
                className={location.pathname === page.url ? 'selected' : ''}
                detail={false}
              >
                <IonIcon slot="start" icon={page.icon} />
                <IonLabel>{page.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>

        {/* Help */}
        <IonList>
          <IonListHeader>
            <IonLabel style={{ fontWeight: '700', fontSize: '14px' }}>Ayuda</IonLabel>
          </IonListHeader>
          <IonMenuToggle autoHide={false}>
            <IonItem button detail={false}>
              <IonIcon slot="start" icon={helpCircle} />
              <IonLabel>Preguntas Frecuentes</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>

        {/* Legal */}
        <IonList>
          <IonListHeader>
            <IonLabel style={{ fontWeight: '700', fontSize: '14px' }}>Legal</IonLabel>
          </IonListHeader>
          {legalPages.map((page, index) => (
            <IonMenuToggle key={index} autoHide={false}>
              <IonItem
                button
                routerLink={page.url}
                routerDirection="none"
                className={location.pathname === page.url ? 'selected' : ''}
                detail={false}
              >
                <IonIcon slot="start" icon={page.icon} />
                <IonLabel>{page.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>

        {/* App Info */}
        <div style={{
          padding: '24px 16px',
          textAlign: 'center',
          color: 'var(--ion-color-medium)',
          fontSize: '12px',
          borderTop: '1px solid var(--ion-color-light-shade)',
          marginTop: '24px'
        }}>
          <div>{APP_INFO.NAME}</div>
          <div>Version {APP_INFO.VERSION}</div>
          <div>© {APP_INFO.COPYRIGHT_YEAR} {APP_INFO.COMPANY}</div>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
