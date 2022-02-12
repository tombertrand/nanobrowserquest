import { Types } from "../../shared/js/gametypes";

import Entity from "./entity";

class Chest extends Entity {
  open_callback: any;

  constructor(id) {
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
