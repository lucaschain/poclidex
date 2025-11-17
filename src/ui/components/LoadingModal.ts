import blessed from 'blessed';
import type { LoadingPhase, LoadingStatus, LoadingPhaseInfo } from '../types/loadingTypes.js';

/**
 * Reusable loading modal component that displays progress across multiple phases
 *
 * Features:
 * - Animated spinner for in-progress phases
 * - Customizable phase list
 * - Centered modal with Pokemon name in title
 * - Clean lifecycle management (show/hide/destroy)
 */
export class LoadingModal {
  private loadingBox?: blessed.Widgets.BoxElement;
  private screen: blessed.Widgets.Screen;
  private phases: LoadingPhaseInfo[];
  private pokemonName: string;
  private spinnerInterval?: NodeJS.Timeout;
  private spinnerFrame = 0;
  private readonly spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  constructor(screen: blessed.Widgets.Screen, pokemonName: string, phases: LoadingPhaseInfo[]) {
    this.screen = screen;
    this.pokemonName = pokemonName;
    this.phases = phases;
  }

  /**
   * Show the loading modal
   */
  show(): void {
    // Destroy existing modal if present
    this.hide();

    const displayName = this.pokemonName.charAt(0).toUpperCase() + this.pokemonName.slice(1);

    // Create centered loading box overlay
    this.loadingBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 28,
      height: 9, // 5 phases + padding
      tags: true,
      label: ` Loading ${displayName} `,
      padding: {
        top: 1,
        left: 2,
        right: 2,
        bottom: 1,
      },
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'yellow',
        },
      },
    });

    // Start spinner animation (updates every 80ms)
    this.spinnerFrame = 0;
    this.spinnerInterval = setInterval(() => {
      this.spinnerFrame = (this.spinnerFrame + 1) % this.spinnerFrames.length;
      this.render();
    }, 80);

    // Initial render
    this.render();
  }

  /**
   * Update the status of a specific phase
   */
  updatePhase(phase: LoadingPhase, status: LoadingStatus): void {
    const phaseInfo = this.phases.find(p => p.phase === phase);
    if (phaseInfo) {
      phaseInfo.status = status;
      this.render();
    }
  }

  /**
   * Hide and destroy the loading modal
   */
  hide(): void {
    // Stop spinner animation
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = undefined;
    }

    // Destroy loading box
    if (this.loadingBox) {
      this.loadingBox.destroy();
      this.loadingBox = undefined;
      this.screen.render();
    }
  }

  /**
   * Clean up resources (alias for hide)
   */
  destroy(): void {
    this.hide();
  }

  /**
   * Render the loading modal with current phase statuses
   */
  private render(): void {
    if (!this.loadingBox) return;

    const getStatusSymbol = (status: LoadingStatus): string => {
      switch (status) {
        case 'pending': return '{gray-fg}○{/}';
        case 'loading': return `{yellow-fg}${this.spinnerFrames[this.spinnerFrame]}{/}`;
        case 'complete': return '{green-fg}✓{/}';
      }
    };

    // Build left-aligned content with all phases
    const lines: string[] = [];

    for (const phaseInfo of this.phases) {
      const symbol = getStatusSymbol(phaseInfo.status);
      lines.push(`${symbol} ${phaseInfo.label}`);
    }

    this.loadingBox.setContent(lines.join('\n'));
    this.screen.render();
  }

  /**
   * Check if the modal is currently visible
   */
  isVisible(): boolean {
    return this.loadingBox !== undefined;
  }
}
