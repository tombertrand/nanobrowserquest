import { Types } from "../../shared/js/gametypes";
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
  originX?: number;
  originY?: number;
  element: Elements;
  dmg: number;
  casterId: number;
  casterKind: number;
  targetId?: number;
  isRaise2?: boolean;

  constructor({ id, kind, x, y, orientation, originX, originY, element, casterId, casterKind, targetId, isRaise2 }) {
    super(id, "spell", kind, x, y);

    this.spawningX = x;
    this.spawningY = y;
    this.isDead = false;
    this.destroyTime = null;
    this.orientation = orientation;
    this.originX = originX;
    this.originY = originY;
    this.element = element;
    this.casterId = casterId;
    this.casterKind = casterKind;
    this.targetId = targetId;
    this.isRaise2 = isRaise2;

    // set last because it depends on casterKind
    this.dmg = this.getDmg();
  }

  // @NOTE Since there is no entity class on the server
  getDmg() {
    let dmg = 0;
    if (this.kind === Types.Entities.DEATHANGELSPELL) {
      dmg = 300;
    } else if (this.kind === Types.Entities.DEATHBRINGERSPELL) {
      dmg = 10;
    } else if (this.kind === Types.Entities.MAGESPELL) {
      if (this.casterKind === Types.Entities.SHAMAN) {
        dmg = 320;
      } else {
        dmg = 240;
      }
    } else if (this.kind === Types.Entities.ARROW) {
      dmg = 240;
    } else if (this.kind === Types.Entities.STATUESPELL || this.kind === Types.Entities.STATUE2SPELL) {
      dmg = 300;
    }
    return dmg;
  }

  getState() {
    return Object.assign({}, this._getBaseState(), {
      orientation: this.orientation,
      originX: this.originX,
      originY: this.originY,
      element: this.element,
      casterId: this.casterId,
      targetId: this.targetId,
      isRaise2: this.isRaise2,
    });
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
