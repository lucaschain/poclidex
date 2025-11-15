#!/usr/bin/env node

import blessed from 'blessed';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { theme, colors } from './ui/theme.js';
import { HomeScreen } from './ui/screens/homeScreen.js';
import { DetailScreen } from './ui/screens/detailScreen.js';
import { HelpPanel } from './ui/components/HelpPanel.js';
import { generationService } from './services/generationService.js';
import { logTerminalInfo } from './utils/terminalDetection.js';

// Get package.json for version info
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// Handle --help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
poclidex v${packageJson.version} - Interactive CLI Pokedex

Usage:
  poclidex [pokemon-name]     Launch directly to a Pokemon's detail page
  poclidex                    Launch the interactive search interface

Options:
  -h, --help                  Show this help message
  -v, --version               Show version number
  --completion [bash|zsh]     Generate shell completion script
  --debug-colors              Show terminal color capabilities

Examples:
  poclidex                    # Start interactive mode
  poclidex pikachu            # View Pikachu's details
  poclidex charizard          # View Charizard's details

Shell Completion:
  eval "$(poclidex --completion bash)"   # Enable bash completion
  eval "$(poclidex --completion zsh)"    # Enable zsh completion

Keyboard Shortcuts:
  ?                           Show help panel with all shortcuts
  Ctrl+S                      Search / Return to search
  F1-F9                       Filter by generation
  Ctrl+C                      Quit
`);
  process.exit(0);
}

// Handle --version flag
if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log(packageJson.version);
  process.exit(0);
}

// Handle --completion flag for shell completion
if (process.argv.includes('--completion')) {
  const shell = process.argv[process.argv.indexOf('--completion') + 1] || 'bash';

  (async () => {
    try {
      const { pokemonService } = await import('./services/pokemonService.js');
      const pokemonList = await pokemonService.loadPokemonList();
      const names = pokemonList.map(p => p.name).join(' ');

      if (shell === 'bash') {
        console.log(`# Bash completion for poclidex
# Add this to your ~/.bashrc or ~/.bash_profile:
# eval "$(poclidex --completion bash)"

_poclidex_completions() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"

  if [ "\${COMP_CWORD}" -eq 1 ]; then
    COMPREPLY=( $(compgen -W "${names}" -- "$cur") )
  fi
}

complete -F _poclidex_completions poclidex
`);
      } else if (shell === 'zsh') {
        const zshList = pokemonList.map(p => `'${p.name}'`).join('\n    ');
        console.log(`# Zsh completion for poclidex
# Add this to your ~/.zshrc:
# eval "$(poclidex --completion zsh)"

#compdef poclidex

_poclidex() {
  local -a pokemon_list
  pokemon_list=(
    ${zshList}
  )

  _describe 'pokemon' pokemon_list
}

_poclidex
`);
      } else {
        console.error('Unsupported shell. Use: bash or zsh');
        process.exit(1);
      }
      process.exit(0);
    } catch (error) {
      console.error('Error loading Pokemon list:', error);
      process.exit(1);
    }
  })();
  // Don't continue execution
  await new Promise(() => {});
}

// Check for debug colors flag
if (process.argv.includes('--debug-colors')) {
  logTerminalInfo();
  process.exit(0);
}

// Parse CLI arguments for direct Pokemon launch
// Filter out flags (anything starting with - or --)
const args = process.argv.slice(2).filter(arg => !arg.startsWith('-'));
const cliPokemonName = args[0];

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
      '{center}Ctrl+S: Search | Arrow Keys: Navigate | Enter: Select | ?: Help | Ctrl+C: Quit{/center}'
    );
  } else {
    footer.setContent(
      '{center}Tab/1-3: Tabs | Esc: Back | Ctrl+S: Search | ?: Help | Ctrl+C: Quit{/center}'
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
  onFooterUpdate: () => {
    updateFooter('detail');
  },
});

// Initialize help panel
const helpPanel = new HelpPanel(screen);

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

// Help panel toggle (? key and Ctrl+H)
screen.key(['?', 'C-h'], () => {
  helpPanel.toggle();
});

// F1-F9: Set session generation
screen.key(['f1'], async () => {
  generationService.setSessionGeneration(1);
  if (detailScreen.isVisible() && detailScreen['currentPokemon']) {
    await detailScreen.showPokemon(detailScreen['currentPokemon'].name);
  }
});

screen.key(['f2'], async () => {
  generationService.setSessionGeneration(2);
  if (detailScreen.isVisible() && detailScreen['currentPokemon']) {
    await detailScreen.showPokemon(detailScreen['currentPokemon'].name);
  }
});

screen.key(['f3'], async () => {
  generationService.setSessionGeneration(3);
  if (detailScreen.isVisible() && detailScreen['currentPokemon']) {
    await detailScreen.showPokemon(detailScreen['currentPokemon'].name);
  }
});

screen.key(['f4'], async () => {
  generationService.setSessionGeneration(4);
  if (detailScreen.isVisible() && detailScreen['currentPokemon']) {
    await detailScreen.showPokemon(detailScreen['currentPokemon'].name);
  }
});

screen.key(['f5'], async () => {
  generationService.setSessionGeneration(5);
  if (detailScreen.isVisible() && detailScreen['currentPokemon']) {
    await detailScreen.showPokemon(detailScreen['currentPokemon'].name);
  }
});

screen.key(['f6'], async () => {
  generationService.setSessionGeneration(6);
  if (detailScreen.isVisible() && detailScreen['currentPokemon']) {
    await detailScreen.showPokemon(detailScreen['currentPokemon'].name);
  }
});

screen.key(['f7'], async () => {
  generationService.setSessionGeneration(7);
  if (detailScreen.isVisible() && detailScreen['currentPokemon']) {
    await detailScreen.showPokemon(detailScreen['currentPokemon'].name);
  }
});

screen.key(['f8'], async () => {
  generationService.setSessionGeneration(8);
  if (detailScreen.isVisible() && detailScreen['currentPokemon']) {
    await detailScreen.showPokemon(detailScreen['currentPokemon'].name);
  }
});

screen.key(['f9'], async () => {
  generationService.setSessionGeneration(9);
  if (detailScreen.isVisible() && detailScreen['currentPokemon']) {
    await detailScreen.showPokemon(detailScreen['currentPokemon'].name);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});
