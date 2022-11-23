export const setBonus = {
  emerald: {
    attackDamage: 15,
    defense: 10,
    poisonDamage: 20,
    allResistance: 15,
  },
  templar: {
    minDamage: 15,
    attackDamage: 10,
    defense: 10,
    allResitance: 20,
  },
  executioner: {
    attackDamage: 20,
    maxDamage: 40,
    exp: 15,
    allResitance: 25,
  },
  dragon: {
    minDamage: 15,
    attackDamage: 10,
    defense: 10,
    allResitance: 20,
  },
  demon: {
    flameDamage: 30,
    drainLife: 20,
    lightningResistance: 20,
    flameResistance: 20,
    attackSpeed: 20,
  },
  mystical: {
    minDamage: 15,
    reduceFrozenChance: 25,
    attackDamage: 15,
    magicDamage: 20,
    poisonDamage: 20,
    allResitance: 10,
    magicFind: 20,
  },
  moon: {
    pierceDamage: 20,
    allResitance: 10,
    preventRegenerateHealth: 10,
    skillTimeout: 20,
    attackSpeed: 20,
  },
  minotaur: {
    minDamage: 15,
    coldDamage: 15,
    reduceFrozenChance: 25,
  },
  diamond: {
    health: 100,
    defense: 10,
    blockChance: 3,
    exp: 10,
  },
  sapphire: {
    minDamage: 10,
    maxDamage: 10,
    defense: 10,
    criticalHit: 3,
  },
  horned: {
    minDamage: 10,
    maxDamage: 10,
    attackDamage: 10,
  },
  frozen: {
    attackDamage: 10,
    coldDamage: 10,
    absorbedDamage: 10,
  },
  golden: {
    magicDamage: 10,
    defense: 6,
    criticalHit: 6,
  },
  ruby: {
    health: 30,
    attackDamage: 6,
    defense: 6,
  },
  plated: {
    health: 25,
    attackDamage: 4,
    defense: 4,
  },
  leather: {
    minDamage: 3,
    maxDamage: 3,
    health: 20,
  },
};

export const kindAsStringToSet = {
  leatherarmor: "leather",
  beltleather: "leather",
  shieldwood: "leather",
  platearmor: "plated",
  beltplated: "plated",
  shieldplate: "plated",
  redsword: "ruby",
  redarmor: "ruby",
  shieldred: "ruby",
  goldensword: "golden",
  goldenarmor: "golden",
  shieldgolden: "golden",
  bluemorningstar: "frozen",
  bluearmor: "frozen",
  shieldblue: "frozen",
  hornedarmor: "horned",
  belthorned: "horned",
  shieldhorned: "horned",
  frozensword: "sapphire",
  frozenarmor: "sapphire",
  beltfrozen: "sapphire",
  shieldfrozen: "sapphire",
  diamondsword: "diamond",
  diamondarmor: "diamond",
  beltdiamond: "diamond",
  shielddiamond: "diamond",
  minotauraxe: "minotaur",
  beltminotaur: "minotaur",
  ringminotaur: "minotaur",
  emeraldsword: "emerald",
  emeraldarmor: "emerald",
  beltemerald: "emerald",
  shieldemerald: "emerald",
  templarsword: "templar",
  templararmor: "templar",
  belttemplar: "templar",
  shieldtemplar: "templar",
  mysticalsword: "mystical",
  mysticalarmor: "mystical",
  beltmystical: "mystical",
  shieldmystical: "mystical",
  ringmystical: "mystical",
  executionersword: "executioner",
  executionerarmor: "executioner",
  beltexecutioner: "executioner",
  shieldexecutioner: "executioner",
  dragonsword: "dragon",
  dragonarmor: "dragon",
  dragonshield: "dragon",
  demonaxe: "demon",
  demonarmor: "demon",
  beltdemon: "demon",
  shielddemon: "demon",
  amuletdemon: "demon",
  moonsword: "moon",
  moonarmor: "moon",
  beltmoon: "moon",
  shieldmoon: "moon",
  amuletmoon: "moon",
};

export const setItems = {
  moon: ["moonsword", "moonarmor", "beltmoon", "shieldmoon", "amuletmoon"],
  mystical: ["mysticalsword", "mysticalarmor", "beltmystical", "shieldmystical", "ringmystical"],
  demon: ["demonaxe", "demonarmor", "beltdemon", "shielddemon", "amuletdemon"],
  dragon: ["dragonsword", "dragonarmor", "shielddragon"],
  executioner: ["executionersword", "executionerarmor", "beltexecutioner", "shieldexecutioner"],
  templar: ["templarsword", "templararmor", "belttemplar", "shieldtemplar"],
  emerald: ["emeraldsword", "emeraldarmor", "beltemerald", "shieldemerald"],
  minotaur: ["minotauraxe", "ringminotaur", "beltminotaur"],
  diamond: ["diamondsword", "diamondarmor", "beltdiamond", "shielddiamond"],
  sapphire: ["frozensword", "frozenarmor", "beltfrozen", "shieldfrozen"],
  horned: ["hornedarmor", "belthorned", "shieldhorned"],
  frozen: ["bluemorningstar", "bluearmor", "shieldblue"],
  golden: ["goldensword", "goldenarmor", "shieldgolden"],
  ruby: ["redsword", "redarmor", "shieldred"],
  plated: ["platearmor", "beltplated", "shieldplate"],
  leather: ["leatherarmor", "beltleather", "shieldwood"],
};

export const setItemsNameMap = {
  moon: ["Sword", "Armor", "Belt", "Shield", "Amulet"],
  mystical: ["Sword", "Armor", "Belt", "Shield", "Ring"],
  demon: ["Axe", "Armor", "Belt", "Shield", "Amulet"],
  dragon: ["Sword", "Armor", "Shield"],
  executioner: ["Sword", "Armor", "Belt", "Shield"],
  templar: ["Sword", "Armor", "Belt", "Shield"],
  emerald: ["Sword", "Armor", "Belt", "Shield"],
  minotaur: ["Axe", "Ring", "Belt"],
  diamond: ["Sword", "Armor", "Belt", "Shield"],
  sapphire: ["Sword", "Armor", "Belt", "Shield"],
  horned: ["Armor", "Belt", "Shield"],
  frozen: ["Morningstar", "Armor", "Shield"],
  golden: ["Sword", "Armor", "Shield"],
  ruby: ["Sword", "Armor", "Shield"],
  plated: ["Armor", "Belt", "Shield"],
  leather: ["Armor", "Belt", "Shield"],
};