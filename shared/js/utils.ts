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
