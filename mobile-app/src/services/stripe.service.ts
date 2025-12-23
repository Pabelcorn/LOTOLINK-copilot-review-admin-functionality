/**
 * Stripe Payment Service
 * Handles card tokenization using server-side tokenization for secure payment processing
 * 
 * SECURITY: Card details are sent over HTTPS to our backend, which tokenizes them with Stripe.
 * This approach is PCI-DSS compliant and recommended for Capacitor/mobile apps.
 */

// Card details are no longer tokenized client-side
// They are sent to the backend for secure server-side tokenization

/**
 * Create a payment token from card details
 * Uses server-side tokenization for maximum security
 */
export interface CardDetails {
  number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
  name: string;
}

export interface TokenResult {
  success: boolean;
  token?: string;
  error?: string;
}

export const createCardToken = async (cardDetails: CardDetails): Promise<TokenResult> => {
  try {
    // Server-side tokenization endpoint
    // Card details are sent over HTTPS and immediately tokenized by Stripe on the backend
    // This is the secure, PCI-compliant approach for mobile apps
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    // TODO: Get user ID and auth token from authentication context
    // For now, this is a placeholder that needs to be replaced with actual auth integration
    // Example: const { userId, token } = useAuth();
    const userId = 'user_123'; // SECURITY: Replace with actual authenticated user ID
    const authToken = ''; // SECURITY: Replace with actual JWT token from auth context
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token is available
    // TODO: In production, this MUST be populated from auth context
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${apiUrl}/api/v1/users/${userId}/payment-methods/tokenize`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        cardDetails: {
          number: cardDetails.number.replace(/\s/g, ''),
          exp_month: cardDetails.exp_month,
          exp_year: cardDetails.exp_year,
          cvc: cardDetails.cvc,
          name: cardDetails.name,
        },
        setAsDefault: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || 'Error al procesar la tarjeta',
      };
    }

    const paymentMethod = await response.json();
    
    return {
      success: true,
      token: paymentMethod.id, // Payment method ID acts as the token
    };
  } catch (error) {
    console.error('Error creating card token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Validate card number using Luhn algorithm
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate expiry date
 */
export const validateExpiry = (month: number, year: number): boolean => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 0-indexed

  // Convert 2-digit year to 4-digit
  const fullYear = year < 100 ? 2000 + year : year;

  if (fullYear < currentYear) {
    return false;
  }

  if (fullYear === currentYear && month < currentMonth) {
    return false;
  }

  return month >= 1 && month <= 12;
};

/**
 * Validate CVC
 */
export const validateCvc = (cvc: string, cardBrand?: string): boolean => {
  const cleaned = cvc.replace(/\s/g, '');
  
  // Amex requires 4 digits, others require 3
  if (cardBrand === 'amex' || cardBrand === 'american express') {
    return /^\d{4}$/.test(cleaned);
  }
  
  return /^\d{3,4}$/.test(cleaned);
};

/**
 * Detect card brand from number
 */
export const detectCardBrand = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  // Visa
  if (/^4/.test(cleaned)) {
    return 'visa';
  }
  
  // Mastercard
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
    return 'mastercard';
  }
  
  // Amex
  if (/^3[47]/.test(cleaned)) {
    return 'amex';
  }
  
  // Discover
  if (/^6(?:011|5)/.test(cleaned)) {
    return 'discover';
  }
  
  // Diners
  if (/^3(?:0[0-5]|[68])/.test(cleaned)) {
    return 'diners';
  }
  
  // JCB
  if (/^35/.test(cleaned)) {
    return 'jcb';
  }
  
  return 'unknown';
};

/**
 * Format card number with spaces
 */
export const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const brand = detectCardBrand(cleaned);
  
  // Amex: XXXX XXXXXX XXXXX
  if (brand === 'amex') {
    const match = cleaned.match(/(\d{1,4})(\d{1,6})?(\d{1,5})?/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(' ');
    }
  }
  
  // Others: XXXX XXXX XXXX XXXX
  const match = cleaned.match(/.{1,4}/g);
  return match ? match.join(' ').slice(0, 19) : cleaned;
};

/**
 * Format expiry date MM/YY
 */
export const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return cleaned;
};
