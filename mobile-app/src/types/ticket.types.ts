/**
 * Shared types for tickets and virtual tickets
 */

export interface TicketBet {
  type: string;
  numbers: string[];
  amount: number;
}

export interface TicketData {
  id: string;
  ticketCode: string;
  barcode: string;
  bets: TicketBet[];
  totalAmount: number;
  status: string;
  createdAt: string;
  validUntil: string;
  
  // Sorteo info
  sorteoName: string;
  sorteoNumber: string;
  sorteoTime: string;
  lotteryName: string;
  
  // Banca info
  bancaName: string;
  bancaLogo?: string;
  
  // Sucursal info
  sucursalName: string;
  sucursalCode: string;
  sucursalAddress?: string;
  sucursalPhone?: string;
  
  // Operador
  operatorId?: string;
}

// Constants
export const TICKET_VALIDITY_DAYS = 60;
export const TICKET_VALIDITY_MS = TICKET_VALIDITY_DAYS * 24 * 60 * 60 * 1000;
