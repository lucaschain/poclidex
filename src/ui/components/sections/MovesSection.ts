import blessed from 'blessed';
import { theme, colors } from '../../theme.js';
import type { PokemonDisplay } from '../../../models/pokemon.js';
import { BaseDetailSection } from './IDetailSection.js';
import { pokemonRepository } from '../../../repositories/PokemonRepository.js';
import { MovesPresenter } from '../../presenters/MovesPresenter.js';

/**
 * Section for displaying Pokemon moves in a scrollable table
 */
export class MovesSection extends BaseDetailSection {
  private table: blessed.Widgets.ListTableElement;
  private descriptionBox: blessed.Widgets.BoxElement;
  private presenter: MovesPresenter;
  private moves: import('../../../repositories/IPokemonRepository.js').MoveData[] = [];
  private selectedIndex: number = 0;

  constructor(parent: blessed.Widgets.Node) {
    // Create container to hold table and description
    const container = blessed.box({
      parent,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    });

    const table = blessed.listtable({
      parent: container,
      top: 0,
      left: 0,
      width: '100%',
      height: '80%',
      keys: true,
      mouse: true,
      tags: true,
      scrollable: true,
      scrollbar: {
        ch: ' ',
        style: {
          bg: 'yellow',
        },
      },
      style: {
        bg: theme.detailBox.bg,
        header: {
          fg: colors.pokemonYellow,
          bold: true,
        },
        cell: {
          fg: 'white',
        },
        selected: {
          fg: 'black',
          bg: colors.pokemonYellow,
        },
        border: theme.detailBox.border,
      },
      border: {
        type: 'line',
      },
      label: ' Moves ',
      align: 'left',
      pad: 1,
    });

    const descriptionBox = blessed.box({
      parent: container,
      top: '80%',
      left: 0,
      width: '100%',
      height: '20%',
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        bg: theme.detailBox.bg,
        border: theme.detailBox.border,
      },
      label: ' Description ',
      padding: {
        left: 1,
        right: 1,
      },
    });

    super('moves', container);
    this.table = table;
    this.descriptionBox = descriptionBox;
    this.presenter = new MovesPresenter();

    // Update description when selection changes
    this.table.on('select', () => {
      this.updateDescription();
    });

    // Add vim-style navigation
    this.table.key(['j', 'down'], () => {
      this.table.down(1);
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.moves.length - 1);
      this.updateDescription();
      this.table.screen.render();
    });

    this.table.key(['k', 'up'], () => {
      this.table.up(1);
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this.updateDescription();
      this.table.screen.render();
    });
  }

  private updateDescription(): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.moves.length) {
      const move = this.moves[this.selectedIndex];
      const description = this.presenter.getDescription(move);
      this.descriptionBox.setContent(description);
    } else {
      this.descriptionBox.setContent('');
    }
  }

  focus(): void {
    this.table.focus();
  }

  async update(pokemon: PokemonDisplay): Promise<void> {
    // Show loading state
    this.table.setData([['Loading moves...']]);
    this.descriptionBox.setContent('');
    this.selectedIndex = 0;
    this.table.screen.render();

    try {
      // Fetch moves
      this.moves = await pokemonRepository.getMoves(pokemon.id);

      // Format into table rows
      const tableData = this.presenter.formatMovesTable(this.moves);

      // Set table data
      this.table.setData(tableData);

      // Show description for first move (if any)
      if (this.moves.length > 0) {
        this.selectedIndex = 0;
        this.descriptionBox.setContent(this.presenter.getDescription(this.moves[0]));
      }

      this.table.screen.render();
    } catch (error) {
      // Show error
      this.table.setData([['Error loading moves'], [(error as Error).message]]);
      this.descriptionBox.setContent('Failed to load move data');
      this.table.screen.render();
    }
  }
}
