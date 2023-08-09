import * as _ from "lodash";

import { kinds, petKindToPetMap, Types } from "../../shared/js/gametypes";
import {
  ACHIEVEMENT_CRYSTAL_INDEX,
  ACHIEVEMENT_GRIMOIRE_INDEX,
  ACHIEVEMENT_HERO_INDEX,
  ACHIEVEMENT_NFT_INDEX,
  ACHIEVEMENT_OBELISK_INDEX,
  ACHIEVEMENT_WING_INDEX,
} from "../../shared/js/types/achievements";
import { curseDurationMap } from "../../shared/js/types/curse";
import { expForLevel } from "../../shared/js/types/experience";
import { isValidAccountAddress, toArray, toBoolean, toDb, toNumber, validateQuantity } from "../../shared/js/utils";
import Character from "./character";
import Chest from "./chest";
import { EmojiMap, postMessageToDiscordChatChannel, postMessageToDiscordEventChannel } from "./discord";
import FormatChecker from "./format";
import Formulas from "./formulas";
import Messages from "./message";
import Npc from "./npc";
import { enqueueSendPayout } from "./payout";
import Pet from "./pet";
import { PromiseQueue } from "./promise-queue";
import { Sentry } from "./sentry";
import { purchase } from "./store/purchase";
import { store } from "./store/store";
import {
  getClassicMaxPayout,
  getClassicPayout,
  getRandomAttackSkill,
  getRandomDefenseSkill,
  getRandomSockets,
  random,
  randomInt,
  randomOrientation,
  rawToRai,
  sanitize,
} from "./utils";

import type Party from "./party";
import type Trade from "./trade";

const MIN_LEVEL = 16;
const MIN_TIME = 1000 * 60 * 15;
const MAX_EXP = expForLevel[expForLevel.length - 1];

let payoutIndex = 0;

const ADMINS = ["running-coder", "oldschooler", "Baikie", "Phet", "CallMeCas", "HeroOfNano"];
const SUPER_ADMINS = ["running-coder"];
const CHATBAN_PATTERNS = [
  /n.?ig.?g.?(?:e.?r|a)/i,
  /https?:\/\/(:?www)?\.?youtube/i,
  /n.?e.?g.?e.?r.?/i,
  /fucker/i,
  /cunt/i,
  /whore/i,
  /asshole/i,
  /bitch/i,
];

class Player extends Character {
  id: number;
  server: any;
  connection: any;
  hasEnteredGame: boolean;
  isDead: boolean;
  haters: {};
  lastCheckpoint: any;
  formatChecker: any;
  bannedTime: number;
  banUseTime: number;
  experience: number;
  level: number;
  gold: number;
  goldStash: number;
  goldTrade: number;
  lastWorldChatMinutes: number;
  auras: Auras[];
  set: null;
  inventory: any[];
  inventoryCount: any[];
  achievement: any[];
  hasRequestedBossPayout: boolean;
  expansion1: boolean;
  expansion2: boolean;
  depositAccount: any;
  chatBanEndTime: number;
  hash: string;
  name: string;
  ip: string;
  account: any;
  move_callback: any;
  lootmove_callback: any;
  weapon: string;
  weaponKind: number;
  weaponLevel: number;
  weaponBonus: number[] | null;
  weaponSocket: number[] | null;
  isWeaponUnique: boolean;
  isWeaponSuperior: boolean;
  helm: string;
  helmKind: number;
  helmLevel: number;
  helmBonus: number[] | null;
  helmSocket: number[] | null;
  isHelmUnique: boolean;
  isHelmSuperior: boolean;
  armor: string;
  armorKind: number;
  armorLevel: number;
  armorBonus: number[] | null;
  armorSocket: number[] | null;
  isArmorUnique: boolean;
  isArmorSuperior: boolean;
  belt: string;
  beltLevel: number;
  beltBonus: number[] | null;
  isBeltUnique: boolean;
  isBeltSuperior: boolean;
  cape: string;
  capeKind: number;
  capeLevel: number;
  capeBonus: number[] | null;
  isCapeUnique: boolean;
  isCapeSuperior: boolean;
  capeHue: number;
  capeSaturate: number;
  capeContrast: number;
  capeBrightness: number;
  petEntity: Pet;
  pet: string;
  petKind: number;
  petLevel: number;
  petBonus: number[] | null;
  petSocket: number[] | null;
  petSkin: number;
  isPetUnique: boolean;
  isPetSuperior: boolean;
  pvp: boolean;
  shield: string;
  shieldKind: number;
  shieldLevel: number;
  shieldBonus: number[] | null;
  shieldSocket: number[] | null;
  isShieldUnique: boolean;
  isShieldSuperior: boolean;
  defenseSkill: number;
  defenseSkillTimeout: NodeJS.Timeout;
  defenseSkillDefenseTimeout: NodeJS.Timeout;
  defenseSkillResistancesTimeout: NodeJS.Timeout;
  attackSkill: number;
  attackSkillTimeout: NodeJS.Timeout;
  firefoxpotionTimeout: any;
  createdAt: number;
  waypoints: any;
  group: any;
  bonus: any;
  partyBonus: any;
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
  butcherDamage: number;
  deathAngelDamage: number;
  isPasswordRequired: boolean;
  isPasswordValid: boolean;
  network: Network;
  nanoPotions: number;
  skill: { defense: number; resistances: number };
  curse: { health: number; resistances: number };
  dbWriteQueue: any;
  poisonedInterval: any;
  cursedTimeout: NodeJS.Timeout;
  attackTimeout: NodeJS.Timeout;
  discordId: number;
  isHurtByTrap: boolean;
  // Achievement checks
  hasGrimoire: boolean;
  hasObelisk: boolean;
  hasNft: boolean;
  hasWing: boolean;
  hasCrystal: boolean;
  canChat: boolean;
  chatTimeout: any;
  // attackTimeoutWarning: boolean;
  checkHashInterval: any;
  lastHashCheckTimestamp: number;

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

    this.bannedTime = 0;
    this.banUseTime = 0;
    this.experience = 0;
    this.level = 0;
    this.lastWorldChatMinutes = 99;
    this.auras = [];
    this.freezeChanceLevel = 0;
    this.minotaurDamage = 0;
    this.butcherDamage = 0;
    this.deathAngelDamage = 0;

    // Item bonuses (Rings, amulet, Uniques?)
    this.resetBonus();
    this.resetPartyBonus();
    this.resetSkill();
    this.resetCurse();

    this.inventory = [];
    this.inventoryCount = [];
    this.achievement = [];
    this.hasRequestedBossPayout = false;

    this.expansion1 = false;
    this.expansion2 = false;
    this.depositAccount = null;

    this.chatBanEndTime = 0;
    this.hash = null;
    this.isHurtByTrap = false;
    this.hasGrimoire = false;
    this.hasObelisk = false;
    this.hasNft = false;
    this.hasWing = false;
    this.hasCrystal = false;
    // this.attackTimeoutWarning = false;

    // Get IP from CloudFlare
    this.ip = connection._connection.handshake.headers["cf-connecting-ip"];
    this.canChat = true;

    this.dbWriteQueue = new PromiseQueue();

    this.lastHashCheckTimestamp = Date.now();

    // NOTE: Client will be sending the hashed game function, if altered, player gets banned.

    this.connection.listen(async message => {
      const action = parseInt(message[0]);

      if (action === Types.Messages.BAN_PLAYER) {
        databaseHandler.banPlayerByIP({
          player: self,
          reason: "cheating",
          message: message[1] || "invalid websocket message",
        });
        return;
      }

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

      if (action === Types.Messages.CREATE || action === Types.Messages.LOGIN) {
        if (process.env.NODE_ENV === "production" && !self.ip) {
          self.connection.sendUTF8("invalidconnection");
          self.connection.close("Unable to get IP.");
          return;
        }

        let timestamp;
        let reason;
        var name = sanitize(message[1]);
        var account = sanitize(message[2]);
        var password = sanitize(message[3]);
        var [network]: [Network] = (account || "").split("_") || null;

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

        if (account && !isValidAccountAddress(account)) {
          self.connection.sendUTF8("invalidconnection");
          self.connection.close("Invalid Account.");
          return;
        }

        if (network && !["nano", "ban"].includes(network)) {
          self.connection.sendUTF8("invalidconnection");
          self.connection.close("Invalid Network.");
          return;
        }

        // Always ensure that the name is not longer than a maximum length.
        // (also enforced by the maxlength attribute of the name input element).
        self.name = name.substr(0, 16).trim();

        // Validate the username
        if (!self.checkName(self.name)) {
          self.connection.sendUTF8("invalidusername");
          self.connection.close("Invalid name " + self.name);
          return;
        }

        self.account = account;
        self.network = network;

        // @TODO rate-limit player creation
        if (action === Types.Messages.CREATE) {
          console.info("CREATE: " + self.name);
          // self.account = hash;

          if (await databaseHandler.isPlayerExist(self)) {
            return;
          }
        } else {
          console.info("LOGIN: " + self.name, " ID: " + self.id);
          if (self.server.loggedInPlayer(self.name)) {
            self.connection.sendUTF8("loggedin");
            self.connection.close("Already logged in " + self.name);
            return;
          }
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

        if (action === Types.Messages.CREATE) {
          databaseHandler.createPlayer(self);
        } else {
          databaseHandler.loadPlayer(self);
        }
      } else if (action === Types.Messages.ACCOUNT) {
        const newAccount = message[1];
        if (!self.account && isValidAccountAddress(newAccount)) {
          const [newNetwork] = newAccount.split("_");
          await self.databaseHandler.setAccount(self, newAccount, newNetwork);

          // Update the player's Nano/Ban logo
          self.server.updatePopulation();
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

        if (!self.achievement[20]) {
          if (self.chatTimeout) {
            self.send(
              new Messages.Party(
                Types.Messages.PARTY_ACTIONS.ERROR,
                `You can only send 1 message per 15 seconds until you beat the Skeleton King`,
              ).serialize(),
            );
            return;
          } else {
            self.chatTimeout = setTimeout(() => {
              self.chatTimeout = null;
            }, 15_000);
          }
        }

        if (!self.canChat) {
          self.send(new Messages.Party(Types.Messages.PARTY_ACTIONS.ERROR, `You are banned from chatting`).serialize());
          return;
        }

        if (CHATBAN_PATTERNS.some(pattern => pattern.test(msg))) {
          self.databaseHandler.chatBan({ player: self, message: msg });
          self.send(new Messages.Party(Types.Messages.PARTY_ACTIONS.ERROR, `You are banned from chatting`).serialize());
          self.canChat = false;
          return;
        }

        // Sanitized messages may become empty. No need to broadcast empty chat messages.
        if (msg && msg !== "") {
          msg = msg.substr(0, 255); // Enforce maxLength of chat input

          if (msg.startsWith("/") && ADMINS.includes(self.name)) {
            if (SUPER_ADMINS.includes(self.name)) {
              if (msg === "/cow") {
                if (!self.server.cowLevelClock) {
                  self.server.startCowLevel();
                  self.broadcast(new Messages.AnvilRecipe("cowLevel"), false);
                }
                return;
              } else if (msg === "/minotaur") {
                if (!self.server.minotaurLevelClock && !self.server.minotaurSpawnTimeout) {
                  self.server.startMinotaurLevel();
                  self.broadcast(new Messages.AnvilRecipe("minotaurLevel"), false);
                }
                return;
              } else if (msg === "/chalice") {
                if (!self.server.chaliceLevelClock) {
                  self.server.activateAltarChalice(self, true);
                }
                return;
              } else if (msg === "/soulstone") {
                self.server.activateAltarSoulStone(self, true);
                return;
              } else if (msg === "/fossil") {
                self.server.activateFossil(self, true);
                return;
              } else if (msg === "/stone") {
                if (!self.server.stoneLevelClock) {
                  self.server.magicStones.forEach(id => {
                    const magicStone = self.server.getEntityById(id);
                    self.server.activateMagicStone(self, magicStone);
                  });
                }
                return;
              } else if (msg === "/tree") {
                if (!self.server.isActivatedTreeLevel) {
                  self.server.startTreeLevel();
                }
                return;
              } else if (msg === "/gateway") {
                self.server.activateHands(self, true);
                return;
              } else if (msg === "/temple") {
                const lever = self.server.getEntityById(self.server.leverChaliceNpcId);
                self.server.activateLever(self, lever);
                return;
              } else if (msg === "/deathangel") {
                const lever = self.server.getEntityById(self.server.leverChaliceNpcId);
                self.server.activateLever(self, lever);

                const leverDeathAngel = self.server.getEntityById(self.server.leverDeathAngelNpcId);
                self.server.activateLever(self, leverDeathAngel, true);

                return;
              }
            }

            if (msg.startsWith("/ban")) {
              const periods = { 1: 86400, 365: 86400 * 365 };
              const reasons = ["misbehaved", "cheating", "spamming", "inappropriate_language"];

              const [, period, reason, playerName] = msg.match(/\s(\w+)\s(\w+)\s(.+)/);

              if (periods[period] && reasons.includes(reason) && playerName) {
                databaseHandler.banPlayerByIP({
                  player: self.server.getPlayerByName(playerName),
                  reason,
                  message: "Admin ban, misbehaved towards others",
                  days: period,
                });

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

          if (msg.startsWith("!link")) {
            const secret = msg.replace("!link", "").trim();
            self.databaseHandler.linkPlayerToDiscordUser(self, secret);
            return;
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
          var x = message[1];
          var y = message[2];

          if (y >= 314 && y <= 463 && !self.expansion1) {
            databaseHandler.banPlayerByIP({
              player: self,
              reason: "cheating",
              message: `haven't unlocked expension1, invalid position x:${x}, y:${y}`,
            });
            return;
          } else if (y >= 540 && !self.expansion2) {
            databaseHandler.banPlayerByIP({
              player: self,
              reason: "cheating",
              message: `haven't unlocked expension2, invalid position x:${x}, y:${y}`,
            });
            return;
          }

          if (self.server.isValidPosition(x, y)) {
            self.setPosition(x, y);
            self.clearTarget();

            self.broadcast(new Messages.Move(self));
            self.move_callback(self.x, self.y);
          } else {
            databaseHandler.banPlayerByIP({
              player: self,
              reason: "cheating",
              message: `invalid position x:${x}, y:${y}`,
            });
            return;
          }
        }
      } else if (action === Types.Messages.MOVE_PET) {
        // console.info("MOVE: " + self.name + "(" + message[1] + ", " + message[2] + ")");
        if (!self.petEntity) return;
        var x = message[1];
        var y = message[2];

        if (self.server.isValidPosition(x, y)) {
          // self.server.moveEntity(self.petEntity, x, y);

          self.petEntity.setPosition(x, y);

          // const pet = self.server.getEntityById(self.petEntity.id);

          // pet.setPosition(x, y);

          self.broadcast(new Messages.Move(self.petEntity));
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
      } else if (action === Types.Messages.HASH) {
        var hash = message[1];

        self.lastHashCheckTimestamp = Date.now();

        const isValidHash = this.server.getIsValidHash(hash);
        if (!isValidHash) {
          self.databaseHandler.banPlayerByIP({
            player: self,
            reason: "cheating",
            message: `invalid hash:${hash} expecting:${self.server.hash}`,
          });
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

        if (!mob) return;
        // if (!self.server.isPlayerNearEntity(self, mob, 10)) {
        //   databaseHandler.banPlayerByIP({
        //     player: self,
        //     reason: "cheating",
        //     message: "enemy was not near and received an attack",
        //   });
        //   return;
        // }
        // Prevent FE from sending too many attack messages
        if (self.attackTimeout) {
          // if (self.attackTimeoutWarning) {
          // databaseHandler.banPlayerByIP({
          //   player: self,
          //   reason: "cheating",
          //   message: "too many attacks sent",
          // });
          // return;
          // }
          // self.attackTimeoutWarning = true;
          return;
        }

        const attackSpeed = Types.calculateAttackSpeed(self.bonus.attackSpeed + 10);
        const duration = Math.round(Types.DEFAULT_ATTACK_SPEED - Types.DEFAULT_ATTACK_SPEED * (attackSpeed / 100));

        self.attackTimeout = setTimeout(() => {
          self.attackTimeout = null;
          // self.attackTimeoutWarning = false;
        }, duration);

        if (mob?.type === "mob" || (mob?.type === "player" && self.pvp && mob.pvp)) {
          let isCritical = false;

          const resistances: Resistances = Types.getResistance(mob, self);

          let { dmg, attackDamage, elementDamage } = Formulas.dmg({
            weapon: self.weapon,
            weaponLevel: self.weaponLevel,
            playerLevel: self.level,
            minDamage: self.bonus.minDamage + self.partyBonus.minDamage,
            maxDamage: self.bonus.maxDamage + self.partyBonus.maxDamage,
            magicDamage: self.bonus.magicDamage + self.partyBonus.magicDamage,
            attackDamage: self.bonus.attackDamage,
            drainLife: self.bonus.drainLife,
            flameDamage: self.bonus.flameDamage,
            lightningDamage: self.bonus.lightningDamage,
            coldDamage: self.bonus.coldDamage,
            poisonDamage: self.bonus.poisonDamage,
            partyAttackDamage: self.partyBonus.attackDamage,
            ...resistances,
          });

          if (mob.type === "mob") {
            if (mob.enchants.includes("stoneskin")) {
              dmg = Math.round(attackDamage * 0.8) + dmg - attackDamage;
              attackDamage = Math.round(attackDamage * 0.8);
            }
          }

          if (self.bonus.criticalHit) {
            isCritical = random(100) < self.bonus.criticalHit;
            if (isCritical) {
              dmg = attackDamage * 2 + dmg - attackDamage;
            }
          }

          if (self.bonus.freezeChance && !Types.isBoss(mob.kind)) {
            let freezeChance = self.bonus.freezeChance;
            if (mob.type === "player") {
              freezeChance = freezeChance - mob.bonus.reduceFrozenChance;
            }

            const isFrozen = random(100) < freezeChance;
            if (isFrozen) {
              self.broadcast(new Messages.Frozen(mob.id, Types.getFrozenTimePerLevel(self.freezeChanceLevel)));
            }
          }

          if (self.bonus.drainLife) {
            if (!self.hasFullHealth()) {
              let { drainLife } = self.bonus;

              // Curse health also affects drain life
              if (self.curse.health) {
                drainLife = drainLife - Math.floor((self.bonus.drainLife * self.curse.health) / 100);
              }

              self.regenHealthBy(drainLife);
              self.server.pushToPlayer(self, self.health());
            }
          }

          if (self.bonus.poisonDamage) {
            self.startPoisoned({
              dmg: self.bonus.poisonDamage,
              entity: mob,
              resistance: resistances.poisonResistance,
              attacker: self,
            });
          }

          let defense = 0;
          let isBlocked = false;

          if (mob.type === "mob") {
            defense = Formulas.mobDefense({ armorLevel: mob.armorLevel });

            dmg = defense > dmg ? 0 : dmg - defense;
            dmg += elementDamage;
            dmg += self.bonus.pierceDamage;

            if (Types.isBoss(mob.kind)) {
              dmg = self.server.handleBossDmg({ dmg, entity: mob, player: self });
            }

            // Minimum Hit dmg (can't be 0)
            if (!dmg) {
              dmg = randomInt(3, 5);
            }
          } else if (mob.type === "player") {
            let pierceDamage = self.bonus.pierceDamage - mob.bonus.absorbedDamage;
            if (pierceDamage < 0) {
              pierceDamage = 0;
            }

            ({ dmg, isBlocked } = mob.handleHurtDmg(this, dmg, pierceDamage, elementDamage));
          }

          if (mob?.type === "mob" && mob?.receiveDamage) {
            mob.receiveDamage(dmg);
            self.server.handleMobHate(mob.id, self.id, dmg);
          }

          self.server.handleHurtEntity({ entity: mob, attacker: self, dmg, isCritical, isBlocked });

          if (mob.hitPoints <= 0) {
            mob.isDead = true;

            if (mob.poisonedInterval) {
              clearInterval(mob.poisonedInterval);
              mob.poisonedInterval = null;
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

          // @NOTE Curse trigger
          if (!self.hasCurse() && Array.isArray(mob.enchants) && !self.skill.defense) {
            let duration;
            if (mob.enchants.includes("curse-health")) {
              self.curse.health = 100;
              duration = curseDurationMap[Types.Curses.HEALTH](10);
              self.broadcast(new Messages.Cursed(self.id, Types.Curses.HEALTH, duration));
            } else if (mob.enchants.includes("curse-resistance")) {
              self.curse.resistances = 50;
              duration = curseDurationMap[Types.Curses.RESISTANCES](10);
              self.broadcast(new Messages.Cursed(self.id, Types.Curses.RESISTANCES, duration));
            }

            if (self.hasCurse()) {
              clearTimeout(self.cursedTimeout);

              if (self.curse.resistances) {
                self.sendPlayerStats();
              }

              self.cursedTimeout = setTimeout(() => {
                if (self.curse.resistances) {
                  self.resetCurse();
                  self.sendPlayerStats();
                } else {
                  self.resetCurse();
                }
                self.cursedTimeout = null;
              }, duration);
            }
          }

          self.handleHurtDmg(mob, dmg);
        }
      } else if (action === Types.Messages.HURT_SPELL) {
        console.info("HURT_SPELL: " + self.name + " " + message[1]);
        const spell = self.server.getEntityById(message[1]);

        if (spell && self.hitPoints > 0) {
          const caster = self.server.getEntityById(spell.casterId);

          if (!spell.element) {
            if (caster) {
              self.handleHurtDmg(caster, spell.dmg);
            }
          } else {
            self.handleHurtSpellDmg(spell);
          }
        }
      } else if (action === Types.Messages.MAGICSTONE) {
        console.info("MAGICSTONE: " + self.name + " " + message[1]);

        const magicStone = self.server.getEntityById(message[1]);

        if (Math.abs(self.x - magicStone.x) >= 3 && Math.abs(self.y - magicStone.y) >= 3) {
          databaseHandler.banPlayerByIP({
            player: self,
            reason: "cheating",
            message: `activated magicStone from a distance: ${self.x}-${magicStone.x}, ${self.y}-${magicStone.y}`,
          });
          return;
        }

        if (
          magicStone &&
          magicStone instanceof Npc &&
          !magicStone.isActivated &&
          self.server.magicStones.includes(magicStone.id) &&
          !self.server.activatedMagicStones.includes(magicStone.id)
        ) {
          self.server.activateMagicStone(self, magicStone);
        }
      } else if (action === Types.Messages.LEVER) {
        console.info("LEVER: " + self.name + " " + message[1]);

        const lever = self.server.getEntityById(message[1]);

        if (Math.abs(self.x - lever.x) >= 10 && Math.abs(self.y - lever.y) >= 10) {
          databaseHandler.banPlayerByIP({
            player: self,
            reason: "cheating",
            message: `activated lever from a distance: ${self.x}-${lever.x}, ${self.y}-${lever.y}`,
          });
          return;
        }

        if (lever && lever instanceof Npc && !lever.isActivated) {
          if (lever.id === self.server.leverChaliceNpcId && !self.server.chaliceLevelClock) {
            databaseHandler.banPlayerByIP({
              player: self,
              reason: "cheating",
              message: "Activated chalice lever without the level being opened",
            });
            return;
          }

          self.server.activateLever(self, lever);
        }
      } else if (action === Types.Messages.ALTARCHALICE) {
        console.info("ALTAR - CHALICE: " + self.name + " " + message[1]);

        const altarId = /\d+/.test(message[1]) ? parseInt(message[1]) : null;
        if (altarId === self.server.altarChaliceNpcId) {
          self.server.activateAltarChalice(self);
        }
      } else if (action === Types.Messages.ALTARSOULSTONE) {
        console.info("ALTAR - SOULSTONE: " + self.name + " " + message[1]);

        const altarId = /\d+/.test(message[1]) ? parseInt(message[1]) : null;
        if (altarId && altarId === self.server.altarSoulStoneNpcId) {
          self.server.activateAltarSoulStone(self);
        }
      } else if (action === Types.Messages.FOSSIL) {
        console.info("FOSSIL: " + self.name);
        if (self.weapon !== "pickaxe") return;

        self.server.activateFossil(self);
      } else if (action === Types.Messages.HANDS) {
        console.info("HANDS: " + self.name + " " + message[1]);

        const handsId = /\d+/.test(message[1]) ? parseInt(message[1]) : null;
        if (handsId && handsId === self.server.handsNpcId) {
          self.server.activateHands(self);
        }
      } else if (action === Types.Messages.TRAP) {
        console.info("TRAP: " + self.name + " " + message[1]);

        const trapId = /\d+/.test(message[1]) ? parseInt(message[1]) : null;
        if (trapId) {
          self.server.activateTrap(self, trapId);
        }
      } else if (action === Types.Messages.HURT_TRAP) {
        console.info("HURT_TRAP: " + self.name + " " + message[1]);

        // Can't be hurt by traps more than once per 3 seconds
        if (self.isHurtByTrap) return;

        const trapId = /\d+/.test(message[1]) ? parseInt(message[1]) : null;
        if (trapId) {
          const trap = self.server.getEntityById(trapId);

          self.handleHurtTrapDmg(trap);

          self.isHurtByTrap = true;

          if (self.hitPoints >= 0) {
            setTimeout(() => {
              self.isHurtByTrap = false;
            }, 3000);
          }
        }
      } else if (action === Types.Messages.STATUE) {
        console.info("STATUE: " + self.name + " " + message[1]);

        const statueId = /\d+/.test(message[1]) ? parseInt(message[1]) : null;
        if (statueId) {
          self.server.activateStatue(statueId);
        }
      } else if (action === Types.Messages.CAST_SPELL) {
        if (
          typeof message[1] !== "number" ||
          typeof message[2] !== "number" ||
          typeof message[3] !== "number" ||
          typeof message[5] !== "boolean"
        )
          return;

        const [, mobId, x, y] = message;
        const entity = self.server.getEntityById(mobId);

        // @NOTE Entity might have just died
        if (!entity) return;
        const targetId = message[4] || undefined;

        if (entity.kind === Types.Entities.DEATHANGEL) {
          self.server.castDeathAngelSpell(x, y);
        } else if (entity.kind === Types.Entities.DEATHBRINGER) {
          self.server.addSpell({
            kind: Types.Entities.DEATHBRINGERSPELL,
            x,
            y,
            element: entity.element,
            casterId: mobId,
            casterKind: entity.kind,
            targetId,
          });
        } else if (entity.kind === Types.Entities.SHAMAN) {
          self.server.castShamanSpell(x, y, entity, targetId, message[5]);
        } else if (entity.kind === Types.Entities.MAGE) {
          self.server.addSpell({
            kind: Types.Entities.MAGESPELL,
            x,
            y,
            element: entity.element,
            casterId: mobId,
            casterKind: entity.kind,
            targetId,
          });
        } else if (entity.kind === Types.Entities.SKELETONARCHER) {
          self.server.addSpell({
            kind: Types.Entities.ARROW,
            x,
            y,
            element: entity.element,
            casterId: mobId,
            casterKind: entity.kind,
            targetId,
          });
        } else if (entity.kind === Types.Entities.STATUE) {
          self.server.addSpell({
            kind: Types.Entities.STATUESPELL,
            x,
            y,
            element: "flame",
            casterId: mobId,
            casterKind: entity.kind,
          });
        } else if (entity.kind === Types.Entities.STATUE2) {
          self.server.addSpell({
            kind: Types.Entities.STATUE2SPELL,
            x,
            y,
            element: "cold",
            casterId: mobId,
            casterKind: entity.kind,
          });
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

          const { kind } = item;

          if (Types.isItem(kind)) {
            self.broadcast(item.despawn());
            self.server.removeEntity(item);

            if (Types.Entities.CAKE === kind) return;
            if (Types.Entities.SOULSTONE === kind) {
              if (self.server.soulStonePlayerName) {
                const soulStonePlayer = self.server.getPlayerByName(self.server.soulStonePlayerName);
                if (soulStonePlayer) {
                  self.databaseHandler.lootItems({
                    player: soulStonePlayer,
                    items: [{ item: "soulstone", quantity: 1 }],
                  });

                  soulStonePlayer.send({
                    type: Types.Messages.NOTIFICATION,
                    message: "You received the Soul Stone",
                  });

                  postMessageToDiscordEventChannel(
                    `${soulStonePlayer.name} picked up Soul Stone ${EmojiMap.soulstone} `,
                  );
                }
              }
            } else if (Types.Entities.Gems.includes(kind)) {
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
              let amount;
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
                case Types.Entities.POISONPOTION:
                  self.handleHurtSpellDmg({ element: "poison", dmg: 240 });
                  break;
              }

              if (
                (kind === Types.Entities.NANOPOTION || kind === Types.Entities.BANANOPOTION) &&
                self.nanoPotions < 5
              ) {
                self.nanoPotions += 1;
                databaseHandler.foundNanoPotion(self.name);
              }

              if (amount && !self.hasFullHealth()) {
                self.regenHealthBy(amount);
                self.server.pushToPlayer(self, self.health());
              }
            } else if (kind === Types.Entities.GOLD) {
              console.info("LOOT GOLD: " + self.name + " " + item.amount);

              if (!item.amount || isNaN(item.amount)) return;

              let { amount } = item;
              if (self.bonus.extraGold || self.partyBonus.extraGold) {
                amount = Math.floor(
                  (Types.calculateExtraGold(self.bonus.extraGold + self.partyBonus.extraGold) / 100) * amount + amount,
                );
              }

              // @TODO ~~~~ configure split for party loots
              self.databaseHandler.lootGold({ player: self, amount });
            } else if (kind === Types.Entities.IOU) {
              console.info("LOOT IOU: " + self.name + " " + item.amount);

              if (!item.amount || isNaN(item.amount)) return;

              let { amount } = item;
              let player = self;

              if (self.partyId) {
                player = self.server.getEntityById(self.getParty().getNextLootMemberId()) || self;
              }

              self.databaseHandler.lootItems({
                player,
                items: [
                  {
                    item: "iou",
                    level: amount,
                  },
                ],
              });
            } else if (Types.Entities.NANOCOIN === kind) {
              console.info(`LOOT NANO: ${self.name}, ${self.network}, ${item.amount}`);
              if (!item.amount || isNaN(item.amount) || self.network !== "nano") {
                return;
              }
              self.databaseHandler.lootCoin({ player: self, amount: item.amount });
            } else if (Types.Entities.BANANOCOIN === kind) {
              console.info(`LOOT NANO: ${self.name}, ${self.network}, ${item.amount}`);
              if (!item.amount || isNaN(item.amount) || self.network !== "nano") {
                return;
              }
              self.databaseHandler.lootCoin({ player: self, amount: item.amount });
            } else {
              try {
                let isUnique = false;
                let generatedItem: GeneratedItem = null;
                let runeName = null;

                if (Types.isRune(kind)) {
                  runeName = Types.RuneByKind[kind];
                  if (runeName) {
                    generatedItem = { item: `rune-${runeName}`, quantity: 1 };
                  }
                } else {
                  const jewelLevel = Types.isJewel(kind) ? item.level : 1;
                  ({ isUnique, ...generatedItem } = self.generateItem({ kind, jewelLevel }) || ({} as GeneratedItem));
                }

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
                    postMessageToDiscordEventChannel(
                      `${player.name} picked up ${kinds[generatedItem.item][2]} ${
                        EmojiMap[generatedItem.item] || "💍"
                      } `,
                    );
                  } else if (Types.isRune(kind) && Types.RuneList.indexOf(runeName) + 1 >= 20) {
                    postMessageToDiscordEventChannel(
                      `${player.name} picked up ${runeName.toUpperCase()} rune ${EmojiMap[`rune-${runeName}`]}`,
                    );
                  } else if (kind === Types.Entities.STONEDRAGON) {
                    postMessageToDiscordEventChannel(`${player.name} picked up a Dragon Stone ${EmojiMap.stonedragon}`);
                  } else if (kind === Types.Entities.STONEHERO) {
                    postMessageToDiscordEventChannel(`${player.name} picked up a Hero Emblem ${EmojiMap.stonehero}`);
                  } else if (kind === Types.Entities.CHALICE) {
                    // postMessageToDiscordEventChannel(`${player.name} picked up the Chalice ${EmojiMap.chalice}`);
                  } else if (kind === Types.Entities.SCROLLTRANSMUTEBLESSED) {
                    postMessageToDiscordEventChannel(
                      `${player.name} picked up a Blessed Transmute Scroll ${EmojiMap.scrolltransmuteblessed}`,
                    );
                  } else if (kind === Types.Entities.SCROLLUPGRADESACRED) {
                    postMessageToDiscordEventChannel(
                      `${player.name} picked up a Sacred Upgrade Scroll ${EmojiMap.scrollupgradesacred}`,
                    );
                  } else if (kind === Types.Entities.BARGOLD) {
                    postMessageToDiscordEventChannel(`${player.name} picked up a Gold Bar ${EmojiMap.bargold}`);
                  } else if (kind === Types.Entities.JEWELSKULL && generatedItem.level === 5) {
                    postMessageToDiscordEventChannel(
                      `${player.name} picked up a ${isUnique ? "**unique** " : ""}lv.5 Skull Jewel ${
                        EmojiMap.jewelskull
                      }`,
                    );
                  }

                  self.databaseHandler.lootItems({
                    player,
                    items: [generatedItem],
                  });
                }
              } catch (err) {
                Sentry.captureException(err);
              }
            }
          }
        }
      } else if (action === Types.Messages.TELEPORT) {
        console.info("TELEPORT: " + self.name + "(" + message[1] + ", " + message[2] + ")");

        var x = message[1];
        var y = message[2];
        var orientation = message[3];

        self.orientation = orientation;

        // @NOTE Handle the /town command
        if (x >= 33 && x <= 39 && y >= 208 && y <= 211) {
          // The message should have been blocked by the FE
          if (Object.keys(self.attackers).length || (self.y >= 195 && self.y <= 259)) {
            return;
          }
        }

        if (self.server.isValidPosition(x, y)) {
          if (x === 98 && y === 764) {
            const deathAngelLevel = self.server.getEntityById(self.server.leverDeathAngelNpcId);
            const deathAngelDoor = self.server.getEntityById(self.server.doorDeathAngelNpcId);
            const deathAngel = self.server.deathAngel;

            if (!deathAngelLevel.isActivated || !deathAngelDoor.isActivated || deathAngel.isDead) {
              return;
            }

            if (
              deathAngel.x !== self.server.deathAngelSpawnCoords.x &&
              deathAngel.y !== self.server.deathAngelSpawnCoords.y
            ) {
              const possibleTeleportCoords = [
                { x: 90, y: 749 },
                { x: 107, y: 749 },
                { x: 107, y: 764 },
                { x: 90, y: 764 },
                { x: 100, y: 760 },
                { x: 95, y: 750 },
              ];
              [{ x, y }] = _.shuffle(possibleTeleportCoords);
            }

            self.send([Types.Messages.DEATHANGEL_CHECK, { x, y }]);
          }

          if (self.petEntity) {
            self.petEntity.setPosition(x, y);
          }

          self.setPosition(x, y);
          self.clearTarget();

          self.broadcast(new Messages.Teleport(self));

          self.zone_callback();

          // if (self.petEntity) {
          // self.server.moveEntity(self.petEntity, x, y);

          // self.petEntity.setPosition(x, y);
          // self.petEntity.group = self.group;
          // }

          // @NOTE Make sure every mobs disengage
          self.server.handlePlayerVanish(self);
          // self.server.pushRelevantEntityListTo(self);

          self.sendLevelInProgress();
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
              message: MIN_LEVEL,
            });
            return;
          } else if (!self.account && !message[1]) {
            self.connection.send({
              type: Types.Messages.BOSS_CHECK,
              status: "missing-account",
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

        if ((isClassicPayout && self.hasRequestedBossPayout) || !self.network) {
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
          let banMessage;
          if (self.hash) {
            banMessage = `Already have hash ${self.hash}`;
          } else if (self.hasRequestedBossPayout) {
            banMessage = `Has already requested payout for Classic`;
          } else if (self.createdAt + MIN_TIME > Date.now()) {
            banMessage = `Less then 15 minutes played ${Date.now() - (self.createdAt + MIN_TIME)}`;
          } else if (self.level < MIN_LEVEL) {
            banMessage = `Min level not obtained, player is level ${self.level}`;
          } else if (!self.achievement[1] || !self.achievement[11] || !self.achievement[16] || !self.achievement[20]) {
            banMessage = `Player has not completed required quests ${self.achievement[1]}, ${self.achievement[11]}, ${self.achievement[16]}, ${self.achievement[20]}`;
          }

          console.info(`Reason: ${banMessage}`);

          databaseHandler.banPlayerByIP({
            player: self,
            reason: "cheating",
            message: banMessage,
          });
          return;
        }

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
          databaseHandler.banPlayerByIP({
            player: self,
            reason: "cheating",
            message: `Tried to withdraw ${raiPayoutAmount} but max is ${maxAmount} for quest of kind: ${message[1]}`,
          });
          return;
        }

        console.info("PAYOUT STARTED: " + self.name + " " + self.account + " " + raiPayoutAmount);
        payoutIndex += 1;
        const response =
          (await enqueueSendPayout({
            playerName: self.name,
            account: self.account,
            amount,
            payoutIndex,
            network: self.network,
          })) || {};
        const { err, message: msg, hash } = response as any;

        // If payout succeeds there will be a hash in the response!
        if (hash) {
          console.info(`PAYOUT COMPLETED: ${self.name} ${self.account} for quest of kind: ${message[1]}`);

          postMessageToDiscordEventChannel(
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
      } else if (action === Types.Messages.BAN_PLAYER) {
        // Just don't...
        databaseHandler.banPlayerByIP({
          player: self,
          reason: "cheating",
          message: message[1],
        });
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

        const quantity = message[3];
        if (quantity && !validateQuantity(quantity)) {
          return;
        }

        databaseHandler.moveItem({ player: self, fromSlot: message[1], toSlot: message[2], quantity });
      } else if (action === Types.Messages.MOVE_ITEMS_TO_INVENTORY) {
        const panel = message[1];
        console.info(`MOVE ITEMS TO INVENTORY: ${self.name} Panel: ${panel}`);

        if (["upgrade", "trade"].includes(panel)) {
          databaseHandler.moveItemsToInventory(self, panel);
        }
      } else if (action === Types.Messages.MOVE_TRADE_ITEMS_TO_INVENTORY) {
        console.info("MOVE TRADE ITEMS TO INVENTORY: " + self.name);

        databaseHandler.moveItemsToInventory(self, "trade");
      } else if (action === Types.Messages.GOLD.MOVE) {
        const amount = message[1];
        const from = message[2];
        const to = message[3];

        console.info(`MOVE GOLD: ${self.name}, AMOUNT: ${amount}, FROM: ${from}, TO: ${to}`);

        if (!validateQuantity(amount)) {
          return;
        }
        if (!from || !to) return;
        if (from === "inventory" && amount > self.gold) return;
        if (from === "stash" && amount > self.goldStash) return;
        if (from === "trade" && amount > self.goldTrade) return;

        if (from === "trade" || to === "trade") {
          const tradeInstance = self.server.getTrade(self.tradeId);
          if (!tradeInstance?.players.find(({ id }) => id === self.id)) {
            // This should not happen..
            Sentry.captureException(new Error(`Invalid trade instance or Player ${self.name} not part of it`));
            return;
          }
          tradeInstance.updateGold({ player1Id: self.id, from, to, amount });
        } else {
          databaseHandler.moveGold({ player: self, from, to, amount });
        }
      } else if (action === Types.Messages.GOLD.BANK) {
        if (message[1]) {
          const amount = await databaseHandler.withdrawFromBank({ player: self });
          self.send([Types.Messages.GOLD.BANK_WITHDRAW, amount]);
        } else {
          self.send([Types.Messages.GOLD.BANK, self.server.goldBank]);
        }
      } else if (action === Types.Messages.UPGRADE_ITEM) {
        console.info("UPGRADE ITEM: " + self.name);

        databaseHandler.upgradeItem(self);
      } else if (action === Types.Messages.ACHIEVEMENT) {
        console.info("ACHIEVEMENT: " + self.name + " " + message[1] + " " + message[2]);
        const index = parseInt(message[1]) - 1;
        if (message[2] === "found" && !self.achievement[index]) {
          self.achievement[index] = 1;

          if (
            (index === ACHIEVEMENT_NFT_INDEX && !(await databaseHandler.useInventoryItem(self, "nft"))) ||
            (index === ACHIEVEMENT_WING_INDEX && !(await databaseHandler.useInventoryItem(self, "wing"))) ||
            (index === ACHIEVEMENT_CRYSTAL_INDEX && !(await databaseHandler.useInventoryItem(self, "crystal")))
          ) {
            return;
          }

          databaseHandler.foundAchievement(self, index).then(() => {
            if (index === ACHIEVEMENT_GRIMOIRE_INDEX) {
              self.hasGrimoire = true;
              self.equipItem({} as any);

              postMessageToDiscordEventChannel(`${self.name} uncovered the long-lost Grimoire ${EmojiMap["grimoire"]}`);
            } else if (index === ACHIEVEMENT_OBELISK_INDEX) {
              self.hasObelisk = true;
              self.equipItem({} as any);

              postMessageToDiscordEventChannel(`${self.name} found the Obelisk of Eternal Life`);
            }
          });
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
        console.info("PURCHASE_CANCEL: " + self.name + " " + self.depositAccount);

        purchase[self.network].cancel(self.depositAccount);
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
          } else if (!playerToTradeWith.achievement[ACHIEVEMENT_HERO_INDEX]) {
            self.send(
              new Messages.Trade(
                Types.Messages.TRADE_ACTIONS.ERROR,
                `${message[2]} has not yet killed the Skeleton King.`,
              ).serialize(),
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
      } else if (action === Types.Messages.MERCHANT.BUY) {
        const fromSlot = message[1];
        const toSlot = message[2];
        const quantity = message[3];

        if (!validateQuantity(quantity)) {
          return;
        }

        self.databaseHandler.buyFromMerchant({ player: self, fromSlot, toSlot, quantity });
      } else if (action === Types.Messages.MERCHANT.SELL) {
        const fromSlot = message[1];
        const quantity = message[2];

        if (!validateQuantity(quantity)) {
          return;
        }

        self.databaseHandler.sellToMerchant({ player: self, fromSlot, quantity });
      } else if (action === Types.Messages.SETTINGS) {
        const settings = message[1];

        if (settings) {
          if (settings.capeHue) {
            self.capeHue = settings.capeHue;
          }
          if (settings.capeSaturate) {
            self.capeSaturate = settings.capeSaturate;
          }
          if (settings.capeContrast) {
            self.capeContrast = settings.capeContrast;
          }
          if (settings.capeBrightness) {
            self.capeBrightness = settings.capeBrightness;
          }
          if (typeof settings.pvp !== "undefined") {
            self.pvp = toBoolean(settings.pvp);
          }

          this.databaseHandler.setSettings(this.name, settings);
          this.broadcast(new Messages.Settings(this, settings), false);
        }
      } else if (action === Types.Messages.SKILL) {
        const slot = message[1];
        const mobId = message[2];
        const isAttackSkill = slot === 1;

        const skill = isAttackSkill ? this.attackSkill : this.defenseSkill;
        let shouldBroadcast = false;
        let level: number;

        if (isAttackSkill) {
          if (typeof this.attackSkill !== "number" || this.attackSkillTimeout) return;
          const attackedMob = self.server.getEntityById(mobId);
          if (!attackedMob || (attackedMob.type === "player" && !attackedMob.pvp)) return;
          if (attackedMob.kind === Types.Entities.TREE && this.attackSkill === 1) {
            if (!this.server.isActivatedTreeLevel) {
              this.server.startTreeLevel(attackedMob);
            }
            return;
          }

          shouldBroadcast = true;

          const mobResistances = Types.getResistance(attackedMob, self);
          let mobResistance = mobResistances?.[Types.attackSkillToResistanceType[this.attackSkill]] || 0;

          if (attackedMob instanceof Player) {
            mobResistance = Types.calculateResistance(
              mobResistance + attackedMob.skill.resistances,
              attackedMob.curse.resistances,
            );
          }

          const { min, max } = Types.getAttackSkill({
            skill: this.attackSkill,
            level: this.weaponLevel,
            bonus: this.bonus,
            resistance: mobResistance,
            itemClass: Types.getItemClass(this.weapon, this.weaponLevel, this.isWeaponUnique),
          });

          let dmg = randomInt(min, max);

          if (attackedMob.type === "mob") {
            this.server.handleMobHate(attackedMob.id, this.id, dmg);

            if (Types.isBoss(attackedMob.kind)) {
              dmg = this.server.handleBossDmg({ dmg, entity: attackedMob, player: this });
            }

            attackedMob.receiveDamage(dmg);
          } else if (attackedMob.type === "player") {
            attackedMob.hitPoints -= dmg;
          }

          const originalTimeout = Math.floor(Types.attackSkillDelay[this.attackSkill]);
          const timeout = Math.round(
            originalTimeout - originalTimeout * (Types.calculateSkillTimeout(this.bonus.skillTimeout) / 100),
          );

          if (Types.skillToNameMap[this.attackSkill] === "poison") {
            this.startPoisoned({ dmg, entity: attackedMob, resistance: mobResistance, attacker: this });
          }

          this.attackSkillTimeout = setTimeout(() => {
            this.attackSkillTimeout = null;
          }, timeout);

          this.server.handleHurtEntity({ entity: attackedMob, attacker: this, dmg });
        } else {
          if (typeof this.defenseSkill !== "number" || this.defenseSkillTimeout) return;

          shouldBroadcast = true;
          level = this.shieldLevel;

          if (this.defenseSkill === 0) {
            if (!self.hasFullHealth()) {
              const { stats: percent } = Types.getDefenseSkill(0, this.shieldLevel);

              let healAmount = Math.round((percent / 100) * this.maxHitPoints);
              let healthDiff = this.maxHitPoints - this.hitPoints;
              if (healthDiff < healAmount) {
                healAmount = healthDiff;
              }

              self.regenHealthBy(healAmount);
              self.server.pushToPlayer(self, self.health());
            }
          } else if (this.defenseSkill === 1) {
            const { stats: percent } = Types.getDefenseSkill(1, this.shieldLevel);

            if (self.hasCurse()) {
              self.resetCurse();
            }

            self.skill.defense = percent;
            self.sendPlayerStats();
            self.defenseSkillDefenseTimeout = setTimeout(() => {
              self.skill.defense = 0;
              self.sendPlayerStats();
              self.defenseSkillDefenseTimeout = null;
            }, Types.defenseSkillDurationMap[this.defenseSkill](this.shieldLevel));
          } else if (this.defenseSkill === 2) {
            const { stats: percent } = Types.getDefenseSkill(2, this.shieldLevel);

            self.skill.resistances = percent;
            self.sendPlayerStats();
            self.defenseSkillResistancesTimeout = setTimeout(() => {
              self.skill.resistances = 0;
              self.sendPlayerStats();
              self.defenseSkillResistancesTimeout = null;
            }, Types.defenseSkillDurationMap[this.defenseSkill](this.shieldLevel));
          }

          const originalTimeout = Math.floor(Types.defenseSkillDelay[this.defenseSkill]);
          const timeout = Math.round(
            originalTimeout - originalTimeout * (Types.calculateSkillTimeout(this.bonus.skillTimeout) / 100),
          );

          self.defenseSkillTimeout = setTimeout(() => {
            self.defenseSkillTimeout = null;
          }, timeout);
        }

        if (shouldBroadcast) {
          self.broadcast(new Messages.Skill(this, { skill, level, isAttackSkill, mobId }), false);
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
      if (self.poisonedInterval) {
        clearInterval(self.poisonedInterval);
      }
      if (self.cursedTimeout) {
        clearTimeout(self.cursedTimeout);
      }
      if (self.chatTimeout) {
        clearTimeout(self.chatTimeout);
      }

      self.exit_callback?.();
    });

    this.connection.sendUTF8("go"); // Notify client that the HELLO/WELCOME handshake can start
  }

  unregisterMinotaurDamage = _.debounce(() => {
    this.minotaurDamage = 0;
  }, 30000);

  unregisterButcherDamage = _.debounce(() => {
    this.butcherDamage = 0;
  }, 30000);

  unregisterDeathAngelDamage = _.debounce(() => {
    this.deathAngelDamage = 0;
  }, 30000);

  generateRandomCapeBonus(uniqueChances = 1) {
    const randomIsUnique = random(100);
    const isUnique = randomIsUnique < uniqueChances;

    const baseBonus = [0, 1, 2, 7, 8];
    const uniqueBonus = [3, 4, 5, 6];

    return _.shuffle(baseBonus)
      .slice(0, 1)
      .concat(isUnique ? _.shuffle(uniqueBonus).slice(0, 1) : []);
  }

  generateItem({
    kind,
    uniqueChances = 1,
    superiorChances = 1,
    isLuckySlot = false,
    jewelLevel = 1,
    skin = 1,
  }): GeneratedItem {
    let isUnique = false;
    let isSuperior = false;
    let item;

    const lowLevelBonus = [0, 1, 2, 3];
    const mediumLevelBonus = [0, 1, 2, 3, 4, 5];
    const highLevelBonus = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const amuletHighLevelBonus = [9, 10];
    const drainLifeBonus = [13];
    const flameDamageBonus = [14];
    const lightningDamageBonus = [15];
    const pierceDamageBonus = [16];
    const highHealthBonus = [17];
    const coldDamageBonus = [18];
    const freezeChanceBonus = [19];
    const reduceFrozenChanceBonus = [20];
    const resistances = [21, 22, 23, 24, 25];
    const elementPercentage = [27, 28, 29, 30, 31];
    const allResistance = [32];
    const timeout = [35];
    const elementDamage = [4, 14, 15, 16, 18, 34];
    const lowerResistance = [36, 37, 38, 39, 40];
    const lowerAllResistance = [41];
    const extraGold = [42];
    const magicFind = [11];
    const attackSpeed = [12];
    const superior = [43];

    // @TODO ~~~ remove once found why it errors out
    try {
      Types.isArmor(kind);
    } catch (err) {
      Sentry.captureException(err, { extra: { kind } });
    }

    if (
      Types.isArmor(kind) ||
      Types.isHelm(kind) ||
      Types.isWeapon(kind) ||
      Types.isBelt(kind) ||
      Types.isShield(kind)
    ) {
      const randomIsUnique = random(100);
      const randomIsSuperior = random(100);

      isUnique = randomIsUnique < uniqueChances;
      isSuperior = randomIsSuperior < superiorChances;

      if ([Types.Entities.HELMCLOWN, Types.Entities.BELTGOLDWRAP].includes(kind)) {
        isUnique = true;
      }

      const baseLevel = Types.getBaseLevel(kind);
      const level = baseLevel <= 5 && !isUnique ? randomInt(1, 3) : 1;
      let bonus = [];
      let skill = null;

      if (isUnique) {
        if (Types.isHelm(kind) || Types.isArmor(kind)) {
          if (kind === Types.Entities.HELMCLOWN) {
            bonus = _.shuffle([
              ...highLevelBonus,
              ...elementDamage,
              ...elementPercentage,
              ...reduceFrozenChanceBonus,
              ...timeout,
              ...attackSpeed,
            ])
              .slice(0, 1)
              .concat(allResistance);
          } else {
            bonus = [6];
          }
        } else if (Types.isWeapon(kind)) {
          bonus = [3, 14];
        } else if (Types.isBelt(kind)) {
          if (kind === Types.Entities.BELTGOLDWRAP) {
            bonus = [...extraGold, ...magicFind];
          } else {
            bonus = _.shuffle(mediumLevelBonus).slice(0, 1).sort();
          }
        }
      }

      if (Types.isShield(kind) && kind >= Types.Entities.SHIELDGOLDEN) {
        skill = getRandomDefenseSkill();
        bonus = _.shuffle(resistances)
          .slice(0, isUnique ? 2 : 1)
          .sort();
      } else if (Types.isWeapon(kind) && kind >= Types.Entities.GOLDENSWORD) {
        skill = getRandomAttackSkill();
      }

      if (isSuperior) {
        bonus = bonus.concat(superior);
      }

      item = {
        item: Types.getKindAsString(kind),
        level,
        bonus: bonus ? JSON.stringify(bonus) : null,
        socket: JSON.stringify(getRandomSockets({ kind, baseLevel, isLuckySlot })),
        skill,
        isUnique,
      };
    } else if (Types.isScroll(kind) || Types.isSingle(kind) || Types.isStone(kind) || Types.isBar(kind)) {
      item = { item: Types.getKindAsString(kind), quantity: 1 };
    } else if (Types.isCape(kind)) {
      const bonus = this.generateRandomCapeBonus(uniqueChances);

      item = { item: Types.getKindAsString(kind), level: 1, bonus: JSON.stringify(bonus.sort((a, b) => a - b)) };
    } else if (Types.isPetItem(kind)) {
      let bonus = [];

      bonus = _.shuffle(highLevelBonus).slice(0, isUnique ? 2 : 1);

      // @TODO Necklace will have elemental dmg
      //.concat(_.shuffle(elementDamage).slice(0, 1));

      if (kind === Types.Entities.PETEGG) {
        item = {
          item: Types.getKindAsString(kind),
          level: 1,
        };
      } else {
        item = {
          item: Types.getKindAsString(kind),
          level: 1,
          bonus: JSON.stringify(bonus.sort((a, b) => a - b)),
          socket: JSON.stringify([0]),
          skin,
        };
      }
    } else if (Types.isRing(kind) || Types.isAmulet(kind) || Types.isJewel(kind)) {
      const randomIsUnique = random(100);
      isUnique = randomIsUnique < uniqueChances;

      let bonus = [];
      if (kind === Types.Entities.RINGBRONZE) {
        bonus = _.shuffle(lowLevelBonus).slice(0, isUnique ? 2 : 1);
      } else if (kind === Types.Entities.RINGSILVER || kind === Types.Entities.AMULETSILVER) {
        bonus = _.shuffle(mediumLevelBonus).slice(0, isUnique ? 3 : 2);
      } else if (kind === Types.Entities.RINGGOLD) {
        bonus = _.shuffle(highLevelBonus).slice(0, isUnique ? 4 : 3);
      } else if (kind === Types.Entities.RINGPLATINUM) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(_.shuffle(elementDamage).slice(0, 1))
          .concat(isUnique ? allResistance : _.shuffle(resistances).slice(0, 2));
      } else if (kind === Types.Entities.AMULETGOLD) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, isUnique ? 3 : 2)
          .concat(_.shuffle(amuletHighLevelBonus).slice(0, 1));
      } else if (kind === Types.Entities.AMULETPLATINUM) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(_.shuffle(amuletHighLevelBonus).slice(0, 1))
          .concat(_.shuffle(elementDamage).slice(0, 1))
          .concat(isUnique ? allResistance : _.shuffle(resistances).slice(0, 2));
      } else if (kind === Types.Entities.RINGNECROMANCER) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(drainLifeBonus)
          .concat(_.shuffle([resistances[4], elementPercentage[4]]).slice(0, 1));
      } else if (kind === Types.Entities.AMULETCOW) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(_.shuffle(amuletHighLevelBonus).slice(0, 1))
          .concat(_.shuffle([...flameDamageBonus, ...lightningDamageBonus, ...pierceDamageBonus]).slice(0, 1))
          .concat(_.shuffle(elementPercentage).slice(0, 1));
      } else if (kind === Types.Entities.AMULETFROZEN) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(_.shuffle(amuletHighLevelBonus).slice(0, 1))
          .concat(coldDamageBonus)
          .concat(freezeChanceBonus)
          .concat(reduceFrozenChanceBonus)
          .concat(_.shuffle([resistances[3], elementPercentage[3]]).slice(0, 1));
      } else if (kind === Types.Entities.AMULETDEMON) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(_.shuffle(amuletHighLevelBonus).slice(0, 1))
          .concat(flameDamageBonus)
          .concat(flameDamageBonus)
          .concat(elementPercentage[1])
          .concat(allResistance);
      } else if (kind === Types.Entities.AMULETMOON) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 2)
          .concat(_.shuffle(amuletHighLevelBonus).slice(0, 1))
          .concat(random(2) ? allResistance : _.shuffle(resistances).slice(0, 2))
          .concat(_.shuffle(elementDamage).slice(0, 2))
          .concat(_.shuffle(elementPercentage).slice(0, 2));
      } else if (kind === Types.Entities.AMULETSTAR) {
        const isAllResistances = random(2);
        bonus = _.shuffle(highLevelBonus)
          .slice(0, isAllResistances ? 2 : 3)
          .slice(0, 2)
          .concat(amuletHighLevelBonus)
          .concat(isAllResistances ? allResistance : _.shuffle(resistances).slice(0, 3))
          .concat(_.shuffle(elementDamage).slice(0, 2))
          .concat(_.shuffle(elementPercentage).slice(0, 2));
      } else if (kind === Types.Entities.AMULETSKULL) {
        const isAllResistances = random(2);
        bonus = _.shuffle(highLevelBonus)
          .slice(0, isAllResistances ? 2 : 4)
          .concat(amuletHighLevelBonus.slice(0, 1))
          .concat(isAllResistances ? allResistance : _.shuffle(resistances).slice(0, 2))
          .concat(_.shuffle(elementPercentage).slice(0, 2))
          .concat(_.shuffle(lowerResistance).slice(0, 1));
      } else if (kind === Types.Entities.AMULETDRAGON) {
        const isAllResistances = random(2);
        bonus = _.shuffle(highLevelBonus)
          .slice(0, isAllResistances ? 2 : 4)
          .concat(amuletHighLevelBonus.slice(0, 1))
          .concat(isAllResistances ? allResistance : _.shuffle(resistances).slice(0, 2))
          .concat([elementPercentage[1], lowerResistance[1]]);
      } else if (kind === Types.Entities.AMULETEYE) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(allResistance)
          .concat(_.shuffle(elementPercentage).slice(0, 1))
          .concat(timeout)
          .concat(lowerAllResistance);
      } else if (kind === Types.Entities.AMULETGREED) {
        bonus = _.shuffle(highLevelBonus).slice(0, 5).concat(magicFind).concat(extraGold);
      } else if (kind === Types.Entities.RINGRAISTONE) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(lightningDamageBonus)
          .concat(_.shuffle([resistances[2], elementPercentage[2]]).slice(0, 1));
      } else if (kind === Types.Entities.RINGFOUNTAIN) {
        bonus = _.shuffle([5, 6])
          .slice(0, 2)
          .concat([8, ...highHealthBonus])
          .concat(_.shuffle([7, 11, 12]).slice(0, 1))
          .concat(_.shuffle(resistances).slice(0, 1));
      } else if (kind === Types.Entities.RINGMINOTAUR) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat([...coldDamageBonus, ...freezeChanceBonus])
          .concat(_.shuffle([resistances[3], elementPercentage[3]]).slice(0, 1));
      } else if (kind === Types.Entities.RINGMYSTICAL) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(_.shuffle(resistances).slice(0, 2))
          .concat(_.shuffle(elementDamage).slice(0, 1))
          .concat(_.shuffle(elementPercentage).slice(0, 2));
      } else if (kind === Types.Entities.RINGBALROG) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 3)
          .concat(_.shuffle([...flameDamageBonus, ...lightningDamageBonus]).slice(0, 1))
          .concat(_.shuffle(resistances).slice(0, 2))
          .concat(_.shuffle(elementPercentage).slice(0, 2));
      } else if (kind === Types.Entities.RINGCONQUEROR) {
        bonus = [0, 1, 2].concat(_.shuffle([3, 5, 6, 7, 8]).slice(0, 3)).concat(_.shuffle(resistances).slice(0, 3));
      } else if (kind === Types.Entities.RINGHEAVEN) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 1)
          .concat(_.shuffle([11, 12]).slice(0, 1))
          .concat(_.shuffle(elementDamage).slice(0, 1))
          .concat(_.shuffle(elementPercentage).slice(0, 2))
          .concat(allResistance);
      } else if (kind === Types.Entities.RINGWIZARD) {
        bonus = _.shuffle(highLevelBonus)
          .slice(0, 1)
          .concat(_.shuffle(elementDamage).slice(0, 2))
          .concat(_.shuffle(elementPercentage).slice(0, 2))
          .concat(_.shuffle(resistances).slice(0, 2))
          .concat(timeout);
      } else if (kind === Types.Entities.RINGGREED) {
        bonus = _.shuffle(highLevelBonus).slice(0, 4).concat(magicFind).concat(extraGold);
      } else if (kind === Types.Entities.JEWELSKULL) {
        if (jewelLevel === 1) {
          bonus = _.shuffle(lowLevelBonus).slice(0, isUnique ? 2 : 1);
        } else if (jewelLevel === 2) {
          bonus = _.shuffle(mediumLevelBonus).slice(0, isUnique ? 3 : 2);
        } else if (jewelLevel === 3) {
          bonus = _.shuffle(highLevelBonus)
            .slice(0, isUnique ? 3 : 2)
            .concat(_.shuffle(resistances).slice(0, 1));
        } else if (jewelLevel === 4) {
          bonus = _.shuffle(highLevelBonus).slice(0, 2).concat(_.shuffle(resistances).slice(0, 2));

          if (isUnique) {
            bonus = bonus.concat(_.shuffle(elementPercentage).slice(0, 1));
          }
        } else if (jewelLevel === 5) {
          bonus = _.shuffle(highLevelBonus)
            .slice(0, 2)
            .concat(_.shuffle(elementDamage).slice(0, 1))
            .concat(_.shuffle([...resistances, ...extraGold, ...magicFind, ...attackSpeed]).slice(0, 2));

          if (isUnique) {
            bonus = bonus.concat(_.shuffle(elementPercentage).slice(0, 1));
          }
        }
      }

      item = {
        item: Types.getKindAsString(kind),
        level: jewelLevel,
        bonus: JSON.stringify(bonus.sort((a, b) => a - b)),
      };
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
    const helmBonus = this.helmBonus?.concat(this.isHelmSuperior ? [43] : []);
    const armorBonus = this.armorBonus?.concat(this.isArmorSuperior ? [43] : []);
    const weaponBonus = this.weaponBonus?.concat(this.isWeaponSuperior ? [43] : []);
    const beltBonus = this.beltBonus?.concat(this.isBeltSuperior ? [43] : []);
    const capeBonus = this.capeBonus?.concat(this.isCapeSuperior ? [43] : []);
    const shieldBonus = this.shieldBonus?.concat(this.isShieldSuperior ? [43] : []);

    return Object.assign({}, this._getBaseState(), {
      orientation: this.orientation,
      targetId: this.targetId,
      petId: this.pet && this.petEntity ? this.petEntity.id : null,
      name: this.name,
      helm: `${this.helm}:${this.helmLevel}${toDb(helmBonus)}${toDb(this.helmSocket)}`,
      armor: `${this.armor}:${this.armorLevel}${toDb(armorBonus)}${toDb(this.armorSocket)}`,
      weapon: `${this.weapon}:${this.weaponLevel}${toDb(weaponBonus)}${toDb(this.weaponSocket)}${toDb(
        this.attackSkill,
      )}`,
      amulet: this.amulet ? `${this.amulet}:${this.amuletLevel}${toDb(this.amuletBonus)}` : null,
      ring1: this.ring1 ? `${this.ring1}:${this.ring1Level}${toDb(this.ring1Bonus)}` : null,
      ring2: this.ring2 ? `${this.ring2}:${this.ring2Level}${toDb(this.ring2Bonus)}` : null,
      belt: this.belt ? `${this.belt}:${this.beltLevel}${toDb(beltBonus)}` : null,
      level: this.level,
      auras: this.auras,
      partyId: this.partyId,
      cape: this.cape ? `${this.cape}${toDb(this.capeLevel)}${toDb(capeBonus)}` : null,
      pet: this.pet
        ? `${this.pet}${toDb(this.petLevel)}${toDb(this.petBonus)}${toDb(this.petSocket)}${toDb(this.petSkin)}`
        : null,
      shield: this.shield
        ? `${this.shield}:${this.shieldLevel}${toDb(shieldBonus)}${toDb(this.shieldSocket)}${toDb(this.defenseSkill)}`
        : null,
      settings: {
        capeHue: this.capeHue,
        capeSaturate: this.capeSaturate,
        capeContrast: this.capeContrast,
        capeBrightness: this.capeBrightness,
        pvp: this.pvp,
      },
      resistances: null,
      element: null,
      enchants: null,
      bonus: {
        attackSpeed: Types.calculateAttackSpeed(this.bonus.attackSpeed),
      },
    });
  }

  handleHurtDmg(mob, rawDmg: number, pierceDamage: number = 0, elementDamage: number = 0) {
    let isBlocked = false;
    let lightningDamage = 0;

    let defense = Formulas.playerDefense({
      helm: this.helm,
      helmLevel: this.helmLevel,
      isHelmUnique: this.isHelmUnique,
      isHelmSuperior: this.isHelmSuperior,
      armor: this.armor,
      armorLevel: this.armorLevel,
      isArmorUnique: this.isArmorUnique,
      isArmorSuperior: this.isArmorSuperior,
      belt: this.belt,
      beltLevel: this.beltLevel,
      isBeltUnique: this.isBeltUnique,
      isBeltSuperior: this.isBeltSuperior,
      playerLevel: this.level,
      defense: this.bonus.defense,
      absorbedDamage: this.bonus.absorbedDamage,
      partyDefense: this.partyBonus.defense,
      cape: this.cape,
      capeLevel: this.capeLevel,
      isCapeUnique: this.isCapeUnique,
      isCapeSuperior: this.isCapeSuperior,
      shield: this.shield,
      shieldLevel: this.shieldLevel,
      isShieldUnique: this.isShieldUnique,
      isShieldSuperior: this.isShieldSuperior,
      skillDefense: this.skill.defense,
    });

    if (mob.type === "mob" && mob.enchants?.length) {
      if (mob.enchants.includes("physical")) {
        rawDmg = Math.round(rawDmg * 1.35);
      }
    }

    let dmg = defense > rawDmg ? 0 : rawDmg - defense;

    // @NOTE Pierce dmg bypasses the defense
    dmg += pierceDamage + elementDamage;

    // Minimum Hurt dmg (can't be 0)
    if (!dmg) {
      dmg = randomInt(3, 5);
    }

    if (mob.type === "mob" && mob.enchants?.length) {
      mob.enchants.forEach(enchant => {
        if (!Types.elements.includes(enchant)) return;

        // 15% of base dmg are elemental dmgs
        const enchantDmg = this.calculateElementDamage({ element: enchant, dmg: Math.floor(rawDmg * 0.35) });
        dmg += enchantDmg;
      });
    }

    if (this.bonus.blockChance) {
      const blockRandom = random(100);
      isBlocked = blockRandom < this.bonus.blockChance;
      if (isBlocked) {
        dmg = 0;
      }
    }

    if (this.bonus.lightningDamage) {
      lightningDamage = this.bonus.lightningDamage;

      const mobResistance = Types.getResistance(mob).lightningResistance;
      const receivedLightningDamage = Math.round(lightningDamage - lightningDamage * (mobResistance / 100));

      if (mob.type === "mob") {
        mob.receiveDamage(receivedLightningDamage);
      } else if (mob.type === "player") {
        mob.hitPoints -= receivedLightningDamage;
      }

      this.server.handleHurtEntity({ entity: mob, attacker: this, dmg: receivedLightningDamage });
    }

    if (mob.kind === Types.isBoss(mob.kind)) {
      // Each boss gets a 15% crit chance
      if (random(100) < 15) {
        dmg = Math.ceil(dmg * 1.5);
      }
    }

    if (!isBlocked && mob.kind === Types.Entities.MINOTAUR) {
      const isFrozen = random(100) < 30 - this.bonus.reduceFrozenChance;
      if (isFrozen) {
        this.broadcast(new Messages.Frozen(this.id, Types.getFrozenTimePerLevel(10)));
      }
    }

    this.hitPoints -= dmg;
    this.server.handleHurtEntity({ entity: this, attacker: mob, isBlocked, dmg });

    this.handleHurtDeath();

    return { dmg, isBlocked };
  }

  calculateElementDamage(spell: { element: Elements; dmg: number }) {
    const resistance = Types.calculateResistance(
      this.bonus[`${spell.element}Resistance`] + this.skill.resistances,
      this.curse.resistances,
    );

    const dmg = Math.round(spell.dmg - spell.dmg * (resistance / 100));

    if (spell.element === "cold") {
      const isSlowedRandom = random(100);
      const isSlowed = isSlowedRandom > Math.floor(resistance / 2) + this.bonus.reduceFrozenChance;
      if (isSlowed) {
        this.broadcast(new Messages.Slowed(this.id, Types.getFrozenTimePerLevel(10)));
      }
    } else if (spell.element === "poison") {
      this.startPoisoned({ dmg: spell.dmg, entity: this, resistance: this.bonus.poisonResistance });
    }

    return dmg;
  }

  handleHurtSpellDmg(spell) {
    let dmg = this.calculateElementDamage(spell);

    let isBlocked = false;
    if (spell.casterKind === Types.Entities.SKELETONARCHER && this.bonus.blockChance) {
      const blockRandom = random(100);
      isBlocked = blockRandom < this.bonus.blockChance;
      if (isBlocked) {
        dmg = 0;
      }
    }

    this.hitPoints -= dmg;
    this.server.handleHurtEntity({ entity: this, attacker: spell, isBlocked, dmg });

    this.handleHurtDeath();
  }

  handleHurtTrapDmg(trap) {
    const dmg = 300;

    this.hitPoints -= dmg;
    this.server.handleHurtEntity({ entity: this, attacker: trap, dmg });

    this.handleHurtDeath();
  }

  startPoisoned({ dmg, entity, resistance, attacker = {} }) {
    const baseIterations = 5;
    const tick = 3000;
    let iterations = Math.round(baseIterations - baseIterations * (resistance / 100));

    this.broadcast(new Messages.Poisoned(entity.id, iterations * tick));
    clearInterval(entity.poisonedInterval);

    entity.poisonedInterval = setInterval(() => {
      let poisonDmg = Math.round(
        (dmg -
          dmg *
            (Types.calculateResistance(
              Types.getResistance(entity, attacker).poisonResistance + (entity.skill?.resistances || 0),
              entity.curse?.resistances || 0,
            ) /
              100)) /
          5,
      );

      if (iterations && poisonDmg && entity.hitPoints > 0) {
        entity.hitPoints -= poisonDmg;
        this.server.handleHurtEntity({ entity, attacker, dmg: poisonDmg });
        iterations--;
      } else {
        clearInterval(entity.poisonedInterval);
      }
    }, tick);
  }

  handleHurtDeath() {
    if (this.hitPoints <= 0) {
      this.clearTarget();

      this.isDead = true;

      if (this.attackSkillTimeout) {
        clearTimeout(this.attackSkillTimeout);
        this.attackSkillTimeout = null;
      }
      if (this.defenseSkillTimeout) {
        clearTimeout(this.defenseSkillTimeout);
        this.defenseSkillTimeout = null;
      }
      if (this.defenseSkillDefenseTimeout) {
        this.skill.defense = 0;
        clearTimeout(this.defenseSkillDefenseTimeout);
        this.defenseSkillDefenseTimeout = null;
      }
      if (this.defenseSkillResistancesTimeout) {
        this.skill.resistances = 0;
        clearTimeout(this.defenseSkillResistancesTimeout);
        this.defenseSkillResistancesTimeout = null;
      }
      if (this.firefoxpotionTimeout) {
        clearTimeout(this.firefoxpotionTimeout);
        this.firefoxpotionTimeout = null;
      }
      if (this.poisonedInterval) {
        clearInterval(this.poisonedInterval);
        this.poisonedInterval = null;
      }
      if (this.cursedTimeout) {
        clearTimeout(this.cursedTimeout);
        this.cursedTimeout = null;
        this.resetCurse();
      }
    }
  }

  send(message) {
    this.connection.send(message);
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
    socket,
    skill,
    skin,
    type,
  }: {
    kind: number;
    level: number;
    bonus?: number[];
    socket?: number[];
    skill?: number;
    skin?: number;
    type?: string;
  }) {
    return new Messages.EquipItem(this, { kind, level, bonus, socket, skill, skin, type });
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

  equipHelm(helm, kind, level, rawBonus, socket) {
    const bonus = toArray(rawBonus);
    this.helm = helm;
    this.helmKind = kind;
    this.helmLevel = toNumber(level);
    this.helmBonus = bonus?.filter(oneBonus => oneBonus !== 43);
    this.helmSocket = toArray(socket);
    this.isHelmUnique = !!this.helmBonus?.length;
    this.isHelmSuperior = bonus?.includes(43);
  }

  equipArmor(armor, kind, level, rawBonus, socket) {
    const bonus = toArray(rawBonus);
    this.armor = armor;
    this.armorKind = kind;
    this.armorLevel = toNumber(level);
    this.armorBonus = bonus?.filter(oneBonus => oneBonus !== 43);
    this.armorSocket = toArray(socket);
    this.isArmorUnique = !!this.armorBonus?.length;
    this.isArmorSuperior = bonus?.includes(43);
  }

  equipWeapon(weapon, kind, level, rawBonus, socket, skill) {
    const bonus = toArray(rawBonus);
    this.weapon = weapon;
    this.weaponKind = kind;
    this.weaponLevel = toNumber(level);
    this.weaponBonus = bonus?.filter(oneBonus => oneBonus !== 43);
    this.weaponSocket = toArray(socket);
    this.isWeaponUnique = !!this.weaponBonus?.length;
    this.isWeaponSuperior = bonus?.includes(43);
    this.attackSkill = toNumber(skill);
  }

  equipBelt(belt, level, rawBonus) {
    const bonus = toArray(rawBonus);
    this.belt = belt;
    this.beltLevel = toNumber(level);
    this.beltBonus = bonus?.filter(oneBonus => oneBonus !== 43);
    this.isBeltUnique = !!this.beltBonus?.length;
    this.isBeltSuperior = bonus?.includes(43);
  }

  equipCape(cape, kind, level, rawBonus) {
    const bonus = toArray(rawBonus);
    this.cape = cape;
    this.capeKind = kind;
    this.capeLevel = toNumber(level);
    this.capeBonus = bonus?.filter(oneBonus => oneBonus !== 43);
    this.isCapeUnique = this.capeBonus?.length >= 2;
    this.isCapeSuperior = bonus?.includes(43);
  }

  equipPet(pet, kind, level, rawBonus, socket, skin) {
    const bonus = toArray(rawBonus);
    this.pet = pet;
    this.petKind = kind;
    this.petLevel = toNumber(level);
    this.petBonus = bonus?.filter(oneBonus => oneBonus !== 43);
    this.petSocket = toArray(socket);
    this.isPetUnique = this.petBonus?.length >= 2;
    this.isPetSuperior = bonus?.includes(43);
    this.petSkin = toNumber(skin);
  }

  equipShield(shield, kind, level, rawBonus, socket, skill) {
    const bonus = toArray(rawBonus);
    this.shield = shield;
    this.shieldKind = kind;
    this.shieldLevel = toNumber(level);
    this.shieldBonus = bonus?.filter(oneBonus => oneBonus !== 43);
    this.shieldSocket = toArray(socket);
    this.isShieldUnique = this.shieldBonus?.length >= 2;
    this.isShieldSuperior = bonus?.includes(43);
    this.defenseSkill = toNumber(skill);
  }

  equipRing1(ring, level, bonus) {
    this.ring1 = ring;
    this.ring1Level = toNumber(level);
    this.ring1Bonus = toArray(bonus);
  }

  equipRing2(ring, level, bonus) {
    this.ring2 = ring;
    this.ring2Level = toNumber(level);
    this.ring2Bonus = toArray(bonus);
  }

  equipAmulet(amulet, level, bonus) {
    this.amulet = amulet;
    this.amuletLevel = toNumber(level);
    this.amuletBonus = toArray(bonus);
  }

  getEquipment() {
    return [this.weapon, this.helm, this.armor, this.belt, this.shield, this.ring1, this.ring2, this.amulet];
  }

  calculateBonus() {
    this.freezeChanceLevel = 0;
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
        this.helmBonus
          ? {
              level: this.helmLevel,
              bonus: this.helmBonus,
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
        this.petBonus
          ? {
              level: this.petLevel,
              bonus: this.petBonus,
            }
          : null,
      ].filter(Boolean);

      bonusToCalculate.forEach(({ bonus, level }) => {
        if (bonus) {
          Object.entries(Types.getBonus(bonus, level)).forEach(([type, stats]) => {
            if (type === "freezeChance" && level > this.freezeChanceLevel) {
              this.freezeChanceLevel = level;
            }
            this.bonus[type] += stats;
          });
        }
      });

      // @NOTE the magic bonus damage on a weapon is by default
      if (this.weapon !== "dagger" && !this.isWeaponUnique) {
        this.bonus.magicDamage += Types.getWeaponMagicDamage(this.weaponLevel);
      }

      if (this.bonus.drainLife) {
        this.auras.push("drainlife");
      }
      if (this.bonus.lightningDamage) {
        this.auras.push("thunderstorm");
      }
      if (this.bonus.highHealth) {
        this.auras.push("highhealth");
      }
      if (this.bonus.freezeChance) {
        this.auras.push("freeze");
      }
      this.broadcast(new Messages.Auras(this), false);
    } catch (err) {
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
    this.auras = [];
    this.bonus = Types.bonusType.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});

    // Not part of the attributes
    this.bonus.resistanceSpectral = 0;
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
      allResistance: 0,
      extraGold: 0,
    };
  }

  resetSkill() {
    this.skill = {
      defense: 0,
      resistances: 0,
    };
  }

  resetCurse() {
    this.curse = {
      health: 0,
      resistances: 0,
    };
  }

  hasCurse() {
    return Object.values(this.curse).some(percent => percent !== 0);
  }

  equipItem({ item, level, bonus, socket, skill, skin, type }) {
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
    } else if (type === "pet") {
      const kind = Types.getKindFromString(item);

      this.databaseHandler.equipPet(this.name, item, level, bonus, socket, skin);
      this.equipPet(item, kind, level, bonus, socket, skin);

      if (this.petEntity) {
        this.server.despawn(this.petEntity);
        this.petEntity = null;
      }

      // @TODO mak pet item kind to PET character
      if (this.pet) {
        const { id, x, y } = this;
        this.petEntity = new Pet({
          id: "9" + id,
          type: "pet",
          kind: petKindToPetMap[kind],
          skin: this.petSkin,
          level: this.petLevel,
          x,
          y,
          ownerId: id,
        });

        // this.petEntity.group = this.group;
        // this.petEntity.onMove(this.server.onMobMoveCallback.bind(this));

        this.server.addEntity(this.petEntity);
      }
    } else if (type === "shield") {
      this.databaseHandler.equipShield(this.name, item, level, bonus, socket, skill);
      this.equipShield(item, Types.getKindFromString(item), level, bonus, socket, skill);
    } else if (item && level) {
      const kind = Types.getKindFromString(item);

      console.debug(this.name + " equips " + item);

      if (Types.isArmor(kind)) {
        this.databaseHandler.equipArmor(this.name, item, level, bonus, socket);
        this.equipArmor(item, kind, level, bonus, socket);
      } else if (Types.isHelm(kind)) {
        this.databaseHandler.equipHelm(this.name, item, level, bonus, socket);
        this.equipHelm(item, kind, level, bonus, socket);
      } else if (Types.isWeapon(kind)) {
        this.databaseHandler.equipWeapon(this.name, item, level, bonus, socket, skill);
        this.equipWeapon(item, kind, level, bonus, socket, skill);
      }
    }

    this.resetBonus();
    this.calculateBonus();
    this.calculateSetBonus();
    this.calculateSocketBonus();
    this.calculatePartyBonus();
    this.calculateGlobalBonus();
    this.validateCappedBonus();
    this.updateHitPoints();
    this.sendPlayerStats();
  }

  calculateGlobalBonus() {
    if (this.hasGrimoire) {
      this.bonus.allResistance += 10;
    }
    if (this.hasObelisk) {
      this.bonus.health += 50;
    }

    if (this.bonus.allResistance || this.partyBonus.allResistance) {
      this.bonus.magicResistance = Types.calculateResistance(
        this.bonus.magicResistance + this.bonus.allResistance + this.partyBonus.allResistance,
      );
      this.bonus.flameResistance = Types.calculateResistance(
        this.bonus.flameResistance + this.bonus.allResistance + this.partyBonus.allResistance,
      );
      this.bonus.lightningResistance = Types.calculateResistance(
        this.bonus.lightningResistance + this.bonus.allResistance + this.partyBonus.allResistance,
      );
      this.bonus.coldResistance = Types.calculateResistance(
        this.bonus.coldResistance + this.bonus.allResistance + this.partyBonus.allResistance,
      );
      this.bonus.poisonResistance = Types.calculateResistance(
        this.bonus.poisonResistance + this.bonus.allResistance + this.partyBonus.allResistance,
      );
    }

    if (this.bonus.magicDamagePercent) {
      this.bonus.magicDamage += Math.round((this.bonus.magicDamagePercent / 100) * this.bonus.magicDamage);
    }
    if (this.bonus.flameDamagePercent) {
      this.bonus.flameDamage += Math.round((this.bonus.flameDamagePercent / 100) * this.bonus.flameDamage);
    }
    if (this.bonus.lightningDamagePercent) {
      this.bonus.lightningDamage += Math.round((this.bonus.lightningDamagePercent / 100) * this.bonus.lightningDamage);
    }
    if (this.bonus.coldDamagePercent) {
      this.bonus.coldDamage += Math.round((this.bonus.coldDamagePercent / 100) * this.bonus.coldDamage);
    }
    if (this.bonus.poisonDamagePercent) {
      this.bonus.poisonDamage += Math.round((this.bonus.poisonDamagePercent / 100) * this.bonus.poisonDamage);
    }

    if (this.bonus.coldResistance) {
      this.bonus.reduceFrozenChance += Math.floor(this.bonus.coldResistance / 3);
    }
  }

  validateCappedBonus() {
    Object.entries(Types.bonusCap).forEach(([bonus, cap]) => {
      if (this.bonus[bonus] > cap) {
        this.bonus[bonus] = cap;
      }
    });
  }

  calculateSetBonus() {
    const bonus = {};
    const setItems = {};

    this.getEquipment().forEach(item => {
      const set = Types.kindAsStringToSet[item];
      if (set) {
        if (typeof setItems[set] !== "number") {
          setItems[set] = 0;
        }
        setItems[set] += 1;
      }
    });

    if (Object.keys(setItems).length) {
      Object.entries(setItems).forEach(([key, value]) => {
        // Give all set bonus if all items are equipped
        if (Types.setItems[key].length === value) {
          value = Object.keys(Types.setBonus[key]).length;
        }

        Types.getSetBonus(key, value).forEach(({ type, stats }) => {
          if (typeof bonus[type] !== "number") {
            bonus[type] = 0;
          }
          bonus[type] += stats;
        });
      });
    }

    if (Object.keys(bonus)) {
      Object.entries(bonus).map(([type, stats]) => {
        this.bonus[type] += stats;
      });
    }

    this.send(new Messages.SetBonus(setItems).serialize());
  }

  calculateSocketBonus() {
    let socketRuneBonus = {};
    let socketJewelBonus = {};

    [
      this.helmSocket ? [this.helmLevel, this.helmSocket, this.isHelmUnique, "helm"] : undefined,
      this.armorSocket ? [this.armorLevel, this.armorSocket, this.isArmorUnique, "armor"] : undefined,
      this.weaponSocket ? [this.weaponLevel, this.weaponSocket, this.isWeaponUnique, "weapon"] : undefined,
      this.shieldSocket ? [this.shieldLevel, this.shieldSocket, this.isShieldUnique, "shield"] : undefined,
    ]
      .filter(Boolean)
      .forEach(([level, rawSocket, isUnique, type]) => {
        const { runewordBonus } = Types.getRunewordBonus({ isUnique, socket: rawSocket, type });

        if (runewordBonus) {
          socketRuneBonus = runewordBonus;
          socketJewelBonus = {};
        } else {
          socketRuneBonus = Types.getRunesBonus(rawSocket);
          socketJewelBonus = Types.getJewelBonus(rawSocket);
        }

        // @ts-ignore
        if (socketRuneBonus.freezeChance || socketJewelBonus.freezeChance) {
          if (typeof level === "number" && level > this.freezeChanceLevel) {
            this.freezeChanceLevel = level;
          }
        }

        this.bonus = Types.combineBonus(this.bonus, socketRuneBonus);
        this.bonus = Types.combineBonus(this.bonus, socketJewelBonus);
      });
  }

  updateHitPoints(reset?: boolean) {
    const isInParty = this.getParty()?.members.length >= 2;

    const maxHitPoints =
      Formulas.hp({
        helmLevel: this.helmLevel,
        armorLevel: this.armorLevel,
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

  timeout() {
    this.connection.sendUTF8("timeout");
    this.connection.close("Player was idle for too long");
  }

  sendLevelInProgress() {
    const { x, y } = this;

    if (x === 34 && y === 498 && this.server.minotaurLevelClock) {
      this.send(new Messages.LevelInProgress(this.server.minotaurLevelClock, "minotaur").serialize());
    } else if (y >= 464 && y <= 535 && x <= 534 && this.server.cowLevelClock) {
      this.send(new Messages.LevelInProgress(this.server.cowLevelClock, "cow").serialize());
    } else if (y >= 696 && y <= 733 && x <= 29 && this.server.chaliceLevelClock) {
      this.send(new Messages.LevelInProgress(this.server.chaliceLevelClock, "chalice").serialize());
    } else if (y >= 696 && y <= 733 && x >= 85 && x <= 112 && this.server.stoneLevelClock) {
      this.send(new Messages.LevelInProgress(this.server.stoneLevelClock, "stone").serialize());
    } else if (y >= 744 && y <= 781 && x <= 29 && this.server.gatewayLevelClock) {
      this.send(new Messages.LevelInProgress(this.server.gatewayLevelClock, "gateway").serialize());
    } else if (y >= 744 && x >= 84 && this.server.templeLevelClock) {
      this.send(new Messages.LevelInProgress(this.server.templeLevelClock, "temple").serialize());
    }
  }

  sendPlayerStats() {
    const isInParty = this.getParty()?.members.length >= 2;

    const { min: minDefense, max: maxDefense } = Formulas.minMaxDefense({
      helm: this.helm,
      helmLevel: this.helmLevel,
      isHelmUnique: this.isHelmUnique,
      isHelmSuperior: this.isHelmSuperior,
      armor: this.armor,
      armorLevel: this.armorLevel,
      isArmorUnique: this.isArmorUnique,
      isArmorSuperior: this.isArmorSuperior,
      belt: this.belt,
      beltLevel: this.beltLevel,
      isBeltUnique: this.isBeltUnique,
      isBeltSuperior: this.isBeltSuperior,
      playerLevel: this.level,
      defense: this.bonus.defense,
      absorbedDamage: this.bonus.absorbedDamage,
      cape: this.cape,
      capeLevel: this.capeLevel,
      isCapeUnique: this.isCapeUnique,
      isCapeSuperior: this.isCapeSuperior,
      shield: this.shield,
      shieldLevel: this.shieldLevel,
      isShieldUnique: this.isShieldUnique,
      isShieldSuperior: this.isShieldSuperior,
      partyDefense: isInParty ? this.partyBonus.defense : 0,
      skillDefense: this.skill.defense,
    });
    const {
      min: minDamage,
      max: maxDamage,
      attackDamage,
    } = Formulas.minMaxDamage({
      weapon: this.weapon,
      weaponLevel: this.weaponLevel,
      isWeaponUnique: this.isWeaponUnique,
      isWeaponSuperior: this.isWeaponSuperior,
      playerLevel: this.level,
      minDamage: this.bonus.minDamage + (isInParty ? this.partyBonus.minDamage : 0),
      maxDamage: this.bonus.maxDamage + (isInParty ? this.partyBonus.maxDamage : 0),
      magicDamage: this.bonus.magicDamage + (isInParty ? this.partyBonus.magicDamage : 0),
      attackDamage: this.bonus.attackDamage,
      drainLife: this.bonus.drainLife,
      flameDamage: this.bonus.flameDamage,
      lightningDamage: this.bonus.lightningDamage,
      coldDamage: this.bonus.coldDamage,
      poisonDamage: this.bonus.poisonDamage,
      pierceDamage: this.bonus.pierceDamage,
      partyAttackDamage: isInParty ? this.partyBonus.attackDamage : 0,
    });

    const stats = {
      maxHitPoints: this.maxHitPoints,
      damage: minDamage !== maxDamage ? `${minDamage}-${maxDamage}` : maxDamage,
      defense:
        minDefense !== maxDefense
          ? `${minDefense - this.bonus.absorbedDamage}-${maxDefense - this.bonus.absorbedDamage}`
          : maxDefense - this.bonus.absorbedDamage,
      attackDamage,
      absorbedDamage: this.bonus.absorbedDamage,
      exp: this.bonus.exp + this.partyBonus.exp,
      criticalHit: this.bonus.criticalHit,
      blockChance: this.bonus.blockChance,
      magicFind: Types.calculateMagicFind(this.bonus.magicFind),
      extraGold: Types.calculateExtraGold(this.bonus.extraGold + this.partyBonus.extraGold),
      attackSpeed: Types.calculateAttackSpeed(this.bonus.attackSpeed),
      magicDamage: this.bonus.magicDamage + this.partyBonus.magicDamage,
      flameDamage: this.bonus.flameDamage,
      lightningDamage: this.bonus.lightningDamage,
      coldDamage: this.bonus.coldDamage,
      poisonDamage: this.bonus.poisonDamage,
      pierceDamage: this.bonus.pierceDamage,
      skillTimeout: Types.calculateSkillTimeout(this.bonus.skillTimeout),
      magicDamagePercent: this.bonus.magicDamagePercent,
      flameDamagePercent: this.bonus.flameDamagePercent,
      lightningDamagePercent: this.bonus.lightningDamagePercent,
      coldDamagePercent: this.bonus.coldDamagePercent,
      poisonDamagePercent: this.bonus.poisonDamagePercent,
      lowerMagicResistance: this.bonus.lowerMagicResistance,
      lowerFlameResistance: this.bonus.lowerFlameResistance,
      lowerLightningResistance: this.bonus.lowerLightningResistance,
      lowerColdResistance: this.bonus.lowerColdResistance,
      lowerPoisonResistance: this.bonus.lowerPoisonResistance,
      lowerAllResistance: this.bonus.lowerAllResistance,
      magicResistance: Types.calculateResistance(
        this.bonus.magicResistance + this.skill.resistances,
        this.curse.resistances,
      ),
      flameResistance: Types.calculateResistance(
        this.bonus.flameResistance + this.skill.resistances - this.curse.resistances,
      ),
      lightningResistance: Types.calculateResistance(
        this.bonus.lightningResistance + this.skill.resistances - this.curse.resistances,
      ),
      coldResistance: Types.calculateResistance(
        this.bonus.coldResistance + this.skill.resistances - this.curse.resistances,
      ),
      poisonResistance: Types.calculateResistance(
        this.bonus.poisonResistance + this.skill.resistances - this.curse.resistances,
      ),
      freezeChance: this.bonus.freezeChance,
      reduceFrozenChance: this.bonus.reduceFrozenChance,
      drainLife: this.bonus.drainLife,
      regenerateHealth: this.bonus.regenerateHealth + Math.floor(this.maxHitPoints / 33),
    };

    this.send(new Messages.Stats(stats).serialize());
  }

  incExp(exp) {
    if (this.experience >= MAX_EXP) {
      return;
    }

    this.experience = this.experience + exp;
    if (this.experience > MAX_EXP) {
      this.experience = MAX_EXP;
    }

    this.databaseHandler.setExp(this.name, this.experience);
    var originalLevel = this.level;
    this.level = Types.getLevel(this.experience);
    if (originalLevel !== this.level) {
      this.updateHitPoints(true);
      this.sendPlayerStats();
      this.server.updatePopulation({ levelupPlayer: this.id });

      if (this.discordId) {
        // @TODO figure out a way to sync the new level
      }

      if (this.level >= 60) {
        postMessageToDiscordEventChannel(`${this.name} is now lv.${this.level}`);
      }
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

  startPeriodicHashCheck() {
    this.checkHashInterval = setInterval(() => {
      const delay = Date.now() - this.lastHashCheckTimestamp;

      if (delay > 5000) {
        clearInterval(this.checkHashInterval);
        this.checkHashInterval = null;

        // this.databaseHandler.banPlayerByIP({
        //   player: this,
        //   reason: "cheating",
        //   message: `invalid interval hash check ${delay}`,
        // });
      }
    }, 60000);
  }

  sendWelcome({
    account,
    helm,
    armor,
    weapon,
    belt,
    cape,
    pet,
    shield,
    ring1,
    ring2,
    amulet,
    exp,
    gold,
    goldStash,
    coin,
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
    expansion2,
    waypoints,
    depositAccount,
    depositAccountIndex,
    settings,
    network,
    discordId,
  }) {
    try {
      // @NOTE: Make sure the player has authenticated if he has the expansion
      if (this.isPasswordRequired && !this.isPasswordValid) {
        this.connection.sendUTF8("passwordinvalid");
        return;
      }

      this.canChat = !this.server.chatBan.some(
        ({ player: playerName, ip }) => playerName === this.name || ip === this.ip,
      );
      this.account = account;

      // @NOTE: Leave no trace
      delete this.isPasswordRequired;
      delete this.isPasswordValid;

      const [playerHelm, playerHelmLevel = 1, playerHelmBonus, playerHelmSocket] = helm.split(":");
      const [playerArmor, playerArmorLevel = 1, playerArmorBonus, playerArmorSocket] = armor.split(":");
      const [playerWeapon, playerWeaponLevel = 1, playerWeaponBonus, playerWeaponSocket, playerWeaponSkill] =
        weapon.split(":");

      this.kind = Types.Entities.WARRIOR;

      this.equipHelm(
        playerHelm,
        Types.getKindFromString(playerHelm),
        playerHelmLevel,
        playerHelmBonus,
        playerHelmSocket,
      );
      this.equipArmor(
        playerArmor,
        Types.getKindFromString(playerArmor),
        playerArmorLevel,
        playerArmorBonus,
        playerArmorSocket,
      );
      this.equipWeapon(
        playerWeapon,
        Types.getKindFromString(playerWeapon),
        playerWeaponLevel,
        playerWeaponBonus,
        playerWeaponSocket,
        playerWeaponSkill,
      );

      if (belt) {
        const [playerBelt, playerBeltLevel, playerBeltBonus] = belt.split(":");
        this.equipBelt(playerBelt, playerBeltLevel, playerBeltBonus);
      }
      if (cape) {
        const [playerCape, playerCapeLevel, playerCapeBonus] = cape.split(":");
        this.equipCape(playerCape, Types.getKindFromString(playerCape), playerCapeLevel, playerCapeBonus);
      }
      if (pet) {
        const [playerPet, playerPetLevel, playePetBonus, playerPetSockt, playerPetSkin] = pet.split(":");
        this.equipPet(
          playerPet,
          Types.getKindFromString(playerPet),
          playerPetLevel,
          playePetBonus,
          playerPetSockt,
          playerPetSkin,
        );
      }
      if (shield) {
        const [playerShield, playerShieldLevel, playerShieldBonus, playerShieldSocket, playerDefenseSkill] =
          shield.split(":");
        this.equipShield(
          playerShield,
          Types.getKindFromString(playerShield),
          playerShieldLevel,
          playerShieldBonus,
          playerShieldSocket,
          playerDefenseSkill,
        );
      }
      if (ring1) {
        const [playerRing1, playerRing1Level, playerRing1Bonus] = ring1.split(":");
        this.equipRing1(playerRing1, playerRing1Level, playerRing1Bonus);
      }
      if (ring2) {
        const [playerRing2, playerRing2Level, playerRing2Bonus] = ring2.split(":");
        this.equipRing2(playerRing2, playerRing2Level, playerRing2Bonus);
      }
      if (amulet) {
        const [playerAmulet, playerAmuletLevel, playerAmuletBonus] = amulet.split(":");
        this.equipAmulet(playerAmulet, playerAmuletLevel, playerAmuletBonus);
      }
      this.achievement = achievement;
      this.waypoints = waypoints;
      this.expansion1 = expansion1;
      this.expansion2 = expansion2;
      this.depositAccount = depositAccount;
      this.depositAccountIndex = depositAccountIndex;
      this.inventory = inventory;
      this.stash = stash;
      this.hash = hash;
      this.hasRequestedBossPayout = !!hash;
      this.capeHue = settings.capeHue;
      this.capeSaturate = settings.capeSaturate;
      this.capeContrast = settings.capeContrast;
      this.capeBrightness = settings.capeBrightness;
      this.pvp = settings.pvp;

      this.createdAt = createdAt;
      this.experience = exp;
      this.level = Types.getLevel(this.experience);
      this.orientation = randomOrientation();
      this.network = network;
      this.nanoPotions = nanoPotions;
      this.discordId = discordId;
      this.gold = gold;
      this.goldStash = goldStash;

      if (!x || !y) {
        this.updatePosition();
      } else {
        if (x >= 84 && y >= 744 && !this.server.templeLevelClock) {
          x = randomInt(40, 46);
          y = randomInt(581, 585);
        }
        this.setPosition(x, y);
      }

      this.chatBanEndTime = chatBanEndTime;

      this.server.addPlayer(this);
      this.server.enter_callback(this);

      const { members, partyLeader } = this.getParty() || {};

      this.hasGrimoire = !!achievement[ACHIEVEMENT_GRIMOIRE_INDEX];
      this.hasObelisk = !!achievement[ACHIEVEMENT_OBELISK_INDEX];
      this.hasNft = !!achievement[ACHIEVEMENT_NFT_INDEX];
      this.hasWing = !!achievement[ACHIEVEMENT_WING_INDEX];
      this.hasCrystal = !!achievement[ACHIEVEMENT_CRYSTAL_INDEX];

      if (this.pet) {
        const { id } = this;
        const kind = Types.getKindFromString(this.pet);

        this.petEntity = new Pet({
          id: "9" + id,
          type: "pet",
          kind: petKindToPetMap[kind],
          skin: this.petSkin,
          level: this.petLevel,
          x,
          y,
          ownerId: id,
        });
        // this.petEntity.group = this.group;
        // this.petEntity.onMove(this.server.onMobMoveCallback.bind(this));
        this.server.addEntity(this.petEntity);
      }

      this.send([
        Types.Messages.WELCOME,
        {
          id: this.id,
          name: this.name,
          account,
          x: this.x,
          y: this.y,
          hitpoints: this.hitPoints,
          helm,
          armor,
          weapon,
          belt,
          cape,
          pet,
          shield,
          ring1,
          ring2,
          amulet,
          experience: this.experience,
          gold,
          goldStash,
          coin,
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
          auras: this.auras,
          cowLevelPortalCoords: this.server.cowLevelCoords,
          settings,
          network,
          party: this.hasParty() ? { partyId: this.partyId, members, partyLeader } : null,
          isHurtByTrap: this.isHurtByTrap,
        },
      ]);

      this.sendLevelInProgress();

      this.resetBonus();
      this.calculateBonus();
      this.calculateSetBonus();
      this.calculateSocketBonus();
      this.calculatePartyBonus();
      this.calculateGlobalBonus();
      this.validateCappedBonus();
      this.updateHitPoints(true);
      this.sendPlayerStats();

      clearInterval(this.checkHashInterval);
      this.startPeriodicHashCheck();

      this.hasEnteredGame = true;
      this.isDead = false;
      this.isHurtByTrap = false;
    } catch (err) {
      Sentry.captureException(err, { extra: { player: this.name } });
    }
  }
}

export default Player;
