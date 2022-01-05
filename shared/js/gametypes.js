Types = {
  Store: {
    EXPANSION1: 1,
    SCROLLUPGRADEHIGH: 2,
    SCROLLUPGRADEMEDIUM: 3,
    CAPE: 4,
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
    WAYPOINT: 42,
    WAYPOINTS_UPDATE: 43,
    STORE_ITEMS: 44,
    PURCHASE_CREATE: 45,
    PURCHASE_CANCEL: 46,
    PURCHASE_COMPLETED: 47,
    PURCHASE_ERROR: 48,
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
  },

  Entities: {
    WARRIOR: 1,

    // Mobs
    RAT: 2,
    SKELETON: 3,
    GOBLIN: 4,
    OGRE: 5,
    SPECTRE: 6,
    CRAB: 7,
    BAT: 8,
    WIZARD: 9,
    EYE: 10,
    SNAKE: 11,
    SKELETON2: 12,
    BOSS: 13,
    DEATHKNIGHT: 14,
    RAT2: 88,
    BAT2: 89,
    GOBLIN2: 90,
    YETI: 99,
    WEREWOLF: 101,
    SKELETON3: 102,
    SKELETONLEADER: 103,
    SNAKE2: 104,
    WRAITH: 105,
    ZOMBIE: 106,
    NECROMANCER: 108,

    // Armors
    FIREFOX: 20,
    CLOTHARMOR: 21,
    LEATHERARMOR: 22,
    MAILARMOR: 23,
    PLATEARMOR: 24,
    REDARMOR: 25,
    GOLDENARMOR: 26,
    BLUEARMOR: 87,
    FROZENARMOR: 78,
    HORNEDARMOR: 83,

    // Belts
    BELTLEATHER: 85,
    BELTPLATED: 86,
    BELTFROZEN: 91,

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

    CAKE: 39,
    SCROLLUPGRADELOW: 74,
    SCROLLUPGRADEMEDIUM: 75,
    SCROLLUPGRADEHIGH: 76,
    RINGBRONZE: 80,
    RINGSILVER: 81,
    RINGGOLD: 82,
    AMULETSILVER: 112,
    AMULETGOLD: 113,

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
];

Types.Entities.Belts = [Types.Entities.BELTLEATHER, Types.Entities.BELTPLATED, Types.Entities.BELTFROZEN];

Types.Entities.Rings = [Types.Entities.RINGBRONZE, Types.Entities.RINGSILVER, Types.Entities.RINGGOLD];

Types.Entities.Amulets = [Types.Entities.AMULETSILVER, Types.Entities.AMULETGOLD];

Types.getGemNameFromKind = function (kind) {
  const gems = {
    [Types.Entities.GEMRUBY]: "Ruby",
    [Types.Entities.GEMEMERALD]: "Emerald",
    [Types.Entities.GEMAMETHYST]: "Amethyst",
    [Types.Entities.GEMTOPAZ]: "Topaz",
    [Types.Entities.GEMSAPPHIRE]: "Sapphire",
  };

  return gems[kind] || kind;
};

Types.getArtifactNameFromKind = function (kind) {
  const artifact = {
    [Types.Entities.RAIBLOCKSTL]: "Raiblocks top left",
    [Types.Entities.RAIBLOCKSTR]: "Raiblocks top right",
    [Types.Entities.RAIBLOCKSBL]: "Raiblocks bottom left",
    [Types.Entities.RAIBLOCKSBR]: "Raiblocks bottom right",
  };

  return artifact[kind] || kind;
};

var kinds = {
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
  werewolf: [Types.Entities.WEREWOLF, "mob", 120, 30],
  yeti: [Types.Entities.YETI, "mob", 120, 32],
  skeleton3: [Types.Entities.SKELETON3, "mob", 130, 34],
  skeletonleader: [Types.Entities.SKELETONLEADER, "mob", 250, 40],
  snake2: [Types.Entities.SNAKE2, "mob", 130, 34],
  wraith: [Types.Entities.WRAITH, "mob", 140, 36],
  zombie: [Types.Entities.ZOMBIE, "mob", 100, 38],
  necromancer: [Types.Entities.NECROMANCER, "mob", 500, 45],

  // kind, type, level, damage
  dagger: [Types.Entities.DAGGER, "weapon", "Dagger", 1, 1],
  sword: [Types.Entities.SWORD, "weapon", "Sword", 1, 3],
  axe: [Types.Entities.AXE, "weapon", "Axe", 2, 5],
  morningstar: [Types.Entities.MORNINGSTAR, "weapon", "Morning Star", 3, 7],
  bluesword: [Types.Entities.BLUESWORD, "weapon", "Frozen Sword", 5, 10],
  redsword: [Types.Entities.REDSWORD, "weapon", "Blazing Sword", 7, 15],
  goldensword: [Types.Entities.GOLDENSWORD, "weapon", "Golden Sword", 10, 20],
  blueaxe: [Types.Entities.BLUEAXE, "weapon", "Frozen Axe", 12, 24],
  bluemorningstar: [Types.Entities.BLUEMORNINGSTAR, "weapon", "Frozen Morning Star", 14, 26],
  frozensword: [Types.Entities.FROZENSWORD, "weapon", "Sapphire Sword", 16, 30],

  // kind, type, level, defense
  clotharmor: [Types.Entities.CLOTHARMOR, "armor", "Cloth Armor", 1, 1],
  leatherarmor: [Types.Entities.LEATHERARMOR, "armor", "Leather Armor", 1, 3],
  mailarmor: [Types.Entities.MAILARMOR, "armor", "Mail Armor", 3, 5],
  platearmor: [Types.Entities.PLATEARMOR, "armor", "Plate Armor", 5, 10],
  redarmor: [Types.Entities.REDARMOR, "armor", "Ruby Armor", 7, 15],
  goldenarmor: [Types.Entities.GOLDENARMOR, "armor", "Golden Armor", 10, 20],
  bluearmor: [Types.Entities.BLUEARMOR, "armor", "Sapphire Armor", 14, 24],
  hornedarmor: [Types.Entities.HORNEDARMOR, "armor", "Horned Armor", 14, 28],
  frozenarmor: [Types.Entities.FROZENARMOR, "armor", "Frozen Armor", 14, 30],
  firefox: [Types.Entities.FIREFOX, "armor"],

  // kind, type, level, defense
  beltleather: [Types.Entities.BELTLEATHER, "belt", "Leather Belt", 4, 2],
  beltplated: [Types.Entities.BELTPLATED, "belt", "Plated Belt", 9, 4],
  beltfrozen: [Types.Entities.BELTFROZEN, "belt", "Frozen Belt", 16, 10],

  // kind, type, level
  ringbronze: [Types.Entities.RINGBRONZE, "ring", "Bronze Ring", 1],
  ringsilver: [Types.Entities.RINGSILVER, "ring", "Silver Ring", 9],
  ringgold: [Types.Entities.RINGGOLD, "ring", "Gold Ring", 16],

  amuletsilver: [Types.Entities.AMULETSILVER, "amulet", "Silver Amulet", 9],
  amuletgold: [Types.Entities.AMULETGOLD, "amulet", "Gold Amulet", 20],

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
  skeletonkey: [Types.Entities.SKELETONKEY, "object", "Skeleton Key"],
  raiblockstl: [Types.Entities.RAIBLOCKSTL, "object", "Raiblocks artifact"],
  raiblockstr: [Types.Entities.RAIBLOCKSTR, "object", "Raiblocks artifact"],
  raiblocksbl: [Types.Entities.RAIBLOCKSBL, "object", "Raiblocks artifact"],
  raiblocksbr: [Types.Entities.RAIBLOCKSBR, "object", "Raiblocks artifact"],

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
];

Types.rankedBelts = [Types.Entities.BELTLEATHER, Types.Entities.BELTPLATED, Types.Entities.BELTFROZEN];

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

Types.getLevel = function (exp) {
  var i = 1;
  for (i = 1; i < 135; i++) {
    if (exp < Types.expForLevel[i]) {
      return i;
    }
  }
  return 135;
};
Types.getWeaponRank = function (weaponKind) {
  return _.indexOf(Types.rankedWeapons, weaponKind);
};

Types.getArmorRank = function (armorKind) {
  return _.indexOf(Types.rankedArmors, armorKind);
};
Types.getMobExp = function (mobKind) {
  return kinds.getMobExp(mobKind);
};
Types.getMobLevel = function (mobKind) {
  return kinds.getMobLevel(mobKind);
};
Types.getBaseLevel = function (kind) {
  return kinds.getBaseLevel(kind);
};

Types.isPlayer = function (kind) {
  return kinds.getType(kind) === "player";
};

Types.isMob = function (kind) {
  return kinds.getType(kind) === "mob";
};

Types.isNpc = function (kind) {
  return kinds.getType(kind) === "npc";
};

Types.isCharacter = function (kind) {
  return Types.isMob(kind) || Types.isNpc(kind) || Types.isPlayer(kind);
};

Types.isArmor = function (kindOrString) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "armor";
  } else {
    return kinds[kindOrString][1] === "armor";
  }
};

Types.isBelt = function (kindOrString) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "belt";
  } else {
    return kinds[kindOrString][1] === "belt";
  }
};

Types.isScroll = function (kindOrString) {
  if (typeof kindOrString === "number") {
    return [
      Types.Entities.SCROLLUPGRADELOW,
      Types.Entities.SCROLLUPGRADEMEDIUM,
      Types.Entities.SCROLLUPGRADEHIGH,
    ].includes(kindOrString);
  } else {
    return kindOrString.startsWith("scroll");
  }
};

Types.isWeapon = function (kindOrString) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "weapon";
  } else {
    return kinds[kindOrString] ? kinds[kindOrString][1] === "weapon" : false;
  }
};

Types.isRing = function (kindOrString) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "ring";
  } else {
    return kinds[kindOrString][1] === "ring";
  }
};

Types.isAmulet = function (kindOrString) {
  if (typeof kindOrString === "number") {
    return kinds.getType(kindOrString) === "amulet";
  } else {
    return kinds[kindOrString][1] === "amulet";
  }
};

Types.isObject = function (kind) {
  return kinds.getType(kind) === "object";
};

Types.isChest = function (kind) {
  return kind === Types.Entities.CHEST;
};

Types.isItem = function (kind) {
  return (
    Types.isWeapon(kind) ||
    Types.isArmor(kind) ||
    Types.isRing(kind) ||
    Types.isAmulet(kind) ||
    Types.isBelt(kind) ||
    Types.isScroll(kind) ||
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

Types.isCorrectTypeForSlot = function (slot, item) {
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
};

Types.isHealingItem = function (kind) {
  return [
    Types.Entities.FLASK,
    Types.Entities.BURGER,
    Types.Entities.NANOPOTION,
    Types.Entities.REJUVENATIONPOTION,
  ].includes(kind);
};

Types.isExpendableItem = function (kind) {
  return Types.isHealingItem(kind) || kind === Types.Entities.FIREPOTION || kind === Types.Entities.CAKE;
};

Types.getKindFromString = function (kind) {
  if (kind in kinds) {
    return kinds[kind][0];
  }
};

Types.getKindAsString = function (kind) {
  for (var k in kinds) {
    if (kinds[k][0] === kind) {
      return k;
    }
  }
};

Types.getDisplayableName = function (name) {
  return kinds[name][2];
};

Types.getAliasFromName = function (name) {
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
  } else if (name === "skeletonleader") {
    return "skeleton leader";
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
  } else if (name.startsWith("waypoint")) {
    return "waypoint";
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

Types.forEachKind = function (callback) {
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

Types.getOrientationAsString = function (orientation) {
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

Types.getRandomItemKind = function (item) {
  var all = _.union(this.rankedWeapons, this.rankedArmors),
    forbidden = [Types.Entities.DAGGER, Types.Entities.CLOTHARMOR],
    itemKinds = _.difference(all, forbidden),
    i = Math.floor(Math.random() * _.size(itemKinds));

  return itemKinds[i];
};

Types.getMessageTypeAsString = function (type) {
  var typeName;
  _.each(Types.Messages, function (value, name) {
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
  "+#% Attack speed",
];

Types.getBonus = function (rawBonus, level) {
  const minDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const maxDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const weaponDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const healthPerLevel = [2, 4, 6, 8, 10, 12, 16, 22, 28, 40];
  const magicDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const defensePerLevel = [1, 2, 4, 6, 8, 11, 15, 22, 28, 40];
  const absorbPerLevel = [2, 4, 6, 8, 10, 13, 15, 18, 22, 28];
  const expPerLevel = [1, 2, 3, 4, 5, 6, 7, 10, 15, 20];
  const regenerateHealthPerLevel = [1, 1, 2, 2, 3, 3, 4, 5, 7, 10];
  const criticalHitPerLevel = [1, 2, 3, 4, 5, 7, 10, 15, 20, 30];
  const blockChancePerLevel = [1, 1, 2, 3, 4, 6, 10, 15, 20, 30];
  const magicFindPerLevel = [1, 1, 2, 2, 3, 3, 4, 5, 7, 10];
  const attackSpeedPerLevel = [1, 2, 3, 4, 6, 8, 10, 15, 20, 30];

  const bonusPerLevel = [
    minDamagePerLevel,
    maxDamagePerLevel,
    weaponDamagePerLevel,
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
  ];

  const bonusType = [
    "minDamage",
    "maxDamage",
    "weaponDamage",
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
  ];

  const bonus = [];

  // A glitch in the inventory system allowed for scrolls to be added as rings
  if (!rawBonus || !Array.isArray(rawBonus)) return bonus;

  for (let i = 0; i < rawBonus.length; i++) {
    const type = bonusType[rawBonus[i]];
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

Types.getUpgradeSuccessRates = () => {
  return [100, 100, 90, 80, 55, 30, 7, 4, 1];
};

// kind, type, name, level, defense
Types.getArmorDefense = function (armor, level) {
  if (!armor || !level) return 0;

  const defense = kinds[armor][4];
  const defensePercentPerLevel = [100, 105, 110, 120, 130, 145, 160, 180, 205, 235];
  // const defensePercentPerLevel = [100, 102.5, 105, 108, 110.5, 113.5, 117.5, 123.5, 132, 145];

  const defenseBonus = level >= 7 ? level - 6 : 0;

  return Math.ceil((defense + defenseBonus) * (defensePercentPerLevel[level - 1] / 100));
};

Types.getArmorHealthBonus = function (level) {
  if (!level) return 0;

  const healthBonusPerLevel = [2, 4, 8, 14, 20, 30, 42, 60, 80, 110];

  return healthBonusPerLevel[level - 1];
};

Types.getWeaponDamage = function (weapon, level) {
  const damage = kinds[weapon][4];
  const damagePercentPerLevel = [100, 105, 110, 120, 130, 145, 160, 180, 205, 235];
  const damageBonus = level >= 7 ? level - 6 : 0;

  return Math.ceil((damage + damageBonus) * (damagePercentPerLevel[level - 1] / 100));
};

Types.getWeaponMagicDamage = function (level) {
  const magicDamagePerLevel = [1, 3, 5, 8, 11, 15, 18, 25, 35, 50];

  return magicDamagePerLevel[level - 1];
};

Types.isBaseHighClassItem = item => {
  const baseLevel = kinds[item][3];

  return baseLevel >= 10;
};

Types.getItemClass = function (item, level) {
  const baseLevel = kinds[item][3];

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

Types.getItemRequirement = function (item, level) {
  const baseLevel = kinds[item][3];
  const multiplier = Types.getItemClass(item, level) === "high" ? 1.5 : 1;
  const requirement = Math.floor(baseLevel + level * multiplier);

  return requirement;
};

Types.getItemDetails = function (item, level, rawBonus = [1, 3]) {
  const isWeapon = Types.isWeapon(item);
  const isArmor = Types.isArmor(item);
  const isRing = Types.isRing(item);
  const isAmulet = Types.isAmulet(item);
  const isBelt = Types.isBelt(item);

  const isEquipment = isWeapon || isArmor || isBelt || isRing || isAmulet;
  let magicDamage = 0;
  let healthBonus = 0;
  let bonus = [];

  let type = "item";
  if (isWeapon) {
    type = "weapon";
    magicDamage = Types.getWeaponMagicDamage(level);
  } else if (isArmor) {
    type = "armor";
    healthBonus = Types.getArmorHealthBonus(level);
  } else if (isBelt) {
    type = "belt";
    healthBonus = Types.getArmorHealthBonus(level);
  } else if (isRing) {
    type = "ring";
    bonus = Types.getBonus(rawBonus, level);
  } else if (isAmulet) {
    type = "amulet";
    bonus = Types.getBonus(rawBonus, level);
  }

  let itemClass = Types.getItemClass(item, level);

  const requirement = Types.getItemRequirement(item, level);
  const description = Types.itemDescription[item];

  return {
    item,
    name: Types.getDisplayName(item),
    type,
    ...(itemClass ? { itemClass } : null),
    ...(isArmor || isBelt ? { defense: Types.getArmorDefense(item, level), healthBonus } : null),
    ...(isWeapon ? { damage: Types.getWeaponDamage(item, level), magicDamage } : null),
    ...(isEquipment ? { requirement } : null),
    ...(description ? { description } : null),
    ...(bonus ? { bonus } : null),
  };
};

Types.getDisplayName = function (item) {
  return kinds[item][2];
};

Types.itemDescription = {
  scrollupgradelow:
    "Upgrade low class items. The chances for a successful upgrade varies depending on the item's level.",
  scrollupgrademedium:
    "Upgrade medium class items. The chances for a successful upgrade varies depending on the item's level.",
  scrollupgradehigh:
    "Upgrade high class item. The chances for a successful upgrade varies depending on the item's level.",
};

if (!(typeof exports === "undefined")) {
  module.exports = Types;
}
