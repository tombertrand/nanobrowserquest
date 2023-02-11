type Recipes = "cowLevel" | "minotaurLevel" | ChestType | "powderquantum";
type ChatType = "world" | "zone" | "party" | "event" | "info" | "loot";
type Network = "nano" | "ban";
type ItemClass = "low" | "medium" | "high" | "legendary";
type Explorer = "nanolooker" | "bananolooker";
type Auras = "drainlife" | "thunderstorm" | "highhealth" | "freeze" | "resistance";
type DefenseSkills = "heal" | "defense" | "resistances";
type AttackSkills = "flame" | "lightning" | "cold" | "poison";
type Elements = "magic" | "flame" | "lightning" | "cold" | "poison" | "spectral";
type SkillElement = "magic" | "flame" | "lightning" | "cold" | "poison";
type ChestType = "chestblue" | "chestgreen" | "chestpurple" | "chestred";
type Orientation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type GeneratedItem = {
  item: string;
  level?: number;
  quantity?: number;
  bonus?: number[];
  skill?: number;
  isUnique?: boolean;
  runeName?: string;
  socket?: number[];
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
