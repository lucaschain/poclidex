import blessed from 'blessed';
import { theme, colors } from '../../theme.js';
import { InfoPresenter } from '../../presenters/InfoPresenter.js';
import { EvolutionPresenter } from '../../presenters/EvolutionPresenter.js';
import { pokemonRepository } from '../../../repositories/PokemonRepository.js';
import type { PokemonDisplay } from '../../../models/pokemon.js';
import { BaseDetailSection } from './IDetailSection.js';

/**
 * Section for displaying Pokemon overview (physical, types, pokedex entry, evolution)
 */
export class OverviewSection extends BaseDetailSection {
  private presenter: InfoPresenter;
  private evolutionPresenter: EvolutionPresenter;
  private evolutionOptions: string[] = [];

  constructor(parent: blessed.Widgets.Node) {
    const widget = blessed.box({
      parent,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      label: ' Overview ',
      style: {
        bg: theme.detailBox.bg,
        border: theme.detailBox.border,
      },
      border: {
        type: 'line',
      },
      padding: {
        left: 2,
        right: 2,
        top: 1,
        bottom: 0,
      },
    });

    super('overview', widget);
    this.presenter = new InfoPresenter();
    this.evolutionPresenter = new EvolutionPresenter();
  }

  async update(pokemon: PokemonDisplay): Promise<void> {
    const lines: string[] = [];

    // Render overview information (physical, types, pokedex entry)
    lines.push(...this.presenter.renderInfo(pokemon));

    // Add spacing before evolution
    lines.push('');

    // Evolution section header
    lines.push(`{${colors.pokemonYellow}-fg}{bold}Evolution{/bold}{/}`);
    lines.push('');

    // Render evolution chain
    try {
      const chain = await pokemonRepository.getEvolutionChain(pokemon);
      const evolutionLines = await this.evolutionPresenter.renderEvolutionChain(pokemon, chain);

      // Store evolution options for navigation
      this.evolutionOptions = this.evolutionPresenter.getEvolutionOptions(chain);

      lines.push(...evolutionLines);
    } catch (error) {
      lines.push('{gray-fg}No evolution data available{/}');
      this.evolutionOptions = [];
    }

    this.widget.setContent(lines.join('\n'));
    this.widget.screen.render();
  }

  /**
   * Get Pokemon names that can be navigated to via evolution
   */
  getEvolutionOptions(): string[] {
    return this.evolutionOptions;
  }
}
