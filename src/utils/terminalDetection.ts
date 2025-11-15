import { execSync } from 'child_process';

/**
 * Terminal color capabilities
 */
export interface TerminalCapabilities {
  truecolor: boolean;
  colors256: boolean;
  colors16: boolean;
  tputColors: number;
  term: string;
  colorterm: string;
  termProgram: string;
}

/**
 * Detect terminal color capabilities based on environment variables
 */
export function detectTerminalCapabilities(): TerminalCapabilities {
  const term = process.env.TERM || '';
  const colorterm = process.env.COLORTERM || '';
  const termProgram = process.env.TERM_PROGRAM || '';

  // Try to get tput colors
  let tputColors = 0;
  try {
    const result = execSync('tput colors 2>/dev/null', { encoding: 'utf-8' });
    tputColors = parseInt(result.trim(), 10) || 0;
  } catch {
    // tput not available or failed
  }

  return {
    truecolor: colorterm === 'truecolor' || colorterm === '24bit',
    colors256: term.includes('256') || tputColors >= 256,
    colors16: term.includes('color'),
    tputColors,
    term,
    colorterm,
    termProgram,
  };
}

/**
 * Determine the best Chafa color mode for the current terminal
 */
export function getChafaColorMode(): 'full' | '256' | '16' | '8' {
  // Check for user override
  const override = process.env.POKEDEX_COLORS;
  if (override) {
    const normalized = override.toLowerCase();
    if (normalized === 'full' || normalized === 'truecolor') {
      return 'full';
    }
    if (normalized === '256') {
      return '256';
    }
    if (normalized === '16') {
      return '16';
    }
    if (normalized === '8') {
      return '8';
    }
  }

  // Auto-detect
  const caps = detectTerminalCapabilities();

  // Prefer truecolor if available
  if (caps.truecolor) {
    return 'full';
  }

  // Fall back to 256 colors
  if (caps.colors256) {
    return '256';
  }

  // Fall back to 16 colors
  if (caps.colors16) {
    return '16';
  }

  // Last resort: 8 colors
  return '8';
}

/**
 * Log terminal capabilities for debugging
 */
export function logTerminalInfo(): void {
  const caps = detectTerminalCapabilities();
  const detectedMode = getChafaColorMode();

  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║         Terminal Color Capability Detection          ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Environment Variables:');
  console.log(`  TERM:         ${caps.term || '(not set)'}`);
  console.log(`  COLORTERM:    ${caps.colorterm || '(not set)'}`);
  console.log(`  TERM_PROGRAM: ${caps.termProgram || '(not set)'}`);
  console.log('');
  console.log('Detected Capabilities:');
  console.log(`  Truecolor:    ${caps.truecolor ? '✓ Yes' : '✗ No'}`);
  console.log(`  256 colors:   ${caps.colors256 ? '✓ Yes' : '✗ No'}`);
  console.log(`  16 colors:    ${caps.colors16 ? '✓ Yes' : '✗ No'}`);
  console.log(`  tput colors:  ${caps.tputColors > 0 ? caps.tputColors : '(unavailable)'}`);
  console.log('');
  console.log('Chafa Color Mode:');
  console.log(`  Selected:     ${detectedMode}`);

  if (process.env.POKEDEX_COLORS) {
    console.log(`  Override:     ${process.env.POKEDEX_COLORS} (via POKEDEX_COLORS env var)`);
  }

  console.log('');
  console.log('Color Test:');
  console.log(`  256-color:    \x1b[38;5;196mBright Red\x1b[0m`);
  console.log(`  Truecolor:    \x1b[38;2;255;0;0mPure Red\x1b[0m \x1b[38;2;255;165;0mOrange\x1b[0m \x1b[38;2;0;255;0mGreen\x1b[0m`);
  console.log('');

  // Recommendations
  if (!caps.truecolor && caps.termProgram === 'tmux') {
    console.log('⚠️  Recommendation:');
    console.log('   You are using tmux but truecolor is not detected.');
    console.log('   Add to ~/.tmux.conf:');
    console.log('     set -g default-terminal "screen-256color"');
    console.log('     set -ga terminal-overrides ",*256col*:Tc"');
    console.log('   Then run: tmux source-file ~/.tmux.conf');
    console.log('');
  }

  if (!caps.truecolor && !caps.termProgram) {
    console.log('💡 Tip:');
    console.log('   For best colors, use a terminal with truecolor support:');
    console.log('   - iTerm2 (macOS)');
    console.log('   - Kitty, Alacritty, WezTerm');
    console.log('   - Windows Terminal');
    console.log('   - GNOME Terminal 3.x+');
    console.log('');
  }

  if (detectedMode !== 'full') {
    console.log('🔧 Override color mode:');
    console.log('   export POKEDEX_COLORS=full    # Force truecolor');
    console.log('   export POKEDEX_COLORS=256     # Force 256 colors');
    console.log('');
  }

  console.log('─────────────────────────────────────────────────────────');
  console.log('');
}
