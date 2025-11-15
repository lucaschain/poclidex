import { describe, it, expect } from 'vitest';
import {
  VERSION_GROUP_TO_GENERATION,
  LATEST_VERSION_GROUP_PER_GEN,
  getGenerationFromVersionGroup,
  isVersionGroupInGeneration,
} from './versionGroups.js';

describe('versionGroups', () => {
  describe('VERSION_GROUP_TO_GENERATION', () => {
    it('should map all Gen 1 version groups', () => {
      expect(VERSION_GROUP_TO_GENERATION['red-blue']).toBe(1);
      expect(VERSION_GROUP_TO_GENERATION['yellow']).toBe(1);
    });

    it('should map all Gen 2 version groups', () => {
      expect(VERSION_GROUP_TO_GENERATION['gold-silver']).toBe(2);
      expect(VERSION_GROUP_TO_GENERATION['crystal']).toBe(2);
    });

    it('should map all Gen 3 version groups', () => {
      expect(VERSION_GROUP_TO_GENERATION['ruby-sapphire']).toBe(3);
      expect(VERSION_GROUP_TO_GENERATION['emerald']).toBe(3);
      expect(VERSION_GROUP_TO_GENERATION['firered-leafgreen']).toBe(3);
    });

    it('should map all Gen 6 version groups', () => {
      expect(VERSION_GROUP_TO_GENERATION['x-y']).toBe(6);
      expect(VERSION_GROUP_TO_GENERATION['omega-ruby-alpha-sapphire']).toBe(6);
    });

    it('should map all Gen 9 version groups', () => {
      expect(VERSION_GROUP_TO_GENERATION['scarlet-violet']).toBe(9);
      expect(VERSION_GROUP_TO_GENERATION['the-teal-mask']).toBe(9);
      expect(VERSION_GROUP_TO_GENERATION['the-indigo-disk']).toBe(9);
    });

    it('should have 27 total version groups', () => {
      const versionGroups = Object.keys(VERSION_GROUP_TO_GENERATION);
      expect(versionGroups).toHaveLength(27);
    });

    it('should only contain generations 1-9', () => {
      const generations = Object.values(VERSION_GROUP_TO_GENERATION);
      const uniqueGenerations = [...new Set(generations)];

      expect(Math.min(...uniqueGenerations)).toBe(1);
      expect(Math.max(...uniqueGenerations)).toBe(9);
      expect(uniqueGenerations).toHaveLength(9);
    });
  });

  describe('LATEST_VERSION_GROUP_PER_GEN', () => {
    it('should have latest version group for each generation', () => {
      expect(LATEST_VERSION_GROUP_PER_GEN[1]).toBe('yellow');
      expect(LATEST_VERSION_GROUP_PER_GEN[2]).toBe('crystal');
      expect(LATEST_VERSION_GROUP_PER_GEN[3]).toBe('emerald');
      expect(LATEST_VERSION_GROUP_PER_GEN[4]).toBe('platinum');
      expect(LATEST_VERSION_GROUP_PER_GEN[5]).toBe('black-2-white-2');
      expect(LATEST_VERSION_GROUP_PER_GEN[6]).toBe('omega-ruby-alpha-sapphire');
      expect(LATEST_VERSION_GROUP_PER_GEN[7]).toBe('ultra-sun-ultra-moon');
      expect(LATEST_VERSION_GROUP_PER_GEN[8]).toBe('sword-shield');
      expect(LATEST_VERSION_GROUP_PER_GEN[9]).toBe('scarlet-violet');
    });

    it('should have exactly 9 generations', () => {
      const generations = Object.keys(LATEST_VERSION_GROUP_PER_GEN);
      expect(generations).toHaveLength(9);
    });
  });

  describe('getGenerationFromVersionGroup()', () => {
    it('should return correct generation for Gen 1 version groups', () => {
      expect(getGenerationFromVersionGroup('red-blue')).toBe(1);
      expect(getGenerationFromVersionGroup('yellow')).toBe(1);
    });

    it('should return correct generation for Gen 5 version groups', () => {
      expect(getGenerationFromVersionGroup('black-white')).toBe(5);
      expect(getGenerationFromVersionGroup('black-2-white-2')).toBe(5);
    });

    it('should return correct generation for Gen 8 version groups', () => {
      expect(getGenerationFromVersionGroup('sword-shield')).toBe(8);
      expect(getGenerationFromVersionGroup('the-isle-of-armor')).toBe(8);
      expect(getGenerationFromVersionGroup('brilliant-diamond-shining-pearl')).toBe(8);
      expect(getGenerationFromVersionGroup('legends-arceus')).toBe(8);
    });

    it('should return 9 for unknown version groups', () => {
      expect(getGenerationFromVersionGroup('unknown-version')).toBe(9);
      expect(getGenerationFromVersionGroup('')).toBe(9);
      expect(getGenerationFromVersionGroup('gen-10')).toBe(9);
    });
  });

  describe('isVersionGroupInGeneration()', () => {
    it('should return true for version groups in or before the specified generation', () => {
      expect(isVersionGroupInGeneration('red-blue', 1)).toBe(true);
      expect(isVersionGroupInGeneration('red-blue', 5)).toBe(true);
      expect(isVersionGroupInGeneration('sword-shield', 8)).toBe(true);
      expect(isVersionGroupInGeneration('sword-shield', 9)).toBe(true);
    });

    it('should return false for version groups after the specified generation', () => {
      expect(isVersionGroupInGeneration('sword-shield', 7)).toBe(false);
      expect(isVersionGroupInGeneration('sword-shield', 1)).toBe(false);
      expect(isVersionGroupInGeneration('scarlet-violet', 8)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isVersionGroupInGeneration('yellow', 1)).toBe(true);
      expect(isVersionGroupInGeneration('crystal', 2)).toBe(true);
      expect(isVersionGroupInGeneration('crystal', 1)).toBe(false);
    });

    it('should handle unknown version groups', () => {
      // Unknown version groups default to gen 9
      expect(isVersionGroupInGeneration('unknown', 9)).toBe(true);
      expect(isVersionGroupInGeneration('unknown', 8)).toBe(false);
    });
  });
});
