export const colors = {
  // Pokedex brand colors
  pokedexRed: '#CC0000',
  pokemonYellow: '#FFCB05',
  pokedexBlue: '#3D7DCA',
  navyBlue: '#003A70',
  screenBlue: '#3B4CCA',
  lightScreenBlue: '#B0D4FF', // Blueish background for sprite display

  // Type colors
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export const theme = {
  header: {
    fg: colors.pokedexRed,
    bold: true,
  },
  pokemonName: {
    fg: colors.pokemonYellow,
    bold: true,
  },
  stats: {
    fg: colors.pokedexBlue,
  },
  info: {
    fg: 'white',
  },
  label: {
    fg: colors.screenBlue,
    bold: true,
  },
  evYield: {
    fg: '#90EE90', // Light green for EV yield
    bold: true,
  },
  footer: {
    fg: '#888888',
  },
  searchBox: {
    fg: 'white',
    bg: colors.navyBlue,
    border: {
      fg: colors.pokemonYellow,
    },
  },
  list: {
    fg: 'white',
    selected: {
      fg: 'black',
      bg: colors.pokemonYellow,
    },
    border: {
      fg: colors.pokedexRed,
    },
  },
  detailBox: {
    border: {
      fg: colors.pokedexBlue,
    },
  },
};

export function getTypeColor(typeName: string): string {
  const normalizedType = typeName.toLowerCase();
  return colors[normalizedType as keyof typeof colors] || colors.normal;
}
