import Entity from "./entity";
import Messages from "./message";
import { randomOrientation } from "./utils";

class Character extends Entity {
  orientation: any;
  attackers: {};
  targetId: number;
  maxHitPoints: any;
  hitPoints: any;
  id: any;
  poisonedInterval: any;
  resistances?: Resistances;
  element?: Elements;
  enchants?: Enchant[];
  bonus?: any;

  constructor(id, type, kind, x, y) {
    super(id, type, kind, x, y);

    this.orientation = randomOrientation();
    this.attackers = {};
    this.targetId = null;
    this.poisonedInterval = null;
  }

  getState() {
    return Object.assign({}, this._getBaseState(), {
      orientation: this.orientation,
      targetId: this.targetId,
      resistances: this.resistances || null,
      element: this.element || null,
      enchants: this.enchants || null,
    });
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
    const hp = this.hitPoints;
    const max = this.maxHitPoints;

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
    this.targetId = entity.id;
  }

  clearTarget() {
    this.targetId = null;
  }

  hasTarget() {
    return this.targetId !== null;
  }

  attack() {
    return new Messages.Attack(this.id, this.targetId);
  }

  raise(targetId) {
    return new Messages.Raise(this.id, this.targetId || targetId);
  }

  health({ isHurt = false } = {}) {
    return new Messages.Health({ points: this.hitPoints, isRegen: false, isHurt });
  }

  healthEntity() {
    return new Messages.HealthEntity({ points: this.hitPoints, id: this.id });
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
