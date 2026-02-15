import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateSessionCode,
  generateUserId,
  shouldUnlockByTime,
  areBothReady,
} from '../session';

describe('session.ts - Session Utility Functions', () => {
  describe('generateSessionCode', () => {
    it('should generate a 6-digit code', () => {
      const code = generateSessionCode();
      expect(code).toHaveLength(6);
    });

    it('should generate a numeric string', () => {
      const code = generateSessionCode();
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    it('should generate codes between 100000 and 999999', () => {
      const code = generateSessionCode();
      const numericCode = parseInt(code, 10);
      expect(numericCode).toBeGreaterThanOrEqual(100000);
      expect(numericCode).toBeLessThanOrEqual(999999);
    });

    it('should generate different codes on multiple calls', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateSessionCode());
      }
      // With 100 calls, we should get multiple unique codes
      expect(codes.size).toBeGreaterThan(50);
    });
  });

  describe('generateUserId', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate a user ID with correct prefix', () => {
      const userId = generateUserId();
      expect(userId).toMatch(/^user_\d+_[a-z0-9]+$/);
    });

    it('should include timestamp in user ID', () => {
      const mockTimestamp = 1234567890000;
      vi.setSystemTime(mockTimestamp);
      const userId = generateUserId();
      expect(userId).toContain(`user_${mockTimestamp}_`);
    });

    it('should generate unique user IDs', () => {
      const userId1 = generateUserId();
      vi.advanceTimersByTime(100);
      const userId2 = generateUserId();
      expect(userId1).not.toBe(userId2);
    });

    it('should have random suffix after timestamp', () => {
      const userId = generateUserId();
      const parts = userId.split('_');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('user');
      expect(parts[1]).toMatch(/^\d+$/);
      expect(parts[2]).toMatch(/^[a-z0-9]+$/);
      expect(parts[2].length).toBeGreaterThan(0);
    });
  });

  describe('shouldUnlockByTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true if current time is after unlock time', () => {
      const pastTime = new Date(Date.now() - 10000).toISOString();
      expect(shouldUnlockByTime(pastTime)).toBe(true);
    });

    it('should return false if current time is before unlock time', () => {
      const futureTime = new Date(Date.now() + 10000).toISOString();
      expect(shouldUnlockByTime(futureTime)).toBe(false);
    });

    it('should return true if times are exactly equal', () => {
      const now = new Date();
      vi.setSystemTime(now);
      expect(shouldUnlockByTime(now.toISOString())).toBe(true);
    });

    it('should handle various ISO date formats', () => {
      const validFormats = [
        new Date('2020-01-01T00:00:00Z').toISOString(),
        new Date('2020-01-01T00:00:00.000Z').toISOString(),
      ];

      validFormats.forEach(format => {
        const result = shouldUnlockByTime(format);
        expect(typeof result).toBe('boolean');
      });
    });
  });

  describe('areBothReady', () => {
    it('should return true when both users are ready', () => {
      const ready = {
        user1: true,
        user2: true,
      };
      expect(areBothReady(ready)).toBe(true);
    });

    it('should return false when only one user is ready', () => {
      const ready = {
        user1: true,
        user2: false,
      };
      expect(areBothReady(ready)).toBe(false);
    });

    it('should return false when no users are ready', () => {
      const ready = {
        user1: false,
        user2: false,
      };
      expect(areBothReady(ready)).toBe(false);
    });

    it('should return false when only one user exists', () => {
      const ready = {
        user1: true,
      };
      expect(areBothReady(ready)).toBe(false);
    });

    it('should return false when ready object is empty', () => {
      const ready = {};
      expect(areBothReady(ready)).toBe(false);
    });

    it('should return false when more than two users exist but not all ready', () => {
      const ready = {
        user1: true,
        user2: true,
        user3: false,
      };
      expect(areBothReady(ready)).toBe(false);
    });

    it('should handle undefined/null values as false', () => {
      const ready = {
        user1: true,
        user2: undefined as any,
      };
      expect(areBothReady(ready)).toBe(false);
    });
  });
});
