import blessed from 'blessed';
import { theme } from '../theme.js';
import type { PokemonListItem } from '../../api/types.js';
import { capitalizeName } from '../../models/pokemon.js';

export interface PokemonListOptions {
  parent: blessed.Widgets.Node;
  top?: number | string;
  left?: number | string;
  width?: number | string;
  height?: number | string;
  onSelect?: (pokemon: PokemonListItem) => void;
}

export class PokemonList {
  private list: blessed.Widgets.ListElement;
  private pokemonData: PokemonListItem[] = [];
  private filteredData: PokemonListItem[] = [];
  private onSelectCallback?: (pokemon: PokemonListItem) => void;

  constructor(options: PokemonListOptions) {
    this.onSelectCallback = options.onSelect;

    this.list = blessed.list({
      parent: options.parent,
      top: options.top ?? 0,
      left: options.left ?? 0,
      width: options.width ?? '100%',
      height: options.height ?? '100%',
      keys: true,
      mouse: true,
      vi: true,
      tags: true,
      scrollbar: {
        ch: ' ',
        style: {
          bg: 'yellow',
        },
      },
      style: {
        fg: theme.list.fg,
        border: theme.list.border,
        selected: theme.list.selected,
      },
      border: {
        type: 'line',
      },
      label: ' Pokemon List ',
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.list.on('select', () => {
      const index = (this.list as any).selected;
      if (this.onSelectCallback && this.filteredData[index]) {
        this.onSelectCallback(this.filteredData[index]);
      }
    });

    // Add vim-style navigation
    this.list.key(['j'], () => {
      this.list.down(1);
      this.list.screen.render();
    });

    this.list.key(['k'], () => {
      this.list.up(1);
      this.list.screen.render();
    });

    this.list.key(['g'], () => {
      this.list.select(0);
      this.list.screen.render();
    });

    this.list.key(['G'], () => {
      this.list.select(this.filteredData.length - 1);
      this.list.screen.render();
    });
  }

  /**
   * Load Pokemon list data
   */
  setData(pokemonList: PokemonListItem[]): void {
    this.pokemonData = pokemonList;
    this.filteredData = pokemonList;
    this.renderList();
  }

  /**
   * Filter the list by search query
   */
  filter(pokemonNames: string[]): void {
    if (pokemonNames.length === 0) {
      this.filteredData = this.pokemonData;
    } else {
      const nameSet = new Set(pokemonNames.map(n => n.toLowerCase()));
      this.filteredData = this.pokemonData.filter(p =>
        nameSet.has(p.name.toLowerCase())
      );
    }
    this.renderList();
  }

  /**
   * Render the list with formatted items
   */
  private renderList(): void {
    const items = this.filteredData.map((pokemon) => {
      const id = this.extractId(pokemon.url);
      const displayName = capitalizeName(pokemon.name);
      return `{bold}#${id.toString().padStart(4, '0')}{/bold} ${displayName}`;
    });

    this.list.setItems(items);
    this.list.select(0);
    this.list.screen.render();
  }

  /**
   * Extract Pokemon ID from URL
   */
  private extractId(url: string): number {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
  }

  /**
   * Get currently selected Pokemon
   */
  getSelected(): PokemonListItem | undefined {
    const index = (this.list as any).selected;
    return this.filteredData[index];
  }

  /**
   * Select a specific Pokemon by name
   */
  selectByName(name: string): void {
    const index = this.filteredData.findIndex(
      p => p.name.toLowerCase() === name.toLowerCase()
    );

    if (index !== -1) {
      this.list.select(index);
      this.list.screen.render();
    }
  }

  /**
   * Focus the list
   */
  focus(): void {
    this.list.focus();
  }

  /**
   * Get the total count
   */
  get count(): number {
    return this.filteredData.length;
  }

  /**
   * Get total Pokemon loaded
   */
  get total(): number {
    return this.pokemonData.length;
  }
}
