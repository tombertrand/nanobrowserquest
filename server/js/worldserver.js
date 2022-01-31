const cls = require("./lib/class");
const _ = require("underscore");
const Log = require("log");
const Entity = require("./entity");
const Character = require("./character");
const Mob = require("./mob");
const Map = require("./map");
const Npc = require("./npc");
const Player = require("./player");
const Guild = require("./guild");
const Item = require("./item");
const MobArea = require("./mobarea");
const ChestArea = require("./chestarea");
const Chest = require("./chest");
const Messages = require("./message");
const Properties = require("./properties");
const Utils = require("./utils");
const Types = require("../../shared/js/gametypes");
const { purchase } = require("./store/purchase");

require("./store/cron");

// ======= GAME SERVER ========

module.exports = World = cls.Class.extend({
  init: function (id, maxPlayers, websocketServer, databaseHandler) {
    var self = this;

    this.id = id;
    this.maxPlayers = maxPlayers;
    this.server = websocketServer;
    this.ups = 50;
    this.databaseHandler = databaseHandler;

    this.map = null;

    this.entities = {};
    this.players = {};
    this.guilds = {};
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
      log.info(
        player.name +
          "(" +
          player.connection._connection.handshake.headers["cf-connecting-ip"] +
          ") has joined " +
          self.id +
          " in guild " +
          player.guildId,
      );

      if (!player.hasEnteredGame) {
        self.incrementPlayerCount();
      }

      // Number of players in this world
      self.pushToPlayer(player, new Messages.Population(self.playerCount));
      if (player.hasGuild()) {
        self.pushToGuild(
          player.getGuild(),
          new Messages.Guild(Types.Messages.GUILDACTION.CONNECT, player.name),
          player,
        );
        var names = _.without(player.getGuild().memberNames(), player.name);
        if (names.length > 0) {
          self.pushToPlayer(player, new Messages.Guild(Types.Messages.GUILDACTION.ONLINE, names));
        }
      }
      self.pushRelevantEntityListTo(player);

      var move_callback = function (x, y) {
        log.debug(player.name + " is moving to (" + x + ", " + y + ").");
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
        purchase.cancel(player.depositAccount);

        log.info(player.name + " has left the game.");
        if (player.hasGuild()) {
          self.pushToGuild(
            player.getGuild(),
            new Messages.Guild(Types.Messages.GUILDACTION.DISCONNECT, player.name),
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
        if (!character.hasFullHealth()) {
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
  },

  run: function (mapFilePath) {
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

    log.info("" + this.id + " created (capacity: " + this.maxPlayers + " players).");
  },

  setUpdatesPerSecond: function (ups) {
    this.ups = ups;
  },

  onInit: function (callback) {
    this.init_callback = callback;
  },

  onPlayerConnect: function (callback) {
    this.connect_callback = callback;
  },

  onPlayerEnter: function (callback) {
    this.enter_callback = callback;
  },

  onPlayerAdded: function (callback) {
    this.added_callback = callback;
  },

  onPlayerRemoved: function (callback) {
    this.removed_callback = callback;
  },

  onRegenTick: function (callback) {
    this.regen_callback = callback;
  },

  pushRelevantEntityListTo: function (player) {
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
  },

  pushSpawnsToPlayer: function (player, ids) {
    var self = this;

    _.each(ids, function (id) {
      var entity = self.getEntityById(id);
      if (entity) {
        self.pushToPlayer(player, new Messages.Spawn(entity));
      }
    });

    log.debug("Pushed " + _.size(ids) + " new spawns to " + player.id);
  },

  pushToPlayer: function (player, message) {
    if (player && player.id in this.outgoingQueues) {
      this.outgoingQueues[player.id].push(message.serialize());
    } else {
      log.error("pushToPlayer: player was undefined");
    }
  },

  pushToGuild: function (guild, message, except) {
    var self = this;

    if (guild) {
      if (typeof except === "undefined") {
        guild.forEachMember(function (player, id) {
          self.pushToPlayer(self.getEntityById(id), message);
        });
      } else {
        guild.forEachMember(function (player, id) {
          if (parseInt(id, 10) !== except.id) {
            self.pushToPlayer(self.getEntityById(id), message);
          }
        });
      }
    } else {
      log.error("pushToGuild: guild was undefined");
    }
  },

  pushToGroup: function (groupId, message, ignoredPlayer) {
    var self = this,
      group = this.groups[groupId];

    if (group) {
      _.each(group.players, function (playerId) {
        if (playerId != ignoredPlayer) {
          self.pushToPlayer(self.getEntityById(playerId), message);
        }
      });
    } else {
      log.error("groupId: " + groupId + " is not a valid group");
    }
  },

  pushToAdjacentGroups: function (groupId, message, ignoredPlayer) {
    var self = this;
    self.map.forEachAdjacentGroup(groupId, function (id) {
      self.pushToGroup(id, message, ignoredPlayer);
    });
  },

  pushToPreviousGroups: function (player, message) {
    var self = this;

    // Push this message to all groups which are not going to be updated anymore,
    // since the player left them.
    _.each(player.recentlyLeftGroups, function (id) {
      self.pushToGroup(id, message);
    });
    player.recentlyLeftGroups = [];
  },

  pushBroadcast: function (message, ignoredPlayer) {
    for (var id in this.outgoingQueues) {
      if (id != ignoredPlayer) {
        this.outgoingQueues[id].push(message.serialize());
      }
    }
  },

  processQueues: function () {
    var self = this,
      connection;

    for (var id in this.outgoingQueues) {
      if (this.outgoingQueues[id].length > 0) {
        connection = this.server.getConnection(id);
        if (connection && connection.send) {
          connection.send(this.outgoingQueues[id]);
        }
        this.outgoingQueues[id] = [];
      }
    }
  },

  addEntity: function (entity) {
    this.entities[entity.id] = entity;
    this.handleEntityGroupMembership(entity);
  },

  removeEntity: function (entity) {
    if (entity.id in this.entities) {
      delete this.entities[entity.id];
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
    log.debug("Removed " + Types.getKindAsString(entity.kind) + " : " + entity.id);
  },

  joinGuild: function (player, guildId, answer) {
    if (typeof this.guilds[guildId] === "undefined") {
      this.pushToPlayer(player, new Messages.GuildError(Types.Messages.GUILDERRORTYPE.DOESNOTEXIST, guildId));
    }
    //#guildupdate (guildrules)
    else {
      if (player.hasGuild()) {
        var formerGuildId = player.guildId;
      }
      var res = this.guilds[guildId].addMember(player, answer);
      if (res !== false && typeof formerGuildId !== "undefined") {
        this.guilds[formerGuildId].removeMember(player);
      }
      return res;
    }
    return false;
  },

  reloadGuild: function (guildId, guildName) {
    var res = false;
    var lastItem = 0;
    if (typeof this.guilds[guildId] !== "undefined") {
      if (this.guilds[guildId].name === guildName) {
        res = guildId;
      }
    }
    if (res === false) {
      _.every(this.guilds, function (guild, key) {
        if (guild.name === guildName) {
          res = parseInt(key, 10);
          return false;
        } else {
          lastItem = key;
          return true;
        }
      });
    }

    if (res === false) {
      //first connected after reboot.
      if (typeof this.guilds[guildId] !== "undefined") {
        guildId = parseInt(lastItem, 10) + 1;
      }
      this.guilds[guildId] = new Guild(guildId, guildName, this);
      res = guildId;
    }
    return res;
  },

  addGuild: function (guildName) {
    var res = true;
    var id = 0; //an ID here
    res = _.every(this.guilds, function (guild, key) {
      id = parseInt(key, 10) + 1;
      return guild.name !== guildName;
    });
    if (res) {
      this.guilds[id] = new Guild(id, guildName, this);
      res = id;
    }
    return res;
  },

  addPlayer: function (player, guildId) {
    this.addEntity(player);
    this.players[player.id] = player;
    this.outgoingQueues[player.id] = [];
    var res = true;
    if (typeof guildId !== "undefined") {
      res = this.joinGuild(player, guildId);
    }
    return res;
  },

  removePlayer: function (player) {
    player.broadcast(player.despawn());
    this.removeEntity(player);
    if (player.hasGuild()) {
      player.getGuild().removeMember(player);
    }
    delete this.players[player.id];
    delete this.outgoingQueues[player.id];
  },
  loggedInPlayer: function (name) {
    for (var id in this.players) {
      if (this.players[id].name === name) {
        if (!this.players[id].isDead) return true;
      }
    }
    return false;
  },

  addMob: function (mob) {
    this.addEntity(mob);
    this.mobs[mob.id] = mob;
  },

  addNpc: function (kind, x, y) {
    var npc = new Npc("8" + x + "" + y, kind, x, y);
    this.addEntity(npc);
    this.npcs[npc.id] = npc;
    return npc;
  },

  addItem: function (item) {
    this.addEntity(item);
    this.items[item.id] = item;

    return item;
  },

  createItem: function (kind, x, y) {
    var id = "9" + this.itemCount++,
      item = null;

    if (kind === Types.Entities.CHEST) {
      item = new Chest(id, x, y);
    } else {
      item = new Item(id, kind, x, y);
    }
    return item;
  },

  createChest: function (x, y, items) {
    var chest = this.createItem(Types.Entities.CHEST, x, y);
    chest.setItems(items);

    return chest;
  },

  addStaticItem: function (item) {
    item.isStatic = true;
    item.onRespawn(this.addStaticItem.bind(this, item));

    return this.addItem(item);
  },

  addItemFromChest: function (kind, x, y) {
    var item = this.createItem(kind, x, y);
    item.isFromChest = true;

    return this.addItem(item);
  },

  /**
   * The mob will no longer be registered as an attacker of its current target.
   */
  clearMobAggroLink: function (mob) {
    var player = null;
    if (mob.target) {
      player = this.getEntityById(mob.target);
      if (player) {
        player.removeAttacker(mob);
      }
    }
  },

  clearMobHateLinks: function (mob) {
    var self = this;
    if (mob) {
      _.each(mob.hateList, function (obj) {
        var player = self.getEntityById(obj.id);
        if (player) {
          player.removeHater(mob);
        }
      });
    }
  },

  forEachEntity: function (callback) {
    for (var id in this.entities) {
      callback(this.entities[id]);
    }
  },

  forEachPlayer: function (callback) {
    for (var id in this.players) {
      callback(this.players[id]);
    }
  },

  forEachMob: function (callback) {
    for (var id in this.mobs) {
      callback(this.mobs[id]);
    }
  },

  forEachCharacter: function (callback) {
    this.forEachPlayer(callback);
    this.forEachMob(callback);
  },

  handleMobHate: function (mobId, playerId, hatePoints) {
    var mob = this.getEntityById(mobId),
      player = this.getEntityById(playerId),
      mostHated;

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
  },

  chooseMobTarget: function (mob, hateRank) {
    var player = this.getEntityById(mob.getHatedPlayerId(hateRank));

    // If the mob is not already attacking the player, create an attack link between them.
    // @TODO REMOVE FORM ATTACKERS!!!
    if (player) {
      // && !(mob.id in player.attackers)) {
      this.clearMobAggroLink(mob);

      player.addAttacker(mob);
      mob.setTarget(player);

      this.broadcastAttacker(mob);
      log.debug(mob.id + " is now attacking " + player.id);
    }
  },

  onEntityAttack: function (callback) {
    this.attack_callback = callback;
  },

  onEntityRaise: function (callback) {
    this.raise_callback = callback;
  },

  getEntityById: function (id) {
    if (id in this.entities) {
      return this.entities[id];
    } else {
      log.error("Unknown entity : " + id);
    }
  },

  getPlayerCount: function () {
    var count = 0;
    for (var p in this.players) {
      if (this.players.hasOwnProperty(p)) {
        count += 1;
      }
    }
    return count;
  },

  getPlayerPopulation: function () {
    let players = _.sortBy(
      Object.values(this.players).reduce((acc, { name, level, hash, hash1 }) => {
        acc.push({
          name,
          level,
          hash: !!hash,
          hash1: !!hash1,
        });

        return acc;
      }, []),
      ["name"],
    );

    return players;
  },

  broadcastAttacker: function (character) {
    if (character) {
      this.pushToAdjacentGroups(character.group, character.attack(), character.id);
    }
    if (this.attack_callback) {
      this.attack_callback(character);
    }
  },

  startRaiseInterval: function (character, mob) {
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
  },

  stopRaiseInterval: function () {
    clearInterval(this.raiseInterval);
    this.raiseInterval = null;
  },

  broadcastRaise: function (character, mobId) {
    if (character && mobId) {
      this.pushToAdjacentGroups(character.group, character.raise(mobId));
    }
    if (this.raise_callback) {
      // @NOTE May need for raising zombies?
      // this.raise_callback(mob);
    }
  },

  receivedExp: function (player, mob) {
    const playerLevel = player.level;
    const mobLevel = Types.getMobLevel(mob.kind);

    // Only able to get exp from monster if player is no lower than 8 levels below or 6 levels above
    const EXP_LEVEL_BELOW_MOB = 8;
    const EXP_LEVEL_START_RANGE = 2;
    const EXP_LEVEL_END_RANGE = 6;
    let exp = Types.getMobExp(mob.kind);
    const isBoss = [Types.Entities.BOSS, Types.Entities.SKELETONCOMMANDER, Types.Entities.NECROMANCER].includes(
      mob.kind,
    );

    const levelDifference = playerLevel - mobLevel;

    if (levelDifference < 0) {
      if (levelDifference < -EXP_LEVEL_BELOW_MOB) {
        return 0;
      }
    } else if (levelDifference > 0) {
      // Too high level for mob
      if (levelDifference > EXP_LEVEL_END_RANGE || (isBoss && levelDifference >= EXP_LEVEL_END_RANGE)) {
        return 0;
      } else if (levelDifference > EXP_LEVEL_START_RANGE) {
        // Nerf exp per level
        const multiplier = (levelDifference - EXP_LEVEL_START_RANGE) / 8;
        exp = exp - Math.ceil(exp * multiplier);
      }
    }

    exp = Math.round((parseInt(exp) * player.bonus.exp) / 100 + parseInt(exp));

    return exp;
  },

  handleHurtEntity: function ({ entity, attacker, damage, isCritical = false, isBlocked = false }) {
    if (entity.type === "player") {
      // A player is only aware of his own hitpoints
      this.pushToPlayer(entity, entity.health({ isHurt: true }));
    }
    if (entity.type === "mob") {
      // Let the mob's attacker (player) know how much damage was inflicted
      this.pushToPlayer(
        attacker,
        new Messages.Damage(entity, damage, entity.hitPoints, entity.maxHitPoints, isCritical, isBlocked),
      );
    }

    // If the entity is about to die
    if (entity.hitPoints <= 0) {
      if (entity.type === "mob") {
        var mob = entity;
        var item = this.getDroppedItem(mob, attacker);
        var mainTanker = this.getEntityById(mob.getMainTankerId());

        if (mainTanker && mainTanker instanceof Player) {
          const exp = this.receivedExp(mainTanker, mob);
          if (exp) {
            mainTanker.incExp(exp);
          }
          this.pushToPlayer(mainTanker, new Messages.Kill(mob, mainTanker.level, mainTanker.experience, exp));
        } else {
          const exp = this.receivedExp(attacker, mob);
          if (exp) {
            attacker.incExp(exp);
          }
          this.pushToPlayer(attacker, new Messages.Kill(mob, attacker.level, attacker.experience, exp));
        }

        this.pushToAdjacentGroups(mob.group, mob.despawn()); // Despawn must be enqueued before the item drop
        if (item) {
          this.pushToAdjacentGroups(mob.group, mob.drop(item));
          this.handleItemDespawn(item);
        }
      }

      if (entity.type === "player") {
        this.handlePlayerVanish(entity);
        this.pushToAdjacentGroups(entity.group, entity.despawn());
      }

      this.removeEntity(entity);
    }
  },

  despawn: function (entity) {
    this.pushToAdjacentGroups(entity.group, entity.despawn());

    if (entity.id in this.entities) {
      this.removeEntity(entity);
    }
  },

  despawnZombies: function () {
    this.zombies.forEach(zombie => {
      this.despawn(zombie);
    });
  },

  spawnStaticEntities: function () {
    var self = this,
      count = 0;

    _.each(this.map.staticEntities, function (kindName, tid) {
      var kind = Types.getKindFromString(kindName),
        pos = self.map.tileIndexToGridPosition(tid);

      if (Types.isNpc(kind)) {
        self.addNpc(kind, pos.x + 1, pos.y);
      }
      if (Types.isMob(kind)) {
        const id = `7${kind}${count++}`;
        const mob = new Mob(id, kind, pos.x + 1, pos.y);

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

      if (Types.isItem(kind)) {
        self.addStaticItem(self.createItem(kind, pos.x + 1, pos.y));
      }
    });
  },

  isValidPosition: function (x, y) {
    if (this.map && _.isNumber(x) && _.isNumber(y) && !this.map.isOutOfBounds(x, y) && !this.map.isColliding(x, y)) {
      return true;
    }
    return false;
  },

  handlePlayerVanish: function (player) {
    var self = this;
    var previousAttackers = [];

    // When a player dies or teleports, all of his attackers go and attack their second most hated player.
    player.forEachAttacker(function (mob) {
      previousAttackers.push(mob);
      self.chooseMobTarget(mob, 2);
    });

    // When a player dies or teleports, all of his attackers go and attack their second most hated player or return to their original x,y.
    Object.entries(player.haters).map(([id, mob]) => {
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
  },

  setPlayerCount: function (count) {
    this.playerCount = count;
  },

  incrementPlayerCount: function () {
    this.setPlayerCount(this.playerCount + 1);
  },

  decrementPlayerCount: function () {
    if (this.playerCount > 0) {
      this.setPlayerCount(this.playerCount - 1);
    }
  },

  getDroppedItem: function (mob, attacker) {
    var kind = Types.getKindAsString(mob.kind);
    var drops = Properties[kind].drops;
    var v = Utils.random(100);
    var p = 0;
    var item = null;
    var superUnique = Utils.random(7500);

    var randomDrop = Utils.random(3);
    // var drops = ["diamondsword", "amuletcow"];
    var drops = ["necromancerheart", "skeletonkingcage", "wirtleg"];
    return this.addItem(this.createItem(Types.getKindFromString(drops[randomDrop]), mob.x, mob.y));

    if (superUnique === 420 && mob.kind >= Types.Entities.EYE) {
      //@NOTE 0.01% chance to drop a Rai Stone
      item = this.addItem(this.createItem(Types.getKindFromString("ringraistone"), mob.x, mob.y));
    } else if (![Types.Entities.BOSS].includes(mob.kind) && [23, 42, 69].includes(v)) {
      //@NOTE 3% chance to drop a NANO potion
      item = this.addItem(this.createItem(Types.getKindFromString("nanopotion"), mob.x, mob.y));
    } else {
      for (var itemName in drops) {
        var percentage = drops[itemName];

        p += percentage;
        if (v <= p) {
          let itemKind = Types.getKindFromString(itemName);

          if (itemKind === Types.Entities.SCROLLUPGRADEHIGH) {
            const mobLevel = Types.getMobLevel(mob.kind);
            if (attacker && attacker.level - 6 > mobLevel) {
              // @NOTE Reduce scroll drops to prevent crazy farming
              if (Utils.random(4) === 1) {
                break;
              }
            }

            if (mob.kind >= Types.Entities.YETI) {
              var blessedScroll = Utils.random(25);

              if (blessedScroll === 21) {
                itemKind = Types.Entities.SCROLLUPGRADEBLESSED;
              }
            }
          }

          item = this.addItem(this.createItem(itemKind, mob.x, mob.y));
          break;
        }
      }
    }

    return item;
  },

  onMobMoveCallback: function (mob) {
    this.pushToAdjacentGroups(mob.group, new Messages.Move(mob));
    this.handleEntityGroupMembership(mob);
  },

  findPositionNextTo: function (entity, target) {
    var valid = false,
      pos;

    while (!valid) {
      pos = entity.getPositionNextTo(target);
      valid = this.isValidPosition(pos.x, pos.y);
    }
    return pos;
  },

  initZoneGroups: function () {
    var self = this;

    this.map.forEachGroup(function (id) {
      self.groups[id] = { entities: {}, players: [], incoming: [] };
    });
    this.zoneGroupsReady = true;
  },

  removeFromGroups: function (entity) {
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
  },

  /**
   * Registers an entity as "incoming" into several groups, meaning that it just entered them.
   * All players inside these groups will receive a Spawn message when WorldServer.processGroups is called.
   */
  addAsIncomingToGroup: function (entity, groupId) {
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
  },

  addToGroup: function (entity, groupId) {
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
  },

  logGroupPlayers: function (groupId) {
    log.debug("Players inside group " + groupId + ":");
    _.each(this.groups[groupId].players, function (id) {
      log.debug("- player " + id);
    });
  },

  handleEntityGroupMembership: function (entity) {
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
          log.debug("group diff: " + entity.recentlyLeftGroups);
        }
      }
    }
    return hasChangedGroups;
  },

  processGroups: function () {
    var self = this;

    if (this.zoneGroupsReady) {
      this.map.forEachGroup(function (id) {
        var spawns = [];
        if (self.groups[id].incoming.length > 0) {
          spawns = _.each(self.groups[id].incoming, function (entity) {
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
  },

  moveEntity: function (entity, x, y) {
    if (entity) {
      entity.setPosition(x, y);
      this.handleEntityGroupMembership(entity);
    }
  },

  handleItemDespawn: function (item) {
    var self = this;

    if (item) {
      item.handleDespawn({
        beforeBlinkDelay: 10000,
        blinkCallback: function () {
          self.pushToAdjacentGroups(item.group, new Messages.Blink(item));
        },
        blinkingDuration: 4000,
        despawnCallback: function () {
          self.pushToAdjacentGroups(item.group, new Messages.Destroy(item));
          self.removeEntity(item);
        },
      });
    }
  },

  handleEmptyMobArea: function (area) {},

  handleEmptyChestArea: function (area) {
    if (area) {
      var chest = this.addItem(this.createChest(area.chestX, area.chestY, area.items));
      this.handleItemDespawn(chest);
    }
  },

  handleOpenedChest: function (chest, player) {
    this.pushToAdjacentGroups(chest.group, chest.despawn());
    this.removeEntity(chest);

    var kind = chest.getRandomItem();
    if (kind) {
      var item = this.addItemFromChest(kind, chest.x, chest.y);
      this.handleItemDespawn(item);
    }
  },
  getPlayerByName: function (name) {
    for (var id in this.players) {
      if (this.players[id].name === name) {
        return this.players[id];
      }
    }
    return null;
  },
  // removePlayer: function (player) {
  //   player.broadcast(player.despawn());
  //   this.removeEntity(player);
  //   delete this.players[player.id];
  //   delete this.outgoingQueues[player.id];
  // },
  loggedInPlayer: function (name) {
    for (var id in this.players) {
      if (this.players[id].name === name) {
        if (!this.players[id].isDead) return true;
      }
    }
    return false;
  },

  tryAddingMobToChestArea: function (mob) {
    _.each(this.chestAreas, function (area) {
      if (area.contains(mob)) {
        area.addToArea(mob);
      }
    });
  },

  getPlayersCountInBossRoom: function (bossArea) {
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

    for (id in this.players) {
      if (isInsideBossRoom(this.players[id])) {
        counter += 1;
        // Max difficulty of 6
        if (counter === 6) {
          break;
        }
      }
    }
    return counter;
  },

  updatePopulation: function ({ totalPlayers, levelupPlayer } = {}) {
    this.pushBroadcast(
      new Messages.Population(
        this.playerCount,
        totalPlayers || this.playerCount,
        this.getPlayerPopulation(),
        levelupPlayer,
      ),
    );
  },

  shuffle: function (array) {
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
  },
});
