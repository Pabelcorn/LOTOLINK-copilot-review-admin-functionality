import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonButton,
  IonIcon,
  IonMenuButton,
  RefresherEventDetail
} from '@ionic/react';
import { trophy, ticket as ticketIcon } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import VirtualTicket from '../components/VirtualTicket';
import { getMyTickets, TicketData, TicketsFilter } from '../services/tickets.service';
import { useAuth } from '../contexts/AuthContext';

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'won' | 'lost';

const MyTickets: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [hasMore, setHasMore] = useState(false);

  const loadTickets = async (refresh = false) => {
    // Don't load tickets if user is not authenticated
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      if (!refresh) {
        setIsLoading(true);
      }
      
      const filters: TicketsFilter = {
        status: filterStatus,
        limit: 20,
        offset: 0
      };
      
      const response = await getMyTickets(user.id, filters);
      setTickets(response.tickets);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading tickets:', error);
      // Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadTickets(true);
    event.detail.complete();
  };

  const handleTicketClick = (ticketId: string) => {
    history.push(`/ticket/${ticketId}`);
  };

  const getFilterLabel = (status: FilterStatus): string => {
    const labels: Record<FilterStatus, string> = {
      'all': 'Todos',
      'pending': 'Pendientes',
      'confirmed': 'Confirmados',
      'won': 'Ganadores',
      'lost': 'Perdidos'
    };
    return labels[status];
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-header">
          <IonMenuButton slot="start" />
          <IonTitle style={{ fontWeight: '700' }}>Mis Tickets</IonTitle>
        </IonToolbar>
        
        {/* Filter Segment */}
        <IonToolbar>
          <IonSegment
            value={filterStatus}
            onIonChange={(e) => setFilterStatus(e.detail.value as FilterStatus)}
            scrollable
          >
            <IonSegmentButton value="all">
              <IonLabel>{getFilterLabel('all')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="pending">
              <IonLabel>{getFilterLabel('pending')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="confirmed">
              <IonLabel>{getFilterLabel('confirmed')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="won">
              <IonLabel>{getFilterLabel('won')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh'
          }}>
            <IonSpinner name="crescent" color="primary" />
          </div>
        ) : tickets.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            height: '60vh',
            textAlign: 'center'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0071e3 0%, #5856d6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <IonIcon icon={ticketIcon} style={{ fontSize: '48px', color: 'white' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              {filterStatus === 'all' ? 'No tienes tickets' : `No hay tickets ${getFilterLabel(filterStatus).toLowerCase()}`}
            </h2>
            <p style={{ color: 'var(--ion-color-medium)', marginBottom: '24px', maxWidth: '300px' }}>
              Comienza a jugar para ver tus tickets virtuales aquí
            </p>
            <IonButton
              routerLink="/lotteries"
              expand="block"
              style={{ '--border-radius': '12px' }}
            >
              <IonIcon slot="start" icon={trophy} />
              Jugar Ahora
            </IonButton>
          </div>
        ) : (
          <>
            <div style={{ padding: '8px' }}>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <VirtualTicket ticket={ticket} showBarcode={false} compact />
                </div>
              ))}
            </div>

            {hasMore && (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <IonButton fill="outline" style={{ '--border-radius': '12px' }}>
                  Cargar Más
                </IonButton>
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MyTickets;
