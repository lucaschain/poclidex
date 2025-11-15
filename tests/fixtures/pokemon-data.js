/**
 * Mock Pokemon data for testing
 */
export const mockPikachuPokemon = {
    id: 25,
    name: 'pikachu',
    height: 4, // 0.4m
    weight: 60, // 6.0kg
    types: [
        {
            slot: 1,
            type: {
                name: 'electric',
                url: 'https://pokeapi.co/api/v2/type/13/',
            },
        },
    ],
    stats: [
        { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
        { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } },
        { base_stat: 40, effort: 0, stat: { name: 'defense', url: '' } },
        { base_stat: 50, effort: 0, stat: { name: 'special-attack', url: '' } },
        { base_stat: 50, effort: 0, stat: { name: 'special-defense', url: '' } },
        { base_stat: 90, effort: 2, stat: { name: 'speed', url: '' } },
    ],
    abilities: [
        {
            is_hidden: false,
            slot: 1,
            ability: {
                name: 'static',
                url: 'https://pokeapi.co/api/v2/ability/9/',
            },
        },
        {
            is_hidden: true,
            slot: 3,
            ability: {
                name: 'lightning-rod',
                url: 'https://pokeapi.co/api/v2/ability/31/',
            },
        },
    ],
    sprites: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
        other: {
            'official-artwork': {
                front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
            },
        },
    },
    species: {
        name: 'pikachu',
        url: 'https://pokeapi.co/api/v2/pokemon-species/25/',
    },
    moves: [
        {
            move: {
                name: 'thunder-shock',
                url: 'https://pokeapi.co/api/v2/move/84/',
            },
            version_group_details: [
                {
                    level_learned_at: 1,
                    move_learn_method: {
                        name: 'level-up',
                        url: 'https://pokeapi.co/api/v2/move-learn-method/1/',
                    },
                    version_group: {
                        name: 'red-blue',
                        url: 'https://pokeapi.co/api/v2/version-group/1/',
                    },
                },
            ],
        },
    ],
};
export const mockPikachuSpecies = {
    id: 25,
    name: 'pikachu',
    generation: {
        name: 'generation-i',
        url: 'https://pokeapi.co/api/v2/generation/1/',
    },
    is_legendary: false,
    is_mythical: false,
    genera: [
        {
            genus: 'Mouse Pokémon',
            language: {
                name: 'en',
                url: 'https://pokeapi.co/api/v2/language/9/',
            },
        },
    ],
    flavor_text_entries: [
        {
            flavor_text: 'When several of these Pokémon gather, their electricity could build and cause lightning storms.',
            language: {
                name: 'en',
                url: 'https://pokeapi.co/api/v2/language/9/',
            },
            version: {
                name: 'omega-ruby',
                url: 'https://pokeapi.co/api/v2/version/25/',
            },
        },
    ],
    evolution_chain: {
        url: 'https://pokeapi.co/api/v2/evolution-chain/10/',
    },
};
export const mockEvolutionChain = {
    id: 10,
    chain: {
        species: {
            name: 'pichu',
            url: 'https://pokeapi.co/api/v2/pokemon-species/172/',
        },
        evolution_details: [],
        evolves_to: [
            {
                species: {
                    name: 'pikachu',
                    url: 'https://pokeapi.co/api/v2/pokemon-species/25/',
                },
                evolution_details: [
                    {
                        min_level: null,
                        min_happiness: 220,
                        min_beauty: null,
                        min_affection: null,
                        needs_overworld_rain: false,
                        party_species: null,
                        party_type: null,
                        relative_physical_stats: null,
                        time_of_day: '',
                        trade_species: null,
                        turn_upside_down: false,
                        trigger: {
                            name: 'level-up',
                            url: 'https://pokeapi.co/api/v2/evolution-trigger/1/',
                        },
                        item: null,
                        gender: null,
                        held_item: null,
                        known_move: null,
                        known_move_type: null,
                        location: null,
                    },
                ],
                evolves_to: [
                    {
                        species: {
                            name: 'raichu',
                            url: 'https://pokeapi.co/api/v2/pokemon-species/26/',
                        },
                        evolution_details: [
                            {
                                min_level: null,
                                min_happiness: null,
                                min_beauty: null,
                                min_affection: null,
                                needs_overworld_rain: false,
                                party_species: null,
                                party_type: null,
                                relative_physical_stats: null,
                                time_of_day: '',
                                trade_species: null,
                                turn_upside_down: false,
                                trigger: {
                                    name: 'use-item',
                                    url: 'https://pokeapi.co/api/v2/evolution-trigger/3/',
                                },
                                item: {
                                    name: 'thunder-stone',
                                    url: 'https://pokeapi.co/api/v2/item/83/',
                                },
                                gender: null,
                                held_item: null,
                                known_move: null,
                                known_move_type: null,
                                location: null,
                            },
                        ],
                        evolves_to: [],
                    },
                ],
            },
        ],
    },
};
export const mockPokemonList = [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
    { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
    { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon/5/' },
    { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
    { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' },
    { name: 'wartortle', url: 'https://pokeapi.co/api/v2/pokemon/8/' },
    { name: 'blastoise', url: 'https://pokeapi.co/api/v2/pokemon/9/' },
    { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    { name: 'chikorita', url: 'https://pokeapi.co/api/v2/pokemon/152/' },
    { name: 'cyndaquil', url: 'https://pokeapi.co/api/v2/pokemon/155/' },
    { name: 'totodile', url: 'https://pokeapi.co/api/v2/pokemon/158/' },
];
//# sourceMappingURL=pokemon-data.js.map