var Utils = require("./utils");

var Formulas = {};

Formulas.dmg = function (weaponLevel, armorLevel) {
  var dealt = weaponLevel * Utils.randomInt(5, 10);
  var absorbed = armorLevel * Utils.randomInt(1, 3);
  var dmg = dealt - absorbed;

  //console.log("abs: "+absorbed+"   dealt: "+ dealt+"   dmg: "+ (dealt - absorbed));
  if (dmg <= 0) {
    return Utils.randomInt(0, 3);
  } else {
    return dmg;
  }
};

Formulas.hp = function (armorLevel, playerLevel) {
  const baseHp = 60;
  const armorHp = (armorLevel - 1) * 15;
  const playerLevelHp = playerLevel * 6;

  return baseHp + armorHp + playerLevelHp;
};

if (typeof exports !== "undefined") {
  module.exports = Formulas;
}
