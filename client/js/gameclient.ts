import * as _ from "lodash";
import { io } from "socket.io-client";

import { Types } from "../../shared/js/gametypes";

import EntityFactory from "./entityfactory";
import BISON from "./lib/bison";
import Player from "./player";

class GameClient {
  connection: any;
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
  useBison: boolean;
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
  drop_callback: any;
  teleport_callback: any;
  dmg_callback: any;
  population_callback: any;
  kill_callback: any;
  list_callback: any;
  destroy_callback: any;
  stats_callback: any;
  blink_callback: any;
  pvp_callback: any;
  guilderror_callback: any;
  guildmemberconnect_callback: any;
  guildmemberdisconnect_callback: any;
  guildonlinemembers_callback: any;
  guildcreate_callback: any;
  guildinvite_callback: any;
  guildpopulation_callback: any;
  guildjoin_callback: any;
  guildleave_callback: any;
  guildtalk_callback: any;
  bosscheck_callback: any;
  receivenotification_callback: any;
  receiveinventory_callback: any;
  receivestash_callback: any;
  receiveupgrade_callback: any;
  receiveanvilupgrade_callback: any;
  receiveanvilrecipe_callback: any;
  receivestoreitems_callback: any;
  receivepurchasecompleted_callback: any;
  receivepurchaseerror_callback: any;
  receivewaypointsupdate_callback: any;
  receivecowlevelstart_callback: any;
  receivecowlevelinprogress_callback: any;
  receivecowlevelend_callback: any;

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
    this.handlers[Types.Messages.DROP] = this.receiveDrop;
    this.handlers[Types.Messages.TELEPORT] = this.receiveTeleport;
    this.handlers[Types.Messages.DAMAGE] = this.receiveDamage;
    this.handlers[Types.Messages.POPULATION] = this.receivePopulation;
    this.handlers[Types.Messages.LIST] = this.receiveList;
    this.handlers[Types.Messages.DESTROY] = this.receiveDestroy;
    this.handlers[Types.Messages.KILL] = this.receiveKill;
    this.handlers[Types.Messages.STATS] = this.receiveStats;
    this.handlers[Types.Messages.BLINK] = this.receiveBlink;
    this.handlers[Types.Messages.GUILDERROR] = this.receiveGuildError;
    this.handlers[Types.Messages.GUILD] = this.receiveGuild;
    this.handlers[Types.Messages.PVP] = this.receivePVP;
    this.handlers[Types.Messages.BOSS_CHECK] = this.receiveBossCheck;
    this.handlers[Types.Messages.NOTIFICATION] = this.receiveNotification;
    this.handlers[Types.Messages.INVENTORY] = this.receiveInventory;
    this.handlers[Types.Messages.STASH] = this.receiveStash;
    this.handlers[Types.Messages.UPGRADE] = this.receiveUpgrade;
    this.handlers[Types.Messages.ANVIL_UPGRADE] = this.receiveAnvilUpgrade;
    this.handlers[Types.Messages.ANVIL_RECIPE] = this.receiveAnvilRecipe;
    this.handlers[Types.Messages.STORE_ITEMS] = this.receiveStoreItems;
    this.handlers[Types.Messages.PURCHASE_COMPLETED] = this.receivePurchaseCompleted;
    this.handlers[Types.Messages.PURCHASE_ERROR] = this.receivePurchaseError;
    this.handlers[Types.Messages.WAYPOINTS_UPDATE] = this.receiveWaypointsUpdate;
    this.handlers[Types.Messages.COWLEVEL_START] = this.receiveCowLevelStart;
    this.handlers[Types.Messages.COWLEVEL_INPROGRESS] = this.receiveCowLevelInProgress;
    this.handlers[Types.Messages.COWLEVEL_END] = this.receiveCowLevelEnd;
    this.useBison = false;
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
    var self = this;

    console.info("Trying to connect to server : " + url);

    this.connection = io(url, { forceNew: true, reconnection: false }); // This sets the connection as a socket.io Socket.

    if (dispatcherMode) {
      this.connection.on("message", function (e) {
        var reply = JSON.parse(e.data);

        if (reply.status === "OK") {
          self.dispatched_callback(reply.host, reply.port);
        } else if (reply.status === "FULL") {
          alert("BrowserQuest is currently at maximum player population. Please retry later.");
        } else {
          alert("Unknown error while connecting to Nano BrowserQuest.");
        }
      });
    } else {
      this.connection.on("connection", function () {
        console.info("Connected to server " + self.host + ":" + self.port);
      });

      this.connection.on("message", function (e) {
        if (e === "go") {
          if (self.connected_callback) {
            self.connected_callback();
          }
          return;
        }
        if (e === "timeout") {
          self.isTimeout = true;
          return;
        }
        if (
          e === "invalidlogin" ||
          e === "userexists" ||
          e === "loggedin" ||
          e === "invalidusername" ||
          e === "banned-1" ||
          e === "banned-365" ||
          e === "invalidconnection"
        ) {
          if (self.fail_callback) {
            self.fail_callback(e);
          }
          return;
        }

        if (e === "messagetoplayer") {
          // self.disconnected_callback(
          //   "The connection to Nano BrowserQuest has been lost"
          // );
        }

        self.receiveMessage(e);
      });

      this.connection.on("error", function (e) {
        console.error(e, true);
      });

      this.connection.on("disconnect", function () {
        console.debug("Connection closed");
        $("#container").addClass("error");

        if (self.disconnected_callback) {
          if (self.isTimeout) {
            self.disconnected_callback("You have been disconnected for being inactive for too long");
          } else {
            self.disconnected_callback("The connection to Nano BrowserQuest has been lost");
          }
        }
      });
    }
  }

  sendMessage(json) {
    var data;
    if (this.connection.connected === true) {
      if (this.useBison) {
        data = BISON.encode(json);
      } else {
        data = JSON.stringify(json);
      }
      this.connection.send(data);
    }
  }

  receiveMessage(message) {
    var data;

    if (this.isListening) {
      if (this.useBison) {
        data = BISON.decode(message);
      } else {
        data = JSON.parse(message);
      }
      // console.debug("data: " + message);

      if (data instanceof Array) {
        if (data[0] instanceof Array) {
          // Multiple actions received
          this.receiveActionBatch(data);
        } else {
          // Only one action received
          this.receiveAction(data);
        }
      } else if (data && data.type) {
        this.receiveAction(data);
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
    var ring1 = data[9];
    var ring2 = data[10];
    var amulet = data[11];
    var experience = data[12];
    var achievement = data[13];
    var inventory = data[14];
    var stash = data[15];
    var hash = data[16];
    var hash1 = data[17];
    var nanoPotions = data[18];
    var gems = data[19];
    var artifact = data[20];
    var expansion1 = data[21];
    var waypoints = data[22];
    var depositAccount = data[23];
    var auras = data[24];
    var cowLevelPortalCoords = data[25];

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
        ring1,
        ring2,
        amulet,
        experience,
        achievement,
        inventory,
        stash,
        hash,
        hash1,
        nanoPotions,
        gems,
        artifact,
        expansion1,
        waypoints,
        depositAccount,
        auras,
        cowLevelPortalCoords,
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
    var id = data[1],
      kind = data[2],
      x = data[3],
      y = data[4];

    if (Types.isItem(kind)) {
      var item = EntityFactory.createEntity(kind, id);

      if (this.spawn_item_callback) {
        this.spawn_item_callback(item, x, y);
      }
    } else if (Types.isChest(kind)) {
      var item = EntityFactory.createEntity(kind, id);

      if (this.spawn_chest_callback) {
        this.spawn_chest_callback(item, x, y);
      }
    } else {
      var name, orientation, target, weapon, weaponLevel, weaponBonus, armor, armorLevel, armorBonus, auras;

      orientation = data[5];
      target = data[6];

      if (Types.isPlayer(kind)) {
        name = data[7];
        [armor, armorLevel, armorBonus] = data[8].split(":");
        [weapon, weaponLevel, weaponBonus] = data[9].split(":");
        // level = data[10];
        auras = data[11];
      }

      var character = EntityFactory.createEntity(kind, id, name);

      if (character instanceof Player) {
        character.setWeaponName(weapon);
        character.setWeaponLevel(weaponLevel);
        character.setWeaponBonus(weaponBonus);
        character.spriteName = armor;
        character.setArmorName(armor);
        character.setArmorLevel(armorLevel);
        character.setArmorBonus(armorBonus);
        character.setAuras(auras);
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
    var id = data[1];
    var name = data[2];
    var text = data[3];

    if (this.chat_callback) {
      this.chat_callback(id, name, text);
    }
  }

  receiveEquipItem(data) {
    var id = data[1];
    var itemKind = data[2];
    var itemLevel = data[3];
    var itemBonus = data[4];

    if (this.equip_callback) {
      this.equip_callback(id, itemKind, itemLevel, itemBonus);
    }
  }

  receiveAuras(data) {
    var id = data[1];
    var auras = data[2];

    if (this.auras_callback) {
      this.auras_callback(id, auras);
    }
  }

  receiveDrop(data) {
    var mobId = data[1],
      id = data[2],
      kind = data[3],
      item = EntityFactory.createEntity(kind, id);

    item.wasDropped = true;
    item.playersInvolved = data[4];

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
    var worldPlayers = data[1];
    var totalPlayers = data[2];
    var players = data[3];
    var levelupPlayer = data[4];

    if (this.population_callback) {
      this.population_callback(worldPlayers, totalPlayers, players, levelupPlayer);
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
    var maxHitPoints = data[1];
    var damage = data[2];
    var defense = data[3];
    var absorb = data[4];

    if (this.stats_callback) {
      this.stats_callback({ maxHitPoints, damage, defense, absorb });
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

  receiveGuildError(data) {
    var errorType = data[1];
    var guildName = data[2];
    if (this.guilderror_callback) {
      this.guilderror_callback(errorType, guildName);
    }
  }

  receiveGuild(data) {
    if (data[1] === Types.Messages.GUILDACTION.CONNECT && this.guildmemberconnect_callback) {
      this.guildmemberconnect_callback(data[2]); //member name
    } else if (data[1] === Types.Messages.GUILDACTION.DISCONNECT && this.guildmemberdisconnect_callback) {
      this.guildmemberdisconnect_callback(data[2]); //member name
    } else if (data[1] === Types.Messages.GUILDACTION.ONLINE && this.guildonlinemembers_callback) {
      data.splice(0, 2);
      this.guildonlinemembers_callback(data); //member names
    } else if (data[1] === Types.Messages.GUILDACTION.CREATE && this.guildcreate_callback) {
      this.guildcreate_callback(data[2], data[3]); //id, name
    } else if (data[1] === Types.Messages.GUILDACTION.INVITE && this.guildinvite_callback) {
      this.guildinvite_callback(data[2], data[3], data[4]); //id, name, invitor name
    } else if (data[1] === Types.Messages.GUILDACTION.POPULATION && this.guildpopulation_callback) {
      this.guildpopulation_callback(data[2], data[3]); //name, count
    } else if (data[1] === Types.Messages.GUILDACTION.JOIN && this.guildjoin_callback) {
      this.guildjoin_callback(data[2], data[3], data[4], data[5]); //name, (id, (guildId, guildName))
    } else if (data[1] === Types.Messages.GUILDACTION.LEAVE && this.guildleave_callback) {
      this.guildleave_callback(data[2], data[3], data[4]); //name, id, guildname
    } else if (data[1] === Types.Messages.GUILDACTION.TALK && this.guildtalk_callback) {
      this.guildtalk_callback(data[2], data[3], data[4]); //name, id, message
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
    var isSuccess = data[1];

    if (this.receiveanvilupgrade_callback) {
      this.receiveanvilupgrade_callback(isSuccess);
    }
  }

  receiveAnvilRecipe(data) {
    var recipe = data[1];

    if (this.receiveanvilrecipe_callback) {
      this.receiveanvilrecipe_callback(recipe);
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

  onItemBlink(callback) {
    this.blink_callback = callback;
  }

  onPVPChange(callback) {
    this.pvp_callback = callback;
  }

  onGuildError(callback) {
    this.guilderror_callback = callback;
  }

  onGuildCreate(callback) {
    this.guildcreate_callback = callback;
  }

  onGuildInvite(callback) {
    this.guildinvite_callback = callback;
  }

  onGuildJoin(callback) {
    this.guildjoin_callback = callback;
  }

  onGuildLeave(callback) {
    this.guildleave_callback = callback;
  }

  onGuildTalk(callback) {
    this.guildtalk_callback = callback;
  }

  onMemberConnect(callback) {
    this.guildmemberconnect_callback = callback;
  }

  onMemberDisconnect(callback) {
    this.guildmemberdisconnect_callback = callback;
  }

  onReceiveGuildMembers(callback) {
    this.guildonlinemembers_callback = callback;
  }

  onGuildPopulation(callback) {
    this.guildpopulation_callback = callback;
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

  sendCreate(player) {
    this.sendMessage([Types.Messages.CREATE, player.name, player.account]);
  }

  sendLogin(player) {
    this.sendMessage([Types.Messages.LOGIN, player.name, player.account]);
  }

  //  sendHello(player) {
  //if(player.hasGuild()){
  //	this.sendMessage([Types.Messages.HELLO,
  //					  player.name,
  //            player.pw,
  //           player.email,
  //					  Types.getKindFromString(player.getSpriteName()),
  //					  Types.getKindFromString(player.getWeaponName()),
  //					  player.guild.id, player.guild.name]);
  //}
  //else{
  //this.sendMessage([Types.Messages.HELLO,
  //player.name,
  //player.pw,
  //player.email,
  //Types.getKindFromString(player.getSpriteName()),
  //Types.getKindFromString(player.getWeaponName())]);
  //}
  // },

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

  sendNewGuild(name) {
    this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.CREATE, name]);
  }

  sendGuildInvite(invitee) {
    this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.INVITE, invitee]);
  }

  sendGuildInviteReply(guild, answer) {
    this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.JOIN, guild, answer]);
  }

  talkToGuild(message) {
    this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.TALK, message]);
  }

  sendLeaveGuild() {
    this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.LEAVE]);
  }

  sendBanPlayer(message) {
    this.sendMessage([Types.Messages.BAN_PLAYER, message]);
  }

  sendRequestPayout(kind) {
    this.sendMessage([Types.Messages.REQUEST_PAYOUT, kind]);
  }

  sendMoveItem(fromSlot, toSlot) {
    this.sendMessage([Types.Messages.MOVE_ITEM, fromSlot, toSlot]);
  }

  sendMoveUpgradeItemsToInventory() {
    this.sendMessage([Types.Messages.MOVE_UPGRADE_ITEMS_TO_INVENTORY]);
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
}

export default GameClient;
