export const setBonus = {
  immortal: {
    health: 110,
    minDamage: 35,
    maxDamage: 15,
    attackDamage: 15,
    pierceDamage: 25,
    allResistance: 15,
  },
  paladin: {
    health: 150,
    defense: 25,
    absorbedDamage: 20,
    preventRegenerateHealth: 10,
    allResistance: 15,
  },
  mystical: {
    defense: 15,
    attackDamage: 15,
    magicDamage: 20,
    poisonDamage: 20,
    allResistance: 12,
    magicFind: 20,
  },
  demon: {
    flameDamage: 40,
    drainLife: 18,
    lightningResistance: 30,
    flameResistance: 50,
    health: 120,
    attackSpeed: 20,
  },
  moon: {
    defense: 12,
    pierceDamage: 25,
    health: 120,
    skillTimeout: 20,
    allResistance: 12,
    attackSpeed: 20,
  },
  dragon: {
    minDamage: 25,
    attackDamage: 25,
    defense: 25,
    health: 50,
    flameResistance: 50,
    magicResistance: 35,
  },
  templar: {
    minDamage: 20,
    attackDamage: 10,
    health: 50,
    defense: 25,
    allResistance: 15,
  },
  executioner: {
    attackDamage: 25,
    maxDamage: 45,
    minDamage: 20,
    exp: 15,
    allResistance: 15,
  },
  emerald: {
    attackDamage: 20,
    defense: 20,
    poisonDamage: 35,
    poisonResistance: 35,
    allResistance: 15,
  },
  minotaur: {
    minDamage: 15,
    coldDamage: 15,
    reduceFrozenChance: 25,
    coldResistance: 50,
  },
  diamond: {
    health: 100,
    attackDamage: 15,
    defense: 25,
    blockChance: 5,
    exp: 10,
  },
  sapphire: {
    minDamage: 15,
    maxDamage: 15,
    attackDamage: 5,
    defense: 15,
    criticalHit: 3,
  },
  horned: {
    minDamage: 12,
    maxDamage: 12,
    attackDamage: 12,
    defense: 5,
    exp: 10,
  },
  frozen: {
    minDamage: 10,
    attackDamage: 10,
    coldDamage: 10,
    absorbedDamage: 10,
  },
  golden: {
    magicDamage: 15,
    defense: 10,
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
  blueaxe: "frozen",
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
  executionersword: "executioner",
  beltexecutioner: "executioner",
  shieldexecutioner: "executioner",
  dragonsword: "dragon",
  dragonarmor: "dragon",
  shielddragon: "dragon",
  moonsword: "moon",
  moonarmor: "moon",
  beltmoon: "moon",
  shieldmoon: "moon",
  amuletmoon: "moon",
  demonaxe: "demon",
  demonarmor: "demon",
  beltdemon: "demon",
  shielddemon: "demon",
  amuletdemon: "demon",
  mysticalsword: "mystical",
  mysticalarmor: "mystical",
  beltmystical: "mystical",
  shieldmystical: "mystical",
  ringmystical: "mystical",
  paladinaxe: "paladin",
  paladinarmor: "paladin",
  shieldpaladin: "paladin",
  beltpaladin: "paladin",
  beltimmortal: "immortal",
  immortalsword: "immortal",
  immortalarmor: "immortal",
  immortalring: "immortal",
  shieldimmortal: "immortal",
};

export const setItems = {
  immortal: ["immortalsword", "immortalarmor", "immortalring", "shieldimmortal", "beltimmortal"],
  paladin: ["paladinaxe", "paladinarmor", "shieldpaladin", "beltpaladin"],
  mystical: ["mysticalsword", "mysticalarmor", "beltmystical", "shieldmystical", "ringmystical"],
  demon: ["demonaxe", "demonarmor", "beltdemon", "shielddemon", "amuletdemon"],
  moon: ["moonsword", "moonarmor", "beltmoon", "shieldmoon", "amuletmoon"],
  dragon: ["dragonsword", "dragonarmor", "shielddragon"],
  templar: ["templarsword", "templararmor", "belttemplar", "shieldtemplar"],
  executioner: ["executionersword", "beltexecutioner", "shieldexecutioner"],
  emerald: ["emeraldsword", "emeraldarmor", "beltemerald", "shieldemerald"],
  minotaur: ["minotauraxe", "ringminotaur", "beltminotaur"],
  diamond: ["diamondsword", "diamondarmor", "beltdiamond", "shielddiamond"],
  sapphire: ["frozensword", "frozenarmor", "beltfrozen", "shieldfrozen"],
  horned: ["hornedarmor", "belthorned", "shieldhorned"],
  frozen: [["bluemorningstar", "blueaxe"], "bluearmor", "shieldblue"],
  golden: ["goldensword", "goldenarmor", "shieldgolden"],
  ruby: ["redsword", "redarmor", "shieldred"],
  plated: ["platearmor", "beltplated", "shieldplate"],
  leather: ["leatherarmor", "beltleather", "shieldwood"],
};

export const setItemsNameMap = {
  immortal: ["Sword", "Armor", "Belt", "Shield", "Ring"],
  paladin: ["Axe", "Armor", "Belt", "Shield"],
  mystical: ["Sword", "Armor", "Belt", "Shield", "Ring"],
  demon: ["Axe", "Armor", "Belt", "Shield", "Amulet"],
  moon: ["Sword", "Armor", "Belt", "Shield", "Amulet"],
  dragon: ["Sword", "Armor", "Shield"],
  templar: ["Sword", "Armor", "Belt", "Shield"],
  executioner: ["Sword", "Belt", "Shield"],
  emerald: ["Sword", "Armor", "Belt", "Shield"],
  minotaur: ["Axe", "Ring", "Belt"],
  diamond: ["Sword", "Armor", "Belt", "Shield"],
  sapphire: ["Sword", "Armor", "Belt", "Shield"],
  horned: ["Armor", "Belt", "Shield"],
  frozen: ["Axe or Morningstar", "Armor", "Shield"],
  golden: ["Sword", "Armor", "Shield"],
  ruby: ["Sword", "Armor", "Shield"],
  plated: ["Armor", "Belt", "Shield"],
  leather: ["Armor", "Belt", "Shield"],
};
