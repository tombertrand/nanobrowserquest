import _ from "lodash";

import { toArray, } from "../utils";

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
  CHAM: 179,
  DUR: 180,
  XNO: 181,
  FAL: 182,
  KUL: 183,
  MER: 184,
  QUA: 185,
  GUL: 186,
  BER: 187,
  TOR: 188,
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
    rank: 13,
    requirement: 22,
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
    rank: 9,
    requirement: 14,
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
  cham: {
    rank: 19,
    requirement: 34,
    attribute: {
      poisonResistance: 10,
    },
  },
  dur: {
    rank: 20,
    requirement: 36,
    attribute: {
      physicalResistance: 10,
    },
  },
  xno: {
    rank: 21,
    requirement: 38,
    attribute: {
      attackSpeed: 10,
    },
  },
  fal: {
    rank: 22,
    requirement: 41,
    attribute: {
      magicDamagePercent: 10,
    },
  },
  kul: {
    rank: 23,
    requirement: 44,
    attribute: {
      lightningDamagePercent: 10,
    },
  },
  mer: {
    rank: 24,
    requirement: 47,
    attribute: {
      flameDamagePercent: 10,
    },
  },
  qua: {
    rank: 25,
    requirement: 50,
    attribute: {
      coldDamagePercent: 10,
    },
  },
  gul: {
    rank: 26,
    requirement: 53,
    attribute: {
      poisonDamagePercent: 10,
    },
  },
  ber: {
    rank: 27,
    requirement: 56,
    attribute: {
      skillTimeout: 8,
    },
  },
  tor: {
    rank: 28,
    requirement: 59,
    attribute: {
      coldDamage: 2,
      freezeChance: 5,
    },
  },
  jah: {
    rank: 29,
    requirement: 62,
    attribute: {
      magicFind: 10,
    },
  },
  shi: {
    rank: 30,
    requirement: 65,
    attribute: {
      allResistance: 10,
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

  if (!isUnique && socket?.length && !socket.some(s => s === 0 || typeof s !== "number")) {
    const wordSocket = socket.map(s => RuneList[s - 1]).join("-");
    ({ name: runeword, bonus: runewordBonus } = Runewords[type]?.[wordSocket] || {});
  }

  return { runeword, runewordBonus };
};

export const Runewords = {
  weapon: {
    "al-sat-mir-nan": {
      name: "Sub Second Cormirmation",
      bonus: {
        health: 20,
        minDamage: 8,
        magicDamage: 6,
        attackDamage: 6,
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
    "las-tor-mir-tor-mir-al-vie": {
      name: "Cold Wallet",
      bonus: {
        minDamage: 10,
        attackDamage: 20,
        coldDamage: 30,
        freezeChance: 15,
        coldResistance: 15,
        regenerateHealth: 25,
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
    "ber-gul-cham-eth-eth": {
      name: "Living Whitepaper",
      bonus: {
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
        magicDamagePercent: 30,
        magicResistance: 20,
        attackSpeed: 30,
        pierceDamage: 20,
        criticalHit: 8,
      },
    },
    "mer-qua-vod-mer-kul-fal": {
      name: "ASIC",
      bonus: {
        attackDamage: 20,
        allResistances: 30,
        criticalHit: 8,
        regenerateHealth: 30,
        preventRegenerateHealth: 20,
      },
    },
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

// Confirmations Per Second
// Open Representative Voting