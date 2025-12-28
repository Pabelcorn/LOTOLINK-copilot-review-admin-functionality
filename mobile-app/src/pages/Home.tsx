import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonButtons,
  IonMenuButton,
  RefresherEventDetail
} from '@ionic/react';
import { trophy, storefront, ticket, trendingUp } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const history = useHistory();

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-header">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }} role="img" aria-label="Icono de lotería">🎰</span>
              <span style={{ fontWeight: '700' }}>LotoLink</span>
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingText="Desliza para actualizar"
            refreshingText="Actualizando..."
          />
        </IonRefresher>

        {/* Hero Section */}
        <div className="hero-section glass-card" style={{
          margin: '16px',
          padding: '24px',
          background: 'linear-gradient(135deg, #0071e3 0%, #5856d6 100%)',
          color: 'white'
        }}
        role="banner">
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
            ¡Bienvenido a LotoLink!
          </h1>
          <p style={{ margin: '0 0 16px 0', opacity: 0.9 }}>
            La forma más fácil de jugar loterías en República Dominicana
          </p>
          <IonButton 
            expand="block" 
            color="light" 
            routerLink="/lotteries" 
            className="animate-fade-in"
            aria-label="Ir a la página de loterías para jugar"
          >
            <IonIcon slot="start" icon={ticket} />
            Jugar Ahora
          </IonButton>
        </div>

        {/* Quick Actions */}
        <div style={{ padding: '0 16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
            Acceso Rápido
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <IonCard className="premium-card" routerLink="/lotteries" button aria-label="Ver todas las loterías">
              <IonCardContent style={{ textAlign: 'center', padding: '20px' }}>
                <IonIcon icon={trophy} style={{ fontSize: '40px', color: '#0071e3' }} aria-hidden="true" />
                <div style={{ marginTop: '8px', fontWeight: '600' }}>Loterías</div>
              </IonCardContent>
            </IonCard>
            <IonCard className="premium-card" routerLink="/bancas" button aria-label="Ver bancas cercanas">
              <IonCardContent style={{ textAlign: 'center', padding: '20px' }}>
                <IonIcon icon={storefront} style={{ fontSize: '40px', color: '#34c759' }} aria-hidden="true" />
                <div style={{ marginTop: '8px', fontWeight: '600' }}>Bancas</div>
              </IonCardContent>
            </IonCard>
          </div>
        </div>

        {/* Results Section */}
        <div style={{ padding: '24px 16px 100px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
              Resultados Recientes
            </h2>
            <IonIcon icon={trendingUp} style={{ fontSize: '20px', color: '#0071e3' }} aria-hidden="true" />
          </div>
          
          {isRefreshing ? (
            <>
              <IonCard className="glass-card" style={{ marginBottom: '12px' }}>
                <IonCardHeader>
                  <IonSkeletonText animated style={{ width: '60%' }} />
                </IonCardHeader>
                <IonCardContent>
                  <IonSkeletonText animated style={{ width: '100%', height: '44px' }} />
                </IonCardContent>
              </IonCard>
              <IonCard className="glass-card">
                <IonCardHeader>
                  <IonSkeletonText animated style={{ width: '60%' }} />
                </IonCardHeader>
                <IonCardContent>
                  <IonSkeletonText animated style={{ width: '100%', height: '44px' }} />
                </IonCardContent>
              </IonCard>
            </>
          ) : (
            <>
              {/* Result Card - Leidsa */}
              <IonCard className="glass-card" style={{ marginBottom: '12px' }}>
                <IonCardHeader>
                  <IonCardTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#FFD700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: 'white'
                      }}
                      role="img"
                      aria-label="Logo de Leidsa">LD</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '16px' }}>Leidsa</div>
                        <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', fontWeight: '400' }}>
                          <time dateTime="20:55">Hoy 8:55 PM</time>
                        </div>
                      </div>
                    </div>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} role="list" aria-label="Números ganadores de Leidsa">
                    {['15', '42', '08'].map((num, idx) => (
                      <div key={idx} style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '18px',
                        boxShadow: '0 4px 12px rgba(0, 113, 227, 0.3)'
                      }}
                      role="listitem"
                      aria-label={`Número ${num}`}>
                        {num}
                      </div>
                    ))}
                  </div>
                </IonCardContent>
              </IonCard>

              {/* Result Card - Loteka */}
              <IonCard className="glass-card">
                <IonCardHeader>
                  <IonCardTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#00B0DB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: 'white'
                      }}
                      role="img"
                      aria-label="Logo de Loteka">LK</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '16px' }}>Loteka</div>
                        <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', fontWeight: '400' }}>
                          <time dateTime="19:55">Hoy 7:55 PM</time>
                        </div>
                      </div>
                    </div>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} role="list" aria-label="Números ganadores de Loteka">
                    {['23', '67', '91'].map((num, idx) => (
                      <div key={idx} style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '18px',
                        boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)'
                      }}
                      role="listitem"
                      aria-label={`Número ${num}`}>
                        {num}
                      </div>
                    ))}
                  </div>
                </IonCardContent>
              </IonCard>
            </>
          )}
        </div>

        {/* Legal Footer */}
        <div style={{ 
          padding: '32px 16px 100px 16px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(var(--ion-color-light-rgb, 245,245,247),0.8) 50%, rgba(255,255,255,0.95) 100%)',
          borderTop: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Brand Badge */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'inline-block',
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(var(--ion-color-primary-rgb, 0,113,227), 0.08)',
                border: '1px solid rgba(var(--ion-color-primary-rgb, 0,113,227), 0.12)'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, var(--ion-color-primary, #0071e3) 0%, #5856d6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.01em'
                }}>
                  LotoLink
                </span>
              </div>
            </div>
            
            {/* Legal Links */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '4px',
              marginBottom: '24px'
            }}>
              <IonButton 
                fill="clear"
                size="small"
                onClick={() => history.push('/legal/privacy-policy')}
                style={{ 
                  '--padding-start': '12px',
                  '--padding-end': '12px',
                  '--border-radius': '8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  '--color': 'var(--ion-color-medium)',
                  '--background-hover': 'rgba(var(--ion-color-primary-rgb), 0.08)',
                  '--color-hover': 'var(--ion-color-primary)'
                }}
                aria-label="Ver Política de Privacidad"
              >
                Política de Privacidad
              </IonButton>
              <span style={{ color: 'var(--ion-color-light-shade)', fontSize: '12px' }}>•</span>
              <IonButton 
                fill="clear"
                size="small"
                onClick={() => history.push('/legal/terms-conditions')}
                style={{ 
                  '--padding-start': '12px',
                  '--padding-end': '12px',
                  '--border-radius': '8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  '--color': 'var(--ion-color-medium)',
                  '--background-hover': 'rgba(var(--ion-color-primary-rgb), 0.08)',
                  '--color-hover': 'var(--ion-color-primary)'
                }}
                aria-label="Ver Términos y Condiciones"
              >
                Términos y Condiciones
              </IonButton>
              <span style={{ color: 'var(--ion-color-light-shade)', fontSize: '12px' }}>•</span>
              <IonButton 
                fill="clear"
                size="small"
                onClick={() => history.push('/legal/legal-declaration')}
                style={{ 
                  '--padding-start': '12px',
                  '--padding-end': '12px',
                  '--border-radius': '8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  '--color': 'var(--ion-color-medium)',
                  '--background-hover': 'rgba(var(--ion-color-primary-rgb), 0.08)',
                  '--color-hover': 'var(--ion-color-primary)'
                }}
                aria-label="Ver Declaración Legal"
              >
                Declaración Legal
              </IonButton>
            </div>
            
            {/* Copyright */}
            <div>
              <p style={{
                fontSize: '12px',
                color: 'var(--ion-color-medium-shade)',
                letterSpacing: '-0.01em',
                fontWeight: '500',
                margin: 0
              }}>
                © 2024 LotoLink. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
