import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Area from "./area";
import Detect from "./detect";
import { isInt } from "./utils";

import type { Game as GameType } from "./types/game";

class Map {
  game: GameType;
  data: any[];
  isLoaded: boolean;
  tilesetsLoaded: boolean;
  mapLoaded: boolean;
  loadMultiTilesheets: any;
  ready_func: any;
  plateauGrid: any;
  tilesetCount: number = 0;
  grid?: any;
  width: number = 0;
  height: number = 0;
  tilesize: any;
  blocking?: any[];
  plateau?: any[];
  musicAreas?: any[];
  collisions: any;
  high: any;
  animated: any;
  doors?: any;
  checkpoints?: any;
  tilesets?: any;

  constructor(loadMultiTilesheets: any, game: GameType) {
    this.game = game;
    this.data = [];
    this.isLoaded = false;
    this.tilesetsLoaded = false;
    this.mapLoaded = false;
    this.loadMultiTilesheets = loadMultiTilesheets;

    var useWorker = !(this.game.renderer.mobile || this.game.renderer.tablet) && !Detect.isSafari;

    this._loadMap(useWorker);
    this._initTilesets();
  }

  _checkReady() {
    if (this.tilesetsLoaded && this.mapLoaded) {
      this.isLoaded = true;
      if (this.ready_func) {
        this.ready_func();
      }
    }
  }

  _loadMap(useWorker) {
    var self = this,
      filepath = "maps/world_client.json";

    if (useWorker) {
      console.info("Loading map with web worker.");
      // var worker = new Worker("js/mapworker.js");
      var worker = new Worker("mapworker.js");
      worker.postMessage(1);

      worker.onmessage = function (event) {
        var map = event.data;
        self._initMap(map);
        self.grid = map.grid;
        self.plateauGrid = map.plateauGrid;
        self.mapLoaded = true;
        self._checkReady();
      };
    } else {
      console.info("Loading map via Ajax.");
      $.get(
        filepath,
        function (data) {
          self._initMap(data);
          self._generateCollisionGrid();
          self._generatePlateauGrid();
          self.mapLoaded = true;
          self._checkReady();
        },
        "json",
      );
    }
  }

  _initTilesets() {
    var tileset1, tileset2, tileset3;

    if (!this.loadMultiTilesheets) {
      this.tilesetCount = 1;
      tileset1 = this._loadTileset("img/1/tilesheet.png");
    } else {
      if (this.game.renderer.mobile || this.game.renderer.tablet) {
        this.tilesetCount = 1;
        tileset2 = this._loadTileset("img/2/tilesheet.png");
      } else {
        this.tilesetCount = 2;
        tileset2 = this._loadTileset("img/2/tilesheet.png");
        tileset3 = this._loadTileset("img/3/tilesheet.png");
      }
    }

    this.tilesets = [tileset1, tileset2, tileset3];
  }

  _initMap(map) {
    this.width = map.width;
    this.height = map.height;
    this.tilesize = map.tilesize;
    this.data = map.data;
    this.blocking = map.blocking || [];
    this.plateau = map.plateau || [];
    this.musicAreas = map.musicAreas || [];
    this.collisions = map.collisions;
    this.high = map.high;
    this.animated = map.animated;

    this.doors = this._getDoors(map);
    this.checkpoints = this._getCheckpoints(map);
  }

  _getDoors(map) {
    var doors = {},
      self = this;

    _.each(map.doors, function (door) {
      var o;

      switch (door.to) {
        case "u":
          o = Types.Orientations.UP;
          break;
        case "d":
          o = Types.Orientations.DOWN;
          break;
        case "l":
          o = Types.Orientations.LEFT;
          break;
        case "r":
          o = Types.Orientations.RIGHT;
          break;
        default:
          o = Types.Orientations.DOWN;
      }

      doors[self.GridPositionToTileIndex(door.x, door.y)] = {
        x: door.tx,
        y: door.ty,
        orientation: o,
        cameraX: door.tcx,
        cameraY: door.tcy,
        portal: door.p === 1,
      };
    });

    return doors;
  }

  _loadTileset(filepath) {
    var self = this,
      tileset = new Image();

    tileset.crossOrigin = "Anonymous";
    tileset.src = filepath;

    console.info("Loading tileset: " + filepath);

    tileset.onload = function () {
      if (tileset.width % self.tilesize > 0) {
        throw Error("Tileset size should be a multiple of " + self.tilesize);
      }
      console.info("Map tileset loaded.");

      self.tilesetCount -= 1;
      if (self.tilesetCount === 0) {
        console.debug("All map tilesets loaded.");

        self.tilesetsLoaded = true;
        self._checkReady();
      }
    };

    return tileset;
  }

  ready(f) {
    this.ready_func = f;
  }

  tileIndexToGridPosition(tileNum) {
    var x = 0,
      y = 0;

    var getX = function (num, w) {
      if (num == 0) {
        return 0;
      }
      return num % w == 0 ? w - 1 : (num % w) - 1;
    };

    tileNum -= 1;
    x = getX(tileNum + 1, this.width);
    y = Math.floor(tileNum / this.width);

    return { x: x, y: y };
  }

  GridPositionToTileIndex(x, y) {
    return y * this.width + x + 1;
  }

  isColliding(x, y) {
    if (this.isOutOfBounds(x, y) || !this.grid) {
      return false;
    }
    return this.grid[y][x] === 1;
  }

  isPlateau(x, y) {
    if (this.isOutOfBounds(x, y) || !this.plateauGrid) {
      return false;
    }
    return this.plateauGrid[y][x] === 1;
  }

  _generateCollisionGrid() {
    var self = this;

    this.grid = [];
    for (var j, i = 0; i < this.height; i++) {
      this.grid[i] = [];
      for (j = 0; j < this.width; j++) {
        this.grid[i][j] = 0;
      }
    }

    _.each(this.collisions, function (tileIndex) {
      var pos = self.tileIndexToGridPosition(tileIndex + 1);
      self.grid[pos.y][pos.x] = 1;
    });

    _.each(this.blocking, function (tileIndex) {
      var pos = self.tileIndexToGridPosition(tileIndex + 1);
      if (self.grid[pos.y] !== undefined) {
        self.grid[pos.y][pos.x] = 1;
      }
    });
    console.debug("Collision grid generated.");
  }

  _generatePlateauGrid() {
    var tileIndex = 0;

    this.plateauGrid = [];
    for (var j, i = 0; i < this.height; i++) {
      this.plateauGrid[i] = [];
      for (j = 0; j < this.width; j++) {
        if (_.includes(this.plateau, tileIndex)) {
          this.plateauGrid[i][j] = 1;
        } else {
          this.plateauGrid[i][j] = 0;
        }
        tileIndex += 1;
      }
    }
    console.info("Plateau grid generated.");
  }

  /**
   * Returns true if the given position is located within the dimensions of the map.
   *
   * @returns {Boolean} Whether the position is out of bounds.
   */
  isOutOfBounds(x, y) {
    return isInt(x) && isInt(y) && (x < 0 || x >= this.width || y < 0 || y >= this.height);
  }

  /**
   * Returns true if the given tile id is "high", i.e. above all entities.
   * Used by the renderer to know which tiles to draw after all the entities
   * have been drawn.
   *
   * @param {Number} id The tile id in the tileset
   * @see Renderer.drawHighTiles
   */
  isHighTile(id) {
    return _.indexOf(this.high, id + 1) >= 0;
  }

  /**
   * Returns true if the tile is animated. Used by the renderer.
   * @param {Number} id The tile id in the tileset
   */
  isAnimatedTile(id) {
    return id + 1 in this.animated;
  }

  getTileAnimationLength(id) {
    return this.animated[id + 1].l;
  }

  getTileAnimationDelay(id) {
    var animProperties = this.animated[id + 1];
    if (animProperties.d) {
      return animProperties.d;
    } else {
      return 100;
    }
  }

  isDoor(x, y) {
    return this.doors[this.GridPositionToTileIndex(x, y)] !== undefined;
  }

  getDoorDestination(x, y) {
    return this.doors[this.GridPositionToTileIndex(x, y)];
  }

  _getCheckpoints(map) {
    var checkpoints = [];
    _.each(map.checkpoints, function (cp) {
      var area = new Area(cp.x, cp.y, cp.w, cp.h);
      area.id = cp.id;
      checkpoints.push(area);
    });
    return checkpoints;
  }

  getCurrentCheckpoint(entity) {
    return _.find(this.checkpoints, function (checkpoint) {
      return checkpoint.contains(entity);
    });
  }
}

export default Map;
