import { Achievement, AchievementName } from "../../shared/js/types/achievements";
import storage from "./storage";

const NANO_PAYOUT_MULTIPLIER = 10;
const BAN_PAYOUT_MULTIPLIER = 10;

export const DMG_TOTAL = 5000;
export const KILLS_TOTAL = 50;
export const RAT_COUNT = 10;
export const SKELETON_COUNT = 10;
export const SPECTRE_COUNT = 15;
export const YETI_COUNT = 25;
export const WEREWOLF_COUNT = 25;
export const SKELETON3_COUNT = 50;
export const WRAITH_COUNT = 50;
export const COW_COUNT = 500;
export const RAT3_COUNT = 250;
export const GOLEM_COUNT = 250;
export const SKELETON4_COUNT = 2;
export const GHOST_COUNT = 2;
export const MAGE_COUNT = 2;
export const WRAITH2_COUNT = 2;

export const getAchievements = (network: Network): { [key in AchievementName]: Achievement } => ({
  A_TRUE_WARRIOR: {
    id: 1,
    name: "A True Warrior",
    desc: "Find a new weapon",
    nano: 3 * NANO_PAYOUT_MULTIPLIER,
    ban: 75 * BAN_PAYOUT_MULTIPLIER,
  },
  INTO_THE_WILD: {
    id: 2,
    name: "Into the Wild",
    desc: "Venture outside the village",
    nano: 2 * NANO_PAYOUT_MULTIPLIER,
    ban: 50 * BAN_PAYOUT_MULTIPLIER,
  },
  ANGRY_RATS: {
    id: 3,
    name: "Angry Rats",
    desc: `Kill ${RAT_COUNT} rats`,
    isCompleted() {
      return storage.getRatCount() >= RAT_COUNT;
    },
    nano: 5 * NANO_PAYOUT_MULTIPLIER,
    ban: 125 * BAN_PAYOUT_MULTIPLIER,
  },
  SMALL_TALK: {
    id: 4,
    name: "Small Talk",
    desc: "Talk to a non-player character",
    nano: 3 * NANO_PAYOUT_MULTIPLIER,
    ban: 75 * BAN_PAYOUT_MULTIPLIER,
  },
  FAT_LOOT: {
    id: 5,
    name: "Fat Loot",
    desc: "Get a new armor set",
    nano: 5 * NANO_PAYOUT_MULTIPLIER,
    ban: 125 * BAN_PAYOUT_MULTIPLIER,
  },
  UNDERGROUND: {
    id: 6,
    name: "Underground",
    desc: "Explore at least one cave",
    nano: 3 * NANO_PAYOUT_MULTIPLIER,
    ban: 75 * BAN_PAYOUT_MULTIPLIER,
  },
  AT_WORLDS_END: {
    id: 7,
    name: "At World's End",
    desc: "Reach the south shore",
    nano: 5 * NANO_PAYOUT_MULTIPLIER,
    ban: 125 * BAN_PAYOUT_MULTIPLIER,
  },
  COWARD: {
    id: 8,
    name: "Coward",
    desc: "Successfully escape an enemy",
    nano: 4 * NANO_PAYOUT_MULTIPLIER,
    ban: 100 * BAN_PAYOUT_MULTIPLIER,
  },
  TOMB_RAIDER: {
    id: 9,
    name: "Tomb Raider",
    desc: "Find the graveyard",
    nano: 5 * NANO_PAYOUT_MULTIPLIER,
    ban: 125 * BAN_PAYOUT_MULTIPLIER,
  },
  SKULL_COLLECTOR: {
    id: 10,
    name: "Skull Collector",
    desc: `Kill ${SKELETON_COUNT} skeletons`,
    isCompleted() {
      return storage.getSkeletonCount() >= SKELETON_COUNT;
    },
    nano: 8 * NANO_PAYOUT_MULTIPLIER,
    ban: 200 * BAN_PAYOUT_MULTIPLIER,
  },
  NINJA_LOOT: {
    id: 11,
    name: "Ninja Loot",
    desc: "Get an item you didn't fight for",
    nano: 4 * NANO_PAYOUT_MULTIPLIER,
    ban: 100 * BAN_PAYOUT_MULTIPLIER,
  },
  NO_MANS_LAND: {
    id: 12,
    name: "No Man's Land",
    desc: "Travel through the desert",
    nano: 3 * NANO_PAYOUT_MULTIPLIER,
    ban: 75 * BAN_PAYOUT_MULTIPLIER,
  },
  HUNTER: {
    id: 13,
    name: "Hunter",
    desc: "Kill 50 enemies",
    isCompleted() {
      return storage.getTotalKills() >= 50;
    },
    nano: 4 * NANO_PAYOUT_MULTIPLIER,
    ban: 100 * BAN_PAYOUT_MULTIPLIER,
  },
  STILL_ALIVE: {
    id: 14,
    name: "Still Alive",
    desc: "Revive your character five times",
    isCompleted() {
      return storage.getTotalRevives() >= 5;
    },
    nano: 5 * NANO_PAYOUT_MULTIPLIER,
    ban: 125 * BAN_PAYOUT_MULTIPLIER,
  },
  MEATSHIELD: {
    id: 15,
    name: "Meatshield",
    desc: "Take 5,000 points of damage",
    isCompleted() {
      return storage.getTotalDamageTaken() >= 5000;
    },
    nano: 7 * NANO_PAYOUT_MULTIPLIER,
    ban: 175 * BAN_PAYOUT_MULTIPLIER,
  },
  NYAN: {
    id: 16,
    name: "Nyan Cat",
    desc: "Find the Nyan cat",
    nano: 3 * NANO_PAYOUT_MULTIPLIER,
    ban: 75 * BAN_PAYOUT_MULTIPLIER,
  },
  HOT_SPOT: {
    id: 17,
    name: "Hot Spot",
    desc: "Enter the volcanic mountains",
    nano: 3 * NANO_PAYOUT_MULTIPLIER,
    ban: 75 * BAN_PAYOUT_MULTIPLIER,
  },
  SPECTRE_COLLECTOR: {
    id: 18,
    name: "No Fear",
    desc: `Kill ${SPECTRE_COUNT} spectres`,
    isCompleted() {
      return storage.getSpectreCount() >= SPECTRE_COUNT;
    },
    nano: 8 * NANO_PAYOUT_MULTIPLIER,
    ban: 200 * BAN_PAYOUT_MULTIPLIER,
  },
  GEM_HUNTER: {
    id: 19,
    name: "Gem Hunter",
    desc: "Collect all the hidden gems",
    nano: 8 * NANO_PAYOUT_MULTIPLIER,
    ban: 200 * BAN_PAYOUT_MULTIPLIER,
  },
  NANO_POTIONS: {
    id: 20,
    name: "Lucky Find",
    desc: network === "ban" ? "Collect 5 BANANO potions" : "Collect 5 NANO potions",
    nano: 8 * NANO_PAYOUT_MULTIPLIER,
    ban: 200 * BAN_PAYOUT_MULTIPLIER,
  },
  HERO: {
    id: 21,
    name: "Hero",
    desc: "Defeat the Skeleton King",
    nano: 25 * NANO_PAYOUT_MULTIPLIER,
    ban: 625 * BAN_PAYOUT_MULTIPLIER,
  },
  FOXY: {
    id: 22,
    name: "Firefox",
    desc: "Find the Firefox costume",
    hidden: true,
    nano: 2 * NANO_PAYOUT_MULTIPLIER,
    ban: 50 * BAN_PAYOUT_MULTIPLIER,
  },
  FOR_SCIENCE: {
    id: 23,
    name: "For Science",
    desc: "Enter into a portal",
    hidden: true,
    nano: 4 * NANO_PAYOUT_MULTIPLIER,
    ban: 100 * BAN_PAYOUT_MULTIPLIER,
  },
  RICKROLLD: {
    id: 24,
    name: "Rickroll'd",
    desc: "Take some singing lessons",
    hidden: true,
    nano: 6 * NANO_PAYOUT_MULTIPLIER,
    ban: 150 * BAN_PAYOUT_MULTIPLIER,
  },
  XNO: {
    id: 25,
    name: network === "ban" ? "BAN" : "XNO",
    desc: "Complete your first purchase!",
    hidden: false,
  },
  FREEZING_LANDS: {
    id: 26,
    name: "BrrRRrr",
    desc: "Enter the freezing lands",
    hidden: false,
  },
  SKELETON_KEY: {
    id: 27,
    name: "Unique Key",
    desc: "Find the skeleton key",
    hidden: false,
  },
  BLOODLUST: {
    id: 28,
    name: "Bloodlust",
    desc: `Defeat ${WEREWOLF_COUNT} Werewolves`,
    hidden: false,
    isCompleted() {
      return storage.getWerewolfCount() >= WEREWOLF_COUNT;
    },
  },
  SATOSHI: {
    id: 29,
    name: "Satoshi",
    desc: "Have a chat with Satoshi Nakamoto",
    hidden: false,
  },
  WEN: {
    id: 30,
    name: "WEN?",
    desc: "Find a very very large announcement",
    hidden: false,
  },
  INDIANA_JONES: {
    id: 31,
    name: "Indiana Jones",
    desc: "Reassemble the lost artifact",
    hidden: false,
  },
  MYTH_OR_REAL: {
    id: 32,
    name: "Myth or Real",
    desc: `Defeat ${YETI_COUNT} Yetis`,
    hidden: false,
    isCompleted() {
      return storage.getYetiCount() >= YETI_COUNT;
    },
  },
  RIP: {
    id: 33,
    name: "R.I.P.",
    desc: `Defeat ${SKELETON3_COUNT} Skeleton Guards`,
    hidden: false,
    isCompleted() {
      return storage.getSkeleton3Count() >= SKELETON3_COUNT;
    },
  },
  DEAD_NEVER_DIE: {
    id: 34,
    name: "What is dead may never die",
    desc: "Defeat the Skeleton Commander",
    hidden: false,
  },
  WALK_ON_WATER: {
    id: 35,
    name: "Walk on Water",
    desc: "Make your way through the floating ice",
    hidden: false,
  },
  GHOSTBUSTERS: {
    id: 36,
    name: "Ghostbusters",
    desc: `Kill ${WRAITH_COUNT} Wraiths`,
    hidden: false,
    isCompleted() {
      return storage.getWraithCount() >= WRAITH_COUNT;
    },
  },
  BLACK_MAGIC: {
    id: 37,
    name: "Black Magic",
    desc: "Defeat the Necromancer",
    hidden: false,
  },
  LUCKY7: {
    id: 38,
    name: "Lucky 7",
    desc: "Upgrade a high class item to +7",
    hidden: true,
  },
  NOT_SAFU: {
    id: 39,
    name: "Not Safu",
    desc: "Kill a monster with less than 1% HP left",
    hidden: true,
  },
  TICKLE_FROM_UNDER: {
    id: 40,
    name: "Tickle from Under",
    desc: "Be surrounded by 15 zombies",
    hidden: true,
  },
  SECRET_LEVEL: {
    id: 41,
    name: "Leap of faith",
    desc: "Jump into the void",
    hidden: false,
  },
  COW_KING: {
    id: 42,
    name: "I'm the Butcher",
    desc: "Defeat the Cow King",
    hidden: true,
  },
  FRESH_MEAT: {
    id: 43,
    name: "Fresh Meat",
    desc: `Kill ${COW_COUNT} cows`,
    hidden: true,
    isCompleted() {
      return storage.getCowCount() >= COW_COUNT;
    },
  },
  FARMER: {
    id: 44,
    name: "Pro Farmer",
    desc: "Kill every monster in the secret level",
    hidden: true,
  },
  ANTIDOTE: {
    id: 45,
    name: "Antidote",
    desc: `Kill ${RAT3_COUNT} Poison Rats`,
    isCompleted() {
      return storage.getCowCount() >= RAT3_COUNT;
    },
  },
  DISCORD: {
    id: 46,
    name: "Discord",
    desc: "Link your account in Discord<br/><small>Earn 5 legendary upgrade scrolls</small>",
  },
  NFT: {
    id: 47,
    name: "NFT",
    desc: "Retrieve the NFT Alkor is seeking<br/><small>Earn 5 legendary upgrade scrolls</small>",
  },
  UNBREAKABLE: {
    id: 48,
    name: "Unbreakable",
    desc: `Kill ${GOLEM_COUNT} Stone Golem`,
    isCompleted() {
      return storage.getCowCount() >= GOLEM_COUNT;
    },
  },
  WAY_OF_WATER: {
    id: 49,
    name: "Way Of Water",
    desc: "Get your toes wet",
  },
  TEMPLAR: {
    id: 50,
    name: "Templar",
    desc: `Kill ${SKELETON4_COUNT} Cruisader Skeletons`,
    isCompleted() {
      return storage.getSkeleton4Count() >= SKELETON4_COUNT;
    },
  },
  DRAGON: {
    id: 51,
    name: "Dragon",
    desc: "Retrieve the Dragon Wing Olaf is seeking<br/><small>Earn 5 legendary upgrade scrolls</small>",
  },
  STONEHENGE: {
    id: 52,
    name: "Stonehenge",
    desc: "Activate all magic stones",
  },
  ALCHEMIST: {
    id: 53,
    name: "Alchemist",
    desc: "Create the quantum powder",
  },
  INFINITY_STONE: {
    id: 54,
    name: "Infinity Stone",
    desc: "Find a mysterious gem with great powers",
  },
  STARGATE: {
    id: 55,
    name: "Stargate",
    desc: "Enter the portal",
  },
  PERSONAL_WEAPON: {
    id: 56,
    name: "Beam me up Scotty",
    desc: "Go on a quest to find a special weapon",
  },
  CRUISADE: {
    id: 57,
    name: "Cruisade",
    desc: "Find the Holy Grail",
  },
  TOMB: {
    id: 58,
    name: "The Tomb",
    desc: "Enter the hidden Crypt",
  },
  MINE: {
    id: 59,
    name: "Mine",
    desc: "Retrieve the Crystal Victor is seeking<br/><small>Earn 5 legendary upgrade scrolls</small>",
  },
  BOO: {
    id: 60,
    name: "Boo",
    desc: `Kill ${GHOST_COUNT} Ghosts`,
    isCompleted() {
      return storage.getGhostCount() >= GHOST_COUNT;
    },
  },
  ARCHMAGE: {
    id: 61,
    name: "Archmage",
    desc: `Kill ${MAGE_COUNT} Mages`,
    isCompleted() {
      return storage.getMageCount() >= MAGE_COUNT;
    },
  },
  SPECTRAL: {
    id: 62,
    name: "Spectral",
    desc: `Kill ${WRAITH2_COUNT} Spectral Wraiths`,
    isCompleted() {
      return storage.getWraith2Count() >= WRAITH2_COUNT;
    },
  },
  PHARAOH: {
    id: 63,
    name: "Pharaoh",
    desc: "Enter the Temple of Light",
  },
  DEATHANGEL: {
    id: 64,
    name: "Death Angel",
    desc: "Kill Azrael",
  },
  MAGIC8: {
    id: 65,
    name: "Magic 8",
    desc: "Upgrade a legendary item to +8",
  },
  RUNOLOGUE: {
    id: 66,
    name: "Runologue",
    desc: "Find a high level rune",
  },
  BLACKSMITH: {
    id: 67,
    name: "Blacksmith",
    desc: "Forge a Runeword",
  },
  RUNE_MASTER: {
    id: 68,
    name: "Rune Master",
    desc: "Combine 2 high rank runes",
  },
  EMBLEM: {
    id: 69,
    name: "Hero Emblem",
    desc: "Find a powerful artifact abe to enchant items",
    hidden: true,
  },
  SAURON: {
    id: 70,
    name: "Sauron",
    desc: "description for what to do...",
    hidden: true,
  },
  SACRED: {
    id: 71,
    name: "Sacred",
    desc: "Do something<br/><small>Get awarded 5 sacred scrolls.</small>",
    hidden: true,
  },
  MISSTEP: {
    id: 72,
    name: "Misstep",
    desc: "Die from a trap",
    hidden: true,
  },
  ZELDA: {
    id: 73,
    name: "ZELDA",
    desc: "Find the hidden stairs",
    hidden: true,
  },
  GRIMOIRE: {
    id: 74,
    name: "Grimoire",
    desc: "Find The Book of Azrael<br/><small>Get awarded 10% to all resistances</small>",
    hidden: true,
  },
  HELLFORGE: {
    id: 75,
    name: "Hellforge",
    desc: "Break the Mysterious gem on the Altar",
    hidden: true,
  },
  GRAND_MASTER: {
    id: 76,
    name: "Grand Master",
    desc: "Reach lv.70<br/><small>Your offensive skill now does AOE damage</small>",
    hidden: true,
  },
});
