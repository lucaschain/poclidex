import blessed from 'blessed';
import { theme } from '../../theme.js';
import { InfoPresenter } from '../../presenters/InfoPresenter.js';
import type { PokemonDisplay } from '../../../models/pokemon.js';
import { BaseDetailSection } from './IDetailSection.js';

/**
 * Section for displaying Pokemon overview (physical, types, pokedex entry)
 */
export class OverviewSection extends BaseDetailSection {
  private presenter: InfoPresenter;

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
        border: theme.detailBox.border,
      },
      border: {
        type: 'line',
      },
    });

    super('overview', widget);
    this.presenter = new InfoPresenter();
  }

  update(pokemon: PokemonDisplay): void {
    const lines = this.presenter.renderInfo(pokemon);
    this.widget.setContent(lines.join('\n'));
    this.widget.screen.render();
  }
}
