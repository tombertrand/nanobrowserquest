type Recipes = "cowLevel" | "minotaurLevel" | ChestType | "powderquantum" | "petegg";
type ChatType = "world" | "zone" | "party" | "event" | "info" | "loot";
type Network = "nano" | "ban";
type ItemClass = "low" | "medium" | "high" | "legendary";
type Explorer = "nanolooker" | "bananolooker";
type Auras = "drainlife" | "thunderstorm" | "highhealth" | "freeze" | "lowerresistance" | "arcane";
type DefenseSkills = "heal" | "defense" | "resistances";
type AttackSkills = "flame" | "lightning" | "cold" | "poison";
type Elements = "magic" | "flame" | "lightning" | "cold" | "poison" | "spectral";
type Enchant = Elements | "physical" | "stoneskin" | "curse-health" | "curse-resistance";
type SkillElement = "magic" | "flame" | "lightning" | "cold" | "poison";
type ChestType = "chestblue" | "chestgreen" | "chestpurple" | "chestred";
type Orientation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type TimedLevel = "cow" | "minotaur" | "stone" | "chalice" | "gateway" | "temple";

type GeneratedItem = {
  item: string;
  level?: number;
  quantity?: number;
  bonus?: string;
  socket?: string;
  skill?: number;
  skin?: number;
  isUnique?: boolean;
  runeName?: string;
  jewelLevel?: number;
};

type Resistances = {
  magicResistance?: number;
  flameResistance?: number;
  lightningResistance?: number;
  coldResistance?: number;
  poisonResistance?: number;
  spectralResistance?: number;
};
