var Entity = require("./entity");
var Messages = require("./message");
var Utils = require("./utils");

var Character = Entity.extend({
  init: function (id, type, kind, x, y) {
    this._super(id, type, kind, x, y);

    this.orientation = Utils.randomOrientation();
    this.attackers = {};
    this.target = null;
  },

  getState: function () {
    var basestate = this._getBaseState(),
      state = [];

    state.push(this.orientation);
    if (this.target) {
      state.push(this.target);
    }

    return basestate.concat(state);
  },

  resetHitPoints: function (maxHitPoints) {
    this.maxHitPoints = maxHitPoints;
    this.hitPoints = this.maxHitPoints;
  },

  updateMaxHitPoints: function (maxHitPoints) {
    this.maxHitPoints = maxHitPoints;
    if (this.hitPoints > maxHitPoints) {
      this.hitPoints = maxHitPoints;
    }
  },

  regenHealthBy: function (value) {
    var hp = this.hitPoints,
      max = this.maxHitPoints;

    if (hp < max) {
      if (hp + value <= max) {
        this.hitPoints += value;
      } else {
        this.hitPoints = max;
      }
    }
  },

  hasFullHealth: function () {
    return this.hitPoints === this.maxHitPoints;
  },

  setTarget: function (entity) {
    this.target = entity.id;
  },

  clearTarget: function () {
    this.target = null;
  },

  hasTarget: function () {
    return this.target !== null;
  },

  attack: function () {
    return new Messages.Attack(this.id, this.target);
  },

  raise: function (mobId) {
    return new Messages.Raise(mobId);
  },

  health: function ({ isHurt } = {}) {
    return new Messages.Health({ points: this.hitPoints, isRegen: false, isHurt });
  },

  regen: function () {
    return new Messages.Health({ points: this.hitPoints, isRegen: true });
  },

  addAttacker: function (entity) {
    if (entity) {
      this.attackers[entity.id] = entity;
    }
  },

  removeAttacker: function (entity) {
    if (entity && entity.id in this.attackers) {
      delete this.attackers[entity.id];
      log.debug(this.id + " REMOVED ATTACKER " + entity.id);
    }
  },

  forEachAttacker: function (callback) {
    for (var id = 0; id < this.attackers.length; id++) {
      callback(this.attackers[id]);
    }
  },
});

module.exports = Character;
