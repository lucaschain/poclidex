import { describe, it, expect, beforeEach } from 'vitest';
import { pokemonService } from './pokemonService.js';
import { mockEvolutionChain } from '../../tests/fixtures/pokemon-data.js';

describe('PokemonService', () => {
  describe('Cache Management', () => {
    beforeEach(() => {
      pokemonService.clearCache();
    });

    it('should clear all caches', () => {
      pokemonService.clearCache();
      // Should not throw and should reset caches
      expect(pokemonService.getPokemonList()).toEqual([]);
    });

    it('should return empty Pokemon list initially', () => {
      const list = pokemonService.getPokemonList();
      expect(Array.isArray(list)).toBe(true);
    });
  });
});

describe('PokemonService - Evolution Chain Parsing', () => {
  describe('parseEvolutionChain', () => {
    it('should parse simple evolution chain (Pichu → Pikachu → Raichu)', () => {
      const result = pokemonService.parseEvolutionChain(mockEvolutionChain);

      // Returns 2D array: [['pichu'], ['pikachu'], ['raichu']]
      expect(result).toEqual([['pichu'], ['pikachu'], ['raichu']]);
    });

    it('should handle single-stage Pokemon (no evolutions)', () => {
      const singleStageChain = {
        id: 1,
        baby_trigger_item: null,
        chain: {
          is_baby: false,
          species: { name: 'lapras', url: '' },
          evolution_details: [],
          evolves_to: [],
        },
      };

      const result = pokemonService.parseEvolutionChain(singleStageChain);

      // Returns 2D array with one stage: [['lapras']]
      expect(result).toEqual([['lapras']]);
    });

    it('should handle branching evolutions (Eevee)', () => {
      const eeveeChain = {
        id: 67,
        baby_trigger_item: null,
        chain: {
          is_baby: false,
          species: { name: 'eevee', url: '' },
          evolution_details: [],
          evolves_to: [
            {
              is_baby: false,
              species: { name: 'vaporeon', url: '' },
              evolution_details: [],
              evolves_to: [],
            },
            {
              is_baby: false,
              species: { name: 'jolteon', url: '' },
              evolution_details: [],
              evolves_to: [],
            },
            {
              is_baby: false,
              species: { name: 'flareon', url: '' },
              evolution_details: [],
              evolves_to: [],
            },
          ],
        },
      };

      const result = pokemonService.parseEvolutionChain(eeveeChain);

      // Returns 2D array: [['eevee'], ['vaporeon', 'jolteon', 'flareon']]
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(['eevee']);
      expect(result[1]).toContain('vaporeon');
      expect(result[1]).toContain('jolteon');
      expect(result[1]).toContain('flareon');
    });
  });

  describe('parseEvolutionChainStructured', () => {
    it('should create structured tree for Pichu → Pikachu → Raichu', () => {
      const result = pokemonService.parseEvolutionChainStructured(mockEvolutionChain);

      expect(result.species).toBe('pichu');
      expect(result.branches).toHaveLength(1);
      expect(result.branches[0].species).toBe('pikachu');
      expect(result.branches[0].branches).toHaveLength(1);
      expect(result.branches[0].branches[0].species).toBe('raichu');
    });

    it('should include evolution methods in structured tree', () => {
      const result = pokemonService.parseEvolutionChainStructured(mockEvolutionChain);

      // Pichu → Pikachu (happiness)
      expect(result.branches[0].method).toBeTruthy();
      expect(result.branches[0].method).toContain('Happiness');

      // Pikachu → Raichu (Thunder Stone)
      expect(result.branches[0].branches[0].method).toBeTruthy();
      expect(result.branches[0].branches[0].method).toContain('Thunder Stone');
    });

    it('should handle single-stage Pokemon', () => {
      const singleStageChain = {
        id: 1,
        baby_trigger_item: null,
        chain: {
          is_baby: false,
          species: { name: 'lapras', url: '' },
          evolution_details: [],
          evolves_to: [],
        },
      };

      const result = pokemonService.parseEvolutionChainStructured(singleStageChain);

      expect(result.species).toBe('lapras');
      expect(result.branches).toHaveLength(0);
      // Method is empty string when no evolution details
      expect(result.method).toBe('');
    });

    it('should handle branching evolutions', () => {
      const eeveeChain = {
        id: 67,
        baby_trigger_item: null,
        chain: {
          is_baby: false,
          species: { name: 'eevee', url: '' },
          evolution_details: [],
          evolves_to: [
            {
              is_baby: false,
              species: { name: 'vaporeon', url: '' },
              evolution_details: [
                {
                  min_level: null,
                  trigger: { name: 'use-item', url: '' },
                  item: { name: 'water-stone', url: '' },
                } as any,
              ],
              evolves_to: [],
            },
            {
              is_baby: false,
              species: { name: 'jolteon', url: '' },
              evolution_details: [
                {
                  min_level: null,
                  trigger: { name: 'use-item', url: '' },
                  item: { name: 'thunder-stone', url: '' },
                } as any,
              ],
              evolves_to: [],
            },
          ],
        },
      };

      const result = pokemonService.parseEvolutionChainStructured(eeveeChain);

      expect(result.species).toBe('eevee');
      expect(result.branches).toHaveLength(2);
      expect(result.branches[0].species).toBe('vaporeon');
      expect(result.branches[1].species).toBe('jolteon');
      expect(result.branches[0].method).toContain('Water Stone');
      expect(result.branches[1].method).toContain('Thunder Stone');
    });
  });

  describe('getEvolutionTrigger - Basic functionality', () => {
    it('should return empty string for empty evolution details', () => {
      const link = {
        is_baby: false,
        species: { name: 'test', url: '' },
        evolution_details: [],
        evolves_to: [],
      };

      const result = pokemonService.getEvolutionTrigger(link);

      expect(result).toBe('');
    });

    it('should format level-based evolution', () => {
      const link = {
        is_baby: false,
        species: { name: 'ivysaur', url: '' },
        evolution_details: [
          {
            min_level: 16,
            trigger: { name: 'level-up', url: '' },
            relative_physical_stats: null,
          } as any,
        ],
        evolves_to: [],
      };

      const result = pokemonService.getEvolutionTrigger(link);

      // Format is "Lv.16" (no space), may include additional conditions
      expect(result).toContain('Lv.16');
    });

    it('should format item-based evolution (Thunder Stone)', () => {
      const link = {
        is_baby: false,
        species: { name: 'raichu', url: '' },
        evolution_details: [
          {
            min_level: null,
            trigger: { name: 'use-item', url: '' },
            item: { name: 'thunder-stone', url: '' },
          } as any,
        ],
        evolves_to: [],
      };

      const result = pokemonService.getEvolutionTrigger(link);

      expect(result).toContain('Thunder Stone');
    });

    it('should format trade evolution', () => {
      const link = {
        is_baby: false,
        species: { name: 'gengar', url: '' },
        evolution_details: [
          {
            min_level: null,
            trigger: { name: 'trade', url: '' },
          } as any,
        ],
        evolves_to: [],
      };

      const result = pokemonService.getEvolutionTrigger(link);

      expect(result).toContain('Trade');
    });

    it('should format happiness evolution', () => {
      const link = {
        is_baby: false,
        species: { name: 'pikachu', url: '' },
        evolution_details: [
          {
            min_level: null,
            min_happiness: 220,
            trigger: { name: 'level-up', url: '' },
          } as any,
        ],
        evolves_to: [],
      };

      const result = pokemonService.getEvolutionTrigger(link);

      expect(result).toContain('Happiness');
    });
  });
});
