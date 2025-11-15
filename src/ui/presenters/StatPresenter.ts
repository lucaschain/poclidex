import type blessed from 'blessed';
import { theme, colors } from '../theme.js';
import type { PokemonDisplay } from '../../models/pokemon.js';
import { pokemonRepository } from '../../repositories/PokemonRepository.js';
import { generationService } from '../../services/generationService.js';

/**
 * Presenter for rendering Pokemon stats
 *
 * Extracted from detailScreen.ts to make stat rendering logic
 * reusable and testable. Can be used in comparison mode, mini cards, etc.
 */
export class StatPresenter {
  /**
   * Calculate available width for content from a blessed widget
   * Accounts for borders and padding
   */
  private calculateAvailableWidth(widget?: blessed.Widgets.BoxElement): number {
    if (!widget) {
      // Fallback to original hardcoded values if no widget provided
      return 46;
    }

    // Get the actual width of the widget
    // @ts-ignore - blessed types don't fully expose width property
    const totalWidth = widget.width as number;

    if (typeof totalWidth !== 'number') {
      return 46; // Fallback if width isn't available yet
    }

    // Subtract borders (2 chars: left + right)
    // Subtract padding (4 chars: left: 2, right: 2)
    const availableWidth = totalWidth - 6;

    // Ensure we have a reasonable minimum width
    return Math.max(availableWidth, 30);
  }
  /**
   * Render complete stats section
   */
  renderStats(pokemon: PokemonDisplay, widget?: blessed.Widgets.BoxElement): string[] {
    const stats = pokemon.stats;
    const evYield = pokemon.evYield;

    const lines: string[] = [];

    // Header
    lines.push(`{${colors.pokemonYellow}-fg}{bold}Base Stats{/bold}{/}`);
    lines.push('');

    // Calculate available width for dynamic bar sizing
    const availableWidth = this.calculateAvailableWidth(widget);

    // Stats with bars
    lines.push(...this.createStatBar('HP', stats.hp, evYield.hp, availableWidth));
    lines.push(...this.createStatBar('Attack', stats.attack, evYield.attack, availableWidth));
    lines.push(...this.createStatBar('Defense', stats.defense, evYield.defense, availableWidth));
    lines.push(...this.createStatBar('Sp. Atk', stats.specialAttack, evYield.specialAttack, availableWidth));
    lines.push(...this.createStatBar('Sp. Def', stats.specialDefense, evYield.specialDefense, availableWidth));
    lines.push(...this.createStatBar('Speed', stats.speed, evYield.speed, availableWidth));

    // Total
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    lines.push('');
    lines.push(`{bold}Total:{/bold} ${total}`);

    return lines;
  }

  /**
   * Render abilities section with descriptions, filtered by generation
   */
  async renderAbilities(pokemon: PokemonDisplay, widget?: blessed.Widgets.BoxElement): Promise<string[]> {
    const lines: string[] = [];

    lines.push('');
    lines.push(`{${colors.pokemonYellow}-fg}{bold}Abilities{/bold}{/}`);

    // Get effective generation for filtering
    const sessionGeneration = generationService.getSessionGeneration();
    const effectiveGeneration = Math.max(sessionGeneration, pokemon.generation);

    // Calculate available width for dynamic text wrapping
    const availableWidth = this.calculateAvailableWidth(widget);

    // Fetch ability details for all abilities
    for (const ability of pokemon.abilities) {
      const details = await pokemonRepository.getAbilityDetails(ability.name);
      details.isHidden = ability.isHidden;

      // Filter out abilities introduced after the effective generation
      if (details.generation > effectiveGeneration) {
        continue; // Skip this ability
      }

      const hidden = details.isHidden ? ' {cyan-fg}(Hidden){/}' : '';
      lines.push(`• {bold}${details.displayName}${hidden}{/bold}`);

      // Add description or effect (prefer description, fallback to effect)
      const text = details.description || details.effect;
      if (text) {
        // Wrap text to fit within the section with padding
        // Subtract 2 for the bullet indent "  "
        const wrapped = this.wrapText(text, availableWidth - 2);
        wrapped.forEach(line => {
          lines.push(`  {gray-fg}${line}{/}`);
        });
      }
      lines.push(''); // Spacing between abilities
    }

    return lines;
  }

  /**
   * Wrap text to a specified width
   */
  private wrapText(text: string, width: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  /**
   * Create a single stat bar with EV yield
   */
  private createStatBar(name: string, value: number, ev: number, availableWidth: number): string[] {
    // Calculate dynamic bar width based on available space
    // Format: "{bold}NAME      {/} VALUE █████░░░░░ +EV"
    // - Name: 10 chars (padded)
    // - Space: 1 char
    // - Value: 3 chars (padded)
    // - Space: 1 char
    // - Bar: variable
    // - Reserved EV space: 8 chars (fixed for all bars, ensures alignment)

    const nameWidth = 10;
    const valueWidth = 3;
    const spacingWidth = 2; // spaces around value
    const evReservedSpace = 8; // Fixed space reserved for EV text (e.g., " +3 EV" = 6 chars + margin)

    // All bars use the same width calculation regardless of individual EV values
    // This ensures all bars end at the same point and EV text aligns vertically
    const barWidth = Math.max(
      availableWidth - nameWidth - valueWidth - spacingWidth - evReservedSpace,
      10 // Minimum bar width
    );

    const maxStat = 255;
    const filled = Math.floor((value / maxStat) * barWidth);
    const empty = barWidth - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const evText = ev > 0 ? ` {${theme.evYield.fg}-fg}+${ev} EV{/}` : '';

    return [
      `{bold}${name.padEnd(10)}{/bold} ${value.toString().padStart(3)} ${bar}${evText}`,
    ];
  }

  /**
   * Calculate total base stats
   */
  calculateTotal(pokemon: PokemonDisplay): number {
    const stats = pokemon.stats;
    return Object.values(stats).reduce((sum, val) => sum + val, 0);
  }

  /**
   * Get stat color based on value (for future use)
   */
  getStatColor(value: number): string {
    if (value >= 150) return 'red';      // Excellent
    if (value >= 100) return 'yellow';   // Good
    if (value >= 70) return 'green';     // Average
    return 'white';                       // Low
  }
}
