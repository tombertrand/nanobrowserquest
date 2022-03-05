// import bcrypt  from "bcrypt";
import * as NanocurrencyWeb from "nanocurrency-web";
import redis from "redis";

import { Types } from "../../../shared/js/gametypes";
import Messages from "../message";
import { PromiseQueue } from "../promise-queue";
import { Sentry } from "../sentry";
import { isUpgradeSuccess, isValidRecipe, isValidUpgradeItems, NaN2Zero, randomInt } from "../utils";

const INVENTORY_SLOT_COUNT = 24;
const STASH_SLOT_COUNT = 48;
// const DELETE_SLOT = -1;
const UPGRADE_SLOT_COUNT = 11;
const UPGRADE_SLOT_RANGE = 200;
const STASH_SLOT_RANGE = 300;
const ACHIEVEMENT_COUNT = 44;
const GEM_COUNT = 5;
const ARTIFACT_COUNT = 4;

const queue = new PromiseQueue();

const getNewDepositAccountByIndex = async index => {
  const depositAccount = await NanocurrencyWeb.wallet.legacyAccounts(process.env.DEPOSIT_SEED, index, index)[0].address;

  return depositAccount;
};

class DatabaseHandler {
  client: any;

  constructor() {
    this.client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, {
      socket_nodelay: true,
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on("connect", () => {
      this.setDepositAccount();
    });

    // client.auth(process.env.REDIS_PASSWORD || "");
  }

  loadPlayer(player) {
    var userKey = "u:" + player.name;
    this.client.smembers("usr", (err, replies) => {
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
            .hget(userKey, "artifact") // 17
            .hget(userKey, "expansion1") // 18
            .hget(userKey, "waypoints") // 19
            .hget(userKey, "depositAccount") // 20
            .hget(userKey, "depositAccountIndex") // 21
            .hget(userKey, "hash1") // 22
            .hget(userKey, "stash") // 23
            .hget(userKey, "cape") // 24
            .exec(async (err, replies) => {
              var account = replies[0];
              var armor = replies[1];
              var weapon = replies[2];
              var exp = NaN2Zero(replies[3]);
              var createdAt = NaN2Zero(replies[4]);
              var ring1 = replies[13];
              var ring2 = replies[14];
              var amulet = replies[15];
              var belt = replies[16];
              var cape = replies[24];
              var expansion1 = !!parseInt(replies[18] || "0");
              var depositAccount = replies[20];
              var depositAccountIndex = replies[21];

              try {
                if (!depositAccount) {
                  depositAccountIndex = await this.createDepositAccount();
                  depositAccount = await getNewDepositAccountByIndex(depositAccountIndex);
                  this.client.hmset(
                    "u:" + player.name,
                    "depositAccount",
                    depositAccount,
                    "depositAccountIndex",
                    depositAccountIndex,
                  );
                }
              } catch (err) {
                Sentry.captureException(err, {
                  user: {
                    username: player.name,
                  },
                  extra: {
                    depositAccountIndex,
                    depositAccount,
                  },
                });
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
              } catch (err) {
                // invalid json
                Sentry.captureException(err, {
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
                if (replies[23]) {
                  stash = JSON.parse(replies[23]);
                } else {
                  this.client.hset("u:" + player.name, "stash", JSON.stringify(stash));
                }
              } catch (err) {
                // invalid json
                Sentry.captureException(err, {
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
                waypoints = JSON.parse(replies[19]);

                if (waypoints && !expansion1) {
                  const classicWaypoint = waypoints.slice(0, 3);
                  const expansion1Waypoint = [2, 2, 2];
                  waypoints = classicWaypoint.concat(expansion1Waypoint);

                  this.client.hset("u:" + player.name, "waypoints", JSON.stringify(waypoints));
                } else if (!waypoints) {
                  const classicWaypoint = [1, 0, 0];
                  const expansion1Waypoint = !!expansion1 ? [0, 0, 0] : [2, 2, 2];
                  waypoints = classicWaypoint.concat(expansion1Waypoint);

                  this.client.hset("u:" + player.name, "waypoints", JSON.stringify(waypoints));
                } else if (expansion1 && waypoints.includes(2)) {
                  // Unlock expansion waypoints
                  waypoints = waypoints.map((waypoint, index) => {
                    if (index === 3) {
                      waypoint = 1;
                    } else if (index > 3 && waypoint === 2) {
                      waypoint = 0;
                    }
                    return waypoint;
                  });

                  this.client.hset("u:" + player.name, "waypoints", JSON.stringify(waypoints));
                }
              } catch (err) {
                // invalid json
                Sentry.captureException(err, {
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
                  this.client.hset("u:" + player.name, "inventory", JSON.stringify(inventory));
                } else {
                  let hasSword2 = /sword2/.test(replies[6]);
                  inventory = JSON.parse(replies[6].replace(/sword2/g, "sword"));

                  // Migrate inventory
                  if (inventory.length < INVENTORY_SLOT_COUNT || hasSword2) {
                    inventory = inventory.concat(new Array(INVENTORY_SLOT_COUNT - inventory.length).fill(0));

                    this.client.hset("u:" + player.name, "inventory", JSON.stringify(inventory));
                  }
                }
              } catch (err) {
                Sentry.captureException(err, {
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
              } catch (err) {
                console.log(err);
                Sentry.captureException(err, {
                  user: {
                    username: player.name,
                  },
                  extra: {
                    upgrade,
                  },
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
              } catch (err) {
                Sentry.captureException(err);
              }

              var artifact = new Array(ARTIFACT_COUNT).fill(0);
              try {
                if (!replies[17]) {
                  this.client.hset("u:" + player.name, "artifact", JSON.stringify(artifact));
                } else {
                  artifact = JSON.parse(replies[17]);
                }
              } catch (err) {
                Sentry.captureException(err);
              }

              var x = NaN2Zero(replies[7]);
              var y = NaN2Zero(replies[8]);
              var hash = replies[9];
              var hash1 = replies[22];
              var nanoPotions = parseInt(replies[10] || 0);

              // bcrypt.compare(player.account, account, function(err, res) {
              if (player.account != account) {
                player.connection.sendUTF8("invalidlogin");
                player.connection.close("Wrong Account: " + player.name);
                return;
              }

              console.info("Player name: " + player.name);
              console.info("Armor: " + armor);
              console.info("Weapon: " + weapon);
              console.info("Experience: " + exp);

              player.sendWelcome({
                armor,
                weapon,
                belt,
                cape,
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
                hash1,
                nanoPotions,
                gems,
                artifact,
                expansion1,
                waypoints,
                depositAccount,
                depositAccountIndex,
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
        const depositAccount = await getNewDepositAccountByIndex(depositAccountIndex);

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
          .hset(userKey, "ring1", null)
          .hset(userKey, "ring2", null)
          .hset(userKey, "amulet", null)
          .hset(userKey, "gems", JSON.stringify(new Array(GEM_COUNT).fill(0)))
          .hset(userKey, "artifact", JSON.stringify(new Array(ARTIFACT_COUNT).fill(0)))
          .hset(userKey, "upgrade", JSON.stringify(new Array(UPGRADE_SLOT_COUNT).fill(0)))
          .hset(userKey, "expansion1", 0)
          .hset(userKey, "waypoints", JSON.stringify([1, 0, 0, 2, 2, 2]))
          .hset(userKey, "depositAccountIndex", depositAccountIndex)
          .hset(userKey, "depositAccount", depositAccount)
          .exec((_err, _replies) => {
            console.info("New User: " + player.name);
            player.sendWelcome({
              armor: "clotharmor:1",
              weapon: "dagger:1",
              belt: null,
              cape: null,
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
              waypoints: [1, 0, 0, 2, 2, 2],
              stash: new Array(STASH_SLOT_COUNT).fill(0),
              depositAccount,
              depositAccountIndex,
            });
          });
      }
    });
  }

  async checkIsBanned(player) {
    return new Promise((resolve, _reject) => {
      const ipKey = "ipban:" + player.connection._connection.handshake.headers["cf-connecting-ip"];
      this.client.hget(ipKey, "timestamp", (err, reply) => {
        const timestamp = parseInt(reply);
        // isBanned is true if DB time is greater than now
        resolve(reply && timestamp > Date.now() ? timestamp : false);
      });
    });
  }

  banPlayer(banPlayer, reason) {
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
        );

        banPlayer.connection.sendUTF8("banned-" + days);
        banPlayer.connection.close("You are banned, no cheating.");
      },
    );

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

  equipWeapon(name, weapon, level, bonus) {
    console.info("Set Weapon: " + name + " " + weapon + ":" + level);
    this.client.hset("u:" + name, "weapon", `${weapon}:${level}${bonus ? `:${bonus}` : ""}`);
  }

  equipArmor(name, armor, level, bonus) {
    console.info("Set Armor: " + name + " " + armor + ":" + level);
    this.client.hset("u:" + name, "armor", `${armor}:${level}${bonus ? `:${bonus}` : ""}`);
  }

  equipBelt(name, belt, level, bonus) {
    if (belt) {
      console.info("Set Belt: " + name + " " + belt + ":" + level);
      this.client.hset("u:" + name, "belt", `${belt}:${level}${bonus ? `:${bonus}` : ""}`);
    } else {
      console.info("Delete Belt");
      this.client.hdel("u:" + name, "belt");
    }
  }

  equipCape(name, cape, level, bonus) {
    if (cape) {
      console.info("Set Cape: " + name + " " + cape + ":" + level);
      this.client.hset("u:" + name, "cape", `${cape}:${level}${bonus ? `:${bonus}` : ""}`);
    } else {
      console.info("Delete Cape");
      this.client.hdel("u:" + name, "cape");
    }
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

  setHash1(name, hash) {
    console.info("Set Hash1: " + name + " " + hash);
    this.client.hset("u:" + name, "hash1", hash);
  }

  getItemLocation(slot: number): [string, number] {
    if (slot < INVENTORY_SLOT_COUNT) {
      return ["inventory", 0];
    } else if (slot === Types.Slot.WEAPON) {
      return ["weapon", 0];
    } else if (slot === Types.Slot.ARMOR) {
      return ["armor", 0];
    } else if (slot === Types.Slot.BELT) {
      return ["belt", 0];
    } else if (slot === Types.Slot.CAPE) {
      return ["cape", 0];
    } else if (slot === Types.Slot.RING1) {
      return ["ring1", 0];
    } else if (slot === Types.Slot.RING2) {
      return ["ring2", 0];
    } else if (slot === Types.Slot.AMULET) {
      return ["amulet", 0];
    } else if (slot >= UPGRADE_SLOT_RANGE && slot <= UPGRADE_SLOT_RANGE + 10) {
      return ["upgrade", UPGRADE_SLOT_RANGE];
    } else if (slot >= STASH_SLOT_RANGE && slot <= STASH_SLOT_RANGE + STASH_SLOT_COUNT) {
      return ["stash", STASH_SLOT_RANGE];
    }

    return ["", 0];
  }

  sendMoveItem({ player, location, data }) {
    if (location === "inventory") {
      player.send([Types.Messages.INVENTORY, data]);
    } else if (location === "stash") {
      player.send([Types.Messages.STASH, data]);
    } else if (location === "weapon") {
      const type = "weapon";
      let item = "dagger";
      let level = 1;
      let bonus = null;
      if (data) {
        [item, level, bonus] = data.split(":");
      }

      player.equipItem({ item, level, type, bonus });
      player.broadcast(
        player.equip({ kind: player.weaponKind, level: player.weaponLevel, bonus: player.weaponBonus, type }),
        false,
      );
    } else if (location === "armor") {
      const type = "armor";
      let item = "clotharmor";
      let level = 1;
      let bonus = null;
      if (data) {
        [item, level, bonus] = data.split(":");
      }

      player.equipItem({ item, level, type, bonus });
      player.broadcast(
        player.equip({ kind: player.armorKind, level: player.armorLevel, bonus: player.armorBonus, type }),
        false,
      );
    } else if (location === "belt") {
      let item = null;
      let level = null;
      let bonus = null;
      if (data) {
        [item, level, bonus] = data.split(":");
      }
      player.equipItem({ item, level, type: "belt", bonus });
    } else if (location === "cape") {
      const type = "cape";
      let item = null;
      let level = null;
      let bonus = null;
      if (data) {
        [item, level, bonus] = data.split(":");
      }
      player.equipItem({ item, level, type, bonus });
      player.broadcast(
        player.equip({ kind: player.capeKind, level: player.capeLevel, bonus: player.capeBonus, type }),
        false,
      );
    } else if (location === "ring1") {
      let item = null;
      let level = null;
      let bonus = null;
      if (data) {
        [item, level, bonus] = data.split(":");
      }
      player.equipItem({ item, level, bonus, type: "ring1" });
    } else if (location === "ring2") {
      let item = null;
      let level = null;
      let bonus = null;
      if (data) {
        [item, level, bonus] = data.split(":");
      }

      player.equipItem({ item, level, bonus, type: "ring2" });
    } else if (location === "amulet") {
      let item = null;
      let level = null;
      let bonus = null;
      if (data) {
        [item, level, bonus] = data.split(":");
      }

      player.equipItem({ item, level, bonus, type: "amulet" });
    } else if (location === "upgrade") {
      player.send([Types.Messages.UPGRADE, data]);
    }
  }

  moveItem({ player, fromSlot, toSlot }) {
    if (fromSlot === toSlot) return;

    const [fromLocation, fromRange] = this.getItemLocation(fromSlot);
    const [toLocation, toRange] = this.getItemLocation(toSlot);
    const isMultipleFrom = ["inventory", "upgrade", "stash"].includes(fromLocation);
    const isMultipleTo = ["inventory", "upgrade", "stash"].includes(toLocation);

    if (!fromLocation || !toLocation) return;

    this.client.hget("u:" + player.name, fromLocation, (_err, fromReply) => {
      try {
        let fromReplyParsed = isMultipleFrom ? JSON.parse(fromReply) : fromReply;
        const fromItem = isMultipleFrom ? fromReplyParsed[fromSlot - fromRange] : fromReplyParsed;

        // Should never happen but who knows
        if (["dagger:1", "clotharmor:1"].includes(fromItem) && toSlot !== -1) return;

        if (toLocation === fromLocation) {
          const toItem = fromReplyParsed[toSlot - toRange];

          if (toSlot !== -1) {
            fromReplyParsed[toSlot - toRange] = fromItem;
            fromReplyParsed[fromSlot - fromRange] = toItem || 0;
          } else {
            // Delete the item in the -1 toSlot
            fromReplyParsed[fromSlot - fromRange] = 0;
          }

          this.sendMoveItem({ player, location: fromLocation, data: fromReplyParsed });
          this.client.hset("u:" + player.name, fromLocation, JSON.stringify(fromReplyParsed));
        } else {
          this.client.hget("u:" + player.name, toLocation, (_err, toReply) => {
            try {
              let toReplyParsed = isMultipleTo ? JSON.parse(toReply) : toReply;
              let toItem = isMultipleTo ? toReplyParsed[toSlot - toRange] : toReplyParsed;
              let isFromReplyDone = false;
              let isToReplyDone = false;

              if (["dagger:1", "clotharmor:1"].includes(toItem)) {
                toItem = 0;
              }

              // @NOTE Strict rule, 1 upgrade scroll limit, tweak this later on
              if (Types.isScroll(fromItem)) {
                const [fromScroll, fromQuantity] = fromItem.split(":");
                if (toLocation === "inventory" || toLocation === "stash") {
                  let toItemIndex = toReplyParsed.findIndex(a => a && a.startsWith(fromScroll));

                  if (toItemIndex === -1) {
                    toItemIndex = toItem ? toReplyParsed.indexOf(0) : toSlot - toRange;
                  }

                  if (toItemIndex > -1) {
                    const [, toQuantity = 0] = (toReplyParsed[toItemIndex] || "").split(":");
                    toReplyParsed[toItemIndex] = `${fromScroll}:${parseInt(toQuantity) + parseInt(fromQuantity)}`;

                    fromReplyParsed[fromSlot - fromRange] = 0;
                    isFromReplyDone = true;
                    isToReplyDone = true;
                  }
                } else if (toLocation === "upgrade") {
                  if (!toReplyParsed.some((a, i) => i !== 0 && a !== 0)) {
                    fromReplyParsed[fromSlot - fromRange] =
                      fromQuantity > 1 ? `${fromScroll}:${parseInt(fromQuantity) - 1}` : 0;
                    toReplyParsed[toSlot - toRange] = `${fromScroll}:1`;
                  }

                  isFromReplyDone = true;
                  isToReplyDone = true;
                }
              } else if (["weapon", "armor", "belt", "cape", "ring1", "ring2", "amulet"].includes(toLocation)) {
                const [item, fromLevel] = fromItem.split(":");
                if (
                  Types.getItemRequirement(item, fromLevel) > player.level ||
                  !Types.isCorrectTypeForSlot(toLocation, item)
                ) {
                  isFromReplyDone = true;
                  isToReplyDone = true;
                }
              } else if (
                ["weapon", "armor", "belt", "cape", "ring1", "ring2", "amulet"].includes(fromLocation) &&
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

              this.sendMoveItem({ player, location: fromLocation, data: fromReplyParsed });
              if (isMultipleFrom) {
                this.client.hset("u:" + player.name, fromLocation, JSON.stringify(fromReplyParsed));
              }

              this.sendMoveItem({ player, location: toLocation, data: toReplyParsed });
              if (isMultipleTo) {
                this.client.hset("u:" + player.name, toLocation, JSON.stringify(toReplyParsed));
              }
            } catch (err) {
              console.log(err);
              Sentry.captureException(err);
            }
          });
        }
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
      }
    });
  }

  lootItems({ player, items }) {
    this.client.hget("u:" + player.name, "inventory", (_err, reply) => {
      try {
        let inventory = JSON.parse(reply);

        items.forEach(({ item, level, quantity, bonus }) => {
          let slotIndex = quantity ? inventory.findIndex(a => a && a.startsWith(item)) : -1;

          // Increase the scroll count
          if (slotIndex > -1) {
            if (Types.isSingle(item)) {
              inventory[slotIndex] = `${item}:1`;
            } else {
              const [, oldQuantity] = inventory[slotIndex].split(":");
              inventory[slotIndex] = `${item}:${parseInt(oldQuantity) + parseInt(quantity)}`;
            }
          } else if (slotIndex === -1) {
            slotIndex = inventory.indexOf(0);
            if (slotIndex !== -1) {
              inventory[slotIndex] = [item, level || quantity, bonus].filter(Boolean).join(":");
            } else if (player.hasParty()) {
              // @TODO re-call the lootItems fn with next party member
            }
          }
        });

        player.send([Types.Messages.INVENTORY, inventory]);
        this.client.hset("u:" + player.name, "inventory", JSON.stringify(inventory));
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
      }
    });
  }

  moveUpgradeItemsToInventory(player) {
    this.client.hget("u:" + player.name, "upgrade", (_err, reply) => {
      try {
        let upgrade = JSON.parse(reply);
        const filteredUpgrade = upgrade.filter(Boolean);

        if (filteredUpgrade.length) {
          const items = filteredUpgrade.reduce((acc, rawItem) => {
            if (!rawItem) return acc;
            const [item, level, bonus] = rawItem.split(":");
            const isQuantity = Types.isScroll(item);

            acc.push({
              item,
              [isQuantity ? "quantity" : "level"]: level,
              bonus,
            });
            return acc;
          }, []);

          this.lootItems({ player, items });

          upgrade = upgrade.map(() => 0);

          player.send([Types.Messages.UPGRADE, upgrade]);

          this.client.hset("u:" + player.name, "upgrade", JSON.stringify(upgrade));
        }
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
      }
    });
  }

  upgradeItem(player) {
    this.client.hget("u:" + player.name, "upgrade", (_err, reply) => {
      try {
        let isLucky7 = false;
        let isMagic8 = false;
        let upgrade = JSON.parse(reply);
        let isBlessed = false;
        const slotIndex = upgrade.findIndex(index => {
          if (index) {
            if (index.startsWith("scrollupgradeblessed")) {
              isBlessed = true;
            }

            return index.startsWith("scroll");
          }
        });
        const luckySlot = randomInt(1, 9);
        const isLuckySlot = slotIndex === luckySlot;
        const filteredUpgrade = upgrade.filter(Boolean);
        let isSuccess = false;
        let recipe = null;

        if (isValidUpgradeItems(filteredUpgrade)) {
          const [item, level, bonus] = filteredUpgrade[0].split(":");
          let upgradedItem: number | string = 0;

          if (isUpgradeSuccess({ level, isLuckySlot, isBlessed })) {
            const upgradedLevel = parseInt(level) + 1;
            upgradedItem = [item, parseInt(level) + 1, bonus].filter(Boolean).join(":");
            isSuccess = true;

            if (Types.isBaseHighClassItem(item)) {
              if (upgradedLevel === 7) {
                isLucky7 = true;
              } else if (upgradedLevel === 8) {
                isMagic8 = true;
              }
            }

            if (upgradedLevel >= 8) {
              this.logUpgrade({ player, item: upgradedItem, isSuccess });
            }
          } else {
            if (parseInt(level) >= 8) {
              this.logUpgrade({ player, item: filteredUpgrade[0], isSuccess: false });
            }
          }

          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = upgradedItem;
          player.broadcast(new Messages.AnvilUpgrade(isSuccess), false);
        } else {
          recipe = isValidRecipe(filteredUpgrade);

          if (recipe) {
            if (recipe === "cowLevel") {
              if (player.server.cowLevelClock) {
                this.moveUpgradeItemsToInventory(player);
              } else {
                player.server.startCowLevel();
                upgrade = upgrade.map(() => 0);
                player.broadcast(new Messages.AnvilRecipe(recipe), false);
              }
            }
          } else {
            this.moveUpgradeItemsToInventory(player);
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
        waypoints = waypoints.slice(0, 3).concat([1, 0, 0]);
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

  async createDepositAccount() {
    return await queue.enqueue(
      () =>
        new Promise((resolve, _reject) => {
          this.client.incr("deposit_account_count", (_err, reply) => {
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
        this.lootItems({ player, items: [{ item: "scrollupgradehigh", quantity: 5 }] });
      } else if (id === Types.Store.SCROLLUPGRADEBLESSED) {
        this.lootItems({ player, items: [{ item: "scrollupgradeblessed", quantity: 5 }] });
      } else if (id === Types.Store.SCROLLUPGRADEHIGH) {
        this.lootItems({ player, items: [{ item: "scrollupgradehigh", quantity: 10 }] });
      } else if (id === Types.Store.SCROLLUPGRADEMEDIUM) {
        this.lootItems({ player, items: [{ item: "scrollupgrademedium", quantity: 10 }] });
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

  logUpgrade({ player, item, isSuccess }) {
    const now = Date.now();
    this.client.zadd("upgrade", now, JSON.stringify({ player: player.name, item, isSuccess }));
  }

  logLoot({ player, item }) {
    const now = Date.now();
    this.client.zadd("loot", now, JSON.stringify({ player: player.name, item }));
  }
}

export default DatabaseHandler;
