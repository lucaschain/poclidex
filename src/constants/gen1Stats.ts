/**
 * Generation 1 Special stat values for Pokemon #1-151
 *
 * In Gen 1, there was no Sp. Atk/Sp. Def split - just a single "Special" stat.
 * When the split occurred in Gen 2, Pokemon were individually rebalanced.
 *
 * This lookup table provides the original Gen 1 Special stat values.
 * Source: Bulbapedia Gen 1 base stats
 */
export const GEN1_SPECIAL_STATS: Record<number, number> = {
  // Bulbasaur line
  1: 65,    // Bulbasaur
  2: 80,    // Ivysaur
  3: 100,   // Venusaur

  // Charmander line
  4: 50,    // Charmander
  5: 65,    // Charmeleon
  6: 85,    // Charizard

  // Squirtle line
  7: 50,    // Squirtle
  8: 65,    // Wartortle
  9: 85,    // Blastoise

  // Early game bugs/birds
  10: 20,   // Caterpie
  11: 25,   // Metapod
  12: 80,   // Butterfree
  13: 20,   // Weedle
  14: 25,   // Kakuna
  15: 45,   // Beedrill
  16: 35,   // Pidgey
  17: 50,   // Pidgeotto
  18: 70,   // Pidgeot
  19: 25,   // Rattata
  20: 50,   // Raticate

  // Early route Pokemon
  21: 31,   // Spearow
  22: 61,   // Fearow
  23: 40,   // Ekans
  24: 65,   // Arbok
  25: 50,   // Pikachu
  26: 90,   // Raichu
  27: 30,   // Sandshrew
  28: 55,   // Sandslash

  // Nidoran lines
  29: 40,   // Nidoran♀
  30: 55,   // Nidorina
  31: 75,   // Nidoqueen
  32: 40,   // Nidoran♂
  33: 55,   // Nidorino
  34: 75,   // Nidoking

  // Fairy egg group
  35: 60,   // Clefairy
  36: 85,   // Clefable
  37: 65,   // Vulpix
  38: 100,  // Ninetales
  39: 25,   // Jigglypuff
  40: 50,   // Wigglytuff

  // Zubat line and Oddish line
  41: 40,   // Zubat
  42: 75,   // Golbat
  43: 75,   // Oddish
  44: 85,   // Gloom
  45: 100,  // Vileplume
  46: 55,   // Paras
  47: 80,   // Parasect
  48: 40,   // Venonat
  49: 90,   // Venomoth

  // Diglett line and Meowth line
  50: 35,   // Diglett
  51: 50,   // Dugtrio
  52: 40,   // Meowth
  53: 65,   // Persian

  // Psyduck line
  54: 50,   // Psyduck
  55: 80,   // Golduck

  // Mankey line
  56: 35,   // Mankey
  57: 60,   // Primeape

  // Growlithe line and Poliwag line
  58: 50,   // Growlithe
  59: 80,   // Arcanine
  60: 40,   // Poliwag
  61: 50,   // Poliwhirl
  62: 70,   // Poliwrath

  // Abra line
  63: 105,  // Abra
  64: 120,  // Kadabra
  65: 135,  // Alakazam

  // Machop line
  66: 35,   // Machop
  67: 50,   // Machoke
  68: 65,   // Machamp

  // Bellsprout line
  69: 70,   // Bellsprout
  70: 85,   // Weepinbell
  71: 100,  // Victreebel

  // Tentacool line
  72: 100,  // Tentacool
  73: 120,  // Tentacruel

  // Geodude line
  74: 30,   // Geodude
  75: 45,   // Graveler
  76: 55,   // Golem

  // Ponyta line
  77: 65,   // Ponyta
  78: 80,   // Rapidash

  // Slowpoke line
  79: 40,   // Slowpoke
  80: 80,   // Slowbro

  // Magnemite line
  81: 95,   // Magnemite
  82: 120,  // Magneton

  // Regional birds
  83: 58,   // Farfetch'd
  84: 35,   // Doduo
  85: 60,   // Dodrio

  // Seel line
  86: 70,   // Seel
  87: 95,   // Dewgong

  // Grimer line
  88: 40,   // Grimer
  89: 65,   // Muk

  // Shellder line
  90: 45,   // Shellder
  91: 85,   // Cloyster

  // Gastly line
  92: 100,  // Gastly
  93: 115,  // Haunter
  94: 130,  // Gengar

  // Onix and Drowzee line
  95: 30,   // Onix
  96: 90,   // Drowzee
  97: 115,  // Hypno

  // Krabby line
  98: 25,   // Krabby
  99: 50,   // Kingler

  // Voltorb line
  100: 55,  // Voltorb
  101: 80,  // Electrode

  // Exeggcute line
  102: 60,  // Exeggcute
  103: 125, // Exeggutor

  // Cubone line
  104: 40,  // Cubone
  105: 50,  // Marowak

  // Hitmons
  106: 110, // Hitmonlee
  107: 110, // Hitmonchan

  // Lickitung
  108: 60,  // Lickitung

  // Koffing line
  109: 60,  // Koffing
  110: 85,  // Weezing

  // Rhyhorn line
  111: 30,  // Rhyhorn
  112: 45,  // Rhydon

  // Chansey
  113: 105, // Chansey

  // Tangela
  114: 100, // Tangela

  // Kangaskhan
  115: 40,  // Kangaskhan

  // Horsea line
  116: 70,  // Horsea
  117: 95,  // Seadra

  // Goldeen line
  118: 50,  // Goldeen
  119: 80,  // Seaking

  // Staryu line
  120: 70,  // Staryu
  121: 100, // Starmie

  // Mr. Mime
  122: 100, // Mr. Mime

  // Scyther
  123: 55,  // Scyther

  // Jynx
  124: 95,  // Jynx

  // Electabuzz
  125: 85,  // Electabuzz

  // Magmar
  126: 85,  // Magmar

  // Pinsir
  127: 55,  // Pinsir

  // Tauros
  128: 70,  // Tauros

  // Magikarp line
  129: 20,  // Magikarp
  130: 100, // Gyarados

  // Lapras
  131: 95,  // Lapras

  // Ditto
  132: 48,  // Ditto

  // Eevee line
  133: 65,  // Eevee
  134: 110, // Vaporeon
  135: 110, // Jolteon
  136: 110, // Flareon

  // Porygon
  137: 75,  // Porygon

  // Omanyte line
  138: 90,  // Omanyte
  139: 115, // Omastar

  // Kabuto line
  140: 45,  // Kabuto
  141: 70,  // Kabutops

  // Aerodactyl
  142: 60,  // Aerodactyl

  // Snorlax
  143: 65,  // Snorlax

  // Articuno
  144: 125, // Articuno

  // Zapdos
  145: 125, // Zapdos

  // Moltres
  146: 125, // Moltres

  // Dratini line
  147: 50,  // Dratini
  148: 70,  // Dragonair
  149: 100, // Dragonite

  // Mewtwo
  150: 154, // Mewtwo

  // Mew
  151: 100, // Mew
};
