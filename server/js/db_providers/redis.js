const Utils = require("../utils");
const cls = require("../lib/class");
const Player = require("../player");
const Messages = require("../message");
const redis = require("redis");
const bcrypt = require("bcrypt");
const { Sentry } = require("../sentry");

const INVENTORY_SLOT_COUNT = 24;
const WEAPON_SLOT = 100;
const ARMOR_SLOT = 101;
const DELETE_SLOT = -1;
const UPGRADE_SLOT_COUNT = 11;
const UPGRADE_SLOT_RANGE = 200;
const ACHIEVEMENT_COUNT = 24;
const GEM_COUNT = 4;

module.exports = DatabaseHandler = cls.Class.extend({
  init: function () {
    client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, {
      socket_nodelay: true,
      password: process.env.REDIS_PASSWORD,
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
            .exec(function (err, replies) {
              var account = replies[0];
              var armor = replies[1];
              var weapon = replies[2];
              var exp = Utils.NaN2Zero(replies[3]);
              var createdAt = Utils.NaN2Zero(replies[4]);

              var [playerArmor, armorLevel] = armor.split(":");
              if (isNaN(armorLevel)) {
                armor = `${playerArmor}:1`;
                client.hset("u:" + player.name, "armor", armor);
              }

              var [playerWeapon, weaponLevel] = weapon.split(":");
              if (isNaN(weaponLevel)) {
                weapon = `${playerWeapon}:1`;
                client.hset("u:" + player.name, "weapon", weapon);
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
              } catch (err) {
                // invalid json
                Sentry.captureException(err);
              }

              var inventory = replies[6];
              try {
                if (!inventory) {
                  inventory = new Array(INVENTORY_SLOT_COUNT).fill(0);
                  client.hset("u:" + player.name, "inventory", JSON.stringify(inventory));
                } else {
                  inventory = JSON.parse(replies[6]);

                  // @NOTE Migrate inventory
                  if (inventory.length < 24) {
                    inventory = inventory.concat(new Array(INVENTORY_SLOT_COUNT - inventory.length).fill(0));

                    client.hset("u:" + player.name, "inventory", JSON.stringify(inventory));
                  }
                }
              } catch (err) {
                console.log(err);
                Sentry.captureException(err);
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
                Sentry.captureException(err);
              }

              var gems = new Array(GEM_COUNT).fill(0);
              try {
                if (!replies[11]) {
                  client.hset("u:" + player.name, "gems", JSON.stringify(gems));
                } else {
                  gems = JSON.parse(replies[11]);
                }
              } catch (err) {
                console.log(err);
                Sentry.captureException(err);
              }

              var x = Utils.NaN2Zero(replies[7]);
              var y = Utils.NaN2Zero(replies[8]);
              var hash = replies[9];
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
                exp,
                createdAt,
                inventory,
                x,
                y,
                achievement,
                inventory,
                hash,
                nanoPotions,
                gems,
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
    var userKey = "u:" + player.name;
    var curTime = new Date().getTime();

    // Check if username is taken
    client.sismember("usr", player.name, function (err, reply) {
      if (reply === 1) {
        player.connection.sendUTF8("userexists");
        player.connection.close("Username not available: " + player.name);
        return;
      } else {
        // Add the player
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
          .hset(userKey, "nanoPotions", 0)
          .hset(userKey, "gems", JSON.stringify(new Array(GEM_COUNT).fill(0)))
          .hset(userKey, "upgrade", JSON.stringify(new Array(UPGRADE_SLOT_COUNT).fill(0)))
          .exec(function (err, replies) {
            log.info("New User: " + player.name);
            player.sendWelcome({
              armor: "clotharmor:1",
              weapon: "sword1:1",
              exp: 0,
              createdAt: curTime,
              x: player.x,
              y: player.y,
              achievement: new Array(ACHIEVEMENT_COUNT).fill(0),
              inventory: [],
              nanoPotions: 0,
              gems: new Array(GEM_COUNT).fill(0),
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
  equipArmor: function (name, armor, level) {
    log.info("Set Armor: " + name + " " + armor + ":" + level);
    client.hset("u:" + name, "armor", `${armor}:${level}`);
  },
  equipWeapon: function (name, weapon, level) {
    log.info("Set Weapon: " + name + " " + weapon + ":" + level);
    client.hset("u:" + name, "weapon", `${weapon}:${level}`);
  },
  setExp: function (name, exp) {
    log.info("Set Exp: " + name + " " + exp);
    client.hset("u:" + name, "exp", exp);
  },
  setHash: function (name, hash) {
    log.info("Set Hash: " + name + " " + hash);
    client.hset("u:" + name, "hash", hash);
  },

  getItemLocation: function (slot) {
    if (slot < INVENTORY_SLOT_COUNT) {
      return ["inventory", 0];
    } else if (slot === WEAPON_SLOT) {
      return ["weapon", 0];
    } else if (slot === ARMOR_SLOT) {
      return ["armor", 0];
    } else if (slot >= UPGRADE_SLOT_RANGE && slot <= UPGRADE_SLOT_RANGE + 10) {
      return ["upgrade", UPGRADE_SLOT_RANGE];
    }

    return [];
  },

  sendMoveItem: function ({ player, location, data }) {
    if (location === "inventory") {
      player.send([Types.Messages.INVENTORY, data]);
    } else if (location === "weapon") {
      if (!data) {
        data = "sword1:1";
      }
      player.equipItem(...data.split(":"));
      player.broadcast(player.equip(player.weaponKind), false);
    } else if (location === "armor") {
      if (!data) {
        data = "clotharmor:1";
      }
      player.equipItem(...data.split(":"));
      player.broadcast(player.equip(player.armorKind), false);
    } else if (location === "upgrade") {
      player.send([Types.Messages.UPGRADE, data]);
    }
  },

  moveItem: function ({ player, fromSlot, toSlot }) {
    if (fromSlot === toSlot) return;

    const self = this;

    const [fromLocation, fromRange] = this.getItemLocation(fromSlot);
    const [toLocation, toRange] = this.getItemLocation(toSlot);
    const isMultipleFrom = ["inventory", "upgrade"].includes(fromLocation);
    const isMultipleTo = ["inventory", "upgrade"].includes(toLocation);

    if (!fromLocation || !toLocation) return;

    client.hget("u:" + player.name, fromLocation, function (err, fromReply) {
      try {
        let fromReplyParsed = isMultipleFrom ? JSON.parse(fromReply) : fromReply;
        const fromItem = isMultipleFrom ? fromReplyParsed[fromSlot - fromRange] : fromReplyParsed;

        // @NOTE Should never happen but who knows
        if (["sword1:1", "clotharmor:1"].includes(fromItem) && toSlot !== -1) return;

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

              if (["sword1:1", "clotharmor:1"].includes(toItem)) {
                toItem = 0;
              }

              // @NOTE Strict rule, 1 upgrade scroll limit, tweak this later on
              if (Types.isScroll(fromItem)) {
                const [fromScroll, fromQuantity] = fromItem.split(":");
                if (toLocation === "inventory") {
                  let toItemIndex = toReplyParsed.findIndex(a => a && a.startsWith(fromScroll));

                  if (toItemIndex === -1) {
                    toItemIndex = toItem ? toReplyParsed.indexOf(0) : toSlot;
                  }

                  if (toItemIndex > -1) {
                    const [, toQuantity = 0] = (toReplyParsed[toItemIndex] || "").split(":");
                    toReplyParsed[toItemIndex - toRange] = `${fromScroll}:${
                      parseInt(toQuantity) + parseInt(fromQuantity)
                    }`;

                    if (fromLocation === "upgrade") {
                      fromReplyParsed[fromSlot - fromRange] = 0;
                      isFromReplyDone = true;
                    }

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
              } else if (["weapon", "armor"].includes(toLocation)) {
                const [item, fromLevel] = fromItem.split(":");
                if (Types.getItemRequirement(item, fromLevel) > player.level) {
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

        items.forEach(({ item, level, quantity }) => {
          let slotIndex = quantity ? inventory.findIndex(a => a && a.startsWith(item)) : -1;

          if (slotIndex > -1) {
            const [, oldQuantity] = inventory[slotIndex].split(":");
            inventory[slotIndex] = `${item}:${parseInt(oldQuantity) + parseInt(quantity)}`;
          } else if (slotIndex === -1) {
            slotIndex = inventory.indexOf(0);
            if (slotIndex !== -1) {
              inventory[slotIndex] = `${item}:${level || quantity}`;
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
            const [item, level] = rawItem.split(":");
            const isQuantity = Types.isScroll(item);

            acc.push({
              item,
              [isQuantity ? "quantity" : "level"]: level,
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
        let upgrade = JSON.parse(reply);
        filteredUpgrade = upgrade.filter(Boolean);

        if (Utils.isValidUpgradeItems(filteredUpgrade)) {
          const [item, level] = filteredUpgrade[0].split(":");
          let upgradedItem = 0;

          if (Utils.isUpgradeSuccess(level)) {
            upgradedItem = `${item}:${parseInt(level) + 1}`;
          }

          upgrade = upgrade.map(() => 0);
          upgrade[upgrade.length - 1] = upgradedItem;
        } else {
          self.moveUpgradeItemsToInventory(player);
        }

        player.send([Types.Messages.UPGRADE, upgrade]);
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
});
