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
  "CYCLOP",
  "TEMPLAR",
  "WING",
  "STONEHENGE",
  "CRUISADE",
  "TOMB",
  "ALCHEMIST",
  "INFINITY_STONE",
  "STARGATE",
  "PERSONAL_WEAPON",
  "BOO",
  "SPIDER_QUEEN",
  "ARCHMAGE",
  "SPECTRAL",
  "BERSERKER",
  "CRYSTAL",
  "SHAMAN",
  "PHARAOH",
  "DEATHANGEL",
  "MAGIC8",
  "RUNOLOGUE",
  "BLACKSMITH",
  "MINI_BOSS",
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
export const ACHIEVEMENT_WING_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "WING");
export const ACHIEVEMENT_CRYSTAL_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "CRYSTAL");
export const ACHIEVEMENT_ANTIDOTE_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "ANTIDOTE");
export const ACHIEVEMENT_UNBREAKABLE_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "UNBREAKABLE");
export const ACHIEVEMENT_CYCLOP_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "CYCLOP");
export const ACHIEVEMENT_TEMPLAR_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "TEMPLAR");
export const ACHIEVEMENT_BOO_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "BOO");
export const ACHIEVEMENT_ARCHMAGE_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "ARCHMAGE");
export const ACHIEVEMENT_SPECTRAL_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "SPECTRAL");
export const ACHIEVEMENT_BERSERKER_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "BERSERKER");
export const ACHIEVEMENT_MINI_BOSS_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "MINI_BOSS");

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
