import Character from "./character";
import { randomOrientation } from "./utils";

class Pet extends Character {
  ownerId: number;
  skin: number;
  level: number;
  bonus: any;
  isPet: boolean;
  moveCallback: () => void;
  // move_callback: (x: number, y: number) => void;

  constructor({ id, type = "pet", kind, skin, x, y, ownerId, level, bonus }) {
    super(id, type, kind, x, y);

    this.orientation = randomOrientation();
    this.attackers = {};
    this.targetId = null;
    this.poisonedInterval = null;
    this.ownerId = ownerId;
    this.skin = skin;
    this.isPet = true;
    this.level = level;
    this.bonus = bonus;
  }

  getState() {
    return Object.assign({}, this._getBaseState(), {
      orientation: this.orientation,
      targetId: this.targetId,
      isPet: this.isPet,
      resistances: this.resistances || null,
      element: this.element || null,
      enchants: this.enchants || null,
      skin: this.skin,
      level: this.level,
      bonus: this.bonus,
      ownerId: this.ownerId,
    });
  }

  onMove(callback) {
    this.moveCallback = callback;
  }
}

export default Pet;
