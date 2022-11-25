export const defenseSkillDurationMap = [() => 900, (itemLevel: number) => itemLevel * 500];
export const attackSkillDurationMap = [() => 1200, () => 1500, () => 1000, () => 1050, () => 1000];

const defenseSkillDescriptionMap = [
  "+#% Instant health regeneration",
  "+#% Defense for # seconds",
  // "-#% Attack damage from your attacking enemies",
  // "+#% block chances for # seconds",
  // "-#% Attack damage from your enemies for # seconds",
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
  // "curseAttackSkill", // 2
];

const attackSkillType = [
  "magicSkill", // 0
  "flameSkill", // 1
  "lightningSkill", // 2
  "coldSkill", // 3
  "poisonSkill", // 4
];

export const skillToNameMap = ["magic", "flame", "lightning", "cold", "poison"];
export const attackSkillToDamageType = ["magicDamage", "flameDamage", "lightningDamage", "coldDamage", "poisonDamage"];
export const attackSkillToResistanceType = [
  "magicResistance",
  "flameResistance",
  "lightningResistance",
  "coldResistance",
  "poisonResistance",
];

export const defenseSkillDelay = [24_000, 35_000, 60_000];
export const attackSkillDelay = [2_000, 2_000, 2_000, 2_000, 2_000];

export const defenseSkillTypeAnimationMap = ["heal", "defense", "curse-attack"];
export const attackSkillTypeAnimationMap = ["magic", "flame", "lightning", "cold", "poison"];

export const getDefenseSkill = function (rawSkill: number, level: number) {
  const regenerateHealthSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const defenseSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  // const curseAttackSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

  const skillPerLevel = [
    regenerateHealthSkillPerLevel,
    defenseSkillPerLevel,
    // curseAttackSkillPerLevel,
  ];

  let skill: { type: string; stats: number; description: string } | null = null;

  const type = defenseSkillType[rawSkill];
  const stats = skillPerLevel[rawSkill][level - 1];
  let description = defenseSkillDescriptionMap[rawSkill].replace("#", `${stats}`);

  if (type === "defenseSkill") {
    // @ts-ignore
    description = description.replace("#", defenseSkillDurationMap[rawSkill](level) / 1000);
  }

  skill = { type, stats, description };

  return skill;
};

export const getAttackSkill = function (rawSkill, level) {
  const magicSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const flameSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const lightningSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const coldSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const poisonSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  // const meteorSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

  const skillPerLevel = [
    magicSkillPerLevel,
    flameSkillPerLevel,
    lightningSkillPerLevel,
    coldSkillPerLevel,
    poisonSkillPerLevel,
    // meteorSkillPerLevel,
  ];

  let skill: { type: string; stats: number; description: string } | null = null;

  const type = attackSkillType[rawSkill];
  const stats = skillPerLevel[rawSkill][level - 1];
  const description = attackSkillDescriptionMap[rawSkill].replace("#", `${stats}`);

  skill = { type, stats, description };

  return skill;
};
