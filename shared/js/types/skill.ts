export const defenseSkillDurationMap = [() => 900, (itemLevel: number) => itemLevel * 500];
export const attackSkillDurationMap = [() => 1536, () => 1000, () => 1050, () => 1000];

const defenseSkillDescriptionMap = [
  "+#% Instant health regeneration",
  "+#% Defense for # seconds",
  // "-#% Attack damage from your attacking enemies",
  // "+#% block chances for # seconds",
  // "-#% Attack damage from your enemies for # seconds",
];

const attackSkillDescriptionMap = [
  "Cast a # damage flame pilliar",
  "Cast a # damage lightning strike",
  "Cast a # damage ice spike",
  "Cast a # damage poison curse",
  // "-#% Attack damage from your attacking enemies",
  // "+#% block chances for # seconds",
  // "-#% Attack damage from your enemies for # seconds",
];

const defenseSkillType = [
  "regenerateHealthSkill", // 0
  "defenseSkill", // 1
  // "curseAttackSkill", // 2
];

const attackSkillType = [
  "flameSkill", // 0
  "lightningSkill", // 1
  "coldSkill", // 2
  "poisonSkill", // 3
  // "magicSkill", // 4
];

export const defenseSkillDelay = [24_000, 35_000, 60_000];
export const attackSkillDelay = [24_000, 35_000, 35_000, 35_000];

export const defenseSkillTypeAnimationMap = ["heal", "defense", "curse-attack"];

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
  const flameSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const lightningSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const coldSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const poisonSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  // const meteorSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

  const skillPerLevel = [
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
