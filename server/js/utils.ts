import BigNumber from "bignumber.js"
import sanitizer from "sanitizer"

import { Types } from "../../shared/js/gametypes"
import { Recipes } from './types'

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

export const rawToRai = raw => {
  const value = new BigNumber(raw.toString());
  return value.shiftedBy(30 * -1).toNumber();
};

export const raiToRaw = rai => {
  const value = new BigNumber(rai.toString());
  return value.shiftedBy(30).toNumber();
};

const classicAchievementToNanoMap = {
  A_TRUE_WARRIOR: 3,
  INTO_THE_WILD: 2, // -> Required
  ANGRY_RATS: 5,
  SMALL_TALK: 3,
  FAT_LOOT: 5,
  UNDERGROUND: 3,
  AT_WORLDS_END: 5,
  COWARD: 4,
  TOMB_RAIDER: 5,
  SKULL_COLLECTOR: 8,
  NINJA_LOOT: 4,
  NO_MANS_LAND: 3, // -> Required
  HUNTER: 4,
  STILL_ALIVE: 5,
  MEATSHIELD: 7,
  NYAN: 3,
  HOT_SPOT: 3, // -> Required
  SPECTRE_COLLECTOR: 8,
  GEM_HUNTER: 8,
  NANO_POTIONS: 8,
  HERO: 25, // -> Required
  FOXY: 2,
  FOR_SCIENCE: 4,
  RICKROLLD: 6,
};

const expansion1AchievementToNanoMap = {
  XNO: 133, // -> Required
  FREEZING_LANDS: 12, // -> Required
  SKELETON_KEY: 15,
  BLOODLUST: 15,
  SATOSHI: 10,
  WEN: 12,
  INDIANA_JONES: 35,
  MYTH_OR_REAL: 15,
  RIP: 25,
  DEAD_NEVER_DIE: 30,
  WALK_ON_WATER: 10, // -> Required
  GHOSTBUSTERS: 25,
  BLACK_MAGIC: 50, // -> Required
  LUCKY7: 13,
  NOT_SAFU: 20,
  TICKLE_FROM_UNDER: 15,
};

const calculateMaxPayout = payouts => {
  let amount = 0;

  payouts.map(payout => {
    amount += payout;
  });

  return new BigNumber(amount).dividedBy(100000).toFixed();
};

export const getClassicMaxPayout = () => {
  return calculateMaxPayout(Object.values(classicAchievementToNanoMap));
};

export const getExpansion1MaxPayout = () => {
  return calculateMaxPayout(Object.values(expansion1AchievementToNanoMap));
};

const getPayout = (achievements, payouts) => {
  let amount = 0;

  achievements.map((completed, index) => {
    if (completed && payouts[index]) {
      amount += payouts[index];
    }
  });

  return raiToRaw(new BigNumber(amount).dividedBy(100000).toFixed());
};

export const getClassicPayout = achievements => {
  return getPayout(achievements, Object.values(classicAchievementToNanoMap));
};

export const getExpansion1Payout = achievements => {
  return getPayout(achievements, Object.values(expansion1AchievementToNanoMap));
};

export const isValidUpgradeItems = items => {
  if (items.length !== 2) {
    return false;
  }

  const [item, level] = items[0].split(":");
  const isWeapon = Types.isWeapon(item);
  const isArmor = Types.isArmor(item);
  const isBelt = Types.isBelt(item);
  const isRing = Types.isRing(item);
  const isAmulet = Types.isAmulet(item);

  if ((!isWeapon && !isArmor && !isBelt && !isRing && !isAmulet) || parseInt(level) === 10) {
    return false;
  }

  const [scroll, scrollLevel] = items[1].split(":");
  const isScroll = Types.isScroll(scroll);

  if (!isScroll) {
    return false;
  }

  const itemClass = Types.getItemClass(item, parseInt(level));
  const scrollClass = Types.getItemClass(scroll, parseInt(scrollLevel));

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

  return random <= successRate;
};

export const isValidRecipe = items => {
  const recipes: { [key in Recipes]: string[] } = {
    cowLevel: ["wirtleg", "skeletonkingcage", "necromancerheart"],
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