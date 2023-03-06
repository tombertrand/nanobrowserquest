import * as _ from "lodash";

import { toArray } from "../../shared/js/utils";
import { Slot } from "./slots";
import { expForLevel } from "./types/experience";
import { terrainToImageMap } from "./types/map";
import {
  calculateAttackSpeed,
  calculateResistance,
  DEFAULT_ATTACK_ANIMATION_SPEED,
  DEFAULT_ATTACK_SPEED,
  elements,
  enchantToDisplayMap,
  getRandomElement,
  getResistance,
  mobEnchant,
  mobResistance,
  PLAYER_MAX_RESISTANCES,
  resistanceToDisplayMap,
} from "./types/resistance";
import {
  getHighestSocketRequirement,
  getJewelRequirement,
  getJewelSkinIndex,
  getRune,
  getRuneFromItem,
  getRuneNameFromItem,
  getRunesBonus,
  getRunewordBonus,
  isRune as isRuneImport,
  RUNE,
  RuneByKind,
  runeKind,
  RuneList,
  Runewords,
} from "./types/rune";
import { kindAsStringToSet, setBonus as setBonusImport, setItems, setItemsNameMap } from "./types/set";
import {
  attackSkillDelay,
  attackSkillDurationMap,
  attackSkillToDamageType,
  attackSkillToResistanceType,
  attackSkillType,
  attackSkillTypeAnimationMap,
  calculateSkillTimeout,
  defenseSkillDelay,
  defenseSkillDurationMap,
  defenseSkillTypeAnimationMap,
  getAttackSkill,
  getDefenseSkill,
  skillToNameMap,
} from "./types/skill";

export const Types: any = {
  Store: {
    EXPANSION1: 1,
    SCROLLUPGRADEHIGH: 2,
    SCROLLUPGRADEMEDIUM: 3,
    SCROLLUPGRADEBLESSED: 4,
    CAPE: 5,
    EXPANSION2: 6,
  },
  Messages: {
    CREATE: 0,
    LOGIN: 1,
    WELCOME: 2,
    SPAWN: 3,
    SPAWN_BATCH: 4,
    DESPAWN: 5,
    MOVE: 6,
    LOOTMOVE: 7,
    AGGRO: 8,
    ATTACK: 9,
    RAISE: 10,
    UNRAISE: 104,
    HIT: 11,
    HURT: 12,
    HURT_SPELL: 13,
    HURT_TRAP: 102,
    HEALTH: 14,
    CHAT: 15,
    LOOT: 16,
    EQUIP: 17,
    AURAS: 18,
    SKILL: 19,
    DROP: 20,
    TELEPORT: 21,
    DAMAGE: 22,
    POPULATION: 23,
    KILL: 24,
    LIST: 25,
    WHO: 26,
    ZONE: 27,
    DESTROY: 28,
    STATS: 29,
    BLINK: 30,
    OPEN: 31,
    CHECK: 32,
    PVP: 33,
    ACHIEVEMENT: 34,
    BOSS_CHECK: 35,
    BAN_PLAYER: 36,
    REQUEST_PAYOUT: 37,
    NOTIFICATION: 38,
    INVENTORY: 39,
    STASH: 40,
    UPGRADE: 41,
    MOVE_ITEM: 42,
    MOVE_ITEMS_TO_INVENTORY: 43,
    UPGRADE_ITEM: 44,
    ANVIL_UPGRADE: 45,
    ANVIL_RECIPE: 46,
    ANVIL_ODDS: 47,
    WAYPOINT: 48,
    WAYPOINTS_UPDATE: 49,
    STORE_ITEMS: 50,
    PURCHASE_CREATE: 51,
    PURCHASE_CANCEL: 52,
    PURCHASE_COMPLETED: 53,
    PURCHASE_ERROR: 54,
    COWLEVEL_START: 55,
    COWLEVEL_INPROGRESS: 56,
    COWLEVEL_END: 57,
    CAST_SPELL: 58,
    SETBONUS: 59,
    PARTY: 60,
    PARTY_ACTIONS: {
      CREATE: 61,
      JOIN: 62,
      REFUSE: 63,
      INVITE: 64,
      LEAVE: 65,
      REMOVE: 66,
      DISBAND: 67,
      LEADER: 68,
      INFO: 69,
      ERROR: 70,
      LOOT: 71,
      HEALTH: 72,
    },
    TRADE: 73,
    TRADE_ACTIONS: {
      REQUEST_SEND: 74,
      REQUEST_RECEIVE: 75,
      REQUEST_ACCEPT: 76,
      REQUEST_REFUSE: 77,
      INFO: 78,
      ERROR: 79,
      START: 80,
      CLOSE: 81,
      PLAYER1_MOVE_ITEM: 82,
      PLAYER2_MOVE_ITEM: 83,
      PLAYER1_STATUS: 84,
      PLAYER2_STATUS: 85,
    },
    SETTINGS: 86,
    MINOTAURLEVEL_START: 87,
    MINOTAURLEVEL_INPROGRESS: 88,
    MINOTAURLEVEL_END: 89,
    FROZEN: 90,
    SLOWED: 106,
    POISONED: 91,
    CURSED: 92,
    MAGICSTONE: 93,
    ALTARCHALICE: 94,
    ALTARSOULSTONE: 95,
    CHALICELEVEL_START: 96,
    CHALICELEVEL_INPROGRESS: 97,
    CHALICELEVEL_END: 98,
    LEVER: 99,
    TREE: 100,
    TRAP: 101,
    STATUE: 103,
    HANDS: 105,
    STONELEVEL_START: 107,
    STONELEVEL_INPROGRESS: 108,
    STONELEVEL_END: 109,
  },

  Entities: {
    WARRIOR: 1,

    // Mobs
    RAT: 2,
    CRAB: 3,
    BAT: 4,
    GOBLIN: 5,
    SKELETON: 6,
    SNAKE: 7,
    SKELETON2: 8,
    OGRE: 9,
    WIZARD: 10,
    EYE: 11,
    SPECTRE: 12,
    DEATHKNIGHT: 13,
    BOSS: 14,
    RAT2: 88,
    BAT2: 89,
    GOBLIN2: 90,
    YETI: 99,
    WEREWOLF: 101,
    SKELETON3: 102,
    SKELETONCOMMANDER: 103,
    SNAKE2: 104,
    WRAITH: 105,
    ZOMBIE: 106,
    NECROMANCER: 108,
    COW: 119,
    COWKING: 120,
    MINOTAUR: 131,
    RAT3: 217,
    GOLEM: 232,
    SKELETON4: 243,
    WORM: 231,
    OCULOTHORAX: 292,
    SNAKE3: 247,
    SNAKE4: 248,
    GHOST: 235,
    SPIDER: 279,
    SPIDER2: 295,
    SPIDERQUEEN: 297,
    BUTCHER: 298,
    SKELETONTEMPLAR: 278,
    SKELETONTEMPLAR2: 228,
    WRAITH2: 277,
    SKELETONBERSERKER: 293,
    MAGE: 236,
    MAGESPELL: 237,
    SHAMAN: 294,
    STATUE: 263,
    STATUE2: 280,
    STATUESPELL: 264,
    STATUE2SPELL: 281,
    DEATHANGEL: 296,
    DEATHANGELSPELL: 218,

    // Armors
    FIREFOX: 20,
    CLOTHARMOR: 21,
    LEATHERARMOR: 22,
    MAILARMOR: 23,
    PLATEARMOR: 24,
    REDARMOR: 25,
    GOLDENARMOR: 26,
    BLUEARMOR: 87,
    HORNEDARMOR: 83,
    FROZENARMOR: 78,
    DIAMONDARMOR: 127,
    EMERALDARMOR: 128,
    DEMONARMOR: 140,
    MYSTICALARMOR: 221,
    BLOODARMOR: 222,
    TEMPLARARMOR: 242,
    PALADINARMOR: 252,

    // Belts
    BELTLEATHER: 85,
    BELTPLATED: 86,
    BELTFROZEN: 91,
    BELTHORNED: 141,
    BELTDIAMOND: 129,
    BELTMINOTAUR: 134,
    BELTEMERALD: 201,
    BELTEXECUTIONER: 207,
    BELTMYSTICAL: 202,
    BELTTEMPLAR: 203,
    BELTDEMON: 204,
    BELTMOON: 205,

    // Capes
    CAPE: 130,

    // Shields
    SHIELDWOOD: 143,
    SHIELDIRON: 144,
    SHIELDPLATE: 145,
    SHIELDRED: 146,
    SHIELDGOLDEN: 147,
    SHIELDBLUE: 148,
    SHIELDHORNED: 149,
    SHIELDFROZEN: 150,
    SHIELDDIAMOND: 151,

    SHIELDEMERALD: 199,
    SHIELDEXECUTIONER: 195,
    SHIELDTEMPLAR: 153,
    SHIELDMYSTICAL: 196,
    SHIELDDRAGON: 197,
    SHIELDDEMON: 198,
    SHIELDMOON: 208,

    // Chests
    CHESTBLUE: 136,
    CHESTGREEN: 223,
    CHESTPURPLE: 224,
    CHESTRED: 225,

    // Objects
    FLASK: 35,
    REJUVENATIONPOTION: 110,
    POISONPOTION: 111,
    BURGER: 36,
    CHEST: 37,
    FIREFOXPOTION: 38,
    NANOPOTION: 67,
    BANANOPOTION: 139,
    GEMRUBY: 68,
    GEMEMERALD: 69,
    GEMAMETHYST: 70,
    GEMTOPAZ: 71,
    GEMSAPPHIRE: 79,
    GOLD: 92,
    SKELETONKEY: 94,
    RAIBLOCKSTL: 95,
    RAIBLOCKSTR: 96,
    RAIBLOCKSBL: 97,
    RAIBLOCKSBR: 98,
    WIRTLEG: 122,
    SKELETONKINGCAGE: 123,
    NECROMANCERHEART: 124,
    COWKINGHORN: 137,
    CHALICE: 245,
    SOULSTONE: 249,
    NFT: 273,
    WING: 274,
    CRYSTAL: 285,
    POWDERBLACK: 286,
    POWDERBLUE: 287,
    POWDERGOLD: 288,
    POWDERGREEN: 289,
    POWDERRED: 290,
    POWDERQUANTUM: 291,

    CAKE: 39,
    SCROLLUPGRADELOW: 74,
    SCROLLUPGRADEMEDIUM: 75,
    SCROLLUPGRADEHIGH: 76,
    SCROLLUPGRADELEGENDARY: 200,
    SCROLLUPGRADEBLESSED: 118,
    SCROLLUPGRADESACRED: 206,
    SCROLLTRANSMUTE: 142,
    STONESOCKET: 192,
    STONEDRAGON: 240,
    STONEHERO: 241,
    JEWELSKULL: 219,
    RINGBRONZE: 80,
    RINGSILVER: 81,
    RINGGOLD: 82,
    RINGPLATINUM: 209,
    RINGNECROMANCER: 115,
    RINGRAISTONE: 117,
    RINGFOUNTAIN: 126,
    RINGMINOTAUR: 132,
    RINGMYSTICAL: 214,
    RINGBALROG: 194,
    RINGCONQUEROR: 210,
    RINGHEAVEN: 211,
    RINGWIZARD: 213,
    AMULETSILVER: 112,
    AMULETGOLD: 113,
    AMULETPLATINUM: 212,
    AMULETCOW: 116,
    AMULETFROZEN: 138,
    AMULETDEMON: 215,
    AMULETMOON: 216,
    AMULETSTAR: 233,
    AMULETSKULL: 269,
    AMULETDRAGON: 270,

    // NPCs
    GUARD: 40,
    KING: 41,
    OCTOCAT: 42,
    ANVIL: 72,
    VILLAGEGIRL: 43,
    VILLAGER: 44,
    PRIEST: 45,
    SCIENTIST: 46,
    AGENT: 47,
    RICK: 48,
    NYAN: 49,
    SORCERER: 50,
    BEACHNPC: 51,
    FORESTNPC: 52,
    DESERTNPC: 53,
    LAVANPC: 54,
    CODER: 55,
    CARLOSMATOS: 109,
    SATOSHI: 73,
    WAYPOINTX: 84,
    WAYPOINTN: 93,
    WAYPOINTO: 193,
    STASH: 114,
    PORTALCOW: 125,
    PORTALMINOTAUR: 135,
    PORTALSTONE: 238,
    PORTALCRYPT: 239,
    PORTALRUINS: 262,
    MAGICSTONE: 220,
    BLUEFLAME: 234,
    ALTARCHALICE: 246,
    ALTARSOULSTONE: 250,
    SECRETSTAIRS: 251,
    SECRETSTAIRS2: 282,
    SECRETSTAIRSUP: 253,
    TOMBDEATHANGEL: 254,
    TOMBANGEL: 255,
    TOMBCROSS: 256,
    TOMBSKULL: 257,
    LEVER: 258,
    LEVER2: 259,
    GRIMOIRE: 268,
    FOSSIL: 283,
    HANDS: 284,
    ALKOR: 260,
    OLAF: 271,
    VICTOR: 272,
    FOX: 276,
    TREE: 261,
    TRAP: 265,
    TRAP2: 266,
    TRAP3: 267,

    // Weapons
    DAGGER: 60,
    SWORD: 61,
    MORNINGSTAR: 62,
    AXE: 63,
    BLUESWORD: 64,
    REDSWORD: 65,
    GOLDENSWORD: 66,
    BLUEAXE: 77,
    BLUEMORNINGSTAR: 107,
    FROZENSWORD: 100,
    DIAMONDSWORD: 121,
    MINOTAURAXE: 133,
    EMERALDSWORD: 152,
    MOONSWORD: 154,
    TEMPLARSWORD: 155,
    SPIKEGLAIVE: 156,
    ECLYPSEDAGGER: 157,
    EXECUTIONERSWORD: 158,
    MYSTICALSWORD: 159,
    DRAGONSWORD: 160,
    HELLHAMMER: 244,

    // Runes
    RUNE,
  },

  Orientations: {
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
    UP_RIGHT: 5,
    UP_LEFT: 6,
    DOWN_RIGHT: 7,
    DOWN_LEFT: 8,
  },

  Keys: {
    ENTER: 13,
    BACKSPACE: 8,
    DELETE: 46,
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    SPACE: 32,
    Q: 81,
    C: 67,
    U: 85,
    I: 73,
    H: 72,
    M: 77,
    O: 79,
    P: 80,
    KEYPAD_4: 100,
    KEYPAD_6: 102,
    KEYPAD_8: 104,
    KEYPAD_2: 98,
    KEYPAD_1: 97,
    1: 49,
    2: 50,
  },
};

Types.expForLevel = expForLevel;
Types.setBonus = setBonusImport;
Types.kindAsStringToSet = kindAsStringToSet;
Types.setItems = setItems;
Types.setItemsNameMap = setItemsNameMap;
Types.runeKind = runeKind;
Types.RuneByKind = RuneByKind;
Types.RuneList = RuneList;
Types.getRuneNameFromItem = getRuneNameFromItem;
Types.getRuneFromItem = getRuneFromItem;
Types.getHighestSocketRequirement = getHighestSocketRequirement;
Types.getJewelRequirement = getJewelRequirement;
Types.getJewelSkinIndex = getJewelSkinIndex;
Types.getRunesBonus = getRunesBonus;
Types.getRune = getRune;
Types.isRune = isRuneImport;
Types.getRunewordBonus = getRunewordBonus;
Types.Runewords = Runewords;
Types.getDefenseSkill = getDefenseSkill;
Types.getAttackSkill = getAttackSkill;
Types.defenseSkillDelay = defenseSkillDelay;
Types.skillToNameMap = skillToNameMap;
Types.attackSkillDelay = attackSkillDelay;
Types.attackSkillTypeAnimationMap = attackSkillTypeAnimationMap;
Types.calculateSkillTimeout = calculateSkillTimeout;
Types.defenseSkillTypeAnimationMap = defenseSkillTypeAnimationMap;
Types.defenseSkillDurationMap = defenseSkillDurationMap;
Types.attackSkillDurationMap = attackSkillDurationMap;
Types.attackSkillToDamageType = attackSkillToDamageType;
Types.attackSkillToResistanceType = attackSkillToResistanceType;
Types.attackSkillType = attackSkillType;
Types.getResistance = getResistance;
Types.getRandomElement = getRandomElement;
Types.resistanceToDisplayMap = resistanceToDisplayMap;
Types.enchantToDisplayMap = enchantToDisplayMap;
Types.mobResistance = mobResistance;
Types.elements = elements;
Types.mobEnchant = mobEnchant;
Types.PLAYER_MAX_RESISTANCES = PLAYER_MAX_RESISTANCES;
Types.DEFAULT_ATTACK_SPEED = DEFAULT_ATTACK_SPEED;
Types.DEFAULT_ATTACK_ANIMATION_SPEED = DEFAULT_ATTACK_ANIMATION_SPEED;
Types.calculateResistance = calculateResistance;
Types.calculateAttackSpeed = calculateAttackSpeed;
Types.terrainToImageMap = terrainToImageMap;

Types.Entities.Potion = [
  Types.Entities.FLASK,
  Types.Entities.FIREFOXPOTION,
  Types.Entities.REJUVENATIONPOTION,
  Types.Entities.NANOPOTION,
  Types.Entities.BANANOPOTION,
];

Types.Entities.Gems = [
  Types.Entities.GEMRUBY,
  Types.Entities.GEMEMERALD,
  Types.Entities.GEMAMETHYST,
  Types.Entities.GEMTOPAZ,
  Types.Entities.GEMSAPPHIRE,
];

Types.Entities.Artifact = [
  Types.Entities.RAIBLOCKSTL,
  Types.Entities.RAIBLOCKSTR,
  Types.Entities.RAIBLOCKSBL,
  Types.Entities.RAIBLOCKSBR,
];

Types.Entities.Weapons = [
  Types.Entities.DAGGER,
  Types.Entities.SWORD,
  Types.Entities.MORNINGSTAR,
  Types.Entities.BLUESWORD,
  Types.Entities.REDSWORD,
  Types.Entities.GOLDENSWORD,
  Types.Entities.BLUEAXE,
  Types.Entities.BLUEMORNINGSTAR,
  Types.Entities.FROZENSWORD,
  Types.Entities.DIAMONDSWORD,
  Types.Entities.MINOTAURAXE,
  Types.Entities.EMERALDSWORD,
  Types.Entities.MOONSWORD,
  Types.Entities.TEMPLARSWORD,
  Types.Entities.SPIKEGLAIVE,
  Types.Entities.ECLYPSEDAGGER,
  Types.Entities.EXECUTIONERSWORD,
  Types.Entities.MYSTICALSWORD,
  Types.Entities.DRAGONSWORD,
  Types.Entities.HELLHAMMER,
];

Types.Entities.Armors = [
  Types.Entities.CLOTHARMOR,
  Types.Entities.LEATHERARMOR,
  Types.Entities.MAILARMOR,
  Types.Entities.PLATEARMOR,
  Types.Entities.REDARMOR,
  Types.Entities.GOLDENARMOR,
  Types.Entities.BLUEARMOR,
  Types.Entities.HORNEDARMOR,
  Types.Entities.FROZENARMOR,
  Types.Entities.DIAMONDARMOR,
  Types.Entities.EMERALDARMOR,
  Types.Entities.DEMONARMOR,
  Types.Entities.MYSTICALARMOR,
  Types.Entities.BLOODARMOR,
  Types.Entities.TEMPLARARMOR,
  Types.Entities.PALADINARMOR,
];

Types.Entities.Belts = [
  Types.Entities.BELTLEATHER,
  Types.Entities.BELTPLATED,
  Types.Entities.BELTFROZEN,
  Types.Entities.BELTFHORNED,
  Types.Entities.BELTDIAMOND,
  Types.Entities.BELTMINOTAUR,
  Types.Entities.BELTEMERALD,
  Types.Entities.BELTEXECUTIONER,
  Types.Entities.BELTMYSTICAL,
  Types.Entities.BELTTEMPLAR,
  Types.Entities.BELTDEMON,
  Types.Entities.BELTMOON,
];

Types.Entities.Shields = [
  Types.Entities.SHIELDWOOD,
  Types.Entities.SHIELDIRON,
  Types.Entities.SHIELDPLATE,
  Types.Entities.SHIELDRED,
  Types.Entities.SHIELDGOLDEN,
  Types.Entities.SHIELDBLUE,
  Types.Entities.SHIELDHORNED,
  Types.Entities.SHIELDFROZEN,
  Types.Entities.SHIELDDIAMOND,
  Types.Entities.SHIELDTEMPLAR,
  Types.Entities.SHIELDEMERALD,
  Types.Entities.SHIELDEXECUTIONER,
  Types.Entities.SHIELDMYSTICAL,
  Types.Entities.SHIELDDRAGON,
  Types.Entities.SHIELDDEMON,
  Types.Entities.SHIELDMOON,
];

Types.Entities.Rings = [
  Types.Entities.RINGBRONZE,
  Types.Entities.RINGSILVER,
  Types.Entities.RINGGOLD,
  Types.Entities.RINGPLATINUM,
  Types.Entities.RINGNECROMANCER,
  Types.Entities.RINGRAISTONE,
  Types.Entities.RINGFOUNTAIN,
  Types.Entities.RINGMINOTAUR,
  Types.Entities.RINGMYSTICAL,
  Types.Entities.RINGBALROG,
  Types.Entities.RINGCONQUEROR,
  Types.Entities.RINGHEAVEN,
  Types.Entities.RINGWIZARD,
];

Types.Entities.Amulets = [
  Types.Entities.AMULETSILVER,
  Types.Entities.AMULETGOLD,
  Types.Entities.AMULETPLATINUM,
  Types.Entities.AMULETCOW,
  Types.Entities.AMULETFROZEN,
  Types.Entities.AMULETDEMON,
  Types.Entities.AMULETMOON,
  Types.Entities.AMULETSTAR,
  Types.Entities.AMULETSKULL,
  Types.Entities.AMULETDRAGON,
];

Types.getGemNameFromKind = function (kind: number) {
  const gems = {
    [Types.Entities.GEMRUBY]: "Ruby",
    [Types.Entities.GEMEMERALD]: "Emerald",
    [Types.Entities.GEMAMETHYST]: "Amethyst",
    [Types.Entities.GEMTOPAZ]: "Topaz",
    [Types.Entities.GEMSAPPHIRE]: "Sapphire",
  };

  return gems[kind] || kind;
};

Types.getArtifactNameFromKind = function (kind: number) {
  const artifact = {
    [Types.Entities.RAIBLOCKSTL]: "Raiblocks top left",
    [Types.Entities.RAIBLOCKSTR]: "Raiblocks top right",
    [Types.Entities.RAIBLOCKSBL]: "Raiblocks bottom left",
    [Types.Entities.RAIBLOCKSBR]: "Raiblocks bottom right",
  };

  return artifact[kind] || kind;
};

export const kinds = {
  warrior: [Types.Entities.WARRIOR, "player"],

  // ID, exp, level
  wizard: [Types.Entities.WIZARD, "mob", 7, 1],
  rat: [Types.Entities.RAT, "mob", 3, 2],
  crab: [Types.Entities.CRAB, "mob", 3, 1],
  bat: [Types.Entities.BAT, "mob", 6, 3],
  goblin: [Types.Entities.GOBLIN, "mob", 8, 5],
  skeleton: [Types.Entities.SKELETON, "mob", 15, 8],
  snake: [Types.Entities.SNAKE, "mob", 25, 10],
  ogre: [Types.Entities.OGRE, "mob", 32, 12],
  skeleton2: [Types.Entities.SKELETON2, "mob", 38, 15],
  eye: [Types.Entities.EYE, "mob", 45, 18],
  spectre: [Types.Entities.SPECTRE, "mob", 53, 21],
  deathknight: [Types.Entities.DEATHKNIGHT, "mob", 65, 24],
  boss: [Types.Entities.BOSS, "mob", 100, 30],
  rat2: [Types.Entities.RAT2, "mob", 80, 22],
  bat2: [Types.Entities.BAT2, "mob", 90, 24],
  goblin2: [Types.Entities.GOBLIN2, "mob", 100, 26],
  werewolf: [Types.Entities.WEREWOLF, "mob", 110, 30],
  yeti: [Types.Entities.YETI, "mob", 120, 32],
  skeleton3: [Types.Entities.SKELETON3, "mob", 120, 34],
  skeletoncommander: [Types.Entities.SKELETONCOMMANDER, "mob", 200, 40],
  snake2: [Types.Entities.SNAKE2, "mob", 120, 38],
  snake3: [Types.Entities.SNAKE3, "mob", 120, 38],
  snake4: [Types.Entities.SNAKE4, "mob", 120, 38],
  wraith: [Types.Entities.WRAITH, "mob", 120, 40],
  zombie: [Types.Entities.ZOMBIE, "mob", 40, 42],
  necromancer: [Types.Entities.NECROMANCER, "mob", 400, 51],
  cow: [Types.Entities.COW, "mob", 25, 49],
  cowking: [Types.Entities.COWKING, "mob", 400, 50],
  minotaur: [Types.Entities.MINOTAUR, "mob", 500, 58],
  rat3: [Types.Entities.RAT3, "mob", 100, 52],
  skeleton4: [Types.Entities.SKELETON4, "mob", 100, 52],
  golem: [Types.Entities.GOLEM, "mob", 100, 52],
  worm: [Types.Entities.WORM, "mob", 100, 52],
  wraith2: [Types.Entities.WRAITH2, "mob", 100, 52],
  ghost: [Types.Entities.GHOST, "mob", 100, 64],
  mage: [Types.Entities.MAGE, "mob", 100, 64],
  shaman: [Types.Entities.SHAMAN, "mob", 100, 64],
  skeletontemplar: [Types.Entities.SKELETONTEMPLAR, "mob", 100, 64],
  skeletontemplar2: [Types.Entities.SKELETONTEMPLAR2, "mob", 100, 64],
  spider: [Types.Entities.SPIDER, "mob", 100, 64],
  spider2: [Types.Entities.SPIDER2, "mob", 100, 64],
  spiderqueen: [Types.Entities.SPIDERQUEEN, "mob", 100, 64],
  butcher: [Types.Entities.BUTCHER, "mob", 100, 64],
  oculothorax: [Types.Entities.OCULOTHORAX, "mob", 100, 64],
  skeletonberserker: [Types.Entities.SKELETONBERSERKER, "mob", 100, 64],
  statue: [Types.Entities.STATUE, "npc", 100, 64],
  statue2: [Types.Entities.STATUE2, "npc", 100, 64],
  deathangel: [Types.Entities.DEATHANGEL, "mob", 500, 70],

  // kind, type, level, damage
  dagger: [Types.Entities.DAGGER, "weapon", "Dagger", 1, 1],
  wirtleg: [Types.Entities.WIRTLEG, "weapon", "Wirt's leg", 1, 2],
  sword: [Types.Entities.SWORD, "weapon", "Sword", 1, 3],
  axe: [Types.Entities.AXE, "weapon", "Axe", 2, 5],
  morningstar: [Types.Entities.MORNINGSTAR, "weapon", "Morning Star", 3, 7],
  bluesword: [Types.Entities.BLUESWORD, "weapon", "Magic Sword", 5, 10],
  redsword: [Types.Entities.REDSWORD, "weapon", "Blazing Sword", 7, 15],
  goldensword: [Types.Entities.GOLDENSWORD, "weapon", "Golden Sword", 16, 20],
  blueaxe: [Types.Entities.BLUEAXE, "weapon", "Frozen Axe", 18, 24],
  bluemorningstar: [Types.Entities.BLUEMORNINGSTAR, "weapon", "Frozen Morning Star", 20, 26],
  frozensword: [Types.Entities.FROZENSWORD, "weapon", "Sapphire Sword", 26, 30],
  diamondsword: [Types.Entities.DIAMONDSWORD, "weapon", "Diamond Sword", 36, 36],
  minotauraxe: [Types.Entities.MINOTAURAXE, "weapon", "Minotaur Axe", 38, 38],
  emeraldsword: [Types.Entities.EMERALDSWORD, "weapon", "Emerald Sword", 40, 40],
  spikeglaive: [Types.Entities.SPIKEGLAIVE, "weapon", "Spike Glaive", 40, 40],
  executionersword: [Types.Entities.EXECUTIONERSWORD, "weapon", "Executioner Sword", 40, 40],
  eclypsedagger: [Types.Entities.ECLYPSEDAGGER, "weapon", "Eclypse Dagger", 40, 40],
  mysticalsword: [Types.Entities.MYSTICALSWORD, "weapon", "Mystical Sword", 40, 40],
  templarsword: [Types.Entities.TEMPLARSWORD, "weapon", "Templar Sword", 40, 40],
  dragonsword: [Types.Entities.DRAGONSWORD, "weapon", "Dragon Sword", 40, 40],
  hellhammer: [Types.Entities.HELLHAMMER, "weapon", "Hell Hammer", 40, 40],
  moonsword: [Types.Entities.MOONSWORD, "weapon", "Moon Partisan", 40, 40],

  // kind, type, level, defense
  firefox: [Types.Entities.FIREFOX, "armor"],
  clotharmor: [Types.Entities.CLOTHARMOR, "armor", "Cloth Armor", 1, 1],
  leatherarmor: [Types.Entities.LEATHERARMOR, "armor", "Leather Armor", 1, 3],
  mailarmor: [Types.Entities.MAILARMOR, "armor", "Mail Armor", 3, 5],
  platearmor: [Types.Entities.PLATEARMOR, "armor", "Plate Armor", 5, 10],
  redarmor: [Types.Entities.REDARMOR, "armor", "Ruby Armor", 7, 15],
  goldenarmor: [Types.Entities.GOLDENARMOR, "armor", "Golden Armor", 10, 20],
  bluearmor: [Types.Entities.BLUEARMOR, "armor", "Frozen Armor", 18, 24],
  hornedarmor: [Types.Entities.HORNEDARMOR, "armor", "Horned Armor", 22, 28],
  frozenarmor: [Types.Entities.FROZENARMOR, "armor", "Sapphire Armor", 26, 30],
  diamondarmor: [Types.Entities.DIAMONDARMOR, "armor", "Diamond Armor", 36, 36],
  emeraldarmor: [Types.Entities.EMERALDARMOR, "armor", "Emerald Armor", 40, 40],
  demonarmor: [Types.Entities.DEMONARMOR, "armor", "Demon Armor", 40, 40],
  mysticalarmor: [Types.Entities.MYSTICALARMOR, "armor", "Mystical Armor", 40, 40],
  bloodarmor: [Types.Entities.BLOODARMOR, "armor", "Blood Armor", 40, 40],
  templararmor: [Types.Entities.TEMPLARARMOR, "armor", "Templar Armor", 40, 40],
  paladinarmor: [Types.Entities.PALADINARMOR, "armor", "Paladin Armor", 40, 40],

  // kind, type, level, defense
  beltleather: [Types.Entities.BELTLEATHER, "belt", "Leather Belt", 4, 2],
  beltplated: [Types.Entities.BELTPLATED, "belt", "Plated Belt", 9, 4],
  beltfrozen: [Types.Entities.BELTFROZEN, "belt", "Sapphire Belt", 24, 10],
  belthorned: [Types.Entities.BELTHORNED, "belt", "Horned Belt", 26, 12],
  beltdiamond: [Types.Entities.BELTDIAMOND, "belt", "Diamond Belt", 34, 14],
  beltminotaur: [Types.Entities.BELTMINOTAUR, "belt", "Minotaur Belt", 38, 18],
  beltemerald: [Types.Entities.BELTEMERALD, "belt", "Emerald Belt", 40, 18],
  beltexecutioner: [Types.Entities.BELTEXECUTIONER, "belt", "Executioner Belt", 40, 18],
  beltmystical: [Types.Entities.BELTMYSTICAL, "belt", "Mystical Belt", 40, 18],
  belttemplar: [Types.Entities.BELTTEMPLAR, "belt", "Templar Belt", 40, 18],
  beltdemon: [Types.Entities.BELTDEMON, "belt", "Demon Belt", 40, 18],
  beltmoon: [Types.Entities.BELTMOON, "belt", "Moon Belt", 40, 18],

  cape: [Types.Entities.CAPE, "cape", "Cape", 20, 2],

  // kind, type, level, defense
  shieldwood: [Types.Entities.SHIELDWOOD, "shield", "Wood Shield", 1, 2],
  shieldiron: [Types.Entities.SHIELDIRON, "shield", "Iron Shield", 3, 3],
  shieldplate: [Types.Entities.SHIELDPLATE, "shield", "Plate Shield", 5, 5],
  shieldred: [Types.Entities.SHIELDRED, "shield", "Red Shield", 7, 7],
  shieldgolden: [Types.Entities.SHIELDGOLDEN, "shield", "Golden Shield", 10, 10],
  shieldblue: [Types.Entities.SHIELDBLUE, "shield", "Frozen Shield", 18, 12],
  shieldhorned: [Types.Entities.SHIELDHORNED, "shield", "Horned Shield", 22, 14],
  shieldfrozen: [Types.Entities.SHIELDFROZEN, "shield", "Sapphire Shield", 26, 16],
  shielddiamond: [Types.Entities.SHIELDDIAMOND, "shield", "Diamond Shield", 36, 18],
  shieldtemplar: [Types.Entities.SHIELDTEMPLAR, "shield", "Templar Shield", 40, 20],
  shieldemerald: [Types.Entities.SHIELDEMERALD, "shield", "Emerald Shield", 40, 20],
  shieldexecutioner: [Types.Entities.SHIELDEXECUTIONER, "shield", "Executioner Shield", 40, 20],
  shieldmystical: [Types.Entities.SHIELDMYSTICAL, "shield", "Mystical Shield", 40, 20],
  shielddragon: [Types.Entities.SHIELDDRAGON, "shield", "Dragon Shield", 40, 20],
  shielddemon: [Types.Entities.SHIELDDEMON, "shield", "Demon Shield", 40, 20],
  shieldmoon: [Types.Entities.SHIELDMOON, "shield", "Moon Shield", 40, 20],

  // kind, type, level
  ringbronze: [Types.Entities.RINGBRONZE, "ring", "Bronze Ring", 1],
  ringsilver: [Types.Entities.RINGSILVER, "ring", "Silver Ring", 9],
  ringgold: [Types.Entities.RINGGOLD, "ring", "Gold Ring", 16],
  ringplatinum: [Types.Entities.RINGPLATINUM, "ring", "Platinum Ring", 45],
  ringconqueror: [Types.Entities.RINGCONQUEROR, "ring", "Conqueror Ring", 50],
  ringheaven: [Types.Entities.RINGHEAVEN, "ring", "Touch of Heaven Ring", 50],
  ringwizard: [Types.Entities.RINGWIZARD, "ring", "Wizard Ring", 50],
  ringnecromancer: [Types.Entities.RINGNECROMANCER, "ring", "Necromancer Death Wish", 38],
  ringraistone: [Types.Entities.RINGRAISTONE, "ring", "Rai Stone", 18],
  ringfountain: [Types.Entities.RINGFOUNTAIN, "ring", "Fountain of Youth", 26],
  ringminotaur: [Types.Entities.RINGMINOTAUR, "ring", "Hell Freeze", 36],
  ringmystical: [Types.Entities.RINGMYSTICAL, "ring", "Oculus", 54],
  ringbalrog: [Types.Entities.RINGBALROG, "ring", "Ring of Power", 58],

  amuletsilver: [Types.Entities.AMULETSILVER, "amulet", "Silver Amulet", 9],
  amuletgold: [Types.Entities.AMULETGOLD, "amulet", "Gold Amulet", 20],
  amuletplatinum: [Types.Entities.AMULETPLATINUM, "amulet", "Platinum Amulet", 45],
  amuletcow: [Types.Entities.AMULETCOW, "amulet", "Holy Cow King Talisman", 34],
  amuletfrozen: [Types.Entities.AMULETFROZEN, "amulet", "Frozen Heart", 34],
  amuletdemon: [Types.Entities.AMULETDEMON, "amulet", "Fiend", 55],
  amuletmoon: [Types.Entities.AMULETMOON, "amulet", "Crescent", 58],
  amuletstar: [Types.Entities.AMULETSTAR, "amulet", "North Star", 60],
  amuletskull: [Types.Entities.AMULETSKULL, "amulet", "White Death", 60],
  amuletdragon: [Types.Entities.AMULETDRAGON, "amulet", "Dragon Eye", 60],

  chestblue: [Types.Entities.CHESTBLUE, "chest", "Blue Chest", 50],
  chestgreen: [Types.Entities.CHESTGREEN, "chest", "Green Chest", 56],
  chestpurple: [Types.Entities.CHESTPURPLE, "chest", "Purple Chest", 60],
  chestred: [Types.Entities.CHESTRED, "chest", "Red Chest", 70],

  flask: [Types.Entities.FLASK, "object"],
  rejuvenationpotion: [Types.Entities.REJUVENATIONPOTION, "object"],
  poisonpotion: [Types.Entities.POISONPOTION, "object"],
  cake: [Types.Entities.CAKE, "object"],
  burger: [Types.Entities.BURGER, "object"],
  chest: [Types.Entities.CHEST, "object"],
  firefoxpotion: [Types.Entities.FIREFOXPOTION, "object"],
  nanopotion: [Types.Entities.NANOPOTION, "object"],
  bananopotion: [Types.Entities.BANANOPOTION, "object"],
  gemruby: [Types.Entities.GEMRUBY, "object"],
  gememerald: [Types.Entities.GEMEMERALD, "object"],
  gemamethyst: [Types.Entities.GEMAMETHYST, "object"],
  gemtopaz: [Types.Entities.GEMTOPAZ, "object"],
  gemsapphire: [Types.Entities.GEMSAPPHIRE, "object"],
  gold: [Types.Entities.GOLD, "object"],
  scrollupgradelow: [Types.Entities.SCROLLUPGRADELOW, "scroll", "Upgrade scroll", 3],
  scrollupgrademedium: [Types.Entities.SCROLLUPGRADEMEDIUM, "scroll", "Upgrade scroll", 6],
  scrollupgradehigh: [Types.Entities.SCROLLUPGRADEHIGH, "scroll", "Superior upgrade scroll", 15],
  scrollupgradelegendary: [Types.Entities.SCROLLUPGRADELEGENDARY, "scroll", "Legendary upgrade scroll", 40],
  scrollupgradeblessed: [Types.Entities.SCROLLUPGRADEBLESSED, "scroll", "Blessed upgrade scroll", 15],
  scrollupgradesacred: [Types.Entities.SCROLLUPGRADESACRED, "scroll", "Sacred upgrade scroll", 40],
  scrolltransmute: [Types.Entities.SCROLLTRANSMUTE, "scroll", "Transmute scroll", 30],
  stonesocket: [Types.Entities.STONESOCKET, "stone", "Socket Stone", 51],
  stonedragon: [Types.Entities.STONEDRAGON, "stone", "Dragon Stone", 60],
  stonehero: [Types.Entities.STONEHERO, "stone", "Hero Emblem", 65],
  jewelskull: [Types.Entities.JEWELSKULL, "jewel", "Skull Jewel", 51],
  skeletonkey: [Types.Entities.SKELETONKEY, "object", "Skeleton Key"],
  raiblockstl: [Types.Entities.RAIBLOCKSTL, "object", "Raiblocks artifact"],
  raiblockstr: [Types.Entities.RAIBLOCKSTR, "object", "Raiblocks artifact"],
  raiblocksbl: [Types.Entities.RAIBLOCKSBL, "object", "Raiblocks artifact"],
  raiblocksbr: [Types.Entities.RAIBLOCKSBR, "object", "Raiblocks artifact"],
  skeletonkingcage: [Types.Entities.SKELETONKINGCAGE, "recipe", "Skeleton King's thoracic cage"],
  necromancerheart: [Types.Entities.NECROMANCERHEART, "recipe", "Necromancer's heart"],
  cowkinghorn: [Types.Entities.COWKINGHORN, "recipe", "Cow King's horn"],
  chalice: [Types.Entities.CHALICE, "item", "Golden Chalice"],
  soulstone: [Types.Entities.SOULSTONE, "item", "Soul Stone"],
  nft: [Types.Entities.NFT, "item", "Stone NFT"],
  wing: [Types.Entities.WING, "item", "Dragon Wing"],
  crystal: [Types.Entities.CRYSTAL, "item", "Crystal"],
  powderblack: [Types.Entities.POWDERBLACK, "item", "Soul Powder"],
  powderblue: [Types.Entities.POWDERBLUE, "item", "Illusion Powder"],
  powdergold: [Types.Entities.POWDERGOLD, "item", "BTC maxi Powder"],
  powdergreen: [Types.Entities.POWDERGREEN, "item", "Poison Powder"],
  powderred: [Types.Entities.POWDERRED, "item", "Blood Powder"],
  powderquantum: [Types.Entities.POWDERQUANTUM, "item", "Quantum Powder"],

  // kind, type, name, level
  "rune-sat": [Types.Entities.RUNE.SAT, "rune", "SAT Rune", 1],
  "rune-al": [Types.Entities.RUNE.AL, "rune", "AL Rune", 2],
  "rune-bul": [Types.Entities.RUNE.BUL, "rune", "BUL Rune", 3],
  "rune-nan": [Types.Entities.RUNE.NAN, "rune", "NAN Rune", 4],
  "rune-mir": [Types.Entities.RUNE.MIR, "rune", "MIR Rune", 6],
  "rune-gel": [Types.Entities.RUNE.GEL, "rune", "GEL Rune", 8],
  "rune-do": [Types.Entities.RUNE.DO, "rune", "DO Rune", 10],
  "rune-ban": [Types.Entities.RUNE.BAN, "rune", "BAN Rune", 12],
  "rune-sol": [Types.Entities.RUNE.SOL, "rune", "SOL Rune", 14],
  "rune-um": [Types.Entities.RUNE.UM, "rune", "UM Rune", 16],
  "rune-hex": [Types.Entities.RUNE.HEX, "rune", "HEX Rune", 18],
  "rune-zal": [Types.Entities.RUNE.ZAL, "rune", "ZAL Rune", 20],
  "rune-vie": [Types.Entities.RUNE.VIE, "rune", "VIE Rune", 22],
  "rune-eth": [Types.Entities.RUNE.ETH, "rune", "ETH Rune", 24],
  "rune-btc": [Types.Entities.RUNE.BTC, "rune", "BTC Rune", 26],
  "rune-vax": [Types.Entities.RUNE.VAX, "rune", "VAX Rune", 28],
  "rune-por": [Types.Entities.RUNE.POR, "rune", "POR Rune", 30],
  "rune-las": [Types.Entities.RUNE.LAS, "rune", "LAS Rune", 32],
  "rune-cham": [Types.Entities.RUNE.CHAM, "rune", "CHAM Rune", 34],
  "rune-dur": [Types.Entities.RUNE.DUR, "rune", "DUR Rune", 36],
  "rune-xno": [Types.Entities.RUNE.XNO, "rune", "XNO Rune", 39],
  "rune-fal": [Types.Entities.RUNE.FAL, "rune", "FAL Rune", 41],
  "rune-kul": [Types.Entities.RUNE.KUL, "rune", "KUL Rune", 44],
  "rune-mer": [Types.Entities.RUNE.MER, "rune", "MER Rune", 47],
  "rune-qua": [Types.Entities.RUNE.QUA, "rune", "QUA Rune", 50],
  "rune-gul": [Types.Entities.RUNE.GUL, "rune", "GUL Rune", 53],
  "rune-ber": [Types.Entities.RUNE.BER, "rune", "BER Rune", 56],
  "rune-tor": [Types.Entities.RUNE.TOR, "rune", "TOR Rune", 59],
  "rune-jah": [Types.Entities.RUNE.JAH, "rune", "JAH Rune", 62],
  "rune-shi": [Types.Entities.RUNE.SHI, "rune", "SHI Rune", 65],
  "rune-vod": [Types.Entities.RUNE.VOD, "rune", "VOD Rune", 68],

  "deathangel-spell": [Types.Entities.DEATHANGELSPELL, "spell", "Bone Spirith", 70],
  "mage-spell": [Types.Entities.MAGESPELL, "spell", "Mage Spell", 60],
  "statue-spell": [Types.Entities.STATUESPELL, "spell", "Fire Ball", 60],
  "statue2-spell": [Types.Entities.STATUE2SPELL, "spell", "Ice Ball", 60],

  guard: [Types.Entities.GUARD, "npc"],
  villagegirl: [Types.Entities.VILLAGEGIRL, "npc"],
  villager: [Types.Entities.VILLAGER, "npc"],
  carlosmatos: [Types.Entities.CARLOSMATOS, "npc"],
  satoshi: [Types.Entities.SATOSHI, "npc"],
  coder: [Types.Entities.CODER, "npc"],
  scientist: [Types.Entities.SCIENTIST, "npc"],
  priest: [Types.Entities.PRIEST, "npc"],
  king: [Types.Entities.KING, "npc"],
  rick: [Types.Entities.RICK, "npc"],
  nyan: [Types.Entities.NYAN, "npc"],
  sorcerer: [Types.Entities.SORCERER, "npc"],
  agent: [Types.Entities.AGENT, "npc"],
  beachnpc: [Types.Entities.BEACHNPC, "npc"],
  forestnpc: [Types.Entities.FORESTNPC, "npc"],
  desertnpc: [Types.Entities.DESERTNPC, "npc"],
  lavanpc: [Types.Entities.LAVANPC, "npc"],
  octocat: [Types.Entities.OCTOCAT, "npc"],
  anvil: [Types.Entities.ANVIL, "npc"],
  waypointx: [Types.Entities.WAYPOINTX, "npc"],
  waypointn: [Types.Entities.WAYPOINTN, "npc"],
  waypointo: [Types.Entities.WAYPOINTO, "npc"],
  stash: [Types.Entities.STASH, "npc"],
  portalcow: [Types.Entities.PORTALCOW, "npc"],
  portalminotaur: [Types.Entities.PORTALMINOTAUR, "npc"],
  portalstone: [Types.Entities.PORTALSTONE, "npc"],
  portalcrypt: [Types.Entities.PORTALCRYPT, "npc"],
  portalruins: [Types.Entities.PORTALRUINS, "npc"],
  magicstone: [Types.Entities.MAGICSTONE, "npc"],
  blueflame: [Types.Entities.BLUEFLAME, "npc"],
  altarchalice: [Types.Entities.ALTARCHALICE, "npc"],
  altarsoulstone: [Types.Entities.ALTARSOULSTONE, "npc"],
  secretstairs: [Types.Entities.SECRETSTAIRS, "npc"],
  secretstairs2: [Types.Entities.SECRETSTAIRS2, "npc"],
  secretstairsup: [Types.Entities.SECRETSTAIRSUP, "npc"],
  tombdeathangel: [Types.Entities.TOMBDEATHANGEL, "npc"],
  tombangel: [Types.Entities.TOMBANGEL, "npc"],
  tombcross: [Types.Entities.TOMBCROSS, "npc"],
  tombskull: [Types.Entities.TOMBSKULL, "npc"],
  lever: [Types.Entities.LEVER, "npc"],
  lever2: [Types.Entities.LEVER2, "npc"],
  grimoire: [Types.Entities.GRIMOIRE, "npc"],
  fossil: [Types.Entities.FOSSIL, "npc"],
  hands: [Types.Entities.HANDS, "npc"],
  alkor: [Types.Entities.ALKOR, "npc"],
  olaf: [Types.Entities.OLAF, "npc"],
  victor: [Types.Entities.VICTOR, "npc"],
  fox: [Types.Entities.FOX, "npc"],
  tree: [Types.Entities.TREE, "npc"],
  trap: [Types.Entities.TRAP, "npc"],
  trap2: [Types.Entities.TRAP2, "npc"],
  trap3: [Types.Entities.TRAP3, "npc"],

  getType: function (kind) {
    return kinds[Types.getKindAsString(kind)][1];
  },
  getMobExp: function (kind) {
    return kinds[Types.getKindAsString(kind)][2];
  },
  getMobLevel: function (kind) {
    return kinds[Types.getKindAsString(kind)][3];
  },
  getBaseLevel: function (kind) {
    return kinds[Types.getKindAsString(kind)][3];
  },
};

Types.rankedWeapons = [
  Types.Entities.DAGGER,
  Types.Entities.SWORD,
  Types.Entities.AXE,
  Types.Entities.MORNINGSTAR,
  Types.Entities.BLUESWORD,
  Types.Entities.REDSWORD,
  Types.Entities.GOLDENSWORD,
  Types.Entities.BLUEAXE,
  Types.Entities.BLUEMORNINGSTAR,
  Types.Entities.FROZENSWORD,
  Types.Entities.DIAMONDSWORD,
  Types.Entities.MINOTAURAXE,
];

Types.rankedArmors = [
  Types.Entities.CLOTHARMOR,
  Types.Entities.LEATHERARMOR,
  Types.Entities.MAILARMOR,
  Types.Entities.PLATEARMOR,
  Types.Entities.REDARMOR,
  Types.Entities.GOLDENARMOR,
  Types.Entities.BLUEARMOR,
  Types.Entities.HORNEDARMOR,
  Types.Entities.FROZENARMOR,
  Types.Entities.DIAMONDARMOR,
  Types.Entities.EMERALDARMOR,
  Types.Entities.DEMONARMOR,
  Types.Entities.MYSTICALARMOR,
  Types.Entities.BLOODARMOR,
  Types.Entities.TEMPLARARMOR,
  Types.Entities.PALADINARMOR,
];

Types.rankedBelts = [
  Types.Entities.BELTLEATHER,
  Types.Entities.BELTPLATED,
  Types.Entities.BELTFROZEN,
  Types.Entities.BELTHORNED,
  Types.Entities.BELTDIAMOND,
  Types.Entities.BELTMINOTAUR,
  Types.Entities.BELTEMERALD,
  Types.Entities.BELTEXECUTIONER,
  Types.Entities.BELTMYSTICAL,
  Types.Entities.BELTTEMPLAR,
  Types.Entities.BELTDEMON,
  Types.Entities.BELTMOON,
];

Types.itemUniqueMap = {
  // name, level, attack
  wirtleg: ["Bored Ape Yacht Club", 1, 5],
  sword: ["Faketoshi", 1, 5],
  axe: ["NonDisclosure Agreement", 2, 8],
  morningstar: ["Block Latte", 3, 10],
  bluesword: ["Acyclic Graph", 5, 15],
  redsword: ["Volcanic Miner", 7, 18],
  goldensword: ["Satoshi's Nephew", 12, 22],
  blueaxe: ["Feeless Cutter", 14, 26],
  bluemorningstar: ["Saylormoon", 16, 28],
  frozensword: ["Broccolish Fury", 20, 32],
  diamondsword: ["Inevitable", 32, 42],
  minotauraxe: ["PoS4QoS", 34, 44],
  emeraldsword: ["Non Fungible Token", 36, 44],
  executionersword: ["The Granfather", 38, 38],
  mysticalsword: ["The Maximalist", 38, 38],
  templarsword: ["TBD", 38, 38],
  dragonsword: ["Balerion the Black Dread", 38, 38],
  moonsword: ["Moon Boy", 38, 38],
  eclypsedagger: ["Ethereum Killer", 38, 38],
  spikeglaive: ["TBD", 38, 38],
  hellhammer: ["Hephasto", 38, 38],

  // Laser Eyes
  // Decentralizer
  // rug pulled
  // shit coin
  // clownbase
  // not your keys not your crypto
  // web3
  // imagine dragon everybody wants to be my enemy

  // name, level, defense
  leatherarmor: ["Representative", 2, 5],
  mailarmor: ["ForeX Guard", 4, 7],
  platearmor: ["Green Alternative", 6, 12],
  redarmor: ["Appia's Road", 8, 17],
  goldenarmor: ["Store of Value", 12, 22],
  bluearmor: ["Firano's Hide", 14, 26],
  hornedarmor: ["RaiBlocks", 20, 30],
  frozenarmor: ["Wall of Encrypted Energy", 30, 32],
  diamondarmor: ["Zero-knowledge Proof", 38, 40],
  emeraldarmor: ["Jungle Warcry", 36, 46],
  demonarmor: ["Explorer's Block", 36, 50],
  mysticalarmor: ["TBD", 36, 50],
  bloodarmor: ["TBD", 36, 50],
  templararmor: ["TBD", 36, 50],
  paladinarmor: ["TBD", 36, 50],

  // name, level, defense
  shieldwood: ["Liquidity Provider", 2, 3],
  shieldiron: ["Bearer Token", 4, 4],
  shieldplate: ["King Louie", 6, 6],
  shieldred: ["Marstronaut", 8, 8],
  shieldgolden: ["1 Ban = 1 Ban", 12, 12],
  shieldblue: ["Cold Storage", 20, 14],
  shieldhorned: ["Do Klost", 24, 16],
  shieldfrozen: ["Probably Nothing", 28, 18],
  shielddiamond: ["Diamond Hands", 38, 20],
  shieldemerald: ["PermaBear", 42, 22],
  shieldtemplar: ["TBD", 42, 22],
  shieldexecutioner: ["TBD", 42, 22],
  shieldmystical: ["TBD", 42, 22],
  shielddragon: ["TBD", 42, 22],
  shieldmoon: ["TBD", 42, 22],
  shielddemon: ["TBD", 42, 22],

  cape: ["Cloak of Levitation", 12, 2],

  // name, level, defense
  beltleather: ["Proof of Wear", 4, 4],
  beltplated: ["Hodler", 9, 6],
  beltfrozen: ["Spam Resistor", 24, 12],
  belthorned: ["Dee-Fye", 28, 14],
  beltdiamond: ["Election scheduler", 38, 20],
  beltminotaur: ["TaaC", 40, 22],
  beltemerald: ["CBDC", 40, 22],
  beltexecutioner: ["TBD", 40, 22],
  beltmystical: ["TBD", 40, 22],
  belttemplar: ["TBD", 40, 22],
  beltdemon: ["TBD", 40, 22],
  beltmoon: ["TBD", 40, 22],
};

Types.isSuperUnique = (itemName: string) =>
  [
    "ringnecromancer",
    "ringraistone",
    "ringfountain",
    "ringminotaur",
    "ringmystical",
    "ringbalrog",
    "ringconqueror",
    "ringheaven",
    "ringwizard",
    "amuletcow",
    "amuletfrozen",
    "amuletdemon",
    "amuletmoon",
    "amuletstar",
    "amuletskull",
    "amuletdragon",
  ].includes(itemName);

Types.getLevel = function (exp: number) {
  var i = 1;
  for (i = 1; i < 135; i++) {
    if (exp < Types.expForLevel[i]) {
      return i;
    }
  }
  return 135;
};
Types.getWeaponRank = function (weaponKind: number) {
  return Types.rankedWeapons.indexOf(weaponKind);
};

Types.getArmorRank = function (armorKind: number) {
  return Types.rankedArmors.indexOf(armorKind);
};
Types.getMobExp = function (mobKind: number) {
  return kinds.getMobExp(mobKind);
};
Types.getMobLevel = function (mobKind: number) {
  return kinds.getMobLevel(mobKind);
};
Types.getBaseLevel = function (kind: number) {
  return kinds.getBaseLevel(kind);
};

Types.isPlayer = function (kind: number) {
  return kinds.getType(kind) === "player";
};

Types.isMob = function (kind: number) {
  return kinds.getType(kind) === "mob";
};

Types.isNpc = function (kind: number) {
  return kinds.getType(kind) === "npc";
};

Types.isSpell = function (kind: number) {
  return kinds.getType(kind) === "spell";
};

Types.isCharacter = function (kind: number) {
  return Types.isMob(kind) || Types.isNpc(kind) || Types.isPlayer(kind);
};

Types.isArmor = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "armor";
  } else {
    return kinds[kindOrString][1] === "armor";
  }
};

Types.isBelt = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "belt";
  } else {
    return kinds[kindOrString][1] === "belt";
  }
};

Types.isCape = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "cape";
  } else {
    return kinds[kindOrString][1] === "cape";
  }
};

Types.isShield = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "shield";
  } else {
    return kinds[kindOrString][1] === "shield";
  }
};

Types.isBoss = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [
      Types.Entities.BOSS,
      Types.Entities.NECROMANCER,
      Types.Entities.SKELETONCOMMANDER,
      Types.Entities.COWKING,
      Types.Entities.MINOTAUR,
      Types.Entities.SKELETONTEMPLAR,
      Types.Entities.SKELETONTEMPLAR2,
      Types.Entities.SPIDERQUEEN,
      Types.Entities.BUTCHER,
      Types.Entities.SHAMAN,
      Types.Entities.DEATHANGEL,
    ].includes(kindOrString);
  } else {
    return [
      "boss",
      "skeletoncommander",
      "necromancer",
      "cowking",
      "minotaur",
      "spiderqueen",
      "butcher",
      "shaman",
      "deathangel",
    ].includes(kindOrString);
  }
};

Types.isMiniBoss = function ({ kind, enchants = [] }: { kind: number; enchants: Enchant[] }) {
  return (
    !Types.isBoss(kind) &&
    ((kind <= Types.Entities.DEATHKNIGHT && enchants.length === 1) ||
      (kind <= Types.Entities.COW && enchants.length === 2) ||
      (kind >= Types.Entities.RAT3 && enchants.length === 3))
  );
};

Types.isScroll = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [
      Types.Entities.SCROLLUPGRADELOW,
      Types.Entities.SCROLLUPGRADEMEDIUM,
      Types.Entities.SCROLLUPGRADEHIGH,
      Types.Entities.SCROLLUPGRADELEGENDARY,
      Types.Entities.SCROLLUPGRADEBLESSED,
      Types.Entities.SCROLLUPGRADESACRED,
      Types.Entities.SCROLLTRANSMUTE,
    ].includes(kindOrString);
  } else {
    return kindOrString?.startsWith("scroll");
  }
};

Types.isStone = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [Types.Entities.STONESOCKET, Types.Entities.STONEDRAGON, Types.Entities.STONEHERO].includes(kindOrString);
  } else {
    return kindOrString?.startsWith("stone");
  }
};

Types.isJewel = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [Types.Entities.JEWELSKULL].includes(kindOrString);
  } else {
    return kindOrString?.startsWith("jewel");
  }
};

Types.isChest = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [
      Types.Entities.CHESTBLUE,
      Types.Entities.CHESTGREEN,
      Types.Entities.CHESTPURPLE,
      Types.Entities.CHESTRED,
    ].includes(kindOrString);
  } else {
    return kindOrString?.startsWith("chest");
  }
};

Types.isWeapon = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "weapon";
  } else {
    return kinds[kindOrString] ? kinds[kindOrString][1] === "weapon" : false;
  }
};

Types.isRing = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "ring";
  } else {
    return kinds[kindOrString][1] === "ring";
  }
};

Types.isAmulet = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "amulet";
  } else {
    return kinds[kindOrString][1] === "amulet";
  }
};

Types.isObject = function (kind: number) {
  return kinds.getType(kind) === "object";
};

Types.isUniqueRing = function (kindOrString: number | string, bonus: number[] = []) {
  if (typeof kindOrString === "number") {
    if (
      [
        Types.Entities.RINGNECROMANCER,
        Types.Entities.RINGRAISTONE,
        Types.Entities.RINGFOUNTAIN,
        Types.Entities.RINGMINOTAUR,
        Types.Entities.RINGMYSTICAL,
        Types.Entities.RINGBALROG,
        Types.Entities.RINGCONQUEROR,
        Types.Entities.RINGHEAVEN,
        Types.Entities.RINGWIZARD,
      ].includes(kindOrString)
    ) {
      return true;
    }

    if (Types.Entities.RINGBRONZE === kindOrString && bonus.length === 2) {
      return true;
    }
    if (Types.Entities.RINGSILVER === kindOrString && bonus.length === 3) {
      return true;
    }
    if (Types.Entities.RINGGOLD === kindOrString && bonus.length === 4) {
      return true;
    }
    if (Types.Entities.RINGPLATINUM === kindOrString && bonus.includes(32)) {
      return true;
    }
  } else {
    if (
      [
        "ringnecromancer",
        "ringraistone",
        "ringfountain",
        "ringminotaur",
        "ringmystical",
        "ringbalrog",
        "ringconqueror",
        "ringheaven",
        "ringwizard",
      ].includes(kindOrString)
    ) {
      return true;
    }
    if ("ringbronze" === kindOrString && bonus.length === 2) {
      return true;
    }
    if ("ringsilver" === kindOrString && bonus.length === 3) {
      return true;
    }
    if ("ringgold" === kindOrString && bonus.length === 4) {
      return true;
    }
    if ("ringplatinum" === kindOrString && bonus.includes(32)) {
      return true;
    }
  }
};

Types.isUniqueAmulet = function (kindOrString: number | string, bonus: number[] = []) {
  // @TODO Think of a unification strategy
  if (typeof bonus === "string") {
    bonus = JSON.parse(bonus);
  }

  if (typeof kindOrString === "number") {
    if (
      [
        Types.Entities.AMULETCOW,
        Types.Entities.AMULETFROZEN,
        Types.Entities.AMULETDEMON,
        Types.Entities.AMULETMOON,
        Types.Entities.AMULETSTAR,
        Types.Entities.AMULETSKULL,
        Types.Entities.AMULETDRAGON,
      ].includes(kindOrString)
    ) {
      return true;
    }
    if (Types.Entities.AMULETSILVER === kindOrString && bonus.length === 3) {
      return true;
    }
    if (Types.Entities.AMULETGOLD === kindOrString && bonus.length === 4) {
      return true;
    }
    if (Types.Entities.AMULETPLATINUM === kindOrString && bonus.includes(32)) {
      return true;
    }
  } else {
    if (
      ["amuletcow", "amuletfrozen", "amuletdemon", "amuletmoon", "amuletstar", "amuletskull", "amuletdragon"].includes(
        kindOrString,
      )
    ) {
      return true;
    }
    if ("amuletsilver" === kindOrString && bonus.length === 3) {
      return true;
    }
    if ("amuletgold" === kindOrString && bonus.length === 4) {
      return true;
    }
    if ("amuletplatinum" === kindOrString && bonus.includes(32)) {
      return true;
    }
  }
};

Types.isUniqueJewel = function (kindOrString: number | string, bonus: number[] = []) {
  if (!Types.isJewel(kindOrString)) return false;

  const elementPercentage = [27, 28, 29, 30, 31];

  let isUnique = false;
  for (let i = 0; i < elementPercentage.length; i++) {
    if (bonus.includes(elementPercentage[i])) {
      isUnique = true;
      break;
    }
  }

  return isUnique;
};

Types.isStaticChest = function (kind: number) {
  return kind === Types.Entities.CHEST;
};

Types.isSingle = function (kindOrString: number | string) {
  if (!kindOrString) return false;
  if (typeof kindOrString === "number") {
    return [
      Types.Entities.SKELETONKINGCAGE,
      Types.Entities.NECROMANCERHEART,
      Types.Entities.COWKINGHORN,
      Types.Entities.CHALICE,
      Types.Entities.SOULSTONE,
      Types.Entities.NFT,
      Types.Entities.WING,
      Types.Entities.CRYSTAL,
      Types.Entities.POWDERBLACK,
      Types.Entities.POWDERBLUE,
      Types.Entities.POWDERGOLD,
      Types.Entities.POWDERGREEN,
      Types.Entities.POWDERRED,
      Types.Entities.POWDERQUANTUM,
    ].includes(kindOrString);
  } else {
    return (
      [
        "skeletonkingcage",
        "necromancerheart",
        "cowkinghorn",
        "chalice",
        "soulstone",
        "nft",
        "wing",
        "crystal",
        "powderblack",
        "powderblue",
        "powdergold",
        "powdergreen",
        "powderred",
        "powderquantum",
      ].includes(kindOrString) ||
      kindOrString.startsWith("skeletonkingcage") ||
      kindOrString.startsWith("necromancerheart") ||
      kindOrString.startsWith("cowkinghorn") ||
      kindOrString.startsWith("chalice") ||
      kindOrString.startsWith("soulstone") ||
      kindOrString.startsWith("nft") ||
      kindOrString.startsWith("wing") ||
      kindOrString.startsWith("crystal") ||
      kindOrString.startsWith("powder")
    );
  }
};

Types.isQuantity = function (kindOrString: number | string) {
  return (
    Types.isScroll(kindOrString) ||
    Types.isChest(kindOrString) ||
    Types.isRune(kindOrString) ||
    Types.isStone(kindOrString)
  );
};

Types.isItem = function (kind: number) {
  return (
    Types.isWeapon(kind) ||
    Types.isArmor(kind) ||
    Types.isRing(kind) ||
    Types.isAmulet(kind) ||
    Types.isBelt(kind) ||
    Types.isCape(kind) ||
    Types.isShield(kind) ||
    Types.isScroll(kind) ||
    Types.isSingle(kind) ||
    Types.isChest(kind) ||
    Types.isRune(kind) ||
    Types.isStone(kind) ||
    Types.isJewel(kind) ||
    (Types.isObject(kind) && !Types.isStaticChest(kind))
  );
};

Types.isSocketItem = function (kind: number) {
  return Types.isWeapon(kind) || Types.isArmor(kind) || Types.isShield(kind);
};

Types.isCorrectTypeForSlot = function (slot: number | string, item: string) {
  switch (slot) {
    case "weapon":
    case Slot.WEAPON:
      return Types.isWeapon(item);
    case "armor":
    case Slot.ARMOR:
      return Types.isArmor(item);
    case "ring":
    case "ring1":
    case "ring2":
    case Slot.RING1:
    case Slot.RING2:
      return Types.isRing(item);
    case "amulet":
    case Slot.AMULET:
      return Types.isAmulet(item);
    case "belt":
    case Slot.BELT:
      return Types.isBelt(item);
    case "cape":
    case Slot.CAPE:
      return Types.isCape(item);
    case "shield":
    case Slot.SHIELD:
      return Types.isShield(item);
  }
  return false;
};

Types.isHealingItem = function (kind: number) {
  return [
    Types.Entities.FLASK,
    Types.Entities.BURGER,
    Types.Entities.NANOPOTION,
    Types.Entities.BANANOPOTION,
    Types.Entities.REJUVENATIONPOTION,
  ].includes(kind);
};

Types.isExpendableItem = function (kind: number) {
  return Types.isHealingItem(kind) || kind === Types.Entities.FIREFOXPOTION || kind === Types.Entities.CAKE;
};

Types.getKindFromString = (kind: string) => kinds[kind]?.[0];

Types.getKindAsString = function (kind: number) {
  if (!kind) return null;
  for (var k in kinds) {
    if (kinds[k][0] === kind) {
      return k;
    }
  }
};

Types.getAliasFromName = function (name: string) {
  if (name === "skeleton2") {
    return "skeleton warrior";
  } else if (name === "eye") {
    return "evil eye";
  } else if (name === "deathknight") {
    return "death knight";
  } else if (name === "boss") {
    return "skeleton king";
  } else if (name === "skeleton3") {
    return "skeleton guard";
  } else if (name === "skeleton4") {
    return "skeleton crusader";
  } else if (name === "golem") {
    return "stone golem";
  } else if (name === "skeletoncommander") {
    return "skeleton commander";
  } else if (name === "carlosmatos") {
    return "carlos matos";
  } else if (name === "lavanpc") {
    return "Wirt";
  } else if (name === "satoshi") {
    return "satoshi nakamoto";
  } else if (name === "rat2") {
    return "undead rat";
  } else if (name === "rat3") {
    return "poison rat";
  } else if (name === "bat2") {
    return "vampire bat";
  } else if (name === "goblin2") {
    return "undead goblin";
  } else if (name === "snake2") {
    return "sea snake";
  } else if (name === "snake3") {
    return "venemous snake";
  } else if (name === "snake4") {
    return "damned snake";
  } else if (name === "cowking") {
    return "cow king";
  } else if (name.startsWith("waypoint")) {
    return "waypoint";
  } else if (name.startsWith("portal")) {
    return "Portal";
  } else if (name === "magicstone") {
    return "Magic Stone";
  } else if (name === "blueflame") {
    return "Magic Flame";
  } else if (name === "altarchalice") {
    return "Altar";
  } else if (name === "altarsoulstone") {
    return "Altar";
  } else if (name.startsWith("secretstairs")) {
    return "Secret Stairs";
  } else if (name === "wraith2") {
    return "Apocalypse Wraith";
  } else if (name === "deathangel") {
    return "Azrael";
  } else if (name === "tombdeathangel") {
    return "Azrael's Tomb";
  } else if (name === "tombangel") {
    return "Fallen Angel Tomb";
  } else if (name === "tombcross") {
    return "Sacred Tomb";
  } else if (name === "tombcross") {
    return "Skull Tomb";
  } else if (name === "skeletonberserker") {
    return "Skeleton Berserker";
  } else if (name === "skeletontemplar") {
    return "Boneshard";
  } else if (name === "skeletontemplar2") {
    return "Bonecrusader";
  } else if (name === "shaman") {
    return "Zul'Gurak";
  } else if (name === "spider") {
    return "Venomweaver Spider";
  } else if (name === "spider2") {
    return "Spellweaver Spider";
  } else if (name === "spiderqueen") {
    return "Arachneia the Queen of Webs";
  } else if (name === "butcher") {
    return "Gorefiend the Butcher";
  }

  return name;
};

Types.waypoints = [
  {
    id: 1,
    name: "Village",
    gridX: 49,
    gridY: 213,
  },
  {
    id: 2,
    name: "No Man's Land",
    gridX: 70,
    gridY: 90,
  },
  {
    id: 3,
    name: "Volcanic Mountains",
    gridX: 63,
    gridY: 51,
  },
  {
    id: 4,
    name: "Freezing Lands",
    gridX: 77,
    gridY: 450,
  },
  {
    id: 5,
    name: "High Plateau",
    gridX: 22,
    gridY: 391,
  },
  {
    id: 6,
    name: "Necromancer Lair",
    gridX: 35,
    gridY: 342,
  },
  {
    id: 7,
    name: "Woodland",
    gridX: 100,
    gridY: 678,
  },
  {
    id: 8,
    name: "Castle ruins",
    gridX: 98,
    gridY: 606,
  },
  {
    id: 9,
    name: "Gateway",
    gridX: 128,
    gridY: 546,
  },
  {
    id: 10,
    name: "Lost Temple",
    gridX: 39,
    gridY: 593,
  },
];

Types.forEachKind = function (callback: any) {
  for (var k in kinds) {
    callback(kinds[k][0], k);
  }
};

Types.forEachArmor = function (callback) {
  Types.forEachKind(function (kind, kindName) {
    if (kind && Types.isArmor(kind)) {
      callback(kind, kindName);
    }
  });
};

Types.forEachMobOrNpcKind = function (callback) {
  Types.forEachKind(function (kind, kindName) {
    if (kind && (Types.isMob(kind) || Types.isNpc(kind))) {
      callback(kind, kindName);
    }
  });
};

Types.forEachArmorKind = function (callback) {
  Types.forEachKind(function (kind, kindName) {
    if (kind && Types.isArmor(kind)) {
      callback(kind, kindName);
    }
  });
};
Types.forEachWeaponKind = function (callback) {
  Types.forEachKind(function (kind, kindName) {
    if (kind && Types.isWeapon(kind)) {
      callback(kind, kindName);
    }
  });
};

Types.getOrientationAsString = function (orientation: number) {
  switch (orientation) {
    case Types.Orientations.LEFT:
      return "left";
    case Types.Orientations.RIGHT:
      return "right";
    case Types.Orientations.UP:
      return "up";
    case Types.Orientations.DOWN:
      return "down";
    case Types.Orientations.UP_LEFT:
      return "up_left";
    case Types.Orientations.UP_RIGHT:
      return "up_right";
    case Types.Orientations.DOWN_LEFT:
      return "down_left";
    case Types.Orientations.DOWN_RIGHT:
      return "down_right";
  }
};

Types.getRandomItemKind = function () {
  var all = _.union(this.rankedWeapons, this.rankedArmors),
    forbidden = [Types.Entities.DAGGER, Types.Entities.CLOTHARMOR],
    itemKinds = _.difference(all, forbidden),
    i = Math.floor(Math.random() * _.size(itemKinds));

  return itemKinds[i];
};

Types.getMessageTypeAsString = function (type: number) {
  var typeName;
  _.each(Types.Messages, function (value: number, name: string) {
    if (value === type) {
      typeName = name;
    }
  });

  if (!typeName) {
    typeName = "UNKNOWN";
  }
  return typeName;
};

Types.getPartyBonusDescriptionMap = [
  "+#% Attack",
  "+#% Defense",
  "+#% Experience",
  "+# Minimum damage",
  "+# Maximum damage",
  "+# Health",
  "+# Magic damage",
];

Types.partyBonusType = ["attackDamage", "defense", "exp", "minDamage", "maxDamage", "health", "magicDamage"];

Types.getBonusDescriptionMap = [
  "+# Minimum damage",
  "+# Maximum damage",
  "+# Attack",
  "+# Health",
  "+# Magic damage",
  "+# Defense",
  "+# Absorbed damage",
  "+#% Experience",
  "+# health regeneration per second",
  "+#% Critical hit",
  "+#% Block enemy attack",
  "+#% Magic find",
  "+#% Attack speed",
  "+# Drain life",
  "+# Flame damage",
  "+# Lightning damage",
  "+# Pierce armor attack",
  "+# Health",
  "+# Cold damage",
  "+#% Freeze the enemy for # seconds",
  "-#% Chance of being frozen",
  "+#% Magic resistance",
  "+#% Flame resistance",
  "+#% Lightning resistance",
  "+#% Cold resistance",
  "+#% Poison resistance",
  "+#% Magic damage",
  "+#% Flame damage",
  "+#% Lightning damage",
  "+#% Cold damage",
  "+#% Poison damage",
  "+#% All resistances",
  "+#% Prevent enemy health regeneration",
  "+# Poison damage",
  "#% Faster cast rate",
  "-#% Enemy lower Magic resistance",
  "-#% Enemy lower Flame resistance",
  "-#% Enemy lower Lightning resistance",
  "-#% Enemy lower Cold resistance",
  "-#% Enemy lower Poison resistance",
  "-#% Enemy lower All resistances",
];

Types.bonusType = [
  "minDamage", // 0
  "maxDamage", // 1
  "attackDamage", // 2
  "health", // 3
  "magicDamage", // 4
  "defense", // 5
  "absorbedDamage", // 6
  "exp", // 7
  "regenerateHealth", // 8
  "criticalHit", // 9
  "blockChance", // 10
  "magicFind", // 11
  "attackSpeed", // 12
  "drainLife", // 13
  "flameDamage", // 14
  "lightningDamage", // 15
  "pierceDamage", // 16
  "highHealth", // 17
  "coldDamage", // 18
  "freezeChance", // 19
  "reduceFrozenChance", // 20
  "magicResistance", // 21
  "flameResistance", // 22
  "lightningResistance", // 23
  "coldResistance", // 24
  "poisonResistance", // 25
  "spectralResistance", // 26
  "magicDamagePercent", // 27
  "flameDamagePercent", // 28
  "lightningDamagePercent", // 29
  "coldDamagePercent", // 30
  "poisonDamagePercent", // 31
  "allResistance", // 32
  "preventRegenerateHealth", // 33
  "poisonDamage", // 34
  "skillTimeout", // 35
  "lowerMagicResistance", // 36
  "lowerFlameResistance", // 37
  "lowerLightningResistance", // 38
  "lowerColdResistance", // 39
  "lowerPoisonResistance", // 40
  "lowerAllResistance", // 41
];

Types.getBonus = function (rawBonus, level) {
  const minDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const maxDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const attackDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const healthPerLevel = [1, 3, 6, 9, 12, 15, 20, 28, 35, 45];
  const magicDamagePerLevel = [1, 2, 3, 4, 6, 8, 12, 18, 26, 40];
  const defensePerLevel = [1, 2, 4, 6, 8, 11, 15, 22, 28, 40];
  const absorbPerLevel = [2, 4, 6, 8, 10, 13, 15, 18, 22, 28];
  const expPerLevel = [1, 2, 4, 6, 8, 10, 13, 17, 24, 30];
  const regenerateHealthPerLevel = [1, 2, 3, 6, 9, 12, 15, 20, 25, 40];
  const criticalHitPerLevel = [1, 1, 2, 3, 4, 6, 8, 11, 15, 20];
  const blockChancePerLevel = [1, 1, 2, 3, 4, 6, 8, 11, 15, 20];
  const magicFindPerLevel = [1, 1, 2, 2, 3, 3, 4, 5, 7, 10];
  const attackSpeedPerLevel = [1, 2, 3, 4, 6, 8, 10, 15, 20, 30];
  const drainLifePerLevel = [1, 3, 6, 9, 12, 16, 20, 25, 32, 45];
  const flameDamagePerLevel = [3, 6, 9, 12, 15, 20, 28, 35, 45, 60];
  const lightningDamagePerLevel = [1, 3, 6, 9, 12, 16, 20, 25, 32, 45];
  const pierceDamagePerLevel = [3, 6, 9, 12, 15, 20, 28, 35, 45, 60];
  const highHealthPerLevel = [10, 20, 30, 40, 50, 70, 100, 140, 200, 280];
  const coldDamagePerLevel = [1, 3, 5, 7, 10, 13, 16, 20, 26, 34];
  const freezeChancePerLevel = [1, 1, 2, 3, 4, 6, 8, 11, 15, 20];
  const reduceFrozenChancePerLevel = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const magicResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const flameResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const lightningResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const coldResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const poisonResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const magicDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const flameDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const lightningDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const coldDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const poisonDamagePercentPerLevel = [1, 3, 6, 9, 12, 15, 20, 28, 35, 45];
  const allResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 11, 15, 20];
  const preventRegenerateHealthPerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const poisonDamagePerLevel = [1, 3, 6, 9, 12, 16, 20, 25, 32, 45];
  const skillTimeoutPerLevel = [1, 2, 4, 6, 8, 10, 13, 17, 24, 30];
  const lowerMagicResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerFlameResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerLightningResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerColdResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerPoisonResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerAllResistancePerLevel = [1, 2, 3, 5, 7, 9, 12, 16, 22, 30];

  const bonusPerLevel = [
    minDamagePerLevel,
    maxDamagePerLevel,
    attackDamagePerLevel,
    healthPerLevel,
    magicDamagePerLevel,
    defensePerLevel,
    absorbPerLevel,
    expPerLevel,
    regenerateHealthPerLevel,
    criticalHitPerLevel,
    blockChancePerLevel,
    magicFindPerLevel,
    attackSpeedPerLevel,
    drainLifePerLevel,
    flameDamagePerLevel,
    lightningDamagePerLevel,
    pierceDamagePerLevel,
    highHealthPerLevel,
    coldDamagePerLevel,
    freezeChancePerLevel,
    reduceFrozenChancePerLevel,
    magicResistancePerLevel,
    flameResistancePerLevel,
    lightningResistancePerLevel,
    coldResistancePerLevel,
    poisonResistancePerLevel,
    magicDamagePercentPerLevel,
    flameDamagePercentPerLevel,
    lightningDamagePercentPerLevel,
    coldDamagePercentPerLevel,
    poisonDamagePercentPerLevel,
    allResistancePerLevel,
    preventRegenerateHealthPerLevel,
    poisonDamagePerLevel,
    skillTimeoutPerLevel,
    lowerMagicResistancePerLevel,
    lowerFlameResistancePerLevel,
    lowerLightningResistancePerLevel,
    lowerColdResistancePerLevel,
    lowerPoisonResistancePerLevel,
    lowerAllResistancePerLevel,
  ];

  // const bonus: { type: string; stats: number; description: string }[] = [];

  const bonus: { [key: string]: number } = {};

  // A glitch in the inventory system allowed for scrolls to be added as rings
  if (!rawBonus || !Array.isArray(rawBonus)) return {};

  for (let i = 0; i < rawBonus.length; i++) {
    const type = Types.bonusType[rawBonus[i]];
    const stats = bonusPerLevel[rawBonus[i]][level - 1];

    if (!bonus[type]) {
      bonus[type] = 0;
    }

    bonus[type] += stats;
  }

  return bonus;
};

Types.getSetBonus = (currentSet: string, count: number = 0): any[] => {
  let setBonus = [];
  if (count < 2) return setBonus;

  Object.entries(Types.setBonus[currentSet]).map(([type, stats], i) => {
    var index = Types.bonusType.indexOf(type);
    if (index !== -1 && i <= count - 1) {
      const description = Types.getBonusDescriptionMap[index].replace("#", stats);

      setBonus.push({
        type,
        stats,
        description,
      });
    }
  });

  return setBonus;
};

Types.getPartyBonus = function (rawBonus, level) {
  const attackDamagePerLevel = [1, 2, 3, 4, 6, 8, 11, 15, 20, 30];
  const defensePerLevel = [1, 2, 3, 4, 6, 8, 11, 15, 20, 30];
  const expPerLevel = [1, 2, 3, 4, 6, 8, 11, 15, 20, 30];
  const minDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const maxDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const healthPerLevel = [1, 3, 6, 9, 12, 15, 20, 28, 35, 45];
  const magicDamagePerLevel = [1, 2, 3, 4, 6, 8, 12, 18, 26, 40];

  const bonusPerLevel = [
    attackDamagePerLevel,
    defensePerLevel,
    expPerLevel,
    minDamagePerLevel,
    maxDamagePerLevel,
    healthPerLevel,
    magicDamagePerLevel,
  ];

  const bonus: { type: string; stats: number; description: string }[] = [];

  // @NOTE: A glitch in the inventory system allowed for scrolls to be added as rings
  if (!rawBonus || !Array.isArray(rawBonus)) return bonus;
  for (let i = 0; i < rawBonus.length; i++) {
    const type = Types.partyBonusType[rawBonus[i]];
    const stats = bonusPerLevel[rawBonus[i]][level - 1];
    const description = Types.getPartyBonusDescriptionMap[rawBonus[i]].replace("#", stats);

    bonus.push({
      type,
      stats,
      description,
    });
  }

  return bonus;
};

Types.getAttributesBonus = function (attributes, level) {
  const bonus: { type: string; stats: number }[] = Object.entries(attributes).map(([type, stats]: [string, number]) => {
    let description = Types.getBonusDescriptionMap[Types.bonusType.findIndex(t => t === type)].replace("#", stats);

    if (type === "freezeChance") {
      description = description.replace("#", level ? Types.getFrozenTimePerLevel(level) / 1000 : "x");
    }

    return {
      type,
      stats,
      description,
    };
  });

  return bonus;
};

Types.getFrozenTimePerLevel = (itemLevel: number) => itemLevel * 250;

Types.bonusCap = {
  reduceFrozenChance: 50,
  magicResistance: 90,
  flameResistance: 90,
  lightningResistance: 90,
  coldResistance: 90,
  poisonResistance: 90,
  freezeChance: 75,
  attackSpeed: 50,
  magicFind: 100,
  skillTimeout: 50,
};

Types.getUpgradeSuccessRates = () => {
  return [100, 100, 90, 80, 55, 30, 7, 4, 1];
};

Types.getLuckySlotSuccessRateBonus = () => {
  return [0, 0, 10, 8, 6, 5, 3, 2, 1];
};

Types.getBlessedSuccessRateBonus = () => {
  return [0, 0, 10, 8, 6, 5, 3, 2, 1];
};

Types.getTransmuteSuccessRate = (item, bonus) => {
  const isUnique = Types.isUnique(item, bonus);
  const isRing = Types.isRing(item);
  const isAmulet = Types.isAmulet(item);
  const isBelt = Types.isBelt(item);
  const isCape = Types.isCape(item);
  const isShield = Types.isShield(item);
  const isWeapon = Types.isWeapon(item);
  const isArmor = Types.isArmor(item);
  const isUniqueRing = isRing && isUnique;
  const isUniqueAmulet = isAmulet && isUnique;
  const isUniqueBelt = isBelt && isUnique;
  const isUniqueCape = isCape && isUnique;
  const isUniqueShield = isShield && isUnique;
  const isUniqueWeapon = isWeapon && isUnique;
  const isUniqueArmor = isShield && isUnique;

  const uniqueSuccessRateMap = {
    goldensword: 20,
    blueaxe: 18,
    bluemorningstar: 18,
    frozensword: 15,
    diamondsword: 11,
    minotauraxe: 8,
    emeraldsword: 4,
    spikeglaive: 4,
    executionersword: 4,
    eclypsedagger: 4,
    mysticalsword: 4,
    templarsword: 4,
    dragonsword: 4,
    hellhammer: 4,
    moonsword: 4,

    goldenarmor: 20,
    bluearmor: 18,
    hornedarmor: 15,
    frozenarmor: 15,
    diamondarmor: 11,
    emeraldarmor: 4,
    demonarmor: 4,
    mysticalarmor: 4,
    bloodarmor: 4,
    templararmor: 4,
    paladinarmor: 2,

    beltfrozen: 15,
    belthorned: 15,
    beltdiamond: 11,
    beltminotaur: 8,
    beltemerald: 4,
    beltexecutioner: 4,
    beltmystical: 4,
    belttemplar: 4,
    beltdemon: 4,
    beltmoon: 4,

    shieldgolden: 20,
    shieldblue: 18,
    shieldhorned: 18,
    shieldfrozen: 15,
    shielddiamond: 11,
    shieldemerald: 4,
    shieldexecutioner: 4,
    shieldmystical: 4,
    shielddragon: 4,
    shielddemon: 4,
    shieldmoon: 4,

    cape: 10,
    ringgold: 12,
    ringplatinum: 4,
    amuletgold: 12,
    amuletplatinum: 4,
  };

  const transmuteSuccessRate = 80;

  if (
    isUniqueRing ||
    isUniqueAmulet ||
    isUniqueBelt ||
    isUniqueCape ||
    isUniqueShield ||
    isUniqueWeapon ||
    isUniqueArmor
  ) {
    return { transmuteSuccessRate, uniqueSuccessRate: 100 };
  } else if (!isUnique && uniqueSuccessRateMap[item]) {
    return {
      uniqueSuccessRate: uniqueSuccessRateMap[item],
      ...(isRing || isAmulet || isCape || isShield || isWeapon || isArmor ? { transmuteSuccessRate } : null),
    };
  }

  // Can't use scroll on the item
  return null;
};

// kind, type, name, level, defense
Types.getArmorDefense = function (armor: string, level: number, isUnique: boolean) {
  if (!armor || !level) return 0;

  const defense = isUnique && Types.itemUniqueMap[armor] ? Types.itemUniqueMap[armor][2] : kinds[armor][4];
  const defensePercentPerLevel = [100, 105, 110, 120, 130, 145, 160, 180, 205, 235];
  const defenseBonus = level >= 7 ? level - 6 : 0;

  return Math.ceil((defense + defenseBonus) * (defensePercentPerLevel[level - 1] / 100));
};

Types.getArmorHealthBonus = function (level: number) {
  if (!level) return 0;

  const healthBonusPerLevel = [2, 4, 8, 14, 20, 30, 42, 60, 80, 110];

  return healthBonusPerLevel[level - 1];
};

Types.getWeaponDamage = function (weapon: string, level: number, isUnique: boolean) {
  const damage = isUnique && Types.itemUniqueMap[weapon] ? Types.itemUniqueMap[weapon][2] : kinds[weapon][4];
  const damagePercentPerLevel = [100, 105, 110, 120, 130, 145, 160, 185, 215, 255];
  const damageBonus = level >= 7 ? Math.ceil((level - 6) * 2) : 0;

  return Math.ceil((damage + damageBonus) * (damagePercentPerLevel[level - 1] / 100));
};

Types.getWeaponMagicDamage = function (level: number) {
  const magicDamagePerLevel = [1, 3, 5, 8, 11, 15, 18, 25, 35, 50];

  return magicDamagePerLevel[level - 1];
};

Types.isBaseHighClassItem = (item: string) => {
  const baseLevel = kinds[item][3];

  return baseLevel >= 10;
};

Types.isBaseLegendaryClassItem = (item: string) => {
  const baseLevel = kinds[item][3];

  return baseLevel >= 40;
};

Types.getItemClass = function (item: string, level: number, isUnique: boolean) {
  const baseLevel = Types.getItemBaseLevel(item, isUnique);

  return Types.getItemClassFromBaseLevel(level, baseLevel);
};

Types.getItemClassFromBaseLevel = function (level: number, baseLevel: number): ItemClass {
  let itemClass;
  if (baseLevel < 5) {
    if (!level || level <= 5) {
      itemClass = "low";
    } else if (level <= 8) {
      itemClass = "medium";
    } else {
      itemClass = "high";
    }
  } else if (baseLevel < 10) {
    if (!level || level <= 5) {
      itemClass = "medium";
    } else {
      itemClass = "high";
    }
  } else if (baseLevel >= 10 && baseLevel < 40) {
    itemClass = "high";
    if (level >= 8) {
      itemClass = "legendary";
    }
  } else if (baseLevel >= 40) {
    itemClass = "legendary";
  }

  return itemClass;
};

Types.getItemBaseLevel = function (item: string, isUnique: boolean) {
  return isUnique && Types.itemUniqueMap[item] ? Types.itemUniqueMap[item][1] : kinds[item][3];
};

Types.getItemRequirement = function (item: string, level: number, isUnique: boolean) {
  const baseLevel = Types.getItemBaseLevel(item, isUnique);
  const multiplier = Types.getItemClass(item, level, isUnique) === "high" ? 1.5 : 1;
  const requirement = Math.floor(baseLevel + level * multiplier);

  return requirement;
};

Types.isUnique = function (item, rawBonus) {
  const isWeapon = kinds[item][1] === "weapon";
  const isArmor = kinds[item][1] === "armor";
  const isBelt = kinds[item][1] === "belt";
  const isCape = kinds[item][1] === "cape";
  const isShield = kinds[item][1] === "shield";
  const isRing = kinds[item][1] === "ring";
  const isAmulet = kinds[item][1] === "amulet";
  const isJewel = kinds[item][1] === "jewel";

  let isUnique = false;
  // bonus = !Array.isArray(bonus) && typeof bonus === "string" && bonus.length ? JSON.parse(bonus) : bonus;
  const bonus = toArray(rawBonus);

  if (isRing) {
    isUnique = Types.isUniqueRing(item, bonus);
  } else if (isAmulet) {
    isUnique = Types.isUniqueAmulet(item, bonus);
  } else if (isCape || isShield || isWeapon) {
    isUnique = bonus ? bonus.length >= 2 : false;
  } else if (isBelt || isArmor) {
    isUnique = bonus ? bonus.length >= 1 : false;
  } else if (isJewel) {
    isUnique = Types.isUniqueJewel(item, bonus);
  }

  return isUnique;
};

Types.getJewelBonus = function (rawSockets: string[]) {
  let combinedBonus = {};
  rawSockets?.forEach(rawSocket => {
    if (typeof rawSocket !== "string") return;

    const [item, rawLevel, rawBonus] = rawSocket.split("|");
    if (!Types.isJewel(item)) return;

    const level = parseInt(rawLevel);
    const bonus = Types.getBonus(JSON.parse(rawBonus), level);

    Object.entries(bonus).forEach(([key, value]) => {
      if (!combinedBonus[key]) {
        combinedBonus[key] = 0;
      }
      combinedBonus[key] += value;
    });
  });
  return combinedBonus;
};

Types.combineBonus = function (bonus1, bonus2) {
  Object.entries(bonus2).forEach(([key, value]) => {
    if (!bonus1[key]) {
      bonus1[key] = 0;
    }
    bonus1[key] += value;
  });

  return bonus1;
};

Types.getItemDetails = function ({
  item,
  level,
  rawBonus,
  rawSocket,
  rawSkill,
  playerBonus,
}: {
  item: string;
  level: number;
  rawBonus: number[];
  rawSocket?: number[];
  rawSkill?: number;
  playerBonus: any;
}) {
  const isWeapon = Types.isWeapon(item);
  const isArmor = Types.isArmor(item);
  const isRing = Types.isRing(item);
  const isAmulet = Types.isAmulet(item);
  const isBelt = Types.isBelt(item);
  const isCape = Types.isCape(item);
  const isShield = Types.isShield(item);
  const isUnique = Types.isUnique(item, rawBonus);
  const isRune = Types.isRune(item);
  const isJewel = Types.isJewel(item);
  const isStone = Types.isStone(item);
  const rune = isRune ? Types.getRuneFromItem(item) : null;
  const isSocket = rawSocket?.length;
  const socketRequirement = isSocket ? Types.getHighestSocketRequirement(rawSocket) : null;
  const jewelRequirement = isJewel ? Types.getJewelRequirement(rawBonus) : null;

  // const isEquipment = isWeapon || isArmor || isBelt || isRing || isAmulet;
  let name = Types.getDisplayName(item, isUnique);
  let magicDamage = 0;
  let healthBonus = 0;
  let bonus: any = {};
  let skill = null;
  let socketRuneBonus = {};
  let socketJewelBonus = {};
  let partyBonus = [];
  let runeBonus = [];
  let runeRank: null | Number = null;
  let isRuneword = false;

  let type = "item";

  const itemClass = isJewel
    ? Types.getItemClassFromBaseLevel(level, jewelRequirement)
    : Types.getItemClass(item, level, isUnique);

  if (isWeapon) {
    type = "weapon";
    if (!isUnique) {
      magicDamage = Types.getWeaponMagicDamage(level);
    }
    skill =
      typeof rawSkill === "number"
        ? Types.getAttackSkill({
            skill: rawSkill,
            level,
            bonus: playerBonus,
            itemClass,
          })
        : null;
  } else if (isArmor) {
    type = "armor";
    healthBonus = Types.getArmorHealthBonus(level);
  } else if (isBelt) {
    type = "belt";
    healthBonus = Types.getArmorHealthBonus(level);
  } else if (isShield) {
    type = "shield";
    healthBonus = Types.getArmorHealthBonus(level);
    skill = typeof rawSkill === "number" ? Types.getDefenseSkill(rawSkill, level, playerBonus) : null;
  } else if (isCape) {
    type = "cape";
  } else if (isRing) {
    type = "ring";
  } else if (isAmulet) {
    type = "amulet";
  }

  let requirement;
  if (isRune) {
    requirement = rune.requirement;
  } else if (isJewel) {
    requirement = jewelRequirement;
  } else {
    requirement = Types.getItemRequirement(item, level, isUnique);
  }
  const description = isRune ? Types.itemDescription.rune : Types.itemDescription[item];

  if (rawBonus) {
    if (isCape) {
      partyBonus = Types.getPartyBonus(rawBonus, level);
    } else {
      bonus = Types.getBonus(rawBonus, level);
    }
  }

  if (isSocket) {
    const { runeword, runewordBonus } = Types.getRunewordBonus({ isUnique, socket: rawSocket, type });

    if (runeword && runewordBonus) {
      name = runeword;
      socketRuneBonus = runewordBonus;
      isRuneword = true;
    } else {
      socketRuneBonus = Types.getRunesBonus(rawSocket);
      socketJewelBonus = Types.getJewelBonus(rawSocket);
    }

    bonus = Types.combineBonus(bonus, socketRuneBonus);
    bonus = Types.combineBonus(bonus, socketJewelBonus);

    if (socketRequirement > requirement) {
      requirement = socketRequirement;
    }
  } else if (isRune) {
    runeBonus = Types.getAttributesBonus(Types.getRune(item).attribute, level);
    runeRank = rune.rank;
  }

  if (Object.keys(bonus).length) {
    if (healthBonus && bonus.health) {
      healthBonus += bonus.health;
      delete bonus.health;
    }
    if (magicDamage && bonus.magicDamage) {
      magicDamage += bonus.magicDamage;
      delete bonus.magicDamage;
    }
    bonus = Types.getAttributesBonus(bonus, level);
  }

  return {
    item,
    name,
    type,
    isUnique,
    isRune,
    isRuneword,
    isJewel,
    isStone,
    itemClass,
    ...(isArmor || isBelt || isCape || isShield ? { defense: Types.getArmorDefense(item, level, isUnique) } : null),
    ...(isWeapon ? { damage: Types.getWeaponDamage(item, level, isUnique) } : null),
    healthBonus,
    magicDamage,
    requirement,
    description,
    bonus,
    socket: rawSocket?.length,
    partyBonus,
    runeBonus,
    runeRank,
    skill,
  };
};

Types.getDisplayName = function (item: string, isUnique = false) {
  if (isUnique && Types.itemUniqueMap[item]) {
    return Types.itemUniqueMap[item][0];
  } else {
    return kinds[item][2];
  }
};

Types.StoneUpgrade = {
  stonedragon: 5,
  stonehero: 6,
};

Types.itemDescription = {
  skeletonkingcage: "The thoracic cage of the Skeleton King. An unknown magic is still being emitted from the remains.",
  necromancerheart: "The heart of the Necromancer. An unknown magic is still being emitted from the remains.",
  cowkinghorn: "The horn of the Cow King. An unknown magic is still being emitted from the remains.",
  chalice: "Return the Golden Chalice, a one-of-a-kind artifact, to its rightful place.",
  soulstone: "This mysterious gem holds the soul of a hundred warriors.",
  nft: "An exceptional Non-Fungible Token artifact.",
  wing: "The remnants of a dragon's wing.",
  crystal: "An ancient and powerful crystal.",
  powderblack: "A special kind of powder.",
  powderblue: "A special kind of powder.",
  powdergold: "A special kind of powder.",
  powdergreen: "A special kind of powder.",
  powderred: "A special kind of powder.",
  powderquantum: "The ultimate powder that powers the Gateway.",
  chestblue: "The chest may contain a very precious item.",
  chestgreen: "The chest may contain a very precious item.",
  chestpurple: "The chest may contain a very precious item.",
  chestred: "The chest may contain a very precious item.",
  scrollupgradelow:
    "Upgrade low class items. The chances for a successful upgrade varies depending on the item's level.",
  scrollupgrademedium:
    "Upgrade medium class items. The chances for a successful upgrade varies depending on the item's level.",
  scrollupgradehigh:
    "Upgrade high class item. The chances for a successful upgrade varies depending on the item's level.",
  scrollupgradelegendary:
    "Upgrade legendary class item. The chances for a successful upgrade varies depending on the item's level.",
  scrollupgradeblessed:
    "Upgrade high class item. The chances for a successful upgrade varies depending on the item's level. Blessed scrolls gives a higher chance of successful upgrade.",
  scrollupgradesacred:
    "Upgrade legendary class item. The chances for a successful upgrade varies depending on the item's level. Sacred scrolls gives a higher chance of successful upgrade.",
  scrolltransmute:
    "Transmute a ring or an amulet and generate new random stats or an item to have a chance of making it unique. The chances of transmuting stats is fixed while the chances of getting a unique varies.",
  rune: "Can be inserted into a socketed item or create runewords",
  stonesocket:
    "Creates a random number of sockets in a non-socketed item.<br/><br/>If the item already has sockets, the stone will attempt to remove the last item from its socket. There is a 90% chance for the item to be burned.",
  jewelskull: "Can be inserted in a socket",
  stonedragon: "Blessed by the fire of the dragon, safely upgrade any item to +5",
  stonehero:
    "You've crushed your enemies, saw them driven before you, and heard the lamentation of their women.<br/>Safely upgrade any item to +6",
};
