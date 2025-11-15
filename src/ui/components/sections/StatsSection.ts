import blessed from 'blessed';
import { theme } from '../../theme.js';
import { StatPresenter } from '../../presenters/StatPresenter.js';
import type { PokemonDisplay } from '../../../models/pokemon.js';
import { BaseDetailSection } from './IDetailSection.js';

/**
 * Section for displaying Pokemon stats and abilities
 */
export class StatsSection extends BaseDetailSection {
  private presenter: StatPresenter;

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
      label: ' Stats & Abilities ',
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

    super('stats', widget);
    this.presenter = new StatPresenter();
  }

  async update(pokemon: PokemonDisplay): Promise<void> {
    const lines: string[] = [];

    // Render stats using presenter with widget for dynamic width calculation
    lines.push(...this.presenter.renderStats(pokemon, this.widget));

    // Show loading message for abilities
    this.widget.setContent(lines.join('\n') + '\n\n{gray-fg}Loading abilities...{/}');
    this.widget.screen.render();

    // Render abilities using presenter (async) with widget for dynamic width calculation
    const abilityLines = await this.presenter.renderAbilities(pokemon, this.widget);
    lines.push(...abilityLines);

    this.widget.setContent(lines.join('\n'));
    this.widget.screen.render();
  }
}
