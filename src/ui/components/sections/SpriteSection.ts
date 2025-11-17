import blessed from 'blessed';
import { theme, colors } from '../../theme.js';
import { imageService } from '../../../services/imageService.js';
import type { PokemonDisplay } from '../../../models/pokemon.js';
import { BaseDetailSection } from './IDetailSection.js';

/**
 * Section for displaying Pokemon sprite using Chafa
 */
export class SpriteSection extends BaseDetailSection {
  constructor(parent: blessed.Widgets.Node) {
    const widget = blessed.box({
      parent,
      top: 1,
      left: 0,
      width: '100%',
      height: '100%-1',
      tags: false,
      label: ' Sprite ',
      align: 'center',
      valign: 'middle',
      style: {
        bg: colors.lightScreenBlue,
        border: theme.detailBox.border,
      },
      border: {
        type: 'line',
      },
    });

    super('sprite', widget);
  }

  async update(pokemon: PokemonDisplay): Promise<void> {
    // Show loading message
    this.widget.setContent('Loading sprite...');
    this.widget.screen.render();

    // Use helper to automatically report loading status
    await this.reportPhaseStatus('sprite', async () => {
      const spriteUrl = pokemon.artworkSprite || pokemon.sprite;
      if (spriteUrl) {
        // Calculate responsive dimensions based on available space
        // Account for borders (2 chars width, 2 lines height)
        const availableWidth = (this.widget.width as number) - 2;
        const availableHeight = (this.widget.height as number) - 2;

        // Use most of the available space, with some padding
        const spriteWidth = Math.max(30, Math.min(70, availableWidth - 4));
        const spriteHeight = Math.max(20, Math.min(45, availableHeight - 2));

        const ascii = await imageService.urlToAscii(
          spriteUrl,
          spriteWidth,
          spriteHeight,
          colors.lightScreenBlue
        );
        this.widget.setContent(ascii);
      } else {
        this.widget.setContent('No sprite available');
      }
    }).catch(() => {
      this.widget.setContent('Failed to load sprite');
    });

    this.widget.screen.render();
  }
}
