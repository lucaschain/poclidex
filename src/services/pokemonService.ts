import { pokeAPI } from '../api/pokeapi.js';
import { LRUCache } from '../utils/cache.js';
import { transformPokemon, type PokemonDisplay } from '../models/pokemon.js';
import type { PokemonListItem, EvolutionChain, ChainLink } from '../api/types.js';

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

    // Fetch from API
    const [pokemon, species] = await Promise.all([
      pokeAPI.getPokemon(nameOrId),
      pokeAPI.getPokemonSpecies(nameOrId),
    ]);

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
   * Parse evolution chain into a flat array of Pokemon names
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
   * Get evolution trigger description
   */
  getEvolutionTrigger(link: ChainLink): string {
    if (!link.evolution_details || link.evolution_details.length === 0) {
      return '';
    }

    const detail = link.evolution_details[0];
    const parts: string[] = [];

    if (detail.min_level) {
      parts.push(`Lv.${detail.min_level}`);
    }

    if (detail.item) {
      parts.push(detail.item.name.replace(/-/g, ' '));
    }

    if (detail.trigger.name === 'trade') {
      parts.push('Trade');
    }

    if (detail.min_happiness) {
      parts.push(`Happiness ${detail.min_happiness}`);
    }

    if (detail.time_of_day) {
      parts.push(detail.time_of_day);
    }

    if (detail.known_move) {
      parts.push(`knows ${detail.known_move.name}`);
    }

    if (detail.location) {
      parts.push(`at ${detail.location.name}`);
    }

    return parts.length > 0 ? parts.join(', ') : detail.trigger.name;
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
