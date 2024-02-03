import * as _ from "lodash";

import { getGoldAmountFromSoldItem } from "../../shared/js/gold";
import { Curses } from "../../shared/js/types/curse";
import { toArray } from "../../shared/js/utils";
import { Messages } from "./messages";
import { Slot } from "./slots";
import { expForLevel } from "./types/experience";
import { terrainToImageMap } from "./types/map";
import {
  calculateAttackSpeedCap,
  calculateExtraGoldCap,
  calculateMagicFindCap,
  calculateResistance,
  DEFAULT_ATTACK_ANIMATION_SPEED,
  DEFAULT_ATTACK_SPEED,
  elements,
  enchantToDisplayMap,
  getRandomElement,
  getResistance,
  mobEnchant,
  mobResistance,
  PLAYER_MAX_ATTACK_SPEED,
  PLAYER_MAX_EXTRA_GOLD,
  PLAYER_MAX_MAGIC_FIND,
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
import {
  attackBonusPercentsFromWeightMap,
  getAttackSpeedBonusFromStringMap,
  getWeaponWeightbyKind,
} from "./types/weight";

export const Types: any = {
  Store: {
    EXPANSION1: 1,
    SCROLLUPGRADEHIGH: 2,
    SCROLLUPGRADEMEDIUM: 3,
    SCROLLUPGRADEBLESSED: 4,
    CAPE: 5,
    EXPANSION2: 6,
    SCROLLUPGRADELEGENDARY: 7,
    SCROLLUPGRADESACRED: 8,
    SCROLLTRANSMUTE: 9,
    STONESOCKET: 10,
    STONESOCKETBLESSED: 14,
    STONEDRAGON: 11,
    STONEHERO: 12,
    PET: 13,
  },
  Curses,
  Messages,

  Entities: {
    WARRIOR: 1,

    // PETS
    PETEGG: 357,
    PETCOLLAR: 400,
    PETDINO: 358,
    PET_DINO: 359,
    PETBAT: 360,
    PET_BAT: 361,
    PETCAT: 362,
    PET_CAT: 363,
    PETDOG: 364,
    PET_DOG: 365,
    PETTURTLE: 366,
    PETDUCK: 386,
    PETDEER: 409,
    PETREINDEER: 418,
    PETMONKEY: 419,
    PETHELLHOUND: 407,
    PET: 407,
    PETDRAGON: 390,
    PET_TURTLE: 367,
    PET_DUCK: 387,
    PET_DEER: 392,
    PET_REINDEER: 406,
    PET_MONKEY: 422,
    PET_HELLHOUND: 408,
    PET_DRAGON: 389,
    PETAXOLOTL: 368,
    PET_AXOLOTL: 369,
    PETFOX: 370,

    PET_FOX: 371,
    PETMOUSE: 372,
    PET_MOUSE: 373,
    PETHEDGEHOG: 374,
    PET_HEDGEHOG: 375,

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
    OCULOTHORAX: 218,
    KOBOLD: 228,
    GOLEM: 231,
    SNAKE3: 232,
    SNAKE4: 235,
    SKELETON4: 236,
    GHOST: 237,
    SKELETONBERSERKER: 243,
    SKELETONTEMPLAR: 247,
    SKELETONTEMPLAR2: 248,
    SPIDER: 263,
    SPIDER2: 264,
    SPIDERQUEEN: 277,
    SKELETONARCHER: 278,
    ARROW: 279,
    BUTCHER: 280,
    WRAITH2: 281,
    MAGE: 292,
    MAGESPELL: 293,
    SHAMAN: 294,
    WORM: 295,
    SKELETONSCYTHE1: 348,
    SKELETONAXE1: 349,
    SKELETONAXE2: 350,
    STATUE: 296,
    STATUE2: 297,
    STATUESPELL: 298,
    STATUE2SPELL: 299,
    DEATHBRINGER: 346,
    DEATHBRINGERSPELL: 347,
    DEATHANGEL: 300,
    DEATHANGELSPELL: 303,

    // Helms
    HELMCLOTH: 325,
    HELMLEATHER: 326,
    HELMMAIL: 327,
    HELMPLATE: 328,
    HELMRED: 329,
    HELMGOLDEN: 330,
    HELMBLUE: 331,
    HELMHORNED: 332,
    HELMFROZEN: 333,
    HELMDIAMOND: 334,
    HELMEMERALD: 335,
    HELMEXECUTIONER: 336,
    HELMTEMPLAR: 337,
    HELMDRAGON: 338,
    HELMMOON: 339,
    HELMCHRISTMAS: 420,
    HELMDEMON: 340,
    HELMMYSTICAL: 341,
    HELMIMMORTAL: 342,
    HELMPALADIN: 351,
    HELMCLOWN: 343,
    HELMPUMKIN: 388,

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
    TEMPLARARMOR: 140,
    DRAGONARMOR: 221,
    MOONARMOR: 311,
    CHRISTMASARMOR: 421,
    DEMONARMOR: 222,
    MYSTICALARMOR: 242,
    IMMORTALARMOR: 252,
    PALADINARMOR: 304,

    // Belts
    BELTLEATHER: 85,
    BELTPLATED: 86,
    BELTFROZEN: 91,
    BELTHORNED: 141,
    BELTDIAMOND: 129,
    BELTMINOTAUR: 134,
    BELTEMERALD: 201,
    BELTEXECUTIONER: 207,
    BELTTEMPLAR: 203,
    BELTDEMON: 204,
    BELTMOON: 205,
    BELTCHRISTMAS: 415,
    BELTMYSTICAL: 202,
    BELTPALADIN: 352,
    BELTIMMORTAL: 355,
    BELTGOLDWRAP: 344,

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
    SHIELDDRAGON: 197,
    SHIELDMOON: 208,
    SHIELDCHRISTMAS: 414,
    SHIELDMYSTICAL: 196,
    SHIELDDEMON: 198,
    SHIELDPALADIN: 353,
    SHIELDIMMORTAL: 354,

    // Chests
    CHESTBLUE: 136,
    CHESTGREEN: 223,
    CHESTPURPLE: 224,
    CHRISTMASPRESENT: 411,
    CHESTDEAD: 393,
    CHESTRED: 225,

    // Consumable
    EXPANSION2VOUCHER: 395,

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
    STONETELEPORT: 396,
    NFT: 273,
    WING: 274,
    CRYSTAL: 285,
    POWDERBLACK: 286,
    POWDERBLUE: 287,
    POWDERGOLD: 288,
    POWDERGREEN: 289,
    POWDERRED: 290,
    POWDERQUANTUM: 291,
    PICKAXE: 310,
    MUSHROOMS: 324,
    IOU: 356,
    CAKE: 39,
    SCROLLUPGRADELOW: 74,
    SCROLLUPGRADEMEDIUM: 75,
    SCROLLUPGRADEHIGH: 76,
    SCROLLUPGRADELEGENDARY: 200,
    SCROLLUPGRADEELEMENTMAGIC: 380,
    SCROLLUPGRADEELEMENTFLAME: 381,
    SCROLLUPGRADEELEMENTLIGHTNING: 382,
    SCROLLUPGRADEELEMENTCOLD: 383,
    SCROLLUPGRADEELEMENTPOISON: 384,
    SCROLLUPGRADESKILLRANDOM: 385,
    SCROLLUPGRADEBLESSED: 118,
    SCROLLUPGRADESACRED: 206,
    SCROLLTRANSMUTE: 142,
    SCROLLTRANSMUTEBLESSED: 309,
    SCROLLTRANSMUTEPET: 379,
    STONESOCKET: 192,
    STONESOCKETBLESSED: 376,
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
    RINGPUMKIN: 394,
    RINGBADOMEN: 398,
    RINGBLOODBAND: 399,
    RINGMINOTAUR: 132,
    RINGMYSTICAL: 214,
    RINGBALROG: 194,
    RINGCONQUEROR: 210,
    RINGHEAVEN: 211,
    RINGWIZARD: 213,
    RINGGREED: 321,
    RINGIMMORTAL: 424, //~~~last
    AMULETSILVER: 112,
    AMULETGOLD: 113,
    AMULETPLATINUM: 212,
    AMULETCOW: 116,
    AMULETFROZEN: 138,
    AMULETDEMON: 215,
    AMULETMOON: 216,
    AMULETCHRISTMAS: 416,
    AMULETSTAR: 233,
    AMULETSKULL: 269,
    AMULETDRAGON: 270,
    AMULETEYE: 320,
    AMULETGREED: 322,
    AMULETIMMORTAL: 423,

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
    JANETYELLEN: 315,
    MERCHANT: 316,
    SATOSHI: 73,
    WAYPOINTX: 84,
    WAYPOINTN: 93,
    WAYPOINTO: 193,
    STASH: 114,
    PORTALCOW: 125,
    PORTALMINOTAUR: 135,
    PORTALSTONE: 238,
    PORTALGATEWAY: 239,
    GATEWAYFX: 301,
    GATE: 302,
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
    LEVER3: 345,
    GRIMOIRE: 268,
    FOSSIL: 283,
    PANELSKELETONKEY: 397,
    OBELISK: 312,
    HANDS: 284,
    ALKOR: 260,
    OLAF: 271,
    VICTOR: 272,
    FOX: 276,
    TREE: 261,
    TRAP: 265,
    TRAP2: 266,
    TRAP3: 267,
    DOORDEATHANGEL: 308,

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
    EXECUTIONERSWORD: 154,
    TEMPLARSWORD: 155,
    DRAGONSWORD: 156,
    MOONSWORD: 157,
    CHRISTMASSWORD: 412,
    CHRISTMASHACHET: 413,
    MOONHACHET: 402,
    MOONMAUL: 403,
    CHRISTMASMAUL: 417,
    DEMONMAUL: 410,
    MYSTICALSWORD: 158,
    MYSTICALDAGGER: 401,
    SPIKEGLAIVE: 159,
    ECLYPSEDAGGER: 160,
    DEMONAXE: 305,
    DEMONSICKLE: 404,
    PALADINAXE: 306,
    IMMORTALSWORD: 307,
    HELLHAMMER: 244,
    MAUL: 377,
    WIZARDSWORD: 378,
    NANOCOIN: 313,
    BANANOCOIN: 314,
    BARBRONZE: 317,
    BARSILVER: 318,
    BARGOLD: 319,
    BARPLATINUM: 323,

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
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    Q: 81,
    C: 67,
    U: 85,
    F: 70,
    H: 72,
    I: 73,
    M: 77,
    O: 79,
    P: 80,
    KEYPAD_1: 97,
    KEYPAD_2: 98,
    KEYPAD_3: 99,
    KEYPAD_4: 100,
    KEYPAD_5: 101,
    KEYPAD_6: 102,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
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
Types.getAttackSpeedBonusFromStringMap = getAttackSpeedBonusFromStringMap;
Types.getWeaponWeightbyKind = getWeaponWeightbyKind;
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
Types.calculateAttackSpeedCap = calculateAttackSpeedCap;
Types.calculateExtraGoldCap = calculateExtraGoldCap;
Types.calculateMagicFindCap = calculateMagicFindCap;
Types.terrainToImageMap = terrainToImageMap;
Types.Slot = Slot;

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
Types.Entities.nonLootableKeys = [Types.Entities.SKELETONKEY];

Types.Entities.LightWeapons = [
  // Types.Entities.DAGGER,
  Types.Entities.MYSTICALDAGGER,
  Types.Entities.ECLYPSEDAGGER,
  Types.Entities.MOONHACHET,
  Types.Entities.CHRISTMASHACHET,
];

Types.Entities.NormalWeapons = [
  Types.Entities.SWORD,
  Types.Entities.MORNINGSTAR,
  Types.Entities.BLUESWORD,
  Types.Entities.REDSWORD,
  Types.Entities.GOLDENSWORD,
  Types.Entities.BLUEAXE,
  Types.Entities.BLUEMORNINGSTAR,
  Types.Entities.FROZENSWORD,
  Types.Entities.DIAMONDSWORD,
  Types.Entities.SWORD,
  Types.Entities.MORNINGSTAR,
  Types.Entities.BLUESWORD,
  Types.Entities.REDSWORD,
  Types.Entities.GOLDENSWORD,
  Types.Entities.BLUEAXE,
  Types.Entities.BLUEMORNINGSTAR,
  Types.Entities.FROZENSWORD,
  Types.Entities.DIAMONDSWORD,
  Types.Entities.PALADINAXE,
  Types.Entities.SPIKEGLAIVE,
  Types.Entities.DEMONSICKLE,
  Types.Entities.HELLHAMMER,
];

Types.Entities.HeavyWeapons = [
  Types.Entities.DEMONAXE,
  Types.Entities.WIZARDSWORD,
  Types.Entities.MAUL,
  Types.Entities.MOONMAUL,
  Types.Entities.CHRISTMASMAUL,
];
Types.Entities.SuperHeavyWeapons = [Types.Entities.MINOTAURAXE, Types.Entities.IMMORTALSWORD, Types.Entities.DEMONMAUL];
Types.Entities.Weapons = [
  ...Types.Entities.LightWeapons,
  ...Types.Entities.NormalWeapons,
  ...Types.Entities.HeavyWeapons,
  ...Types.Entities.SuperHeavyWeapons,
];

Types.Entities.Helms = [
  Types.Entities.HELMCLOTH,
  Types.Entities.HELMLEATHER,
  Types.Entities.HELMMAIL,
  Types.Entities.HELMPLATE,
  Types.Entities.HELMRED,
  Types.Entities.HELMGOLDEN,
  Types.Entities.HELMBLUE,
  Types.Entities.HELMHORNED,
  Types.Entities.HELMFROZEN,
  Types.Entities.HELMDIAMOND,
  Types.Entities.HELMEMERALD,
  Types.Entities.HELMEXECUTIONER,
  Types.Entities.HELMTEMPLAR,
  Types.Entities.HELMDRAGON,
  Types.Entities.HELMMOON,
  Types.Entities.HELMCHRISTMAS,
  Types.Entities.HELMDEMON,
  Types.Entities.HELMMYSTICAL,
  Types.Entities.HELMIMMORTAL,
  Types.Entities.HELMPALADIN,
  Types.Entities.HELMCLOWN,
  Types.Entities.HELMPUMKIN,
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
  Types.Entities.TEMPLARARMOR,
  Types.Entities.DRAGONARMOR,
  Types.Entities.MOONARMOR,
  Types.Entities.CHRISTMASARMOR,
  Types.Entities.DEMONARMOR,
  Types.Entities.MYSTICALARMOR,
  Types.Entities.PALADINARMOR,
  Types.Entities.IMMORTALARMOR,
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
  Types.Entities.BELTTEMPLAR,
  Types.Entities.BELTMOON,
  Types.Entities.BELTCHRISTMAS,
  Types.Entities.BELTDEMON,
  Types.Entities.BELTMYSTICAL,
  Types.Entities.BELTPALADIN,
  Types.Entities.BELTIMMORTAL,
  Types.Entities.BELTGOLDWRAP,
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
  Types.Entities.SHIELDEMERALD,
  Types.Entities.SHIELDTEMPLAR,
  Types.Entities.SHIELDEXECUTIONER,
  Types.Entities.SHIELDDRAGON,
  Types.Entities.SHIELDMOON,
  Types.Entities.SHIELDCHRISTMAS,
  Types.Entities.SHIELDMYSTICAL,
  Types.Entities.SHIELDDEMON,
  Types.Entities.SHIELDPALADIN,
  Types.Entities.SHIELDIMMORTAL,
];

Types.Entities.Rings = [
  Types.Entities.RINGBRONZE,
  Types.Entities.RINGSILVER,
  Types.Entities.RINGGOLD,
  Types.Entities.RINGPLATINUM,
  Types.Entities.RINGNECROMANCER,
  Types.Entities.RINGRAISTONE,
  Types.Entities.RINGFOUNTAIN,
  Types.Entities.RINGPUMKIN,
  Types.Entities.RINGBADOMEN,
  Types.Entities.RINGBLOODBAND,
  Types.Entities.RINGMINOTAUR,
  Types.Entities.RINGMYSTICAL,
  Types.Entities.RINGBALROG,
  Types.Entities.RINGCONQUEROR,
  Types.Entities.RINGHEAVEN,
  Types.Entities.RINGWIZARD,
  Types.Entities.RINGGREED,
  Types.Entities.RINGIMMORTAL,
];

Types.Entities.Amulets = [
  Types.Entities.AMULETSILVER,
  Types.Entities.AMULETGOLD,
  Types.Entities.AMULETPLATINUM,
  Types.Entities.AMULETCOW,
  Types.Entities.AMULETFROZEN,
  Types.Entities.AMULETDEMON,
  Types.Entities.AMULETMOON,
  Types.Entities.AMULETCHRISTMAS,
  Types.Entities.AMULETSTAR,
  Types.Entities.AMULETSKULL,
  Types.Entities.AMULETDRAGON,
  Types.Entities.AMULETEYE,
  Types.Entities.AMULETGREED,
  Types.Entities.AMULETIMMORTAL,
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

export const petKindToPetMap = {
  [Types.Entities.PETDINO]: Types.Entities.PET_DINO,
  [Types.Entities.PETBAT]: Types.Entities.PET_BAT,
  [Types.Entities.PETCAT]: Types.Entities.PET_CAT,
  [Types.Entities.PETDOG]: Types.Entities.PET_DOG,
  [Types.Entities.PETAXOLOTL]: Types.Entities.PET_AXOLOTL,
  [Types.Entities.PETFOX]: Types.Entities.PET_FOX,
  [Types.Entities.PETTURTLE]: Types.Entities.PET_TURTLE,
  [Types.Entities.PETDUCK]: Types.Entities.PET_DUCK,
  [Types.Entities.PETDEER]: Types.Entities.PET_DEER,
  [Types.Entities.PETREINDEER]: Types.Entities.PET_REINDEER,
  [Types.Entities.PETMONKEY]: Types.Entities.PET_MONKEY,
  [Types.Entities.PETHELLHOUND]: Types.Entities.PET_HELLHOUND,
  [Types.Entities.PETDRAGON]: Types.Entities.PET_DRAGON,
  [Types.Entities.PETMOUSE]: Types.Entities.PET_MOUSE,
  [Types.Entities.PETHEDGEHOG]: Types.Entities.PET_HEDGEHOG,
};

export const kinds = {
  warrior: [Types.Entities.WARRIOR, "player"],

  // Pets
  petegg: [Types.Entities.PETEGG, "pet", "Pet Egg"],
  petcollar: [Types.Entities.PETCOLLAR, "pet", "Pet Collar"],
  pet_dino: [Types.Entities.PET_DINO, "pet"],
  pet_bat: [Types.Entities.PET_BAT, "pet"],
  pet_cat: [Types.Entities.PET_CAT, "pet"],
  pet_dog: [Types.Entities.PET_DOG, "pet"],
  pet_axolotl: [Types.Entities.PET_AXOLOTL, "pet"],
  pet_fox: [Types.Entities.PET_FOX, "pet"],
  pet_turtle: [Types.Entities.PET_TURTLE, "pet"],
  pet_duck: [Types.Entities.PET_DUCK, "pet"],
  pet_deer: [Types.Entities.PET_DEER, "pet"],
  pet_reindeer: [Types.Entities.PET_REINDEER, "pet"],
  pet_monkey: [Types.Entities.PET_MONKEY, "pet"],
  pet_hellhound: [Types.Entities.PET_HELLHOUND, "pet"],
  pet_dragon: [Types.Entities.PET_DRAGON, "pet"],
  pet_mouse: [Types.Entities.PET_MOUSE, "pet"],
  pet_hedgehog: [Types.Entities.PET_HEDGEHOG, "pet"],
  petdino: [Types.Entities.PETDINO, "pet", "Dinosaur Pet", 10],
  petbat: [Types.Entities.PETBAT, "pet", "Bat Pet", 10],
  petcat: [Types.Entities.PETCAT, "pet", "Cat Pet", 10],
  petdog: [Types.Entities.PETDOG, "pet", "Dog Pet", 10],
  petaxolotl: [Types.Entities.PETAXOLOTL, "pet", "Axolotl Pet", 10],
  petfox: [Types.Entities.PETFOX, "pet", "Fox Pet", 10],
  petturtle: [Types.Entities.PETTURTLE, "pet", "Turtle Pet", 10],
  petduck: [Types.Entities.PETDUCK, "pet", "Duck Pet", 10],
  petdeer: [Types.Entities.PETDEER, "pet", "Deer Pet", 10],
  petreindeer: [Types.Entities.PETREINDEER, "pet", "ReinDeer Pet", 10],
  petmonkey: [Types.Entities.PETMONKEY, "pet", "Monkey Pet", 10],
  pethellhound: [Types.Entities.PETHELLHOUND, "pet", "Hellhound Pet", 10],
  petdragon: [Types.Entities.PETDRAGON, "pet", "Dragon Pet", 10],
  petmouse: [Types.Entities.PETMOUSE, "pet", "Mouse Pet", 10],
  pethedgehog: [Types.Entities.PETHEDGEHOG, "pet", "Hedgehog Pet", 10],

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
  wraith: [Types.Entities.WRAITH, "mob", 120, 40],
  zombie: [Types.Entities.ZOMBIE, "mob", 40, 42],
  necromancer: [Types.Entities.NECROMANCER, "mob", 400, 51],
  cow: [Types.Entities.COW, "mob", 255, 49],
  cowking: [Types.Entities.COWKING, "mob", 400, 50],
  minotaur: [Types.Entities.MINOTAUR, "mob", 500, 58],
  rat3: [Types.Entities.RAT3, "mob", 120, 50],
  golem: [Types.Entities.GOLEM, "mob", 160, 56],
  oculothorax: [Types.Entities.OCULOTHORAX, "mob", 140, 56],
  kobold: [Types.Entities.KOBOLD, "mob", 120, 58],
  snake3: [Types.Entities.SNAKE3, "mob", 130, 60],
  snake4: [Types.Entities.SNAKE4, "mob", 130, 60],
  skeleton4: [Types.Entities.SKELETON4, "mob", 120, 60],
  ghost: [Types.Entities.GHOST, "mob", 140, 60],
  skeletontemplar: [Types.Entities.SKELETONTEMPLAR, "mob", 350, 64],
  skeletontemplar2: [Types.Entities.SKELETONTEMPLAR2, "mob", 350, 64],
  spider: [Types.Entities.SPIDER, "mob", 140, 60],
  spider2: [Types.Entities.SPIDER2, "mob", 140, 60],
  spiderqueen: [Types.Entities.SPIDERQUEEN, "mob", 400, 66],
  butcher: [Types.Entities.BUTCHER, "mob", 1200, 71],
  skeletonberserker: [Types.Entities.SKELETONBERSERKER, "mob", 140, 62],
  skeletonarcher: [Types.Entities.SKELETONARCHER, "mob", 160, 65],
  shaman: [Types.Entities.SHAMAN, "mob", 500, 68],
  wraith2: [Types.Entities.WRAITH2, "mob", 150, 63],
  mage: [Types.Entities.MAGE, "mob", 160, 65],
  worm: [Types.Entities.WORM, "mob", 500, 70],
  skeletonscythe1: [Types.Entities.SKELETONSCYTHE1, "mob", 180, 65],
  skeletonaxe1: [Types.Entities.SKELETONAXE1, "mob", 180, 65],
  skeletonaxe2: [Types.Entities.SKELETONAXE2, "mob", 180, 65],
  deathbringer: [Types.Entities.DEATHBRINGER, "mob", 1500, 73],
  deathangel: [Types.Entities.DEATHANGEL, "mob", 1200, 71],

  // kind, type, level, damage
  dagger: [Types.Entities.DAGGER, "weapon", "Dagger", 1, 2],
  wirtleg: [Types.Entities.WIRTLEG, "weapon", "Wirt's leg", 1, 5],
  pickaxe: [Types.Entities.PICKAXE, "weapon", "Pickaxe", 52, 30],

  // kind, type, level, damage
  sword: [Types.Entities.SWORD, "weapon", "Sword", 1, 3],
  axe: [Types.Entities.AXE, "weapon", "Axe", 2, 5],
  morningstar: [Types.Entities.MORNINGSTAR, "weapon", "Morning Star", 3, 7],
  bluesword: [Types.Entities.BLUESWORD, "weapon", "Magic Sword", 5, 10],
  redsword: [Types.Entities.REDSWORD, "weapon", "Red Sword", 7, 15],
  goldensword: [Types.Entities.GOLDENSWORD, "weapon", "Golden Sword", 16, 20],
  blueaxe: [Types.Entities.BLUEAXE, "weapon", "Frozen Axe", 18, 24],
  bluemorningstar: [Types.Entities.BLUEMORNINGSTAR, "weapon", "Frozen Morning Star", 20, 26],
  frozensword: [Types.Entities.FROZENSWORD, "weapon", "Sapphire Sword", 26, 30],
  diamondsword: [Types.Entities.DIAMONDSWORD, "weapon", "Diamond Sword", 34, 38],
  minotauraxe: [Types.Entities.MINOTAURAXE, "weapon", "Minotaur Axe", 36, 44],
  emeraldsword: [Types.Entities.EMERALDSWORD, "weapon", "Emerald Sword", 48, 56],
  executionersword: [Types.Entities.EXECUTIONERSWORD, "weapon", "Executioner Sword", 50, 56],
  templarsword: [Types.Entities.TEMPLARSWORD, "weapon", "Templar Sword", 52, 58],
  dragonsword: [Types.Entities.DRAGONSWORD, "weapon", "Dragon Sword", 54, 58],
  moonsword: [Types.Entities.MOONSWORD, "weapon", "Moon Sword", 26, 30],
  christmassword: [Types.Entities.CHRISTMASSWORD, "weapon", "Christmas Sword", 44, 60],
  moonhachet: [Types.Entities.MOONHACHET, "weapon", "Moon Hatchet", 59, 58],
  christmashachet: [Types.Entities.CHRISTMASHACHET, "weapon", "Christmas Hatchet", 59, 58],
  moonmaul: [Types.Entities.MOONMAUL, "weapon", "Moon Maul", 59, 62],
  christmasmaul: [Types.Entities.CHRISTMASMAUL, "weapon", "christmas Maul", 59, 62],
  demonmaul: [Types.Entities.DEMONMAUL, "weapon", "Demon Maul", 61, 66],
  demonaxe: [Types.Entities.DEMONAXE, "weapon", "Demon Axe", 60, 64],
  demonsickle: [Types.Entities.DEMONSICKLE, "weapon", "Demon Sickle", 60, 62],
  mysticalsword: [Types.Entities.MYSTICALSWORD, "weapon", "Mystical Sword", 56, 62],
  mysticaldagger: [Types.Entities.MYSTICALDAGGER, "weapon", "Mystical Dagger", 56, 58],
  paladinaxe: [Types.Entities.PALADINAXE, "weapon", "Paladin Axe", 60, 66],
  immortalsword: [Types.Entities.IMMORTALSWORD, "weapon", "Immortal Sword", 60, 66],
  spikeglaive: [Types.Entities.SPIKEGLAIVE, "weapon", "Spike Glaive", 60, 68],
  eclypsedagger: [Types.Entities.ECLYPSEDAGGER, "weapon", "Eclypse Dagger", 60, 60],
  hellhammer: [Types.Entities.HELLHAMMER, "weapon", "Hell Hammer", 60, 68],
  maul: [Types.Entities.MAUL, "weapon", "Maul", 62, 73],
  wizardsword: [Types.Entities.WIZARDSWORD, "weapon", "Wizard sword", 62, 71],

  // kind, type, level, defense
  helmcloth: [Types.Entities.HELMCLOTH, "helm", "Cloth Helm", 1, 1],
  helmleather: [Types.Entities.HELMLEATHER, "helm", "Leather Helm", 1, 2],
  helmmail: [Types.Entities.HELMMAIL, "helm", "Mail Helm", 2, 3],
  helmplate: [Types.Entities.HELMPLATE, "helm", "Plate Helm", 4, 5],
  helmred: [Types.Entities.HELMRED, "helm", "Red Helm", 6, 7],
  helmgolden: [Types.Entities.HELMGOLDEN, "helm", "Golden Helm", 8, 10],
  helmblue: [Types.Entities.HELMBLUE, "helm", "Frozen Helm", 16, 12],
  helmhorned: [Types.Entities.HELMHORNED, "helm", "Horned Helm", 20, 14],
  helmfrozen: [Types.Entities.HELMFROZEN, "helm", "Sapphire Helm", 24, 16],
  helmdiamond: [Types.Entities.HELMDIAMOND, "helm", "Diamond Helm", 34, 18],
  helmemerald: [Types.Entities.HELMEMERALD, "helm", "Emerald Helm", 46, 20],
  helmexecutioner: [Types.Entities.HELMEXECUTIONER, "helm", "Executioner Helm", 48, 20],
  helmtemplar: [Types.Entities.HELMTEMPLAR, "helm", "Templar Helm", 48, 20],
  helmdragon: [Types.Entities.HELMDRAGON, "helm", "Dragon Helm", 48, 20],
  helmmoon: [Types.Entities.HELMMOON, "helm", "Moon Helm", 50, 20],
  helmchristmas: [Types.Entities.HELMCHRISTMAS, "helm", "Christmas Helm", 50, 20],
  helmdemon: [Types.Entities.HELMDEMON, "helm", "Demon Helm", 50, 22],
  helmmystical: [Types.Entities.HELMMYSTICAL, "helm", "Mystical Helm", 52, 22],
  helmimmortal: [Types.Entities.HELMIMMORTAL, "helm", "Immortal Helm", 54, 26],
  helmpaladin: [Types.Entities.HELMPALADIN, "helm", "Paladin Helm", 54, 26],
  helmclown: [Types.Entities.HELMCLOWN, "helm", "Clown Helm", 42, 20],
  helmpumkin: [Types.Entities.HELMPUMKIN, "helm", "Special Event Pumpkin Helm", 42, 20],

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
  emeraldarmor: [Types.Entities.EMERALDARMOR, "armor", "Emerald Armor", 48, 42],
  templararmor: [Types.Entities.TEMPLARARMOR, "armor", "Templar Armor", 50, 44],
  dragonarmor: [Types.Entities.DRAGONARMOR, "armor", "Dragon Armor", 50, 44],
  moonarmor: [Types.Entities.MOONARMOR, "armor", "Moon Armor", 54, 44],
  christmasarmor: [Types.Entities.CHRISTMASARMOR, "armor", "Christmas Armor", 54, 44],
  demonarmor: [Types.Entities.DEMONARMOR, "armor", "Demon Armor", 52, 46],
  mysticalarmor: [Types.Entities.MYSTICALARMOR, "armor", "Mystical Armor", 54, 48],
  paladinarmor: [Types.Entities.PALADINARMOR, "armor", "Paladin Armor", 58, 54],
  immortalarmor: [Types.Entities.IMMORTALARMOR, "armor", "Immortal Armor", 58, 54],

  // kind, type, level, defense
  beltleather: [Types.Entities.BELTLEATHER, "belt", "Leather Belt", 4, 2],
  beltplated: [Types.Entities.BELTPLATED, "belt", "Plated Belt", 9, 4],
  beltfrozen: [Types.Entities.BELTFROZEN, "belt", "Sapphire Belt", 24, 12],
  belthorned: [Types.Entities.BELTHORNED, "belt", "Horned Belt", 26, 12],
  beltdiamond: [Types.Entities.BELTDIAMOND, "belt", "Diamond Belt", 34, 14],
  beltminotaur: [Types.Entities.BELTMINOTAUR, "belt", "Minotaur Belt", 38, 20],
  beltemerald: [Types.Entities.BELTEMERALD, "belt", "Emerald Belt", 50, 16],
  beltexecutioner: [Types.Entities.BELTEXECUTIONER, "belt", "Executioner Belt", 50, 18],
  belttemplar: [Types.Entities.BELTTEMPLAR, "belt", "Templar Belt", 52, 18],
  beltmoon: [Types.Entities.BELTMOON, "belt", "Moon Belt", 54, 18],
  beltchristmas: [Types.Entities.BELTCHRISTMAS, "belt", "Christmas Belt", 54, 18],
  beltdemon: [Types.Entities.BELTDEMON, "belt", "Demon Belt", 54, 20],
  beltmystical: [Types.Entities.BELTMYSTICAL, "belt", "Mystical Belt", 54, 20],
  beltpaladin: [Types.Entities.BELTPALADIN, "belt", "Paladin Belt", 58, 24],
  beltimmortal: [Types.Entities.BELTIMMORTAL, "belt", "Immortal Belt", 58, 24],
  beltgoldwrap: [Types.Entities.BELTGOLDWRAP, "belt", "Goldwrap", 42, 20],

  cape: [Types.Entities.CAPE, "cape", "Cape", 20, 6],

  // kind, type, level, defense
  shieldwood: [Types.Entities.SHIELDWOOD, "shield", "Wood Shield", 1, 2],
  shieldiron: [Types.Entities.SHIELDIRON, "shield", "Iron Shield", 3, 3],
  shieldplate: [Types.Entities.SHIELDPLATE, "shield", "Plate Shield", 5, 5],
  shieldred: [Types.Entities.SHIELDRED, "shield", "Red Shield", 7, 7],
  shieldgolden: [Types.Entities.SHIELDGOLDEN, "shield", "Golden Shield", 10, 10],
  shieldblue: [Types.Entities.SHIELDBLUE, "shield", "Frozen Shield", 18, 12],
  shieldhorned: [Types.Entities.SHIELDHORNED, "shield", "Horned Shield", 22, 14],
  shieldfrozen: [Types.Entities.SHIELDFROZEN, "shield", "Sapphire Shield", 26, 16],
  shielddiamond: [Types.Entities.SHIELDDIAMOND, "shield", "Diamond Shield", 36, 22],
  shieldemerald: [Types.Entities.SHIELDEMERALD, "shield", "Emerald Shield", 48, 26],
  shieldexecutioner: [Types.Entities.SHIELDEXECUTIONER, "shield", "Executioner Shield", 48, 28],
  shieldtemplar: [Types.Entities.SHIELDTEMPLAR, "shield", "Templar Shield", 50, 28],
  shielddragon: [Types.Entities.SHIELDDRAGON, "shield", "Dragon Shield", 50, 28],
  shieldmoon: [Types.Entities.SHIELDMOON, "shield", "Moon Shield", 52, 30],
  shieldchristmas: [Types.Entities.SHIELDCHRISTMAS, "shield", "Christmas Shield", 52, 30],
  shieldmystical: [Types.Entities.SHIELDMYSTICAL, "shield", "Mystical Shield", 54, 32],
  shielddemon: [Types.Entities.SHIELDDEMON, "shield", "Demon Shield", 54, 32],
  shieldpaladin: [Types.Entities.SHIELDPALADIN, "shield", "Paladin Shield", 56, 34],
  shieldimmortal: [Types.Entities.SHIELDIMMORTAL, "shield", "Immortal Shield", 56, 34],

  // kind, type, level
  ringbronze: [Types.Entities.RINGBRONZE, "ring", "Bronze Ring", 1],
  ringsilver: [Types.Entities.RINGSILVER, "ring", "Silver Ring", 9],
  ringgold: [Types.Entities.RINGGOLD, "ring", "Gold Ring", 16],
  ringplatinum: [Types.Entities.RINGPLATINUM, "ring", "Platinum Ring", 48],

  ringnecromancer: [Types.Entities.RINGNECROMANCER, "ring", "Necromancer Death Wish", 38],
  ringraistone: [Types.Entities.RINGRAISTONE, "ring", "Rai Stone", 18],
  ringfountain: [Types.Entities.RINGFOUNTAIN, "ring", "Fountain of Youth", 26],
  ringpumkin: [Types.Entities.RINGPUMKIN, "ring", "Special Event Pumpkin Ring", 42, 20],
  ringbadomen: [Types.Entities.RINGBADOMEN, "ring", "Bad Omen Ring", 64, 50],
  ringbloodband: [Types.Entities.RINGBLOODBAND, "ring", "Blood Band Ring", 64, 50],
  ringminotaur: [Types.Entities.RINGMINOTAUR, "ring", "Hell Freeze", 36],
  ringbalrog: [Types.Entities.RINGBALROG, "ring", "Ring of Power", 58],
  ringconqueror: [Types.Entities.RINGCONQUEROR, "ring", "Conqueror Ring", 50],
  ringheaven: [Types.Entities.RINGHEAVEN, "ring", "Touch of Heaven Ring", 50],
  ringwizard: [Types.Entities.RINGWIZARD, "ring", "Wizard Ring", 50],
  ringmystical: [Types.Entities.RINGMYSTICAL, "ring", "Oculus", 54],
  ringgreed: [Types.Entities.RINGGREED, "ring", "Ring of Greed", 50],
  ringimmortal: [Types.Entities.RINGIMMORTAL, "ring", "Ring of Immortality", 65],

  amuletsilver: [Types.Entities.AMULETSILVER, "amulet", "Silver Amulet", 9],
  amuletgold: [Types.Entities.AMULETGOLD, "amulet", "Gold Amulet", 20],
  amuletplatinum: [Types.Entities.AMULETPLATINUM, "amulet", "Platinum Amulet", 48],
  amuletcow: [Types.Entities.AMULETCOW, "amulet", "Holy Cow King Talisman", 34],
  amuletfrozen: [Types.Entities.AMULETFROZEN, "amulet", "Frozen Heart", 40],
  amuletmoon: [Types.Entities.AMULETMOON, "amulet", "Crescent", 54],
  amuletchristmas: [Types.Entities.AMULETCHRISTMAS, "amulet", "Yule", 54],
  amuletdemon: [Types.Entities.AMULETDEMON, "amulet", "Fiend", 55],
  amuletstar: [Types.Entities.AMULETSTAR, "amulet", "North Star", 58],
  amuletskull: [Types.Entities.AMULETSKULL, "amulet", "White Death", 58],
  amuletdragon: [Types.Entities.AMULETDRAGON, "amulet", "Dragon Eye", 56],
  amuleteye: [Types.Entities.AMULETEYE, "amulet", "All-Seeing Eye", 58],
  amuletgreed: [Types.Entities.AMULETGREED, "amulet", "Amulet of Greed", 50],
  amuletimmortal: [Types.Entities.AMULETIMMORTAL, "amulet", "Amulet of Immortality", 65],

  chestblue: [Types.Entities.CHESTBLUE, "chest", "Blue Chest", 45],
  chestgreen: [Types.Entities.CHESTGREEN, "chest", "Green Chest", 56],
  chestred: [Types.Entities.CHESTRED, "chest", "Red Chest", 60],
  chestpurple: [Types.Entities.CHESTPURPLE, "chest", "Purple Chest", 70],
  christmaspresent: [Types.Entities.CHRISTMASPRESENT, "chest", "Christmas Present", 40],
  chestdead: [Types.Entities.CHESTDEAD, "chest", "Dead Chest", 72],

  expansion2voucher: [Types.Entities.EXPANSION2VOUCHER, "consumable", "Lost Temple Expansion Voucher", 50],

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
  nanocoin: [Types.Entities.NANOCOIN, "object"],
  bananocoin: [Types.Entities.BANANOCOIN, "object"],
  barbronze: [Types.Entities.BARBRONZE, "bar", "Bronze Bar"],
  barsilver: [Types.Entities.BARSILVER, "bar", "Silver Bar"],
  bargold: [Types.Entities.BARGOLD, "bar", "Gold Bar"],
  barplatinum: [Types.Entities.BARPLATINUM, "bar", "Platinum Bar"],
  scrollupgradelow: [Types.Entities.SCROLLUPGRADELOW, "scroll", "Upgrade scroll", 3],
  scrollupgrademedium: [Types.Entities.SCROLLUPGRADEMEDIUM, "scroll", "Upgrade scroll", 6],
  scrollupgradehigh: [Types.Entities.SCROLLUPGRADEHIGH, "scroll", "Superior upgrade scroll", 15],
  scrollupgradelegendary: [Types.Entities.SCROLLUPGRADELEGENDARY, "scroll", "Legendary upgrade scroll", 48],
  scrollupgradeelementmagic: [
    Types.Entities.SCROLLUPGRADEELEMENTMAGIC,
    "scroll",
    "Blessed Magic Element upgrade scroll",
    44,
  ],
  scrollupgradeelementflame: [
    Types.Entities.SCROLLUPGRADEELEMENTFLAME,
    "scroll",
    "Blessed Flame Element upgrade scroll",
    44,
  ],
  scrollupgradeelementlightning: [
    Types.Entities.SCROLLUPGRADEELEMENTLIGHTNING,
    "scroll",
    "Lightning Element upgrade scroll",
    44,
  ],
  scrollupgradeelementcold: [
    Types.Entities.SCROLLUPGRADEELEMENTCOLD,
    "scroll",
    "Blessed Cold Element upgrade scroll",
    44,
  ],
  scrollupgradeelementpoison: [
    Types.Entities.SCROLLUPGRADEELEMENTPOISON,
    "scroll",
    "Blessed Poison Element upgrade scroll",
    44,
  ],

  scrollupgradeskillrandom: [
    Types.Entities.SCROLLUPGRADESKILLRANDOM,
    "scroll",
    "Blessed Random Skill upgrade scroll",
    44,
  ],
  scrollupgradeblessed: [Types.Entities.SCROLLUPGRADEBLESSED, "scroll", "Blessed upgrade scroll", 15],
  scrollupgradesacred: [Types.Entities.SCROLLUPGRADESACRED, "scroll", "Sacred upgrade scroll", 48],
  scrolltransmute: [Types.Entities.SCROLLTRANSMUTE, "scroll", "Transmute scroll", 30],
  scrolltransmuteblessed: [Types.Entities.SCROLLTRANSMUTEBLESSED, "scroll", "Blessed transmute scroll", 60],
  scrolltransmutepet: [Types.Entities.SCROLLTRANSMUTEPET, "scroll", "Pet transmute scroll", 60],
  stonesocket: [Types.Entities.STONESOCKET, "stone", "Socket Stone", 51],
  stonesocketblessed: [Types.Entities.STONESOCKETBLESSED, "stone", "Blesssed Socket Stone", 61],
  stonedragon: [Types.Entities.STONEDRAGON, "stone", "Dragon Stone", 60],
  stonehero: [Types.Entities.STONEHERO, "stone", "Hero Emblem", 65],
  stoneteleport: [Types.Entities.STONETELEPORT, "stone", "Teleport Stone", 45],
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
  mushrooms: [Types.Entities.MUSHROOMS, "item", "Mushrooms"],
  iou: [Types.Entities.IOU, "item", "Iou"],

  // kind, type, name, level
  "rune-sat": [Types.Entities.RUNE.SAT, "rune", "SAT Rune", 1],
  "rune-al": [Types.Entities.RUNE.AL, "rune", "AL Rune", 2],
  "rune-bul": [Types.Entities.RUNE.BUL, "rune", "BUL Rune", 3],
  "rune-nan": [Types.Entities.RUNE.NAN, "rune", "NAN Rune", 4],
  "rune-mir": [Types.Entities.RUNE.MIR, "rune", "MIR Rune", 6],
  "rune-gel": [Types.Entities.RUNE.GEL, "rune", "GEL Rune", 8],
  "rune-do": [Types.Entities.RUNE.DO, "rune", "DO Rune", 10],
  "rune-ban": [Types.Entities.RUNE.BAN, "rune", "BAN Rune", 12],
  "rune-vie": [Types.Entities.RUNE.VIE, "rune", "VIE Rune", 14],
  "rune-um": [Types.Entities.RUNE.UM, "rune", "UM Rune", 16],
  "rune-hex": [Types.Entities.RUNE.HEX, "rune", "HEX Rune", 18],
  "rune-zal": [Types.Entities.RUNE.ZAL, "rune", "ZAL Rune", 20],
  "rune-sol": [Types.Entities.RUNE.SOL, "rune", "SOL Rune", 22],
  "rune-eth": [Types.Entities.RUNE.ETH, "rune", "ETH Rune", 24],
  "rune-btc": [Types.Entities.RUNE.BTC, "rune", "BTC Rune", 26],
  "rune-vax": [Types.Entities.RUNE.VAX, "rune", "VAX Rune", 28],
  "rune-por": [Types.Entities.RUNE.POR, "rune", "POR Rune", 30],
  "rune-las": [Types.Entities.RUNE.LAS, "rune", "LAS Rune", 32],
  "rune-dur": [Types.Entities.RUNE.DUR, "rune", "DUR Rune", 34],
  "rune-fal": [Types.Entities.RUNE.FAL, "rune", "FAL Rune", 36],
  "rune-kul": [Types.Entities.RUNE.KUL, "rune", "KUL Rune", 38],
  "rune-mer": [Types.Entities.RUNE.MER, "rune", "MER Rune", 41],
  "rune-qua": [Types.Entities.RUNE.QUA, "rune", "QUA Rune", 44],
  "rune-gul": [Types.Entities.RUNE.GUL, "rune", "GUL Rune", 47],
  "rune-ber": [Types.Entities.RUNE.BER, "rune", "BER Rune", 50],
  "rune-cham": [Types.Entities.RUNE.CHAM, "rune", "CHAM Rune", 53],
  "rune-tor": [Types.Entities.RUNE.TOR, "rune", "TOR Rune", 56],
  "rune-xno": [Types.Entities.RUNE.XNO, "rune", "XNO Rune", 59],
  "rune-jah": [Types.Entities.RUNE.JAH, "rune", "JAH Rune", 62],
  "rune-shi": [Types.Entities.RUNE.SHI, "rune", "SHI Rune", 65],
  "rune-vod": [Types.Entities.RUNE.VOD, "rune", "VOD Rune", 68],

  "deathbringer-spell": [Types.Entities.DEATHBRINGERSPELL, "spell", "Bone Spirith", 70],
  "deathangel-spell": [Types.Entities.DEATHANGELSPELL, "spell", "Bone Spirith", 70],
  "mage-spell": [Types.Entities.MAGESPELL, "spell", "Mage Spell", 60],
  arrow: [Types.Entities.ARROW, "spell", "Arrow", 60],
  "statue-spell": [Types.Entities.STATUESPELL, "spell", "Fire Ball", 60],
  "statue2-spell": [Types.Entities.STATUE2SPELL, "spell", "Ice Ball", 60],

  guard: [Types.Entities.GUARD, "npc"],
  villagegirl: [Types.Entities.VILLAGEGIRL, "npc"],
  villager: [Types.Entities.VILLAGER, "npc"],
  carlosmatos: [Types.Entities.CARLOSMATOS, "npc"],
  janetyellen: [Types.Entities.JANETYELLEN, "npc"],
  merchant: [Types.Entities.MERCHANT, "npc"],
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
  portalgateway: [Types.Entities.PORTALGATEWAY, "npc"],
  gatewayfx: [Types.Entities.GATEWAYFX, "npc"],
  gate: [Types.Entities.GATE, "npc"],
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
  lever3: [Types.Entities.LEVER3, "npc"],
  grimoire: [Types.Entities.GRIMOIRE, "npc"],
  fossil: [Types.Entities.FOSSIL, "npc"],
  panelskeletonkey: [Types.Entities.PANELSKELETONKEY, "npc"],
  obelisk: [Types.Entities.OBELISK, "npc"],
  hands: [Types.Entities.HANDS, "npc"],
  alkor: [Types.Entities.ALKOR, "npc"],
  olaf: [Types.Entities.OLAF, "npc"],
  victor: [Types.Entities.VICTOR, "npc"],
  fox: [Types.Entities.FOX, "npc"],
  tree: [Types.Entities.TREE, "npc"],
  trap: [Types.Entities.TRAP, "npc"],
  trap2: [Types.Entities.TRAP2, "npc"],
  trap3: [Types.Entities.TRAP3, "npc"],
  statue: [Types.Entities.STATUE, "npc"],
  statue2: [Types.Entities.STATUE2, "npc"],
  doordeathangel: [Types.Entities.DOORDEATHANGEL, "npc"],

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

Types.rankedHelms = [
  Types.Entities.HELMCLOTH,
  Types.Entities.HELMLEATHER,
  Types.Entities.HELMMAIL,
  Types.Entities.HELMPLATE,
  Types.Entities.HELMRED,
  Types.Entities.HELMGOLDEN,
  Types.Entities.HELMBLUE,
  Types.Entities.HELMHORNED,
  Types.Entities.HELMFROZEN,
  Types.Entities.HELMDIAMOND,
  Types.Entities.HELMEMERALD,
  Types.Entities.HELMEXECUTIONER,
  Types.Entities.HELMTEMPLAR,
  Types.Entities.HELMDRAGON,
  Types.Entities.HELMMOON,
  Types.Entities.HELMCHRISTMAS,
  Types.Entities.HELMDEMON,
  Types.Entities.HELMMYSTICAL,
  Types.Entities.HELMIMMORTAL,
  Types.Entities.HELMPALADIN,
  Types.Entities.HELMCLOWN,
  Types.Entities.HELMPUMKIN,
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
  Types.Entities.TEMPLARARMOR,
  Types.Entities.DRAGONARMOR,
  Types.Entities.MOONARMOR,
  Types.Entities.CHRISTMASARMOR,
  Types.Entities.DEMONARMOR,
  Types.Entities.MYSTICALARMOR,
  Types.Entities.PALADINARMOR,
  Types.Entities.IMMORTALARMOR,
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
  Types.Entities.BELTTEMPLAR,
  Types.Entities.BELTDEMON,
  Types.Entities.BELTMOON,
  Types.Entities.BELTCHRISTMAS,
  Types.Entities.BELTMYSTICAL,
  Types.Entities.BELTPALADIN,
  Types.Entities.BELTIMMORTAL,
  Types.Entities.BELTGOLDWRAP,
];

Types.itemUniqueMap = {
  // Quest items
  wirtleg: ["Bored Ape Yacht Club"],
  pickaxe: ["Extinction"],
  hellhammer: ["Self Custody"],

  sword: ["Faketoshi"],
  axe: ["NonDisclosure Agreement"],
  morningstar: ["Block Latte"],
  bluesword: ["Acyclic Graph"],
  redsword: ["Volcanic Miner"],
  goldensword: ["Satoshi's Nephew"],
  blueaxe: ["Feeless Cutter"],
  bluemorningstar: ["Saylormoon"],
  frozensword: ["Broccolish Fury"],
  diamondsword: ["Inevitable"],
  minotauraxe: ["PoS4QoS"],
  emeraldsword: ["Non Fungible Token"],
  executionersword: ["The Grandfather"],
  templarsword: ["Panic Sell"],
  dragonsword: ["Balerion the Black Dread"],
  moonsword: ["Moon Boy"],
  christmassword: ["HO HO HO"],
  moonhachet: ["Blue Moon"],
  christmashachet: ["Candy cane"],
  moonmaul: ["dark face"],
  mchristmasmaul: ["Eggnog"],
  demonmaul: ["return to Dust"],
  demonaxe: ["Trustable"],
  demonsickle: ["crypto 4 year cycle"],
  mysticalsword: ["The Maximalist"],
  mysticaldagger: ["Long-term Security"],
  spikeglaive: ["WAGMI"],
  eclypsedagger: ["Ethereum Killer"],
  paladinaxe: ["Peer to Peer Digital Cash"],
  immortalsword: ["Least Error & Latency will Win"],
  maul: ["Mining at a loss"],
  wizardsword: ["$€Ӿ¥!"],

  helmleather: ["Point of Sale"],
  helmmail: ["Bull Run"],
  helmplate: ["Roadmap"],
  helmred: ["Community"],
  helmgolden: ["IOU"],
  helmblue: ["This is Huge"],
  helmhorned: ["Only Up From Here"],
  helmfrozen: ["Human Psychology"],
  helmdiamond: ["New Listing"],
  helmemerald: ["Code Proposal"],
  helmexecutioner: ["10 Cents on the Dollar"],
  helmtemplar: ["Captcha Distribution"],
  helmdragon: ["Debt Ceiling"],
  helmmoon: ["Return on Investment"],
  helmchristmas: ["Gingerbread"],
  helmdemon: ["Chapter 9"],
  helmmystical: ["Crystal Ball"],
  helmimmortal: ["Update The System"],
  helmpaladin: ["Safe Heaven"],
  helmclown: ["Clownbase"],
  helmpumkin: ["CVE-2023-40234"],

  // name, level, defense
  leatherarmor: ["Representative"],
  mailarmor: ["ForeX Guard"],
  platearmor: ["Green Alternative"],
  redarmor: ["Appia's Road"],
  goldenarmor: ["Store of Value"],
  bluearmor: ["Firano's Hide"],
  hornedarmor: ["RaiBlocks"],
  frozenarmor: ["Wall of Encrypted Energy"],
  diamondarmor: ["Zero-knowledge Proof"],
  emeraldarmor: ["Jungle Warcry"],
  templararmor: ["133 Club"],
  dragonarmor: ["BlackRock"],
  moonarmor: ["To The <strike>Moon</strike> Mars"],
  christmasarmor: ["Santa Claus"],
  demonarmor: ["Explorer's Block"],
  mysticalarmor: ["Rug Pull"],
  paladinarmor: ["Fear Of Missing Out (FOMO)"],
  immortalarmor: ["Deploying More Capital"],

  // name, level, defense
  shieldwood: ["Liquidity Provider"],
  shieldiron: ["Bearer Token"],
  shieldplate: ["King Louie"],
  shieldred: ["Marstronaut"],
  shieldgolden: ["1 Ban = 1 Ban"],
  shieldblue: ["Cold Storage"],
  shieldhorned: ["Do Klost"],
  shieldfrozen: ["Probably Nothing"],
  shielddiamond: ["Diamond Hands"],
  shieldemerald: ["PermaBear"],
  shieldexecutioner: ["Inverse Cramer"],
  shieldtemplar: ["NanoStrategy"],
  shielddragon: ["Airdrop"],
  shieldmoon: ["Fear Uncertainty Doubt (FUD)"],
  shieldchristmas: ["Snowflake"],
  shieldmystical: ["Developer Fund"],
  shielddemon: ["ORV > POW"],
  shieldpaladin: ["Vote Hinting"],
  shieldimmortal: ["TBD"],

  cape: ["Cloak of Levitation"],

  // name, level, defense
  beltleather: ["Proof of Wear"],
  beltplated: ["Hodler"],
  beltfrozen: ["Spam Resistor"],
  belthorned: ["Dee-Fye"],
  beltdiamond: ["Election scheduler"],
  beltminotaur: ["TaaC"],
  beltemerald: ["CBDC"],
  beltexecutioner: ["Attack Vector"],
  belttemplar: ["99 on Huobi"],
  beltmoon: ["Commercial Grade"],
  beltchristmas: ["Midnight"],
  beltdemon: ["1000 CPS"],
  beltmystical: ["Horizontal Scaling"],
  beltpaladin: ["Slava Ukraini"],
  beltimmortal: ["TBD"],
  beltgoldwrap: ["Goldwrap"],
};

Types.isSuperUnique = (itemName: string) =>
  [
    "ringnecromancer",
    "ringraistone",
    "ringfountain",
    "ringpumkin",
    "ringbadomen",
    "ringbloodband",
    "ringminotaur",
    "ringmystical",
    "ringbalrog",
    "ringconqueror",
    "ringheaven",
    "ringwizard",
    "ringgreed",
    "ringimmortal",
    "amuletcow",
    "amuletfrozen",
    "amuletdemon",
    "amuletmoon",
    "amuletchristmas",
    "amuletstar",
    "amuletskull",
    "amuletdragon",
    "amuleteye",
    "amuletgreed",
    "stonedragon",
    "amuletimmortal",
    "stonehero",
    "soulstone",
    "helmclown",
    "helmpumkin",
    "beltgoldwrap",
  ].includes(itemName);

Types.getLevel = function (exp: number) {
  var i = 1;
  for (i = 1; i < Types.expForLevel.length; i++) {
    if (exp < Types.expForLevel[i]) {
      return i;
    }
  }
  return i;
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

Types.isHelm = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "helm";
  } else {
    return kinds[kindOrString][1] === "helm";
  }
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
      Types.Entities.WORM,
      Types.Entities.DEATHBRINGER,
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
      "worm",
      "deathbringer",
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
      Types.Entities.SCROLLTRANSMUTEBLESSED,
      Types.Entities.SCROLLTRANSMUTEPET,
      Types.Entities.SCROLLUPGRADEELEMENTMAGIC,
      Types.Entities.SCROLLUPGRADEELEMENTFLAME,
      Types.Entities.SCROLLUPGRADEELEMENTLIGHTNING,
      Types.Entities.SCROLLUPGRADEELEMENTCOLD,
      Types.Entities.SCROLLUPGRADEELEMENTPOISON,
      Types.Entities.SCROLLUPGRADESKILLRANDOM,
    ].includes(kindOrString);
  } else {
    return kindOrString?.startsWith("scroll");
  }
};

Types.isStone = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [
      Types.Entities.STONESOCKET,
      Types.Entities.STONESOCKETBLESSED,
      Types.Entities.STONEDRAGON,
      Types.Entities.STONEHERO,
      Types.Entities.SOULSTONE,
      Types.Entities.STONETELEPORT,
    ].includes(kindOrString);
  } else {
    return kindOrString?.startsWith("stone") || kindOrString?.startsWith("soulstone");
  }
};

Types.isBar = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [
      Types.Entities.BARBRONZE,
      Types.Entities.BARSILVER,
      Types.Entities.BARGOLD,
      Types.Entities.BARPLATINUM,
    ].includes(kindOrString);
  } else {
    return (
      kindOrString?.startsWith("barbronze") ||
      kindOrString?.startsWith("barsilver") ||
      kindOrString?.startsWith("bargold") ||
      kindOrString?.startsWith("barplatinum")
    );
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
      Types.Entities.CHRISTMASPRESENT,
      Types.Entities.CHESTDEAD,
      Types.Entities.CHESTRED,
    ].includes(kindOrString);
  } else {
    return kindOrString?.startsWith("chest") || kindOrString.includes("present");
  }
};

Types.isConsumable = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [Types.Entities.EXPANSION2VOUCHER].includes(kindOrString);
  } else if (typeof kindOrString === "string") {
    return kinds[kindOrString] ? kinds[kindOrString][1] === "consumable" : false;
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
        Types.Entities.RINGPUMKIN,
        Types.Entities.RINGBADOMEN,
        Types.Entities.RINGBLOODBAND,
        Types.Entities.RINGMINOTAUR,
        Types.Entities.RINGMYSTICAL,
        Types.Entities.RINGBALROG,
        Types.Entities.RINGCONQUEROR,
        Types.Entities.RINGHEAVEN,
        Types.Entities.RINGWIZARD,
        Types.Entities.RINGRGEED,
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
        "ringpumkin",
        "ringbadomen",
        "ringbloodband",
        "ringminotaur",
        "ringmystical",
        "ringbalrog",
        "ringconqueror",
        "ringheaven",
        "ringwizard",
        "ringgreed",
        "ringimmortal",
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
        Types.Entities.AMULETCHRISTMAS,
        Types.Entities.AMULETSTAR,
        Types.Entities.AMULETSKULL,
        Types.Entities.AMULETDRAGON,
        Types.Entities.AMULETEYE,
        Types.Entities.AMULETGREED,
        Types.Entities.AMULETIMMORTAL,
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
      [
        "amuletcow",
        "amuletfrozen",
        "amuletdemon",
        "amuletmoon",
        "amuletchristmas",
        "amuletstar",
        "amuletskull",
        "amuletdragon",
        "amuleteye",
        "amuletgreed",
        "amuletimmortal",
      ].includes(kindOrString)
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

Types.isUniqueJewel = function (kindOrString: number, bonus: number[] = [], level: number) {
  if (!Types.isJewel(kindOrString)) return false;

  return (
    (level === 1 && bonus.length === 2) ||
    (level === 2 && bonus.length === 3) ||
    (level === 3 && bonus.length === 4) ||
    (level === 4 && bonus.length === 5) ||
    (level === 5 && bonus.length === 6)
  );
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
      Types.Entities.NFT,
      Types.Entities.WING,
      Types.Entities.CRYSTAL,
      Types.Entities.POWDERBLACK,
      Types.Entities.POWDERBLUE,
      Types.Entities.POWDERGOLD,
      Types.Entities.POWDERGREEN,
      Types.Entities.POWDERRED,
      Types.Entities.POWDERQUANTUM,
      Types.Entities.PICKAXE,
      Types.Entities.MUSHROOMS,
    ].includes(kindOrString);
  } else {
    return (
      [
        "skeletonkingcage",
        "necromancerheart",
        "cowkinghorn",
        "chalice",
        "nft",
        "wing",
        "crystal",
        "powderblack",
        "powderblue",
        "powdergold",
        "powdergreen",
        "powderred",
        "powderquantum",
        "pickaxe",
        "mushrooms",
      ].includes(kindOrString) ||
      kindOrString.startsWith("skeletonkingcage") ||
      kindOrString.startsWith("necromancerheart") ||
      kindOrString.startsWith("cowkinghorn") ||
      kindOrString.startsWith("chalice") ||
      kindOrString.startsWith("nft") ||
      kindOrString.startsWith("wing") ||
      kindOrString.startsWith("crystal") ||
      kindOrString.startsWith("powder") ||
      kindOrString.startsWith("pickaxe") ||
      kindOrString.startsWith("mushrooms")
    );
  }
};

Types.isQuantity = function (kindOrString: number | string) {
  return (
    Types.isScroll(kindOrString) ||
    Types.isChest(kindOrString) ||
    Types.isRune(kindOrString) ||
    Types.isStone(kindOrString) ||
    Types.isBar(kindOrString) ||
    Types.isConsumable(kindOrString)
  );
};

Types.isNotStackableItem = function (kindOrString: number | string) {
  if (!kindOrString) return false;
  if (typeof kindOrString === "number") {
    return [Types.Entities.IOU, Types.Entities.PETEGG].includes(kindOrString);
  } else {
    return kindOrString.startsWith("iou") || kindOrString.startsWith("petegg");
  }
};

Types.isEquipableItem = function (kind: number) {
  return (
    Types.isWeapon(kind) ||
    Types.isHelm(kind) ||
    Types.isArmor(kind) ||
    Types.isRing(kind) ||
    Types.isAmulet(kind) ||
    Types.isBelt(kind) ||
    Types.isCape(kind) ||
    Types.isShield(kind) ||
    Types.isPetItem(kind)
  );
};

Types.isItem = function (kind: number) {
  return (
    Types.isWeapon(kind) ||
    Types.isHelm(kind) ||
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
    Types.isBar(kind) ||
    Types.isJewel(kind) ||
    Types.isPetItem(kind) ||
    Types.isNotStackableItem(kind) ||
    Types.isConsumable(kind) ||
    (Types.isObject(kind) && !Types.isStaticChest(kind))
  );
};

Types.isSocketItem = function (kind: number) {
  return Types.isWeapon(kind) || Types.isHelm(kind) || Types.isArmor(kind) || Types.isShield(kind);
};

Types.isCorrectTypeForSlot = function (slot: number | string, item: string) {
  switch (slot) {
    case "weapon":
    case Slot.WEAPON:
      return Types.isWeapon(item);
    case "helm":
    case Slot.HELM:
      return Types.isHelm(item);
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
    case "pet":
    case Slot.PET:
      return Types.isPetItem(item) && item !== "petegg";
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
    Types.Entities.POISONPOTION,
  ].includes(kind);
};

Types.isExpendableItem = function (kind: number) {
  return Types.isHealingItem(kind) || kind === Types.Entities.FIREFOXPOTION || kind === Types.Entities.CAKE;
};

Types.isPet = function (kind: number) {
  if (!kind) return false;

  return [
    Types.Entities.PET_DINO,
    Types.Entities.PET_BAT,
    Types.Entities.PET_CAT,
    Types.Entities.PET_DOG,
    Types.Entities.PET_TURTLE,
    Types.Entities.PET_AXOLOTL,
    Types.Entities.PET_FOX,
    Types.Entities.PET_MOUSE,
    Types.Entities.PET_HEDGEHOG,
  ].includes(kind);
};

Types.isPetItem = function (kindOrString: string | number) {
  if (!kindOrString) return false;
  if (typeof kindOrString === "number") {
    return [
      Types.Entities.PETEGG,
      Types.Entities.PETCOLLAR,
      Types.Entities.PETDINO,
      Types.Entities.PETBAT,
      Types.Entities.PETCAT,
      Types.Entities.PETDOG,
      Types.Entities.PETAXOLOTL,
      Types.Entities.PETFOX,
      Types.Entities.PETTURTLE,
      Types.Entities.PETDUCK,
      Types.Entities.PETDEER,
      Types.Entities.PETREINDEER,
      Types.Entities.PETMONKEY,
      Types.Entities.PETHELLHOUND,
      Types.Entities.PETDRAGON,
      Types.Entities.PETMOUSE,
      Types.Entities.PETHEDGEHOG,
    ].includes(kindOrString);
  } else {
    return kindOrString.startsWith("pet");
  }
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
  } else if (name === "janetyellen") {
    return "janet yellen";
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
  } else if (name === "stash") {
    return "Personal Stash";
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
  } else if (name.startsWith("lever")) {
    return "Lever";
  } else if (name === "wraith2") {
    return "Spectral Wraith";
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
  } else if (name === "skeletonarcher") {
    return "Skeleton Archer";
  } else if (name === "skeletontemplar") {
    return "Boneshard";
  } else if (name === "skeletontemplar2") {
    return "Bonecrusader";
  } else if (name === "spider") {
    return "Venomweaver Spider";
  } else if (name === "spider2") {
    return "Spellweaver Spider";
  } else if (name === "spiderqueen") {
    return "Arachneia the Spider Queen";
  } else if (name === "butcher") {
    return "Gorefiend the Butcher";
  } else if (name === "shaman") {
    return "Zul'Gurak";
  } else if (name === "worm") {
    return "Shai-Hulud";
  } else if (name === "doordeathangel") {
    return "The Gates of Azrael";
  } else if (name === "deathangel") {
    return "Azrael";
  } else if (name === "skeletonscythe1") {
    return "Shadowveil Guardian";
  } else if (name === "deathbringer") {
    return "Death Bringer";
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
    forbidden = [Types.Entities.DAGGER, Types.Entities.CLOTHARMOR, Types.Entities.HELMCLOTH],
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
  "+#% Attack", // 0
  "+#% Defense", // 1
  "+#% Experience", // 2
  "+# Minimum damage", // 3
  "+# Maximum damage", // 4
  "+# Health", // 5
  "+# Magic damage", // 6
  "+#% All resistances", // 7
  "+#% Extra gold from enemies", // 8
];

Types.partyBonusType = [
  "attackDamage",
  "defense",
  "exp",
  "minDamage",
  "maxDamage",
  "health",
  "magicDamage",
  "allResistance",
  "extraGold",
];

Types.getBonusDescriptionMap = [
  "+# Minimum damage", // 0
  "+# Maximum damage", // 1
  "+# Attack", // 2
  "+# Health", // 3
  "+# Magic damage", // 4
  "+# Defense", // 5
  "+# Absorbed damage", // 6
  "+#% Experience", // 7
  "+# health regeneration per second", // 8
  "+#% Critical hit", // 9
  "+#% Block enemy attack", // 10
  "+#% Magic find", // 11
  "+#% Attack speed", // 12
  "+# Drain life", // 13
  "+# Flame damage", //14
  "+# Lightning damage", // 15
  "+# Pierce armor attack", // 16
  "+# Health", // 17
  "+# Cold damage", // 18
  "+#% Freeze the enemy for # seconds", // 19
  "-#% Chance of being frozen", // 20
  "+#% Magic resistance", // 21
  "+#% Flame resistance", // 22
  "+#% Lightning resistance", // 23
  "+#% Cold resistance", // 24
  "+#% Poison resistance", // 25
  "+#% Spectral resistance", // 26
  "+#% Magic damage", // 27
  "+#% Flame damage", // 28
  "+#% Lightning damage", // 29
  "+#% Cold damage", // 30
  "+#% Poison damage", // 31
  "+#% All resistances", // 32
  "+#% Prevent enemy health regeneration", // 33
  "+# Poison damage", // 34
  "#% Faster cast rate", // 35
  "-#% Enemy lower Magic resistance", // 36
  "-#% Enemy lower Flame resistance", // 37
  "-#% Enemy lower Lightning resistance", // 38
  "-#% Enemy lower Cold resistance", // 39
  "-#% Enemy lower Poison resistance", // 40
  "-#% Enemy lower resistances", // 41
  "+#% Extra gold from enemies", // 42
  "superior", // 43
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
  "extraGold", // 42,
  "superior", // 43
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
  const magicFindPerLevel = [1, 2, 3, 5, 7, 9, 12, 16, 22, 30];
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
  const spectralResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const magicDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const flameDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const lightningDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const coldDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const poisonDamagePercentPerLevel = [1, 3, 6, 9, 12, 15, 20, 28, 35, 45];
  const allResistancePerLevel = [1, 2, 3, 4, 5, 7, 10, 15, 20, 28];
  const preventRegenerateHealthPerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const poisonDamagePerLevel = [1, 3, 6, 9, 12, 16, 20, 25, 32, 45];
  const skillTimeoutPerLevel = [1, 2, 4, 6, 8, 10, 13, 17, 24, 30];
  const lowerMagicResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerFlameResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerLightningResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerColdResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerPoisonResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerAllResistancePerLevel = [1, 2, 3, 5, 7, 9, 12, 16, 22, 30];
  const extraGoldPerLevel = [1, 2, 4, 7, 12, 15, 18, 22, 30, 40];

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
    spectralResistancePerLevel,
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
    extraGoldPerLevel,
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
  const allResistancePerLevel = [1, 2, 3, 4, 6, 8, 11, 14, 19, 25, 32];
  const extraGoldPerLevel = [1, 2, 3, 4, 6, 8, 11, 14, 19, 25, 32];

  const bonusPerLevel = [
    attackDamagePerLevel,
    defensePerLevel,
    expPerLevel,
    minDamagePerLevel,
    maxDamagePerLevel,
    healthPerLevel,
    magicDamagePerLevel,
    allResistancePerLevel,
    extraGoldPerLevel,
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
  reduceFrozenChance: 100,
  magicResistance: PLAYER_MAX_RESISTANCES,
  flameResistance: PLAYER_MAX_RESISTANCES,
  lightningResistance: PLAYER_MAX_RESISTANCES,
  coldResistance: PLAYER_MAX_RESISTANCES,
  poisonResistance: PLAYER_MAX_RESISTANCES,
  freezeChance: 75,
  //@heavy weight needs to bypass this check, check will happen in calculateAttackSpeedCap FN
  // attackSpeed: PLAYER_MAX_ATTACK_SPEED,

  magicFind: PLAYER_MAX_MAGIC_FIND,
  skillTimeout: 50,
  extraGold: PLAYER_MAX_EXTRA_GOLD,
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

Types.getTransmuteSuccessRate = (item, bonus, isBlessed) => {
  const isUnique = Types.isUnique(item, bonus);
  const isRing = Types.isRing(item);
  const isAmulet = Types.isAmulet(item);
  const isBelt = Types.isBelt(item);
  const isCape = Types.isCape(item);
  const isPet = Types.isPetItem(item);
  const isShield = Types.isShield(item);
  const isWeapon = Types.isWeapon(item);
  const isHelm = Types.isHelm(item);
  const isArmor = Types.isArmor(item);
  const isUniqueRing = isRing && isUnique;
  const isUniqueAmulet = isAmulet && isUnique;
  const isUniqueBelt = isBelt && isUnique;
  const isUniqueCape = isCape && isUnique;
  const isUniqueShield = isShield && isUnique;
  const isUniqueWeapon = isWeapon && isUnique;
  const isUniqueArmor = isArmor && isUnique;
  const isUniqueHelm = isHelm && isUnique;
  const isUniquePet = isPet && isUnique;

  const uniqueSuccessRateMap = {
    goldensword: 20,
    blueaxe: 18,
    bluemorningstar: 18,
    frozensword: 15,
    diamondsword: 12,
    minotauraxe: 10,
    emeraldsword: 10,
    executionersword: 10,
    templarsword: 8,
    dragonsword: 8,
    moonsword: 8,
    christmassword: 8,
    moonhachet: 8,
    christmashachet: 8,
    moonmaul: 8,
    christmasmaul: 8,
    mysticalsword: 6,
    mysticaldagger: 6,
    spikeglaive: 6,
    eclypsedagger: 6,
    demonaxe: 6,
    demonmaul: 6,
    demonscickle: 6,
    paladinaxe: 4,
    immortalsword: 4,
    hellhammer: 6,
    maul: 4,
    wizardsword: 4,
    helmgolden: 20,
    helmblue: 18,
    helmhorned: 15,
    helmfrozen: 15,
    helmdiamond: 12,
    helmemerald: 10,
    helmexecutioner: 10,
    helmtemplar: 8,
    helmdragon: 8,
    helmmoon: 8,
    helmchristmas: 8,
    helmdemon: 6,
    helmmystical: 6,
    helmimmortal: 4,
    helmpaladin: 4,

    goldenarmor: 20,
    bluearmor: 18,
    hornedarmor: 15,
    frozenarmor: 15,
    diamondarmor: 12,
    emeraldarmor: 10,
    templararmor: 8,
    dragonarmor: 8,
    moonarmor: 8,
    christmasarmor: 8,
    demonarmor: 6,
    mysticalarmor: 6,
    paladinarmor: 4,
    immortalarmor: 4,

    beltfrozen: 15,
    belthorned: 15,
    beltdiamond: 12,
    beltminotaur: 10,
    beltemerald: 10,
    beltexecutioner: 10,
    belttemplar: 8,
    beltmoon: 8,
    beltchristmas: 8,
    beltdemon: 6,
    beltmystical: 6,

    shieldgolden: 20,
    shieldblue: 18,
    shieldhorned: 18,
    shieldfrozen: 15,
    shielddiamond: 12,
    shieldemerald: 10,
    shieldexecutioner: 10,
    shieldtemplar: 8,
    shielddragon: 8,
    shieldmoon: 8,
    shieldmystical: 6,
    shielddemon: 6,
    shieldimmortal: 6,
    shieldpaladin: 6,

    ringgold: 12,
    ringplatinum: 6,
    amuletgold: 12,
    amuletplatinum: 6,

    petdino: 4,
    petbat: 4,
    petcat: 4,
    petdog: 4,
    petaxolotl: 4,
    pethedgehog: 4,
    petfox: 4,
    petturtle: 4,
    petduck: 4,
    petdeer: 4,
    petdragon: 4,
    petmouse: 4,
    cape: 6,
  };

  const transmuteSuccessRate = isBlessed ? 99 : 75;

  if (
    isUniqueRing ||
    isUniqueAmulet ||
    isUniqueBelt ||
    isUniqueCape ||
    isUniquePet ||
    isUniqueShield ||
    isUniqueWeapon ||
    isUniqueArmor ||
    isUniqueHelm
  ) {
    return { transmuteSuccessRate, uniqueSuccessRate: 100 };
  } else if (!isUnique && uniqueSuccessRateMap[item]) {
    return {
      uniqueSuccessRate: uniqueSuccessRateMap[item] + (isBlessed ? 2 : 0),
      ...(isRing || isAmulet || isCape || isPet || isShield || isWeapon || isHelm || isArmor || isBelt
        ? { transmuteSuccessRate }
        : null),
    };
  }

  // Can't use scroll on the item
  return null;
};

// kind, type, name, level, defense
Types.getArmorDefense = function (armor: string, level: number, isUnique: boolean, isSuperior: boolean) {
  if (!armor || !level) return 0;

  const itemClass = Types.getItemClass(armor, level);
  const itemClassRank = Types.itemClassRank[itemClass];

  const defense =
    kinds[armor][4] +
    (isUnique ? itemClassRank + 1 : 0) +
    (isSuperior ? Types.itemClassRankSuperiorBonus[itemClass] : 0);
  const defensePercentPerLevel = [100, 105, 110, 120, 130, 145, 160, 180, 205, 235];
  const defenseBonus = level >= 7 ? level - 6 : 0;

  return Math.ceil((defense + defenseBonus) * (defensePercentPerLevel[level - 1] / 100));
};

Types.getArmorHealthBonus = function (level: number) {
  if (!level) return 0;

  const healthBonusPerLevel = [1, 3, 6, 9, 12, 15, 20, 28, 35, 45];

  return healthBonusPerLevel[level - 1];
};

Types.getWeaponDamage = function (weapon: string, level: number, isUnique: boolean, isSuperior: boolean) {
  const itemClass = Types.getItemClass(weapon, level);
  const itemClassRank = Types.itemClassRank[itemClass];

  const weight = getWeaponWeightbyKind(kinds[weapon][0]);
  const attackBonusPercentByWeight = attackBonusPercentsFromWeightMap[weight];

  const damage =
    kinds[weapon][4] +
    (isUnique ? itemClassRank + 1 : 0) +
    (isSuperior ? Types.itemClassRankSuperiorBonus[itemClass] : 0);
  const damagePercentPerLevel = [100, 105, 110, 120, 130, 145, 160, 185, 215, 255];
  const damageBonus = level >= 7 ? Math.ceil((level - 6) * 2) : 0;

  let totalDamage = (damage + damageBonus) * (damagePercentPerLevel[level - 1] / 100);
  totalDamage = Math.ceil(totalDamage * (1 + attackBonusPercentByWeight / 100));

  return totalDamage;
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

  return baseLevel >= 48;
};

Types.getItemClass = function (item: string, level?: number) {
  const baseLevel = Types.getItemBaseLevel(item);

  const isPet = Types.isPetItem(item);
  if (isPet || level >= 9) {
    return "legendary";
  }

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
  } else if (baseLevel >= 10 && baseLevel < 48) {
    itemClass = "high";
    if (level >= 8) {
      itemClass = "legendary";
    }
  } else if (baseLevel >= 48) {
    itemClass = "legendary";
  }

  return itemClass;
};

Types.itemClassRank = {
  low: 0,
  medium: 1,
  high: 2,
  legendary: 3,
};

Types.itemClassRankSuperiorBonus = {
  low: 1,
  medium: 1,
  high: 2,
  legendary: 3,
};

Types.getItemBaseLevel = function (item: string) {
  return kinds[item][3];
};

Types.getItemRequirement = function (item: string, level: number) {
  const baseLevel = Types.getItemBaseLevel(item);
  const multiplier = Types.getItemClass(item, level) === "high" ? 1.5 : 1;
  const requirement = Math.floor(baseLevel + level * multiplier);

  return requirement;
};

Types.isSuperior = function (rawBonus) {
  return toArray(rawBonus)?.includes(43);
};

Types.isUnique = function (item, rawBonus, level?: number) {
  const isWeapon = kinds[item][1] === "weapon";
  const isHelm = kinds[item][1] === "helm";
  const isArmor = kinds[item][1] === "armor";
  const isBelt = kinds[item][1] === "belt";
  const isCape = kinds[item][1] === "cape";
  const isShield = kinds[item][1] === "shield";
  const isRing = kinds[item][1] === "ring";
  const isAmulet = kinds[item][1] === "amulet";
  const isJewel = kinds[item][1] === "jewel";
  const isPet = Types.isPetItem(item);

  let isUnique = false;
  // Superior attribute
  let bonus = toArray(rawBonus);

  if (Array.isArray(bonus) && bonus.length) {
    bonus = bonus.filter(oneBonus => oneBonus !== 43);
  }

  if (isRing) {
    isUnique = Types.isUniqueRing(item, bonus);
  } else if (isAmulet) {
    isUnique = Types.isUniqueAmulet(item, bonus);
  } else if (isCape || isPet || isShield || isWeapon) {
    isUnique = bonus ? bonus.length >= 2 : false;
  } else if (isBelt || isArmor || isHelm) {
    isUnique = bonus ? bonus.length >= 1 : false;
  } else if (isJewel) {
    isUnique = Types.isUniqueJewel(item, bonus, level);
  }

  return isUnique;
};

Types.getJewelBonus = function (rawSockets: string[]) {
  let combinedBonus = {};

  rawSockets?.forEach(rawSocket => {
    if (typeof rawSocket !== "string") return;

    const [item, rawLevel, rawBonus] = rawSocket.split("|");
    if (!Types.isJewel(item)) return;

    const level = Number(rawLevel);
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

Types.combineBonus = (bonus1, bonus2) => {
  return Object.entries(bonus2).reduce(
    (acc, [key, value]) => {
      acc[key] = (acc[key] || 0) + value;
      return acc;
    },
    { ...bonus1 },
  );
};

Types.getItemDetails = function ({
  item,
  level,
  rawBonus,
  rawSocket,
  rawSkill,
  playerBonus,
  amount,
}: {
  item: string;
  weight: [number, string];
  level: number;
  rawBonus: number[];
  rawSocket?: number[];
  rawSkill?: number;
  playerBonus: any;
  amount?: number;
}) {
  const isWeapon = Types.isWeapon(item);

  const weight = isWeapon ? Types.getWeaponWeightbyKind(Types.getKindFromString(item)) : null;
  const isHelm = Types.isHelm(item);
  const isArmor = Types.isArmor(item);
  const isRing = Types.isRing(item);
  const isAmulet = Types.isAmulet(item);
  const isBelt = Types.isBelt(item);
  const isCape = Types.isCape(item);
  const isShield = Types.isShield(item);
  const isUnique = Types.isUnique(item, rawBonus, level);
  const isRune = Types.isRune(item);
  const isJewel = Types.isJewel(item);
  const isStone = Types.isStone(item);
  const rune = isRune ? Types.getRuneFromItem(item) : null;
  const isSocket = rawSocket?.length;
  const socketRequirement = isSocket ? Types.getHighestSocketRequirement(rawSocket) : null;
  const jewelRequirement = isJewel ? Types.getJewelRequirement(rawBonus) : null;
  const goldAmount = amount || getGoldAmountFromSoldItem({ item, level, socket: rawSocket });

  // const isEquipment = isWeapon || isHelm || isArmor || isBelt || isRing || isAmulet;
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

  let isSuperior = Array.isArray(rawBonus) ? rawBonus.includes(43) : false;
  if (isSuperior) {
    rawBonus = rawBonus.filter(oneBonus => oneBonus !== 43);
  }

  let type = "item";

  const itemClass = isJewel
    ? Types.getItemClassFromBaseLevel(level, jewelRequirement)
    : Types.getItemClass(item, level);

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
  } else if (isHelm) {
    type = "helm";
    healthBonus = Types.getArmorHealthBonus(level);
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
  } else if (!Types.isScroll(item) && !Types.isStone(item) && !Types.isChest(item)) {
    requirement = Types.getItemRequirement(item, level);
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
    weight,
    name,
    type,
    isUnique,
    isRune,
    isRuneword,
    isJewel,
    isStone,
    isSuperior,
    itemClass,
    ...(isHelm || isArmor || isBelt || isCape || isShield
      ? { defense: Types.getArmorDefense(item, level, isUnique, isSuperior) }
      : null),
    ...(isWeapon ? { damage: Types.getWeaponDamage(item, level, isUnique, isSuperior) } : null),
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
    goldAmount,
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
  skeletonkingcage:
    "The thoracic cage of the Skeleton King. An unknown magic is still being emitted from the remains. Combined with other ingredients at the anvil, it will open a secret area, lv.45 required to enter",
  necromancerheart:
    "The heart of the Necromancer. An unknown magic is still being emitted from the remains. . Combined with other ingredients at the anvil, it will open a secret area, lv.45 required to enter",
  cowkinghorn: "The horn of the Cow King. An unknown magic is still being emitted from the remains.",
  chalice: "Return the Golden Chalice, a one-of-a-kind artifact, to its rightful place.",
  soulstone: "This mysterious gem holds the soul of a hundred warriors.",
  stoneteleport: "This stone allows you to teleport to any party member.",
  nft: "An exceptional Non-Fungible Token artifact, return it to Alkor to get a reward.",
  wing: "The remnants of a dragon's wing, return it to Olaf to get a reward.",
  crystal: "An ancient and powerful crystal, return it to Viktor to get a reward.",
  powderblack: "A special kind of powder.",
  powderblue: "A special kind of powder.",
  powdergold: "A special kind of powder.",
  powdergreen: "A special kind of powder.",
  powderred: "A special kind of powder.",
  powderquantum: "The ultimate powder that powers the Gateway.",
  pickaxe: "This tool is used for digging.",
  mushrooms: "Mushrooms have the power to distort reality and summon otherworldly creatures.",
  iou: "Written acknowledgment of a debt.<br/><br/>Talk to Janet Yellen to exchange it for :amount: gold.",
  chestblue: "The chest may contain a very precious item.",
  chestgreen: "The chest may contain a very precious item.",
  chestpurple: "The chest may contain a very precious item.",
  christmaspresent: "The present contains a special christmas event set items",
  chestred: "The chest may contain a very precious item.",
  expansion2voucher:
    "Lost Temple expansion Voucher when consumed in the Anvil the Lost Temple will unlock if you don't already have it.",
  barbronze: "Common metal.",
  barsilver: "Rare metal.",
  bargold: "Precious metal.",
  barplatinum: "Priceless metal.",
  petegg:
    "An egg of a dinosaur pet with colorful scales and a heart of loyalty, forming a strong bond with you as you explore the world together",
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
    "Transmute a ring or an amulet and generate new random stats or an item to have a chance of making it unique. The chances of transmuting stats is fixed while the chances of getting a unique varies. There is a 25% chance your item will be burned during the transmutation.",
  scrolltransmuteblessed:
    "Transmute a ring or an amulet and generate new random stats or an item to have a chance of making it unique. The chances of transmuting stats is fixed while the chances of getting a unique varies. There is a 1% chance your item will be burned during the transmutation.",
  scrolltransmutepet: "Re-roll a Pet type & skin, 99% chance of succeeding",
  rune: "Can be inserted into a socketed item or create runewords",
  stonesocket:
    "Creates a random number of sockets in a non-socketed item. If all sockets are empty, you can re-roll sockets up to 4 on unique items or 3 for normal items<br/><br/>If the item already has sockets, the stone will attempt to remove the last item from its socket. There is 50% chance for the extracting item to be burned.",
  stonesocketblessed:
    "Creates a random number of sockets in a non-socketed item.  If all sockets are empty, you can re-roll sockets up to 6 on unique items or 5 for normal items.<br/><br/>If the item already has sockets, the stone will attempt to remove the last item from its socket. There is 1% chance for the extracting item to be burned.",
  jewelskull: "Can be inserted in a socket",
  stonedragon: "Blessed by the fire of the dragon, safely upgrade any item to +5",
  stonehero:
    "You've crushed your enemies, saw them driven before you, and heard the lamentation of their women.<br/>Safely upgrade any item to +6",

  scrollupgradeelementmagic: "Enchant a high or legendary weapon with magic spell offensive skill, 99% success",
  scrollupgradeelementflame: "Enchant a high or legendary  weapon with flame spell offensive skill, 99% success",
  scrollupgradeelementlightning:
    "Enchant a high or a legendary weapon with lightning spell offensive skill, 99% success",
  scrollupgradeelementcold: "Enchant a high or a legendary weapon with cold spell offensive skill, 99% success",
  scrollupgradeelementpoison: "Enchant a high or a legendary weapon with poison spell offensive skill, 99% success",
  scrollupgradeskillrandom:
    "Enchant a  a high or legendary  weapon or shield with a random ability (current ability will be changed or it has a chance to stay unchanged), 99% success",
  petcollar: "+1: Name your Pet",
};
