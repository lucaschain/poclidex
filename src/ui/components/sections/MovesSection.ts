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
      keys: false, // Disable default key handlers, we'll handle them manually
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
      height: '20%+1',
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

    // Override arrow keys and vim keys to update description after navigation
    this.table.key(['down', 'j'], () => {
      this.table.down(1);
      // Use setImmediate to ensure description updates after blessed updates selection
      setImmediate(() => {
        this.updateDescription();
        this.table.screen.render();
      });
    });

    this.table.key(['up', 'k'], () => {
      this.table.up(1);
      // Use setImmediate to ensure description updates after blessed updates selection
      setImmediate(() => {
        this.updateDescription();
        this.table.screen.render();
      });
    });
  }

  private updateDescription(): void {
    // Get the current selected row from the table
    // @ts-ignore - blessed types don't fully expose selected property
    const tableSelectedIndex = this.table.selected as number;

    // Account for header row (first row is index 0, which is the header)
    // So the first actual move is at table index 1, which maps to moves[0]
    const moveIndex = tableSelectedIndex - 1;

    // Update description if we have a valid move
    if (moveIndex >= 0 && moveIndex < this.moves.length) {
      const move = this.moves[moveIndex];
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
    this.table.screen.render();

    try {
      // Fetch moves
      this.moves = await pokemonRepository.getMoves(pokemon.id);

      // Format into table rows
      const tableData = this.presenter.formatMovesTable(this.moves);

      // Set table data
      this.table.setData(tableData);

      // Select the first move (index 1, since 0 is the header)
      // @ts-ignore - blessed types don't fully expose select method
      this.table.select(1);

      // Update description for the first move
      this.updateDescription();

      this.table.screen.render();
    } catch (error) {
      // Show error
      this.table.setData([['Error loading moves'], [(error as Error).message]]);
      this.descriptionBox.setContent('Failed to load move data');
      this.table.screen.render();
    }
  }
}
