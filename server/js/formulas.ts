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
  coldDamage,
  pierceDamage,
  partyAttackDamage,
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
    coldDamage +
    pierceDamage;

  let min = baseDamage + minDamage + Math.round(Math.pow(0.7, Math.floor(playerLevel / 10)) * playerLevel);
  let max = baseDamage + maxDamage + Math.round(Math.pow(1.075, Math.floor(playerLevel / 10)) * playerLevel);

  if (min > max) {
    min = max;
  }

  if (partyAttackDamage) {
    min = Math.round((partyAttackDamage / 100) * min) + min;
    max = Math.round((partyAttackDamage / 100) * max) + max;
  }

  return {
    min,
    max,
  };
};

Formulas.dmg = function ({
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
  coldDamage,
  pierceDamage,
  partyAttackDamage,
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
    coldDamage,
    pierceDamage,
    partyAttackDamage,
  });
  const dealt = randomInt(min, max);

  const dmg = dealt + pierceDamage;

  //console.log("abs: "+absorbed+"   dealt: "+ dealt+"   dmg: "+ (dealt - absorbed));
  if (dmg <= 0) {
    return randomInt(0, 3);
  } else {
    return dmg;
  }
};

Formulas.mobDefense = function ({ armorLevel }) {
  const defense = armorLevel ? Math.floor(armorLevel * randomInt(2, 4)) : 0;

  return defense;
};

Formulas.minMaxAbsorb = function ({
  armor,
  armorLevel,
  isUniqueArmor,
  playerLevel,
  defense,
  absorbedDamage,
  belt,
  beltLevel,
  isUniqueBelt,
  shield,
  shieldLevel,
  isUniqueShield,
  partyDefense,
  cape,
  capeLevel,
}) {
  const armorDefense = Types.getArmorDefense(armor, armorLevel, isUniqueArmor);
  const beltDefense = Types.getArmorDefense(belt, beltLevel, isUniqueBelt);
  const capeDefense = Types.getArmorDefense(cape, capeLevel);
  const shieldDefense = Types.getArmorDefense(shield, shieldLevel, isUniqueShield);

  let min = Math.ceil((armorDefense + beltDefense + capeDefense + shieldDefense + defense) * 1.2) + absorbedDamage;
  let max = min + Math.ceil(Math.pow(1.075, playerLevel));

  if (partyDefense) {
    min = Math.round((partyDefense / 100) * min) + min;
    max = Math.round((partyDefense / 100) * max) + max;
  }

  return {
    min,
    max,
  };
};

Formulas.dmgFromMob = function ({ weaponLevel }) {
  return Math.ceil(weaponLevel * randomInt(10, 15));
};

Formulas.playerDefense = ({
  armor,
  armorLevel,
  playerLevel,
  defense,
  absorbedDamage,
  belt,
  beltLevel,
  isUniqueBelt,
  shield,
  shieldLevel,
  isUniqueShield,
  partyDefense,
  cape,
  capeLevel,
}) => {
  const { min, max } = Formulas.minMaxAbsorb({
    armor,
    armorLevel,
    playerLevel,
    defense,
    absorbedDamage,
    belt,
    beltLevel,
    isUniqueBelt,
    shield,
    shieldLevel,
    isUniqueShield,
    partyDefense,
    cape,
    capeLevel,
  });

  return randomInt(min, max);
};

Formulas.hp = function ({ armorLevel, level, playerLevel, beltLevel, shieldLevel }) {
  const baseHp = 80;
  const armorHp = (armorLevel - 1) * 6 + Types.getArmorHealthBonus(level);
  const beltHp = Types.getArmorHealthBonus(beltLevel);
  const shieldHp = Types.getArmorHealthBonus(shieldLevel);
  const playerLevelHp = playerLevel * 6;

  return baseHp + armorHp + beltHp + shieldHp + playerLevelHp;
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
