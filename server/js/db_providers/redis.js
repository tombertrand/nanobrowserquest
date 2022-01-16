const Utils = require("../utils");
const cls = require("../lib/class");
const Player = require("../player");
const Messages = require("../message");
const { PromiseQueue } = require("../promise-queue");
const redis = require("redis");
const bcrypt = require("bcrypt");
const NanocurrencyWeb = require("nanocurrency-web");
const { Sentry } = require("../sentry");

const INVENTORY_SLOT_COUNT = 24;
const STASH_SLOT_COUNT = 48;
// const DELETE_SLOT = -1;
const UPGRADE_SLOT_COUNT = 11;
const UPGRADE_SLOT_RANGE = 200;
const STASH_SLOT_RANGE = 300;
const ACHIEVEMENT_COUNT = 40;
const GEM_COUNT = 5;
const ARTIFACT_COUNT = 4;

const queue = new PromiseQueue();

const getNewDepositAccountByIndex = async index => {
  const depositAccount = await NanocurrencyWeb.wallet.legacyAccounts(process.env.DEPOSIT_SEED, index, index)[0].address;

  return depositAccount;
};

module.exports = DatabaseHandler = cls.Class.extend({
  init: function () {
    client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, {
      socket_nodelay: true,
      password: process.env.REDIS_PASSWORD,
    });

    client.on("connect", () => {
      this.setDepositAccount();
    });

    // client.auth(process.env.REDIS_PASSWORD || "");
  },
  loadPlayer: function (player) {
    var self = this;
    var userKey = "u:" + player.name;
    var curTime = new Date().getTime();
    client.smembers("usr", function (err, replies) {
      for (var index = 0; index < replies.length; index++) {
        if (replies[index].toString() === player.name) {
          client
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
            .hget(userKey, "hash1") // 21
            .hget(userKey, "stash") // 22
            .exec(async function (err, replies) {
              var account = replies[0];
              var armor = replies[1];
              var weapon = replies[2];
              var exp = Utils.NaN2Zero(replies[3]);
              var createdAt = Utils.NaN2Zero(replies[4]);
              var ring1 = replies[13];
              var ring2 = replies[14];
              var amulet = replies[15];
              var belt = replies[16];
              var expansion1 = !!parseInt(replies[18] || "0");
              var depositAccount = replies[20];

              try {
                if (!depositAccount) {
                  const depositAccountIndex = await self.createDepositAccount();
                  depositAccount = await getNewDepositAccountByIndex(depositAccountIndex);
                  client.hmset(
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
                client.hset("u:" + player.name, "armor", armor);
              } else {
                var [playerArmor, armorLevel] = armor.split(":");
                if (isNaN(armorLevel)) {
                  armor = `${playerArmor}:1`;
                  client.hset("u:" + player.name, "armor", armor);
                }
              }

              if (!weapon || weapon.startsWith("sword1")) {
                weapon = `dagger:1`;
                client.hset("u:" + player.name, "weapon", weapon);
              } else {
                var [playerWeapon, weaponLevel] = (weapon || "").split(":");
                if (isNaN(weaponLevel)) {
                  weapon = `${playerWeapon}:1`;
                  client.hset("u:" + player.name, "weapon", weapon);
                } else if (playerWeapon === "sword2") {
                  weapon = `sword:${weaponLevel}`;
                  client.hset("u:" + player.name, "weapon", weapon);
                }
              }

              var achievement = new Array(ACHIEVEMENT_COUNT).fill(0);
              try {
                achievement = JSON.parse(replies[5]);

                // @NOTE Migrate old achievements to new
                if (achievement.length === 20) {
                  achievement = achievement
                    .slice(0, 15)
                    .concat([0, achievement[15], 0, 0, 0])
                    .concat(achievement.slice(16, 20));

                  client.hset("u:" + player.name, "achievement", JSON.stringify(achievement));
                }

                if (achievement.length < ACHIEVEMENT_COUNT) {
                  achievement = achievement.concat(new Array(ACHIEVEMENT_COUNT - achievement.length).fill(0));
                  client.hset("u:" + player.name, "achievement", JSON.stringify(achievement));
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
                if (replies[22]) {
                  stash = JSON.parse(replies[22]);
                } else {
                  client.hset("u:" + player.name, "stash", JSON.stringify(stash));
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

                  client.hset("u:" + player.name, "waypoints", JSON.stringify(waypoints));
                } else if (!waypoints) {
                  const classicWaypoint = [1, 0, 0];
                  const expansion1Waypoint = !!expansion1 ? [0, 0, 0] : [2, 2, 2];
                  waypoints = classicWaypoint.concat(expansion1Waypoint);

                  client.hset("u:" + player.name, "waypoints", JSON.stringify(waypoints));
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

                  client.hset("u:" + player.name, "waypoints", JSON.stringify(waypoints));
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
                  client.hset("u:" + player.name, "inventory", JSON.stringify(inventory));
                } else {
                  let hasSword2 = /sword2/.test(replies[6]);
                  inventory = JSON.parse(replies[6].replace(/sword2/g, "sword"));

                  // @NOTE Migrate inventory
                  if (inventory.length < INVENTORY_SLOT_COUNT || hasSword2) {
                    inventory = inventory.concat(new Array(INVENTORY_SLOT_COUNT - inventory.length).fill(0));

                    client.hset("u:" + player.name, "inventory", JSON.stringify(inventory));
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
                // @NOTE Migrate upgrade
                if (!upgrade) {
                  upgrade = new Array(UPGRADE_SLOT_COUNT).fill(0);
                  client.hset("u:" + player.name, "upgrade", JSON.stringify(upgrade));
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
                  client.hset("u:" + player.name, "gems", JSON.stringify(gems));
                } else {
                  gems = JSON.parse(replies[11]);

                  if (gems.length !== GEM_COUNT) {
                    gems = gems.concat(new Array(GEM_COUNT - gems.length).fill(0));

                    client.hset("u:" + player.name, "gems", JSON.stringify(gems));
                  }
                }
              } catch (err) {
                Sentry.captureException(err);
              }

              var artifact = new Array(ARTIFACT_COUNT).fill(0);
              try {
                if (!replies[17]) {
                  client.hset("u:" + player.name, "artifact", JSON.stringify(artifact));
                } else {
                  artifact = JSON.parse(replies[17]);
                }
              } catch (err) {
                Sentry.captureException(err);
              }

              var x = Utils.NaN2Zero(replies[7]);
              var y = Utils.NaN2Zero(replies[8]);
              var hash = replies[9];
              var hash1 = replies[21];
              var nanoPotions = parseInt(replies[10] || 0);

              // bcrypt.compare(player.account, account, function(err, res) {
              if (player.account != account) {
                player.connection.sendUTF8("invalidlogin");
                player.connection.close("Wrong Account: " + player.name);
                return;
              }

              log.info("Player name: " + player.name);
              log.info("Armor: " + armor);
              log.info("Weapon: " + weapon);
              log.info("Experience: " + exp);

              player.sendWelcome({
                armor,
                weapon,
                belt,
                ring1,
                ring2,
                amulet,
                exp,
                createdAt,
                inventory,
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
  },

  createPlayer: function (player) {
    var self = this;
    var userKey = "u:" + player.name;
    var curTime = new Date().getTime();

    // Check if username is taken
    client.sismember("usr", player.name, async function (err, reply) {
      if (reply === 1) {
        player.connection.sendUTF8("userexists");
        player.connection.close("Username not available: " + player.name);
        return;
      } else {
        // Add the player

        const depositAccountIndex = await self.createDepositAccount();

        client
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
          .hset(userKey, "ring1", null)
          .hset(userKey, "ring2", null)
          .hset(userKey, "amulet", null)
          .hset(userKey, "gems", JSON.stringify(new Array(GEM_COUNT).fill(0)))
          .hset(userKey, "artifact", JSON.stringify(new Array(ARTIFACT_COUNT).fill(0)))
          .hset(userKey, "upgrade", JSON.stringify(new Array(UPGRADE_SLOT_COUNT).fill(0)))
          .hset(userKey, "expansion1", 0)
          .hset(userKey, "waypoints", JSON.stringify([1, 0, 0, 2, 2, 2]))
          .hset(userKey, "depositAccountIndex", depositAccountIndex)
          .hset(userKey, "depositAccount", getNewDepositAccountByIndex(depositAccountIndex))
          .exec(function (err, replies) {
            log.info("New User: " + player.name);
            player.sendWelcome({
              armor: "clotharmor:1",
              weapon: "dagger:1",
              belt: null,
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
            });
          });
      }
    });
  },

  checkIsBanned: async player => {
    return new Promise((resolve, reject) => {
      const ipKey = "ipban:" + player.connection._connection.handshake.headers["cf-connecting-ip"];
      client.hget(ipKey, "timestamp", (err, reply) => {
        const timestamp = parseInt(reply);
        // isBanned is true if DB time is greater than now
        resolve(reply && timestamp > Date.now() ? timestamp : false);
      });
    });
  },

  banPlayer: function (banPlayer, reason) {
    // 24h
    let days = 1;
    client.hget(
      "ipban:" + banPlayer.connection._connection.handshake.headers["cf-connecting-ip"],
      "timestamp",
      (err, reply) => {
        if (reply) {
          days = 365;
        }
        const until = days * 24 * 60 * 60 * 1000 + Date.now();
        client.hset(
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
  },
  chatBan: function (adminPlayer, targetPlayer) {
    client.smembers("adminname", function (err, replies) {
      for (var index = 0; index < replies.length; index++) {
        if (replies[index].toString() === adminPlayer.name) {
          var curTime = new Date().getTime();
          adminPlayer.server.pushBroadcast(
            new Messages.Chat(targetPlayer, "/1 " + adminPlayer.name + "-- 채금 ->" + targetPlayer.name + " 10분"),
          );
          targetPlayer.chatBanEndTime = curTime + 10 * 60 * 1000;
          client.hset(
            "cb:" + targetPlayer.connection._connection.handshake.headers["cf-connecting-ip"],
            "etime",
            targetPlayer.chatBanEndTime.toString(),
          );
          log.info(
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
  },
  banTerm: function (time) {
    return Math.pow(2, time) * 500 * 60;
  },
  equipWeapon: function (name, weapon, level, bonus) {
    log.info("Set Weapon: " + name + " " + weapon + ":" + level);
    client.hset("u:" + name, "weapon", `${weapon}:${level}${bonus ? `:${bonus}` : ""}`);
  },
  equipArmor: function (name, armor, level, bonus) {
    log.info("Set Armor: " + name + " " + armor + ":" + level);
    client.hset("u:" + name, "armor", `${armor}:${level}${bonus ? `:${bonus}` : ""}`);
  },
  equipBelt: function (name, belt, level, bonus) {
    if (belt) {
      log.info("Set Belt: " + name + " " + belt + ":" + level);
      client.hset("u:" + name, "belt", `${belt}:${level}${bonus ? `:${bonus}` : ""}`);
    } else {
      log.info("Delete Belt");
      client.hdel("u:" + name, "belt");
    }
  },
  equipRing1: function ({ name, item, level, bonus }) {
    const ring1 = [item, level, bonus].filter(Boolean).join(":") || null;

    log.info(`Set Ring1: ${name} ring1`);
    if (ring1) {
      client.hset("u:" + name, "ring1", ring1);
    } else {
      client.hdel("u:" + name, "ring1");
    }
  },
  equipRing2: function ({ name, item, level, bonus }) {
    const ring2 = [item, level, bonus].filter(Boolean).join(":") || null;

    log.info(`Set Ring2: ${name} ring2`);
    if (ring2) {
      client.hset("u:" + name, "ring2", ring2);
    } else {
      client.hdel("u:" + name, "ring2");
    }
  },
  equipAmulet: function ({ name, item, level, bonus }) {
    const amulet = [item, level, bonus].filter(Boolean).join(":") || null;

    log.info(`Set Amulet: ${name} amulet`);
    if (amulet) {
      client.hset("u:" + name, "amulet", amulet);
    } else {
      client.hdel("u:" + name, "amulet");
    }
  },
  setExp: function (name, exp) {
    log.info("Set Exp: " + name + " " + exp);
    client.hset("u:" + name, "exp", exp);
  },
  setHash: function (name, hash) {
    log.info("Set Hash: " + name + " " + hash);
    client.hset("u:" + name, "hash", hash);
  },
  setHash1: function (name, hash) {
    log.info("Set Hash1: " + name + " " + hash);
    client.hset("u:" + name, "hash1", hash);
  },

  getItemLocation: function (slot) {
    if (slot < INVENTORY_SLOT_COUNT) {
      return ["inventory", 0];
    } else if (slot === Types.Slot.WEAPON) {
      return ["weapon", 0];
    } else if (slot === Types.Slot.ARMOR) {
      return ["armor", 0];
    } else if (slot === Types.Slot.BELT) {
      return ["belt", 0];
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

    return [];
  },

  sendMoveItem: function ({ player, location, data }) {
    if (location === "inventory") {
      player.send([Types.Messages.INVENTORY, data]);
    } else if (location === "stash") {
      player.send([Types.Messages.STASH, data]);
    } else if (location === "weapon") {
      let item = "dagger";
      let level = 1;
      let bonus = null;
      if (data) {
        [item, level, bonus] = data.split(":");
      }

      player.equipItem({ item, level, type: "weapon", bonus });
      player.broadcast(player.equip(player.weaponKind, player.weaponLevel, player.weaponBonus), false);
    } else if (location === "armor") {
      let item = "clotharmor";
      let level = 1;
      let bonus = null;
      if (data) {
        [item, level, bonus] = data.split(":");
      }

      player.equipItem({ item, level, type: "armor", bonus });
      player.broadcast(player.equip(player.armorKind, player.armorLevel, player.armorBonus), false);
    } else if (location === "belt") {
      let item = null;
      let level = null;
      let bonus = null;
      if (data) {
        [item, level, bonus] = data.split(":");
      }
      player.equipItem({ item, level, type: "belt", bonus });
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
  },

  moveItem: function ({ player, fromSlot, toSlot }) {
    if (fromSlot === toSlot) return;

    const self = this;

    const [fromLocation, fromRange] = this.getItemLocation(fromSlot);
    const [toLocation, toRange] = this.getItemLocation(toSlot);
    const isMultipleFrom = ["inventory", "upgrade", "stash"].includes(fromLocation);
    const isMultipleTo = ["inventory", "upgrade", "stash"].includes(toLocation);

    if (!fromLocation || !toLocation) return;

    client.hget("u:" + player.name, fromLocation, function (err, fromReply) {
      try {
        let fromReplyParsed = isMultipleFrom ? JSON.parse(fromReply) : fromReply;
        const fromItem = isMultipleFrom ? fromReplyParsed[fromSlot - fromRange] : fromReplyParsed;

        // @NOTE Should never happen but who knows
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

          self.sendMoveItem({ player, location: fromLocation, data: fromReplyParsed });
          client.hset("u:" + player.name, fromLocation, JSON.stringify(fromReplyParsed));
        } else {
          client.hget("u:" + player.name, toLocation, function (err, toReply) {
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
              } else if (["weapon", "armor", "belt", "ring1", "ring2", "amulet"].includes(toLocation)) {
                const [item, fromLevel] = fromItem.split(":");
                if (Types.getItemRequirement(item, fromLevel) > player.level) {
                  isFromReplyDone = true;
                  isToReplyDone = true;
                }
              } else if (["weapon", "armor", "belt", "ring1", "ring2", "amulet"].includes(fromLocation) && toItem) {
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

              self.sendMoveItem({ player, location: fromLocation, data: fromReplyParsed });
              if (isMultipleFrom) {
                client.hset("u:" + player.name, fromLocation, JSON.stringify(fromReplyParsed));
              }

              self.sendMoveItem({ player, location: toLocation, data: toReplyParsed });
              if (isMultipleTo) {
                client.hset("u:" + player.name, toLocation, JSON.stringify(toReplyParsed));
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
  },

  lootItems: function ({ player, items }) {
    client.hget("u:" + player.name, "inventory", function (err, reply) {
      try {
        let inventory = JSON.parse(reply);

        items.forEach(({ item, level, quantity, bonus }) => {
          let slotIndex = quantity ? inventory.findIndex(a => a && a.startsWith(item)) : -1;

          // Increase the scroll count
          if (slotIndex > -1) {
            const [, oldQuantity] = inventory[slotIndex].split(":");
            inventory[slotIndex] = `${item}:${parseInt(oldQuantity) + parseInt(quantity)}`;
          } else if (slotIndex === -1) {
            slotIndex = inventory.indexOf(0);
            if (slotIndex !== -1) {
              inventory[slotIndex] = [item, level || quantity, bonus].filter(Boolean).join(":");
            }
          }
        });

        player.send([Types.Messages.INVENTORY, inventory]);
        client.hset("u:" + player.name, "inventory", JSON.stringify(inventory));
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
      }
    });
  },

  moveUpgradeItemsToInventory: function (player) {
    const self = this;

    client.hget("u:" + player.name, "upgrade", function (err, reply) {
      try {
        let upgrade = JSON.parse(reply);
        filteredUpgrade = upgrade.filter(Boolean);

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

          self.lootItems({ player, items });

          upgrade = upgrade.map(() => 0);

          player.send([Types.Messages.UPGRADE, upgrade]);
          client.hset("u:" + player.name, "upgrade", JSON.stringify(upgrade));
        }
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
      }
    });
  },

  upgradeItem: function (player) {
    var self = this;

    client.hget("u:" + player.name, "upgrade", function (err, reply) {
      try {
        let isLucky7 = false;
        let upgrade = JSON.parse(reply);
        const slotIndex = upgrade.findIndex(index => index && index.startsWith("scroll"));
        const luckySlot = Utils.randomInt(1, 9);
        const isLuckySlot = slotIndex === luckySlot;
        const filteredUpgrade = upgrade.filter(Boolean);
        let isSuccess = false;

        if (Utils.isValidUpgradeItems(filteredUpgrade)) {
          const [item, level, bonus] = filteredUpgrade[0].split(":");
          let upgradedItem = 0;

          if (Utils.isUpgradeSuccess(level, isLuckySlot)) {
            const upgradedLevel = parseInt(level) + 1;
            upgradedItem = [item, parseInt(level) + 1, bonus].filter(Boolean).join(":");
            isSuccess = true;
            isLucky7 = upgradedLevel === 7 && Types.isBaseHighClassItem(item);

            if (upgradedLevel >= 8) {
              self.logUpgrade({ player, item: upgradedItem, isSuccess });
            }
          } else {
            if (parseInt(level) >= 8) {
              self.logUpgrade({ player, item: filteredUpgrade[0], isSuccess: false });
            }
          }

          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = upgradedItem;
          player.broadcast(new Messages.AnvilUpgrade(isSuccess), false);
        } else {
          self.moveUpgradeItemsToInventory(player);
        }

        player.send([Types.Messages.UPGRADE, upgrade, { luckySlot, isLucky7, isSuccess }]);
        client.hset("u:" + player.name, "upgrade", JSON.stringify(upgrade));
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
      }
    });
  },

  foundAchievement: function (name, index) {
    log.info("Found Achievement: " + name + " " + index + 1);
    client.hget("u:" + name, "achievement", function (err, reply) {
      try {
        var achievement = JSON.parse(reply);
        achievement[index] = 1;
        achievement = JSON.stringify(achievement);
        client.hset("u:" + name, "achievement", achievement);
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  },

  foundWaypoint: function (name, index) {
    log.info("Found Waypoint: " + name + " " + index);
    client.hget("u:" + name, "waypoints", function (err, reply) {
      try {
        var waypoints = JSON.parse(reply);
        waypoints[index] = 1;
        waypoints = JSON.stringify(waypoints);
        client.hset("u:" + name, "waypoints", waypoints);
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  },

  unlockExpansion1: function (player) {
    log.info("Unlock Expansion1: " + player.name);
    client.hset("u:" + player.name, "expansion1", 1);
    client.hget("u:" + player.name, "waypoints", function (err, reply) {
      try {
        var waypoints = JSON.parse(reply);
        waypoints = waypoints.slice(0, 3).concat([1, 0, 0]);
        player.send([Types.Messages.WAYPOINTS_UPDATE, waypoints]);
        waypoints = JSON.stringify(waypoints);
        client.hset("u:" + player.name, "waypoints", waypoints);
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  },

  foundNanoPotion: function (name) {
    log.info("Found NanoPotion: " + name);
    client.hget("u:" + name, "nanoPotions", function (err, reply) {
      try {
        if (reply) {
          client.hincrby("u:" + name, "nanoPotions", 1);
        } else {
          client.hset("u:" + name, "nanoPotions", 1);
        }
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  },
  foundGem: function (name, index) {
    log.info("Found Gem: " + name + " " + index + 1);
    client.hget("u:" + name, "gems", function (err, reply) {
      try {
        var gems = reply ? JSON.parse(reply) : new Array(GEM_COUNT).fill(0);
        gems[index] = 1;
        gems = JSON.stringify(gems);
        client.hset("u:" + name, "gems", gems);
      } catch (err) {}
    });
  },

  foundArtifact: function (name, index) {
    log.info("Found Artifact: " + name + " " + index + 1);
    client.hget("u:" + name, "artifact", function (err, reply) {
      try {
        var artifact = reply ? JSON.parse(reply) : new Array(ARTIFACT_COUNT).fill(0);
        artifact[index] = 1;
        artifact = JSON.stringify(artifact);
        client.hset("u:" + name, "artifact", artifact);
      } catch (err) {}
    });
  },
  // progressAchievement: function (name, number, progress) {
  //   log.info("Progress Achievement: " + name + " " + number + " " + progress);
  //   client.hset("u:" + name, "achievement" + number + ":progress", progress);
  // },
  setUsedPubPts: function (name, usedPubPts) {
    log.info("Set Used Pub Points: " + name + " " + usedPubPts);
    client.hset("u:" + name, "usedPubPts", usedPubPts);
  },
  setCheckpoint: function (name, x, y) {
    log.info("Set Check Point: " + name + " " + x + " " + y);
    client.hset("u:" + name, "x", x);
    client.hset("u:" + name, "y", y);
  },
  loadBoard: function (player, command, number, replyNumber) {
    log.info("Load Board: " + player.name + " " + command + " " + number + " " + replyNumber);
    if (command === "view") {
      client
        .multi()
        .hget("bo:free", number + ":title")
        .hget("bo:free", number + ":content")
        .hget("bo:free", number + ":writer")
        .hincrby("bo:free", number + ":cnt", 1)
        .smembers("bo:free:" + number + ":up")
        .smembers("bo:free:" + number + ":down")
        .hget("bo:free", number + ":time")
        .exec(function (err, replies) {
          var title = replies[0];
          var content = replies[1];
          var writer = replies[2];
          var counter = replies[3];
          var up = replies[4].length;
          var down = replies[5].length;
          var time = replies[6];
          player.send([Types.Messages.BOARD, "view", title, content, writer, counter, up, down, time]);
        });
    } else if (command === "reply") {
      client
        .multi()
        .hget("bo:free", number + ":reply:" + replyNumber + ":writer")
        .hget("bo:free", number + ":reply:" + replyNumber + ":content")
        .smembers("bo:free:" + number + ":reply:" + replyNumber + ":up")
        .smembers("bo:free:" + number + ":reply:" + replyNumber + ":down")

        .hget("bo:free", number + ":reply:" + (replyNumber + 1) + ":writer")
        .hget("bo:free", number + ":reply:" + (replyNumber + 1) + ":content")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 1) + ":up")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 1) + ":down")

        .hget("bo:free", number + ":reply:" + (replyNumber + 2) + ":writer")
        .hget("bo:free", number + ":reply:" + (replyNumber + 2) + ":content")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 2) + ":up")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 2) + ":down")

        .hget("bo:free", number + ":reply:" + (replyNumber + 3) + ":writer")
        .hget("bo:free", number + ":reply:" + (replyNumber + 3) + ":content")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 3) + ":up")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 3) + ":down")

        .hget("bo:free", number + ":reply:" + (replyNumber + 4) + ":writer")
        .hget("bo:free", number + ":reply:" + (replyNumber + 4) + ":content")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 4) + ":up")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 4) + ":down")

        .exec(function (err, replies) {
          player.send([
            Types.Messages.BOARD,
            "reply",
            replies[0],
            replies[1],
            replies[2].length,
            replies[3].length,
            replies[4],
            replies[5],
            replies[6].length,
            replies[7].length,
            replies[8],
            replies[9],
            replies[10].length,
            replies[11].length,
            replies[12],
            replies[13],
            replies[14].length,
            replies[15].length,
            replies[16],
            replies[17],
            replies[18].length,
            replies[19].length,
          ]);
        });
    } else if (command === "up") {
      if (player.level >= 50) {
        client.sadd("bo:free:" + number + ":up", player.name);
      }
    } else if (command === "down") {
      if (player.level >= 50) {
        client.sadd("bo:free:" + number + ":down", player.name);
      }
    } else if (command === "replyup") {
      if (player.level >= 50) {
        client.sadd("bo:free:" + number + ":reply:" + replyNumber + ":up", player.name);
      }
    } else if (command === "replydown") {
      if (player.level >= 50) {
        client.sadd("bo:free:" + number + ":reply:" + replyNumber + ":down", player.name);
      }
    } else if (command === "list") {
      client.hget("bo:free", "lastnum", function (err, reply) {
        var lastnum = reply;
        if (number > 0) {
          lastnum = number;
        }
        client
          .multi()
          .hget("bo:free", lastnum + ":title")
          .hget("bo:free", lastnum - 1 + ":title")
          .hget("bo:free", lastnum - 2 + ":title")
          .hget("bo:free", lastnum - 3 + ":title")
          .hget("bo:free", lastnum - 4 + ":title")
          .hget("bo:free", lastnum - 5 + ":title")
          .hget("bo:free", lastnum - 6 + ":title")
          .hget("bo:free", lastnum - 7 + ":title")
          .hget("bo:free", lastnum - 8 + ":title")
          .hget("bo:free", lastnum - 9 + ":title")

          .hget("bo:free", lastnum + ":writer")
          .hget("bo:free", lastnum - 1 + ":writer")
          .hget("bo:free", lastnum - 2 + ":writer")
          .hget("bo:free", lastnum - 3 + ":writer")
          .hget("bo:free", lastnum - 4 + ":writer")
          .hget("bo:free", lastnum - 5 + ":writer")
          .hget("bo:free", lastnum - 6 + ":writer")
          .hget("bo:free", lastnum - 7 + ":writer")
          .hget("bo:free", lastnum - 8 + ":writer")
          .hget("bo:free", lastnum - 9 + ":writer")

          .hget("bo:free", lastnum + ":cnt")
          .hget("bo:free", lastnum - 1 + ":cnt")
          .hget("bo:free", lastnum - 2 + ":cnt")
          .hget("bo:free", lastnum - 3 + ":cnt")
          .hget("bo:free", lastnum - 4 + ":cnt")
          .hget("bo:free", lastnum - 5 + ":cnt")
          .hget("bo:free", lastnum - 6 + ":cnt")
          .hget("bo:free", lastnum - 7 + ":cnt")
          .hget("bo:free", lastnum - 8 + ":cnt")
          .hget("bo:free", lastnum - 9 + ":cnt")

          .smembers("bo:free:" + lastnum + ":up")
          .smembers("bo:free:" + (lastnum - 1) + ":up")
          .smembers("bo:free:" + (lastnum - 2) + ":up")
          .smembers("bo:free:" + (lastnum - 3) + ":up")
          .smembers("bo:free:" + (lastnum - 4) + ":up")
          .smembers("bo:free:" + (lastnum - 5) + ":up")
          .smembers("bo:free:" + (lastnum - 6) + ":up")
          .smembers("bo:free:" + (lastnum - 7) + ":up")
          .smembers("bo:free:" + (lastnum - 8) + ":up")
          .smembers("bo:free:" + (lastnum - 9) + ":up")

          .smembers("bo:free:" + lastnum + ":down")
          .smembers("bo:free:" + (lastnum - 1) + ":down")
          .smembers("bo:free:" + (lastnum - 2) + ":down")
          .smembers("bo:free:" + (lastnum - 3) + ":down")
          .smembers("bo:free:" + (lastnum - 4) + ":down")
          .smembers("bo:free:" + (lastnum - 5) + ":down")
          .smembers("bo:free:" + (lastnum - 6) + ":down")
          .smembers("bo:free:" + (lastnum - 7) + ":down")
          .smembers("bo:free:" + (lastnum - 8) + ":down")
          .smembers("bo:free:" + (lastnum - 9) + ":down")

          .hget("bo:free", lastnum + ":replynum")
          .hget("bo:free", lastnum + 1 + ":replynum")
          .hget("bo:free", lastnum + 2 + ":replynum")
          .hget("bo:free", lastnum + 3 + ":replynum")
          .hget("bo:free", lastnum + 4 + ":replynum")
          .hget("bo:free", lastnum + 5 + ":replynum")
          .hget("bo:free", lastnum + 6 + ":replynum")
          .hget("bo:free", lastnum + 7 + ":replynum")
          .hget("bo:free", lastnum + 8 + ":replynum")
          .hget("bo:free", lastnum + 9 + ":replynum")

          .exec(function (err, replies) {
            var i = 0;
            var msg = [Types.Messages.BOARD, "list", lastnum];

            for (i = 0; i < 30; i++) {
              msg.push(replies[i]);
            }
            for (i = 30; i < 50; i++) {
              msg.push(replies[i].length);
            }
            for (i = 50; i < 60; i++) {
              msg.push(replies[i]);
            }

            player.send(msg);
          });
      });
    }
  },
  writeBoard: function (player, title, content) {
    log.info("Write Board: " + player.name + " " + title);
    client.hincrby("bo:free", "lastnum", 1, function (err, reply) {
      var curTime = new Date().getTime();
      var number = reply ? reply : 1;
      client
        .multi()
        .hset("bo:free", number + ":title", title)
        .hset("bo:free", number + ":content", content)
        .hset("bo:free", number + ":writer", player.name)
        .hset("bo:free", number + ":time", curTime)
        .exec();
      player.send([Types.Messages.BOARD, "view", title, content, player.name, 0, 0, 0, curTime]);
    });
  },
  writeReply: function (player, content, number) {
    log.info("Write Reply: " + player.name + " " + content + " " + number);
    var self = this;
    client.hincrby("bo:free", number + ":replynum", 1, function (err, reply) {
      var replyNum = reply ? reply : 1;
      client
        .multi()
        .hset("bo:free", number + ":reply:" + replyNum + ":content", content)
        .hset("bo:free", number + ":reply:" + replyNum + ":writer", player.name)
        .exec(function (err, replies) {
          player.send([Types.Messages.BOARD, "reply", player.name, content]);
        });
    });
  },
  pushKungWord: function (player, word) {
    var server = player.server;

    if (player === server.lastKungPlayer) {
      return;
    }
    if (server.isAlreadyKung(word)) {
      return;
    }
    if (!server.isRightKungWord(word)) {
      return;
    }

    if (server.kungWords.length === 0) {
      client.srandmember("dic", function (err, reply) {
        var randWord = reply;
        server.pushKungWord(player, randWord);
      });
    } else {
      client.sismember("dic", word, function (err, reply) {
        if (reply === 1) {
          server.pushKungWord(player, word);
        } else {
          player.send([Types.Messages.NOTIFY, word + "는 사전에 없습니다."]);
        }
      });
    }
  },

  setDepositAccount: function () {
    client.setnx("deposit_account_count", 0);
  },

  createDepositAccount: async function () {
    return await queue.enqueue(
      () =>
        new Promise((resolve, reject) => {
          client.incr("deposit_account_count", function (error, reply) {
            resolve(reply);
          });
        }),
    );
  },

  settlePurchase: function ({ player, account, amount, hash, id }) {
    try {
      if (id === Types.Store.EXPANSION1) {
        player.expansion1 = true;
        this.unlockExpansion1(player);
        this.lootItems({ player, items: [{ item: "scrollupgradehigh", quantity: 5 }] });
      } else if (id === Types.Store.SCROLLUPGRADEHIGH) {
        this.lootItems({ player, items: [{ item: "scrollupgradehigh", quantity: 10 }] });
      } else if (id === Types.Store.SCROLLUPGRADEMEDIUM) {
        this.lootItems({ player, items: [{ item: "scrollupgrademedium", quantity: 10 }] });
      } else {
        throw new Error("Invalid purchase id");
      }

      player.send([Types.Messages.PURCHASE_COMPLETED, { hash, id }]);

      const now = Date.now();
      client.zadd("purchase", now, JSON.stringify({ player: player.name, account, hash, id, amount }));
    } catch (err) {
      player.send([
        Types.Messages.PURCHASE_ERROR,
        {
          message: "An error happened while completing your purchase, contact the game admin to receive your purchase.",
        },
      ]);

      Sentry.captureException(err, { extra: { account, amount, hash, id } });
    }
  },

  logUpgrade: function ({ player, item, isSuccess }) {
    const now = Date.now();
    client.zadd("upgrade", now, JSON.stringify({ player: player.name, item, isSuccess }));
  },
});
