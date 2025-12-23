import { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  isPlatform
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, ticket, storefront, personCircle, trophy } from 'ionicons/icons';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/custom.css';
import './theme/responsive.css';

/* Pages */
import Home from './pages/Home';
import Lotteries from './pages/Lotteries';
import Bancas from './pages/Bancas';
import Profile from './pages/Profile';
import Play from './pages/Play';
import PaymentMethods from './pages/PaymentMethods';

/* Services */
import { setupNotificationListeners } from './services/notifications.service';

setupIonicReact({
  mode: 'ios', // Use iOS mode for consistent design
  swipeBackEnabled: true,
  animated: true,
  rippleEffect: true,
  hardwareBackButton: true
});

const App: React.FC = () => {
  useEffect(() => {
    // Initialize mobile-specific features
    const initializeApp = async () => {
      if (isPlatform('capacitor')) {
        try {
          // Configure status bar
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#0071e3' });
          
          // Hide splash screen immediately (native splash is disabled in capacitor.config.ts)
          await SplashScreen.hide();

          // Set up push notification listeners
          setupNotificationListeners(
            (notification) => {
              console.log('Notification received in foreground:', notification);
              // Handle foreground notification
            },
            (notification) => {
              console.log('Notification clicked:', notification);
              // Handle notification click - navigate to appropriate screen
            }
          );

          // Handle app state changes
          CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            console.log('App state changed. Is active:', isActive);
          });

          // Handle back button
          CapacitorApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              CapacitorApp.exitApp();
            }
          });

        } catch (error) {
          console.error('Error initializing app:', error);
        }
      }
    };

    initializeApp();

    // Cleanup
    return () => {
      if (isPlatform('capacitor')) {
        CapacitorApp.removeAllListeners();
      }
    };
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/lotteries">
              <Lotteries />
            </Route>
            <Route path="/play/:lotteryId">
              <Play />
            </Route>
            <Route exact path="/bancas">
              <Bancas />
            </Route>
            <Route exact path="/profile">
              <Profile />
            </Route>
            <Route exact path="/payment-methods">
              <PaymentMethods />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom" className="tab-bar-custom">
            <IonTabButton tab="home" href="/home" aria-label="Página de inicio">
              <IonIcon aria-hidden="true" icon={home} />
              <IonLabel>Inicio</IonLabel>
            </IonTabButton>
            <IonTabButton tab="lotteries" href="/lotteries" aria-label="Ver loterías disponibles">
              <IonIcon aria-hidden="true" icon={trophy} />
              <IonLabel>Loterías</IonLabel>
            </IonTabButton>
            <IonTabButton tab="play" href="/lotteries" className="tab-play-button" aria-label="Jugar ahora">
              <IonIcon aria-hidden="true" icon={ticket} size="large" />
              <IonLabel>Jugar</IonLabel>
            </IonTabButton>
            <IonTabButton tab="bancas" href="/bancas" aria-label="Ver bancas cercanas">
              <IonIcon aria-hidden="true" icon={storefront} />
              <IonLabel>Bancas</IonLabel>
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile" aria-label="Ver perfil de usuario">
              <IonIcon aria-hidden="true" icon={personCircle} />
              <IonLabel>Perfil</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
