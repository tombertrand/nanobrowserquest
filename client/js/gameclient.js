define(["player", "entityfactory", "lib/bison"], function (Player, EntityFactory, BISON) {
  var GameClient = Class.extend({
    init: function (host, port) {
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
      this.handlers[Types.Messages.SPAWN] = this.receiveSpawn;
      this.handlers[Types.Messages.DESPAWN] = this.receiveDespawn;
      this.handlers[Types.Messages.SPAWN_BATCH] = this.receiveSpawnBatch;
      this.handlers[Types.Messages.HEALTH] = this.receiveHealth;
      this.handlers[Types.Messages.CHAT] = this.receiveChat;
      this.handlers[Types.Messages.EQUIP] = this.receiveEquipItem;
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
      this.handlers[Types.Messages.UPGRADE] = this.receiveUpgrade;
      this.handlers[Types.Messages.ANVIL_UPGRADE] = this.receiveAnvilUpgrade;
      this.useBison = false;
      this.enable();
    },

    enable: function () {
      this.isListening = true;
    },

    disable: function () {
      this.isListening = false;
    },

    connect: function (dispatcherMode) {
      var protocol = window.location.hostname === "localhost" ? "ws" : "wss";
      var port = window.location.hostname === "localhost" ? ":8000" : "";
      var url = protocol + "://" + this.host + port + "/";
      var self = this;

      log.info("Trying to connect to server : " + url);

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
          log.info("Connected to server " + self.host + ":" + self.port);
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
          log.error(e, true);
        });

        this.connection.on("disconnect", function () {
          log.debug("Connection closed");
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
    },

    sendMessage: function (json) {
      var data;
      if (this.connection.connected === true) {
        if (this.useBison) {
          data = BISON.encode(json);
        } else {
          data = JSON.stringify(json);
        }
        this.connection.send(data);
      }
    },

    receiveMessage: function (message) {
      var data, action;

      if (this.isListening) {
        if (this.useBison) {
          data = BISON.decode(message);
        } else {
          data = JSON.parse(message);
        }
        // log.debug("data: " + message);

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
    },

    receiveAction: function (data) {
      var action = data instanceof Array ? data[0] : data.type;
      if (this.handlers[action] && _.isFunction(this.handlers[action])) {
        this.handlers[action].call(this, data);
      } else {
        log.error("Unknown action : " + action);
      }
    },

    receiveActionBatch: function (actions) {
      var self = this;

      _.each(actions, function (action) {
        self.receiveAction(action);
      });
    },

    receiveWelcome: function (data) {
      var id = data[1],
        name = data[2],
        x = data[3],
        y = data[4],
        hp = data[5],
        armor = data[6],
        weapon = data[7],
        belt = data[8],
        ring1 = data[9],
        ring2 = data[10],
        experience = data[11],
        achievement = data[12],
        inventory = data[13],
        hash = data[14],
        nanoPotions = data[15],
        gems = data[16],
        artifact = data[17],
        expansion1 = data[18],
        waypoints = data[19];

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
          experience,
          achievement,
          inventory,
          hash,
          nanoPotions,
          gems,
          artifact,
          expansion1,
          waypoints,
        });
      }
    },

    receiveMove: function (data) {
      var id = data[1],
        x = data[2],
        y = data[3];

      if (this.move_callback) {
        this.move_callback(id, x, y);
      }
    },

    receiveLootMove: function (data) {
      var id = data[1],
        item = data[2];

      if (this.lootmove_callback) {
        this.lootmove_callback(id, item);
      }
    },

    receiveAttack: function (data) {
      var attacker = data[1];
      var target = data[2];

      if (this.attack_callback) {
        this.attack_callback(attacker, target);
      }
    },

    receiveSpawn: function (data) {
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
        var name, orientation, target, weapon, weaponLevel, armor, armorLevel, level;

        if (Types.isPlayer(kind)) {
          name = data[5];
          orientation = data[6];
          [armor, armorLevel] = data[7].split(":");
          [weapon, weaponLevel] = data[8].split(":");
          if (data.length > 9) {
            target = data[9];
          }
        } else if (Types.isMob(kind)) {
          orientation = data[5];
          if (data.length > 6) {
            target = data[6];
          }
        }

        var character = EntityFactory.createEntity(kind, id, name);

        if (character instanceof Player) {
          // @TODO load badass level8+ armor and weapon effects
          character.weaponName = weapon; //Types.getKindAsString(weapon);
          character.spriteName = armor; //Types.getKindAsString(armor);
        }

        if (this.spawn_character_callback) {
          this.spawn_character_callback(character, x, y, orientation, target);
        }
      }
    },

    receiveDespawn: function (data) {
      var id = data[1];

      if (this.despawn_callback) {
        this.despawn_callback(id);
      }
    },

    receiveHealth: function (data) {
      var points = data[1];
      var isRegen = false;

      if (data[2]) {
        isRegen = true;
      }

      if (this.health_callback) {
        this.health_callback(points, isRegen);
      }
    },

    receiveChat: function (data) {
      var id = data[1];
      var name = data[2];
      var text = data[3];

      if (this.chat_callback) {
        this.chat_callback(id, name, text);
      }
    },

    receiveEquipItem: function (data) {
      var id = data[1];
      var itemKind = data[2];

      if (this.equip_callback) {
        this.equip_callback(id, itemKind);
      }
    },

    receiveDrop: function (data) {
      var mobId = data[1],
        id = data[2],
        kind = data[3],
        item = EntityFactory.createEntity(kind, id);

      item.wasDropped = true;
      item.playersInvolved = data[4];

      if (this.drop_callback) {
        this.drop_callback(item, mobId);
      }
    },

    receiveTeleport: function (data) {
      var id = data[1],
        x = data[2],
        y = data[3];

      if (this.teleport_callback) {
        this.teleport_callback(id, x, y);
      }
    },

    receiveDamage: function (data) {
      var id = data[1],
        dmg = data[2];
      (hp = parseInt(data[3])), (maxHp = parseInt(data[4]));

      if (this.dmg_callback) {
        this.dmg_callback(id, dmg, hp, maxHp);
      }
    },

    receivePopulation: function (data) {
      var worldPlayers = data[1];
      var totalPlayers = data[2];
      var players = data[3];
      var levelupPlayer = data[4];

      if (this.population_callback) {
        this.population_callback(worldPlayers, totalPlayers, players, levelupPlayer);
      }
    },

    receiveKill: function (data) {
      var mobKind = data[1];
      var level = data[2];
      var playerExp = data[3];
      var exp = data[4];

      if (this.kill_callback) {
        this.kill_callback(mobKind, level, playerExp, exp);
      }
    },

    receiveList: function (data) {
      data.shift();

      if (this.list_callback) {
        this.list_callback(data);
      }
    },

    receiveDestroy: function (data) {
      var id = data[1];

      if (this.destroy_callback) {
        this.destroy_callback(id);
      }
    },

    receiveStats: function (data) {
      var maxHitPoints = data[1];
      var damage = data[2];
      var absorb = data[3];

      if (this.stats_callback) {
        this.stats_callback({ maxHitPoints, damage, absorb });
      }
    },

    receiveBlink: function (data) {
      var id = data[1];

      if (this.blink_callback) {
        this.blink_callback(id);
      }
    },
    receivePVP: function (data) {
      var pvp = data[1];
      if (this.pvp_callback) {
        this.pvp_callback(pvp);
      }
    },

    receiveGuildError: function (data) {
      var errorType = data[1];
      var guildName = data[2];
      if (this.guilderror_callback) {
        this.guilderror_callback(errorType, guildName);
      }
    },

    receiveGuild: function (data) {
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
    },

    receiveBossCheck: function (data) {
      if (this.bosscheck_callback) {
        this.bosscheck_callback(data);
      }
    },

    receiveNotification: function (data) {
      if (this.receivenotification_callback) {
        this.receivenotification_callback(data);
      }
    },

    receiveInventory: function (data) {
      var inventory = data[1];

      if (this.receiveinventory_callback) {
        this.receiveinventory_callback(inventory);
      }
    },

    receiveUpgrade: function (data) {
      var upgrade = data[1];
      var isLucky7 = data[2];

      if (this.receiveupgrade_callback) {
        this.receiveupgrade_callback(upgrade, isLucky7);
      }
    },

    receiveAnvilUpgrade: function (data) {
      var isSuccess = data[1];

      if (this.receiveanvilupgrade_callback) {
        this.receiveanvilupgrade_callback(isSuccess);
      }
    },

    onDispatched: function (callback) {
      this.dispatched_callback = callback;
    },

    onConnected: function (callback) {
      this.connected_callback = callback;
    },

    onDisconnected: function (callback) {
      this.disconnected_callback = callback;
    },

    onWelcome: function (callback) {
      this.welcome_callback = callback;
    },

    onSpawnCharacter: function (callback) {
      this.spawn_character_callback = callback;
    },

    onSpawnItem: function (callback) {
      this.spawn_item_callback = callback;
    },

    onSpawnChest: function (callback) {
      this.spawn_chest_callback = callback;
    },

    onDespawnEntity: function (callback) {
      this.despawn_callback = callback;
    },

    onEntityMove: function (callback) {
      this.move_callback = callback;
    },

    onEntityAttack: function (callback) {
      this.attack_callback = callback;
    },

    onPlayerChangeHealth: function (callback) {
      this.health_callback = callback;
    },

    onPlayerEquipItem: function (callback) {
      this.equip_callback = callback;
    },

    onPlayerMoveToItem: function (callback) {
      this.lootmove_callback = callback;
    },

    onPlayerTeleport: function (callback) {
      this.teleport_callback = callback;
    },

    onChatMessage: function (callback) {
      this.chat_callback = callback;
    },

    onDropItem: function (callback) {
      this.drop_callback = callback;
    },

    onPlayerDamageMob: function (callback) {
      this.dmg_callback = callback;
    },

    onPlayerKillMob: function (callback) {
      this.kill_callback = callback;
    },

    onPopulationChange: function (callback) {
      this.population_callback = callback;
    },

    onEntityList: function (callback) {
      this.list_callback = callback;
    },

    onEntityDestroy: function (callback) {
      this.destroy_callback = callback;
    },

    onPlayerChangeStats: function (callback) {
      this.stats_callback = callback;
    },

    onItemBlink: function (callback) {
      this.blink_callback = callback;
    },
    onPVPChange: function (callback) {
      this.pvp_callback = callback;
    },
    onGuildError: function (callback) {
      this.guilderror_callback = callback;
    },

    onGuildCreate: function (callback) {
      this.guildcreate_callback = callback;
    },

    onGuildInvite: function (callback) {
      this.guildinvite_callback = callback;
    },

    onGuildJoin: function (callback) {
      this.guildjoin_callback = callback;
    },

    onGuildLeave: function (callback) {
      this.guildleave_callback = callback;
    },

    onGuildTalk: function (callback) {
      this.guildtalk_callback = callback;
    },

    onMemberConnect: function (callback) {
      this.guildmemberconnect_callback = callback;
    },

    onMemberDisconnect: function (callback) {
      this.guildmemberdisconnect_callback = callback;
    },

    onReceiveGuildMembers: function (callback) {
      this.guildonlinemembers_callback = callback;
    },

    onGuildPopulation: function (callback) {
      this.guildpopulation_callback = callback;
    },

    onBossCheck: function (callback) {
      this.bosscheck_callback = callback;
    },

    onReceiveNotification: function (callback) {
      this.receivenotification_callback = callback;
    },

    onReceiveInventory: function (callback) {
      this.receiveinventory_callback = callback;
    },

    onReceiveUpgrade: function (callback) {
      this.receiveupgrade_callback = callback;
    },

    onReceiveAnvilUpgrade: function (callback) {
      this.receiveanvilupgrade_callback = callback;
    },

    sendCreate: function (player) {
      this.sendMessage([Types.Messages.CREATE, player.name, player.account]);
    },

    sendLogin: function (player) {
      this.sendMessage([Types.Messages.LOGIN, player.name, player.account]);
    },

    //  sendHello: function(player) {
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

    sendMove: function (x, y) {
      this.sendMessage([Types.Messages.MOVE, x, y]);
    },

    sendLootMove: function (item, x, y) {
      this.sendMessage([Types.Messages.LOOTMOVE, x, y, item.id]);
    },

    sendAggro: function (mob) {
      this.sendMessage([Types.Messages.AGGRO, mob.id]);
    },

    sendAttack: function (mob) {
      this.sendMessage([Types.Messages.ATTACK, mob.id]);
    },

    sendHit: function (mob) {
      this.sendMessage([Types.Messages.HIT, mob.id]);
    },

    sendHurt: function (mob) {
      this.sendMessage([Types.Messages.HURT, mob.id]);
    },

    sendChat: function (text) {
      this.sendMessage([Types.Messages.CHAT, text]);
    },

    sendLoot: function (item) {
      this.sendMessage([Types.Messages.LOOT, item.id]);
    },

    sendTeleport: function (x, y) {
      this.sendMessage([Types.Messages.TELEPORT, x, y]);
    },

    sendZone: function () {
      this.sendMessage([Types.Messages.ZONE]);
    },

    sendOpen: function (chest) {
      this.sendMessage([Types.Messages.OPEN, chest.id]);
    },

    sendCheck: function (id) {
      this.sendMessage([Types.Messages.CHECK, id]);
    },

    sendCheck: function (id) {
      this.sendMessage([Types.Messages.CHECK, id]);
    },

    sendCheckStorage: function (id) {
      this.sendMessage([Types.Messages.CHECK_STORAGE]);
    },

    sendWho: function (ids) {
      ids.unshift(Types.Messages.WHO);
      this.sendMessage(ids);
    },

    sendAchievement: function (id) {
      this.sendMessage([Types.Messages.ACHIEVEMENT, id, "found"]);
    },

    sendWaypoint: function (id) {
      this.sendMessage([Types.Messages.WAYPOINT, id, "found"]);
    },

    sendBossCheck: function (again) {
      this.sendMessage([Types.Messages.BOSS_CHECK, again]);
    },

    sendNewGuild: function (name) {
      this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.CREATE, name]);
    },

    sendGuildInvite: function (invitee) {
      this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.INVITE, invitee]);
    },

    sendGuildInviteReply: function (guild, answer) {
      this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.JOIN, guild, answer]);
    },

    talkToGuild: function (message) {
      this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.TALK, message]);
    },

    sendLeaveGuild: function () {
      this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.LEAVE]);
    },

    sendBanPlayer: function (message) {
      this.sendMessage([Types.Messages.BAN_PLAYER, message]);
    },

    sendRequestPayout: function () {
      this.sendMessage([Types.Messages.REQUEST_PAYOUT]);
    },

    sendMoveItem: function (fromSlot, toSlot) {
      this.sendMessage([Types.Messages.MOVE_ITEM, fromSlot, toSlot]);
    },

    sendMoveUpgradeItemsToInventory: function () {
      this.sendMessage([Types.Messages.MOVE_UPGRADE_ITEMS_TO_INVENTORY]);
    },

    sendUpgradeItem: function () {
      this.sendMessage([Types.Messages.UPGRADE_ITEM]);
    },
  });

  return GameClient;
});
