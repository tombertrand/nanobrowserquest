var Types = require("../../shared/js/gametypes");

var Properties = {
  rat: {
    drops: {
      flask: 50,
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
      flask: 35,
      axe: 15,
      leatherarmor: 10,
      firepotion: 5,
      scrollupgradelow: 15,
      ringbronze: 5,
    },
    hp: 60,
    armor: 2,
    weapon: 1,
  },

  bat: {
    drops: {
      flask: 45,
      axe: 15,
      firepotion: 5,
      scrollupgradelow: 20,
      ringbronze: 5,
    },
    hp: 80,
    armor: 2,
    weapon: 1,
  },

  goblin: {
    drops: {
      flask: 35,
      leatherarmor: 15,
      axe: 10,
      firepotion: 5,
      scrollupgradelow: 15,
      scrollupgrademedium: 10,
      ringbronze: 5,
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
      scrollupgrademedium: 15,
      ringbronze: 5,
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
      morningstar: 15,
      firepotion: 5,
      scrollupgrademedium: 15,
      ringbronze: 5,
      ringsilver: 2,
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
      scrollupgrademedium: 15,
      ringbronze: 5,
      ringsilver: 2,
    },
    hp: 165,
    armor: 3,
    weapon: 2,
  },

  skeleton2: {
    drops: {
      flask: 45,
      platearmor: 10,
      bluesword: 10,
      firepotion: 5,
      scrollupgradelow: 5,
      scrollupgrademedium: 15,
      ringbronze: 5,
      ringsilver: 2,
    },
    hp: 220,
    armor: 3,
    weapon: 3,
  },

  eye: {
    drops: {
      flask: 55,
      redarmor: 15,
      firepotion: 5,
      scrollupgrademedium: 15,
      ringbronze: 2,
      ringsilver: 4,
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
      scrollupgrademedium: 15,
      ringbronze: 2,
      ringsilver: 4,
    },
    hp: 240,
    armor: 2,
    weapon: 4,
  },

  deathknight: {
    drops: {
      burger: 90,
      ringbronze: 2,
      ringsilver: 5,
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
