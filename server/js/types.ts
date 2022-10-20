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
  runeKind?: number;
};
