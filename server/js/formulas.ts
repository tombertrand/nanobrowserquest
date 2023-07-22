import { Types } from "../../shared/js/gametypes";
import { randomInt } from "./utils";

const Formulas: any = {};

Formulas.resistanceDamage = (damage: number, resistance: number = 0) =>
  // @NOTE no concept of negative resistance yet
  resistance > 0 ? damage - Math.round((damage * resistance) / 100) : damage;
// resistance > 0 ? Math.round(damage * (Math.abs(damage - 100) / 100)) : damage;

Formulas.minMaxDamage = function ({
  weapon,
  weaponLevel,
  isWeaponUnique,
  isWeaponSuperior,
  playerLevel,
  minDamage,
  maxDamage,
  attackDamage: attackDamageBonus,
  drainLife,
  magicDamage,
  flameDamage,
  lightningDamage,
  coldDamage,
  poisonDamage,
  partyAttackDamage,
  magicResistance = 0,
  flameResistance = 0,
  lightningResistance = 0,
  coldResistance = 0,
  poisonResistance = 0,
}) {
  let attackDamage = Math.ceil(
    (Types.getWeaponDamage(weapon, weaponLevel, isWeaponUnique, isWeaponSuperior) + attackDamageBonus) * 1.2 +
      playerLevel / 2,
  );

  const baseDamage = attackDamage + drainLife;

  const elementDamage =
    Formulas.resistanceDamage(magicDamage, magicResistance) +
    Formulas.resistanceDamage(flameDamage, flameResistance) +
    Formulas.resistanceDamage(lightningDamage, lightningResistance) +
    Formulas.resistanceDamage(coldDamage, coldResistance) +
    Formulas.resistanceDamage(poisonDamage, poisonResistance);

  let min = baseDamage + minDamage + Math.round(Math.pow(0.7, Math.floor(playerLevel / 10)) * playerLevel);
  let max = baseDamage + maxDamage + Math.round(Math.pow(1.075, Math.floor(playerLevel / 10)) * playerLevel);

  if (min > max) {
    min = max;
  }

  if (partyAttackDamage) {
    min = Math.round((partyAttackDamage / 100) * min) + min;
    max = Math.round((partyAttackDamage / 100) * max) + max;
    attackDamage = Math.round((partyAttackDamage / 100) * attackDamage) + attackDamage;
  }

  return {
    min,
    max,
    attackDamage,
    elementDamage,
  };
};

Formulas.dmg = function (stats) {
  const { min, max, attackDamage, elementDamage } = Formulas.minMaxDamage(stats);
  let dmg = randomInt(min, max);

  //console.log("abs: "+absorbed+"   dealt: "+ dealt+"   dmg: "+ (dealt - absorbed));
  if (dmg + elementDamage <= 0) {
    dmg = randomInt(0, 3);
    return { dmg, attackDamage: dmg, elementDamage };
  } else {
    return { dmg, attackDamage, elementDamage };
  }
};

Formulas.mobDefense = function ({ armorLevel }) {
  const defense = armorLevel ? Math.floor(armorLevel * randomInt(2, 4)) : 0;

  return defense;
};

Formulas.minMaxDefense = function ({
  helm,
  helmLevel,
  isHelmUnique,
  isHelmSuperior,
  armor,
  armorLevel,
  isArmorUnique,
  isArmorSuperior,
  playerLevel,
  defense,
  absorbedDamage,
  belt,
  beltLevel,
  isBeltUnique,
  isBeltSuperior,
  shield,
  shieldLevel,
  isShieldUnique,
  isShieldSuperior,
  partyDefense,
  cape,
  capeLevel,
  isCapeUnique,
  isCapeSuperior,
  skillDefense,
}) {
  const helmDefense = Types.getArmorDefense(helm, helmLevel, isHelmUnique, isHelmSuperior);
  const armorDefense = Types.getArmorDefense(armor, armorLevel, isArmorUnique, isArmorSuperior);
  const beltDefense = Types.getArmorDefense(belt, beltLevel, isBeltUnique, isBeltSuperior);
  const capeDefense = Types.getArmorDefense(cape, capeLevel, isCapeUnique, isCapeSuperior);
  const shieldDefense = Types.getArmorDefense(shield, shieldLevel, isShieldUnique, isShieldSuperior);

  let min =
    Math.ceil((helmDefense + armorDefense + beltDefense + capeDefense + shieldDefense + defense) * 1.2) +
    absorbedDamage;
  let max = min + Math.ceil(Math.pow(1.075, playerLevel));
  let maxSkillDefense = 0;
  let maxParty = 0;

  if (skillDefense) {
    maxSkillDefense = Math.round((skillDefense / 100) * max);
  }

  if (partyDefense) {
    maxParty = Math.round((partyDefense / 100) * max);
  }

  min = min + maxSkillDefense + maxParty;
  max = max + maxSkillDefense + maxParty;

  return {
    min,
    max,
  };
};

Formulas.dmgFromMob = function ({ weaponLevel }) {
  return Math.ceil(weaponLevel * randomInt(12, 16));
};

Formulas.playerDefense = ({
  helm,
  helmLevel,
  isHelmUnique,
  isHelmSuperior,
  armor,
  armorLevel,
  isArmorUnique,
  isArmorSuperior,
  playerLevel,
  defense,
  absorbedDamage,
  belt,
  beltLevel,
  isBeltUnique,
  isBeltSuperior,
  shield,
  shieldLevel,
  isShieldUnique,
  isShieldSuperior,
  partyDefense,
  cape,
  capeLevel,
  isCapeUnique,
  isCapeSuperior,
  skillDefense,
}) => {
  const { min, max } = Formulas.minMaxDefense({
    helm,
    helmLevel,
    isHelmUnique,
    isHelmSuperior,
    armor,
    armorLevel,
    isArmorUnique,
    isArmorSuperior,
    playerLevel,
    defense,
    absorbedDamage,
    belt,
    beltLevel,
    isBeltUnique,
    isBeltSuperior,
    shield,
    shieldLevel,
    isShieldUnique,
    isShieldSuperior,
    partyDefense,
    cape,
    capeLevel,
    isCapeUnique,
    isCapeSuperior,
    skillDefense,
  });

  return randomInt(min, max);
};

Formulas.hp = function ({ helmLevel, armorLevel, playerLevel, beltLevel, shieldLevel }) {
  const baseHp = 80;
  const helmHp = Types.getArmorHealthBonus(helmLevel);
  const armorHp = Types.getArmorHealthBonus(armorLevel);
  const beltHp = Types.getArmorHealthBonus(beltLevel);
  const shieldHp = Types.getArmorHealthBonus(shieldLevel);
  const playerLevelHp = playerLevel * 6;

  return baseHp + helmHp + armorHp + beltHp + shieldHp + playerLevelHp;
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
