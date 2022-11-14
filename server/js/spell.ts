import * as _ from "lodash";

// import { Types } from "../../shared/js/gametypes";
import { MobArea } from "./area";
import Entity from "./entity";
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
  orientation: number;
  originX: number;
  originY: number;
  element: "magic" | "flame" | "lightning" | "cold" | "poison" | "physical";

  constructor(id, kind, x, y, orientation, originX, originY, element) {
    super(id, "spell", kind, x, y);

    this.spawningX = x;
    this.spawningY = y;
    this.isDead = false;
    this.destroyTime = null;
    this.orientation = orientation;
    this.originX = originX;
    this.originY = originY;
    this.element = element;
  }

  getState() {
    var basestate = this._getBaseState();
    var state = [];

    state.push(this.orientation);
    state.push(this.originX);
    state.push(this.originY);
    state.push(this.element);

    return basestate.concat(state);
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
