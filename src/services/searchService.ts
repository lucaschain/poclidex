import fuzzysort from 'fuzzysort';
import type { PokemonListItem } from '../api/types.js';

export interface SearchResult {
  name: string;
  score: number;
  highlight: string; // Name with matched characters highlighted
}

/**
 * Service for fuzzy searching Pokemon
 */
export class SearchService {
  private pokemonList: PokemonListItem[] = [];
  private preparedSearch: Fuzzysort.Prepared[] = [];

  /**
   * Index Pokemon list for searching
   */
  indexPokemon(pokemonList: PokemonListItem[]): void {
    this.pokemonList = pokemonList;
    // Prepare all Pokemon names for faster fuzzy search
    this.preparedSearch = pokemonList.map(p => fuzzysort.prepare(p.name));
  }

  /**
   * Search for Pokemon with fuzzy matching
   */
  search(query: string, limit: number = 10): SearchResult[] {
    if (!query || query.trim() === '') {
      return [];
    }

    const results = fuzzysort.go(query, this.preparedSearch, {
      limit,
      threshold: -10000, // Don't filter out any results, just sort by score
    });

    return results.map(result => ({
      name: result.target,
      score: result.score,
      highlight: this.highlightMatches(result),
    }));
  }

  /**
   * Get autocomplete suggestions
   */
  autocomplete(query: string, limit: number = 10): string[] {
    const results = this.search(query, limit);
    return results.map(r => r.name);
  }

  /**
   * Highlight matched characters in the result
   */
  private highlightMatches(result: Fuzzysort.Result): string {
    if (!result.indexes) {
      return result.target;
    }

    let highlighted = '';
    let lastIndex = 0;

    result.indexes.forEach(index => {
      // Add non-matched characters
      highlighted += result.target.substring(lastIndex, index);
      // Add matched character with marker
      highlighted += `{yellow-fg}${result.target[index]}{/yellow-fg}`;
      lastIndex = index + 1;
    });

    // Add remaining characters
    highlighted += result.target.substring(lastIndex);

    return highlighted;
  }

  /**
   * Search by Pokemon ID
   */
  searchById(id: number): PokemonListItem | undefined {
    // Pokemon IDs correspond to their position in the list (1-based)
    if (id < 1 || id > this.pokemonList.length) {
      return undefined;
    }
    return this.pokemonList[id - 1];
  }

  /**
   * Get Pokemon by exact name
   */
  getByName(name: string): PokemonListItem | undefined {
    return this.pokemonList.find(p => p.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Get total number of indexed Pokemon
   */
  get totalPokemon(): number {
    return this.pokemonList.length;
  }
}

// Export a singleton instance
export const searchService = new SearchService();
