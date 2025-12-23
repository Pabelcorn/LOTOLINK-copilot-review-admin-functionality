/**
 * Plays Service
 * Handles lottery play creation and management
 */

import apiClient from './api';

export interface PlayNumber {
  number: string;
  amount: number;
}

export interface CreatePlayRequest {
  request_id: string;
  user_id: string;
  lottery_id: string;
  play_type: 'quiniela' | 'pale' | 'tripleta';
  numbers: PlayNumber[];
  draw_time: string;
  total_amount: number;
}

export interface Play {
  play_id: string;
  user_id: string;
  lottery_id: string;
  play_type: string;
  numbers: PlayNumber[];
  draw_time: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'confirmed' | 'rejected' | 'cancelled' | 'won' | 'lost';
  created_at: string;
  updated_at: string;
  banca_play_id?: string;
  result?: {
    winning_numbers: string[];
    prize_amount?: number;
  };
}

export interface PlayResponse {
  play_id: string;
  status: string;
  message: string;
  banca_play_id?: string;
  created_at: string;
}

/**
 * Create a new play
 */
export const createPlay = async (playData: CreatePlayRequest): Promise<PlayResponse> => {
  const response = await apiClient.post<PlayResponse>('/plays', playData);
  return response.data;
};

/**
 * Get play by ID
 */
export const getPlay = async (playId: string): Promise<Play> => {
  const response = await apiClient.get<Play>(`/plays/${playId}`);
  return response.data;
};

/**
 * Get user plays
 */
export const getUserPlays = async (
  userId: string,
  status?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ plays: Play[]; total: number }> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }
  
  const response = await apiClient.get<{ plays: Play[]; total: number }>(
    `/users/${userId}/plays?${params.toString()}`
  );
  
  return response.data;
};

/**
 * Cancel a play
 */
export const cancelPlay = async (playId: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/plays/${playId}/cancel`
  );
  return response.data;
};

/**
 * Get play statistics for user
 */
export const getPlayStatistics = async (userId: string): Promise<{
  total_plays: number;
  total_spent: number;
  total_won: number;
  win_rate: number;
}> => {
  const response = await apiClient.get(`/users/${userId}/statistics`);
  return response.data;
};
