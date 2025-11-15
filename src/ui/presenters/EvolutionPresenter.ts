import { colors } from '../theme.js';
import type { PokemonDisplay } from '../../models/pokemon.js';
import type { EvolutionChain } from '../../api/types.js';
import { pokemonService } from '../../services/pokemonService.js';

/**
 * Presenter for rendering evolution chains
 *
 * Handles parsing and formatting of evolution data
 */
export class EvolutionPresenter {
  /**
   * Render evolution chain
   */
  async renderEvolutionChain(
    pokemon: PokemonDisplay,
    chain: EvolutionChain
  ): Promise<string[]> {
    const stages = pokemonService.parseEvolutionChain(chain);
    const lines: string[] = [];

    stages.forEach((stage, index) => {
      if (index > 0) {
        lines.push('     ↓');
      }

      const pokemonNames = stage.map(name => {
        const isCurrent = name === pokemon.name;
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);
        return isCurrent
          ? `{${colors.pokemonYellow}-fg}{bold}[${displayName}]{/bold}{/}`
          : displayName;
      }).join(' / ');

      lines.push(pokemonNames);
    });

    return lines;
  }

  /**
   * Get all Pokemon names in the evolution chain (for navigation)
   */
  getEvolutionOptions(chain: EvolutionChain): string[] {
    const stages = pokemonService.parseEvolutionChain(chain);
    return stages.flat();
  }

  /**
   * Get evolution stage number (1 = basic, 2 = stage 1, 3 = stage 2)
   */
  getEvolutionStage(pokemon: PokemonDisplay, chain: EvolutionChain): number {
    const stages = pokemonService.parseEvolutionChain(chain);

    for (let i = 0; i < stages.length; i++) {
      if (stages[i].includes(pokemon.name)) {
        return i + 1;
      }
    }

    return 1;
  }

  /**
   * Format evolution method (for detailed view - Phase 3+)
   */
  formatEvolutionMethod(method: string, _details: any): string {
    // Placeholder for future enhancement
    // Will show "Level 16", "Fire Stone", "Trade holding Metal Coat", etc.
    return method;
  }
}
