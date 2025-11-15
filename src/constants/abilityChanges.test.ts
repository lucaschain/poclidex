import { describe, it, expect } from 'vitest';
import {
  POKEMON_ABILITY_CHANGES,
  getHistoricalAbilities,
  applyHistoricalAbilityChanges,
} from './abilityChanges.js';

describe('abilityChanges', () => {
  describe('POKEMON_ABILITY_CHANGES', () => {
    it('should contain Gengar ability change (Gen 6→7)', () => {
      const gengarChange = POKEMON_ABILITY_CHANGES.find(c => c.pokemonId === 94);
      expect(gengarChange).toBeDefined();
      expect(gengarChange?.pokemonName).toBe('gengar');
      expect(gengarChange?.oldAbility).toBe('levitate');
      expect(gengarChange?.newAbility).toBe('cursed-body');
      expect(gengarChange?.changeGeneration).toBe(7);
      expect(gengarChange?.abilitySlot).toBe('ability1');
    });

    it('should contain Scolipede line ability changes (Gen 5→6)', () => {
      const scolipedeChanges = POKEMON_ABILITY_CHANGES.filter(
        c => c.pokemonId >= 543 && c.pokemonId <= 545
      );

      expect(scolipedeChanges).toHaveLength(3);
      scolipedeChanges.forEach(change => {
        expect(change.oldAbility).toBe('quick-feet');
        expect(change.newAbility).toBe('speed-boost');
        expect(change.changeGeneration).toBe(6);
        expect(change.abilitySlot).toBe('hidden');
      });
    });

    it('should contain Empoleon line ability changes (Gen 8→9)', () => {
      const empoleonChanges = POKEMON_ABILITY_CHANGES.filter(
        c => c.pokemonId >= 393 && c.pokemonId <= 395
      );

      expect(empoleonChanges).toHaveLength(3);
      empoleonChanges.forEach(change => {
        expect(change.oldAbility).toBe('defiant');
        expect(change.newAbility).toBe('competitive');
        expect(change.changeGeneration).toBe(9);
        expect(change.abilitySlot).toBe('hidden');
      });
    });

    it('should contain legendary beasts changes (Gen 6→7)', () => {
      const beastChanges = POKEMON_ABILITY_CHANGES.filter(
        c => c.pokemonId >= 243 && c.pokemonId <= 245
      );

      expect(beastChanges).toHaveLength(3);
      beastChanges.forEach(change => {
        expect(change.newAbility).toBe('inner-focus');
        expect(change.changeGeneration).toBe(7);
        expect(change.abilitySlot).toBe('hidden');
      });
    });

    it('should have unique old abilities for each legendary beast', () => {
      const raikou = POKEMON_ABILITY_CHANGES.find(c => c.pokemonId === 243);
      const entei = POKEMON_ABILITY_CHANGES.find(c => c.pokemonId === 244);
      const suicune = POKEMON_ABILITY_CHANGES.find(c => c.pokemonId === 245);

      expect(raikou?.oldAbility).toBe('volt-absorb');
      expect(entei?.oldAbility).toBe('flash-fire');
      expect(suicune?.oldAbility).toBe('water-absorb');
    });

    it('should have at least 16 ability changes documented', () => {
      // We documented 16 Pokemon with historical ability changes
      expect(POKEMON_ABILITY_CHANGES.length).toBeGreaterThanOrEqual(16);
    });

    it('should only have valid ability slots', () => {
      const validSlots = ['ability1', 'ability2', 'hidden'];
      POKEMON_ABILITY_CHANGES.forEach(change => {
        expect(validSlots).toContain(change.abilitySlot);
      });
    });

    it('should only have valid change generations (1-9)', () => {
      POKEMON_ABILITY_CHANGES.forEach(change => {
        expect(change.changeGeneration).toBeGreaterThanOrEqual(1);
        expect(change.changeGeneration).toBeLessThanOrEqual(9);
      });
    });

    it('should have lowercase hyphenated ability names', () => {
      POKEMON_ABILITY_CHANGES.forEach(change => {
        expect(change.oldAbility).toBe(change.oldAbility.toLowerCase());
        expect(change.newAbility).toBe(change.newAbility.toLowerCase());
        expect(change.oldAbility).toMatch(/^[a-z-]+$/);
        expect(change.newAbility).toMatch(/^[a-z-]+$/);
      });
    });
  });

  describe('getHistoricalAbilities()', () => {
    it('should return Gengar Levitate change when viewing Gen 6', () => {
      const changes = getHistoricalAbilities(94, 'gengar', 6);
      expect(changes).toHaveLength(1);
      expect(changes[0].oldAbility).toBe('levitate');
      expect(changes[0].newAbility).toBe('cursed-body');
    });

    it('should return empty array for Gengar in Gen 7+', () => {
      expect(getHistoricalAbilities(94, 'gengar', 7)).toHaveLength(0);
      expect(getHistoricalAbilities(94, 'gengar', 8)).toHaveLength(0);
      expect(getHistoricalAbilities(94, 'gengar', 9)).toHaveLength(0);
    });

    it('should return change when viewing generation before change', () => {
      const gen5 = getHistoricalAbilities(94, 'gengar', 5);
      const gen4 = getHistoricalAbilities(94, 'gengar', 4);
      const gen3 = getHistoricalAbilities(94, 'gengar', 3);

      expect(gen5).toHaveLength(1);
      expect(gen4).toHaveLength(1);
      expect(gen3).toHaveLength(1);
    });

    it('should return empty for Pokemon without ability changes', () => {
      // Pikachu never had ability changes
      const changes = getHistoricalAbilities(25, 'pikachu', 5);
      expect(changes).toHaveLength(0);
    });

    it('should match by Pokemon ID', () => {
      const byId = getHistoricalAbilities(94, 'wrong-name', 6);
      expect(byId).toHaveLength(1);
    });

    it('should match by Pokemon name', () => {
      const byName = getHistoricalAbilities(999, 'gengar', 6);
      expect(byName).toHaveLength(1);
    });

    it('should return empty when neither ID nor name matches', () => {
      const changes = getHistoricalAbilities(999, 'wrong-name', 6);
      expect(changes).toHaveLength(0);
    });

    it('should handle Scolipede (ID 545) ability change', () => {
      const gen5 = getHistoricalAbilities(545, 'scolipede', 5);
      const gen6 = getHistoricalAbilities(545, 'scolipede', 6);

      expect(gen5).toHaveLength(1);
      expect(gen5[0].oldAbility).toBe('quick-feet');
      expect(gen6).toHaveLength(0);
    });
  });

  describe('applyHistoricalAbilityChanges()', () => {
    it('should replace Gengar Cursed Body with Levitate in Gen 6', () => {
      const currentAbilities = [
        { name: 'cursed-body', isHidden: false, slot: 1 },
      ];

      const result = applyHistoricalAbilityChanges(94, 'gengar', currentAbilities, 6);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('levitate');
      expect(result[0].isHidden).toBe(false);
    });

    it('should not change abilities in Gen 7+ for Gengar', () => {
      const currentAbilities = [
        { name: 'cursed-body', isHidden: false, slot: 1 },
      ];

      const gen7 = applyHistoricalAbilityChanges(94, 'gengar', currentAbilities, 7);
      const gen9 = applyHistoricalAbilityChanges(94, 'gengar', currentAbilities, 9);

      expect(gen7[0].name).toBe('cursed-body');
      expect(gen9[0].name).toBe('cursed-body');
    });

    it('should preserve isHidden flag when replacing abilities', () => {
      const currentAbilities = [
        { name: 'competitive', isHidden: true, slot: 3 },
      ];

      const result = applyHistoricalAbilityChanges(395, 'empoleon', currentAbilities, 8);

      expect(result[0].name).toBe('defiant');
      expect(result[0].isHidden).toBe(true);
    });

    it('should handle multiple abilities correctly', () => {
      const currentAbilities = [
        { name: 'torrent', isHidden: false, slot: 1 },
        { name: 'competitive', isHidden: true, slot: 3 },
      ];

      const result = applyHistoricalAbilityChanges(395, 'empoleon', currentAbilities, 8);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('torrent'); // Not changed
      expect(result[1].name).toBe('defiant'); // Changed
    });

    it('should not change abilities for Pokemon without historical changes', () => {
      const currentAbilities = [
        { name: 'static', isHidden: false, slot: 1 },
        { name: 'lightning-rod', isHidden: true, slot: 3 },
      ];

      const result = applyHistoricalAbilityChanges(25, 'pikachu', currentAbilities, 5);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('static');
      expect(result[1].name).toBe('lightning-rod');
    });

    it('should handle empty ability list', () => {
      const result = applyHistoricalAbilityChanges(94, 'gengar', [], 6);
      expect(result).toHaveLength(0);
    });

    it('should replace Scolipede Speed Boost with Quick Feet in Gen 5', () => {
      const currentAbilities = [
        { name: 'poison-point', isHidden: false, slot: 1 },
        { name: 'swarm', isHidden: false, slot: 2 },
        { name: 'speed-boost', isHidden: true, slot: 3 },
      ];

      const result = applyHistoricalAbilityChanges(545, 'scolipede', currentAbilities, 5);

      expect(result[2].name).toBe('quick-feet');
      expect(result[2].isHidden).toBe(true);
      expect(result[0].name).toBe('poison-point'); // Unchanged
      expect(result[1].name).toBe('swarm'); // Unchanged
    });

    it('should return abilities without slot field', () => {
      const currentAbilities = [
        { name: 'cursed-body', isHidden: false, slot: 1 },
      ];

      const result = applyHistoricalAbilityChanges(94, 'gengar', currentAbilities, 6);

      expect(result[0]).toEqual({ name: 'levitate', isHidden: false });
      expect(result[0]).not.toHaveProperty('slot');
    });
  });
});
