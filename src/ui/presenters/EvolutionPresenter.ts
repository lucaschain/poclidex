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
   * Render evolution chain with methods
   */
  async renderEvolutionChain(
    pokemon: PokemonDisplay,
    chain: EvolutionChain
  ): Promise<string[]> {
    const root = pokemonService.parseEvolutionChainStructured(chain);
    const lines: string[] = [];

    this.renderStage(root, pokemon.name, lines, '', true);

    return lines;
  }

  /**
   * Recursively render evolution stage
   */
  private renderStage(
    stage: EvolutionStage,
    currentPokemon: string,
    lines: string[],
    prefix: string,
    _isRoot: boolean
  ): void {
    const isCurrent = stage.species === currentPokemon;
    const displayName = stage.species.charAt(0).toUpperCase() + stage.species.slice(1);

    const formattedName = isCurrent
      ? `{${colors.pokemonYellow}-fg}{bold}[${displayName}]{/bold}{/}`
      : displayName;

    lines.push(prefix + formattedName);

    // Show evolution methods for each branch
    if (stage.branches.length > 0) {
      stage.branches.forEach((branch, index) => {
        const isLast = index === stage.branches.length - 1;
        const connector = stage.branches.length === 1 ? '     ↓' : (isLast ? ' └─' : ' ├─');
        const method = branch.method ? ` ${branch.method}` : '';

        if (stage.branches.length === 1) {
          // Simple linear evolution
          lines.push(`${prefix}${connector}${method}`);
          this.renderStage(branch, currentPokemon, lines, prefix, false);
        } else {
          // Branch evolution - show method inline with arrow
          lines.push(`${prefix}${connector}${method} →`);
          const branchPrefix = prefix + (isLast ? '    ' : ' │  ');
          this.renderStage(branch, currentPokemon, lines, branchPrefix, false);
        }
      });
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
