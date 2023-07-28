import { randomInt } from "./utils";

const amountPerMob = {
  rat: [1, 5],
  crab: [2, 5],
  bat: [2, 5],
  goblin: [4, 10],
  skeleton: [10, 15],
  snake: [10, 15],
  ogre: [14, 15],
  skeleton2: [16, 18],
  eye: [15, 20],
  spectre: [15, 20],
  deathknight: [15, 22],
  rat2: [14, 26],
  bat2: [16, 26],
  goblin2: [12, 24],
  werewolf: [12, 36],
  yeti: [14, 38],
  skeleton3: [16, 38],
  snake2: [18, 40],
  wraith: [18, 40],
  zombie: [12, 36],
  cow: [12, 46],
  rat3: [32, 100],
  golem: [32, 140],
  oculothorax: [32, 110],
  kobold: [32, 124],
  snake3: [32, 124],
  snake4: [32, 124],
  skeleton4: [32, 124],
  ghost: [32, 146],
  spider: [32, 146],
  spider2: [32, 146],
  // butcher
  skeletonberserker: [32, 156],
  skeletonarcher: [32, 166],
  wraith2: [32, 166],
  mage: [32, 166],
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
