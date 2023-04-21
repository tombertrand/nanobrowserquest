import cron from "node-cron";
import fetch from "node-fetch";

import { nodeCache } from "./cache";

const { COINMARKETCAP_KEY, NODE_ENV } = process.env;

const getNetworkUsdPrice = async () => {
  let nano;
  let banano;

  if (NODE_ENV !== "production") {
    nodeCache.set("PRICE_NANO_USD", 0.882418);
    nodeCache.set("PRICE_BAN_USD", 0.0055262);
    return;
  }

  try {
    ({ nano, banano } = await getPriceFromCoinMarketCap());

    if (!nano || !banano) {
      throw new Error("Failed to get CMC Nano/Banano price");
    }
  } catch (err) {
    try {
      ({ nano, banano } = await getPriceFromCoinGecko());
    } catch (err) {}
  }

  nodeCache.set("PRICE_NANO_USD", nano);
  nodeCache.set("PRICE_BAN_USD", banano);
};

const getPriceFromCoinMarketCap = async () => {
  const NANO_ID = 1567;
  const BANANO_ID = 4704;
  let nanoToUsd;
  let banToUsd;

  try {
    const res = await fetch("https://pro-api.coinmarketcap.com/v2/tools/price-conversion?symbol=xno&amount=1", {
      headers: {
        "X-CMC_PRO_API_KEY": COINMARKETCAP_KEY,
      },
    });
    const { data } = await res.json();
    const nanoObj = data.find(({ id }) => id === NANO_ID);
    nanoToUsd = nanoObj.quote.USD.price;

    const resBan = await fetch("https://pro-api.coinmarketcap.com/v2/tools/price-conversion?symbol=ban&amount=1", {
      headers: {
        "X-CMC_PRO_API_KEY": COINMARKETCAP_KEY,
      },
    });
    const { data: dataBan } = await resBan.json();
    const banObj = dataBan.find(({ id }) => id === BANANO_ID);
    banToUsd = banObj.quote.USD.price;

    return { nano: nanoToUsd, banano: banToUsd };
  } catch (err) {
    console.log("Err getPriceFromCoinMarketCap", err);
    return null;
  }
};

const getPriceFromCoinGecko = async () => {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=nano,banano&vs_currencies=usd`);
    const json = await res.json();

    const {
      nano: { usd: nanoToUsd },
      banano: { usd: banToUsd },
    } = json;

    return { nano: nanoToUsd, banano: banToUsd };
  } catch (err) {
    console.log("Err getPriceFromCoinGecko", err);
    return null;
  }
};

// https://crontab.guru/#*/10_*_*_*_*
// At every 10th minute.
cron.schedule("*/10 * * * *", () => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  getNetworkUsdPrice();
});

// eslint-disable-next-line @typescript-eslint/no-floating-promises
getNetworkUsdPrice();
