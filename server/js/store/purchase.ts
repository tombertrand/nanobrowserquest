import ReconnectingWebSocket from "reconnecting-websocket";
import WS from "ws";

import { Types } from "../../../shared/js/gametypes";
import { toBoolean } from "../../../shared/js/utils";
import { Sentry } from "../sentry";
import { rawToRai } from "../utils";
import { store } from "./store";

const ERROR_MESSAGES = {
  noSession: "Received payment for an unregistered session account.",
  wrongAmount: "Wrong amount sent to deposit address.",
  notAvailable: "The store is not currently available, try again later.",
};

const { IS_STORE_AVAILABLE } = process.env;

const isStoreAvailable = toBoolean(IS_STORE_AVAILABLE);
class Purchase {
  network: Network = null;
  sessions = [];
  databaseHandler = null;

  constructor(network: Network) {
    this.network = network;
  }

  create({ player, account, id }) {
    const accountSession = this.sessions.find(({ account: registeredAccount }) => account === registeredAccount);
    const { nano, ban } = store.storeItems.find(item => id === item.id);

    if (accountSession) {
      this.sessions.map(session => {
        if (session.account === accountSession.account) {
          // Replace the purchase id in case the websocket is listening for another item id
          session.id = id;
          session.nano = nano;
          session.ban = ban;
        }

        return session;
      });
    } else {
      this.sessions.push({ player, account, id, nano, ban });

      if (!websocket[this.network].registerAccount(account)|| !isStoreAvailable) {
        player.send([
          Types.Messages.PURCHASE_ERROR,
          {
            message: ERROR_MESSAGES.notAvailable,
          },
        ]);
      }
    }
  }

  cancel(account) {
    if (!this.sessions.find(session => session.account === account)) return;

    console.debug(`[${this.network}] PURCHASE - cancel: ${account}`);

    this.sessions = this.sessions.filter(session => session.account !== account);
    websocket[this.network].unregisterAccount(account);
  }

  complete(account) {
    console.debug(`[${this.network}] PURCHASE - complete: ${account}`);

    this.sessions = this.sessions.filter(session => session.account !== account);
    websocket[this.network].unregisterAccount(account);
  }

  settle(payment) {
    const session = this.sessions.find(session => session.account === payment.account);

    if (!session) {
      this.error(ERROR_MESSAGES.noSession, payment);
    } else if (payment.amount < session[this.network]) {
      this.error(`**${session.player.name}** ${ERROR_MESSAGES.wrongAmount}`, {
        [this.network]: session[this.network],
        payment,
        player: session.player.name,
      });

      session.player.send([
        Types.Messages.PURCHASE_ERROR,
        {
          message: `${ERROR_MESSAGES.wrongAmount}. You sent ${payment.amount} instead of sending ${
            session[this.network]
          }. Try again or contact an admin.`,
        },
      ]);
      this.cancel(session.account);
    } else {
      console.debug(`[${this.network}] PURCHASE - settle: ${payment.account}`);

      this.databaseHandler.settlePurchase({ player: session.player, ...payment, id: session.id });
      this.complete(session.account);
    }
  }

  error(error, extra) {
    console.log(error);

    Sentry.captureException(new Error(`**${extra.player}** ${ERROR_MESSAGES.wrongAmount}`), {
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

    console.debug(`[${this.network}] WEBSOCKET - ${this.websocketDomain}`);

    if (!isStoreAvailable){
      return
    }
    this.connection =isStoreAvailable? new ReconnectingWebSocket(this.websocketDomain, [], {
      WebSocket: WS,
      connectionTimeout: 10000,
      maxRetries: 100000,
      maxReconnectionDelay: 2000,
      minReconnectionDelay: 10,
    }): {};

    this.connection.onopen = () => {
      console.debug(`[${this.network}] WEBSOCKET - onopen`);
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
      purchase[this.network].sessions?.forEach(({ account }) => {
        this.registerAccount(account);
      });
    };

    this.connection.onclose = () => {
      console.debug(`[${this.network}] WEBSOCKET - onclosed`);
      this.isReady = false;
    };

    this.connection.onerror = err => {
      console.debug(`[${this.network}] WEBSOCKET - onerror: ${err.message}`);

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

      purchase[this.network].settle({ account: link_as_account, amount: rawToRai(amount, this.network), hash });
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

    console.debug(`WEBSOCKET ${this.network} - registerAccount: ${account}`);

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

    console.debug(`[${this.network}] WEBSOCKET - unregisterAccount: ${account}`);

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

const purchase: { [key in Network]: Purchase } = {
  nano: new Purchase("nano"),
  ban: new Purchase("ban"),
};

const websocket: { [key in Network]: Websocket | null } = {
  nano: new Websocket("nano"),
  ban: new Websocket("ban"),
};

export { purchase };
