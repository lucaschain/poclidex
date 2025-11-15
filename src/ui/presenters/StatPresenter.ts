import { theme, colors } from '../theme.js';
import type { PokemonDisplay } from '../../models/pokemon.js';
import { pokemonRepository } from '../../repositories/PokemonRepository.js';

/**
 * Presenter for rendering Pokemon stats
 *
 * Extracted from detailScreen.ts to make stat rendering logic
 * reusable and testable. Can be used in comparison mode, mini cards, etc.
 */
export class StatPresenter {
  /**
   * Render complete stats section
   */
  renderStats(pokemon: PokemonDisplay): string[] {
    const stats = pokemon.stats;
    const evYield = pokemon.evYield;

    const lines: string[] = [];

    // Header
    lines.push(`{${colors.pokemonYellow}-fg}{bold}Base Stats{/bold}{/}`);
    lines.push('');

    // Stats with bars
    lines.push(...this.createStatBar('HP', stats.hp, evYield.hp));
    lines.push(...this.createStatBar('Attack', stats.attack, evYield.attack));
    lines.push(...this.createStatBar('Defense', stats.defense, evYield.defense));
    lines.push(...this.createStatBar('Sp. Atk', stats.specialAttack, evYield.specialAttack));
    lines.push(...this.createStatBar('Sp. Def', stats.specialDefense, evYield.specialDefense));
    lines.push(...this.createStatBar('Speed', stats.speed, evYield.speed));

    // Total
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    lines.push('');
    lines.push(`{bold}Total:{/bold} ${total}`);

    return lines;
  }

  /**
   * Render abilities section with descriptions
   */
  async renderAbilities(pokemon: PokemonDisplay): Promise<string[]> {
    const lines: string[] = [];

    lines.push('');
    lines.push(`{${colors.pokemonYellow}-fg}{bold}Abilities{/bold}{/}`);

    // Fetch ability details for all abilities
    for (const ability of pokemon.abilities) {
      const details = await pokemonRepository.getAbilityDetails(ability.name);
      details.isHidden = ability.isHidden;

      const hidden = details.isHidden ? ' {cyan-fg}(Hidden){/}' : '';
      lines.push(`• {bold}${details.displayName}${hidden}{/bold}`);

      // Add description or effect (prefer description, fallback to effect)
      const text = details.description || details.effect;
      if (text) {
        // Wrap text to fit within the section (approximately 40 chars per line)
        const wrapped = this.wrapText(text, 38);
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
  private createStatBar(name: string, value: number, ev: number): string[] {
    const barWidth = 20;
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
