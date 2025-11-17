import type blessed from 'blessed';
import type { PokemonDisplay } from '../../../models/pokemon.js';
import type { LoadingPhase, LoadingStatus } from '../../types/loadingTypes.js';

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

  /**
   * Focus the section (optional, for interactive sections)
   */
  focus?(): void;
}

/**
 * Base class for detail sections with common functionality
 */
export abstract class BaseDetailSection implements IDetailSection {
  protected widget: blessed.Widgets.BoxElement;
  protected name: string;
  protected onStatusUpdate?: (phase: LoadingPhase, status: LoadingStatus) => void;

  constructor(name: string, widget: blessed.Widgets.BoxElement) {
    this.name = name;
    this.widget = widget;
  }

  /**
   * Set the status update callback for this section
   */
  setStatusCallback(callback: (phase: LoadingPhase, status: LoadingStatus) => void): void {
    this.onStatusUpdate = callback;
  }

  /**
   * Helper to wrap async work with automatic status reporting
   * Automatically sets phase to 'loading' before execution and 'complete' after
   *
   * @param phase - The loading phase to track
   * @param work - The async work to perform
   * @returns The result of the work function
   */
  protected async reportPhaseStatus<T>(
    phase: LoadingPhase,
    work: () => Promise<T>
  ): Promise<T> {
    this.onStatusUpdate?.(phase, 'loading');
    try {
      const result = await work();
      this.onStatusUpdate?.(phase, 'complete');
      return result;
    } catch (error) {
      // Still mark as complete even on error (section handles error display)
      this.onStatusUpdate?.(phase, 'complete');
      throw error;
    }
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
