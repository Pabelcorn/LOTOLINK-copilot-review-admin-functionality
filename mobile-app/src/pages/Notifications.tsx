import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonIcon,
  IonBadge,
  IonToggle,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonButtons,
  IonBackButton,
  IonSpinner,
  RefresherEventDetail,
} from '@ionic/react';
import {
  checkmarkCircle,
  timeOutline,
  trophyOutline,
  alertCircleOutline,
  cashOutline,
  megaphoneOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { notificationsService } from '../services/notifications.service';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  sentAt: string;
  readAt?: string;
}

interface NotificationPreferences {
  playConfirmed: boolean;
  drawReminder: boolean;
  drawResult: boolean;
  prizeWon: boolean;
  ticketExpiring: boolean;
  prizePaid: boolean;
  promotions: boolean;
  reminderMinutesBefore: number;
}

const Notifications: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<'history' | 'settings'>('history');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedSegment]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (selectedSegment === 'history') {
        const history = await notificationsService.getHistory();
        setNotifications(history);
      } else {
        const prefs = await notificationsService.getPreferences();
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading notifications data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadData();
    event.detail.complete();
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await notificationsService.markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;

    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    try {
      await notificationsService.updatePreferences(updated);
    } catch (error) {
      console.error('Error updating preferences:', error);
      // Revert on error
      setPreferences(preferences);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'play_confirmed':
        return checkmarkCircle;
      case 'draw_reminder':
        return timeOutline;
      case 'draw_result':
        return trophyOutline;
      case 'prize_won':
        return trophyOutline;
      case 'ticket_expiring':
        return alertCircleOutline;
      case 'prize_paid':
        return cashOutline;
      case 'promotion':
        return megaphoneOutline;
      default:
        return notificationsOutline;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-DO');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Notificaciones</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={selectedSegment} onIonChange={e => setSelectedSegment(e.detail.value as any)}>
            <IonSegmentButton value="history">
              <IonLabel>Historial</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="settings">
              <IonLabel>Configuración</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <IonSpinner />
          </div>
        ) : selectedSegment === 'history' ? (
          <IonList>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <IonIcon icon={notificationsOutline} style={{ fontSize: '4rem', opacity: 0.3 }} />
                <IonText color="medium">
                  <p>No tienes notificaciones</p>
                </IonText>
              </div>
            ) : (
              notifications.map(notification => (
                <IonItem
                  key={notification.id}
                  button
                  detail={false}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ '--background': notification.readAt ? 'transparent' : 'rgba(var(--ion-color-primary-rgb), 0.05)' }}
                >
                  <IonIcon
                    icon={getNotificationIcon(notification.type)}
                    slot="start"
                    color={notification.readAt ? 'medium' : 'primary'}
                  />
                  <IonLabel>
                    <h2>
                      {notification.title}
                      {!notification.readAt && (
                        <IonBadge color="primary" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>
                          Nuevo
                        </IonBadge>
                      )}
                    </h2>
                    <p>{notification.body}</p>
                    <IonText color="medium">
                      <small>{formatTime(notification.sentAt)}</small>
                    </IonText>
                  </IonLabel>
                </IonItem>
              ))
            )}
          </IonList>
        ) : (
          preferences && (
            <IonList>
              <IonItem lines="full">
                <IonLabel>
                  <h2>Jugada Confirmada</h2>
                  <p>Recibe notificación cuando tu jugada sea confirmada</p>
                </IonLabel>
                <IonToggle
                  checked={preferences.playConfirmed}
                  onIonChange={e => handlePreferenceChange('playConfirmed', e.detail.checked)}
                />
              </IonItem>

              <IonItem lines="full">
                <IonLabel>
                  <h2>Recordatorio de Sorteo</h2>
                  <p>Te avisaremos antes de cada sorteo</p>
                </IonLabel>
                <IonToggle
                  checked={preferences.drawReminder}
                  onIonChange={e => handlePreferenceChange('drawReminder', e.detail.checked)}
                />
              </IonItem>

              <IonItem lines="full">
                <IonLabel>
                  <h2>Resultados de Sorteo</h2>
                  <p>Recibe los resultados de cada sorteo</p>
                </IonLabel>
                <IonToggle
                  checked={preferences.drawResult}
                  onIonChange={e => handlePreferenceChange('drawResult', e.detail.checked)}
                />
              </IonItem>

              <IonItem lines="full">
                <IonLabel>
                  <h2>Premio Ganado</h2>
                  <p>Te notificaremos si ganas un premio</p>
                </IonLabel>
                <IonToggle
                  checked={preferences.prizeWon}
                  onIonChange={e => handlePreferenceChange('prizeWon', e.detail.checked)}
                />
              </IonItem>

              <IonItem lines="full">
                <IonLabel>
                  <h2>Ticket por Vencer</h2>
                  <p>Te recordaremos cobrar tus premios a tiempo</p>
                </IonLabel>
                <IonToggle
                  checked={preferences.ticketExpiring}
                  onIonChange={e => handlePreferenceChange('ticketExpiring', e.detail.checked)}
                />
              </IonItem>

              <IonItem lines="full">
                <IonLabel>
                  <h2>Premio Pagado</h2>
                  <p>Confirmación cuando se procese tu pago</p>
                </IonLabel>
                <IonToggle
                  checked={preferences.prizePaid}
                  onIonChange={e => handlePreferenceChange('prizePaid', e.detail.checked)}
                />
              </IonItem>

              <IonItem lines="full">
                <IonLabel>
                  <h2>Promociones</h2>
                  <p>Recibe ofertas especiales y promociones</p>
                </IonLabel>
                <IonToggle
                  checked={preferences.promotions}
                  onIonChange={e => handlePreferenceChange('promotions', e.detail.checked)}
                />
              </IonItem>
            </IonList>
          )
        )}
      </IonContent>
    </IonPage>
  );
};

export default Notifications;
