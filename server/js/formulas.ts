import { Types } from "../../shared/js/gametypes";
import { randomInt } from "./utils";

const Formulas: any = {};

Formulas.minMaxDamage = function ({
  weapon,
  weaponLevel,
  playerLevel,
  minDamage,
  maxDamage,
  magicDamage,
  attackDamage,
  drainLife,
  flameDamage,
  lightningDamage,
  pierceArmor,
}) {
  const isUnique = !!flameDamage;
  const weaponMagicDamage = isUnique ? 0 : Types.getWeaponMagicDamage(weaponLevel);
  const baseDamage =
    Math.ceil((Types.getWeaponDamage(weapon, weaponLevel, isUnique) + attackDamage) * 1.2 + playerLevel / 2) +
    weaponMagicDamage +
    magicDamage +
    drainLife +
    flameDamage +
    lightningDamage +
    pierceArmor;

  let min = baseDamage + minDamage + Math.round(Math.pow(0.7, Math.floor(playerLevel / 10)) * playerLevel);
  const max = baseDamage + maxDamage + Math.round(Math.pow(1.075, Math.floor(playerLevel / 10)) * playerLevel);

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
  attackDamage,
  drainLife,
  flameDamage,
  lightningDamage,
  pierceArmor,
}) {
  const { min, max } = Formulas.minMaxDamage({
    weapon,
    weaponLevel,
    playerLevel,
    minDamage,
    maxDamage,
    magicDamage,
    attackDamage,
    drainLife,
    flameDamage,
    lightningDamage,
    pierceArmor,
  });
  const dealt = randomInt(min, max);
  const absorbed = Math.floor(armorLevel * randomInt(2, 4));

  // @TODO Properly calculate pierceArmor, should be something special
  const dmg = dealt + pierceArmor - absorbed;

  //console.log("abs: "+absorbed+"   dealt: "+ dealt+"   dmg: "+ (dealt - absorbed));
  if (dmg <= 0) {
    return randomInt(0, 3);
  } else {
    return dmg;
  }
};

Formulas.minMaxAbsorb = function ({
  armor,
  armorLevel,
  playerLevel,
  defense,
  absorbedDamage,
  belt,
  beltLevel,
  isUniqueArmor,
  isUniqueBelt,
}) {
  const armorDefense = Types.getArmorDefense(armor, armorLevel, isUniqueArmor);
  const beltDefense = Types.getArmorDefense(belt, beltLevel, isUniqueBelt);

  const min = Math.ceil((armorDefense + beltDefense + defense) * 1.2) + absorbedDamage;
  const max = min + Math.ceil(Math.pow(1.075, playerLevel));

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
  isUniqueBelt,
}) {
  const dealt = Math.ceil(weaponLevel * randomInt(10, 15));
  const { min, max } = Formulas.minMaxAbsorb({
    armor,
    armorLevel,
    playerLevel,
    defense,
    absorbedDamage,
    belt,
    beltLevel,
    isUniqueBelt,
  });

  const absorbed = randomInt(min, max);
  const dmg = dealt - absorbed;

  if (dmg <= 0) {
    return randomInt(3, 5);
  } else {
    return dmg;
  }
};

Formulas.hp = function ({ armorLevel, level, playerLevel, beltLevel }) {
  const baseHp = 80;
  const armorHp = (armorLevel - 1) * 6 + Types.getArmorHealthBonus(level);
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

export default Formulas;
