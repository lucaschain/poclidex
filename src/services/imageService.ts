import { spawn } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import https from 'https';
import { LRUCache } from '../utils/cache.js';

/**
 * Service for converting images to ASCII art using Chafa
 */
export class ImageService {
  private cache: LRUCache<string, string>;
  private tempDir: string;

  constructor() {
    this.cache = new LRUCache(50); // Cache up to 50 ASCII images
    this.tempDir = join(tmpdir(), 'pokedex-sprites');
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
  async urlToAscii(url: string, width: number = 40, height: number = 20): Promise<string> {
    // Check cache first
    const cacheKey = `${url}-${width}-${height}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Download image to temp file
      const tempFile = await this.downloadImage(url);

      // Convert to ASCII
      const ascii = await this.chafa(tempFile, width, height);

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
  private chafa(filepath: string, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const chafaProcess = spawn('chafa', [
        '--format=symbols',
        '--colors=full',           // Use truecolor (16 million colors)
        '--color-space=rgb',       // RGB color space for better colors
        '--dither=bayer',          // Bayer dithering for smoother gradients
        '--symbols=block',         // Use simple block characters for font compatibility
        '--polite=on',             // Suppress cursor control codes
        `--size=${width}x${height}`,
        filepath,
      ]);

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
}

// Export singleton instance
export const imageService = new ImageService();
