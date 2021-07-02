var sanitizer = require("sanitizer");
var Types = require("../../shared/js/gametypes");
var BigNumber = require("bignumber.js");
var Utils = {};

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
  A_TRUE_WARRIOR: 10,
  INTO_THE_WILD: 10,
  ANGRY_RATS: 15,
  SMALL_TALK: 5,
  FAT_LOOT: 15,
  UNDERGROUND: 15,
  AT_WORLDS_END: 15,
  COWARD: 15,
  TOMB_RAIDER: 15,
  SKULL_COLLECTOR: 25,
  NINJA_LOOT: 15,
  NO_MANS_LAND: 10,
  HUNTER: 25,
  STILL_ALIVE: 10,
  MEATSHIELD: 15,
  HOT_SPOT: 5,
  HERO: 100,
  FOXY: 15,
  FOR_SCIENCE: 15,
  RICKROLLD: 15,
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
