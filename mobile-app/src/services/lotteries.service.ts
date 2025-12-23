/**
 * Lotteries Service
 * Handles lottery information and results
 */

import apiClient from './api';

export interface Lottery {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  schedule: {
    draw_times: string[];
    days: string[];
  };
  games: {
    quiniela: {
      enabled: boolean;
      min_bet: number;
      max_bet: number;
      prize_multiplier: number;
    };
    pale: {
      enabled: boolean;
      min_bet: number;
      max_bet: number;
      prize_multiplier: number;
    };
    tripleta: {
      enabled: boolean;
      min_bet: number;
      max_bet: number;
      prize_multiplier: number;
    };
  };
  status: 'active' | 'inactive';
}

export interface DrawResult {
  lottery_id: string;
  draw_time: string;
  winning_numbers: string[];
  quiniela?: string;
  pale?: string;
  tripleta?: string;
  created_at: string;
}

/**
 * Get all lotteries
 */
export const getLotteries = async (): Promise<Lottery[]> => {
  const response = await apiClient.get<{ lotteries: Lottery[] }>('/lotteries');
  return response.data.lotteries;
};

/**
 * Get lottery by ID
 */
export const getLottery = async (lotteryId: string): Promise<Lottery> => {
  const response = await apiClient.get<Lottery>(`/lotteries/${lotteryId}`);
  return response.data;
};

/**
 * Get latest draw results
 */
export const getLatestResults = async (
  lotteryId?: string,
  limit: number = 10
): Promise<DrawResult[]> => {
  const params = new URLSearchParams({ limit: limit.toString() });
  
  if (lotteryId) {
    params.append('lottery_id', lotteryId);
  }
  
  const response = await apiClient.get<{ results: DrawResult[] }>(
    `/lotteries/results/latest?${params.toString()}`
  );
  
  return response.data.results;
};

/**
 * Get draw result by date
 */
export const getResultByDate = async (
  lotteryId: string,
  date: string,
  drawTime: string
): Promise<DrawResult> => {
  const response = await apiClient.get<DrawResult>(
    `/lotteries/${lotteryId}/results?date=${date}&draw_time=${drawTime}`
  );
  
  return response.data;
};

/**
 * Get upcoming draws
 */
export const getUpcomingDraws = async (): Promise<{
  lottery_id: string;
  name: string;
  next_draw: string;
  time_until_draw: number;
}[]> => {
  const response = await apiClient.get('/lotteries/upcoming');
  return response.data.draws;
};
