export const ACHIEVEMENT_NAMES = [
  "A_TRUE_WARRIOR",
  "INTO_THE_WILD",
  "ANGRY_RATS",
  "SMALL_TALK",
  "FAT_LOOT",
  "UNDERGROUND",
  "AT_WORLDS_END",
  "COWARD",
  "TOMB_RAIDER",
  "SKULL_COLLECTOR",
  "NINJA_LOOT",
  "NO_MANS_LAND",
  "HUNTER",
  "STILL_ALIVE",
  "MEATSHIELD",
  "NYAN",
  "HOT_SPOT",
  "SPECTRE_COLLECTOR",
  "GEM_HUNTER",
  "NANO_POTIONS",
  "HERO",
  "FOXY",
  "FOR_SCIENCE",
  "RICKROLLD",
  "XNO",
  "FREEZING_LANDS",
  "SKELETON_KEY",
  "BLOODLUST",
  "SATOSHI",
  "WEN",
  "INDIANA_JONES",
  "MYTH_OR_REAL",
  "RIP",
  "DEAD_NEVER_DIE",
  "WALK_ON_WATER",
  "GHOSTBUSTERS",
  "BLACK_MAGIC",
  "LUCKY7",
  "NOT_SAFU",
  "TICKLE_FROM_UNDER",
  "SECRET_LEVEL",
  "COW_KING",
  "FRESH_MEAT",
  "FARMER",
  "ANTIDOTE",
  "DISCORD",
  "NFT",
  "UNBREAKABLE",
  "WAY_OF_WATER",
  "TEMPLAR",
  "DRAGON",
  "STONEHENGE",
  "ALCHEMIST",
  "INFINITY_STONE",
  "STARGATE",
  "PERSONAL_WEAPON",
  "CRUISADE",
  "TOMB",
  "MINE",
  "BOO",
  "ARCHMAGE",
  "SPECTRAL",
  "PHARAOH",
  "DEATHANGEL",
  "MAGIC8",
  "RUNOLOGUE",
  "BLACKSMITH",
  "RUNE_MASTER",
  "EMBLEM",
  "SAURON",
  "SACRED",
  "MISSTEP",
  "ZELDA",
  "GRIMOIRE",
  "HELLFORGE",
  "GRAND_MASTER",
] as const;

export const ACHIEVEMENT_COUNT = ACHIEVEMENT_NAMES.length;

export const ACHIEVEMENT_GRIMOIRE_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "GRIMOIRE");
export const ACHIEVEMENT_NFT_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "NFT");
export const ACHIEVEMENT_WING_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "DRAGON");
export const ACHIEVEMENT_CRYSTAL_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "MINE");

export type AchievementName = typeof ACHIEVEMENT_NAMES[number];
export interface Achievement {
  id: number;
  name: string;
  desc: string;
  nano?: number;
  ban?: number;
  hidden?: boolean;
  isCompleted?: () => boolean;
}
