import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
  IonActionSheet
} from '@ionic/react';
import { shareOutline, downloadOutline, ellipsisHorizontal } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VirtualTicket from '../components/VirtualTicket';
import { getTicketById, TicketData } from '../services/tickets.service';

const TicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);

  useEffect(() => {
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setIsLoading(true);
      const data = await getTicketById(ticketId);
      setTicket(data);
    } catch (error) {
      console.error('Error loading ticket:', error);
      setToastMessage('Error al cargar el ticket');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Ticket ${ticket?.ticketCode}`,
          text: `Mi ticket de ${ticket?.lotteryName} - ${ticket?.sorteoName}`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setToastMessage('Enlace copiado al portapapeles');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error sharing ticket:', error);
    }
  };

  const handleSaveAsImage = async () => {
    try {
      // TODO: Implement screenshot functionality using html2canvas or similar
      // For now, just show a message
      setToastMessage('Función de guardar imagen próximamente disponible');
      setShowToast(true);
    } catch (error) {
      console.error('Error saving image:', error);
      setToastMessage('Error al guardar imagen');
      setShowToast(true);
    }
  };

  const handlePrint = () => {
    window.print();
    setToastMessage('Preparando impresión...');
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-header">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/my-tickets" text="Tickets" />
          </IonButtons>
          <IonTitle style={{ fontWeight: '700' }}>
            {ticket ? ticket.ticketCode : 'Cargando...'}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowActionSheet(true)}>
              <IonIcon slot="icon-only" icon={ellipsisHorizontal} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh'
          }}>
            <IonSpinner name="crescent" color="primary" />
          </div>
        ) : ticket ? (
          <div style={{ paddingBottom: '100px' }}>
            <VirtualTicket ticket={ticket} showBarcode={true} compact={false} />
            
            {/* Additional Information */}
            <div style={{ padding: '16px' }}>
              <div style={{
                background: '#f5f5f7',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Información del Ticket
                </h3>
                <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>ID del Ticket:</span>
                    <span style={{ fontWeight: '600' }}>{ticket.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>Lotería:</span>
                    <span style={{ fontWeight: '600' }}>{ticket.lotteryName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>Banca:</span>
                    <span style={{ fontWeight: '600' }}>{ticket.bancaName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Estado:</span>
                    <span style={{ 
                      fontWeight: '600',
                      color: ticket.status === 'confirmed' ? '#34c759' : 
                             ticket.status === 'won' ? '#5856d6' : '#ff9500'
                    }}>
                      {ticket.status === 'confirmed' ? 'Confirmado' :
                       ticket.status === 'won' ? '¡Ganador!' :
                       ticket.status === 'lost' ? 'No Ganó' :
                       'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div style={{
                background: '#fff4e5',
                border: '1px solid #ff9500',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>⚠️</span>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: '#ff9500' }}>
                      Importante
                    </h4>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: '1.6' }}>
                      Conserve este ticket virtual. Este documento es necesario para reclamar cualquier premio.
                      Verifique sus números antes del sorteo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              position: 'fixed',
              bottom: 'calc(65px + env(safe-area-inset-bottom))',
              left: 0,
              right: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              padding: '12px 16px',
              display: 'flex',
              gap: '12px'
            }}>
              <IonButton
                expand="block"
                fill="outline"
                onClick={handleShare}
                style={{ '--border-radius': '12px', flex: 1 }}
              >
                <IonIcon slot="start" icon={shareOutline} />
                Compartir
              </IonButton>
              <IonButton
                expand="block"
                onClick={handleSaveAsImage}
                style={{ '--border-radius': '12px', flex: 1 }}
              >
                <IonIcon slot="start" icon={downloadOutline} />
                Guardar
              </IonButton>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            height: '60vh',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Ticket no encontrado
            </h2>
            <p style={{ color: 'var(--ion-color-medium)', marginBottom: '24px' }}>
              No se pudo cargar la información del ticket
            </p>
            <IonButton routerLink="/my-tickets" style={{ '--border-radius': '12px' }}>
              Volver a Mis Tickets
            </IonButton>
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
        />

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header="Opciones del Ticket"
          buttons={[
            {
              text: 'Compartir',
              icon: shareOutline,
              handler: handleShare
            },
            {
              text: 'Guardar como Imagen',
              icon: downloadOutline,
              handler: handleSaveAsImage
            },
            {
              text: 'Imprimir',
              handler: handlePrint
            },
            {
              text: 'Cancelar',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default TicketDetail;
