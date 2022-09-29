import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Messages from "./message";
import { Sentry } from "./sentry";

import type World from "./worldserver";

type PlayerInventory = { inventory: string[]; isValid: boolean };

class Trade {
  players: { id: number; isAccepted: boolean }[] = [];
  id: number;
  server: World;
  isUpdatable: boolean;

  constructor(id, player1, player2, server) {
    this.players = [
      { id: player1, isAccepted: false },
      { id: player2, isAccepted: false },
    ];
    this.id = id;
    this.server = server;
    this.isUpdatable = true;

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
    this.forEachPlayer(({ id }) => {
      const player = this.server.getEntityById(id);

      console.log("~~~~CLOSE Player:", player.name);

      if (player) {
        this.server.pushToPlayer(
          player,
          new Messages.Trade(Types.Messages.TRADE_ACTIONS.CLOSE, { playerName, isCompleted, isInventoryFull }),
        );
        player.setTradeId(undefined);

        // @NOTE If panels gets closed, the items are returned, if the trade is completed the inventory gets refreshed
        if (!isCompleted) {
          this.server.databaseHandler.moveItemsToInventory(player, "trade");
        } else {
          this.server.databaseHandler.client.hget("u:" + player.name, "inventory", function (_err, reply) {
            try {
              let inventory = JSON.parse(reply);
              player.send([Types.Messages.INVENTORY, inventory]);
            } catch (err) {
              Sentry.captureException(err);
            }
          });
        }
      }
    });

    delete this.server.trades[this.id];
  }

  update({ player1Id, data }) {
    if (!this.isUpdatable) return;

    this.forEachPlayer(({ id }) => {
      const player = this.server.getEntityById(id);

      if (player) {
        const messageId =
          id === player1Id
            ? Types.Messages.TRADE_ACTIONS.PLAYER1_MOVE_ITEM
            : Types.Messages.TRADE_ACTIONS.PLAYER2_MOVE_ITEM;

        this.server.pushToPlayer(player, new Messages.Trade(messageId, data));
      }
    });
  }

  validatePlayerInventory(playerA, playerB) {
    return new Promise<PlayerInventory>(resolve => {
      let playerATrade;
      let playerAFilteredTrade;
      let playerBInventory = [];
      let playerBAvailableInventorySlots;
      let isValid = true;

      this.server.databaseHandler.client.hget("u:" + playerA.name, "trade", (_err, reply) => {
        playerATrade = JSON.parse(reply);
        playerAFilteredTrade = playerATrade.filter(Boolean);

        this.server.databaseHandler.client.hget("u:" + playerB.name, "inventory", (_err, reply) => {
          playerBInventory = JSON.parse(reply);
          playerBAvailableInventorySlots = playerBInventory.filter(item => !item).length;

          // Quick skip
          if (!playerAFilteredTrade.length) {
            isValid = true;
          } else if (playerAFilteredTrade.length <= playerBAvailableInventorySlots) {
            playerAFilteredTrade.forEach(item => {
              let isQuantityItemFound = false;

              // @NOTE Is it an item with a quantity?
              if (item.startsWith("scroll") || item.startsWith("chest")) {
                const [tradeItem, tradeQuantity] = item.split(":");
                const index = playerBInventory.findIndex(entry => entry?.startsWith?.(tradeItem));

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

          resolve({ inventory: playerBInventory, isValid });
        });
      });
    });
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

      if (!player1Data.isValid || !player2Data.isValid) {
        this.close({ playerName: !player1Data.isValid ? player1.name : player2.name, isInventoryFull: true });
        return;
      }

      await Promise.all([
        this.writeData(player1, player1Data.inventory),
        this.writeData(player2, player2Data.inventory),
      ]);

      this.close({ isCompleted: true });
    } catch (err) {
      Sentry.captureException(err);
      this.close();
    }
  }

  writeData(player, inventory) {
    return new Promise<void>(resolve => {
      this.server.databaseHandler.client.hmset(
        "u:" + player.name,
        "trade",
        // TRADE_SLOT_COUNT
        JSON.stringify(new Array(9).fill(0)),
        "inventory",
        JSON.stringify(inventory),
        (_err, _reply) => {
          player.send([Types.Messages.INVENTORY, inventory]);
          resolve();
        },
      );
    });
  }

  status({ player1Id, isAccepted }) {
    if (!this.isUpdatable) return;

    this.forEachPlayer(({ id }) => {
      const player = this.server.getEntityById(id);

      if (player) {
        const messageId =
          id === player1Id ? Types.Messages.TRADE_ACTIONS.PLAYER1_STATUS : Types.Messages.TRADE_ACTIONS.PLAYER2_STATUS;

        this.server.pushToPlayer(player, new Messages.Trade(messageId, isAccepted));
      }
    });

    // Update the player1 (the player that pushed the accept) change
    this.players = this.players.map(player => {
      if (player.id === player1Id) {
        player.isAccepted = isAccepted;
      }
      return player;
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