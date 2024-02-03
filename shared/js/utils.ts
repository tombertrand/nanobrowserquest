export const HASH_BAN_DELAY = 60000;

export const MIN_SKELETON_KING_LEVEL = 16;
export const MIN_NECROMANCER_LEVEL = 43;
export const MIN_COW_LEVEL = 45;
export const MIN_MINOTAUR_LEVEL = 50;
export const MIN_TEMPLE_LEVEL = 67;
export const MIN_AZRAEL_LEVEL = 69;
export const MIN_BUTCHER_GATEWAY_LEVEL = 68;

export const toString = (stringOrArray: string | number[]): string => {
  if (Array.isArray(stringOrArray)) {
    return JSON.stringify(stringOrArray);
  }

  return stringOrArray;
};

export const toArray = (arrayOrString: string | number[]): number[] | undefined => {
  if (arrayOrString && typeof arrayOrString === "string") {
    try {
      return JSON.parse(arrayOrString);
    } catch (err) {
      return;
    }
  }
  return arrayOrString as number[];
};

export const toNumber = (stringOrNumber: string | number) => {
  if (typeof stringOrNumber === "number") return stringOrNumber;
  if (typeof stringOrNumber === "string") return parseInt(stringOrNumber, 10);
  return null;
};

export const toBoolean = (value: any): boolean =>
  typeof value === "string"
    ? value.toLowerCase() === "true" || !["", "0", "false"].includes(value.toLowerCase())
    : typeof value === "number"
    ? value !== 0
    : value;

export const toDb = (attribute: string | number | number[]) => {
  if (Array.isArray(attribute)) {
    return `:${toString(attribute)}`;
  }
  if (typeof attribute === "number" || (typeof attribute === "string" && attribute)) {
    return `:${attribute}`;
  }
  return "";
};

export const randomInt = function (min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
};

export const getGoldDeathPenaltyPercent = (level: number): number => {
  if (level < 16) return 10;
  if (level < 25) {
    return 15;
  }
  if (level < 45) {
    return 25;
  }
  if (level < 55) {
    return 35;
  }
  return 50;
};

export const validateQuantity = quantity => {
  if (!quantity || isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
    return false;
  }
  return true;
};

// 02LV are not present in addresses
const ACCOUNT_REGEX = /^((nano|ban)_)[13][13-9a-km-uw-z]{59}$/;
export const isValidAccountAddress = (address: string) =>
  new RegExp(`^${ACCOUNT_REGEX.toString().replace(/\//g, "")}$`, "i").test(address);

export const getAccountAddressFromText = (text: string) => {
  const [, address] =
    text.match(new RegExp(`[^sS]*?(${ACCOUNT_REGEX.toString().replace(/\//g, "")})[^sS]*?`, "i")) || [];
  return address;
};

function removeNonAlphabeticalChars(str) {
  return str.replace(/[^a-zA-Z]/g, "");
}

export function hasMoreThanPercentCaps({ msg: str, percent = 60, minChar = 10 }) {
  if (removeNonAlphabeticalChars(str).length <= minChar) {
    return false;
  }

  let uppercaseCount = 0;
  let alphabeticCount = 0;

  for (let char of str) {
    if (char.match(/[A-Za-z]/)) {
      alphabeticCount++;
      if (char === char.toUpperCase()) {
        uppercaseCount++;
      }
    }
  }

  if (alphabeticCount === 0) {
    return false; // No alphabetic characters, so we return false
  }

  const uppercasePercentage = (uppercaseCount / alphabeticCount) * 100;
  return uppercasePercentage > percent;
}

export const replaceLetters = word => {
  return `${word}|${word
    .replace(/i/g, "1")
    .replace(/a/g, "4")
    .replace(/u/g, "v")
    .replace(/e/g, "3")
    .replace(/o/g, "0")
    .replace(/s/g, "z")}`;
};

export const isValidRecipe = items => {
  const recipes: { [key in Recipes]: string[] } = {
    cowLevel: ["wirtleg", "skeletonkingcage", "necromancerheart"],
    minotaurLevel: ["cowkinghorn"],
    chestblue: ["chestblue"],
    chestgreen: ["chestgreen"],
    chestpurple: ["chestpurple"],
    christmaspresent: ["christmaspresent"],
    chestdead: ["chestdead"],
    chestred: ["chestred"],
    expansion2voucher: ["expansion2voucher"],
    powderquantum: ["powderblack", "powderblue", "powdergold", "powdergreen", "powderred"],
    petegg: ["petegg"],
  };

  const result = Object.entries(recipes).find(([_recipe, formulae]) => {
    if (formulae.length !== items.length) return;

    for (let i = 0; i < items.length; i++) {
      const [item] = items[i].split(":");
      const index = formulae.indexOf(item);

      if (index === -1) break;

      // @ts-ignore
      formulae[index] = false;
    }

    if (formulae.filter(Boolean).length === 0) return true;
  });

  if (result) {
    return result[0] as Recipes;
  }
};

export const getEntityLocation = ({ x, y }): EntityLocation | null => {
  let isInTown;
  let caveWorld1;
  let volcanic;
  let wood;
  let isInTownHouse1;
  let isInTownHouse2;
  let isInTownHouse3Or4;
  let isInTownCave;
  let isSkeletonKing;
  let isSBeach;
  let isInClassicGame;
  let isGrimoireDungeon;
  let greensnakepool;
  let isChaliceDungeon;
  let isSpiderDungeon;
  let isCowLevel;
  let isMinotaurCage;
  let isCaveWorld2;
  let isFreezingLands;
  let isHighPlateau;
  let isSkeletonCommander;
  let isInNecromancerLair;
  let isInExpansion1;
  let woodland;
  let redsnakepool;
  let castleruins;
  let isInExpansion2;
  let isInMagicSkeletonCrypt;
  let isInPoisonSkeletonCrypt;
  let isinTemple;
  let isInAzrealChamber;
  let isButcherGateway;

  if (!x || !y) {
    return null;
  }

  isInTown = x >= 1 && x <= 80 && y >= 192 && y <= 257;
  caveWorld1 = (x >= 141 && x <= 140 && y >= 25 && y <= 37) || (x >= 110 && x <= 169 && y >= 85 && y <= 313);
  volcanic = x >= 0 && x <= 113 && y >= 0 && y <= 54;
  wood = x >= 0 && x <= 83 && y >= 146 && y <= 190;
  isInTownHouse1 = x >= 112 && x <= 139 && y >= 288 && y <= 301;
  isInTownHouse2 = x >= 140 && x <= 169 && y >= 84 && y <= 97;
  isInTownHouse3Or4 = x >= 112 && x <= 169 && y >= 132 && y <= 145;
  isInTownCave = x >= 140 && x <= 169 && y >= 301 && y <= 313;
  isSkeletonKing =
    (x >= 140 && x <= 169 && y >= 84 && y <= 97) || // potions
    (x >= 140 && x <= 169 && y >= 48 && y <= 73) || // lair
    (x >= 68 && x <= 774 && y >= 3 && y <= 10); // bridge
  isCaveWorld2 = (x >= 112 && x <= 141 && y >= 348 && y <= 460) || (x >= 141 && x <= 169 && y >= 396 && y <= 460);
  isSkeletonCommander >= 142 && x <= 149 && y >= 360 && y <= 385;
  isSBeach = x >= 0 && x <= 83 && y >= 254 && y <= 298;
  isInClassicGame = x >= 0 && x <= 113 && y >= 0 && y <= 298;
  greensnakepool = x >= 3 && x <= 4 && y >= 682 && y <= 664;
  isChaliceDungeon = x >= 0 && x <= 28 && y >= 696 && y <= 733;
  isGrimoireDungeon = x >= 29 && x <= 56 && y >= 696 && y <= 733;
  isCowLevel = x >= 0 && x <= 92 && y >= 464 && y <= 535;
  isMinotaurCage = x >= 29 && x <= 52 && y >= 494 && y <= 500;
  isFreezingLands = x >= 0 && x <= 84 && y >= 398 && y <= 452;
  isHighPlateau = x >= 0 && x <= 84 && y >= 370 && y <= 390;
  isInExpansion1 = x >= 0 && x <= 169 && y >= 313 && y <= 463;
  isInNecromancerLair =
    (x >= 140 && x <= 169 && y >= 324 && y <= 349) || (x >= 112 && x <= 139 && y >= 312 && y <= 325);
  isSpiderDungeon = x >= 85 && x <= 112 && y >= 696 && y <= 733;
  woodland = x >= 0 && x <= 169 && y >= 604 && y <= 685;
  redsnakepool = x >= 140 && x <= 169 && y >= 540 && y <= 560;
  castleruins = x >= 85 && x <= 541 && y >= 542 && y <= 627;
  isInExpansion2 = x >= 0 && x <= 171 && y >= 540 && y <= 781;
  isInMagicSkeletonCrypt = x >= 141 && x <= 167 && y >= 696 && y <= 733;
  isInPoisonSkeletonCrypt = x >= 113 && x <= 141 && y >= 696 && y <= 733;
  isButcherGateway = x >= 0 && x <= 29 && y >= 744 && y <= 781;
  isinTemple = x >= 111 && x <= 171 && y >= 744 && y <= 781;
  isInAzrealChamber = x >= 84 && x <= 111 && y >= 744 && y <= 769;
  if (isInNecromancerLair) {
    return "necromancerlair";
  } else if (isSkeletonKing) {
    return "skeletonking";
  } else if (isInTown || isInTownHouse1 || isInTownHouse2 || isInTownHouse3Or4 || isInTownCave) {
    return "town";
  } else if (caveWorld1) {
    return "caveworld1";
  } else if (volcanic) {
    return "volcanic";
  } else if (wood) {
    return "wood";
  } else if (isSBeach) {
    return "beach";
  } else if (isInClassicGame) {
    return "classicgame";
  } else if (isCaveWorld2) {
    return "caveworld2";
  } else if (isFreezingLands) {
    return "freezinglands";
  } else if (isHighPlateau) {
    return "highplateau";
  } else if (isSkeletonCommander) {
    return "skeeletoncommander";
  } else if (isGrimoireDungeon) {
    return "grimoire";
  } else if (greensnakepool) {
    return "greennakepool";
  } else if (isSpiderDungeon) {
    return "spiders";
  } else if (isMinotaurCage) {
    return "minotaurcage";
  } else if (isCowLevel) {
    return "cow";
  } else if (isInExpansion1) {
    return "expansion1";
  } else if (isChaliceDungeon) {
    return "chalice";
  } else if (isInMagicSkeletonCrypt) {
    return "magicskeletoncrypt";
  } else if (isButcherGateway) {
    return "butchergateway";
  } else if (isInPoisonSkeletonCrypt) {
    return "poisonskeletoncrypt";
  } else if (isInAzrealChamber) {
    return "azrealchamber";
  } else if (isinTemple) {
    return "temple";
  } else if (redsnakepool) {
    return "redsnakepool";
  } else if (castleruins) {
    return "castleruins";
  } else if (woodland) {
    return "woodland";
  } else if (isInExpansion2) {
    return "expansion2";
  }
};

export const isClassicLocation = ["town", "caveworld1", "volcanic", "wood", "beach", "skeletonking", "classicgame"];

export const isExpansion1Location = [
  "freezinglands",
  "highplateau",
  "necromancerlair",
  "caveworld2",
  "skeeletoncommander",
  "cow",
  "minotaurcage",
  "expansion1",
];

export const isExpansion2Location = [
  "woodland",
  "spiders",
  "poisonskeletoncrypt",
  "magicskeletoncrypt",
  "castleruins",
  "redsnakepool",
  "butchergateway",
  "temple",
  "azrealchamber",
  "expansion2",
];

export const isLocationOKWithExpansionLocation = (playerLocation, mobLocation): boolean => {
  if (isClassicLocation.includes(playerLocation) || isClassicLocation.includes(mobLocation)) {
    return true;
  } else if (isExpansion1Location.includes(playerLocation) || isExpansion1Location.includes(mobLocation)) {
    return true;
  } else if (isExpansion2Location.includes(playerLocation) || isExpansion2Location.includes(mobLocation)) {
    return true;
  }

  return false;
};

export const getGoldSkin = amount => {
  let skin = 1;
  if (amount >= 100) {
    skin = 3;
  } else if (amount >= 25) {
    skin = 2;
  }

  return skin;
};

export const getisValidMinLevelLocation = (location: EntityLocation, playerLevel: number) => {
  let minLevel = 0;
  let message = "";

  if (location === "skeletonking") {
    minLevel = MIN_SKELETON_KING_LEVEL;
    message = `you need to be ${MIN_SKELETON_KING_LEVEL} to fight the Skeleton King`;
  } else if (location === "necromancerlair") {
    minLevel = MIN_NECROMANCER_LEVEL;
    message = `you need to be ${MIN_NECROMANCER_LEVEL} to enter the Necromancer Lair`;
  } else if (location === "cow") {
    minLevel = MIN_COW_LEVEL;
    message = `you need to be ${MIN_COW_LEVEL} to enter secret Cow level`;
  } else if (location === "minotaurcage") {
    minLevel = MIN_MINOTAUR_LEVEL;
    message = `you need to be ${MIN_MINOTAUR_LEVEL} to fight the Minotaur`;
  } else if (location === "temple") {
    minLevel = MIN_TEMPLE_LEVEL;
    message = `you need to be ${MIN_TEMPLE_LEVEL} to enter the Temple`;
  } else if (location === "azrealchamber") {
    minLevel = MIN_AZRAEL_LEVEL;
    message = `you need to be ${MIN_AZRAEL_LEVEL} to enter Azrael's Chamber`;
  } else if (location === "butchergateway") {
    minLevel = MIN_BUTCHER_GATEWAY_LEVEL;
    message = `you need to be ${MIN_BUTCHER_GATEWAY_LEVEL} to enter the Butcher's Gateway`;
  }

  return {
    message,
    isValid: minLevel < playerLevel,
  };
};
