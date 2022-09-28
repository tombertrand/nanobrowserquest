import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import Messages from "./message";

// import { Sentry } from "./sentry";
// import type Player from "./player";
import type World from "./worldserver";

class Trade {
  players: number[] = [];
  id: number;
  server: World;

  constructor(id, player1, player2, server) {
    this.players = [player1, player2];
    this.id = id;
    this.server = server;

    this.start();
  }

  start() {
    this.forEachPlayer(id => {
      const player = this.server.getEntityById(id);

      if (player) {
        player.tradeId = this.id;
        this.server.pushToPlayer(player, new Messages.Trade(Types.Messages.TRADE_ACTIONS.START, this.players));
      }
    });
  }

  close(playerName) {
    this.forEachPlayer(id => {
      const player = this.server.getEntityById(id);

      if (player) {
        this.server.pushToPlayer(player, new Messages.Trade(Types.Messages.TRADE_ACTIONS.CLOSE, playerName));
        player.setTradeId(undefined);
      }
    });

    delete this.server.trades[this.id];
  }

  update({ data, player1Id }) {
    this.forEachPlayer(id => {
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

  forEachPlayer(iterator) {
    if (!this.players.length) return;

    _.each(this.players, iterator);
  }
}

export default Trade;
