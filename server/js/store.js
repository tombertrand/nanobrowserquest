const WS = require("ws");
const ReconnectingWebSocket = require("reconnecting-websocket");
const { rpc } = require("./rpc");
const NanocurrencyWeb = require("nanocurrency-web");

let ws;
let isWsReady = false;

const connectToWebsocket = () => {
  ws = new ReconnectingWebSocket(process.env.WEBSOCKET_DOMAIN, [], {
    WebSocket: WS,
    connectionTimeout: 1000,
    maxRetries: 100000,
    maxReconnectionDelay: 2000,
    minReconnectionDelay: 10,
  });

  ws.onopen = () => {
    console.log("Websocket opened");
    isWsReady = true;

    const confirmation_subscription = {
      action: "subscribe",
      topic: "confirmation",
      options: {
        confirmation_type: "active_quorum",
        all_local_accounts: true,
      },
    };

    ws.send(JSON.stringify(confirmation_subscription));
  };

  ws.onclose = () => {
    console.log("~~~~Websocket closed");
    isWsReady = false;
  };

  ws.onerror = err => {
    console.log("~~~~Websocket error", err.message);
    isWsReady = false;
  };

  ws.onmessage = msg => {
    const { topic, message } = JSON.parse(msg.data);
    const {
      hash,
      block: { account, representative, link_as_account, subtype },
    } = message;

    // if (topic === "confirmation") {

    console.log("~~~~~message", message);
  };
};
connectToWebsocket();

const registerWebsocketAccount = account => {
  try {
    if (!isWsReady) {
      //@TODO return error
      return;
    }

    const confirmation_subscription = {
      action: "update",
      topic: "confirmation",
      options: {
        accounts_add: [account],
      },
    };

    console.log("~~~~send store register account!", account);

    ws.send(JSON.stringify(confirmation_subscription));
  } catch (err) {
    console.log("~~~~err", err);
  }
};

const unregisterWebsocketAccount = account => {
  try {
    if (!isWsReady) {
      //@TODO return error
      return;
    }

    const confirmation_subscription = {
      action: "update",
      topic: "confirmation",
      options: {
        accounts_del: [account],
      },
    };

    ws.send(JSON.stringify(confirmation_subscription));
  } catch (err) {
    console.log("~~~~err", err);
  }
};

const getNewDepositAccountByIndex = async index => {
  const depositAccount = await NanocurrencyWeb.wallet.legacyAccounts(process.env.DEPOSIT_SEED, index, index)[0].address;

  return depositAccount;
};

module.exports = {
  registerWebsocketAccount,
  getNewDepositAccountByIndex,
};
