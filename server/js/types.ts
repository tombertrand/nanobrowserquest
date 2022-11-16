export type Recipes = "cowLevel" | "minotaurLevel" | "chestblue";

export type ChatType = "world" | "zone" | "party" | "event" | "info" | "loot";

export type Network = "nano" | "ban";

export type GeneratedItem = {
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

export type Resistances = {
  magicResistance?: number;
  flameResistance?: number;
  lightningResistance?: number;
  coldResistance?: number;
  poisonResistance?: number;
  physicalResistance?: number;
};
