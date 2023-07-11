import _ from "lodash";

import { toArray } from "../utils";

export const isRune = function (kindOrString: number | string) {
  if (typeof kindOrString === "number") {
    return RuneByKind[kindOrString];
  } else {
    return kindOrString?.startsWith("rune");
  }
};

export const RUNE = {
  SAT: 161,
  AL: 162,
  BUL: 163,
  NAN: 164,
  MIR: 165,
  GEL: 166,
  DO: 167,
  BAN: 168,
  VIE: 169,
  UM: 170,
  HEX: 171,
  ZAL: 172,
  SOL: 173,
  ETH: 174,
  BTC: 175,
  VAX: 176,
  POR: 177,
  LAS: 178,
  DUR: 179,
  FAL: 180,
  KUL: 181,
  MER: 182,
  QUA: 183,
  GUL: 184,
  BER: 185,
  CHAM: 186,
  TOR: 187,
  XNO: 188,
  JAH: 189,
  SHI: 190,
  VOD: 191,
};

export const runeKind = {
  sat: {
    rank: 1,
    requirement: 1,
    attribute: {
      health: 10,
    },
  },
  al: {
    rank: 2,
    requirement: 2,
    attribute: {
      minDamage: 4,
    },
  },
  bul: {
    rank: 3,
    requirement: 3,
    attribute: {
      maxDamage: 4,
    },
  },
  nan: {
    rank: 4,
    requirement: 4,
    attribute: {
      magicDamage: 4,
    },
  },
  mir: {
    rank: 5,
    requirement: 6,
    attribute: {
      attackDamage: 4,
    },
  },
  gel: {
    rank: 6,
    requirement: 8,
    attribute: {
      absorbedDamage: 4,
    },
  },
  do: {
    rank: 7,
    requirement: 10,
    attribute: {
      defense: 4,
    },
  },
  ban: {
    rank: 8,
    requirement: 12,
    attribute: {
      exp: 4,
    },
  },
  vie: {
    rank: 9,
    requirement: 14,
    attribute: {
      regenerateHealth: 10,
    },
  },
  um: {
    rank: 10,
    requirement: 16,
    attribute: {
      flameDamage: 10,
    },
  },
  hex: {
    rank: 11,
    requirement: 18,
    attribute: {
      lightningDamage: 5,
    },
  },
  zal: {
    rank: 12,
    requirement: 20,
    attribute: {
      pierceDamage: 5,
    },
  },
  sol: {
    rank: 13,
    requirement: 22,
    attribute: {
      reduceFrozenChance: 5,
    },
  },
  eth: {
    rank: 14,
    requirement: 24,
    attribute: {
      poisonDamage: 10,
    },
  },
  btc: {
    rank: 15,
    requirement: 26,
    attribute: {
      magicResistance: 10,
    },
  },
  vax: {
    rank: 16,
    requirement: 28,
    attribute: {
      flameResistance: 10,
    },
  },
  por: {
    rank: 17,
    requirement: 30,
    attribute: {
      lightningResistance: 10,
    },
  },
  las: {
    rank: 18,
    requirement: 32,
    attribute: {
      coldResistance: 10,
    },
  },
  dur: {
    rank: 19,
    requirement: 34,
    attribute: {
      allResistance: 4,
    },
  },
  fal: {
    rank: 20,
    requirement: 36,
    attribute: {
      magicDamagePercent: 8,
    },
  },
  kul: {
    rank: 21,
    requirement: 38,
    attribute: {
      lightningDamagePercent: 8,
    },
  },
  mer: {
    rank: 22,
    requirement: 41,
    attribute: {
      flameDamagePercent: 8,
    },
  },
  qua: {
    rank: 23,
    requirement: 44,
    attribute: {
      coldDamagePercent: 8,
    },
  },
  gul: {
    rank: 24,
    requirement: 47,
    attribute: {
      poisonDamagePercent: 8,
    },
  },
  ber: {
    rank: 25,
    requirement: 50,
    attribute: {
      skillTimeout: 6,
    },
  },
  cham: {
    rank: 26,
    requirement: 53,
    attribute: {
      poisonResistance: 10,
    },
  },
  tor: {
    rank: 27,
    requirement: 56,
    attribute: {
      coldDamage: 10,
      freezeChance: 5,
    },
  },
  xno: {
    rank: 28,
    requirement: 59,
    attribute: {
      attackSpeed: 10,
    },
  },
  jah: {
    rank: 29,
    requirement: 62,
    attribute: {
      magicFind: 6,
    },
  },
  shi: {
    rank: 30,
    requirement: 65,
    attribute: {
      allResistance: 8,
    },
  },
  vod: {
    rank: 31,
    requirement: 68,
    attribute: {
      regenerateHealth: 10,
      preventRegenerateHealth: 10,
    },
  },
};

export const RuneByKind = Object.entries(RUNE).reduce((acc, [name, kind]: [string, number]) => {
  acc[kind] = name.toLowerCase();
  return acc;
}, {});

export const RuneList = Object.keys(RUNE).map(rune => rune.toLowerCase());

export const getRuneNameFromItem = (rankOrString: number | string) => {
  let rune;

  if (typeof rankOrString === "string") {
    [, rune] = rankOrString.split(":")[0].split("-");
  } else if (typeof rankOrString === "number") {
    rune = RuneList[rankOrString - 1];
  }

  return rune;
};

export const getRuneFromItem = (rankOrString: number | string) => {
  const rune = getRuneNameFromItem(rankOrString);

  return runeKind[rune];
};

export const getJewelRequirement = function (bonus) {
  let requirement = 4;

  if (bonus.length >= 5) {
    requirement = 60;
  } else if (bonus.length === 4) {
    requirement = 45;
  } else if (bonus.length === 3) {
    requirement = 25;
  } else if (bonus.length === 2) {
    requirement = 8;
  }

  return requirement;
};

export const getJewelSkinIndex = function (level) {
  let index = "";
  if (level === 3) {
    index = "1";
  } else if (level === 4) {
    index = "2";
  } else if (level === 5) {
    index = "3";
  }

  return index;
};

export const getHighestSocketRequirement = (rawSocket: any[]) => {
  let requirement = 1;
  for (let i = 0; i < rawSocket.length; i++) {
    if (!rawSocket[i]) continue;

    let rawRequirement = 1;
    if (typeof rawSocket[i] === "number") {
      ({ requirement: rawRequirement } = runeKind[RuneList[rawSocket[i] - 1]]);
    } else if (typeof rawSocket[i] === "string") {
      const [, , rawBonus] = rawSocket[i].split("|");
      rawRequirement = getJewelRequirement(toArray(rawBonus));
    }

    if (rawRequirement > requirement) {
      requirement = rawRequirement;
    }
  }
  return requirement;
};

export const getRune = function (rawRune: string) {
  if (!rawRune || !RuneList.includes(getRuneNameFromItem(rawRune))) return;

  const rune = getRuneFromItem(rawRune);
  // const bonus: { type: string; stats: number; description: string }[] = Object.entries(rune.attribute).map(
  //   ([type, stats]: [string, number]) => {
  //     return {
  //       type,
  //       stats,
  //       description: Types.getBonusDescriptionMap[Types.bonusType.findIndex(t => t === type)].replace("#", stats),
  //     };
  //   },
  // );

  return rune;
};

export const getRunesBonus = function (runes: (number | string)[]) {
  const attributes = {};

  _.forEach(runes, kind => {
    if (!kind || typeof kind !== "number") return;

    const rune = getRuneFromItem(kind);
    Object.entries(rune.attribute).map(([type, stats]: [string, number]) => {
      if (!attributes[type]) {
        attributes[type] = 0;
      }

      attributes[type] += stats;
    });
  });

  return attributes;
};

export const getRunewordBonus = ({
  isUnique,
  socket,
  type,
}: {
  isUnique: boolean;
  socket: number[];
  type: "weapon" | "armor" | "shield";
}) => {
  let runeword;
  let runewordBonus;
  let wordSocket;

  if (!isUnique && socket?.length && !socket.some(s => s === 0 || typeof s !== "number")) {
    wordSocket = socket.map(s => RuneList[s - 1]).join("-");
    ({ name: runeword, bonus: runewordBonus } = Runewords[type]?.[wordSocket] || {});
  }

  return { runeword, runewordBonus, wordSocket: runeword ? wordSocket : null };
};

export const Runewords = {
  weapon: {
    "al-sat-mir-nan": {
      name: "Sub Second Confirmation",
      bonus: {
        health: 20,
        minDamage: 8,
        magicDamage: 6,
        attackDamage: 6,
      },
    },
    "mir-do-bul": {
      name: "Decentralizer",
      bonus: {
        maxDamage: 12,
        magicDamage: 10,
        attackDamage: 4,
      },
    },
    "mir-bul-al-bul-mir": {
      name: "Smart contract",
      bonus: {
        attackDamage: 12,
        maxDamage: 12,
        minDamage: 6,
      },
    },
    "bul-um-al-bul-mir-zal": {
      name: "Lightweight Node",
      bonus: {
        attackDamage: 6,
        flameDamage: 12,
        pierceDamage: 10,
        minDamage: 6,
        maxDamage: 12,
      },
    },
    "ban-nan-mir-al-btc": {
      name: "Buy the dip",
      bonus: {
        minDamage: 10,
        attackDamage: 10,
        magicDamage: 10,
        magicResistance: 15,
        exp: 10,
      },
    },
    "do-um-hex-do-zal-mer": {
      name: "Block blade",
      bonus: {
        defense: 18,
        attackDamage: 13,
        flameDamage: 20,
        flameDamagePercent: 15,
        flameResistance: 35,
        regenerateHealth: 25,
      },
    },
    "las-bul-mir-tor-al-vie": {
      name: "Cold Wallet",
      bonus: {
        health: 80,
        minDamage: 25,
        attackDamage: 20,
        coldDamage: 40,
        freezeChance: 15,
        coldResistance: 35,
        regenerateHealth: 15,
      },
    },
    "las-tor-qua-tor-jah-vie": {
      name: "Cold Wallet 2.0",
      bonus: {
        health: 100,
        minDamage: 25,
        attackDamage: 25,
        coldDamage: 40,
        freezeChance: 25,
        reduceFrozenChance: 15,
        coldDamagePercent: 18,
        coldResistance: 35,
        regenerateHealth: 25,
      },
    },
    "bul-mir-zal-um-vax": {
      name: "Hot Wallet",
      bonus: {
        maxDamage: 15,
        attackDamage: 15,
        flameDamage: 20,
        flameResistance: 15,
        pierceDamage: 10,
      },
    },
    "ber-gul-cham-eth-eth": {
      name: "Living Whitepaper",
      bonus: {
        attackDamage: 15,
        poisonDamage: 35,
        poisonResistance: 20,
        poisonDamagePercent: 20,
        skillTimeout: 20,
        pierceDamage: 20,
      },
    },
    "fal-btc-xno-zal-xno-fal": {
      name: "Can't the devs do something",
      bonus: {
        minDamage: 10,
        attackDamage: 15,
        magicDamagePercent: 30,
        allResistance: 20,
        attackSpeed: 18,
        pierceDamage: 20,
        criticalHit: 8,
      },
    },
    "mer-qua-vod-mer-kul-fal": {
      name: "ASIC",
      bonus: {
        attackDamage: 20,
        coldDamage: 20,
        coldDamagePercent: 15,
        criticalHit: 10,
        regenerateHealth: 30,
        allResistance: 15,
        preventRegenerateHealth: 20,
      },
    },
    "jah-shi-tor-qua-zal": {
      name: "Not a Security",
      bonus: {
        attackDamage: 15,
        coldDamage: 25,
        coldDamagePercent: 20,
        pierceDamage: 20,
        freezeChance: 15,
        allResistance: 18,
        magicFind: 25,
      },
    },
  },
  armor: {
    "um-hex-sol-zal-btc-fal": {
      name: "Dandelion++",
      bonus: {
        health: 60,
        defense: 20,
        flameDamage: 20,
        pierceDamage: 10,
        magicResistance: 20,
        lightningResistance: 15,
        reduceFrozenChance: 15,
      },
    },
    "do-las-sol-vod-jah-por": {
      name: "Melon Tusk",
      bonus: {
        defense: 20,
        magicFind: 15,
        lightningResistance: 10,
        regenerateHealth: 20,
        preventRegenerateHealth: 20,
        coldResistance: 10,
        reduceFrozenChance: 20,
      },
    },
    "eth-btc-xno": {
      name: "EIP-1559",
      bonus: {
        defense: 15,
        absorbedDamage: 20,
        magicResistance: 30,
        poisonResistance: 30,
        poisonDamage: 20,
      },
    },
    "btc-bul-sol-gel-do": {
      name: "SHA-256",
      bonus: {
        defense: 20,
        absorbedDamage: 5,
        reduceFrozenChance: 20,
        coldResistance: 30,
        maxDamage: 15,
      },
    },
    "vie-do-dur-las-vax-cham": {
      name: "Double Spend",
      bonus: {
        exp: 10,
        health: 120,
        defense: 18,
        allResistance: 20,
        reduceFrozenChance: 20,
      },
    },
    "eth-sol-zal-hex": {
      name: "Web3",
      bonus: {
        exp: 10,
        defense: 20,
        magicDamage: 20,
        magicResistance: 30,
        magicDamagePercent: 20,
      },
    },
    "nan-btc-fal-ban": {
      name: "Know Your Customer",
      bonus: {
        exp: 15,
        defense: 20,
        magicDamage: 20,
        magicResistance: 30,
        magicDamagePercent: 20,
      },
    },
    "btc-btc-btc-btc-btc-btc": {
      name: "The Maxi",
      bonus: {
        maxDamage: 15,
        health: 100,
        defense: 30,
        allResistance: 20,
      },
    },
    "um-mer-por-um-jah-mer": {
      name: "The Validator",
      bonus: {
        defense: 20,
        flameDamage: 40,
        flameResistance: 20,
        flameDamagePercent: 15,
        magicFind: 15,
      },
    },
    "ban-por-kul-por-hex-ber": {
      name: "Jungle Gorilla",
      bonus: {
        defense: 15,
        lightningDamage: 20,
        lightningResistance: 35,
        lightningDamagePercent: 20,
        skillTimeout: 15,
      },
    },
    "qua-ban-tor-qua-las-tor": {
      name: "Not Your Key Not Your Crypto",
      bonus: {
        defense: 20,
        coldDamage: 40,
        coldResistance: 30,
        coldDamagePercent: 15,
        freezeChance: 20,
      },
    },
    "eth-eth-gul-cham-vie-gul": {
      name: "Growing Seed",
      bonus: {
        regenerateHealth: 25,
        defense: 30,
        poisonDamage: 50,
        poisonResistance: 40,
        poisonDamagePercent: 25,
      },
    },
    "shi-do-vod-jah-ber-gel": {
      name: "Fortune Favors The Brave",
      bonus: {
        defense: 20,
        absorbedDamage: 15,
        allResistance: 18,
        regenerateHealth: 30,
        preventRegenerateHealth: 20,
        magicFind: 20,
        skillTimeout: 20,
      },
    },
    "btc-fal-dur-nan-shi-sat": {
      name: "Bucketing System",
      bonus: {
        health: 120,
        defense: 20,
        magicDamage: 25,
        magicDamagePercent: 20,
        allResistance: 15,
        magicResistance: 25,
        lowerMagicResistance: 15,
      },
    },
    "um-shi-dur-mer-vax-sat": {
      name: "Ascending Bootstrapping",
      bonus: {
        health: 100,
        defense: 25,
        flameDamage: 25,
        flameDamagePercent: 20,
        allResistance: 15,
        flameResistance: 25,
        lowerFlameResistance: 15,
      },
    },
    "kul-shi-hex-por-sat-kul": {
      name: "Announcement of an Announcement",
      bonus: {
        health: 60,
        defense: 20,
        lightningDamage: 30,
        lightningDamagePercent: 20,
        allResistance: 15,
        lightningResistance: 25,
        lowerLightningResistance: 15,
      },
    },
    "sol-las-qua-las-qua-shi": {
      name: "What if Price Goes Below 2K",
      bonus: {
        defense: 20,
        coldDamage: 25,
        coldDamagePercent: 20,
        allResistance: 15,
        coldResistance: 35,
        lowerColdResistance: 15,
        freezeChance: 15,
        reduceFrozenChance: 35,
      },
    },
    "eth-shi-gul-eth-sat-gul": {
      name: "Let that sink in for a Second",
      bonus: {
        health: 120,
        defense: 25,
        poisonDamage: 25,
        poisonDamagePercent: 20,
        allResistance: 15,
        poisonResistance: 25,
        lowerPoisonResistance: 25,
      },
    },
  },
  shield: {
    "gel-bul-al-sat-do": {
      name: "Pump and Dump",
      bonus: {
        health: 60,
        defense: 10,
        absorbedDamage: 10,
        attackDamage: 6,
        minDamage: 6,
      },
    },
    "vie-nan-al-mir-um-ban": {
      name: "Confirmations Per Second",
      bonus: {
        exp: 10,
        minDamage: 12,
        attackDamage: 10,
        flameDamage: 15,
        regenerateHealth: 20,
        magicDamage: 10,
      },
    },
    "vie-ban-do-vie-ban-do": {
      name: "King Gorilla",
      bonus: {
        minDamage: 8,
        attackDamage: 10,
        defense: 25,
        health: 180,
        regenerateHealth: 30,
      },
    },
    "sol-btc-vie-por-fal-vie": {
      name: "Open Representative Voting",
      bonus: {
        reduceFrozenChance: 20,
        magicResistance: 20,
        lightningResistance: 25,
        regenerateHealth: 40,
        magicDamagePercent: 20,
      },
    },
    "sol-btc-um-las-sat": {
      name: "Ordinals",
      bonus: {
        defense: 30,
        lightningResistance: 25,
        coldResistance: 25,
        regenerateHealth: 25,
        flameDamagePercent: 18,
      },
    },
    "zal-hex-fal-btc-eth-bul": {
      name: "Fear and Greed index",
      bonus: {
        health: 60,
        defense: 20,
        absorbedDamage: 15,
        attackDamage: 15,
        minDamage: 15,
      },
    },
    "dur-sat-do-dur-las-gul": {
      name: "Satoshi's Original Vision",
      bonus: {
        health: 180,
        defense: 30,
        poisonDamage: 20,
        poisonResistance: 35,
        allResistance: 20,
        regenerateHealth: 25,
      },
    },
    "jah-shi-xno-ber-vod-gul": {
      name: "Echo Chamber",
      bonus: {
        health: 160,
        defense: 35,
        magicDamage: 15,
        flameDamage: 15,
        lightningDamage: 15,
        coldDamage: 15,
        poisonDamage: 15,
        magicFind: 25,
        skillTimeout: 15,
        allResistance: 20,
      },
    },
  },
};

// XNO is not a Security
// Sharding
// Mesh network
