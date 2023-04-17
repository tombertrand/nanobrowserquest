import { randomInt } from "./utils";

const amountPerMob = {
  rat: [1, 3],
  crab: [2, 5],
  bat: [2, 5],
  goblin: [2, 7],
  skeleton: [5, 11],
  snake: [5, 12],
  ogre: [7, 12],
  skeleton2: [8, 14],
  eye: [10, 16],
  spectre: [10, 16],
  deathknight: [12, 20],
  rat2: [12, 32],
  bat2: [16, 36],
  goblin2: [16, 36],
  werewolf: [24, 50],
  yeti: [24, 50],
  skeleton3: [16, 50],
  snake2: [24, 60],
  wraith: [24, 50],
  zombie: [14, 40],
  cow: [14, 60],
  rat3: [24, 148],
  golem: [42, 190],
  oculothorax: [24, 190],
  kobold: [24, 190],
  snake3: [24, 190],
  snake4: [24, 190],
  skeleton4: [24, 190],
  ghost: [36, 190],
  spider: [22, 190],
  spider2: [22, 190],
  // butcher
  skeletonberserker: [22, 190],
  skeletonarcher: [22, 224],
  wraith2: [24, 224],
  mage: [24, 224],
};

export const generateRandomGoldAmount = (name, isMiniBoss) => {
  const range: number[] = amountPerMob[name];

  // Protection incase forgot a mob...
  if (!Array.isArray(range)) return;

  const amount = randomInt(range[0], range[1]);
  return Math.ceil(amount * (isMiniBoss ? 1.5 : 1));
};

export const generateRandomNanoAmount = _network => {
  // if ()
};
