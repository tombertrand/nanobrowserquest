const fetch = require("node-fetch");

const { RPC_DOMAIN } = process.env;

const rpc = async (action, params) => {
  let res;
  let json;

  try {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      action,
      ...params,
    });

    // @TODO Figure out what to do with rpc enabled...
    res = await fetch(RPC_DOMAIN, {
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

module.exports = {
  rpc,
};
