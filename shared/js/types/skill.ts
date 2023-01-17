export const defenseSkillDurationMap = [
  () => 900,
  (itemLevel: number) => itemLevel * 750,
  (itemLevel: number) => itemLevel * 1000,
];
export const attackSkillDurationMap = [() => 1200, () => 1500, () => 1000, () => 1050, () => 1000];

const defenseSkillDescriptionMap = [
  "+#% Instant health regeneration",
  "+#% Defense for # seconds and clear curses",
  "+#% All resistances for # seconds",
];

const attackSkillDescriptionMap = [
  "Cast a # damage magic ball",
  "Cast a # damage flame pillar",
  "Cast a # damage lightning strike",
  "Cast a # damage ice spike",
  "Cast a # damage poison curse",
];

const defenseSkillType = [
  "regenerateHealthSkill", // 0
  "defenseSkill", // 1
  "resistancesSkill", // 2
];

export const attackSkillType = [
  "magicSkill", // 0
  "flameSkill", // 1
  "lightningSkill", // 2
  "coldSkill", // 3
  "poisonSkill", // 4
];

export const skillToNameMap: SkillElement[] = ["magic", "flame", "lightning", "cold", "poison"];
export const attackSkillToDamageType = ["magicDamage", "flameDamage", "lightningDamage", "coldDamage", "poisonDamage"];
export const attackSkillToResistanceType = [
  "magicResistance",
  "flameResistance",
  "lightningResistance",
  "coldResistance",
  "poisonResistance",
];

export const defenseSkillDelay = [35_000, 35_000, 35_000];
export const attackSkillDelay = [2_000, 2_000, 2_000, 2_000, 2_000];

export const defenseSkillTypeAnimationMap = ["heal", "defense", "resistances"];
export const attackSkillTypeAnimationMap = ["magic", "flame", "lightning", "cold", "poison"];

export const getDefenseSkill = function (rawSkill: number, level: number) {
  const regenerateHealthSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const defenseSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const resistanceSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 90];

  const skillPerLevel = [regenerateHealthSkillPerLevel, defenseSkillPerLevel, resistanceSkillPerLevel];

  let skill: { type: string; stats: number; description: string } | null = null;

  const type = defenseSkillType[rawSkill];
  const stats = skillPerLevel[rawSkill][level - 1];
  let description = defenseSkillDescriptionMap[rawSkill].replace("#", `${stats}`);

  if (type === "defenseSkill" || type === "resistancesSkill") {
    // @ts-ignore
    description = description.replace("#", defenseSkillDurationMap[rawSkill](level) / 1000);
  }

  skill = { type, stats, description };

  return skill;
};

export const getAttackSkill = function ({
  skill,
  level,
  bonus,
  resistance = 0,
  itemClass,
}: {
  skill: number;
  level: number;
  bonus?: any;
  resistance?: number;
  itemClass: ItemClass;
}) {
  const magicSkillPerLevel = [5, 15, 30, 50, 75, 100, 135, 180, 240, 340];
  const flameSkillPerLevel = [5, 15, 30, 50, 75, 100, 135, 180, 240, 340];
  const lightningSkillPerLevel = [5, 15, 30, 50, 75, 100, 135, 180, 240, 340];
  const coldSkillPerLevel = [5, 15, 30, 50, 75, 100, 135, 180, 240, 340];
  const poisonSkillPerLevel = [5, 15, 30, 50, 75, 100, 135, 180, 240, 340];
  // const meteorSkillPerLevel =  [5, 15, 30, 50, 75, 100, 135, 180, 240, 340];

  const skillMultipliers = [
    [1.3, 1.4],
    [1.1, 1.6],
    [0.3, 2.5],
    [1.2, 1.5],
    [1.2, 1.8],
  ];

  const skillPerLevel = [
    magicSkillPerLevel,
    flameSkillPerLevel,
    lightningSkillPerLevel,
    coldSkillPerLevel,
    poisonSkillPerLevel,
    // meteorSkillPerLevel,
  ];

  const skillPlayerBonus = [
    bonus.magicDamagePercent,
    bonus.flameDamagePercent,
    bonus.lightningDamagePercent,
    bonus.coldDamagePercent,
    bonus.poisonDamagePercent,
  ];

  const itemClassMultiplier = itemClass === "legendary" ? 1.25 : 1;

  const type = attackSkillType[skill];
  const stats = skillPerLevel[skill][level - 1];
  const multiplier = skillMultipliers[skill];
  const baseDmg = Math.round((stats + stats * (skillPlayerBonus[skill] / 100)) * itemClassMultiplier);
  const baseMin = Math.round(baseDmg * multiplier[0]);
  const baseMax = Math.round(baseDmg * multiplier[1]);
  const min = Math.round(baseMin - baseMin * (resistance / 100));
  const max = Math.round(baseMax - baseMax * (resistance / 100));

  const description = attackSkillDescriptionMap[skill].replace("#", `${min}-${max}`);

  return { type, stats, description, min, max };
};
