import BigNumber from "bignumber.js";

import { Types } from "../../../shared/js/gametypes";
import { nodeCache } from "./cache";

const { NODE_ENV } = process.env;
const isDevelopmentAmounts = NODE_ENV === "development";

class Store {
  storeItems = [
    {
      id: Types.Store.EXPANSION1,
      nano: 0,
      ban: 0,
      usd: isDevelopmentAmounts ? 0.01 : 0.001,
      isAvailable: true,
    },
    {
      id: Types.Store.EXPANSION2,
      nano: 0,
      ban: 0,
      usd: isDevelopmentAmounts ? 0.01 : 0.001,
      isAvailable: true,
    },
    // {
    //   id: Types.Store.SCROLLUPGRADEBLESSED,
    //   nano: 0,
    //   ban: 0,
    //   usd: isDevelopmentAmounts ? 0.05 : 1.5,
    //   isAvailable: true,
    // },
    // {
    //   id: Types.Store.SCROLLUPGRADEHIGH,
    //   nano: 0,
    //   ban: 0,
    //   usd: isDevelopmentAmounts ? 0.1 : 0.5,
    //   isAvailable: true,
    // },
    // {
    //   id: Types.Store.CAPE,
    //   nano: 0,
    //   ban: 0,
    //   usd: isDevelopmentAmounts ? 0.12 : 1.25,
    //   isAvailable: true,
    // },
    // {
    //   id: Types.Store.SCROLLUPGRADEMEDIUM,
    //   nano: 0,
    //   usd: isDevelopmentAmounts ? 0.03 : 0.25,
    //   isAvailable: true,
    // },
  ];

  constructor() {}

  getItems() {
    const nanoToUsd = nodeCache.get("PRICE_NANO_USD");
    const banToUsd = nodeCache.get("PRICE_BAN_USD");

    if (!nanoToUsd || !banToUsd) {
      return [];
    }

    this.storeItems.map(item => {
      item.nano = parseFloat(new BigNumber(item.usd).dividedBy(nanoToUsd).toFormat(3));
      item.ban = parseInt(`${new BigNumber(item.usd).dividedBy(banToUsd).toNumber()}`, 10);

      return item;
    });

    return this.storeItems;
  }
}

const store = new Store();

export { store };
