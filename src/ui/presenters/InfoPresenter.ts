import { colors, getTypeColor } from '../theme.js';
import type { PokemonDisplay } from '../../models/pokemon.js';
import { formatHeight, formatWeight } from '../../models/pokemon.js';

/**
 * Presenter for rendering Pokemon information
 *
 * Handles physical info, types, special status, and Pokedex entries
 */
export class InfoPresenter {
  /**
   * Render complete info section
   */
  renderInfo(pokemon: PokemonDisplay): string[] {
    const lines: string[] = [];

    // Physical info
    lines.push(...this.renderPhysical(pokemon));
    lines.push('');

    // Types
    lines.push(...this.renderTypes(pokemon));
    lines.push('');

    // Special status (Legendary/Mythical)
    if (pokemon.isLegendary || pokemon.isMythical) {
      lines.push(...this.renderStatus(pokemon));
      lines.push('');
    }

    // Genus
    if (pokemon.genus) {
      lines.push(...this.renderGenus(pokemon));
      lines.push('');
    }

    // Flavor text
    if (pokemon.flavorText) {
      lines.push(...this.renderFlavorText(pokemon));
    }

    return lines;
  }

  /**
   * Render physical information
   */
  private renderPhysical(pokemon: PokemonDisplay): string[] {
    return [
      `{${colors.pokemonYellow}-fg}{bold}Physical{/bold}{/}`,
      `Height: ${formatHeight(pokemon.height)}`,
      `Weight: ${formatWeight(pokemon.weight)}`,
    ];
  }

  /**
   * Render types
   */
  private renderTypes(pokemon: PokemonDisplay): string[] {
    const lines = [`{${colors.pokemonYellow}-fg}{bold}Type{/bold}{/}`];

    pokemon.types.forEach(type => {
      lines.push(`{${getTypeColor(type)}-fg}${type.toUpperCase()}{/}`);
    });

    return lines;
  }

  /**
   * Render special status (Legendary/Mythical)
   */
  private renderStatus(pokemon: PokemonDisplay): string[] {
    const lines = [`{${colors.pokemonYellow}-fg}{bold}Status{/bold}{/}`];

    if (pokemon.isLegendary) {
      lines.push('{red-fg}★ Legendary{/}');
    }
    if (pokemon.isMythical) {
      lines.push('{magenta-fg}✦ Mythical{/}');
    }

    return lines;
  }

  /**
   * Render genus (species classification)
   */
  private renderGenus(pokemon: PokemonDisplay): string[] {
    return [
      `{${colors.pokemonYellow}-fg}{bold}Species{/bold}{/}`,
      pokemon.genus,
    ];
  }

  /**
   * Render Pokedex entry flavor text
   */
  private renderFlavorText(pokemon: PokemonDisplay): string[] {
    return [
      `{${colors.pokemonYellow}-fg}{bold}Pokedex Entry{/bold}{/}`,
      pokemon.flavorText,
    ];
  }

  /**
   * Get a summary line (for list views)
   */
  renderSummary(pokemon: PokemonDisplay): string {
    const types = pokemon.types.map(t => t.toUpperCase()).join('/');
    const total = Object.values(pokemon.stats).reduce((sum, val) => sum + val, 0);
    return `${types} | BST: ${total} | ${formatHeight(pokemon.height)} | ${formatWeight(pokemon.weight)}`;
  }
}
