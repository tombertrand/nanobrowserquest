import Entity from "./entity";

class Npc extends Entity {
  respawnCallback: any;

  constructor(id, kind, x, y) {
    super(id, "npc", kind, x, y);
  }

  onRespawn(callback) {
    this.respawnCallback = callback;
  }

  hasFullHealth() {
    return true;
  }
}

export default Npc;
