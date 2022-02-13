import * as _ from "lodash";

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

export default Area;
