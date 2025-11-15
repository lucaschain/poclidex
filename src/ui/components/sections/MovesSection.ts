import blessed from 'blessed';
import { theme } from '../../theme.js';
import type { PokemonDisplay } from '../../../models/pokemon.js';
import { BaseDetailSection } from './IDetailSection.js';

/**
 * Section for displaying Pokemon moves
 * (Placeholder - full implementation in Phase 3)
 */
export class MovesSection extends BaseDetailSection {
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
      label: ' Moves ',
      style: {
        border: theme.detailBox.border,
      },
      border: {
        type: 'line',
      },
    });

    super('moves', widget);
  }

  update(pokemon: PokemonDisplay): void {
    // Placeholder content
    const lines: string[] = [];

    lines.push('');
    lines.push(`{center}{bold}Moves for ${pokemon.displayName}{/bold}{/center}`);
    lines.push('');
    lines.push('{center}{gray-fg}Coming soon in Phase 3!{/gray-fg}{/center}');
    lines.push('');
    lines.push('{center}This section will display:{/center}');
    lines.push('{center}- Moves learned by level up{/center}');
    lines.push('{center}- TM/HM moves{/center}');
    lines.push('{center}- Egg moves{/center}');
    lines.push('{center}- Move tutor moves{/center}');

    this.widget.setContent(lines.join('\n'));
    this.widget.screen.render();
  }
}
