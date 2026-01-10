import { LogSanitizer } from '../../src/infrastructure/logging/log-sanitizer';

describe('LogSanitizer', () => {
  describe('sanitize', () => {
    it('should redact password fields', () => {
      const input = {
        username: 'testuser',
        password: 'secret123',
        email: 'test@example.com',
      };

      const result = LogSanitizer.sanitize(input);

      expect(result.username).toBe('testuser');
      expect(result.password).toBe('[REDACTED]');
      expect(result.email).toBe('test@example.com');
    });

    it('should redact token fields', () => {
      const input = {
        userId: '123',
        accessToken: 'jwt_token_here',
        refreshToken: 'refresh_token_here',
      };

      const result = LogSanitizer.sanitize(input);

      expect(result.userId).toBe('123');
      expect(result.accessToken).toBe('[REDACTED]');
      expect(result.refreshToken).toBe('[REDACTED]');
    });

    it('should redact card details', () => {
      const input = {
        cardDetails: {
          number: '4242424242424242',
          exp_month: '12',
          exp_year: '2025',
          cvc: '123',
          name: 'John Doe',
        },
      };

      const result = LogSanitizer.sanitize(input);

      expect(result.cardDetails).toBe('[REDACTED]');
    });

    it('should redact nested card information', () => {
      const input = {
        user: {
          id: '123',
          paymentInfo: {
            card_number: '4242424242424242',
            cvv: '123',
          },
        },
      };

      const result = LogSanitizer.sanitize(input);

      expect(result.user.id).toBe('123');
      expect(result.user.paymentInfo.card_number).toBe('[REDACTED]');
      expect(result.user.paymentInfo.cvv).toBe('[REDACTED]');
    });

    it('should redact authorization headers', () => {
      const input = {
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer token123',
        },
      };

      const result = LogSanitizer.sanitize(input);

      expect(result.headers['content-type']).toBe('application/json');
      expect(result.headers['authorization']).toBe('[REDACTED]');
    });

    it('should redact Stripe client secrets', () => {
      const input = {
        paymentIntent: {
          id: 'pi_123',
          client_secret: 'pi_123_secret_abc',
          amount: 1000,
        },
      };

      const result = LogSanitizer.sanitize(input);

      expect(result.paymentIntent.id).toBe('pi_123');
      expect(result.paymentIntent.client_secret).toBe('[REDACTED]');
      expect(result.paymentIntent.amount).toBe(1000);
    });

    it('should handle arrays', () => {
      const input = [
        { username: 'user1', password: 'pass1' },
        { username: 'user2', password: 'pass2' },
      ];

      const result = LogSanitizer.sanitize(input);

      expect(result[0].username).toBe('user1');
      expect(result[0].password).toBe('[REDACTED]');
      expect(result[1].username).toBe('user2');
      expect(result[1].password).toBe('[REDACTED]');
    });

    it('should handle null and undefined', () => {
      expect(LogSanitizer.sanitize(null)).toBeNull();
      expect(LogSanitizer.sanitize(undefined)).toBeUndefined();
    });

    it('should handle primitive values', () => {
      expect(LogSanitizer.sanitize('string')).toBe('string');
      expect(LogSanitizer.sanitize(123)).toBe(123);
      expect(LogSanitizer.sanitize(true)).toBe(true);
    });

    it('should be case-insensitive for sensitive keys', () => {
      const input = {
        Password: 'secret',
        TOKEN: 'token123',
        CardDetails: { number: '4242' },
      };

      const result = LogSanitizer.sanitize(input);

      expect(result.Password).toBe('[REDACTED]');
      expect(result.TOKEN).toBe('[REDACTED]');
      expect(result.CardDetails).toBe('[REDACTED]');
    });
  });

  describe('safeStringify', () => {
    it('should return sanitized JSON string', () => {
      const input = {
        username: 'testuser',
        password: 'secret123',
        age: 25,
      };

      const result = LogSanitizer.safeStringify(input);
      const parsed = JSON.parse(result);

      expect(parsed.username).toBe('testuser');
      expect(parsed.password).toBe('[REDACTED]');
      expect(parsed.age).toBe(25);
    });

    it('should handle complex nested objects', () => {
      const input = {
        request: {
          method: 'POST',
          headers: {
            authorization: 'Bearer token',
          },
          body: {
            user: {
              email: 'test@example.com',
              password: 'secret',
            },
          },
        },
      };

      const result = LogSanitizer.safeStringify(input);
      const parsed = JSON.parse(result);

      expect(parsed.request.method).toBe('POST');
      expect(parsed.request.headers.authorization).toBe('[REDACTED]');
      expect(parsed.request.body.user.email).toBe('test@example.com');
      expect(parsed.request.body.user.password).toBe('[REDACTED]');
    });
  });
});
