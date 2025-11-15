import type blessed from 'blessed';
import type { PokemonDisplay } from '../../../models/pokemon.js';

/**
 * Interface for Pokemon detail screen sections
 *
 * Each section is responsible for rendering a specific part of the Pokemon details
 * (sprite, stats, info, evolution, moves, abilities, etc.)
 *
 * This interface enables:
 * - Easy addition of new sections (just implement this interface)
 * - Reordering of sections
 * - Conditional section display
 * - Lazy loading of section data
 */
export interface IDetailSection {
  /**
   * Get the blessed widget for this section
   */
  getWidget(): blessed.Widgets.BoxElement;

  /**
   * Update the section with new Pokemon data
   */
  update(pokemon: PokemonDisplay): Promise<void> | void;

  /**
   * Clean up resources when section is destroyed
   */
  destroy(): void;

  /**
   * Get section name (for debugging/logging)
   */
  getName(): string;

  /**
   * Check if section is currently visible
   */
  isVisible(): boolean;

  /**
   * Show the section
   */
  show(): void;

  /**
   * Hide the section
   */
  hide(): void;
}

/**
 * Base class for detail sections with common functionality
 */
export abstract class BaseDetailSection implements IDetailSection {
  protected widget: blessed.Widgets.BoxElement;
  protected name: string;

  constructor(name: string, widget: blessed.Widgets.BoxElement) {
    this.name = name;
    this.widget = widget;
  }

  getWidget(): blessed.Widgets.BoxElement {
    return this.widget;
  }

  abstract update(pokemon: PokemonDisplay): Promise<void> | void;

  destroy(): void {
    if (this.widget) {
      this.widget.destroy();
    }
  }

  getName(): string {
    return this.name;
  }

  isVisible(): boolean {
    return !this.widget.hidden;
  }

  show(): void {
    this.widget.show();
  }

  hide(): void {
    this.widget.hide();
  }
}
