import React from 'react';
import { IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { person, checkmarkCircle, location, call } from 'ionicons/icons';
import type { TicketData } from '../types/ticket.types';

interface VirtualTicketProps {
  ticket: TicketData;
  showBarcode?: boolean;
  compact?: boolean;
}

const VirtualTicket: React.FC<VirtualTicketProps> = ({ ticket, showBarcode = true, compact = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#34c759';
      case 'pending': return '#ff9500';
      case 'won': return '#5856d6';
      case 'lost': return '#8e8e93';
      default: return '#0071e3';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'CONFIRMADO';
      case 'pending': return 'PENDIENTE';
      case 'won': return '¡GANADOR!';
      case 'lost': return 'NO GANÓ';
      default: return status.toUpperCase();
    }
  };

  return (
    <IonCard className="virtual-ticket" style={{
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      overflow: 'hidden',
      margin: compact ? '8px' : '16px',
      fontFamily: "'SF Mono', 'Courier New', monospace"
    }}>
      {/* Header con Logo de Banca */}
      <div style={{
        background: 'linear-gradient(135deg, #0071e3 0%, #5856d6 100%)',
        padding: compact ? '12px' : '20px',
        textAlign: 'center',
        color: 'white',
        position: 'relative'
      }}>
        {/* Status Badge */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: getStatusColor(ticket.status),
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '700'
        }}>
          {getStatusText(ticket.status)}
        </div>

        {ticket.bancaLogo ? (
          <img src={ticket.bancaLogo} alt={ticket.bancaName} style={{ height: '40px' }} />
        ) : (
          <h2 style={{ margin: 0, fontSize: compact ? '20px' : '24px', fontWeight: '700' }}>
            🎰 {ticket.bancaName}
          </h2>
        )}
        <div style={{ marginTop: '8px', fontSize: '14px', opacity: 0.9 }}>
          Sucursal: <strong>{ticket.sucursalName}</strong>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          Código: {ticket.sucursalCode}
        </div>
      </div>

      <IonCardContent style={{ padding: compact ? '12px' : '16px' }}>
        {/* Info del Sorteo */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: '#f5f5f7',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Sorteo</div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>{ticket.sorteoName}</div>
            <div style={{ fontSize: '12px', color: '#0071e3', fontWeight: '600' }}>#{ticket.sorteoNumber}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Hora</div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>{ticket.sorteoTime}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {formatDate(ticket.createdAt)}
            </div>
          </div>
        </div>

        {/* Jugadas */}
        <div style={{
          borderTop: '2px dashed #e0e0e0',
          borderBottom: '2px dashed #e0e0e0',
          padding: '16px 0',
          margin: '16px 0'
        }}>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>
            Jugadas
          </div>
          {ticket.bets.map((bet, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              fontSize: '15px',
              borderBottom: index < ticket.bets.length - 1 ? '1px solid #f0f0f0' : 'none'
            }}>
              <span>
                <strong style={{ 
                  background: '#0071e3', 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginRight: '8px'
                }}>
                  {bet.type}
                </strong>
                {bet.numbers.join(' - ')}
              </span>
              <span style={{ fontWeight: '600', color: '#333' }}>
                RD$ {bet.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '18px',
          fontWeight: '700',
          marginBottom: '16px',
          padding: '8px 0'
        }}>
          <span>TOTAL:</span>
          <span style={{ color: '#0071e3' }}>RD$ {ticket.totalAmount.toFixed(2)}</span>
        </div>

        {/* Código de Barras */}
        {showBarcode && ticket.barcode && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '16px',
            padding: '16px',
            background: '#fafafa',
            borderRadius: '8px'
          }}>
            <div 
              style={{ 
                fontFamily: "'Libre Barcode 128', cursive",
                fontSize: '48px',
                letterSpacing: '2px'
              }}
              aria-label={`Código de barras: ${ticket.barcode}`}
            >
              {ticket.barcode}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {ticket.ticketCode}
            </div>
          </div>
        )}

        {/* Footer con Operador y Validez */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#666',
          paddingTop: '12px',
          borderTop: '1px solid #eee',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {ticket.operatorId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IonIcon icon={person} style={{ fontSize: '14px' }} />
              <span>Operador: {ticket.operatorId}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IonIcon icon={checkmarkCircle} style={{ fontSize: '14px', color: '#34c759' }} />
            <span>Válido hasta: {formatDate(ticket.validUntil)}</span>
          </div>
        </div>

        {/* Info de Sucursal */}
        {(ticket.sucursalAddress || ticket.sucursalPhone) && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#f9f9f9',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#666'
          }}>
            {ticket.sucursalAddress && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <IonIcon icon={location} style={{ fontSize: '12px' }} />
                <span>{ticket.sucursalAddress}</span>
              </div>
            )}
            {ticket.sucursalPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IonIcon icon={call} style={{ fontSize: '12px' }} />
                <span>{ticket.sucursalPhone}</span>
              </div>
            )}
          </div>
        )}

        {/* Mensaje de verificación */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          fontSize: '10px',
          color: '#999',
          fontStyle: 'italic'
        }}>
          Verifique su jugada • Conserve este ticket
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default VirtualTicket;
