import cron from "node-cron";
import fetch from "node-fetch";

import { Sentry } from "../sentry";
import { nodeCache } from "./cache";

const getNetworkUsdPrice = async () => {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=nano,banano&vs_currencies=usd`);
    const json = await res.json();

    const {
      nano: { usd: nanoToUsd },
      banano: { usd: banToUsd },
    } = json;

    nodeCache.set("PRICE_NANO_USD", nanoToUsd);
    nodeCache.set("PRICE_BAN_USD", banToUsd);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);

    nodeCache.set("PRICE_NANO_USD", 0.881344);
    nodeCache.set("PRICE_BAN_USD", 0.00548182);
  }
};

// https://crontab.guru/#*/2_*_*_*_*
// At every 2nd minute.
cron.schedule("*/2 * * * *", async () => {
  getNetworkUsdPrice();
});

getNetworkUsdPrice();
