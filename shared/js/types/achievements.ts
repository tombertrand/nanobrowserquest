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
  "HAMBURGER",
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
  "SPIDERQUEEN",
  "CRUISADE",
  "TOMB",
  "ALCHEMIST",
  "STARGATE",
  "SOULSTONE",
  "BUTCHER",
  "BOO",
  "VIKING",
  "BULLSEYE",
  "SPECTRAL",
  "ARCHMAGE",
  "MINI_BOSS",
  "CRYSTAL",
  "SHAMAN",
  "PHARAOH",
  "DEATHANGEL",
  "RUNOLOGUE",
  "BLACKSMITH",
  "SACRED",
  "EMBLEM",
  "OBELISK",
  "MISSTEP",
  "ZELDA",
  "GRIMOIRE",
  "ZAP",
  "GRAND_MASTER",
] as const;

export const ACHIEVEMENT_COUNT = ACHIEVEMENT_NAMES.length;

export const ACHIEVEMENT_HERO_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "HERO");
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
export const ACHIEVEMENT_VIKING_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "VIKING");
export const ACHIEVEMENT_BULLSEYE_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "BULLSEYE");
export const ACHIEVEMENT_SACRED_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "SACRED");
export const ACHIEVEMENT_MINI_BOSS_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "MINI_BOSS");
export const ACHIEVEMENT_DISCORD_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "DISCORD");
export const ACHIEVEMENT_BLACKSMITH_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "BLACKSMITH");
export const ACHIEVEMENT_ZAP_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "ZAP");
export const ACHIEVEMENT_OBELISK_INDEX = ACHIEVEMENT_NAMES.findIndex(a => a === "OBELISK");

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
