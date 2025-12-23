/**
 * Payment Gateway Port - Interface for payment processing
 */
export interface ChargeRequest {
  userId: string;
  amount: number;
  currency: 'DOP' | 'USD';
  description: string;
  paymentMethodId?: string; // Stripe payment method ID or similar
  bancaId?: string; // Optional banca ID for banca-specific account configuration
  metadata?: Record<string, string>;
}

export interface ChargeResult {
  success: boolean;
  transactionId?: string;
  chargeId?: string;
  status: 'succeeded' | 'pending' | 'failed' | 'requires_action';
  errorCode?: string;
  errorMessage?: string;
  receiptUrl?: string;
}

export interface RefundRequest {
  chargeId: string;
  amount?: number; // Optional for partial refunds
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  status: 'succeeded' | 'pending' | 'failed';
  errorCode?: string;
  errorMessage?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string; // visa, mastercard, etc.
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface CreatePaymentMethodRequest {
  userId: string;
  type: 'card' | 'bank_account';
  token: string; // Stripe token or payment method ID
  setAsDefault?: boolean;
}

export interface CardDetails {
  number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
  name: string;
}

export interface TokenizeCardRequest {
  userId: string;
  cardDetails: CardDetails;
  setAsDefault?: boolean;
}

export interface PaymentGateway {
  /**
   * Charge a payment method
   */
  charge(request: ChargeRequest): Promise<ChargeResult>;

  /**
   * Refund a previous charge
   */
  refund(request: RefundRequest): Promise<RefundResult>;

  /**
   * Create a payment method for a user (tokenized card/bank)
   */
  createPaymentMethod(request: CreatePaymentMethodRequest): Promise<PaymentMethod>;

  /**
   * Tokenize card details server-side and create payment method
   * This is the secure way to handle card data in mobile apps
   */
  tokenizeAndCreatePaymentMethod?(request: TokenizeCardRequest): Promise<PaymentMethod>;

  /**
   * List payment methods for a user
   */
  listPaymentMethods(userId: string): Promise<PaymentMethod[]>;

  /**
   * Delete a payment method
   */
  deletePaymentMethod(userId: string, paymentMethodId: string): Promise<boolean>;

  /**
   * Verify gateway connectivity
   */
  isHealthy(): Promise<boolean>;
}

export const PAYMENT_GATEWAY = Symbol('PaymentGateway');
