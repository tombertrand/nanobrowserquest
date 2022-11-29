export const PLAYER_MAX_RESISTANCES = 90;

export const mobResistance = {
  // rat: {
  //   coldResistance: 10,
  //   lightningResistance: 50,
  // },
  cowking: {
    lightningResistance: 100,
    physicaResistance: 20,
  },
  minotaur: {
    magicResistance: 80,
    flameResistance: 100,
    lightningResistance: 100,
  },
};

export const resistanceToDisplayMap = {
  magicResistance: "magic",
  flameResistance: "flame",
  lightningResistance: "lightning",
  coldResistance: "cold",
  poisonResistance: "poison",
  physicaResistance: "physical",
};

export const calculateResistance = (resistance: number) =>
  resistance > PLAYER_MAX_RESISTANCES ? PLAYER_MAX_RESISTANCES : resistance;

export const getResistance = (mob: { name: string; type: string; bonus: Resistances }) => {
  let resistances: Resistances = {
    magicResistance: 0,
    flameResistance: 0,
    lightningResistance: 0,
    coldResistance: 0,
    poisonResistance: 0,
    physicalResistance: 0,
  };

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
