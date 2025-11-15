import { describe, it, expect } from 'vitest';
import { transformPokemon } from './pokemon.js';
import type { Pokemon, PokemonSpecies } from '../api/types.js';

describe('Pokemon Generation Filtering', () => {
  describe('Type Filtering (past_types)', () => {
    it('should show Fairy type for Clefairy in Gen 6+', () => {
      const clefairy: Pokemon = {
        id: 35,
        name: 'clefairy',
        base_experience: 113,
        height: 6,
        weight: 75,
        abilities: [
          { ability: { name: 'cute-charm', url: '' }, is_hidden: false, slot: 1 },
        ],
        types: [
          { slot: 1, type: { name: 'fairy', url: '' } },
        ],
        past_types: [
          {
            generation: { name: 'generation-vi', url: '/generation/6/' },
            types: [
              { slot: 1, type: { name: 'normal', url: '' } },
            ],
          },
        ],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'clefairy', url: '' },
        moves: [],
      };

      const gen6Result = transformPokemon(clefairy, undefined, 6);
      const gen7Result = transformPokemon(clefairy, undefined, 7);

      expect(gen6Result.types).toEqual(['fairy']);
      expect(gen7Result.types).toEqual(['fairy']);
    });

    it('should show Normal type for Clefairy in Gen 5 and earlier', () => {
      const clefairy: Pokemon = {
        id: 35,
        name: 'clefairy',
        base_experience: 113,
        height: 6,
        weight: 75,
        abilities: [
          { ability: { name: 'cute-charm', url: '' }, is_hidden: false, slot: 1 },
        ],
        types: [
          { slot: 1, type: { name: 'fairy', url: '' } },
        ],
        past_types: [
          {
            generation: { name: 'generation-vi', url: '/generation/6/' },
            types: [
              { slot: 1, type: { name: 'normal', url: '' } },
            ],
          },
        ],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'clefairy', url: '' },
        moves: [],
      };

      const gen5Result = transformPokemon(clefairy, undefined, 5);
      const gen1Result = transformPokemon(clefairy, undefined, 1);

      expect(gen5Result.types).toEqual(['normal']);
      expect(gen1Result.types).toEqual(['normal']);
    });

    it('should handle Pokemon without past_types', () => {
      const pikachu: Pokemon = {
        id: 25,
        name: 'pikachu',
        base_experience: 112,
        height: 4,
        weight: 60,
        abilities: [
          { ability: { name: 'static', url: '' }, is_hidden: false, slot: 1 },
        ],
        types: [
          { slot: 1, type: { name: 'electric', url: '' } },
        ],
        // No past_types - Electric since Gen 1
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'pikachu', url: '' },
        moves: [],
      };

      const gen1Result = transformPokemon(pikachu, undefined, 1);
      const gen9Result = transformPokemon(pikachu, undefined, 9);

      expect(gen1Result.types).toEqual(['electric']);
      expect(gen9Result.types).toEqual(['electric']);
    });

    it('should show current types when not filtering by generation', () => {
      const clefairy: Pokemon = {
        id: 35,
        name: 'clefairy',
        base_experience: 113,
        height: 6,
        weight: 75,
        abilities: [],
        types: [
          { slot: 1, type: { name: 'fairy', url: '' } },
        ],
        past_types: [
          {
            generation: { name: 'generation-vi', url: '/generation/6/' },
            types: [
              { slot: 1, type: { name: 'normal', url: '' } },
            ],
          },
        ],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'clefairy', url: '' },
        moves: [],
      };

      const result = transformPokemon(clefairy); // No generation filter

      expect(result.types).toEqual(['fairy']);
    });

    it('should handle dual-type Pokemon (Marill water/fairy)', () => {
      const marill: Pokemon = {
        id: 183,
        name: 'marill',
        base_experience: 88,
        height: 4,
        weight: 85,
        abilities: [],
        types: [
          { slot: 1, type: { name: 'water', url: '' } },
          { slot: 2, type: { name: 'fairy', url: '' } },
        ],
        past_types: [
          {
            generation: { name: 'generation-vi', url: '/generation/6/' },
            types: [
              { slot: 1, type: { name: 'water', url: '' } },
            ],
          },
        ],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'marill', url: '' },
        moves: [],
      };

      const gen5Result = transformPokemon(marill, undefined, 5);
      const gen6Result = transformPokemon(marill, undefined, 6);

      expect(gen5Result.types).toEqual(['water']);
      expect(gen6Result.types).toEqual(['water', 'fairy']);
    });
  });

  describe('Ability Filtering', () => {
    it('should hide hidden abilities before Gen 5', () => {
      const pikachu: Pokemon = {
        id: 25,
        name: 'pikachu',
        base_experience: 112,
        height: 4,
        weight: 60,
        abilities: [
          { ability: { name: 'static', url: '' }, is_hidden: false, slot: 1 },
          { ability: { name: 'lightning-rod', url: '' }, is_hidden: true, slot: 3 },
        ],
        types: [
          { slot: 1, type: { name: 'electric', url: '' } },
        ],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'pikachu', url: '' },
        moves: [],
      };

      const gen4Result = transformPokemon(pikachu, undefined, 4);
      const gen5Result = transformPokemon(pikachu, undefined, 5);

      expect(gen4Result.abilities).toHaveLength(1);
      expect(gen4Result.abilities[0].name).toBe('static');

      expect(gen5Result.abilities).toHaveLength(2);
      expect(gen5Result.abilities.map(a => a.name)).toContain('lightning-rod');
    });

    it('should replace Gengar Cursed Body with Levitate in Gen 3-6', () => {
      const gengar: Pokemon = {
        id: 94,
        name: 'gengar',
        base_experience: 225,
        height: 15,
        weight: 405,
        abilities: [
          { ability: { name: 'cursed-body', url: '' }, is_hidden: false, slot: 1 },
        ],
        types: [
          { slot: 1, type: { name: 'ghost', url: '' } },
          { slot: 2, type: { name: 'poison', url: '' } },
        ],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'gengar', url: '' },
        moves: [],
      };

      const gen6Result = transformPokemon(gengar, undefined, 6);
      const gen7Result = transformPokemon(gengar, undefined, 7);

      expect(gen6Result.abilities[0].name).toBe('levitate');
      expect(gen7Result.abilities[0].name).toBe('cursed-body');
    });

    it('should replace Empoleon Competitive with Defiant in Gen 5-8', () => {
      const empoleon: Pokemon = {
        id: 395,
        name: 'empoleon',
        base_experience: 239,
        height: 17,
        weight: 845,
        abilities: [
          { ability: { name: 'torrent', url: '' }, is_hidden: false, slot: 1 },
          { ability: { name: 'competitive', url: '' }, is_hidden: true, slot: 3 },
        ],
        types: [
          { slot: 1, type: { name: 'water', url: '' } },
          { slot: 2, type: { name: 'steel', url: '' } },
        ],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'empoleon', url: '' },
        moves: [],
      };

      const gen8Result = transformPokemon(empoleon, undefined, 8);
      const gen9Result = transformPokemon(empoleon, undefined, 9);

      expect(gen8Result.abilities[1].name).toBe('defiant');
      expect(gen8Result.abilities[1].isHidden).toBe(true);

      expect(gen9Result.abilities[1].name).toBe('competitive');
      expect(gen9Result.abilities[1].isHidden).toBe(true);
    });

    it('should handle Pokemon with no ability changes', () => {
      const pikachu: Pokemon = {
        id: 25,
        name: 'pikachu',
        base_experience: 112,
        height: 4,
        weight: 60,
        abilities: [
          { ability: { name: 'static', url: '' }, is_hidden: false, slot: 1 },
        ],
        types: [
          { slot: 1, type: { name: 'electric', url: '' } },
        ],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'pikachu', url: '' },
        moves: [],
      };

      const gen1Result = transformPokemon(pikachu, undefined, 1);
      const gen9Result = transformPokemon(pikachu, undefined, 9);

      expect(gen1Result.abilities[0].name).toBe('static');
      expect(gen9Result.abilities[0].name).toBe('static');
    });

    it('should not modify abilities when not filtering by generation', () => {
      const gengar: Pokemon = {
        id: 94,
        name: 'gengar',
        base_experience: 225,
        height: 15,
        weight: 405,
        abilities: [
          { ability: { name: 'cursed-body', url: '' }, is_hidden: false, slot: 1 },
        ],
        types: [],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'gengar', url: '' },
        moves: [],
      };

      const result = transformPokemon(gengar); // No generation filter

      expect(result.abilities[0].name).toBe('cursed-body');
    });
  });

  describe('Combined Filtering', () => {
    it('should filter both types and abilities for Clefairy in Gen 3', () => {
      const clefairy: Pokemon = {
        id: 35,
        name: 'clefairy',
        base_experience: 113,
        height: 6,
        weight: 75,
        abilities: [
          { ability: { name: 'cute-charm', url: '' }, is_hidden: false, slot: 1 },
          { ability: { name: 'magic-guard', url: '' }, is_hidden: true, slot: 3 },
        ],
        types: [
          { slot: 1, type: { name: 'fairy', url: '' } },
        ],
        past_types: [
          {
            generation: { name: 'generation-vi', url: '/generation/6/' },
            types: [
              { slot: 1, type: { name: 'normal', url: '' } },
            ],
          },
        ],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'clefairy', url: '' },
        moves: [],
      };

      const result = transformPokemon(clefairy, undefined, 3);

      // Hidden abilities didn't exist in Gen 3
      expect(result.abilities).toHaveLength(1);
      expect(result.abilities[0].name).toBe('cute-charm');

      // Fairy type didn't exist in Gen 3
      expect(result.types).toEqual(['normal']);
    });

    it('should show current data in Gen 9', () => {
      const clefairy: Pokemon = {
        id: 35,
        name: 'clefairy',
        base_experience: 113,
        height: 6,
        weight: 75,
        abilities: [
          { ability: { name: 'cute-charm', url: '' }, is_hidden: false, slot: 1 },
          { ability: { name: 'magic-guard', url: '' }, is_hidden: true, slot: 3 },
        ],
        types: [
          { slot: 1, type: { name: 'fairy', url: '' } },
        ],
        past_types: [
          {
            generation: { name: 'generation-vi', url: '/generation/6/' },
            types: [
              { slot: 1, type: { name: 'normal', url: '' } },
            ],
          },
        ],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'clefairy', url: '' },
        moves: [],
      };

      const result = transformPokemon(clefairy, undefined, 9);

      expect(result.abilities).toHaveLength(2);
      expect(result.types).toEqual(['fairy']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle Pokemon with empty abilities array', () => {
      const pokemon: Pokemon = {
        id: 1,
        name: 'test',
        base_experience: 0,
        height: 1,
        weight: 1,
        abilities: [],
        types: [{ slot: 1, type: { name: 'normal', url: '' } }],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'test', url: '' },
        moves: [],
      };

      const result = transformPokemon(pokemon, undefined, 5);

      expect(result.abilities).toHaveLength(0);
    });

    it('should handle Pokemon with empty types array', () => {
      const pokemon: Pokemon = {
        id: 1,
        name: 'test',
        base_experience: 0,
        height: 1,
        weight: 1,
        abilities: [],
        types: [],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'test', url: '' },
        moves: [],
      };

      const result = transformPokemon(pokemon, undefined, 5);

      expect(result.types).toHaveLength(0);
    });

    it('should handle generation 9 (latest)', () => {
      const pokemon: Pokemon = {
        id: 1,
        name: 'test',
        base_experience: 0,
        height: 1,
        weight: 1,
        abilities: [
          { ability: { name: 'test', url: '' }, is_hidden: false, slot: 1 },
        ],
        types: [{ slot: 1, type: { name: 'normal', url: '' } }],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'test', url: '' },
        moves: [],
      };

      const result = transformPokemon(pokemon, undefined, 9);

      expect(result.abilities).toHaveLength(1);
      expect(result.types).toHaveLength(1);
    });

    it('should handle generation 1 (earliest)', () => {
      const pokemon: Pokemon = {
        id: 1,
        name: 'test',
        base_experience: 0,
        height: 1,
        weight: 1,
        abilities: [
          { ability: { name: 'test', url: '' }, is_hidden: true, slot: 1 },
        ],
        types: [{ slot: 1, type: { name: 'normal', url: '' } }],
        stats: [],
        sprites: { front_default: null, front_shiny: null },
        species: { name: 'test', url: '' },
        moves: [],
      };

      const result = transformPokemon(pokemon, undefined, 1);

      // All abilities in Gen 1 are hidden, so should be filtered out
      // (Actually Gen 1 had no abilities, but for this test...)
      expect(result.abilities).toHaveLength(0);
    });
  });
});
