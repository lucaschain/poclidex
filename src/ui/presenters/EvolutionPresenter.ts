import { colors } from '../theme.js';
import type { PokemonDisplay } from '../../models/pokemon.js';
import type { EvolutionChain } from '../../api/types.js';
import { pokemonService, type EvolutionStage } from '../../services/pokemonService.js';

/**
 * Presenter for rendering evolution chains
 *
 * Handles parsing and formatting of evolution data with methods
 */
export class EvolutionPresenter {
  /**
   * Render evolution chain with methods - centered vertical layout
   */
  async renderEvolutionChain(
    pokemon: PokemonDisplay,
    chain: EvolutionChain
  ): Promise<string[]> {
    const root = pokemonService.parseEvolutionChainStructured(chain);
    const lines: string[] = [];

    // Add spacing at top
    lines.push('');

    // Build linear evolution chain (only follows first branch for simplicity)
    this.renderStageVertical(root, pokemon.name, lines);

    // Add spacing at bottom
    lines.push('');

    return lines;
  }

  /**
   * Render evolution stage in centered vertical format
   */
  private renderStageVertical(
    stage: EvolutionStage,
    currentPokemon: string,
    lines: string[]
  ): void {
    const isCurrent = stage.species === currentPokemon;
    const displayName = stage.species.charAt(0).toUpperCase() + stage.species.slice(1);

    // Format Pokemon name with highlighting if current
    const formattedName = isCurrent
      ? `{center}{${colors.pokemonYellow}-fg}{bold}${displayName}{/bold}{/}{/center}`
      : `{center}${displayName}{/center}`;

    lines.push(formattedName);

    // If there are evolutions, show method and continue
    if (stage.branches.length > 0) {
      const branch = stage.branches[0]; // Follow first branch for linear display

      // Add down arrow
      lines.push('{center}↓{/center}');

      // Add evolution method if exists
      if (branch.method) {
        lines.push(`{center}${branch.method}{/center}`);
        lines.push('{center}↓{/center}');
      }

      // Recursively render next stage
      this.renderStageVertical(branch, currentPokemon, lines);
    }
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
