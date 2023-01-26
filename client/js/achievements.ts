import storage from "./storage";

const NANO_PAYOUT_MULTIPLIER = 10;
const BAN_PAYOUT_MULTIPLIER = 10;

export const getAchievements = (network: Network) => ({
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
    desc: "Kill 10 rats",
    isCompleted() {
      return storage.getRatCount() >= 10;
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
    desc: "Kill 10 skeletons",
    isCompleted() {
      return storage.getSkeletonCount() >= 10;
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
    desc: "Kill 15 spectres",
    isCompleted() {
      return storage.getSpectreCount() >= 15;
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
    desc: "Defeat 25 Werewolves",
    hidden: false,
    isCompleted() {
      return storage.getWerewolfCount() >= 25;
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
    desc: "Defeat 25 Yetis",
    hidden: false,
    isCompleted() {
      return storage.getYetiCount() >= 25;
    },
  },
  RIP: {
    id: 33,
    name: "R.I.P.",
    desc: "Defeat 50 Skeleton Guards",
    hidden: false,
    isCompleted() {
      return storage.getSkeleton3Count() >= 50;
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
    desc: "Kill 50 Wraiths",
    hidden: false,
    isCompleted() {
      return storage.getWraithCount() >= 50;
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
    desc: "Kill 500 cows",
    hidden: true,
    isCompleted() {
      return storage.getCowCount() >= 500;
    },
  },
  FARMER: {
    id: 44,
    name: "Pro Farmer",
    desc: "Kill every monster in the secret level",
    hidden: true,
  },
  WOODLAND: {
    id: 45,
    name: "Woodland",
    desc: "Enter the Woodland",
    hidden: false,
  },
  EXPANSION2: {
    id: 46,
    name: "What's that smell",
    desc: "Kill 250 Trolls",
    hidden: false,
  },
  SCROLL: {
    id: 47,
    name: "Title3",
    desc: "Get rewarded with legendary scrolls",
    hidden: false,
  },
  EXPANSION4: {
    id: 48,
    name: "Title4",
    desc: "Achievement description4",
    hidden: false,
  },
  HARDROCK: {
    id: 49,
    name: "Hard Rock",
    desc: "Kill 250 Stone Golem",
    hidden: false,
    isCompleted() {
      return storage.getCowCount() >= 250;
    },
  },
  GRIMOIRE: {
    id: 50,
    name: "Grimoire",
    desc: "Find The Book of Azrael",
    hidden: false,
  },
  HELLFORGE: {
    id: 51,
    name: "Hellforge",
    desc: "Break the mystical gem on the Altar",
    hidden: false,
  },
  STONEHENGE: {
    id: 52,
    name: "Stonehenge",
    desc: "Activate all magic stones",
    hidden: false,
  },
  STARGATE: {
    id: 53,
    name: "Stargate",
    desc: "Enter the portal",
    hidden: false,
  },
  EXPANSION10: {
    id: 54,
    name: "Rune Master",
    desc: "Combine runes to create a higher ranked one",
    hidden: false,
  },
  KINGDOM: {
    id: 55,
    name: "Kingdom of Heaven",
    desc: "Find the Holy Grail",
    hidden: false,
  },
  EXPANSION12: {
    id: 56,
    name: "The Tomb",
    desc: "Enter the hidden Crypt",
    hidden: false,
  },
  PHARAOH: {
    id: 57,
    name: "Pharaoh",
    desc: "Enter the Temple of Light",
    hidden: false,
  },
  ARCHMAGE: {
    id: 58,
    name: "Archmage",
    desc: "Kill 250 mages",
    hidden: false,
    isCompleted() {
      return storage.getCowCount() >= 250;
    },
  },
  CRUISADE: {
    id: 59,
    name: "Cruisade",
    desc: "Kill 250 Cruisader Skeletons",
    hidden: false,
  },
  DEATHANGEL: {
    id: 60,
    name: "Save your Soul",
    desc: "Kill the Death Angel",
    hidden: false,
  },
  MAGIC8: {
    id: 61,
    name: "Magic 8",
    desc: "Upgrade a legendary item to +8",
    hidden: false,
  },
  BLACKSMITH: {
    id: 62,
    name: "Blacksmith",
    desc: "Forge a Runeword",
    hidden: false,
  },
  ZELDA: {
    id: 63,
    name: "ZELDA",
    desc: "Find the hidden stairs",
    hidden: false,
  },
  EXPANSION20: {
    id: 64,
    name: "Title20",
    desc: "Achievement description20",
    hidden: false,
  },
  // MAGIC8: {
  //   id: 44,
  //   name: "Magic 8",
  //   desc: "Upgrade a high class item to +8",
  //   hidden: true,
  // },
});
