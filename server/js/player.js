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
const { store } = require("./store/store");
const { purchase } = require("./store/purchase");

const MIN_LEVEL = 14;
const MIN_TIME = 1000 * 60 * 15;
const MAX_CLASSIC_PAYOUT = Utils.getClassicMaxPayout();
const MAX_EXPANSION1_PAYOUT = Utils.getExpansion1MaxPayout();

let index = 0;
// const NO_TIMEOUT_ACCOUNT = "nano_3j6ht184dt4imk5na1oyduxrzc6otig1iydfdaa4sgszne88ehcdbtp3c5y3";
const NO_TIMEOUT_ACCOUNT = "nano_3h3krxiab9zbn7ygg6zafzpfq7e6qp5i13od1esdjauogo6m8epqxmy7anix";

module.exports = Player = Character.extend({
  init: function (connection, worldServer, databaseHandler) {
    var self = this;

    purchase.databaseHandler = databaseHandler;

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
    this.auras = [];

    // Item bonuses (Rings, amulet, Uniques?)
    this.resetBonus();

    this.inventory = [];
    this.inventoryCount = [];
    this.achievement = [];
    this.hasRequestedBossPayout = false;
    this.hasRequestedNecromancerPayout = false;

    this.expansion1 = false;
    this.depositAccount = null;

    this.chatBanEndTime = 0;
    this.hash = null;
    this.hash1 = null;

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

          if (y >= 314 && !self.expansion1) {
            self.connection.sendUTF8("invalidconnection");
            self.connection.close("You have not unlocked the expansion.");
            return;
          }

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
          let isCritical = false;
          let dmg = Formulas.dmg({
            weapon: self.weapon,
            weaponLevel: self.weaponLevel,
            playerLevel: self.level,
            armorLevel: mob.armorLevel,
            minDamage: self.bonus.minDamage,
            maxDamage: self.bonus.maxDamage,
            magicDamage: self.bonus.magicDamage,
            weaponDamage: self.bonus.weaponDamage,
            flameDamage: self.bonus.flameDamage,
            lightningDamage: self.bonus.lightningDamage,
          });

          if (self.bonus.criticalHit) {
            isCritical = Utils.random(100) <= self.bonus.criticalHit;
            if (isCritical) {
              dmg = dmg * 2;
            }
          }

          if (self.bonus.drainLife) {
            dmg += self.bonus.drainLife;
            if (!self.hasFullHealth()) {
              self.regenHealthBy(self.bonus.drainLife);
              self.server.pushToPlayer(self, self.health());
            }
          }

          if (dmg > 0) {
            if (mob.type !== "player") {
              // Reduce dmg on boss by 20% per player in boss room
              if (mob.kind === Types.Entities.BOSS) {
                const adjustedDifficulty = self.server.getPlayersCountInBossRoom({
                  x: 140,
                  y: 48,
                  w: 29,
                  h: 25,
                });

                dmg = Math.floor(dmg - dmg * ((adjustedDifficulty - 1) * 0.125));
              } else if (mob.kind === Types.Entities.SKELETONCOMMANDER) {
                const adjustedDifficulty = self.server.getPlayersCountInBossRoom({
                  x: 140,
                  y: 360,
                  w: 29,
                  h: 25,
                });

                dmg = Math.floor(dmg - dmg * ((adjustedDifficulty - 1) * 0.2));
              } else if (mob.kind === Types.Entities.NECROMANCER) {
                const adjustedDifficulty = self.server.getPlayersCountInBossRoom({
                  x: 140,
                  y: 324,
                  w: 29,
                  h: 25,
                });

                dmg = Math.floor(dmg - dmg * ((adjustedDifficulty - 1) * 0.2));
              }

              mob.receiveDamage(dmg, self.id);
              self.server.handleMobHate(mob.id, self.id, dmg);
              self.server.handleHurtEntity({ entity: mob, attacker: self, damage: dmg, isCritical });
            }
          } else {
            mob.hitPoints -= dmg;
            if (mob.server) {
              mob.server.handleHurtEntity({ entity: mob, isCritical });
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
          let isBlocked = false;
          let dmg = Formulas.dmgFromMob({
            weaponLevel: mob.weaponLevel,
            armor: self.armor,
            armorLevel: self.armorLevel,
            belt: self.belt,
            beltLevel: self.beltLevel,
            isUniqueBelt: !!self.beltBonus,
            playerLevel: self.level,
            defense: self.bonus.defense,
            absorbedDamage: self.bonus.absorbedDamage,
          });

          if (self.bonus.blockChance) {
            isBlocked = Utils.random(100) <= self.bonus.blockChance;
            if (isBlocked) {
              dmg = 0;
            }
          }

          self.hitPoints -= dmg;
          self.server.handleHurtEntity({ entity: self, attacker: mob, isBlocked });

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
            } else if (Types.Entities.Artifact.includes(kind)) {
              let index = Types.Entities.Artifact.indexOf(kind);

              databaseHandler.foundArtifact(self.name, index);
            } else if (kind === Types.Entities.FIREPOTION) {
              self.updateHitPoints(true);
              self.broadcast(self.equip(Types.Entities.FIREFOX));
              self.firepotionTimeout = setTimeout(function () {
                self.broadcast(self.equip(self.armor, self.armorLevel, self.armorBonus)); // return to normal after 10 sec
                self.firepotionTimeout = null;
              }, 10000);
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
                case Types.Entities.REJUVENATIONPOTION:
                  amount = Math.ceil(self.maxHitPoints / 2);
                  break;
              }

              if (kind === Types.Entities.NANOPOTION) {
                databaseHandler.foundNanoPotion(self.name);
              }

              if (!self.hasFullHealth()) {
                self.regenHealthBy(amount);
                self.server.pushToPlayer(self, self.health());
              }
            } else if (Types.isArmor(kind) || Types.isWeapon(kind) || Types.isBelt(kind)) {
              const isUnique = Utils.random(100) === 42;
              const baseLevel = Types.getBaseLevel(kind);
              const level = baseLevel <= 5 && !isUnique ? Utils.randomInt(1, 3) : 1;
              let bonus = null;

              if (isUnique) {
                if (Types.isArmor(kind)) {
                  bonus = [6];
                } else if (Types.isWeapon(kind)) {
                  bonus = [3, 14];
                } else if (Types.isBelt(kind)) {
                  const mediumLevelBonus = [0, 1, 2, 3, 4, 5];
                  bonus = _.shuffle(mediumLevelBonus).slice(0, 1).sort();
                }
              }

              databaseHandler.lootItems({
                player: self,
                items: [{ item: Types.getKindAsString(kind), level, bonus: bonus ? JSON.stringify(bonus) : null }],
              });
            } else if (Types.isScroll(kind)) {
              databaseHandler.lootItems({ player: self, items: [{ item: Types.getKindAsString(kind), quantity: 1 }] });
            } else if (Types.isRing(kind) || Types.isAmulet(kind)) {
              const lowLevelBonus = [0, 1, 2, 3];
              const mediumLevelBonus = [0, 1, 2, 3, 4, 5];
              const highLevelBonus = [0, 1, 2, 3, 4, 5, 6, 7, 8];
              const amuletHighLevelBonus = [9, 10];
              const drainLifeBonus = [13];
              const lightningDamageBonus = [15];
              // @TODO Implement "11" -> magicFind
              // @TODO Implement "12" -> attackSpeed

              let bonus = [];
              if (kind === Types.Entities.RINGBRONZE) {
                bonus = _.shuffle(lowLevelBonus).slice(0, 1);
              } else if (kind === Types.Entities.RINGSILVER || kind === Types.Entities.AMULETSILVER) {
                bonus = _.shuffle(mediumLevelBonus).slice(0, 2).sort();
              } else if (kind === Types.Entities.RINGGOLD) {
                bonus = _.shuffle(highLevelBonus).slice(0, 3).sort();
              } else if (kind === Types.Entities.AMULETGOLD) {
                bonus = _.shuffle(mediumLevelBonus)
                  .slice(0, 2)
                  .sort()
                  .concat(_.shuffle(amuletHighLevelBonus).slice(0, 1));
              } else if (kind === Types.Entities.RINGNECROMANCER) {
                bonus = _.shuffle(highLevelBonus).slice(0, 3).sort().concat(drainLifeBonus);
              } else if (kind === Types.Entities.AMULETCOW) {
                bonus = _.shuffle(highLevelBonus).slice(0, 3).sort().concat(lightningDamageBonus);
              }

              databaseHandler.lootItems({
                player: self,
                items: [{ item: Types.getKindAsString(kind), level: 1, bonus: JSON.stringify(bonus) }],
              });
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
        if ((self.hash || self.hash1) && !message[1]) {
          self.connection.send({
            type: Types.Messages.BOSS_CHECK,
            status: "completed",
            hash: self.hash,
            hash1: self.hash1,
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
        const isClassicPayout = message[1] && message[1] === Types.Entities.BOSS;
        const isExpansion1Payout = message[1] && message[1] === Types.Entities.NECROMANCER;

        if (
          (!isClassicPayout && !isExpansion1Payout) ||
          (isClassicPayout && self.hasRequestedBossPayout) ||
          (isExpansion1Payout && self.hasRequestedNecromancerPayout)
        ) {
          return;
        }

        // If any of these fails, the player shouldn't be requesting a payout, BAN!
        if (
          isClassicPayout &&
          (self.hash ||
            self.hasRequestedBossPayout ||
            self.createdAt + MIN_TIME > Date.now() ||
            self.level < MIN_LEVEL ||
            // Check for required achievements
            !self.achievement[1] || //  -> INTO_THE_WILD
            !self.achievement[11] || // -> NO_MANS_LAND
            !self.achievement[16] || // -> HOT_SPOT
            !self.achievement[20]) // -> HERO
        ) {
          let reason;
          if (self.hash) {
            reason = `Already have hash ${self.hash}`;
          } else if (self.hasRequestedBossPayout) {
            reason = `Has already requested payout for Classic`;
          } else if (self.createdAt + MIN_TIME > Date.now()) {
            reason = `Less then 8 minutes played ${Date.now() - (self.createdAt + MIN_TIME)}`;
          } else if (self.level < MIN_LEVEL) {
            reason = `Min level not obtained, player is level ${self.level}`;
          } else if (!self.achievement[1] || !self.achievement[11] || !self.achievement[16] || !self.achievement[20]) {
            reason = `Player has not completed required quests ${self.achievement[1]}, ${self.achievement[11]}, ${self.achievement[16]}, ${self.achievement[20]}`;
          }

          log.info(`Reason: ${reason}`);
          databaseHandler.banPlayer(self, reason);
        } else if (
          isExpansion1Payout &&
          (self.hash1 ||
            self.hasRequestedNecromancerPayout ||
            // Check for required achievements
            !self.achievement[24] || // -> XNO
            !self.achievement[25] || // -> FREEZING_LANDS
            !self.achievement[34] || // -> WALK_ON_WATER
            !self.achievement[36] || // -> BLACK_MAGIC
            !self.expansion1)
        ) {
          let reason;
          if (self.hash1) {
            reason = `Already have hash1 ${self.hash1}`;
          } else if (self.hasRequestedNecromancerPayout) {
            reason = `Has already requested payout for Expansion1`;
          } else if (!self.achievement[24] || !self.achievement[25] || !self.achievement[34] || !self.achievement[36]) {
            reason = `Player has not completed required quests ${self.achievement[24]}, ${self.achievement[25]}, ${self.achievement[34]}, ${self.achievement[36]}`;
          } else if (self.expansion1) {
            reason = `Requested payout without having bought Expansion1`;
          }

          log.info(`Reason: ${reason}`);
          databaseHandler.banPlayer(self, reason);
        } else {
          self.connection.send({
            type: Types.Messages.NOTIFICATION,
            message: "Payout is being sent!",
          });

          let amount;
          let maxAmount;
          if (isClassicPayout) {
            self.hasRequestedBossPayout = true;
            amount = Utils.getClassicPayout(self.achievement.slice(0, 24));
            maxAmount = MAX_CLASSIC_PAYOUT;
          } else if (isExpansion1Payout) {
            self.hasRequestedNecromancerPayout = true;
            amount = Utils.getExpansion1Payout(self.achievement.slice(24, 40));
            maxAmount = MAX_EXPANSION1_PAYOUT;
          }

          const raiPayoutAmount = Utils.rawToRai(amount);

          if (raiPayoutAmount > maxAmount) {
            databaseHandler.banPlayer(
              self,
              `Tried to withdraw ${raiPayoutAmount} but max is ${maxAmount} for quest of kind: ${message[1]}`,
            );
            return;
          }

          log.info("PAYOUT STARTED: " + self.name + " " + self.account + " " + raiPayoutAmount);
          index += 1;
          const response =
            (await enqueueSendPayout({
              account: self.account,
              // @TODO 2x until noon jan 1st
              amount: amount * 2,
              index,
            })) || {};
          const { err, message, hash } = response;

          // If payout succeeds there will be a hash in the response!
          if (hash) {
            log.info(`PAYOUT COMPLETED: ${self.name} ${self.account} for quest of kind: ${message[1]}`);

            if (isClassicPayout) {
              self.hash = hash;
              databaseHandler.setHash(self.name, hash);
            } else if (isExpansion1Payout) {
              self.hash1 = hash;
              databaseHandler.setHash1(self.name, hash);
            }
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
            hash: self.hash,
            hash1: self.hash1,
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
      } else if (action === Types.Messages.WAYPOINT) {
        log.info("WAYPOINT: " + self.name + " " + message[1] + " " + message[2]);
        // From waypointID to index
        const index = parseInt(message[1]) - 1;
        if (message[2] === "found" && !self.waypoints[index]) {
          self.waypoints[index] = 1;
          databaseHandler.foundWaypoint(self.name, index);
        }
      } else if (action === Types.Messages.PURCHASE_CREATE) {
        log.info("PURCHASE_CREATE: " + self.name + " " + message[1] + " " + message[2]);

        if (message[2] === self.depositAccount) {
          purchase.create({ player: self, account: self.depositAccount, id: message[1] });
        }
      } else if (action === Types.Messages.PURCHASE_CANCEL) {
        log.info("PURCHASE_CANCEL: " + self.name + " " + message[1]);

        purchase.cancel(message[1]);
      } else if (action === Types.Messages.STORE_ITEMS) {
        log.info("STORE_ITEMS");

        const items = store.getItems();
        self.send([Types.Messages.STORE_ITEMS, items]);
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
        `${this.armor}:${this.armorLevel}${this.armorBonus ? `:${this.armorBonus}` : ""}`,
        `${this.weapon}:${this.weaponLevel}${this.weaponBonus ? `:${this.weaponBonus}` : ""}`,
        this.level,
        this.auras,
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

  equip: function (item, level, bonus) {
    return new Messages.EquipItem(this, item, level, bonus);
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

  equipArmor: function (armor, kind, level, bonus) {
    this.armor = armor;
    this.armorKind = kind;
    this.armorLevel = level;
    this.armorBonus = bonus ? JSON.parse(bonus) : null;
  },

  equipWeapon: function (weapon, kind, level, bonus) {
    this.weapon = weapon;
    this.weaponKind = kind;
    this.weaponLevel = level;
    this.weaponBonus = bonus ? JSON.parse(bonus) : null;
  },

  equipBelt: function (belt, level, bonus) {
    this.belt = belt;
    this.beltLevel = level;
    this.beltBonus = bonus ? JSON.parse(bonus) : null;
  },

  equipRing1: function (ring, level, bonus) {
    this.ring1 = ring;
    this.ring1Level = level;
    this.ring1Bonus = bonus ? JSON.parse(bonus) : null;
  },

  equipRing2: function (ring, level, bonus) {
    this.ring2 = ring;
    this.ring2Level = level;
    this.ring2Bonus = bonus ? JSON.parse(bonus) : null;
  },

  equipAmulet: function (amulet, level, bonus) {
    this.amulet = amulet;
    this.amuletLevel = level;
    this.amuletBonus = bonus ? JSON.parse(bonus) : null;
  },

  calculateBonus: function () {
    let hasDrainLifeAura = false;
    let hasThunderstormAura = false;

    if (this.bonus.drainLife) {
      hasDrainLifeAura = true;
    }
    if (this.bonus.lightningDamage) {
      hasThunderstormAura = true;
    }

    this.resetBonus();

    try {
      // @NOTE Could include weapon & armor when uniques
      const bonusToCalculate = [
        this.ring1
          ? {
              level: this.ring1Level,
              bonus: this.ring1Bonus,
            }
          : null,
        this.ring2
          ? {
              level: this.ring2Level,
              bonus: this.ring2Bonus,
            }
          : null,
        this.amulet
          ? {
              level: this.amuletLevel,
              bonus: this.amuletBonus,
            }
          : null,
        this.weaponBonus
          ? {
              level: this.weaponLevel,
              bonus: this.weaponBonus,
            }
          : null,
        this.armorBonus
          ? {
              level: this.armorLevel,
              bonus: this.armorBonus,
            }
          : null,
        this.beltBonus
          ? {
              level: this.beltLevel,
              bonus: this.beltBonus,
            }
          : null,
      ].filter(Boolean);

      bonusToCalculate.forEach(({ bonus, level }) => {
        Types.getBonus(bonus, level).forEach(({ type, stats }) => {
          this.bonus[type] += stats;
        });
      });

      if (this.bonus.drainLife) {
        this.addAura("drainlife");
      } else if (hasDrainLifeAura && !this.bonus.drainLife) {
        this.removeAura("drainlife");
      }

      if (this.bonus.lightningDamage) {
        this.addAura("thunderstorm");
      } else if (hasThunderstormAura && !this.bonus.lightningDamage) {
        this.removeAura("thunderstorm");
      }
    } catch (err) {
      console.log("Error: ", err);
      Sentry.captureException(err, {
        user: {
          username: self.name,
        },
      });
    }
  },

  resetBonus: function () {
    this.bonus = {
      minDamage: 0,
      maxDamage: 0,
      weaponDamage: 0,
      health: 0,
      magicDamage: 0,
      defense: 0,
      absorbedDamage: 0,
      exp: 0,
      regenerateHealth: 0,
      criticalHit: 0,
      blockChance: 0,
      magicFind: 0,
      attackSpeed: 0,
      drainLife: 0,
      flameDamage: 0,
      lightningDamage: 0,
    };
  },

  equipItem: function ({ item, level, bonus, type }) {
    // @NOTE safety...
    if (bonus === "null") {
      bonus = null;
    }

    if (["ring1", "ring2"].includes(type)) {
      if (type === "ring1") {
        this.equipRing1(item, level, bonus);
        databaseHandler.equipRing1({ name: this.name, item, level, bonus });
      } else if (type === "ring2") {
        this.equipRing2(item, level, bonus);
        databaseHandler.equipRing2({ name: this.name, item, level, bonus });
      }
    } else if (["amulet"].includes(type)) {
      this.equipAmulet(item, level, bonus);
      databaseHandler.equipAmulet({ name: this.name, item, level, bonus });
    } else if (["belt"].includes(type)) {
      databaseHandler.equipBelt(this.name, item, level, bonus);
      this.equipBelt(item, level, bonus);
    } else if (item && level) {
      const kind = Types.getKindFromString(item);

      log.debug(this.name + " equips " + item);

      if (Types.isArmor(kind)) {
        databaseHandler.equipArmor(this.name, item, level, bonus);
        this.equipArmor(item, kind, level, bonus);
      } else if (Types.isWeapon(kind)) {
        databaseHandler.equipWeapon(this.name, item, level, bonus);
        this.equipWeapon(item, kind, level, bonus);
      }
    }

    this.calculateBonus();
    this.updateHitPoints();
    this.sendPlayerStats();
  },

  addAura: function (aura) {
    const index = this.auras.indexOf(aura);
    if (index === -1) {
      this.auras.push(aura);
      this.broadcast(new Messages.Auras(this), false);
    }
  },

  removeAura: function (aura) {
    const index = this.auras.indexOf(aura);
    if (index > -1) {
      this.auras.splice(index, 1);
      this.broadcast(new Messages.Auras(this), false);
    }
  },
  updateHitPoints: function (reset) {
    const maxHitPoints =
      Formulas.hp({
        armorLevel: Properties.getArmorLevel(this.armorKind),
        level: this.armorLevel,
        playerLevel: this.level,
        beltLevel: this.beltLevel,
      }) + this.bonus.health;

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
    var { min: minAbsorb, max: maxAbsorb } = Formulas.minMaxAbsorb({
      armor: this.armor,
      armorLevel: this.armorLevel,
      isUniqueArmor: !!this.armorBonus,
      belt: this.belt,
      beltLevel: this.beltLevel,
      isUniqueBelt: !!this.beltBonus,
      playerLevel: this.level,
      defense: this.bonus.defense,
      absorbedDamage: this.bonus.absorbedDamage,
    });
    var { min: minDamage, max: maxDamage } = Formulas.minMaxDamage({
      weapon: this.weapon,
      weaponLevel: this.weaponLevel,
      playerLevel: this.level,
      minDamage: this.bonus.minDamage,
      maxDamage: this.bonus.maxDamage,
      magicDamage: this.bonus.magicDamage,
      weaponDamage: this.bonus.weaponDamage,
      flameDamage: this.bonus.flameDamage,
      lightningDamage: this.bonus.lightningDamage,
    });

    this.send(
      new Messages.Stats({
        maxHitPoints: this.maxHitPoints,
        damage: minDamage !== maxDamage ? `${minDamage}-${maxDamage}` : maxDamage,
        absorb: minAbsorb !== maxAbsorb ? `${minAbsorb}-${maxAbsorb}` : maxAbsorb,
      }).serialize(),
    );
  },

  incExp: function (exp) {
    this.experience = parseInt(this.experience) + exp;
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
    belt,
    ring1,
    ring2,
    amulet,
    exp,
    createdAt,
    x,
    y,
    chatBanEndTime = 0,
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
  }) {
    var self = this;

    const [playerArmor, playerArmorLevel = 1, playerArmorBonus] = armor.split(":");
    const [playerWeapon, playerWeaponLevel = 1, playerWeaponBonus] = weapon.split(":");

    self.kind = Types.Entities.WARRIOR;
    self.equipArmor(playerArmor, Types.getKindFromString(playerArmor), playerArmorLevel, playerArmorBonus);
    self.equipWeapon(playerWeapon, Types.getKindFromString(playerWeapon), playerWeaponLevel, playerWeaponBonus);

    if (belt) {
      const [playerBelt, playerBeltLevel, playerBeltBonus] = belt.split(":");
      self.equipBelt(playerBelt, playerBeltLevel, playerBeltBonus);
    }
    if (ring1) {
      const [playerRing1, playerRing1Level, playerRing1Bonus] = ring1.split(":");
      self.equipRing1(playerRing1, playerRing1Level, playerRing1Bonus);
    }
    if (ring2) {
      const [playerRing2, playerRing2Level, playerRing2Bonus] = ring2.split(":");
      self.equipRing2(playerRing2, playerRing2Level, playerRing2Bonus);
    }
    if (amulet) {
      const [playerAmulet, playerAmuletLevel, playerAmuletBonus] = amulet.split(":");
      self.equipAmulet(playerAmulet, playerAmuletLevel, playerAmuletBonus);
    }
    self.achievement = achievement;
    self.waypoints = waypoints;
    self.expansion1 = expansion1;
    self.depositAccount = depositAccount;
    self.inventory = inventory;
    self.stash = stash;
    self.hash = hash;
    self.hash1 = hash1;
    self.hasRequestedBossPayout = !!hash;
    self.hasRequestedNecromancerPayout = !!hash1;

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

    self.calculateBonus();

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
      belt,
      ring1,
      ring2,
      amulet,
      self.experience,
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
      self.auras,
    ]);

    self.updateHitPoints(true);
    self.sendPlayerStats();

    self.hasEnteredGame = true;
    self.isDead = false;

    // self.server.addPlayer(self, aGuildId);
  },
});
