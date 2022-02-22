// import bcrypt from "bcrypt";
import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Character from "./character";
import Chest from "./chest";
import FormatChecker from "./format";
import Formulas from "./formulas";
import Messages from "./message";
import { enqueueSendPayout } from "./payout";
import Properties from "./properties";
import { Sentry } from "./sentry";
import { purchase } from "./store/purchase";
import { store } from "./store/store";
import {
  getClassicMaxPayout,
  getClassicPayout,
  getExpansion1MaxPayout,
  getExpansion1Payout,
  random,
  randomInt,
  randomOrientation,
  rawToRai,
  sanitize,
} from "./utils";

const MIN_LEVEL = 14;
const MIN_TIME = 1000 * 60 * 15;
const MAX_CLASSIC_PAYOUT = getClassicMaxPayout();
const MAX_EXPANSION1_PAYOUT = getExpansion1MaxPayout();

let payoutIndex = 0;
// const NO_TIMEOUT_ACCOUNT = "nano_3j6ht184dt4imk5na1oyduxrzc6otig1iydfdaa4sgszne88ehcdbtp3c5y3";
const NO_TIMEOUT_ACCOUNT = "nano_3h3krxiab9zbn7ygg6zafzpfq7e6qp5i13od1esdjauogo6m8epqxmy7anix";

class Player extends Character {
  server: any;
  connection: any;
  hasEnteredGame: boolean;
  isDead: boolean;
  haters: {};
  lastCheckpoint: any;
  formatChecker: any;
  disconnectTimeout: any;
  pvpFlag: boolean;
  bannedTime: number;
  banUseTime: number;
  experience: number;
  level: number;
  lastWorldChatMinutes: number;
  auras: string[];
  inventory: any[];
  inventoryCount: any[];
  achievement: any[];
  hasRequestedBossPayout: boolean;
  hasRequestedNecromancerPayout: boolean;
  expansion1: boolean;
  depositAccount: any;
  chatBanEndTime: number;
  hash: string;
  hash1: string;
  name: string;
  ip: string;
  account: any;
  move_callback: any;
  lootmove_callback: any;
  weapon: string;
  weaponLevel: number;
  weaponBonus: number[] | null;
  armor: string;
  armorLevel: number;
  armorBonus: number[] | null;
  belt: string;
  beltLevel: number;
  beltBonus: number[] | null;
  firepotionTimeout: any;
  createdAt: number;
  waypoints: any;
  group: any;
  bonus: any;
  armorKind: number;
  weaponKind: number;
  ring1: string;
  ring1Level: number;
  ring1Bonus: number[];
  ring2: string;
  ring2Level: number;
  ring2Bonus: number[];
  amulet: string;
  amuletLevel: number;
  amuletBonus: number[];
  requestpos_callback: any;
  message_callback: any;
  exit_callback: any;
  broadcast_callback: any;
  broadcastzone_callback: any;
  zone_callback: any;
  orient_callback: any;
  guildId: any;
  depositAccountIndex: number;
  stash: any;
  databaseHandler: any;

  constructor(connection, worldServer, databaseHandler) {
    //@ts-ignore
    super(connection.id, "player", Types.Entities.WARRIOR);

    var self = this;

    purchase.databaseHandler = databaseHandler;
    this.databaseHandler = databaseHandler;

    this.server = worldServer;
    this.connection = connection;

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
      const action = parseInt(message[0]);

      console.debug("Received: " + message);
      if (!this.formatChecker.check(message)) {
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

        var name = sanitize(message[1]);
        var account = sanitize(message[2]);

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
          console.info("CREATE: " + self.name);
          // self.account = hash;
          databaseHandler.createPlayer(self);
        } else {
          console.info("LOGIN: " + self.name);
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
        console.info("WHO: " + self.name);
        message.shift();
        self.server.pushSpawnsToPlayer(self, message);
      } else if (action === Types.Messages.ZONE) {
        console.info("ZONE: " + self.name);
        self.zone_callback();
      } else if (action === Types.Messages.CHAT) {
        var msg = sanitize(message[1]);
        console.info("CHAT: " + self.name + ": " + msg);

        // Sanitized messages may become empty. No need to broadcast empty chat messages.
        if (msg && msg !== "") {
          msg = msg.substr(0, 100); // Enforce maxlength of chat input

          if (self.name === "running-coder") {
            if (msg === "startCowLevel") {
              if (!self.server.cowLevelClock) {
                self.server.startCowLevel();
                self.broadcast(new Messages.AnvilRecipe("cowLevel"), false);
              }
              return;
            }
          }

          // Zone chat
          // self.broadcast(new Messages.Chat(self, msg), false);

          // Global chat
          self.server.pushBroadcast(new Messages.Chat(self, msg), false);
        }
      } else if (action === Types.Messages.MOVE) {
        // console.info("MOVE: " + self.name + "(" + message[1] + ", " + message[2] + ")");
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
        // console.info("LOOTMOVE: " + self.name + "(" + message[1] + ", " + message[2] + ")");
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
        console.info("AGGRO: " + self.name + " " + message[1]);
        if (self.move_callback) {
          self.server.handleMobHate(message[1], self.id, 5);
        }
      } else if (action === Types.Messages.ATTACK) {
        console.info("ATTACK: " + self.name + " " + message[1]);
        var mob = self.server.getEntityById(message[1]);

        if (mob) {
          self.setTarget(mob);
          self.server.broadcastAttacker(self);
        }
      } else if (action === Types.Messages.HIT) {
        console.info("HIT: " + self.name + " " + message[1]);
        var mob = self.server.getEntityById(message[1]);

        if (mob?.type === "mob") {
          let isCritical = false;

          let dmg = Formulas.dmg({
            weapon: self.weapon,
            weaponLevel: self.weaponLevel,
            playerLevel: self.level,
            armorLevel: mob.armorLevel,
            minDamage: self.bonus.minDamage,
            maxDamage: self.bonus.maxDamage,
            magicDamage: self.bonus.magicDamage,
            attackDamage: self.bonus.attackDamage,
            flameDamage: self.bonus.flameDamage,
            lightningDamage: self.bonus.lightningDamage,
            pierceArmor: self.bonus.pierceArmor,
          });

          if (self.bonus.criticalHit) {
            isCritical = random(100) <= self.bonus.criticalHit;
            if (isCritical) {
              dmg = Math.ceil(dmg * 1.5);
            }
          }

          if (self.bonus.drainLife) {
            dmg += self.bonus.drainLife;
            if (!self.hasFullHealth()) {
              self.regenHealthBy(self.bonus.drainLife);
              self.server.pushToPlayer(self, self.health());
            }
          }

          // Reduce dmg on boss by 20% per player in boss room
          if (mob.kind === Types.Entities.BOSS) {
            const adjustedDifficulty = self.server.getPlayersCountInBossRoom({
              x: 140,
              y: 48,
              w: 29,
              h: 25,
            });

            const percentReduce = Math.pow(0.8, adjustedDifficulty - 1);
            dmg = Math.floor(dmg * percentReduce);
          } else if (mob.kind === Types.Entities.SKELETONCOMMANDER) {
            const adjustedDifficulty = self.server.getPlayersCountInBossRoom({
              x: 140,
              y: 360,
              w: 29,
              h: 25,
            });

            const percentReduce = Math.pow(0.8, adjustedDifficulty - 1);
            dmg = Math.floor(dmg * percentReduce);
          } else if (mob.kind === Types.Entities.NECROMANCER) {
            const adjustedDifficulty = self.server.getPlayersCountInBossRoom({
              x: 140,
              y: 324,
              w: 29,
              h: 25,
            });

            const percentReduce = Math.pow(0.8, adjustedDifficulty - 1);
            dmg = Math.floor(dmg * percentReduce);
          } else if (mob.kind === Types.Entities.COWKING) {
            const adjustedDifficulty = self.server.getPlayersCountInBossRoom({
              x: 0,
              y: 464,
              w: 92,
              h: 71,
            });

            const percentReduce = Math.pow(0.8, adjustedDifficulty - 1);
            dmg = Math.floor(dmg * percentReduce);
          }

          // @NOTE: Evaluate character distance to mob when receiving hits? and time between
          if (!mob?.receiveDamage) {
            self.connection.close("Invalid mob");
            Sentry.captureException(new Error("Invalid mob"), {
              user: {
                username: self.name,
              },
              tags: {
                player: self.name,
                account: self.account,
              },
              extra: { kind: mob.kind, id: mob.id },
            });
          }

          mob.receiveDamage(dmg);
          self.server.handleMobHate(mob.id, self.id, dmg);
          self.server.handleHurtEntity({ entity: mob, attacker: self, damage: dmg, isCritical });

          if (mob.hitPoints <= 0) {
            mob.isDead = true;
          }
        }
      } else if (action === Types.Messages.HURT) {
        console.info("HURT: " + self.name + " " + message[1]);
        var mob = self.server.getEntityById(message[1]);
        if (mob && self.hitPoints > 0) {
          let isBlocked = false;
          let lightningDamage = false;
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
            isBlocked = random(100) <= self.bonus.blockChance;
            if (isBlocked) {
              dmg = 0;
            }
          }

          if (self.bonus.lightningDamage) {
            lightningDamage = self.bonus.lightningDamage;

            mob.receiveDamage(lightningDamage, self.id);
            self.server.handleHurtEntity({ entity: mob, attacker: self, damage: lightningDamage });
          }

          if (mob.kind === Types.isBoss(mob.kind)) {
            // Each boss gets a 10% crit chance
            if (random(10) === 3) {
              dmg = Math.ceil(dmg * 1.5);
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
        console.info("LOOT: " + self.name + " " + message[1]);
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
              self.broadcast(self.equip(Types.Entities.FIREFOX, 1));
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
              const isUnique = random(100) === 42;
              const baseLevel = Types.getBaseLevel(kind);
              const level = baseLevel <= 5 && !isUnique ? randomInt(1, 3) : 1;
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
            } else if (Types.isScroll(kind) || Types.isSingle(kind)) {
              databaseHandler.lootItems({
                player: self,
                items: [{ item: Types.getKindAsString(kind), quantity: 1 }],
              });
            } else if (Types.isRing(kind) || Types.isAmulet(kind)) {
              const lowLevelBonus = [0, 1, 2, 3];
              const mediumLevelBonus = [0, 1, 2, 3, 4, 5];
              const highLevelBonus = [0, 1, 2, 3, 4, 5, 6, 7, 8];
              const amuletHighLevelBonus = [9, 10];
              const drainLifeBonus = [13];
              const fireDamageBonus = [14];
              const lightningDamageBonus = [15];
              const pierceArmorBonus = [16];
              const highHealthBonus = [17];

              let bonus = [];
              if (kind === Types.Entities.RINGBRONZE) {
                bonus = _.shuffle(lowLevelBonus).slice(0, 1);
              } else if (kind === Types.Entities.RINGSILVER || kind === Types.Entities.AMULETSILVER) {
                bonus = _.shuffle(mediumLevelBonus).slice(0, 2);
              } else if (kind === Types.Entities.RINGGOLD) {
                bonus = _.shuffle(highLevelBonus).slice(0, 3);
              } else if (kind === Types.Entities.AMULETGOLD) {
                bonus = _.shuffle(highLevelBonus).slice(0, 2).concat(_.shuffle(amuletHighLevelBonus).slice(0, 1));
              } else if (kind === Types.Entities.RINGNECROMANCER) {
                bonus = _.shuffle(highLevelBonus).slice(0, 3).concat(drainLifeBonus);
              } else if (kind === Types.Entities.AMULETCOW) {
                bonus = _.shuffle(highLevelBonus)
                  .slice(0, 3)
                  .concat(_.shuffle(amuletHighLevelBonus).slice(0, 1))
                  .concat(
                    _.shuffle([
                      ...fireDamageBonus,
                      ...highHealthBonus,
                      ...lightningDamageBonus,
                      ...pierceArmorBonus,
                    ]).slice(0, 1),
                  );
              } else if (kind === Types.Entities.RINGRAISTONE) {
                bonus = _.shuffle(highLevelBonus).slice(0, 3).concat(lightningDamageBonus);
              } else if (kind === Types.Entities.RINGFOUNTAIN) {
                bonus = _.shuffle([5, 6])
                  .slice(0, 2)
                  .concat([8, ...highHealthBonus]);
              }

              if (
                kind === Types.Entities.AMULETCOW ||
                kind === Types.Entities.RINGRAISTONE ||
                kind === Types.Entities.RINGFOUNTAIN
              ) {
                databaseHandler.logLoot({
                  player: self,
                  item: `${Types.getKindAsString(kind)}:1:[${bonus.sort((a, b) => a - b)}]`,
                });
              }

              databaseHandler.lootItems({
                player: self,
                items: [
                  { item: Types.getKindAsString(kind), level: 1, bonus: JSON.stringify(bonus.sort((a, b) => a - b)) },
                ],
              });
            }
          }
        }
      } else if (action === Types.Messages.TELEPORT) {
        console.info("TELEPORT: " + self.name + "(" + message[1] + ", " + message[2] + ")");

        var x = message[1];
        var y = message[2];

        if (self.server.isValidPosition(x, y)) {
          self.setPosition(x, y);
          self.clearTarget();

          self.broadcast(new Messages.Teleport(self));

          self.server.handlePlayerVanish(self);
          self.server.pushRelevantEntityListTo(self);

          if (y >= 464 && y <= 535) {
            self.send(new Messages.CowLevelInProgress(self.server.cowLevelClock).serialize());
          }
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

          console.info(`Reason: ${reason}`);
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

          console.info(`Reason: ${reason}`);
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
            amount = getClassicPayout(self.achievement.slice(0, 24));
            maxAmount = MAX_CLASSIC_PAYOUT;
          } else if (isExpansion1Payout) {
            self.hasRequestedNecromancerPayout = true;
            amount = getExpansion1Payout(self.achievement.slice(24, 40));
            maxAmount = MAX_EXPANSION1_PAYOUT;
          }

          const raiPayoutAmount = rawToRai(amount);

          if (raiPayoutAmount > maxAmount) {
            databaseHandler.banPlayer(
              self,
              `Tried to withdraw ${raiPayoutAmount} but max is ${maxAmount} for quest of kind: ${message[1]}`,
            );
            return;
          }

          console.info("PAYOUT STARTED: " + self.name + " " + self.account + " " + raiPayoutAmount);
          payoutIndex += 1;
          const response =
            (await enqueueSendPayout({
              account: self.account,
              // @TODO 2x until noon jan 1st
              amount: amount * 2,
              payoutIndex,
            })) || {};
          const { err, message: msg, hash } = response as any;

          // If payout succeeds there will be a hash in the response!
          if (hash) {
            console.info(`PAYOUT COMPLETED: ${self.name} ${self.account} for quest of kind: ${message[1]}`);

            if (isClassicPayout) {
              self.hash = hash;
              databaseHandler.setHash(self.name, hash);
            } else if (isExpansion1Payout) {
              self.hash1 = hash;
              databaseHandler.setHash1(self.name, hash);
            }
          } else {
            console.info("PAYOUT FAILED: " + self.name + " " + self.account);
            Sentry.captureException(err, {
              user: {
                username: self.name,
              },
              tags: {
                player: self.name,
                account: self.account,
              },
              extra: { status: "PAYOUT FAILED" },
            });
          }

          self.connection.send({
            type: Types.Messages.NOTIFICATION,
            message: msg,
            hash: self.hash,
            hash1: self.hash1,
          });

          self.server.updatePopulation();
        }
      } else if (action === Types.Messages.BAN_PLAYER) {
        // Just don't...
        databaseHandler.banPlayer(self, message[1]);
      } else if (action === Types.Messages.OPEN) {
        console.info("OPEN: " + self.name + " " + message[1]);
        var chest = self.server.getEntityById(message[1]);
        if (chest && chest instanceof Chest) {
          self.server.handleOpenedChest(chest, self);
        }
      } else if (action === Types.Messages.CHECK) {
        console.info("CHECK: " + self.name + " " + message[1]);
        var checkpoint = self.server.map.getCheckpoint(message[1]);
        if (checkpoint) {
          self.lastCheckpoint = checkpoint;
          databaseHandler.setCheckpoint(self.name, self.x, self.y);
        }
      } else if (action === Types.Messages.MOVE_ITEM) {
        console.info("MOVE ITEM: " + self.name + " " + message[1] + " " + message[2]);

        databaseHandler.moveItem({ player: self, fromSlot: message[1], toSlot: message[2] });
      } else if (action === Types.Messages.MOVE_UPGRADE_ITEMS_TO_INVENTORY) {
        console.info("MOVE UPGRADE ITEMS TO INVENTORY: " + self.name);

        databaseHandler.moveUpgradeItemsToInventory(self);
      } else if (action === Types.Messages.UPGRADE_ITEM) {
        console.info("UPGRADE ITEM: " + self.name);

        databaseHandler.upgradeItem(self);
      } else if (action === Types.Messages.ACHIEVEMENT) {
        console.info("ACHIEVEMENT: " + self.name + " " + message[1] + " " + message[2]);
        const index = parseInt(message[1]) - 1;
        if (message[2] === "found") {
          self.achievement[index] = 1;
          databaseHandler.foundAchievement(self.name, index);
        }
      } else if (action === Types.Messages.WAYPOINT) {
        console.info("WAYPOINT: " + self.name + " " + message[1] + " " + message[2]);
        // From waypointID to index
        const index = parseInt(message[1]) - 1;
        if (message[2] === "found" && !self.waypoints[index]) {
          self.waypoints[index] = 1;
          databaseHandler.foundWaypoint(self.name, index);
        }
      } else if (action === Types.Messages.PURCHASE_CREATE) {
        console.info("PURCHASE_CREATE: " + self.name + " " + message[1] + " " + message[2]);

        if (message[2] === self.depositAccount) {
          purchase.create({ player: self, account: self.depositAccount, id: message[1] });
        }
      } else if (action === Types.Messages.PURCHASE_CANCEL) {
        console.info("PURCHASE_CANCEL: " + self.name + " " + message[1]);

        purchase.cancel(message[1]);
      } else if (action === Types.Messages.STORE_ITEMS) {
        console.info("STORE_ITEMS");

        const items = store.getItems();
        self.send([Types.Messages.STORE_ITEMS, items]);
      } else if (action === Types.Messages.GUILD) {
        if (message[1] === Types.Messages.GUILDACTION.CREATE) {
          var guildname = sanitize(message[2]);
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
            invitee = _.find(self.server.groups[self.group].entities, function (entity) {
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
  }

  destroy() {
    var self = this;

    this.forEachAttacker(function (mob) {
      mob.clearTarget();
    });
    this.attackers = {};

    this.forEachHater(function (mob) {
      mob.forgetPlayer(self.id);
    });
    this.haters = {};
  }

  getState() {
    var basestate = this._getBaseState();
    var state = [
      this.orientation,
      this.target,
      this.name,
      `${this.armor}:${this.armorLevel}${this.armorBonus ? `:${this.armorBonus}` : ""}`,
      `${this.weapon}:${this.weaponLevel}${this.weaponBonus ? `:${this.weaponBonus}` : ""}`,
      this.level,
      this.auras,
    ];

    return basestate.concat(state);
  }

  send(message) {
    this.connection.send(message);
  }

  flagPVP(pvpFlag) {
    if (this.pvpFlag != pvpFlag) {
      this.pvpFlag = pvpFlag;
      this.send(new Messages.PVP(this.pvpFlag).serialize());
    }
  }

  broadcast(message, ignoreSelf: boolean = false) {
    if (this.broadcast_callback) {
      this.broadcast_callback(message, ignoreSelf === undefined ? true : ignoreSelf);
    }
  }

  broadcastToZone(message, ignoreSelf: boolean = false) {
    if (this.broadcastzone_callback) {
      this.broadcastzone_callback(message, ignoreSelf === undefined ? true : ignoreSelf);
    }
  }

  onExit(callback) {
    this.exit_callback = callback;
  }

  onMove(callback) {
    this.move_callback = callback;
  }

  onLootMove(callback) {
    this.lootmove_callback = callback;
  }

  onZone(callback) {
    this.zone_callback = callback;
  }

  onOrient(callback) {
    this.orient_callback = callback;
  }

  onMessage(callback) {
    this.message_callback = callback;
  }

  onBroadcast(callback) {
    this.broadcast_callback = callback;
  }

  onBroadcastToZone(callback) {
    this.broadcastzone_callback = callback;
  }

  equip(item, level: number, bonus?: number[]) {
    return new Messages.EquipItem(this, item, level, bonus);
  }

  addHater(mob) {
    if (mob) {
      if (!(mob.id in this.haters)) {
        this.haters[mob.id] = mob;
      }
    }
  }

  removeHater(mob) {
    if (mob && mob.id in this.haters) {
      delete this.haters[mob.id];
    }
  }

  forEachHater(callback) {
    _.each(this.haters, function (mob) {
      callback(mob);
    });
  }

  equipArmor(armor, kind, level, bonus) {
    this.armor = armor;
    this.armorKind = kind;
    this.armorLevel = level;
    this.armorBonus = bonus ? JSON.parse(bonus) : null;
  }

  equipWeapon(weapon, kind, level, bonus) {
    this.weapon = weapon;
    this.weaponKind = kind;
    this.weaponLevel = level;
    this.weaponBonus = bonus ? JSON.parse(bonus) : null;
  }

  equipBelt(belt, level, bonus) {
    this.belt = belt;
    this.beltLevel = level;
    this.beltBonus = bonus ? JSON.parse(bonus) : null;
  }

  equipRing1(ring, level, bonus) {
    this.ring1 = ring;
    this.ring1Level = level;
    this.ring1Bonus = bonus ? JSON.parse(bonus) : null;
  }

  equipRing2(ring, level, bonus) {
    this.ring2 = ring;
    this.ring2Level = level;
    this.ring2Bonus = bonus ? JSON.parse(bonus) : null;
  }

  equipAmulet(amulet, level, bonus) {
    this.amulet = amulet;
    this.amuletLevel = level;
    this.amuletBonus = bonus ? JSON.parse(bonus) : null;
  }

  calculateBonus() {
    let hasDrainLifeAura = false;
    let hasThunderstormAura = false;
    let hasHighHealth = false;

    if (this.bonus.drainLife) {
      hasDrainLifeAura = true;
    }
    if (this.bonus.lightningDamage) {
      hasThunderstormAura = true;
    }

    if (this.bonus.highHealth) {
      hasHighHealth = true;
    }

    this.resetBonus();

    try {
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

      if (this.bonus.highHealth) {
        this.addAura("highhealth");
      } else if (hasHighHealth && !this.bonus.highHealth) {
        this.removeAura("highhealth");
      }
    } catch (err) {
      console.log("Error: ", err);
      Sentry.captureException(err, {
        user: {
          username: this.name,
        },
      });
    }
  }

  resetBonus() {
    this.bonus = {
      minDamage: 0,
      maxDamage: 0,
      attackDamage: 0,
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
      pierceArmor: 0,
      highHealth: 0,
    };
  }

  equipItem({ item, level, bonus, type }) {
    // @NOTE safety...
    if (bonus === "null") {
      bonus = null;
    }

    if (["ring1", "ring2"].includes(type)) {
      if (type === "ring1") {
        this.equipRing1(item, level, bonus);
        this.databaseHandler.equipRing1({ name: this.name, item, level, bonus });
      } else if (type === "ring2") {
        this.equipRing2(item, level, bonus);
        this.databaseHandler.equipRing2({ name: this.name, item, level, bonus });
      }
    } else if (["amulet"].includes(type)) {
      this.equipAmulet(item, level, bonus);
      this.databaseHandler.equipAmulet({ name: this.name, item, level, bonus });
    } else if (["belt"].includes(type)) {
      this.databaseHandler.equipBelt(this.name, item, level, bonus);
      this.equipBelt(item, level, bonus);
    } else if (item && level) {
      const kind = Types.getKindFromString(item);

      console.debug(this.name + " equips " + item);

      if (Types.isArmor(kind)) {
        this.databaseHandler.equipArmor(this.name, item, level, bonus);
        this.equipArmor(item, kind, level, bonus);
      } else if (Types.isWeapon(kind)) {
        this.databaseHandler.equipWeapon(this.name, item, level, bonus);
        this.equipWeapon(item, kind, level, bonus);
      }
    }

    this.calculateBonus();
    this.calculateSetBonus();
    this.updateHitPoints();
    this.sendPlayerStats();
  }

  calculateSetBonus() {
    let bonus = null;
    let set = null;
    if (
      this.armorKind === Types.Entities.FROZENARMOR &&
      this.belt === "beltfrozen" &&
      this.weaponKind === Types.Entities.FROZENSWORD
    ) {
      set = "Frozen";
      bonus = Types.setBonus.frozen;
    } else if (
      this.armorKind === Types.Entities.DIAMONDARMOR &&
      this.belt === "beltdiamond" &&
      this.weaponKind === Types.Entities.DIAMONDSWORD
    ) {
      set = "Diamond";
      bonus = Types.setBonus.diamond;
    }

    if (bonus) {
      Object.entries(bonus).map(([type, stats]) => {
        this.bonus[type] += stats;
      });
    }

    this.send(new Messages.SetBonus(bonus, set).serialize());
  }

  addAura(aura) {
    const index = this.auras.indexOf(aura);
    if (index === -1) {
      this.auras.push(aura);
      this.broadcast(new Messages.Auras(this), false);
    }
  }

  removeAura(aura) {
    const index = this.auras.indexOf(aura);
    if (index > -1) {
      this.auras.splice(index, 1);
      this.broadcast(new Messages.Auras(this), false);
    }
  }

  updateHitPoints(reset?: boolean) {
    const maxHitPoints =
      Formulas.hp({
        armorLevel: Properties.getArmorLevel(this.armorKind),
        level: this.armorLevel,
        playerLevel: this.level,
        beltLevel: this.beltLevel,
      }) +
      this.bonus.health +
      this.bonus.highHealth;

    if (reset) {
      this.resetHitPoints(maxHitPoints);
    } else {
      this.updateMaxHitPoints(maxHitPoints);
    }
  }

  updatePosition() {
    if (this.requestpos_callback) {
      var pos = this.requestpos_callback();
      this.setPosition(pos.x, pos.y);
    }
  }

  onRequestPosition(callback) {
    this.requestpos_callback = callback;
  }

  resetTimeout() {
    clearTimeout(this.disconnectTimeout);
    // This account doesn't timeout
    if (this.account === NO_TIMEOUT_ACCOUNT) return;
    this.disconnectTimeout = setTimeout(this.timeout.bind(this), 1000 * 60 * 15); // 15 min.
  }

  timeout() {
    this.connection.sendUTF8("timeout");
    this.connection.close("Player was idle for too long");
  }

  sendPlayerStats() {
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
      attackDamage: this.bonus.attackDamage,
      flameDamage: this.bonus.flameDamage,
      lightningDamage: this.bonus.lightningDamage,
      pierceArmor: this.bonus.pierceArmor,
    });

    this.send(
      new Messages.Stats({
        maxHitPoints: this.maxHitPoints,
        damage: minDamage !== maxDamage ? `${minDamage}-${maxDamage}` : maxDamage,
        defense:
          minAbsorb !== maxAbsorb
            ? `${minAbsorb - this.bonus.absorbedDamage}-${maxAbsorb - this.bonus.absorbedDamage}`
            : maxAbsorb - this.bonus.absorbedDamage,
        absorb: this.bonus.absorbedDamage,
      }).serialize(),
    );
  }

  incExp(exp) {
    this.experience = this.experience + exp;
    this.databaseHandler.setExp(this.name, this.experience);
    var origLevel = this.level;
    this.level = Types.getLevel(this.experience);
    if (origLevel !== this.level) {
      this.updateHitPoints(true);
      this.sendPlayerStats();
      this.server.updatePopulation({ levelupPlayer: this.id });
    }
  }

  setGuildId(id) {
    if (typeof this.server.guilds[id] !== "undefined") {
      this.guildId = id;
    } else {
      console.error(this.id + " cannot add guild " + id + ", it does not exist");
    }
  }

  getGuild() {
    return this.hasGuild ? this.server.guilds[this.guildId] : undefined;
  }

  hasGuild() {
    return typeof this.guildId !== "undefined";
  }

  leaveGuild() {
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
  }

  checkName(name) {
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
  }

  sendWelcome({
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
    depositAccountIndex,
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
    self.depositAccountIndex = depositAccountIndex;
    self.inventory = inventory;
    self.stash = stash;
    self.hash = hash;
    self.hash1 = hash1;
    self.hasRequestedBossPayout = !!hash;
    self.hasRequestedNecromancerPayout = !!hash1;

    self.createdAt = createdAt;
    self.experience = exp;
    self.level = Types.getLevel(self.experience);
    self.orientation = randomOrientation();

    if (!x || !y) {
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
      self.server.cowLevelCoords,
    ]);

    self.calculateBonus();
    self.calculateSetBonus();
    self.updateHitPoints(true);
    self.sendPlayerStats();

    self.hasEnteredGame = true;
    self.isDead = false;

    // self.server.addPlayer(self, aGuildId);
  }
}

export default Player;