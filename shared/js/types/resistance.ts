import _ from "lodash";

export const PLAYER_MAX_RESISTANCES = 90;
export const PLAYER_MAX_ATTACK_SPEED = 50;
export const DEFAULT_ATTACK_SPEED = 800;
export const DEFAULT_ATTACK_ANIMATION_SPEED = 50;
export const PLAYER_MAX_EXTRA_GOLD = 75;
export const PLAYER_MAX_MAGIC_FIND = 75;

export const mobEnchant: { [key: string]: Enchant[] } = {
  cowking: ["lightning"],
  minotaur: ["cold"],
  rat3: ["poison"],
  golem: ["physical", "stoneskin"],
  snake3: ["poison"],
  snake4: ["flame"],
  spider: ["poison"],
  spider2: ["magic"],
  spiderqueen: ["poison"],
  butcher: ["physical"],
  worm: ["physical", "cursed-hp"],
  oculothorax: [],
  kobold: [],
  skeletontemplar: ["poison", "cold"],
  skeletontemplar2: ["magic", "flame"],
  ghost: [],
  skeleton4: [],
  wraith2: ["spectral"],
  skeletonberserker: ["physical"],
  skeletonarcher: [],
  shaman: [],
  deathangel: ["spectral", "cursed-hp"],
};

export const mobResistance = {
  cowking: {
    lightningResistance: 100,
    flameResistance: 20,
  },
  minotaur: {
    magicResistance: 80,
    flameResistance: 100,
    lightningResistance: 100,
  },
  rat3: {
    poisonResistance: 100,
  },
  wraith2: {
    magicResistance: 30,
    flameResistance: 50,
    lightningResistance: 60,
    coldResistance: 30,
  },
  ghost: {
    magicResistance: 60,
    flameResistance: 20,
    lightningResistance: 30,
    coldResistance: 30,
  },
  skeleton4: {
    lightningResistance: 65,
    coldResistance: 45,
  },
  mage: {
    magicResistance: 50,
    flameResistance: 50,
    lightningResistance: 50,
    coldResistance: 50,
    poisonResistance: 50,
  },
  spider: {
    poisonResistance: 100,
  },
  spider2: {
    magicResistance: 100,
  },
  spiderqueen: {
    magicResistance: 50,
    flameResistance: 60,
    lightningResistance: 70,
    coldResistance: 25,
    poisonResistance: 100,
  },
  butcher: {
    magicResistance: 50,
    flameResistance: 100,
    lightningResistance: 70,
    coldResistance: 25,
    poisonResistance: 40,
  },
  snake3: {
    poisonResistance: 100,
  },
  snake4: {
    flameResistance: 100,
  },
  oculothorax: {
    magicResistance: 40,
    flameResistance: 100,
    lightningResistance: 80,
    coldResistance: 40,
  },
  kobold: {
    magicResistance: 40,
    flameResistance: 60,
    lightningResistance: 80,
    coldResistance: 20,
  },
  skeletonberserker: {
    magicResistance: 40,
    flameResistance: 45,
    lightningResistance: 50,
    coldResistance: 55,
    poisonResistance: 40,
  },
  skeletonarcher: {
    magicResistance: 40,
    flameResistance: 45,
    lightningResistance: 50,
    coldResistance: 55,
    poisonResistance: 40,
  },
  skeletontemplar: {
    magicResistance: 80,
    flameResistance: 80,
    lightningResistance: 80,
    coldResistance: 80,
    poisonResistance: 100,
  },
  skeletontemplar2: {
    magicResistance: 100,
    flameResistance: 80,
    lightningResistance: 80,
    coldResistance: 80,
    poisonResistance: 80,
  },
  shaman: {
    magicResistance: 60,
    flameResistance: 60,
    lightningResistance: 30,
    coldResistance: 30,
    poisonResistance: 30,
  },
  worm: {
    magicResistance: 70,
    flameResistance: 55,
    lightningResistance: 60,
    coldResistance: 60,
    poisonResistance: 40,
  },
  deathangel: {
    magicResistance: 100,
    flameResistance: 100,
    lightningResistance: 100,
    coldResistance: 100,
    poisonResistance: 100,
  },
};

const DefaultResistances: Resistances = {
  magicResistance: 0,
  flameResistance: 0,
  lightningResistance: 0,
  coldResistance: 0,
  poisonResistance: 0,
  spectralResistance: 0,
};

export const resistanceToDisplayMap = {
  magicResistance: "magic",
  flameResistance: "flame",
  lightningResistance: "lightning",
  coldResistance: "cold",
  poisonResistance: "poison",
  spectralResistance: "spectral",
};

export const enchantToDisplayMap = {
  magic: "magic enchanted",
  flame: "flame enchanted",
  lightning: "lightning enchanted",
  cold: "cold enchanted",
  poison: "poison enchanted",
  spectral: "spectral hit",
  physical: "extra strong",
  stoneskin: "stone skin",
  "cursed-hp": "health cursed",
};

const resistanceToLowerResistanceMap = {
  magicResistance: "lowerMagicResistance",
  flameResistance: "lowerFlameResistance",
  lightningResistance: "lowerLightningResistance",
  coldResistance: "lowerColdResistance",
  poisonResistance: "lowerPoisonResistance",
  spectralResistance: "lowerSpectralResistance",
};

export const elements: Elements[] = ["magic", "flame", "lightning", "cold", "poison", "spectral"];

export const getRandomElement = (): Elements => _.shuffle(elements)[0];

export const calculateResistance = (resistance: number) =>
  resistance > PLAYER_MAX_RESISTANCES ? PLAYER_MAX_RESISTANCES : resistance;

export const calculateAttackSpeed = (attackSpeed: number) =>
  attackSpeed > PLAYER_MAX_ATTACK_SPEED ? PLAYER_MAX_ATTACK_SPEED : attackSpeed;

export const calculateExtraGold = (extraGold: number) =>
  extraGold > PLAYER_MAX_EXTRA_GOLD ? PLAYER_MAX_EXTRA_GOLD : extraGold;

export const calculateMagicFind = (magicFind: number) =>
  magicFind > PLAYER_MAX_MAGIC_FIND ? PLAYER_MAX_MAGIC_FIND : magicFind;

export const getResistance = (
  mob: { kind: number; name: string; type: string; bonus: Resistances; resistances: Resistances },
  attacker,
) => {
  let resistances = { ...DefaultResistances };

  if (mob.type === "mob") {
    resistances = Object.assign(resistances, mob.resistances || {});
  } else if (mob.type === "player") {
    resistances = {
      magicResistance: mob.bonus.magicResistance,
      flameResistance: mob.bonus.flameResistance,
      lightningResistance: mob.bonus.lightningResistance,
      coldResistance: mob.bonus.coldResistance,
      poisonResistance: mob.bonus.poisonResistance,
    };
  }

  if (attacker?.type === "player") {
    resistances = calculateLowerResistances(resistances, attacker.bonus);
  }

  return resistances;
};

export const calculateLowerResistances = (resistances, bonus) => {
  return Object.keys(resistances).reduce((acc, resistance) => {
    acc[resistance] =
      resistances[resistance] - (bonus[resistanceToLowerResistanceMap[resistance]] || 0) - bonus.lowerAllResistance;

    if (acc[resistance] < 0) {
      acc[resistance] = 0;
    }

    return acc;
  }, {});
};
