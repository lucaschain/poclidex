import { pokemonService } from '../services/pokemonService.js';
import { pokeAPI } from '../api/pokeapi.js';
import type { PokemonListItem, EvolutionChain } from '../api/types.js';
import type { PokemonDisplay } from '../models/pokemon.js';
import type {
  IPokemonRepository,
  FilterOptions,
  MoveData,
  AbilityDetail,
} from './IPokemonRepository.js';
import { LRUCache } from '../utils/cache.js';

/**
 * Generation ranges (based on National Dex numbers)
 */
const GENERATION_RANGES = [
  { gen: 1, start: 1, end: 151, name: 'Kanto', region: 'Kanto' },
  { gen: 2, start: 152, end: 251, name: 'Johto', region: 'Johto' },
  { gen: 3, start: 252, end: 386, name: 'Hoenn', region: 'Hoenn' },
  { gen: 4, start: 387, end: 493, name: 'Sinnoh', region: 'Sinnoh' },
  { gen: 5, start: 494, end: 649, name: 'Unova', region: 'Unova' },
  { gen: 6, start: 650, end: 721, name: 'Kalos', region: 'Kalos' },
  { gen: 7, start: 722, end: 809, name: 'Alola', region: 'Alola' },
  { gen: 8, start: 810, end: 905, name: 'Galar', region: 'Galar' },
  { gen: 9, start: 906, end: 1025, name: 'Paldea', region: 'Paldea' },
];

/**
 * Concrete implementation of IPokemonRepository
 *
 * Wraps existing services to provide a clean repository interface.
 * This allows us to decouple UI components from service implementation details.
 */
export class PokemonRepository implements IPokemonRepository {
  private abilityCache: LRUCache<string, AbilityDetail>;
  private moveCache: LRUCache<string, import('../api/types.js').Move>;

  constructor() {
    this.abilityCache = new LRUCache(100); // Cache up to 100 abilities
    this.moveCache = new LRUCache(200); // Cache up to 200 moves
  }

  /**
   * Get a list of Pokemon with optional filtering
   */
  async getPokemonList(options?: FilterOptions): Promise<PokemonListItem[]> {
    // Load all Pokemon from existing service
    const allPokemon = await pokemonService.loadPokemonList();

    // Apply filters if provided
    if (!options) {
      return allPokemon;
    }

    let filtered = allPokemon;

    // Filter by generation
    if (options.generation !== undefined) {
      const genRange = GENERATION_RANGES.find(g => g.gen === options.generation);
      if (genRange) {
        filtered = filtered.filter(p => {
          const id = this.extractIdFromUrl(p.url);
          return id >= genRange.start && id <= genRange.end;
        });
      }
    }

    // Apply limit and offset
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit || filtered.length;
      filtered = filtered.slice(offset, offset + limit);
    }

    return filtered;
  }

  /**
   * Get detailed Pokemon information
   */
  async getPokemonDetails(nameOrId: string | number): Promise<PokemonDisplay> {
    return pokemonService.getPokemonDetails(nameOrId);
  }

  /**
   * Get evolution chain for a Pokemon
   */
  async getEvolutionChain(pokemon: PokemonDisplay): Promise<EvolutionChain> {
    return pokemonService.getEvolutionChain(pokemon);
  }

  /**
   * Get moves for a Pokemon
   */
  async getMoves(pokemonId: number, _generation?: number): Promise<MoveData[]> {
    // Fetch Pokemon data
    const pokemon = await pokeAPI.getPokemon(pokemonId);

    // Filter to main learn methods
    const mainMethods = ['level-up', 'machine', 'egg', 'tutor'];

    // Get latest version group details for each move
    const moveMap = new Map<string, { method: string; level: number }>();

    for (const pokemonMove of pokemon.moves) {
      // Get the latest version group detail with a main learn method
      const validDetails = pokemonMove.version_group_details
        .filter(d => mainMethods.includes(d.move_learn_method.name))
        .sort((_a, _b) => {
          // Sort by version group (latest first), then by level
          // For simplicity, just use the first valid one
          return 0;
        });

      if (validDetails.length > 0) {
        const detail = validDetails[0];
        moveMap.set(pokemonMove.move.name, {
          method: detail.move_learn_method.name,
          level: detail.level_learned_at
        });
      }
    }

    // Fetch move details for all moves in parallel
    const moveNames = Array.from(moveMap.keys());
    const moveDetails = await Promise.all(
      moveNames.map(async (moveName) => {
        // Check cache first
        const cached = this.moveCache.get(moveName);
        if (cached) {
          return cached;
        }

        // Fetch from API
        const move = await pokeAPI.getMove(moveName);
        this.moveCache.set(moveName, move);
        return move;
      })
    );

    // Transform to MoveData format
    const moves: MoveData[] = moveDetails.map((move, index) => {
      const moveName = moveNames[index];
      const learnInfo = moveMap.get(moveName)!;

      // Get English short effect
      const shortEffect = move.effect_entries.find(e => e.language.name === 'en')?.short_effect || 'No description available.';

      return {
        name: move.name,
        type: move.type.name,
        category: move.damage_class.name as 'physical' | 'special' | 'status',
        power: move.power,
        accuracy: move.accuracy,
        pp: move.pp,
        learnMethod: learnInfo.method as 'level-up' | 'machine' | 'egg' | 'tutor',
        levelLearned: learnInfo.level > 0 ? learnInfo.level : undefined,
        description: shortEffect,
      };
    });

    // Sort moves: level-up by level, then alphabetically by name
    moves.sort((a, b) => {
      // Level-up moves first, sorted by level
      if (a.learnMethod === 'level-up' && b.learnMethod === 'level-up') {
        return (a.levelLearned || 0) - (b.levelLearned || 0);
      }
      if (a.learnMethod === 'level-up') return -1;
      if (b.learnMethod === 'level-up') return 1;

      // Then by learn method
      const methodOrder = { 'machine': 0, 'egg': 1, 'tutor': 2 };
      const aOrder = methodOrder[a.learnMethod as keyof typeof methodOrder] ?? 99;
      const bOrder = methodOrder[b.learnMethod as keyof typeof methodOrder] ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;

      // Finally alphabetically by name
      return a.name.localeCompare(b.name);
    });

    return moves;
  }

  /**
   * Get ability details with caching
   */
  async getAbilityDetails(abilityName: string): Promise<AbilityDetail> {
    // Check cache first
    const cached = this.abilityCache.get(abilityName);
    if (cached) {
      return cached;
    }

    try {
      // Fetch from API
      const ability = await pokeAPI.getAbility(abilityName);

      // Find English effect entry
      const englishEffect = ability.effect_entries.find(
        entry => entry.language.name === 'en'
      );

      // Find English flavor text (most recent version)
      const englishFlavor = ability.flavor_text_entries
        .filter(entry => entry.language.name === 'en')
        .pop(); // Get the last (most recent) entry

      // Find English name
      const englishName = ability.names.find(
        name => name.language.name === 'en'
      );

      // Extract generation number from URL
      const genMatch = ability.generation.url.match(/\/generation\/(\d+)\//);
      const generation = genMatch ? parseInt(genMatch[1], 10) : 1;

      const abilityDetail: AbilityDetail = {
        name: ability.name,
        displayName: englishName?.name || this.formatAbilityName(ability.name),
        description: englishFlavor?.flavor_text.replace(/\n/g, ' ') || '',
        effect: englishEffect?.short_effect || englishEffect?.effect || '',
        generation,
        isHidden: false, // This will be set by the caller based on Pokemon data
      };

      // Cache the result
      this.abilityCache.set(abilityName, abilityDetail);

      return abilityDetail;
    } catch (error) {
      // Return fallback on error
      return {
        name: abilityName,
        displayName: this.formatAbilityName(abilityName),
        description: 'Unable to load ability details.',
        effect: '',
        generation: 1,
        isHidden: false,
      };
    }
  }

  /**
   * Format ability name from kebab-case to Title Case
   */
  private formatAbilityName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get generation number for a Pokemon ID
   */
  getGeneration(pokemonId: number): number {
    const genInfo = GENERATION_RANGES.find(
      g => pokemonId >= g.start && pokemonId <= g.end
    );
    return genInfo?.gen || 1;
  }

  /**
   * Extract Pokemon ID from API URL
   */
  private extractIdFromUrl(url: string): number {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
  }
}

// Export singleton instance
export const pokemonRepository = new PokemonRepository();
