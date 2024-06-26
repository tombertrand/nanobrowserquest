import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import { GOLD_CAP } from "../../shared/js/gold";
import { postMessageToDiscordModeratorTradeChannel } from "./discord";
import Messages from "./message";

import type World from "./worldserver";

type PlayerInventory = { inventory: string[]; gold: number; isValid: boolean; filteredTrade: string[] };

class Trade {
  players: { id: number; isAccepted: boolean }[] = [];
  id: number;
  server: World;

  constructor(id, player1, player2, server) {
    this.players = [
      { id: player1, isAccepted: false },
      { id: player2, isAccepted: false },
    ];
    this.id = id;
    this.server = server;

    this.start();
  }

  start() {
    this.forEachPlayer(({ id }) => {
      const player = this.server.getEntityById(id);

      if (player) {
        player.tradeId = this.id;
        this.server.pushToPlayer(player, new Messages.Trade(Types.Messages.TRADE_ACTIONS.START, this.players));
      }
    });
  }

  close({
    playerName,
    isCompleted,
    isInventoryFull,
  }: { playerName?: string; isCompleted?: boolean; isInventoryFull?: boolean } = {}) {
    this.forEachPlayer(async ({ id }) => {
      const player = this.server.getEntityById(id);

      if (player) {
        this.server.pushToPlayer(
          player,
          new Messages.Trade(Types.Messages.TRADE_ACTIONS.CLOSE, { playerName, isCompleted, isInventoryFull }),
        );
        player.setTradeId(undefined);

        const isAPlayerNotAccepted = this.players.some(({ isAccepted }) => !isAccepted);

        // @NOTE If panels gets closed and if a player has not accepted, the items are returned, if the trade is completed the inventory gets refreshed
        if (!isCompleted && isAPlayerNotAccepted) {
          this.server.databaseHandler.moveItemsToInventory(player, "trade");
          let rawGoldTrade = await this.server.databaseHandler.client.hGet("u:" + player.name, "goldTrade");
          if (rawGoldTrade && rawGoldTrade !== "0" && /\d+/.test(rawGoldTrade)) {
            await this.server.databaseHandler.moveGold({
              player,
              from: "trade",
              to: "inventory",
              amount: parseInt(rawGoldTrade),
            });
          }
        } else {
          const userKey = "u:" + player.name;

          let [inventory, gold] = await this.server.databaseHandler.client
            .multi()
            .hGet(userKey, "inventory") 
            .hGet(userKey, "gold") 
            .exec();
          inventory = JSON.parse(inventory);
          gold = Number(gold || "0");
          player.send([Types.Messages.INVENTORY, inventory]);
          player.send([Types.Messages.GOLD.INVENTORY, gold]);
        }
      }
    });

    delete this.server.trades[this.id];
  }

  update({ player1Id, data }) {
    this.resetAccept();

    this.forEachPlayer(({ id }) => {
      const player = this.server.getEntityById(id);
      if (!player) return;

      const messageId =
        id === player1Id
          ? Types.Messages.TRADE_ACTIONS.PLAYER1_MOVE_ITEM
          : Types.Messages.TRADE_ACTIONS.PLAYER2_MOVE_ITEM;

      this.server.pushToPlayer(player, new Messages.Trade(messageId, data));
    });
  }

  // If a trade update happens, un-accept to prevent being scammed
  // Scenario:
  // - Player 1 and Player 2 each drop items
  // - Player 1 accepts
  // - Player 2 quicly remove the item and accept
  resetAccept() {
    // No player accepted yet, no need to reset
    if (!this.players.some(({ isAccepted }) => isAccepted)) return;

    this.players = this.players.map(player => {
      player.isAccepted = false;
      return player;
    });

    this.forEachPlayer(({ id }) => {
      const player = this.server.getEntityById(id);
      this.server.pushToPlayer(player, new Messages.Trade(Types.Messages.TRADE_ACTIONS.PLAYER1_STATUS, false));
      this.server.pushToPlayer(player, new Messages.Trade(Types.Messages.TRADE_ACTIONS.PLAYER2_STATUS, false));
    });
  }

  async updateGold({ player1Id, from, to, amount }) {
    this.resetAccept();

    const tradePlayer1 = this.players.find(({ id }) => id === player1Id);
    const tradePlayer2 = this.players.find(({ id }) => id !== player1Id);

    if (!tradePlayer1 || !tradePlayer2) return;
    const player1 = this.server.getEntityById(tradePlayer1.id);
    const player2 = this.server.getEntityById(tradePlayer2.id);

    // safety first
    if (!player1 || !player2) return;
    let newAmount = await this.server.databaseHandler.moveGold({ player: player1, from, to, amount });
    player2.send([Types.Messages.GOLD.TRADE2, newAmount]);
  }

  async validatePlayerInventory(playerA, playerB) {
    let playerATrade;
    let playerAGoldTrade;
    let playerAFilteredTrade;
    let playerBInventory = [];
    let playerBGold;
    let playerBAvailableInventorySlots;
    let isValid = true;
    const userAKey = "u:" + playerA.name;
    [playerATrade, playerAGoldTrade] = await this.server.databaseHandler.client
      .multi()
      .hGet(userAKey, "trade")
      .hGet(userAKey, "goldTrade")
      .exec();

    playerATrade = JSON.parse(playerATrade);
    playerAFilteredTrade = playerATrade.filter(Boolean);
    playerAGoldTrade = parseInt(playerAGoldTrade || "0");

    const userBKey = "u:" + playerB.name;
    let [inventory, gold] = await this.server.databaseHandler.client
      .multi()
      .hGet(userBKey, "inventory")
      .hGet(userBKey, "gold")
      .exec();

    playerBInventory = JSON.parse(inventory);
    playerBAvailableInventorySlots = playerBInventory.filter(item => !item).length;
    playerBGold = parseInt(gold || "0");

    // Quick skip
    if (!playerAFilteredTrade.length) {
      isValid = true;
    } else if (playerAFilteredTrade.length <= playerBAvailableInventorySlots) {
      playerAFilteredTrade.forEach(item => {
        let isQuantityItemFound = false;

        // @NOTE Is it an item with a quantity?
        if (Types.isQuantity(item)) {
          const [tradeItem, tradeQuantity] = item.split(":");

          const index = playerBInventory.findIndex(entry => {
            const [playerBInventoryItem] = typeof entry === "string" && entry.split(":");

            return playerBInventoryItem === tradeItem;
          });

          if (index > -1) {
            const [inventoryItem, inventoryQuantity] = playerBInventory[index].split(":");

            playerBInventory[index] = `${inventoryItem}:${parseInt(inventoryQuantity) + parseInt(tradeQuantity)}`;
            isQuantityItemFound = true;
          }
        }
        if (!isQuantityItemFound) {
          const index = playerBInventory.findIndex(entry => !entry);
          if (index > -1) {
            playerBInventory[index] = item;
          } else {
            isValid = false;
          }
        }
      });
    } else {
      isValid = false;
    }

    return {
      inventory: playerBInventory,
      isValid,
      gold: playerAGoldTrade + playerBGold,
      filteredTrade: playerAFilteredTrade,
    };
  }

  async checkBothPlayersAccepted() {
    if (this.players.some(({ isAccepted }) => !isAccepted)) {
      return;
    }

    try {
      const player1 = this.server.getEntityById(this.players[0].id);
      const player2 = this.server.getEntityById(this.players[1].id);

      if (!player1 || !player2) {
        throw new Error("Invalid trade player");
      }
      const [player2Data, player1Data] = await Promise.all<PromiseLike<PlayerInventory>>([
        this.validatePlayerInventory(player1, player2),
        this.validatePlayerInventory(player2, player1),
      ]);
      let isGoldExeeds100k = false;
      if (player1Data.gold >= 100_000 || player2Data.gold >= 100_000) {
        isGoldExeeds100k = true;
      }

      const content = `${isGoldExeeds100k ? ":warning:" : ""} P1 **${player1.name}** completed trade with P2 **${
        player2.name
      }** items P1 items: "${JSON.stringify(player1Data.filteredTrade)}}, P1 gold: ${player1Data.gold}, P2 gold: ${
        player2Data.gold
      } items: ${player2Data.filteredTrade}`;

      if (isGoldExeeds100k) {
        postMessageToDiscordModeratorTradeChannel(content);
      }

      if (!player1Data.isValid || !player2Data.isValid) {
        this.close({ playerName: !player1Data.isValid ? player1.name : player2.name, isInventoryFull: true });
        return;
      }
      await Promise.all([
        this.writeData(player1, player1Data.inventory, player1Data.gold),
        this.writeData(player2, player2Data.inventory, player2Data.gold),
      ]);

      this.close({ isCompleted: true });
    } catch (err) {
      this.close();
    }
  }

  async writeData(player, inventory, gold) {
    const userKey = "u:" + player.name;
    await this.server.databaseHandler.client.hSet(userKey, "trade", JSON.stringify(new Array(9).fill(0)));
    await this.server.databaseHandler.client.hSet(userKey, "inventory", JSON.stringify(inventory));

    if (Number(gold) > GOLD_CAP) {
      gold = GOLD_CAP;
    }
    await this.server.databaseHandler.client.hSet(userKey, "gold", gold);
    await this.server.databaseHandler.client.hSet(userKey, "goldTrade", 0);
    player.gold = gold;
    player.goldTrade = 0;

    player.send([Types.Messages.INVENTORY, inventory]);
  }

  status({ player1Id, isAccepted }) {
    // Update the player1 (the player that pushed the accept) change
    this.players = this.players.map(player => {
      if (player.id === player1Id) {
        player.isAccepted = isAccepted;
      }
      return player;
    });

    this.forEachPlayer(({ id }) => {
      const player = this.server.getEntityById(id);

      if (player) {
        const messageId =
          id === player1Id ? Types.Messages.TRADE_ACTIONS.PLAYER1_STATUS : Types.Messages.TRADE_ACTIONS.PLAYER2_STATUS;

        this.server.pushToPlayer(player, new Messages.Trade(messageId, isAccepted));
      }
    });

    if (isAccepted) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.checkBothPlayersAccepted();
    }
  }

  forEachPlayer(iterator) {
    if (!this.players.length) return;

    _.each(this.players, iterator);
  }
}

export default Trade;
