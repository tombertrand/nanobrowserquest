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
