import blessed from 'blessed';
import { theme, getTypeColor, colors } from '../theme.js';
import { pokemonService } from '../../services/pokemonService.js';
import { imageService } from '../../services/imageService.js';
import type { PokemonDisplay } from '../../models/pokemon.js';
import { formatHeight, formatWeight } from '../../models/pokemon.js';

export interface DetailScreenOptions {
  parent: blessed.Widgets.Node;
  screen: blessed.Widgets.Screen;
  onBack?: () => void;
  onEvolutionSelect?: (pokemonName: string) => Promise<void>;
}

export class DetailScreen {
  private container: blessed.Widgets.BoxElement;
  private screen: blessed.Widgets.Screen;
  private spriteBox: blessed.Widgets.BoxElement;
  private statsBox: blessed.Widgets.BoxElement;
  private infoBox: blessed.Widgets.BoxElement;
  private evolutionBox: blessed.Widgets.BoxElement;
  private onBackCallback?: () => void;
  private onEvolutionSelectCallback?: (pokemonName: string) => Promise<void>;
  private currentPokemon?: PokemonDisplay;
  private evolutionOptions: string[] = [];

  constructor(options: DetailScreenOptions) {
    this.screen = options.screen;
    this.onBackCallback = options.onBack;
    this.onEvolutionSelectCallback = options.onEvolutionSelect;

    // Create main container
    this.container = blessed.box({
      parent: options.parent,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      hidden: true,
      tags: true,
    });

    // Create sprite box (left column)
    this.spriteBox = blessed.box({
      parent: this.container,
      top: 0,
      left: 0,
      width: '33%',
      height: '70%',
      tags: false,
      label: ' Sprite ',
      align: 'center',
      valign: 'middle',
      style: {
        border: theme.detailBox.border,
      },
      border: {
        type: 'line',
      },
    });

    // Create stats box (middle column)
    this.statsBox = blessed.box({
      parent: this.container,
      top: 0,
      left: '33%',
      width: '34%',
      height: '70%',
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      label: ' Stats & Abilities ',
      style: {
        border: theme.detailBox.border,
      },
      border: {
        type: 'line',
      },
    });

    // Create info box (right column)
    this.infoBox = blessed.box({
      parent: this.container,
      top: 0,
      left: '67%',
      width: '33%',
      height: '70%',
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      label: ' Info ',
      style: {
        border: theme.detailBox.border,
      },
      border: {
        type: 'line',
      },
    });

    // Create evolution box (bottom, full width)
    this.evolutionBox = blessed.box({
      parent: this.container,
      top: '70%',
      left: 0,
      width: '100%',
      height: '30%',
      tags: true,
      label: ' Evolution Chain (E to navigate) ',
      style: {
        border: theme.detailBox.border,
      },
      border: {
        type: 'line',
      },
    });

    this.setupHotkeys();
  }

  private setupHotkeys(): void {
    this.screen.key(['escape', 'b'], () => {
      if (this.isVisible() && this.onBackCallback) {
        this.onBackCallback();
      }
    });

    this.screen.key(['e'], () => {
      if (this.isVisible()) {
        this.navigateToEvolution();
      }
    });
  }

  private async navigateToEvolution(): Promise<void> {
    if (!this.evolutionOptions || this.evolutionOptions.length === 0) {
      return;
    }

    // Filter out current Pokemon and get unique evolution options
    const options = this.evolutionOptions.filter(
      name => name !== this.currentPokemon?.name
    );

    if (options.length === 0) {
      return;
    }

    // If only one option, navigate directly
    if (options.length === 1) {
      if (this.onEvolutionSelectCallback) {
        await this.onEvolutionSelectCallback(options[0]);
      }
      return;
    }

    // Multiple options - show selection menu
    this.showEvolutionMenu(options);
  }

  private showEvolutionMenu(options: string[]): void {
    const menu = blessed.list({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 40,
      height: options.length + 4,
      keys: true,
      vi: true,
      mouse: true,
      tags: true,
      label: ' Select Evolution ',
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: colors.pokemonYellow,
        },
        selected: {
          bg: colors.pokemonYellow,
          fg: 'black',
        },
      },
    });

    menu.setItems(options.map(name => name.charAt(0).toUpperCase() + name.slice(1)));

    menu.on('select', async (item) => {
      const selectedName = item.getText().toLowerCase();
      menu.detach();
      this.screen.render();

      if (this.onEvolutionSelectCallback) {
        await this.onEvolutionSelectCallback(selectedName);
      }
    });

    menu.key(['escape'], () => {
      menu.detach();
      this.screen.render();
    });

    menu.focus();
    this.screen.render();
  }

  async showPokemon(name: string): Promise<void> {
    try {
      // Load Pokemon data
      const pokemon = await pokemonService.getPokemonDetails(name);
      this.currentPokemon = pokemon;

      // Display all sections
      this.displayHeader(pokemon);
      this.displaySprite(pokemon);
      this.displayStats(pokemon);
      this.displayInfo(pokemon);
      await this.displayEvolution(pokemon);

      this.show();
    } catch (error) {
      this.displayError(error as Error);
    }
  }

  private displayHeader(pokemon: PokemonDisplay): void {
    const types = pokemon.types
      .map(t => `{${getTypeColor(t)}-fg}${t.toUpperCase()}{/}`)
      .join(' ');

    const title = `${pokemon.displayName} #${pokemon.id.toString().padStart(4, '0')} ${types}`;
    this.container.setLabel(` ${title} `);
  }

  private async displaySprite(pokemon: PokemonDisplay): Promise<void> {
    // Show loading message
    this.spriteBox.setContent('Loading sprite...');
    this.screen.render();

    try {
      const spriteUrl = pokemon.artworkSprite || pokemon.sprite;
      if (spriteUrl) {
        const ascii = await imageService.urlToAscii(spriteUrl, 45, 25);
        this.spriteBox.setContent(ascii);
      } else {
        this.spriteBox.setContent('No sprite available');
      }
    } catch (error) {
      this.spriteBox.setContent('Failed to load sprite');
    }

    this.screen.render();
  }

  private displayStats(pokemon: PokemonDisplay): void {
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

    // Abilities
    lines.push('');
    lines.push(`{${colors.pokemonYellow}-fg}{bold}Abilities{/bold}{/}`);
    pokemon.abilities.forEach(ability => {
      const hidden = ability.isHidden ? ' {cyan-fg}(Hidden){/}' : '';
      lines.push(`• ${ability.name}${hidden}`);
    });

    this.statsBox.setContent(lines.join('\n'));
  }

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

  private displayInfo(pokemon: PokemonDisplay): void {
    const lines: string[] = [];

    // Physical info
    lines.push(`{${colors.pokemonYellow}-fg}{bold}Physical{/bold}{/}`);
    lines.push(`Height: ${formatHeight(pokemon.height)}`);
    lines.push(`Weight: ${formatWeight(pokemon.weight)}`);
    lines.push('');

    // Types
    lines.push(`{${colors.pokemonYellow}-fg}{bold}Type{/bold}{/}`);
    pokemon.types.forEach(type => {
      lines.push(`{${getTypeColor(type)}-fg}${type.toUpperCase()}{/}`);
    });
    lines.push('');

    // Special status
    if (pokemon.isLegendary || pokemon.isMythical) {
      lines.push(`{${colors.pokemonYellow}-fg}{bold}Status{/bold}{/}`);
      if (pokemon.isLegendary) {
        lines.push('{red-fg}★ Legendary{/}');
      }
      if (pokemon.isMythical) {
        lines.push('{magenta-fg}✦ Mythical{/}');
      }
      lines.push('');
    }

    // Genus
    if (pokemon.genus) {
      lines.push(`{${colors.pokemonYellow}-fg}{bold}Species{/bold}{/}`);
      lines.push(pokemon.genus);
      lines.push('');
    }

    // Flavor text
    if (pokemon.flavorText) {
      lines.push(`{${colors.pokemonYellow}-fg}{bold}Pokedex Entry{/bold}{/}`);
      lines.push(pokemon.flavorText);
    }

    this.infoBox.setContent(lines.join('\n'));
  }

  private async displayEvolution(pokemon: PokemonDisplay): Promise<void> {
    try {
      const chain = await pokemonService.getEvolutionChain(pokemon);
      const stages = pokemonService.parseEvolutionChain(chain);

      // Store all Pokemon in the evolution chain as options
      this.evolutionOptions = stages.flat();

      const lines: string[] = [];

      stages.forEach((stage, index) => {
        if (index > 0) {
          lines.push('     ↓');
        }

        const pokemonNames = stage.map(name => {
          const isCurrent = name === pokemon.name;
          const displayName = name.charAt(0).toUpperCase() + name.slice(1);
          return isCurrent
            ? `{${colors.pokemonYellow}-fg}{bold}[${displayName}]{/bold}{/}`
            : displayName;
        }).join(' / ');

        lines.push(pokemonNames);
      });

      this.evolutionBox.setContent(lines.join('\n'));
    } catch (error) {
      this.evolutionBox.setContent('No evolution data available');
      this.evolutionOptions = [];
    }

    this.screen.render();
  }

  private displayError(error: Error): void {
    this.statsBox.setContent(`{red-fg}Error: ${error.message}{/}`);
    this.show();
  }

  show(): void {
    this.container.show();
    this.screen.render();
  }

  hide(): void {
    this.container.hide();
    this.screen.render();
  }

  isVisible(): boolean {
    return !this.container.hidden;
  }
}
