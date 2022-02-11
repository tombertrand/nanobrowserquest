import Entity from "./entity";

import { Types } from "../../shared/js/gametypes";

class Chest extends Entity {
  constructor(id, kind) {
    super(id, Types.Entities.CHEST);
  }

  getSpriteName() {
    return "chest";
  }

  isMoving() {
    return false;
  }

  open() {
    if (this.open_callback) {
      this.open_callback();
    }
  }

  onOpen(callback) {
    this.open_callback = callback;
  }
}

export default Chest;
