import Messages from "./message";
import { random } from "./utils";

class Entity {
  id: number;
  type: any;
  kind: number;
  x: number;
  y: number;
  hitPoints: number;

  constructor(id, type, kind, x, y) {
    this.id = parseInt(id, 10);
    this.type = type;
    this.kind = kind;
    this.x = x;
    this.y = y;
  }

  destroy() {}

  _getBaseState() {
    return { id: this.id, kind: this.kind, x: this.x, y: this.y, hitPoints: this.hitPoints };
  }

  getState() {
    return this._getBaseState();
  }

  spawn() {
    return new Messages.Spawn(this);
  }

  despawn() {
    return new Messages.Despawn(this.id);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  getPositionNextTo(entity) {
    var pos = null;
    if (entity) {
      pos = {};
      // This is a quick & dirty way to give mobs a random position
      // close to another entity.
      var r = random(4);

      pos.x = entity.x;
      pos.y = entity.y;
      if (r === 0) {
        pos.y -= 1;
      }
      if (r === 1) {
        pos.y += 1;
      }
      if (r === 2) {
        pos.x -= 1;
      }
      if (r === 3) {
        pos.x += 1;
      }
    }
    return pos;
  }
}

export default Entity;
