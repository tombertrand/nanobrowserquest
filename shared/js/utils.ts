export const HASH_BAN_DELAY = 60000;

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

export function hasMoreThanPercentCaps(str, percent = 60, minChar = 5) {
  
  
  if (str.length <= minChar){
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
