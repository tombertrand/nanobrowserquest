const cls = require("./lib/class");
const _ = require("underscore");
const Character = require("./character");
const Chest = require("./chest");
const Messages = require("./message");
const Utils = require("./utils");
const Properties = require("./properties");
const Formulas = require("./formulas");
const check = require("./format").check;
const Types = require("../../shared/js/gametypes");
const bcrypt = require("bcrypt");
const { enqueueSendPayout } = require("./payout");
const { Sentry } = require("./sentry");

const MIN_LEVEL = 14;
const MIN_TIME = 1000 * 60 * 15;
const MAX_AMOUNT = Utils.getMaxPayoutAmount();

let index = 0;
// const NO_TIMEOUT_ACCOUNT = "nano_3j6ht184dt4imk5na1oyduxrzc6otig1iydfdaa4sgszne88ehcdbtp3c5y3";
const NO_TIMEOUT_ACCOUNT = "nano_3h3krxiab9zbn7ygg6zafzpfq7e6qp5i13od1esdjauogo6m8epqxmy7anix";

module.exports = Player = Character.extend({
  init: function (connection, worldServer, databaseHandler) {
    var self = this;

    this.server = worldServer;
    this.connection = connection;

    this._super(this.connection.id, "player", Types.Entities.WARRIOR, 0, 0, "");

    this.hasEnteredGame = false;
    this.isDead = false;
    this.haters = {};
    this.lastCheckpoint = null;
    this.formatChecker = new FormatChecker();
    this.disconnectTimeout = null;

    this.pvpFlag = false;
    this.bannedTime = 0;
    this.banUseTime = 0;
    this.experience = 0;
    this.level = 0;
    this.lastWorldChatMinutes = 99;

    this.inventory = [];
    this.inventoryCount = [];
    this.achievement = [];
    this.hasRequestedPayout = false;

    this.chatBanEndTime = 0;
    this.hash = null;

    this.connection.listen(async message => {
      var action = parseInt(message[0]);

      log.debug("Received: " + message);
      if (!check(message)) {
        self.connection.close("Invalid " + Types.getMessageTypeAsString(action) + " message format: " + message);
        return;
      }

      if (!self.hasEnteredGame && action !== Types.Messages.CREATE && action !== Types.Messages.LOGIN) {
        // CREATE or LOGIN must be the first message
        self.connection.close("Invalid handshake message: " + message);
        return;
      }
      if (
        self.hasEnteredGame &&
        !self.isDead &&
        (action === Types.Messages.CREATE || action === Types.Messages.LOGIN)
      ) {
        // CREATE/LOGIN can be sent only once
        self.connection.close("Cannot initiate handshake twice: " + message);
        return;
      }

      self.resetTimeout();

      if (action === Types.Messages.CREATE || action === Types.Messages.LOGIN) {
        // Get IP from CloudFlare
        const clientIP = self.connection._connection.handshake.headers["cf-connecting-ip"];

        if (process.env.NODE_ENV === "production" && !clientIP) {
          self.connection.sendUTF8("invalidconnection");
          self.connection.close("Unable to get IP.");
          return;
        }

        const timestamp = await databaseHandler.checkIsBanned(self);
        if (timestamp) {
          const days = timestamp > Date.now() + 24 * 60 * 60 * 1000 ? 365 : 1;

          self.connection.sendUTF8("banned-" + days);
          self.connection.close("You are banned, no cheating.");
          return;
        }

        var name = Utils.sanitize(message[1]);
        var account = Utils.sanitize(message[2]);

        // Always ensure that the name is not longer than a maximum length.
        // (also enforced by the maxlength attribute of the name input element).
        self.name = name.substr(0, 16).trim();
        // @TODO Max payout per IP per day?
        self.ip = clientIP;

        // Validate the username
        if (!self.checkName(self.name)) {
          self.connection.sendUTF8("invalidusername");
          self.connection.close("Invalid name " + self.name);
          return;
        }
        self.account = account.substr(0, 65);

        // @TODO rate-limit player creation
        if (action === Types.Messages.CREATE) {
          log.info("CREATE: " + self.name);
          // self.account = hash;
          databaseHandler.createPlayer(self);
        } else {
          log.info("LOGIN: " + self.name);
          if (self.server.loggedInPlayer(self.name)) {
            self.connection.sendUTF8("loggedin");
            self.connection.close("Already logged in " + self.name);
            return;
          }
          databaseHandler.loadPlayer(self);
        }

        // self.kind = Types.Entities.WARRIOR;
        // self.equipArmor(message[2]);
        // self.equipWeapon(message[3]);
        // if(typeof message[4] !== 'undefined') {
        //     var aGuildId = self.server.reloadGuild(message[4],message[5]);
        //     if( aGuildId !== message[4]) {
        //         self.server.pushToPlayer(self, new Messages.GuildError(Types.Messages.GUILDERRORTYPE.IDWARNING,message[5]));
        //     }
        // }
        // self.orientation = Utils.randomOrientation();
        // self.updateHitPoints();
        // self.updatePosition();
        //
        // self.server.addPlayer(self, aGuildId);
        // self.server.enter_callback(self);
        //
        // self.send([Types.Messages.WELCOME, self.id, self.name, self.x, self.y, self.hitPoints]);
        // self.hasEnteredGame = true;
        // self.isDead = false;
      } else if (action === Types.Messages.WHO) {
        log.info("WHO: " + self.name);
        message.shift();
        self.server.pushSpawnsToPlayer(self, message);
      } else if (action === Types.Messages.ZONE) {
        log.info("ZONE: " + self.name);
        self.zone_callback();
      } else if (action === Types.Messages.CHAT) {
        var msg = Utils.sanitize(message[1]);
        log.info("CHAT: " + self.name + ": " + msg);

        // if (msg === '/town')

        // Sanitized messages may become empty. No need to broadcast empty chat messages.
        if (msg && msg !== "") {
          msg = msg.substr(0, 100); // Enforce maxlength of chat input
          // CHAD COMMAND HANDLING IN ASKY VERSION HAPPENS HERE!
          self.broadcast(new Messages.Chat(self, msg), false);
          // self.broadcastToZone(new Messages.Chat(self, msg), false);
        }
      } else if (action === Types.Messages.MOVE) {
        // log.info("MOVE: " + self.name + "(" + message[1] + ", " + message[2] + ")");
        if (self.move_callback) {
          var x = message[1],
            y = message[2];

          if (self.server.isValidPosition(x, y)) {
            self.setPosition(x, y);
            self.clearTarget();

            self.broadcast(new Messages.Move(self));
            self.move_callback(self.x, self.y);
          }
        }
      } else if (action === Types.Messages.LOOTMOVE) {
        // log.info("LOOTMOVE: " + self.name + "(" + message[1] + ", " + message[2] + ")");
        if (self.lootmove_callback) {
          self.setPosition(message[1], message[2]);

          var item = self.server.getEntityById(message[3]);
          if (item) {
            self.clearTarget();

            self.broadcast(new Messages.LootMove(self, item));
            self.lootmove_callback(self.x, self.y);
          }
        }
      } else if (action === Types.Messages.AGGRO) {
        log.info("AGGRO: " + self.name + " " + message[1]);
        if (self.move_callback) {
          self.server.handleMobHate(message[1], self.id, 5);
        }
      } else if (action === Types.Messages.ATTACK) {
        log.info("ATTACK: " + self.name + " " + message[1]);
        var mob = self.server.getEntityById(message[1]);

        if (mob) {
          self.setTarget(mob);
          self.server.broadcastAttacker(self);
        }
      } else if (action === Types.Messages.HIT) {
        log.info("HIT: " + self.name + " " + message[1]);
        var mob = self.server.getEntityById(message[1]);

        if (mob) {
          var dmg = Formulas.dmg(self.weapon, self.weaponLevel, self.level, mob.armorLevel);
          if (dmg > 0) {
            if (mob.type !== "player") {
              // Reduce dmg on boss by 12.5% per player in boss room
              if (mob.kind === Types.Entities.BOSS) {
                dmg = Math.floor(dmg - dmg * ((self.server.getPlayersCountInBossRoom() - 1) * 0.125));
              }

              mob.receiveDamage(dmg, self.id);
              self.server.handleMobHate(mob.id, self.id, dmg);
              self.server.handleHurtEntity(mob, self, dmg);
            }
          } else {
            mob.hitPoints -= dmg;
            if (mob.server) {
              mob.server.handleHurtEntity(mob);
              if (mob.hitPoints <= 0) {
                mob.isDead = true;
                self.server.pushBroadcast(new Messages.Chat(self, self.name + "M-M-M-MONSTER KILLED" + mob.name));
              }
            }
          }
        }
      } else if (action === Types.Messages.HURT) {
        log.info("HURT: " + self.name + " " + message[1]);
        var mob = self.server.getEntityById(message[1]);
        if (mob && self.hitPoints > 0) {
          self.hitPoints -= Formulas.dmgFromMob(mob.weaponLevel, self.armor, self.armorLevel, self.level);
          self.server.handleHurtEntity(self, mob);

          if (self.hitPoints <= 0) {
            self.isDead = true;
            if (self.firepotionTimeout) {
              clearTimeout(self.firepotionTimeout);
            }
          }
        }
      } else if (action === Types.Messages.LOOT) {
        log.info("LOOT: " + self.name + " " + message[1]);
        var item = self.server.getEntityById(message[1]);

        if (item) {
          var kind = item.kind;

          if (Types.isItem(kind)) {
            self.broadcast(item.despawn());
            self.server.removeEntity(item);

            if (Types.Entities.Gems.includes(kind)) {
              let index = Types.Entities.Gems.indexOf(kind);

              databaseHandler.foundGem(self.name, index);
            } else if (kind === Types.Entities.FIREPOTION) {
              self.updateHitPoints(true);
              self.broadcast(self.equip(Types.Entities.FIREFOX));
              self.firepotionTimeout = setTimeout(function () {
                self.broadcast(self.equip(self.armor)); // return to normal after 15 sec
                self.firepotionTimeout = null;
              }, 15000);
              self.sendPlayerStats();
            } else if (Types.isHealingItem(kind)) {
              var amount;

              switch (kind) {
                case Types.Entities.FLASK:
                  amount = 40;
                  break;
                case Types.Entities.BURGER:
                  amount = 100;
                  break;
                case Types.Entities.NANOPOTION:
                  amount = 200;
                  break;
              }

              if (kind === Types.Entities.NANOPOTION) {
                databaseHandler.foundNanoPotion(self.name);
              }

              if (!self.hasFullHealth()) {
                self.regenHealthBy(amount);
                self.server.pushToPlayer(self, self.health());
              }
            } else if (Types.isArmor(kind) || Types.isWeapon(kind)) {
              const baseLevel = Types.getBaseLevel(kind);
              const level = baseLevel <= 5 ? Utils.randomInt(1, 3) : 1;

              databaseHandler.lootItems({ player: self, items: [{ item: Types.getKindAsString(kind), level }] });
            } else if (Types.isScroll(kind)) {
              databaseHandler.lootItems({ player: self, items: [{ item: Types.getKindAsString(kind), quantity: 1 }] });
            }
          }
        }
      } else if (action === Types.Messages.TELEPORT) {
        log.info("TELEPORT: " + self.name + "(" + message[1] + ", " + message[2] + ")");

        var x = message[1];
        var y = message[2];

        if (self.server.isValidPosition(x, y)) {
          self.setPosition(x, y);
          self.clearTarget();

          self.broadcast(new Messages.Teleport(self));

          self.server.handlePlayerVanish(self);
          self.server.pushRelevantEntityListTo(self);
        }
      } else if (action === Types.Messages.BOSS_CHECK) {
        if (self.hash && !message[1]) {
          self.connection.send({
            type: Types.Messages.BOSS_CHECK,
            status: "completed",
            hash: self.hash,
          });
          return;
        }

        if (!self.hash) {
          // BOSS room validation
          // Has played for more than 15 minutes, has at least X amount of exp (MIN_LEVEL)
          if (self.createdAt + MIN_TIME > Date.now() || self.level < MIN_LEVEL) {
            self.connection.send({
              type: Types.Messages.BOSS_CHECK,
              status: "failed",
              message:
                "You may not fight the end boss at the moment, you are too low level. Keep killing monsters and gaining experience!",
            });
            return;
          }
        }

        const position = Math.floor(Math.random() * 6) + 1;
        const date = `${Date.now()}`;
        const check = `${date.slice(0, position)}${position}${date.slice(position)}${position}`;

        self.connection.send({
          type: Types.Messages.BOSS_CHECK,
          status: "ok",
          check,
        });
      } else if (action === Types.Messages.REQUEST_PAYOUT) {
        if (self.hasRequestedPayout) {
          return;
        }

        // If any of these fails, the player shouldn't be requesting a payout, BAN!
        // @TODO Verify that killing the boss a second time doesn't ban the player because it wouldn't request a payout! (fix .then())
        if (
          self.hash ||
          self.hasRequestedPayout ||
          self.createdAt + MIN_TIME > Date.now() ||
          self.level < MIN_LEVEL ||
          // Check for required achievements
          !self.achievement[1] || //  -> INTO_THE_WILD
          !self.achievement[11] || // -> NO_MANS_LAND
          !self.achievement[16] || // -> HOT_SPOT
          !self.achievement[20] // -> HERO
        ) {
          let reason;
          if (self.hash) {
            reason = `Already have hash ${self.hash}`;
          } else if (self.hasRequestedPayout) {
            reason = `Has already requested payout`;
          } else if (self.createdAt + MIN_TIME > Date.now()) {
            reason = `Less then 8 minutes played ${Date.now() - (self.createdAt + MIN_TIME)}`;
          } else if (self.level < MIN_LEVEL) {
            reason = `Min level not obtained, player is level ${self.level}`;
          } else if (!self.achievement[1] || !self.achievement[11] || !self.achievement[16] || !self.achievement[20]) {
            reason = `Player has not completed required quests ${self.achievement[1]}, ${self.achievement[11]}, ${self.achievement[16]}, ${self.achievement[20]}`;
          }

          log.info(`Reason: ${reason}`);
          databaseHandler.banPlayer(self, reason);
        } else {
          self.hasRequestedPayout = true;

          self.connection.send({
            type: Types.Messages.NOTIFICATION,
            message: "Payout is being sent!",
          });

          const amount = Utils.getPayoutAmount(self.achievement);

          if (Utils.rawToRai(amount) > MAX_AMOUNT) {
            databaseHandler.banPlayer(self, `Tried to withdraw ${Utils.rawToRai(amount)}`);
            return;
          }

          log.info("PAYOUT STARTED: " + self.name + " " + self.account + " " + Utils.rawToRai(amount));
          index += 1;
          const response =
            (await enqueueSendPayout({
              account: self.account,
              amount,
              index,
            })) || {};
          const { err, message, hash } = response;

          if (hash) {
            log.info("PAYOUT COMPLETED: " + self.name + " " + self.account);
            self.hash = hash;
            databaseHandler.setHash(self.name, hash);
          } else {
            log.info("PAYOUT FAILED: " + self.name + " " + self.account);
            Sentry.captureException(err, {
              status: "PAYOUT FAILED",
              player: self.name,
              account: self.account,
            });
          }

          self.connection.send({
            type: Types.Messages.NOTIFICATION,
            message,
            hash,
          });

          self.server.updatePopulation();
        }
      } else if (action === Types.Messages.BAN_PLAYER) {
        // Just don't...
        databaseHandler.banPlayer(self, message[1]);
      } else if (action === Types.Messages.OPEN) {
        log.info("OPEN: " + self.name + " " + message[1]);
        var chest = self.server.getEntityById(message[1]);
        if (chest && chest instanceof Chest) {
          self.server.handleOpenedChest(chest, self);
        }
      } else if (action === Types.Messages.CHECK) {
        log.info("CHECK: " + self.name + " " + message[1]);
        var checkpoint = self.server.map.getCheckpoint(message[1]);
        if (checkpoint) {
          self.lastCheckpoint = checkpoint;
          databaseHandler.setCheckpoint(self.name, self.x, self.y);
        }
      } else if (action === Types.Messages.MOVE_ITEM) {
        log.info("MOVE ITEM: " + self.name + " " + message[1] + " " + message[2]);

        databaseHandler.moveItem({ player: self, fromSlot: message[1], toSlot: message[2] });
      } else if (action === Types.Messages.MOVE_UPGRADE_ITEMS_TO_INVENTORY) {
        log.info("MOVE UPGRADE ITEMS TO INVENTORY: " + self.name);

        databaseHandler.moveUpgradeItemsToInventory(self);
      } else if (action === Types.Messages.UPGRADE_ITEM) {
        log.info("UPGRADE ITEM: " + self.name);
        // @TODO GET the item to be upgraded, run the odds formulea, add the item +1 to slot 210 if success

        databaseHandler.upgradeItem(self);
      } else if (action === Types.Messages.ACHIEVEMENT) {
        log.info("ACHIEVEMENT: " + self.name + " " + message[1] + " " + message[2]);
        const index = parseInt(message[1]) - 1;
        if (message[2] === "found") {
          self.achievement[index] = 1;
          databaseHandler.foundAchievement(self.name, index);
        }
      } else if (action === Types.Messages.GUILD) {
        if (message[1] === Types.Messages.GUILDACTION.CREATE) {
          var guildname = Utils.sanitize(message[2]);
          if (guildname === "") {
            //inaccurate name
            self.server.pushToPlayer(self, new Messages.GuildError(Types.Messages.GUILDERRORTYPE.BADNAME, message[2]));
          } else {
            var guildId = self.server.addGuild(guildname);
            if (guildId === false) {
              self.server.pushToPlayer(
                self,
                new Messages.GuildError(Types.Messages.GUILDERRORTYPE.ALREADYEXISTS, guildname),
              );
            } else {
              self.server.joinGuild(self, guildId);
              self.server.pushToPlayer(
                self,
                new Messages.Guild(Types.Messages.GUILDACTION.CREATE, [guildId, guildname]),
              );
            }
          }
        } else if (message[1] === Types.Messages.GUILDACTION.INVITE) {
          var userName = message[2];
          var invitee;
          if (self.group in self.server.groups) {
            invitee = _.find(self.server.groups[self.group].entities, function (entity, key) {
              return entity instanceof Player && entity.name == userName ? entity : false;
            });
            if (invitee) {
              self.getGuild().invite(invitee, self);
            }
          }
        } else if (message[1] === Types.Messages.GUILDACTION.JOIN) {
          self.server.joinGuild(self, message[2], message[3]);
        } else if (message[1] === Types.Messages.GUILDACTION.LEAVE) {
          self.leaveGuild();
        } else if (message[1] === Types.Messages.GUILDACTION.TALK) {
          self.server.pushToGuild(
            self.getGuild(),
            new Messages.Guild(Types.Messages.GUILDACTION.TALK, [self.name, self.id, message[2]]),
          );
        }
      } else {
        if (self.message_callback) {
          self.message_callback(message);
        }
      }
    });

    this.connection.onClose(function () {
      if (self.firepotionTimeout) {
        clearTimeout(self.firepotionTimeout);
      }
      clearTimeout(self.disconnectTimeout);
      if (self.exit_callback) {
        self.exit_callback();
      }
    });

    this.connection.sendUTF8("go"); // Notify client that the HELLO/WELCOME handshake can start
  },

  destroy: function () {
    var self = this;

    this.forEachAttacker(function (mob) {
      mob.clearTarget();
    });
    this.attackers = {};

    this.forEachHater(function (mob) {
      mob.forgetPlayer(self.id);
    });
    this.haters = {};
  },

  getState: function () {
    var basestate = this._getBaseState(),
      state = [
        this.name,
        this.orientation,
        `${this.armor}:${this.armorLevel}`,
        `${this.weapon}:${this.weaponLevel}`,
        this.level,
      ];

    if (this.target) {
      state.push(this.target);
    }

    return basestate.concat(state);
  },

  send: function (message) {
    this.connection.send(message);
  },

  flagPVP: function (pvpFlag) {
    if (this.pvpFlag != pvpFlag) {
      this.pvpFlag = pvpFlag;
      this.send(new Messages.PVP(this.pvpFlag).serialize());
    }
  },

  broadcast: function (message, ignoreSelf) {
    if (this.broadcast_callback) {
      this.broadcast_callback(message, ignoreSelf === undefined ? true : ignoreSelf);
    }
  },

  broadcastToZone: function (message, ignoreSelf) {
    if (this.broadcastzone_callback) {
      this.broadcastzone_callback(message, ignoreSelf === undefined ? true : ignoreSelf);
    }
  },

  onExit: function (callback) {
    this.exit_callback = callback;
  },

  onMove: function (callback) {
    this.move_callback = callback;
  },

  onLootMove: function (callback) {
    this.lootmove_callback = callback;
  },

  onZone: function (callback) {
    this.zone_callback = callback;
  },

  onOrient: function (callback) {
    this.orient_callback = callback;
  },

  onMessage: function (callback) {
    this.message_callback = callback;
  },

  onBroadcast: function (callback) {
    this.broadcast_callback = callback;
  },

  onBroadcastToZone: function (callback) {
    this.broadcastzone_callback = callback;
  },

  equip: function (item) {
    return new Messages.EquipItem(this, item);
  },

  addHater: function (mob) {
    if (mob) {
      if (!(mob.id in this.haters)) {
        this.haters[mob.id] = mob;
      }
    }
  },

  removeHater: function (mob) {
    if (mob && mob.id in this.haters) {
      delete this.haters[mob.id];
    }
  },

  forEachHater: function (callback) {
    _.each(this.haters, function (mob) {
      callback(mob);
    });
  },

  equipArmor: function (armor, kind, level) {
    this.armor = armor;
    this.armorKind = kind;
    this.armorLevel = level; //Properties.getArmorLevel(kind);
  },

  equipWeapon: function (weapon, kind, level) {
    this.weapon = weapon;
    this.weaponKind = kind;
    this.weaponLevel = level; // Properties.getWeaponLevel(kind);
  },

  equipItem: function (item, level) {
    if (item && level) {
      const kind = Types.getKindFromString(item);

      log.debug(this.name + " equips " + item);

      if (Types.isArmor(kind)) {
        databaseHandler.equipArmor(this.name, item, level);
        this.equipArmor(item, kind, level);
      } else if (Types.isWeapon(kind)) {
        databaseHandler.equipWeapon(this.name, item, level);
        this.equipWeapon(item, kind, level);
      }

      this.updateHitPoints();
      this.sendPlayerStats();
    }
  },

  updateHitPoints: function (reset) {
    const maxHitPoints = Formulas.hp(Properties.getArmorLevel(this.armorKind), this.armorLevel, this.level);

    if (reset) {
      this.resetHitPoints(maxHitPoints);
    } else {
      this.updateMaxHitPoints(maxHitPoints);
    }
  },

  updatePosition: function () {
    if (this.requestpos_callback) {
      var pos = this.requestpos_callback();
      this.setPosition(pos.x, pos.y);
    }
  },

  onRequestPosition: function (callback) {
    this.requestpos_callback = callback;
  },

  resetTimeout: function () {
    clearTimeout(this.disconnectTimeout);
    // This account doesn't timeout
    if (this.account === NO_TIMEOUT_ACCOUNT) return;
    this.disconnectTimeout = setTimeout(this.timeout.bind(this), 1000 * 60 * 15); // 15 min.
  },

  timeout: function () {
    this.connection.sendUTF8("timeout");
    this.connection.close("Player was idle for too long");
  },

  sendPlayerStats: function () {
    var { min: minAbsorb, max: maxAbsorb } = Formulas.minMaxAbsorb(this.armor, this.armorLevel, this.level);
    var { min: minDamage, max: maxDamage } = Formulas.minMaxDamage(this.weapon, this.weaponLevel, this.level);

    this.send(
      new Messages.Stats({
        maxHitPoints: this.maxHitPoints,
        damage: minDamage !== maxDamage ? `${minDamage}-${maxDamage}` : maxDamage,
        absorb: minAbsorb !== maxAbsorb ? `${minAbsorb}-${maxAbsorb}` : maxAbsorb,
      }).serialize(),
    );
  },

  incExp: function (gotexp) {
    this.experience = parseInt(this.experience) + parseInt(gotexp);
    databaseHandler.setExp(this.name, this.experience);
    var origLevel = this.level;
    this.level = Types.getLevel(this.experience);
    if (origLevel !== this.level) {
      this.updateHitPoints(true);
      this.sendPlayerStats();
      // @NOTE Update the player levels
      this.server.updatePopulation({ levelupPlayer: this.id });
    }
  },

  setGuildId: function (id) {
    if (typeof this.server.guilds[id] !== "undefined") {
      this.guildId = id;
    } else {
      log.error(this.id + " cannot add guild " + id + ", it does not exist");
    }
  },

  getGuild: function () {
    return this.hasGuild ? this.server.guilds[this.guildId] : undefined;
  },

  hasGuild: function () {
    return typeof this.guildId !== "undefined";
  },

  leaveGuild: function () {
    if (this.hasGuild()) {
      var leftGuild = this.getGuild();
      leftGuild.removeMember(this);
      this.server.pushToGuild(
        leftGuild,
        new Messages.Guild(Types.Messages.GUILDACTION.LEAVE, [this.name, this.id, leftGuild.name]),
      );
      delete this.guildId;
      this.server.pushToPlayer(
        this,
        new Messages.Guild(Types.Messages.GUILDACTION.LEAVE, [this.name, this.id, leftGuild.name]),
      );
    } else {
      this.server.pushToPlayer(this, new Messages.GuildError(Types.Messages.GUILDERRORTYPE.NOLEAVE, ""));
    }
  },

  checkName: function (name) {
    if (name === null) return false;
    else if (name === "") return false;
    else if (name === " ") return false;

    for (var i = 0; i < name.length; i++) {
      var c = name.charCodeAt(i);

      if (
        !(
          (0xac00 <= c && c <= 0xd7a3) ||
          (0x3131 <= c && c <= 0x318e) || // Korean (Unicode blocks "Hangul Syllables" and "Hangul Compatibility Jamo")
          (0x61 <= c && c <= 0x7a) ||
          (0x41 <= c && c <= 0x5a) || // English (lowercase and uppercase)
          (0x30 <= c && c <= 0x39) || // Numbers
          c == 0x20 ||
          c == 0x5f ||
          c == 0x2d || // Space, underscore and dash
          c == 0x28 ||
          c == 0x29 || // Parentheses
          c == 0x5e
        )
      ) {
        // Caret
        return false;
      }
    }
    return true;
  },

  sendWelcome: function ({
    armor,
    weapon,
    exp,
    createdAt,
    x,
    y,
    chatBanEndTime = 0,
    achievement,
    inventory,
    hash,
    nanoPotions,
    gems,
  }) {
    var self = this;

    const [playerArmor, playerArmorLevel = 1] = armor.split(":");
    const [playerWeapon, playerWeaponLevel = 1] = weapon.split(":");

    self.kind = Types.Entities.WARRIOR;
    self.equipArmor(playerArmor, Types.getKindFromString(playerArmor), playerArmorLevel);
    self.equipWeapon(playerWeapon, Types.getKindFromString(playerWeapon), playerWeaponLevel);

    self.achievement = achievement;
    self.inventory = inventory;
    self.hash = hash;
    self.hasRequestedPayout = !!hash;

    self.createdAt = createdAt;
    self.experience = exp;
    self.level = Types.getLevel(self.experience);
    self.orientation = Utils.randomOrientation;

    if (x === 0 && y === 0) {
      self.updatePosition();
    } else {
      self.setPosition(x, y);
    }
    self.chatBanEndTime = chatBanEndTime;

    self.server.addPlayer(self);
    self.server.enter_callback(self);

    self.send([
      Types.Messages.WELCOME,
      self.id,
      self.name,
      self.x,
      self.y,
      self.hitPoints,
      armor,
      weapon,
      self.experience,
      achievement,
      inventory,
      hash,
      nanoPotions,
      gems,
    ]);

    self.updateHitPoints(true);
    self.sendPlayerStats();

    self.hasEnteredGame = true;
    self.isDead = false;

    // self.server.addPlayer(self, aGuildId);
  },
});
