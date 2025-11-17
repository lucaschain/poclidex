# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive CLI Pokedex built with TypeScript, Blessed (terminal UI), and PokeAPI. Features include fuzzy search, ASCII art sprites via Chafa, comprehensive Pokemon data, and generation-specific filtering (F1-F9 keys).

## Essential Commands

### Development
```bash
npm run build          # Compile TypeScript to dist/
npm start              # Run compiled application
npm run dev            # Build and run in one command
npm run watch          # Watch mode for development
```

### Testing
```bash
npm test               # Run all tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
npm run test:ui        # Run tests with Vitest UI
```

**Running a single test:**
```bash
npm test -- src/models/pokemon.test.ts
npm test -- -t "test name pattern"
```

### Debugging
```bash
npm run debug-colors   # Test terminal color capabilities
./scripts/test-colors.sh  # Standalone color test
DEBUG_COLORS=1 npm start  # Show Chafa command debug output
```

## Releases & Versioning

### Version Bumping

**ALWAYS use npm version commands** to bump versions. This ensures consistency and automatically creates properly formatted git tags.

```bash
npm version patch   # Bug fixes (0.1.2 → 0.1.3)
npm version minor   # New features (0.1.3 → 0.2.0)
npm version major   # Breaking changes (0.1.3 → 1.0.0)
```

These commands automatically:
1. Update version in `package.json`
2. Create a git commit with the version change
3. Create a git tag with "v" prefix (e.g., `v0.1.3`)

### Tag Naming Convention

**CRITICAL: Tags MUST use "v" prefix**

- ✅ Correct: `v0.1.3`, `v0.2.0`, `v1.0.0`
- ❌ Incorrect: `0.1.3`, `0.2.0`, `1.0.0`

The "v" prefix is required because:
- The GitHub Actions publish workflow triggers only on `v*` tags
- It's the npm/semantic versioning standard
- Manual tags without "v" prefix will NOT trigger automated publishing

### Release Workflow

```bash
# 1. Ensure all tests pass
npm test

# 2. Bump version (choose patch/minor/major)
npm version patch

# 3. Push commits and tags to trigger CI/CD
git push && git push --tags
```

**What happens next (automated):**
1. GitHub Actions workflow (`.github/workflows/publish.yml`) is triggered by the `v*` tag
2. CI runs tests and builds the project
3. Package is automatically published to NPM registry
4. GitHub Release is automatically created

### NPM Publishing

**Do NOT manually run `npm publish`** - publishing is fully automated via GitHub Actions.

The `prepublishOnly` script in `package.json` ensures the project is built before publishing.

### Common Mistakes

**❌ Manually creating tags without "v" prefix:**
```bash
git tag 0.1.3        # WRONG - missing "v" prefix
git commit -am "0.1.3"  # WRONG - manual version bump
```

**✅ Correct approach:**
```bash
npm version patch    # Creates v0.1.3 tag automatically
```

**If you accidentally created a tag without "v" prefix:**
```bash
# Delete local and remote tag
git tag -d 0.1.3
git push origin :refs/tags/0.1.3

# Revert the version commit if needed
git reset --hard HEAD~1

# Redo release properly
npm version patch
git push && git push --tags
```

### Verifying a Release

After pushing tags, verify the release succeeded:

1. **GitHub Actions**: Check https://github.com/lucaschain/poclidex/actions
   - Workflow should show green checkmark
   - "Publish to NPM" job should complete successfully

2. **NPM Registry**: Check https://www.npmjs.com/package/poclidex
   - New version should appear within minutes

3. **GitHub Releases**: Check https://github.com/lucaschain/poclidex/releases
   - Automated release should be created with tag

## Architecture

### Layered Architecture

The application follows a clean layered architecture with strict separation of concerns:

1. **API Layer** (`src/api/`): Thin wrapper around pokedex-promise-v2 with TypeScript types
2. **Repository Layer** (`src/repositories/`): Implements `IPokemonRepository` interface, handles API calls and caching
3. **Service Layer** (`src/services/`): Business logic (search, image conversion, generation filtering)
4. **Model Layer** (`src/models/`): Data transformation between API format and display format (`transformPokemon()`)
5. **UI Layer** (`src/ui/`): Blessed-based terminal interface
6. **Utils** (`src/utils/`): LRU cache, terminal detection

### Key Architectural Patterns

**Generation Filtering System:**
- `generationService` (singleton) manages session-level generation setting (F1-F9 keys)
- Pokemon data is filtered to show only types/abilities/moves available in that generation
- Uses `getEffectiveGeneration()` to never show Pokemon before they existed
- Historical data is handled via lookup tables in `src/constants/` (e.g., `abilityChanges.ts`)

**Repository Pattern:**
- `IPokemonRepository` interface defines data operations contract
- `PokemonRepository` implementation handles caching and API calls
- Enables easy testing with mock repositories

**Section-Based UI:**
- Detail screen uses `IDetailSection` interface for all tabs (Stats, Overview, Moves, Evolution)
- `BaseDetailSection` provides common functionality
- `TabbedPanel` component manages tab navigation and section visibility
- Each section independently handles its own rendering via `update(pokemon: PokemonDisplay)`

**Caching Strategy:**
- LRU caches for Pokemon data (200 entries), evolution chains (50 entries), and sprites
- Cache implementation in `src/utils/cache.ts`
- Reduces API calls and improves performance

### Data Flow

```
User Input → Screen (homeScreen/detailScreen)
  → Repository (with cache)
    → API (pokedex-promise-v2)
      → Model transformation (transformPokemon)
        → UI Section updates
          → Blessed rendering
```

### Image Handling

**Sprite Rendering:**
- `imageService` converts Pokemon sprites to ASCII art using Chafa (external binary)
- Supports multiple color modes: full/256/16/8 colors (auto-detected or manual via `POKEDEX_COLORS` env var)
- Color spaces: RGB (fast) vs DIN99d (accurate)
- Dither modes: ordered/diffusion/none
- Symbol sets: block/braille/ascii/half/quad
- All Chafa settings toggleable in detail screen (C/P/D/S keys)
- Terminal capabilities detected via `terminalDetection.ts`

### External Dependencies

**Required:**
- `chafa` binary for sprite rendering (app works without it, but no sprites)
- PokeAPI internet connection for data fetching

## Code Conventions

### TypeScript Configuration
- ES2022 modules (`type: "module"` in package.json)
- Strict mode enabled with comprehensive checks
- All imports must use `.js` extension (ESM requirement): `import { foo } from './bar.js'`

### Testing
- Vitest for unit tests
- Test files: `*.test.ts` alongside source files
- UI components, API wrappers, and repository integration layer excluded from coverage
- Coverage thresholds: 70-75%
- Mock repositories used for testing business logic

### File Organization
```
src/
├── api/              # PokeAPI wrapper + TypeScript types
├── repositories/     # IPokemonRepository interface + implementation
├── services/         # pokemonService, searchService, imageService, generationService
├── models/           # Data transformations (pokemon.ts, pokemonGeneration.ts)
├── constants/        # Historical data (abilityChanges, versionGroups)
├── ui/
│   ├── screens/      # homeScreen.ts, detailScreen.ts
│   ├── components/   # Reusable widgets (pokemonList, searchBox, TabbedPanel)
│   │   └── sections/ # Detail screen tabs (StatsSection, OverviewSection, etc.)
│   └── theme.ts      # Pokedex color palette
└── utils/            # cache.ts, terminalDetection.ts
```

## Important Constraints

### Generation-Specific Data
When modifying Pokemon data display, always consider generation filtering:
- Types can change (e.g., Magnemite gains Steel type in Gen 2)
- Abilities can be replaced across generations (see `abilityChanges.ts`)
- Stats remain constant, but move availability varies
- Use `generationService.getEffectiveGeneration()` for filtering logic

### Terminal Compatibility
- Support 256-color and truecolor terminals
- Graceful degradation when Chafa not installed
- Handle tmux/SSH environments (COLORTERM variable)
- Unicode support required for sprites and UI borders

### API Rate Limiting
- PokeAPI has no authentication but can rate limit
- Always cache API responses (use `LRUCache`)
- Batch requests where possible
- Pokemon list loaded once at startup (100000 limit to get all)

## Environment Variables

```bash
POKEDEX_COLORS=full|256|16|8  # Force color mode (overrides auto-detection)
COLORTERM=truecolor            # Hint terminal supports 16M colors
DEBUG_COLORS=1                 # Show Chafa command debugging
```

## Known Patterns

**Adding a new detail section:**
1. Implement `IDetailSection` or extend `BaseDetailSection`
2. Add to tabs array in `detailScreen.ts`
3. Implement `update(pokemon: PokemonDisplay)` method
4. Section automatically integrated into tab navigation

**Historical data handling:**
- PokeAPI returns only current data
- Historical changes tracked in `src/constants/` lookup tables
- Apply historical filters in `transformPokemon()` based on generation parameter
