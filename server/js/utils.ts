import BigNumber from "bignumber.js";
import * as _ from "lodash";
import forEach from "lodash/forEach";
import sanitizer from "sanitizer";

import { Types } from "../../shared/js/gametypes";
import { RuneList } from "../../shared/js/types/rune";

export const sanitize = function (string) {
  // Strip unsafe tags, then escape as html entities.
  return sanitizer.escape(sanitizer.sanitize(string));
};

export const random = function (range) {
  return Math.floor(Math.random() * range);
};

export const randomRange = function (min, max) {
  return min + Math.random() * (max - min);
};

export const randomInt = function (min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
};

export const clamp = function (min, max, value) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
};

export const randomOrientation = function () {
  var o,
    r = random(4);

  if (r === 0) {
    o = Types.Orientations.LEFT;
  }
  if (r === 1) {
    o = Types.Orientations.RIGHT;
  }
  if (r === 2) {
    o = Types.Orientations.UP;
  }
  if (r === 3) {
    o = Types.Orientations.DOWN;
  }

  return o;
};

export const Mixin = function (target, source) {
  if (source) {
    for (var key, keys = Object.keys(source), l = keys.length; l--; ) {
      key = keys[l];

      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};

export const distanceTo = function (x, y, x2, y2) {
  var distX = Math.abs(x - x2),
    distY = Math.abs(y - y2);

  return distX > distY ? distX : distY;
};

export const NaN2Zero = function (num) {
  if (isNaN(num * 1)) {
    return 0;
  } else {
    return num * 1;
  }
};

export const trueFalse = function (bool) {
  return bool === "true" ? true : false;
};

export const rawToRai = (raw, network: Network) => {
  const decimals = network === "nano" ? 30 : 29;
  const value = new BigNumber(raw.toString());
  return value.shiftedBy(decimals * -1).toNumber();
};

export const raiToRaw = (rai, network: Network) => {
  const decimals = network === "nano" ? 30 : 29;
  const value = new BigNumber(rai.toString());
  return value.shiftedBy(decimals).toNumber();
};

const NANO_PAYOUT_MULTIPLIER = 10;
const BAN_PAYOUT_MULTIPLIER = 10;

const classicAchievementMap = {
  nano: {
    A_TRUE_WARRIOR: 3 * NANO_PAYOUT_MULTIPLIER,
    INTO_THE_WILD: 2 * NANO_PAYOUT_MULTIPLIER, // -> Required
    ANGRY_RATS: 5 * NANO_PAYOUT_MULTIPLIER,
    SMALL_TALK: 3 * NANO_PAYOUT_MULTIPLIER,
    FAT_LOOT: 5 * NANO_PAYOUT_MULTIPLIER,
    UNDERGROUND: 3 * NANO_PAYOUT_MULTIPLIER,
    AT_WORLDS_END: 5 * NANO_PAYOUT_MULTIPLIER,
    COWARD: 4 * NANO_PAYOUT_MULTIPLIER,
    TOMB_RAIDER: 5 * NANO_PAYOUT_MULTIPLIER,
    SKULL_COLLECTOR: 8 * NANO_PAYOUT_MULTIPLIER,
    NINJA_LOOT: 4 * NANO_PAYOUT_MULTIPLIER,
    NO_MANS_LAND: 3 * NANO_PAYOUT_MULTIPLIER, // -> Required
    HUNTER: 4 * NANO_PAYOUT_MULTIPLIER,
    STILL_ALIVE: 5 * NANO_PAYOUT_MULTIPLIER,
    MEATSHIELD: 7 * NANO_PAYOUT_MULTIPLIER,
    NYAN: 3 * NANO_PAYOUT_MULTIPLIER,
    HOT_SPOT: 3 * NANO_PAYOUT_MULTIPLIER, // -> Required
    SPECTRE_COLLECTOR: 8 * NANO_PAYOUT_MULTIPLIER,
    GEM_HUNTER: 8 * NANO_PAYOUT_MULTIPLIER,
    NANO_POTIONS: 8 * NANO_PAYOUT_MULTIPLIER,
    HERO: 25 * NANO_PAYOUT_MULTIPLIER, // -> Required
    FOXY: 2 * NANO_PAYOUT_MULTIPLIER,
    FOR_SCIENCE: 4 * NANO_PAYOUT_MULTIPLIER,
    RICKROLLD: 6 * NANO_PAYOUT_MULTIPLIER,
  },
  ban: {
    A_TRUE_WARRIOR: 75 * BAN_PAYOUT_MULTIPLIER,
    INTO_THE_WILD: 50 * BAN_PAYOUT_MULTIPLIER, // -> Required
    ANGRY_RATS: 125 * BAN_PAYOUT_MULTIPLIER,
    SMALL_TALK: 75 * BAN_PAYOUT_MULTIPLIER,
    FAT_LOOT: 125 * BAN_PAYOUT_MULTIPLIER,
    UNDERGROUND: 75 * BAN_PAYOUT_MULTIPLIER,
    AT_WORLDS_END: 125 * BAN_PAYOUT_MULTIPLIER,
    COWARD: 100 * BAN_PAYOUT_MULTIPLIER,
    TOMB_RAIDER: 125 * BAN_PAYOUT_MULTIPLIER,
    SKULL_COLLECTOR: 200 * BAN_PAYOUT_MULTIPLIER,
    NINJA_LOOT: 100 * BAN_PAYOUT_MULTIPLIER,
    NO_MANS_LAND: 75 * BAN_PAYOUT_MULTIPLIER, // -> Required
    HUNTER: 100 * BAN_PAYOUT_MULTIPLIER,
    STILL_ALIVE: 125 * BAN_PAYOUT_MULTIPLIER,
    MEATSHIELD: 175 * BAN_PAYOUT_MULTIPLIER,
    NYAN: 75 * BAN_PAYOUT_MULTIPLIER,
    HOT_SPOT: 75 * BAN_PAYOUT_MULTIPLIER, // -> Required
    SPECTRE_COLLECTOR: 200 * BAN_PAYOUT_MULTIPLIER,
    GEM_HUNTER: 200 * BAN_PAYOUT_MULTIPLIER,
    NANO_POTIONS: 200 * BAN_PAYOUT_MULTIPLIER,
    HERO: 625 * BAN_PAYOUT_MULTIPLIER, // -> Required
    FOXY: 50 * BAN_PAYOUT_MULTIPLIER,
    FOR_SCIENCE: 100 * BAN_PAYOUT_MULTIPLIER,
    RICKROLLD: 150 * BAN_PAYOUT_MULTIPLIER,
  },
};

const networkDividerMap = {
  nano: 100000,
  ban: 10000,
};

const calculateMaxPayout = (payouts, network) => {
  let amount = 0;

  payouts.map(payout => {
    amount += payout;
  });

  return new BigNumber(amount).dividedBy(networkDividerMap[network]).toFixed();
};

export const getClassicMaxPayout = (network: Network) => {
  return calculateMaxPayout(Object.values(classicAchievementMap[network]), network);
};

const getPayout = (achievements, payouts, network: Network) => {
  let amount = 0;

  achievements.map((completed, index) => {
    if (completed && payouts[index]) {
      amount += payouts[index];
    }
  });

  return raiToRaw(new BigNumber(amount).dividedBy(networkDividerMap[network]).toFixed(), network);
};

export const getClassicPayout = (achievements, network: Network) => {
  return getPayout(achievements, Object.values(classicAchievementMap[network]), network);
};

export const getRandomAttackSkill = () => _.shuffle([0, 1, 2, 3, 4]).slice(0, 1);

export const isValidAddWeaponSkill = items => {
  if (items.length !== 1) {
    return false;
  }

  let [item, level, bonus, socket, skill] = items[0].split(":");
  if (!Types.isWeapon(item) || Types.getKindFromString(item) < Types.Entities.GOLDENSWORD || skill) {
    return false;
  }

  if (!bonus) {
    bonus = JSON.stringify([]);
  }
  if (!socket) {
    socket = JSON.stringify([]);
  }

  skill = getRandomAttackSkill();

  return [item, level, bonus, socket, skill].join(":");
};

export const isValidUpgradeItems = items => {
  if (items.length !== 2) {
    return false;
  }

  const [item, level] = items[0].split(":");
  const isWeapon = Types.isWeapon(item);
  const isArmor = Types.isArmor(item);
  const isBelt = Types.isBelt(item);
  const isCape = Types.isCape(item);
  const isShield = Types.isShield(item);
  const isRing = Types.isRing(item);
  const isAmulet = Types.isAmulet(item);

  if ((!isWeapon && !isArmor && !isBelt && !isCape && !isShield && !isRing && !isAmulet) || parseInt(level) === 10) {
    return false;
  }

  const [scroll] = items[1].split(":");
  const isScroll = Types.isScroll(scroll) && scroll.startsWith("scrollupgrade");

  if (!isScroll) {
    return false;
  }

  const itemClass = Types.getItemClass(item, parseInt(level));
  const scrollClass = Types.getItemClass(scroll);

  if (itemClass !== scrollClass) {
    return false;
  }

  return true;
};

export const isUpgradeSuccess = ({ level, isLuckySlot, isBlessed }) => {
  // Upgrade success rate
  // +1 -> +2, 100%
  // +2 -> +3, 100%
  // +3 -> +4, 90%
  // +4 -> +5, 80%
  // +5 -> +6, 55%
  // +6 -> +7, 30%
  // +7 -> +8, 7%
  // +8 -> +9, 4%
  // +9 -> +10, 1%
  const successRates = Types.getUpgradeSuccessRates();
  let successRate = successRates[parseInt(level) - 1];
  let random = randomInt(1, 100);

  console.info(`Base Success rate ${successRate}`);

  if (isLuckySlot) {
    const luckyRates = Types.getLuckySlotSuccessRateBonus();
    const bonusRate = luckyRates[parseInt(level) - 1];
    successRate += bonusRate;
    console.info(`Lucky slot bonus rate ${bonusRate} granted, new success rate ${successRate}`);
  }

  if (isBlessed) {
    const blessedRates = Types.getBlessedSuccessRateBonus();
    const blessedRate = blessedRates[parseInt(level) - 1];
    successRate += blessedRate;
    console.info(`Blessed rate ${blessedRate} granted, new success rate ${successRate}`);
  }

  console.info(`Random ${random}, Success rate: ${successRate} -> ${random <= successRate ? "SUCCESS" : "FAILURE"}`);

  return { isSuccess: random <= successRate, random, successRate };
};

export const isValidTransmuteItems = items => {
  if (items.length !== 2) {
    return false;
  }

  let [item, , bonus] = items[0].split(":");

  const transmuteRate = Types.getTransmuteSuccessRate(item, bonus);
  if (!transmuteRate) {
    return false;
  }

  const [scroll] = items[1].split(":");
  const isScroll = scroll === "scrolltransmute";
  if (!isScroll) {
    return false;
  }

  return transmuteRate;
};

export const getIsTransmuteSuccess = ({ transmuteSuccessRate = 0, uniqueSuccessRate = 0, isLuckySlot }) => {
  let random = randomInt(1, 100);

  if (isLuckySlot) {
    transmuteSuccessRate = Math.ceil(transmuteSuccessRate * 1.25);
    uniqueSuccessRate = Math.ceil(uniqueSuccessRate * 1.25);
  }

  const isTransmuteSuccess = random <= transmuteSuccessRate;
  const isUniqueSuccess = random <= uniqueSuccessRate;

  console.info(
    `Random ${random}, Transmute success rate: ${transmuteSuccessRate} -> ${
      random <= transmuteSuccessRate ? "SUCCESS" : "FAILURE"
    }`,
  );
  console.info(
    `Random ${random}, Unique Transmute success rate: ${uniqueSuccessRate} -> ${
      random <= uniqueSuccessRate ? "SUCCESS" : "FAILURE"
    }`,
  );

  return {
    random,
    transmuteSuccessRate,
    uniqueSuccessRate,
    ...(transmuteSuccessRate ? { isTransmuteSuccess } : null),
    ...(uniqueSuccessRate ? { isUniqueSuccess } : null),
  };
};

export const isValidRecipe = items => {
  const recipes: { [key in Recipes]: string[] } = {
    cowLevel: ["wirtleg", "skeletonkingcage", "necromancerheart"],
    minotaurLevel: ["cowkinghorn"],
    chestblue: ["chestblue"],
  };

  const result = Object.entries(recipes).find(([_recipe, formulae]) => {
    if (formulae.length !== items.length) return;

    for (let i = 0; i < items.length; i++) {
      const [item] = items[i].split(":");
      const index = formulae.indexOf(item);

      if (index === -1) break;

      // @ts-ignore
      formulae[index] = false;
    }

    if (formulae.filter(Boolean).length === 0) return true;
  });

  if (result) {
    return result[0] as Recipes;
  }
};

export const generateBlueChestItem = (): { item: string; uniqueChances?: number } => {
  // 50%
  const items = [
    { item: "hornedarmor", uniqueChances: 40 },
    { item: "belthorned", uniqueChances: 40 },
    { item: "shieldhorned", uniqueChances: 30 },
    { item: "frozenarmor", uniqueChances: 40 },
    { item: "beltfrozen", uniqueChances: 40 },
    { item: "shieldfrozen", uniqueChances: 25 },
    { item: "frozensword", uniqueChances: 40 },
    { item: "diamondsword", uniqueChances: 20 },
    { item: "diamondarmor", uniqueChances: 20 },
    { item: "beltdiamond", uniqueChances: 20 },
    { item: "shielddiamond", uniqueChances: 15 },
    { item: "beltminotaur", uniqueChances: 10 },
    { item: "minotauraxe", uniqueChances: 10 },
    { item: "cape", uniqueChances: 5 },
  ];

  // 40%
  const scrolls = [{ item: "scrollupgradehigh" }, { item: "scrollupgradeblessed" }, { item: "scrolltransmute" }];

  // 10%
  const ringOrAmulets = [
    { item: "ringraistone" },
    { item: "ringfountain" },
    { item: "ringminotaur" },
    { item: "amuletfrozen" },
  ];

  const randomCategory = random(100);
  let category: any = items;

  if (randomCategory < 10) {
    category = ringOrAmulets;
  } else if (randomCategory < 50) {
    category = scrolls;
  }

  const randomItem = random(category.length);

  return category[randomItem];
};

export const getRandomSockets = ({ kind, baseLevel, isLuckySlot = false }) => {
  let maxSockets = baseLevel < 10 ? 4 : 6;
  if (Types.isBelt(kind)) {
    maxSockets = 0;
  }

  const randomSocket = random(100);

  // 1% -> 6
  // 3% -> 5
  // 6% -> 4
  // 15% -> 3
  // 20% -> 2
  // 20% -> 1
  // 35% -> 0
  let socketCount = 0;
  if (maxSockets === 6) {
    if (randomSocket < 1) {
      socketCount = 6;
    } else if (randomSocket < 4) {
      socketCount = 5;
    } else if (randomSocket < 10) {
      socketCount = 4;
    } else if (randomSocket < 25) {
      socketCount = 3;
    } else if (randomSocket < 45) {
      socketCount = 2;
    } else if (randomSocket < 65) {
      socketCount = 1;
    }
    if (isLuckySlot && socketCount !== 6) {
      socketCount += 1;
    }
  } else if (maxSockets === 4) {
    if (randomSocket < 3) {
      socketCount = 4;
    } else if (randomSocket < 10) {
      socketCount = 3;
    } else if (randomSocket < 25) {
      socketCount = 2;
    } else if (randomSocket < 45) {
      socketCount = 1;
    }
    if (isLuckySlot && socketCount !== 4) {
      socketCount += 1;
    }
  } else if (maxSockets === 3) {
    if (randomSocket < 3) {
      socketCount = 3;
    } else if (randomSocket < 10) {
      socketCount = 2;
    } else if (randomSocket < 25) {
      socketCount = 1;
    }
    if (isLuckySlot && socketCount !== 3) {
      socketCount += 1;
    }
  }

  return new Array(socketCount).fill(0);
};

export const isValidUpgradeRunes = items => {
  if (items.length < 3 || items.length > 4) {
    return false;
  }

  let rune = "";
  let runeRank = 0;
  let runeQuantity = 0;
  let runeClass = null;
  let scrollClass = null;

  forEach(items, item => {
    const [scrollOrRune] = item.split(":");

    if (!scrollOrRune.startsWith("scrollupgrade") && !scrollOrRune.startsWith("rune")) return false;
    if (scrollOrRune.startsWith("scrollupgrade")) {
      if (scrollClass) return false;
      scrollClass = Types.getItemClass(scrollOrRune);
    } else {
      if (!rune) {
        rune = scrollOrRune;
        runeRank = Types.getRuneFromItem(scrollOrRune).rank;
        runeClass = Types.getItemClass(scrollOrRune);
      } else if (scrollOrRune !== rune) {
        return false;
      }
      runeQuantity += 1;
    }
  });

  if (runeClass !== scrollClass || !runeRank) return false;
  if (runeRank > 30) return false;
  if (runeRank < 18 && runeQuantity !== 3) return false;
  if (runeRank >= 18 && runeQuantity !== 2) return false;

  return runeRank;
};

export const isValidSocketItem = items => {
  if (items.length !== 2) {
    return false;
  }

  const runeIndex = items.findIndex(item => item.startsWith("rune-"));
  const jewelIndex = items.findIndex(item => item.startsWith("jewel"));
  const itemIndex = items.findIndex(item => !item.startsWith("rune-"));

  const [item, level, bonus, rawSocket, skill] = items[itemIndex].split(":");

  let socket;
  try {
    socket = JSON.parse(rawSocket);
  } catch (err) {
    return false;
  }

  if (
    (runeIndex === -1 && jewelIndex === -1) ||
    itemIndex === -1 ||
    !Types.isSocketItem(item) ||
    !socket?.length ||
    !socket.filter(slot => slot === 0).length
  ) {
    return false;
  }

  const socketIndex = socket.findIndex(s => s === 0);

  if (runeIndex >= 0) {
    const { rank } = Types.getRuneFromItem(items[runeIndex]);
    if (!rank) {
      return false;
    }
    socket[socketIndex] = rank;
  } else if (jewelIndex >= 0) {
    socket[socketIndex] = items[jewelIndex];
  }

  const newItem = [item, level, bonus, JSON.stringify(socket), skill].filter(Boolean).join(":");

  return newItem;
};

export const isValidStoneSocket = (items, isLuckySlot) => {
  if (items.length !== 2) {
    return false;
  }

  const stoneIndex = items.findIndex(item => item.startsWith("stone"));
  const itemIndex = items.findIndex(item => !item.startsWith("stone"));

  const [item, level, bonus, rawSocket, skill] = items[itemIndex].split(":");

  let socket;
  let extractedItem;
  let socketCount;
  try {
    socket = JSON.parse(rawSocket);
  } catch (err) {
    // no socket, silence error
  }

  if (
    stoneIndex === -1 ||
    itemIndex === -1 ||
    !Types.isSocketItem(item) ||
    (socket?.length && !socket.filter(slot => slot !== 0).length)
  ) {
    return false;
  }

  if (!socket?.length) {
    const kind = Types.getKindFromString(item);
    const baseLevel = Types.getBaseLevel(kind);

    socket = getRandomSockets({ kind, baseLevel, isLuckySlot });
    socketCount = socket.length;
  } else {
    let lastSocketIndex = socket.findIndex(i => i === 0);
    if (lastSocketIndex === -1) {
      lastSocketIndex = socket.length;
    }
    extractedItem = random(2) ? socket[lastSocketIndex - 1] : null;

    socket[lastSocketIndex - 1] = 0;
  }

  const socketItem = [item, level, bonus || "[]", JSON.stringify(socket), skill].filter(Boolean).join(":");

  // Convert back to rune
  if (extractedItem && typeof extractedItem === "number") {
    const runeName = Types.RuneList[extractedItem - 1];
    extractedItem = { item: `rune-${runeName}`, quantity: 1 };
  }

  return { socketItem, extractedItem, socketCount };
};

export const getRandomJewelLevel = (mobLevel: number) => {
  let maxLevel = 1;
  if (mobLevel >= 60) {
    maxLevel = 5;
  } else if (mobLevel >= 45) {
    maxLevel = 4;
  } else if (mobLevel >= 30) {
    maxLevel = 3;
  } else if (mobLevel >= 15) {
    maxLevel = 2;
  }

  const randomNumber = random(100);

  // 5% -> 5
  // 45% -> 4
  // 15% -> 3
  // 20% -> 2
  // 20% -> 1
  // 35% -> 0
  let level = 1;
  if (maxLevel === 5) {
    if (randomNumber < 5) {
      level = 5;
    } else if (randomNumber < 55) {
      level = 4;
    } else {
      level = 3;
    }
  } else if (maxLevel === 4) {
    if (randomNumber < 20) {
      level = 4;
    } else if (randomNumber < 60) {
      level = 3;
    } else {
      level = 2;
    }
  } else if (maxLevel === 3) {
    if (randomNumber < 40) {
      level = 3;
    } else if (randomNumber < 80) {
      level = 2;
    } else {
      level = 1;
    }
  } else if (maxLevel === 2) {
    if (randomNumber < 60) {
      level = 3;
    } else {
      level = 1;
    }
  }

  return level;
};

export const getRandomRuneLevel = (mobLevel: number) => {
  let maxLevel = Math.floor(mobLevel / 2);
  let minLevel = 1;
  if (maxLevel > RuneList.length) {
    maxLevel = RuneList.length;
  }
  if (mobLevel < 20) {
    maxLevel += 5;
  }

  minLevel = maxLevel - 15;
  if (minLevel < 1) {
    minLevel = 1;
  }

  const level = Math.floor(randn_bm(minLevel, maxLevel, 2.5));

  return level;
};

function randn_bm(min, max, skew) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
  else {
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
  }
  return num;
}
