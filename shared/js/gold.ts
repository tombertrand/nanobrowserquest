import { toArray, toNumber } from "../../shared/js/utils";

export const merchantItems: { item: string; amount: number }[] = [
  undefined,
  { item: "scrollupgradelow", amount: 25 },
  { item: "scrollupgrademedium", amount: 100 },
  { item: "scrollupgradehigh", amount: 550 },
  { item: "scrollupgradelegendary", amount: 1750 },
  { item: "scrolltransmute", amount: 1500 },
  { item: "scrolltransmutepet", amount: 22_500 },

  undefined,
  { item: "barbronze", amount: 1050 },
  { item: "barsilver", amount: 10_500 },
  { item: "bargold", amount: 105_000 },
  { item: "barplatinum", amount: 1_050_000 },
  { item: "stonesocket", amount: 1_500 },
  { item: "stonesocketblessed", amount: 35_000 },
  undefined,
  { item: "scrollupgradeelementmagic", amount: 8_000 },
  { item: "scrollupgradeelementflame", amount: 8_000 },
  { item: "scrollupgradeelementlightning", amount: 8_000 },
  { item: "scrollupgradeelementcold", amount: 8_000 },
  { item: "scrollupgradeelementpoison", amount: 8_000 },
  { item: "scrollupgradeskillrandom", amount: 15_000 },


];

export const itemGoldMap = {
  barbronze: 1000,
  barsilver: 10_000,
  bargold: 100_000,
  barplatinum: 1_000_000,

  scrollupgradeelementmagic: 2_500,
  scrollupgradeelementflame:2_500,
  scrollupgradeelementlightning:2_500,
  scrollupgradeelementcold:2_500,
  scrollupgradeelementpoison:2_500,
  scrollupgradeskillrandom:5_000,

  scrollupgradelow: 15,
  scrollupgrademedium: 35,
  scrollupgradehigh: 100,
  scrollupgradelegendary: 250,
  scrollupgradeblessed: 250,
  scrollupgradesacred: 3_500,
  scrolltransmute: 250,
  scrolltransmuteblessed: 5_000,
  scrolltransmutepet: 4_000,
  jewelskull: 10,

  stonesocket: 250,
  stonesocketblessed: 17_500,
  stonedragon: 10_000,
  stonehero: 25_000,

  ringbronze: 25,
  ringsilver: 35,
  ringgold: 45,
  ringplatinum: 65,

  amuletsilver: 25,
  amuletgold: 35,
  amuletplatinum: 65,

  wirtleg: 3,
  sword: 2,
  axe: 3,
  morningstar: 4,
  bluesword: 5,
  redsword: 5,
  goldensword: 6,
  blueaxe: 8,
  bluemorningstar: 8,
  frozensword: 10,
  diamondsword: 100,
  minotauraxe: 125,
  emeraldsword: 35,
  executionersword: 35,
  templarsword: 38,
  dragonsword: 40,
  moonsword: 50,
  demonaxe: 150,
  mysticalsword: 85,
  spikeglaive: 250,
  eclypsedagger: 250,
  paladinaxe: 250,
  immortalsword: 250,

  helmleather: 2,
  helmmail: 3,
  helmplate: 4,
  helmred: 5,
  helmgolden: 6,
  helmblue: 8,
  helmhorned: 9,
  helmfrozen: 10,
  helmdiamond: 100,
  helmemerald: 30,
  helmexecutioner: 32,
  helmtemplar: 34,
  helmdragon: 36,
  helmmoon: 42,
  helmdemon: 110,
  helmmystical: 72,
  helmimmortal: 98,
  helmpaladin: 98,
  helmclown: 450,
  helmpumkin: 1150,

  leatherarmor: 2,
  mailarmor: 3,
  platearmor: 4,
  redarmor: 5,
  goldenarmor: 6,
  bluearmor: 8,
  hornedarmor: 9,
  frozenarmor: 10,
  diamondarmor: 100,
  emeraldarmor: 35,
  templararmor: 38,
  dragonarmor: 40,
  moonarmor: 50,
  demonarmor: 140,
  mysticalarmor: 85,
  paladinarmor: 250,
  immortalarmor: 250,

  shieldwood: 2,
  shieldiron: 3,
  shieldplate: 4,
  shieldred: 5,
  shieldgolden: 6,
  shieldblue: 8,
  shieldhorned: 9,
  shieldfrozen: 10,
  shielddiamond: 95,
  shieldemerald: 30,
  shieldexecutioner: 30,
  shieldtemplar: 32,
  shielddragon: 35,
  shieldmoon: 45,
  shieldmystical: 80,
  shielddemon: 120,
  shieldpaladin: 120,
  shieldimmortal: 120,

  beltleather: 1,
  beltplated: 3,
  beltfrozen: 5,
  belthorned: 5,
  beltdiamond: 85,
  beltminotaur: 110,
  beltemerald: 28,
  beltexecutioner: 30,
  belttemplar: 30,
  beltmoon: 42,
  beltdemon: 115,
  beltmystical: 75,
  beltpaladin: 115,
  beltimmortal: 115,
  beltgoldwrap: 115,
};

export const getGoldAmountFromSoldItem = ({
  item: rawItem,
  level: pLevel,
  quantity = 1,
  socket: pSocket,
}: {
  item: string;
  level?: number;
  quantity?: number;
  socket?: number[];
}) => {
  const delimiter = rawItem.startsWith("jewel") ? "|" : ":";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [item, rawLevel, bonus, rawSocket] = rawItem.split(delimiter);

  let amountPerItem = itemGoldMap[item];

  if (!amountPerItem) {
    return 0;
  }

  let factor = 100;
  const level = pLevel || toNumber(rawLevel);

  if (item === "jewelskull") {
    if (level === 2) {
      amountPerItem = 25;
    } else if (level === 3) {
      amountPerItem = 100;
    } else if (level === 4) {
      amountPerItem = 250;
    } else if (level === 5) {
      amountPerItem = 1000;
    }
  }

  if (pSocket || rawSocket) {
    const socket = toArray(pSocket) || toArray(rawSocket);
    if (socket.length) {
      if (socket.length === 1) {
        factor += 5;
      } else if (socket.length === 2) {
        factor += 10;
      } else if (socket.length === 3) {
        factor += 16;
      } else if (socket.length === 4) {
        factor += 25;
      } else if (socket.length === 5) {
        factor += 50;
      } else if (socket.length === 6) {
        factor += 100;
      }
    }
  }

  if (factor > 100) {
    amountPerItem = Math.floor((amountPerItem * factor) / 100);
  }

  return amountPerItem * quantity;
};
