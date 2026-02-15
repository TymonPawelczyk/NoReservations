import { describe, it, expect } from 'vitest';
import { AVATARS, AVATAR_DISPLAY_NAMES, AvatarKey, AvatarEmotion } from '../avatars';

describe('avatars.ts - Avatar Configuration', () => {
  describe('AVATARS mapping', () => {
    it('should have mappings for both avatar keys', () => {
      expect(AVATARS).toHaveProperty('paula');
      expect(AVATARS).toHaveProperty('tymon');
    });

    it('should have all emotion states for paula', () => {
      const emotions: AvatarEmotion[] = ['closed', 'happy', 'open', 'surprised'];
      emotions.forEach(emotion => {
        expect(AVATARS.paula).toHaveProperty(emotion);
        expect(typeof AVATARS.paula[emotion]).toBe('string');
      });
    });

    it('should have all emotion states for tymon', () => {
      const emotions: AvatarEmotion[] = ['closed', 'happy', 'open', 'surprised'];
      emotions.forEach(emotion => {
        expect(AVATARS.tymon).toHaveProperty(emotion);
        expect(typeof AVATARS.tymon[emotion]).toBe('string');
      });
    });

    it('should have valid image paths for all avatars', () => {
      const avatarKeys: AvatarKey[] = ['paula', 'tymon'];
      const emotions: AvatarEmotion[] = ['closed', 'happy', 'open', 'surprised'];

      avatarKeys.forEach(key => {
        emotions.forEach(emotion => {
          const path = AVATARS[key][emotion];
          expect(path).toMatch(/^\/avatars\/avatar-.*\.png$/);
        });
      });
    });

    it('should have correct path structure for paula avatars', () => {
      expect(AVATARS.paula.closed).toBe('/avatars/avatar-paula-closed.png');
      expect(AVATARS.paula.happy).toBe('/avatars/avatar-paula-happy.png');
      expect(AVATARS.paula.open).toBe('/avatars/avatar-paula-open.png');
      expect(AVATARS.paula.surprised).toBe('/avatars/avatar-paula-suprised.png');
    });

    it('should have correct path structure for tymon avatars', () => {
      expect(AVATARS.tymon.closed).toBe('/avatars/avatar-tymon-closed.png');
      expect(AVATARS.tymon.happy).toBe('/avatars/avatar-tymon-happy.png');
      expect(AVATARS.tymon.open).toBe('/avatars/avatar-tymon-open.png');
      expect(AVATARS.tymon.surprised).toBe('/avatars/avatar-tymon-suprised.png');
    });

    it('should not have undefined values', () => {
      const avatarKeys: AvatarKey[] = ['paula', 'tymon'];
      const emotions: AvatarEmotion[] = ['closed', 'happy', 'open', 'surprised'];

      avatarKeys.forEach(key => {
        emotions.forEach(emotion => {
          expect(AVATARS[key][emotion]).toBeDefined();
          expect(AVATARS[key][emotion]).not.toBe('');
        });
      });
    });

    it('should have unique paths for each emotion per avatar', () => {
      const paulaPaths = Object.values(AVATARS.paula);
      const tymonPaths = Object.values(AVATARS.tymon);

      expect(new Set(paulaPaths).size).toBe(paulaPaths.length);
      expect(new Set(tymonPaths).size).toBe(tymonPaths.length);
    });
  });

  describe('AVATAR_DISPLAY_NAMES', () => {
    it('should have display names for both avatars', () => {
      expect(AVATAR_DISPLAY_NAMES).toHaveProperty('paula');
      expect(AVATAR_DISPLAY_NAMES).toHaveProperty('tymon');
    });

    it('should have correct display names', () => {
      expect(AVATAR_DISPLAY_NAMES.paula).toBe('Paula');
      expect(AVATAR_DISPLAY_NAMES.tymon).toBe('Tymon');
    });

    it('should have string values for all display names', () => {
      const keys: AvatarKey[] = ['paula', 'tymon'];
      keys.forEach(key => {
        expect(typeof AVATAR_DISPLAY_NAMES[key]).toBe('string');
        expect(AVATAR_DISPLAY_NAMES[key].length).toBeGreaterThan(0);
      });
    });

    it('should match avatar keys count', () => {
      const avatarKeysCount = Object.keys(AVATARS).length;
      const displayNamesCount = Object.keys(AVATAR_DISPLAY_NAMES).length;
      expect(displayNamesCount).toBe(avatarKeysCount);
    });
  });

  describe('Type safety', () => {
    it('should allow valid avatar keys', () => {
      const validKeys: AvatarKey[] = ['paula', 'tymon'];
      validKeys.forEach(key => {
        expect(AVATARS[key]).toBeDefined();
      });
    });

    it('should allow valid emotion keys', () => {
      const validEmotions: AvatarEmotion[] = ['closed', 'happy', 'open', 'surprised'];
      validEmotions.forEach(emotion => {
        expect(AVATARS.paula[emotion]).toBeDefined();
        expect(AVATARS.tymon[emotion]).toBeDefined();
      });
    });
  });
});
