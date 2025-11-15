import blessed from 'blessed';
import { colors } from '../theme.js';
import type { IDetailSection } from './sections/IDetailSection.js';
import type { PokemonDisplay } from '../../models/pokemon.js';

export interface Tab {
  section: IDetailSection;
  label: string;
  shortcut: string; // '1', '2', '3', '4'
}

/**
 * Tabbed panel component for organizing multiple sections
 *
 * Displays tabs at the top and shows one section at a time.
 * Keyboard navigation: Tab/Shift+Tab, arrow keys, number keys (1-4)
 */
export class TabbedPanel {
  private container: blessed.Widgets.BoxElement;
  private tabBar: blessed.Widgets.BoxElement;
  private contentArea: blessed.Widgets.BoxElement;
  private tabs: Tab[] = [];
  private activeTabIndex: number = 0;
  private screen: blessed.Widgets.Screen;

  constructor(
    parent: blessed.Widgets.Node,
    screen: blessed.Widgets.Screen,
    options: {
      top?: number | string;
      left?: number | string;
      width?: number | string;
      height?: number | string;
    }
  ) {
    this.screen = screen;

    // Main container
    this.container = blessed.box({
      parent,
      top: options.top ?? 0,
      left: options.left ?? 0,
      width: options.width ?? '100%',
      height: options.height ?? '100%',
    });

    // Tab bar at the top
    this.tabBar = blessed.box({
      parent: this.container,
      top: 0,
      left: 0,
      width: '100%',
      height: 1,
      tags: true,
      style: {
        bg: colors.navyBlue,
      },
    });

    // Content area for active tab
    this.contentArea = blessed.box({
      parent: this.container,
      top: 1,
      left: 0,
      width: '100%',
      height: '100%-1',
      style: {
        bg: 'transparent',
      },
    });

    this.setupHotkeys();
  }

  /**
   * Add a tab
   */
  addTab(section: IDetailSection, label: string, shortcut: string): void {
    this.tabs.push({ section, label, shortcut });

    // Reparent section widget to content area
    const widget = section.getWidget();
    widget.detach();
    this.contentArea.append(widget);

    // Set to full size
    widget.top = 0;
    widget.left = 0;
    widget.width = '100%';
    widget.height = '100%';

    // Hide by default (show only active tab)
    if (this.tabs.length > 1) {
      widget.hide();
    }

    this.renderTabBar();
  }

  /**
   * Switch to a specific tab
   */
  switchTab(index: number): void {
    if (index < 0 || index >= this.tabs.length) {
      return;
    }

    // Hide current tab
    if (this.tabs[this.activeTabIndex]) {
      this.tabs[this.activeTabIndex].section.hide();
    }

    // Show new tab
    this.activeTabIndex = index;
    const activeSection = this.tabs[this.activeTabIndex].section;
    activeSection.show();

    // Focus the section if it supports focus
    if (activeSection.focus) {
      activeSection.focus();
    }

    this.renderTabBar();
    this.screen.render();
  }

  /**
   * Switch to next tab
   */
  nextTab(): void {
    const nextIndex = (this.activeTabIndex + 1) % this.tabs.length;
    this.switchTab(nextIndex);
  }

  /**
   * Switch to previous tab
   */
  previousTab(): void {
    const prevIndex = (this.activeTabIndex - 1 + this.tabs.length) % this.tabs.length;
    this.switchTab(prevIndex);
  }

  /**
   * Switch tab by shortcut key (1-4)
   */
  switchByShortcut(key: string): void {
    const tabIndex = this.tabs.findIndex(t => t.shortcut === key);
    if (tabIndex !== -1) {
      this.switchTab(tabIndex);
    }
  }

  /**
   * Update all tabs with new Pokemon data
   */
  async updateAll(pokemon: PokemonDisplay): Promise<void> {
    await Promise.all(
      this.tabs.map(tab => tab.section.update(pokemon))
    );
  }

  /**
   * Get active section
   */
  getActiveSection(): IDetailSection {
    return this.tabs[this.activeTabIndex].section;
  }

  /**
   * Get section by index
   */
  getSection(index: number): IDetailSection | undefined {
    return this.tabs[index]?.section;
  }

  /**
   * Render tab bar with indicators
   */
  private renderTabBar(): void {
    const tabItems = this.tabs.map((tab, index) => {
      const isActive = index === this.activeTabIndex;
      const prefix = isActive ? '●' : '○';
      const color = isActive ? colors.pokemonYellow : 'white';

      return `{${color}-fg}${tab.shortcut}.${prefix} ${tab.label}{/}`;
    });

    const content = ` ${tabItems.join('  ')}`;
    this.tabBar.setContent(content);
  }

  /**
   * Setup keyboard shortcuts for tab navigation
   */
  private setupHotkeys(): void {
    // Tab key - next tab
    this.screen.key(['tab'], () => {
      if (this.isVisible()) {
        this.nextTab();
      }
    });

    // Shift+Tab - previous tab
    this.screen.key(['S-tab'], () => {
      if (this.isVisible()) {
        this.previousTab();
      }
    });

    // Arrow keys
    this.screen.key(['right'], () => {
      if (this.isVisible()) {
        this.nextTab();
      }
    });

    this.screen.key(['left'], () => {
      if (this.isVisible()) {
        this.previousTab();
      }
    });

    // Number keys 1-4
    ['1', '2', '3', '4'].forEach(key => {
      this.screen.key([key], () => {
        if (this.isVisible()) {
          this.switchByShortcut(key);
        }
      });
    });
  }

  /**
   * Check if panel is visible
   */
  private isVisible(): boolean {
    return !this.container.hidden;
  }

  /**
   * Show the panel
   */
  show(): void {
    this.container.show();
  }

  /**
   * Hide the panel
   */
  hide(): void {
    this.container.hide();
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.tabs.forEach(tab => tab.section.destroy());
    this.container.destroy();
  }
}
