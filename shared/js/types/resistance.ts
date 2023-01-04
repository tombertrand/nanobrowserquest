export const PLAYER_MAX_RESISTANCES = 90;

export const mobResistance = {
  rat: {
    magicResistance: 25,
    coldResistance: 10,
    lightningResistance: 50,
  },
  cowking: {
    lightningResistance: 100,
    physicalResistance: 20,
  },
  minotaur: {
    magicResistance: 80,
    flameResistance: 100,
    lightningResistance: 100,
  },
  wraith2: {
    magicResistance: 30,
    flameResistance: 50,
    lightningResistance: 60,
    coldResistance: 30,
    physicalResistance: 30,
  },
  ghost: {
    magicResistance: 60,
    flameResistance: 20,
    lightningResistance: 30,
    coldResistance: 30,
    physicalResistance: 30,
  },
  mage: {
    magicResistance: 80,
    flameResistance: 80,
    lightningResistance: 80,
    coldResistance: 80,
    physicalResistance: 80,
    poisonResistance: 80,
  },
  deathangel: {
    magicResistance: 100,
    flameResistance: 100,
    lightningResistance: 100,
    coldResistance: 100,
    physicalResistance: 100,
    poisonResistance: 100,
  },
};

const DefaultResistances: Resistances = {
  magicResistance: 0,
  flameResistance: 0,
  lightningResistance: 0,
  coldResistance: 0,
  poisonResistance: 0,
  physicalResistance: 0,
};

export const resistanceToDisplayMap = {
  magicResistance: "magic",
  flameResistance: "flame",
  lightningResistance: "lightning",
  coldResistance: "cold",
  poisonResistance: "poison",
  physicalResistance: "physical",
};

export const calculateResistance = (resistance: number) =>
  resistance > PLAYER_MAX_RESISTANCES ? PLAYER_MAX_RESISTANCES : resistance;

export const getResistance = (mob: { name: string; type: string; bonus: Resistances }) => {
  let resistances = { ...DefaultResistances };

  if (mob.type === "mob") {
    resistances = Object.assign(resistances, mobResistance[mob.name] || {});
  } else if (mob.type === "player") {
    resistances = {
      magicResistance: mob.bonus.magicResistance,
      flameResistance: mob.bonus.flameResistance,
      lightningResistance: mob.bonus.lightningResistance,
      coldResistance: mob.bonus.coldResistance,
      poisonResistance: mob.bonus.poisonResistance,
      physicalResistance: mob.bonus.physicalResistance,
    };
  }

  return resistances;
};
