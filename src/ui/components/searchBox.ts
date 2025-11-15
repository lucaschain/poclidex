import blessed from 'blessed';
import { theme } from '../theme.js';

export interface SearchBoxOptions {
  parent: blessed.Widgets.Node;
  top?: number | string;
  left?: number | string;
  width?: number | string;
  onSearch?: (query: string) => void;
  onEscape?: () => void;
}

export class SearchBox {
  private container: blessed.Widgets.BoxElement;
  private input: blessed.Widgets.TextboxElement;
  private onSearchCallback?: (query: string) => void;
  private onEscapeCallback?: () => void;

  constructor(options: SearchBoxOptions) {
    this.onSearchCallback = options.onSearch;
    this.onEscapeCallback = options.onEscape;

    // Container for search box
    this.container = blessed.box({
      parent: options.parent,
      top: options.top ?? 0,
      left: options.left ?? 0,
      width: options.width ?? '100%',
      height: 3,
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
      label: ' Filter Pokemon (Ctrl+S) ',
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

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle Escape key - return focus to list
    this.input.key(['escape'], () => {
      if (this.onEscapeCallback) {
        this.onEscapeCallback();
      }
    });

    // Handle Down arrow - return focus to list
    this.input.key(['down'], () => {
      if (this.onEscapeCallback) {
        this.onEscapeCallback();
      }
    });

    // Real-time filtering as user types
    this.input.on('keypress', () => {
      setImmediate(() => {
        const query = this.input.getValue();
        if (this.onSearchCallback) {
          this.onSearchCallback(query);
        }
      });
    });
  }

  focus(): void {
    this.input.focus();
  }

  blur(): void {
    this.input.cancel();
  }

  getValue(): string {
    return this.input.getValue();
  }

  clearValue(): void {
    this.input.clearValue();
  }
}
