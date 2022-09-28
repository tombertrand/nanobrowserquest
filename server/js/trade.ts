import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Messages from "./message";
import { Sentry } from "./sentry";

// import { Sentry } from "./sentry";
// import type Player from "./player";
import type World from "./worldserver";

class Trade {
  players: { id: number; isAccepted: boolean; name: string }[] = [];
  id: number;
  server: World;
  isUpdatable: boolean;

  constructor(id, player1, player2, server) {
    this.players = [
      { id: player1, isAccepted: false, name: "" },
      { id: player2, isAccepted: false, name: "" },
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

  close(playerName) {
    this.forEachPlayer(({ id }) => {
      const player = this.server.getEntityById(id);

      if (player) {
        this.server.pushToPlayer(player, new Messages.Trade(Types.Messages.TRADE_ACTIONS.CLOSE, playerName));
        player.setTradeId(undefined);
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

      let player1Trade;
      let player1FilteredTrade;
      let player2Inventory;
      let player2AvailableInventorySlots;

      player1Trade = JSON.parse(await this.server.databaseHandler.hget("u:" + player1.name, "trade"));
      player1FilteredTrade = player1Trade.filter(Boolean);

      if (player1FilteredTrade.length) {
        player2Inventory = JSON.parse(await this.server.databaseHandler.hget("u:" + player2.name, "inventory"));
        player2AvailableInventorySlots = player2Inventory.filter(item => !!item).length;

        if (player1FilteredTrade.length <= player2AvailableInventorySlots) {
          this.players[0].name = player1.name;
        }
      } else {
        this.players[0].name = player1.name;
      }

      if (!this.players[0].name) {
        // @TODO Tweak the message to say that playerName's inventory do not have enought free slots
        this.close(player2.name);
        return;
      }

      let player2Trade;
      let player2FilteredTrade;
      let player1Inventory;
      let player1AvailableInventorySlots;

      player2Trade = JSON.parse(await this.server.databaseHandler.hget("u:" + player2.name, "trade"));
      player2FilteredTrade = player2Trade.filter(Boolean);

      if (player2FilteredTrade.length) {
        player1Inventory = JSON.parse(await this.server.databaseHandler.hget("u:" + player1.name, "inventory"));
        player1AvailableInventorySlots = player1Inventory.filter(item => !!item).length;

        if (player2FilteredTrade.length <= player1AvailableInventorySlots) {
          this.players[1].name = player2.name;
        }
      } else {
        this.players[1].name = player2.name;
      }

      if (!this.players[1].name) {
        // @TODO Tweak the message to say that playerName's inventory do not have enought free slots
        this.close(player1.name);
        return;
      }

      let isValidInsertion = true;

      player1FilteredTrade.forEach(item => {
        const index = player2Inventory.findIndex(entry => !entry);

        if (index > -1) {
          player2Inventory[index] = item;
        } else {
          isValidInsertion = false;
        }
      });

      player2FilteredTrade.forEach(item => {
        const index = player1Inventory.findIndex(entry => !entry);

        if (index > -1) {
          player1Inventory[index] = item;
        } else {
          isValidInsertion = false;
        }
      });

      console.log("~~~~isValidInsertion", isValidInsertion);

      // @TODO Validate response before inserting

      // await this.server.databaseHandler.hset(
      //   "u:" + this.players[0].name,
      //   "trade",
      //   JSON.stringify(player1Trade.map(() => 0)),
      // );
      // await this.server.databaseHandler.hset(
      //   "u:" + this.players[1].name,
      //   "trade",
      //   JSON.stringify(player2Trade.map(() => 0)),
      // );
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  // validateInventory

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
      this.checkBothPlayersAccepted();
    }
  }

  forEachPlayer(iterator) {
    if (!this.players.length) return;

    _.each(this.players, iterator);
  }
}

export default Trade;
