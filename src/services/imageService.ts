import { spawn } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import https from 'https';
import { LRUCache } from '../utils/cache.js';
import { getChafaColorMode, detectTerminalCapabilities } from '../utils/terminalDetection.js';

/**
 * Available Chafa color spaces
 * - rgb: Faster, less perceptually accurate (default)
 * - din99d: Slower, more perceptually accurate color matching
 */
const AVAILABLE_COLOR_SPACES = ['rgb', 'din99d'] as const;
type ColorSpace = typeof AVAILABLE_COLOR_SPACES[number];

/**
 * Available color modes (palette sizes)
 */
const AVAILABLE_COLOR_MODES = ['full', '256', '16', '8'] as const;
type ColorMode = typeof AVAILABLE_COLOR_MODES[number];

/**
 * Available dither modes
 * - ordered: Bayer pattern dithering (default)
 * - diffusion: Floyd-Steinberg error diffusion (smoother gradients)
 * - none: No dithering
 */
const AVAILABLE_DITHER_MODES = ['ordered', 'diffusion', 'none'] as const;
type DitherMode = typeof AVAILABLE_DITHER_MODES[number];

/**
 * Available symbol sets
 * - block: Unicode block elements (default)
 * - braille: High resolution braille patterns
 * - ascii: Old-school ASCII art
 * - half: Half blocks
 * - quad: Quarter blocks (more detailed)
 */
const AVAILABLE_SYMBOL_SETS = ['block', 'braille', 'ascii', 'half', 'quad'] as const;
type SymbolSet = typeof AVAILABLE_SYMBOL_SETS[number];

/**
 * Service for converting images to ASCII art using Chafa
 */
export class ImageService {
  private cache: LRUCache<string, string>;
  private tempDir: string;
  private colorMode: ColorMode;
  private currentColorSpace: ColorSpace;
  private currentDitherMode: DitherMode;
  private currentSymbolSet: SymbolSet;
  private debugMode: boolean;

  constructor() {
    this.cache = new LRUCache(50); // Cache up to 50 ASCII images
    this.tempDir = join(tmpdir(), 'pokedex-sprites');
    this.debugMode = process.env.DEBUG_COLORS === '1' || process.env.DEBUG_COLORS === 'true';
    this.colorMode = getChafaColorMode();
    this.currentColorSpace = 'rgb'; // Default to RGB
    this.currentDitherMode = 'ordered'; // Default to Bayer dithering
    this.currentSymbolSet = 'block'; // Default to block symbols

    if (this.debugMode) {
      const caps = detectTerminalCapabilities();
      console.error(`[ImageService] Detected color mode: ${this.colorMode}`);
      console.error(`[ImageService] Terminal: ${caps.term}, COLORTERM: ${caps.colorterm}`);
    }

    this.ensureTempDir();
  }

  private async ensureTempDir(): Promise<void> {
    if (!existsSync(this.tempDir)) {
      await mkdir(this.tempDir, { recursive: true });
    }
  }

  /**
   * Convert image URL to ASCII art using Chafa
   */
  async urlToAscii(url: string, width: number = 40, height: number = 20, bgColor?: string): Promise<string> {
    // Check cache first (include all rendering parameters in cache key)
    const cacheKey = `${url}-${width}-${height}-${bgColor || 'none'}-${this.currentColorSpace}-${this.colorMode}-${this.currentDitherMode}-${this.currentSymbolSet}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Download image to temp file
      const tempFile = await this.downloadImage(url);

      // Convert to ASCII
      const ascii = await this.chafa(tempFile, width, height, bgColor);

      // Cache the result
      this.cache.set(cacheKey, ascii);

      // Clean up temp file
      await unlink(tempFile).catch(() => { /* ignore errors */ });

      return ascii;
    } catch (error) {
      // Return placeholder on error
      return this.createPlaceholder(width, height, error as Error);
    }
  }

  /**
   * Download image from URL to temp file
   */
  private downloadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const filename = `sprite-${Date.now()}.png`;
      const filepath = join(this.tempDir, filename);

      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', async () => {
          try {
            await writeFile(filepath, Buffer.concat(chunks));
            resolve(filepath);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Run Chafa to convert image to ASCII
   */
  private chafa(filepath: string, width: number, height: number, bgColor?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = [
        '--format=symbols',
        `--colors=${this.colorMode}`,              // Color palette: full, 256, 16, or 8 (cycleable)
        `--color-space=${this.currentColorSpace}`, // Color space: rgb or din99d (cycleable)
        `--dither=${this.currentDitherMode}`,      // Dither mode: ordered, diffusion, or none (cycleable)
        `--symbols=${this.currentSymbolSet}`,      // Symbol set: block, braille, ascii, etc (cycleable)
        '--polite=on',                             // Suppress cursor control codes
        `--size=${width}x${height}`,
      ];

      // Add background color if specified
      if (bgColor) {
        args.push(`--bg=${bgColor}`);
      }

      args.push(filepath);

      if (this.debugMode) {
        console.error(`[ImageService] Chafa command: chafa ${args.join(' ')}`);
      }

      const chafaProcess = spawn('chafa', args);

      const chunks: Buffer[] = [];
      const errors: Buffer[] = [];

      chafaProcess.stdout.on('data', (chunk) => chunks.push(chunk));
      chafaProcess.stderr.on('data', (chunk) => errors.push(chunk));

      chafaProcess.on('close', (code) => {
        if (code !== 0) {
          const errorMsg = Buffer.concat(errors).toString();
          reject(new Error(`Chafa exited with code ${code}: ${errorMsg}`));
          return;
        }

        const ascii = Buffer.concat(chunks).toString();
        resolve(ascii);
      });

      chafaProcess.on('error', (error) => {
        reject(new Error(`Chafa not found. Please install chafa: ${error.message}`));
      });
    });
  }

  /**
   * Create a placeholder ASCII art when image fails to load
   */
  private createPlaceholder(width: number, height: number, error: Error): string {
    const lines: string[] = [];
    const message = 'Sprite unavailable';
    const errorHint = error.message.includes('Chafa not found')
      ? '(chafa not installed)'
      : '(failed to load)';

    // Center the message
    const midHeight = Math.floor(height / 2);

    for (let i = 0; i < height; i++) {
      if (i === midHeight) {
        const padding = Math.floor((width - message.length) / 2);
        lines.push(' '.repeat(padding) + message);
      } else if (i === midHeight + 1) {
        const padding = Math.floor((width - errorHint.length) / 2);
        lines.push(' '.repeat(padding) + errorHint);
      } else {
        lines.push(' '.repeat(width));
      }
    }

    return lines.join('\n');
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get the current color space
   */
  getCurrentColorSpace(): ColorSpace {
    return this.currentColorSpace;
  }

  /**
   * Cycle to the next color space
   * Rotates through: rgb → din99d → rgb → ...
   * Clears cache to force re-rendering with new color space
   */
  cycleColorSpace(): ColorSpace {
    const currentIndex = AVAILABLE_COLOR_SPACES.indexOf(this.currentColorSpace);
    const nextIndex = (currentIndex + 1) % AVAILABLE_COLOR_SPACES.length;
    this.currentColorSpace = AVAILABLE_COLOR_SPACES[nextIndex];

    // Clear cache to force re-rendering with new color space
    this.clearCache();

    if (this.debugMode) {
      console.error(`[ImageService] Cycled color space to: ${this.currentColorSpace}`);
    }

    return this.currentColorSpace;
  }

  /**
   * Get the current color mode (palette size)
   */
  getColorMode(): ColorMode {
    return this.colorMode;
  }

  /**
   * Cycle to the next color mode
   * Rotates through: full → 256 → 16 → 8 → full → ...
   * Clears cache to force re-rendering with new color mode
   */
  cycleColorMode(): ColorMode {
    const currentIndex = AVAILABLE_COLOR_MODES.indexOf(this.colorMode);
    const nextIndex = (currentIndex + 1) % AVAILABLE_COLOR_MODES.length;
    this.colorMode = AVAILABLE_COLOR_MODES[nextIndex];

    // Clear cache to force re-rendering with new color mode
    this.clearCache();

    if (this.debugMode) {
      console.error(`[ImageService] Cycled color mode to: ${this.colorMode}`);
    }

    return this.colorMode;
  }

  /**
   * Get the current dither mode
   */
  getCurrentDitherMode(): DitherMode {
    return this.currentDitherMode;
  }

  /**
   * Cycle to the next dither mode
   * Rotates through: ordered → diffusion → none → ordered → ...
   * Clears cache to force re-rendering with new dither mode
   */
  cycleDitherMode(): DitherMode {
    const currentIndex = AVAILABLE_DITHER_MODES.indexOf(this.currentDitherMode);
    const nextIndex = (currentIndex + 1) % AVAILABLE_DITHER_MODES.length;
    this.currentDitherMode = AVAILABLE_DITHER_MODES[nextIndex];

    // Clear cache to force re-rendering with new dither mode
    this.clearCache();

    if (this.debugMode) {
      console.error(`[ImageService] Cycled dither mode to: ${this.currentDitherMode}`);
    }

    return this.currentDitherMode;
  }

  /**
   * Get the current symbol set
   */
  getCurrentSymbolSet(): SymbolSet {
    return this.currentSymbolSet;
  }

  /**
   * Cycle to the next symbol set
   * Rotates through: block → braille → ascii → half → quad → block → ...
   * Clears cache to force re-rendering with new symbol set
   */
  cycleSymbolSet(): SymbolSet {
    const currentIndex = AVAILABLE_SYMBOL_SETS.indexOf(this.currentSymbolSet);
    const nextIndex = (currentIndex + 1) % AVAILABLE_SYMBOL_SETS.length;
    this.currentSymbolSet = AVAILABLE_SYMBOL_SETS[nextIndex];

    // Clear cache to force re-rendering with new symbol set
    this.clearCache();

    if (this.debugMode) {
      console.error(`[ImageService] Cycled symbol set to: ${this.currentSymbolSet}`);
    }

    return this.currentSymbolSet;
  }
}

// Export singleton instance
export const imageService = new ImageService();
