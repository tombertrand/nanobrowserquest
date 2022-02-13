import ReconnectingWebSocket from "reconnecting-websocket";
import WS from "ws";

import { Types } from "../../../shared/js/gametypes";
import { Sentry } from "../sentry";
import { rawToRai } from "../utils";
import { store } from "./store";

const ERROR_MESSAGES = {
  noSession: "Received payment for an unregistered session account.",
  wrongAmount: "Wrong amount sent to deposit address.",
  notAvailable: "The store is not currently available, try again later.",
};

class Purchase {
  sessions = [];
  databaseHandler = null;

  constructor() {}

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
      const { xno } = store.storeItems.find(item => id === item.id);

      this.sessions.push({ player, account, id, xno });

      if (!websocket.registerAccount(account)) {
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
            xno,
          },
        });
      }
    }
  }

  cancel(account) {
    console.debug("PURCHASE - cancel: " + account);

    this.sessions = this.sessions.filter(session => session.account !== account);
    websocket.unregisterAccount(account);
  }

  complete(account) {
    console.debug("PURCHASE - complete: " + account);

    this.sessions = this.sessions.filter(session => session.account !== account);
    websocket.unregisterAccount(account);
  }

  settle(payment) {
    console.debug("PURCHASE - settle: " + payment.account);

    const session = this.sessions.find(session => session.account === payment.account);
    if (!session) {
      this.error(ERROR_MESSAGES.noSession, payment);
    } else if (payment.amount < session.xno) {
      this.error(ERROR_MESSAGES.wrongAmount, { xno: session.xno, payment });

      session.player.send([
        Types.Messages.PURCHASE_ERROR,
        {
          message: `${ERROR_MESSAGES.wrongAmount}. You sent Ӿ${payment.amount} instead of sending Ӿ${session.xno}. Try again or contact an admin.`,
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
  connection = null;
  isReady = false;
  watchedAccounts = [];
  keepAliveInterval = null;

  constructor() {
    this.connection = new ReconnectingWebSocket(process.env.WEBSOCKET_DOMAIN, [], {
      WebSocket: WS,
      connectionTimeout: 1000,
      maxRetries: 100000,
      maxReconnectionDelay: 2000,
      minReconnectionDelay: 10,
    });

    this.connection.onopen = () => {
      console.debug("WEBSOCKET - onopen");
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
    };

    this.connection.onclose = () => {
      console.debug("WEBSOCKET - onclosed");
      this.isReady = false;
    };

    this.connection.onerror = err => {
      console.debug("WEBSOCKET - onerror");

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

      purchase.settle({ account: link_as_account, amount: rawToRai(amount), hash });
    };
  }

  keepAlive() {
    this.keepAliveInterval = setInterval(() => {
      this.connection.send(JSON.stringify({ action: "ping" }));
    }, 30000);
  }

  registerAccount(account) {
    if (!this.watchedAccounts.includes(account)) {
      this.watchedAccounts.push(account);
    }
    if (!this.isReady) {
      return false;
    }

    console.debug("WEBSOCKET - registerAccount: " + account);

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

    console.debug("WEBSOCKET - registerAccount: " + account);

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
const websocket = new Websocket();

export { purchase, websocket };
