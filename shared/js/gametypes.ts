import * as _ from "lodash";

export const Types: any = {
  Store: {
    EXPANSION1: 1,
    SCROLLUPGRADEHIGH: 2,
    SCROLLUPGRADEMEDIUM: 3,
    SCROLLUPGRADEBLESSED: 4,
    CAPE: 5,
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
    GUILD: 29,
    GUILDERROR: 30,
    ACHIEVEMENT: 31,
    BOSS_CHECK: 32,
    BAN_PLAYER: 33,
    REQUEST_PAYOUT: 34,
    NOTIFICATION: 35,
    INVENTORY: 36,
    STASH: 50,
    UPGRADE: 37,
    MOVE_ITEM: 38,
    MOVE_UPGRADE_ITEMS_TO_INVENTORY: 39,
    UPGRADE_ITEM: 40,
    ANVIL_UPGRADE: 41,
    ANVIL_RECIPE: 42,
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
    GUILDERRORTYPE: {
      DOESNOTEXIST: 1,
      BADNAME: 2,
      ALREADYEXISTS: 3,
      NOLEAVE: 4,
      BADINVITE: 5,
      GUILDRULES: 6,
      IDWARNING: 7,
    },
    GUILDACTION: {
      CONNECT: 8,
      ONLINE: 9,
      DISCONNECT: 10,
      INVITE: 11,
      LEAVE: 12,
      CREATE: 13,
      TALK: 14,
      JOIN: 15,
      POPULATION: 16,
    },
    PARTY: 57,
    PARTY_ACTIONS: {
      CREATE: 58,
      JOIN: 59,
      INVITE: 60,
      LEAVE: 61,
      REMOVE: 62,
      DISBAND: 63,
      LEADER: 64,
      ERROR: 65,
    },
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

    // Belts
    BELTLEATHER: 85,
    BELTPLATED: 86,
    BELTFROZEN: 91,
    BELTDIAMOND: 129,

    // Objects
    FLASK: 35,
    REJUVENATIONPOTION: 110,
    POISONPOTION: 111,
    BURGER: 36,
    CHEST: 37,
    FIREPOTION: 38,
    NANOPOTION: 67,
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

    CAKE: 39,
    SCROLLUPGRADELOW: 74,
    SCROLLUPGRADEMEDIUM: 75,
    SCROLLUPGRADEHIGH: 76,
    SCROLLUPGRADEBLESSED: 118,
    RINGBRONZE: 80,
    RINGSILVER: 81,
    RINGGOLD: 82,
    RINGNECROMANCER: 115,
    RINGRAISTONE: 117,
    RINGFOUNTAIN: 126,
    AMULETSILVER: 112,
    AMULETGOLD: 113,
    AMULETCOW: 116,

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
    STASH: 114,
    COWPORTAL: 125,

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
  },

  Orientations: {
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
  },

  Keys: {
    ENTER: 13,
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
    P: 80,
    KEYPAD_4: 100,
    KEYPAD_6: 102,
    KEYPAD_8: 104,
    KEYPAD_2: 98,
  },
};

Types.Entities.Potion = [
  Types.Entities.FLASK,
  Types.Entities.FIREPOTION,
  Types.Entities.REJUVENATIONPOTION,
  Types.Entities.NANOPOTION,
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
];

Types.Entities.Belts = [
  Types.Entities.BELTLEATHER,
  Types.Entities.BELTPLATED,
  Types.Entities.BELTFROZEN,
  Types.Entities.BELTDIAMOND,
];

Types.Entities.Rings = [
  Types.Entities.RINGBRONZE,
  Types.Entities.RINGSILVER,
  Types.Entities.RINGGOLD,
  Types.Entities.RINGNECROMANCER,
  Types.Entities.RINGRAISTONE,
  Types.Entities.RINGFOUNTAIN,
];

Types.Entities.Amulets = [Types.Entities.AMULETSILVER, Types.Entities.AMULETGOLD, Types.Entities.AMULETCOW];

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

  // kind, type, level, damage
  dagger: [Types.Entities.DAGGER, "weapon", "Dagger", 1, 1],
  wirtleg: [Types.Entities.WIRTLEG, "weapon", "Wirt's leg", 1, 2],
  sword: [Types.Entities.SWORD, "weapon", "Sword", 1, 3],
  axe: [Types.Entities.AXE, "weapon", "Axe", 2, 5],
  morningstar: [Types.Entities.MORNINGSTAR, "weapon", "Morning Star", 3, 7],
  bluesword: [Types.Entities.BLUESWORD, "weapon", "Magic Sword", 5, 10],
  redsword: [Types.Entities.REDSWORD, "weapon", "Blazing Sword", 7, 15],
  goldensword: [Types.Entities.GOLDENSWORD, "weapon", "Golden Sword", 10, 20],
  blueaxe: [Types.Entities.BLUEAXE, "weapon", "Frozen Axe", 12, 24],
  bluemorningstar: [Types.Entities.BLUEMORNINGSTAR, "weapon", "Frozen Morning Star", 14, 26],
  frozensword: [Types.Entities.FROZENSWORD, "weapon", "Sapphire Sword", 16, 30],
  diamondsword: [Types.Entities.DIAMONDSWORD, "weapon", "Diamond Sword", 26, 36],

  // kind, type, level, defense
  firefox: [Types.Entities.FIREFOX, "armor"],
  clotharmor: [Types.Entities.CLOTHARMOR, "armor", "Cloth Armor", 1, 1],
  leatherarmor: [Types.Entities.LEATHERARMOR, "armor", "Leather Armor", 1, 3],
  mailarmor: [Types.Entities.MAILARMOR, "armor", "Mail Armor", 3, 5],
  platearmor: [Types.Entities.PLATEARMOR, "armor", "Plate Armor", 5, 10],
  redarmor: [Types.Entities.REDARMOR, "armor", "Ruby Armor", 7, 15],
  goldenarmor: [Types.Entities.GOLDENARMOR, "armor", "Golden Armor", 10, 20],
  bluearmor: [Types.Entities.BLUEARMOR, "armor", "Sapphire Armor", 14, 24],
  hornedarmor: [Types.Entities.HORNEDARMOR, "armor", "Horned Armor", 18, 28],
  frozenarmor: [Types.Entities.FROZENARMOR, "armor", "Frozen Armor", 22, 30],
  diamondarmor: [Types.Entities.DIAMONDARMOR, "armor", "Diamond Armor", 26, 34],
  spikearmor: [Types.Entities.SPIKEARMOR, "armor", "Spike Armor", 30, 36],

  // kind, type, level, defense
  beltleather: [Types.Entities.BELTLEATHER, "belt", "Leather Belt", 4, 2],
  beltplated: [Types.Entities.BELTPLATED, "belt", "Plated Belt", 9, 4],
  beltfrozen: [Types.Entities.BELTFROZEN, "belt", "Frozen Belt", 16, 10],
  beltdiamond: [Types.Entities.BELTDIAMOND, "belt", "Diamond Belt", 34, 16],

  // kind, type, level
  ringbronze: [Types.Entities.RINGBRONZE, "ring", "Bronze Ring", 1],
  ringsilver: [Types.Entities.RINGSILVER, "ring", "Silver Ring", 9],
  ringgold: [Types.Entities.RINGGOLD, "ring", "Gold Ring", 16],
  ringnecromancer: [Types.Entities.RINGNECROMANCER, "ring", "Necromancer Death Wish", 28],
  ringraistone: [Types.Entities.RINGRAISTONE, "ring", "Rai Stone", 18],
  ringfountain: [Types.Entities.RINGFOUNTAIN, "ring", "Fountain of Youth", 26],

  amuletsilver: [Types.Entities.AMULETSILVER, "amulet", "Silver Amulet", 9],
  amuletgold: [Types.Entities.AMULETGOLD, "amulet", "Gold Amulet", 20],
  amuletcow: [Types.Entities.AMULETCOW, "amulet", "Cow King Holy Talisman", 35],

  flask: [Types.Entities.FLASK, "object"],
  rejuvenationpotion: [Types.Entities.REJUVENATIONPOTION, "object"],
  poisonpotion: [Types.Entities.POISONPOTION, "object"],
  cake: [Types.Entities.CAKE, "object"],
  burger: [Types.Entities.BURGER, "object"],
  chest: [Types.Entities.CHEST, "object"],
  firepotion: [Types.Entities.FIREPOTION, "object"],
  nanopotion: [Types.Entities.NANOPOTION, "object"],
  gemruby: [Types.Entities.GEMRUBY, "object"],
  gememerald: [Types.Entities.GEMEMERALD, "object"],
  gemamethyst: [Types.Entities.GEMAMETHYST, "object"],
  gemtopaz: [Types.Entities.GEMTOPAZ, "object"],
  gemsapphire: [Types.Entities.GEMSAPPHIRE, "object"],
  gold: [Types.Entities.GOLD, "object"],
  scrollupgradelow: [Types.Entities.SCROLLUPGRADELOW, "scroll", "Upgrade scroll", 3],
  scrollupgrademedium: [Types.Entities.SCROLLUPGRADEMEDIUM, "scroll", "Upgrade scroll", 6],
  scrollupgradehigh: [Types.Entities.SCROLLUPGRADEHIGH, "scroll", "Superior upgrade scroll", 15],
  scrollupgradeblessed: [Types.Entities.SCROLLUPGRADEBLESSED, "scroll", "Blessed upgrade scroll", 15],
  skeletonkey: [Types.Entities.SKELETONKEY, "object", "Skeleton Key"],
  raiblockstl: [Types.Entities.RAIBLOCKSTL, "object", "Raiblocks artifact"],
  raiblockstr: [Types.Entities.RAIBLOCKSTR, "object", "Raiblocks artifact"],
  raiblocksbl: [Types.Entities.RAIBLOCKSBL, "object", "Raiblocks artifact"],
  raiblocksbr: [Types.Entities.RAIBLOCKSBR, "object", "Raiblocks artifact"],
  skeletonkingcage: [Types.Entities.SKELETONKINGCAGE, "recipe", "Skeleton King's thoratic cage"],
  necromancerheart: [Types.Entities.NECROMANCERHEART, "recipe", "Necromancer's heart"],

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
  stash: [Types.Entities.STASH, "npc"],
  cowportal: [Types.Entities.COWPORTAL, "npc"],

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
];

Types.rankedBelts = [
  Types.Entities.BELTLEATHER,
  Types.Entities.BELTPLATED,
  Types.Entities.BELTFROZEN,
  Types.Entities.BELTDIAMOND,
];

Types.itemUniqueMap = {
  // name, level, attack
  wirtleg: ["Bored Ape Yacht Club", 1, 5],
  sword: ["Faketoshi", 1, 5],
  axe: ["NonDisclosure Agreement", 2, 8],
  morningstar: ["Block Latte", 3, 10],
  bluesword: ["Acyclic Graph", 5, 15],
  redsword: ["Volcanic Miner", 7, 18],
  goldensword: ["Satoshi's Nephiew", 12, 22],
  blueaxe: ["Feeless Cutter", 14, 26],
  bluemorningstar: ["Saylormoon", 16, 28],
  frozensword: ["Broccolish Fury", 20, 32],
  diamondsword: ["Inevitable", 28, 40],

  // name, level, defense
  leatherarmor: ["The Representative", 2, 4],
  mailarmor: ["ForeX Guard", 4, 6],
  platearmor: ["Green Alternative", 6, 12],
  redarmor: ["Appia's Road", 8, 16],
  goldenarmor: ["Store of Value", 12, 22],
  bluearmor: ["Firano's Hide", 14, 26],
  hornedarmor: ["RaiBlocks", 18, 30],
  frozenarmor: ["Wall of Encrypted Energy", 24, 32],
  diamondarmor: ["Zero-knowledge Proof", 28, 34],
  spikearmor: ["Explorer's Block", 32, 36],

  // name, level, defense
  beltleather: ["Proof of Wear", 4, 4],
  beltplated: ["The Hodler", 9, 6],
  beltfrozen: ["Spam Resistor", 22, 12],
  beltdiamond: ["TaaC", 38, 18],
};

Types.setBonus = {
  diamond: {
    exp: 5,
    blockChance: 3,
    health: 50,
  },
  frozen: {
    minDamage: 10,
    criticalHit: 3,
    defense: 15,
  },
  plated: {
    attackDamage: 4,
    defense: 4,
  },
  leather: {
    maxDamage: 3,
    health: 15,
  },
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

Types.isBoss = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [
      Types.Entities.BOSS,
      Types.Entities.NECROMANCER,
      Types.Entities.SKELETONCOMMANDER,
      Types.Entities.COWKING,
    ].includes(kindOrString);
  } else {
    return ["boss", "skeletoncommander", "necromancer", "cowking"].includes(kindOrString);
  }
};

Types.isScroll = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [
      Types.Entities.SCROLLUPGRADELOW,
      Types.Entities.SCROLLUPGRADEMEDIUM,
      Types.Entities.SCROLLUPGRADEHIGH,
      Types.Entities.SCROLLUPGRADEBLESSED,
    ].includes(kindOrString);
  } else {
    return kindOrString.startsWith("scroll");
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

Types.isUniqueRing = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [
      Types.Entities.RINGNECROMANCER,
      Types.Entities.AMULETCOW,
      Types.Entities.RINGRAISTONE,
      Types.Entities.RINGFOUNTAIN,
    ].includes(kindOrString);
  } else {
    return ["ringnecromancer", "amuletcow", "ringraistone", "ringfountain"].includes(kindOrString);
  }
};

Types.isUniqueWeapon = function (bonus: any) {
  return !!bonus;
};

Types.isChest = function (kind: number) {
  return kind === Types.Entities.CHEST;
};

Types.isSingle = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return [Types.Entities.SKELETONKINGCAGE, Types.Entities.NECROMANCERHEART].includes(kindOrString);
  } else {
    return ["skeletonkingcage", "necromancerheart"].includes(kindOrString);
  }
};

Types.isItem = function (kind: number) {
  return (
    Types.isWeapon(kind) ||
    Types.isArmor(kind) ||
    Types.isRing(kind) ||
    Types.isAmulet(kind) ||
    Types.isBelt(kind) ||
    Types.isScroll(kind) ||
    Types.isSingle(kind) ||
    (Types.isObject(kind) && !Types.isChest(kind))
  );
};

Types.Slot = {
  WEAPON: 100,
  ARMOR: 101,
  BELT: 102,
  RING1: 103,
  RING2: 104,
  AMULET: 105,
};

Types.isCorrectTypeForSlot = function (slot: number | string, item: string) {
  switch (slot) {
    case "weapon":
    case Types.Slot.WEAPON:
      return Types.isWeapon(item);
    case "armor":
    case Types.Slot.ARMOR:
      return Types.isArmor(item);
    case "ring":
    case "ring1":
    case "ring2":
    case Types.Slot.RING1:
    case Types.Slot.RING2:
      return Types.isRing(item);
    case "amulet":
    case Types.Slot.AMULET:
      return Types.isAmulet(item);
    case "belt":
    case Types.Slot.BELT:
      return Types.isBelt(item);
  }
  return false;
};

Types.isHealingItem = function (kind: number) {
  return [
    Types.Entities.FLASK,
    Types.Entities.BURGER,
    Types.Entities.NANOPOTION,
    Types.Entities.REJUVENATIONPOTION,
  ].includes(kind);
};

Types.isExpendableItem = function (kind: number) {
  return Types.isHealingItem(kind) || kind === Types.Entities.FIREPOTION || kind === Types.Entities.CAKE;
};

Types.getKindFromString = function (kind: number) {
  if (kind in kinds) {
    return kinds[kind][0];
  }
};

Types.getKindAsString = function (kind: number) {
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
  } else if (name === "skeletoncommander") {
    return "skeleton commander";
  } else if (name === "carlosmatos") {
    return "carlos matos";
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
  } else if (name === "cowportal") {
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
];

Types.bonusType = [
  "minDamage",
  "maxDamage",
  "attackDamage",
  "health",
  "magicDamage",
  "defense",
  "absorbedDamage",
  "exp",
  "regenerateHealth",
  "criticalHit",
  "blockChance",
  "magicFind",
  "attackSpeed",
  "drainLife",
  "flameDamage",
  "lightningDamage",
  "pierceArmor",
  "highHealth",
];

Types.getBonus = function (rawBonus, level) {
  const minDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const maxDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const attackDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const healthPerLevel = [1, 3, 6, 9, 12, 15, 20, 28, 35, 45];
  const magicDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const defensePerLevel = [1, 2, 4, 6, 8, 11, 15, 22, 28, 40];
  const absorbPerLevel = [2, 4, 6, 8, 10, 13, 15, 18, 22, 28];
  const expPerLevel = [1, 2, 3, 4, 5, 6, 7, 10, 15, 20];
  const regenerateHealthPerLevel = [1, 2, 3, 6, 9, 12, 15, 20, 25, 40];
  const criticalHitPerLevel = [1, 1, 2, 3, 4, 6, 8, 11, 15, 20];
  const blockChancePerLevel = [1, 1, 2, 3, 4, 6, 8, 11, 15, 20];
  const magicFindPerLevel = [1, 1, 2, 2, 3, 3, 4, 5, 7, 10];
  const attackSpeedPerLevel = [1, 2, 3, 4, 6, 8, 10, 15, 20, 30];
  const drainLifePerLevel = [1, 3, 6, 9, 12, 16, 20, 25, 32, 45];
  const flameDamagePerLevel = [3, 6, 9, 12, 15, 20, 28, 35, 45, 60];
  const lightningDamagePerLevel = [1, 3, 6, 9, 12, 16, 20, 25, 32, 45];
  const pierceArmorPerLevel = [3, 6, 9, 12, 15, 20, 28, 35, 45, 60];
  const highHealthPerLevel = [10, 20, 30, 40, 50, 70, 100, 140, 200, 280];

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
    pierceArmorPerLevel,
    highHealthPerLevel,
  ];

  const bonus: { type: string; stats: number; description: string }[] = [];

  // A glitch in the inventory system allowed for scrolls to be added as rings
  if (!rawBonus || !Array.isArray(rawBonus)) return bonus;

  for (let i = 0; i < rawBonus.length; i++) {
    const type = Types.bonusType[rawBonus[i]];
    const stats = bonusPerLevel[rawBonus[i]][level - 1];
    const description = Types.getBonusDescriptionMap[rawBonus[i]].replace("#", stats);

    bonus.push({
      type,
      stats,
      description,
    });
  }

  return bonus;
};

Types.getSetBonus = (rawSetBonus: { [key: string]: number }): any[] => {
  let setBonus = [];
  if (!rawSetBonus) return setBonus;

  Object.entries(rawSetBonus).map(([type, stats]) => {
    var index = Types.bonusType.indexOf(type);
    if (index >= 0) {
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

Types.getUpgradeSuccessRates = () => {
  return [100, 100, 90, 80, 55, 30, 7, 4, 1];
};

Types.getLuckySlotSuccessRateBonus = () => {
  return [0, 0, 10, 8, 6, 5, 3, 2, 1];
};

Types.getBlessedSuccessRateBonus = () => {
  return [0, 0, 10, 8, 6, 5, 3, 2, 1];
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
  } else if (baseLevel >= 10) {
    itemClass = "high";
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

Types.getItemDetails = function (
  item: string,
  level: number,
  rawBonus: number[],
  rawSetBonus?: { [key: string]: number },
) {
  const isWeapon = Types.isWeapon(item);
  const isArmor = Types.isArmor(item);
  const isRing = Types.isRing(item);
  const isAmulet = Types.isAmulet(item);
  const isBelt = Types.isBelt(item);
  const isUniqueRing = Types.isUniqueRing(item);
  const isUnique = ((isArmor || isWeapon || isBelt) && !!rawBonus) || isUniqueRing;

  // const isEquipment = isWeapon || isArmor || isBelt || isRing || isAmulet;
  let magicDamage = 0;
  let healthBonus = 0;
  let bonus = [];
  let setBonus = [];

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
  } else if (isRing) {
    type = "ring";
  } else if (isAmulet) {
    type = "amulet";
  }
  if (rawBonus) {
    bonus = Types.getBonus(rawBonus, level);
  }

  if (rawSetBonus) {
    setBonus = Types.getSetBonus(rawSetBonus);
  }

  const itemClass = Types.getItemClass(item, level, isUnique);
  const requirement = Types.getItemRequirement(item, level, isUnique);
  const description = Types.itemDescription[item];

  return {
    item,
    name: Types.getDisplayName(item, isUnique),
    type,
    isUnique,
    itemClass,
    ...(isArmor || isBelt ? { defense: Types.getArmorDefense(item, level, isUnique) } : null),
    ...(isWeapon ? { damage: Types.getWeaponDamage(item, level, isUnique) } : null),
    healthBonus,
    magicDamage,
    requirement,
    description,
    bonus,
    setBonus,
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
  scrollupgradelow:
    "Upgrade low class items. The chances for a successful upgrade varies depending on the item's level.",
  scrollupgrademedium:
    "Upgrade medium class items. The chances for a successful upgrade varies depending on the item's level.",
  scrollupgradehigh:
    "Upgrade high class item. The chances for a successful upgrade varies depending on the item's level.",
  scrollupgradeblessed:
    "Upgrade high class item. The chances for a successful upgrade varies depending on the item's level. Blessed scrolls gives a higher chance of successful upgrade.",
};

// if (!(typeof exports === "undefined")) {
//   module.exports = Types;
// }
