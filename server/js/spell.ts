import * as _ from "lodash";

// import { Types } from "../../shared/js/gametypes";
import { MobArea } from "./area";
// import Character from "./character";
import Entity from "./entity";
// import ChestArea from "./chestarea";
import Messages from "./message";

class Spell extends Entity {
  spawningX: any;
  spawningY: any;
  isDead: boolean;
  destroyTime: any;
  destroyCallback: any;
  area: MobArea;
  moveCallback: any;
  kind: number;

  constructor(id, kind, x, y) {
    super(id, "spell", kind, x, y);

    this.spawningX = x;
    this.spawningY = y;
    this.isDead = false;
    this.destroyTime = null;
  }

  destroy() {
    this.isDead = true;
    this.destroyTime = Date.now();

    if (this.destroyCallback) {
      this.destroyCallback();
    }
  }

  drop(item) {
    if (item) {
      return new Messages.Drop(this, item);
    }
  }

  cast(delay = 0, duration, endCallback) {
    setTimeout(() => {
      console.log("~~~CAST!");

      setTimeout(() => {
        endCallback();
      }, duration);
    }, delay);
  }

  onDestroy(callback) {
    this.destroyCallback = callback;
  }

  onMove(callback) {
    this.moveCallback = callback;
  }

  move(x, y) {
    this.setPosition(x, y);
    if (this.moveCallback) {
      this.moveCallback(this);
    }
  }
}

export default Spell;
