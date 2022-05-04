import ReconnectingWebSocket from "reconnecting-websocket";
import WS from "ws";

import { Types } from "../../../shared/js/gametypes";
import { Sentry } from "../sentry";
import { rawToRai } from "../utils";
import { store } from "./store";

import type { Network } from "../types";

const ERROR_MESSAGES = {
  noSession: "Received payment for an unregistered session account.",
  wrongAmount: "Wrong amount sent to deposit address.",
  notAvailable: "The store is not currently available, try again later.",
};

class Purchase {
  sessions = [];
  databaseHandler = null;

  create({ player, account, id }) {
    const accountSession = this.sessions.find(({ account: registeredAccount }) => account === registeredAccount);

    if (accountSession) {
      this.sessions.map(session => {
        if (session.account === accountSession.account) {
          // Replace the purchase id in case the websocket is listening for another item id
          session.id = accountSession.id;
        }

        return session;
      });
    } else {
      const { nano, ban } = store.storeItems.find(item => id === item.id);

      this.sessions.push({ player, account, id, nano, ban });

      if (!websocket[player.network].registerAccount(account)) {
        player.send([
          Types.Messages.PURCHASE_ERROR,
          {
            message: ERROR_MESSAGES.notAvailable,
          },
        ]);

        Sentry.captureException(new Error(ERROR_MESSAGES.notAvailable), {
          extra: {
            player: player.name,
            account,
            id,
            nano,
            ban,
          },
        });
      }
    }
  }

  cancel(account) {
    if (!this.sessions.find(session => session.account === account)) return;

    const [network] = account.split("_");

    console.debug("PURCHASE - cancel: " + account);

    this.sessions = this.sessions.filter(session => session.account !== account);
    websocket[network].unregisterAccount(account);
  }

  complete(account) {
    console.debug("PURCHASE - complete: " + account);

    const [network] = account.split("_");

    this.sessions = this.sessions.filter(session => session.account !== account);
    websocket[network].unregisterAccount(account);
  }

  settle(payment) {
    console.debug("PURCHASE - settle: " + payment.account);

    const session = this.sessions.find(session => session.account === payment.account);

    if (!session) {
      this.error(ERROR_MESSAGES.noSession, payment);
    } else if (payment.amount < session[session.player.network]) {
      this.error(ERROR_MESSAGES.wrongAmount, {
        [session.player.network]: session[session.player.network],
        payment,
        player: session.player.name,
      });

      session.player.send([
        Types.Messages.PURCHASE_ERROR,
        {
          message: `${ERROR_MESSAGES.wrongAmount}. You sent ${payment.amount} instead of sending ${
            session[session.player.network]
          }. Try again or contact an admin.`,
        },
      ]);
      this.cancel(session.account);
    } else {
      this.databaseHandler.settlePurchase({ player: session.player, ...payment, id: session.id });
      this.complete(session.account);
    }
  }

  error(error, extra) {
    console.log(error);

    Sentry.captureException(new Error(ERROR_MESSAGES.wrongAmount), {
      extra,
    });
  }
}

class Websocket {
  network: Network = null;
  websocketDomain = null;
  connection = null;
  isReady = false;
  watchedAccounts = [];
  keepAliveInterval = null;

  constructor(network: Network) {
    this.network = network;
    this.websocketDomain = network === "nano" ? process.env.NANO_WEBSOCKET_DOMAIN : process.env.BAN_WEBSOCKET_DOMAIN;

    this.connection = new ReconnectingWebSocket(this.websocketDomain, [], {
      WebSocket: WS,
      connectionTimeout: 1000,
      maxRetries: 100000,
      maxReconnectionDelay: 2000,
      minReconnectionDelay: 10,
    });

    this.connection.onopen = () => {
      console.debug(`WEBSOCKET ${this.network} - onopen`);
      this.isReady = true;

      const confirmation_subscription = {
        action: "subscribe",
        topic: "confirmation",
        options: {
          confirmation_type: "active_quorum",
          all_local_accounts: true,
          accounts: this.watchedAccounts,
        },
      };

      this.connection.send(JSON.stringify(confirmation_subscription));

      this.keepAlive();

      // @NOTE: Re-add sessions if the socket reconnects
      purchase.sessions?.forEach(({ account }) => {
        this.registerAccount(account);
      });
    };

    this.connection.onclose = () => {
      console.debug(`WEBSOCKET ${this.network} - onclosed`);
      this.isReady = false;
    };

    this.connection.onerror = err => {
      console.debug(`WEBSOCKET ${this.network} - onerror`, err.message);

      Sentry.captureException(err);
      this.isReady = false;
    };

    this.connection.onmessage = msg => {
      const { topic, message } = JSON.parse(msg.data);
      if (topic !== "confirmation") return;
      const {
        hash,
        amount,
        block: { link_as_account },
      } = message;

      purchase.settle({ account: link_as_account, amount: rawToRai(amount, this.network), hash });
    };
  }

  keepAlive() {
    this.keepAliveInterval = setInterval(() => {
      this.connection.send(JSON.stringify({ action: "ping" }));
    }, 20000);
  }

  registerAccount(account) {
    if (!this.watchedAccounts.includes(account)) {
      this.watchedAccounts.push(account);
    }
    if (!this.isReady) {
      return false;
    }

    console.debug(`WEBSOCKET ${this.network} - registerAccount: ` + account);

    try {
      const confirmation_subscription = {
        action: "update",
        topic: "confirmation",
        options: {
          accounts_add: [account],
        },
      };
      this.connection.send(JSON.stringify(confirmation_subscription));
    } catch (err) {
      Sentry.captureException(err);
      return false;
    }
    return true;
  }

  unregisterAccount(account) {
    const index = this.watchedAccounts.indexOf(account);
    if (index > -1) {
      this.watchedAccounts.splice(index, 1);
    }

    console.debug(`WEBSOCKET ${this.network} - unregisterAccount: ` + account);

    try {
      const confirmation_subscription = {
        action: "update",
        topic: "confirmation",
        options: {
          accounts_del: [account],
        },
      };

      this.connection.send(JSON.stringify(confirmation_subscription));
    } catch (err) {
      Sentry.captureException(err);
    }
  }
}

const purchase = new Purchase();

const websocket: { [key in Network]: Websocket } = {
  nano: new Websocket("nano"),
  ban: new Websocket("ban"),
};

export { purchase };
