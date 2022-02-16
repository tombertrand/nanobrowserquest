import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Mob from "./mob";
import { random } from "./utils";

class Area {
  id: any;
  x: any;
  y: any;
  width: any;
  height: any;
  world: any;
  entities: any[];
  hasCompletelyRespawned: boolean;
  emptyCallback: any;
  nbEntities: any;

  constructor(id, x, y, width, height, world) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.world = world;
    this.entities = [];
    this.hasCompletelyRespawned = true;
  }

  _getRandomPositionInsideArea() {
    var pos: { x: number; y: number } = {} as any;
    var valid = false;

    while (!valid) {
      pos.x = this.x + random(this.width + 1);
      pos.y = this.y + random(this.height + 1);
      valid = this.world.isValidPosition(pos.x, pos.y);
    }
    return pos;
  }

  removeFromArea(entity) {
    var i = _.indexOf(_.map(this.entities, "id"), entity.id);
    this.entities.splice(i, 1);

    if (this.isEmpty() && this.hasCompletelyRespawned && this.emptyCallback) {
      this.hasCompletelyRespawned = false;
      this.emptyCallback();
    }
  }

  addToArea(entity) {
    if (entity) {
      this.entities.push(entity);
      entity.area = this;
      if (entity instanceof Mob) {
        this.world.addMob(entity);
      }
    }

    if (this.isFull()) {
      this.hasCompletelyRespawned = true;
    }
  }

  setNumberOfEntities(nb) {
    this.nbEntities = nb;
  }

  isEmpty() {
    return !_.some(this.entities, function (entity) {
      return !entity.isDead;
    });
  }

  isFull() {
    return !this.isEmpty() && this.nbEntities === _.size(this.entities);
  }

  onEmpty(callback) {
    this.emptyCallback = callback;
  }
}

class MobArea extends Area {
  nb: any;
  kind: any;
  respawns: any[];

  constructor(id, nb, kind, x, y, width, height, world) {
    super(id, x, y, width, height, world);
    this.nb = nb;
    this.kind = kind;
    this.respawns = [];
    this.setNumberOfEntities(this.nb);

    // Enable random roaming for monsters
    // (comment this out to disable roaming)
    this.initRoaming();
  }

  spawnMobs() {
    for (var i = 0; i < this.nb; i += 1) {
      this.addToArea(this._createMobInsideArea());
    }
  }

  _createMobInsideArea() {
    var kind = Types.getKindFromString(this.kind);

    var pos = this._getRandomPositionInsideArea();
    var mob = new Mob("1" + this.id + "" + kind + "" + this.entities.length, kind, pos.x, pos.y);

    mob.onMove(this.world.onMobMoveCallback.bind(this.world));

    return mob;
  }

  respawnMob(mob, delay) {
    var self = this;

    this.removeFromArea(mob);

    setTimeout(function () {
      var pos = self._getRandomPositionInsideArea();

      mob.x = pos.x;
      mob.y = pos.y;

      mob.isDead = false;
      self.addToArea(mob);
      self.world.addMob(mob);
    }, delay);
  }

  initRoaming() {
    var self = this;

    setInterval(function () {
      _.each(self.entities, function (mob) {
        var canRoam = random(20) === 1;
        var pos;

        if (canRoam) {
          if (!mob.hasTarget() && !mob.isDead) {
            pos = self._getRandomPositionInsideArea();
            mob.move(pos.x, pos.y);
          }
        }
      });
    }, 500);
  }

  createReward() {
    var pos = this._getRandomPositionInsideArea();

    return { x: pos.x, y: pos.y, kind: Types.Entities.CHEST };
  }
}

class ChestArea extends Area {
  items: any;
  chestX: any;
  chestY: any;

  constructor(id, x, y, width, height, cx, cy, items, world) {
    super(id, x, y, width, height, world);
    this.items = items;
    this.chestX = cx;
    this.chestY = cy;
  }

  contains(entity) {
    if (entity) {
      return (
        entity.x >= this.x && entity.y >= this.y && entity.x < this.x + this.width && entity.y < this.y + this.height
      );
    } else {
      return false;
    }
  }
}

export { Area, MobArea, ChestArea };
