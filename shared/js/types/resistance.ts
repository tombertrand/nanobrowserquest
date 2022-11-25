import { Resistances } from "../../../server/js/types";

export const mobResistance = {
  rat: {
    coldResistance: 10,
    lightningResistance: 50,
  },
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
  magicResistance: "magic resistance",
  flameResistance: "flame resistance",
  lightningResistance: "lightning resistance",
  coldResistance: "cold resistance",
  poisonResistance: "poison resistance",
  physicaResistance: "physical resistance",
};

export const getResistance = (mob: { kind: string; type: string; bonus: Resistances }) => {
  let resistances: Resistances = {
    magicResistance: 0,
    flameResistance: 0,
    lightningResistance: 0,
    coldResistance: 0,
    poisonResistance: 0,
    physicalResistance: 0,
  };

  if (mob.type === "mob") {
    resistances = Object.assign(resistances, resistances[mob.kind] || {});
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
