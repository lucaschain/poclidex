import blessed from 'blessed';
import { getTypeColor, colors } from '../theme.js';
import { pokemonRepository } from '../../repositories/PokemonRepository.js';
import type { PokemonDisplay } from '../../models/pokemon.js';
import type { IDetailSection } from '../components/sections/IDetailSection.js';
import { SpriteSection } from '../components/sections/SpriteSection.js';
import { StatsSection } from '../components/sections/StatsSection.js';
import { OverviewSection } from '../components/sections/OverviewSection.js';
import { EvolutionSection } from '../components/sections/EvolutionSection.js';
import { MovesSection } from '../components/sections/MovesSection.js';
import { TabbedPanel } from '../components/TabbedPanel.js';

export interface DetailScreenOptions {
  parent: blessed.Widgets.Node;
  screen: blessed.Widgets.Screen;
  onBack?: () => void;
  onEvolutionSelect?: (pokemonName: string) => Promise<void>;
}

/**
 * Detail screen for displaying Pokemon information
 *
 * Refactored to use composable sections, making it easy to:
 * - Add new sections (moves, abilities, type chart, etc.)
 * - Reorder sections
 * - Toggle section visibility
 * - Lazy load section data
 */
export class DetailScreen {
  private container: blessed.Widgets.BoxElement;
  private screen: blessed.Widgets.Screen;
  private sections: IDetailSection[] = [];
  private tabbedPanel!: TabbedPanel;
  private evolutionSection!: EvolutionSection;
  private onBackCallback?: () => void;
  private onEvolutionSelectCallback?: (pokemonName: string) => Promise<void>;
  private currentPokemon?: PokemonDisplay;
  private loadingBox?: blessed.Widgets.BoxElement;

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
      style: {
        bg: 'transparent',
      },
    });

    // Initialize all sections
    this.initializeSections();

    // Setup keyboard shortcuts
    this.setupHotkeys();
  }

  /**
   * Initialize all detail sections with 2-column layout
   * Left: Pokemon sprite (50%)
   * Right: Tabbed panel with Overview/Stats/Evolution/Moves (50%)
   */
  private initializeSections(): void {
    // Header for Pokemon name and types (spans full width)
    const header = blessed.box({
      parent: this.container,
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      tags: true,
      style: {
        bg: colors.navyBlue,
      },
      border: {
        type: 'line',
      },
    });

    // Store header for later updates
    (this as any).header = header;

    // Left column container (50% width, below header)
    const leftColumn = blessed.box({
      parent: this.container,
      top: 3,
      left: 0,
      width: '50%',
      height: '100%-3',
      style: {
        bg: 'transparent',
      },
    });

    // Right column container (50% width, below header)
    const rightColumn = blessed.box({
      parent: this.container,
      top: 3,
      left: '50%',
      width: '50%',
      height: '100%-3',
      style: {
        bg: 'transparent',
      },
    });

    // Left column header (aligns with tab bar)
    blessed.box({
      parent: leftColumn,
      top: 0,
      left: 0,
      width: '100%',
      height: 1,
      tags: true,
      content: '{center}{bold}Picture{/bold}{/center}',
      style: {
        bg: colors.navyBlue,
      },
    });

    // Left column: Sprite
    const spriteSection = new SpriteSection(leftColumn);

    // Right column: Tabbed panel
    this.tabbedPanel = new TabbedPanel(rightColumn, this.screen, {
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    });

    // Create sections for tabs
    const overviewSection = new OverviewSection(rightColumn);
    const statsSection = new StatsSection(rightColumn);
    this.evolutionSection = new EvolutionSection(rightColumn);
    const movesSection = new MovesSection(rightColumn);

    // Add tabs (1-4 shortcuts)
    this.tabbedPanel.addTab(overviewSection, 'Overview', '1');
    this.tabbedPanel.addTab(statsSection, 'Stats', '2');
    this.tabbedPanel.addTab(this.evolutionSection, 'Evolution', '3');
    this.tabbedPanel.addTab(movesSection, 'Moves', '4');

    // Only track sprite section (tabs are managed by TabbedPanel)
    this.sections = [spriteSection];
  }

  /**
   * Setup keyboard shortcuts
   */
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

  /**
   * Display Pokemon details
   */
  async showPokemon(name: string): Promise<void> {
    this.showLoading(name);

    try {
      // Load Pokemon data
      const pokemon = await pokemonRepository.getPokemonDetails(name);
      this.currentPokemon = pokemon;

      // Update header with Pokemon name and types
      this.displayHeader(pokemon);

      // Update all sections with Pokemon data
      await this.updateAllSections(pokemon);

      this.show();
    } catch (error) {
      this.displayError(error as Error);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Update all sections with new Pokemon data
   */
  private async updateAllSections(pokemon: PokemonDisplay): Promise<void> {
    // Update sprite section and all tabs in parallel
    await Promise.all([
      ...this.sections.map(section => section.update(pokemon)),
      this.tabbedPanel.updateAll(pokemon),
    ]);
  }

  /**
   * Display header with Pokemon name and types
   */
  private displayHeader(pokemon: PokemonDisplay): void {
    const types = pokemon.types
      .map(t => `{${getTypeColor(t)}-fg}${t.toUpperCase()}{/}`)
      .join(' ');

    const name = `{${colors.pokemonYellow}-fg}{bold}${pokemon.displayName}{/bold}{/}`;
    const id = `{gray-fg}#${pokemon.id.toString().padStart(4, '0')}{/}`;
    const content = `{center}${name} ${id} ${types}{/center}`;

    const header = (this as any).header as blessed.Widgets.BoxElement;
    header.setContent(content);
  }

  /**
   * Navigate to evolution chain Pokemon
   */
  private async navigateToEvolution(): Promise<void> {
    const evolutionOptions = this.evolutionSection.getEvolutionOptions();

    if (!evolutionOptions || evolutionOptions.length === 0) {
      return;
    }

    // Filter out current Pokemon
    const options = evolutionOptions.filter(
      name => name !== this.currentPokemon?.name
    );

    if (options.length === 0) {
      return;
    }

    // If only one option, navigate directly
    if (options.length === 1 && this.onEvolutionSelectCallback) {
      await this.onEvolutionSelectCallback(options[0]);
      return;
    }

    // Multiple options - show selection menu
    this.showEvolutionMenu(options);
  }

  /**
   * Show evolution selection menu
   */
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

  /**
   * Display error message
   */
  private displayError(error: Error): void {
    // Show error in first section (sprite area)
    const errorContent = `{red-fg}Error loading Pokemon: ${error.message}{/}`;
    this.sections[0].getWidget().setContent(errorContent);
    this.show();
  }

  /**
   * Show loading indicator
   */
  private showLoading(pokemonName: string): void {
    // Create centered loading box overlay
    this.loadingBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 50,
      height: 5,
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'yellow',
        },
      },
    });

    const displayName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
    this.loadingBox.setContent(`{center}{bold}Loading ${displayName}...{/bold}{/center}`);
    this.screen.render();
  }

  /**
   * Hide loading indicator
   */
  private hideLoading(): void {
    if (this.loadingBox) {
      this.loadingBox.destroy();
      this.loadingBox = undefined;
      this.screen.render();
    }
  }

  /**
   * Show the detail screen
   */
  show(): void {
    this.container.show();
    this.screen.render();
  }

  /**
   * Hide the detail screen
   */
  hide(): void {
    this.container.hide();
    this.screen.render();
  }

  /**
   * Check if detail screen is visible
   */
  isVisible(): boolean {
    return !this.container.hidden;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.sections.forEach(section => section.destroy());
    this.tabbedPanel.destroy();
    this.container.destroy();
  }
}
