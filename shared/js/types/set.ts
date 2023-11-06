export const setBonus = {
  pumpkin: {
    magicFind: 12,
    extraGold: 12,
  },
  immortal: {
    health: 60,
    minDamage: 25,
    maxDamage: 10,
    attackDamage: 10,
    pierceDamage: 25,
    absorbedDamage: 20,
    allResistance: 15,
    attackSpeed: 10,
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
    minDamage: 10,
    flameDamage: 30,
    drainLife: 16,
    lightningResistance: 30,
    flameResistance: 50,
    health: 120,
    attackSpeed: 20,
  },
  moon: {
    minDamage: 10,
    defense: 10,
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
    flameDamade: 50,
  },
  templar: {
    minDamage: 20,
    attackDamage: 10,
    health: 50,
    defense: 25,
    allResistance: 15,
    attackSpeed: 8,
  },
  executioner: {
    attackDamage: 25,
    maxDamage: 45,
    minDamage: 20,
    exp: 15,
    allResistance: 15,
  },
  emerald: {
    minDamage: 15,
    attackDamage: 24,
    defense: 20,
    poisonDamage: 35,
    poisonResistance: 45,
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
    minDamage: 15,
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
    health: 25,
  },
  golden: {
    minDamage: 10,
    magicDamage: 15,
    health: 20,
    defense: 10,
    criticalHit: 6,
  },
  ruby: {
    minDamage: 6,
    maxDamage: 6,
    health: 30,
    attackDamage: 6,
    defense: 6,
  },
  plated: {
    minDamage: 4,
    maxDamage: 4,
    health: 25,
    attackDamage: 4,
    defense: 4,
  },
  mail: {
    minDamage: 6,
    maxDamage: 6,
    health: 15,
    defense: 4,
  },
  leather: {
    minDamage: 3,
    maxDamage: 3,
    health: 20,
    attack: 4,
    defense: 4,
  },
};

export const kindAsStringToSet = {
  helmleather: "leather",
  leatherarmor: "leather",
  beltleather: "leather",
  shieldwood: "leather",
  helmmail: "mail",
  mailarmor: "mail",
  shieldiron: "mail",
  helmplate: "plated",
  platearmor: "plated",
  beltplated: "plated",
  shieldplate: "plated",
  redsword: "ruby",
  helmred: "ruby",
  redarmor: "ruby",
  shieldred: "ruby",
  goldensword: "golden",
  helmgolden: "golden",
  goldenarmor: "golden",
  shieldgolden: "golden",
  blueaxe: "frozen",
  bluemorningstar: "frozen",
  helmblue: "frozen",
  bluearmor: "frozen",
  shieldblue: "frozen",
  helmhorned: "horned",
  hornedarmor: "horned",
  belthorned: "horned",
  shieldhorned: "horned",
  frozensword: "sapphire",
  helmfrozen: "sapphire",
  frozenarmor: "sapphire",
  beltfrozen: "sapphire",
  shieldfrozen: "sapphire",
  diamondsword: "diamond",
  helmdiamond: "diamond",
  diamondarmor: "diamond",
  beltdiamond: "diamond",
  shielddiamond: "diamond",
  minotauraxe: "minotaur",
  beltminotaur: "minotaur",
  ringminotaur: "minotaur",
  emeraldsword: "emerald",
  helmemerald: "emerald",
  emeraldarmor: "emerald",
  beltemerald: "emerald",
  shieldemerald: "emerald",
  templarsword: "templar",
  helmtemplar: "templar",
  templararmor: "templar",
  belttemplar: "templar",
  shieldtemplar: "templar",
  helmexecutioner: "executioner",
  executionersword: "executioner",
  beltexecutioner: "executioner",
  shieldexecutioner: "executioner",
  dragonsword: "dragon",
  helmdragon: "dragon",
  dragonarmor: "dragon",
  shielddragon: "dragon",
  petdragon: "dragon",
  moonsword: "moon",
  helmmoon: "moon",
  moonarmor: "moon",
  beltmoon: "moon",
  shieldmoon: "moon",
  amuletmoon: "moon",
  demonaxe: "demon",
  eclypsedagger: "demon",
  helmdemon: "demon",
  demonarmor: "demon",
  beltdemon: "demon",
  shielddemon: "demon",
  amuletdemon: "demon",
  mysticalsword: "mystical",
  helmmystical: "mystical",
  mysticalarmor: "mystical",
  beltmystical: "mystical",
  shieldmystical: "mystical",
  ringmystical: "mystical",
  paladinaxe: "paladin",
  helmpaladin: "paladin",
  paladinarmor: "paladin",
  shieldpaladin: "paladin",
  beltpaladin: "paladin",
  beltimmortal: "immortal",
  spikeglaive: "immortal",
  immortalsword: "immortal",
  helmimmortal: "immortal",
  immortalarmor: "immortal",
  immortalring: "immortal",
  shieldimmortal: "immortal",
  ringpumkin: "pumpkin",
  helmpumkin: "pumpkin",
};

export const setItems = {
  pumpkin: ["ringpumkin", "helmpumkin"],
  immortal: [
    ["spikeglaive", "immortalsword"],
    "helmimmortal",
    "immortalarmor",
    "immortalring",
    "shieldimmortal",
    "beltimmortal",
  ],
  paladin: ["paladinaxe", "helmpaladin", "paladinarmor", "shieldpaladin", "beltpaladin"],
  mystical: ["mysticalsword", "helmmystical", "mysticalarmor", "beltmystical", "shieldmystical", "ringmystical"],
  demon: [["demonaxe", "eclypsedagger"], "helmdemon", "demonarmor", "beltdemon", "shielddemon", "amuletdemon"],
  moon: ["moonsword", "helmmoon", "moonarmor", "beltmoon", "shieldmoon", "amuletmoon"],
  dragon: ["dragonsword", "helmdragon", "dragonarmor", "shielddragon","petdragon"],
  templar: ["templarsword", "helmtemplar", "templararmor", "belttemplar", "shieldtemplar"],
  executioner: ["helmexecutioner", "executionersword", "beltexecutioner", "shieldexecutioner"],
  emerald: ["emeraldsword", "helmemerald", "emeraldarmor", "beltemerald", "shieldemerald"],
  minotaur: ["minotauraxe", "ringminotaur", "beltminotaur"],
  diamond: ["diamondsword", "helmdiamond", "diamondarmor", "beltdiamond", "shielddiamond"],
  sapphire: ["frozensword", "helmfrozen", "frozenarmor", "beltfrozen", "shieldfrozen"],
  horned: ["helmhorned", "hornedarmor", "belthorned", "shieldhorned"],
  frozen: [["bluemorningstar", "blueaxe"], "helmblue", "bluearmor", "shieldblue"],
  golden: ["goldensword", "helmgolden", "goldenarmor", "shieldgolden"],
  ruby: ["redsword", "helmred", "redarmor", "shieldred"],
  plated: ["helmplate", "platearmor", "beltplated", "shieldplate"],
  mail: ["helmmail", "mailarmor", "shieldiron"],
  leather: ["helmleather", "leatherarmor", "beltleather", "shieldwood"],
};

export const setItemsNameMap = {
  pumpkin: ["helm", "Ring"],
  immortal: ["Glaive or Sword", "helm", "Armor", "Belt", "Shield", "Ring"],
  paladin: ["Axe", "Helm", "Armor", "Belt", "Shield"],
  mystical: ["Sword", "Helm", "Armor", "Belt", "Shield", "Ring"],
  demon: [["Axe or  Dagger"], "Helm", "Armor", "Belt", "Shield", "Amulet"],
  moon: ["Sword", "Helm", "Armor", "Belt", "Shield", "Amulet"],
  dragon: ["Sword", "Helm", "Armor", "Shield", "pet"],
  templar: ["Sword", "Helm", "Armor", "Belt", "Shield"],
  executioner: ["helm", "Sword", "Belt", "Shield"],
  emerald: ["Sword", "Helm", "Armor", "Belt", "Shield"],
  minotaur: ["Axe", "Ring", "Belt"],
  diamond: ["Sword", "Helm", "Armor", "Belt", "Shield"],
  sapphire: ["Sword", "Helm", "Armor", "Belt", "Shield"],
  horned: ["Helm", "Armor", "Belt", "Shield"],
  frozen: ["Axe or Morningstar", "Helm", "Armor", "Shield"],
  golden: ["Sword", "Helm", "Armor", "Shield"],
  ruby: ["Sword", "Helm", "Armor", "Shield"],
  plated: ["Helm", "Armor", "Belt", "Shield"],
  mail: ["Helm", "Armor", "Shield"],
  leather: ["Helm", "Armor", "Belt", "Shield"],
};
