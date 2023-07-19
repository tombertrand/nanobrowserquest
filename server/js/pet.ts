import Character from "./character";
import { randomOrientation } from "./utils";

class Pet extends Character {
  owner: string;

  constructor(id, type, kind, x, y) {
    super(id, type, kind, x, y);

    this.orientation = randomOrientation();
    this.attackers = {};
    this.targetId = null;
    this.poisonedInterval = null;
  }

  getState() {
    return Object.assign({}, this._getBaseState(), {
      orientation: this.orientation,
      targetId: this.targetId,
      resistances: this.resistances || null,
      element: this.element || null,
      enchants: this.enchants || null,
    });
  }
}

export default Pet;
