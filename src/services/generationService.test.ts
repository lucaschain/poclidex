import { describe, it, expect, beforeEach } from 'vitest';
import { GenerationService } from './generationService.js';

describe('GenerationService', () => {
  let service: GenerationService;

  beforeEach(() => {
    service = new GenerationService();
  });

  describe('constructor', () => {
    it('should initialize with generation 9 (latest)', () => {
      expect(service.getSessionGeneration()).toBe(9);
    });
  });

  describe('getSessionGeneration()', () => {
    it('should return the current session generation', () => {
      expect(service.getSessionGeneration()).toBe(9);
    });

    it('should return updated generation after setting', () => {
      service.setSessionGeneration(5);
      expect(service.getSessionGeneration()).toBe(5);
    });
  });

  describe('setSessionGeneration()', () => {
    it('should set generation 1', () => {
      service.setSessionGeneration(1);
      expect(service.getSessionGeneration()).toBe(1);
    });

    it('should set generation 5', () => {
      service.setSessionGeneration(5);
      expect(service.getSessionGeneration()).toBe(5);
    });

    it('should set generation 9', () => {
      service.setSessionGeneration(9);
      expect(service.getSessionGeneration()).toBe(9);
    });

    it('should throw error for generation 0', () => {
      expect(() => service.setSessionGeneration(0)).toThrow('Invalid generation: 0');
    });

    it('should throw error for generation 10', () => {
      expect(() => service.setSessionGeneration(10)).toThrow('Invalid generation: 10');
    });

    it('should throw error for negative generations', () => {
      expect(() => service.setSessionGeneration(-1)).toThrow('Invalid generation: -1');
    });

    it('should throw error with correct message format', () => {
      expect(() => service.setSessionGeneration(100)).toThrow(/Must be between 1 and 9/);
    });
  });

  describe('getEffectiveGeneration()', () => {
    it('should return session generation when Pokemon is older', () => {
      service.setSessionGeneration(5);
      // Pikachu is from Gen 1
      expect(service.getEffectiveGeneration(1)).toBe(5);
    });

    it('should return Pokemon generation when Pokemon is newer than session', () => {
      service.setSessionGeneration(3);
      // Lucario is from Gen 4
      expect(service.getEffectiveGeneration(4)).toBe(4);
    });

    it('should return same generation when they match', () => {
      service.setSessionGeneration(6);
      expect(service.getEffectiveGeneration(6)).toBe(6);
    });

    it('should handle Gen 1 Pokemon in Gen 1 session', () => {
      service.setSessionGeneration(1);
      expect(service.getEffectiveGeneration(1)).toBe(1);
    });

    it('should handle Gen 9 Pokemon in Gen 9 session', () => {
      service.setSessionGeneration(9);
      expect(service.getEffectiveGeneration(9)).toBe(9);
    });

    it('should prevent viewing Gen 7 Pokemon in Gen 3', () => {
      service.setSessionGeneration(3);
      // Pokemon from Gen 7 cannot be viewed in Gen 3
      expect(service.getEffectiveGeneration(7)).toBe(7);
    });

    it('should use max of session and Pokemon generation', () => {
      service.setSessionGeneration(2);
      expect(service.getEffectiveGeneration(5)).toBe(5); // max(2, 5) = 5

      service.setSessionGeneration(8);
      expect(service.getEffectiveGeneration(3)).toBe(8); // max(8, 3) = 8
    });
  });

  describe('session persistence', () => {
    it('should maintain generation across multiple gets', () => {
      service.setSessionGeneration(4);
      expect(service.getSessionGeneration()).toBe(4);
      expect(service.getSessionGeneration()).toBe(4);
      expect(service.getSessionGeneration()).toBe(4);
    });

    it('should allow changing generation multiple times', () => {
      service.setSessionGeneration(1);
      expect(service.getSessionGeneration()).toBe(1);

      service.setSessionGeneration(5);
      expect(service.getSessionGeneration()).toBe(5);

      service.setSessionGeneration(9);
      expect(service.getSessionGeneration()).toBe(9);

      service.setSessionGeneration(3);
      expect(service.getSessionGeneration()).toBe(3);
    });
  });
});
