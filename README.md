# Pokedex CLI

An interactive command-line Pokedex application built with TypeScript, featuring fuzzy search, ASCII art sprites, and comprehensive Pokemon data.

![Poclidex Screenshot](docs/screenshot.png)

## Quick Start (TL;DR)

```bash
# Install dependencies
sudo apt-get install chafa  # Ubuntu/Debian
brew install chafa          # macOS

# Install globally
npm install -g poclidex

# Run
poclidex
```

## Features

- **All Pokemon Generations**: Access data for 1000+ Pokemon from all generations
- **Fuzzy Search with Autocomplete**: Intelligent search with real-time suggestions
- **ASCII Art Sprites**: Pokemon sprites rendered in your terminal using Chafa with truecolor (16M colors)
- **Comprehensive Stats Display**:
  - Base stats with visual progress bars
  - EV (Effort Value) yield
  - Abilities (including hidden abilities)
  - Types with color coding
- **Evolution Chains**: View complete evolution families with E key navigation
- **Pokedex Color Palette**: Authentic Pokedex-themed UI
- **Keyboard Navigation**: Vim-style keybindings supported

## Prerequisites

- **Node.js** 18+ (for ESM support)
- **npm** or **yarn**
- **chafa** (for ASCII art sprite rendering)

### Installing Chafa

**Ubuntu/Debian:**
```bash
sudo apt-get install chafa
```

**macOS:**
```bash
brew install chafa
```

**Arch Linux:**
```bash
sudo pacman -S chafa
```

**Note**: The application will work without Chafa installed, but Pokemon sprites will not be displayed.

## Installation

1. Clone or navigate to the repository:
```bash
cd pokedex
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run the application:
```bash
npm start
```

Alternatively, build and run in one command:
```bash
npm run dev
```

## Usage

### Shell Completion (Optional)

Enable tab completion for Pokemon names in your shell:

**Bash:**
```bash
# Add to ~/.bashrc
eval "$(poclidex --completion bash)"
```

**Zsh:**
```bash
# Add to ~/.zshrc
eval "$(poclidex --completion zsh)"
```

After adding the line, restart your shell or run `source ~/.bashrc` (or `~/.zshrc` for Zsh).

Now you can type `poclidex char<TAB>` and it will autocomplete to Pokemon names like `charizard`, `charmander`, etc.

### Navigation

**Home Screen (Pokemon List):**
- `Arrow Keys` or `j/k` - Navigate up/down through Pokemon list
- `Enter` - Select Pokemon to view details
- `Ctrl+S` - Focus search box (works from anywhere - returns to home if on detail screen)
- `g` - Jump to top of list
- `G` - Jump to bottom of list
- `Q` or `Ctrl+C` - Quit application

**Search Box:**
- Type to search for Pokemon by name (fuzzy matching)
- Type a number to search by Pokedex ID
- `Arrow Down` - Navigate to autocomplete suggestions
- `Enter` - Select autocomplete suggestion
- `Esc` - Clear search and return to list

**Detail Screen:**
- `E` - Navigate to evolution (select from menu if multiple options)
- `Ctrl+S` - Return to home and focus search (quick Pokemon lookup)
- `Esc` or `B` - Return to Pokemon list
- `Q` or `Ctrl+C` - Quit application

### Search Examples

- **By name**: Type `pika` to find Pikachu (fuzzy matching works)
- **By ID**: Type `25` to find Pokemon #25 (Pikachu)
- **Partial match**: Type `char` to find Charizard, Charmander, Charmeleon

## Project Structure

```
pokedex/
├── src/
│   ├── api/              # Pokemon API client and types
│   ├── services/         # Business logic (search, data, images)
│   ├── ui/
│   │   ├── screens/      # Home and detail screens
│   │   ├── components/   # Reusable UI components
│   │   └── theme.ts      # Color palette
│   ├── models/           # Data transformation
│   ├── utils/            # Utilities (cache, etc.)
│   └── index.ts          # Entry point
├── dist/                 # Compiled JavaScript
└── package.json
```

## Technology Stack

- **TypeScript** - Type-safe development
- **Blessed** - Terminal UI framework
- **pokedex-promise-v2** - Pokemon API wrapper
- **fuzzysort** - Fuzzy search and autocomplete
- **Chafa** - Image to ASCII conversion

## Development

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled application
- `npm run dev` - Build and run in one command
- `npm run watch` - Watch mode for development
- `npm run debug-colors` - Test and debug terminal color support

### Architecture

The application follows a layered architecture:

- **API Layer**: Wraps pokedex-promise-v2 with TypeScript types
- **Services Layer**: Business logic for Pokemon data, search, and image conversion
- **Models Layer**: Data transformation between API and UI formats
- **UI Layer**: Blessed-based terminal interface with screens and components
- **Caching**: LRU cache for Pokemon data and rendered sprites

## Data Sources

All Pokemon data is fetched from the [PokeAPI v2](https://pokeapi.co/), a free and open Pokemon API.

## Color Palette

The application uses the classic Pokedex color scheme:

- **Red** (#CC0000) - Headers and borders
- **Yellow** (#FFCB05) - Pokemon names and highlights
- **Blue** (#3D7DCA) - Stats and info
- **Navy** (#003A70) - Search background

Type-specific colors are used for Pokemon types (Fire: red/orange, Water: blue, Grass: green, etc.)

## Troubleshooting

### Color Support Issues

**Sprites look washed out or limited to 256 colors:**

The app automatically detects your terminal's color capabilities. For the best experience with vibrant, full-color sprites, your terminal should support **truecolor** (16 million colors).

**Check your terminal's color support:**
```bash
npm run debug-colors
```

Or run the standalone test:
```bash
./scripts/test-colors.sh
```

**Fix truecolor support:**

1. **Using tmux?** Add to `~/.tmux.conf`:
   ```bash
   set -g default-terminal "screen-256color"
   set -ga terminal-overrides ",*256col*:Tc"
   ```
   Then reload: `tmux source-file ~/.tmux.conf`

2. **Terminal emulator recommendations** (with truecolor support):
   - **macOS**: iTerm2, Kitty, Alacritty, WezTerm
   - **Linux**: Kitty, Alacritty, GNOME Terminal 3.x+, Konsole
   - **Windows**: Windows Terminal, WezTerm

3. **Set environment variable:**
   ```bash
   export COLORTERM=truecolor
   ```

4. **Force color mode:**
   ```bash
   # Force truecolor
   export POKEDEX_COLORS=full
   npm start

   # Or force 256 colors
   export POKEDEX_COLORS=256
   npm start
   ```

**Debug Chafa commands:**
```bash
DEBUG_COLORS=1 npm start
```

### Sprites not displaying

- Ensure Chafa is installed: `chafa --version`
- Check that sprites are downloading (requires internet connection)

### Application crashes on search

- Wait for Pokemon data to finish loading
- Ensure you have a stable internet connection for API calls

### Display issues

- Try resizing your terminal window (minimum 80x24 recommended)
- Use a modern terminal emulator with Unicode support
- If using SSH, ensure `COLORTERM` is forwarded or set on the remote machine

## Contributing

This project was built as a demonstration of TypeScript CLI development with:
- Type-safe API integration
- Terminal UI design
- Fuzzy search implementation
- ASCII art rendering

Feel free to extend it with additional features like:
- Move details and type effectiveness calculator
- Comparison mode for two Pokemon
- Favorites/bookmarks system
- Shiny sprite toggle
- Export Pokemon data to JSON

## License

ISC

## Acknowledgments

- [PokeAPI](https://pokeapi.co/) for the comprehensive Pokemon database
- [Blessed](https://github.com/chjj/blessed) for the terminal UI framework
- [Chafa](https://hpjansson.org/chafa/) for ASCII art rendering
- Pokemon is © Nintendo/Creatures Inc./GAME FREAK inc.
