import * as _ from "lodash";

import { kinds, Types } from "../../shared/js/gametypes";
import Character from "./character";
import Chest from "./chest";
import { postMessageToDiscordChatChannel } from "./discord";
import FormatChecker from "./format";
import Formulas from "./formulas";
import Messages from "./message";
import { enqueueSendPayout } from "./payout";
import { PromiseQueue } from "./promise-queue";
import Properties from "./properties";
import { Sentry } from "./sentry";
import { purchase } from "./store/purchase";
import { store } from "./store/store";
import {
  getClassicMaxPayout,
  getClassicPayout,
  random,
  randomInt,
  randomOrientation,
  rawToRai,
  sanitize,
} from "./utils";

import type Party from "./party";
import type Trade from "./trade";
import type { Network } from "./types";

const MIN_LEVEL = 14;
const MIN_TIME = 1000 * 60 * 15;

let payoutIndex = 0;

// const NO_TIMEOUT_ACCOUNT = "3j6ht184dt4imk5na1oyduxrzc6otig1iydfdaa4sgszne88ehcdbtp3c5y3";
const NO_TIMEOUT_ACCOUNT = "3h3krxiab9zbn7ygg6zafzpfq7e6qp5i13od1esdjauogo6m8epqxmy7anix";

type GeneratedItem = {
  item: string;
  level?: number;
  quantity?: 1;
  bonus?: number[];
  skill?: number;
  isUnique?: boolean;
};
class Player extends Character {
  id: number;
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
  set: null;
  inventory: any[];
  inventoryCount: any[];
  achievement: any[];
  hasRequestedBossPayout: boolean;
  expansion1: boolean;
  depositAccount: any;
  chatBanEndTime: number;
  hash: string;
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
  cape: string;
  capeKind: number;
  capeLevel: number;
  capeBonus: number[] | null;
  capeHue: number;
  capeSaturate: number;
  capeContrast: number;
  capeBrightness: number;
  shield: string;
  shieldLevel: number;
  shieldBonus: number[] | null;
  shieldSkill: number;
  shieldSkillTimeout: NodeJS.Timeout;
  shieldSkillDefenseTimeout: NodeJS.Timeout;
  firefoxpotionTimeout: any;
  createdAt: number;
  waypoints: any;
  group: any;
  bonus: any;
  partyBonus: any;
  armorKind: number;
  weaponKind: number;
  shieldKind: number;
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
  depositAccountIndex: number;
  stash: any;
  databaseHandler: any;
  partyId?: number;
  tradeId?: number;
  freezeChanceLevel: number;
  minotaurDamage: number;
  isPasswordRequired: boolean;
  isPasswordValid: boolean;
  network: Network;
  nanoPotions: number;
  skill: { defense: number; curseAttack: number };
  dbWriteQueue: any;

  constructor(connection, worldServer, databaseHandler) {
    //@ts-ignore
    super(connection.id, "player", Types.Entities.WARRIOR);

    var self = this;

    purchase["nano"].databaseHandler = databaseHandler;
    purchase["ban"].databaseHandler = databaseHandler;
    this.databaseHandler = databaseHandler;

    this.server = worldServer;
    this.connection = connection;

    this.hasEnteredGame = false;
    this.isDead = false;
    this.network = null;
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
    this.freezeChanceLevel = 0;
    this.minotaurDamage = 0;

    // Item bonuses (Rings, amulet, Uniques?)
    this.resetBonus();
    this.resetPartyBonus();
    this.resetSkill();

    this.inventory = [];
    this.inventoryCount = [];
    this.achievement = [];
    this.hasRequestedBossPayout = false;

    this.expansion1 = false;
    this.depositAccount = null;

    this.chatBanEndTime = 0;
    this.hash = null;

    this.dbWriteQueue = new PromiseQueue();

    this.connection.listen(async message => {
      const action = parseInt(message[0]);

      console.debug("Received: " + message);
      if (!this.formatChecker.check(message)) {
        Sentry.captureException(new Error("FormatChecker failed"), {
          user: {
            username: self.name,
          },
          extra: { message, action },
        });
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

        let timestamp;
        let reason;
        var name = sanitize(message[1]);
        var account = sanitize(message[2]);
        var [network]: [Network] = account.split("_");
        var password;

        ({ timestamp, reason } = await databaseHandler.checkIsBannedByIP(self));
        if (timestamp && reason) {
          const days = timestamp > Date.now() + 24 * 60 * 60 * 1000 ? 365 : 1;

          self.connection.sendUTF8(`banned-${reason}-${days}`);
          self.connection.close("You are banned, no cheating.");
          return;
        }

        ({ timestamp, reason } = await databaseHandler.checkIsBannedForReason(name));
        if (timestamp && reason) {
          const days = timestamp > Date.now() + 24 * 60 * 60 * 1000 ? 365 : 1;

          self.connection.sendUTF8(`banned-${reason}-${days}`);
          self.connection.close("You are banned, no misbehaving.");
          return;
        }

        if (!["nano", "ban"].includes(network)) {
          self.connection.sendUTF8("invalidconnection");
          self.connection.close("Bad network.");
          return;
        }
        // var network: Network = sanitize(message[3]) === "ban" ? "ban" : "nano";

        if (action === Types.Messages.LOGIN) {
          password = sanitize(message[3]);
        }

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
        self.network = network;

        // @TODO rate-limit player creation
        if (action === Types.Messages.CREATE) {
          console.info("CREATE: " + self.name);
          // self.account = hash;
          databaseHandler.createPlayer(self);
        } else {
          console.info("LOGIN: " + self.name, " ID: " + self.id);
          if (self.server.loggedInPlayer(self.name)) {
            self.connection.sendUTF8("loggedin");
            self.connection.close("Already logged in " + self.name);
            return;
          }

          if (!password) {
            if (await databaseHandler.passwordIsRequired(self)) {
              return;
            }
          } else {
            if (!(await databaseHandler.passwordLoginOrCreate(self, password))) {
              return;
            }
          }

          databaseHandler.loadPlayer(self);
        }
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
          msg = msg.substr(0, 255); // Enforce maxLength of chat input

          const admins = ["running-coder", "oldschooler", "Baikie", "Phet", "CallMeCas"];

          if (msg.startsWith("/") && admins.includes(self.name)) {
            if (msg === "/cow" && self.name === "running-coder") {
              if (!self.server.cowLevelClock) {
                self.server.startCowLevel();
                self.broadcast(new Messages.AnvilRecipe("cowLevel"), false);
              }
              return;
            } else if (msg === "/minotaur" && self.name === "running-coder") {
              if (!self.server.minotaurLevelClock && !self.server.minotaurSpawnTimeout) {
                self.server.startMinotaurLevel();
                self.broadcast(new Messages.AnvilRecipe("minotaurLevel"), false);
              }
              return;
            } else if (msg.startsWith("/ban")) {
              const periods = { 1: 86400, 365: 86400 * 365 };
              const reasons = ["misbehaved"];

              const [, period, reason, playerName] = msg.match(/\s(\w+)\s(\w+)\s(.+)/);

              if (periods[period] && reasons.includes(reason) && playerName) {
                self.databaseHandler.banPlayerForReason(playerName, period, reason);
                self.databaseHandler.banPlayerByIP(
                  self.server.getPlayerByName(playerName),
                  reason,
                  "Misbehaved towards others",
                );

                self.server.disconnectPlayer(playerName);
                self.send(
                  new Messages.Chat(
                    {},
                    `You banned ${playerName} for ${period} days, for ${reason} reason.`,
                    "event",
                  ).serialize(),
                );
              }
              return;
            } else if (msg.startsWith("/kick")) {
              const [, playerName] = msg.match(/\s(.+)/);

              self.server.disconnectPlayer(playerName);
              self.send(new Messages.Chat({}, `You kicked ${playerName}.`, "event").serialize());
              return;
            }
          }

          postMessageToDiscordChatChannel(`${self.name}: ${msg}`);

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

        if (mob?.type === "mob" || mob?.type === "player") {
          let isCritical = false;

          let resistances: {
            magicDamage?: number;
            flameDamage?: number;
            lightningDamage?: number;
            coldDamage?: number;
            physicalDamage?: number;
          } = { magicDamage: 0, flameDamage: 0, lightningDamage: 0, coldDamage: 0, physicalDamage: 0 };

          if (mob.type === "mob") {
            resistances = Object.assign(resistances, Types.resistances[mob.kind] || {});
          } else if (mob.type === "player") {
            resistances = {
              magicDamage: mob.bonus.magicResistance,
              flameDamage: mob.bonus.flameResistance,
              lightningDamage: mob.bonus.lightningResistance,
              coldDamage: mob.bonus.coldResistance,
            };
          }

          let dmg = Formulas.dmg({
            weapon: self.weapon,
            weaponLevel: self.weaponLevel,
            playerLevel: self.level,
            minDamage: self.bonus.minDamage + self.partyBonus.minDamage,
            maxDamage: self.bonus.maxDamage + self.partyBonus.maxDamage,
            magicDamage: Math.round(
              (self.bonus.magicDamage + self.partyBonus.magicDamage) * (Math.abs(resistances.magicDamage - 100) / 100),
            ),
            attackDamage: resistances.physicalDamage ? 0 : self.bonus.attackDamage,
            drainLife: self.bonus.drainLife,
            flameDamage: Math.round(self.bonus.flameDamage * (Math.abs(resistances.flameDamage - 100) / 100)),
            lightningDamage: Math.round(
              self.bonus.lightningDamage * (Math.abs(resistances.lightningDamage - 100) / 100),
            ),
            coldDamage: Math.round(self.bonus.coldDamage * (Math.abs(resistances.coldDamage - 100) / 100)),
            pierceDamage: self.bonus.pierceDamage,
            partyAttackDamage: resistances.physicalDamage ? 0 : self.partyBonus.attackDamage,
            magicResistance: resistances.magicDamage,
          });

          if (self.bonus.criticalHit) {
            isCritical = random(100) < self.bonus.criticalHit;
            if (isCritical) {
              dmg = Math.ceil((dmg - self.bonus.drainLife) * 1.5);
            }
          }

          if (self.bonus.freezeChance && !Types.isBoss(mob.kind)) {
            const isFrozen = random(100) < self.bonus.freezeChance;
            if (isFrozen) {
              self.broadcast(new Messages.Frozen(mob.id, self.freezeChanceLevel));
            }
          }

          if (self.bonus.drainLife) {
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
          } else if (mob.kind === Types.Entities.COWKING || mob.kind === Types.Entities.MINOTAUR) {
            const adjustedDifficulty = self.server.getPlayersCountInBossRoom({
              x: 0,
              y: 464,
              w: 92,
              h: 71,
            });

            const percentReduce = Math.pow(0.8, adjustedDifficulty - 1);
            dmg = Math.floor(dmg * percentReduce);
          }

          if (mob.kind === Types.Entities.MINOTAUR) {
            self.minotaurDamage += dmg;
            self.unregisterMinotaurDamage();
          }

          let defense = 0;
          let isBlocked = false;

          if (mob.type === "mob") {
            defense = Formulas.mobDefense({ armorLevel: mob.armorLevel });

            dmg = defense > dmg ? 0 : dmg - defense;

            // Minimum Hit dmg (can't be 0)
            if (!dmg) {
              dmg = randomInt(3, 5);
            }
          } else if (mob.type === "player") {
            ({ dmg, isBlocked } = mob.handleHurtDmg(this, dmg));
          }

          if (mob?.type === "mob" && mob?.receiveDamage) {
            mob.receiveDamage(dmg);
            self.server.handleMobHate(mob.id, self.id, dmg);
          }

          self.server.handleHurtEntity({ entity: mob, attacker: self, dmg, isCritical, isBlocked });

          if (mob.hitPoints <= 0) {
            mob.isDead = true;

            if (mob?.type) {
              postMessageToDiscordChatChannel(`${self.name} killed ${mob.name} 💀`);
            }
          }
        }
      } else if (action === Types.Messages.HURT) {
        console.info("HURT: " + self.name + " " + message[1]);
        var mob = self.server.getEntityById(message[1]);
        if (mob && self.hitPoints > 0) {
          let dmg = Formulas.dmgFromMob({
            weaponLevel: mob.weaponLevel,
          });

          self.handleHurtDmg(mob, dmg);
        }
      } else if (action === Types.Messages.LOOT) {
        console.info("LOOT: " + self.name + " " + message[1]);
        var item = self.server.getEntityById(message[1]);

        if (item) {
          if (item.partyId) {
            // Allow looting if party only has 1 member
            if ((self.server.getParty(item.partyId)?.members.length || 0) > 1 && self.partyId !== item.partyId) {
              self.connection.send({
                type: Types.Messages.NOTIFICATION,
                message: "Can't loot item, it belongs to a party.",
              });
              return;
            }
          }

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
            } else if (kind === Types.Entities.FIREFOXPOTION) {
              self.updateHitPoints(true);
              self.broadcast(self.equip({ kind: Types.Entities.FIREFOX, level: 1 }));
              self.firefoxpotionTimeout = setTimeout(function () {
                self.broadcast(
                  self.equip({ kind: self.armorKind, level: self.armorLevel, bonus: self.armorBonus, type: "armor" }),
                ); // return to normal after 10 sec
                self.firefoxpotionTimeout = null;
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
                case Types.Entities.BANANOPOTION:
                  amount = 200;
                  break;
                case Types.Entities.REJUVENATIONPOTION:
                  amount = Math.ceil(self.maxHitPoints / 3);
                  break;
              }

              if (
                (kind === Types.Entities.NANOPOTION || kind === Types.Entities.BANANOPOTION) &&
                self.nanoPotions < 5
              ) {
                self.nanoPotions += 1;
                databaseHandler.foundNanoPotion(self.name);
              }

              if (!self.hasFullHealth()) {
                self.regenHealthBy(amount);
                self.server.pushToPlayer(self, self.health());
              }
            } else {
              const { isUnique, ...generatedItem } = (self.generateItem({ kind }) || {}) as GeneratedItem;

              if (generatedItem) {
                let player = self;

                // Single items can't be party looted, like potions
                if (!Types.isSingle(kind) && self.partyId) {
                  player = self.server.getEntityById(self.getParty().getNextLootMemberId()) || self;
                }

                if (self.partyId) {
                  self.server.pushToParty(
                    self.getParty(),
                    new Messages.Party(Types.Messages.PARTY_ACTIONS.LOOT, [
                      { playerName: player.name, kind, isUnique },
                    ]),
                  );
                }

                if (Types.isSuperUnique(generatedItem.item)) {
                  postMessageToDiscordChatChannel(`${player.name} picked up ${kinds[generatedItem.item][2]} 💍`);
                }

                this.databaseHandler.lootItems({
                  player,
                  items: [generatedItem],
                });
              }
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

          self.zone_callback();

          // @NOTE Make sure every mobs disengage
          self.server.handlePlayerVanish(self);
          // self.server.pushRelevantEntityListTo(self);

          if (x === 34 && y === 498) {
            self.send(new Messages.MinotaurLevelInProgress(self.server.minotaurLevelClock).serialize());
          } else if (y >= 464 && y <= 535) {
            self.send(new Messages.CowLevelInProgress(self.server.cowLevelClock).serialize());
          }
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
        const isClassicPayout = message[1] && message[1] === Types.Entities.BOSS;

        if (isClassicPayout && self.hasRequestedBossPayout) {
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
          databaseHandler.banPlayerByIP(self, "cheating", reason);
        }
        {
          self.connection.send({
            type: Types.Messages.NOTIFICATION,
            message: "Payout is being sent!",
          });

          let amount;
          let maxAmount;
          if (isClassicPayout) {
            self.hasRequestedBossPayout = true;
            amount = getClassicPayout(self.achievement.slice(0, 24), self.network);
            maxAmount = getClassicMaxPayout(self.network);
          }

          const raiPayoutAmount = rawToRai(amount, self.network);

          if (raiPayoutAmount > maxAmount) {
            databaseHandler.banPlayerByIP(
              self,
              "cheating",
              `Tried to withdraw ${raiPayoutAmount} but max is ${maxAmount} for quest of kind: ${message[1]}`,
            );
            return;
          }

          console.info("PAYOUT STARTED: " + self.name + " " + self.account + " " + raiPayoutAmount);
          payoutIndex += 1;
          const response =
            (await enqueueSendPayout({
              account: self.account,
              amount,
              payoutIndex,
              network: self.network,
            })) || {};
          const { err, message: msg, hash } = response as any;

          // If payout succeeds there will be a hash in the response!
          if (hash) {
            console.info(`PAYOUT COMPLETED: ${self.name} ${self.account} for quest of kind: ${message[1]}`);

            postMessageToDiscordChatChannel(
              `${self.name} killed the Skeleton King and received a payout of ${raiPayoutAmount} ${
                self.network === "nano" ? "XNO" : "BAN"
              } 🎉`,
            );

            if (isClassicPayout) {
              self.hash = hash;
              databaseHandler.setHash(self.name, hash);
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
          });

          self.server.updatePopulation();
        }
      } else if (action === Types.Messages.BAN_PLAYER) {
        // Just don't...
        databaseHandler.banPlayerByIP(self, "cheating", message[1]);
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

        databaseHandler.moveItem({ player: self, fromSlot: message[1], toSlot: message[2], quantity: message[3] });
      } else if (action === Types.Messages.MOVE_ITEMS_TO_INVENTORY) {
        const panel = message[1];
        console.info(`MOVE ITEMS TO INVENTORY: ${self.name} Panel: ${panel}`);

        if (["upgrade", "trade"].includes(panel)) {
          databaseHandler.moveItemsToInventory(self, panel);
        }
      } else if (action === Types.Messages.MOVE_TRADE_ITEMS_TO_INVENTORY) {
        console.info("MOVE TRADE ITEMS TO INVENTORY: " + self.name);

        databaseHandler.moveItemsToInventory(self, "trade");
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
          purchase[self.network].create({ player: self, account: self.depositAccount, id: message[1] });
        }
      } else if (action === Types.Messages.PURCHASE_CANCEL) {
        console.info("PURCHASE_CANCEL: " + self.name + " " + message[1]);

        purchase[self.network].cancel(message[1]);
      } else if (action === Types.Messages.STORE_ITEMS) {
        console.info("STORE_ITEMS");

        const items = store.getItems();
        self.send([Types.Messages.STORE_ITEMS, items]);
      } else if (action === Types.Messages.PARTY) {
        let isWorldPartyUpdate = false;

        if (message[1] === Types.Messages.PARTY_ACTIONS.CREATE) {
          if (!self.partyId) {
            self.server.partyCreate(self);
            isWorldPartyUpdate = true;
          } else {
            self.send(
              new Messages.Party(
                Types.Messages.PARTY_ACTIONS.ERROR,
                "Leave current party to create a party",
              ).serialize(),
            );
          }
        } else if (message[1] === Types.Messages.PARTY_ACTIONS.JOIN) {
          const party = self.server.parties[message[2]];

          if (!party) {
            self.send(
              new Messages.Party(Types.Messages.PARTY_ACTIONS.ERROR, `There is no party id ${message[2]}`).serialize(),
            );
          } else {
            party.addMember(self);
            isWorldPartyUpdate = true;
          }
        } else if (message[1] === Types.Messages.PARTY_ACTIONS.REFUSE) {
          const party = self.server.parties[message[2]];

          if (!party) {
            self.send(
              new Messages.Party(Types.Messages.PARTY_ACTIONS.ERROR, `There is no party id ${message[2]}`).serialize(),
            );
          } else {
            party.refuse(self);
          }
        } else if (message[1] === Types.Messages.PARTY_ACTIONS.INVITE) {
          const party = self.getParty();

          if (!party) {
            self.send(
              new Messages.Party(
                Types.Messages.PARTY_ACTIONS.ERROR,
                "You need to be in a party to invite other players",
              ).serialize(),
            );
          } else if (party.partyLeader.id !== self.id) {
            self.send(
              new Messages.Party(
                Types.Messages.PARTY_ACTIONS.ERROR,
                "Only the party leader can invite other players",
              ).serialize(),
            );
          } else {
            const playerToInvite = self.server.getPlayerByName(message[2]);

            if (!playerToInvite) {
              self.send(
                new Messages.Party(Types.Messages.PARTY_ACTIONS.ERROR, `${message[2]} is not online`).serialize(),
              );
            } else if (playerToInvite.partyId) {
              self.send(
                new Messages.Party(
                  Types.Messages.PARTY_ACTIONS.ERROR,
                  `${playerToInvite.name} is already in a party`,
                ).serialize(),
              );
            } else if (party.sentInvites[playerToInvite.id]) {
              self.send(
                new Messages.Party(
                  Types.Messages.PARTY_ACTIONS.ERROR,
                  `${playerToInvite.name} is already invited`,
                ).serialize(),
              );
            } else {
              party.invite(playerToInvite);
              self.send(
                new Messages.Party(
                  Types.Messages.PARTY_ACTIONS.INFO,
                  `Party invite sent to ${playerToInvite.name}`,
                ).serialize(),
              );
              isWorldPartyUpdate = true;
            }
          }
        } else if (message[1] === Types.Messages.PARTY_ACTIONS.LEAVE) {
          self.getParty()?.removeMember(self);
          isWorldPartyUpdate = true;
        } else if (message[1] === Types.Messages.PARTY_ACTIONS.REMOVE) {
          if (self.id === self.getParty()?.partyLeader.id) {
            const playerToRemove = self.server.getPlayerByName(message[2]);
            if (!playerToRemove) {
              self.send(
                new Messages.Party(Types.Messages.PARTY_ACTIONS.ERROR, `${message[2]} is not online`).serialize(),
              );
            } else if (playerToRemove.partyId !== self.partyId) {
              self.send(
                new Messages.Party(
                  Types.Messages.PARTY_ACTIONS.ERROR,
                  `${playerToRemove.name} is not in the party`,
                ).serialize(),
              );
            } else {
              self.getParty().removeMember(playerToRemove);
              isWorldPartyUpdate = true;
            }
          } else {
            self.send(
              new Messages.Party(
                Types.Messages.PARTY_ACTIONS.ERROR,
                `Only the party leader can remove a player from the party`,
              ).serialize(),
            );
          }
        } else if (message[1] === Types.Messages.PARTY_ACTIONS.DISBAND) {
          if (self.id === self.getParty()?.partyLeader.id) {
            self.getParty().disband();
            isWorldPartyUpdate = true;
          } else {
            self.send(
              new Messages.Party(
                Types.Messages.PARTY_ACTIONS.ERROR,
                `Only the party leader can disband the party`,
              ).serialize(),
            );
          }
        }

        if (isWorldPartyUpdate) {
          self.server.updatePopulation();
        }
      } else if (action === Types.Messages.TRADE) {
        if (message[1] === Types.Messages.TRADE_ACTIONS.REQUEST_SEND) {
          const playerToTradeWith = self.server.getPlayerByName(message[2]);

          if (!playerToTradeWith) {
            self.send(
              new Messages.Trade(Types.Messages.TRADE_ACTIONS.ERROR, `${message[2]} is not online`).serialize(),
            );
          } else if (playerToTradeWith.hasTrade()) {
            self.send(
              new Messages.Trade(
                Types.Messages.TRADE_ACTIONS.ERROR,
                `${message[2]} is already trading with another player`,
              ).serialize(),
            );
          } else if (self.hasTrade()) {
            self.send(
              new Messages.Trade(
                Types.Messages.TRADE_ACTIONS.ERROR,
                `You are already trading with a player`,
              ).serialize(),
            );
          } else {
            self.send(
              new Messages.Trade(Types.Messages.TRADE_ACTIONS.INFO, `Trade request sent to ${message[2]}`).serialize(),
            );

            playerToTradeWith.send(
              new Messages.Trade(Types.Messages.TRADE_ACTIONS.REQUEST_RECEIVE, self.name).serialize(),
            );
          }
        } else if (message[1] === Types.Messages.TRADE_ACTIONS.REQUEST_REFUSE) {
          const playerToTradeWith = self.server.getPlayerByName(message[2]);

          if (playerToTradeWith) {
            playerToTradeWith.send(
              new Messages.Trade(
                Types.Messages.TRADE_ACTIONS.INFO,
                `${self.name} declined the trade request`,
              ).serialize(),
            );
          }
        } else if (message[1] === Types.Messages.TRADE_ACTIONS.REQUEST_ACCEPT) {
          const playerToTradeWith = self.server.getPlayerByName(message[2]);

          if (playerToTradeWith) {
            playerToTradeWith.send(
              new Messages.Trade(
                Types.Messages.TRADE_ACTIONS.INFO,
                `${self.name} accepted the trade request`,
              ).serialize(),
            );

            self.server.tradeCreate(playerToTradeWith.id, self.id);
          }
        } else if (message[1] === Types.Messages.TRADE_ACTIONS.CLOSE) {
          self.server.trades[self.tradeId]?.close({ playerName: self.name });
        } else if (message[1] === Types.Messages.TRADE_ACTIONS.PLAYER1_STATUS) {
          self.server.trades[self.tradeId]?.status({ player1Id: self.id, isAccepted: message[2] });
        }
      } else if (action === Types.Messages.SETTINGS) {
        const settings = message[1];

        if (settings) {
          if (settings.capeHue) {
            this.capeHue = settings.capeHue;
          }
          if (settings.capeSaturate) {
            this.capeSaturate = settings.capeSaturate;
          }
          if (settings.capeContrast) {
            this.capeContrast = settings.capeContrast;
          }
          if (settings.capeBrightness) {
            this.capeBrightness = settings.capeBrightness;
          }

          this.databaseHandler.setSettings(this.name, settings);
          this.broadcast(new Messages.Settings(this, settings), false);
        }
      } else if (action === Types.Messages.SKILL) {
        const skill = message[1];
        let isBroadcasted = false;
        let level: number;

        // @NOTE Hardcode shieldSkill for now..
        if (skill === this.shieldSkill && !this.shieldSkillTimeout) {
          isBroadcasted = true;
          level = this.shieldLevel;

          if (this.shieldSkill === 0) {
            if (!self.hasFullHealth()) {
              const { stats: percent } = Types.getSkill(0, this.shieldLevel);

              let healAmount = Math.round((percent / 100) * this.maxHitPoints);
              let healthDiff = this.maxHitPoints - this.hitPoints;
              if (healthDiff < healAmount) {
                healAmount = healthDiff;
              }

              self.regenHealthBy(healAmount);
              self.server.pushToPlayer(self, self.health());
            }
          } else if (this.shieldSkill === 1) {
            const { stats: percent } = Types.getSkill(0, this.shieldLevel);

            self.skill.defense = percent;
            self.sendPlayerStats();
            self.shieldSkillDefenseTimeout = setTimeout(() => {
              self.skill.defense = 0;
              self.sendPlayerStats();
              self.shieldSkillDefenseTimeout = null;
            }, Types.skillDurationMap[this.shieldSkill](this.shieldLevel));
          }

          self.shieldSkillTimeout = setTimeout(() => {
            self.shieldSkillTimeout = null;
          }, Types.skillDelay[this.shieldSkill]);

          if (isBroadcasted) {
            self.broadcast(new Messages.Skill(this, skill, level), false);
          }
        }
      } else {
        if (self.message_callback) {
          self.message_callback(message);
        }
      }
    });

    this.connection.onClose(function () {
      if (self.firefoxpotionTimeout) {
        clearTimeout(self.firefoxpotionTimeout);
      }
      clearTimeout(self.disconnectTimeout);
      if (self.exit_callback) {
        self.exit_callback();
      }
    });

    this.connection.sendUTF8("go"); // Notify client that the HELLO/WELCOME handshake can start
  }

  unregisterMinotaurDamage = _.debounce(() => {
    this.minotaurDamage = 0;
  }, 30000);

  generateRandomCapeBonus(uniqueChances = 1) {
    const randomIsUnique = random(100);
    const isUnique = randomIsUnique < uniqueChances;

    const baseBonus = [0, 1, 2];
    const uniqueBonus = [3, 4, 5, 6];

    return _.shuffle(baseBonus)
      .slice(0, 1)
      .concat(isUnique ? _.shuffle(uniqueBonus).slice(0, 1) : []);
  }

  generateItem({ kind, uniqueChances = 1 }): GeneratedItem {
    let isUnique = false;
    let item;

    if (Types.isArmor(kind) || Types.isWeapon(kind) || Types.isBelt(kind) || Types.isShield(kind)) {
      const randomIsUnique = random(100);
      isUnique = randomIsUnique < uniqueChances;

      const baseLevel = Types.getBaseLevel(kind);
      const level = baseLevel <= 5 && !isUnique ? randomInt(1, 3) : 1;
      let bonus = null;
      let skill = null;

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

      if (Types.isShield(kind) && kind >= Types.Entities.SHIELDGOLDEN) {
        const resistanceBonus = [21, 22, 23, 24];
        const shieldSkill = [0, 1];
        bonus = _.shuffle(resistanceBonus)
          .slice(0, isUnique ? 2 : 1)
          .sort();
        skill = _.shuffle(shieldSkill).slice(0, 1);
      }

      item = { item: Types.getKindAsString(kind), level, bonus: bonus ? JSON.stringify(bonus) : null, skill, isUnique };
    } else if (Types.isScroll(kind) || Types.isSingle(kind) || Types.isChest(kind)) {
      item = { item: Types.getKindAsString(kind), quantity: 1 };
    } else if (Types.isCape(kind)) {
      const bonus = this.generateRandomCapeBonus(uniqueChances);

      item = { item: Types.getKindAsString(kind), level: 1, bonus: JSON.stringify(bonus.sort((a, b) => a - b)) };
    } else if (Types.isRing(kind) || Types.isAmulet(kind)) {
      const randomIsUnique = random(100);
      isUnique = randomIsUnique < uniqueChances;

      const lowLevelBonus = [0, 1, 2, 3];
      const mediumLevelBonus = [0, 1, 2, 3, 4, 5];
      const highLevelBonus = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const amuletHighLevelBonus = [9, 10];
      const drainLifeBonus = [13];
      const fireDamageBonus = [14];
      const lightningDamageBonus = [15];
      const pierceDamageBonus = [16];
      const highHealthBonus = [17];
      const coldDamageBonus = [18];
      const freezeChanceBonus = [19];
      const reduceFrozenChanceBonus = [20];

      let bonus = [];
      if (kind === Types.Entities.RINGBRONZE) {
        bonus = _.shuffle(lowLevelBonus).slice(0, isUnique ? 2 : 1);
      } else if (kind === Types.Entities.RINGSILVER || kind === Types.Entities.AMULETSILVER) {
        bonus = _.shuffle(mediumLevelBonus).slice(0, isUnique ? 3 : 2);
      } else if (kind === Types.Entities.RINGGOLD) {
        bonus = _.shuffle(highLevelBonus).slice(0, isUnique ? 4 : 3);
      } else if (kind === Types.Entities.AMULETGOLD) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, isUnique ? 3 : 2)
          .concat(_.shuffle(amuletHighLevelBonus).slice(0, 1));
      } else if (kind === Types.Entities.RINGNECROMANCER) {
        bonus = _.shuffle(highLevelBonus).slice(0, 3).concat(drainLifeBonus);
      } else if (kind === Types.Entities.AMULETCOW) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(_.shuffle(amuletHighLevelBonus).slice(0, 1))
          .concat(_.shuffle([...fireDamageBonus, ...lightningDamageBonus, ...pierceDamageBonus]).slice(0, 1));
      } else if (kind === Types.Entities.AMULETFROZEN) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(_.shuffle(amuletHighLevelBonus).slice(0, 1))
          .concat(coldDamageBonus)
          .concat(freezeChanceBonus)
          .concat(reduceFrozenChanceBonus);
      } else if (kind === Types.Entities.RINGRAISTONE) {
        bonus = _.shuffle(highLevelBonus).slice(0, 3).concat(lightningDamageBonus);
      } else if (kind === Types.Entities.RINGFOUNTAIN) {
        bonus = _.shuffle([5, 6])
          .slice(0, 2)
          .concat([8, ...highHealthBonus]);
      } else if (kind === Types.Entities.RINGMINOTAUR) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat([...coldDamageBonus, ...freezeChanceBonus]);
      }

      item = { item: Types.getKindAsString(kind), level: 1, bonus: JSON.stringify(bonus.sort((a, b) => a - b)) };
    }

    return item;
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
      this.partyId,
      [this.cape, this.capeLevel, this.capeBonus].filter(Boolean).join(":"),
      [this.shield, this.shieldLevel, this.shieldBonus].filter(Boolean).join(":"),
      {
        capeHue: this.capeHue,
        capeSaturate: this.capeSaturate,
        capeContrast: this.capeContrast,
        capeBrightness: this.capeBrightness,
      },
    ];

    return basestate.concat(state);
  }

  handleHurtDmg(mob, dmg: number) {
    let isBlocked = false;
    let lightningDamage = 0;

    let defense = Formulas.playerDefense({
      armor: this.armor,
      armorLevel: this.armorLevel,
      belt: this.belt,
      beltLevel: this.beltLevel,
      isUniqueBelt: !!this.beltBonus,
      playerLevel: this.level,
      defense: this.bonus.defense,
      absorbedDamage: this.bonus.absorbedDamage,
      partyDefense: this.partyBonus.defense,
      cape: this.cape,
      capeLevel: this.capeLevel,
      shield: this.shield,
      shieldLevel: this.shieldLevel,
      isUniqueShield: this.shieldBonus?.length >= 2,
      skillDefense: this.skill.defense,
    });

    dmg = defense > dmg ? 0 : dmg - defense;

    // Minimum Hurt dmg (can't be 0)
    if (!dmg) {
      dmg = randomInt(3, 5);
    }

    if (this.bonus.blockChance) {
      isBlocked = random(100) < this.bonus.blockChance;
      if (isBlocked) {
        dmg = 0;
      }
    }

    if (this.bonus.lightningDamage && !Types.resistances[mob.kind]?.lightningDamage) {
      lightningDamage = this.bonus.lightningDamage;

      if (mob.type === "mob") {
        mob.receiveDamage(lightningDamage, this.id);
      } else if (mob.type === "player") {
        mob.hitPoints -= lightningDamage;
      }
      this.server.handleHurtEntity({ entity: mob, attacker: this, dmg: lightningDamage });
    }

    if (mob.kind === Types.isBoss(mob.kind)) {
      // Each boss gets a 15% crit chance
      if (random(100) < 15) {
        dmg = Math.ceil(dmg * 1.5);
      }
    }

    if (!isBlocked && mob.kind === Types.Entities.MINOTAUR) {
      const isFrozen = random(100) < 20;
      if (isFrozen) {
        if (random(100) > this.bonus.reduceFrozenChance) {
          this.broadcast(new Messages.Frozen(this.id, 10));
        }
      }
    }

    this.hitPoints -= dmg;
    this.server.handleHurtEntity({ entity: this, attacker: mob, isBlocked });

    if (this.hitPoints <= 0) {
      this.isDead = true;

      if (this.shieldSkillTimeout) {
        clearTimeout(this.shieldSkillTimeout);
        this.shieldSkillTimeout = null;
      }
      if (this.shieldSkillDefenseTimeout) {
        this.skill.defense = 0;
        clearTimeout(this.shieldSkillDefenseTimeout);
        this.shieldSkillDefenseTimeout = null;
      }
      if (this.firefoxpotionTimeout) {
        clearTimeout(this.firefoxpotionTimeout);
        this.firefoxpotionTimeout = null;
      }
    }

    return { dmg, isBlocked };
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

  equip({
    kind,
    level,
    bonus,
    skill,
    type,
  }: {
    kind: number;
    level: number;
    bonus?: number[];
    skill?: number;
    type?: string;
  }) {
    return new Messages.EquipItem(this, { kind, level, bonus, skill, type });
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

  equipCape(cape, kind, level, bonus) {
    this.cape = cape;
    this.capeKind = kind;
    this.capeLevel = level;
    this.capeBonus = bonus ? JSON.parse(bonus) : null;
  }

  equipShield(shield, kind, level, bonus, skill) {
    this.shield = shield;
    this.shieldKind = kind;
    this.shieldLevel = level;
    this.shieldBonus = bonus ? JSON.parse(bonus) : null;
    this.shieldSkill = skill ? parseInt(skill, 0) : null;
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
    let hasFreezeAura = false;
    this.freezeChanceLevel = 0;

    if (this.bonus.drainLife) {
      hasDrainLifeAura = true;
    }
    if (this.bonus.lightningDamage) {
      hasThunderstormAura = true;
    }
    if (this.bonus.highHealth) {
      hasHighHealth = true;
    }
    if (this.bonus.freezeChance) {
      hasFreezeAura = true;
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
        this.shieldBonus
          ? {
              level: this.shieldLevel,
              bonus: this.shieldBonus,
            }
          : null,
      ].filter(Boolean);

      bonusToCalculate.forEach(({ bonus, level }) => {
        Types.getBonus(bonus, level).forEach(({ type, stats }) => {
          if (type === "freezeChance" && level > this.freezeChanceLevel) {
            this.freezeChanceLevel = level;
          }
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

      if (this.bonus.freezeChance) {
        this.addAura("freeze");
      } else if (hasFreezeAura && !this.bonus.freezeChance) {
        this.removeAura("freeze");
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

  calculatePartyBonus() {
    this.resetPartyBonus();

    if (this.cape && this.getParty()?.members.length >= 2) {
      Types.getPartyBonus(this.capeBonus, this.capeLevel).forEach(({ type, stats }) => {
        this.partyBonus[type] += stats;
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
      pierceDamage: 0,
      highHealth: 0,
      coldDamage: 0,
      freezeChance: 0,
      reduceFrozenChance: 0,
      //@TODO configure resistances (player hurt)
      magicResistance: 0,
      flameResistance: 0,
      lightningResistance: 0,
      coldResistance: 0,
    };
  }

  resetPartyBonus() {
    this.partyBonus = {
      attackDamage: 0,
      defense: 0,
      exp: 0,
      minDamage: 0,
      maxDamage: 0,
      health: 0,
      magicDamage: 0,
    };
  }

  resetSkill() {
    this.skill = {
      defense: 0,
      curseAttack: 0,
    };
  }

  equipItem({ item, level, bonus, skill, type }) {
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
    } else if (type === "amulet") {
      this.equipAmulet(item, level, bonus);
      this.databaseHandler.equipAmulet({ name: this.name, item, level, bonus });
    } else if (type === "belt") {
      this.databaseHandler.equipBelt(this.name, item, level, bonus);
      this.equipBelt(item, level, bonus);
    } else if (type === "cape") {
      const kind = Types.getKindFromString(item);
      this.databaseHandler.equipCape(this.name, item, level, bonus);
      this.equipCape(item, kind, level, bonus);
    } else if (type === "shield") {
      this.databaseHandler.equipShield(this.name, item, level, bonus, skill);
      this.equipShield(item, Types.getKindFromString(item), level, bonus, skill);
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
    this.calculatePartyBonus();
    this.updateHitPoints();
    this.sendPlayerStats();
  }

  calculateSetBonus() {
    let bonus = null;
    let set = null;

    ({ set, bonus } = Types.getSet({
      belt: this.belt,
      weaponKind: this.weaponKind,
      armorKind: this.armorKind,
      shieldKind: this.shieldKind,
      ring1: this.ring1,
      ring2: this.ring2,
    }));

    this.set = set;

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
    const isInParty = this.getParty()?.members.length >= 2;

    const maxHitPoints =
      Formulas.hp({
        armorLevel: Properties.getArmorLevel(this.armorKind),
        level: this.armorLevel,
        playerLevel: this.level,
        beltLevel: this.beltLevel,
        shieldLevel: this.shieldLevel,
      }) +
      this.bonus.health +
      this.bonus.highHealth +
      (isInParty ? this.partyBonus.health : 0);

    if (reset) {
      this.resetHitPoints(maxHitPoints);
    } else {
      this.updateMaxHitPoints(maxHitPoints);
    }

    if (this.hasParty()) {
      this.server.pushToParty(
        this.getParty(),
        new Messages.Party(Types.Messages.PARTY_ACTIONS.HEALTH, {
          id: this.id,
          hp: this.hitPoints,
          mHp: maxHitPoints,
        }),
      );
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
    if (this.account === `${this.network}_${NO_TIMEOUT_ACCOUNT}`) return;
    this.disconnectTimeout = setTimeout(this.timeout.bind(this), 1000 * 60 * 15); // 15 min.
  }

  timeout() {
    this.connection.sendUTF8("timeout");
    this.connection.close("Player was idle for too long");
  }

  sendPlayerStats() {
    const isInParty = this.getParty()?.members.length >= 2;

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
      cape: this.cape,
      capeLevel: this.capeLevel,
      shield: this.shield,
      shieldLevel: this.shieldLevel,
      isUniqueShield: this.shieldBonus?.length >= 2,
      partyDefense: isInParty ? this.partyBonus.defense : 0,
      skillDefense: this.skill.defense,
    });
    var { min: minDamage, max: maxDamage } = Formulas.minMaxDamage({
      weapon: this.weapon,
      weaponLevel: this.weaponLevel,
      playerLevel: this.level,
      minDamage: this.bonus.minDamage + (isInParty ? this.partyBonus.minDamage : 0),
      maxDamage: this.bonus.maxDamage + (isInParty ? this.partyBonus.maxDamage : 0),
      magicDamage: this.bonus.magicDamage + (isInParty ? this.partyBonus.magicDamage : 0),
      attackDamage: this.bonus.attackDamage,
      drainLife: this.bonus.drainLife,
      flameDamage: this.bonus.flameDamage,
      lightningDamage: this.bonus.lightningDamage,
      coldDamage: this.bonus.coldDamage,
      pierceDamage: this.bonus.pierceDamage,
      partyAttackDamage: isInParty ? this.partyBonus.attackDamage : 0,
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
    var originalLevel = this.level;
    this.level = Types.getLevel(this.experience);
    if (originalLevel !== this.level) {
      this.updateHitPoints(true);
      this.sendPlayerStats();
      this.server.updatePopulation({ levelupPlayer: this.id });
    }
  }

  hasParty() {
    return !!this.partyId;
  }

  hasTrade() {
    return !!this.tradeId;
  }

  getParty(): Party | undefined {
    return this.partyId ? this.server.parties[this.partyId] : undefined;
  }

  getTrade(): Trade | undefined {
    return this.tradeId ? this.server.trades[this.tradeId] : undefined;
  }

  setPartyId(partyId) {
    this.partyId = partyId;
  }

  setTradeId(tradeId) {
    this.tradeId = tradeId;
  }

  checkName(name) {
    if (!name?.trim()) return false;

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
    cape,
    shield,
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
    nanoPotions,
    gems,
    artifact,
    expansion1,
    waypoints,
    depositAccount,
    depositAccountIndex,
    settings,
    network,
  }) {
    var self = this;

    // @NOTE: Make sure the player has authenticated if he has the expansion
    if (self.isPasswordRequired && !self.isPasswordValid) {
      self.connection.sendUTF8("passwordinvalid");
      return;
    }

    // @NOTE: Leave no trace
    delete self.isPasswordRequired;
    delete self.isPasswordValid;

    const [playerArmor, playerArmorLevel = 1, playerArmorBonus] = armor.split(":");
    const [playerWeapon, playerWeaponLevel = 1, playerWeaponBonus] = weapon.split(":");

    self.kind = Types.Entities.WARRIOR;
    self.equipArmor(playerArmor, Types.getKindFromString(playerArmor), playerArmorLevel, playerArmorBonus);
    self.equipWeapon(playerWeapon, Types.getKindFromString(playerWeapon), playerWeaponLevel, playerWeaponBonus);

    if (belt) {
      const [playerBelt, playerBeltLevel, playerBeltBonus] = belt.split(":");
      self.equipBelt(playerBelt, playerBeltLevel, playerBeltBonus);
    }
    if (cape) {
      const [playerCape, playerCapeLevel, playerCapeBonus] = cape.split(":");
      self.equipCape(playerCape, Types.getKindFromString(playerCape), playerCapeLevel, playerCapeBonus);
    }
    if (shield) {
      const [playerShield, playerShieldLevel, playerShieldBonus, playerShieldSkill] = shield.split(":");
      self.equipShield(
        playerShield,
        Types.getKindFromString(playerShield),
        playerShieldLevel,
        playerShieldBonus,
        playerShieldSkill,
      );
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
    self.hasRequestedBossPayout = !!hash;
    self.capeHue = settings.capeHue;
    self.capeSaturate = settings.capeSaturate;
    self.capeContrast = settings.capeContrast;
    self.capeBrightness = settings.capeBrightness;

    self.createdAt = createdAt;
    self.experience = exp;
    self.level = Types.getLevel(self.experience);
    self.orientation = randomOrientation();
    self.network = network;
    self.nanoPotions = nanoPotions;

    if (!x || !y) {
      self.updatePosition();
    } else {
      self.setPosition(x, y);
    }

    self.chatBanEndTime = chatBanEndTime;

    self.server.addPlayer(self);
    self.server.enter_callback(self);

    const { members, partyLeader } = self.getParty() || {};

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
      cape,
      shield,
      ring1,
      ring2,
      amulet,
      self.experience,
      achievement,
      inventory,
      stash,
      hash,
      nanoPotions,
      gems,
      artifact,
      expansion1,
      waypoints,
      depositAccount,
      self.auras,
      self.server.cowLevelCoords,
      self.hasParty() ? { partyId: self.partyId, members, partyLeader } : null,
      settings,
      network,
    ]);

    self.calculateBonus();
    self.calculateSetBonus();
    self.calculatePartyBonus();
    self.updateHitPoints(true);
    self.sendPlayerStats();

    self.hasEnteredGame = true;
    self.isDead = false;
  }
}

export default Player;
