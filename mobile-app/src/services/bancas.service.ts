/**
 * Bancas Service
 * Handles banca-related operations
 */

import apiClient from './api';

export interface Banca {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  region: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  lotteries_supported: string[];
  status: 'active' | 'inactive' | 'maintenance';
  rating?: number;
  hours?: {
    open: string;
    close: string;
    days: string[];
  };
}

export interface BancaSearchParams {
  city?: string;
  region?: string;
  lottery_id?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  limit?: number;
  offset?: number;
}

/**
 * Get all bancas
 */
export const getBancas = async (params?: BancaSearchParams): Promise<{ bancas: Banca[]; total: number }> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const response = await apiClient.get<{ bancas: Banca[]; total: number }>(
    `/bancas?${queryParams.toString()}`
  );
  
  return response.data;
};

/**
 * Get banca by ID
 */
export const getBanca = async (bancaId: string): Promise<Banca> => {
  const response = await apiClient.get<Banca>(`/bancas/${bancaId}`);
  return response.data;
};

/**
 * Get nearby bancas
 */
export const getNearbyBancas = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<{ bancas: Banca[]; total: number }> => {
  const response = await apiClient.get<{ bancas: Banca[]; total: number }>(
    `/bancas/nearby?latitude=${latitude}&longitude=${longitude}&radius_km=${radiusKm}`
  );
  
  return response.data;
};

/**
 * Search bancas by name or location
 */
export const searchBancas = async (query: string): Promise<Banca[]> => {
  const response = await apiClient.get<{ bancas: Banca[] }>(
    `/bancas/search?q=${encodeURIComponent(query)}`
  );
  
  return response.data.bancas;
};
