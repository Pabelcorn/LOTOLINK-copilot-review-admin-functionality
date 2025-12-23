/**
 * Common Type Definitions
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
}

export type PlayStatus = 
  | 'pending' 
  | 'processing' 
  | 'confirmed' 
  | 'rejected' 
  | 'cancelled' 
  | 'won' 
  | 'lost';

export type PlayType = 'quiniela' | 'pale' | 'tripleta';

export type LotteryId = 'leidsa' | 'loteka' | 'real' | 'anguilla' | 'nacional';

export type BancaStatus = 'active' | 'inactive' | 'maintenance';

export type UserRole = 'user' | 'banca' | 'admin';
