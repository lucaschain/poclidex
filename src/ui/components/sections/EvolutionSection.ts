import blessed from 'blessed';
import { theme } from '../../theme.js';
import { EvolutionPresenter } from '../../presenters/EvolutionPresenter.js';
import { pokemonRepository } from '../../../repositories/PokemonRepository.js';
import type { PokemonDisplay } from '../../../models/pokemon.js';
import { BaseDetailSection } from './IDetailSection.js';

/**
 * Section for displaying Pokemon evolution chain
 */
export class EvolutionSection extends BaseDetailSection {
  private presenter: EvolutionPresenter;
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
      label: ' Evolution Chain (E to navigate) ',
      style: {
        border: theme.detailBox.border,
      },
      border: {
        type: 'line',
      },
    });

    super('evolution', widget);
    this.presenter = new EvolutionPresenter();
  }

  async update(pokemon: PokemonDisplay): Promise<void> {
    try {
      const chain = await pokemonRepository.getEvolutionChain(pokemon);
      const lines = await this.presenter.renderEvolutionChain(pokemon, chain);

      // Store evolution options for navigation
      this.evolutionOptions = this.presenter.getEvolutionOptions(chain);

      this.widget.setContent(lines.join('\n'));
    } catch (error) {
      this.widget.setContent('No evolution data available');
      this.evolutionOptions = [];
    }

    this.widget.screen.render();
  }

  /**
   * Get Pokemon names that can be navigated to
   */
  getEvolutionOptions(): string[] {
    return this.evolutionOptions;
  }
}
