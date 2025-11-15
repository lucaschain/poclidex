import type { Pokemon, PokemonSpecies, PokemonStat } from '../api/types.js';

/**
 * Transformed Pokemon data for display
 */
export interface PokemonDisplay {
  // Core identification
  id: number;
  name: string;
  displayName: string; // Capitalized name for display
  generation: number; // Generation number (1-9)

  // Type information
  types: string[];

  // Stats (always loaded)
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  evYield: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };

  // Abilities (basic info always loaded, details optional)
  abilities: {
    name: string;
    isHidden: boolean;
  }[];

  // Physical characteristics
  height: number; // in decimeters
  weight: number; // in hectograms

  // Sprites
  sprite: string | null;
  shinySprite: string | null;
  artworkSprite: string | null;

  // Special status
  isLegendary: boolean;
  isMythical: boolean;

  // Pokedex info
  genus: string;
  flavorText: string;
  evolutionChainUrl: string;

  // Optional sections (lazy-loaded in future phases)
  moves?: any[]; // Will be typed properly in Phase 3
  abilityDetails?: any[]; // Will be typed properly in Phase 4
  typeEffectiveness?: any; // Will be typed properly in Phase 5+
}

/**
 * Transform API Pokemon data into display format
 */
export function transformPokemon(
  pokemon: Pokemon,
  species?: PokemonSpecies
): PokemonDisplay {
  const stats = extractStats(pokemon.stats);

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: capitalizeName(pokemon.name),
    generation: getGeneration(pokemon.id),
    types: pokemon.types.map(t => t.type.name),
    stats,
    evYield: extractEVYield(pokemon.stats),
    abilities: pokemon.abilities.map(a => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
    })),
    height: pokemon.height,
    weight: pokemon.weight,
    sprite: pokemon.sprites.front_default,
    shinySprite: pokemon.sprites.front_shiny,
    artworkSprite: pokemon.sprites.other?.['official-artwork']?.front_default || null,
    isLegendary: species?.is_legendary || false,
    isMythical: species?.is_mythical || false,
    genus: extractGenus(species),
    flavorText: extractFlavorText(species),
    evolutionChainUrl: species?.evolution_chain?.url || '',
  };
}

/**
 * Get generation number based on Pokemon ID
 */
export function getGeneration(pokemonId: number): number {
  if (pokemonId < 1 || pokemonId > 1025) return 1;  // Invalid IDs default to Gen 1
  if (pokemonId <= 151) return 1;   // Kanto
  if (pokemonId <= 251) return 2;   // Johto
  if (pokemonId <= 386) return 3;   // Hoenn
  if (pokemonId <= 493) return 4;   // Sinnoh
  if (pokemonId <= 649) return 5;   // Unova
  if (pokemonId <= 721) return 6;   // Kalos
  if (pokemonId <= 809) return 7;   // Alola
  if (pokemonId <= 905) return 8;   // Galar
  return 9;                         // Paldea (906-1025)
}

/**
 * Extract base stats from API format
 */
export function extractStats(stats: PokemonStat[]) {
  const statMap: Record<string, number> = {};
  stats.forEach(s => {
    statMap[s.stat.name] = s.base_stat;
  });

  return {
    hp: statMap['hp'] || 0,
    attack: statMap['attack'] || 0,
    defense: statMap['defense'] || 0,
    specialAttack: statMap['special-attack'] || 0,
    specialDefense: statMap['special-defense'] || 0,
    speed: statMap['speed'] || 0,
  };
}

/**
 * Extract EV yield from API format
 */
export function extractEVYield(stats: PokemonStat[]) {
  const evMap: Record<string, number> = {};
  stats.forEach(s => {
    evMap[s.stat.name] = s.effort;
  });

  return {
    hp: evMap['hp'] || 0,
    attack: evMap['attack'] || 0,
    defense: evMap['defense'] || 0,
    specialAttack: evMap['special-attack'] || 0,
    specialDefense: evMap['special-defense'] || 0,
    speed: evMap['speed'] || 0,
  };
}

/**
 * Extract genus (e.g., "Seed Pokemon") from species data
 */
function extractGenus(species?: PokemonSpecies): string {
  if (!species || !species.genera) {
    return '';
  }

  const englishGenus = (species.genera as any[]).find(
    g => g.language.name === 'en'
  );
  return englishGenus?.genus || '';
}

/**
 * Extract English flavor text from species data
 */
function extractFlavorText(species?: PokemonSpecies): string {
  if (!species || !species.flavor_text_entries || species.flavor_text_entries.length === 0) {
    return 'No description available.';
  }

  // Find English flavor text, preferably from recent games
  const englishEntries = species.flavor_text_entries.filter(
    entry => entry.language.name === 'en'
  );

  if (englishEntries.length === 0) {
    return 'No description available.';
  }

  // Get the most recent entry
  const text = englishEntries[englishEntries.length - 1].flavor_text;

  // Clean up the text (remove form feeds, newlines, etc.)
  return text.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Capitalize Pokemon name for display
 */
export function capitalizeName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format height in meters
 */
export function formatHeight(decimeters: number): string {
  const meters = decimeters / 10;
  return `${meters.toFixed(1)}m`;
}

/**
 * Format weight in kilograms
 */
export function formatWeight(hectograms: number): string {
  const kg = hectograms / 10;
  return `${kg.toFixed(1)}kg`;
}
