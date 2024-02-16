export const defaultSettings: Settings = {
  playerNames: true,
  damageInfo: true,
  capeHue: 0,
  capeSaturate: 0,
  capeContrast: 0,
  capeBrightness: 1,
  pvp: false,
  partyEnabled: true,
  tradeEnabled: true,
  effects: true,
  debug: false,
};

export type Settings = {
  playerNames: boolean;
  damageInfo: boolean;
  capeHue: number;
  capeSaturate: number;
  capeContrast: number;
  capeBrightness: number;
  pvp: boolean;
  partyEnabled: boolean;
  tradeEnabled: boolean;
  effects: boolean;
  debug: boolean;
};
