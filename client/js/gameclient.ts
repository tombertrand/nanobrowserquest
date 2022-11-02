import * as _ from "lodash";
import { io, Socket } from "socket.io-client";
import MessageParser from "socket.io-msgpack-parser";

import { Types } from "../../shared/js/gametypes";
import EntityFactory from "./entityfactory";
import Player from "./player";

class GameClient {
  connection: Socket;
  host: any;
  port: any;
  dispatched_callback: any;
  connected_callback: any;
  spawn_callback: any;
  movement_callback: any;
  fail_callback: any;
  notify_callback: any;
  handlers: any;
  receiveSpawnBatch: any;
  isListening?: boolean;
  isTimeout?: boolean;
  disconnected_callback: any;
  welcome_callback: any;
  move_callback: any;
  lootmove_callback: any;
  attack_callback: any;
  raise_callback: any;
  spawn_item_callback: any;
  spawn_chest_callback: any;
  spawn_character_callback: any;
  despawn_callback: any;
  health_callback: any;
  chat_callback: any;
  equip_callback: any;
  auras_callback: any;
  skill_callback: any;
  drop_callback: any;
  teleport_callback: any;
  dmg_callback: any;
  population_callback: any;
  kill_callback: any;
  list_callback: any;
  destroy_callback: any;
  stats_callback: any;
  setbonus_callback: any;
  blink_callback: any;
  pvp_callback: any;
  bosscheck_callback: any;
  partycreate_callback: any;
  partyjoin_callback: any;
  partyrefuse_callback: any;
  partyinvite_callback: any;
  partyleave_callback: any;
  partydisband_callback: any;
  partyinfo_callback: any;
  partyerror_callback: any;
  partyloot_callback: any;
  partyhealth_callback: any;
  traderequestsend_callback: any;
  traderequestreceive_callback: any;
  tradestart_callback: any;
  tradeclose_callback: any;
  tradeinfo_callback: any;
  tradeerror_callback: any;
  tradeplayer1moveitem_callback: any;
  tradeplayer2moveitem_callback: any;
  tradeplayer1status_callback: any;
  tradeplayer2status_callback: any;
  receivenotification_callback: any;
  receiveinventory_callback: any;
  receivestash_callback: any;
  receiveupgrade_callback: any;
  receiveanvilupgrade_callback: any;
  receiveanvilrecipe_callback: any;
  receiveanvilodds_callback: any;
  receivestoreitems_callback: any;
  receivepurchasecompleted_callback: any;
  receivepurchaseerror_callback: any;
  receivewaypointsupdate_callback: any;
  receivecowlevelstart_callback: any;
  receivecowlevelinprogress_callback: any;
  receivecowlevelend_callback: any;
  receiveminotaurlevelstart_callback: any;
  receiveminotaurlevelinprogress_callback: any;
  receiveminotaurlevelend_callback: any;
  receivefrozen_callback: any;
  settings_callback: any;

  constructor(host, port) {
    this.connection = null;
    this.host = host;
    this.port = port;

    this.connected_callback = null;
    this.spawn_callback = null;
    this.movement_callback = null;

    this.fail_callback = null;

    this.notify_callback = null;

    this.handlers = [];
    this.handlers[Types.Messages.WELCOME] = this.receiveWelcome;
    this.handlers[Types.Messages.MOVE] = this.receiveMove;
    this.handlers[Types.Messages.LOOTMOVE] = this.receiveLootMove;
    this.handlers[Types.Messages.ATTACK] = this.receiveAttack;
    this.handlers[Types.Messages.RAISE] = this.receiveRaise;
    this.handlers[Types.Messages.SPAWN] = this.receiveSpawn;
    this.handlers[Types.Messages.DESPAWN] = this.receiveDespawn;
    this.handlers[Types.Messages.SPAWN_BATCH] = this.receiveSpawnBatch;
    this.handlers[Types.Messages.HEALTH] = this.receiveHealth;
    this.handlers[Types.Messages.CHAT] = this.receiveChat;
    this.handlers[Types.Messages.EQUIP] = this.receiveEquipItem;
    this.handlers[Types.Messages.AURAS] = this.receiveAuras;
    this.handlers[Types.Messages.SKILL] = this.receiveSkill;
    this.handlers[Types.Messages.DROP] = this.receiveDrop;
    this.handlers[Types.Messages.TELEPORT] = this.receiveTeleport;
    this.handlers[Types.Messages.DAMAGE] = this.receiveDamage;
    this.handlers[Types.Messages.POPULATION] = this.receivePopulation;
    this.handlers[Types.Messages.LIST] = this.receiveList;
    this.handlers[Types.Messages.DESTROY] = this.receiveDestroy;
    this.handlers[Types.Messages.KILL] = this.receiveKill;
    this.handlers[Types.Messages.STATS] = this.receiveStats;
    this.handlers[Types.Messages.SETBONUS] = this.receiveSetBonus;
    this.handlers[Types.Messages.SETTINGS] = this.receiveSettings;
    this.handlers[Types.Messages.BLINK] = this.receiveBlink;
    this.handlers[Types.Messages.PARTY] = this.receiveParty;
    this.handlers[Types.Messages.TRADE] = this.receiveTrade;
    this.handlers[Types.Messages.PVP] = this.receivePVP;
    this.handlers[Types.Messages.BOSS_CHECK] = this.receiveBossCheck;
    this.handlers[Types.Messages.NOTIFICATION] = this.receiveNotification;
    this.handlers[Types.Messages.INVENTORY] = this.receiveInventory;
    this.handlers[Types.Messages.STASH] = this.receiveStash;
    this.handlers[Types.Messages.UPGRADE] = this.receiveUpgrade;
    this.handlers[Types.Messages.ANVIL_UPGRADE] = this.receiveAnvilUpgrade;
    this.handlers[Types.Messages.ANVIL_RECIPE] = this.receiveAnvilRecipe;
    this.handlers[Types.Messages.ANVIL_ODDS] = this.receiveAnvilOdds;
    this.handlers[Types.Messages.STORE_ITEMS] = this.receiveStoreItems;
    this.handlers[Types.Messages.PURCHASE_COMPLETED] = this.receivePurchaseCompleted;
    this.handlers[Types.Messages.PURCHASE_ERROR] = this.receivePurchaseError;
    this.handlers[Types.Messages.WAYPOINTS_UPDATE] = this.receiveWaypointsUpdate;
    this.handlers[Types.Messages.COWLEVEL_START] = this.receiveCowLevelStart;
    this.handlers[Types.Messages.COWLEVEL_INPROGRESS] = this.receiveCowLevelInProgress;
    this.handlers[Types.Messages.COWLEVEL_END] = this.receiveCowLevelEnd;
    this.handlers[Types.Messages.MINOTAURLEVEL_START] = this.receiveMinotaurLevelStart;
    this.handlers[Types.Messages.MINOTAURLEVEL_INPROGRESS] = this.receiveMinotaurLevelInProgress;
    this.handlers[Types.Messages.MINOTAURLEVEL_END] = this.receiveMinotaurLevelEnd;
    this.handlers[Types.Messages.FROZEN] = this.receiveFrozen;
    this.enable();
  }

  enable() {
    this.isListening = true;
  }

  disable() {
    this.isListening = false;
  }

  connect(dispatcherMode) {
    var protocol = window.location.hostname === "localhost" ? "ws" : "wss";
    var port = window.location.hostname === "localhost" ? ":8000" : "";
    var url = protocol + "://" + this.host + port + "/";

    console.info("Trying to connect to server : " + url);

    this.connection = null;
    this.connection = io(url, {
      // forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 3000,
      reconnectionAttempts: 5,
      parser: MessageParser,
    });

    if (dispatcherMode) {
      this.connection.on("message", e => {
        var reply = JSON.parse(e.data);

        if (reply.status === "OK") {
          this.dispatched_callback(reply.host, reply.port);
        } else if (reply.status === "FULL") {
          alert("BrowserQuest is currently at maximum player population. Please retry later.");
        } else {
          alert("Unknown error while connecting to Nano BrowserQuest.");
        }
      });
    } else {
      this.connection.on("connection", () => {
        console.info("Connected to server " + this.host + ":" + this.port);
      });

      this.connection.on("message", e => {
        if (e === "go") {
          if (this.connected_callback) {
            this.connected_callback();
          }
          return;
        }
        if (e === "timeout") {
          this.isTimeout = true;
          return;
        }
        if (
          e === "invalidlogin" ||
          e === "userexists" ||
          e === "loggedin" ||
          e === "invalidusername" ||
          e === "banned-cheating-1" ||
          e === "banned-cheating-365" ||
          e === "banned-misbehaved-1" ||
          e === "banned-misbehaved-365" ||
          e === "invalidconnection" ||
          e === "passwordcreate" ||
          e === "passwordlogin" ||
          e === "passwordinvalid"
        ) {
          this.fail_callback?.(e);
          return;
        }

        if (e === "messagetoplayer") {
          // self.disconnected_callback(
          //   "The connection to Nano BrowserQuest has been lost"
          // );
        }

        this.receiveMessage(e);
      });

      this.connection.on("error", err => {
        console.error(err);
        $("#container").addClass("error");
        this.disconnected_callback?.("The connection to Nano BrowserQuest has been lost");
      });

      this.connection.io.off("reconnect_attempt").on("reconnect_attempt", attempt => {
        console.info(`Reconnect failed, attempt ${attempt}`);

        if (attempt > 5) {
          this.connection.disconnect();
        }
      });

      this.connection.io.on("reconnect", () => {
        $("#reconnecting").removeClass("visible");
      });

      this.connection.on("disconnect", reason => {
        console.info(`Connection closed, ${reason}`);

        let disconnectMessage;
        if (reason === "transport close") {
          disconnectMessage = "The connection to Nano BrowserQuest has been lost";
        } else if (this.isTimeout) {
          disconnectMessage = "You have been disconnected for being inactive for too long";
        } else {
          $("#reconnecting").addClass("visible");
        }

        if (disconnectMessage) {
          $("#container").addClass("error");
          this.disconnected_callback?.(disconnectMessage);
          this.connection.disconnect();
        }
      });
    }
  }

  sendMessage(json) {
    if (this.connection.connected === true) {
      this.connection.send(json);
    }
  }

  receiveMessage(message) {
    if (this.isListening) {
      if (message instanceof Array) {
        if (message[0] instanceof Array) {
          // Multiple actions received
          this.receiveActionBatch(message);
        } else {
          // Only one action received
          this.receiveAction(message);
        }
      } else if (message && message.type) {
        this.receiveAction(message);
      }
    }
  }

  receiveAction(data) {
    var action = data instanceof Array ? data[0] : data.type;
    if (this.handlers[action] && _.isFunction(this.handlers[action])) {
      this.handlers[action].call(this, data);
    } else {
      console.error("Unknown action : " + action);
    }
  }

  receiveActionBatch(actions) {
    var self = this;

    _.each(actions, function (action) {
      self.receiveAction(action);
    });
  }

  receiveWelcome(data) {
    var id = data[1];
    var name = data[2];
    var x = data[3];
    var y = data[4];
    var hp = data[5];
    var armor = data[6];
    var weapon = data[7];
    var belt = data[8];
    var cape = data[9];
    var shield = data[10];
    var ring1 = data[11];
    var ring2 = data[12];
    var amulet = data[13];
    var experience = data[14];
    var achievement = data[15];
    var inventory = data[16];
    var stash = data[17];
    var hash = data[18];
    var nanoPotions = data[19];
    var gems = data[20];
    var artifact = data[21];
    var expansion1 = data[22];
    var expansion2 = data[23];
    var waypoints = data[24];
    var depositAccount = data[25];
    var auras = data[26];
    var cowLevelPortalCoords = data[27];
    var party = data[28];
    var settings = data[29];
    var network = data[30];

    if (this.welcome_callback) {
      this.welcome_callback({
        id,
        name,
        x,
        y,
        hp,
        armor,
        weapon,
        belt,
        cape,
        shield,
        ring1,
        ring2,
        amulet,
        experience,
        achievement,
        inventory,
        stash,
        hash,
        nanoPotions,
        gems,
        artifact,
        expansion1,
        expansion2,
        waypoints,
        depositAccount,
        auras,
        cowLevelPortalCoords,
        party,
        settings,
        network,
      });
    }
  }

  receiveMove(data) {
    var id = data[1],
      x = data[2],
      y = data[3];

    if (this.move_callback) {
      this.move_callback(id, x, y);
    }
  }

  receiveLootMove(data) {
    var id = data[1],
      item = data[2];

    if (this.lootmove_callback) {
      this.lootmove_callback(id, item);
    }
  }

  receiveAttack(data) {
    var attacker = data[1];
    var target = data[2];

    if (this.attack_callback) {
      this.attack_callback(attacker, target);
    }
  }

  receiveRaise(data) {
    var mobId = data[1];

    if (this.raise_callback) {
      this.raise_callback(mobId);
    }
  }

  receiveSpawn(data) {
    var id = data[1];
    var kind = data[2];
    var x = data[3];
    var y = data[4];

    if (Types.isItem(kind)) {
      var item = EntityFactory.createEntity({ kind, id });

      if (this.spawn_item_callback) {
        this.spawn_item_callback(item, x, y);
      }
    } else if (Types.isStaticChest(kind)) {
      var item = EntityFactory.createEntity({ kind, id });

      if (this.spawn_chest_callback) {
        this.spawn_chest_callback(item, x, y);
      }
    } else {
      var name,
        orientation,
        target,
        weapon,
        weaponLevel,
        weaponBonus,
        weaponSocket,
        armor,
        armorLevel,
        armorBonus,
        level,
        auras,
        partyId,
        cape,
        shield,
        settings;

      orientation = data[5];
      target = data[6];

      if (Types.isPlayer(kind)) {
        name = data[7];
        [armor, armorLevel, armorBonus] = data[8].split(":");
        [weapon, weaponLevel, weaponBonus, weaponSocket] = data[9].split(":");
        level = data[10];
        auras = data[11];
        partyId = data[12];
        cape = data[13];
        shield = data[14];
        settings = data[15];
      }

      var character = EntityFactory.createEntity({ kind, id, name });

      if (character instanceof Player) {
        character.setWeaponName(weapon);
        character.setWeaponLevel(weaponLevel);
        character.setWeaponBonus(weaponBonus);
        character.setWeaponSocket(weaponSocket);
        character.spriteName = armor;
        character.setArmorName(armor);
        character.setArmorLevel(armorLevel);
        character.setArmorBonus(armorBonus);
        character.setLevel(level);
        character.setAuras(auras);
        character.setPartyId(partyId);
        character.setCape(cape);
        character.setShield(shield);
        character.setSettings(settings);
      }

      if (this.spawn_character_callback) {
        this.spawn_character_callback(character, x, y, orientation, target);
      }
    }
  }

  receiveDespawn(data) {
    var id = data[1];

    if (this.despawn_callback) {
      this.despawn_callback(id);
    }
  }

  receiveHealth(data) {
    var health = data[1];
    var isRegen = data[2];
    var isHurt = data[3];

    if (this.health_callback) {
      this.health_callback({ health, isRegen, isHurt });
    }
  }

  receiveChat(data) {
    var entityId = data[1];
    var name = data[2];
    var message = data[3];
    var type = data[4];

    if (this.chat_callback) {
      this.chat_callback({ entityId, name, message, type });
    }
  }

  receiveEquipItem(data) {
    var id = data[1];
    var item = data[2];

    if (this.equip_callback) {
      this.equip_callback({ id, ...item });
    }
  }

  receiveAuras(data) {
    var id = data[1];
    var auras = data[2];

    if (this.auras_callback) {
      this.auras_callback(id, auras);
    }
  }

  receiveSkill(data) {
    var id = data[1];
    var skill = data[2];
    var level = data[3];

    if (this.skill_callback) {
      this.skill_callback({ id, skill, level });
    }
  }

  receiveDrop(data) {
    var mobId = data[1];
    var id = data[2];
    var kind = data[3];

    var item = EntityFactory.createEntity({ kind, id });

    item.wasDropped = true;
    item.playersInvolved = data[4];
    item.partyId = data[5];

    if (this.drop_callback) {
      this.drop_callback(item, mobId);
    }
  }

  receiveTeleport(data) {
    var id = data[1],
      x = data[2],
      y = data[3];

    if (this.teleport_callback) {
      this.teleport_callback(id, x, y);
    }
  }

  receiveDamage(data) {
    var id = data[1];
    var dmg = data[2];
    var hp = parseInt(data[3]);
    var maxHp = parseInt(data[4]);
    var isCritical = data[5];
    var isBlocked = data[6];

    if (this.dmg_callback) {
      this.dmg_callback({ id, dmg, hp, maxHp, isCritical, isBlocked });
    }
  }

  receivePopulation(data) {
    var players = data[1];
    var levelupPlayer = data[2];

    if (this.population_callback) {
      this.population_callback(players, levelupPlayer);
    }
  }

  receiveKill(data) {
    var mobKind = data[1];
    var level = data[2];
    var playerExp = data[3];
    var exp = data[4];

    if (this.kill_callback) {
      this.kill_callback(mobKind, level, playerExp, exp);
    }
  }

  receiveList(data) {
    data.shift();

    if (this.list_callback) {
      this.list_callback(data);
    }
  }

  receiveDestroy(data) {
    var id = data[1];

    if (this.destroy_callback) {
      this.destroy_callback(id);
    }
  }

  receiveStats(data) {
    const stats = data[1];

    if (this.stats_callback) {
      this.stats_callback(stats);
    }
  }

  receiveSettings(data) {
    var playerId = data[1];
    var settings = data[2];

    if (this.settings_callback) {
      this.settings_callback({ playerId, settings });
    }
  }

  receiveSetBonus(data) {
    var bonus = data[1];

    if (this.setbonus_callback) {
      this.setbonus_callback(bonus);
    }
  }

  receiveBlink(data) {
    var id = data[1];

    if (this.blink_callback) {
      this.blink_callback(id);
    }
  }

  receivePVP(data) {
    var pvp = data[1];
    if (this.pvp_callback) {
      this.pvp_callback(pvp);
    }
  }
  receiveParty(data) {
    if (data[1] === Types.Messages.PARTY_ACTIONS.CREATE && this.partycreate_callback) {
      this.partycreate_callback();
    } else if (data[1] === Types.Messages.PARTY_ACTIONS.JOIN && this.partyjoin_callback) {
      this.partyjoin_callback(data[2]);
    } else if (data[1] === Types.Messages.PARTY_ACTIONS.REFUSE && this.partyrefuse_callback) {
      this.partyrefuse_callback(data[2]);
    } else if (data[1] === Types.Messages.PARTY_ACTIONS.INVITE && this.partyinvite_callback) {
      this.partyinvite_callback(data[2]);
    } else if (data[1] === Types.Messages.PARTY_ACTIONS.LEAVE && this.partyleave_callback) {
      this.partyleave_callback(data[2]);
    } else if (data[1] === Types.Messages.PARTY_ACTIONS.DISBAND && this.partydisband_callback) {
      this.partydisband_callback(data[2]);
    } else if (data[1] === Types.Messages.PARTY_ACTIONS.INFO && this.partyinfo_callback) {
      this.partyinfo_callback(data[2]);
    } else if (data[1] === Types.Messages.PARTY_ACTIONS.ERROR && this.partyerror_callback) {
      this.partyerror_callback(data[2]);
    } else if (data[1] === Types.Messages.PARTY_ACTIONS.LOOT && this.partyloot_callback) {
      this.partyloot_callback(data[2]);
    } else if (data[1] === Types.Messages.PARTY_ACTIONS.HEALTH && this.partyhealth_callback) {
      this.partyhealth_callback(data[2]);
    }
  }

  receiveTrade(data) {
    if (data[1] === Types.Messages.TRADE_ACTIONS.REQUEST_SEND && this.traderequestsend_callback) {
      this.traderequestsend_callback(data[2]);
    } else if (data[1] === Types.Messages.TRADE_ACTIONS.REQUEST_RECEIVE && this.traderequestreceive_callback) {
      this.traderequestreceive_callback(data[2]);
    } else if (data[1] === Types.Messages.TRADE_ACTIONS.START && this.tradestart_callback) {
      this.tradestart_callback(data[2]);
    } else if (data[1] === Types.Messages.TRADE_ACTIONS.CLOSE && this.tradeclose_callback) {
      this.tradeclose_callback(data[2]);
    } else if (data[1] === Types.Messages.TRADE_ACTIONS.INFO && this.tradeinfo_callback) {
      this.tradeinfo_callback(data[2]);
    } else if (data[1] === Types.Messages.TRADE_ACTIONS.ERROR && this.tradeerror_callback) {
      this.tradeerror_callback(data[2]);
    } else if (data[1] === Types.Messages.TRADE_ACTIONS.PLAYER1_MOVE_ITEM && this.tradeplayer1moveitem_callback) {
      this.tradeplayer1moveitem_callback(data[2]);
    } else if (data[1] === Types.Messages.TRADE_ACTIONS.PLAYER2_MOVE_ITEM && this.tradeplayer2moveitem_callback) {
      this.tradeplayer2moveitem_callback(data[2]);
    } else if (data[1] === Types.Messages.TRADE_ACTIONS.PLAYER1_STATUS && this.tradeplayer1status_callback) {
      this.tradeplayer1status_callback(data[2]);
    } else if (data[1] === Types.Messages.TRADE_ACTIONS.PLAYER2_STATUS && this.tradeplayer2status_callback) {
      this.tradeplayer2status_callback(data[2]);
    }
  }

  receiveBossCheck(data) {
    if (this.bosscheck_callback) {
      this.bosscheck_callback(data);
    }
  }

  receiveNotification(data) {
    if (this.receivenotification_callback) {
      this.receivenotification_callback(data);
    }
  }

  receiveInventory(data) {
    var inventory = data[1];

    if (this.receiveinventory_callback) {
      this.receiveinventory_callback(inventory);
    }
  }

  receiveStash(data) {
    var stash = data[1];

    if (this.receivestash_callback) {
      this.receivestash_callback(stash);
    }
  }

  receiveUpgrade(data) {
    var upgrade = data[1];
    const { luckySlot, isLucky7, isMagic8, isSuccess } = data[2] || {};

    if (this.receiveupgrade_callback) {
      this.receiveupgrade_callback(upgrade, { luckySlot, isLucky7, isMagic8, isSuccess });
    }
  }

  receiveAnvilUpgrade(data) {
    const { isSuccess, isTransmute, isChestblue } = data[1];

    if (this.receiveanvilupgrade_callback) {
      this.receiveanvilupgrade_callback({ isSuccess, isTransmute, isChestblue });
    }
  }

  receiveAnvilRecipe(data) {
    var recipe = data[1];

    if (this.receiveanvilrecipe_callback) {
      this.receiveanvilrecipe_callback(recipe);
    }
  }

  receiveAnvilOdds(data) {
    const message = data[1];

    if (this.receiveanvilodds_callback) {
      this.receiveanvilodds_callback(message);
    }
  }

  receiveStoreItems(data) {
    const items = data[1];

    if (this.receivestoreitems_callback) {
      this.receivestoreitems_callback(items);
    }
  }

  receivePurchaseCompleted(data) {
    const payment = data[1];

    if (this.receivepurchasecompleted_callback) {
      this.receivepurchasecompleted_callback(payment);
    }
  }

  receivePurchaseError(data) {
    const error = data[1];

    if (this.receivepurchaseerror_callback) {
      this.receivepurchaseerror_callback(error);
    }
  }

  receiveWaypointsUpdate(data) {
    const waypoints = data[1];

    if (this.receivewaypointsupdate_callback) {
      this.receivewaypointsupdate_callback(waypoints);
    }
  }

  receiveCowLevelStart(data) {
    const x = data[1];
    const y = data[2];
    if (this.receivecowlevelstart_callback) {
      this.receivecowlevelstart_callback({ x, y });
    }
  }

  receiveCowLevelInProgress(data) {
    const cowLevelClock = data[1];

    if (this.receivecowlevelinprogress_callback) {
      this.receivecowlevelinprogress_callback(cowLevelClock);
    }
  }

  receiveCowLevelEnd(data) {
    const isCompleted = data[1];

    if (this.receivecowlevelend_callback) {
      this.receivecowlevelend_callback(isCompleted);
    }
  }

  receiveMinotaurLevelStart() {
    if (this.receiveminotaurlevelstart_callback) {
      this.receiveminotaurlevelstart_callback();
    }
  }

  receiveMinotaurLevelInProgress(data) {
    const minotaurLevelClock = data[1];

    if (this.receiveminotaurlevelinprogress_callback) {
      this.receiveminotaurlevelinprogress_callback(minotaurLevelClock);
    }
  }

  receiveMinotaurLevelEnd() {
    if (this.receiveminotaurlevelend_callback) {
      this.receiveminotaurlevelend_callback();
    }
  }

  receiveFrozen(data) {
    const entityId = data[1];
    const itemLevel = data[2];

    if (this.receivefrozen_callback) {
      this.receivefrozen_callback(entityId, itemLevel);
    }
  }

  onDispatched(callback) {
    this.dispatched_callback = callback;
  }

  onConnected(callback) {
    this.connected_callback = callback;
  }

  onDisconnected(callback) {
    this.disconnected_callback = callback;
  }

  onWelcome(callback) {
    this.welcome_callback = callback;
  }

  onSpawnCharacter(callback) {
    this.spawn_character_callback = callback;
  }

  onSpawnItem(callback) {
    this.spawn_item_callback = callback;
  }

  onSpawnChest(callback) {
    this.spawn_chest_callback = callback;
  }

  onDespawnEntity(callback) {
    this.despawn_callback = callback;
  }

  onEntityMove(callback) {
    this.move_callback = callback;
  }

  onEntityAttack(callback) {
    this.attack_callback = callback;
  }

  onEntityRaise(callback) {
    this.raise_callback = callback;
  }

  onPlayerChangeHealth(callback) {
    this.health_callback = callback;
  }

  onPlayerEquipItem(callback) {
    this.equip_callback = callback;
  }

  onPlayerAuras(callback) {
    this.auras_callback = callback;
  }

  onPlayerSkill(callback) {
    this.skill_callback = callback;
  }

  onPlayerMoveToItem(callback) {
    this.lootmove_callback = callback;
  }

  onPlayerTeleport(callback) {
    this.teleport_callback = callback;
  }

  onChatMessage(callback) {
    this.chat_callback = callback;
  }

  onDropItem(callback) {
    this.drop_callback = callback;
  }

  onPlayerDamageMob(callback) {
    this.dmg_callback = callback;
  }

  onPlayerKillMob(callback) {
    this.kill_callback = callback;
  }

  onPopulationChange(callback) {
    this.population_callback = callback;
  }

  onEntityList(callback) {
    this.list_callback = callback;
  }

  onEntityDestroy(callback) {
    this.destroy_callback = callback;
  }

  onPlayerChangeStats(callback) {
    this.stats_callback = callback;
  }

  onPlayerSettings(callback) {
    this.settings_callback = callback;
  }

  onSetBonus(callback) {
    this.setbonus_callback = callback;
  }

  onItemBlink(callback) {
    this.blink_callback = callback;
  }

  onPVPChange(callback) {
    this.pvp_callback = callback;
  }

  onPartyCreate(callback) {
    this.partycreate_callback = callback;
  }

  onPartyJoin(callback) {
    this.partyjoin_callback = callback;
  }

  onPartyRefuse(callback) {
    this.partyrefuse_callback = callback;
  }

  onPartyInvite(callback) {
    this.partyinvite_callback = callback;
  }

  onPartyLeave(callback) {
    this.partyleave_callback = callback;
  }

  onPartyDisband(callback) {
    this.partydisband_callback = callback;
  }

  onPartyInfo(callback) {
    this.partyinfo_callback = callback;
  }

  onPartyError(callback) {
    this.partyerror_callback = callback;
  }

  onPartyLoot(callback) {
    this.partyloot_callback = callback;
  }

  onPartyHealth(callback) {
    this.partyhealth_callback = callback;
  }

  onTradeRequestSend(callback) {
    this.traderequestsend_callback = callback;
  }

  onTradeRequestReceive(callback) {
    this.traderequestreceive_callback = callback;
  }

  onTradeStart(callback) {
    this.tradestart_callback = callback;
  }

  onTradeClose(callback) {
    this.tradeclose_callback = callback;
  }

  onTradeInfo(callback) {
    this.tradeinfo_callback = callback;
  }

  onTradeError(callback) {
    this.tradeerror_callback = callback;
  }

  onPlayer1MoveItem(callback) {
    this.tradeplayer1moveitem_callback = callback;
  }

  onPlayer2MoveItem(callback) {
    this.tradeplayer2moveitem_callback = callback;
  }

  onPlayer1Status(callback) {
    this.tradeplayer1status_callback = callback;
  }

  onPlayer2Status(callback) {
    this.tradeplayer2status_callback = callback;
  }

  onBossCheck(callback) {
    this.bosscheck_callback = callback;
  }

  onReceiveNotification(callback) {
    this.receivenotification_callback = callback;
  }

  onReceiveInventory(callback) {
    this.receiveinventory_callback = callback;
  }

  onReceiveStash(callback) {
    this.receivestash_callback = callback;
  }

  onReceiveUpgrade(callback) {
    this.receiveupgrade_callback = callback;
  }

  onReceiveAnvilUpgrade(callback) {
    this.receiveanvilupgrade_callback = callback;
  }

  onReceiveAnvilRecipe(callback) {
    this.receiveanvilrecipe_callback = callback;
  }

  onReceiveAnvilOdds(callback) {
    this.receiveanvilodds_callback = callback;
  }

  onReceiveStoreItems(callback) {
    this.receivestoreitems_callback = callback;
  }

  onReceivePurchaseCompleted(callback) {
    this.receivepurchasecompleted_callback = callback;
  }

  onReceivePurchaseError(callback) {
    this.receivepurchaseerror_callback = callback;
  }

  onReceiveWaypointsUpdate(callback) {
    this.receivewaypointsupdate_callback = callback;
  }

  onReceiveCowLevelStart(callback) {
    this.receivecowlevelstart_callback = callback;
  }

  onReceiveCowLevelInProgress(callback) {
    this.receivecowlevelinprogress_callback = callback;
  }

  onReceiveCowLevelEnd(callback) {
    this.receivecowlevelend_callback = callback;
  }

  onReceiveMinotaurLevelStart(callback) {
    this.receiveminotaurlevelstart_callback = callback;
  }

  onReceiveMinotaurLevelInProgress(callback) {
    this.receiveminotaurlevelinprogress_callback = callback;
  }

  onReceiveMinotaurLevelEnd(callback) {
    this.receiveminotaurlevelend_callback = callback;
  }

  onFrozen(callback) {
    this.receivefrozen_callback = callback;
  }

  sendCreate({ name, account }) {
    this.sendMessage([Types.Messages.CREATE, name, account]);
  }

  sendLogin({ name, account, password = "" }) {
    this.sendMessage([Types.Messages.LOGIN, name, account, password]);
  }

  sendMove(x, y) {
    this.sendMessage([Types.Messages.MOVE, x, y]);
  }

  sendLootMove(item, x, y) {
    this.sendMessage([Types.Messages.LOOTMOVE, x, y, item.id]);
  }

  sendAggro(mob) {
    this.sendMessage([Types.Messages.AGGRO, mob.id]);
  }

  sendAttack(mob) {
    this.sendMessage([Types.Messages.ATTACK, mob.id]);
  }

  sendHit(mob) {
    this.sendMessage([Types.Messages.HIT, mob.id]);
  }

  sendHurt(mob) {
    this.sendMessage([Types.Messages.HURT, mob.id]);
  }

  sendChat(text) {
    this.sendMessage([Types.Messages.CHAT, text]);
  }

  sendLoot(item) {
    this.sendMessage([Types.Messages.LOOT, item.id]);
  }

  sendTeleport(x, y) {
    this.sendMessage([Types.Messages.TELEPORT, x, y]);
  }

  sendZone() {
    this.sendMessage([Types.Messages.ZONE]);
  }

  sendOpen(chest) {
    this.sendMessage([Types.Messages.OPEN, chest.id]);
  }

  sendCheck(id) {
    this.sendMessage([Types.Messages.CHECK, id]);
  }

  sendCheckStorage() {
    this.sendMessage([Types.Messages.CHECK_STORAGE]);
  }

  sendWho(ids) {
    ids.unshift(Types.Messages.WHO);
    this.sendMessage(ids);
  }

  sendAchievement(id) {
    this.sendMessage([Types.Messages.ACHIEVEMENT, id, "found"]);
  }

  sendWaypoint(id) {
    this.sendMessage([Types.Messages.WAYPOINT, id, "found"]);
  }

  sendBossCheck(again) {
    this.sendMessage([Types.Messages.BOSS_CHECK, again]);
  }

  sendPartyCreate() {
    this.sendMessage([Types.Messages.PARTY, Types.Messages.PARTY_ACTIONS.CREATE]);
  }

  sendPartyJoin(partyId) {
    this.sendMessage([Types.Messages.PARTY, Types.Messages.PARTY_ACTIONS.JOIN, partyId]);
  }

  sendPartyRefuse(partyId) {
    this.sendMessage([Types.Messages.PARTY, Types.Messages.PARTY_ACTIONS.REFUSE, partyId]);
  }

  sendPartyInvite(playerName) {
    this.sendMessage([Types.Messages.PARTY, Types.Messages.PARTY_ACTIONS.INVITE, playerName]);
  }

  sendPartyLeave() {
    this.sendMessage([Types.Messages.PARTY, Types.Messages.PARTY_ACTIONS.LEAVE]);
  }

  sendPartyRemove(playerName) {
    this.sendMessage([Types.Messages.PARTY, Types.Messages.PARTY_ACTIONS.REMOVE, playerName]);
  }

  sendPartyDisband() {
    this.sendMessage([Types.Messages.PARTY, Types.Messages.PARTY_ACTIONS.DISBAND]);
  }

  sendTradeRequest(playerName) {
    this.sendMessage([Types.Messages.TRADE, Types.Messages.TRADE_ACTIONS.REQUEST_SEND, playerName]);
  }

  sendTradeRequestAccept(playerName) {
    this.sendMessage([Types.Messages.TRADE, Types.Messages.TRADE_ACTIONS.REQUEST_ACCEPT, playerName]);
  }

  sendTradeRequestRefuse(playerName) {
    this.sendMessage([Types.Messages.TRADE, Types.Messages.TRADE_ACTIONS.REQUEST_REFUSE, playerName]);
  }

  sendTradeClose() {
    this.sendMessage([Types.Messages.TRADE, Types.Messages.TRADE_ACTIONS.CLOSE]);
  }

  sendTradePlayer1Status(isAccepted) {
    this.sendMessage([Types.Messages.TRADE, Types.Messages.TRADE_ACTIONS.PLAYER1_STATUS, isAccepted]);
  }

  sendBanPlayer(message) {
    this.sendMessage([Types.Messages.BAN_PLAYER, message]);
  }

  sendRequestPayout(kind) {
    this.sendMessage([Types.Messages.REQUEST_PAYOUT, kind]);
  }

  sendMoveItem(fromSlot, toSlot, quantity) {
    this.sendMessage([Types.Messages.MOVE_ITEM, fromSlot, toSlot, quantity]);
  }

  sendMoveItemsToInventory(panel) {
    this.sendMessage([Types.Messages.MOVE_ITEMS_TO_INVENTORY, panel]);
  }

  sendUpgradeItem() {
    this.sendMessage([Types.Messages.UPGRADE_ITEM]);
  }

  sendStoreItems() {
    this.sendMessage([Types.Messages.STORE_ITEMS]);
  }

  sendPurchaseCreate(id, account) {
    this.sendMessage([Types.Messages.PURCHASE_CREATE, id, account]);
  }

  sendPurchaseCancel(account) {
    this.sendMessage([Types.Messages.PURCHASE_CANCEL, account]);
  }

  sendSettings(settings) {
    this.sendMessage([Types.Messages.SETTINGS, settings]);
  }

  sendSkill(skill) {
    this.sendMessage([Types.Messages.SKILL, skill]);
  }
}

export default GameClient;
