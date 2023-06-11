export const Curses = {
  HEALTH: 0,
  RESISTANCES: 1,
};

export const curseDurationMap = [
  (level: number) => level * 1000,
  (level: number) => level * 1000,
  (level: number) => level * 1000,
];

export const curseDescriptionMap = [
  "Prevent enemy health regeneration for # seconds",
  "Decrease enemy resistances by #% for # seconds",
  "Decrease enemy defense by #% for # seconds",
];
