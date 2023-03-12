import { Types } from "../../shared/js/gametypes";

var Properties: any = {
  rat: {
    drops: {
      flask: 45,
      firefoxpotion: 5,
      scrollupgradelow: 20,
      ringbronze: 5,
    },
    hp: 20,
    armor: 0.5,
    weapon: 0.5,
  },
  crab: {
    drops: {
      flask: 35,
      axe: 10,
      shieldwood: 10,
      leatherarmor: 10,
      firefoxpotion: 5,
      scrollupgradelow: 15,
      ringbronze: 5,
      beltleather: 10,
    },
    hp: 60,
    armor: 2,
    weapon: 1,
  },
  bat: {
    drops: {
      flask: 40,
      axe: 15,
      firefoxpotion: 5,
      scrollupgradelow: 15,
      ringbronze: 5,
      beltleather: 10,
      shieldwood: 10,
    },
    hp: 80,
    armor: 2,
    weapon: 1,
  },
  goblin: {
    drops: {
      flask: 30,
      leatherarmor: 15,
      axe: 10,
      firefoxpotion: 5,
      scrollupgradelow: 5,
      scrollupgrademedium: 10,
      ringbronze: 5,
      beltleather: 10,
      shieldiron: 5,
    },
    hp: 90,
    armor: 2,
    weapon: 1,
  },
  wizard: {
    drops: {
      flask: 50,
      platearmor: 20,
      firefoxpotion: 5,
    },
    hp: 100,
    armor: 2,
    weapon: 6,
  },
  skeleton: {
    drops: {
      flask: 35,
      mailarmor: 10,
      axe: 15,
      firefoxpotion: 5,
      scrollupgrademedium: 10,
      ringbronze: 5,
      beltleather: 10,
      shieldiron: 5,
    },
    hp: 115,
    armor: 2,
    weapon: 2,
  },
  ogre: {
    drops: {
      flask: 35,
      platearmor: 15,
      firefoxpotion: 5,
      scrollupgrademedium: 13,
      ringbronze: 5,
      ringsilver: 2,
      beltleather: 15,
      shieldplate: 5,
    },
    hp: 250,
    armor: 3,
    weapon: 3,
  },
  snake: {
    drops: {
      flask: 35,
      mailarmor: 10,
      firefoxpotion: 5,
      scrollupgradelow: 5,
      scrollupgrademedium: 13,
      ringbronze: 5,
      ringsilver: 2,
      beltleather: 10,
      shieldiron: 5,
    },
    hp: 165,
    armor: 3,
    weapon: 3,
  },
  skeleton2: {
    drops: {
      flask: 35,
      platearmor: 10,
      bluesword: 10,
      firefoxpotion: 5,
      scrollupgradelow: 5,
      scrollupgrademedium: 15,
      ringsilver: 2,
      shieldplate: 5,
    },
    hp: 220,
    armor: 3,
    weapon: 3,
  },
  eye: {
    drops: {
      flask: 45,
      redarmor: 12,
      firefoxpotion: 5,
      scrollupgrademedium: 15,
      ringsilver: 4,
      beltplated: 3,
      amuletsilver: 2,
      shieldred: 5,
    },
    hp: 240,
    armor: 4,
    weapon: 3,
  },
  spectre: {
    drops: {
      flask: 45,
      redsword: 15,
      firefoxpotion: 5,
      scrollupgrademedium: 15,
      ringsilver: 4,
      beltplated: 3,
      amuletsilver: 2,
      shieldred: 5,
    },
    hp: 250,
    armor: 2,
    weapon: 4,
  },
  deathknight: {
    drops: {
      burger: 70,
      ringsilver: 5,
      beltplated: 5,
      amuletsilver: 2,
      scrollupgrademedium: 10,
      shieldred: 5,
    },
    hp: 275,
    armor: 4,
    weapon: 5,
  },
  boss: {
    drops: {
      goldensword: 80,
      skeletonkingcage: 20,
    },
    hp: 1200,
    armor: 6,
    weapon: 7,
  },
  rat2: {
    drops: {
      rejuvenationpotion: 80,
      bluearmor: 5,
      scrollupgradehigh: 3,
      shieldblue: 3,
    },
    hp: 240,
    armor: 7,
    weapon: 5,
  },
  bat2: {
    drops: {
      rejuvenationpotion: 70,
      blueaxe: 5,
      beltfrozen: 3,
      scrollupgradehigh: 4,
      shieldblue: 3,
    },
    hp: 280,
    armor: 6,
    weapon: 6,
  },
  goblin2: {
    drops: {
      rejuvenationpotion: 80,
      blueaxe: 5,
      beltfrozen: 5,
      scrollupgradehigh: 4,
      amuletgold: 1,
      shieldblue: 3,
    },
    hp: 240,
    armor: 5,
    weapon: 6,
  },
  werewolf: {
    drops: {
      rejuvenationpotion: 75,
      scrollupgradehigh: 5,
      bluearmor: 3,
      bluemorningstar: 3,
      beltfrozen: 3,
      ringgold: 2,
      amuletgold: 1,
      shieldblue: 3,
    },
    hp: 375,
    armor: 6,
    weapon: 7,
  },
  yeti: {
    drops: {
      rejuvenationpotion: 80,
      bluearmor: 3,
      bluemorningstar: 3,
      scrollupgradehigh: 5,
      ringgold: 3,
      shieldhorned: 2,
    },
    hp: 420,
    armor: 8,
    weapon: 8,
  },
  skeleton3: {
    drops: {
      rejuvenationpotion: 80,
      scrollupgradehigh: 5,
      hornedarmor: 3,
      belthorned: 1,
      ringgold: 2,
      amuletgold: 1,
      shieldhorned: 2,
    },
    hp: 420,
    armor: 8,
    weapon: 9,
  },
  skeletoncommander: {
    drops: {
      scrollupgradehigh: 3,
      belthorned: 1,
      hornedarmor: 5,
      ringgold: 4,
      amuletgold: 3,
      shieldhorned: 3,
    },
    hp: 2500,
    armor: 12,
    weapon: 12,
  },
  snake2: {
    drops: {
      rejuvenationpotion: 75,
      beltfrozen: 1,
      belthorned: 3,
      scrollupgradehigh: 5,
      ringgold: 3,
      amuletgold: 2,
      shieldhorned: 2,
      shieldfrozen: 2,
    },
    hp: 420,
    armor: 8,
    weapon: 10,
  },
  wraith: {
    drops: {
      rejuvenationpotion: 60,
      beltfrozen: 3,
      belthorned: 1,
      shieldhorned: 1,
      shieldfrozen: 2,
      scrollupgradehigh: 5,
      ringgold: 3,
      amuletgold: 2,
    },
    hp: 575,
    armor: 10,
    weapon: 11,
  },
  zombie: {
    drops: {
      rejuvenationpotion: 70,
      scrollupgradehigh: 3,
      ringgold: 2,
      amuletgold: 2,
      shieldfrozen: 1,
    },
    hp: 305,
    armor: 6,
    weapon: 12,
  },
  necromancer: {
    drops: {
      necromancerheart: 20,
      scrollupgradehigh: 3,
      ringgold: 4,
      amuletgold: 4,
      shieldfrozen: 3,
      ringnecromancer: 1,
    },
    hp: 3000,
    armor: 13,
    weapon: 13,
  },
  cow: {
    drops: {
      rejuvenationpotion: 40,
      hornedarmor: 1,
      frozenarmor: 1,
      frozensword: 1,
      beltfrozen: 1,
      belthorned: 1,
      shieldhorned: 1,
      shieldfrozen: 1,
      ringgold: 1,
      amuletgold: 1,
      scrollupgradehigh: 1,
    },
    hp: 600,
    armor: 16,
    weapon: 20,
  },
  cowking: {
    drops: {
      diamondsword: 8,
      diamondarmor: 8,
      beltdiamond: 8,
      shielddiamond: 8,
      amuletcow: 5,
      scrolltransmute: 3,
      cowkinghorn: 20,
      scrollupgradehigh: 40,
    },
    hp: 6_500,
    armor: 22,
    weapon: 24,
  },
  minotaur: {
    drops: {
      ringminotaur: 5,
      scrolltransmute: 3,
      minotauraxe: 10,
      beltminotaur: 10,
      scrollupgradehigh: 72,
    },
    hp: 12_500,
    armor: 29,
    weapon: 32,
  },
  rat3: {
    drops: {
      powdergreen: 5,
      rejuvenationpotion: 15,
      scrollupgradelegendary: 2,
      ringplatinum: 2,
      poisonpotion: 30,
    },
    hp: 600,
    armor: 16,
    weapon: 20,
  },
  oculothorax: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 800,
    armor: 22,
    weapon: 24,
  },
  kobold: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 1000,
    armor: 22,
    weapon: 26,
  },
  golem: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 1000,
    armor: 25,
    weapon: 25,
  },
  worm: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 2320,
    armor: 28,
    weapon: 30,
  },
  snake3: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 650,
    armor: 20,
    weapon: 24,
  },
  snake4: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 420,
    armor: 22,
    weapon: 26,
  },
  skeleton4: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 1100,
    armor: 21,
    weapon: 21,
  },
  ghost: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 4,
      ringplatinum: 2,
      amuletplatinum: 2,
    },
    hp: 900,
    armor: 22,
    weapon: 26,
  },
  skeletonberserker: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 1100,
    armor: 22,
    weapon: 24,
  },
  skeletontemplar: {
    drops: {
      powderblack: 25,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 4500,
    armor: 30,
    weapon: 24,
  },
  skeletontemplar2: {
    drops: {
      powderblue: 25,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 4500,
    armor: 30,
    weapon: 24,
  },
  spider: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
      poisonpotion: 10,
    },
    hp: 1240,
    armor: 24,
    weapon: 24,
  },
  spider2: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
      poisonpotion: 10,
    },
    hp: 1240,
    armor: 24,
    weapon: 24,
  },
  spiderqueen: {
    drops: {
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
      poisonpotion: 33,
    },
    hp: 7500,
    armor: 34,
    weapon: 26,
  },
  skeletonarcher: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 1040,
    armor: 20,
    weapon: 26,
  },
  butcher: {
    drops: {
      soulstone: 100,
    },
    hp: 10_000,
    armor: 36,
    weapon: 30,
  },
  wraith2: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 4,
      moonsword: 3,
      beltmoon: 3,
      shieldmoon: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 1620,
    armor: 28,
    weapon: 30,
  },
  mage: {
    drops: {
      rejuvenationpotion: 15,
      scrollupgradelegendary: 4,
      moonsword: 3,
      beltmoon: 3,
      shieldmoon: 3,
      ringplatinum: 2,
      amuletplatinum: 2,
    },
    hp: 1210,
    armor: 20,
    weapon: 30,
  },
  shaman: {
    drops: {
      scrollupgradelegendary: 8,
      moonsword: 3,
      beltmoon: 3,
      shieldmoon: 3,
      ringplatinum: 3,
      amuletplatinum: 3,
    },
    hp: 12_000,
    armor: 32,
    weapon: 30,
  },
  deathangel: {
    drops: {
      scrollupgradelegendary: 5,
      scrollupgradesacred: 1,
      mysticalsword: 4,
      mysticalarmor: 4,
      beltmystical: 4,
      shieldmystical: 4,
      ringmystical: 2,
    },
    hp: 20_000,
    armor: 34,
    weapon: 40,
  },
};

Properties.getArmorLevel = function (kind) {
  try {
    if (Types.isMob(kind)) {
      return Properties[Types.getKindAsString(kind)].armor;
    } else {
      return Types.getArmorRank(kind) + 1;
    }
  } catch (err) {
    console.error("No level found for armor: " + Types.getKindAsString(kind));
    console.error("Error stack: " + err.stack);
  }
};

Properties.getWeaponLevel = function (kind) {
  try {
    if (Types.isMob(kind)) {
      return Properties[Types.getKindAsString(kind)].weapon;
    } else {
      return Types.getWeaponRank(kind) + 1;
    }
  } catch (err) {
    console.error("No level found for weapon: " + Types.getKindAsString(kind));
    console.error("Error stack: " + err.stack);
  }
};

Properties.getHitPoints = function (kind) {
  return Properties[Types.getKindAsString(kind)].hp;
};
Properties.getExp = function (kind) {
  return Properties[Types.getKindAsString(kind)].exp;
};

export default Properties;
