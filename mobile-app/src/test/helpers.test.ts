/**
 * Tests for utility helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPhoneNumber,
  isValidPhoneNumber,
  isValidEmail,
  generateUUID,
  capitalize,
  truncate,
  isValidLotteryNumber,
  formatLotteryNumber,
} from '../utils/helpers';

describe('Utility Helpers', () => {
  describe('formatCurrency', () => {
    it('should format currency in DOP', () => {
      expect(formatCurrency(1000)).toContain('1,000');
      expect(formatCurrency(0)).toContain('0');
      expect(formatCurrency(1234.56)).toContain('1,234.56');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit phone numbers', () => {
      expect(formatPhoneNumber('8091234567')).toBe('(809) 123-4567');
      expect(formatPhoneNumber('8291234567')).toBe('(829) 123-4567');
    });

    it('should return original if not 10 digits', () => {
      expect(formatPhoneNumber('123')).toBe('123');
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate Dominican phone numbers', () => {
      expect(isValidPhoneNumber('8091234567')).toBe(true);
      expect(isValidPhoneNumber('8291234567')).toBe(true);
      expect(isValidPhoneNumber('8491234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('1234567890')).toBe(false);
      expect(isValidPhoneNumber('809123456')).toBe(false);
      expect(isValidPhoneNumber('abc')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('generateUUID', () => {
    it('should generate valid UUID v4', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('should use custom suffix', () => {
      expect(truncate('Hello World', 8, '---')).toBe('Hello---');
    });
  });

  describe('isValidLotteryNumber', () => {
    it('should validate lottery numbers 0-99', () => {
      expect(isValidLotteryNumber('0')).toBe(true);
      expect(isValidLotteryNumber('50')).toBe(true);
      expect(isValidLotteryNumber('99')).toBe(true);
    });

    it('should reject invalid numbers', () => {
      expect(isValidLotteryNumber('100')).toBe(false);
      expect(isValidLotteryNumber('-1')).toBe(false);
      expect(isValidLotteryNumber('abc')).toBe(false);
    });
  });

  describe('formatLotteryNumber', () => {
    it('should format with leading zero', () => {
      expect(formatLotteryNumber('5')).toBe('05');
      expect(formatLotteryNumber(5)).toBe('05');
      expect(formatLotteryNumber('15')).toBe('15');
      expect(formatLotteryNumber(99)).toBe('99');
    });
  });
});
