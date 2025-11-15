/**
 * Mapping of PokeAPI version groups to their respective generations.
 *
 * Version groups represent game releases (e.g., "red-blue", "sword-shield").
 * This constant mapping allows instant lookups without API calls.
 *
 * Source: https://pokeapi.co/api/v2/version-group/
 */
export const VERSION_GROUP_TO_GENERATION: Record<string, number> = {
  // Generation I
  'red-blue': 1,
  'yellow': 1,

  // Generation II
  'gold-silver': 2,
  'crystal': 2,

  // Generation III
  'ruby-sapphire': 3,
  'emerald': 3,
  'firered-leafgreen': 3,
  'colosseum': 3,
  'xd': 3,

  // Generation IV
  'diamond-pearl': 4,
  'platinum': 4,
  'heartgold-soulsilver': 4,

  // Generation V
  'black-white': 5,
  'black-2-white-2': 5,

  // Generation VI
  'x-y': 6,
  'omega-ruby-alpha-sapphire': 6,

  // Generation VII
  'sun-moon': 7,
  'ultra-sun-ultra-moon': 7,
  'lets-go-pikachu-lets-go-eevee': 7,

  // Generation VIII
  'sword-shield': 8,
  'the-isle-of-armor': 8,
  'the-crown-tundra': 8,
  'brilliant-diamond-shining-pearl': 8,
  'legends-arceus': 8,

  // Generation IX
  'scarlet-violet': 9,
  'the-teal-mask': 9,
  'the-indigo-disk': 9,
};

/**
 * Latest (most complete) version group for each generation.
 * Used for selecting appropriate version group when filtering by generation.
 */
export const LATEST_VERSION_GROUP_PER_GEN: Record<number, string> = {
  1: 'yellow',
  2: 'crystal',
  3: 'emerald',
  4: 'platinum',
  5: 'black-2-white-2',
  6: 'omega-ruby-alpha-sapphire',
  7: 'ultra-sun-ultra-moon',
  8: 'sword-shield',
  9: 'scarlet-violet',
};

/**
 * Get generation number from version group name.
 *
 * @param versionGroupName - Name of the version group (e.g., "red-blue")
 * @returns Generation number (1-9), defaults to 9 if unknown
 */
export function getGenerationFromVersionGroup(versionGroupName: string): number {
  return VERSION_GROUP_TO_GENERATION[versionGroupName] ?? 9;
}

/**
 * Check if a version group belongs to a specific generation or earlier.
 *
 * @param versionGroupName - Name of the version group
 * @param maxGeneration - Maximum generation to check against
 * @returns True if version group is from maxGeneration or earlier
 */
export function isVersionGroupInGeneration(
  versionGroupName: string,
  maxGeneration: number
): boolean {
  const vgGen = getGenerationFromVersionGroup(versionGroupName);
  return vgGen <= maxGeneration;
}
