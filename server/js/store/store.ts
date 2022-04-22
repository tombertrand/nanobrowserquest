import BigNumber from "bignumber.js";

import { Types } from "../../../shared/js/gametypes";
import { nodeCache } from "./cache";

const { NODE_ENV } = process.env;
const isDevelopmentAmounts = NODE_ENV === "development";

class Store {
  storeItems = [
    {
      id: Types.Store.EXPANSION1,
      xno: 0,
      usd: isDevelopmentAmounts ? 0.01 : 2.5,
      usdRegular: 5,
      isAvailable: true,
    },
    {
      id: Types.Store.SCROLLUPGRADEBLESSED,
      xno: 0,
      usd: isDevelopmentAmounts ? 0.015 : 1.1,
      usdRegular: 1.5,
      isAvailable: true,
    },
    {
      id: Types.Store.SCROLLUPGRADEHIGH,
      xno: 0,
      usd: isDevelopmentAmounts ? 0.02 : 0.5,
      usdRegular: 0.75,
      isAvailable: true,
    },
    {
      id: Types.Store.CAPE,
      xno: 0,
      usd: isDevelopmentAmounts ? 0.03 : 1,
      usdRegular: 1.25,
      isAvailable: true,
    },
    // {
    //   id: Types.Store.SCROLLUPGRADEMEDIUM,
    //   xno: 0,
    //   usd: isDevelopmentAmounts ? 0.03 : 0.25,
    //   isAvailable: true,
    // },
  ];

  constructor() {}

  getItems() {
    const usd = nodeCache.get("PRICE_NANO_USD");

    if (!usd) {
      return [];
    }

    this.storeItems.map(item => {
      item.xno = parseFloat(new BigNumber(item.usd).dividedBy(usd).toFormat(3));

      return item;
    });
    return this.storeItems;
  }
}

const store = new Store();

export { store };
