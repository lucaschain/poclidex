/**
 * Historical ability changes across Pokemon generations.
 *
 * PokeAPI only returns current abilities, not historical ones.
 * This constant tracks Pokemon that had their abilities replaced
 * in different generations.
 *
 * Notable examples:
 * - Gengar lost Levitate in Gen 7 (major nerf)
 * - Scolipede line gained Speed Boost in Gen 6 (major buff)
 * - Empoleon line changed to Competitive in Gen 9 (better fit)
 */

export interface AbilityChange {
  pokemonId: number;
  pokemonName: string;
  form?: string;
  oldAbility: string;
  newAbility: string;
  abilitySlot: 'ability1' | 'ability2' | 'hidden';
  changeGeneration: number;
  notes?: string;
}

/**
 * Complete list of Pokemon with historical ability replacements.
 * Ordered chronologically by change generation.
 */
export const POKEMON_ABILITY_CHANGES: AbilityChange[] = [
  // Generation V (Within-generation - Black 2/White 2)
  {
    pokemonId: 550,
    pokemonName: 'basculin',
    form: 'blue-striped',
    oldAbility: 'reckless',
    newAbility: 'rock-head',
    abilitySlot: 'ability1',
    changeGeneration: 5,
    notes: 'Changed within Generation V (Black 2/White 2)',
  },

  // Generation V → VI Changes (Hidden Abilities)
  {
    pokemonId: 145,
    pokemonName: 'zapdos',
    oldAbility: 'lightningrod',
    newAbility: 'static',
    abilitySlot: 'hidden',
    changeGeneration: 6,
    notes: 'Hidden ability was unobtainable in Gen 5',
  },
  {
    pokemonId: 543,
    pokemonName: 'venipede',
    oldAbility: 'quick-feet',
    newAbility: 'speed-boost',
    abilitySlot: 'hidden',
    changeGeneration: 6,
  },
  {
    pokemonId: 544,
    pokemonName: 'whirlipede',
    oldAbility: 'quick-feet',
    newAbility: 'speed-boost',
    abilitySlot: 'hidden',
    changeGeneration: 6,
  },
  {
    pokemonId: 545,
    pokemonName: 'scolipede',
    oldAbility: 'quick-feet',
    newAbility: 'speed-boost',
    abilitySlot: 'hidden',
    changeGeneration: 6,
    notes: 'Major competitive buff - Speed Boost is much stronger',
  },
  {
    pokemonId: 607,
    pokemonName: 'litwick',
    oldAbility: 'shadow-tag',
    newAbility: 'infiltrator',
    abilitySlot: 'hidden',
    changeGeneration: 6,
    notes: 'Hidden ability was unobtainable in Gen 5',
  },
  {
    pokemonId: 608,
    pokemonName: 'lampent',
    oldAbility: 'shadow-tag',
    newAbility: 'infiltrator',
    abilitySlot: 'hidden',
    changeGeneration: 6,
    notes: 'Hidden ability was unobtainable in Gen 5',
  },
  {
    pokemonId: 609,
    pokemonName: 'chandelure',
    oldAbility: 'shadow-tag',
    newAbility: 'infiltrator',
    abilitySlot: 'hidden',
    changeGeneration: 6,
    notes: 'Shadow Tag would have been extremely powerful; was unobtainable',
  },

  // Generation VI → VII Changes
  {
    pokemonId: 94,
    pokemonName: 'gengar',
    oldAbility: 'levitate',
    newAbility: 'cursed-body',
    abilitySlot: 'ability1',
    changeGeneration: 7,
    notes: 'Major nerf - lost Ground immunity, now vulnerable to Earthquake/Spikes',
  },
  {
    pokemonId: 243,
    pokemonName: 'raikou',
    oldAbility: 'volt-absorb',
    newAbility: 'inner-focus',
    abilitySlot: 'hidden',
    changeGeneration: 7,
    notes: 'Hidden ability was unobtainable in Gen 5-6',
  },
  {
    pokemonId: 244,
    pokemonName: 'entei',
    oldAbility: 'flash-fire',
    newAbility: 'inner-focus',
    abilitySlot: 'hidden',
    changeGeneration: 7,
    notes: 'Hidden ability was unobtainable in Gen 5-6',
  },
  {
    pokemonId: 245,
    pokemonName: 'suicune',
    oldAbility: 'water-absorb',
    newAbility: 'inner-focus',
    abilitySlot: 'hidden',
    changeGeneration: 7,
    notes: 'Hidden ability was unobtainable in Gen 5-6',
  },

  // Generation VIII → IX Changes
  {
    pokemonId: 275,
    pokemonName: 'shiftry',
    oldAbility: 'early-bird',
    newAbility: 'wind-rider',
    abilitySlot: 'hidden',
    changeGeneration: 9,
    notes: 'Major buff - Wind Rider provides immunity and Attack boost',
  },
  {
    pokemonId: 393,
    pokemonName: 'piplup',
    oldAbility: 'defiant',
    newAbility: 'competitive',
    abilitySlot: 'hidden',
    changeGeneration: 9,
    notes: 'Changed to match special attacker role',
  },
  {
    pokemonId: 394,
    pokemonName: 'prinplup',
    oldAbility: 'defiant',
    newAbility: 'competitive',
    abilitySlot: 'hidden',
    changeGeneration: 9,
    notes: 'Changed to match special attacker role',
  },
  {
    pokemonId: 395,
    pokemonName: 'empoleon',
    oldAbility: 'defiant',
    newAbility: 'competitive',
    abilitySlot: 'hidden',
    changeGeneration: 9,
    notes: 'Major improvement - raises Sp.Atk instead of Attack',
  },
];

/**
 * Get historical abilities for a Pokemon at a specific generation.
 *
 * @param pokemonId - National Dex number
 * @param pokemonName - Pokemon name (lowercase, hyphenated)
 * @param generation - Generation to check
 * @returns Array of ability changes that apply (old abilities to show)
 */
export function getHistoricalAbilities(
  pokemonId: number,
  pokemonName: string,
  generation: number
): AbilityChange[] {
  return POKEMON_ABILITY_CHANGES.filter(change => {
    // Check if this is the right Pokemon
    const matchesId = change.pokemonId === pokemonId;
    const matchesName = change.pokemonName === pokemonName;

    if (!matchesId && !matchesName) {
      return false;
    }

    // If viewing a generation BEFORE the change, show the old ability
    return generation < change.changeGeneration;
  });
}

/**
 * Apply historical ability changes to a Pokemon's ability list.
 *
 * @param pokemonId - National Dex number
 * @param pokemonName - Pokemon name
 * @param currentAbilities - Current abilities from API
 * @param generation - Generation to filter by
 * @returns Modified ability list with historical abilities
 */
export function applyHistoricalAbilityChanges(
  pokemonId: number,
  pokemonName: string,
  currentAbilities: Array<{ name: string; isHidden: boolean; slot: number }>,
  generation: number
): Array<{ name: string; isHidden: boolean }> {
  const historicalChanges = getHistoricalAbilities(pokemonId, pokemonName, generation);

  if (historicalChanges.length === 0) {
    // No changes for this Pokemon
    return currentAbilities.map(a => ({ name: a.name, isHidden: a.isHidden }));
  }

  // Create a map of abilities to replace
  const replacements = new Map<string, string>();
  for (const change of historicalChanges) {
    // Map new ability → old ability
    replacements.set(change.newAbility, change.oldAbility);
  }

  // Apply replacements
  return currentAbilities.map(ability => {
    const oldAbility = replacements.get(ability.name);
    if (oldAbility) {
      // Replace with historical ability
      return {
        name: oldAbility,
        isHidden: ability.isHidden,
      };
    }
    // Keep current ability
    return {
      name: ability.name,
      isHidden: ability.isHidden,
    };
  });
}
