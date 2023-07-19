import "./store/cron";

import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import { ACHIEVEMENT_ZAP_INDEX } from "../../shared/js/types/achievements";
import { getGoldDeathPenaltyPercent } from "../../shared/js/utils";
import { ChestArea, MobArea } from "./area";
import Chest from "./chest";
import { EmojiMap, postMessageToDiscordChatChannel, postMessageToDiscordEventChannel } from "./discord";
import { generateRandomGoldAmount } from "./gold";
import Item from "./item";
import Map from "./map";
import Messages from "./message";
import Mob from "./mob";
import Npc from "./npc";
import Party, { MAX_PARTY_MEMBERS } from "./party";
import Player from "./player";
import Properties from "./properties";
import { Sentry } from "./sentry";
import Spell from "./spell";
import { purchase } from "./store/purchase";
import Trade from "./trade";
import { generateSoulStoneItem, getRandomJewelLevel, getRandomRune, random, randomInt, randomRange } from "./utils";

import type { ItemProps } from "./item";

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
  spells: {};
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
  cowLevelClock: number;
  cowLevelInterval: NodeJS.Timeout;
  cowLevelTownNpcId: number;
  cowLevelNpcId: any;
  cowLevelNpcIds: number[];
  cowPossibleCoords: any[];
  cowEntityIds: string[];
  packOrder: number[][];
  cowKingHornDrop: boolean;
  minotaur: any;
  minotaurLevelClock: number;
  minotaurLevelInterval: NodeJS.Timeout;
  minotaurLevelTownNpcId: number;
  minotaurLevelNpcId: number;
  minotaurSpawnTimeout: any;
  outgoingQueues: any;
  itemCount: number;
  playerCount: number;
  zoneGroupsReady: boolean;
  raiseNecromancerInterval: any;
  raiseDeathAngelInterval: any;
  raiseDeathBringerInterval: any;
  removed_callback: any;
  added_callback: any;
  regen_callback: any;
  init_callback: any;
  connect_callback: any;
  enter_callback: any;
  attack_callback: any;
  parties: { [key: number]: Party };
  trades: { [key: number]: Trade };
  currentPartyId: number;
  currentTradeId: number;
  deathAngel: any;
  deathAngelSpawnCoords: { x: number; y: number };
  deathBringer: any;
  isCastDeathAngelSpellEnabled: boolean;
  isCastDeathBringerSpellEnabled: boolean;
  magicStones: number[];
  activatedMagicStones: number[];
  blueFlames: number[];
  statues: number[];
  spellCount: number;
  secretStairsChaliceNpcId: number;
  secretStairsTreeNpcId: number;
  secretStairsLeftTemplarNpcId: number;
  secretStairsRightTemplarNpcId: number;
  secretStairsPickaxeNpcId: number;
  chaliceLevelClock: number;
  chaliceLevelInterval: NodeJS.Timeout;
  templeLevelClock: number;
  templeLevelInterval: NodeJS.Timeout;
  altarChaliceNpcId: number;
  altarSoulStoneNpcId: number;
  handsNpcId: number;
  isActivatedTreeLevel: boolean;
  trapIds: number[];
  portalStoneNpcId: number;
  portalStoneInnerNpcId: number;
  portalGatewayNpcId: number;
  portalGatewayInnerNpcId: number;
  stoneLevelClock: number;
  stoneLevelInterval: NodeJS.Timeout;
  gatewayLevelClock: number;
  gatewayLevelInterval: NodeJS.Timeout;
  leverChaliceNpcId: number;
  leverLeftCryptNpcId: number;
  leverRightCryptNpcId: number;
  leverDeathAngelNpcId: number;
  doorDeathAngelNpcId: number;
  poisonTemplarId: number;
  magicTemplarId: number;
  powderSpiderId: number;
  chaliceSpiderId: number;
  spiderQueen: any;
  spiderTotal: number;
  spiderEntityIds: string[];
  spiderPossibleCoords: { x: number; y: number }[];
  butcher: any;
  archerEntityIds: string[];
  archerPossibleCoords: { x: number; y: number }[];
  mageEntityIds: string[];
  magePossibleCoords: { x: number; y: number }[];
  shaman: any;
  worm: any;
  mageTempleEntityIds: string[];
  mageTemplePossibleCoords: { x: number; y: number }[];
  gateTempleNpcId: number;
  gateSubTempleNpcId: number;
  goldBank: number;
  janetYellenNpcId: number;
  soulStonePlayerName: string;
  chatBan: { player: string; ip: string }[];

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
    this.trades = {};
    this.currentPartyId = 0;
    this.currentTradeId = 0;
    this.mobs = {};
    // this.spells = {};
    this.spellCount = 0;
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
    this.packOrder = [
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
    this.cowKingHornDrop = false;
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
    this.raiseNecromancerInterval = null;
    this.raiseDeathAngelInterval = null;
    this.isCastDeathAngelSpellEnabled = false;
    this.isCastDeathBringerSpellEnabled = false;
    this.magicStones = [];
    this.activatedMagicStones = [];
    this.blueFlames = [];
    this.statues = [];
    this.secretStairsChaliceNpcId = null;
    this.secretStairsTreeNpcId = null;
    this.secretStairsLeftTemplarNpcId = null;
    this.secretStairsRightTemplarNpcId = null;
    this.secretStairsPickaxeNpcId = null;
    this.poisonTemplarId = null;
    this.magicTemplarId = null;
    this.chaliceLevelClock = null;
    this.chaliceLevelInterval = null;
    this.altarChaliceNpcId = null;
    this.altarSoulStoneNpcId = null;
    this.handsNpcId = null;
    this.isActivatedTreeLevel = false;
    this.trapIds = [];
    this.leverChaliceNpcId = null;
    this.leverLeftCryptNpcId = null;
    this.leverRightCryptNpcId = null;
    this.leverDeathAngelNpcId = null;
    this.doorDeathAngelNpcId = null;
    this.portalStoneNpcId = null;
    this.portalStoneInnerNpcId = null;
    this.stoneLevelClock = null;
    this.stoneLevelInterval = null;
    this.powderSpiderId = null;
    this.chaliceSpiderId = null;
    this.spiderQueen = null;
    this.spiderTotal = 0;
    this.spiderEntityIds = [];
    this.spiderPossibleCoords = [];
    this.archerEntityIds = [];
    this.archerPossibleCoords = [];
    this.mageEntityIds = [];
    this.magePossibleCoords = [];
    this.shaman = null;
    this.worm = null;
    this.mageTempleEntityIds = [];
    this.mageTemplePossibleCoords = [];
    this.gateTempleNpcId = null;
    this.gateSubTempleNpcId = null;
    this.goldBank = 0;
    this.janetYellenNpcId = null;

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
      console.info(player.name + "(" + (player.ip || "Player IP") + ") has joined " + self.id);

      if (!player.hasEnteredGame) {
        self.incrementPlayerCount();
      }

      // Number of players in this world
      // self.pushToPlayer(player, new Messages.Population(self.playerCount));
      self.pushRelevantEntityListTo(player);

      var move_callback = function (x, y) {
        console.debug(player.name + " is moving to (" + x + ", " + y + ").");
        player.forEachAttacker(function (mob) {
          if (mob.targetId === null) {
            player.removeAttacker(mob);
            return;
          }
          var target = self.getEntityById(mob.targetId);
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
        if (player.network) {
          purchase[player.network].cancel(player.depositAccount);
        }

        console.info(player.name + " has left the game.");
        if (player.hasParty()) {
          self.pushToParty(
            player.getParty(),
            new Messages.Party(Types.Messages.PARTY_ACTIONS.DISCONNECT, [player.name]),
            player,
          );
        }

        // Cleanup party invitations for the leaving player
        Object.values(self.parties || []).forEach(party => party.deleteInvite(player));

        // Cleanup trade sessions
        if (player.hasTrade()) {
          self.trades[player.tradeId].close({ playerName: player.name });
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
      var target = self.getEntityById(attacker.targetId);
      if (target && attacker.type === "mob") {
        var pos = self.findPositionNextTo(attacker, target);
        self.moveEntity(attacker, pos.x, pos.y);
      }
    });

    this.onRegenTick(function () {
      self.forEachCharacter(function (character) {
        if (!character.hasFullHealth() && !character.isDead) {
          let regenerateHealth = Math.floor(character.maxHitPoints / 33);
          if (character.bonus && character.bonus.regenerateHealth) {
            regenerateHealth += character.bonus.regenerateHealth;
          }

          if (character.curse?.health && character.curse?.health !== 0) {
            regenerateHealth = regenerateHealth - Math.floor(regenerateHealth * (character.curse.health / 100));
          }

          if (regenerateHealth > 0) {
            character.regenHealthBy(regenerateHealth);

            if (character.type === "player") {
              self.pushToPlayer(character, character.regen());
            }
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

    this.databaseHandler.getGoldBank().then(goldBank => {
      this.goldBank = goldBank;
    });

    this.databaseHandler.getChatBan().then(chatBan => {
      this.chatBan = chatBan;
    });
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

    console.debug(`Pushed ${_.size(ids)} new spawns to ${player.name}: ${player.id}`);
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
      console.log("pushToPlayer: player was undefined");
      Sentry.captureException(new Error("pushToPlayer: player was undefined"), { extra: { player: player?.name } });
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
      console.log("pushToParty: party was undefined");
      Sentry.captureException(new Error("pushToParty: party was undefined"));
    }
  }

  pushToGroup(groupId, message, ignoredPlayer?: number) {
    var self = this;
    var group = this.groups[groupId];
    var ignoredPlayerIds = (Array.isArray(ignoredPlayer) ? ignoredPlayer : [ignoredPlayer || undefined]).filter(
      Boolean,
    );

    if (group) {
      _.each(group.players, function (playerId) {
        if (![ignoredPlayerIds].includes(playerId)) {
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
    if (player.petEntity) {
      player.petEntity.recentlyLeftGroups = [];
    }
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
    if (entity.poisonedInterval) {
      clearInterval(entity.poisonedInterval);
      entity.poisonedInterval = null;
    }

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
      const adjustedDifficulty = this.getPlayersAroundEntity({ x: 155, y: 53 });

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

    entity.destroy?.(delay);

    this.removeFromGroups(entity);
    console.debug("Removed " + Types.getKindAsString(entity.kind) + " : " + entity.id);
  }

  partyCreate(player: Player) {
    this.currentPartyId += 1;

    const party = new Party(this.currentPartyId, player, this);
    this.parties[this.currentPartyId] = party;

    return party;
  }

  getParty(partyId: number) {
    return (partyId && this.parties[partyId]) || null;
  }

  tradeCreate(playerId1: Player, playerId2: Player) {
    this.currentTradeId += 1;

    const trade = new Trade(this.currentTradeId, playerId1, playerId2, this);
    this.trades[this.currentTradeId] = trade;

    return trade;
  }

  getTrade(tradeId: number) {
    return (tradeId && this.trades[tradeId]) || null;
  }

  addPlayer(player: Player) {
    this.addEntity(player);
    this.players[player.id] = player;
    this.outgoingQueues[player.id] = [];
    return true;
  }

  removePlayer(player: Player) {
    if (player.petEntity) {
      this.despawn(player.petEntity);
    }

    if (player.hasParty()) {
      player.getParty()?.removeMember(player);
    }
    this.despawn(player);
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

    if (kind === Types.Entities.PORTALCOW) {
      npc.isDead = true;

      if (x === 43 && y === 211) {
        this.cowLevelTownNpcId = npc.id;
      } else {
        this.cowLevelNpcIds.push(npc.id);
      }
    } else if (kind === Types.Entities.PORTALMINOTAUR) {
      npc.isDead = true;

      if (x === 40 && y === 210) {
        this.minotaurLevelTownNpcId = npc.id;
      } else {
        this.minotaurLevelNpcId = npc.id;
      }
    } else if (kind === Types.Entities.SECRETSTAIRS) {
      npc.isDead = true;

      if (x === 8 && y === 683) {
        this.secretStairsChaliceNpcId = npc.id;
      } else if (x === 19 && y === 642) {
        this.secretStairsTreeNpcId = npc.id;

        // @NOTE Add a tree on top of the stairs
        this.addNpc(Types.Entities.TREE, x, y + 1);
      } else if (x === 159 && y === 597) {
        this.secretStairsPickaxeNpcId = npc.id;
      }
    } else if (kind === Types.Entities.SECRETSTAIRS2) {
      npc.isDead = true;

      if (x === 149 && y === 548) {
        this.secretStairsLeftTemplarNpcId = npc.id;
      } else if (x === 162 && y === 548) {
        this.secretStairsRightTemplarNpcId = npc.id;
      }
    } else if (kind === Types.Entities.PORTALSTONE) {
      npc.isDead = true;

      if (x === 71 && y === 643) {
        this.portalStoneNpcId = npc.id;
      } else {
        this.portalStoneInnerNpcId = npc.id;
      }
    } else if (kind === Types.Entities.PORTALGATEWAY) {
      npc.isDead = true;

      if (x === 97 && y === 545) {
        this.portalGatewayNpcId = npc.id;
      } else {
        this.portalGatewayInnerNpcId = npc.id;
      }
    } else {
      if (kind === Types.Entities.MAGICSTONE) {
        this.magicStones.push(npc.id);
      } else if (kind === Types.Entities.BLUEFLAME) {
        this.blueFlames.push(npc.id);
      } else if (kind === Types.Entities.STATUE || kind === Types.Entities.STATUE2) {
        this.statues.push(npc.id);
      } else if (kind === Types.Entities.ALTARCHALICE) {
        this.altarChaliceNpcId = npc.id;
      } else if (kind === Types.Entities.ALTARSOULSTONE) {
        this.altarSoulStoneNpcId = npc.id;
      } else if (kind === Types.Entities.HANDS) {
        this.handsNpcId = npc.id;
      } else if ([Types.Entities.TRAP, Types.Entities.TRAP2, Types.Entities.TRAP3].includes(kind)) {
        this.trapIds.push(npc.id);
      } else if (kind === Types.Entities.LEVER || kind === Types.Entities.LEVER2 || kind === Types.Entities.LEVER3) {
        if (npc.x === 10 && npc.y === 703) {
          this.leverChaliceNpcId = npc.id;
        } else if (npc.x === 80 && npc.y === 703) {
          this.leverLeftCryptNpcId = npc.id;
        } else if (npc.x === 67 && npc.y === 722) {
          this.leverRightCryptNpcId = npc.id;
        } else if (npc.x === 149 && npc.y === 752) {
          this.leverDeathAngelNpcId = npc.id;
        }
      } else if (kind === Types.Entities.GATE) {
        if (npc.x === 43 && npc.y === 579) {
          this.gateTempleNpcId = npc.id;
        } else if (npc.x === 71 && npc.y === 548) {
          this.gateSubTempleNpcId = npc.id;
        }
        npc.activate();
      } else if (kind === Types.Entities.JANETYELLEN) {
        this.janetYellenNpcId = npc.id;
      } else if (kind === Types.Entities.DOORDEATHANGEL) {
        this.doorDeathAngelNpcId = npc.id;
      }

      this.addEntity(npc);
    }
    this.npcs[npc.id] = npc;
    return npc;
  }

  addSpell({
    kind,
    x,
    y,
    orientation = Types.Orientations.UP,
    originX,
    originY,
    element,
    casterId,
    casterKind,
    targetId = undefined,
    isRaise2 = false,
  }) {
    const spell = new Spell({
      id: `9${this.spellCount}${x}${y}`,
      kind,
      x,
      y,
      orientation,
      originX,
      originY,
      element,
      casterId,
      casterKind,
      targetId,
      isRaise2,
    });

    this.spellCount += 1;
    this.addEntity(spell);

    setTimeout(() => {
      this.removeFromGroups(spell);
      // delete this.entities[spell.id];
      this.removeEntity(spell.id);
    }, 3000);

    return spell;
  }

  addItem(item) {
    this.addEntity(item);
    this.items[item.id] = item;

    return item;
  }

  castDeathAngelSpell(x, y) {
    const { id, isDead, x: mobX, y: mobY } = this.deathAngel;

    const diffX = Math.abs(x - mobX);
    const diffY = Math.abs(y - mobY);

    // Ensure casting is correct
    if (!id || !this.isCastDeathAngelSpellEnabled || isDead || !x || !y || diffX > 16 || diffY > 16) return;
    this.isCastDeathAngelSpellEnabled = false;

    const coords = [
      [0, 1, Types.Orientations.DOWN],
      [1, 1, Types.Orientations.DOWN_RIGHT],
      [1, 0, Types.Orientations.RIGHT],
      [1, -1, Types.Orientations.UP_RIGHT],
      [0, -1, Types.Orientations.UP],
      [-1, -1, Types.Orientations.UP_LEFT],
      [-1, 0, Types.Orientations.LEFT],
      [-1, 1, Types.Orientations.DOWN_LEFT],
    ];

    const element = Types.getRandomElement();

    coords.forEach(([spellX, spellY, orientation]) => {
      this.addSpell({
        kind: Types.Entities.DEATHANGELSPELL,
        x: x + spellX,
        y: y + spellY,
        orientation,
        originX: spellX,
        originY: spellY,
        element,
        casterId: this.deathAngel.id,
        casterKind: Types.Entities.DEATHANGEL,
      });
    });
  }

  castShamanSpell(x, y, entity, targetId, isRaise2) {
    const { id, isDead, x: mobX, y: mobY } = entity;

    const diffX = Math.abs(x - mobX);
    const diffY = Math.abs(y - mobY);

    // Ensure casting is correct
    if (!id || isDead || !x || !y || diffX > 16 || diffY > 16) return;

    if (isRaise2) {
      const coords = [
        [0, 1, Types.Orientations.DOWN],
        [1, 0, Types.Orientations.RIGHT],
        [0, -1, Types.Orientations.UP],
        [-1, 0, Types.Orientations.LEFT],
      ];

      coords.forEach(([spellX, spellY, orientation]) => {
        this.addSpell({
          kind: Types.Entities.MAGESPELL,
          x: x + spellX,
          y: y + spellY,
          orientation,
          originX: spellX,
          originY: spellY,
          element: entity.element,
          casterId: entity.id,
          casterKind: Types.Entities.SHAMAN,
          isRaise2,
        });
      });
    } else {
      this.addSpell({
        kind: Types.Entities.MAGESPELL,
        x,
        y,
        orientation: Types.Orientations.DOWN,
        originX: x,
        originY: y,
        element: entity.element,
        casterId: entity.id,
        casterKind: Types.Entities.SHAMAN,
        targetId,
      });
    }
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
        const mob = new Mob(id, kind, x + this.packOrder[i][0], y + this.packOrder[i][1]);
        mob.onMove(this.onMobMoveCallback.bind(this));
        mob.onDestroy(() => {
          this.cowTotal--;
          if (this.cowTotal === 0) {
            clearInterval(this.cowLevelInterval);
            setTimeout(() => {
              // Return everyone to town, leave 3s to loot any last drop
              this.endCowLevel(true);

              // When the cow level is cleared, 25% chance of spawning the Minotaur
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
    this.cowKingHornDrop = false;

    const townPortal = this.npcs[this.cowLevelTownNpcId];
    this.despawn(townPortal);

    const cowLevelPortal = this.npcs[this.cowLevelNpcId];
    this.despawn(cowLevelPortal);

    this.pushBroadcast(new Messages.CowLevelEnd(isCompleted));

    // Despawn all cows
    this.cowEntityIds.map(entityId => {
      const entity = this.getEntityById(entityId);
      if (entity) {
        this.removeEntity(entity);
      }
    });

    this.cowEntityIds = [];
  }

  startMinotaurLevel() {
    this.minotaurLevelClock = 15 * 60; // 15 minutes

    const portal = this.npcs[this.minotaurLevelTownNpcId];
    portal.respawnCallback();

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

    const portal = this.npcs[this.minotaurLevelTownNpcId];
    this.despawn(portal);

    const minotaurLevelPortal = this.npcs[this.minotaurLevelNpcId];
    this.despawn(minotaurLevelPortal);

    this.pushBroadcast(new Messages.MinotaurLevelEnd());
  }

  startChaliceLevel() {
    this.chaliceLevelClock = 15 * 60; // 15 minutes

    const secretStairs = this.npcs[this.secretStairsChaliceNpcId];
    secretStairs.respawnCallback();

    this.pushBroadcast(new Messages.ChaliceLevelStart());

    if (this.shaman.isDead) {
      this.shaman.handleRespawn(0);
    }

    let count = 0;

    this.magePossibleCoords.forEach(({ x, y }) => {
      const mageCount = Math.ceil(randomRange(2, 4));

      const mobType = _.shuffle([Types.Entities.MAGE, Types.Entities.GHOST])[0];

      for (let i = 0; i < mageCount; i++) {
        const kind = mobType;

        const id = `7${kind}${count++}`;
        const mob = new Mob(id, kind, x + this.packOrder[i][0], y + this.packOrder[i][1]);
        mob.onMove(this.onMobMoveCallback.bind(this));
        this.addMob(mob);
        this.mageEntityIds.push(id);
      }
    });

    this.chaliceLevelInterval = setInterval(() => {
      this.chaliceLevelClock -= 1;
      if (this.chaliceLevelClock < 0) {
        clearInterval(this.chaliceLevelInterval);

        this.endChaliceLevel();
      }
    }, 1000);
  }

  endChaliceLevel(isCompleted = false) {
    this.chaliceLevelInterval = null;
    this.chaliceLevelClock = null;

    const secretStairs = this.npcs[this.secretStairsChaliceNpcId];
    this.despawn(secretStairs);

    this.getEntityById(this.altarChaliceNpcId)?.deactivate();
    this.pushBroadcast(new Messages.ChaliceLevelEnd(isCompleted));

    // Despawn all mages
    this.mageEntityIds.map(entityId => {
      const entity = this.getEntityById(entityId);
      if (entity) {
        this.removeEntity(entity);
      }
    });
    this.mageEntityIds = [];

    if (!this.shaman.isDead) {
      this.removeEntity(this.shaman);
    }
  }

  startTempleLevel() {
    this.templeLevelClock = 15 * 60; // 15 minutes

    const gate = this.npcs[this.gateTempleNpcId];
    gate.deactivate();
    this.despawn(gate);

    this.pushBroadcast(new Messages.TempleLevelStart());

    if (this.worm.isDead) {
      this.worm.handleRespawn(0);
    }

    if (this.deathAngel.isDead) {
      this.deathAngel.handleRespawn(0);
    }

    let count = 0;
    this.mageTemplePossibleCoords.map(({ x, y }) => {
      const mageCount = Math.ceil(randomRange(2, 5));
      const kind = _.shuffle([Types.Entities.MAGE, Types.Entities.SKELETONARCHER])[0];

      for (let i = 0; i < mageCount; i++) {
        const id = `7${kind}${count++}`;
        const mob = new Mob(id, kind, x + this.packOrder[i][0], y + this.packOrder[i][1]);
        mob.isInsideTemple = true;
        mob.onMove(this.onMobMoveCallback.bind(this));
        this.addMob(mob);
        this.mageTempleEntityIds.push(id);
      }
    });

    this.templeLevelInterval = setInterval(() => {
      this.templeLevelClock -= 1;

      if (this.templeLevelClock < 0) {
        clearInterval(this.templeLevelInterval);
        this.endTempleLevel();
      }
    }, 1000);
  }

  endTempleLevel() {
    this.templeLevelInterval = null;
    this.templeLevelClock = null;

    const gate = this.npcs[this.gateTempleNpcId];
    gate.activate();
    gate.respawnCallback();

    this.pushBroadcast(new Messages.TempleLevelEnd());

    const lever = this.npcs[this.leverChaliceNpcId];
    lever.deactivate();
    this.pushBroadcast(new Messages.Unraise(lever.id));

    const deathAngelDoor = this.getEntityById(this.doorDeathAngelNpcId);
    deathAngelDoor.deactivate();
    const deathAngelLever = this.getEntityById(this.leverDeathAngelNpcId);
    deathAngelLever.deactivate();

    // Despawn all mages
    this.mageTempleEntityIds.map(entityId => {
      const entity = this.getEntityById(entityId);
      if (entity) {
        this.removeEntity(entity);
      }
    });
    this.mageTempleEntityIds = [];

    if (!this.worm.isDead) {
      this.removeEntity(this.worm);
    }

    if (!this.deathAngel.isDead) {
      this.removeEntity(this.deathAngel);
    }
  }

  startStoneLevel() {
    this.stoneLevelClock = 15 * 60; // 15 minutes
    this.powderSpiderId = null;
    this.chaliceSpiderId = null;
    this.spiderTotal = 1; // count the Queen

    const stonePortal = this.npcs[this.portalStoneNpcId];
    stonePortal.respawnCallback();

    const stoneInnerPortal = this.npcs[this.portalStoneInnerNpcId];
    stoneInnerPortal.respawnCallback();

    if (this.spiderQueen.isDead) {
      this.spiderQueen.handleRespawn(0);
    }

    this.pushBroadcast(new Messages.StoneLevelStart());

    let count = 0;
    _.shuffle(this.spiderPossibleCoords).map(({ x, y }, coordsIndex) => {
      const kind = coordsIndex % 2 ? Types.Entities.SPIDER : Types.Entities.SPIDER2;
      const id = `7${kind}${count++}`;

      this.spiderTotal += 1;

      const mob = new Mob(id, kind, x, y);
      mob.onMove(this.onMobMoveCallback.bind(this));
      mob.onDestroy(() => {
        this.spiderTotal--;

        if (this.spiderTotal === 0) {
          clearInterval(this.stoneLevelInterval);
          setTimeout(() => {
            // Return everyone to stones, leave 5s to loot any last drop
            this.endStoneLevel();
          }, 5000);
        }
      });

      this.addMob(mob);
      this.spiderEntityIds.push(id);

      if (coordsIndex === 0) {
        this.powderSpiderId = mob.id;
      } else if (coordsIndex === 4) {
        this.chaliceSpiderId = mob.id;
      }
    });

    this.stoneLevelInterval = setInterval(() => {
      this.stoneLevelClock -= 1;
      if (this.stoneLevelClock < 0) {
        clearInterval(this.stoneLevelInterval);

        this.endStoneLevel();
      }
    }, 1000);
  }

  endStoneLevel() {
    this.stoneLevelInterval = null;
    this.stoneLevelClock = null;
    const stonePortal = this.npcs[this.portalStoneNpcId];
    this.despawn(stonePortal);
    const bloodPortal = this.npcs[this.portalStoneInnerNpcId];
    this.despawn(bloodPortal);
    this.pushBroadcast(new Messages.StoneLevelEnd());
    this.deactivateMagicStones();

    // Despawn all spiders
    this.spiderEntityIds.map(entityId => {
      const entity = this.getEntityById(entityId);
      if (entity) {
        this.removeEntity(entity);
      }
    });
    this.spiderEntityIds = [];

    if (!this.spiderQueen.isDead) {
      this.removeEntity(this.spiderQueen);
    }
  }

  startGatewayLevel() {
    this.gatewayLevelClock = 15 * 60; // 15 minutes

    const gatewayPortal = this.npcs[this.portalGatewayNpcId];
    gatewayPortal.respawnCallback();

    const gatewayInnerPortal = this.npcs[this.portalGatewayInnerNpcId];
    gatewayInnerPortal.respawnCallback();

    this.pushBroadcast(new Messages.GatewayLevelStart());

    if (this.butcher.isDead) {
      this.butcher.handleRespawn(0);
    }

    let count = 0;
    this.archerPossibleCoords.map(({ x, y }) => {
      const archerCount = Math.ceil(randomRange(3, 5));

      for (let i = 0; i < archerCount; i++) {
        const kind = Types.Entities.SKELETONARCHER;
        const id = `7${kind}${count++}`;
        const mob = new Mob(id, kind, x + this.packOrder[i][0], y + this.packOrder[i][1]);
        mob.onMove(this.onMobMoveCallback.bind(this));
        mob.onDestroy(() => {});

        this.addMob(mob);
        this.archerEntityIds.push(id);
      }
    });

    this.gatewayLevelInterval = setInterval(() => {
      this.gatewayLevelClock -= 1;
      if (this.gatewayLevelClock < 0) {
        clearInterval(this.gatewayLevelInterval);
        this.endGatewayLevel();
      }
    }, 1000);
  }

  endGatewayLevel() {
    this.gatewayLevelInterval = null;
    this.gatewayLevelClock = null;

    const gatewayPortal = this.npcs[this.portalGatewayNpcId];
    this.despawn(gatewayPortal);

    const gatewayInnerPortal = this.npcs[this.portalGatewayInnerNpcId];
    this.despawn(gatewayInnerPortal);

    this.pushBroadcast(new Messages.GatewayLevelEnd());
    this.deactivateHands();

    // Despawn all archers
    this.archerEntityIds.map(entityId => {
      const entity = this.getEntityById(entityId);
      if (entity) {
        this.removeEntity(entity);
      }
    });
    this.archerEntityIds = [];

    if (!this.butcher.isDead) {
      this.removeEntity(this.butcher);
    }
  }

  startTreeLevel(tree) {
    this.isActivatedTreeLevel = true;

    this.despawn(tree);

    const secretStairs = this.npcs[this.secretStairsTreeNpcId];
    secretStairs.respawnCallback();

    setTimeout(() => {
      this.isActivatedTreeLevel = false;

      tree.respawnCallback();
      this.despawn(secretStairs);
    }, 5_000);
  }

  async activateFossil(player, force = false) {
    if (force || (await this.databaseHandler.useWeaponItem(player))) {
      const secretStairs = this.npcs[this.secretStairsPickaxeNpcId];
      secretStairs.respawnCallback();

      setTimeout(() => {
        this.isActivatedTreeLevel = false;
        this.despawn(secretStairs);
      }, 10_000);
    }
  }

  createItem({ kind, x, y, partyId, level, mobKind, amount }: ItemProps) {
    var id = "9" + this.itemCount++,
      item = null;

    if (kind === Types.Entities.CHEST) {
      item = new Chest(id, x, y);
    } else {
      item = new Item({ id, kind, x, y, partyId, level, mobKind, amount });
    }
    return item;
  }

  createChest(x, y, items) {
    var chest = this.createItem({ kind: Types.Entities.CHEST, x, y });
    chest.setItems(items);

    return chest;
  }

  addStaticItem(item) {
    item.isStatic = true;
    item.onRespawn(this.addStaticItem.bind(this, item));

    return this.addItem(item);
  }

  addItemFromChest(kind, x, y) {
    var item = this.createItem({ kind, x, y });
    item.isFromChest = true;

    return this.addItem(item);
  }

  /**
   * The mob will no longer be registered as an attacker of its current target.
   */
  clearMobAggroLink(mob, player: any = null) {
    var targetPlayer = null;
    if (mob.targetId) {
      targetPlayer = this.getEntityById(mob.targetId);
      if (targetPlayer) {
        if (!player || (player && targetPlayer.id === player.id)) {
          targetPlayer.removeAttacker(mob);
        }
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

      if (mob.kind === Types.Entities.NECROMANCER && !mob.hasTarget()) {
        this.startRaiseNecromancerInterval(player, mob);
      } else if (mob.kind === Types.Entities.DEATHANGEL && !mob.hasTarget()) {
        this.startRaiseDeathAngelInterval(player, mob);
      } else if (mob.kind === Types.Entities.DEATHBRINGER && !mob.hasTarget()) {
        this.startRaiseDeathBringerInterval(player, mob);
      } else if (mob.kind === Types.Entities.BUTCHER && !mob.hasTaunted) {
        mob.hasTaunted = true;
        this.pushBroadcast(new Messages.Taunt(mob.id));
      }

      if (mob.hitPoints > 0) {
        // only choose a target if still alive
        this.chooseMobTarget(mob);
      }
    }
  }

  chooseMobTarget(mob, hateRank?: number, ignorePlayerId?: number) {
    var playerId = mob.getHatedPlayerId(hateRank, ignorePlayerId);
    var player;

    // @NOTE Fix monsters teleporting with players
    if (ignorePlayerId && ignorePlayerId === playerId) {
      player = null;
    } else {
      player = this.getEntityById(playerId);
    }

    // If the mob is not already attacking the player, create an attack link between them.
    // @TODO REMOVE FORM ATTACKERS!!! WATCH THIS CONDITION CLOSELY... do we need that second part?
    // When using the second part, the server is not constantly sending the attack link when
    // the player exploits a bottom wall to have the enemy over and not attacking
    // The second part was commented to fix attacker though doors
    // @NOTE Make sure the link is cleared
    if (!player) {
      this.clearMobAggroLink(mob);
    } else {
      this.clearMobAggroLink(mob, player);

      player.addAttacker(mob);
      mob.setTarget(player);

      this.broadcastAttacker(mob);
      console.debug(mob.id + " is now attacking " + player.id);
    }
  }

  onEntityAttack(callback) {
    this.attack_callback = callback;
  }

  getEntityById(id) {
    if (id in this.entities) {
      return this.entities[id];
    } else {
      console.log("Unknown entity : " + id);
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
      Object.values(this.players).reduce((acc: any[], { name, level, hash, account, network, partyId }) => {
        acc.push({
          name,
          level,
          network: account ? network : null,
          hash: !!hash,
          partyId,
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

  startRaiseNecromancerInterval(character, mob) {
    this.stopRaiseNecromancerInterval();

    const raiseZombies = () => {
      const adjustedDifficulty = this.getPlayersAroundEntity(mob);

      const minRaise = adjustedDifficulty + 1;

      if (minRaise) {
        this.broadcastRaise(character, mob);

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

    this.raiseNecromancerInterval = setInterval(() => {
      if (mob && Array.isArray(mob.hateList) && !mob.hateList.length) {
        this.stopRaiseNecromancerInterval();
        this.despawnZombies();
      } else {
        raiseZombies();
      }
    }, 7500);

    raiseZombies();
  }

  stopRaiseNecromancerInterval() {
    clearInterval(this.raiseNecromancerInterval);
    this.raiseNecromancerInterval = null;
  }

  startRaiseDeathAngelInterval(player, mob) {
    this.stopRaiseDeathAngelInterval();

    const raiseSkeletonSpell = () => {
      this.broadcastRaise(player, mob);
      this.isCastDeathAngelSpellEnabled = true;
    };

    this.raiseDeathAngelInterval = setInterval(() => {
      if (mob && Array.isArray(mob.hateList) && !mob.hateList.length) {
        this.stopRaiseDeathAngelInterval();
      } else {
        raiseSkeletonSpell();
      }
    }, 4000);

    // @TODO Remove? or random raise on aggro ~~~
    raiseSkeletonSpell();
  }

  stopRaiseDeathAngelInterval() {
    clearInterval(this.raiseDeathAngelInterval);
    this.raiseDeathBringerInterval = null;
    this.isCastDeathBringerSpellEnabled = true;
  }

  startRaiseDeathBringerInterval(player, mob) {
    this.stopRaiseDeathBringerInterval();

    const raiseSkeletonSpell = () => {
      this.broadcastRaise(player, mob);
      this.isCastDeathAngelSpellEnabled = true;
    };

    this.raiseDeathBringerInterval = setInterval(() => {
      if (mob && Array.isArray(mob.hateList) && !mob.hateList.length) {
        this.stopRaiseDeathBringerInterval();
      } else {
        raiseSkeletonSpell();
      }
    }, 2500);

    raiseSkeletonSpell();
  }

  stopRaiseDeathBringerInterval() {
    clearInterval(this.raiseDeathAngelInterval);
    this.raiseDeathBringerInterval = null;
    this.isCastDeathBringerSpellEnabled = true;
  }

  activateMagicStone(player, magicStone) {
    magicStone.activate();

    const magicStoneIndex = this.magicStones.findIndex(id => id === magicStone.id);
    const blueflame = this.getEntityById(this.blueFlames[magicStoneIndex]);
    blueflame.activate();

    this.activatedMagicStones.push(magicStone.id);

    this.broadcastRaise(player, magicStone);
    this.pushBroadcast(new Messages.Raise(blueflame.id));

    if (this.magicStones.length === this.activatedMagicStones.length) {
      this.startStoneLevel();
    }
  }

  deactivateMagicStones() {
    this.blueFlames.forEach(id => {
      this.getEntityById(id).deactivate();
      this.pushBroadcast(new Messages.Unraise(id));
    });
    this.magicStones.forEach(id => {
      this.getEntityById(id).deactivate();
      this.pushBroadcast(new Messages.Unraise(id));
    });

    this.activatedMagicStones = [];
  }

  activateLever(player, lever, force = false) {
    if (!force && lever.id === this.leverDeathAngelNpcId && !this.worm.isDead) return;
    if (!force && lever.id === this.leverChaliceNpcId && !this.shaman.isDead) return;

    lever.activate();

    if (lever.id === this.leverChaliceNpcId) {
      clearInterval(this.chaliceLevelInterval);
      setTimeout(() => {
        this.endChaliceLevel(true);
      }, 3000);

      this.startTempleLevel();
    } else if (lever.id === this.leverLeftCryptNpcId) {
      const secretStairs = this.npcs[this.secretStairsLeftTemplarNpcId];
      secretStairs.respawnCallback();
    } else if (lever.id === this.leverRightCryptNpcId) {
      const secretStairs = this.npcs[this.secretStairsRightTemplarNpcId];
      secretStairs.respawnCallback();
    } else if (lever.id === this.leverDeathAngelNpcId) {
      const deathAngelDoor = this.getEntityById(this.doorDeathAngelNpcId);
      deathAngelDoor.activate();
      this.broadcastRaise(player, deathAngelDoor);
    }

    this.broadcastRaise(player, lever);
  }

  activateStatues() {
    this.statues.forEach(statueId => {
      this.activateStatue(statueId);
    });
  }

  activateStatue(statueId) {
    const statue = this.getEntityById(statueId);
    const player = this.getFirstPlayerNearEntity(statue);

    if (player) {
      if (!statue.isActivated) {
        statue.activate();

        this.broadcastRaise(player, statue);

        let kind = Types.Entities.STATUESPELL;
        let element = "flame";
        if (statue.kind === Types.Entities.STATUE2) {
          kind = Types.Entities.STATUE2SPELL;
          element = "cold";
        }

        setTimeout(() => {
          this.addSpell({
            kind,
            x: statue.x,
            y: statue.y + 1,
            orientation: Types.Orientations.DOWN,
            originX: statue.x,
            originY: statue.y,
            element,
            casterId: statue.id,
            casterKind: statue.kind,
          });
        }, 300);

        setTimeout(() => {
          statue.isActivated = false;
          this.activateStatue(statueId);
        }, randomInt(2, 3) * 1000);
      }
    } else {
      statue.deactivate();
    }
  }

  async activateAltarChalice(player, force = false) {
    const altar = this.getEntityById(this.altarChaliceNpcId);

    if (altar && altar instanceof Npc && !altar.isActivated) {
      if (force || (await this.databaseHandler.useInventoryItem(player, "chalice"))) {
        altar.activate();

        this.startChaliceLevel();
        this.broadcastRaise(player, altar);
      }
    }
  }

  async activateAltarSoulStone(player, force = false) {
    const altar = this.getEntityById(this.altarSoulStoneNpcId);

    if (altar && altar instanceof Npc && !altar.isActivated) {
      altar.activate();
      setTimeout(() => {
        altar.deactivate();
      }, 1000);

      if (force || (await this.databaseHandler.useInventoryItem(player, "soulstone"))) {
        let kind;
        let item;
        try {
          let soulStoneItem = generateSoulStoneItem();

          const isRune = Types.isRune(soulStoneItem.item);

          if (!isRune) {
            kind = Types.getKindFromString(soulStoneItem.item);
            item = player.generateItem({
              kind,
              uniqueChances: soulStoneItem.uniqueChances,
            });
          } else {
            item = soulStoneItem;
            kind = Types.getKindFromString(soulStoneItem.item);

            const runeName = item.item;
            const rune = Types.getRuneFromItem(runeName);

            if (rune.rank >= 20) {
              postMessageToDiscordEventChannel(
                `${player.name} obtained ${Types.RuneList[rune.rank - 1].toUpperCase()} rune ${
                  EmojiMap[runeName]
                } from the Soul Stone`,
              );
            }
          }

          this.databaseHandler.lootItems({
            player,
            items: [item],
          });

          player.send(new Messages.SoulStone({ kind, isUnique: item.isUnique }).serialize());

          this.broadcastRaise(player, altar);
          this.databaseHandler.foundAchievement(player, ACHIEVEMENT_ZAP_INDEX);
        } catch (err) {
          Sentry.captureException(err, {
            extra: {
              player: player.name,
              item,
            },
          });
        }
      }
    }
  }

  async activateHands(player, force = false) {
    const hands = this.getEntityById(this.handsNpcId);

    this.soulStonePlayerName = player.name;

    if (hands && hands instanceof Npc && !hands.isActivated) {
      if (force || (await this.databaseHandler.useInventoryItem(player, "powderquantum"))) {
        hands.activate();

        this.startGatewayLevel();
        this.broadcastRaise(player, hands);
      }
    }
  }

  deactivateHands() {
    const hands = this.getEntityById(this.handsNpcId);

    this.soulStonePlayerName = null;

    if (hands && hands instanceof Npc && hands.isActivated) {
      hands.deactivate();

      this.pushBroadcast(new Messages.Unraise(hands.id));
    }
  }

  activateTrap(player, trapId) {
    const trap = this.getEntityById(trapId);
    if (!trap || trap.isActivated) return;

    trap.activate();
    this.broadcastRaise(player, trap);

    setTimeout(() => {
      trap.isActivated = false;
    }, 3000);
  }

  broadcastRaise(player, mob) {
    if (player && mob) {
      this.pushToAdjacentGroups(player.group, mob.raise(player.id));
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

    if (Types.isMiniBoss(mob)) {
      exp = Math.floor(exp * 3);
    }

    const levelDifference = playerLevel - mobLevel;

    if (Types.isBoss(mob.kind)) {
      if (levelDifference < 0 && levelDifference >= -EXP_LEVEL_BELOW_MOB) {
        const multiplier = Math.abs(levelDifference) / 8;
        exp = Math.ceil(exp * multiplier);
      } else {
        exp = 0;
      }
    } else if (levelDifference < 0) {
      if (levelDifference < -EXP_LEVEL_BELOW_MOB) {
        exp = 0;
      }
    } else if (levelDifference > 0) {
      // Too high level for mob
      if (levelDifference > EXP_LEVEL_END_RANGE) {
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
  handleHurtEntity({ attacker, entity, dmg, isCritical = false, isBlocked = false }) {
    if (attacker?.type === "player") {
      // Let the player know how much damage was inflicted
      this.pushToPlayer(
        attacker,
        new Messages.Damage(entity, dmg, entity.hitPoints, entity.maxHitPoints, isCritical, isBlocked),
      );

      if (entity?.healthEntity) {
        this.pushToAdjacentGroups(attacker.group, entity.healthEntity(), [attacker.id, entity.id]);
      }
    }

    if (entity.type === "player") {
      // A player is only aware of his own hitpoints
      this.pushToPlayer(entity, entity.health({ isHurt: true, dmg, isBlocked, attacker: { type: attacker.type } }));
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

        if (entity.petEntity) {
          this.despawn(entity.petEntity);
        }

        if (attacker.type === "mob" || attacker.casterKind) {
          const penalty = getGoldDeathPenaltyPercent(entity.level);
          if (!penalty) return;

          this.databaseHandler
            .deductGold(entity, { penalty })
            .then(goldBank => {
              this.goldBank = Number(goldBank);
            })
            .catch(err => {
              Sentry.captureException(err);
            });
        }

        if (attacker.type === "player") {
          postMessageToDiscordChatChannel(`${attacker.name} killed ${entity.name} 💀`);
        }
      }

      this.removeEntity(entity);
    }

    if (attacker?.type === "spell" && ![Types.Entities.DEATHBRINGERSPELL].includes(attacker.kind)) {
      this.pushToAdjacentGroups(attacker.group, attacker.despawn());
      this.removeEntity(attacker);
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
        } else if ([Types.Entities.SPIDER, Types.Entities.SPIDER2].includes(kind)) {
          self.spiderPossibleCoords.push({ x: pos.x + 1, y: pos.y });
        } else if (kind === Types.Entities.SKELETONARCHER && pos.x < 29 && pos.y >= 744 && pos.y <= 781) {
          self.archerPossibleCoords.push({ x: pos.x + 1, y: pos.y });
        } else if (kind === Types.Entities.MAGE && pos.x < 29 && pos.y >= 696 && pos.y <= 734) {
          self.magePossibleCoords.push({ x: pos.x + 1, y: pos.y });
        } else if (kind === Types.Entities.MAGE && pos.x > 112 && pos.y >= 744) {
          self.mageTemplePossibleCoords.push({ x: pos.x + 1, y: pos.y });
        } else {
          const id = `7${kind}${count++}`;
          const mob = new Mob(id, kind, pos.x + 1, pos.y);

          if (kind === Types.Entities.MINOTAUR) {
            self.minotaur = mob;
            mob.onDestroy(() => {
              clearInterval(self.minotaurLevelInterval);
              setTimeout(() => {
                // Return everyone to town, leave 5s to loot any last drop
                self.endMinotaurLevel();
              }, 5000);

              const time = (random(120) + 60 * 6) * 60 * 1000;

              self.minotaurSpawnTimeout = setTimeout(() => {
                mob.handleRespawn(0);
                self.minotaurSpawnTimeout = null;
              }, time);
            });
          } else if (kind === Types.Entities.BUTCHER) {
            self.butcher = mob;
            mob.onDestroy(() => {
              if (!self.gatewayLevelClock) return;

              clearInterval(self.gatewayLevelInterval);
              setTimeout(() => {
                // Return everyone to gateway, leave 5s to loot any last drop
                self.endGatewayLevel();
              }, 5000);
            });
          } else if (kind === Types.Entities.SPIDERQUEEN) {
            self.spiderQueen = mob;
            mob.onDestroy(() => {
              if (!self.stoneLevelClock) return;
              self.spiderTotal--;

              if (self.spiderTotal === 0) {
                clearInterval(self.stoneLevelInterval);
                setTimeout(() => {
                  // Return everyone to stones, leave 5s to loot any last drop
                  self.endStoneLevel();
                }, 5000);
              }
            });
          } else if (kind === Types.Entities.WORM) {
            self.worm = mob;
          } else if (kind === Types.Entities.SHAMAN) {
            self.shaman = mob;
          } else if (kind === Types.Entities.DEATHANGEL) {
            self.deathAngel = mob;
            self.deathAngelSpawnCoords = { x: mob.x, y: mob.y };

            mob.onDestroy(() => {
              if (!self.templeLevelClock) return;

              clearInterval(self.templeLevelInterval);
              setTimeout(() => {
                // Return everyone to gateway, leave 5s to loot any last drop
                self.endTempleLevel();
              }, 5000);
            });
          } else if (kind === Types.Entities.SKELETONTEMPLAR || kind === Types.Entities.SKELETONTEMPLAR2) {
            const isPoisonTemplar = kind === Types.Entities.SKELETONTEMPLAR;
            const isMagicTemplar = kind === Types.Entities.SKELETONTEMPLAR2;

            if (isPoisonTemplar) {
              self.poisonTemplarId = mob.id;
            } else if (isMagicTemplar) {
              self.magicTemplarId = mob.id;
            }

            mob.onDestroy(() => {
              const lever = self.npcs[isPoisonTemplar ? self.leverLeftCryptNpcId : self.leverRightCryptNpcId];
              const secretStairs =
                self.npcs[isPoisonTemplar ? self.secretStairsLeftTemplarNpcId : self.secretStairsRightTemplarNpcId];

              self.despawn(secretStairs);
              lever.deactivate();
              self.pushBroadcast(new Messages.Unraise(lever.id));
            });
          }

          mob.onRespawn(function () {
            mob.isDead = false;

            self.addMob(mob);
            if (mob.area && mob.area instanceof ChestArea) {
              mob.area.addToArea(mob);
            }

            mob.handleRandomElement();
            mob.handleEnchant();
            mob.handleRandomResistances();
          });
          mob.onMove(self.onMobMoveCallback.bind(self));

          if ([Types.Entities.ZOMBIE].includes(kind)) {
            mob.isDead = true;
            self.zombies.push(mob);
          } else {
            self.addMob(mob);
          }
          self.tryAddingMobToChestArea(mob);
        }
      }

      if (Types.isItem(kind)) {
        self.addStaticItem(self.createItem({ kind, x: pos.x + 1, y: pos.y }));
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
    var previousAttackers = [];

    // When a player dies or teleports, all of his attackers go and attack their second most hated player.
    player.forEachAttacker(mob => {
      previousAttackers.push(mob);
      this.chooseMobTarget(mob, 2, player.id);
    });

    // When a player dies or teleports, all of his attackers go and attack their second most hated player or return to their original x,y.
    Object.entries(player.haters).map(([_id, mob]: [any, Mob]) => {
      player.removeHater(mob);
      mob.clearTarget();
      mob.forgetPlayer(player.id, 1000);
      mob.removeAttacker(player);

      if (mob.hateList.length === 0 && mob.kind === Types.Entities.ZOMBIE) {
        this.despawn(mob);
      }
    });

    _.each(previousAttackers, mob => {
      player.removeAttacker(mob);
      mob.clearTarget();
      mob.forgetPlayer(player.id, 1000);

      if (mob.hateList.length === 0 && mob.kind === Types.Entities.ZOMBIE) {
        // @NOTE maybe not needed
        this.despawn(mob);
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

  lootChests(mob, attacker) {
    if (
      mob.kind === Types.Entities.MINOTAUR ||
      mob.kind === Types.Entities.BUTCHER ||
      mob.kind === Types.Entities.DEATHANGEL
    ) {
      const MIN_DAMAGE = {
        [Types.Entities.MINOTAUR]: 2000,
        [Types.Entities.BUTCHER]: 2500,
        [Types.Entities.DEATHANGEL]: 3000,
      };
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

      const playersToReceiveChests: { [key: string]: string[] } = {};

      members.forEach(id => {
        const player = this.getEntityById(id);

        if (!player) {
          Sentry.captureException(new Error("Missing party member"), {
            user: {
              username: attacker.name,
            },
            extra: { id },
          });
          return;
        }

        let chestType: ChestType = null;

        if (mob.kind === Types.Entities.MINOTAUR) {
          if (player.level < 50) {
            // @NOTE: Ban player w/ reason
            // return;
          }
          if (player?.minotaurDamage >= MIN_DAMAGE[mob.kind]) {
            chestType = player.level >= 56 ? "chestgreen" : "chestblue";
          }
        } else if (mob.kind === Types.Entities.BUTCHER) {
          if (player?.butcherDamage >= MIN_DAMAGE[mob.kind]) {
            chestType = "chestred";
          }
        } else if (mob.kind === Types.Entities.DEATHANGEL) {
          if (player?.deathAngelDamage >= MIN_DAMAGE[mob.kind]) {
            chestType = "chestpurple";
          }
        }

        if (chestType) {
          this.databaseHandler.lootItems({
            player,
            items: [{ item: chestType, quantity: 1 }],
          });

          if (!playersToReceiveChests[chestType]) {
            playersToReceiveChests[chestType] = [];
          }

          playersToReceiveChests[chestType].push(player.name);

          if (party) {
            this.pushToParty(
              party,
              new Messages.Party(Types.Messages.PARTY_ACTIONS.LOOT, [
                { playerName: player.name, kind: Types.Entities[chestType.toUpperCase()] },
              ]),
            );
          }
        }
      });

      if (Object.keys(playersToReceiveChests).length) {
        Object.entries(playersToReceiveChests).map(([chestType, players]) => {
          postMessageToDiscordEventChannel(
            `${players.join(", ")} received a ${_.capitalize(chestType.replace("chest", ""))} Chest ${
              EmojiMap[chestType]
            }`,
          );
        });
      }
    }
  }

  getDroppedItemName(mob, attacker) {
    const mobLevel = Types.getMobLevel(mob.kind);
    const kind = Types.getKindAsString(mob.kind);
    const drops = mob.isInsideTemple ? Properties.templeMob.drops : Properties[kind].drops;
    const isBoss = Types.isBoss(mob.kind);

    const v = random(100) + 1;
    let p = 0;
    let itemKind = null;

    if (mob.kind === Types.Entities.COW) {
      const diamondRandom = random(800);
      if (diamondRandom === 69) {
        return "diamondsword";
      } else if (diamondRandom === 133) {
        return "diamondarmor";
      } else if (diamondRandom === 420) {
        return "beltdiamond";
      } else if (diamondRandom === 555) {
        return "shielddiamond";
      } else if (diamondRandom === 42) {
        return "helmdiamond";
      }
    }

    if (mob.isInsideTemple) {
      const templeMobRandom = random(800);
      if (templeMobRandom === 133) {
        return "ringmystical";
      }
    }

    if (mob.kind >= Types.Entities.EYE) {
      const vv = random(12000);
      if (vv === 420) {
        return "ringraistone";
      } else if (mob.kind >= Types.Entities.RAT2 && vv === 6969) {
        return "ringfountain";
      } else if (mob.kind === Types.Entities.COW && vv === 133) {
        return "amuletfrozen";
      }
    }

    if (mob.kind === Types.Entities.GOLEM) {
      if (!attacker.hasNft && random(150) === 100) {
        return "nft";
      }
    } else if (mob.kind === Types.Entities.SNAKE4) {
      if (!attacker.hasWing && random(150) === 100) {
        return "wing";
      }
    }
    // @TODO Bind the CRYSTAL quest!
    //  else if (mob.kind === Types.Entities.SHAMAN) {
    //   if (!attacker.hasCrystal && random(150) === 100) {
    //     return "crystal";
    //   }
    // }

    if ([Types.Entities.SPIDER, Types.Entities.SPIDER2].includes(mob.kind)) {
      if (mob.id === this.powderSpiderId) {
        return "powderred";
      } else if (mob.id === this.chaliceSpiderId) {
        return "chalice";
      }
    }

    if (mob.kind >= Types.Entities.OCULOTHORAX) {
      const superUniqueRandom = random(15_000);

      if ([Types.Entities.MAGE, Types.Entities.SHAMAN, Types.Entities.DEATHANGEL].includes(mob.kind)) {
        if (superUniqueRandom === 666) {
          return "ringwizard";
        } else if (superUniqueRandom === 777) {
          return "ringmystical";
        }
      }

      if (mob.kind >= Types.Entities.SPIDERQUEEN) {
        if (superUniqueRandom === 133) {
          return "amuletmoon";
        } else if (superUniqueRandom === 420) {
          return "amuletdragon";
        } else if (superUniqueRandom === 555) {
          return "ringheaven";
        }
        //  else if (superUniqueRandom === 1111) {
        //   return "amuleteye";
        // }
      }

      if (superUniqueRandom === 111) {
        return "ringbalrog";
      } else if (superUniqueRandom === 222) {
        return "ringconqueror";
      } else if (superUniqueRandom === 6969) {
        return "amuletstar";
      } else if (superUniqueRandom === 5555) {
        return "amuletskull";
      } else if (superUniqueRandom === 4242) {
        return "ringgreed";
      } else if (superUniqueRandom === 5757) {
        return "amuletgreed";
      } else if (superUniqueRandom === 6666) {
        return "amuletgreed";
      }

      const stoneDragonRandom = random(25_000);
      if (stoneDragonRandom === 133) {
        return "stonedragon";
      }

      const stoneHeroRandom = random(100_000);
      if (stoneHeroRandom === 133) {
        return "stonehero";
      }
    }

    if (!isBoss) {
      const runeRandom = random(250);
      if (runeRandom === 133) {
        return `rune-${getRandomRune(Types.getMobLevel(mob.kind))}`;
      } else if (runeRandom === 42) {
        return "stonesocket";
      } else if (runeRandom === 69) {
        return "jewelskull";
      }

      const socketStoneRandom = random(400);
      if (socketStoneRandom === 133) {
        return `socketstone`;
      }

      if (mob.kind >= Types.Entities.WRAITH) {
        const transmuteRandom = random(800);
        if (transmuteRandom === 133) {
          return "scrolltransmute";
        }
      }

      if (mob.kind >= Types.Entities.OCULOTHORAX) {
        const transmuteRandom = random(7_000);
        if (transmuteRandom === 133) {
          return "scrolltransmuteblessed";
        }
      }

      if (mob.kind >= Types.Entities.GHOST) {
        const superUnqueRandom = random(12_000);
        if (superUnqueRandom === 133) {
          return "helmclown";
        } else if (superUnqueRandom === 42) {
          return "beltgoldwrap";
        }
      }
    }

    if (mob.x <= 29 && mob.y >= 744 && mob.y <= 781) {
      const demonRandom = random(800);
      if (demonRandom === 69) {
        return "demonaxe";
      } else if (demonRandom === 133) {
        return "demonarmor";
      } else if (demonRandom === 420) {
        return "beltdemon";
      } else if (demonRandom === 555) {
        return "shielddemon";
      } else if (demonRandom === 699) {
        return "helmdemon";
      }
    }

    if (mob.kind === Types.Entities.SKELETON4 && !attacker.hasObelisk) {
      const pickaxeRandom = random(250);
      if (pickaxeRandom === 133) {
        return "pickaxe";
      }
    }

    if (!isBoss) {
      if (mob.kind >= Types.Entities.RAT && mob.kind <= Types.Entities.ZOMBIE) {
        const barRandom = random(5_000);
        if (barRandom === 133) {
          return "barbronze";
        }
      }
      if (mob.kind >= Types.Entities.RAT2) {
        const barRandom = random(17_500);
        if (barRandom === 133) {
          return "barsilver";
        }
      }

      if (mob.kind >= Types.Entities.RAT3) {
        const barRandom = random(200_000);
        if (barRandom === 133) {
          return "bargold";
        }
      }
    }
    if (!isBoss) {
      if (mob.kind <= Types.Entities.DEATHKNIGHT) {
        const iouRandom = random(1000);
        if (iouRandom === 133) {
          return "iou";
        }
      } else if (mob.kind <= Types.Entities.ZOMBIE) {
        const iouRandom = random(3000);
        if (iouRandom === 133) {
          return "iou";
        }
      } else if (mob.kind <= Types.Entities.SKELETONAXE2) {
        const iouRandom = random(13_000);
        if (iouRandom === 133) {
          return "iou";
        }
      }
    }

    if (!isBoss && [23, 42, 69].includes(v)) {
      //@NOTE 3% chance to drop a NANO/BANANO potion on non-boss monsters
      if (attacker.network === "ban") {
        return "bananopotion";
      } else {
        return "nanopotion";
      }
    } else if (mob.kind === Types.Entities.COWKING && this.cowKingHornDrop) {
      return "cowkinghorn";
    } else {
      for (var itemName in drops) {
        var percentage = drops[itemName];

        p += percentage;
        if (v <= p) {
          itemKind = Types.getKindFromString(itemName);

          if ([Types.Entities.SCROLLUPGRADEHIGH, Types.Entities.SCROLLUPGRADELEGENDARY].includes(itemKind)) {
            const lvlDifference = attacker.level - mobLevel;

            if (lvlDifference >= 8) {
              let reduction = 1;
              if (lvlDifference >= 11 && lvlDifference < 14) {
                reduction = 2;
              } else if (lvlDifference >= 14) {
                reduction = 3;
              }

              const randomscroll = random(4);

              // Reduce scroll drops to prevent crazy farming
              if (randomscroll < reduction) {
                break;
              }
            }
          }

          if (itemKind === Types.Entities.SCROLLUPGRADEHIGH) {
            if (mob.kind >= Types.Entities.YETI) {
              var blessedScroll = random(25);

              if (blessedScroll === 21) {
                itemKind = Types.Entities.SCROLLUPGRADEBLESSED;
              }
            }
          } else if (itemKind === Types.Entities.SCROLLUPGRADELEGENDARY) {
            if (mob.kind >= Types.Entities.GOLEM) {
              const sacredScroll = random(30);

              if (sacredScroll === 21) {
                itemKind = Types.Entities.SCROLLUPGRADESACRED;
              }
            }
          }
          return Types.getKindAsString(itemKind);
        }
      }
    }
  }

  getDroppedItem(mob, attacker) {
    let itemName = this.getDroppedItemName(mob, attacker);
    if (attacker.bonus.magicFind && !itemName) {
      const rerollRandom = random(100);
      if (rerollRandom < Types.calculateMagicFind(attacker.bonus.magicFind)) {
        itemName = this.getDroppedItemName(mob, attacker);
      }
    }

    if (mob.kind === Types.Entities.MINOTAUR) {
      postMessageToDiscordEventChannel(`${attacker.name} slained the Minotaur 🥶`);
    } else if (mob.kind === Types.Entities.COWKING) {
      postMessageToDiscordEventChannel(`${attacker.name} slained the Cow King 🐮`);
    } else if (mob.kind === Types.Entities.SPIDERQUEEN) {
      postMessageToDiscordEventChannel(`${attacker.name} slained Arachneia the Spider Queen 🕷️`);
    } else if (mob.kind === Types.Entities.BUTCHER) {
      postMessageToDiscordEventChannel(`${attacker.name} slained Gorefiend the Butcher 🩸`);
    } else if (mob.kind === Types.Entities.SHAMAN) {
      postMessageToDiscordEventChannel(`${attacker.name} slained Zul'Gurak 🧙`);
    } else if (mob.kind === Types.Entities.WORM) {
      postMessageToDiscordEventChannel(`${attacker.name} slained Shai-Hulud 🪱`);
    } else if (mob.kind === Types.Entities.DEATHANGEL) {
      postMessageToDiscordEventChannel(`${attacker.name} slained Azrael 💀`);
    }

    if ([Types.Entities.MINOTAUR, Types.Entities.BUTCHER, Types.Entities.DEATHANGEL].includes(mob.kind)) {
      this.lootChests(mob, attacker);
    }

    // var randomDrops = ["petegg", "petdino"];
    // var randomDrops = ["helmpaladin", "helmimmortal"];
    // var randomDrops = ["scrollupgradesacred", "scrolltransmuteblessed"];
    // var randomDrops = ["demonaxe", "paladinaxe"];
    // var randomDrops = ["soulstone"];
    // var randomDrops = ["iou"];
    // var randomDrops = ["gold"];
    // var randomDrops = ["barbronze", "barsilver", "bargold", "barplatinum"];
    // var randomDrops = ["ringgreed", "amuletgreed", "amuleteye"];
    // var randomDrops = ["jewelskull"];
    // var randomDrops = ["nft", "wing", "crystal"];
    // var randomDrops = ["powdergreen"];
    // var randomDrops = ["powderblack", "powderblue", "powdergold", "powdergreen", "powderred", "powderquantum"];
    // var randomDrops = ["amuletdragon", "amuletskull"];
    // var randomDrops = ["chalice"];
    // var randomDrops = ["stonehero", "stonedragon", "soulstone"];
    // var randomDrops = [
    // "ringnecromancer",
    // "ringraistone",
    // "ringfountain",
    // "ringminotaur",
    // "ringmystical",
    // "ringbalrog",
    // "ringconqueror",
    // "ringheaven",
    // "ringwizard",
    // "amuletcow",
    // "amuletfrozen",
    // "amuletdemon",
    // "amuletmoon",
    // "amuletstar",
    // "amuletskull",
    // "amuletdragon",
    // ];
    // var randomDrops = ["immortalarmor", "paladinarmor", "demonarmor"];
    // var randomDrops = ["necromancerheart", "skeletonkingcage", "wirtleg"];
    // var randomDrops = [
    // "rune",
    // "jewelskull",
    // "ringplatinum",
    // "ringconqueror",
    // "amuletdemon",
    // "ringmystical",
    // "amuletmoon",
    // "ringheaven",
    // "ringwizard",
    // "amuletplatinum",
    // "ringbalrog",
    // "stonesocket",
    // "scrollupgradelegendary",
    // "scrollupgradesacred",
    // "rune-sat",
    // "rune-al",
    // "rune-bul",
    // "rune-nan",
    // "rune-mir",
    // "rune-gel",
    // "rune-do",
    // "rune-ban",
    // "rune-vie",
    // "rune-um",
    // "rune-hex",
    // "rune-zal",
    // "rune-sol",
    // "rune-eth",
    // "rune-btc",
    // "rune-vax",
    // "rune-por",
    // "rune-las",
    // "rune-dur",
    // "rune-fal",
    // "rune-kul",
    // "rune-mer",
    // "rune-qua",
    // "rune-gul",
    // "rune-ber",
    // "rune-cham",
    // "rune-tor",
    // "rune-xno",
    // "rune-jah",
    // "rune-shi",
    // "rune-vod",
    // ];
    // var randomDrop = random(randomDrops.length);
    // itemName = randomDrops[randomDrop];

    let itemLevel = null;

    if (itemName === "jewelskull") {
      itemLevel = getRandomJewelLevel(Types.getMobLevel(mob.kind));
    } else if (itemName === "rune") {
      itemName = `rune-${getRandomRune(Types.getMobLevel(mob.kind))}`;
    }

    // Potions can be looted by anyone
    const kind = Types.getKindFromString(itemName);
    const partyId = Types.isHealingItem(kind) ? undefined : attacker.partyId;
    let amount = undefined;

    if (Types.Entities.GOLD === kind) {
      amount = generateRandomGoldAmount(mob.name, Types.isMiniBoss(mob));
    } else if (Types.Entities.IOU === kind) {
      amount = generateRandomGoldAmount(mob.name, Types.isMiniBoss(mob)) * 100;
    } else if (Types.Entities.NANOCOIN === kind) {
      // ~~~~@TODO
      // amount = generateRandomNanoAmount(attacker.network);
    } else if (Types.Entities.BANANOCOIN === kind) {
      // ~~~~@TODO
      // amount = generateRandomBananoAmount(attacker.network);
    }

    return itemName
      ? this.addItem(
          this.createItem({
            kind: Types.getKindFromString(itemName),
            x: mob.x,
            y: mob.y,
            partyId,
            level: itemLevel,
            mobKind: mob.kind,
            ...(amount ? { amount } : null),
          }),
        )
      : null;
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
      if (entity instanceof Player && entity.petEntity) {
        entity.petEntity.group = entity.group;
      }
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
        if (entity.petEntity) {
          entity.petEntity.group = entity.group;
        }

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
          if (entity instanceof Player && entity.petEntity) {
            entity.petEntity.recentlyLeftGroups = entity.recentlyLeftGroups;
          }

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
            if (!entity.isDead) {
              if (entity instanceof Player) {
                self.pushToGroup(id, new Messages.Spawn(entity), entity.id);
                if (entity.petEntity) {
                  self.pushToGroup(id, new Messages.Spawn(entity.petEntity), entity.id);
                }
              } else {
                self.pushToGroup(id, new Messages.Spawn(entity));
              }
            }
          });

          // const batchEntitySpawns = self.groups[id].incoming
          //   .map(entity => {
          //     if (entity instanceof Player) {
          //       self.pushToGroup(id, new Messages.Spawn(entity), entity.id);
          //       return;
          //     }
          //     return entity;
          //   })
          //   .filter(Boolean);

          // if (batchEntitySpawns.length) {
          //   self.pushToGroup(id, new Messages.SpawnBatch(batchEntitySpawns));
          // }

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

  isPlayerNearEntity(player, entity, range: number = 20) {
    if (player) {
      return Math.abs(player.x - entity.x) <= range && Math.abs(player.y - entity.y) <= range;
    } else {
      return false;
    }
  }

  getFirstPlayerNearEntity(entity, range: number = 20) {
    for (let id in this.players) {
      if (this.isPlayerNearEntity(this.players[id], entity, range)) {
        return this.players[id];
      }
    }

    return null;
  }

  getPlayersAroundEntity(entity, range: number = 20) {
    let counter = 0;

    for (let id in this.players) {
      if (this.isPlayerNearEntity(this.players[id], entity, range)) {
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

  handleBossDmg({ dmg, entity, player }) {
    // Reduce dmg on boss by 20% per player in boss room
    const adjustedDifficulty = this.getPlayersAroundEntity(entity);

    const percentReduce = Math.pow(0.8, adjustedDifficulty - 1);
    dmg = Math.floor(dmg * percentReduce);

    if (entity.kind === Types.Entities.MINOTAUR) {
      player.minotaurDamage += dmg;
      player.unregisterMinotaurDamage();
    } else if (entity.kind === Types.Entities.BUTCHER) {
      player.butcherDamage += dmg;
      player.unregisterButcherDamage();
    } else if (entity.kind === Types.Entities.DEATHANGEL) {
      player.deathAngelDamage += dmg;
      player.unregisterDeathAngelDamage();
    }

    return dmg;
  }
}

export default World;
