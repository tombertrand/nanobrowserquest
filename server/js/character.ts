import Entity from "./entity";
import Messages from "./message";
import { randomOrientation } from "./utils";

class Character extends Entity {
  orientation: any;
  attackers: {};
  target: any;
  maxHitPoints: any;
  hitPoints: any;
  id: any;

  constructor(id, type, kind, x, y) {
    super(id, type, kind, x, y);

    this.orientation = randomOrientation();
    this.attackers = {};
    this.target = null;
  }

  getState() {
    var basestate = this._getBaseState();
    var state = [];

    state.push(this.orientation);
    state.push(this.target);

    return basestate.concat(state);
  }

  resetHitPoints(maxHitPoints) {
    this.maxHitPoints = maxHitPoints;
    this.hitPoints = this.maxHitPoints;
  }

  updateMaxHitPoints(maxHitPoints) {
    this.maxHitPoints = maxHitPoints;
    if (this.hitPoints > maxHitPoints) {
      this.hitPoints = maxHitPoints;
    }
  }

  regenHealthBy(value) {
    var hp = this.hitPoints,
      max = this.maxHitPoints;

    if (hp < max) {
      if (hp + value <= max) {
        this.hitPoints += value;
      } else {
        this.hitPoints = max;
      }
    }
  }

  hasFullHealth() {
    return this.hitPoints === this.maxHitPoints;
  }

  setTarget(entity) {
    this.target = entity.id;
  }

  clearTarget() {
    this.target = null;
  }

  hasTarget() {
    return this.target !== null;
  }

  attack() {
    return new Messages.Attack(this.id, this.target);
  }

  raise(targetId) {
    return new Messages.Raise(this.id, this.target || targetId);
  }

  health({ isHurt = false } = {}) {
    return new Messages.Health({ points: this.hitPoints, isRegen: false, isHurt });
  }

  regen() {
    return new Messages.Health({ points: this.hitPoints, isRegen: true });
  }

  addAttacker(entity) {
    if (entity) {
      this.attackers[entity.id] = entity;
    }
  }

  removeAttacker(entity) {
    if (entity && entity.id in this.attackers) {
      delete this.attackers[entity.id];
      console.debug(this.id + " REMOVED ATTACKER " + entity.id);
    }
  }

  forEachAttacker(callback) {
    for (let id in this.attackers) {
      callback(this.attackers[id]);
    }
  }
}

export default Character;
