import Character from "./character";
import { randomOrientation } from "./utils";

class Pet extends Character {
  ownerId: number;
  skin: number;

  constructor({ id, type = "pet", kind, skin, x, y, ownerId }) {
    super(id, type, kind, x, y);

    this.orientation = randomOrientation();
    this.attackers = {};
    this.targetId = null;
    this.poisonedInterval = null;
    this.ownerId = ownerId;
    this.skin = skin;
  }

  getState() {
    return Object.assign({}, this._getBaseState(), {
      orientation: this.orientation,
      targetId: this.targetId,
      resistances: this.resistances || null,
      element: this.element || null,
      enchants: this.enchants || null,
      skin: this.skin,
      ownerId: this.ownerId,
    });
  }
}

export default Pet;
