import fs from "fs";
import * as _ from "lodash";

import { Area } from "./area";
import Checkpoint from "./checkpoint";
import { randomInt } from "./utils";

class Map {
  isLoaded: boolean;
  width: any;
  height: any;
  collisions: any;
  mobAreas: any;
  chestAreas: any;
  staticChests: any;
  staticEntities: any;
  zoneWidth: number;
  zoneHeight: number;
  groupWidth: number;
  groupHeight: number;
  readyFunc: any;
  grid: any[];
  connectedGroups: any;
  checkpoints: {};
  startingAreas: any[];

  constructor(filepath) {
    var self = this;

    this.isLoaded = false;

    fs.exists(filepath, function (exists) {
      if (!exists) {
        console.error(filepath + " doesn't exist.");
        return;
      }

      fs.readFile(filepath, function (err, file) {
        var json = JSON.parse(file.toString());

        self.initMap(json);
      });
    });
  }

  initMap(thismap) {
    this.width = thismap.width;
    this.height = thismap.height;
    this.collisions = thismap.collisions;
    this.mobAreas = thismap.roamingAreas;
    this.chestAreas = thismap.chestAreas;
    this.staticChests = thismap.staticChests;
    this.staticEntities = thismap.staticEntities;
    this.isLoaded = true;

    // zone groups
    this.zoneWidth = 28;
    this.zoneHeight = 12;
    this.groupWidth = Math.floor(this.width / this.zoneWidth);
    this.groupHeight = Math.floor(this.height / this.zoneHeight);

    this.initConnectedGroups(thismap.doors);
    this.initCheckpoints(thismap.checkpoints);

    if (this.readyFunc) {
      this.readyFunc();
    }
  }

  ready(f) {
    this.readyFunc = f;
  }

  tileIndexToGridPosition(tileNum) {
    var x = 0;
    var y = 0;

    var getX = function (num, w) {
      if (num === 0) {
        return 0;
      }
      return num % w === 0 ? w - 1 : (num % w) - 1;
    };

    tileNum -= 1;
    x = getX(tileNum + 1, this.width);
    y = Math.floor(tileNum / this.width);

    return { x: x, y: y };
  }

  GridPositionToTileIndex(x, y) {
    return y * this.width + x + 1;
  }

  generateCollisionGrid() {
    this.grid = [];

    if (this.isLoaded) {
      var tileIndex = 0;
      for (var j, i = 0; i < this.height; i++) {
        this.grid[i] = [];
        for (j = 0; j < this.width; j++) {
          if (_.includes(this.collisions, tileIndex)) {
            this.grid[i][j] = 1;
          } else {
            this.grid[i][j] = 0;
          }
          tileIndex += 1;
        }
      }
      console.debug("Collision grid generated.");
    }
  }

  isOutOfBounds(x, y) {
    return x <= 0 || x >= this.width || y <= 0 || y >= this.height;
  }

  isColliding(x, y) {
    if (this.isOutOfBounds(x, y)) {
      return false;
    }
    return this.grid[y][x] === 1;
  }

  GroupIdToGroupPosition(id) {
    var posArray = id.split("-");

    return pos(parseInt(posArray[0], 10), parseInt(posArray[1], 10));
  }

  forEachGroup(callback) {
    var width = this.groupWidth;
    var height = this.groupHeight;

    for (var x = 0; x < width; x += 1) {
      for (var y = 0; y < height; y += 1) {
        callback(x + "-" + y);
      }
    }
  }

  getGroupIdFromPosition(x, y) {
    var w = this.zoneWidth;
    var h = this.zoneHeight;
    var gx = Math.floor((x - 1) / w);
    var gy = Math.floor((y - 1) / h);

    return gx + "-" + gy;
  }

  getAdjacentGroupPositions(id) {
    var self = this;
    var position = this.GroupIdToGroupPosition(id);
    var x = position.x;
    var y = position.y;
    // surrounding groups
    var list = [
      pos(x - 1, y - 1),
      pos(x, y - 1),
      pos(x + 1, y - 1),
      pos(x - 1, y),
      pos(x, y),
      pos(x + 1, y),
      pos(x - 1, y + 1),
      pos(x, y + 1),
      pos(x + 1, y + 1),
    ];

    // groups connected via doors
    _.each(this.connectedGroups[id], function (position) {
      // don't add a connected group if it's already part of the surrounding ones.
      if (
        !_.some(list, function (groupPos) {
          return equalPositions(groupPos, position);
        })
      ) {
        list.push(position);
      }
    });

    return _.reject(list, function (pos) {
      return pos.x < 0 || pos.y < 0 || pos.x >= self.groupWidth || pos.y >= self.groupHeight;
    });
  }

  forEachAdjacentGroup(groupId, callback) {
    if (groupId) {
      _.each(this.getAdjacentGroupPositions(groupId), function (pos) {
        callback(pos.x + "-" + pos.y);
      });
    }
  }

  initConnectedGroups(doors) {
    var self = this;

    this.connectedGroups = {};
    _.each(doors, function (door) {
      var groupId = self.getGroupIdFromPosition(door.x, door.y);
      var connectedGroupId = self.getGroupIdFromPosition(door.tx, door.ty);
      var connectedPosition = self.GroupIdToGroupPosition(connectedGroupId);

      if (groupId in self.connectedGroups) {
        self.connectedGroups[groupId].push(connectedPosition);
      } else {
        self.connectedGroups[groupId] = [connectedPosition];
      }
    });
  }

  initCheckpoints(cpList) {
    var self = this;

    this.checkpoints = {};
    this.startingAreas = [];

    _.each(cpList, function (cp) {
      var checkpoint = new Checkpoint(cp.id, cp.x, cp.y, cp.w, cp.h);
      self.checkpoints[checkpoint.id] = checkpoint;
      if (cp.s === 1) {
        self.startingAreas.push(checkpoint);
      }
    });
  }

  getCheckpoint(id) {
    return this.checkpoints[id];
  }

  getRandomStartingPosition() {
    var nbAreas = _.size(this.startingAreas),
      i = randomInt(0, nbAreas - 1),
      area = this.startingAreas[i];

    return area.getRandomPosition();
  }
}

var pos = function (x, y) {
  return { x: x, y: y };
};

var equalPositions = function (pos1, pos2) {
  return pos1.x === pos2.x && pos2.y === pos2.y;
};

export default Map;
