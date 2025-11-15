import type { PokemonListItem, EvolutionChain } from '../api/types.js';
import type { PokemonDisplay } from '../models/pokemon.js';

/**
 * Filter options for Pokemon queries
 */
export interface FilterOptions {
  generation?: number;
  type?: string;
  isLegendary?: boolean;
  isMythical?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Move data for a Pokemon
 */
export interface MoveData {
  name: string;
  type: string;
  category: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  pp: number;
  learnMethod: 'level-up' | 'machine' | 'egg' | 'tutor';
  levelLearned?: number;
  generation?: number;
  description?: string;
}

/**
 * Detailed ability information
 */
export interface AbilityDetail {
  name: string;
  displayName: string;
  description: string;
  effect: string;
  generation: number;
  isHidden: boolean;
}

/**
 * Repository interface for Pokemon data operations
 *
 * This interface defines the contract for fetching Pokemon data,
 * allowing for easy testing and future data source swapping.
 */
export interface IPokemonRepository {
  /**
   * Get a list of all Pokemon with optional filtering
   */
  getPokemonList(options?: FilterOptions): Promise<PokemonListItem[]>;

  /**
   * Get detailed information about a specific Pokemon
   */
  getPokemonDetails(nameOrId: string | number): Promise<PokemonDisplay>;

  /**
   * Get the evolution chain for a Pokemon
   */
  getEvolutionChain(pokemon: PokemonDisplay): Promise<EvolutionChain>;

  /**
   * Get all moves for a Pokemon, optionally filtered by generation
   */
  getMoves(pokemonId: number, generation?: number): Promise<MoveData[]>;

  /**
   * Get detailed information about a specific ability
   */
  getAbilityDetails(abilityName: string): Promise<AbilityDetail>;

  /**
   * Get generation information for a Pokemon ID
   */
  getGeneration(pokemonId: number): number;
}
