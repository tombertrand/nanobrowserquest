type Recipes = "cowLevel" | "minotaurLevel" | "chestblue";

type ChatType = "world" | "zone" | "party" | "event" | "info" | "loot";

type Network = "nano" | "ban";

type ItemClass = "low" | "medium" | "high" | "legendary";

type Explorer = "nanolooker" | "bananolooker";

type Auras = "drainlife" | "thunderstorm" | "highhealth" | "freeze";

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
  physicalResistance?: number;
};
