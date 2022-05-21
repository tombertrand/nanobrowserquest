import "./store/cron";

import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import { ChestArea, MobArea } from "./area";
import Chest from "./chest";
import Item from "./item";
import Map from "./map";
import Messages from "./message";
import Mob from "./mob";
import Npc from "./npc";
import Party, { MAX_PARTY_MEMBERS } from "./party";
import Player from "./player";
import Properties from "./properties";
import { Sentry } from "./sentry";
import { purchase } from "./store/purchase";
import { random, randomRange } from "./utils";

// ======= GAME SERVER ========

class World {
  id: any;
  maxPlayers: any;
  server: any;
  ups: number;
  databaseHandler: any;
  map: any;
  entities: {};
  players: {};
  mobs: {};
  attackers: {};
  items: {};
  equipping: {};
  hurt: {};
  npcs: {};
  mobAreas: any[];
  chestAreas: any[];
  groups: {};
  zombies: any[];
  cowTotal: number;
  cowLevelCoords: {};
  cowLevelClock: any;
  cowLevelInterval: any;
  cowLevelTownNpcId: any;
  cowLevelNpcId: any;
  cowLevelNpcIds: any[];
  cowPossibleCoords: any[];
  cowEntityIds: any[];
  cowPackOrder: number[][];
  minotaur: any;
  minotaurLevelClock: any;
  minotaurLevelInterval: any;
  minotaurLevelTownNpcId: any;
  minotaurLevelNpcId: any;
  minotaurSpawnTimeout: any;
  outgoingQueues: any;
  itemCount: number;
  playerCount: number;
  zoneGroupsReady: boolean;
  raiseInterval: any;
  removed_callback: any;
  added_callback: any;
  regen_callback: any;
  init_callback: any;
  connect_callback: any;
  enter_callback: any;
  attack_callback: any;
  raise_callback: any;
  parties: any;
  currentPartyId: number;

  constructor(id, maxPlayers, websocketServer, databaseHandler) {
    var self = this;

    this.id = id;
    this.maxPlayers = maxPlayers;
    this.server = websocketServer;
    this.ups = 50;
    this.databaseHandler = databaseHandler;

    this.map = null;

    this.entities = {};
    this.players = {};
    this.parties = {};
    this.currentPartyId = 0;
    this.mobs = {};
    this.attackers = {};
    this.items = {};
    this.equipping = {};
    this.hurt = {};
    this.npcs = {};
    this.mobAreas = [];
    this.chestAreas = [];
    this.groups = {};
    this.zombies = [];
    this.cowTotal = 0;
    this.cowLevelCoords = {};
    this.cowLevelClock = null;
    this.cowLevelInterval = null;
    this.cowLevelTownNpcId = null;
    this.cowLevelNpcId = null;
    this.cowLevelNpcIds = [];
    this.cowPossibleCoords = [];
    this.cowEntityIds = [];
    this.cowPackOrder = [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-2, 1],
      [-2, 0],
      [-2, -1],
      [-2, -2],
      [-1, -2],
      [0, -2],
      [1, -2],
      [2, -2],
      [2, -1],
      [2, 0],
      [2, 1],
      [2, 2],
      [1, 2],
      [0, 2],
      [-1, 2],
      [-2, 2],
    ];
    this.minotaur = null;
    this.minotaurLevelClock = null;
    this.minotaurLevelInterval = null;
    this.minotaurLevelTownNpcId = null;
    this.minotaurLevelNpcId = null;
    this.minotaurSpawnTimeout = null;

    this.outgoingQueues = {};

    this.itemCount = 0;
    this.playerCount = 0;

    this.zoneGroupsReady = false;
    this.raiseInterval = null;

    this.onPlayerConnect(function (player) {
      player.onRequestPosition(function () {
        if (player.lastCheckpoint) {
          return player.lastCheckpoint.getRandomPosition();
        } else {
          return self.map.getRandomStartingPosition();
        }
      });
    });

    this.onPlayerEnter(function (player) {
      console.info(
        player.name +
          "(" +
          player.connection._connection.handshake.headers["cf-connecting-ip"] +
          ") has joined " +
          self.id,
      );

      if (!player.hasEnteredGame) {
        self.incrementPlayerCount();
      }

      // Number of players in this world
      // self.pushToPlayer(player, new Messages.Population(self.playerCount));
      self.pushRelevantEntityListTo(player);

      var move_callback = function (x, y) {
        console.debug(player.name + " is moving to (" + x + ", " + y + ").");
        var isPVP = self.map.isPVP(x, y);
        player.flagPVP(isPVP);
        player.forEachAttacker(function (mob) {
          if (mob.target === null) {
            player.removeAttacker(mob);
            return;
          }
          var target = self.getEntityById(mob.target);
          if (target) {
            var pos = self.findPositionNextTo(mob, target);
            if (mob.distanceToSpawningPoint(pos.x, pos.y) > 50) {
              mob.clearTarget();
              mob.forgetEveryone();
              player.removeAttacker(mob);
            } else {
              self.moveEntity(mob, pos.x, pos.y);
            }
          }
        });
      };

      player.onMove(move_callback);
      player.onLootMove(move_callback);

      player.onZone(function () {
        var hasChangedGroups = self.handleEntityGroupMembership(player);
        if (hasChangedGroups) {
          self.pushToPreviousGroups(player, new Messages.Destroy(player));
          self.pushRelevantEntityListTo(player);
        }
      });

      player.onBroadcast(function (message, ignoreSelf) {
        self.pushToAdjacentGroups(player.group, message, ignoreSelf ? player.id : null);
      });

      player.onBroadcastToZone(function (message, ignoreSelf) {
        self.pushToGroup(player.group, message, ignoreSelf ? player.id : null);
      });

      player.onExit(function () {
        purchase[player.network].cancel(player.depositAccount);

        console.info(player.name + " has left the game.");
        if (player.hasParty()) {
          self.pushToParty(
            player.getParty(),
            new Messages.Party(Types.Messages.PARTY_ACTIONS.DISCONNECT, [player.name]),
            player,
          );
        }

        self.removePlayer(player);
        self.decrementPlayerCount();

        if (self.removed_callback) {
          self.removed_callback();
        }
      });

      if (self.added_callback) {
        self.added_callback();
      }
    });

    // Called when an entity is attacked by another entity
    this.onEntityAttack(function (attacker) {
      var target = self.getEntityById(attacker.target);
      if (target && attacker.type === "mob") {
        var pos = self.findPositionNextTo(attacker, target);
        self.moveEntity(attacker, pos.x, pos.y);
      }
    });

    this.onEntityRaise(function (attacker) {
      if (attacker.type === "mob") {
        // var pos = self.findPositionNextTo(attacker, target);
        // self.moveEntity(attacker, pos.x, pos.y);
      }
    });

    this.onRegenTick(function () {
      self.forEachCharacter(function (character) {
        if (!character.hasFullHealth() && !character.isDead) {
          let regenerateHealth = Math.floor(character.maxHitPoints / 33);
          if (character.bonus && character.bonus.regenerateHealth) {
            regenerateHealth += character.bonus.regenerateHealth;
          }

          character.regenHealthBy(regenerateHealth);

          if (character.type === "player") {
            self.pushToPlayer(character, character.regen());
          }
        }
      });
    });
  }

  run(mapFilePath) {
    var self = this;

    this.map = new Map(mapFilePath);

    this.map.ready(function () {
      self.initZoneGroups();

      self.map.generateCollisionGrid();

      // Populate all mob "roaming" areas
      _.each(self.map.mobAreas, function (a) {
        var area = new MobArea(a.id, a.nb, a.type, a.x, a.y, a.width, a.height, self);
        area.spawnMobs();
        area.onEmpty(self.handleEmptyMobArea.bind(self, area));

        self.mobAreas.push(area);
      });

      // Create all chest areas
      _.each(self.map.chestAreas, function (a) {
        var area = new ChestArea(a.id, a.x, a.y, a.w, a.h, a.tx, a.ty, a.i, self);
        self.chestAreas.push(area);
        area.onEmpty(self.handleEmptyChestArea.bind(self, area));
      });

      // Spawn static chests
      _.each(self.map.staticChests, function (chest) {
        var c = self.createChest(chest.x, chest.y, chest.i);
        self.addStaticItem(c);
      });

      // Spawn static entities
      self.spawnStaticEntities();

      // Set maximum number of entities contained in each chest area
      _.each(self.chestAreas, function (area) {
        area.setNumberOfEntities(area.entities.length);
      });
    });

    var regenCount = this.ups * 2;
    var updateCount = 0;
    setInterval(function () {
      self.processGroups();
      self.processQueues();

      if (updateCount < regenCount) {
        updateCount += 1;
      } else {
        if (self.regen_callback) {
          self.regen_callback();
        }
        updateCount = 0;
      }
    }, 1000 / this.ups);

    console.info("" + this.id + " created (capacity: " + this.maxPlayers + " players).");
  }

  setUpdatesPerSecond(ups) {
    this.ups = ups;
  }

  onInit(callback) {
    this.init_callback = callback;
  }

  onPlayerConnect(callback) {
    this.connect_callback = callback;
  }

  onPlayerEnter(callback) {
    this.enter_callback = callback;
  }

  onPlayerAdded(callback) {
    this.added_callback = callback;
  }

  onPlayerRemoved(callback) {
    this.removed_callback = callback;
  }

  onRegenTick(callback) {
    this.regen_callback = callback;
  }

  pushRelevantEntityListTo(player) {
    var entities;

    if (player && player.group in this.groups) {
      entities = _.keys(this.groups[player.group].entities);
      entities = _.reject(entities, function (id) {
        return id == player.id;
      });
      entities = _.map(entities, function (id) {
        return parseInt(id, 10);
      });
      if (entities) {
        this.pushToPlayer(player, new Messages.List(entities));
      }
    }
  }

  disconnectPlayer(playerName) {
    const player = this.getPlayerByName(playerName);

    player?.connection.close();
  }

  pushSpawnsToPlayer(player, ids) {
    var self = this;

    _.each(ids, function (id) {
      var entity = self.getEntityById(id);
      if (entity) {
        self.pushToPlayer(player, new Messages.Spawn(entity));
      }
    });

    console.debug("Pushed " + _.size(ids) + " new spawns to " + player.id);
  }

  pushToPlayer(player, message) {
    if (player && player.id in this.outgoingQueues) {
      const serializedMessage = message.serialize();
      this.outgoingQueues[player.id].push(serializedMessage);

      // @NOTE When a player health is updated, push it!
      if (serializedMessage[0] === Types.Messages.HEALTH && player.hasParty()) {
        this.pushToParty(
          player.getParty(),
          new Messages.Party(Types.Messages.PARTY_ACTIONS.HEALTH, {
            id: player.id,
            hp: player.hitPoints,
            mHp: player.maxHitPoints,
          }),
        );
      }
    } else {
      console.error("pushToPlayer: player was undefined");
    }
  }

  pushToParty(party: Party, message: string, except?: Player) {
    const exceptPlayerId = except?.id;

    if (party) {
      party.forEachMember(({ id }) => {
        if (!exceptPlayerId || exceptPlayerId !== id) {
          this.pushToPlayer(this.getEntityById(id), message);
        }
      });
    } else {
      console.error("pushToParty: party was undefined");
    }
  }

  pushToGroup(groupId, message, ignoredPlayer?: number) {
    var self = this;
    var group = this.groups[groupId];

    if (group) {
      _.each(group.players, function (playerId) {
        if (playerId != ignoredPlayer) {
          self.pushToPlayer(self.getEntityById(playerId), message);
        }
      });
    } else {
      console.error("groupId: " + groupId + " is not a valid group");
    }
  }

  pushToAdjacentGroups(groupId, message, ignoredPlayer?: any) {
    var self = this;
    self.map.forEachAdjacentGroup(groupId, function (id) {
      self.pushToGroup(id, message, ignoredPlayer);
    });
  }

  pushToPreviousGroups(player, message) {
    var self = this;

    // Push this message to all groups which are not going to be updated anymore,
    // since the player left them.
    _.each(player.recentlyLeftGroups, function (id) {
      self.pushToGroup(id, message);
    });
    player.recentlyLeftGroups = [];
  }

  pushBroadcast(message, ignoredPlayer?: any) {
    for (var id in this.outgoingQueues) {
      if (id != ignoredPlayer) {
        this.outgoingQueues[id].push(message.serialize());
      }
    }
  }

  processQueues() {
    var connection;

    for (var id in this.outgoingQueues) {
      if (this.outgoingQueues[id].length > 0) {
        connection = this.server.getConnection(id);
        if (connection && connection.send) {
          connection.send(this.outgoingQueues[id]);
        }
        this.outgoingQueues[id] = [];
      }
    }
  }

  addEntity(entity) {
    this.entities[entity.id] = entity;
    this.handleEntityGroupMembership(entity);
  }

  removeEntity(entity) {
    if (entity.id in this.entities) {
      // Don't remove player in case they are in a party
      if (entity.type === "player") {
        entity.isDead = true;
      } else {
        delete this.entities[entity.id];
      }
    }
    if (entity.id in this.mobs) {
      delete this.mobs[entity.id];
    }
    if (entity.id in this.items) {
      delete this.items[entity.id];
    }

    if (entity.type === "mob") {
      this.clearMobAggroLink(entity);
      this.clearMobHateLinks(entity);
    }

    var delay = 30000;
    if (entity.kind === Types.Entities.DEATHKNIGHT) {
      const adjustedDifficulty = this.getPlayersCountInBossRoom({
        x: 140,
        y: 48,
        w: 29,
        h: 25,
      });

      // Each additional player removes 10s to DK spawn delay
      delay = delay - (adjustedDifficulty - 1) * 10000;
      if (delay < 3000) {
        delay = 3000;
      }
    }

    if (entity.kind === Types.Entities.ZOMBIE) {
      this.zombies.find(({ id }) => entity.id === id).isDead = true;
    }

    if (entity.kind === Types.Entities.NECROMANCER) {
      this.despawnZombies();
    }

    entity.destroy(delay);
    this.removeFromGroups(entity);
    console.debug("Removed " + Types.getKindAsString(entity.kind) + " : " + entity.id);
  }

  addParty(player: Player) {
    this.currentPartyId += 1;

    const party = new Party(this.currentPartyId, player, this);
    this.parties[this.currentPartyId] = party;

    return party;
  }

  getParty(partyId: number) {
    return (partyId && this.parties[partyId]) || null;
  }

  addPlayer(player: Player) {
    this.addEntity(player);
    this.players[player.id] = player;
    this.outgoingQueues[player.id] = [];
    return true;
  }

  removePlayer(player: Player) {
    player.broadcast(player.despawn());

    if (player.hasParty()) {
      player.getParty()?.removeMember(player);
    }
    this.removeEntity(player);
    delete this.players[player.id];
    delete this.outgoingQueues[player.id];
  }

  loggedInPlayer(name) {
    for (var id in this.players) {
      if (this.players[id].name === name) {
        if (!this.players[id].isDead) return true;
      }
    }
    return false;
  }

  addMob(mob) {
    this.addEntity(mob);
    this.mobs[mob.id] = mob;
  }

  addNpc(kind, x, y) {
    var self = this;
    var npc = new Npc("8" + x + "" + y, kind, x, y);

    npc.onRespawn(function () {
      npc.isDead = false;
      self.addMob(npc);
    });

    if (kind === Types.Entities.COWPORTAL) {
      npc.isDead = true;

      if (x === 43 && y === 211) {
        this.cowLevelTownNpcId = npc.id;
      } else {
        this.cowLevelNpcIds.push(npc.id);
      }
    } else if (kind === Types.Entities.MINOTAURPORTAL) {
      npc.isDead = true;

      if (x === 40 && y === 210) {
        this.minotaurLevelTownNpcId = npc.id;
      } else {
        this.minotaurLevelNpcId = npc.id;
      }
    } else {
      this.addEntity(npc);
    }
    this.npcs[npc.id] = npc;
    return npc;
  }

  addItem(item) {
    this.addEntity(item);
    this.items[item.id] = item;

    return item;
  }

  startCowLevel() {
    this.cowTotal = 0;
    this.cowLevelClock = 15 * 60; // 15 minutes

    const townPortal = this.npcs[this.cowLevelTownNpcId];
    townPortal.respawnCallback();

    this.cowLevelNpcId = _.shuffle(this.cowLevelNpcIds).slice(0, 1);
    const cowLevelPortal = this.npcs[this.cowLevelNpcId];
    cowLevelPortal.respawnCallback();

    this.cowLevelCoords = { x: cowLevelPortal.x, y: cowLevelPortal.y + 1 };
    this.pushBroadcast(new Messages.CowLevelStart(this.cowLevelCoords));

    let count = 0;
    const cowCoords = _.shuffle(this.cowPossibleCoords).slice(0, 30);

    cowCoords.map(({ x, y }, coordsIndex) => {
      // Spawn the surrounding cows
      const cowCount = Math.ceil(randomRange(8, 24));
      this.cowTotal += cowCount;

      for (let i = 0; i < cowCount; i++) {
        // Cow king is possibly at the center of 1 of the 30 shuffled packs
        const kind = coordsIndex === 0 && i === 0 ? Types.Entities.COWKING : Types.Entities.COW;
        const id = `7${kind}${count++}`;
        const mob = new Mob(id, kind, x + this.cowPackOrder[i][0], y + this.cowPackOrder[i][1]);
        mob.onMove(this.onMobMoveCallback.bind(this));
        mob.onDestroy(() => {
          this.cowTotal--;
          if (this.cowTotal === 0) {
            clearInterval(this.cowLevelInterval);
            setTimeout(() => {
              // Return everyone to town, leave 3s to loot any last drop
              this.endCowLevel(true);

              // When the cow level is cleared, 20% chance of spawning the Minotaur
              if (this.minotaurSpawnTimeout && this.minotaur.isDead && random(4) === 0) {
                this.minotaur.handleRespawn(0);

                clearTimeout(this.minotaurSpawnTimeout);
                this.minotaurSpawnTimeout = null;
              }
            }, 3000);
          }
        });

        this.addMob(mob);
        this.cowEntityIds.push(id);
      }
    });

    this.cowLevelInterval = setInterval(() => {
      this.cowLevelClock -= 1;
      if (this.cowLevelClock < 0) {
        clearInterval(this.cowLevelInterval);
        this.endCowLevel();
      }
    }, 1000);
  }

  endCowLevel(isCompleted = false) {
    this.cowLevelInterval = null;
    this.cowLevelClock = null;

    const townPortal = this.npcs[this.cowLevelTownNpcId];
    this.despawn(townPortal);

    const cowLevelPortal = this.npcs[this.cowLevelNpcId];
    this.despawn(cowLevelPortal);

    this.pushBroadcast(new Messages.CowLevelEnd(isCompleted));

    // Despawn all cows
    this.cowEntityIds.map(entityId => {
      delete this.entities[entityId];
      delete this.mobs[entityId];
    });
  }

  startMinotaurLevel() {
    this.minotaurLevelClock = 15 * 60; // 15 minutes

    const townPortal = this.npcs[this.minotaurLevelTownNpcId];
    townPortal.respawnCallback();

    const minotaurLevelPortal = this.npcs[this.minotaurLevelNpcId];
    minotaurLevelPortal.respawnCallback();

    this.pushBroadcast(new Messages.MinotaurLevelStart());

    this.minotaurLevelInterval = setInterval(() => {
      this.minotaurLevelClock -= 1;
      if (this.minotaurLevelClock < 0) {
        clearInterval(this.minotaurLevelInterval);
        this.endMinotaurLevel();
      }
    }, 1000);
  }

  endMinotaurLevel() {
    this.minotaurLevelInterval = null;
    this.minotaurLevelClock = null;

    const townPortal = this.npcs[this.minotaurLevelTownNpcId];
    this.despawn(townPortal);

    const minotaurLevelPortal = this.npcs[this.minotaurLevelNpcId];
    this.despawn(minotaurLevelPortal);

    this.pushBroadcast(new Messages.MinotaurLevelEnd());
  }

  createItem(kind, x, y, partyId?: number) {
    var id = "9" + this.itemCount++,
      item = null;

    if (kind === Types.Entities.CHEST) {
      item = new Chest(id, x, y);
    } else {
      item = new Item(id, kind, x, y, partyId);
    }
    return item;
  }

  createChest(x, y, items) {
    var chest = this.createItem(Types.Entities.CHEST, x, y);
    chest.setItems(items);

    return chest;
  }

  addStaticItem(item) {
    item.isStatic = true;
    item.onRespawn(this.addStaticItem.bind(this, item));

    return this.addItem(item);
  }

  addItemFromChest(kind, x, y) {
    var item = this.createItem(kind, x, y);
    item.isFromChest = true;

    return this.addItem(item);
  }

  /**
   * The mob will no longer be registered as an attacker of its current target.
   */
  clearMobAggroLink(mob) {
    var player = null;
    if (mob.target) {
      player = this.getEntityById(mob.target);
      if (player) {
        player.removeAttacker(mob);
      }
    }
  }

  clearMobHateLinks(mob) {
    var self = this;
    if (mob) {
      _.each(mob.hateList, function (obj) {
        var player = self.getEntityById(obj.id);
        if (player) {
          player.removeHater(mob);
        }
      });
    }
  }

  forEachEntity(callback) {
    for (var id in this.entities) {
      callback(this.entities[id]);
    }
  }

  forEachPlayer(callback) {
    for (var id in this.players) {
      callback(this.players[id]);
    }
  }

  forEachMob(callback) {
    for (var id in this.mobs) {
      callback(this.mobs[id]);
    }
  }

  forEachCharacter(callback) {
    this.forEachPlayer(callback);
    this.forEachMob(callback);
  }

  handleMobHate(mobId, playerId, hatePoints) {
    var mob = this.getEntityById(mobId);
    var player = this.getEntityById(playerId);

    if (player && mob) {
      mob.increaseHateFor(playerId, hatePoints);
      player.addHater(mob);

      if (mob.kind === Types.Entities.NECROMANCER) {
        if (!this.raiseInterval) {
          this.startRaiseInterval(player, mob);
        }
      }

      if (mob.hitPoints > 0) {
        // only choose a target if still alive
        this.chooseMobTarget(mob);
      }
    }
  }

  chooseMobTarget(mob, hateRank?: number, ignorePlayerId?: number) {
    var playerId = mob.getHatedPlayerId(hateRank);
    var player;

    // @NOTE Fix monsters teleporting with players
    if (ignorePlayerId && ignorePlayerId === playerId) {
      player = null;
    } else {
      player = this.getEntityById(playerId);
    }

    // @NOTE Make sure the link is always cleared?
    this.clearMobAggroLink(mob);

    // If the mob is not already attacking the player, create an attack link between them.
    // @TODO REMOVE FORM ATTACKERS!!! WATCH THIS CONDITION CLOSELY... do we need that second part?
    // When using the second part, the server is not constantly sending the attack link when
    // the player exploits a bottom wall to have the enemy over and not attacking
    // The second part was commented to fix attacker though doors
    if (player && !player.attackers[mob.id]) {
      // && !(mob.id in player.attackers)) {
      player.addAttacker(mob);
      mob.setTarget(player);

      this.broadcastAttacker(mob);
      console.debug(mob.id + " is now attacking " + player.id);
    }
  }

  onEntityAttack(callback) {
    this.attack_callback = callback;
  }

  onEntityRaise(callback) {
    this.raise_callback = callback;
  }

  getEntityById(id) {
    if (id in this.entities) {
      return this.entities[id];
    } else {
      console.error("Unknown entity : " + id);
    }
  }

  getPlayerCount() {
    var count = 0;
    for (var p in this.players) {
      if (this.players.hasOwnProperty(p)) {
        count += 1;
      }
    }
    return count;
  }

  getPlayerPopulation() {
    let players = _.sortBy(
      // @ts-ignore
      Object.values(this.players).reduce((acc: any[], { name, level, hash, network }) => {
        acc.push({
          name,
          level,
          network,
          hash: !!hash,
        });

        return acc;
      }, []),
      ["name"],
    );

    return players;
  }

  broadcastAttacker(character) {
    if (character) {
      this.pushToAdjacentGroups(character.group, character.attack(), character.id);
    }
    if (this.attack_callback) {
      this.attack_callback(character);
    }
  }

  startRaiseInterval(character, mob) {
    this.stopRaiseInterval();

    const raiseZombies = () => {
      const adjustedDifficulty = this.getPlayersCountInBossRoom({
        x: 140,
        y: 324,
        w: 29,
        h: 25,
      });

      const minRaise = adjustedDifficulty + 1;

      if (minRaise) {
        this.broadcastRaise(character, mob.id);

        let zombieCount = 0;
        const randomZombies = this.shuffle(this.zombies);

        for (let i = 0; i < randomZombies.length; i++) {
          if (zombieCount === minRaise) break;

          const entity = randomZombies[i];
          if (
            entity.isDead &&
            (!entity.destroyTime || entity.destroyTime < Date.now() - 1000) &&
            entity.x <= character.x + 5 && // Left
            entity.x >= character.x - 5 && // Right
            entity.y <= character.y + 5 && // Bottom
            entity.y >= character.y - 5 // Top
          ) {
            zombieCount++;
            entity.respawnCallback();
          }
        }
      }
    };

    this.raiseInterval = setInterval(() => {
      if (mob && Array.isArray(mob.hateList) && !mob.hateList.length) {
        this.stopRaiseInterval();
        this.despawnZombies();
      } else {
        raiseZombies();
      }
    }, 7500);

    raiseZombies();
  }

  stopRaiseInterval() {
    clearInterval(this.raiseInterval);
    this.raiseInterval = null;
  }

  broadcastRaise(character, mobId) {
    if (character && mobId) {
      this.pushToAdjacentGroups(character.group, character.raise(mobId));
    }
  }

  incrementExp(player, mob, expOverride?: number) {
    const playerLevel = player.level;
    const mobLevel = Types.getMobLevel(mob.kind);

    // Only able to get exp from monster if player is no lower than 8 levels below or 6 levels above
    const EXP_LEVEL_BELOW_MOB = 8;
    const EXP_LEVEL_START_RANGE = 2;
    const EXP_LEVEL_END_RANGE = 6;
    let exp = expOverride || Types.getMobExp(mob.kind);

    const levelDifference = playerLevel - mobLevel;

    if (levelDifference < 0) {
      if (levelDifference < -EXP_LEVEL_BELOW_MOB) {
        exp = 0;
      }
    } else if (levelDifference > 0) {
      // Too high level for mob
      if (levelDifference > EXP_LEVEL_END_RANGE || (Types.isBoss(mob.kind) && levelDifference >= EXP_LEVEL_END_RANGE)) {
        exp = 0;
      } else if (levelDifference > EXP_LEVEL_START_RANGE) {
        // Nerf exp per level
        const multiplier = (levelDifference - EXP_LEVEL_START_RANGE) / 8;
        exp = exp - Math.ceil(exp * multiplier);
      }
    }

    if (exp) {
      exp = Math.round((parseInt(exp) * (player.bonus.exp + player.partyBonus.exp)) / 100 + parseInt(exp));
      player.incExp(exp);
    }

    this.pushToPlayer(player, new Messages.Kill(mob, player.level, player.experience, exp));

    return exp;
  }

  // entity is receiver
  handleHurtEntity({ entity, attacker, dmg, isCritical = false, isBlocked = false }) {
    if (entity.type === "player") {
      // A player is only aware of his own hitpoints
      this.pushToPlayer(entity, entity.health({ isHurt: true }));
    }

    if (attacker.type === "player") {
      // Let the player know how much damage was inflicted
      this.pushToPlayer(
        attacker,
        new Messages.Damage(entity, dmg, entity.hitPoints, entity.maxHitPoints, isCritical, isBlocked),
      );
    }

    if (entity.hitPoints <= 0) {
      if (entity.type === "mob") {
        var mob = entity;
        var item = this.getDroppedItem(mob, attacker);

        if (attacker.hasParty()) {
          attacker.getParty().shareExp(mob);
        } else {
          this.incrementExp(attacker, mob);
        }

        this.pushToAdjacentGroups(mob.group, mob.despawn()); // Despawn must be enqueued before the item drop
        if (item) {
          this.pushToAdjacentGroups(mob.group, mob.drop(item));
          this.handleItemDespawn(item);
        }
      } else if (entity.type === "player") {
        this.handlePlayerVanish(entity);
        this.pushToAdjacentGroups(entity.group, entity.despawn());
      }

      this.removeEntity(entity);
    }
  }

  despawn(entity) {
    this.pushToAdjacentGroups(entity.group, entity.despawn());

    if (entity.id in this.entities) {
      this.removeEntity(entity);
    }
  }

  despawnZombies() {
    this.zombies.forEach(zombie => {
      this.despawn(zombie);
    });
  }

  spawnStaticEntities() {
    var self = this;
    var count = 0;

    _.each(this.map.staticEntities, function (kindName, tid) {
      var kind = Types.getKindFromString(kindName);
      var pos = self.map.tileIndexToGridPosition(tid);

      if (Types.isNpc(kind)) {
        self.addNpc(kind, pos.x + 1, pos.y);
      } else if (Types.isMob(kind)) {
        if (kind === Types.Entities.COW) {
          self.cowPossibleCoords.push({ x: pos.x + 1, y: pos.y });
        } else {
          const id = `7${kind}${count++}`;
          const mob = new Mob(id, kind, pos.x + 1, pos.y);

          if (kind === Types.Entities.MINOTAUR) {
            self.minotaur = mob;
            mob.onDestroy(() => {
              clearInterval(self.minotaurLevelInterval);
              setTimeout(() => {
                // Return everyone to town, leave 3s to loot any last drop
                self.endMinotaurLevel();
              }, 3000);

              const time = (random(120) + 60 * 6) * 60 * 1000;

              self.minotaurSpawnTimeout = setTimeout(() => {
                mob.handleRespawn(0);
                self.minotaurSpawnTimeout = null;
              }, time);
            });
          }

          mob.onRespawn(function () {
            mob.isDead = false;

            self.addMob(mob);
            if (mob.area && mob.area instanceof ChestArea) {
              mob.area.addToArea(mob);
            }
          });
          mob.onMove(self.onMobMoveCallback.bind(self));

          if (kind === Types.Entities.ZOMBIE) {
            mob.isDead = true;
            self.zombies.push(mob);
          } else {
            self.addMob(mob);
          }
          self.tryAddingMobToChestArea(mob);
        }
      }

      if (Types.isItem(kind)) {
        self.addStaticItem(self.createItem(kind, pos.x + 1, pos.y));
      }
    });
  }

  isValidPosition(x, y) {
    if (this.map && _.isNumber(x) && _.isNumber(y) && !this.map.isOutOfBounds(x, y) && !this.map.isColliding(x, y)) {
      return true;
    }
    return false;
  }

  handlePlayerVanish(player) {
    var self = this;
    var previousAttackers = [];

    // When a player dies or teleports, all of his attackers go and attack their second most hated player.
    player.forEachAttacker(function (mob) {
      previousAttackers.push(mob);
      self.chooseMobTarget(mob, 2, player.id);
    });

    // When a player dies or teleports, all of his attackers go and attack their second most hated player or return to their original x,y.
    Object.entries(player.haters).map(([_id, mob]: [any, Mob]) => {
      player.removeHater(mob);
      mob.clearTarget();
      mob.forgetPlayer(player.id, 1000);
      mob.removeAttacker(player);

      if (mob.hateList.length === 0 && mob.kind === Types.Entities.ZOMBIE) {
        self.despawn(mob);
      }
    });

    _.each(previousAttackers, function (mob) {
      player.removeAttacker(mob);
      mob.clearTarget();
      mob.forgetPlayer(player.id, 1000);

      if (mob.hateList.length === 0 && mob.kind === Types.Entities.ZOMBIE) {
        // @NOTE maybe not needed
        self.despawn(mob);
      }
    });

    this.handleEntityGroupMembership(player);
  }

  setPlayerCount(count) {
    this.playerCount = count;
  }

  incrementPlayerCount() {
    this.setPlayerCount(this.playerCount + 1);
  }

  decrementPlayerCount() {
    if (this.playerCount > 0) {
      this.setPlayerCount(this.playerCount - 1);
    }
  }

  getDroppedItemName(mob, attacker) {
    var kind = Types.getKindAsString(mob.kind);
    var drops = Properties[kind].drops;
    var v = random(100) + 1;
    var p = 0;
    let itemKind = null;

    if (mob.kind === Types.Entities.MINOTAUR) {
      let members = [attacker.id];
      let party = null;

      if (attacker.partyId) {
        party = this.getParty(attacker.partyId);
        members = party.members.map(({ id }) => id);
      }

      if (members.length > MAX_PARTY_MEMBERS) {
        Sentry.captureException(new Error("Loot party for Minotaur"), {
          user: {
            username: attacker.name,
          },
          extra: { members },
        });
      }

      // Safety check?
      members = _.uniq(members);

      members.forEach(id => {
        const player = this.getEntityById(id);

        if (!player) {
          Sentry.captureException(new Error("Missing party member"), {
            user: {
              username: attacker.name,
            },
            extra: { id },
          });
        } else if (player?.minotaurDamage >= 2000) {
          this.databaseHandler.lootItems({
            player,
            items: [{ item: "chestblue", quantity: 1 }],
          });

          if (party) {
            this.pushToParty(
              party,
              new Messages.Party(Types.Messages.PARTY_ACTIONS.LOOT, [
                { playerName: player.name, kind: Types.Entities.CHESTBLUE },
              ]),
            );
          }
        }
      });
    } else if (mob.kind === Types.Entities.COW) {
      const diamondRandom = random(700);
      if (diamondRandom === 69) {
        return "diamondsword";
      } else if (diamondRandom === 133) {
        return "diamondarmor";
      } else if (diamondRandom === 420) {
        return "beltdiamond";
      }
    }
    if (mob.kind >= Types.Entities.EYE) {
      const vv = random(12000);
      if (vv === 420) {
        return "ringraistone";
      } else if (mob.kind >= Types.Entities.RAT2 && vv === 6969) {
        return "ringfountain";
      } else if (mob.kind >= Types.Entities.COW && vv === 133) {
        return "amuletfrozen";
      }
    }

    if (!Types.isBoss(mob.kind) && [23, 42, 69].includes(v)) {
      //@NOTE 3% chance to drop a NANO/BANANO potion on non-boss monsters
      if (attacker.network === "ban") {
        return "bananopotion";
      } else {
        return "nanopotion";
      }
    } else {
      for (var itemName in drops) {
        var percentage = drops[itemName];

        p += percentage;
        if (v <= p) {
          itemKind = Types.getKindFromString(itemName);

          if (itemKind === Types.Entities.SCROLLUPGRADEHIGH) {
            const mobLevel = Types.getMobLevel(mob.kind);
            if (attacker && attacker.level - 6 > mobLevel) {
              // Reduce scroll drops to prevent crazy farming
              if (random(4) === 1) {
                break;
              }
            }

            if (mob.kind >= Types.Entities.YETI) {
              var blessedScroll = random(25);

              if (blessedScroll === 21) {
                itemKind = Types.Entities.SCROLLUPGRADEBLESSED;
              }
            }
          }
          return Types.getKindAsString(itemKind);
        }
      }
    }
  }

  getDroppedItem(mob, attacker) {
    const itemName = this.getDroppedItemName(mob, attacker);
    const kind = Types.getKindFromString(itemName);

    // var randomDrops = ["ringbronze", "ringsilver", "ringgold", "amuletsilver", "amuletgold"] as any;
    // var randomDrops = ["belthorned", "hornedarmor"] as any;
    // var randomDrops = ["beltfrozen", "blueaxe", "bluemorningstar", "frozensword"] as any;
    // var randomDrops = ["chestblue", "cowkinghorn", "ringminotaur"] as any;
    // var randomDrops = ["necromancerheart", "skeletonkingcage", "wirtleg"];
    // var randomDrops = ["firefoxpotion"];
    // var randomDrop = random(randomDrops.length);
    // return this.addItem(this.createItem(Types.getKindFromString(randomDrops[randomDrop]), mob.x, mob.y));

    // Potions can be looted by anyone
    const partyId = Types.isHealingItem(kind) ? undefined : attacker.partyId;

    return itemName ? this.addItem(this.createItem(Types.getKindFromString(itemName), mob.x, mob.y, partyId)) : null;
  }

  onMobMoveCallback(mob) {
    this.pushToAdjacentGroups(mob.group, new Messages.Move(mob));
    this.handleEntityGroupMembership(mob);
  }

  findPositionNextTo(entity, target) {
    var valid = false,
      pos;

    while (!valid) {
      pos = entity.getPositionNextTo(target);
      valid = this.isValidPosition(pos.x, pos.y);
    }
    return pos;
  }

  initZoneGroups() {
    var self = this;

    this.map.forEachGroup(function (id) {
      self.groups[id] = { entities: {}, players: [], incoming: [] };
    });
    this.zoneGroupsReady = true;
  }

  removeFromGroups(entity) {
    var self = this,
      oldGroups = [];

    if (entity && entity.group) {
      var group = this.groups[entity.group];
      if (entity instanceof Player) {
        group.players = _.reject(group.players, function (id) {
          return id === entity.id;
        });
      }

      this.map.forEachAdjacentGroup(entity.group, function (id) {
        if (entity.id in self.groups[id].entities) {
          delete self.groups[id].entities[entity.id];
          oldGroups.push(id);
        }
      });
      entity.group = null;
    }
    return oldGroups;
  }

  /**
   * Registers an entity as "incoming" into several groups, meaning that it just entered them.
   * All players inside these groups will receive a Spawn message when WorldServer.processGroups is called.
   */
  addAsIncomingToGroup(entity, groupId) {
    var self = this,
      isChest = entity && entity instanceof Chest,
      isItem = entity && entity instanceof Item,
      isDroppedItem = entity && isItem && !entity.isStatic && !entity.isFromChest;

    if (entity && groupId) {
      this.map.forEachAdjacentGroup(groupId, function (id) {
        var group = self.groups[id];

        if (group) {
          if (
            !_.includes(group.entities, entity.id) &&
            //  Items dropped off of mobs are handled differently via DROP messages. See handleHurtEntity.
            (!isItem || isChest || (isItem && !isDroppedItem))
          ) {
            group.incoming.push(entity);
          }
        }
      });
    }
  }

  addToGroup(entity, groupId) {
    var self = this,
      newGroups = [];

    if (entity && groupId && groupId in this.groups) {
      this.map.forEachAdjacentGroup(groupId, function (id) {
        self.groups[id].entities[entity.id] = entity;
        newGroups.push(id);
      });
      entity.group = groupId;

      if (entity instanceof Player) {
        this.groups[groupId].players.push(entity.id);
      }
    }
    return newGroups;
  }

  logGroupPlayers(groupId) {
    console.debug("Players inside group " + groupId + ":");
    _.each(this.groups[groupId].players, function (id) {
      console.debug("- player " + id);
    });
  }

  handleEntityGroupMembership(entity) {
    var hasChangedGroups = false;
    if (entity) {
      var groupId = this.map.getGroupIdFromPosition(entity.x, entity.y);
      if (!entity.group || (entity.group && entity.group !== groupId)) {
        hasChangedGroups = true;
        this.addAsIncomingToGroup(entity, groupId);
        var oldGroups = this.removeFromGroups(entity);
        var newGroups = this.addToGroup(entity, groupId);

        if (_.size(oldGroups) > 0) {
          entity.recentlyLeftGroups = _.difference(oldGroups, newGroups);
          // console.debug("group diff: " + entity.recentlyLeftGroups);
        }
      }
    }
    return hasChangedGroups;
  }

  processGroups() {
    var self = this;

    if (this.zoneGroupsReady) {
      this.map.forEachGroup(function (id) {
        if (self.groups[id].incoming.length > 0) {
          _.each(self.groups[id].incoming, function (entity) {
            //
            if (entity instanceof Player) {
              self.pushToGroup(id, new Messages.Spawn(entity), entity.id);
            } else {
              self.pushToGroup(id, new Messages.Spawn(entity));
            }
          });
          self.groups[id].incoming = [];
        }
      });
    }
  }

  moveEntity(entity, x, y) {
    if (entity) {
      entity.setPosition(x, y);
      this.handleEntityGroupMembership(entity);
    }
  }

  handleItemDespawn(item) {
    var self = this;

    if (item) {
      item.handleDespawn({
        beforeBlinkDelay: 10000,
        blinkCallback() {
          self.pushToAdjacentGroups(item.group, new Messages.Blink(item));
        },
        blinkingDuration: 4000,
        despawnCallback() {
          // @NOTE Perhaps not pushed to all players...
          self.pushToAdjacentGroups(item.group, new Messages.Destroy(item));
          self.removeEntity(item);
        },
      });
    }
  }

  handleEmptyMobArea(_area) {}

  handleEmptyChestArea(area) {
    if (area) {
      var chest = this.addItem(this.createChest(area.chestX, area.chestY, area.items));
      this.handleItemDespawn(chest);
    }
  }

  handleOpenedChest(chest, _player) {
    this.pushToAdjacentGroups(chest.group, chest.despawn());
    this.removeEntity(chest);

    var kind = chest.getRandomItem();
    if (kind) {
      var item = this.addItemFromChest(kind, chest.x, chest.y);
      this.handleItemDespawn(item);
    }
  }

  getPlayerByName(name) {
    for (var id in this.players) {
      if (this.players[id].name === name) {
        return this.players[id];
      }
    }
    return null;
  }

  // removePlayer (player) {
  //   player.broadcast(player.despawn());
  //   this.removeEntity(player);
  //   delete this.players[player.id];
  //   delete this.outgoingQueues[player.id];
  // },

  tryAddingMobToChestArea(mob) {
    _.each(this.chestAreas, function (area) {
      if (area.contains(mob)) {
        area.addToArea(mob);
      }
    });
  }

  getPlayersCountInBossRoom(bossArea) {
    let counter = 0;

    function isInsideBossRoom(entity) {
      if (entity) {
        return (
          entity.x >= bossArea.x &&
          entity.y >= bossArea.y &&
          entity.x < bossArea.x + bossArea.w &&
          entity.y < bossArea.y + bossArea.h
        );
      } else {
        return false;
      }
    }

    for (let id in this.players) {
      if (isInsideBossRoom(this.players[id])) {
        counter += 1;
        // Max difficulty of 6
        if (counter === 6) {
          break;
        }
      }
    }
    return counter;
  }

  updatePopulation({ levelupPlayer = undefined } = {}) {
    this.pushBroadcast(new Messages.Population(this.getPlayerPopulation(), levelupPlayer));
  }

  shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }
}

export default World;
