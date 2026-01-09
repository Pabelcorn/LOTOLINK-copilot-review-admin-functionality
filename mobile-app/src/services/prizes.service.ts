import api from './api';

export interface BankAccountInfo {
  bank: string;
  account: string;
  holder: string;
}

export interface Prize {
  id: string;
  playId: string;
  userId: string;
  bancaId: string;
  lotteryId: string;
  lotteryDrawId?: string;
  drawDate: Date;
  betTypeId: string;
  winningNumbers: string[];
  matchedNumbers: string[];
  betAmount: number;
  prizeMultiplier: number;
  prizeAmount: number;
  status: string;
  claimedAt?: Date;
  paymentMethod?: 'bank_transfer' | 'cash' | 'wallet';
  bankAccount?: BankAccountInfo;
  paidAt?: Date;
  paidBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationNotes?: string;
  transactionId?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrizeListResponse {
  prizes: Prize[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Get user's prizes
 */
export const getUserPrizes = async (userId: string, limit = 20, offset = 0): Promise<PrizeListResponse> => {
  const response = await api.get(`/prizes/user/${userId}?limit=${limit}&offset=${offset}`);
  return response.data;
};

/**
 * Get prize by ID
 */
export const getPrizeById = async (prizeId: string): Promise<Prize> => {
  const response = await api.get(`/prizes/${prizeId}`);
  return response.data;
};

/**
 * Claim a prize
 */
export const claimPrize = async (
  prizeId: string,
  paymentMethod: 'bank_transfer' | 'cash' | 'wallet',
  bankAccount?: BankAccountInfo
): Promise<Prize> => {
  const payload: any = { paymentMethod };
  if (bankAccount) {
    payload.bankAccount = bankAccount;
  }
  const response = await api.post(`/prizes/${prizeId}/claim`, payload);
  return response.data;
};

/**
 * Get pending prizes (admin only)
 */
export const getPendingPrizes = async (limit = 50, offset = 0): Promise<PrizeListResponse> => {
  const response = await api.get(`/prizes/admin/pending?limit=${limit}&offset=${offset}`);
  return response.data;
};

/**
 * Verify prize (admin only)
 */
export const verifyPrize = async (prizeId: string, adminId: string, notes?: string): Promise<Prize> => {
  const response = await api.post(`/prizes/${prizeId}/verify`, { adminId, notes });
  return response.data;
};

/**
 * Approve prize (admin only)
 */
export const approvePrize = async (prizeId: string, adminId: string, notes?: string): Promise<Prize> => {
  const response = await api.post(`/prizes/${prizeId}/approve`, { adminId, notes });
  return response.data;
};

/**
 * Reject prize (admin only)
 */
export const rejectPrize = async (prizeId: string, adminId: string, reason: string): Promise<Prize> => {
  const response = await api.post(`/prizes/${prizeId}/reject`, { adminId, reason });
  return response.data;
};

/**
 * Process prize payment (admin only)
 */
export const processPrizePayment = async (
  prizeId: string,
  adminId: string,
  transactionId?: string,
  receiptNumber?: string
): Promise<Prize> => {
  const response = await api.post(`/prizes/${prizeId}/pay`, { adminId, transactionId, receiptNumber });
  return response.data;
};

const prizesService = {
  getUserPrizes,
  getPrizeById,
  claimPrize,
  getPendingPrizes,
  verifyPrize,
  approvePrize,
  rejectPrize,
  processPrizePayment,
};

export default prizesService;
