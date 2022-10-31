import * as _ from "lodash";

import { Slot } from "./slots";

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
    DESPAWN: 4,
    MOVE: 5,
    LOOTMOVE: 6,
    AGGRO: 7,
    ATTACK: 8,
    RAISE: 49,
    HIT: 9,
    HURT: 10,
    HEALTH: 11,
    CHAT: 12,
    LOOT: 13,
    EQUIP: 14,
    AURAS: 51,
    SKILL: 75,
    DROP: 15,
    TELEPORT: 16,
    DAMAGE: 17,
    POPULATION: 18,
    KILL: 19,
    LIST: 20,
    WHO: 21,
    ZONE: 22,
    DESTROY: 23,
    STATS: 24,
    BLINK: 25,
    OPEN: 26,
    CHECK: 27,
    PVP: 28,
    ACHIEVEMENT: 31,
    BOSS_CHECK: 32,
    BAN_PLAYER: 33,
    REQUEST_PAYOUT: 34,
    NOTIFICATION: 35,
    INVENTORY: 36,
    STASH: 50,
    UPGRADE: 37,
    MOVE_ITEM: 38,
    MOVE_ITEMS_TO_INVENTORY: 39,
    UPGRADE_ITEM: 40,
    ANVIL_UPGRADE: 41,
    ANVIL_RECIPE: 42,
    ANVIL_ODDS: 89,
    WAYPOINT: 43,
    WAYPOINTS_UPDATE: 44,
    STORE_ITEMS: 45,
    PURCHASE_CREATE: 46,
    PURCHASE_CANCEL: 47,
    PURCHASE_COMPLETED: 48,
    PURCHASE_ERROR: 52,
    COWLEVEL_START: 53,
    COWLEVEL_INPROGRESS: 54,
    COWLEVEL_END: 55,
    SETBONUS: 56,
    PARTY: 57,
    PARTY_ACTIONS: {
      CREATE: 58,
      JOIN: 59,
      REFUSE: 74,
      INVITE: 60,
      LEAVE: 61,
      REMOVE: 62,
      DISBAND: 63,
      LEADER: 64,
      INFO: 65,
      ERROR: 66,
      LOOT: 67,
      HEALTH: 68,
    },
    TRADE: 76,
    TRADE_ACTIONS: {
      REQUEST_SEND: 77,
      REQUEST_RECEIVE: 78,
      REQUEST_ACCEPT: 79,
      REQUEST_REFUSE: 80,
      INFO: 81,
      ERROR: 82,
      START: 83,
      CLOSE: 84,
      PLAYER1_MOVE_ITEM: 85,
      PLAYER2_MOVE_ITEM: 86,
      PLAYER1_STATUS: 87,
      PLAYER2_STATUS: 88,
    },
    SETTINGS: 69,
    MINOTAURLEVEL_START: 70,
    MINOTAURLEVEL_INPROGRESS: 71,
    MINOTAURLEVEL_END: 72,
    FROZEN: 73,
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
    SPIKEARMOR: 128,
    DEMONARMOR: 140,

    // Belts
    BELTLEATHER: 85,
    BELTPLATED: 86,
    BELTFROZEN: 91,
    BELTHORNED: 141,
    BELTDIAMOND: 129,
    BELTMINOTAUR: 134,

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
    SHIELDTEMPLAR: 153,
    SHIELDEXECUTIONER: 195,
    SHIELDMYSTICAL: 196,
    SHIELDDRAGON: 197,
    SHIELDDEMON: 198,
    SHIELDEMERALD: 199,

    // Chests
    CHESTBLUE: 136,

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

    CAKE: 39,
    SCROLLUPGRADELOW: 74,
    SCROLLUPGRADEMEDIUM: 75,
    SCROLLUPGRADEHIGH: 76,
    SCROLLUPGRADELEGENDARY: 190,
    SCROLLUPGRADEBLESSED: 118,
    SCROLLUPGRADESACRED: 191,
    SCROLLTRANSMUTE: 142,
    STONESOCKET: 192,
    RINGBRONZE: 80,
    RINGSILVER: 81,
    RINGGOLD: 82,
    RINGNECROMANCER: 115,
    RINGRAISTONE: 117,
    RINGFOUNTAIN: 126,
    RINGMINOTAUR: 132,
    RINGBALROG: 194,
    AMULETSILVER: 112,
    AMULETGOLD: 113,
    AMULETCOW: 116,
    AMULETFROZEN: 138,

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
    COWPORTAL: 125,
    MINOTAURPORTAL: 135,

    // Weapons
    DAGGER: 60,
    SWORD: 61,
    MORNINGSTAR: 64,
    AXE: 65,
    BLUESWORD: 66,
    REDSWORD: 62,
    GOLDENSWORD: 63,
    BLUEAXE: 77,
    BLUEMORNINGSTAR: 107,
    FROZENSWORD: 100,
    DIAMONDSWORD: 121,
    MINOTAURAXE: 133,
    EMERALDSWORD: 152,
    MOONPARTISAN: 154,
    TEMPLARSWORD: 155,
    SPIKEGLAIVE: 156,
    ECLYPSEDAGGER: 157,
    EXECUTIONERSWORD: 158,
    MYSTICALSWORD: 159,
    DRAGONSWORD: 160,

    // Runes
    RUNE: {
      SAT: 161,
      AL: 162,
      BUL: 163,
      NAN: 164,
      MIR: 165,
      GEL: 166,
      DO: 167,
      BAN: 168,
      SOL: 169,
      UM: 170,
      HEX: 171,
      ZAL: 172,
      VIE: 173,
      ETH: 174,
      BTC: 175,
      VAX: 176,
      POR: 177,
      LAS: 178,
      CHAM: 179,
      XNO: 180,
      FAH: 181,
      KUL: 182,
      MER: 183,
      QUA: 184,
      GUL: 185,
      BER: 186,
      TOR: 187,
      JAH: 188,
      VOD: 189,
    },
  },

  Orientations: {
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
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
  Types.Entities.MOONPARTISAN,
  Types.Entities.TEMPLARSWORD,
  Types.Entities.SPIKEGLAIVE,
  Types.Entities.ECLYPSEDAGGER,
  Types.Entities.EXECUTIONERSWORD,
  Types.Entities.MYSTICALSWORD,
  Types.Entities.DRAGONSWORD,
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
  Types.Entities.SPIKEARMOR,
  Types.Entities.DEMONARMOR,
];

Types.Entities.Belts = [
  Types.Entities.BELTLEATHER,
  Types.Entities.BELTPLATED,
  Types.Entities.BELTFROZEN,
  Types.Entities.BELTFHORNED,
  Types.Entities.BELTDIAMOND,
  Types.Entities.BELTMINOTAUR,
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
];

Types.Entities.Rings = [
  Types.Entities.RINGBRONZE,
  Types.Entities.RINGSILVER,
  Types.Entities.RINGGOLD,
  Types.Entities.RINGNECROMANCER,
  Types.Entities.RINGRAISTONE,
  Types.Entities.RINGFOUNTAIN,
  Types.Entities.RINGMINOTAUR,
  Types.Entities.RINGBALROG,
];

Types.Entities.Amulets = [
  Types.Entities.AMULETSILVER,
  Types.Entities.AMULETGOLD,
  Types.Entities.AMULETCOW,
  Types.Entities.AMULETFROZEN,
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
  wraith: [Types.Entities.WRAITH, "mob", 120, 40],
  zombie: [Types.Entities.ZOMBIE, "mob", 40, 42],
  necromancer: [Types.Entities.NECROMANCER, "mob", 400, 45],
  cow: [Types.Entities.COW, "mob", 25, 49],
  cowking: [Types.Entities.COWKING, "mob", 400, 50],
  minotaur: [Types.Entities.MINOTAUR, "mob", 500, 52],

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
  moonpartisan: [Types.Entities.MOONPARTISAN, "weapon", "Moon Partisan", 40, 40],

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
  spikearmor: [Types.Entities.SPIKEARMOR, "armor", "Spike Armor", 40, 40],
  demonarmor: [Types.Entities.DEMONARMOR, "armor", "Demon Armor", 40, 40],

  // kind, type, level, defense
  beltleather: [Types.Entities.BELTLEATHER, "belt", "Leather Belt", 4, 2],
  beltplated: [Types.Entities.BELTPLATED, "belt", "Plated Belt", 9, 4],
  beltfrozen: [Types.Entities.BELTFROZEN, "belt", "Sapphire Belt", 24, 10],
  belthorned: [Types.Entities.BELTHORNED, "belt", "Horned Belt", 26, 12],
  beltdiamond: [Types.Entities.BELTDIAMOND, "belt", "Diamond Belt", 34, 14],
  beltminotaur: [Types.Entities.BELTMINOTAUR, "belt", "Minotaur Belt", 40, 18],

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

  // kind, type, level
  ringbronze: [Types.Entities.RINGBRONZE, "ring", "Bronze Ring", 1],
  ringsilver: [Types.Entities.RINGSILVER, "ring", "Silver Ring", 9],
  ringgold: [Types.Entities.RINGGOLD, "ring", "Gold Ring", 16],
  ringnecromancer: [Types.Entities.RINGNECROMANCER, "ring", "Necromancer Death Wish", 38],
  ringraistone: [Types.Entities.RINGRAISTONE, "ring", "Rai Stone", 18],
  ringfountain: [Types.Entities.RINGFOUNTAIN, "ring", "Fountain of Youth", 26],
  ringminotaur: [Types.Entities.RINGMINOTAUR, "ring", "Hell Freeze", 36],
  ringbalrog: [Types.Entities.RINGBALROG, "ring", "Ring of Power", 54],

  amuletsilver: [Types.Entities.AMULETSILVER, "amulet", "Silver Amulet", 9],
  amuletgold: [Types.Entities.AMULETGOLD, "amulet", "Gold Amulet", 20],
  amuletcow: [Types.Entities.AMULETCOW, "amulet", "Holy Cow King Talisman", 34],
  amuletfrozen: [Types.Entities.AMULETFROZEN, "amulet", "Frozen Heart", 34],

  chestblue: [Types.Entities.CHESTBLUE, "chest", "Blue Chest", 50],

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
  skeletonkey: [Types.Entities.SKELETONKEY, "object", "Skeleton Key"],
  raiblockstl: [Types.Entities.RAIBLOCKSTL, "object", "Raiblocks artifact"],
  raiblockstr: [Types.Entities.RAIBLOCKSTR, "object", "Raiblocks artifact"],
  raiblocksbl: [Types.Entities.RAIBLOCKSBL, "object", "Raiblocks artifact"],
  raiblocksbr: [Types.Entities.RAIBLOCKSBR, "object", "Raiblocks artifact"],
  skeletonkingcage: [Types.Entities.SKELETONKINGCAGE, "recipe", "Skeleton King's thoracic cage"],
  necromancerheart: [Types.Entities.NECROMANCERHEART, "recipe", "Necromancer's heart"],
  cowkinghorn: [Types.Entities.COWKINGHORN, "recipe", "Cow King's horn"],

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
  "rune-btc": [Types.Entities.RUNE.BTC, "rune", "BTC Rune", 27],
  "rune-vax": [Types.Entities.RUNE.VAX, "rune", "VAX Rune", 30],
  "rune-por": [Types.Entities.RUNE.POR, "rune", "POR Rune", 33],
  "rune-las": [Types.Entities.RUNE.LAS, "rune", "LAS Rune", 36],
  "rune-cham": [Types.Entities.RUNE.CHAM, "rune", "CHAM Rune", 39],
  "rune-xno": [Types.Entities.RUNE.XNO, "rune", "XNO Rune", 42],
  "rune-fal": [Types.Entities.RUNE.FAL, "rune", "FAL Rune", 45],
  "rune-kul": [Types.Entities.RUNE.KUL, "rune", "KUL Rune", 48],
  "rune-mer": [Types.Entities.RUNE.MER, "rune", "MER Rune", 51],
  "rune-qua": [Types.Entities.RUNE.QUA, "rune", "QUA Rune", 54],
  "rune-gul": [Types.Entities.RUNE.GUL, "rune", "GUL Rune", 57],
  "rune-ber": [Types.Entities.RUNE.BER, "rune", "BER Rune", 60],
  "rune-tor": [Types.Entities.RUNE.TOR, "rune", "TOR Rune", 63],
  "rune-jah": [Types.Entities.RUNE.JAH, "rune", "JAH Rune", 66],
  "rune-vod": [Types.Entities.RUNE.VOD, "rune", "VOD Rune", 69],

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
  cowportal: [Types.Entities.COWPORTAL, "npc"],
  minotaurportal: [Types.Entities.MINOTAURPORTAL, "npc"],

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
  Types.Entities.SPIKEARMOR,
  Types.Entities.DEMONARMOR,
];

Types.rankedBelts = [
  Types.Entities.BELTLEATHER,
  Types.Entities.BELTPLATED,
  Types.Entities.BELTFROZEN,
  Types.Entities.BELTHORNED,
  Types.Entities.BELTDIAMOND,
  Types.Entities.BELTMINOTAUR,
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
  spikeglaive: ["TBD", 38, 38],
  executionersword: ["The Granfather", 38, 38],
  eclypsedagger: ["Ethereum Killer", 38, 38],
  mysticalsword: ["The Maximalist", 38, 38],
  templarsword: ["TBD", 38, 38],
  dragonsword: ["Balerion the Black Dread", 38, 38],
  moonpartisan: ["Moon Boy", 38, 38],

  // Laser Eyes
  // CBDC
  // Decentralizer
  // PermaBear

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
  spikearmor: ["Jungle Warcry", 36, 46],
  demonarmor: ["Explorer's Block", 36, 50],

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
  shieldtemplar: ["TBD", 42, 22],
  shieldemerald: ["TBD", 42, 22],
  shieldexecutioner: ["TBD", 42, 22],
  shieldmystical: ["TBD", 42, 22],
  shielddragon: ["TBD", 42, 22],
  shielddemon: ["TBD", 42, 22],

  cape: ["Cloak of Levitation", 12, 2],

  // name, level, defense
  beltleather: ["Proof of Wear", 4, 4],
  beltplated: ["Hodler", 9, 6],
  beltfrozen: ["Spam Resistor", 24, 12],
  belthorned: ["Dee-Fye", 28, 14],
  beltdiamond: ["Election scheduler", 38, 20],
  beltminotaur: ["TaaC", 40, 22],
};

Types.isSuperUnique = (itemName: string) =>
  [
    "ringnecromancer",
    "ringraistone",
    "ringfountain",
    "ringminotaur",
    "ringbalrog",
    "amuletcow",
    "amuletfrozen",
  ].includes(itemName);

Types.setBonus = {
  minotaur: {
    minDamage: 15,
    coldDamage: 15,
    reduceFrozenChance: 25,
  },
  diamond: {
    health: 100,
    defense: 10,
    blockChance: 3,
    exp: 10,
  },
  sapphire: {
    minDamage: 10,
    maxDamage: 10,
    defense: 10,
    criticalHit: 3,
  },
  horned: {
    minDamage: 10,
    maxDamage: 10,
    attackDamage: 10,
  },
  frozen: {
    attackDamage: 10,
    coldDamage: 10,
    absorbedDamage: 10,
  },
  golden: {
    magicDamage: 10,
    defense: 6,
    criticalHit: 6,
  },
  ruby: {
    health: 30,
    attackDamage: 6,
    defense: 6,
  },
  plated: {
    health: 25,
    attackDamage: 4,
    defense: 4,
  },
  leather: {
    minDamage: 3,
    maxDamage: 3,
    health: 20,
  },
};

Types.kindAsStringToSet = {
  leatherarmor: "leather",
  beltleather: "leather",
  shieldwood: "leather",
  platearmor: "plated",
  beltplated: "plated",
  shieldplate: "plated",
  redsword: "ruby",
  redarmor: "ruby",
  shieldred: "ruby",
  goldensword: "golden",
  goldenarmor: "golden",
  shieldgolden: "golden",
  bluemorningstar: "frozen",
  bluearmor: "frozen",
  shieldblue: "frozen",
  hornedarmor: "horned",
  belthorned: "horned",
  shieldhorned: "horned",
  frozensword: "sapphire",
  frozenarmor: "sapphire",
  beltfrozen: "sapphire",
  shieldfrozen: "sapphire",
  diamondsword: "diamond",
  diamondarmor: "diamond",
  beltdiamond: "diamond",
  shielddiamond: "diamond",
  minotauraxe: "minotaur",
  beltminotaur: "minotaur",
  ringminotaur: "minotaur",
};

Types.setItems = {
  minotaur: ["minotauraxe", "ringminotaur", "beltminotaur"],
  diamond: ["diamondsword", "diamondarmor", "beltdiamond", "shielddiamond"],
  sapphire: ["frozensword", "frozenarmor", "beltfrozen", "shieldfrozen"],
  horned: ["hornedarmor", "belthorned", "shieldhorned"],
  frozen: ["bluemorningstar", "bluearmor", "shieldblue"],
  golden: ["goldensword", "goldenarmor", "shieldgolden"],
  ruby: ["redsword", "redarmor", "shieldred"],
  plated: ["platearmor", "beltplated", "shieldplate"],
  leather: ["leatherarmor", "beltleather", "shieldwood"],
};

Types.setItemsNameMap = {
  minotaur: ["Axe", "Ring", "Belt"],
  diamond: ["Sword", "Armor", "Belt", "Shield"],
  sapphire: ["Sword", "Armor", "Belt", "Shield"],
  horned: ["Armor", "Belt", "Shield"],
  frozen: ["Morningstar", "Armor", "Shield"],
  golden: ["Sword", "Armor", "Shield"],
  ruby: ["Sword", "Armor", "Shield"],
  plated: ["Armor", "Belt", "Shield"],
  leather: ["Armor", "Belt", "Shield"],
};

Types.resistances = {
  [Types.Entities.COWKING]: {
    lightningDamage: 100,
  },
  [Types.Entities.MINOTAUR]: {
    flameDamage: 100,
    lightningDamage: 100,
    magicDamage: 80,
  },
};

Types.resistanceToDisplayMap = {
  magicDamage: "magic damage",
  flameDamage: "flame damage",
  lightningDamage: "lightning damage",
  coldDamage: "cold damage",
  physicalDamage: "physical damage",
};

Types.expForLevel = [
  1,
  8,
  18,
  36,
  68,
  100,
  150,
  256,
  410,
  625, // 10

  915,
  1296,
  1785,
  2401,
  3164,
  4096,
  5220,
  6561,
  8145,
  10000, // 20

  12155,
  14641,
  17490,
  20736,
  24414,
  28561,
  33215,
  38416,
  44205,
  50625, // 30

  57720,
  65536,
  74120,
  83521,
  93789,
  104976,
  117135,
  130321,
  144590,
  160000, // 40

  176610,
  194481,
  213675,
  234256,
  256289,
  279841,
  304980,
  331776,
  360300,
  390625, // 50

  422825,
  456976,
  493155,
  531441,
  571914,
  614656,
  659750,
  707281,
  757335,
  810000, // 60

  865365,
  923521,
  984560,
  1048576,
  1115664,
  1185921,
  1259445,
  1336336,
  1416695,
  1500625, // 70

  1588230,
  1679616,
  1774890,
  1874161,
  1977539,
  2085136,
  2197065,
  2313441,
  2434380,
  2560000, // 80

  2690420,
  2825761,
  2966145,
  3111696,
  3262539,
  3418801,
  3580610,
  3748096,
  3921390,
  4100625, // 90

  4285935,
  4477456,
  4675325,
  4879681,
  5090664,
  5318416,
  5553080,
  5804801,
  6083725,
  6410000, // 100

  6765201,
  7311616,
  7890481,
  8503056,
  9150625,
  9834496,
  10556001,
  11316496,
  12117361,
  12960000, // 110

  13845841,
  14776336,
  15752961,
  16777216,
  17850625,
  18974736,
  20151121,
  21381376,
  22667121,
  24010000, // 120

  25411681,
  26873856,
  28398241,
  29986576,
  31640625,
  33362176,
  35153041,
  37015056,
  38950081,
  40960000, // 130

  43046721,
  45212176,
  47458321,
  49787136,
  52200625,
  54700816,
  57289761,
  59969536,
  62742241,
  65610000, // 140

  68574961,
  71639296,
  74805201,
  78074896,
  81450625,
  84934656,
  88529281,
  92236816,
  96059601,
  100000000, // 150

  108243216,
];

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
    ].includes(kindOrString);
  } else {
    return ["boss", "skeletoncommander", "necromancer", "cowking", "minotaur"].includes(kindOrString);
  }
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
    return [Types.Entities.STONESOCKET].includes(kindOrString);
  } else {
    return kindOrString?.startsWith("stone");
  }
};

Types.isRune = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return Types.RuneByKind[kindOrString];
  } else {
    return kindOrString?.startsWith("rune");
  }
};

Types.isChest = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [Types.Entities.CHESTBLUE].includes(kindOrString);
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
  // @TODO Think of a unification strategy
  if (typeof bonus === "string") {
    bonus = JSON.parse(bonus);
  }

  if (typeof kindOrString === "number") {
    if (
      [
        Types.Entities.RINGNECROMANCER,
        Types.Entities.RINGRAISTONE,
        Types.Entities.RINGFOUNTAIN,
        Types.Entities.RINGMINOTAUR,
        Types.Entities.RINGBALROG,
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
  } else {
    if (["ringnecromancer", "ringraistone", "ringfountain", "ringminotaur", "ringbalrog"].includes(kindOrString)) {
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
  }
};

Types.isUniqueAmulet = function (kindOrString: number | string, bonus: number[] = []) {
  // @TODO Think of a unification strategy
  if (typeof bonus === "string") {
    bonus = JSON.parse(bonus);
  }

  if (typeof kindOrString === "number") {
    if ([Types.Entities.AMULETCOW, Types.Entities.AMULETFROZEN].includes(kindOrString)) {
      return true;
    }
    if (Types.Entities.AMULETSILVER === kindOrString && bonus.length === 3) {
      return true;
    }
    if (Types.Entities.AMULETGOLD === kindOrString && bonus.length === 4) {
      return true;
    }
  } else {
    if (["amuletcow", "amuletfrozen"].includes(kindOrString)) {
      return true;
    }
    if ("amuletsilver" === kindOrString && bonus.length === 3) {
      return true;
    }
    if ("amuletgold" === kindOrString && bonus.length === 4) {
      return true;
    }
  }
};

Types.isStaticChest = function (kind: number) {
  return kind === Types.Entities.CHEST;
};

Types.isSingle = function (kindOrString: number | string) {
  if (!kindOrString) return false;
  if (typeof kindOrString === "number") {
    return [Types.Entities.SKELETONKINGCAGE, Types.Entities.NECROMANCERHEART, Types.Entities.COWKINGHORN].includes(
      kindOrString,
    );
  } else {
    return (
      ["skeletonkingcage", "necromancerheart", "cowkinghorn"].includes(kindOrString) ||
      kindOrString.startsWith("skeletonkingcage") ||
      kindOrString.startsWith("necromancerheart") ||
      kindOrString.startsWith("cowkinghorn")
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

Types.runeKind = {
  sat: {
    rank: 1,
    requirement: 1,
    attribute: {
      health: 10,
    },
  },
  al: {
    rank: 2,
    requirement: 2,
    attribute: {
      minDamage: 4,
    },
  },
  bul: {
    rank: 3,
    requirement: 3,
    attribute: {
      maxDamage: 4,
    },
  },
  nan: {
    rank: 4,
    requirement: 4,
    attribute: {
      magicDamage: 4,
    },
  },
  mir: {
    rank: 5,
    requirement: 6,
    attribute: {
      attackDamage: 4,
    },
  },
  gel: {
    rank: 6,
    requirement: 8,
    attribute: {
      absorbedDamage: 4,
    },
  },
  do: {
    rank: 7,
    requirement: 10,
    attribute: {
      defense: 4,
    },
  },
  ban: {
    rank: 8,
    requirement: 12,
    attribute: {
      exp: 4,
    },
  },
  sol: {
    rank: 9,
    requirement: 14,
    attribute: {
      reduceFrozenChance: 5,
    },
  },
  um: {
    rank: 10,
    requirement: 16,
    attribute: {
      flameDamage: 10,
    },
  },
  hex: {
    rank: 11,
    requirement: 18,
    attribute: {
      lightningDamage: 5,
    },
  },
  zal: {
    rank: 12,
    requirement: 20,
    attribute: {
      pierceDamage: 10,
    },
  },
  vie: {
    rank: 13,
    requirement: 22,
    attribute: {
      regenerateHealth: 10,
    },
  },
  eth: {
    rank: 14,
    requirement: 24,
    attribute: {
      poisonDamage: 10,
    },
  },
  btc: {
    rank: 15,
    requirement: 27,
    attribute: {
      magicResistance: 10,
    },
  },
  vax: {
    rank: 16,
    requirement: 30,
    attribute: {
      flameResistance: 10,
    },
  },
  por: {
    rank: 17,
    requirement: 33,
    attribute: {
      lightningResistance: 10,
    },
  },
  las: {
    rank: 18,
    requirement: 36,
    attribute: {
      coldResistance: 10,
    },
  },
  cham: {
    rank: 19,
    requirement: 39,
    attribute: {
      poisonResistance: 10,
    },
  },
  xno: {
    rank: 20,
    requirement: 42,
    attribute: {
      attackSpeed: 10,
    },
  },
  fal: {
    rank: 21,
    requirement: 45,
    attribute: {
      magicDamagePercent: 10,
    },
  },
  kul: {
    rank: 22,
    requirement: 48,
    attribute: {
      lightningDamagePercent: 10,
    },
  },
  mer: {
    rank: 23,
    requirement: 51,
    attribute: {
      flameDamagePercent: 10,
    },
  },
  qua: {
    rank: 24,
    requirement: 54,
    attribute: {
      coldDamagePercent: 10,
    },
  },
  gul: {
    rank: 25,
    requirement: 57,
    attribute: {
      poisonDamagePercent: 10,
    },
  },
  ber: {
    rank: 26,
    requirement: 60,
    attribute: {
      skillTimeout: 10,
    },
  },
  tor: {
    rank: 27,
    requirement: 63,
    attribute: {
      coldDamage: 2,
      freezeChance: 5,
    },
  },
  jah: {
    rank: 28,
    requirement: 66,
    attribute: {
      magicFind: 10,
    },
  },
  vod: {
    rank: 29,
    requirement: 69,
    attribute: {
      regenerateHealth: 10,
      preventRegenerateHealth: 10,
    },
  },
};

Types.RuneByKind = Object.entries(Types.Entities.sRUNE).reduce((acc, [name, kind]: [string, number]) => {
  acc[kind] = name.toLowerCase();
  return acc;
}, {});

Types.RuneList = Object.keys(Types.Entities.RUNE).map(rune => rune.toLowerCase());

Types.getRuneNameFromItem = (rankOrString: number | string) => {
  let rune;

  if (typeof rankOrString === "string") {
    [, rune] = rankOrString.split(":")[0].split("-");
  } else if (typeof rankOrString === "number") {
    rune = Types.RuneList[rankOrString - 1];
  }

  return rune;
};

Types.getRuneFromItem = (rankOrString: number | string) => {
  const rune = Types.getRuneNameFromItem(rankOrString);

  return Types.runeKind[rune];
};

Types.getHighestSocketRequirement = (rawSocket: number[]) => {
  const highestRank = [...rawSocket].sort((a, b) => b - a)[0];
  if (!highestRank) return;

  const { requirement } = Object.values<{ rank: number; requirement: number }>(Types.runeKind)[highestRank - 1];
  return requirement;
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
  } else if (name === "bat2") {
    return "vampire bat";
  } else if (name === "goblin2") {
    return "undead goblin";
  } else if (name === "snake2") {
    return "sea snake";
  } else if (name === "cowking") {
    return "cow king";
  } else if (name.startsWith("waypoint")) {
    return "waypoint";
  } else if (name === "cowportal" || name === "minotaurportal") {
    return "Portal";
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
    name: "Waypoint1",
    gridX: 117,
    gridY: 473,
  },
  {
    id: 8,
    name: "Waypoint2",
    gridX: 124,
    gridY: 473,
  },
  {
    id: 9,
    name: "Waypoint3",
    gridX: 132,
    gridY: 473,
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
      break;
    case Types.Orientations.RIGHT:
      return "right";
      break;
    case Types.Orientations.UP:
      return "up";
      break;
    case Types.Orientations.DOWN:
      return "down";
      break;
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
  "+#% Reduced chance of being frozen",
  "+#% Magic resistance",
  "+#% Flame resistance",
  "+#% Lightning resistance",
  "+#% Cold resistance",
  "+#% Poison resistance",
  "+#% Prevent enemy health regeneration",
  "+# Poison damage",
  "-#% Skill timeout",
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
  "preventRegenerateHealth", // 26
  "poisonDamage", // 27
  "skillTimeout", // 28
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
  const preventRegenerateHealthPerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const poisonDamagePerLevel = [1, 3, 6, 9, 12, 16, 20, 25, 32, 45];
  const skillTimeoutPerLevel = [1, 2, 4, 6, 8, 10, 13, 17, 24, 30];

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
    preventRegenerateHealthPerLevel,
    poisonDamagePerLevel,
    skillTimeoutPerLevel,
  ];

  const bonus: { type: string; stats: number; description: string }[] = [];

  // A glitch in the inventory system allowed for scrolls to be added as rings
  if (!rawBonus || !Array.isArray(rawBonus)) return bonus;

  for (let i = 0; i < rawBonus.length; i++) {
    const type = Types.bonusType[rawBonus[i]];
    const stats = bonusPerLevel[rawBonus[i]][level - 1];

    let description = Types.getBonusDescriptionMap[rawBonus[i]].replace("#", stats);

    if (type === "freezeChance") {
      description = description.replace("#", Types.getFrozenTimePerLevel(level) / 1000);
    }

    bonus.push({
      type,
      stats,
      description,
    });
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

  // A glitch in the inventory system allowed for scrolls to be added as rings
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

Types.getRuneBonus = function (rawRune: string) {
  if (!rawRune || !Types.RuneList.includes(Types.getRuneNameFromItem(rawRune))) return;

  const rune = Types.getRuneFromItem(rawRune);
  const bonus: { type: string; stats: number; description: string }[] = Object.entries(rune.attribute).map(
    ([type, stats]: [string, number]) => ({
      type,
      stats,
      description: Types.getBonusDescriptionMap[Types.bonusType.findIndex(t => t === type)].replace("#", stats),
    }),
  );

  return bonus;
};

Types.getRunesBonus = function (runes: number[]) {
  const attributes = {};

  _.forEach(runes, kind => {
    if (!kind) return;
    const rune = Types.getRuneFromItem(kind);
    Object.entries(rune.attribute).map(([type, stats]: [string, number]) => {
      if (!attributes[type]) {
        attributes[type] = 0;
      }

      attributes[type] += stats;
    });
  });

  return Types.getAttributesBonus(attributes);
};

Types.getRunewordBonus = ({
  isUnique,
  socket,
  type,
}: {
  isUnique: boolean;
  socket: number[];
  type: "weapon" | "armor" | "shield";
}) => {
  let runeword;
  let runewordBonus;

  if (!isUnique && socket?.length && !socket.some(s => s === 0)) {
    const wordSocket = socket.map(s => Types.RuneList[s - 1]).join("-");
    ({ name: runeword, bonus: runewordBonus } = Types.Runewords[type]?.[wordSocket] || {});
  }

  return { runeword, runewordBonus };
};

Types.getAttributesBonus = function (attributes) {
  const bonus: { type: string; stats: number; description: string }[] = Object.entries(attributes).map(
    ([type, stats]: [string, number]) => ({
      type,
      stats,
      description: Types.getBonusDescriptionMap[Types.bonusType.findIndex(t => t === type)].replace("#", stats),
    }),
  );

  return bonus;
};

Types.getFrozenTimePerLevel = (itemLevel: number) => 1000 + itemLevel * 150;

Types.skillDurationMap = {
  0: () => 900,
  1: (itemLevel: number) => itemLevel * 500,
  2: (itemLevel: number) => itemLevel * 500,
};

Types.getSkillDescriptionMap = [
  "+#% Instant health regeneration",
  "+#% Defense for # seconds",
  // "-#% Attack damage from your attacking enemies",
  // "+#% block chances for # seconds",
  // "-#% Attack damage from your enemies for # seconds",
];

Types.skillType = [
  "regenerateHealthSkill", // 0
  "defenseSkill", // 1
  // "curseAttackSkill", // 2
  // "freezeNovaSkill", // 3
];

Types.skillDelay = [30_000, 45_000, 60_000];

Types.skillTypeAnimationMap = ["heal", "defense", "curse-attack"];

Types.getSkill = function (rawSkill, level) {
  const regenerateHealthSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const defenseSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  // const curseAttackSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  // const freezeNovaSkillPerLevel = [1, 3, 6, 10, 15, 22, 30, 40, 55, 70];

  const skillPerLevel = [
    regenerateHealthSkillPerLevel,
    defenseSkillPerLevel,
    // curseAttackSkillPerLevel,
    // freezeNovaSkillPerLevel,
  ];

  let skill: { type: string; stats: number; description: string } | null = null;

  const type = Types.skillType[rawSkill];
  const stats = skillPerLevel[rawSkill][level - 1];

  let description = Types.getSkillDescriptionMap[rawSkill].replace("#", stats);

  if (["defenseSkill", "curseAttackSkill"].includes(type)) {
    description = description.replace("#", Types.skillDurationMap[rawSkill](level) / 1000);
  }

  skill = { type, stats, description };

  return skill;
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
    moonpartisan: 4,

    goldenarmor: 20,
    bluearmor: 18,
    hornedarmor: 15,
    frozenarmor: 15,
    diamondarmor: 11,
    spikearmor: 9,
    demonarmor: 7,

    beltfrozen: 15,
    belthorned: 15,
    beltdiamond: 11,
    beltminotaur: 8,

    shieldgolden: 20,
    shieldblue: 18,
    shieldhorned: 18,
    shieldfrozen: 15,
    shielddiamond: 11,

    cape: 10,
    ringgold: 12,
    amuletgold: 12,
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

Types.getItemClass = function (item: string, level: number, isUnique: boolean) {
  const baseLevel = Types.getItemBaseLevel(item, isUnique);

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

Types.isUnique = function (item, bonus) {
  const isWeapon = kinds[item][1] === "weapon";
  const isArmor = kinds[item][1] === "armor";
  const isBelt = kinds[item][1] === "belt";
  const isCape = kinds[item][1] === "cape";
  const isShield = kinds[item][1] === "shield";
  const isRing = kinds[item][1] === "ring";
  const isAmulet = kinds[item][1] === "amulet";

  let isUnique = false;
  bonus = !Array.isArray(bonus) && typeof bonus === "string" && bonus.length ? JSON.parse(bonus) : bonus;

  if (isRing) {
    isUnique = Types.isUniqueRing(item, bonus);
  } else if (isAmulet) {
    isUnique = Types.isUniqueAmulet(item, bonus);
  } else if (isCape || isShield || isWeapon) {
    isUnique = bonus ? bonus.length >= 2 : false;
  } else if (isBelt || isArmor) {
    isUnique = bonus ? bonus.length >= 1 : false;
  }

  return isUnique;
};

Types.getItemDetails = function ({
  item,
  level,
  rawBonus,
  rawSetBonus,
  rawSkill,
  rawSocket,
}: {
  item: string;
  level: number;
  rawBonus: number[];
  rawSetBonus?: { [key: string]: number };
  rawSkill?: number;
  rawSocket: number[];
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
  const rune = isRune ? Types.getRuneFromItem(item) : null;
  const isSocket = rawSocket?.length;
  const runeRequirement = isSocket ? Types.getHighestSocketRequirement(rawSocket) : null;

  // const isEquipment = isWeapon || isArmor || isBelt || isRing || isAmulet;
  let name = Types.getDisplayName(item, isUnique);
  let magicDamage = 0;
  let healthBonus = 0;
  let bonus = [];
  let skill = null;
  let setBonus = [];
  let socketBonus = [];
  let partyBonus = [];
  let runeBonus = [];
  let runeRank: null | Number = null;
  let isRuneword = false;

  let type = "item";

  if (isWeapon) {
    type = "weapon";
    if (!isUnique) {
      magicDamage = Types.getWeaponMagicDamage(level);
    }
  } else if (isArmor) {
    type = "armor";
    healthBonus = Types.getArmorHealthBonus(level);
  } else if (isBelt) {
    type = "belt";
    healthBonus = Types.getArmorHealthBonus(level);
  } else if (isShield) {
    type = "shield";
    healthBonus = Types.getArmorHealthBonus(level);
    skill = rawSkill ? Types.getSkill(rawSkill, level) : null;
  } else if (isCape) {
    type = "cape";
  } else if (isRing) {
    type = "ring";
  } else if (isAmulet) {
    type = "amulet";
  }

  const itemClass = Types.getItemClass(item, level, isUnique);
  let requirement = isRune ? rune.requirement : Types.getItemRequirement(item, level, isUnique);
  const description = isRune ? Types.itemDescription.rune : Types.itemDescription[item];

  if (rawBonus) {
    if (isCape) {
      partyBonus = Types.getPartyBonus(rawBonus, level);
    } else {
      bonus = Types.getBonus(rawBonus, level);
    }
  }

  if (rawSetBonus) {
    setBonus = Types.getSetBonus(rawSetBonus);
  }

  if (isSocket) {
    const { runeword, runewordBonus } = Types.getRunewordBonus({ isUnique, socket: rawSocket, type });

    if (runeword && runewordBonus) {
      name = runeword;
      socketBonus = Types.getAttributesBonus(runewordBonus);
      isRuneword = true;
    } else {
      socketBonus = Types.getRunesBonus(rawSocket);
    }

    if (runeRequirement > requirement) {
      requirement = runeRequirement;
    }
  } else if (isRune) {
    runeBonus = Types.getRuneBonus(item);
    runeRank = rune.rank;
  }

  return {
    item,
    name,
    type,
    isUnique,
    isRune,
    isRuneword,
    itemClass,
    ...(isArmor || isBelt || isCape || isShield ? { defense: Types.getArmorDefense(item, level, isUnique) } : null),
    ...(isWeapon ? { damage: Types.getWeaponDamage(item, level, isUnique) } : null),
    healthBonus,
    magicDamage,
    requirement,
    description,
    bonus,
    socket: rawSocket?.length,
    socketBonus,
    setBonus,
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

Types.itemDescription = {
  skeletonkingcage: "The thoracic cage of the Skeleton King. An unknown magic is still being emitted from the remains.",
  necromancerheart: "The heart of the Necromancer. An unknown magic is still being emitted from the remains.",
  cowkinghorn: "The horn of the Cow King. An unknown magic is still being emitted from the remains.",
  chestblue: "The chest may contain a very precious item.",
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
    "Creates a random number of sockets in a non-socketed item.<br/><br/>If the item already has sockets it will attempt to remove the last item in the socket(s). There is a 50% chance for the item to be burned.",
};

// minDamage
// maxDamage
// attackDamage
// health
// magicDamage
// defense
// absorb
// exp
// regenerateHealth
// criticalHit
// blockChance
// magicFind
// attackSpeed
// drainLife
// flameDamage
// lightningDamage
// pierceDamage
// highHealth
// coldDamage
// freezeChance
// reduceFrozenChance
// magicResistance
// flameResistance
// lightningResistance
// coldResistance
// poisonResistance

Types.Runewords = {
  weapon: {
    "ban-nan-mir-al-btc": {
      name: "Buy the dip",
      bonus: {
        minDamage: 25,
        attackDamage: 10,
        magicDamage: 10,
        magicResistance: 15,
        exp: 10,
      },
    },
    "las-tor-mir": {
      name: "Cold Wallet",
      bonus: {
        attackDamage: 15,
        coldDamage: 25,
        freezeChance: 10,
        coldResistance: 15,
      },
    },
    "bul-mir-zal-um-vax": {
      name: "Hot Wallet",
      bonus: {
        maxDamage: 10,
        attackDamage: 15,
        flameDamage: 20,
        flameResistance: 15,
        pierceDamage: 10,
      },
    },
    // "": {
    //   name: "ASIC",
    //   bonus: {
    //     pierceDamage: 10,
    //   },
    // },
  },
  armor: {
    "do-las-sol-vod-jah-por": {
      name: "Melon Tusk",
      bonus: {
        defense: 20,
        magicFind: 15,
        lightningResistance: 10,
        regenerateHealth: 20,
        preventRegenerateHealth: 20,
        coldResistance: 10,
        reduceFrozenChance: 20,
      },
    },
    // ethbtcxno: {
    //   name: "EIP-1559",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "SHA-256",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "Double Spend",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "Echo Chamber",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "Know Your Customer",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "Growing Seed",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "The Validator",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "Not Your Key Not Your Crypto",
    //   bonus: {},
    // },
  },
  shield: {},
};

// Living Whitepaper
// Smart contract
// Open Representative Voting
// Lightweight Node
// Sub Second Cormirmation
// Confirmations Per Second
