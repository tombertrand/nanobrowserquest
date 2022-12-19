import Entity from "./entity";
import Messages from "./message";

class Npc extends Entity {
  respawnCallback: any;
  isDead: boolean;
  isActivated: boolean;

  constructor(id, kind, x, y) {
    super(id, "npc", kind, x, y);

    this.isActivated = false;
  }

  getState() {
    return Object.assign({}, this._getBaseState(), {
      isActivated: this.isActivated,
    });
  }

  onRespawn(callback) {
    this.respawnCallback = callback;
  }

  activate() {
    this.isActivated = true;
  }

  reset() {
    this.isActivated = false;
  }

  raise() {
    return new Messages.Raise(this.id);
  }

  hasFullHealth() {
    return true;
  }
}

export default Npc;
