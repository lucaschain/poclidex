import blessed from 'blessed';
import { theme } from '../theme.js';

export interface SearchBoxOptions {
  parent: blessed.Widgets.Node;
  screen: blessed.Widgets.Screen;
  top?: number | string;
  left?: number | string;
  width?: number | string;
  onSearch?: (query: string) => void;
  onNavigateDown?: () => void;
  onNavigateUp?: () => void;
  onSubmit?: () => void;
}

export class SearchBox {
  private container: blessed.Widgets.BoxElement;
  private input: blessed.Widgets.TextboxElement;
  private screen: blessed.Widgets.Screen;
  private onSearchCallback?: (query: string) => void;
  private onNavigateDownCallback?: () => void;
  private onNavigateUpCallback?: () => void;
  private onSubmitCallback?: () => void;

  constructor(options: SearchBoxOptions) {
    this.screen = options.screen;
    this.onSearchCallback = options.onSearch;
    this.onNavigateDownCallback = options.onNavigateDown;
    this.onNavigateUpCallback = options.onNavigateUp;
    this.onSubmitCallback = options.onSubmit;

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
      keys: false,
      mouse: true,
      inputOnFocus: false,
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
    // Manually handle all key input since keys: false and inputOnFocus: false
    this.input.on('keypress', (ch, key) => {
      // Only process keypresses if the input is visible and focused
      if (this.input.hidden || this.input.screen.focused !== this.input) {
        return;
      }

      // Navigation keys
      if (key.name === 'tab' && !key.shift) {
        if (this.onNavigateDownCallback) {
          this.onNavigateDownCallback();
          this.screen.render();
        }
        return;
      }

      if (key.name === 'tab' && key.shift) {
        if (this.onNavigateUpCallback) {
          this.onNavigateUpCallback();
          this.screen.render();
        }
        return;
      }

      if (key.name === 'down') {
        if (this.onNavigateDownCallback) {
          this.onNavigateDownCallback();
          this.screen.render();
        }
        return;
      }

      if (key.name === 'up') {
        if (this.onNavigateUpCallback) {
          this.onNavigateUpCallback();
          this.screen.render();
        }
        return;
      }

      if (key.name === 'enter') {
        if (this.onSubmitCallback) {
          this.onSubmitCallback();
        }
        return;
      }

      // Ctrl+W - clear search
      if (key.name === 'w' && key.ctrl) {
        this.input.setValue('');
        this.screen.render();
        this.triggerSearch();
        return;
      }

      // Backspace - delete last character
      if (key.name === 'backspace') {
        const current = this.input.getValue();
        this.input.setValue(current.slice(0, -1));
        this.screen.render();
        this.triggerSearch();
        return;
      }

      // Regular character input
      if (ch && !key.ctrl && !key.meta) {
        const current = this.input.getValue();
        this.input.setValue(current + ch);
        this.screen.render();
        this.triggerSearch();
        return;
      }
    });
  }

  private triggerSearch(): void {
    setImmediate(() => {
      const query = this.input.getValue();
      if (this.onSearchCallback) {
        this.onSearchCallback(query);
      }
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

  /**
   * Clear the search input and trigger search (shows all Pokemon)
   */
  clear(): void {
    this.input.setValue('');
    this.screen.render();
    this.triggerSearch();
  }
}
