import _ from "lodash";

export const RUNE = {
  SAT: 161,
  AL: 162,
  BUL: 163,
  NAN: 164,
  MIR: 165,
  GEL: 166,
  DO: 167,
  BAN: 168,
  SOL: 169,
  UM: 170,
  HEX: 171,
  ZAL: 172,
  VIE: 173,
  ETH: 174,
  BTC: 175,
  VAX: 176,
  POR: 177,
  LAS: 178,
  CHAM: 179,
  XNO: 180,
  FAL: 181,
  KUL: 182,
  MER: 183,
  QUA: 184,
  GUL: 185,
  BER: 186,
  TOR: 187,
  JAH: 188,
  VOD: 189,
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
  sol: {
    rank: 9,
    requirement: 14,
    attribute: {
      reduceFrozenChance: 5,
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
      pierceDamage: 10,
    },
  },
  vie: {
    rank: 13,
    requirement: 22,
    attribute: {
      regenerateHealth: 10,
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
    requirement: 27,
    attribute: {
      magicResistance: 10,
    },
  },
  vax: {
    rank: 16,
    requirement: 30,
    attribute: {
      flameResistance: 10,
    },
  },
  por: {
    rank: 17,
    requirement: 33,
    attribute: {
      lightningResistance: 10,
    },
  },
  las: {
    rank: 18,
    requirement: 36,
    attribute: {
      coldResistance: 10,
    },
  },
  cham: {
    rank: 19,
    requirement: 39,
    attribute: {
      poisonResistance: 10,
    },
  },
  xno: {
    rank: 20,
    requirement: 42,
    attribute: {
      attackSpeed: 10,
    },
  },
  fal: {
    rank: 21,
    requirement: 45,
    attribute: {
      magicDamagePercent: 10,
    },
  },
  kul: {
    rank: 22,
    requirement: 48,
    attribute: {
      lightningDamagePercent: 10,
    },
  },
  mer: {
    rank: 23,
    requirement: 51,
    attribute: {
      flameDamagePercent: 10,
    },
  },
  qua: {
    rank: 24,
    requirement: 54,
    attribute: {
      coldDamagePercent: 10,
    },
  },
  gul: {
    rank: 25,
    requirement: 57,
    attribute: {
      poisonDamagePercent: 10,
    },
  },
  ber: {
    rank: 26,
    requirement: 60,
    attribute: {
      skillTimeout: 10,
    },
  },
  tor: {
    rank: 27,
    requirement: 63,
    attribute: {
      coldDamage: 2,
      freezeChance: 5,
    },
  },
  jah: {
    rank: 28,
    requirement: 66,
    attribute: {
      magicFind: 10,
    },
  },
  vod: {
    rank: 29,
    requirement: 69,
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

export const getHighestSocketRequirement = (rawSocket: number[]) => {
  const highestRank = [...rawSocket].sort((a, b) => b - a)[0];
  if (!highestRank) return;

  const { requirement } = Object.values<{ rank: number; requirement: number }>(runeKind)[highestRank - 1];
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

export const getRunesBonus = function (runes: number[]) {
  const attributes = {};

  _.forEach(runes, kind => {
    if (!kind) return;
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

  if (!isUnique && socket?.length && !socket.some(s => s === 0)) {
    const wordSocket = socket.map(s => RuneList[s - 1]).join("-");
    ({ name: runeword, bonus: runewordBonus } = Runewords[type]?.[wordSocket] || {});
  }

  return { runeword, runewordBonus };
};

// minDamage
// maxDamage
// attackDamage
// health
// magicDamage
// defense
// absorb
// exp
// regenerateHealth
// criticalHit
// blockChance
// magicFind
// attackSpeed
// drainLife
// flameDamage
// lightningDamage
// pierceDamage
// highHealth
// coldDamage
// freezeChance
// reduceFrozenChance
// magicResistance
// flameResistance
// lightningResistance
// coldResistance
// poisonResistance

export const Runewords = {
  weapon: {
    "ban-nan-mir-al-btc": {
      name: "Buy the dip",
      bonus: {
        minDamage: 25,
        attackDamage: 10,
        magicDamage: 10,
        magicResistance: 15,
        exp: 10,
      },
    },
    "las-tor-mir": {
      name: "Cold Wallet",
      bonus: {
        attackDamage: 15,
        coldDamage: 25,
        freezeChance: 10,
        coldResistance: 15,
      },
    },
    "bul-mir-zal-um-vax": {
      name: "Hot Wallet",
      bonus: {
        maxDamage: 10,
        attackDamage: 15,
        flameDamage: 20,
        flameResistance: 15,
        pierceDamage: 10,
      },
    },
    // "": {
    //   name: "ASIC",
    //   bonus: {
    //     pierceDamage: 10,
    //   },
    // },
  },
  armor: {
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
    // ethbtcxno: {
    //   name: "EIP-1559",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "SHA-256",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "Double Spend",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "Echo Chamber",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "Know Your Customer",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "Growing Seed",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "The Validator",
    //   bonus: {},
    // },
    // ethbtcxno: {
    //   name: "Not Your Key Not Your Crypto",
    //   bonus: {},
    // },
  },
  shield: {},
};

// Living Whitepaper
// Smart contract
// Open Representative Voting
// Lightweight Node
// Sub Second Cormirmation
// Confirmations Per Second
