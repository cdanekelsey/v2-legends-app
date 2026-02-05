
import { Game, Legend } from "./types";

export const DEFAULT_TAGS = [
  "Tank", "DPS", "Support", "Healer", "Stealth",
  "Speedrun", "100%", "Hardcore", "Roleplay", "PvP",
  "PvE", "Boss Slayer", "Lore Master", "Pacifist", "Ironman",
  "Nuzlocke", "Soulslike", "Builder"
];

export const MOCK_ROAST_TEXT = `> SYSTEM_ANALYSIS_COMPLETE...
> RATING: 3/10 (TRAGIC)

> ROAST:
  "Using the Rivers of Blood katana in 2026? 
  Daring today, aren't we? This build screams 
  'I watch YouTube tutorials instead of playing.'"

----------------------------------------

> LOADOUT DETECTED:
  [WEAPON]: Rivers of Blood +10
  [VIGOR]: 40 (You will die in one hit)`;

export const GAMES: Game[] = [
  { id: 'khazan', name: 'The First Berserker: Khazan', cover: 'bg-gradient-to-br from-red-900 to-black', image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop" },
  { id: 'bg3', name: "Baldur's Gate 3", cover: 'bg-gradient-to-br from-red-800 to-rose-950', image: "https://images.unsplash.com/photo-1627856013091-fedf7bb0615b?q=80&w=1000&auto=format&fit=crop" },
  { id: 'elden', name: 'Elden Ring', cover: 'bg-gradient-to-br from-yellow-700 to-orange-900', image: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000&auto=format&fit=crop" },
  { id: 'skyrim', name: 'Skyrim', cover: 'bg-gradient-to-br from-slate-700 to-gray-900', image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" },
  { id: 'wow', name: 'World of Warcraft', cover: 'bg-gradient-to-br from-blue-800 to-yellow-600', image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" },
  { id: 'pokemon', name: 'Pokémon', cover: 'bg-gradient-to-br from-yellow-400 to-blue-500', image: "https://images.unsplash.com/photo-1632314818314-16a72464731c?q=80&w=1000&auto=format&fit=crop" },
  { id: 'lol', name: 'League of Legends', cover: 'bg-gradient-to-br from-blue-600 to-cyan-400', image: "https://images.unsplash.com/photo-1560932669-5e3252337a58?q=80&w=1000&auto=format&fit=crop" }
];

export const INITIAL_DATA: { legends: Legend[] } = {
  legends: [
    {
      id: 1,
      name: "Haldor",
      game: "Baldur's Gate 3",
      tags: ["Warlock", "Roleplay", "DPS"],
      signature: "Eldritch Blast",
      color: "from-emerald-900 to-slate-900",
      epitaph: "A warlock bound by a pact he no longer remembers, wielding the fel fire of forgotten gods.",
      visage: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000&auto=format&fit=crop",
      showEpitaph: true,
      showTags: true,
      gallery: [],
      memories: [
        { id: 101, type: 'note', caption: "Pact Sealed", note: "The patron demands a soul. I gave them mine long ago.", date: "Aug 12, 2023", isPinned: true }
      ]
    },
    {
      id: 2,
      name: "Durge",
      game: "Baldur's Gate 3",
      tags: ["Dark Urge", "Hardcore", "Slayer"],
      signature: "Slayer Form",
      color: "from-red-950 to-stone-900",
      epitaph: "Born of dragon blood, forged in the fires of betrayal. His scales tell a story of a thousand wars.",
      visage: "/Users/danekelsey/.gemini/antigravity/brain/b13c1c60-6fed-46cf-879b-6bd26fb9b32d/dark_urge_visage_1770250470701.png",
      showEpitaph: true,
      showTags: true,
      gallery: [],
      memories: [
        { id: 201, type: 'stat', caption: "Build Stats", note: "> STR: 20\n> CON: 18\n> CHA: 8 (Intimidation only)", date: "Sep 01, 2023", rating: 9 }
      ]
    },
    {
      id: 3,
      name: "Shi Yan",
      game: "World of Warcraft",
      tags: ["Monk", "Speedrun", "Healer"],
      signature: "Chi Burst",
      color: "from-blue-900 to-cyan-950",
      epitaph: "The flow of mana is like water; he is the vessel that directs the storm.",
      visage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
      showEpitaph: true,
      showTags: true,
      gallery: [],
      memories: [
        { id: 301, type: 'image', caption: "Peak of Serenity", note: "", src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop", description: "Meditation complete.", date: "Jan 15, 2024" }
      ]
    },
    {
      id: 4,
      name: "Unthur",
      game: "Skyrim",
      tags: ["Stealth", "Archer", "Orc"],
      signature: "Daedric Bow",
      color: "from-green-900 to-stone-950",
      epitaph: "Silent as the grave, sharp as a razor. The last thing they never saw coming.",
      visage: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1000&auto=format&fit=crop",
      showEpitaph: true,
      showTags: true,
      gallery: [],
      memories: [
        { id: 401, type: 'note', caption: "Dark Brotherhood", note: "Hail Sithis.", date: "Nov 11, 2011" }
      ]
    },
    {
      id: 5,
      name: "Fol Hahn",
      game: "Elden Ring",
      tags: ["Pyromancer", "PvP", "Faith"],
      signature: "Giantsflame Take Thee",
      color: "from-orange-700 to-red-950",
      epitaph: "Let the world burn, for from the ashes, a new order shall rise.",
      visage: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1000&auto=format&fit=crop",
      showEpitaph: true,
      showTags: true,
      gallery: [],
      memories: [
        { id: 501, type: 'video', caption: "Invasion", note: "", src: "", description: "1v3 clutch at the Haligtree.", date: "Mar 10, 2022" }
      ]
    },
    {
      id: 6,
      name: "Kadabra",
      game: "Pokémon",
      tags: ["Psychic", "Nuzlocke", "Glass Cannon"],
      signature: "Psychic",
      color: "from-yellow-700 to-purple-900",
      epitaph: "A mind sharper than any spoon. He bends reality with a mere thought.",
      visage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
      showEpitaph: true,
      showTags: true,
      gallery: [],
      memories: [
        { id: 601, type: 'stat', caption: "IV Check", note: "> Sp. Atk: 31\n> Speed: 31\n> Nature: Modest", date: "Oct 12, 2023", rating: 10 }
      ]
    },
    {
      id: 7,
      name: "Khazan",
      game: "The First Berserker: Khazan",
      tags: ["Berserker", "Lore Master", "Hardcore"],
      signature: "Blood Rage",
      color: "from-red-950 to-black",
      epitaph: "Betrayal, revenge, swift spear wielding legendary general.",
      visage: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000&auto=format&fit=crop",
      showEpitaph: true,
      showTags: true,
      gallery: [],
      memories: [
        { id: 701, type: 'note', caption: "Revenge Begins", note: "They took everything. I will take their lives.", date: "Feb 20, 2025", isPinned: true }
      ]
    }
  ]
};
