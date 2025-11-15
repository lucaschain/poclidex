import type { Pokemon, PokemonSpecies, PokemonStat } from '../api/types.js';

/**
 * Transformed Pokemon data for display
 */
export interface PokemonDisplay {
  id: number;
  name: string;
  displayName: string; // Capitalized name for display
  types: string[];
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
  abilities: {
    name: string;
    isHidden: boolean;
  }[];
  height: number; // in decimeters
  weight: number; // in hectograms
  sprite: string | null;
  shinySprite: string | null;
  artworkSprite: string | null;
  isLegendary: boolean;
  isMythical: boolean;
  genus: string;
  flavorText: string;
  evolutionChainUrl: string;
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
 * Extract base stats from API format
 */
function extractStats(stats: PokemonStat[]) {
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
function extractEVYield(stats: PokemonStat[]) {
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
