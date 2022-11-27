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
  EXPANSION1: {
    id: 45,
    name: "Title1",
    desc: "Achievement description1",
    hidden: false,
  },
  EXPANSION2: {
    id: 46,
    name: "Title2",
    desc: "Achievement description2",
    hidden: false,
  },
  EXPANSION3: {
    id: 47,
    name: "Title3",
    desc: "Achievement description3",
    hidden: false,
  },
  EXPANSION4: {
    id: 48,
    name: "Title4",
    desc: "Achievement description4",
    hidden: false,
  },
  EXPANSION5: {
    id: 49,
    name: "Title5",
    desc: "Achievement description5",
    hidden: false,
  },
  EXPANSION6: {
    id: 50,
    name: "Title6",
    desc: "Achievement description6",
    hidden: false,
  },
  EXPANSION7: {
    id: 51,
    name: "Title7",
    desc: "Achievement description7",
    hidden: false,
  },
  EXPANSION8: {
    id: 52,
    name: "Title8",
    desc: "Achievement description8",
    hidden: false,
  },
  EXPANSION9: {
    id: 53,
    name: "Title9",
    desc: "Achievement description9",
    hidden: false,
  },
  EXPANSION10: {
    id: 54,
    name: "Title10",
    desc: "Achievement description10",
    hidden: false,
  },
  EXPANSION11: {
    id: 55,
    name: "Title11",
    desc: "Achievement description11",
    hidden: false,
  },
  EXPANSION12: {
    id: 56,
    name: "Title12",
    desc: "Achievement description12",
    hidden: false,
  },
  EXPANSION13: {
    id: 57,
    name: "Title13",
    desc: "Achievement description13",
    hidden: false,
  },
  EXPANSION14: {
    id: 58,
    name: "Title14",
    desc: "Achievement description14",
    hidden: false,
  },
  EXPANSION15: {
    id: 59,
    name: "Title15",
    desc: "Achievement description15",
    hidden: false,
  },
  EXPANSION16: {
    id: 60,
    name: "Title16",
    desc: "Achievement description16",
    hidden: false,
  },
  EXPANSION17: {
    id: 61,
    name: "Title17",
    desc: "Achievement description17",
    hidden: false,
  },
  EXPANSION18: {
    id: 62,
    name: "Title18",
    desc: "Achievement description18",
    hidden: false,
  },
  EXPANSION19: {
    id: 63,
    name: "Title19",
    desc: "Achievement description19",
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
