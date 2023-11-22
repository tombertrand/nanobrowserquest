import { Types } from "../gametypes";

export const attackBonuPercentsFromWeightMap = {
  light: -15,
  normal: 0,
  heavy: 25,
  "Super heavy": 35,
};
export const getAttackSpeedBonusFromStringMap = {
  light: 20,
  normal: 0,
  heavy: -15,
  "Super heavy": -20,
};

export const getWeaponWeightbyKind = (kind: number): string => {
  let weights = ["light", "normal", "heavy", "Super heavy"];

  if (typeof kind !== "number") return;

  if (Types.Entities.LightWeapons.includes(kind)) {
    return weights[0];
  } else if (Types.Entities.HeavyWeapons.includes(kind)) {
    return weights[2];
  } else if (Types.Entities.SuperHeavyWeapons.includes(kind)) {
    return weights[3];
  } else {
    return weights[1];
  }
};
