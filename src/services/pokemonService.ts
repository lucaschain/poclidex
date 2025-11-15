import { pokeAPI } from '../api/pokeapi.js';
import { LRUCache } from '../utils/cache.js';
import { transformPokemon, type PokemonDisplay } from '../models/pokemon.js';
import type { PokemonListItem, EvolutionChain, ChainLink } from '../api/types.js';

/**
 * Evolution stage with species and method information
 */
export interface EvolutionStage {
  species: string;
  method: string;  // How to evolve into this Pokemon
  branches: EvolutionStage[];  // Multiple evolution paths
}

/**
 * Parsed evolution chain with structured data
 */
export interface ParsedEvolutionChain {
  stages: EvolutionStageGroup[];
}

export interface EvolutionStageGroup {
  depth: number;
  evolutions: EvolutionStage[];
}

/**
 * Service for managing Pokemon data with caching
 */
export class PokemonService {
  private pokemonCache: LRUCache<string | number, PokemonDisplay>;
  private evolutionCache: LRUCache<number, EvolutionChain>;
  private pokemonList: PokemonListItem[] = [];

  constructor() {
    this.pokemonCache = new LRUCache(200); // Cache up to 200 Pokemon
    this.evolutionCache = new LRUCache(50); // Cache up to 50 evolution chains
  }

  /**
   * Load the complete Pokemon list (all generations)
   */
  async loadPokemonList(): Promise<PokemonListItem[]> {
    if (this.pokemonList.length > 0) {
      return this.pokemonList;
    }

    const response = await pokeAPI.getPokemonList(100000, 0);
    this.pokemonList = response.results;
    return this.pokemonList;
  }

  /**
   * Get the cached Pokemon list
   */
  getPokemonList(): PokemonListItem[] {
    return this.pokemonList;
  }

  /**
   * Get detailed Pokemon data with caching
   */
  async getPokemonDetails(nameOrId: string | number): Promise<PokemonDisplay> {
    // Check cache first
    const cacheKey = typeof nameOrId === 'string' ? nameOrId.toLowerCase() : nameOrId;
    const cached = this.pokemonCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch Pokemon first
    const pokemon = await pokeAPI.getPokemon(nameOrId);

    // Use the species name from Pokemon response (works for alternate forms!)
    // e.g., "raichu-alola" Pokemon has species.name "raichu"
    const speciesName = pokemon.species.name;
    const species = await pokeAPI.getPokemonSpecies(speciesName);

    const transformed = transformPokemon(pokemon, species);

    // Cache by both name and ID
    this.pokemonCache.set(transformed.name, transformed);
    this.pokemonCache.set(transformed.id, transformed);

    return transformed;
  }

  /**
   * Get evolution chain for a Pokemon
   */
  async getEvolutionChain(pokemon: PokemonDisplay): Promise<EvolutionChain> {
    if (!pokemon.evolutionChainUrl) {
      throw new Error(`No evolution chain found for ${pokemon.displayName}`);
    }

    const chainId = pokeAPI.extractEvolutionChainId(pokemon.evolutionChainUrl);

    // Check cache
    const cached = this.evolutionCache.get(chainId);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const chain = await pokeAPI.getEvolutionChain(chainId);
    this.evolutionCache.set(chainId, chain);

    return chain;
  }

  /**
   * Parse evolution chain into a flat array of Pokemon names (legacy)
   */
  parseEvolutionChain(chain: EvolutionChain): string[][] {
    const stages: string[][] = [];

    function traverse(link: ChainLink, depth: number = 0) {
      if (!stages[depth]) {
        stages[depth] = [];
      }

      stages[depth].push(link.species.name);

      if (link.evolves_to && link.evolves_to.length > 0) {
        link.evolves_to.forEach(evolution => {
          traverse(evolution, depth + 1);
        });
      }
    }

    traverse(chain.chain);
    return stages;
  }

  /**
   * Parse evolution chain into structured data with evolution methods
   */
  parseEvolutionChainStructured(chain: EvolutionChain): EvolutionStage {
    const buildStage = (link: ChainLink): EvolutionStage => {
      return {
        species: link.species.name,
        method: this.getEvolutionTrigger(link),
        branches: link.evolves_to.map(evo => buildStage(evo)),
      };
    };

    return buildStage(chain.chain);
  }

  /**
   * Get evolution trigger description
   */
  getEvolutionTrigger(link: ChainLink): string {
    if (!link.evolution_details || link.evolution_details.length === 0) {
      return '';
    }

    const detail = link.evolution_details[0];
    const parts: string[] = [];

    // Level requirement
    if (detail.min_level) {
      parts.push(`Lv.${detail.min_level}`);
    }

    // Evolution item (stones, etc.)
    if (detail.item) {
      const itemName = detail.item.name.split('-').map(w =>
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ');
      parts.push(itemName);
    }

    // Trade evolution
    if (detail.trigger.name === 'trade') {
      if (detail.held_item) {
        const heldName = detail.held_item.name.split('-').map(w =>
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        parts.push(`Trade holding ${heldName}`);
      } else if (detail.trade_species) {
        parts.push(`Trade for ${detail.trade_species.name}`);
      } else {
        parts.push('Trade');
      }
    }

    // Happiness/Friendship
    if (detail.min_happiness) {
      parts.push(`Happiness ${detail.min_happiness}+`);
    }

    // Affection (Gen 6+)
    if (detail.min_affection) {
      parts.push(`Affection ${detail.min_affection}+`);
    }

    // Time of day
    if (detail.time_of_day) {
      parts.push(`(${detail.time_of_day.charAt(0).toUpperCase() + detail.time_of_day.slice(1)})`);
    }

    // Known move
    if (detail.known_move) {
      const moveName = detail.known_move.name.split('-').map(w =>
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ');
      parts.push(`knows ${moveName}`);
    }

    // Known move type
    if (detail.known_move_type) {
      parts.push(`knows ${detail.known_move_type.name}-type move`);
    }

    // Location
    if (detail.location) {
      const locName = detail.location.name.split('-').map(w =>
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ');
      parts.push(`at ${locName}`);
    }

    // Gender requirement
    if (detail.gender === 1) {
      parts.push('(Female)');
    } else if (detail.gender === 2) {
      parts.push('(Male)');
    }

    // Stats comparison (Tyrogue)
    if (detail.relative_physical_stats !== null) {
      if (detail.relative_physical_stats === 1) {
        parts.push('(ATK > DEF)');
      } else if (detail.relative_physical_stats === -1) {
        parts.push('(ATK < DEF)');
      } else {
        parts.push('(ATK = DEF)');
      }
    }

    // Party requirements
    if (detail.party_species) {
      parts.push(`with ${detail.party_species.name} in party`);
    }

    if (detail.party_type) {
      parts.push(`with ${detail.party_type.name}-type in party`);
    }

    // Weather
    if (detail.needs_overworld_rain) {
      parts.push('while raining');
    }

    // Beauty (Gen 3)
    if (detail.min_beauty) {
      parts.push(`Beauty ${detail.min_beauty}+`);
    }

    // 3DS specific
    if (detail.turn_upside_down) {
      parts.push('turn upside down');
    }

    return parts.length > 0 ? parts.join(' ') : detail.trigger.name;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.pokemonCache.clear();
    this.evolutionCache.clear();
  }
}

// Export a singleton instance
export const pokemonService = new PokemonService();
