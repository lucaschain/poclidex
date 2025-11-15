#!/usr/bin/env node

import blessed from 'blessed';
import { theme, colors } from './ui/theme.js';
import { HomeScreen } from './ui/screens/homeScreen.js';
import { DetailScreen } from './ui/screens/detailScreen.js';
import { logTerminalInfo } from './utils/terminalDetection.js';

// Check for debug colors flag
if (process.argv.includes('--debug-colors')) {
  logTerminalInfo();
  process.exit(0);
}

// Parse CLI arguments for direct Pokemon launch
const cliPokemonName = process.argv[2];

// Create the blessed screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Pokedex',
  fullUnicode: true,
  style: {
    bg: colors.defaultBg,
    fg: 'white',
  },
});

// Create header
blessed.box({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  height: 3,
  content: '{center}{bold}POKEDEX{/bold}{/center}',
  tags: true,
  style: {
    fg: theme.header.fg,
    bg: colors.darkBg,
    bold: theme.header.bold,
    border: {
      fg: colors.pokedexRed,
    },
  },
  border: {
    type: 'line',
  },
});

// Create main content area
const mainContent = blessed.box({
  parent: screen,
  top: 3,
  left: 0,
  width: '100%',
  height: 'shrink',
  bottom: 3,
  style: {
    bg: colors.defaultBg,
  },
});

// Create footer with hotkey hints
const footer = blessed.box({
  parent: screen,
  bottom: 0,
  left: 0,
  width: '100%',
  height: 3,
  tags: true,
  style: {
    fg: theme.footer.fg,
    bg: colors.darkBg,
    border: {
      fg: colors.navyBlue,
    },
  },
  border: {
    type: 'line',
  },
});

function updateFooter(mode: 'home' | 'detail') {
  if (mode === 'home') {
    footer.setContent(
      '{center}Ctrl+S: Search | Arrow Keys: Navigate | Enter: Select | Q/Ctrl+C: Quit{/center}'
    );
  } else {
    footer.setContent(
      '{center}Tab/←→: Switch Tabs | 1-4: Direct Tab | E: Evolution | Ctrl+S: Search | Esc/B: Back | Q: Quit{/center}'
    );
  }
  screen.render();
}

// Initialize screens
const homeScreen = new HomeScreen({
  parent: mainContent,
  screen,
  onPokemonSelect: async (name) => {
    await detailScreen.showPokemon(name);
    updateFooter('detail');
  },
});

const detailScreen = new DetailScreen({
  parent: mainContent,
  screen,
  onBack: () => {
    detailScreen.hide();
    homeScreen.show();
    updateFooter('home');
  },
  onEvolutionSelect: async (name) => {
    await detailScreen.showPokemon(name);
  },
});

// Conditional startup based on CLI argument
if (cliPokemonName) {
  // Launch directly to detail screen with provided Pokemon name
  detailScreen.showPokemon(cliPokemonName)
    .then(() => {
      updateFooter('detail');
      screen.render();
    })
    .catch((_error) => {
      console.error(`Error: Could not find Pokemon "${cliPokemonName}"`);
      console.error('Usage: pokedex [pokemon-name]');
      process.exit(1);
    });
} else {
  // Normal startup - show home screen
  updateFooter('home');
  screen.render();
}

// Global hotkeys
screen.key(['C-c'], () => {
  return process.exit(0);
});

// Ctrl+S: Global search navigation
screen.key(['C-s'], () => {
  if (detailScreen.isVisible()) {
    // On detail screen: go back to home and focus search
    detailScreen.hide();
    homeScreen.show();
    homeScreen.focusSearch();
    updateFooter('home');
  } else {
    // On home screen: just focus search
    homeScreen.focusSearch();
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});
