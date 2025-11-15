#!/usr/bin/env node

import blessed from 'blessed';
import { theme, colors } from './ui/theme.js';
import { HomeScreen } from './ui/screens/homeScreen.js';
import { DetailScreen } from './ui/screens/detailScreen.js';

// Create the blessed screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Pokedex',
  fullUnicode: true,
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
      '{center}E: Navigate Evolution | Esc/B: Back | Q/Ctrl+C: Quit{/center}'
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

// Set initial footer
updateFooter('home');

// Global hotkeys
screen.key(['C-c', 'q'], () => {
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

// Initial render
screen.render();

// Handle graceful shutdown
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});
