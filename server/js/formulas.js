const Utils = require("./utils");
const Types = require("../../shared/js/gametypes");

const Formulas = {};

module.exports = Formulas;

Formulas.minMaxDamage = function ({
  weapon,
  weaponLevel,
  playerLevel,
  minDamage,
  maxDamage,
  magicDamage,
  weaponDamage,
}) {
  let min =
    Math.ceil((Types.getWeaponDamage(weapon, weaponLevel) + weaponDamage) * 1.2 + playerLevel / 2) +
    Types.getWeaponMagicDamage(weaponLevel) +
    magicDamage +
    minDamage;
  const max =
    Math.ceil((Types.getWeaponDamage(weapon, weaponLevel) + weaponDamage) * 2 + playerLevel / 2) +
    Types.getWeaponMagicDamage(weaponLevel) +
    magicDamage +
    maxDamage;

  if (min > max) {
    min = max;
  }

  return {
    min,
    max,
  };
};

// @NOTE Do proper formula with +1 - +10 armors / weapons
Formulas.dmg = function ({
  weapon,
  weaponLevel,
  playerLevel,
  armorLevel,
  minDamage,
  maxDamage,
  magicDamage,
  weaponDamage,
}) {
  const { min, max } = Formulas.minMaxDamage({
    weapon,
    weaponLevel,
    playerLevel,
    minDamage,
    maxDamage,
    magicDamage,
    weaponDamage,
  });
  const dealt = Utils.randomInt(min, max);
  const absorbed = Math.floor(armorLevel * Utils.randomInt(2, 4));
  const dmg = dealt - absorbed;

  //console.log("abs: "+absorbed+"   dealt: "+ dealt+"   dmg: "+ (dealt - absorbed));
  if (dmg <= 0) {
    return Utils.randomInt(0, 3);
  } else {
    return dmg;
  }
};

Formulas.minMaxAbsorb = function ({ armor, armorLevel, playerLevel, defense, absorbedDamage, belt, beltLevel }) {
  const armorDefense = Types.getArmorDefense(armor, armorLevel);
  const beltDefense = Types.getArmorDefense(belt, beltLevel);

  let min = Math.ceil((armorDefense + beltDefense + defense) * 1 + playerLevel / 2) + absorbedDamage;
  let max = Math.ceil((armorDefense + beltDefense + defense) * 1.25 + playerLevel / 2) + absorbedDamage;

  return {
    min,
    max,
  };
};

Formulas.dmgFromMob = function ({
  weaponLevel,
  armor,
  armorLevel,
  playerLevel,
  defense,
  absorbedDamage,
  belt,
  beltLevel,
}) {
  const dealt = Math.ceil(weaponLevel * Utils.randomInt(8, 12));
  const { min, max } = Formulas.minMaxAbsorb({
    armor,
    armorLevel,
    playerLevel,
    defense,
    absorbedDamage,
    belt,
    beltLevel,
  });

  const absorbed = Utils.randomInt(min, max);
  const dmg = dealt - absorbed;

  if (dmg <= 0) {
    return Utils.randomInt(0, 3);
  } else {
    return dmg;
  }
};

Formulas.hp = function ({ armorLevel, level, playerLevel, beltLevel }) {
  const baseHp = 70;
  const armorHp = (armorLevel - 1) * 10 + Types.getArmorHealthBonus(level);
  const beltHp = Types.getArmorHealthBonus(beltLevel);
  const playerLevelHp = playerLevel * 6;

  return baseHp + armorHp + beltHp + playerLevelHp;
};

// Armor
// level, %, bonus
// +1, 100%, 2
// +2, 102.5%, 2
// +3, 105%, 4
// +4, 108%, 6
// +5, 110.5%, 8
// +6, 113.5%, 10
// +7, 117.5%, 12
// +8, 123.5%, 15
// +9, 132%, 19
// +10, 145%, 24
