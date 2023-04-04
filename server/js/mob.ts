import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import { ChestArea, MobArea } from "./area";
import Character from "./character";
import Messages from "./message";
import Properties from "./properties";
import { distanceTo, random, randomInt } from "./utils";

class Mob extends Character {
  spawningX: any;
  spawningY: any;
  armorLevel: any;
  weaponLevel: any;
  hateList: any[];
  respawnTimeout: any;
  returnTimeout: any;
  isDead: boolean;
  hateCount: number;
  tankerlist: any[];
  destroyTime: any;
  destroyCallback: any;
  hitPoints: number;
  area: MobArea;
  respawnCallback: any;
  moveCallback: any;
  kind: number;
  name: string;
  resistances: Resistances;
  element: Elements;
  enchants: Enchant[];
  hasTaunted: boolean;

  constructor(id, kind, x, y) {
    super(id, "mob", kind, x, y);

    this.updateHitPoints();
    this.spawningX = x;
    this.spawningY = y;
    this.armorLevel = Properties.getArmorLevel(this.kind);
    this.weaponLevel = Properties.getWeaponLevel(this.kind);
    this.hateList = [];
    this.respawnTimeout = null;
    this.returnTimeout = null;
    this.isDead = false;
    this.hateCount = 0;
    this.tankerlist = [];
    this.destroyTime = null;
    this.name = Types.getKindAsString(kind);
    this.resistances = Types.getResistance(this);
    this.enchants = null;
    this.hasTaunted = false;

    this.handleRandomElement();
    this.handleRandomResistances();
    this.handleEnchant();
  }

  assignRandomResistances(count: number) {
    let randomResistances = _.shuffle(Object.keys(Types.mobResistance[this.name]));
    let immunedResistances = [];

    if (this.element) {
      immunedResistances.push(`${this.element}Resistance`);
      randomResistances = [...immunedResistances, ...randomResistances.filter(r => !immunedResistances.includes(r))];
    }

    this.resistances = randomResistances.slice(0, count).reduce((acc, resistance, index) => {
      if (immunedResistances.includes(resistance)) {
        acc[resistance] = 100;
      } else {
        acc[resistance] = Types.mobResistance[this.name][resistance];
      }

      if (this.kind === Types.Entities.DEATHANGEL && index !== 0) {
        acc[resistance] = randomInt(2, 8) * 10;
      }

      return acc;
    }, {});

    this.resistances = _.fromPairs(_.sortBy(_.toPairs(this.resistances), 1).reverse());
  }

  handleRandomElement() {
    if ([Types.Entities.MAGE, Types.Entities.SKELETONARCHER, Types.Entities.SHAMAN].includes(this.kind)) {
      this.element = Types.getRandomElement();

      if (this.kind === Types.Entities.SKELETONARCHER && this.element === "spectral") {
        // @ts-ignore No spectral arrow, revert back to a normal arrow
        this.element = undefined;
      }
    }
  }

  handleEnchant() {
    this.enchants = [...(Types.mobEnchant[this.name] || [])];

    const enchants: Enchant[] = ["magic", "flame", "lightning", "cold", "poison", "spectral", "physical", "stoneskin"];

    if (
      [Types.Entities.SPIDERQUEEN, Types.Entities.BUTCHER, Types.Entities.SHAMAN, Types.Entities.DEATHANGEL].includes(
        this.kind,
      )
    ) {
      // Add 2 random extra enchant
      const extraEnchants = _.shuffle(enchants.filter(enchant => !this.enchants.includes(enchant))).slice(0, 2);
      this.enchants = this.enchants.concat(extraEnchants);
    }

    if (this.kind > Types.Entities.ZOMBIE && !this.enchants.length) {
      if (Types.isBoss(this.kind)) {
        this.enchants = _.shuffle(enchants).slice(0, this.kind === Types.Entities.NECROMANCER ? 1 : 2);
      } else {
        this.enchants = this.element ? [this.element] : _.shuffle(enchants).slice(0, 1);
      }
    }

    if (!Types.isBoss(this.kind)) {
      const isMiniBoss = random(this.kind === Types.Entities.COW ? 50 : 20) === 1;
      if (!isMiniBoss) return;

      let enchantCount = 0;
      if (this.kind <= Types.Entities.DEATHKNIGHT) {
        enchantCount = 1;
      } else if (this.kind <= Types.Entities.COW) {
        enchantCount = 2;
      } else if (this.kind >= Types.Entities.RAT3) {
        enchantCount = 3;
      }

      enchantCount = enchantCount - this.enchants.length;
      this.enchants = this.enchants.concat(
        _.shuffle(enchants.filter(enchant => !this.enchants.includes(enchant))).slice(0, enchantCount),
      );

      // double hitpoints for minibosses
      this.hitPoints = Properties.getHitPoints(this.kind) * 2;
    }

    // 50% of bosses inherits stone skin
    if (Types.isBoss(this.kind) && !this.enchants.includes("stoneskin")) {
      const hasStoneSkin = random(2);
      if (hasStoneSkin) {
        if (this.enchants.length >= 3) {
          this.enchants[this.enchants.length - 1] = "stoneskin";
        } else {
          this.enchants.push("stoneskin");
        }
      }
    }
  }

  // @NOTE Since there is no Mob factory on Server side, have the exceptions stored here
  handleRandomResistances() {
    if (
      [
        Types.Entities.RAT3,
        Types.Entities.SNAKE3,
        Types.Entities.SNAKE4,
        Types.Entities.OCULOTHORAX,
        Types.Entities.KOBOLD,
        Types.Entities.SPIDER,
        Types.Entities.SPIDER2,
        Types.Entities.SKELETONBERSERKER,
        Types.Entities.SKELETONARCHER,
      ].includes(this.kind)
    ) {
      this.assignRandomResistances(1);
    } else if (
      [
        Types.Entities.GHOST,
        Types.Entities.SKELETONTEMPLAR,
        Types.Entities.SKELETONTEMPLAR2,
        Types.Entities.MAGE,
        Types.Entities.SHAMAN,
        Types.Entities.WRAITH2,
      ].includes(this.kind)
    ) {
      this.assignRandomResistances(2);
    } else if (
      [Types.Entities.SPIDERQUEEN, Types.Entities.BUTCHER, Types.Entities.SHAMAN, Types.Entities.DEATHANGEL].includes(
        this.kind,
      )
    ) {
      this.assignRandomResistances(3);
    }
  }

  destroy(delay = 30000) {
    this.isDead = true;
    this.hasTaunted = false;
    this.destroyTime = Date.now();
    this.hateList = [];
    this.tankerlist = [];
    this.clearTarget();
    this.updateHitPoints();
    this.resetPosition();

    if (this.kind !== Types.Entities.ZOMBIE && this.kind !== Types.Entities.MINOTAUR) {
      this.handleRespawn(delay);
    }

    if (this.destroyCallback) {
      this.destroyCallback();
    }
  }

  receiveDamage(points) {
    this.hitPoints -= points;
  }

  hates(playerId) {
    return _.some(this.hateList, function (obj) {
      return obj.id === playerId;
    });
  }

  increaseHateFor(playerId, points) {
    if (this.hates(playerId)) {
      _.find(this.hateList, function (obj) {
        return obj.id === playerId;
      }).hate += points;
    } else {
      this.hateList.push({ id: playerId, hate: points });
    }

    if (this.returnTimeout) {
      // Prevent the mob from returning to its spawning position
      // since it has aggroed a new player
      clearTimeout(this.returnTimeout);
      this.returnTimeout = null;
    }
  }

  addTanker(playerId) {
    var i = 0;
    for (i = 0; i < this.tankerlist.length; i++) {
      if (this.tankerlist[i].id === playerId) {
        this.tankerlist[i].points++;
        break;
      }
    }
    if (i >= this.tankerlist.length) {
      this.tankerlist.push({ id: playerId, points: 1 });
    }
  }

  getMainTankerId() {
    var i = 0;
    var mainTanker = null;
    for (i = 0; i < this.tankerlist.length; i++) {
      if (mainTanker === null) {
        mainTanker = this.tankerlist[i];
        continue;
      }
      if (mainTanker.points < this.tankerlist[i].points) {
        mainTanker = this.tankerlist[i];
      }
    }

    if (mainTanker) {
      return mainTanker.id;
    } else {
      return null;
    }
  }

  getHatedPlayerId(hateRank?: number, ignorePlayerId?: number) {
    var i;
    var playerId;

    if (ignorePlayerId) {
      this.hateList = this.hateList.filter(hatedPlayer => hatedPlayer.id !== ignorePlayerId);
    }

    var sorted = _.sortBy(this.hateList, function (obj) {
      return obj.hate;
    });
    var size = _.size(this.hateList);

    if (hateRank && hateRank <= size) {
      i = size - hateRank;
    } else {
      if (size === 1) {
        i = size - 1;
      } else {
        this.hateCount++;
        if (this.hateCount > size * 1.3) {
          this.hateCount = 0;
          i = size - 1 - random(size - 1);
          console.info("CHANGE TARGET: " + i);
        } else {
          return 0;
        }
      }
    }
    if (sorted && sorted[i]) {
      playerId = sorted[i].id;
    }

    return playerId;
  }

  forgetPlayer(playerId, duration) {
    this.hateList = _.reject(this.hateList, function (obj) {
      return obj.id === playerId;
    });
    this.tankerlist = _.reject(this.tankerlist, function (obj) {
      return obj.id === playerId;
    });

    if (this.hateList.length === 0) {
      this.returnToSpawningPosition(duration);
    }
  }

  forgetEveryone() {
    this.hateList = [];
    this.tankerlist = [];
    this.returnToSpawningPosition(1);
  }

  drop(item) {
    if (item) {
      return new Messages.Drop(this, item);
    }
  }

  handleRespawn(delay) {
    var self = this;

    if (this.area && this.area instanceof MobArea) {
      // Respawn inside the area if part of a MobArea
      this.area.respawnMob(this, delay);
    } else {
      if (this.area && this.area instanceof ChestArea) {
        this.area.removeFromArea(this);
      }
      this.respawnTimeout = setTimeout(function () {
        if (self.respawnCallback) {
          self.respawnCallback();
        }
      }, delay);
    }
  }

  onRespawn(callback) {
    this.hitPoints = Properties.getHitPoints(this.kind);
    this.respawnCallback = callback;
  }

  resetPosition() {
    this.setPosition(this.spawningX, this.spawningY);
  }

  returnToSpawningPosition(waitDuration) {
    var self = this;
    var delay = waitDuration || 4000;

    this.clearTarget();

    this.returnTimeout = setTimeout(function () {
      self.resetPosition();
      self.move(self.x, self.y);
    }, delay);
  }

  onDestroy(callback) {
    this.destroyCallback = callback;
  }

  onMove(callback) {
    this.moveCallback = callback;
  }

  move(x, y) {
    this.setPosition(x, y);
    if (this.moveCallback) {
      this.moveCallback(this);
    }
  }

  updateHitPoints() {
    this.resetHitPoints(Properties.getHitPoints(this.kind));
  }

  distanceToSpawningPoint(x, y) {
    return distanceTo(x, y, this.spawningX, this.spawningY);
  }
}

export default Mob;
