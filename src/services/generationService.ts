/**
 * Service for managing the session-level generation setting.
 *
 * This singleton stores which generation the user wants to view Pokemon data from.
 * All Pokemon information (types, abilities, moves, stats) is filtered based on
 * this generation setting.
 */
export class GenerationService {
  private sessionGeneration: number;

  constructor() {
    // Default to latest generation (Gen 9: Scarlet/Violet)
    this.sessionGeneration = 9;
  }

  /**
   * Get the current session generation setting.
   *
   * @returns Generation number (1-9)
   */
  getSessionGeneration(): number {
    return this.sessionGeneration;
  }

  /**
   * Set the session generation.
   *
   * @param generation - Generation number (1-9)
   * @throws Error if generation is out of range
   */
  setSessionGeneration(generation: number): void {
    if (generation < 1 || generation > 9) {
      throw new Error(`Invalid generation: ${generation}. Must be between 1 and 9.`);
    }
    this.sessionGeneration = generation;
  }

  /**
   * Get the effective generation for displaying a Pokemon.
   *
   * The effective generation is the maximum of:
   * - The session generation (what the user selected)
   * - The Pokemon's release generation (when it was introduced)
   *
   * This ensures we never show a Pokemon in a generation before it existed.
   *
   * @param pokemonGeneration - The generation when the Pokemon was introduced
   * @returns The effective generation to use for filtering
   */
  getEffectiveGeneration(pokemonGeneration: number): number {
    return Math.max(this.sessionGeneration, pokemonGeneration);
  }
}

// Export singleton instance
export const generationService = new GenerationService();
