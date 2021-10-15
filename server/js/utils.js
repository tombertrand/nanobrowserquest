const sanitizer = require("sanitizer");
const Types = require("../../shared/js/gametypes");
const BigNumber = require("bignumber.js");
const Utils = {};

module.exports = Utils;

Utils.sanitize = function (string) {
  // Strip unsafe tags, then escape as html entities.
  return sanitizer.escape(sanitizer.sanitize(string));
};

Utils.random = function (range) {
  return Math.floor(Math.random() * range);
};

Utils.randomRange = function (min, max) {
  return min + Math.random() * (max - min);
};

Utils.randomInt = function (min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
};

Utils.clamp = function (min, max, value) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
};

Utils.randomOrientation = function () {
  var o,
    r = Utils.random(4);

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

Utils.Mixin = function (target, source) {
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

Utils.distanceTo = function (x, y, x2, y2) {
  var distX = Math.abs(x - x2),
    distY = Math.abs(y - y2);

  return distX > distY ? distX : distY;
};

Utils.NaN2Zero = function (num) {
  if (isNaN(num * 1)) {
    return 0;
  } else {
    return num * 1;
  }
};

Utils.trueFalse = function (bool) {
  return bool === "true" ? true : false;
};

Utils.rawToRai = raw => {
  const value = new BigNumber(raw.toString());
  return value.shiftedBy(30 * -1).toNumber();
};

Utils.raiToRaw = rai => {
  const value = new BigNumber(rai.toString());
  return value.shiftedBy(30).toNumber();
};

const achievementToNanoMap = {
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

Utils.getMaxPayoutAmount = () => {
  let amount = 0;
  let payouts = Object.values(achievementToNanoMap);
  payouts.map(payout => {
    amount += payout;
  });

  return new BigNumber(amount).dividedBy(100000).toFixed();
};

Utils.getPayoutAmount = achievements => {
  let amount = 0;
  let payouts = Object.values(achievementToNanoMap);
  achievements.map((completed, index) => {
    if (completed) {
      amount += payouts[index];
    }
  });

  return Utils.raiToRaw(new BigNumber(amount).dividedBy(100000).toFixed());
};

Utils.isValidUpgradeItems = items => {
  if (items.length !== 2) {
    return false;
  }

  const [item, level] = items[0].split(":");
  const isWeapon = Types.isWeapon(item);
  const isArmor = Types.isArmor(item);
  const isBelt = Types.isBelt(item);
  const isRing = Types.isRing(item);

  if ((!isWeapon && !isArmor && !isBelt && !isRing) || level === 10) {
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

Utils.isUpgradeSuccess = level => {
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
  const successRate = successRates[parseInt(level) - 1];
  const random = Utils.randomInt(1, 100);

  log.info(`Random ${random}, Success rate: ${successRate} -> ${random <= successRate ? "SUCCESS" : "FAILURE"}`);

  return random <= successRate;
};
