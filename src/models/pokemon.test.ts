import { describe, it, expect } from 'vitest';
import {
  getGeneration,
  capitalizeName,
  formatHeight,
  formatWeight,
  extractStats,
  extractEVYield,
  transformPokemon,
} from './pokemon.js';
import { mockPikachuPokemon, mockPikachuSpecies } from '../../tests/fixtures/pokemon-data.js';

describe('getGeneration', () => {
  it('should return generation 1 for Kanto Pokemon (1-151)', () => {
    expect(getGeneration(1)).toBe(1); // Bulbasaur
    expect(getGeneration(25)).toBe(1); // Pikachu
    expect(getGeneration(151)).toBe(1); // Mew
  });

  it('should return generation 2 for Johto Pokemon (152-251)', () => {
    expect(getGeneration(152)).toBe(2); // Chikorita
    expect(getGeneration(200)).toBe(2); // Misdreavus
    expect(getGeneration(251)).toBe(2); // Celebi
  });

  it('should return generation 3 for Hoenn Pokemon (252-386)', () => {
    expect(getGeneration(252)).toBe(3); // Treecko
    expect(getGeneration(300)).toBe(3); // Skitty
    expect(getGeneration(386)).toBe(3); // Deoxys
  });

  it('should return generation 4 for Sinnoh Pokemon (387-493)', () => {
    expect(getGeneration(387)).toBe(4); // Turtwig
    expect(getGeneration(493)).toBe(4); // Arceus
  });

  it('should return generation 5 for Unova Pokemon (494-649)', () => {
    expect(getGeneration(494)).toBe(5); // Victini
    expect(getGeneration(649)).toBe(5); // Genesect
  });

  it('should return generation 6 for Kalos Pokemon (650-721)', () => {
    expect(getGeneration(650)).toBe(6); // Chespin
    expect(getGeneration(721)).toBe(6); // Volcanion
  });

  it('should return generation 7 for Alola Pokemon (722-809)', () => {
    expect(getGeneration(722)).toBe(7); // Rowlet
    expect(getGeneration(809)).toBe(7); // Melmetal
  });

  it('should return generation 8 for Galar Pokemon (810-905)', () => {
    expect(getGeneration(810)).toBe(8); // Grookey
    expect(getGeneration(905)).toBe(8); // Enamorus
  });

  it('should return generation 9 for Paldea Pokemon (906-1025)', () => {
    expect(getGeneration(906)).toBe(9); // Sprigatito
    expect(getGeneration(1000)).toBe(9); // Gholdengo
    expect(getGeneration(1025)).toBe(9); // Pecharunt
  });

  it('should handle generation boundaries correctly', () => {
    expect(getGeneration(151)).toBe(1);
    expect(getGeneration(152)).toBe(2);
    expect(getGeneration(251)).toBe(2);
    expect(getGeneration(252)).toBe(3);
    expect(getGeneration(386)).toBe(3);
    expect(getGeneration(387)).toBe(4);
  });

  it('should return 1 for invalid/unknown IDs', () => {
    expect(getGeneration(0)).toBe(1);
    expect(getGeneration(2000)).toBe(1);
    expect(getGeneration(-5)).toBe(1);
  });
});

describe('capitalizeName', () => {
  it('should capitalize simple Pokemon names', () => {
    expect(capitalizeName('pikachu')).toBe('Pikachu');
    expect(capitalizeName('charizard')).toBe('Charizard');
    expect(capitalizeName('bulbasaur')).toBe('Bulbasaur');
  });

  it('should handle hyphenated names (regional forms, megas)', () => {
    expect(capitalizeName('charizard-mega-x')).toBe('Charizard Mega X');
    expect(capitalizeName('charizard-mega-y')).toBe('Charizard Mega Y');
    expect(capitalizeName('meowth-alola')).toBe('Meowth Alola');
    expect(capitalizeName('darmanitan-galar-zen')).toBe('Darmanitan Galar Zen');
  });

  it('should handle single letter names', () => {
    expect(capitalizeName('a')).toBe('A');
  });

  it('should handle empty strings', () => {
    expect(capitalizeName('')).toBe('');
  });

  it('should handle names that are already capitalized', () => {
    expect(capitalizeName('Pikachu')).toBe('Pikachu');
    expect(capitalizeName('PIKACHU')).toBe('PIKACHU');
  });

  it('should handle special Pokemon names', () => {
    expect(capitalizeName('mr-mime')).toBe('Mr Mime');
    expect(capitalizeName('mime-jr')).toBe('Mime Jr');
    expect(capitalizeName('type-null')).toBe('Type Null');
  });
});

describe('formatHeight', () => {
  it('should convert decimeters to meters', () => {
    expect(formatHeight(4)).toBe('0.4m'); // Pikachu
    expect(formatHeight(10)).toBe('1.0m');
    expect(formatHeight(17)).toBe('1.7m'); // Charizard
  });

  it('should handle zero height', () => {
    expect(formatHeight(0)).toBe('0.0m');
  });

  it('should handle large heights', () => {
    expect(formatHeight(100)).toBe('10.0m');
    expect(formatHeight(145)).toBe('14.5m');
  });

  it('should format to one decimal place', () => {
    expect(formatHeight(5)).toBe('0.5m');
    expect(formatHeight(15)).toBe('1.5m');
    expect(formatHeight(123)).toBe('12.3m');
  });
});

describe('formatWeight', () => {
  it('should convert hectograms to kilograms', () => {
    expect(formatWeight(60)).toBe('6.0kg'); // Pikachu
    expect(formatWeight(100)).toBe('10.0kg');
    expect(formatWeight(905)).toBe('90.5kg'); // Charizard
  });

  it('should handle zero weight', () => {
    expect(formatWeight(0)).toBe('0.0kg');
  });

  it('should handle large weights', () => {
    expect(formatWeight(1000)).toBe('100.0kg');
    expect(formatWeight(9999)).toBe('999.9kg'); // Groudon/Kyogre
  });

  it('should format to one decimal place', () => {
    expect(formatWeight(5)).toBe('0.5kg');
    expect(formatWeight(15)).toBe('1.5kg');
    expect(formatWeight(123)).toBe('12.3kg');
  });
});

describe('extractStats', () => {
  it('should extract stats into structured object', () => {
    const stats = extractStats(mockPikachuPokemon.stats);

    expect(stats).toEqual({
      hp: 35,
      attack: 55,
      defense: 40,
      specialAttack: 50,
      specialDefense: 50,
      speed: 90,
    });
  });

  it('should handle missing stats gracefully', () => {
    const partialStats = [
      { base_stat: 100, effort: 0, stat: { name: 'hp', url: '' } },
      { base_stat: 50, effort: 0, stat: { name: 'attack', url: '' } },
    ];

    const stats = extractStats(partialStats);

    expect(stats.hp).toBe(100);
    expect(stats.attack).toBe(50);
    expect(stats.defense).toBe(0);
  });

  it('should handle empty stats array', () => {
    const stats = extractStats([]);

    expect(stats).toEqual({
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    });
  });

  it('should handle max stats (255)', () => {
    const maxStats = [
      { base_stat: 255, effort: 0, stat: { name: 'hp', url: '' } },
      { base_stat: 255, effort: 0, stat: { name: 'attack', url: '' } },
    ];

    const stats = extractStats(maxStats);

    expect(stats.hp).toBe(255);
    expect(stats.attack).toBe(255);
  });
});

describe('extractEVYield', () => {
  it('should extract EV yield into structured object', () => {
    const evYield = extractEVYield(mockPikachuPokemon.stats);

    expect(evYield).toEqual({
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 2, // Pikachu gives 2 Speed EVs
    });
  });

  it('should handle Pokemon with multiple EV yields', () => {
    const multiEVStats = [
      { base_stat: 100, effort: 2, stat: { name: 'hp', url: '' } },
      { base_stat: 50, effort: 1, stat: { name: 'attack', url: '' } },
      { base_stat: 50, effort: 0, stat: { name: 'defense', url: '' } },
    ];

    const evYield = extractEVYield(multiEVStats);

    expect(evYield.hp).toBe(2);
    expect(evYield.attack).toBe(1);
    expect(evYield.defense).toBe(0);
  });

  it('should handle empty stats array', () => {
    const evYield = extractEVYield([]);

    expect(evYield).toEqual({
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    });
  });

  it('should handle max EV yield (3)', () => {
    const maxEVStats = [
      { base_stat: 100, effort: 3, stat: { name: 'attack', url: '' } },
    ];

    const evYield = extractEVYield(maxEVStats);

    expect(evYield.attack).toBe(3);
  });
});

describe('transformPokemon', () => {
  it('should transform Pokemon API data to display format', () => {
    const transformed = transformPokemon(mockPikachuPokemon, mockPikachuSpecies);

    expect(transformed.id).toBe(25);
    expect(transformed.name).toBe('pikachu');
    expect(transformed.displayName).toBe('Pikachu');
    expect(transformed.types).toEqual(['electric']);
    expect(transformed.height).toBe(4); // Raw decimeters
    expect(transformed.weight).toBe(60); // Raw hectograms
    expect(transformed.generation).toBe(1);
    expect(transformed.isLegendary).toBe(false);
    expect(transformed.isMythical).toBe(false);
    expect(transformed.genus).toBe('Mouse Pokémon');
  });

  it('should extract sprites correctly', () => {
    const transformed = transformPokemon(mockPikachuPokemon, mockPikachuSpecies);

    expect(transformed.sprite).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png');
    expect(transformed.artworkSprite).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png');
  });

  it('should extract stats correctly', () => {
    const transformed = transformPokemon(mockPikachuPokemon, mockPikachuSpecies);

    expect(transformed.stats).toEqual({
      hp: 35,
      attack: 55,
      defense: 40,
      specialAttack: 50,
      specialDefense: 50,
      speed: 90,
    });
  });

  it('should extract EV yield correctly', () => {
    const transformed = transformPokemon(mockPikachuPokemon, mockPikachuSpecies);

    expect(transformed.evYield).toEqual({
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 2,
    });
  });

  it('should extract abilities correctly', () => {
    const transformed = transformPokemon(mockPikachuPokemon, mockPikachuSpecies);

    expect(transformed.abilities).toHaveLength(2);
    expect(transformed.abilities[0]).toEqual({
      name: 'static',
      isHidden: false,
    });
    expect(transformed.abilities[1]).toEqual({
      name: 'lightning-rod',
      isHidden: true,
    });
  });

  it('should extract flavor text correctly', () => {
    const transformed = transformPokemon(mockPikachuPokemon, mockPikachuSpecies);

    expect(transformed.flavorText).toBe('When several of these Pokémon gather, their electricity could build and cause lightning storms.');
  });

  it('should handle dual-type Pokemon', () => {
    const dualTypePokemon = {
      ...mockPikachuPokemon,
      types: [
        { slot: 1, type: { name: 'fire', url: '' } },
        { slot: 2, type: { name: 'flying', url: '' } },
      ],
    };

    const transformed = transformPokemon(dualTypePokemon, mockPikachuSpecies);

    expect(transformed.types).toEqual(['fire', 'flying']);
  });

  it('should handle legendary Pokemon', () => {
    const legendarySpecies = {
      ...mockPikachuSpecies,
      is_legendary: true,
      is_mythical: false,
    };

    const transformed = transformPokemon(mockPikachuPokemon, legendarySpecies);

    expect(transformed.isLegendary).toBe(true);
    expect(transformed.isMythical).toBe(false);
  });

  it('should handle mythical Pokemon', () => {
    const mythicalSpecies = {
      ...mockPikachuSpecies,
      is_legendary: false,
      is_mythical: true,
    };

    const transformed = transformPokemon(mockPikachuPokemon, mythicalSpecies);

    expect(transformed.isLegendary).toBe(false);
    expect(transformed.isMythical).toBe(true);
  });

  it('should handle Pokemon with no flavor text', () => {
    const noFlavorSpecies = {
      ...mockPikachuSpecies,
      flavor_text_entries: [],
    };

    const transformed = transformPokemon(mockPikachuPokemon, noFlavorSpecies);

    expect(transformed.flavorText).toBe('No description available.');
  });

  it('should handle Pokemon with no genus', () => {
    const noGenusSpecies = {
      ...mockPikachuSpecies,
      genera: [],
    };

    const transformed = transformPokemon(mockPikachuPokemon, noGenusSpecies);

    expect(transformed.genus).toBe('');
  });
});
