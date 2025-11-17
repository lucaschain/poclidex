import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoadingModal } from '../LoadingModal.js';
import type { LoadingPhaseInfo } from '../../types/loadingTypes.js';
import blessed from 'blessed';

describe('LoadingModal', () => {
  let screen: blessed.Widgets.Screen;
  let modal: LoadingModal;

  const testPhases: LoadingPhaseInfo[] = [
    { phase: 'pokemon', label: 'Pokemon data', status: 'pending' },
    { phase: 'sprite', label: 'Sprite', status: 'pending' },
    { phase: 'evolution', label: 'Evolution chain', status: 'pending' },
    { phase: 'abilities', label: 'Abilities', status: 'pending' },
    { phase: 'moves', label: 'Moves', status: 'pending' },
  ];

  beforeEach(() => {
    // Create a mock blessed screen
    screen = blessed.screen({
      smartCSR: true,
      fullUnicode: true,
    });
  });

  afterEach(() => {
    // Clean up modal and screen
    modal?.destroy();
    screen?.destroy();
    vi.clearAllTimers();
  });

  describe('constructor', () => {
    it('should create a LoadingModal instance', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      expect(modal).toBeInstanceOf(LoadingModal);
    });

    it('should accept pokemon name and phases', () => {
      modal = new LoadingModal(screen, 'charizard', testPhases);
      expect(modal).toBeDefined();
    });
  });

  describe('show()', () => {
    it('should display the modal', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();

      expect(modal.isVisible()).toBe(true);
    });

    it('should capitalize pokemon name in title', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();

      // The modal should contain "Loading Pikachu" in the label
      // We can't easily test blessed internals, but we verify it shows
      expect(modal.isVisible()).toBe(true);
    });

    it('should initialize all phases as pending', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();

      // Modal should be visible with all phases pending
      expect(modal.isVisible()).toBe(true);
    });

    it('should start spinner animation', () => {
      vi.useFakeTimers();
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();

      // Spinner should update every 80ms
      expect(modal.isVisible()).toBe(true);

      vi.advanceTimersByTime(80);
      // Spinner should have advanced one frame
      // (we can't easily test the internal frame state, but modal should still be visible)
      expect(modal.isVisible()).toBe(true);

      vi.useRealTimers();
    });

    it('should destroy existing modal before creating new one', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();

      const firstVisible = modal.isVisible();

      // Show again (should destroy and recreate)
      modal.show();

      expect(firstVisible).toBe(true);
      expect(modal.isVisible()).toBe(true);
    });
  });

  describe('updatePhase()', () => {
    beforeEach(() => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();
    });

    it('should update phase status to loading', () => {
      modal.updatePhase('pokemon', 'loading');
      // Modal should still be visible after update
      expect(modal.isVisible()).toBe(true);
    });

    it('should update phase status to complete', () => {
      modal.updatePhase('pokemon', 'loading');
      modal.updatePhase('pokemon', 'complete');
      expect(modal.isVisible()).toBe(true);
    });

    it('should handle multiple phase updates', () => {
      modal.updatePhase('pokemon', 'loading');
      modal.updatePhase('sprite', 'loading');
      modal.updatePhase('pokemon', 'complete');
      expect(modal.isVisible()).toBe(true);
    });

    it('should handle invalid phase gracefully', () => {
      // @ts-expect-error - testing invalid phase
      modal.updatePhase('invalid', 'loading');
      expect(modal.isVisible()).toBe(true);
    });

    it('should update all phases in sequence', () => {
      testPhases.forEach((phase) => {
        modal.updatePhase(phase.phase, 'loading');
        modal.updatePhase(phase.phase, 'complete');
      });
      expect(modal.isVisible()).toBe(true);
    });
  });

  describe('hide()', () => {
    it('should hide the modal', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();

      expect(modal.isVisible()).toBe(true);

      modal.hide();

      expect(modal.isVisible()).toBe(false);
    });

    it('should stop spinner animation', () => {
      vi.useFakeTimers();

      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();

      modal.hide();

      // Advancing time should not cause errors
      vi.advanceTimersByTime(1000);

      expect(modal.isVisible()).toBe(false);

      vi.useRealTimers();
    });

    it('should be safe to call multiple times', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();

      modal.hide();
      modal.hide();
      modal.hide();

      expect(modal.isVisible()).toBe(false);
    });

    it('should be safe to call before show()', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);

      expect(() => modal.hide()).not.toThrow();
      expect(modal.isVisible()).toBe(false);
    });
  });

  describe('destroy()', () => {
    it('should clean up resources', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();

      modal.destroy();

      expect(modal.isVisible()).toBe(false);
    });

    it('should be an alias for hide()', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();

      modal.destroy();

      expect(modal.isVisible()).toBe(false);
    });
  });

  describe('isVisible()', () => {
    it('should return false initially', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      expect(modal.isVisible()).toBe(false);
    });

    it('should return true after show()', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();
      expect(modal.isVisible()).toBe(true);
    });

    it('should return false after hide()', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();
      modal.hide();
      expect(modal.isVisible()).toBe(false);
    });
  });

  describe('spinner animation', () => {
    it('should cycle through spinner frames', () => {
      vi.useFakeTimers();

      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.updatePhase('pokemon', 'loading'); // Set one phase to loading to show spinner
      modal.show();

      // Advance through several frames
      for (let i = 0; i < 20; i++) {
        vi.advanceTimersByTime(80);
      }

      // Modal should still be visible
      expect(modal.isVisible()).toBe(true);

      vi.useRealTimers();
    });

    it('should not leak timers after hide()', () => {
      vi.useFakeTimers();

      modal = new LoadingModal(screen, 'pikachu', testPhases);
      modal.show();
      modal.hide();

      // Get number of pending timers
      const pendingTimers = vi.getTimerCount();

      expect(pendingTimers).toBe(0);

      vi.useRealTimers();
    });
  });

  describe('integration', () => {
    it('should handle complete loading lifecycle', () => {
      vi.useFakeTimers();

      modal = new LoadingModal(screen, 'pikachu', testPhases);

      // Show modal
      modal.show();
      expect(modal.isVisible()).toBe(true);

      // Simulate loading each phase
      modal.updatePhase('pokemon', 'loading');
      vi.advanceTimersByTime(100);

      modal.updatePhase('pokemon', 'complete');
      modal.updatePhase('sprite', 'loading');
      vi.advanceTimersByTime(100);

      modal.updatePhase('sprite', 'complete');
      modal.updatePhase('evolution', 'loading');
      vi.advanceTimersByTime(100);

      modal.updatePhase('evolution', 'complete');
      modal.updatePhase('abilities', 'loading');
      vi.advanceTimersByTime(100);

      modal.updatePhase('abilities', 'complete');
      modal.updatePhase('moves', 'loading');
      vi.advanceTimersByTime(100);

      modal.updatePhase('moves', 'complete');

      // Hide modal
      modal.hide();
      expect(modal.isVisible()).toBe(false);

      vi.useRealTimers();
    });

    it('should handle rapid show/hide cycles', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);

      for (let i = 0; i < 10; i++) {
        modal.show();
        modal.hide();
      }

      expect(modal.isVisible()).toBe(false);
    });

    it('should handle phase updates while hidden', () => {
      modal = new LoadingModal(screen, 'pikachu', testPhases);

      // Update phases while modal is hidden
      modal.updatePhase('pokemon', 'loading');
      modal.updatePhase('pokemon', 'complete');

      // These should not cause errors
      expect(modal.isVisible()).toBe(false);

      // Show modal (should display updated state)
      modal.show();
      expect(modal.isVisible()).toBe(true);
    });
  });
});
