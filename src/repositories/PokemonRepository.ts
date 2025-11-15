import { pokemonService } from '../services/pokemonService.js';
import type { PokemonListItem, EvolutionChain } from '../api/types.js';
import type { PokemonDisplay } from '../models/pokemon.js';
import type {
  IPokemonRepository,
  FilterOptions,
  MoveData,
  AbilityDetail,
} from './IPokemonRepository.js';

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
   * Get moves for a Pokemon (stub for now - will implement in Phase 3)
   */
  async getMoves(_pokemonId: number, _generation?: number): Promise<MoveData[]> {
    // Placeholder: Will implement full move fetching in Phase 3
    // For now, return empty array to maintain interface compatibility
    return [];
  }

  /**
   * Get ability details (stub for now - will implement in Phase 4)
   */
  async getAbilityDetails(abilityName: string): Promise<AbilityDetail> {
    // Placeholder: Will implement in Phase 4
    // For now, return basic structure
    return {
      name: abilityName,
      displayName: abilityName.charAt(0).toUpperCase() + abilityName.slice(1),
      description: 'Ability details not yet loaded.',
      effect: '',
      generation: 1,
      isHidden: false,
    };
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
