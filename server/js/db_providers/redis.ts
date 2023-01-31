import bcrypt from "bcrypt";
import * as NanocurrencyWeb from "nanocurrency-web";
import redis from "redis";

import { kinds, Types } from "../../../shared/js/gametypes";
import {
  INVENTORY_SLOT_COUNT,
  Slot,
  STASH_SLOT_COUNT,
  STASH_SLOT_RANGE,
  TRADE_SLOT_COUNT,
  TRADE_SLOT_RANGE,
  UPGRADE_SLOT_COUNT,
  UPGRADE_SLOT_RANGE,
  WAYPOINTS_COUNT,
} from "../../../shared/js/slots";
import { ACHIEVEMENT_COUNT } from "../../../shared/js/types/achievements";
import { getRunewordBonus } from "../../../shared/js/types/rune";
import { toArray, toDb } from "../../../shared/js/utils";
import { discordClient, EmojiMap, postMessageToDiscordAnvilChannel } from "../discord";
import Messages from "../message";
import { PromiseQueue } from "../promise-queue";
import { Sentry } from "../sentry";
import {
  generateBlueChestItem,
  generateGreenChestItem,
  generatePurpleChestItem,
  generateRedChestItem,
  getIsTransmuteSuccess,
  isUpgradeSuccess,
  isValidAddWeaponSkill,
  isValidRecipe,
  isValidSocketItem,
  isValidStoneSocket,
  isValidTransmuteItems,
  isValidUpgradeItems,
  isValidUpgradeRunes,
  NaN2Zero,
  randomInt,
} from "../utils";

import type Player from "../player";

const GEM_COUNT = 5;
const ARTIFACT_COUNT = 4;

const { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD, DEPOSIT_SEED } = process.env;

const queue = new PromiseQueue();

const getNewDepositAccountByIndex = async (index: number, network: Network): Promise<string> => {
  let depositAccount = null;

  depositAccount = await NanocurrencyWeb.wallet.legacyAccounts(DEPOSIT_SEED, index, index)[0].address;

  if (network === "ban") {
    depositAccount = depositAccount.replace("nano_", "ban_");
  }

  return depositAccount;
};

const defaultSettings = {
  capeHue: 0,
  capeSaturate: 0,
  capeContrast: 0,
  capeBrightness: 1,
};

class DatabaseHandler {
  client: any;

  constructor() {
    this.client = redis.createClient(REDIS_PORT, REDIS_HOST, {
      socket_nodelay: true,
      ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : null),
    });

    this.client.on("connect", () => {
      this.setDepositAccount();
    });

    // client.auth(process.env.REDIS_PASSWORD || "");
  }

  loadPlayer(player) {
    var userKey = "u:" + player.name;
    this.client.smembers("usr", (_err, replies) => {
      for (var index = 0; index < replies.length; index++) {
        if (replies[index].toString() === player.name) {
          this.client
            .multi()
            .hget(userKey, "account") // 0
            .hget(userKey, "armor") // 1
            .hget(userKey, "weapon") // 2
            .hget(userKey, "exp") // 3
            .hget(userKey, "createdAt") // 4
            .hget(userKey, "achievement") // 5
            .hget(userKey, "inventory") // 6
            .hget(userKey, "x") // 7
            .hget(userKey, "y") // 8
            .hget(userKey, "hash") // 9
            .hget(userKey, "nanoPotions") // 10
            .hget(userKey, "gems") // 11
            .hget(userKey, "upgrade") // 12
            .hget(userKey, "ring1") // 13
            .hget(userKey, "ring2") // 14
            .hget(userKey, "amulet") // 15
            .hget(userKey, "belt") // 16
            .hget(userKey, "cape") // 17
            .hget(userKey, "shield") // 18
            .hget(userKey, "artifact") // 19
            .hget(userKey, "expansion1") // 20
            .hget(userKey, "expansion2") // 21
            .hget(userKey, "waypoints") // 22
            .hget(userKey, "depositAccount") // 23
            .hget(userKey, "depositAccountIndex") // 24
            .hget(userKey, "stash") // 25
            .hget(userKey, "settings") // 26
            .hget(userKey, "network") // 27
            .hget(userKey, "trade") // 28
            .hget(userKey, "discordId") // 29
            .hget(userKey, "migrations") // 30

            .exec(async (err, replies) => {
              if (err) {
                Sentry.captureException(err, {
                  user: {
                    username: player.name,
                  },
                });
                return;
              }

              var account = replies[0];
              var armor = replies[1];
              var weapon = replies[2];
              var exp = NaN2Zero(replies[3]);
              var createdAt = NaN2Zero(replies[4]);
              var ring1 = replies[13];
              var ring2 = replies[14];
              var amulet = replies[15];
              var belt = replies[16];
              var cape = replies[17];
              var shield = replies[18];
              var expansion1 = !!parseInt(replies[20] || "0");
              var expansion2 = !!parseInt(replies[21] || "0");
              var depositAccount = replies[23];
              var depositAccountIndex = replies[24];
              var network = replies[27];
              var discordId = replies[29];
              var migrations = replies[30] ? JSON.parse(replies[30]) : {};

              const [, rawAccount] = account.split("_");
              const [rawNetwork, rawPlayerAccount] = player.account.split("_");

              if (rawPlayerAccount != rawAccount) {
                player.connection.sendUTF8("invalidlogin");
                player.connection.close("Wrong Account: " + player.name);
                return;
              }

              try {
                if (!depositAccount) {
                  depositAccountIndex = await this.createDepositAccount();
                  depositAccount = await getNewDepositAccountByIndex(depositAccountIndex, network);
                  this.client.hmset(
                    "u:" + player.name,
                    "depositAccount",
                    depositAccount,
                    "depositAccountIndex",
                    depositAccountIndex,
                  );
                }
              } catch (errDepositAccount) {
                Sentry.captureException(errDepositAccount, {
                  user: {
                    username: player.name,
                  },
                  extra: {
                    depositAccountIndex,
                    depositAccount,
                  },
                });
                return;
              }

              // @NOTE: Change the player network and depositAccount according to the login account so
              // nano players can be on bananobrowserquest and ban players can be on nanobrowserquest
              network = rawNetwork;
              if (!depositAccount.startsWith(network)) {
                const [, rawDepositAccount] = depositAccount.split("_");
                depositAccount = `${network}_${rawDepositAccount}`;
              }

              if (!armor) {
                armor = `clotharmor:1`;
                this.client.hset("u:" + player.name, "armor", armor);
              } else {
                var [playerArmor, armorLevel] = armor.split(":");
                if (isNaN(armorLevel)) {
                  armor = `${playerArmor}:1`;
                  this.client.hset("u:" + player.name, "armor", armor);
                }
              }

              if (!weapon || weapon.startsWith("sword1")) {
                weapon = `dagger:1`;
                this.client.hset("u:" + player.name, "weapon", weapon);
              } else {
                var [playerWeapon, weaponLevel] = (weapon || "").split(":");
                if (isNaN(weaponLevel)) {
                  weapon = `${playerWeapon}:1`;
                  this.client.hset("u:" + player.name, "weapon", weapon);
                } else if (playerWeapon === "sword2") {
                  weapon = `sword:${weaponLevel}`;
                  this.client.hset("u:" + player.name, "weapon", weapon);
                }
              }

              var achievement = new Array(ACHIEVEMENT_COUNT).fill(0);
              try {
                achievement = JSON.parse(replies[5]);

                // Migrate old achievements to new
                if (achievement.length === 20) {
                  achievement = achievement
                    .slice(0, 15)
                    .concat([0, achievement[15], 0, 0, 0])
                    .concat(achievement.slice(16, 20));

                  this.client.hset("u:" + player.name, "achievement", JSON.stringify(achievement));
                }

                if (achievement.length < ACHIEVEMENT_COUNT) {
                  achievement = achievement.concat(new Array(ACHIEVEMENT_COUNT - achievement.length).fill(0));
                  this.client.hset("u:" + player.name, "achievement", JSON.stringify(achievement));
                }
              } catch (errAchievements) {
                // invalid json
                Sentry.captureException(errAchievements, {
                  user: {
                    username: player.name,
                  },
                  extra: {
                    achievement,
                  },
                });
              }

              var stash = new Array(STASH_SLOT_COUNT).fill(0);
              try {
                if (replies[25]) {
                  stash = JSON.parse(replies[25]);

                  // Migrate extended stash
                  if (stash.length < STASH_SLOT_COUNT) {
                    stash = stash.concat(new Array(STASH_SLOT_COUNT - stash.length).fill(0));

                    await new Promise(resolve => {
                      this.client.hset("u:" + player.name, "stash", JSON.stringify(stash), () => {
                        resolve(true);
                      });
                    });
                  }
                } else {
                  await new Promise(resolve => {
                    this.client.hset("u:" + player.name, "stash", JSON.stringify(stash), () => {
                      resolve(true);
                    });
                  });
                }
              } catch (errStash) {
                // invalid json
                Sentry.captureException(errStash, {
                  user: {
                    username: player.name,
                  },
                });
              }

              // Waypoint
              // 0 - Not Available, the player did not open the waypoint
              // 1 - Available, the character opened the waypoint
              // 2 - Locked, the player did not purchase the expansion
              let waypoints;
              try {
                waypoints = JSON.parse(replies[22]);

                if (waypoints && waypoints.length < WAYPOINTS_COUNT) {
                  waypoints = waypoints.concat(new Array(WAYPOINTS_COUNT - waypoints.length).fill(2));

                  this.client.hset("u:" + player.name, "waypoints", JSON.stringify(waypoints));
                } else if (!waypoints) {
                  waypoints = [1, 0, 0, 2, 2, 2, 2, 2, 2];

                  this.client.hset("u:" + player.name, "waypoints", JSON.stringify(waypoints));
                }
              } catch (errWaypoints) {
                // invalid json
                Sentry.captureException(errWaypoints, {
                  user: {
                    username: player.name,
                  },
                  extra: {
                    waypoints,
                  },
                });
              }

              var inventory = replies[6];
              try {
                if (!inventory) {
                  inventory = new Array(INVENTORY_SLOT_COUNT).fill(0);
                  await new Promise(resolve => {
                    this.client.hset("u:" + player.name, "inventory", JSON.stringify(inventory), () => {
                      resolve(true);
                    });
                  });
                } else {
                  let hasSword2 = /sword2/.test(replies[6]);
                  inventory = JSON.parse(replies[6].replace(/sword2/g, "sword"));

                  // Migrate inventory
                  if (inventory.length < INVENTORY_SLOT_COUNT || hasSword2) {
                    inventory = inventory.concat(new Array(INVENTORY_SLOT_COUNT - inventory.length).fill(0));

                    await new Promise(resolve => {
                      this.client.hset("u:" + player.name, "inventory", JSON.stringify(inventory), () => {
                        resolve(true);
                      });
                    });
                  }
                }
              } catch (errInventory) {
                Sentry.captureException(errInventory, {
                  user: {
                    username: player.name,
                  },
                  extra: {
                    inventory,
                  },
                });
              }

              var upgrade = replies[12];
              try {
                // Migrate upgrade
                if (!upgrade) {
                  upgrade = new Array(UPGRADE_SLOT_COUNT).fill(0);
                  this.client.hset("u:" + player.name, "upgrade", JSON.stringify(upgrade));
                }
              } catch (errUpgrade) {
                Sentry.captureException(errUpgrade, {
                  user: {
                    username: player.name,
                  },
                  extra: {
                    upgrade,
                  },
                });
              }

              var trade = replies[28];
              try {
                // Migrate trade
                if (!trade) {
                  trade = new Array(TRADE_SLOT_COUNT).fill(0);

                  await new Promise(resolve => {
                    this.client.hset("u:" + player.name, "trade", JSON.stringify(trade), () => {
                      resolve(true);
                    });
                  });
                }
              } catch (errTrade) {
                Sentry.captureException(errTrade, {
                  user: {
                    username: player.name,
                  },
                  extra: {
                    trade,
                  },
                });
              }

              if (!migrations?.shields) {
                await Promise.all([
                  new Promise(resolve => {
                    const [item, level, bonus, skill] = shield.split(":");
                    shield = [item, level, bonus || `[]`, `[]`, skill].filter(Boolean).join(":");

                    this.client.hset("u:" + player.name, "shield", shield);

                    resolve(true);
                  }),
                  new Promise(resolve => {
                    stash = stash.map(rawItem => {
                      if (typeof rawItem === "string" && rawItem.startsWith("shield")) {
                        const [item, level, bonus, skill] = rawItem.split(":");
                        return [item, level, bonus || `[]`, `[]`, skill].filter(Boolean).join(":");
                      }
                      return rawItem;
                    });
                    this.client.hset("u:" + player.name, "stash", JSON.stringify(stash));

                    resolve(true);
                  }),
                  new Promise(resolve => {
                    inventory = inventory.map(rawItem => {
                      if (typeof rawItem === "string" && rawItem.startsWith("shield")) {
                        const [item, level, bonus, skill] = rawItem.split(":");
                        return [item, level, bonus || `[]`, `[]`, skill].filter(Boolean).join(":");
                      }
                      return rawItem;
                    });
                    this.client.hset("u:" + player.name, "inventory", JSON.stringify(inventory));

                    resolve(true);
                  }),
                ]).then(() => {
                  console.log(`Shield migration completed for ${player.name}`);

                  this.client.hset("u:" + player.name, "migrations", JSON.stringify({ ...migrations, shields: true }));
                });
              }

              var gems = new Array(GEM_COUNT).fill(0);
              try {
                if (!replies[11]) {
                  this.client.hset("u:" + player.name, "gems", JSON.stringify(gems));
                } else {
                  gems = JSON.parse(replies[11]);

                  if (gems.length !== GEM_COUNT) {
                    gems = gems.concat(new Array(GEM_COUNT - gems.length).fill(0));

                    this.client.hset("u:" + player.name, "gems", JSON.stringify(gems));
                  }
                }
              } catch (errGems) {
                Sentry.captureException(errGems);
              }

              var artifact = new Array(ARTIFACT_COUNT).fill(0);
              try {
                if (!replies[19]) {
                  this.client.hset("u:" + player.name, "artifact", JSON.stringify(artifact));
                } else {
                  artifact = JSON.parse(replies[19]);
                }
              } catch (errArtifact) {
                Sentry.captureException(errArtifact);
              }

              var settings = replies[26];
              try {
                settings = Object.assign({ ...defaultSettings }, JSON.parse(settings || "{}"));
              } catch (_err) {
                // Silence err
              }

              var x = NaN2Zero(replies[7]);
              var y = NaN2Zero(replies[8]);
              var hash = replies[9];
              var nanoPotions = parseInt(replies[10] || 0);

              console.info("Player name: " + player.name);
              console.info("Armor: " + armor);
              console.info("Weapon: " + weapon);
              console.info("Experience: " + exp);

              player.sendWelcome({
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
              });
            });
          return;
        }
      }

      // Could not find the user
      player.connection.sendUTF8("invalidlogin");
      player.connection.close("User does not exist: " + player.name);
      return;
    });
  }

  createPlayer(player) {
    var userKey = "u:" + player.name;
    var curTime = new Date().getTime();

    // Check if username is taken
    this.client.sismember("usr", player.name, async (err, reply) => {
      if (reply === 1) {
        player.connection.sendUTF8("userexists");
        player.connection.close("Username not available: " + player.name);
        return;
      } else {
        // Add the player
        const depositAccountIndex = await this.createDepositAccount();
        const depositAccount = await getNewDepositAccountByIndex(depositAccountIndex as number, player.network);

        if (typeof depositAccountIndex !== "number" || !depositAccount) {
          Sentry.captureException(new Error("Invalid deposit account"));
          return;
        }

        this.client
          .multi()
          .sadd("usr", player.name)
          .hset(userKey, "account", player.account)
          .hset(userKey, "armor", "clotharmor:1")
          .hset(userKey, "exp", 0)
          .hset(userKey, "ip", player.ip || "")
          .hset(userKey, "createdAt", curTime)
          .hset(userKey, "achievement", JSON.stringify(new Array(ACHIEVEMENT_COUNT).fill(0)))
          .hset(userKey, "inventory", JSON.stringify(new Array(INVENTORY_SLOT_COUNT).fill(0)))
          .hset(userKey, "stash", JSON.stringify(new Array(STASH_SLOT_COUNT).fill(0)))
          .hset(userKey, "nanoPotions", 0)
          .hset(userKey, "weapon", "dagger:1")
          .hset(userKey, "armor", "clotharmor:1")
          .hset(userKey, "belt", null)
          .hset(userKey, "cape", null)
          .hset(userKey, "shield", null)
          .hset(userKey, "settings", "{}")
          .hset(userKey, "ring1", null)
          .hset(userKey, "ring2", null)
          .hset(userKey, "amulet", null)
          .hset(userKey, "gems", JSON.stringify(new Array(GEM_COUNT).fill(0)))
          .hset(userKey, "artifact", JSON.stringify(new Array(ARTIFACT_COUNT).fill(0)))
          .hset(userKey, "upgrade", JSON.stringify(new Array(UPGRADE_SLOT_COUNT).fill(0)))
          .hset(userKey, "trade", JSON.stringify(new Array(TRADE_SLOT_COUNT).fill(0)))
          .hset(userKey, "expansion1", 0)
          .hset(userKey, "expansion2", 0)
          .hset(userKey, "waypoints", JSON.stringify([1, 0, 0, 2, 2, 2, 2, 2, 2]))
          .hset(userKey, "depositAccountIndex", depositAccountIndex)
          .hset(userKey, "depositAccount", depositAccount)
          .hset(userKey, "network", player.network)
          .exec((_err, _replies) => {
            console.info("New User: " + player.name);
            player.sendWelcome({
              armor: "clotharmor:1",
              weapon: "dagger:1",
              belt: null,
              cape: null,
              shield: null,
              exp: 0,
              createdAt: curTime,
              x: player.x,
              y: player.y,
              achievement: new Array(ACHIEVEMENT_COUNT).fill(0),
              inventory: [],
              nanoPotions: 0,
              gems: new Array(GEM_COUNT).fill(0),
              artifact: new Array(ARTIFACT_COUNT).fill(0),
              expansion1: false,
              expansion2: false,
              waypoints: [1, 0, 0, 2, 2, 2, 2, 2, 2],
              stash: new Array(STASH_SLOT_COUNT).fill(0),
              depositAccount,
              depositAccountIndex,
              settings: defaultSettings,
              network: player.network,
            });
          });
      }
    });
  }

  async checkIsBannedByIP(player) {
    return new Promise((resolve, _reject) => {
      const ipKey = "ipban:" + player.connection._connection.handshake.headers["cf-connecting-ip"];

      this.client
        .multi()
        .hget(ipKey, "timestamp") // 0
        .hget(ipKey, "reason") // 1
        .exec(async (err, replies) => {
          resolve({ timestamp: replies[0], reason: replies[1] });
        });
    });
  }

  async checkIsBannedForReason(playerName) {
    return new Promise((resolve, _reject) => {
      const banKey = "ban:" + playerName;

      this.client
        .multi()
        .hget(banKey, "timestamp") // 0
        .hget(banKey, "reason") // 1
        .exec(async (err, replies) => {
          resolve({ timestamp: replies[0], reason: replies[1] });
        });
    });
  }

  banPlayerByIP(banPlayer, reason, message) {
    if (!banPlayer?.connection?._connection?.handshake?.headers?.["cf-connecting-ip"]) return;

    // 24h
    let days = 1;
    this.client.hget(
      "ipban:" + banPlayer.connection._connection.handshake.headers["cf-connecting-ip"],
      "timestamp",
      (err, reply) => {
        if (reply) {
          days = 365;
        }
        const until = days * 24 * 60 * 60 * 1000 + Date.now();
        this.client.hset(
          "ipban:" + banPlayer.connection._connection.handshake.headers["cf-connecting-ip"],
          "timestamp",
          until,
          "reason",
          reason || "",
          "message",
          message || "",
        );

        banPlayer.connection.sendUTF8(`banned-${reason}-${days}`);
        banPlayer.connection.close(`You are banned, ${reason}.`);
      },
    );

    return;
  }

  banPlayerForReason(playerName, period, reason) {
    const until = parseInt(period) * 24 * 60 * 60 * 1000 + Date.now();

    this.client.hmset("ban:" + playerName, "timestamp", until, "reason", reason);
    return;
  }

  chatBan(adminPlayer, targetPlayer) {
    this.client.smembers("adminname", (_err, replies) => {
      for (var index = 0; index < replies.length; index++) {
        if (replies[index].toString() === adminPlayer.name) {
          var curTime = new Date().getTime();
          adminPlayer.server.pushBroadcast(
            new Messages.Chat(targetPlayer, "/1 " + adminPlayer.name + "-- 채금 ->" + targetPlayer.name + " 10분"),
          );
          targetPlayer.chatBanEndTime = curTime + 10 * 60 * 1000;
          this.client.hset(
            "cb:" + targetPlayer.connection._connection.handshake.headers["cf-connecting-ip"],
            "etime",
            targetPlayer.chatBanEndTime.toString(),
          );
          console.info(
            adminPlayer.name +
              "-- Chatting BAN ->" +
              targetPlayer.name +
              " to " +
              new Date(targetPlayer.chatBanEndTime).toString(),
          );
          return;
        }
      }
    });
  }

  equipWeapon(name, weapon, level, bonus = [], socket = [], skill) {
    console.info("Set Weapon: " + name + " " + weapon + ":" + level);
    this.client.hset("u:" + name, "weapon", `${weapon}:${level}${toDb(bonus)}${toDb(socket)}${toDb(skill)}`);
  }

  equipArmor(name, armor, level, bonus = [], socket = []) {
    console.info("Set Armor: " + name + " " + armor + ":" + level);
    this.client.hset("u:" + name, "armor", `${armor}:${level}${toDb(bonus)}${toDb(socket)}`);
  }

  equipBelt(name, belt, level, bonus) {
    if (belt) {
      console.info("Set Belt: " + name + " " + belt + ":" + level);
      this.client.hset("u:" + name, "belt", `${belt}:${level}${toDb(bonus)}`);
    } else {
      console.info("Delete Belt");
      this.client.hdel("u:" + name, "belt");
    }
  }

  equipShield(name, shield, level, bonus = [], socket = [], skill) {
    if (shield) {
      console.info(`Set Shield: ${name} ${shield} ${level} ${bonus} ${socket} ${skill}`);
      this.client.hset("u:" + name, "shield", `${shield}:${level}${toDb(bonus)}${toDb(socket)}${toDb(skill)}`);
    } else {
      console.info("Delete Shield");
      this.client.hdel("u:" + name, "shield");
    }
  }

  equipCape(name, cape, level, bonus) {
    if (cape) {
      console.info("Set Cape: " + name + " " + cape + ":" + level);
      this.client.hset("u:" + name, "cape", `${cape}:${level}${toDb(bonus)}`);
    } else {
      console.info("Delete Cape");
      this.client.hdel("u:" + name, "cape");
    }
  }

  setSettings(name, settings) {
    this.client.hget("u:" + name, "settings", (err, reply) => {
      try {
        var parsedReply = reply ? JSON.parse(reply) : {};

        settings = JSON.stringify(Object.assign(parsedReply, settings));
        this.client.hset("u:" + name, "settings", settings);
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  }

  equipRing1({ name, item, level, bonus }) {
    const ring1 = [item, level, bonus].filter(Boolean).join(":") || null;

    console.info(`Set Ring1: ${name} ring1`);
    if (ring1) {
      this.client.hset("u:" + name, "ring1", ring1);
    } else {
      this.client.hdel("u:" + name, "ring1");
    }
  }

  equipRing2({ name, item, level, bonus }) {
    const ring2 = [item, level, bonus].filter(Boolean).join(":") || null;

    console.info(`Set Ring2: ${name} ring2`);
    if (ring2) {
      this.client.hset("u:" + name, "ring2", ring2);
    } else {
      this.client.hdel("u:" + name, "ring2");
    }
  }

  equipAmulet({ name, item, level, bonus }) {
    const amulet = [item, level, bonus].filter(Boolean).join(":") || null;

    console.info(`Set Amulet: ${name} amulet`);
    if (amulet) {
      this.client.hset("u:" + name, "amulet", amulet);
    } else {
      this.client.hdel("u:" + name, "amulet");
    }
  }

  setExp(name, exp) {
    console.info("Set Exp: " + name + " " + exp);
    this.client.hset("u:" + name, "exp", exp);
  }

  setHash(name, hash) {
    console.info("Set Hash: " + name + " " + hash);
    this.client.hset("u:" + name, "hash", hash);
  }

  getItemLocation(slot: number): [string, number] {
    if (slot < INVENTORY_SLOT_COUNT) {
      return ["inventory", 0];
    } else if (slot === Slot.WEAPON) {
      return ["weapon", 0];
    } else if (slot === Slot.ARMOR) {
      return ["armor", 0];
    } else if (slot === Slot.BELT) {
      return ["belt", 0];
    } else if (slot === Slot.CAPE) {
      return ["cape", 0];
    } else if (slot === Slot.SHIELD) {
      return ["shield", 0];
    } else if (slot === Slot.RING1) {
      return ["ring1", 0];
    } else if (slot === Slot.RING2) {
      return ["ring2", 0];
    } else if (slot === Slot.AMULET) {
      return ["amulet", 0];
    } else if (slot >= UPGRADE_SLOT_RANGE && slot <= UPGRADE_SLOT_RANGE + UPGRADE_SLOT_COUNT - 1) {
      return ["upgrade", UPGRADE_SLOT_RANGE];
    } else if (slot >= TRADE_SLOT_RANGE && slot <= TRADE_SLOT_RANGE + TRADE_SLOT_COUNT - 1) {
      return ["trade", TRADE_SLOT_RANGE];
    } else if (slot >= STASH_SLOT_RANGE && slot <= STASH_SLOT_RANGE + STASH_SLOT_COUNT) {
      return ["stash", STASH_SLOT_RANGE];
    }

    return ["", 0];
  }

  sendMoveItem({ player, location, data }) {
    const type = location;
    const isEquipment = ["weapon", "armor", "belt", "cape", "shield", "ring1", "ring2", "amulet"].includes(location);

    let item = null;
    let level = null;
    let bonus = null;
    let socket = null;
    let skill = null;
    if (isEquipment && data) {
      [item, level, bonus, socket, skill] = data.split(":");
    } else if (!data) {
      if (type === "weapon") {
        item = "dagger";
        level = 1;
      } else if (type === "armor") {
        item = "clotharmor";
        level = 1;
      }
    }

    if (location === "inventory") {
      player.send([Types.Messages.INVENTORY, data]);
    } else if (location === "stash") {
      player.send([Types.Messages.STASH, data]);
    } else if (location === "weapon") {
      player.equipItem({ item, level, type, bonus, socket, skill });
      player.broadcast(
        player.equip({
          kind: player.weaponKind,
          level: player.weaponLevel,
          bonus: player.weaponBonus,
          socket: player.weaponSocket,
          skill: player.attackSkill,
          type,
        }),
        false,
      );
    } else if (location === "armor") {
      player.equipItem({ item, level, type, bonus, socket });
      player.broadcast(
        player.equip({
          kind: player.armorKind,
          level: player.armorLevel,
          bonus: player.armorBonus,
          socket: player.armorSocket,
          type,
        }),
        false,
      );
    } else if (location === "belt") {
      player.equipItem({ item, level, type, bonus });
      player.send(player.equip({ kind: Types.getKindFromString(item), level, bonus, type }).serialize());
    } else if (location === "cape") {
      player.equipItem({ item, level, type, bonus });
      player.broadcast(
        player.equip({ kind: player.capeKind, level: player.capeLevel, bonus: player.capeBonus, type }),
        false,
      );
    } else if (location === "shield") {
      player.equipItem({ item, level, type, bonus, socket, skill });
      player.broadcast(
        player.equip({
          kind: player.shieldKind,
          level: player.shieldLevel,
          bonus: player.shieldBonus,
          socket: player.shieldSocket,
          skill: player.defenseSkill,
          type,
        }),
        false,
      );
    } else if (location === "ring1") {
      player.equipItem({ item, level, type, bonus });
      player.send(player.equip({ kind: Types.getKindFromString(item), level, bonus, type }).serialize());
    } else if (location === "ring2") {
      player.equipItem({ item, level, type, bonus });
      player.send(player.equip({ kind: Types.getKindFromString(item), level, bonus, type }).serialize());
    } else if (location === "amulet") {
      player.equipItem({ item, level, type, bonus });
      player.send(player.equip({ kind: Types.getKindFromString(item), level, bonus, type }).serialize());
    } else if (location === "upgrade") {
      player.send([Types.Messages.UPGRADE, data]);
    } else if (location === "trade") {
      const tradeInstance = player.server.getTrade(player.tradeId);

      if (!tradeInstance?.players.find(({ id }) => id === player.id)) {
        // This should not happen..
        Sentry.captureException(new Error(`Invalid trade instance or Player ${player.name} not part of it`));
      } else {
        tradeInstance.update({ data, player1Id: player.id });
      }
    }
  }

  moveItem({ player, fromSlot, toSlot, quantity: movedQuantity = 0 }) {
    if (fromSlot === toSlot) return;

    const [fromLocation, fromRange] = this.getItemLocation(fromSlot);
    const [toLocation, toRange] = this.getItemLocation(toSlot);
    const isMultipleFrom = ["inventory", "upgrade", "trade", "stash"].includes(fromLocation);
    const isMultipleTo = ["inventory", "upgrade", "trade", "stash"].includes(toLocation);

    if (!fromLocation || !toLocation) return;
    if (movedQuantity && fromLocation !== "inventory" && toLocation !== "inventory") return;

    if ([fromLocation, toLocation].includes("trade") && player.tradeId) {
      const tradeInstance = player.server.trades[player.tradeId];
      if (!tradeInstance || tradeInstance.players.find(({ id, isAccepted }) => player.id === id && isAccepted)) {
        return;
      }
    }

    this.client.hget("u:" + player.name, fromLocation, (_err, fromReply) => {
      let fromItem;
      let toItem;
      try {
        let fromReplyParsed = isMultipleFrom ? JSON.parse(fromReply) : fromReply;
        fromItem = isMultipleFrom ? fromReplyParsed[fromSlot - fromRange] : fromReplyParsed;

        // Should never happen but who knows
        if (["dagger:1", "clotharmor:1"].includes(fromItem) && toSlot !== -1) return;

        if (toLocation === fromLocation) {
          toItem = fromReplyParsed[toSlot - toRange];

          if (toSlot !== -1) {
            fromReplyParsed[toSlot - toRange] = fromItem;
            fromReplyParsed[fromSlot - fromRange] = toItem || 0;
          } else {
            // Delete the item in the -1 toSlot
            fromReplyParsed[fromSlot - fromRange] = 0;
          }

          this.client.hset("u:" + player.name, fromLocation, JSON.stringify(fromReplyParsed));
          this.sendMoveItem({ player, location: fromLocation, data: fromReplyParsed });
        } else {
          this.client.hget("u:" + player.name, toLocation, (_err, toReply) => {
            try {
              let isFromReplyDone = false;
              let isToReplyDone = false;
              let toReplyParsed = isMultipleTo ? JSON.parse(toReply) : toReply;
              toItem = isMultipleTo ? toReplyParsed[toSlot - toRange] : toReplyParsed;

              if (["dagger:1", "clotharmor:1"].includes(toItem)) {
                toItem = 0;
              }

              // @NOTE Strict rule, 1 upgrade scroll limit, tweak this later on
              if (Types.isQuantity(fromItem)) {
                const [fromScroll, fromQuantity] = fromItem.split(":");

                // trying to move more than the current quantity
                if (movedQuantity && movedQuantity > fromQuantity) return;

                if (toLocation === "inventory" || toLocation === "stash" || toLocation === "trade") {
                  let toItemIndex = toReplyParsed.findIndex(a => a && a.startsWith(fromScroll));

                  if (toItemIndex === -1) {
                    // @note put the quantity, not found in toLocation
                    toItemIndex = toItem ? toReplyParsed.indexOf(0) : toSlot - toRange;
                  }

                  if (toItemIndex > -1) {
                    const [, toQuantity = 0] = (toReplyParsed[toItemIndex] || "").split(":");

                    toReplyParsed[toItemIndex] = `${fromScroll}:${
                      parseInt(toQuantity) + parseInt(`${movedQuantity || fromQuantity}`)
                    }`;

                    if (movedQuantity && fromQuantity - movedQuantity > 0) {
                      fromReplyParsed[fromSlot - fromRange] = `${fromScroll}:${
                        parseInt(fromQuantity) - parseInt(`${movedQuantity}`)
                      }`;
                    } else {
                      fromReplyParsed[fromSlot - fromRange] = 0;
                    }

                    isFromReplyDone = true;
                    isToReplyDone = true;
                  }
                } else if (toLocation === "upgrade") {
                  const isScroll = Types.isScroll(fromItem) || Types.isStone(fromItem) || Types.isChest(fromItem);
                  const isRune = Types.isRune(fromItem);
                  const hasScroll = isScroll
                    ? toReplyParsed.some((a, i) => i !== 0 && a && (a.startsWith("scroll") || a.startsWith("stone")))
                    : false;

                  if ((isScroll && !hasScroll) || (isRune && !toReplyParsed[toSlot - toRange])) {
                    fromReplyParsed[fromSlot - fromRange] =
                      fromQuantity > 1 ? `${fromScroll}:${parseInt(fromQuantity) - 1}` : 0;
                    toReplyParsed[toSlot - toRange] = `${fromScroll}:1`;
                  }

                  isFromReplyDone = true;
                  isToReplyDone = true;
                }
              } else if (
                ["weapon", "armor", "belt", "cape", "shield", "ring1", "ring2", "amulet"].includes(toLocation)
              ) {
                // @NOTE IMPORTANT fromItem.split is not a function!?
                const [item, fromLevel] = fromItem.split(":");
                if (
                  Types.getItemRequirement(item, fromLevel) > player.level ||
                  !Types.isCorrectTypeForSlot(toLocation, item)
                ) {
                  isFromReplyDone = true;
                  isToReplyDone = true;
                }
              } else if (
                ["weapon", "armor", "belt", "cape", "shield", "ring1", "ring2", "amulet"].includes(fromLocation) &&
                toItem
              ) {
                const [item, toLevel] = toItem.split(":");
                if (
                  Types.getItemRequirement(item, toLevel) > player.level ||
                  !Types.isCorrectTypeForSlot(fromLocation, item)
                ) {
                  isFromReplyDone = true;
                  isToReplyDone = true;
                }
              }

              // Prevent trade for single items, each player needs to acquire
              if (
                (Types.isSingle(toItem) || Types.isSingle(fromItem)) &&
                (fromLocation === "trade" || toLocation === "trade")
              ) {
                isFromReplyDone = true;
                isToReplyDone = true;
              }

              if (!isToReplyDone) {
                if (isMultipleTo) {
                  toReplyParsed[toSlot - toRange] = fromItem;
                } else {
                  toReplyParsed = fromItem;
                }
              }

              if (!isFromReplyDone) {
                if (isMultipleFrom) {
                  fromReplyParsed[fromSlot - fromRange] = toItem || 0;
                } else {
                  fromReplyParsed = toItem || 0;
                }
              }

              if (isMultipleFrom) {
                this.client.hset("u:" + player.name, fromLocation, JSON.stringify(fromReplyParsed));
              }
              if (isMultipleTo) {
                this.client.hset("u:" + player.name, toLocation, JSON.stringify(toReplyParsed));
              }

              this.sendMoveItem({ player, location: fromLocation, data: fromReplyParsed });
              this.sendMoveItem({ player, location: toLocation, data: toReplyParsed });
            } catch (err) {
              console.log(err);
              Sentry.captureException(err);
            }
          });
        }
      } catch (err) {
        console.log(err);
        Sentry.captureException(err, {
          extra: {
            fromItem,
            toItem,
          },
        });
      }
    });
  }

  lootItems({ player, items }) {
    player.dbWriteQueue.enqueue(
      () =>
        new Promise((resolve, _reject) => {
          this.client.hget("u:" + player.name, "inventory", async (_err, reply) => {
            try {
              let inventory = JSON.parse(reply);

              items.forEach((rawItem: GeneratedItem) => {
                const { item, level, quantity, bonus, skill, socket } = rawItem;
                let slotIndex = quantity ? inventory.findIndex(a => a && a.startsWith(item)) : -1;

                // Increase the scroll/rune count
                if (slotIndex > -1) {
                  if (Types.isSingle(item)) {
                    inventory[slotIndex] = `${item}:1`;
                  } else {
                    const [, oldQuantity] = inventory[slotIndex].split(":");
                    inventory[slotIndex] = `${item}:${parseInt(oldQuantity) + parseInt(String(quantity))}`;
                  }
                } else if (slotIndex === -1) {
                  slotIndex = inventory.indexOf(0);
                  if (slotIndex !== -1) {
                    const levelQuantity = level || quantity;

                    if (!levelQuantity) {
                      throw new Error(`Invalid item property ${JSON.stringify({ rawItem })}`);
                    }

                    const delimiter = Types.isJewel(item) ? "|" : ":";
                    inventory[slotIndex] = [item, levelQuantity, bonus, socket, skill].filter(Boolean).join(delimiter);
                  } else if (player.hasParty()) {
                    // @TODO re-call the lootItems fn with next party member
                    // Currently the item does not get saved
                  }
                }
              });

              player.send([Types.Messages.INVENTORY, inventory]);
              await this.client.hset("u:" + player.name, "inventory", JSON.stringify(inventory), () => {
                resolve(true);
              });
            } catch (err) {
              console.log(err);
              Sentry.captureException(err);
              resolve(true);
            }
          });
        }),
    );
  }

  moveItemsToInventory(player, panel: "upgrade" | "trade" = "upgrade") {
    this.client.hget("u:" + player.name, "inventory", (_err, rawInvetory) => {
      const availableInventorySlots = JSON.parse(rawInvetory).filter(i => i === 0).length;

      this.client.hget("u:" + player.name, panel, (_err, reply) => {
        try {
          let data = JSON.parse(reply);
          const filteredUpgrade = data.filter(Boolean);

          if (filteredUpgrade.length) {
            const items = filteredUpgrade.reduce((acc, rawItem) => {
              if (!rawItem) return acc;
              const [item, level, bonus, socket, skill] = rawItem.split(":");
              const isQuantity = Types.isQuantity(item);

              acc.push({
                item,
                [isQuantity ? "quantity" : "level"]: level,
                bonus,
                socket,
                skill,
              });
              return acc;
            }, []);

            if (panel === "upgrade" && availableInventorySlots < items.length) {
              throw new Error("not enought inventory slots to move items from upgrade panel");
            }

            this.lootItems({ player, items });

            data = data.map(() => 0);
            this.client.hset("u:" + player.name, panel, JSON.stringify(data));

            if (panel === "upgrade") {
              player.send([Types.Messages.UPGRADE, data]);
            } else if (panel === "trade") {
              player.send(new Messages.Trade(Types.Messages.TRADE_ACTIONS.PLAYER1_MOVE_ITEM, data).serialize());
            }
          }
        } catch (err) {
          console.log(err);
          Sentry.captureException(err);
        }
      });
    });
  }

  upgradeItem(player: Player) {
    this.client.hget("u:" + player.name, "upgrade", (_err, reply) => {
      try {
        let isLucky7 = false;
        let isMagic8 = false;
        let upgrade = JSON.parse(reply);

        // Make sure the last slot is cleaned up
        if (upgrade[upgrade.length - 1] !== 0) {
          player.send([Types.Messages.UPGRADE, upgrade]);
          return;
        }

        let isBlessed = false;
        const slotIndex = upgrade.findIndex(index => {
          if (index) {
            if (index.startsWith("scrollupgradeblessed") || index.startsWith("scrollupgradesacred")) {
              isBlessed = true;
            }

            return index.startsWith("scroll") || index.startsWith("stone");
          }
        });
        let luckySlot = randomInt(1, 9);
        const isLuckySlot = slotIndex === luckySlot;
        const filteredUpgrade = upgrade.filter(Boolean);
        let isSuccess = false;
        let recipe = null;
        let random = null;
        let successRate = null;
        let transmuteSuccessRate = null;
        let uniqueSuccessRate = null;
        let isTransmuteSuccess = null;
        let isUniqueSuccess = null;
        let result;
        let nextRuneRank = null;
        let socketItem = null;
        let isNewSocketItem = false;
        let extractedItem = null;
        let socketCount = null;
        let weaponWithSkill = null;

        if ((weaponWithSkill = isValidAddWeaponSkill(filteredUpgrade))) {
          isSuccess = true;
          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = weaponWithSkill;
          player.broadcast(new Messages.AnvilUpgrade({ isSuccess }), false);
        } else if (isValidUpgradeItems(filteredUpgrade)) {
          const [item, level, bonus, socket, skill] = filteredUpgrade[0].split(":");
          const [scrollOrStone] = filteredUpgrade[1].split(":");
          const isUnique = Types.isUnique(item, bonus);
          let upgradedItem: number | string = 0;
          const isGuaranteedSuccess =
            Types.isStone(scrollOrStone) && ["stonedragon", "stonehero"].includes(scrollOrStone);

          ({ isSuccess, random, successRate } = isUpgradeSuccess({
            level,
            isLuckySlot,
            isBlessed,
            isGuaranteedSuccess,
          }));

          player.send(
            new Messages.AnvilOdds(
              `You rolled ${random}, the success rate is ${successRate}%. ${
                random <= successRate ? "Success" : "Failure"
              }`,
            ).serialize(),
          );

          if (isSuccess) {
            let upgradedLevel = parseInt(level) + 1;

            if (isGuaranteedSuccess) {
              if (scrollOrStone === "stonedragon") {
                upgradedLevel = Types.StoneUpgrade.stonedragon;
              } else if (scrollOrStone === "stonehero") {
                upgradedLevel = Types.StoneUpgrade.stonehero;
              }
            }

            upgradedItem = [item, upgradedLevel, bonus, socket, skill].filter(Boolean).join(":");
            isSuccess = true;

            if (Types.isBaseHighClassItem(item)) {
              if (upgradedLevel === 7) {
                isLucky7 = true;
              } else if (upgradedLevel === 8) {
                isMagic8 = true;
              }
            }

            if (upgradedLevel >= 8 || (isUnique && upgradedLevel >= 7)) {
              this.logUpgrade({ player, item: upgradedItem, isSuccess, isLuckySlot });
            }
          } else {
            if (parseInt(level) >= 8) {
              this.logUpgrade({ player, item: filteredUpgrade[0], isSuccess: false, isLuckySlot });
            }
          }

          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = upgradedItem;
          player.broadcast(new Messages.AnvilUpgrade({ isSuccess }), false);
        } else if ((nextRuneRank = isValidUpgradeRunes(filteredUpgrade))) {
          isSuccess = true;
          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = `rune-${Types.RuneList[nextRuneRank]}:1`;
          player.broadcast(new Messages.AnvilUpgrade({ isSuccess }), false);
        } else if ((socketItem = isValidSocketItem(filteredUpgrade))) {
          isSuccess = true;
          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = socketItem;

          this.logUpgrade({ player, item: socketItem, isSuccess, isRuneword: true });

          player.broadcast(new Messages.AnvilUpgrade({ isSuccess }), false);
        } else if ((result = isValidStoneSocket(filteredUpgrade, isLuckySlot))) {
          isSuccess = true;
          ({ socketItem, extractedItem, socketCount, isNewSocketItem } = result);
          if (extractedItem) {
            this.lootItems({ player, items: [extractedItem] });
          }
          if (socketCount === 6 && isNewSocketItem) {
            this.logUpgrade({ player, item: socketItem, isSuccess, isLuckySlot });
          }
          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = socketItem;
          player.broadcast(new Messages.AnvilUpgrade({ isSuccess }), false);
        } else if ((result = isValidTransmuteItems(filteredUpgrade))) {
          const [item, level] = filteredUpgrade[0].split(":");
          let generatedItem: number | string = 0;

          ({ random, transmuteSuccessRate, uniqueSuccessRate, isTransmuteSuccess, isUniqueSuccess } =
            getIsTransmuteSuccess({ ...result, isLuckySlot }));

          player.send(
            new Messages.AnvilOdds(
              `You rolled ${random}${
                transmuteSuccessRate ? `, the transmute success rate is ${transmuteSuccessRate}%` : ""
              }${
                uniqueSuccessRate && uniqueSuccessRate !== 100
                  ? `, the unique success rate is ${uniqueSuccessRate}`
                  : ""
              }. ${isTransmuteSuccess || isUniqueSuccess ? "Success" : "Failure"}`,
            ).serialize(),
          );

          if (
            (typeof isTransmuteSuccess === "boolean" && isTransmuteSuccess) ||
            (typeof isTransmuteSuccess === "undefined" && isUniqueSuccess)
          ) {
            isSuccess = true;
            const {
              item: itemName,
              bonus,
              socket,
              skill,
            } = player.generateItem({
              kind: Types.getKindFromString(item),
              uniqueChances: isUniqueSuccess ? 100 : 0,
              isLuckySlot,
            });

            generatedItem = [itemName, level, bonus, socket, skill].filter(Boolean).join(":");
          }

          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = generatedItem;
          player.broadcast(new Messages.AnvilUpgrade({ isTransmute: isSuccess }), false);
        } else {
          recipe = isValidRecipe(filteredUpgrade);

          let isWorkingRecipe = false;
          let generatedItem: number | string = 0;
          let isRecipe = false;
          let isChestblue = false;
          let isChestgreen = false;
          let isChestpurple = false;
          let isChestred = false;

          if (recipe) {
            isSuccess = true;
            if (recipe === "cowLevel") {
              if (!player.server.cowLevelClock) {
                isWorkingRecipe = true;
                isRecipe = true;
                player.server.startCowLevel();

                // Unique Wirtleg have guaranteed horn drop
                if (filteredUpgrade.find(item => item.startsWith("wirtleg") && item.includes("[3,14]"))) {
                  player.server.cowKingHornDrop = true;
                }
              }
            } else if (recipe === "minotaurLevel") {
              if (!player.server.minotaurLevelClock && !player.server.minotaurSpawnTimeout) {
                isWorkingRecipe = true;
                isRecipe = true;
                player.server.startMinotaurLevel();
              }
            } else if (
              recipe === "chestblue" ||
              recipe === "chestgreen" ||
              recipe === "chestpurple" ||
              recipe === "chestred"
            ) {
              let item;
              let uniqueChances;

              switch (recipe) {
                case "chestblue":
                  isChestblue = true;
                  ({ item, uniqueChances } = generateBlueChestItem());
                  break;
                case "chestgreen":
                  isChestgreen = true;
                  ({ item, uniqueChances } = generateGreenChestItem());
                  break;
                case "chestpurple":
                  isChestpurple = true;
                  ({ item, uniqueChances } = generatePurpleChestItem());
                  break;
                case "chestred":
                  isChestred = true;
                  ({ item, uniqueChances } = generateRedChestItem());
                  break;
              }

              if (!item) return;

              luckySlot = null;
              isWorkingRecipe = true;

              const {
                item: itemName,
                level,
                quantity,
                bonus,
                socket,
                skill,
              } = player.generateItem({ kind: Types.getKindFromString(item), uniqueChances });

              const delimiter = Types.isJewel(item) ? "|" : ":";
              generatedItem = [itemName, level, quantity, bonus, socket, skill].filter(Boolean).join(delimiter);
            }
          }

          if (!isWorkingRecipe) {
            this.moveItemsToInventory(player, "upgrade");
          } else {
            upgrade = upgrade.map(() => 0);
            upgrade[upgrade.length - 1] = generatedItem;
            if (isRecipe) {
              player.broadcast(new Messages.AnvilRecipe(recipe), false);
            } else if (isChestblue || isChestgreen || isChestpurple || isChestred) {
              player.broadcast(
                new Messages.AnvilUpgrade({ isChestblue, isChestgreen, isChestpurple, isChestred }),
                false,
              );
            }
          }
        }

        player.send([Types.Messages.UPGRADE, upgrade, { luckySlot, isLucky7, isMagic8, isSuccess, recipe }]);
        this.client.hset("u:" + player.name, "upgrade", JSON.stringify(upgrade));
      } catch (err1) {
        console.log(err1);
        Sentry.captureException(err1);
      }
    });
  }

  foundAchievement(name, index) {
    console.info("Found Achievement: " + name + " " + index + 1);
    this.client.hget("u:" + name, "achievement", (_err, reply) => {
      try {
        var achievement = JSON.parse(reply);
        achievement[index] = 1;
        achievement = JSON.stringify(achievement);
        this.client.hset("u:" + name, "achievement", achievement);
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  }

  foundWaypoint(name, index) {
    console.info("Found Waypoint: " + name + " " + index);
    this.client.hget("u:" + name, "waypoints", (_err, reply) => {
      try {
        var waypoints = JSON.parse(reply);
        waypoints[index] = 1;
        waypoints = JSON.stringify(waypoints);
        this.client.hset("u:" + name, "waypoints", waypoints);
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  }

  unlockExpansion1(player) {
    console.info("Unlock Expansion1: " + player.name);
    this.client.hset("u:" + player.name, "expansion1", 1);
    this.client.hget("u:" + player.name, "waypoints", (_err, reply) => {
      try {
        var waypoints = JSON.parse(reply);
        waypoints[3] = 1;
        waypoints[4] = 0;
        waypoints[5] = 0;
        player.send([Types.Messages.WAYPOINTS_UPDATE, waypoints]);
        waypoints = JSON.stringify(waypoints);
        this.client.hset("u:" + player.name, "waypoints", waypoints);
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  }

  unlockExpansion2(player) {
    console.info("Unlock Expansion2: " + player.name);
    this.client.hset("u:" + player.name, "expansion2", 1);
    this.client.hget("u:" + player.name, "waypoints", (_err, reply) => {
      try {
        var waypoints = JSON.parse(reply);
        waypoints[6] = 1;
        waypoints[7] = 0;
        waypoints[8] = 0;
        player.send([Types.Messages.WAYPOINTS_UPDATE, waypoints]);
        waypoints = JSON.stringify(waypoints);
        this.client.hset("u:" + player.name, "waypoints", waypoints);
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  }

  foundNanoPotion(name) {
    console.info("Found NanoPotion: " + name);
    this.client.hget("u:" + name, "nanoPotions", (_err, reply) => {
      try {
        if (reply) {
          this.client.hincrby("u:" + name, "nanoPotions", 1);
        } else {
          this.client.hset("u:" + name, "nanoPotions", 1);
        }
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  }

  foundGem(name, index) {
    console.info("Found Gem: " + name + " " + index + 1);
    this.client.hget("u:" + name, "gems", (_err, reply) => {
      try {
        var gems = reply ? JSON.parse(reply) : new Array(GEM_COUNT).fill(0);
        gems[index] = 1;
        gems = JSON.stringify(gems);
        this.client.hset("u:" + name, "gems", gems);
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  }

  foundArtifact(name, index) {
    console.info("Found Artifact: " + name + " " + index + 1);
    this.client.hget("u:" + name, "artifact", (_err, reply) => {
      try {
        var artifact = reply ? JSON.parse(reply) : new Array(ARTIFACT_COUNT).fill(0);
        artifact[index] = 1;
        artifact = JSON.stringify(artifact);
        this.client.hset("u:" + name, "artifact", artifact);
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  }

  useInventoryItem(player, item) {
    return new Promise(resolve => {
      this.client.hget("u:" + player.name, "inventory", (_err, reply) => {
        try {
          const inventory = JSON.parse(reply);
          const slotIndex = inventory.findIndex(rawItem => typeof rawItem === "string" && rawItem.startsWith(item));

          if (slotIndex !== -1) {
            inventory[slotIndex] = 0;
            player.send([Types.Messages.INVENTORY, inventory]);
            this.client.hset("u:" + player.name, "inventory", JSON.stringify(inventory));
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (err) {
          Sentry.captureException(err);
        }
      });
    });
  }

  passwordIsRequired(player) {
    return new Promise((resolve, _reject) => {
      var userKey = "u:" + player.name;

      try {
        this.client
          .multi()
          .hget(userKey, "password")
          .hget(userKey, "expansion1")
          .exec((err, replies) => {
            const password = replies[0];
            const expansion1 = !!parseInt(replies[1] || "0");

            let hasPassword = !!password;
            let isPasswordRequired = expansion1;

            // @TODO ~~~~ remove this
            if (player.name.startsWith("running-coder")) {
              resolve(false);
              return;
            }

            player.isPasswordRequired = isPasswordRequired;

            if (isPasswordRequired) {
              if (hasPassword) {
                player.connection.sendUTF8("passwordlogin");
              } else {
                player.connection.sendUTF8("passwordcreate");
              }
            }

            resolve(isPasswordRequired);
          });
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  }

  linkPlayerToDiscordUser(player, secret) {
    if (secret.length !== 6) return;

    this.client.get(`discord_secret:${secret}`, (err, discordUserId) => {
      if (!discordUserId) return;

      this.client.get(`discord:${discordUserId}`, (err, playerName) => {
        if (playerName) return;

        this.client.set(`discord:${discordUserId}`, player.name);
        this.client.del(`discord_secret:${secret}`);

        // Also link it on the player so it's easily searchable
        this.client.hset("u:" + player.name, "discordId", discordUserId);

        player.connection.send({
          type: Types.Messages.NOTIFICATION,
          message: "You are now linked with your Discord account!",
        });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        discordClient.users.fetch(discordUserId).then(user => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          user.send(`You linked ${player.name} to your Discord account!`);
        });
      });
    });
  }

  passwordLoginOrCreate(player, loginPassword) {
    return new Promise((resolve, _reject) => {
      var userKey = "u:" + player.name;
      var self = this;

      try {
        this.client
          .multi()
          .hget(userKey, "account")
          .hget(userKey, "password")
          .exec(async (err, replies) => {
            const account = replies[0];
            const password = replies[1];
            let isValid = false;

            const [, rawAccount] = account.split("_");
            const [, rawPlayerAccount] = player.account.split("_");

            if (rawPlayerAccount == rawAccount) {
              if (!password) {
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(loginPassword, salt);

                self.client.hset(userKey, "password", passwordHash);

                isValid = true;
                player.isPasswordValid = isValid;
              } else {
                isValid = await bcrypt.compare(loginPassword, password);
              }
            }

            if (!isValid) {
              player.connection.sendUTF8("passwordinvalid");
            }
            resolve(isValid);
          });
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  }

  // progressAchievement (name, number, progress) {
  //   console.info("Progress Achievement: " + name + " " + number + " " + progress);
  //   client.hset("u:" + name, "achievement" + number + ":progress", progress);
  // },

  setUsedPubPts(name, usedPubPts) {
    console.info("Set Used Pub Points: " + name + " " + usedPubPts);
    this.client.hset("u:" + name, "usedPubPts", usedPubPts);
  }

  setCheckpoint(name, x, y) {
    console.info("Set Check Point: " + name + " " + x + " " + y);
    this.client.hset("u:" + name, "x", x);
    this.client.hset("u:" + name, "y", y);
  }

  setDepositAccount() {
    this.client.setnx("deposit_account_count", 0);
  }

  async createDepositAccount(): Promise<unknown> {
    return await queue.enqueue(
      () =>
        new Promise((resolve, _reject) => {
          this.client.incr("deposit_account_count", (_err, reply: number) => {
            resolve(reply);
          });
        }),
    );
  }

  settlePurchase({ player, account, amount, hash, id }) {
    try {
      if (id === Types.Store.EXPANSION1) {
        player.expansion1 = true;
        this.unlockExpansion1(player);
        this.lootItems({ player, items: [{ item: "scrollupgradehigh", quantity: 10 }] });
      }
      if (id === Types.Store.EXPANSION2) {
        player.expansion2 = true;
        this.unlockExpansion2(player);
        this.lootItems({ player, items: [{ item: "scrollupgradelegendary", quantity: 10 }] });
      } else if (id === Types.Store.SCROLLUPGRADEBLESSED) {
        this.lootItems({ player, items: [{ item: "scrollupgradeblessed", quantity: 5 }] });
      } else if (id === Types.Store.SCROLLUPGRADEHIGH) {
        this.lootItems({ player, items: [{ item: "scrollupgradehigh", quantity: 10 }] });
      } else if (id === Types.Store.SCROLLUPGRADEMEDIUM) {
        this.lootItems({ player, items: [{ item: "scrollupgrademedium", quantity: 10 }] });
      } else if (id === Types.Store.CAPE) {
        const bonus = player.generateRandomCapeBonus();

        this.lootItems({
          player,
          items: [{ item: "cape", level: 1, bonus: JSON.stringify(bonus.sort((a, b) => a - b)) }],
        });
      } else {
        throw new Error("Invalid purchase id");
      }

      player.send([Types.Messages.PURCHASE_COMPLETED, { hash, id }]);

      const now = Date.now();
      this.client.zadd(
        "purchase",
        now,
        JSON.stringify({
          player: player.name,
          network: player.network,
          account,
          hash,
          id,
          amount,
          depositAccountIndex: player.depositAccountIndex,
        }),
      );
    } catch (err) {
      player.send([
        Types.Messages.PURCHASE_ERROR,
        {
          message: "An error happened while completing your purchase, contact the game admin to receive your purchase.",
        },
      ]);

      Sentry.captureException(err, { extra: { account, amount, hash, id } });
    }
  }

  logUpgrade({
    player,
    item,
    isSuccess,
    isLuckySlot,
    isRuneword,
  }: {
    player: Player;
    item: string;
    isSuccess: boolean;
    isLuckySlot?: boolean;
    isRuneword?: boolean;
  }) {
    const now = Date.now();
    this.client.zadd("upgrade", now, JSON.stringify({ player: player.name, item, isSuccess }));

    if (isSuccess) {
      try {
        const [itemName, level, bonus, rawSocket] = item.split(":");
        const socket = toArray(rawSocket);
        const isUnique = Types.isUnique(itemName, bonus);
        let message = "";
        let runeword = "";
        let wordSocket = "";
        let output = kinds[itemName][2];
        let fire = parseInt(level) >= 8 ? EmojiMap.firepurple : EmojiMap.fire;

        if (!isUnique && isRuneword) {
          // Invalid runeword
          if (socket.findIndex((s: number | string) => s === 0 || `${s}`.startsWith("jewel")) !== -1) {
            return;
          } else {
            const isWeapon = Types.isWeapon(itemName);
            const isArmor = Types.isArmor(itemName);
            const isShield = Types.isShield(itemName);

            let type = null;
            if (isWeapon) {
              type = "weapon";
            } else if (isArmor) {
              type = "armor";
            } else if (isShield) {
              type = "shield";
            }

            ({ runeword, wordSocket } = getRunewordBonus({ isUnique, socket, type }));
          }
        }

        if (isUnique) {
          output =
            Types.itemUniqueMap[itemName]?.[0] ||
            `${
              [
                "ringbronze",
                "ringsilver",
                "ringgold",
                "ringplatinum",
                "amuletsilver",
                "amuletgold",
                "amuletplatinum",
              ].includes(itemName)
                ? "Unique "
                : ""
            }${output}`;
        }

        if (isRuneword && !runeword) {
          return;
        }

        if (runeword) {
          fire = EmojiMap.fireblue;
          const EmojiRunes = wordSocket
            .split("-")
            .map(rune => EmojiMap[`rune-${rune}`])
            .join("");

          message = `${player.name} forged **${runeword}** runeword (${EmojiRunes}) in a +${level} ${output}`;
        } else if (socket?.length === 6) {
          message = `${player.name} added **6 sockets** to a +${level} ${output}`;
        } else {
          message = `${player.name} upgraded a **+${level}** ${output}`;
        }
        postMessageToDiscordAnvilChannel(`${message}${isLuckySlot ? " with the lucky slot" : ""} ${fire}`);
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  }

  logLoot({ player, item }) {
    const now = Date.now();
    this.client.zadd("loot", now, JSON.stringify({ player: player.name, item }));
  }

  logEvent(event) {
    const now = Date.now();
    this.client.zadd("event", now, JSON.stringify(event));
  }
}

export default DatabaseHandler;
