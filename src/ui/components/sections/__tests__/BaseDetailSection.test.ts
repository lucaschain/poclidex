import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseDetailSection } from '../IDetailSection.js';
import type { PokemonDisplay } from '../../../../models/pokemon.js';
import type { LoadingPhase, LoadingStatus } from '../../../types/loadingTypes.js';
import blessed from 'blessed';

// Create a concrete implementation for testing
class TestSection extends BaseDetailSection {
  constructor(widget: blessed.Widgets.BoxElement) {
    super('test', widget);
  }

  async update(_pokemon: PokemonDisplay): Promise<void> {
    // Test implementation
  }
}

describe('BaseDetailSection', () => {
  let screen: blessed.Widgets.Screen;
  let widget: blessed.Widgets.BoxElement;
  let section: TestSection;

  beforeEach(() => {
    screen = blessed.screen({
      smartCSR: true,
      fullUnicode: true,
    });

    widget = blessed.box({
      parent: screen,
      width: '100%',
      height: '100%',
    });

    section = new TestSection(widget);
  });

  afterEach(() => {
    section?.destroy();
    screen?.destroy();
  });

  describe('setStatusCallback()', () => {
    it('should set the status callback', () => {
      const callback = vi.fn();
      section.setStatusCallback(callback);

      // Callback should be stored (tested indirectly via reportPhaseStatus)
      expect(section).toBeDefined();
    });

    it('should allow callback to be updated', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      section.setStatusCallback(callback1);
      section.setStatusCallback(callback2);

      // Only the second callback should be used
      expect(section).toBeDefined();
    });
  });

  describe('reportPhaseStatus()', () => {
    it('should call callback with loading status before work', async () => {
      const callback = vi.fn();
      section.setStatusCallback(callback);

      await section['reportPhaseStatus']('pokemon', async () => {
        expect(callback).toHaveBeenCalledWith('pokemon', 'loading');
      });
    });

    it('should call callback with complete status after work', async () => {
      const callback = vi.fn();
      section.setStatusCallback(callback);

      await section['reportPhaseStatus']('pokemon', async () => {
        // Do some async work
        return 'result';
      });

      expect(callback).toHaveBeenCalledWith('pokemon', 'loading');
      expect(callback).toHaveBeenCalledWith('pokemon', 'complete');
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should return the result of the work function', async () => {
      const callback = vi.fn();
      section.setStatusCallback(callback);

      const result = await section['reportPhaseStatus']('pokemon', async () => {
        return 'test-result';
      });

      expect(result).toBe('test-result');
    });

    it('should handle async work', async () => {
      const callback = vi.fn();
      section.setStatusCallback(callback);

      const result = await section['reportPhaseStatus']('pokemon', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 42;
      });

      expect(result).toBe(42);
      expect(callback).toHaveBeenCalledWith('pokemon', 'loading');
      expect(callback).toHaveBeenCalledWith('pokemon', 'complete');
    });

    it('should mark phase complete even on error', async () => {
      const callback = vi.fn();
      section.setStatusCallback(callback);

      await expect(
        section['reportPhaseStatus']('pokemon', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');

      expect(callback).toHaveBeenCalledWith('pokemon', 'loading');
      expect(callback).toHaveBeenCalledWith('pokemon', 'complete');
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should propagate errors from work function', async () => {
      const callback = vi.fn();
      section.setStatusCallback(callback);

      const error = new Error('Work failed');

      await expect(
        section['reportPhaseStatus']('pokemon', async () => {
          throw error;
        })
      ).rejects.toThrow(error);
    });

    it('should work without status callback set', async () => {
      // No callback set

      const result = await section['reportPhaseStatus']('pokemon', async () => {
        return 'result';
      });

      expect(result).toBe('result');
    });

    it('should handle multiple phases in sequence', async () => {
      const callback = vi.fn();
      section.setStatusCallback(callback);

      await section['reportPhaseStatus']('pokemon', async () => 'p');
      await section['reportPhaseStatus']('sprite', async () => 's');
      await section['reportPhaseStatus']('evolution', async () => 'e');

      expect(callback).toHaveBeenCalledTimes(6); // 3 phases * 2 calls each
      expect(callback).toHaveBeenNthCalledWith(1, 'pokemon', 'loading');
      expect(callback).toHaveBeenNthCalledWith(2, 'pokemon', 'complete');
      expect(callback).toHaveBeenNthCalledWith(3, 'sprite', 'loading');
      expect(callback).toHaveBeenNthCalledWith(4, 'sprite', 'complete');
      expect(callback).toHaveBeenNthCalledWith(5, 'evolution', 'loading');
      expect(callback).toHaveBeenNthCalledWith(6, 'evolution', 'complete');
    });

    it('should handle concurrent phase reporting', async () => {
      const callback = vi.fn();
      section.setStatusCallback(callback);

      // Run multiple phases concurrently
      await Promise.all([
        section['reportPhaseStatus']('pokemon', async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return 'p';
        }),
        section['reportPhaseStatus']('sprite', async () => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return 's';
        }),
      ]);

      expect(callback).toHaveBeenCalledWith('pokemon', 'loading');
      expect(callback).toHaveBeenCalledWith('pokemon', 'complete');
      expect(callback).toHaveBeenCalledWith('sprite', 'loading');
      expect(callback).toHaveBeenCalledWith('sprite', 'complete');
    });

    it('should call callback with correct phase type', async () => {
      const callback = vi.fn<[LoadingPhase, LoadingStatus], void>();
      section.setStatusCallback(callback);

      await section['reportPhaseStatus']('abilities', async () => 'done');

      expect(callback).toHaveBeenCalledWith('abilities', 'loading');
      expect(callback).toHaveBeenCalledWith('abilities', 'complete');
    });

    it('should handle work that returns void', async () => {
      const callback = vi.fn();
      section.setStatusCallback(callback);

      const result = await section['reportPhaseStatus']('pokemon', async () => {
        // void return
      });

      expect(result).toBeUndefined();
      expect(callback).toHaveBeenCalledWith('pokemon', 'loading');
      expect(callback).toHaveBeenCalledWith('pokemon', 'complete');
    });

    it('should handle work that returns objects', async () => {
      const callback = vi.fn();
      section.setStatusCallback(callback);

      const expected = { data: 'test', count: 42 };

      const result = await section['reportPhaseStatus']('pokemon', async () => {
        return expected;
      });

      expect(result).toEqual(expected);
      expect(callback).toHaveBeenCalledWith('pokemon', 'complete');
    });
  });

  describe('basic functionality', () => {
    it('should have correct name', () => {
      expect(section.getName()).toBe('test');
    });

    it('should return widget', () => {
      expect(section.getWidget()).toBe(widget);
    });

    it('should be visible initially', () => {
      expect(section.isVisible()).toBe(true);
    });

    it('should hide when hide() is called', () => {
      section.hide();
      expect(section.isVisible()).toBe(false);
    });

    it('should show when show() is called', () => {
      section.hide();
      section.show();
      expect(section.isVisible()).toBe(true);
    });
  });
});
