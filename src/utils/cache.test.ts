import { describe, it, expect, beforeEach } from 'vitest';
import { LRUCache } from './cache.js';

describe('LRUCache', () => {
  describe('basic operations', () => {
    let cache: LRUCache<string, number>;

    beforeEach(() => {
      cache = new LRUCache<string, number>(3);
    });

    it('should store and retrieve values', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should update existing values', () => {
      cache.set('a', 1);
      cache.set('a', 10);

      expect(cache.get('a')).toBe(10);
    });

    it('should check if key exists', () => {
      cache.set('a', 1);

      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    it('should return correct size', () => {
      expect(cache.size).toBe(0);

      cache.set('a', 1);
      expect(cache.size).toBe(1);

      cache.set('b', 2);
      expect(cache.size).toBe(2);

      cache.set('c', 3);
      expect(cache.size).toBe(3);
    });

    it('should clear all entries', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(false);
      expect(cache.has('c')).toBe(false);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used item when capacity is exceeded', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Cache is full, adding 'd' should evict 'a' (least recently used)
      cache.set('d', 4);

      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(true);
      expect(cache.has('c')).toBe(true);
      expect(cache.has('d')).toBe(true);
      expect(cache.size).toBe(3);
    });

    it('should update LRU order when getting items', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Access 'a', making it most recently used
      cache.get('a');

      // Adding 'd' should now evict 'b' instead of 'a'
      cache.set('d', 4);

      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
      expect(cache.has('c')).toBe(true);
      expect(cache.has('d')).toBe(true);
    });

    it('should update LRU order when setting existing items', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Update 'a', making it most recently used
      cache.set('a', 10);

      // Adding 'd' should evict 'b' (now least recently used)
      cache.set('d', 4);

      expect(cache.has('a')).toBe(true);
      expect(cache.get('a')).toBe(10);
      expect(cache.has('b')).toBe(false);
      expect(cache.has('c')).toBe(true);
      expect(cache.has('d')).toBe(true);
    });

    it('should handle repeated evictions correctly', () => {
      const cache = new LRUCache<string, number>(2);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // evicts 'a'
      cache.set('d', 4); // evicts 'b'
      cache.set('e', 5); // evicts 'c'

      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(false);
      expect(cache.has('c')).toBe(false);
      expect(cache.has('d')).toBe(true);
      expect(cache.has('e')).toBe(true);
      expect(cache.size).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle maxSize of 1', () => {
      const cache = new LRUCache<string, number>(1);

      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);
      expect(cache.size).toBe(1);

      cache.set('b', 2);
      expect(cache.has('a')).toBe(false);
      expect(cache.get('b')).toBe(2);
      expect(cache.size).toBe(1);
    });

    it('should handle maxSize of 0', () => {
      const cache = new LRUCache<string, number>(0);

      cache.set('a', 1);
      expect(cache.size).toBe(0);
      expect(cache.has('a')).toBe(false);
      expect(cache.get('a')).toBeUndefined();
    });

    it('should work with different value types', () => {
      const cache = new LRUCache<string, { name: string; value: number }>(2);

      cache.set('obj1', { name: 'first', value: 1 });
      cache.set('obj2', { name: 'second', value: 2 });

      expect(cache.get('obj1')).toEqual({ name: 'first', value: 1 });
      expect(cache.get('obj2')).toEqual({ name: 'second', value: 2 });
    });

    it('should work with numeric keys', () => {
      const cache = new LRUCache<number, string>(3);

      cache.set(1, 'one');
      cache.set(2, 'two');
      cache.set(3, 'three');

      expect(cache.get(1)).toBe('one');
      expect(cache.get(2)).toBe('two');
      expect(cache.get(3)).toBe('three');
    });

    it('should handle null and undefined values', () => {
      const cache = new LRUCache<string, any>(5);

      cache.set('null', null);
      cache.set('undefined', undefined);
      cache.set('zero', 0);
      cache.set('empty', '');

      expect(cache.get('null')).toBeNull();
      expect(cache.get('undefined')).toBeUndefined();
      expect(cache.get('zero')).toBe(0);
      expect(cache.get('empty')).toBe('');
      expect(cache.has('null')).toBe(true);
      expect(cache.has('undefined')).toBe(true);
      expect(cache.has('zero')).toBe(true);
    });
  });

  describe('complex LRU scenarios', () => {
    it('should maintain correct order with mixed get and set operations', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1); // Order: a
      cache.set('b', 2); // Order: b, a
      cache.set('c', 3); // Order: c, b, a

      cache.get('a'); // Order: a, c, b
      cache.get('b'); // Order: b, a, c

      cache.set('d', 4); // Order: d, b, a (c evicted)

      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(true);
      expect(cache.has('c')).toBe(false);
      expect(cache.has('d')).toBe(true);
    });
  });
});
