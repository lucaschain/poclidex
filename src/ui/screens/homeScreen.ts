import blessed from 'blessed';
import { SearchBox } from '../components/searchBox.js';
import { PokemonList } from '../components/pokemonList.js';
import { searchService } from '../../services/searchService.js';
import { pokemonService } from '../../services/pokemonService.js';

export interface HomeScreenOptions {
  parent: blessed.Widgets.Node;
  screen: blessed.Widgets.Screen;
  onPokemonSelect?: (pokemonName: string) => Promise<void>;
}

export class HomeScreen {
  private container: blessed.Widgets.BoxElement;
  private searchBox: SearchBox;
  private pokemonList: PokemonList;
  private statusBar: blessed.Widgets.BoxElement;
  private loadingBox?: blessed.Widgets.BoxElement;
  private screen: blessed.Widgets.Screen;
  private onPokemonSelectCallback?: (pokemonName: string) => Promise<void>;

  constructor(options: HomeScreenOptions) {
    this.screen = options.screen;
    this.onPokemonSelectCallback = options.onPokemonSelect;

    // Create main container
    this.container = blessed.box({
      parent: options.parent,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    });

    // Create search box
    this.searchBox = new SearchBox({
      parent: this.container,
      top: 0,
      width: '100%',
      onSearch: (query) => this.handleSearch(query),
      onEscape: () => this.pokemonList.focus(),
    });

    // Create Pokemon list
    this.pokemonList = new PokemonList({
      parent: this.container,
      top: 3, // Right below search box (no extra spacing)
      width: '100%',
      height: '100%-4', // Full height minus search box and status bar
      onSelect: (pokemon) => this.handlePokemonSelect(pokemon.name),
    });

    // Create status bar
    this.statusBar = blessed.box({
      parent: this.container,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1,
      tags: true,
      content: 'Loading Pokemon data...',
      style: {
        fg: 'white',
        bg: 'blue',
      },
    });

    this.setupHotkeys();
    this.initialize();
  }

  private setupHotkeys(): void {
    // Ctrl+S is now handled globally in index.ts
  }

  private async initialize(): Promise<void> {
    try {
      // Load Pokemon list
      const pokemonList = await pokemonService.loadPokemonList();

      // Index for search
      searchService.indexPokemon(pokemonList);

      // Populate list
      this.pokemonList.setData(pokemonList);

      // Update status
      this.updateStatus(`Loaded ${pokemonList.length} Pokemon. Press Ctrl+S to search.`);

      // Focus the list by default
      this.pokemonList.focus();
      this.screen.render();
    } catch (error) {
      this.updateStatus(`Error loading Pokemon: ${error}`);
      this.screen.render();
    }
  }

  private handleSearch(query: string): void {
    if (!query || query.trim() === '') {
      // Show all Pokemon
      this.pokemonList.filter([]);
      this.updateStatus(
        `Showing all ${this.pokemonList.total} Pokemon. Press Ctrl+S to search.`
      );
    } else {
      // Filter by search results
      const results = searchService.search(query, 50);
      const names = results.map(r => r.name);
      this.pokemonList.filter(names);
      this.updateStatus(
        `Found ${this.pokemonList.count} Pokemon matching "${query}"`
      );
    }
  }

  private async handlePokemonSelect(name: string): Promise<void> {
    this.searchBox.blur();
    this.showLoading(name);

    try {
      if (this.onPokemonSelectCallback) {
        await this.onPokemonSelectCallback(name);
      }
    } finally {
      this.hideLoading();
    }
  }

  private showLoading(pokemonName: string): void {
    // Hide the list
    this.pokemonList.hide();

    // Create centered loading box
    this.loadingBox = blessed.box({
      parent: this.container,
      top: 'center',
      left: 'center',
      width: 50,
      height: 5,
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'yellow',
        },
      },
    });

    const displayName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
    this.loadingBox.setContent(`{center}{bold}Loading ${displayName}...{/bold}{/center}`);

    this.updateStatus(`Loading ${pokemonName}...`);
    this.screen.render();
  }

  private hideLoading(): void {
    if (this.loadingBox) {
      this.loadingBox.destroy();
      this.loadingBox = undefined;
    }
    this.pokemonList.show();
    this.screen.render();
  }

  private updateStatus(message: string): void {
    this.statusBar.setContent(message);
  }

  show(): void {
    this.container.show();
    this.pokemonList.focus();
    this.screen.render();
  }

  hide(): void {
    this.container.hide();
    this.screen.render();
  }

  isVisible(): boolean {
    return !this.container.hidden;
  }

  focusSearch(): void {
    this.searchBox.focus();
    this.screen.render();
  }
}
