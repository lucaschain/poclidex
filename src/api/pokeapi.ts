import Pokedex from 'pokedex-promise-v2';
import type {
  Pokemon,
  PokemonSpecies,
  EvolutionChain,
  PokemonListResponse,
  Ability,
} from './types.js';

// Initialize the Pokedex API client
const P = new Pokedex({
  protocol: 'https',
  cacheLimit: 100 * 1000, // 100 seconds
  timeout: 10 * 1000, // 10 seconds
});

export class PokeAPI {
  /**
   * Get a list of all Pokemon with pagination
   */
  async getPokemonList(limit: number = 100000, offset: number = 0): Promise<PokemonListResponse> {
    const response = await P.getPokemonsList({ limit, offset });
    return response as PokemonListResponse;
  }

  /**
   * Get detailed Pokemon data by name or ID
   */
  async getPokemon(nameOrId: string | number): Promise<Pokemon> {
    const pokemon = await P.getPokemonByName(nameOrId);
    return pokemon as Pokemon;
  }

  /**
   * Get Pokemon species data (includes evolution chain reference, Pokedex entries, etc.)
   */
  async getPokemonSpecies(nameOrId: string | number): Promise<PokemonSpecies> {
    const species = await P.getPokemonSpeciesByName(nameOrId);
    return species as unknown as PokemonSpecies;
  }

  /**
   * Get evolution chain data by ID
   */
  async getEvolutionChain(id: number): Promise<EvolutionChain> {
    const chain = await P.getEvolutionChainById(id);
    return chain as EvolutionChain;
  }

  /**
   * Get evolution chain ID from species URL
   */
  extractEvolutionChainId(url: string): number {
    const matches = url.match(/\/evolution-chain\/(\d+)\//);
    if (!matches || !matches[1]) {
      throw new Error(`Could not extract evolution chain ID from URL: ${url}`);
    }
    return parseInt(matches[1], 10);
  }

  /**
   * Get Pokemon ID from species URL
   */
  extractPokemonId(url: string): number {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    if (!matches || !matches[1]) {
      // Try pokemon-species format
      const speciesMatches = url.match(/\/pokemon-species\/(\d+)\//);
      if (!speciesMatches || !speciesMatches[1]) {
        throw new Error(`Could not extract Pokemon ID from URL: ${url}`);
      }
      return parseInt(speciesMatches[1], 10);
    }
    return parseInt(matches[1], 10);
  }

  /**
   * Get ability details by name or ID
   */
  async getAbility(nameOrId: string | number): Promise<Ability> {
    const ability = await P.getAbilityByName(nameOrId);
    return ability as unknown as Ability;
  }
}

// Export a singleton instance
export const pokeAPI = new PokeAPI();
