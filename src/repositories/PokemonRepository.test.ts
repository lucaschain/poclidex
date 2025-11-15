import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PokemonRepository } from './PokemonRepository.js';
import { pokemonService } from '../services/pokemonService.js';
import { mockPokemonList } from '../../tests/fixtures/pokemon-data.js';

// Mock the pokemonService
vi.mock('../services/pokemonService.js', () => ({
  pokemonService: {
    loadPokemonList: vi.fn(),
  },
}));

describe('PokemonRepository', () => {
  let repository: PokemonRepository;

  beforeEach(() => {
    repository = new PokemonRepository();
    vi.clearAllMocks();

    // Setup default mock behavior
    vi.mocked(pokemonService.loadPokemonList).mockResolvedValue(mockPokemonList);
  });

  describe('getGeneration', () => {
    it('should return generation 1 for Kanto Pokemon (1-151)', () => {
      expect(repository.getGeneration(1)).toBe(1); // Bulbasaur
      expect(repository.getGeneration(25)).toBe(1); // Pikachu
      expect(repository.getGeneration(151)).toBe(1); // Mew
    });

    it('should return generation 2 for Johto Pokemon (152-251)', () => {
      expect(repository.getGeneration(152)).toBe(2); // Chikorita
      expect(repository.getGeneration(200)).toBe(2); // Misdreavus
      expect(repository.getGeneration(251)).toBe(2); // Celebi
    });

    it('should return generation 3 for Hoenn Pokemon (252-386)', () => {
      expect(repository.getGeneration(252)).toBe(3); // Treecko
      expect(repository.getGeneration(300)).toBe(3); // Skitty
      expect(repository.getGeneration(386)).toBe(3); // Deoxys
    });

    it('should return generation 4 for Sinnoh Pokemon (387-493)', () => {
      expect(repository.getGeneration(387)).toBe(4); // Turtwig
      expect(repository.getGeneration(493)).toBe(4); // Arceus
    });

    it('should return generation 5 for Unova Pokemon (494-649)', () => {
      expect(repository.getGeneration(494)).toBe(5); // Victini
      expect(repository.getGeneration(649)).toBe(5); // Genesect
    });

    it('should return generation 6 for Kalos Pokemon (650-721)', () => {
      expect(repository.getGeneration(650)).toBe(6); // Chespin
      expect(repository.getGeneration(721)).toBe(6); // Volcanion
    });

    it('should return generation 7 for Alola Pokemon (722-809)', () => {
      expect(repository.getGeneration(722)).toBe(7); // Rowlet
      expect(repository.getGeneration(809)).toBe(7); // Melmetal
    });

    it('should return generation 8 for Galar Pokemon (810-905)', () => {
      expect(repository.getGeneration(810)).toBe(8); // Grookey
      expect(repository.getGeneration(905)).toBe(8); // Enamorus
    });

    it('should return generation 9 for Paldea Pokemon (906-1025)', () => {
      expect(repository.getGeneration(906)).toBe(9); // Sprigatito
      expect(repository.getGeneration(1000)).toBe(9); // Gholdengo
      expect(repository.getGeneration(1025)).toBe(9); // Pecharunt
    });

    it('should handle generation boundaries correctly', () => {
      expect(repository.getGeneration(151)).toBe(1);
      expect(repository.getGeneration(152)).toBe(2);
      expect(repository.getGeneration(251)).toBe(2);
      expect(repository.getGeneration(252)).toBe(3);
    });

    it('should return 1 for invalid/unknown IDs', () => {
      expect(repository.getGeneration(0)).toBe(1);
      expect(repository.getGeneration(2000)).toBe(1);
      expect(repository.getGeneration(-5)).toBe(1);
    });
  });

  describe('getPokemonList', () => {
    it('should return all Pokemon without filters', async () => {
      const result = await repository.getPokemonList();

      expect(result).toEqual(mockPokemonList);
      expect(pokemonService.loadPokemonList).toHaveBeenCalledTimes(1);
    });

    it('should filter by generation 1', async () => {
      const result = await repository.getPokemonList({ generation: 1 });

      const ids = result.map(p => {
        const matches = p.url.match(/\/pokemon\/(\d+)\//);
        return matches ? parseInt(matches[1], 10) : 0;
      });

      // All Pokemon should be from generation 1 (IDs 1-151)
      ids.forEach(id => {
        expect(id).toBeGreaterThanOrEqual(1);
        expect(id).toBeLessThanOrEqual(151);
      });
    });

    it('should filter by generation 2', async () => {
      const result = await repository.getPokemonList({ generation: 2 });

      const ids = result.map(p => {
        const matches = p.url.match(/\/pokemon\/(\d+)\//);
        return matches ? parseInt(matches[1], 10) : 0;
      });

      // All Pokemon should be from generation 2 (IDs 152-251)
      ids.forEach(id => {
        expect(id).toBeGreaterThanOrEqual(152);
        expect(id).toBeLessThanOrEqual(251);
      });
    });

    it('should apply limit', async () => {
      const result = await repository.getPokemonList({ limit: 5 });

      expect(result).toHaveLength(5);
    });

    it('should apply offset', async () => {
      const result = await repository.getPokemonList({ offset: 2, limit: 3 });

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe(mockPokemonList[2].name);
    });

    it('should apply both generation filter and limit', async () => {
      const result = await repository.getPokemonList({
        generation: 1,
        limit: 3,
      });

      expect(result.length).toBeLessThanOrEqual(3);

      const ids = result.map(p => {
        const matches = p.url.match(/\/pokemon\/(\d+)\//);
        return matches ? parseInt(matches[1], 10) : 0;
      });

      ids.forEach(id => {
        expect(id).toBeGreaterThanOrEqual(1);
        expect(id).toBeLessThanOrEqual(151);
      });
    });

    it('should return empty array for generation with no Pokemon in list', async () => {
      const result = await repository.getPokemonList({ generation: 9 });

      expect(result).toEqual([]);
    });

    it('should handle limit larger than available Pokemon', async () => {
      const result = await repository.getPokemonList({ limit: 1000 });

      expect(result.length).toBe(mockPokemonList.length);
    });

    it('should handle offset beyond array length', async () => {
      const result = await repository.getPokemonList({ offset: 1000 });

      expect(result).toEqual([]);
    });
  });

  describe('formatAbilityName', () => {
    it('should format single-word ability names', () => {
      const formatted = (repository as any).formatAbilityName('overgrow');

      expect(formatted).toBe('Overgrow');
    });

    it('should format hyphenated ability names', () => {
      const formatted = (repository as any).formatAbilityName('lightning-rod');

      expect(formatted).toBe('Lightning Rod');
    });

    it('should format multi-hyphenated names', () => {
      const formatted = (repository as any).formatAbilityName('shield-dust');

      expect(formatted).toBe('Shield Dust');
    });

    it('should handle already capitalized names', () => {
      const formatted = (repository as any).formatAbilityName('Overgrow');

      expect(formatted).toBe('Overgrow');
    });

    it('should handle empty string', () => {
      const formatted = (repository as any).formatAbilityName('');

      expect(formatted).toBe('');
    });

    it('should format complex ability names', () => {
      const formatted = (repository as any).formatAbilityName('iron-fist');

      expect(formatted).toBe('Iron Fist');
    });
  });

  describe('extractIdFromUrl', () => {
    it('should extract ID from standard Pokemon URL', () => {
      const id = (repository as any).extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/');

      expect(id).toBe(25);
    });

    it('should extract ID from URL without protocol', () => {
      const id = (repository as any).extractIdFromUrl('/pokemon/1/');

      expect(id).toBe(1);
    });

    it('should extract large IDs', () => {
      const id = (repository as any).extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/1000/');

      expect(id).toBe(1000);
    });

    it('should return 0 for malformed URL', () => {
      const id = (repository as any).extractIdFromUrl('not-a-url');

      expect(id).toBe(0);
    });

    it('should return 0 for empty URL', () => {
      const id = (repository as any).extractIdFromUrl('');

      expect(id).toBe(0);
    });

    it('should handle URLs with different formats', () => {
      const id = (repository as any).extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/152/');

      expect(id).toBe(152);
    });
  });

  describe('integration - filtering logic', () => {
    it('should correctly filter generation 1 starters', async () => {
      const result = await repository.getPokemonList({
        generation: 1,
        limit: 10,
      });

      const names = result.map(p => p.name);
      expect(names).toContain('bulbasaur');
      expect(names).toContain('charmander');
      expect(names).toContain('squirtle');
    });

    it('should combine generation and offset correctly', async () => {
      const allGen1 = await repository.getPokemonList({ generation: 1 });
      const offsetGen1 = await repository.getPokemonList({
        generation: 1,
        offset: 2,
        limit: 3,
      });

      expect(offsetGen1).toHaveLength(3);
      expect(offsetGen1[0].name).toBe(allGen1[2].name);
    });

    it('should handle multiple filter calls independently', async () => {
      const result1 = await repository.getPokemonList({ generation: 1 });
      const result2 = await repository.getPokemonList({ generation: 2 });
      const result3 = await repository.getPokemonList();

      expect(result1.length).toBeGreaterThan(0);
      expect(result2.length).toBeGreaterThan(0);
      expect(result3.length).toBe(mockPokemonList.length);

      // Results should be independent
      expect(result1).not.toEqual(result2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty Pokemon list from service', async () => {
      vi.mocked(pokemonService.loadPokemonList).mockResolvedValue([]);

      const result = await repository.getPokemonList();

      expect(result).toEqual([]);
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(pokemonService.loadPokemonList).mockRejectedValue(new Error('API Error'));

      await expect(repository.getPokemonList()).rejects.toThrow('API Error');
    });

    it('should handle negative generation numbers', async () => {
      const result = await repository.getPokemonList({ generation: -1 });

      expect(result).toEqual([]);
    });

    it('should handle generation 0', async () => {
      const result = await repository.getPokemonList({ generation: 0 });

      expect(result).toEqual([]);
    });

    it('should handle very large generation numbers', async () => {
      const result = await repository.getPokemonList({ generation: 999 });

      expect(result).toEqual([]);
    });
  });
});
