var Types = require("../../shared/js/gametypes");

var Properties = {
  rat: {
    drops: {
      flask: 45,
      firepotion: 5,
      scrollupgradelow: 20,
      ringbronze: 5,
    },
    hp: 25,
    armor: 0.5,
    weapon: 0.5,
  },

  crab: {
    drops: {
      flask: 30,
      axe: 15,
      leatherarmor: 10,
      firepotion: 5,
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
      firepotion: 5,
      scrollupgradelow: 15,
      ringbronze: 5,
      beltleather: 10,
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
      firepotion: 5,
      scrollupgradelow: 15,
      scrollupgrademedium: 10,
      ringbronze: 5,
      beltleather: 10,
    },
    hp: 90,
    armor: 2,
    weapon: 1,
  },

  wizard: {
    drops: {
      flask: 50,
      platearmor: 20,
      firepotion: 5,
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
      firepotion: 5,
      scrollupgradelow: 10,
      scrollupgrademedium: 5,
      ringbronze: 5,
      beltleather: 10,
    },
    hp: 115,
    armor: 2,
    weapon: 2,
  },

  ogre: {
    drops: {
      burger: 10,
      flask: 30,
      platearmor: 15,
      firepotion: 5,
      scrollupgrademedium: 13,
      ringbronze: 5,
      ringsilver: 2,
      beltleather: 15,
    },
    hp: 250,
    armor: 3,
    weapon: 3,
  },

  snake: {
    drops: {
      flask: 35,
      mailarmor: 10,
      morningstar: 10,
      firepotion: 5,
      scrollupgradelow: 5,
      scrollupgrademedium: 13,
      ringbronze: 5,
      ringsilver: 2,
      beltleather: 10,
    },
    hp: 165,
    armor: 3,
    weapon: 2,
  },

  skeleton2: {
    drops: {
      flask: 40,
      platearmor: 10,
      bluesword: 10,
      firepotion: 5,
      scrollupgradelow: 5,
      scrollupgrademedium: 13,
      ringbronze: 5,
      ringsilver: 2,
    },
    hp: 220,
    armor: 3,
    weapon: 3,
  },

  eye: {
    drops: {
      flask: 45,
      redarmor: 15,
      firepotion: 5,
      scrollupgrademedium: 13,
      ringbronze: 2,
      ringsilver: 4,
      beltplated: 10,
    },
    hp: 240,
    armor: 4,
    weapon: 3,
  },

  spectre: {
    drops: {
      flask: 45,
      redsword: 15,
      firepotion: 5,
      scrollupgrademedium: 13,
      ringbronze: 2,
      ringsilver: 4,
      beltplated: 10,
    },
    hp: 240,
    armor: 2,
    weapon: 4,
  },

  deathknight: {
    drops: {
      burger: 83,
      ringbronze: 2,
      ringsilver: 5,
      beltplated: 10,
    },
    hp: 250,
    armor: 4,
    weapon: 5,
  },

  boss: {
    drops: {
      goldensword: 100,
    },
    hp: 1100,
    armor: 6,
    weapon: 7,
  },

  yeti: {
    drops: {
      burger: 20,
      flask: 20,
      bluearmor: 15,
      firepotion: 3,
      scrollupgradehigh: 5,
      ringsilver: 5,
      ringgold: 3,
      // beltiron: 10,
    },
    hp: 450,
    armor: 7,
    weapon: 8,
  },

  bat2: {
    drops: {
      burger: 20,
      scrollupgradehigh: 1,
      bluearmor: 5,
      ringgold: 2,
    },
    hp: 180,
    armor: 7,
    weapon: 7,
  },

  goblin2: {
    drops: {
      burger: 20,
      scrollupgradehigh: 1,
      blueaxe: 5,
      ringgold: 2,
    },
    hp: 265,
    armor: 6,
    weapon: 8,
  },

  werewolf: {
    drops: {
      burger: 20,
      scrollupgradehigh: 3,
      bluearmor: 6,
      ringgold: 3,
    },
    hp: 375,
    armor: 6,
    weapon: 10,
  },

  skeleton3: {
    drops: {
      burger: 20,
      scrollupgradehigh: 2,
      hornedarmor: 5,
      ringgold: 3,
    },
    hp: 220,
    armor: 8,
    weapon: 8,
  },

  skeletonleader: {
    drops: {
      burger: 20,
      scrollupgradehigh: 5,
      hornedarmor: 5,
      ringgold: 5,
    },
    hp: 1500,
    armor: 10,
    weapon: 12,
  },

  snake2: {
    drops: {
      burger: 20,
      scrollupgradehigh: 3,
      ringgold: 4,
    },
    hp: 265,
    armor: 6,
    weapon: 12,
  },

  wraith: {
    drops: {
      burger: 20,
      scrollupgradehigh: 3,
      frozenarmor: 5,
      ringgold: 5,
    },
    hp: 475,
    armor: 7,
    weapon: 9,
  },

  zombie: {
    drops: {
      burger: 20,
      scrollupgradehigh: 1,
      ringgold: 3,
    },
    hp: 265,
    armor: 8,
    weapon: 8,
  },

  necromancer: {
    drops: {
      burger: 20,
      scrollupgradehigh: 10,
      ringgold: 10,
    },
    hp: 3000,
    armor: 12,
    weapon: 10,
  },
};

Properties.getArmorLevel = function (kind) {
  try {
    if (Types.isMob(kind)) {
      return Properties[Types.getKindAsString(kind)].armor;
    } else {
      return Types.getArmorRank(kind) + 1;
    }
  } catch (e) {
    log.error("No level found for armor: " + Types.getKindAsString(kind));
    log.error("Error stack: " + e.stack);
  }
};

Properties.getWeaponLevel = function (kind) {
  try {
    if (Types.isMob(kind)) {
      return Properties[Types.getKindAsString(kind)].weapon;
    } else {
      return Types.getWeaponRank(kind) + 1;
    }
  } catch (e) {
    log.error("No level found for weapon: " + Types.getKindAsString(kind));
    log.error("Error stack: " + e.stack);
  }
};

Properties.getHitPoints = function (kind) {
  return Properties[Types.getKindAsString(kind)].hp;
};
Properties.getExp = function (kind) {
  return Properties[Types.getKindAsString(kind)].exp;
};

module.exports = Properties;
