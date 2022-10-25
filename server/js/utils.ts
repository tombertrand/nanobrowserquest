import BigNumber from "bignumber.js";
import forEach from "lodash/forEach";
import sanitizer from "sanitizer";

import { Types } from "../../shared/js/gametypes";
import { Recipes } from "./types";

import type { Network } from "./types";

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

  // console.log("~~~~runeClass", runeClass);
  // console.log("~~~~scrollClass", scrollClass);
  // console.log("~~~~runeRank", runeRank);
  // console.log("~~~~runeQuantity", runeQuantity);

  if (runeClass !== scrollClass || !runeRank) return false;
  if (runeRank >= 24) return false;
  if (runeRank < 10 && runeQuantity !== 3) return false;
  if (runeRank >= 10 && runeQuantity !== 2) return false;

  return runeRank;
};

export const isValidSocketItem = items => {
  if (items.length !== 2) {
    return false;
  }

  const runeIndex = items.findIndex(item => item.startsWith("rune-"));
  const itemIndex = items.findIndex(item => !item.startsWith("rune-"));

  const [item, level, bonus, rawSocket, skill] = items[itemIndex].split(":");

  let socket;
  try {
    socket = JSON.parse(rawSocket);
  } catch (err) {
    return false;
  }

  if (
    runeIndex === -1 ||
    itemIndex === -1 ||
    !Types.isSocketItem(item) ||
    !socket?.length ||
    !socket.filter(slot => slot === 0).length
  ) {
    return false;
  }

  const { rank } = Types.getRuneFromItem(items[runeIndex]);

  if (!rank) {
    return false;
  }

  const socketIndex = socket.findIndex(s => s === 0);
  socket[socketIndex] = rank;

  const newItem = [item, level, bonus, JSON.stringify(socket), skill].join(":");

  // console.log("~~~~~", newItem);
  // console.log("~~~~rank", rank);
  // console.log("~~~~item", item);
  // console.log("~~~~socket", socket);

  return newItem;
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

  const [item, , bonus] = items[0].split(":");
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

export const getRandomSockets = ({ kind, baseLevel }) => {
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
  } else if (maxSockets === 3) {
    if (randomSocket < 3) {
      socketCount = 3;
    } else if (randomSocket < 10) {
      socketCount = 2;
    } else if (randomSocket < 25) {
      socketCount = 1;
    }
  }

  return new Array(socketCount).fill(0);
};
