import BigNumber from "bignumber.js";
import fetch from "node-fetch";

import { PromiseQueue } from "./promise-queue";
import { rpc } from "./rpc";
import { Sentry } from "./sentry";

const queue = new PromiseQueue();

const sender = "1questzx4ym4ncmswhz3r4upwrxosh1hnic8ry8sbh694r48ajq95d1ckpay";

const { PRIVATE_KEY, BPOW_USERNAME, BPOW_API_KEY, BPOW_DOMAIN } = process.env;



const getWorkFromService = async hash => {
  const params = {
    user: BPOW_USERNAME,
    api_key: BPOW_API_KEY,
    hash,
    timeout: 15,
    difficulty: "fffffff800000000",
  };

  const res = await fetch(BPOW_DOMAIN, {
    method: "POST",
    body: JSON.stringify(params),
  });
  const json = await res.json();

  return json;
};

const enqueueSendPayout = async params => {
  return await queue.enqueue(() => sendPayout(params));
};

const sendPayout = async ({ account: receiver, amount, network, playerName }) => {
  let hash;
  let work;
  try {
    if (!network) {
      throw new Error("Invalid payout network");
    }

    // await sleep(Math.floor(Math.random() * 250) + 1);

    const accountInfo = await rpc("account_info", { account: `${network}_${sender}`, representative: "true" }, network);

    // if (accountInfo.error) {
    //   throw new Error("Unable to get account_info");
    // }

    let { frontier, representative, balance } = accountInfo;

    try {
      ({ work } = await getWorkFromService(frontier));
    } catch (err) {
      console.log("Bpow error", err);
    }

    const blockCreate = await rpc(
      "block_create",
      {
        json_block: true,
        type: "state",
        previous: frontier,
        account: `${network}_${sender}`,
        representative,
        balance: new BigNumber(balance).minus(amount).toFixed(),
        link: receiver,
        key: PRIVATE_KEY,
        ...(work ? { work } : null),
      },
      network,
    );
    const process = await rpc(
      "process",
      {
        json_block: true,
        subtype: "send",
        block: blockCreate.block,
      },
      network,
    );

    if (process.error) {
      Sentry.captureException(new Error("Unable to process block"), {
        extra: {
          network,
          process,
          block: blockCreate,
          player: playerName,
        },
      });
    }
    hash = process.hash;
  } catch (err) {
    return {
      message: "Unable to complete payout, try again later.",
      err,
    };
  }
  return {
    hash,
    message: "Payout sent!",
  };
};

export { enqueueSendPayout };
