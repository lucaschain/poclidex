import { getTypeColor } from '../theme.js';
import type { MoveData } from '../../repositories/IPokemonRepository.js';

/**
 * Presenter for formatting move data for display
 */
export class MovesPresenter {
  /**
   * Format moves into table rows for listtable
   * Returns: [header, ...dataRows]
   */
  formatMovesTable(moves: MoveData[]): string[][] {
    const rows: string[][] = [];

    // Header row
    rows.push(['Name', 'Type', 'Pwr', 'Acc', 'PP', 'Method']);

    // Data rows
    for (const move of moves) {
      const name = this.formatMoveName(move.name);
      const type = this.formatType(move.type);
      const power = move.power !== null ? move.power.toString() : '--';
      const accuracy = move.accuracy !== null ? move.accuracy.toString() : '--';
      const pp = move.pp.toString();
      const method = this.formatLearnMethod(move.learnMethod, move.levelLearned);

      rows.push([name, type, power, accuracy, pp, method]);
    }

    return rows;
  }

  /**
   * Format move name (capitalize and replace hyphens)
   */
  private formatMoveName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format type with color tag
   */
  private formatType(type: string): string {
    const color = getTypeColor(type);
    const displayType = type.charAt(0).toUpperCase() + type.slice(1);
    return `{${color}-fg}${displayType}{/}`;
  }

  /**
   * Format learn method
   */
  private formatLearnMethod(method: string, level?: number): string {
    switch (method) {
      case 'level-up':
        return level ? `Lv.${level}` : 'Lv.--';
      case 'machine':
        return 'TM';
      case 'egg':
        return 'Egg';
      case 'tutor':
        return 'Tutor';
      default:
        return method;
    }
  }

  /**
   * Get description for a move
   */
  getDescription(move: MoveData): string {
    return move.description || 'No description available.';
  }
}
