import blessed from 'blessed';
import { theme } from '../theme.js';
import { searchService } from '../../services/searchService.js';

export interface SearchBoxOptions {
  parent: blessed.Widgets.Node;
  top?: number | string;
  left?: number | string;
  width?: number | string;
  onSelect?: (pokemonName: string) => void;
  onSearch?: (query: string) => void;
}

export class SearchBox {
  private container: blessed.Widgets.BoxElement;
  private input: blessed.Widgets.TextboxElement;
  private autocompleteList: blessed.Widgets.ListElement;
  private onSelectCallback?: (pokemonName: string) => void;
  private onSearchCallback?: (query: string) => void;
  private isShowingAutocomplete = false;

  constructor(options: SearchBoxOptions) {
    this.onSelectCallback = options.onSelect;
    this.onSearchCallback = options.onSearch;

    // Container for search box and autocomplete
    this.container = blessed.box({
      parent: options.parent,
      top: options.top ?? 0,
      left: options.left ?? 0,
      width: options.width ?? '100%',
      height: 'shrink',
    });

    // Search input
    this.input = blessed.textbox({
      parent: this.container,
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      keys: true,
      mouse: true,
      inputOnFocus: true,
      label: ' Search Pokemon (Ctrl+S) ',
      content: '',
      style: {
        fg: theme.searchBox.fg,
        bg: theme.searchBox.bg,
        border: theme.searchBox.border,
        focus: {
          border: {
            fg: theme.pokemonName.fg,
          },
        },
      },
      border: {
        type: 'line',
      },
    });

    // Autocomplete dropdown
    this.autocompleteList = blessed.list({
      parent: this.container,
      top: 3,
      left: 0,
      width: '50%',
      height: 12,
      hidden: true,
      keys: true,
      mouse: true,
      tags: true,
      scrollbar: {
        ch: ' ',
        style: {
          bg: 'yellow',
        },
      },
      style: {
        fg: 'white',
        bg: theme.searchBox.bg,
        border: theme.searchBox.border,
        selected: theme.list.selected,
      },
      border: {
        type: 'line',
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle input changes
    this.input.on('submit', (value) => {
      this.handleSubmit(value || '');
    });

    // Handle key presses during input
    this.input.key(['down'], () => {
      if (this.isShowingAutocomplete) {
        this.autocompleteList.focus();
        this.autocompleteList.select(0);
      }
    });

    // Handle autocomplete selection
    this.autocompleteList.on('select', (item) => {
      const pokemonName = item.getText().replace(/\{[^}]+\}/g, ''); // Remove color tags
      this.selectPokemon(pokemonName);
    });

    // Handle autocomplete navigation
    this.autocompleteList.key(['escape', 'up'], () => {
      if ((this.autocompleteList as any).selected === 0) {
        this.input.focus();
      }
    });

    // Real-time search as user types
    this.input.on('keypress', () => {
      // Small delay to get the updated value
      setImmediate(() => {
        const query = this.input.getValue();
        this.updateAutocomplete(query);

        if (this.onSearchCallback) {
          this.onSearchCallback(query);
        }
      });
    });
  }

  private updateAutocomplete(query: string): void {
    if (!query || query.trim() === '') {
      this.hideAutocomplete();
      return;
    }

    const results = searchService.search(query, 10);

    if (results.length === 0) {
      this.hideAutocomplete();
      return;
    }

    this.autocompleteList.setItems(results.map(r => r.highlight));
    this.showAutocomplete();
  }

  private showAutocomplete(): void {
    if (!this.isShowingAutocomplete) {
      this.autocompleteList.show();
      this.isShowingAutocomplete = true;
      this.container.screen.render();
    }
  }

  private hideAutocomplete(): void {
    if (this.isShowingAutocomplete) {
      this.autocompleteList.hide();
      this.isShowingAutocomplete = false;
      this.container.screen.render();
    }
  }

  private handleSubmit(value: string): void {
    if (!value || value.trim() === '') {
      return;
    }

    // Check if it's a number (ID search)
    const id = parseInt(value, 10);
    if (!isNaN(id)) {
      const pokemon = searchService.searchById(id);
      if (pokemon) {
        this.selectPokemon(pokemon.name);
        return;
      }
    }

    // Search by name
    const results = searchService.search(value, 1);
    if (results.length > 0) {
      this.selectPokemon(results[0].name);
    }
  }

  private selectPokemon(name: string): void {
    this.input.clearValue();
    this.hideAutocomplete();
    this.input.screen.render();

    if (this.onSelectCallback) {
      this.onSelectCallback(name);
    }
  }

  focus(): void {
    this.input.focus();
  }

  blur(): void {
    this.input.cancel();
    this.hideAutocomplete();
  }

  getValue(): string {
    return this.input.getValue();
  }

  clearValue(): void {
    this.input.clearValue();
    this.hideAutocomplete();
  }
}
