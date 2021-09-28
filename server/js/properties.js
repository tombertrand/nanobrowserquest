var Types = require("../../shared/js/gametypes");

var Properties = {
  rat: {
    drops: {
      flask: 65,
      firepotion: 5,
      scrollupgradelow: 30,
    },
    hp: 25,
    armor: 0.5,
    weapon: 0.5,
  },

  crab: {
    drops: {
      flask: 40,
      axe: 20,
      leatherarmor: 10,
      firepotion: 5,
      scrollupgradelow: 15,
    },
    hp: 60,
    armor: 2,
    weapon: 1,
  },

  bat: {
    drops: {
      flask: 50,
      axe: 15,
      firepotion: 5,
      scrollupgradelow: 20,
    },
    hp: 80,
    armor: 2,
    weapon: 1,
  },

  goblin: {
    drops: {
      flask: 40,
      leatherarmor: 20,
      axe: 10,
      firepotion: 5,
      scrollupgradelow: 15,
      scrollupgrademedium: 10,
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
      flask: 40,
      mailarmor: 10,
      axe: 15,
      firepotion: 5,
      scrollupgradelow: 5,
      scrollupgrademedium: 15,
    },
    hp: 110,
    armor: 2,
    weapon: 2,
  },

  ogre: {
    drops: {
      burger: 10,
      flask: 35,
      platearmor: 15,
      morningstar: 15,
      firepotion: 5,
      scrollupgrademedium: 15,
    },
    hp: 240,
    armor: 3,
    weapon: 3,
  },

  snake: {
    drops: {
      flask: 45,
      mailarmor: 10,
      morningstar: 10,
      firepotion: 5,
      scrollupgradelow: 5,
      scrollupgrademedium: 15,
    },
    hp: 150,
    armor: 3,
    weapon: 2,
  },

  skeleton2: {
    drops: {
      flask: 55,
      platearmor: 10,
      bluesword: 10,
      firepotion: 5,
      scrollupgradelow: 5,
      scrollupgrademedium: 15,
    },
    hp: 200,
    armor: 3,
    weapon: 3,
  },

  eye: {
    drops: {
      flask: 65,
      redarmor: 15,
      firepotion: 5,
      scrollupgrademedium: 15,
    },
    hp: 200,
    armor: 3,
    weapon: 3,
  },

  spectre: {
    drops: {
      flask: 65,
      redsword: 15,
      firepotion: 5,
      scrollupgrademedium: 15,
    },
    hp: 200,
    armor: 2,
    weapon: 4,
  },

  deathknight: {
    drops: {
      burger: 100,
    },
    hp: 250,
    armor: 3,
    weapon: 4,
  },

  boss: {
    drops: {
      goldensword: 100,
    },
    hp: 850,
    armor: 4,
    weapon: 6,
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
