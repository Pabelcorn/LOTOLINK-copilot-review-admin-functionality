/**
 * Tickets Service
 * Handles fetching and managing virtual tickets with complete sucursal/banca information
 */

import apiClient from './api';

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

export interface TicketsFilter {
  status?: 'all' | 'pending' | 'confirmed' | 'won' | 'lost';
  limit?: number;
  offset?: number;
}

export interface TicketsResponse {
  tickets: TicketData[];
  total: number;
  hasMore: boolean;
}

/**
 * Get all tickets for a user with optional filters
 */
export const getMyTickets = async (
  userId: string,
  filters?: TicketsFilter
): Promise<TicketsResponse> => {
  const params = new URLSearchParams();
  
  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  
  if (filters?.limit) {
    params.append('limit', filters.limit.toString());
  }
  
  if (filters?.offset) {
    params.append('offset', filters.offset.toString());
  }
  
  const response = await apiClient.get<{ plays: any[]; total: number }>(
    `/users/${userId}/plays?${params.toString()}`
  );
  
  // Transform plays to tickets with extended information
  const tickets: TicketData[] = response.data.plays.map(play => transformPlayToTicket(play));
  
  return {
    tickets,
    total: response.data.total,
    hasMore: response.data.total > (filters?.offset || 0) + tickets.length
  };
};

/**
 * Get a single ticket by ID with complete sucursal and banca information
 */
export const getTicketById = async (ticketId: string): Promise<TicketData> => {
  const response = await apiClient.get<any>(`/plays/${ticketId}`);
  return transformPlayToTicket(response.data);
};

/**
 * Transform a play object from the API to a TicketData object
 */
function transformPlayToTicket(play: any): TicketData {
  // Extract bet information
  const bets: TicketBet[] = [{
    type: play.betType || play.play_type || 'QN',
    numbers: play.numbers || [],
    amount: play.amount || play.total_amount || 0
  }];
  
  // Format dates
  const createdAt = play.createdAt || play.created_at || new Date().toISOString();
  const validUntil = play.validUntil || play.valid_until || 
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days default
  
  return {
    id: play.id || play.play_id,
    ticketCode: play.ticketCode || play.ticket_code || play.playIdBanca || play.banca_play_id || `TKT-${play.id}`,
    barcode: play.barcode || generateBarcode(play.id),
    bets,
    totalAmount: play.amount || play.total_amount || 0,
    status: play.status || 'pending',
    createdAt,
    validUntil,
    
    // Sorteo info
    sorteoName: play.sorteoName || play.sorteo_name || 'Lotería Real',
    sorteoNumber: play.sorteoNumber || play.sorteo_number || '00000',
    sorteoTime: play.sorteoTime || play.sorteo_time || play.draw_time || '1:00 PM',
    lotteryName: play.lotteryName || play.lottery_name || getLotteryName(play.lotteryId || play.lottery_id),
    
    // Banca info - will be populated from backend when available
    bancaName: play.bancaName || play.banca_name || 'LOTEKA',
    bancaLogo: play.bancaLogo || play.banca_logo,
    
    // Sucursal info - will be populated from backend when available
    sucursalName: play.sucursalName || play.sucursal_name || 'Principal',
    sucursalCode: play.sucursalCode || play.sucursal_code || '4000-01',
    sucursalAddress: play.sucursalAddress || play.sucursal_address,
    sucursalPhone: play.sucursalPhone || play.sucursal_phone,
    
    // Operador
    operatorId: play.operatorUserId || play.operator_user_id
  };
}

/**
 * Generate a barcode for a ticket
 */
function generateBarcode(ticketId: string): string {
  // Generate a numeric barcode from ticket ID
  const numericId = ticketId.replace(/[^0-9]/g, '');
  return numericId.padStart(14, '0').slice(0, 14);
}

/**
 * Get lottery display name from ID
 */
function getLotteryName(lotteryId: string): string {
  const lotteryNames: Record<string, string> = {
    'leidsa': 'LEIDSA',
    'loteka': 'LOTEKA',
    'loteria-nacional': 'Lotería Nacional',
    'la-primera': 'La Primera'
  };
  
  return lotteryNames[lotteryId] || lotteryId.toUpperCase();
}
