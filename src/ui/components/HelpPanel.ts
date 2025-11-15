import blessed from 'blessed';
import { colors } from '../theme.js';

/**
 * Help panel overlay showing all keyboard shortcuts
 * Toggleable with Ctrl+H
 */
export class HelpPanel {
  private panel: blessed.Widgets.BoxElement;
  private screen: blessed.Widgets.Screen;

  constructor(screen: blessed.Widgets.Screen) {
    this.screen = screen;

    // Create centered overlay panel
    this.panel = blessed.box({
      parent: screen,
      top: 'center',
      left: 'center',
      width: 90,
      height: 30,
      tags: true,
      keys: true,
      vi: false,
      clickable: true,
      border: {
        type: 'line',
      },
      style: {
        fg: 'white',
        bg: colors.darkBg,
        border: {
          fg: colors.pokemonYellow,
        },
      },
      label: ` {bold}Keyboard Shortcuts{/bold} {gray-fg}(Press ? or Esc to close){/} `,
      padding: {
        left: 2,
        right: 2,
        top: 1,
        bottom: 1,
      },
      hidden: true, // Start hidden
    });

    // Build help content
    const content = this.buildHelpContent();
    this.panel.setContent(content);

    // Close on Escape, ?, or Ctrl+H
    this.panel.key(['escape', '?', 'C-h'], () => {
      this.hide();
    });
  }

  private buildHelpContent(): string {
    const lines: string[] = [];

    // Command formatter helper
    const cmd = (key: string, desc: string) => {
      const keyPart = `  {${colors.pokemonYellow}-fg}${key}{/}`;
      const dots = '.'.repeat(Math.max(1, 20 - key.length));
      return `${keyPart} {gray-fg}${dots}{/} ${desc}`;
    };

    // Header sections
    lines.push('{bold}{cyan-fg}GLOBAL SHORTCUTS{/}{/}');
    lines.push(cmd('Ctrl+S', 'Search / Return to search'));
    lines.push(cmd('?', 'Toggle this help panel'));
    lines.push(cmd('Ctrl+C', 'Quit application'));
    lines.push(cmd('F1 - F9', 'Set generation filter (F1=Gen1, F9=Gen9)'));
    lines.push('');

    lines.push('{bold}{cyan-fg}HOME SCREEN{/}{/}');
    lines.push(cmd('Arrow Keys', 'Navigate Pokemon list'));
    lines.push(cmd('Enter', 'Select Pokemon and view details'));
    lines.push(cmd('Ctrl+W', 'Clear search input'));
    lines.push('');

    lines.push('{bold}{cyan-fg}DETAIL SCREEN - NAVIGATION{/}{/}');
    lines.push(cmd('Tab / Shift+Tab', 'Next / Previous tab'));
    lines.push(cmd('← / →', 'Previous / Next tab'));
    lines.push(cmd('1 / 2 / 3', 'Jump to Overview / Stats / Moves'));
    lines.push(cmd('E', 'Navigate to evolution Pokemon'));
    lines.push(cmd('Esc / B', 'Back to Pokemon list'));
    lines.push('');

    lines.push('{bold}{cyan-fg}DETAIL SCREEN - IMAGE SETTINGS{/}{/}');
    lines.push(cmd('C', 'Cycle color space (RGB / DIN99d)'));
    lines.push(cmd('P', 'Cycle palette (Full / 256 / 16 / 8)'));
    lines.push(cmd('D', 'Cycle dither mode (Ordered / Diffusion / None)'));
    lines.push(cmd('S', 'Cycle symbol set (Block / Braille / ASCII / etc)'));
    lines.push('');

    lines.push('{bold}{cyan-fg}MOVES TAB{/}{/}');
    lines.push(cmd('↑ ↓ / j / k', 'Navigate moves'));

    return lines.join('\n');
  }

  /**
   * Show the help panel
   */
  show(): void {
    this.panel.show();
    this.panel.focus();
    this.screen.render();
  }

  /**
   * Hide the help panel
   */
  hide(): void {
    this.panel.hide();
    this.screen.render();
  }

  /**
   * Toggle visibility
   */
  toggle(): void {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if panel is visible
   */
  isVisible(): boolean {
    return !this.panel.hidden;
  }
}
