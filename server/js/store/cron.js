const fetch = require("node-fetch");
const cron = require("node-cron");
const { nodeCache } = require("./cache");

const getNanoUsdPrice = async () => {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=usd&include_24hr_change=true`,
    );
    const json = await res.json();

    const {
      nano: { usd },
    } = json;

    nodeCache.set("PRICE_NANO_USD", usd);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
};

// https://crontab.guru/#*/2_*_*_*_*
// At every 2nd minute.
cron.schedule("*/2 * * * *", async () => {
  getNanoUsdPrice();
});

getNanoUsdPrice();
