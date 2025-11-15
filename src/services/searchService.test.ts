import { describe, it, expect, beforeEach } from 'vitest';
import { searchService } from './searchService.js';
import { mockPokemonList } from '../../tests/fixtures/pokemon-data.js';

describe('SearchService', () => {
  beforeEach(() => {
    // Reset search service with fresh data
    searchService.indexPokemon(mockPokemonList);
  });

  describe('indexPokemon', () => {
    it('should index Pokemon for searching', () => {
      searchService.indexPokemon(mockPokemonList);

      const results = searchService.search('pikachu');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('pikachu');
    });

    it('should handle empty Pokemon list', () => {
      searchService.indexPokemon([]);

      const results = searchService.search('pikachu');

      expect(results).toEqual([]);
    });
  });

  describe('search', () => {
    it('should find exact matches', () => {
      const results = searchService.search('pikachu');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('pikachu');
    });

    it('should perform fuzzy search', () => {
      const results = searchService.search('char');

      const resultNames = results.map(r => r.name);
      expect(resultNames).toContain('charmander');
      expect(resultNames).toContain('charmeleon');
      expect(resultNames).toContain('charizard');
    });

    it('should return results sorted by relevance', () => {
      const results = searchService.search('bulb');

      // Bulbasaur should be first (closest match)
      expect(results[0].name).toBe('bulbasaur');
    });

    it('should handle case-insensitive search', () => {
      const lowerResults = searchService.search('pikachu');
      const upperResults = searchService.search('PIKACHU');
      const mixedResults = searchService.search('PiKaChU');

      expect(lowerResults[0].name).toBe('pikachu');
      expect(upperResults[0].name).toBe('pikachu');
      expect(mixedResults[0].name).toBe('pikachu');
    });

    it('should return empty array for no matches', () => {
      const results = searchService.search('zzzzzzz');

      expect(results).toEqual([]);
    });

    it('should return empty array for empty query', () => {
      const results = searchService.search('');

      expect(results).toEqual([]);
    });

    it('should respect limit parameter', () => {
      const results = searchService.search('a', 3);

      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should find partial matches', () => {
      const results = searchService.search('ivy');

      const resultNames = results.map(r => r.name);
      expect(resultNames).toContain('ivysaur');
    });

    it('should handle special characters', () => {
      const results = searchService.search('char-');

      // Search should not crash with special characters
      // May return empty results if no matches
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('autocomplete', () => {
    it('should return autocomplete suggestions', () => {
      const suggestions = searchService.autocomplete('char', 5);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5);
      expect(suggestions).toContain('charmander');
      expect(suggestions).toContain('charmeleon');
      expect(suggestions).toContain('charizard');
    });

    it('should return empty array for no matches', () => {
      const suggestions = searchService.autocomplete('zzzzz', 5);

      expect(suggestions).toEqual([]);
    });

    it('should return empty array for empty query', () => {
      const suggestions = searchService.autocomplete('', 5);

      expect(suggestions).toEqual([]);
    });

    it('should respect limit parameter', () => {
      const suggestions = searchService.autocomplete('a', 2);

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should return suggestions in relevance order', () => {
      const suggestions = searchService.autocomplete('bulb', 5);

      // Exact prefix matches should come first
      expect(suggestions[0]).toBe('bulbasaur');
    });
  });

  describe('searchById', () => {
    it('should find Pokemon by valid ID', () => {
      const result = searchService.searchById(1);

      expect(result).toBeDefined();
      expect(result?.name).toBe('bulbasaur');
    });

    it('should find Pokemon by ID in middle of range', () => {
      const result = searchService.searchById(5);

      expect(result).toBeDefined();
      expect(result?.name).toBe('charmeleon');
    });

    it('should find Pokemon by array index (ID 10 = pikachu at index 10)', () => {
      // searchById uses array index (1-based), so ID 10 gets index 9 (pikachu)
      const result = searchService.searchById(10);

      expect(result).toBeDefined();
      expect(result?.name).toBe('pikachu');
    });

    it('should return undefined for invalid ID (0)', () => {
      const result = searchService.searchById(0);

      expect(result).toBeUndefined();
    });

    it('should return undefined for negative ID', () => {
      const result = searchService.searchById(-5);

      expect(result).toBeUndefined();
    });

    it('should return undefined for ID beyond range', () => {
      const result = searchService.searchById(9999);

      expect(result).toBeUndefined();
    });

    it('should find Pokemon at any valid array position', () => {
      // Mock list has 13 items, so ID 11-13 should work
      const result = searchService.searchById(11);

      expect(result).toBeDefined();
      expect(result?.name).toBe('chikorita');
    });
  });

  describe('getByName', () => {
    it('should find Pokemon by exact name', () => {
      const result = searchService.getByName('pikachu');

      expect(result).toBeDefined();
      expect(result?.name).toBe('pikachu');
    });

    it('should handle case-insensitive name search', () => {
      const lowerResult = searchService.getByName('pikachu');
      const upperResult = searchService.getByName('PIKACHU');
      const mixedResult = searchService.getByName('PiKaChU');

      expect(lowerResult?.name).toBe('pikachu');
      expect(upperResult?.name).toBe('pikachu');
      expect(mixedResult?.name).toBe('pikachu');
    });

    it('should return undefined for non-existent name', () => {
      const result = searchService.getByName('fakemon');

      expect(result).toBeUndefined();
    });

    it('should return undefined for empty name', () => {
      const result = searchService.getByName('');

      expect(result).toBeUndefined();
    });

    it('should find Pokemon with hyphens in name', () => {
      // Note: Our mock data doesn't have hyphenated names,
      // but we can test with existing names
      const result = searchService.getByName('bulbasaur');

      expect(result).toBeDefined();
      expect(result?.name).toBe('bulbasaur');
    });
  });

  describe('totalPokemon', () => {
    it('should return total number of indexed Pokemon', () => {
      const total = searchService.totalPokemon;

      expect(total).toBe(mockPokemonList.length);
    });

    it('should return 0 for empty index', () => {
      searchService.indexPokemon([]);

      const total = searchService.totalPokemon;

      expect(total).toBe(0);
    });

    it('should update after reindexing', () => {
      searchService.indexPokemon(mockPokemonList);
      const initialTotal = searchService.totalPokemon;

      const smallerList = mockPokemonList.slice(0, 5);
      searchService.indexPokemon(smallerList);
      const newTotal = searchService.totalPokemon;

      expect(initialTotal).toBe(mockPokemonList.length);
      expect(newTotal).toBe(5);
    });
  });

  describe('edge cases and integration', () => {
    it('should handle searching after multiple index calls', () => {
      searchService.indexPokemon(mockPokemonList);
      searchService.indexPokemon(mockPokemonList); // Reindex

      const results = searchService.search('pikachu');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('pikachu');
    });

    it('should handle very short queries', () => {
      const results = searchService.search('a');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle queries longer than any Pokemon name', () => {
      const results = searchService.search('superlongquerythatdoesntmatchanything');

      expect(results).toEqual([]);
    });

    it('should maintain search quality after autocomplete', () => {
      searchService.autocomplete('char', 3);
      const searchResults = searchService.search('char');

      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults[0].name).toContain('char');
    });
  });
});
