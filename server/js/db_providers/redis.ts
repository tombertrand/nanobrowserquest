import bcrypt from "bcrypt";
import * as NanocurrencyWeb from "nanocurrency-web";

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
  // WAYPOINTS_COUNT,
} from "../../../shared/js/slots";
import { StoreItems } from "../../../shared/js/store";
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
import { isValidRecipe } from "../../../shared/js/utils";
import {
  discordClient,
  EmojiMap,
  postMessageToDiscordAnvilChannel,
  postMessageToDiscordEventChannel,
  postMessageToDiscordModeratorDebugChannel,
  postMessageToDiscordModeratorMerchantChannel,
  postMessageToDiscordPurchaseChannel,
  postMessageToDiscordWelcomeChannel,
} from "../discord";
import Messages from "../message";
import { CHATBAN_PATTERNS } from "../player";
import { PromiseQueue } from "../promise-queue";
import { Sentry } from "../sentry";
import {
  generateBlueChestItem,
  generateChristmasPresentItem,
  generateDeadChestItem,
  generateGreenChestItem,
  generatePurpleChestItem,
  generateRandomPet,
  generateRedChestItem,
  getIsTransmuteSuccess,
  isUpgradeSuccess,
  isValidAddWeaponSkill,
  isValidDowngradeRune,
  isValidSocketItem,
  isValidSocketPetCollar,
  isValidStoneSocket,
  isValidTransmuteItems,
  isValidTransmutePet,
  isValidUpgradeElementItems,
  isValidUpgradeItems,
  isValidUpgradeRunes,
  isValidUpgradeskillrandom,
  // NaN2Zero,
  randomInt,
} from "../utils";
import { DEPOSIT_SEED, redisClient } from "./client";

import type Player from "../player";

const GEM_COUNT = 5;
const ARTIFACT_COUNT = 4;

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
    this.client = redisClient;

    // setImmediate(async () => {
    //   this.client = await connectRedis();
    // });
  }

  async assignNewDepositAccount(
    player,
    network: Network,
  ): Promise<{ depositAccount: string; depositAccountIndex: number }> {
    // Make sure the player doesn't have a valid deposit account, once it's set it can't be changed
    if (!player || player.depositAccount || player.depositAccountIndex || !network) return;

    const userKey = "u:" + player.name;

    const rawDepositAccount = await this.client.hmGet(userKey, "depositAccount", "depositAccountIndex");
    if (!rawDepositAccount) {
      Sentry.captureException(new Error("Unable to get deposit account"), { extra: { player: player.name } });

      return;
    }

    let [depositAccount, depositAccountIndex] = rawDepositAccount;
    if (depositAccount || depositAccountIndex) return;

    depositAccountIndex = await this.createDepositAccount();
    depositAccount = await getNewDepositAccountByIndex(depositAccountIndex as number, network);

    if (typeof depositAccountIndex !== "number" || !depositAccount) {
      Sentry.captureException(new Error("Invalid deposit account when creating player"), {
        extra: { depositAccountIndex, depositAccount, player: player.name },
      });
      return;
    }

    const isSuccess = await this.client.hmSet(
      userKey,
      "depositAccount",
      depositAccount,
      "depositAccountIndex",
      depositAccountIndex,
    );
    if (!isSuccess) {
      Sentry.captureException(new Error("Unable to set new deposit account"), {
        extra: { player: player.name },
      });
      return;
    }

    player.depositAccountIndex = depositAccountIndex;
    player.depositAccount = depositAccount;
    player.network = network;

    return { depositAccount, depositAccountIndex };
  }

  async loadPlayer(player) {
    var userKey = "u:" + player.name;

    console.log("~~~~load player", player.name);

    let [
      account,
      armor,
      weapon,
      exp,
      createdAt,
      achievement,
      inventory,
      x,
      y,
      hash,
      nanoPotions,
      gems,
      ring1,
      ring2,
      amulet,
      belt,
      cape,
      shield,
      artifact,
      expansion1,
      expansion2,
      waypoints,
      depositAccount,
      depositAccountIndex,
      stash,
      settings,
      network,
      gold,
      goldStash,
      goldTrade,
      discordId,
      helm,
      pet,
    ] = await this.client
      .multi()
      .hGet(userKey, "account") // 0
      .hGet(userKey, "armor") // 1
      .hGet(userKey, "weapon") // 2
      .hGet(userKey, "exp") // 3
      .hGet(userKey, "createdAt") // 4
      .hGet(userKey, "achievement") // 5
      .hGet(userKey, "inventory") // 6
      .hGet(userKey, "x") // 7
      .hGet(userKey, "y") // 8
      .hGet(userKey, "hash") // 9
      .hGet(userKey, "nanoPotions") // 10
      .hGet(userKey, "gems") // 11
      .hGet(userKey, "upgrade") // 12
      .hGet(userKey, "ring1") // 13
      .hGet(userKey, "ring2") // 14
      .hGet(userKey, "amulet") // 15
      .hGet(userKey, "belt") // 16
      .hGet(userKey, "cape") // 17
      .hGet(userKey, "shield") // 18
      .hGet(userKey, "artifact") // 19
      .hGet(userKey, "expansion1") // 20
      .hGet(userKey, "expansion2") // 21
      .hGet(userKey, "waypoints") // 22
      .hGet(userKey, "depositAccount") // 23
      .hGet(userKey, "depositAccountIndex") // 24
      .hGet(userKey, "stash") // 25
      .hGet(userKey, "settings") // 26
      .hGet(userKey, "network") // 27
      .hGet(userKey, "trade") // 28
      .hGet(userKey, "gold") // 29
      .hGet(userKey, "goldStash") // 30
      .hGet(userKey, "goldTrade") // 31
      .hGet(userKey, "discordId") // 33
      .hGet(userKey, "helm") // 35
      .hGet(userKey, "pet") // 36
      .exec();

    if (account) {
      if (!network) {
        [network] = account.split("_");
        await this.client.hSet("u:" + player.name, "network", network);
      }

      if (!depositAccount && ["nano", "ban"].includes(network)) {
        try {
          ({ depositAccount, depositAccountIndex } = await this.assignNewDepositAccount(player, network));
        } catch (_errAccount) {
          return;
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

      // stash = stash.map(rawItem => {
      //   if (typeof rawItem === "string" && rawItem.startsWith("shield")) {
      //     const [item, level, bonus, skill] = rawItem.split(":");
      //     return skill && skill.length <= 1
      //       ? [item, level, bonus || `[]`, `[]`, skill].filter(Boolean).join(":")
      //       : rawItem;
      //   }
      //   return rawItem;
      // });
      // await this.client.hSet("u:" + player.name, "stash", JSON.stringify(stash));

      // return true;

      // try {
      //   // settings = Object.assign({ ...defaultSettings }, JSON.parse(settings || "{}"));
      // } catch (_err) {
      //   // Silence err
      // }

      // Restore the trade gold in the main inventory gold
      if (goldTrade) {
        gold = gold + goldTrade;
        goldTrade = 0;

        await this.client.hmSet("u:" + player.name, "gold", gold, "goldTrade", 0);
      }

      // var x = NaN2Zero(replies[7]);
      // var y = NaN2Zero(replies[8]);
      // // var hash = replies[9];
      // var nanoPotions = parseInt(replies[10] || 0);

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
    }

    // Could not find the user
    // player.connection.sendUTF8("invalidlogin");
    // player.connection.close("User does not exist: " + player.name);
    return;
  }

  validateCreatePlayer(player) {
    const MAX_PLAYER_CREATED_FOR_IP_BY_24H = 5;
    if (CHATBAN_PATTERNS.test(player.name)) {
      player.connection.sendUTF8("invalidusername");
      player.connection.close("User does not exist: " + player.name);

      postMessageToDiscordModeratorDebugChannel(`Invalid player name for creation **${player.name}**`);
      return false;
    }

    if (!Array.isArray(player.server.maxPlayerCreateByIp[player.ip])) {
      player.server.maxPlayerCreateByIp[player.ip] = [];
    }

    if (player.server.maxPlayerCreateByIp[player.ip].length >= MAX_PLAYER_CREATED_FOR_IP_BY_24H) {
      player.connection.sendUTF8("invalidusernameCreation");

      postMessageToDiscordModeratorDebugChannel(
        `more than **${MAX_PLAYER_CREATED_FOR_IP_BY_24H}**  players for same IP: **${
          player.ip
        }** created for 24h, Forbidden **${player.name}** ,Other characters are: ${player.server.maxPlayerCreateByIp[
          player.ip
        ].join(",")}`,
      );
      return false;
    } else {
      player.server.maxPlayerCreateByIp[player.ip].push(player.name);
    }

    return true;
  }

  async createPlayer(player) {
    var userKey = "u:" + player.name;
    var curTime = new Date().getTime();

    await this.setDepositAccount();

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
      postMessageToDiscordWelcomeChannel(`A new adventurer **${player.name}** has just arrived in our realm 🎉`);
    } else {
      postMessageToDiscordWelcomeChannel(
        `A new adventurer has just arrived in our realm. **${player.name}** has joined the ranks of **${
          player.network === "nano" ? ` Nano ${EmojiMap.nbq}` : ` Banano ${EmojiMap.bbq}`
        }** 🎉`,
      );
    }

    this.client
      .multi()
      .hSet(userKey, "account", player.account)
      .hSet(userKey, "exp", 0)
      .hSet(userKey, "gold", 0)
      .hSet(userKey, "goldStash", 0)
      .hSet(userKey, "ip", player.ip || "")
      .hSet(userKey, "createdAt", curTime)
      .hSet(userKey, "achievement", JSON.stringify(new Array(ACHIEVEMENT_COUNT).fill(0)))
      .hSet(userKey, "inventory", JSON.stringify(new Array(INVENTORY_SLOT_COUNT).fill(0)))
      .hSet(userKey, "stash", JSON.stringify(new Array(STASH_SLOT_COUNT).fill(0)))
      .hSet(userKey, "nanoPotions", 0)
      .hSet(userKey, "weapon", "dagger:1")
      .hSet(userKey, "helm", "helmcloth:1")
      .hSet(userKey, "armor", "clotharmor:1")
      .hSet(userKey, "belt", null)
      .hSet(userKey, "cape", null)
      .hSet(userKey, "pet", null)
      .hSet(userKey, "shield", null)
      .hSet(userKey, "settings", JSON.stringify(defaultSettings))
      .hSet(userKey, "ring1", null)
      .hSet(userKey, "ring2", null)
      .hSet(userKey, "amulet", null)
      .hSet(userKey, "gems", JSON.stringify(new Array(GEM_COUNT).fill(0)))
      .hSet(userKey, "artifact", JSON.stringify(new Array(ARTIFACT_COUNT).fill(0)))
      .hSet(userKey, "upgrade", JSON.stringify(new Array(UPGRADE_SLOT_COUNT).fill(0)))
      .hSet(userKey, "trade", JSON.stringify(new Array(TRADE_SLOT_COUNT).fill(0)))
      .hSet(userKey, "expansion1", 0)
      .hSet(userKey, "expansion2", 0)
      .hSet(userKey, "waypoints", JSON.stringify([1, 0, 0, 2, 2, 2, 2, 2, 2, 2]))
      .hSet(userKey, "depositAccountIndex", depositAccountIndex)
      .hSet(userKey, "depositAccount", depositAccount)
      .hSet(userKey, "network", player.network)
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
          // coin: 0,
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
        .hGet(ipKey, "timestamp") // 0
        .hGet(ipKey, "reason") // 1
        .hGet(ipKey, "message") // 2
        .hGet(ipKey, "admin") // 3
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
        .hGet(banKey, "timestamp") // 0
        .hGet(banKey, "reason") // 1
        .hGet(banKey, "message") // 2
        .hGet(banKey, "admin") // 3
        .exec(async (err, replies) => {
          resolve({ playerName, timestamp: replies[0], reason: replies[1], message: replies[2], admin: replies[3] });
        });
    });
  }

  async banPlayerByIP({
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
    const until = days * 24 * 60 * 60 * 1000 + Date.now();

    this.banPlayerForReason({ admin, player, reason, message, until });

    player.connection.sendUTF8(JSON.stringify({ admin, player: player.name, error: "banned", reason, until, message }));
    player.connection.close(`You are banned, ${reason}.`);

    if (!player?.connection?._connection?.handshake?.headers?.["cf-connecting-ip"]) return;

    await this.client.hmSet(
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

  async banPlayerForReason({ admin, player, reason, message, until }) {
    await this.client.hmSet(
      "ban:" + player.name,
      "timestamp",
      until,
      "reason",
      reason,
      "message",
      message,
      "admin",
      admin,
    );
  }

  async chatBan({ player, message, isIPBan }: { player: any; message: string; isIPBan: boolean }) {
    let ip = isIPBan ? player.ip : "";

    player.canChat = false;
    await this.client.hSet(`chatBan`, player.name, JSON.stringify({ ip, message }));
    player.server.chatBan.push({ player: player.name, ip });
  }

  async getChatBan() {
    console.log("~~~~this.client,this.client", this.client);
    const rawChatBan = await this.client.hGetAll("chatBan");
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
    return chatBan;
  }

  async equipWeapon(name, weapon, level, bonus = [], socket = [], skill) {
    console.info("Set Weapon: " + name + " " + weapon + ":" + level);
    await this.client.hSet("u:" + name, "weapon", `${weapon}:${level}${toDb(bonus)}${toDb(socket)}${toDb(skill)}`);
  }

  async equipHelm(name, helm, level, bonus = [], socket = []) {
    console.info("Set Helm: " + name + " " + helm + ":" + level);
    await this.client.hSet("u:" + name, "helm", `${helm}:${level}${toDb(bonus)}${toDb(socket)}`);
  }

  async equipArmor(name, armor, level, bonus = [], socket = []) {
    console.info("Set Armor: " + name + " " + armor + ":" + level);
    await this.client.hSet("u:" + name, "armor", `${armor}:${level}${toDb(bonus)}${toDb(socket)}`);
  }

  async equipBelt(name, belt, level, bonus) {
    if (belt) {
      console.info("Set Belt: " + name + " " + belt + ":" + level);
      await this.client.hSet("u:" + name, "belt", `${belt}:${level}${toDb(bonus)}`);
    } else {
      console.info("Delete Belt");
      await this.client.hDel("u:" + name, "belt");
    }
  }

  async equipShield(name, shield, level, bonus = [], socket = [], skill) {
    if (shield) {
      console.info(`Set Shield: ${name} ${shield} ${level} ${bonus} ${socket} ${skill}`);
      await this.client.hSet("u:" + name, "shield", `${shield}:${level}${toDb(bonus)}${toDb(socket)}${toDb(skill)}`);
    } else {
      console.info("Delete Shield");
      await this.client.hDel("u:" + name, "shield");
    }
  }

  async equipCape(name, cape, level, bonus) {
    if (cape) {
      console.info("Set Cape: " + name + " " + cape + ":" + level);
      await this.client.hSet("u:" + name, "cape", `${cape}:${level}${toDb(bonus)}`);
    } else {
      console.info("Delete Cape");
      await this.client.hDel("u:" + name, "cape");
    }
  }

  async equipPet(name, pet, level, bonus, socket, skin) {
    if (pet) {
      console.info("Set Pet: " + name + " " + pet + ":" + level);
      await this.client.hSet("u:" + name, "pet", `${pet}:${level}${toDb(bonus)}${toDb(socket)}${toDb(skin)}`);
    } else {
      console.info("Delete Pet");
      await this.client.hDel("u:" + name, "pet");
    }
  }

  async setSettings(name, rawSettings: Settings) {
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

    const dbSettings = await this.client.hGet("u:" + name, "settings");

    var parsedReply = rawSettings ? JSON.parse(dbSettings) : {};

    const newSettings = JSON.stringify(Object.assign(parsedReply, settings));

    await this.client.hSet("u:" + name, "settings", newSettings);
  }

  async setAccount(player, account, network) {
    if (player.depositAccount || player.depositAccountIndex || player.hash) {
      Sentry.captureException(new Error("Already have deposit account for Player"), { extra: { name: player.name } });
      return;
    }

    await this.client.hmSet("u:" + player.name, "account", account, "network", network);

    const { depositAccount } = await this.assignNewDepositAccount(player, network);

    player.account = account;
    player.send([Types.Messages.ACCOUNT, { account, network, depositAccount }]);

    postMessageToDiscordWelcomeChannel(
      `**${player.name}** has joined the ranks of **${
        player.network === "nano" ? ` Nano ${EmojiMap.nbq}` : ` Banano ${EmojiMap.bbq}`
      }** 🎉`,
    );
    try {
      const [hash, rawAchievement] = await this.client.hmGet("u:" + player.name, "hash", "achievement");
      try {
        // let [hash, rawAchievement] = reply as [string, string];
        const achievement: number[] = JSON.parse(rawAchievement);

        const hasHeroAchievement = !!achievement[ACHIEVEMENT_HERO_INDEX];

        if (hash || !hasHeroAchievement) return;
        achievement[ACHIEVEMENT_HERO_INDEX] = 0;
        await this.client.hSet("u:" + player.name, "achievement", JSON.stringify(achievement));
      } catch (err) {
        Sentry.captureException(new Error("Unable to assign deposit account"), { extra: { err } });
      }
    } catch (err) {
      Sentry.captureException(new Error("Unable to assign deposit account"), { extra: { err } });
    }

    return true;
  }

  async equipRing1({ name, item, level, bonus }) {
    const ring1 = [item, level, bonus].filter(Boolean).join(":") || null;

    console.info(`Set Ring1: ${name} ring1`);
    if (ring1) {
      await this.client.hSet("u:" + name, "ring1", ring1);
    } else {
      await this.client.hDel("u:" + name, "ring1");
    }
  }

  async equipRing2({ name, item, level, bonus }) {
    const ring2 = [item, level, bonus].filter(Boolean).join(":") || null;

    console.info(`Set Ring2: ${name} ring2`);
    if (ring2) {
      await this.client.hSet("u:" + name, "ring2", ring2);
    } else {
      await this.client.hDel("u:" + name, "ring2");
    }
  }

  async equipAmulet({ name, item, level, bonus }) {
    const amulet = [item, level, bonus].filter(Boolean).join(":") || null;

    console.info(`Set Amulet: ${name} amulet`);
    if (amulet) {
      await this.client.hSet("u:" + name, "amulet", amulet);
    } else {
      await this.client.hDel("u:" + name, "amulet");
    }
  }

  async setExp(name, exp) {
    console.info("Set Exp: " + name + " " + exp);
    await this.client.hSet("u:" + name, "exp", exp);
  }

  async setHash(name, hash) {
    console.info("Set Hash: " + name + " " + hash);
    await this.client.hSet("u:" + name, "hash", hash);
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
  }

  async moveItem({ player, fromSlot, toSlot, quantity: movedQuantity = 0 }) {
    if (movedQuantity && !validateQuantity(movedQuantity)) return;
    if (fromSlot === toSlot) return;

    const [fromLocation, fromRange] = this.getItemLocation(fromSlot);
    const [toLocation, toRange] = this.getItemLocation(toSlot);

    const isMultipleFrom = ["inventory", "upgrade", "trade", "stash"].includes(fromLocation);
    const isMultipleTo = ["inventory", "upgrade", "trade", "stash"].includes(toLocation);

    if (!fromLocation || !toLocation) {
      await this.banPlayerByIP({
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

    const fromReply = await this.client.hGet("u:" + player.name, fromLocation);
    let fromItem;
    let toItem;
    let isConsumable;
    try {
      let fromReplyParsed = isMultipleFrom ? JSON.parse(fromReply) : fromReply;

      fromItem = isMultipleFrom ? fromReplyParsed[fromSlot - fromRange] : fromReplyParsed;

      //slot msg could be manipulated only move the ones not empty
      if (!fromItem) {
        return;
      }

      // Should never happen but who knows
      if (["dagger:1", "clotharmor:1", "helmcloth:1"].includes(fromItem) && toSlot !== -1) {
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

        await this.client.hSet("u:" + player.name, fromLocation, JSON.stringify(fromReplyParsed));
        this.sendMoveItem({ player, location: fromLocation, data: fromReplyParsed });
      } else {
        const toReply = await this.client.hGet("u:" + player.name, toLocation);
        try {
          let isFromReplyDone = false;
          let isToReplyDone = false;
          let toReplyParsed = isMultipleTo ? JSON.parse(toReply) : toReply;
          toItem = isMultipleTo ? toReplyParsed[toSlot - toRange] : toReplyParsed;

          if (["dagger:1", "clotharmor:1", "helmcloth:1"].includes(toItem)) {
            toItem = 0;
          }

          //@TODO investigatefromItem is not a FN on (0)
          const [fromIsQuantity, rawFromQuantity] = fromItem.split(":");
          isConsumable = Types.isConsumable(fromIsQuantity);
          // @NOTE Strict rule, 1 upgrade scroll limit, tweak this later on
          if (Types.isQuantity(fromIsQuantity)) {
            const fromQuantity = Number(rawFromQuantity);

            // trying to move more than the current quantity
            if (movedQuantity && movedQuantity > fromQuantity) {
              return;
            }

            if (toLocation === "inventory" || toLocation === "stash" || toLocation === "trade") {
              let toItemIndex = toReplyParsed.findIndex(a => a && a.startsWith(`${fromIsQuantity}:`));

              if (toItemIndex === -1) {
                // @Note put the quantity, not found in first available index of toLocation
                toItemIndex = toItem ? toReplyParsed.indexOf(0) : toSlot - toRange;
              }

              if (toItemIndex > -1) {
                const [, toQuantity = 0] = (toReplyParsed[toItemIndex] || "").split(":");

                toReplyParsed[toItemIndex] = `${fromIsQuantity}:${
                  parseInt(toQuantity) + parseInt(`${movedQuantity || fromQuantity}`)
                }`;

                if (movedQuantity && fromQuantity - movedQuantity > 0) {
                  fromReplyParsed[fromSlot - fromRange] = `${fromIsQuantity}:${fromQuantity - movedQuantity}`;
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

              if (
                (isScroll && !hasScroll) ||
                (isRune && !toReplyParsed[toSlot - toRange]) ||
                (isConsumable && (fromQuantity || movedQuantity))
              ) {
                fromReplyParsed[fromSlot - fromRange] = fromQuantity > 1 ? `${fromIsQuantity}:${fromQuantity - 1}` : 0;
                toReplyParsed[toSlot - toRange] = `${fromIsQuantity}:1`;
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
            await this.client.hSet("u:" + player.name, fromLocation, JSON.stringify(fromReplyParsed), () => {});
          }

          if (isMultipleTo) {
            await this.client.hSet("u:" + player.name, toLocation, JSON.stringify(toReplyParsed), () => {});
          }

          this.sendMoveItem({ player, location: fromLocation, data: fromReplyParsed });
          this.sendMoveItem({ player, location: toLocation, data: toReplyParsed });
        } catch (err) {
          console.log(err);
          Sentry.captureException(err, {
            extra: {
              player: player.name,
              fromSlot,
              fromItem,
              toItem,
              toSlot,
              toLocation,
              fromLocation,
              movedQuantity,
            },
          });
        }
      }
    } catch (err) {
      console.log(err);
      Sentry.captureException(err, {
        extra: {
          player: player.name,
          fromSlot,
          fromItem,
          toItem,
          toSlot,
          toLocation,
          fromLocation,
          movedQuantity,
        },
      });
    }
    // });
  }

  async lootGold({ player, amount }) {
    let currentGold = await this.client.hGet("u:" + player.name, "gold");

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

    await this.client.hSet("u:" + player.name, "gold", gold);
    player.send([Types.Messages.GOLD.INVENTORY, gold]);
    player.gold = gold;
  }

  moveGold({ player, amount, from, to }) {
    // Only positive number can be submitted
    if (isNaN(amount) || amount <= 0) return;

    return player.dbWriteQueue.enqueue(
      () =>
        new Promise(async resolve => {
          const locationMap = {
            inventory: "gold",
            stash: "goldStash",
            trade: "goldTrade",
          };

          const fromLocation = locationMap[from];
          const toLocation = locationMap[to];

          if (fromLocation === toLocation || !fromLocation || !toLocation) return;

          const rawFromGold = await this.client.hGet("u:" + player.name, fromLocation);
          if (!rawFromGold) {
            return false;
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
            return false;
          }

          const newFromGold = fromGold - amount;
          if (newFromGold < 0) return;

          let rawToGold = await this.client.hGet("u:" + player.name, toLocation);

          if (rawToGold === null) {
            rawToGold = 0;
          } else if (!/\d+/.test(rawToGold)) {
            Sentry.captureException(new Error(`${player.name} gold hash corrupted?`), {
              extra: {
                toLocation,
                rawToGold,
              },
            });
            return false;
          }
          const toGold = parseInt(rawToGold || "0");
          if (toGold + amount < 0) return;

          await this.client.hSet("u:" + player.name, fromLocation, newFromGold);
          player.send([Types.Messages.GOLD[from.toUpperCase()], newFromGold]);
          player[fromLocation] = newFromGold;

          const newToGold = toGold + amount;

          await this.client.hSet("u:" + player.name, toLocation, newToGold);
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
          // });
        }),
    );
  }

  async deductGold(player, { penalty, amount }: { penalty?: number; amount?: number }) {
    if (!amount && !penalty) {
      return;
    }

    let currentGold = await this.client.hGet("u:" + player.name, "gold");
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

    if (deductedGold >= 10_000 && penalty) {
      postMessageToDiscordEventChannel(
        `${EmojiMap.press_f_to_pay_respects} **${player.name}** just lost **${new Intl.NumberFormat("en-EN", {}).format(
          deductedGold,
        )}** gold ${EmojiMap.gold} on death${EmojiMap.janetyellen} is getting richer.`,
      );
    }

    let newGold = gold - deductedGold;
    if (newGold < 0) return;

    await this.client.hSet("u:" + player.name, "gold");

    player.send([Types.Messages.GOLD.INVENTORY, newGold]);
    player.gold = newGold;

    if (amount) {
      return newGold;
    } else if (penalty) {
      player.send(
        new Messages.Chat({}, `You lost ${deductedGold} gold from your death.`, "event", deductedGold).serialize(),
      );

      await this.client.incrBy("goldBank", deductedGold);
    }
  }

  async getGoldBank() {
    try {
      const gold = await this.client.get("goldBank");
      return Number(gold);
    } catch (err) {
      return 0;
    }
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
          postMessageToDiscordModeratorMerchantChannel(
            `**${player.name}** purchased ${quantity}x ${item} from merchant for ${totalAmount}${EmojiMap.gold}`,
          );
        }

        player.send(new Messages.MerchantLog({ item, quantity, amount: totalAmount, type: "buy" }).serialize());
      })
      .catch(err => {
        Sentry.captureException(err);
      });
  }

  async withdrawFromBank({ player }) {
    const fromReply = await this.client.hGet("u:" + player.name, "inventory");

    let inventory = JSON.parse(fromReply);

    const slot = inventory.findIndex(item => item && typeof item === "string" && item.startsWith("iou:"));

    if (slot <= -1) {
      this.banPlayerByIP({
        player,
        reason: "cheating",
        message: "Tried to withdraw from bank without an IOU",
      });
      return false;
    }
    const [, rawAmount] = inventory[slot].split(":");
    const amount = Number(rawAmount);

    if (amount && player.server.goldBank >= amount) {
      inventory[slot] = 0;
      await this.client.hSet("u:" + player.name, "inventory", JSON.stringify(inventory));

      this.sendMoveItem({ player, location: "inventory", data: inventory });

      await this.client.decrBy("goldBank", amount, (_err, reply) => {
        player.server.goldBank = Number(reply);

        this.lootGold({
          player,
          amount,
        });

        postMessageToDiscordEventChannel(
          `**${player.name}** just exchanged an IOU ${EmojiMap.iou} for **${new Intl.NumberFormat("en-EN", {}).format(
            amount,
          )}** gold ${EmojiMap.gold} `,
        );

        return amount;
      });
    } else {
      return false;
    }
  }

  async sellToMerchant({ player, fromSlot, quantity: soldQuantity = 1 }) {
    if (isNaN(fromSlot) || fromSlot >= INVENTORY_SLOT_COUNT) return;
    if (!validateQuantity(soldQuantity)) return;

    const fromReply = await this.client.hGet("u:" + player.name, "inventory");
    let fromItem;

    let fromReplyParsed = JSON.parse(fromReply);
    fromItem = fromReplyParsed[fromSlot];
    if (!fromItem) return;

    const amount = getGoldAmountFromSoldItem({ item: fromItem, quantity: soldQuantity });
    if (!amount) return;

    // const [item, rawLevel] = fromItem;
    const [item, rawLevel] = fromItem.split(":");
    const level = Number(rawLevel);

    if (amount >= 50_000) {
      postMessageToDiscordModeratorMerchantChannel(
        `**${player.name}** sold ${soldQuantity}x ${fromItem} to merchant for ${amount}${EmojiMap.gold}`,
      );
    } else if (level >= 7 && !soldQuantity) {
      postMessageToDiscordModeratorMerchantChannel(
        `${EmojiMap.press_f_to_pay_respects} **${player.name}** sold ${item} **+${level}** ${fromItem} to merchant`,
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

    await this.client.hSet("u:" + player.name, "inventory", JSON.stringify(fromReplyParsed), () => {
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
  }

  lootItems({ player, items, toSlot }: { player: any; items: GeneratedItem[]; toSlot?: number }) {
    player.dbWriteQueue.enqueue(
      () =>
        new Promise(async (resolve, _reject) => {
          const reply = await this.client.hGet("u:" + player.name, "inventory");
          let inventory = JSON.parse(reply);

          items.forEach((rawItem: GeneratedItem) => {
            const { item, level, quantity, bonus, skill: skillOrSkin, socket } = rawItem;
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
                slotIndex = inventory?.indexOf(0);
              }

              if (slotIndex !== -1) {
                const levelQuantity = level || quantity;

                if (!levelQuantity && !Types.isJewel(item)) {
                  throw new Error(
                    `Invalid item property ${JSON.stringify({ rawItem, playerName: player.name, inventory })}`,
                  );
                }

                const delimiter = Types.isJewel(item) ? "|" : ":";
                inventory[slotIndex] = [item, levelQuantity, bonus, socket, skillOrSkin]
                  .filter(Boolean)
                  .join(delimiter);
              } else if (player.hasParty()) {
                // @TODO re-call the lootItems fn with next party member
                // Currently the item does not get saved
              }
            }
          });

          await this.client.hSet("u:" + player.name, "inventory", JSON.stringify(inventory));

          player.send([Types.Messages.INVENTORY, inventory]);
          resolve(true);
        }),
    );
  }

  async moveItemsToInventory(player, panel: "upgrade" | "trade" = "upgrade") {
    const rawInvetory = await this.client.hGet("u:" + player.name, "inventory");
    const inventory = JSON.parse(rawInvetory).filter(i => i !== 0);
    const availableInventorySlots = JSON.parse(rawInvetory).filter(i => i === 0).length;

    let data;
    const reply = await this.client.hGet("u:" + player.name, panel);

    data = JSON.parse(reply);
    const filteredUpgrade = data.filter(Boolean);
    //@NNOTE: Nothing to move, nothing to await

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
      let quantityItem = "";
      let areItemsLooted = false;
      let hasQuantityItem = items.some(({ item }) => {
        if (Types.isQuantity(item)) {
          quantityItem = item;
        }

        return Types.isQuantity(item);
      });
      let isValidReturnQuantityItem = false;
      let hasInventoryQuantityItem = inventory.some(rawItem => {
        const [item] = rawItem.split(":");

        if (item === quantityItem) {
          isValidReturnQuantityItem = true;
        }
        return isValidReturnQuantityItem;
      });
      if (
        (hasQuantityItem && quantityItem && hasInventoryQuantityItem && isValidReturnQuantityItem) ||
        availableInventorySlots > items.length
      ) {
        this.lootItems({ player, items });
        areItemsLooted = true;
      } else {
        if (panel === "upgrade" && availableInventorySlots < items.length) {
          //@NOTE player was upgrading and gotpartylooted an item
          throw new Error(`**${player.name}** not enought inventory slots to move items from upgrade panel`);
        }
      }
      if (areItemsLooted) {
        data = data.map(() => 0);
      }
      await this.client.hSet("u:" + player.name, panel, JSON.stringify(data));

      if (panel === "upgrade") {
        player.send([Types.Messages.UPGRADE, data]);
      } else if (panel === "trade") {
        player.send(new Messages.Trade(Types.Messages.TRADE_ACTIONS.PLAYER1_MOVE_ITEM, data).serialize());
      }
    }
  }

  async upgradeItem(player: Player) {
    const reply = await this.client.hGet("u:" + player.name, "upgrade");

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
    let itemWithRandomSkill = null;
    let socketPetCollarItem = null;

    if ((weaponWithSkill = isValidAddWeaponSkill(filteredUpgrade))) {
      isSuccess = true;
      upgrade = upgrade.map(() => 0);
      upgrade[upgrade.length - 1] = weaponWithSkill;
      player.broadcast(new Messages.AnvilUpgrade({ isSuccess }), false);
    } else if ((weaponWithSkill = isValidUpgradeElementItems(filteredUpgrade))) {
      isSuccess = !!weaponWithSkill.item;
      upgrade = upgrade.map(() => 0);
      upgrade[upgrade.length - 1] = weaponWithSkill.item;
      player.broadcast(new Messages.AnvilUpgrade({ isSuccess }), false);
    } else if ((itemWithRandomSkill = isValidUpgradeskillrandom(filteredUpgrade))) {
      isSuccess = !!itemWithRandomSkill.item;
      upgrade = upgrade.map(() => 0);
      upgrade[upgrade.length - 1] = itemWithRandomSkill.item;
      player.broadcast(new Messages.AnvilUpgrade({ isSuccess }), false);
    } else if (isValidUpgradeItems(filteredUpgrade)) {
      const [item, rawLevel, bonus, socket, skillOrSkin] = filteredUpgrade[0].split(":");
      const [scrollOrStone] = filteredUpgrade[1].split(":");
      const isUnique = Types.isUnique(item, bonus);
      let upgradedItem: number | string = 0;
      const isGuaranteedSuccess = Types.isStone(scrollOrStone) && ["stonedragon", "stonehero"].includes(scrollOrStone);

      ({ isSuccess, random /*, successRate*/ } = isUpgradeSuccess({
        level: rawLevel,
        isLuckySlot,
        isBlessed,
        isGuaranteedSuccess,
      }));

      const level = parseInt(rawLevel);

      // Disable for now as it is exploitable
      // player.send(
      //   new Messages.AnvilOdds(
      //     `You rolled ${random}, the success rate is ${successRate}%. ${
      //       random <= successRate ? "Success" : "Failure"
      //     }`,
      //   ).serialize(),
      // );

      if (isSuccess) {
        let upgradedLevel = level + 1;

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
        if (level >= 8) {
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
    } else if ((socketPetCollarItem = isValidSocketPetCollar(filteredUpgrade))) {
      upgrade = upgrade.map(() => 0);
      upgrade[upgrade.length - 1] = socketPetCollarItem;
    } else if ((result = isValidStoneSocket(filteredUpgrade, isLuckySlot))) {
      isSuccess = true;
      ({ socketItem, extractedItem, socketCount, isNewSocketItem } = result);
      if (extractedItem) {
        this.lootItems({ player, items: [extractedItem] });
      }
      if (socketCount === 6 && isNewSocketItem) {
        this.logUpgrade({ player, item: socketItem, isSuccess, isLuckySlot, isNewSocketItem });
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

      generatedItem = isSuccess ? [itemName, level, result.bonus, result.socket, skin].filter(Boolean).join(":") : 0;

      upgrade = upgrade.map(() => 0);
      upgrade[upgrade.length - 1] = generatedItem;
      player.broadcast(new Messages.AnvilUpgrade({ isTransmute: isSuccess }), false);
    } else if ((result = isValidTransmuteItems(filteredUpgrade))) {
      const [item, level, , , skin] = filteredUpgrade[0].split(":");
      let generatedItem: number | string = 0;

      ({ random, transmuteSuccessRate, uniqueSuccessRate, isTransmuteSuccess, isUniqueSuccess } = getIsTransmuteSuccess(
        { ...result, isLuckySlot },
      ));

      player.send(
        new Messages.AnvilOdds(
          `You rolled ${random}${
            transmuteSuccessRate ? `, the transmute success rate is ${transmuteSuccessRate}%` : ""
          }${
            uniqueSuccessRate && uniqueSuccessRate !== 100 ? `, the unique success rate is ${uniqueSuccessRate}` : ""
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
      let isChristmasPresent = false;
      let isChestdead = false;
      let isChestred = false;

      if (recipe) {
        isSuccess = true;
        if (recipe === "expansion2voucher") {
          isSuccess = !player.expansion2;
          if (isSuccess) {
            isWorkingRecipe = true;
            await this.unlockExpansion2(player);

            this.lootItems({ player, items: [{ item: "scrollupgradelegendary", quantity: 60 }] });
            postMessageToDiscordAnvilChannel(
              `**${player.name}** consumed Lost Temple Expansion Voucher ${EmojiMap.losttempleexpansionvoucher}`,
            );
          }
        } else if (recipe === "cowLevel") {
          if (!player.server.cowLevelClock) {
            isWorkingRecipe = true;
            isRecipe = true;

            player.server.cowKingPlayerName = player.name;
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

            player.server.minotaurPlayerName = player.name;

            player.server.startMinotaurLevel();
          }
        } else if (
          recipe === "chestblue" ||
          recipe === "chestgreen" ||
          recipe === "chestpurple" ||
          recipe === "christmaspresent" ||
          recipe === "chestdead" ||
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
              case "christmaspresent":
                isChristmasPresent = true;
                ({ item, uniqueChances, jewelLevel } = generateChristmasPresentItem());

                break;
              case "chestdead":
                isChestdead = true;
                ({ item, uniqueChances, jewelLevel } = generateDeadChestItem());
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
        } else if (isChestblue || isChestgreen || isChestpurple || isChristmasPresent || isChestdead || isChestred) {
          player.broadcast(
            new Messages.AnvilUpgrade({
              isChestblue,
              isChestgreen,
              isChestpurple,
              isChristmasPresent,
              isChestdead,
              isChestred,
            }),
            false,
          );
        }
      }
    }

    player.send([Types.Messages.UPGRADE, upgrade, { luckySlot, isLucky7, isMagic8, isSuccess, recipe }]);
    await this.client.hSet("u:" + player.name, "upgrade", JSON.stringify(upgrade), () => {});

    // });
  }

  async foundAchievement(player, index) {
    console.info("Found Achievement: " + player.name + " " + index + 1);

    // return new Promise(resolve => {
    const achievements = await this.client.hGet("u:" + player.name, "achievement");
    try {
      var achievement = JSON.parse(achievements);

      if (achievement[index] === 1) {
        return false;
      }

      achievement[index] = 1;
      achievement = JSON.stringify(achievement);
      await this.client.hSet("u:" + player.name, "achievement", achievement);

      if (index === ACHIEVEMENT_HERO_INDEX) {
        await this.unlockExpansion1(player);
        player.connection.send({
          type: Types.Messages.NOTIFICATION,
          achievement: ACHIEVEMENT_NAMES[ACHIEVEMENT_HERO_INDEX],
          message: "killed the Skeleton King!",
        });
      }

      if (index === ACHIEVEMENT_BLACKSMITH_INDEX) {
        return true;
      }

      if (index === ACHIEVEMENT_DISCORD_INDEX) {
        let item = "scrollupgrademedium";
        if (player.expansion2) {
          item = "scrollupgradelegendary";
        } else if (player.expansion1) {
          item = "scrollupgradehigh";
        }
        this.lootItems({ player, items: [{ item, quantity: 5 }] });

        return true;
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
      return true;
    } catch (err) {
      Sentry.captureException(err);
      return false;
    }
  }

  async foundWaypoint(name, index) {
    console.info("Found Waypoint: " + name + " " + index);
    const rawWaypoints = await this.client.hGet("u:" + name, "waypoints");
    try {
      var waypoints = JSON.parse(rawWaypoints);
      waypoints[index] = 1;
      waypoints = JSON.stringify(waypoints);
      await this.client.hSet("u:" + name, "waypoints", waypoints);
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  async unlockExpansion1(player) {
    if (player.expansion1) {
      return;
    }
    player.expansion1 = true;

    console.info("Unlock Expansion1: " + player.name);
    await this.client.hSet("u:" + player.name, "expansion1", 1);
    let rawWaypoints = await this.client.hGet("u:" + player.name, "waypoints");
    try {
      var waypoints = JSON.parse(rawWaypoints);
      waypoints[3] = 1;
      waypoints[4] = 0;
      waypoints[5] = 0;
      player.send([Types.Messages.WAYPOINTS_UPDATE, waypoints]);
      waypoints = JSON.stringify(waypoints);
      await this.client.hSet("u:" + player.name, "waypoints", waypoints);
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  async unlockExpansion2(player) {
    if (!player.expansion2) {
      player.expansion2 = true;
    }

    console.info("Unlock Expansion2: " + player.name);
    await this.client.hSet("u:" + player.name, "expansion2", 1);
    let rawWaypoints = await this.client.hGet("u:" + player.name, "waypoints");

    var waypoints = JSON.parse(rawWaypoints);
    waypoints[6] = 1;
    waypoints[7] = 0;
    waypoints[8] = 0;
    waypoints[9] = 0;
    player.send([Types.Messages.WAYPOINTS_UPDATE, waypoints]);
    waypoints = JSON.stringify(waypoints);
    await this.client.hSet("u:" + player.name, "waypoints", waypoints);
  }

  async foundNanoPotion(name) {
    console.info("Found NanoPotion: " + name);
    let nanoPotions = await this.client.hGet("u:" + name, "nanoPotions");

    nanoPotions = nanoPotions += 1;

    await this.client.hSet("u:" + name, "nanoPotions", nanoPotions);
  }

  async foundGem(name, index) {
    console.info("Found Gem: " + name + " " + index + 1);
    var rawGems = await this.client.hGet("u:" + name, "gems");
    try {
      var gems = rawGems ? JSON.parse(rawGems) : new Array(GEM_COUNT).fill(0);
      gems[index] = 1;
      gems = JSON.stringify(rawGems);
      await this.client.hSet("u:" + name, "gems", gems);
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  async foundArtifact(name, index) {
    console.info("Found Artifact: " + name + " " + index + 1);
    const rawArtifact = await this.client.hGet("u:" + name, "artifact");

    var artifact = rawArtifact ? JSON.parse(rawArtifact) : new Array(ARTIFACT_COUNT).fill(0);
    artifact[index] = 1;
    artifact = JSON.stringify(artifact);
    await this.client.hSet("u:" + name, "artifact", artifact);
  }

  async useInventoryItem(player, item) {
    const rawInventory = await this.client.hGet("u:" + player.name, "inventory");

    const inventory = JSON.parse(rawInventory);
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
      await this.client.hSet("u:" + player.name, "inventory", JSON.stringify(inventory));
      return true;
    } else {
      return false;
    }
  }

  async useWeaponItem(player) {
    // return new Promise(resolve => {
    await this.client.hSet("u:" + player.name, "weapon", "dagger:1");
    this.sendMoveItem({ player, location: "weapon", data: "" });
    // resolve(true);

    return true;
    // });
    // });
  }

  async passwordIsRequired(player) {
    var userKey = "u:" + player.name;

    try {
      const password = await this.client.hGet(userKey, "password");

      if (NODE_ENV === "development") {
        return false;
      }
      if (password) {
        player.connection.sendUTF8("passwordlogin");
      } else {
        player.connection.sendUTF8("passwordcreate");
      }

      return true;
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  async linkPlayerToDiscordUser(player, secret) {
    if (secret.length !== 6) return;

    const discordUserId = await this.client.get(`discord_secret:${secret}`);
    if (!discordUserId) return;

    const playerName = await this.client.get(`discord:${discordUserId}`);
    if (playerName) return;

    await this.client.set(`discord:${discordUserId}`, player.name);
    await this.client.del(`discord_secret:${secret}`);

    // Also link it on the player so it's easily searchable
    await this.client.hSet("u:" + player.name, "discordId", discordUserId);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.foundAchievement(player, ACHIEVEMENT_DISCORD_INDEX).then(() => {
      player.connection.send({
        type: Types.Messages.NOTIFICATION,
        achievement: ACHIEVEMENT_NAMES[ACHIEVEMENT_DISCORD_INDEX],
        message: "You are now linked with your Discord account!",
      });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      discordClient.users.fetch(discordUserId).then(user => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        user.send(`You linked ${player.name} to your Discord account!`);
      });
    });
  }

  async checkIsPlayerExist(player) {
    const userKey = "u:" + player.name;
    // let isPlayerExist;
    let [createdAt, weapon] = await this.client
      .multi()
      .hGet(userKey, "createdAt") // 0
      .hGet(userKey, "weapon") // 1
      .exec();

    if (!!createdAt || !!weapon) {
      player.connection.sendUTF8("userexists");
      player.connection.close("Username not available: " + player.name);
      return true;
    }
    return false;
  }

  async passwordLoginOrCreate(player, loginPassword) {
    const userKey = "u:" + player.name;

    try {
      const password = await this.client.hGet(userKey, "password");
      let isValid = false;

      if (!password) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(loginPassword, salt);

        await this.client.hSet(userKey, "password", passwordHash);

        isValid = true;
        player.isPasswordValid = isValid;
      } else {
        isValid = await bcrypt.compare(loginPassword, password);
      }

      if (!isValid) {
        player.connection.sendUTF8("passwordinvalid");
      }
      return isValid;
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  async setCheckpoint(name, x, y) {
    console.info("Set Check Point: " + name + " " + x + " " + y);
    await this.client.hSet("u:" + name, "x", x);
    await this.client.hSet("u:" + name, "y", y);
  }

  async setDepositAccount() {
    await this.client.set("deposit_account_count", 0, { NX: true });
  }

  async createDepositAccount(): Promise<unknown> {
    return await queue.enqueue(
      () =>
        new Promise(async (resolve, _reject) => {
          await this.client.incr("deposit_account_count", (_err, reply: number) => {
            resolve(reply);
          });
        }),
    );
  }

  async settlePurchase({ player, account, amount, hash, id }) {
    try {
      const soldStoreItem = StoreItems.find(({ id: storeItemId }) => storeItemId === id)!;

      if (id === Types.Store.EXPANSION1) {
        await this.unlockExpansion1(player);
        this.lootItems({ player, items: [{ item: "scrollupgradehigh", quantity: 10 }] });
      }
      if (id === Types.Store.EXPANSION2) {
        if (!player.expansion2) {
          await this.unlockExpansion2(player);
          this.lootItems({ player, items: [{ item: "scrollupgradelegendary", quantity: 60 }] });
        } else {
          this.lootItems({ player, items: [{ item: "expansion2voucher", quantity: 1 }] });
          this.lootItems({ player, items: [{ item: "scrollupgradelegendary", quantity: 60 }] });
        }
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
      await this.client.zadd(
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
        `**${player.name}** purchased "ID:${id}":"${soldStoreItem.name}" for ${amount} using deposit account ${account}`,
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
    isNewSocketItem = false,
  }: {
    player: Player;
    item: string;
    isSuccess: boolean;
    isLuckySlot?: boolean;
    isRuneword?: boolean;
    isNewSocketItem?: boolean;
  }) {
    const [itemName, rawLevel, bonus, rawSocket] = item.split(":");
    const level = parseInt(rawLevel);

    if (isSuccess || level >= 8) {
      try {
        const socket = toArray(rawSocket);
        const isUnique = Types.isUnique(itemName, bonus);
        let message = "";
        let runeword = "";
        let wordSocket = "";
        let output = kinds[itemName][2];
        let fire = level >= 8 ? EmojiMap.firepurple : EmojiMap.fire;

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
        } else if (isUnique) {
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
              ].includes(itemName) || itemName.startsWith("pet")
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

          message = `${player.name} forged **${runeword}** runeword (${EmojiRunes}) in a **+${level}** ${output}`;

          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.foundAchievement(player, ACHIEVEMENT_BLACKSMITH_INDEX).then(() => {
            player.connection.send({
              type: Types.Messages.NOTIFICATION,
              achievement: ACHIEVEMENT_NAMES[ACHIEVEMENT_BLACKSMITH_INDEX],
              message: "You've forged a runeword!",
            });
          });
        } else if (socket?.length === 6 && level >= 7 && isNewSocketItem) {
          message = `${player.name} added **6 sockets** to a **+${level}** ${output}`;
        } else {
          if (level >= 7) {
            if (level >= 7 && isSuccess) {
              message = `**${player.name}** upgraded a **+${level}** ${output}`;
            } else if (level >= 8 && isSuccess) {
              message = `**${player.name}** upgraded a **+${level}** ${output} ${fire} ${fire} ${fire} ${fire} ${fire}`;
            } else {
              message = `${EmojiMap.press_f_to_pay_respects} **${player.name}** burned a **+${level}** ${output}`;
            }
          }
          if (level === 10 && isSuccess) {
            message = `${EmojiMap.impossibru} ${EmojiMap.impossibru}! **${player.name}** BROKE the anvil & upgraded a **+${level}** ${output} ${fire} ${fire}`;
          }
        }

        if (!message) {
          message = `**${player.name}**`;
        }

        postMessageToDiscordAnvilChannel(`${message}${isLuckySlot ? " with the lucky slot 🍀" : ""} ${fire}`);
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  }

  async logLoot({ player, item }) {
    const now = Date.now();
    await this.client.zAdd("loot", now, JSON.stringify({ player: player.name, item }));
  }

  async logEvent(event) {
    const now = Date.now();
    await this.client.zAdd("event", now, JSON.stringify(event));
  }
}

export default DatabaseHandler;
