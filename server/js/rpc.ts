import fetch from "node-fetch";

import type { Network } from "./types";

const { NANO_RPC_DOMAIN, BAN_RPC_DOMAIN } = process.env;
const rpcToDomainMap: { [key in Network]: string } = {
  nano: NANO_RPC_DOMAIN,
  ban: BAN_RPC_DOMAIN,
};

const rpc = async (action, params, network) => {
  let res;
  let json;

  try {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      action,
      ...params,
    });

    // @TODO Figure out what to do with rpc enabled...
    res = await fetch(rpcToDomainMap[network], {
      method: "POST",
      body,
    });

    json = await res.json();
  } catch (err) {
    console.log("Error", err);
    throw err;
  }

  return json;
};

export { rpc };
