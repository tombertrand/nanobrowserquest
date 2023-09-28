import bcrypt from "bcrypt";
import * as NanocurrencyWeb from "nanocurrency-web";
import redis from "redis";

import { kinds, Types } from "../../../shared/js/gametypes";
import { getGoldAmountFromSoldItem, merchantItems } from "../../../shared/js/gold";
import {
  INVENTORY_SLOT_COUNT,
  MERCHANT_SLOT_RANGE,
  Slot,
  STASH_SLOT_COUNT,
  STASH_SLOT_RANGE,
  TRADE_SLOT_COUNT,
  TRADE_SLOT_RANGE,
  UPGRADE_SLOT_COUNT,
  UPGRADE_SLOT_RANGE,
  WAYPOINTS_COUNT,
} from "../../../shared/js/slots";
import {
  ACHIEVEMENT_ANTIDOTE_INDEX,
  ACHIEVEMENT_ARCHMAGE_INDEX,
  ACHIEVEMENT_BLACKSMITH_INDEX,
  ACHIEVEMENT_BOO_INDEX,
  ACHIEVEMENT_BULLSEYE_INDEX,
  ACHIEVEMENT_COUNT,
  ACHIEVEMENT_CRYSTAL_INDEX,
  ACHIEVEMENT_CYCLOP_INDEX,
  ACHIEVEMENT_DISCORD_INDEX,
  ACHIEVEMENT_HERO_INDEX,
  ACHIEVEMENT_MINI_BOSS_INDEX,
  ACHIEVEMENT_NAMES,
  ACHIEVEMENT_NFT_INDEX,
  ACHIEVEMENT_SACRED_INDEX,
  ACHIEVEMENT_SPECTRAL_INDEX,
  ACHIEVEMENT_TEMPLAR_INDEX,
  ACHIEVEMENT_UNBREAKABLE_INDEX,
  ACHIEVEMENT_VIKING_INDEX,
  ACHIEVEMENT_WING_INDEX,
} from "../../../shared/js/types/achievements";
import { getRunewordBonus } from "../../../shared/js/types/rune";
import { toArray, toDb, validateQuantity } from "../../../shared/js/utils";
import {
  discordClient,
  EmojiMap,
  postMessageToDiscordAnvilChannel,
  postMessageToDiscordEventChannel,
  postMessageToDiscordPurchaseChannel,
  postMessageToModeratorSupportChannel,
} from "../discord";
import Messages from "../message";
import { CHATBAN_PATTERNS } from "../player";
import { PromiseQueue } from "../promise-queue";
import { Sentry } from "../sentry";
import {
  generateBlueChestItem,
  generateGreenChestItem,
  generatePurpleChestItem,
  generateRandomPet,
  generateRedChestItem,
  getIsTransmuteSuccess,
  isUpgradeSuccess,
  isValidAddWeaponSkill,
  isValidDowngradeRune,
  isValidRecipe,
  isValidSocketItem,
  isValidStoneSocket,
  isValidTransmuteItems,
  isValidTransmutePet,
  isValidUpgradeItems,
  isValidUpgradeRunes,
  NaN2Zero,
  randomInt,
} from "../utils";

import type Player from "../player";

const GEM_COUNT = 5;
const ARTIFACT_COUNT = 4;

const { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD, REDIS_DB_INDEX, DEPOSIT_SEED, NODE_ENV } = process.env;

const queue = new PromiseQueue();

const getNewDepositAccountByIndex = async (index: number, network: Network): Promise<string> => {
  let depositAccount = null;

  depositAccount = await NanocurrencyWeb.wallet.legacyAccounts(DEPOSIT_SEED, index, index)[0].address;

  if (network === "ban") {
    depositAccount = depositAccount.replace("nano_", "ban_");
  }

  return depositAccount;
};

const defaultSettings: Settings = {
  capeHue: 0,
  capeSaturate: 0,
  capeContrast: 0,
  capeBrightness: 1,
  pvp: false,
  partyEnabled: true,
  tradeEnabled: true,
  effects: true,
};

class DatabaseHandler {
  client: any;

  constructor() {
    this.client = redis.createClient(REDIS_PORT, REDIS_HOST, {
      socket_nodelay: true,
      ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : null),
    });

    this.client.on("connect", () => {
      if (REDIS_DB_INDEX) {
        this.client.select(REDIS_DB_INDEX);
      }
      this.setDepositAccount();
    });
  }

  assignNewDepositAccount(player, network: Network): Promise<{ depositAccount: string; depositAccountIndex: number }> {
    return new Promise((resolve, reject) => {
      // Make sure the player doesn't have a valid deposit account, once it's set it can't be changed
      if (!player || player.depositAccount || player.depositAccountIndex || !network) return;

      const userKey = "u:" + player.name;

      this.client.hmget(userKey, "depositAccount", "depositAccountIndex", async (errGet, reply) => {
        if (errGet) {
          Sentry.captureException(new Error("Unable to get deposit account"), { extra: { player: player.name } });
          reject();
          return;
        }

        let [depositAccount, depositAccountIndex] = reply;
        if (depositAccount || depositAccountIndex) return;

        depositAccountIndex = await this.createDepositAccount();
        depositAccount = await getNewDepositAccountByIndex(depositAccountIndex as number, network);

        if (typeof depositAccountIndex !== "number" || !depositAccount) {
          Sentry.captureException(new Error("Invalid deposit account when creating player"), {
            extra: { depositAccountIndex, depositAccount, player: player.name },
          });
          reject();
          return;
        }

        this.client.hmset(
          userKey,
          "depositAccount",
          depositAccount,
          "depositAccountIndex",
          depositAccountIndex,
          async errSet => {
            if (errSet) {
              Sentry.captureException(new Error("Unable to set new deposit account"), {
                extra: { player: player.name },
              });
              reject();
              return;
            }

            player.depositAccountIndex = depositAccountIndex;
            player.depositAccount = depositAccount;
            player.network = network;

            resolve({ depositAccount, depositAccountIndex });
          },
        );
      });
    });
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
            .hget(userKey, "gold") // 29
            .hget(userKey, "goldStash") // 30
            .hget(userKey, "goldTrade") // 31
            .hget(userKey, "coin") // 32
            .hget(userKey, "discordId") // 33
            .hget(userKey, "migrations") // 34
            .hget(userKey, "helm") // 35
            .hget(userKey, "pet") // 36
            .exec(async (err, replies) => {
              if (err) {
                Sentry.captureException(err, {
                  user: {
                    username: player.name,
                  },
                });
                return;
              }

              var account = replies[0] || "";
              var armor = replies[1];
              var weapon = replies[2];
              var exp = NaN2Zero(replies[3]);
              var createdAt = NaN2Zero(replies[4]);
              var ring1 = replies[13];
              var ring2 = replies[14];
              var amulet = replies[15];
              var belt = replies[16];
              var cape = replies[17];
              var pet = replies[36];
              var shield = replies[18];
              var expansion1 = !!parseInt(replies[20] || "0");
              var expansion2 = !!parseInt(replies[21] || "0");
              var depositAccount = replies[23];
              var depositAccountIndex = replies[24];
              var network = replies[27];
              var gold = parseInt(replies[29] || "0");
              var goldStash = parseInt(replies[30] || "0");
              var goldTrade = parseInt(replies[31] || "0");
              var coin = parseInt(replies[32] || "0");
              var discordId = replies[33];
              var migrations = replies[34] ? JSON.parse(replies[34]) : {};
              var helm = replies[35];

              if (account) {
                if (!network) {
                  [network] = account.split("_");
                  this.client.hset("u:" + player.name, "network", network);
                }

                if (!depositAccount && ["nano", "ban"].includes(network)) {
                  try {
                    ({ depositAccount, depositAccountIndex } = await this.assignNewDepositAccount(player, network));
                  } catch (_errAccount) {
                    return;
                  }
                }
              }

              // if (rawAccount && rawPlayerAccount != rawAccount) {
              //   player.connection.sendUTF8("invalidlogin");
              //   player.connection.close("Wrong Account: " + player.name);
              //   return;
              // }

              // @NOTE: Change the player network and depositAccount according to the login account so
              // nano players can be on bananobrowserquest and ban players can be on nanobrowserquest
              const loggedInNetwork = player.network;
              if (
                loggedInNetwork &&
                ["nano", "ban"].includes(loggedInNetwork) &&
                depositAccount &&
                !depositAccount.startsWith(loggedInNetwork)
              ) {
                const [, rawDepositAccount] = depositAccount.split("_");
                depositAccount = `${loggedInNetwork}_${rawDepositAccount}`;
              }

              if (!helm) {
                helm = "helmcloth:1";
                this.client.hset("u:" + player.name, "helm", helm);
              } else {
                var [playerHelm, helmLevel] = helm.split(":");
                if (isNaN(helmLevel)) {
                  helm = `${playerHelm}:1`;
                  this.client.hset("u:" + player.name, "helm", helm);
                }
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
                  waypoints = [1, 0, 0, 2, 2, 2, 2, 2, 2, 2];

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
                    if (shield) {
                      const [item, level, bonus, skill] = shield.split(":");
                      shield = [item, level, bonus || `[]`, `[]`, skill].filter(Boolean).join(":");

                      if (skill && skill.length <= 1) {
                        this.client.hset("u:" + player.name, "shield", shield);
                      }
                    }
                    resolve(true);
                  }),
                  new Promise(resolve => {
                    stash = stash.map(rawItem => {
                      if (typeof rawItem === "string" && rawItem.startsWith("shield")) {
                        const [item, level, bonus, skill] = rawItem.split(":");
                        return skill && skill.length <= 1
                          ? [item, level, bonus || `[]`, `[]`, skill].filter(Boolean).join(":")
                          : rawItem;
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
                        return skill && skill.length <= 1
                          ? [item, level, bonus || `[]`, `[]`, skill].filter(Boolean).join(":")
                          : rawItem;
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

              // Restore the trade gold in the main inventory gold
              if (goldTrade) {
                gold = gold + goldTrade;
                goldTrade = 0;

                this.client.hmset("u:" + player.name, "gold", gold, "goldTrade", 0);
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

  async createPlayer(player) {
    var userKey = "u:" + player.name;
    var curTime = new Date().getTime();

    const INVALID_NAME_PATTERNS = [/ball[sz]/, /d[i1]+ck/, /your ?m[ou]+m/, /butt/, /stupid/, /ass/, /cock/, /faggot/,/jizz?/, /cum/];

    if (
      CHATBAN_PATTERNS.some(pattern => pattern.test(player.name)) ||
      INVALID_NAME_PATTERNS.some(pattern => pattern.test(player.name))
    ) {
      player.connection.sendUTF8("invalidusername");
      player.connection.close("User does not exist: " + player.name);
      Sentry.captureException(new Error(`Invalid player name for creation ${player.name}`));
      return;
    }

    let depositAccountIndex = null;
    let depositAccount = null;

    if (player.account && player.network) {
      depositAccountIndex = await this.createDepositAccount();
      depositAccount = await getNewDepositAccountByIndex(depositAccountIndex as number, player.network);

      if (typeof depositAccountIndex !== "number" || !depositAccount) {
        Sentry.captureException(new Error("Invalid deposit account when creating player"));
        return;
      }
    }

    if (!player.network) {
      postMessageToDiscordEventChannel(`A new adventurer **${player.name}** has just arrived in our realm 🎉`);
    } else {
      postMessageToDiscordEventChannel(
        `A new adventurer has just arrived in our realm. **${player.name}** has joined the ranks of **${
          player.network === "nano" ? "Nano" : "Banano"
        }** 🎉`,
      );
    }

    this.client
      .multi()
      .sadd("usr", player.name)
      .hset(userKey, "account", player.account)
      .hset(userKey, "exp", 0)
      .hset(userKey, "gold", 0)
      .hset(userKey, "goldStash", 0)
      .hset(userKey, "coin", 0)
      .hset(userKey, "ip", player.ip || "")
      .hset(userKey, "createdAt", curTime)
      .hset(userKey, "achievement", JSON.stringify(new Array(ACHIEVEMENT_COUNT).fill(0)))
      .hset(userKey, "inventory", JSON.stringify(new Array(INVENTORY_SLOT_COUNT).fill(0)))
      .hset(userKey, "stash", JSON.stringify(new Array(STASH_SLOT_COUNT).fill(0)))
      .hset(userKey, "nanoPotions", 0)
      .hset(userKey, "weapon", "dagger:1")
      .hset(userKey, "helm", "helmcloth:1")
      .hset(userKey, "armor", "clotharmor:1")
      .hset(userKey, "belt", null)
      .hset(userKey, "cape", null)
      .hset(userKey, "pet", null)
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
      .hset(userKey, "waypoints", JSON.stringify([1, 0, 0, 2, 2, 2, 2, 2, 2, 2]))
      .hset(userKey, "depositAccountIndex", depositAccountIndex)
      .hset(userKey, "depositAccount", depositAccount)
      .hset(userKey, "network", player.network)
      .exec((_err, _replies) => {
        console.info("New User: " + player.name);
        player.sendWelcome({
          account: player.account,
          helm: "helmcloth:1",
          armor: "clotharmor:1",
          weapon: "dagger:1",
          belt: null,
          cape: null,
          pet: null,
          shield: null,
          exp: 0,
          gold: 0,
          goldStash: 0,
          coin: 0,
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
          waypoints: [1, 0, 0, 2, 2, 2, 2, 2, 2, 2],
          stash: new Array(STASH_SLOT_COUNT).fill(0),
          depositAccount,
          depositAccountIndex,
          settings: defaultSettings,
          network: player.network,
        });
      });
  }

  async checkIsBannedByIP(player) {
    return new Promise((resolve, _reject) => {
      const ipKey = "ipban:" + player.ip;

      this.client
        .multi()
        .hget(ipKey, "timestamp") // 0
        .hget(ipKey, "reason") // 1
        .hget(ipKey, "message") // 2
        .hget(ipKey, "admin") // 3
        .exec(async (err, replies) => {
          resolve({
            playerName: player.name,
            timestamp: replies[0],
            reason: replies[1],
            message: replies[2],
            ip: player.ip,
            admin: replies[3],
          });
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
        .hget(banKey, "message") // 2
        .hget(banKey, "admin") // 3
        .exec(async (err, replies) => {
          resolve({ playerName, timestamp: replies[0], reason: replies[1], message: replies[2], admin: replies[3] });
        });
    });
  }

  banPlayerByIP({
    admin = "auto-mod",
    player,
    reason = "other",
    message = "no message",
    days = 365,
  }: {
    admin?: string;
    player: any;
    reason: string;
    message: string;
    days?: number;
  }) {
    this.banPlayerForReason({ admin, player, reason, message, days });

    player.connection.sendUTF8(JSON.stringify({ admin, player: player.name, error: "banned", reason, days, message }));
    player.connection.close(`You are banned, ${reason}.`);

    if (!player?.connection?._connection?.handshake?.headers?.["cf-connecting-ip"]) return;

    const until = days * 24 * 60 * 60 * 1000 + Date.now();
    this.client.hmset(
      "ipban:" + player.ip,
      "timestamp",
      until,
      "reason",
      reason || "",
      "message",
      message || "",
      "player",
      player.name,
      "admin",
      admin,
    );
  }

  banPlayerForReason({ admin, player, reason, message, days = 365 }) {
    const until = parseInt(`${days}`) * 24 * 60 * 60 * 1000 + Date.now();

    this.client.hmset("ban:" + player.name, "timestamp", until, "reason", reason, "message", message, "admin", admin);
  }

  chatBan({ player, message, isIPBan }: { player: any; message: string; isIPBan: boolean }) {
    let ip = isIPBan ? player.ip : "";

    player.canChat = false;
    this.client.hset(`chatBan`, player.name, JSON.stringify({ ip, message }));
    player.server.chatBan.push({ player: player.name, ip });
  }

  getChatBan() {
    return new Promise(resolve => {
      this.client.hgetall("chatBan", (_err, rawChatBan) => {
        let chatBan = [];

        if (rawChatBan) {
          chatBan = Object.entries(rawChatBan)
            .map(([player, data]: [string, string]) => {
              try {
                const { ip } = JSON.parse(data);

                return {
                  player,
                  ip,
                };
              } catch (err) {
                return;
              }
            })
            .filter(Boolean);
        }
        resolve(chatBan);
      });
    });
  }

  equipWeapon(name, weapon, level, bonus = [], socket = [], skill) {
    console.info("Set Weapon: " + name + " " + weapon + ":" + level);
    this.client.hset("u:" + name, "weapon", `${weapon}:${level}${toDb(bonus)}${toDb(socket)}${toDb(skill)}`);
  }

  equipHelm(name, helm, level, bonus = [], socket = []) {
    console.info("Set Helm: " + name + " " + helm + ":" + level);
    this.client.hset("u:" + name, "helm", `${helm}:${level}${toDb(bonus)}${toDb(socket)}`);
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

  equipPet(name, pet, level, bonus, socket, skin) {
    if (pet) {
      console.info("Set Pet: " + name + " " + pet + ":" + level);
      this.client.hset("u:" + name, "pet", `${pet}:${level}${toDb(bonus)}${toDb(socket)}${toDb(skin)}`);
    } else {
      console.info("Delete Pet");
      this.client.hdel("u:" + name, "pet");
    }
  }

  setSettings(name, rawSettings: Settings) {
    const settings = {} as Settings;

    if (typeof rawSettings.capeHue === "number") {
      settings.capeHue = rawSettings.capeHue;
    }
    if (typeof rawSettings.capeSaturate === "number") {
      settings.capeSaturate = rawSettings.capeSaturate;
    }
    if (typeof rawSettings.capeContrast === "number") {
      settings.capeContrast = rawSettings.capeContrast;
    }
    if (typeof rawSettings.capeBrightness === "number") {
      settings.capeBrightness = rawSettings.capeBrightness;
    }
    if (typeof rawSettings.pvp !== "undefined") {
      settings.pvp = !!rawSettings.pvp;
    }
    if (typeof rawSettings.partyEnabled !== "undefined") {
      settings.partyEnabled = !!rawSettings.partyEnabled;
    }
    if (typeof rawSettings.tradeEnabled !== "undefined") {
      settings.tradeEnabled = !!rawSettings.tradeEnabled;
    }
    if (typeof rawSettings.effects !== "undefined") {
      settings.effects = !!rawSettings.effects;
    }

    this.client.hget("u:" + name, "settings", (err, reply) => {
      try {
        var parsedReply = reply ? JSON.parse(reply) : {};

        const newSettings = JSON.stringify(Object.assign(parsedReply, settings));

        this.client.hset("u:" + name, "settings", newSettings);
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  }

  async setAccount(player, account, network) {
    return new Promise(resolve => {
      if (player.depositAccount || player.depositAccountIndex || player.hash) {
        Sentry.captureException(new Error("Already have deposit account for Player"), { extra: { name: player.name } });
        return;
      }

      this.client.hmset("u:" + player.name, "account", account, "network", network, async () => {
        try {
          const { depositAccount } = await this.assignNewDepositAccount(player, network);

          player.account = account;
          player.send([Types.Messages.ACCOUNT, { account, network, depositAccount }]);

          postMessageToDiscordEventChannel(
            `**${player.name}** has joined the ranks of **${player.network === "nano" ? "Nano" : "Banano"}**`,
          );

          this.client.hmget("u:" + player.name, "hash", "achievement", (_err, reply) => {
            try {
              let [hash, rawAchievement] = reply as [string, string];
              const achievement: number[] = JSON.parse(rawAchievement);

              const hasHeroAchievement = !!achievement[ACHIEVEMENT_HERO_INDEX];

              if (hash || !hasHeroAchievement) return;
              achievement[ACHIEVEMENT_HERO_INDEX] = 0;
              this.client.hset("u:" + player.name, "achievement", JSON.stringify(achievement), (_err, _reply) => {});
            } catch (err) {
              Sentry.captureException(new Error("Unable to assign deposit account"), { extra: { err } });
            }
          });
        } catch (err) {
          Sentry.captureException(new Error("Unable to assign deposit account"), { extra: { err } });
        }
        resolve(true);
      });
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
    } else if (slot === Slot.HELM) {
      return ["helm", 0];
    } else if (slot === Slot.ARMOR) {
      return ["armor", 0];
    } else if (slot === Slot.BELT) {
      return ["belt", 0];
    } else if (slot === Slot.CAPE) {
      return ["cape", 0];
    } else if (slot === Slot.PET) {
      return ["pet", 0];
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
    if (player.sendMoveItemLock) {
      Sentry.captureException(new Error("Calling sendMoveItem while still locked"), {
        extra: { player: player.name },
      });
      return;
    }

    player.sendMoveItemLock = true;
    const type = location;
    const isEquipment = [
      "weapon",
      "helm",
      "armor",
      "belt",
      "cape",
      "pet",
      "shield",
      "ring1",
      "ring2",
      "amulet",
    ].includes(location);

    let item = null;
    let level = null;
    let bonus = null;
    let socket = null;
    let skillOrSkin = null;
    if (isEquipment && data) {
      [item, level, bonus, socket, skillOrSkin] = data.split(":");
    } else if (!data) {
      if (type === "weapon") {
        item = "dagger";
        level = 1;
      } else if (type === "armor") {
        item = "clotharmor";
        level = 1;
      } else if (type === "helm") {
        item = "helmcloth";
        level = 1;
      }
    }

    if (location === "inventory") {
      player.send([Types.Messages.INVENTORY, data]);
    } else if (location === "stash") {
      player.send([Types.Messages.STASH, data]);
    } else if (location === "weapon") {
      player.equipItem({ item, level, type, bonus, socket, skill: skillOrSkin });
      player.broadcast(
        player.equip({
          kind: player.weaponKind,
          level: player.weaponLevel,
          bonus: toArray(bonus),
          socket: player.weaponSocket,
          skill: player.attackSkill,
          type,
        }),
        false,
      );
    } else if (location === "helm") {
      player.equipItem({ item, level, type, bonus, socket });
      player.broadcast(
        player.equip({
          kind: player.helmKind,
          level: player.helmLevel,
          bonus: toArray(bonus),
          socket: player.helmSocket,
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
          bonus: toArray(bonus),
          socket: player.armorSocket,
          type,
        }),
        false,
      );
    } else if (location === "belt") {
      player.equipItem({ item, level, type, bonus });
      player.broadcast(
        player.equip({ kind: Types.getKindFromString(item), level, bonus: toArray(bonus), type }),
        false,
      );
    } else if (location === "cape") {
      player.equipItem({ item, level, type, bonus });
      player.broadcast(
        player.equip({ kind: player.capeKind, level: player.capeLevel, bonus: toArray(bonus), type }),
        false,
      );
    } else if (location === "pet") {
      player.equipItem({ item, level, type, bonus, socket, skin: skillOrSkin });
      player.broadcast(
        player.equip({
          kind: player.petKind,
          level: player.petLevel,
          bonus: toArray(bonus),
          socket: player.petSocket,
          skin: player.petSkin,
          type,
        }),
        false,
      );
    } else if (location === "shield") {
      player.equipItem({ item, level, type, bonus, socket, skill: skillOrSkin });
      player.broadcast(
        player.equip({
          kind: player.shieldKind,
          level: player.shieldLevel,
          bonus: toArray(bonus),
          socket: player.shieldSocket,
          skill: player.defenseSkill,
          type,
        }),
        false,
      );
    } else if (location === "ring1") {
      player.equipItem({ item, level, type, bonus });
      player.broadcast(player.equip({ kind: Types.getKindFromString(item), level, bonus, type }), false);
    } else if (location === "ring2") {
      player.equipItem({ item, level, type, bonus });
      player.broadcast(player.equip({ kind: Types.getKindFromString(item), level, bonus, type }), false);
    } else if (location === "amulet") {
      player.equipItem({ item, level, type, bonus });
      player.broadcast(player.equip({ kind: Types.getKindFromString(item), level, bonus, type }), false);
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

    player.sendMoveItemLock = false;
  }

  moveItem({ player, fromSlot, toSlot, quantity: movedQuantity = 0 }) {
    if (movedQuantity && !validateQuantity(movedQuantity)) return;
    if (fromSlot === toSlot) return;
    if (player.moveItemLock) {
      Sentry.captureException(new Error("Calling moveItem while still locked"), {
        extra: { player: player.name },
      });
      return;
    }

    player.moveItemLock = true;

    const [fromLocation, fromRange] = this.getItemLocation(fromSlot);
    const [toLocation, toRange] = this.getItemLocation(toSlot);

    const isMultipleFrom = ["inventory", "upgrade", "trade", "stash"].includes(fromLocation);
    const isMultipleTo = ["inventory", "upgrade", "trade", "stash"].includes(toLocation);

    if (!fromLocation || !toLocation) {
      this.banPlayerByIP({
        player,
        reason: "cheating",
        message: `Tried moveItem fromSlot:${fromSlot} toSlot:${toSlot}`,
      });
      return;
    }
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
        fromItem = (isMultipleFrom ? fromReplyParsed[fromSlot - fromRange] : fromReplyParsed) || 0;

        // Should never happen but who knows
        if (["dagger:1", "clotharmor:1", "helmcloth:1"].includes(fromItem) && toSlot !== -1) {
          player.moveItemLock = false;
          return;
        }

        if (toLocation === fromLocation) {
          toItem = fromReplyParsed[toSlot - toRange];

          if (toSlot !== -1) {
            fromReplyParsed[toSlot - toRange] = fromItem;
            fromReplyParsed[fromSlot - fromRange] = toItem || 0;
          } else {
            // Delete the item in the -1 toSlot
            fromReplyParsed[fromSlot - fromRange] = 0;
          }

          this.client.hset("u:" + player.name, fromLocation, JSON.stringify(fromReplyParsed), () => {
            player.moveItemLock = false;
          });
          this.sendMoveItem({ player, location: fromLocation, data: fromReplyParsed });
        } else {
          this.client.hget("u:" + player.name, toLocation, (_err, toReply) => {
            try {
              let isFromReplyDone = false;
              let isToReplyDone = false;
              let toReplyParsed = isMultipleTo ? JSON.parse(toReply) : toReply;
              toItem = isMultipleTo ? toReplyParsed[toSlot - toRange] : toReplyParsed;

              if (["dagger:1", "clotharmor:1", "helmcloth:1"].includes(toItem)) {
                toItem = 0;
              }

              // @NOTE Strict rule, 1 upgrade scroll limit, tweak this later on
              if (Types.isQuantity(fromItem)) {
                const [fromScroll, rawFromQuantity] = fromItem.split(":");
                const fromQuantity = Number(rawFromQuantity);

                // trying to move more than the current quantity
                if (movedQuantity && movedQuantity > fromQuantity) {
                  player.moveItemLock = false;
                  return;
                }

                if (toLocation === "inventory" || toLocation === "stash" || toLocation === "trade") {
                  let toItemIndex = toReplyParsed.findIndex(a => a && a.startsWith(`${fromScroll}:`));

                  if (toItemIndex === -1) {
                    // @Note put the quantity, not found in first available index of toLocation
                    toItemIndex = toItem ? toReplyParsed.indexOf(0) : toSlot - toRange;
                  }

                  if (toItemIndex > -1) {
                    const [, toQuantity = 0] = (toReplyParsed[toItemIndex] || "").split(":");

                    toReplyParsed[toItemIndex] = `${fromScroll}:${
                      parseInt(toQuantity) + parseInt(`${movedQuantity || fromQuantity}`)
                    }`;

                    if (movedQuantity && fromQuantity - movedQuantity > 0) {
                      fromReplyParsed[fromSlot - fromRange] = `${fromScroll}:${fromQuantity - movedQuantity}`;
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
                    fromReplyParsed[fromSlot - fromRange] = fromQuantity > 1 ? `${fromScroll}:${fromQuantity - 1}` : 0;
                    toReplyParsed[toSlot - toRange] = `${fromScroll}:1`;
                  }

                  isFromReplyDone = true;
                  isToReplyDone = true;
                } else {
                  isFromReplyDone = true;
                  isToReplyDone = true;
                }
              } else if (
                ["weapon", "helm", "armor", "belt", "cape", "pet", "shield", "ring1", "ring2", "amulet"].includes(
                  toLocation,
                ) &&
                fromItem
              ) {
                const [item, fromLevel] = fromItem.split(":");
                if (
                  Types.getItemRequirement(item, fromLevel) > player.level ||
                  !Types.isCorrectTypeForSlot(toLocation, item)
                ) {
                  isFromReplyDone = true;
                  isToReplyDone = true;
                }
              } else if (
                ["weapon", "helm", "armor", "belt", "cape", "pet", "shield", "ring1", "ring2", "amulet"].includes(
                  fromLocation,
                ) &&
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

            player.moveItemLock = false;
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

  lootGold({ player, amount }) {
    this.client.hget("u:" + player.name, "gold", (err, currentGold) => {
      if (err) {
        Sentry.captureException(err);
        return;
      }

      if (currentGold === null) {
        currentGold = 0;
      } else if (!/\d+/.test(currentGold)) {
        Sentry.captureException(new Error(`${player.name} gold hash corrupted?`), {
          extra: {
            currentGold,
          },
        });
        return;
      }

      const gold = parseInt(currentGold) + parseInt(amount);

      this.client.hset("u:" + player.name, "gold", gold, () => {
        player.send([Types.Messages.GOLD.INVENTORY, gold]);
        player.gold = gold;
      });
    });
  }

  moveGold({ player, amount, from, to }) {
    // Only positive number can be submitted
    if (isNaN(amount) || amount <= 0) return;

    if (player.moveGoldLock) {
      Sentry.captureException(new Error("Calling moveGold while still locked"), {
        extra: { player: player.name },
      });
      return;
    }

    player.moveGoldLock = true;

    return player.dbWriteQueue.enqueue(
      () =>
        new Promise((resolve, reject) => {
          const locationMap = {
            inventory: "gold",
            stash: "goldStash",
            trade: "goldTrade",
          };

          const fromLocation = locationMap[from];
          const toLocation = locationMap[to];

          if (fromLocation === toLocation || !fromLocation || !toLocation) return;

          this.client.hget("u:" + player.name, fromLocation, (err, rawFromGold) => {
            if (err) {
              Sentry.captureException(err);
              reject();
              return;
            }

            if (!rawFromGold || rawFromGold === "0" || !/\d+/.test(rawFromGold)) return;
            const fromGold = parseInt(rawFromGold);

            if (amount > fromGold) {
              Sentry.captureException(new Error(`Player ${player.name} tried to transfer invalid gold amount.`), {
                extra: {
                  amount,
                  rawFromGold,
                  from,
                  to,
                },
              });
              reject();
              return;
            }

            const newFromGold = fromGold - amount;
            if (newFromGold < 0) return;

            this.client.hget("u:" + player.name, toLocation, (err, rawToGold) => {
              if (err) {
                Sentry.captureException(err);
                reject();
                return;
              }

              if (rawToGold === null) {
                rawToGold = 0;
              } else if (!/\d+/.test(rawToGold)) {
                Sentry.captureException(new Error(`${player.name} gold hash corrupted?`), {
                  extra: {
                    toLocation,
                    rawToGold,
                  },
                });
                reject();
                return;
              }
              const toGold = parseInt(rawToGold || "0");
              if (toGold + amount < 0) return;

              this.client.hset("u:" + player.name, fromLocation, newFromGold, () => {
                player.send([Types.Messages.GOLD[from.toUpperCase()], newFromGold]);
                player[fromLocation] = newFromGold;

                const newToGold = toGold + amount;

                this.client.hset("u:" + player.name, toLocation, newToGold, () => {
                  player.send([Types.Messages.GOLD[to.toUpperCase()], newToGold]);
                  player[toLocation] = newToGold;

                  console.log("COMPLETED GOLD MOVE", {
                    player: player.name,
                    amount,
                    from,
                    to,
                    newFromGold,
                    newToGold,
                  });

                  let resolvedAmount = 0;
                  if (from === "trade") {
                    resolvedAmount = newFromGold;
                  } else if (to === "trade") {
                    resolvedAmount = newToGold;
                  }

                  player[fromLocation] = newFromGold;
                  player[toLocation] = newToGold;

                  // @NOTE Resolved amount is only used for trading
                  resolve(resolvedAmount);
                  player.moveGoldLock = false;
                });
              });
            });
          });
        }),
    );
  }

  deductGold(player, { penalty, amount }: { penalty?: number; amount?: number }) {
    return new Promise((resolve, reject) => {
      if (!amount && !penalty) {
        return;
      }

      this.client.hget("u:" + player.name, "gold", (err, currentGold) => {
        if (err) {
          reject(err);
          return;
        }

        if (currentGold === null) {
          currentGold = 0;
        } else if (!/\d+/.test(currentGold)) {
          Sentry.captureException(new Error(`${player.name} gold hash corrupted?`), {
            extra: {
              currentGold,
            },
          });
          return;
        }

        const gold = parseInt(currentGold);

        // No gold? no deduction
        if (gold === 0) return;
        let deductedGold = amount;
        if (amount && gold < amount) {
          return;
        }

        if (penalty) {
          deductedGold = Math.ceil((gold * penalty) / 100);
        }
        if (!deductedGold) return;

        const newGold = gold - deductedGold;
        if (newGold < 0) return;

        this.client.hset("u:" + player.name, "gold", newGold, err => {
          if (err) {
            reject(err);
            return;
          }

          player.send([Types.Messages.GOLD.INVENTORY, newGold]);
          player.gold = newGold;

          if (amount) {
            resolve(newGold);
          } else if (penalty) {
            player.send(
              new Messages.Chat(
                {},
                `You lost ${deductedGold} gold from your death.`,
                "event",
                deductedGold,
              ).serialize(),
            );
            this.client.incrby("goldBank", deductedGold, (_err, reply) => {
              resolve(reply);
            });
          }
        });
      });
    });
  }

  getGoldBank() {
    return new Promise(resolve => {
      this.client.get("goldBank", (_err, gold) => {
        resolve(Number(gold));
      });
    });
  }

  lootCoin({ player, amount }) {
    this.client.hget("u:" + player.name, "coin", (err, currentCoin) => {
      if (err) {
        Sentry.captureException(err);
        return;
      }

      if (currentCoin === null) {
        currentCoin = 0;
      } else if (!/\d+/.test(currentCoin)) {
        Sentry.captureException(new Error(`${player.name} coin hash corrupted?`));
        return;
      }

      const coin = Number(amount) + Number(currentCoin);

      this.client.hset("u:" + player.name, "coin", coin, () => {
        player.send([Types.Messages.COIN, coin]);
      });
    });
  }

  buyFromMerchant({ player, fromSlot, toSlot, quantity = 1 }) {
    const { amount, item } = merchantItems[fromSlot - MERCHANT_SLOT_RANGE] || {};

    if (!amount || !item || toSlot > INVENTORY_SLOT_COUNT - 1) return;
    if (!validateQuantity(quantity)) return;
    const maxQuantity = Math.floor(player.gold / amount);
    if (quantity > maxQuantity) {
      return;
    }

    const totalAmount = amount * quantity;

    this.deductGold(player, { amount: totalAmount })
      .then(() => {
        this.lootItems({ player, items: [{ item, quantity }], toSlot });

        if (item === "barplatinum" || quantity > 10 || totalAmount >= 100_000) {
          postMessageToModeratorSupportChannel(
            `**${player.name}** purchased ${quantity}x ${item} from merchant for ${totalAmount}${EmojiMap.gold}`,
          );
        }

        player.send(new Messages.MerchantLog({ item, quantity, amount: totalAmount, type: "buy" }).serialize());
      })
      .catch(err => {
        Sentry.captureException(err);
      });
  }

  withdrawFromBank({ player }) {
    return new Promise(resolve => {
      if (player.moveItemLock) {
        Sentry.captureException(new Error("Calling withdrawFromBank while still locked"), {
          extra: { player: player.name },
        });
        return;
      }

      player.moveItemLock = true;

      this.client.hget("u:" + player.name, "inventory", (_err, fromReply) => {
        try {
          let inventory = JSON.parse(fromReply);

          const slot = inventory.findIndex(item => item && typeof item === "string" && item.startsWith("iou:"));

          if (slot <= -1) {
            this.banPlayerByIP({
              player,
              reason: "cheating",
              message: "Tried to withdraw from bank without an IOU",
            });
            resolve(false);
            return;
          }
          const [, rawAmount] = inventory[slot].split(":");
          const amount = Number(rawAmount);

          if (amount && player.server.goldBank >= amount) {
            inventory[slot] = 0;
            this.client.hset("u:" + player.name, "inventory", JSON.stringify(inventory));

            this.sendMoveItem({ player, location: "inventory", data: inventory });

            this.client.decrby("goldBank", amount, (_err, reply) => {
              player.server.goldBank = Number(reply);

              this.lootGold({
                player,
                amount,
              });

              postMessageToDiscordEventChannel(
                `${player.name} just exchanged an IOU ${EmojiMap.iou} for **${new Intl.NumberFormat("en-EN", {}).format(
                  amount,
                )}** gold ${EmojiMap.gold} `,
              );

              resolve(amount);
            });
          } else {
            resolve(false);
          }
        } catch (err) {
          Sentry.captureException(err);
        }

        player.moveItemLock = false;
      });
    });
  }

  sellToMerchant({ player, fromSlot, quantity: soldQuantity = 1 }) {
    if (isNaN(fromSlot) || fromSlot >= INVENTORY_SLOT_COUNT) return;
    if (!validateQuantity(soldQuantity)) return;

    this.client.hget("u:" + player.name, "inventory", (_err, fromReply) => {
      let fromItem;

      try {
        let fromReplyParsed = JSON.parse(fromReply);
        fromItem = fromReplyParsed[fromSlot];
        if (!fromItem) return;

        const amount = getGoldAmountFromSoldItem({ item: fromItem, quantity: soldQuantity });
        if (!amount) return;

        if (amount >= 50_000) {
          postMessageToModeratorSupportChannel(
            `**${player.name}** sold ${soldQuantity}x ${fromItem} to merchant for ${amount}${EmojiMap.gold}`,
          );
        }

        let isFromReplyDone = false;

        // Quantity
        if (Types.isQuantity(fromItem)) {
          const [fromScroll, rawQuantity] = fromItem.split(":");
          const fromQuantity = Number(rawQuantity);

          // trying to sell more than the current quantity
          if (soldQuantity > fromQuantity) return;
          if (fromQuantity - soldQuantity > 0) {
            fromReplyParsed[fromSlot] = `${fromScroll}:${fromQuantity - soldQuantity}`;
            isFromReplyDone = true;
          }
        } else {
          if (soldQuantity > 1) return;
        }

        if (!isFromReplyDone) {
          fromReplyParsed[fromSlot] = 0;
        }

        this.client.hset("u:" + player.name, "inventory", JSON.stringify(fromReplyParsed), () => {
          this.lootGold({
            player,
            amount,
          });
          player.send(
            new Messages.MerchantLog({
              item: fromItem,
              quantity: soldQuantity,
              amount,
              type: "sell",
            }).serialize(),
          );
        });
        this.sendMoveItem({ player, location: "inventory", data: fromReplyParsed });
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
      }
    });
  }

  lootItems({ player, items, toSlot }: { player: any; items: GeneratedItem[]; toSlot?: number }) {
    player.dbWriteQueue.enqueue(
      () =>
        new Promise((resolve, _reject) => {
          this.client.hget("u:" + player.name, "inventory", async (_err, reply) => {
            try {
              let inventory = JSON.parse(reply);

              items.forEach((rawItem: GeneratedItem) => {
                const { item, level, quantity, bonus, skill, socket } = rawItem;
                let slotIndex = quantity ? inventory.findIndex(a => a && a.startsWith(`${item}:`)) : -1;

                // Increase the scroll/rune count
                if (slotIndex > -1) {
                  if (Types.isSingle(item)) {
                    inventory[slotIndex] = `${item}:1`;
                  } else {
                    const [, oldQuantity] = inventory[slotIndex].split(":");
                    inventory[slotIndex] = `${item}:${parseInt(oldQuantity) + parseInt(String(quantity))}`;
                  }
                } else if (slotIndex === -1) {
                  // Used for placing bought item from merchant in desired slot
                  if (typeof toSlot === "number" && inventory[toSlot] === 0) {
                    slotIndex = toSlot;
                  } else {
                    slotIndex = inventory.indexOf(0);
                  }

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
              Sentry.captureException(err, {
                extra: {
                  player: player.name,
                  items,
                  toSlot,
                },
              });
              resolve(true);
            }
          });
        }),
    );
  }

  moveItemsToInventory(player, panel: "upgrade" | "trade" = "upgrade") {
    if (player.moveItemsToInventoryLock) {
      Sentry.captureException(new Error("Calling moveItemsToInventory while still locked"), {
        extra: { player: player.name, panel },
      });
      return;
    }
    player.moveItemsToInventoryLock = true;

    this.client.hget("u:" + player.name, "inventory", (_err, rawInvetory) => {
      const availableInventorySlots = JSON.parse(rawInvetory).filter(i => i === 0).length;

      this.client.hget("u:" + player.name, panel, (_err, reply) => {
        try {
          let data = JSON.parse(reply);
          const filteredUpgrade = data.filter(Boolean);

          if (filteredUpgrade.length) {
            const items = filteredUpgrade.reduce((acc, rawItem) => {
              if (!rawItem) return acc;

              const delimiter = Types.isJewel(rawItem) ? "|" : ":";
              const [item, level, bonus, socket, skill] = rawItem.split(delimiter);
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
            this.client.hset("u:" + player.name, panel, JSON.stringify(data), () => {
              player.moveItemsToInventoryLock = false;
            });

            if (panel === "upgrade") {
              player.send([Types.Messages.UPGRADE, data]);
            } else if (panel === "trade") {
              player.send(new Messages.Trade(Types.Messages.TRADE_ACTIONS.PLAYER1_MOVE_ITEM, data).serialize());
            }
          } else {
            player.moveItemsToInventoryLock = false;
          }
        } catch (err) {
          Sentry.captureException(err, {
            extra: { player: player.name },
          });

          player.moveItemsToInventoryLock = false;
        }
      });
    });
  }

  upgradeItem(player: Player) {
    if (player.upgradeLock) {
      Sentry.captureException(new Error("Calling upgradeItem while still locked"), {
        extra: { player: player.name },
      });
      return;
    }
    player.upgradeLock = true;

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
        // let successRate = null;
        let transmuteSuccessRate = null;
        let uniqueSuccessRate = null;
        let isTransmuteSuccess = null;
        let isUniqueSuccess = null;
        let result;
        let nextRuneRank = null;
        let previousRuneRank = null;
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
          const [item, level, bonus, socket, skillOrSkin] = filteredUpgrade[0].split(":");
          const [scrollOrStone] = filteredUpgrade[1].split(":");
          const isUnique = Types.isUnique(item, bonus);
          let upgradedItem: number | string = 0;
          const isGuaranteedSuccess =
            Types.isStone(scrollOrStone) && ["stonedragon", "stonehero"].includes(scrollOrStone);

          let isCursed = false;
          // if (player.name.toLowerCase().startsWith("kabal")) {
          //   isCursed = true;
          // }

          ({ isSuccess, random /*, successRate*/ } = isUpgradeSuccess({
            level,
            isLuckySlot,
            isBlessed,
            isGuaranteedSuccess,
            isCursed,
          }));

          // Disable for now as it is exploitable
          // player.send(
          //   new Messages.AnvilOdds(
          //     `You rolled ${random}, the success rate is ${successRate}%. ${
          //       random <= successRate ? "Success" : "Failure"
          //     }`,
          //   ).serialize(),
          // );

          if (isSuccess) {
            let upgradedLevel = parseInt(level) + 1;

            if (isGuaranteedSuccess) {
              if (scrollOrStone === "stonedragon") {
                upgradedLevel = Types.StoneUpgrade.stonedragon;
              } else if (scrollOrStone === "stonehero") {
                upgradedLevel = Types.StoneUpgrade.stonehero;
              }
            }

            upgradedItem = [item, upgradedLevel, bonus, socket, skillOrSkin].filter(Boolean).join(":");
            isSuccess = true;

            if (Types.isBaseHighClassItem(item) && upgradedLevel === 7) {
              isLucky7 = true;
            }

            if (Types.isBaseLegendaryClassItem(item) && upgradedLevel === 8) {
              isMagic8 = true;
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
        } else if ((previousRuneRank = isValidDowngradeRune(filteredUpgrade))) {
          isSuccess = true;
          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = `rune-${Types.RuneList[previousRuneRank - 1]}:1`;
          player.broadcast(new Messages.AnvilUpgrade({ isSuccess }), false);
        } else if ((socketItem = isValidSocketItem(filteredUpgrade))) {
          isSuccess = true;
          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = socketItem;

          this.logUpgrade({ player, item: socketItem, isSuccess, isRuneword: true });

          player.broadcast(new Messages.AnvilUpgrade({ isRuneword: isSuccess }), false);
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
        } else if ((result = isValidTransmutePet(filteredUpgrade))) {
          isSuccess = randomInt(1, 100) !== 100;

          let generatedItem: number | string = 0;
          const { pet: item, skin } = generateRandomPet();
          const { item: itemName, level } = player.generateItem({
            level: result.level,
            kind: Types.getKindFromString(item),
            skin,
            uniqueChances: isUniqueSuccess ? 100 : 0,
            isLuckySlot,
            bonus: result.bonus,
            socket: result.socket,
          });

          generatedItem = isSuccess
            ? [itemName, level, result.bonus, result.socket, skin].filter(Boolean).join(":")
            : 0;

          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = generatedItem;
          player.broadcast(new Messages.AnvilUpgrade({ isTransmute: isSuccess }), false);
        } else if ((result = isValidTransmuteItems(filteredUpgrade))) {
          const [item, level, , , skin] = filteredUpgrade[0].split(":");
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
              skin,
              uniqueChances: isUniqueSuccess ? 100 : 0,
              isLuckySlot,
            });

            generatedItem = [itemName, level, bonus, socket, skill || skin].filter(Boolean).join(":");
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
              let jewelLevel;

              try {
                switch (recipe) {
                  case "chestblue":
                    isChestblue = true;
                    ({ item, uniqueChances, jewelLevel } = generateBlueChestItem());
                    break;
                  case "chestgreen":
                    isChestgreen = true;
                    ({ item, uniqueChances, jewelLevel } = generateGreenChestItem());
                    break;
                  case "chestpurple":
                    isChestpurple = true;
                    ({ item, uniqueChances, jewelLevel } = generatePurpleChestItem());
                    break;
                  case "chestred":
                    isChestred = true;
                    ({ item, uniqueChances, jewelLevel } = generateRedChestItem());
                    break;
                }

                if (!item) return;

                luckySlot = null;
                isWorkingRecipe = true;

                const kind = Types.getKindFromString(item);
                if (Types.isRune(kind)) {
                  generatedItem = [item, 1].filter(Boolean).join(":");
                } else {
                  const {
                    item: itemName,
                    level,
                    quantity,
                    bonus,
                    socket,
                    skill,
                  } = player.generateItem({ kind, uniqueChances, jewelLevel });

                  const delimiter = Types.isJewel(item) ? "|" : ":";
                  generatedItem = [itemName, level, quantity, bonus, socket, skill].filter(Boolean).join(delimiter);
                }
              } catch (err) {
                Sentry.captureException(err, {
                  extra: {
                    player: player.name,
                    recipe,
                    item,
                  },
                });
              }
            } else if (recipe === "powderquantum") {
              isWorkingRecipe = true;
              isRecipe = true;

              generatedItem = "powderquantum:1";
            } else if (recipe === "petegg") {
              isWorkingRecipe = true;
              isRecipe = true;

              const { pet: item, skin } = generateRandomPet();
              const {
                item: itemName,
                level,
                bonus,
                socket,
              } = player.generateItem({
                kind: Types.getKindFromString(item),
                skin,
                uniqueChances: isUniqueSuccess ? 100 : 0,
                isLuckySlot,
              });

              generatedItem = [itemName, level, bonus, socket, skin].filter(Boolean).join(":");
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
        player.upgradeLock = false;
      } catch (err1) {
        Sentry.captureException(err1, {
          extra: {
            player: player.name,
            reply,
          },
        });

        player.upgradeLock = false;
      }
    });
  }

  foundAchievement(player, index) {
    console.info("Found Achievement: " + player.name + " " + index + 1);

    return new Promise(resolve => {
      this.client.hget("u:" + player.name, "achievement", (_err, reply) => {
        try {
          var achievement = JSON.parse(reply);

          if (achievement[index] === 1) {
            // throw new Error(`Trying to re-unlock achievement. Index: ${index}, Name: ${ACHIEVEMENT_NAMES[index]}`);
            resolve(false);
            return;
          }

          achievement[index] = 1;
          achievement = JSON.stringify(achievement);
          this.client.hset("u:" + player.name, "achievement", achievement, err => {
            if (err) {
              resolve(false);
              return;
            }

            if (index === ACHIEVEMENT_HERO_INDEX) {
              this.unlockExpansion1(player);
            }

            if (index === ACHIEVEMENT_BLACKSMITH_INDEX) {
              resolve(true);
              return;
            }

            if (index === ACHIEVEMENT_DISCORD_INDEX) {
              let item = "scrollupgrademedium";
              if (player.expansion2) {
                item = "scrollupgradelegendary";
              } else if (player.expansion1) {
                item = "scrollupgradehigh";
              }
              this.lootItems({ player, items: [{ item, quantity: 5 }] });
              resolve(true);
              return;
            }

            if (
              [
                ACHIEVEMENT_NFT_INDEX,
                ACHIEVEMENT_WING_INDEX,
                ACHIEVEMENT_CRYSTAL_INDEX,
                ACHIEVEMENT_ANTIDOTE_INDEX,
                ACHIEVEMENT_UNBREAKABLE_INDEX,
                ACHIEVEMENT_CYCLOP_INDEX,
                ACHIEVEMENT_TEMPLAR_INDEX,
                ACHIEVEMENT_BOO_INDEX,
                ACHIEVEMENT_ARCHMAGE_INDEX,
                ACHIEVEMENT_SPECTRAL_INDEX,
                ACHIEVEMENT_VIKING_INDEX,
                ACHIEVEMENT_BULLSEYE_INDEX,
              ].includes(index)
            ) {
              if (index === ACHIEVEMENT_NFT_INDEX) {
                player.hasNft = true;
              } else if (index === ACHIEVEMENT_WING_INDEX) {
                player.hasWing = true;
              } else if (index === ACHIEVEMENT_CRYSTAL_INDEX) {
                player.hasCrystal = true;
              }

              this.lootItems({ player, items: [{ item: "scrollupgradelegendary", quantity: 5 }] });
            } else if ([ACHIEVEMENT_MINI_BOSS_INDEX, ACHIEVEMENT_SACRED_INDEX].includes(index)) {
              this.lootItems({ player, items: [{ item: "scrollupgradesacred", quantity: 5 }] });
            }

            resolve(true);
          });
        } catch (err) {
          Sentry.captureException(err);
          resolve(false);
        }
      });
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
    player.expansion1 = true;

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
    player.expansion2 = true;

    console.info("Unlock Expansion2: " + player.name);
    this.client.hset("u:" + player.name, "expansion2", 1);
    this.client.hget("u:" + player.name, "waypoints", (_err, reply) => {
      try {
        var waypoints = JSON.parse(reply);
        waypoints[6] = 1;
        waypoints[7] = 0;
        waypoints[8] = 0;
        waypoints[9] = 0;
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
            const [, rawQuantity] = (inventory[slotIndex] || "").split(":");

            const quantity = parseInt(rawQuantity);
            if (quantity > 1) {
              inventory[slotIndex] = `${item}:${quantity - 1}`;
            } else {
              inventory[slotIndex] = 0;
            }

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

  useWeaponItem(player) {
    return new Promise(resolve => {
      this.client.hset("u:" + player.name, "weapon", "dagger:1", () => {
        this.sendMoveItem({ player, location: "weapon", data: "" });
        resolve(true);
      });
    });
  }

  passwordIsRequired(player) {
    return new Promise((resolve, _reject) => {
      var userKey = "u:" + player.name;

      try {
        this.client.hget(userKey, "password", (_err, reply) => {
          let hasPassword = !!reply;

          if (NODE_ENV === "development") {
            resolve(false);
            return;
          }

          if (hasPassword) {
            player.connection.sendUTF8("passwordlogin");
          } else {
            player.connection.sendUTF8("passwordcreate");
          }

          resolve(true);
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

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.foundAchievement(player, ACHIEVEMENT_DISCORD_INDEX).then(() => {
          player.connection.send({
            type: Types.Messages.NOTIFICATION,
            achievement: ACHIEVEMENT_NAMES[ACHIEVEMENT_DISCORD_INDEX],
            message: "You are now linked with your Discord account!",
          });

          try {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            discordClient.users.fetch(discordUserId).then(user => {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              user.send(`You linked ${player.name} to your Discord account!`);
            });
          } catch (errDiscord) {
            Sentry.captureException(err);
          }
        });
      });
    });
  }

  isPlayerExist(player) {
    return new Promise(resolve => {
      this.client.sismember("usr", player.name, async (err, reply) => {
        if (reply === 1) {
          player.connection.sendUTF8("userexists");
          player.connection.close("Username not available: " + player.name);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  passwordLoginOrCreate(player, loginPassword) {
    return new Promise((resolve, _reject) => {
      const userKey = "u:" + player.name;

      try {
        this.client.hget(userKey, "password", async (err, reply) => {
          const password = reply;
          let isValid = false;

          if (!password) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(loginPassword, salt);

            this.client.hset(userKey, "password", passwordHash);

            isValid = true;
            player.isPasswordValid = isValid;
          } else {
            isValid = await bcrypt.compare(loginPassword, password);
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
        this.unlockExpansion1(player);
        this.lootItems({ player, items: [{ item: "scrollupgradehigh", quantity: 10 }] });
      }
      if (id === Types.Store.EXPANSION2) {
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
      } else if (id === Types.Store.SCROLLUPGRADELEGENDARY) {
        this.lootItems({ player, items: [{ item: "scrollupgradelegendary", quantity: 60 }] });
      } else if (id === Types.Store.SCROLLUPGRADESACRED) {
        this.lootItems({ player, items: [{ item: "scrollupgradesacred", quantity: 10 }] });
      } else if (id === Types.Store.SCROLLTRANSMUTE) {
        this.lootItems({ player, items: [{ item: "scrolltransmute", quantity: 10 }] });
      } else if (id === Types.Store.STONESOCKET) {
        this.lootItems({ player, items: [{ item: "stonesocket", quantity: 10 }] });
      } else if (id === Types.Store.STONEDRAGON) {
        this.lootItems({ player, items: [{ item: "stonedragon", quantity: 1 }] });
      } else if (id === Types.Store.STONEHERO) {
        this.lootItems({ player, items: [{ item: "stonehero", quantity: 1 }] });
      } else if (id === Types.Store.PET) {
        this.lootItems({ player, items: [{ item: Types.getKindAsString(Types.Entities.PETEGG), level: 1 }] });
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

      postMessageToDiscordPurchaseChannel(
        `**${player.name}** purchased ${id} for ${amount} using deposit account ${account}`,
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
            const isHelm = Types.isHelm(itemName);
            const isArmor = Types.isArmor(itemName);
            const isShield = Types.isShield(itemName);

            let type = null;
            if (isWeapon) {
              type = "weapon";
            } else if (isHelm) {
              type = "helm";
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

          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.foundAchievement(player, ACHIEVEMENT_BLACKSMITH_INDEX).then(() => {
            player.connection.send({
              type: Types.Messages.NOTIFICATION,
              achievement: ACHIEVEMENT_NAMES[ACHIEVEMENT_BLACKSMITH_INDEX],
              message: "You've forged a runeword!",
            });
          });
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
