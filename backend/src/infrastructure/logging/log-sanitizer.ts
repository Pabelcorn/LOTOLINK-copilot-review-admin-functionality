export class LogSanitizer {
  private static readonly SENSITIVE_KEYS = [
    'password',
    'token',
    'secret',
    'authorization',
    'cookie',
    'card',
    'cvc',
    'cvv',
    'exp_month',
    'exp_year',
    'number',
    'cardDetails',
    'carddetails',
    'paymentMethodId',
    'paymentmethodid',
    'client_secret',
    'clientsecret',
  ];

  static sanitize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }
    
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (this.isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  private static isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.SENSITIVE_KEYS.some(sensitive => 
      lowerKey.includes(sensitive.toLowerCase())
    );
  }
  
  static safeStringify(obj: any): string {
    return JSON.stringify(this.sanitize(obj));
  }
}
