const fetch = require("node-fetch");
const BigNumber = require("bignumber.js");
const { PromiseQueue } = require("./promise-queue");

const queue = new PromiseQueue();

const sender = "nano_1questzx4ym4ncmswhz3r4upwrxosh1hnic8ry8sbh694r48ajq95d1ckpay";
const key = process.env.PRIVATE_KEY;

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

const getWorkFromService = async hash => {
  const params = {
    user: process.env.BPOW_USERNAME,
    api_key: process.env.BPOW_API_KEY,
    hash,
    timeout: 15,
    difficulty: "fffffff800000000",
  };

  const res = await fetch(process.env.BPOW_DOMAIN, {
    method: "POST",
    body: JSON.stringify(params),
  });
  const json = await res.json();

  return json;
};

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
    res = await fetch(process.env.RPC_DOMAIN, {
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

const enqueueSendPayout = async params => {
  return await queue.enqueue(() => sendPayout(params));
};

const sendPayout = async ({ account: receiver, amount }) => {
  let hash;
  let work;
  try {
    // await sleep(Math.floor(Math.random() * 250) + 1);

    const accountInfo = await rpc("account_info", { account: sender, representative: "true" });

    if (accountInfo.error) {
      throw new Error("Unable to get account_info");
    }

    let { frontier, representative, balance } = accountInfo;

    try {
      ({ work } = await getWorkFromService(frontier));
    } catch (err) {
      console.log("Bpow error", err);
    }

    const blockCreate = await rpc("block_create", {
      json_block: true,
      type: "state",
      previous: frontier,
      account: sender,
      representative,
      balance: new BigNumber(balance).minus(amount).toFixed(),
      link: receiver,
      key,
      ...(work ? { work } : null),
    });

    if (blockCreate.error) {
      throw new Error("Unable to block_create");
    }
    const process = await rpc("process", {
      json_block: true,
      subtype: "send",
      block: blockCreate.block,
    });

    if (process.error) {
      throw new Error("Unable to process");
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

module.exports = {
  enqueueSendPayout,
};

// Run block_create
// curl -d '{
//     "action": "block_create",
//     "json_block": "true",
//     "type": "state",
//     "previous": "0",
//     "account": "nano_1questzx4ym4ncmswhz3r4upwrxosh1hnic8ry8sbh694r48ajq95d1ckpay",
//     "representative": "nano_1kd4h9nqaxengni43xy9775gcag8ptw8ddjifnm77qes1efuoqikoqy5sjq3",
//     "balance": "1000000000000000000000000000000",
//     "link": "DA4094425E76C1A11035CE15FD2E52EFAEE25EBFD241EB7CE2648E3DF5E75DA3",
//     "key": "8237a230a2d77114d40a4e8d8b28ded30fa112e4b99db19e4101af0b163ff703"
//   }' '[68.183.110.185]:7076'
// From block_create
// {
//     "hash": "AB7CC19DFD23276CF56F31A3F34F2E66F216C4E6467DB7CBDCE4D86E2A8AE8D6",
//     "difficulty": "fffffe78c945bb9c",
//     "block": {
//         "type": "state",
//         "account": "nano_1questzx4ym4ncmswhz3r4upwrxosh1hnic8ry8sbh694r48ajq95d1ckpay",
//         "previous": "0000000000000000000000000000000000000000000000000000000000000000",
//         "representative": "nano_1kd4h9nqaxengni43xy9775gcag8ptw8ddjifnm77qes1efuoqikoqy5sjq3",
//         "balance": "1000000000000000000000000000000",
//         "link": "DA4094425E76C1A11035CE15FD2E52EFAEE25EBFD241EB7CE2648E3DF5E75DA3",
//         "link_as_account": "nano_3pk1kj37wxp3n6a5dmioznq77uxgwbhdznk3xfyg6s6g9qtygqf5eiwomnqf",
//         "signature": "E349F7926B7795F9FA9F4799031DC4B35522B00DACB3E979651EC41057D16DBEDC9D957B59D5EFF0DAEC8606B55349F58848B9C438FB160FD6BB8814C3C61403",
//         "work": "36c22af0a4ee8649"
//     }
// }
// Run process
// curl -d '{
//     "action": "process",
//     "json_block": "true",
//     "subtype": "open",
//     "block": {
//       "type": "state",
//       "account": "nano_1questzx4ym4ncmswhz3r4upwrxosh1hnic8ry8sbh694r48ajq95d1ckpay",
//       "previous": "0000000000000000000000000000000000000000000000000000000000000000",
//       "representative": "nano_1kd4h9nqaxengni43xy9775gcag8ptw8ddjifnm77qes1efuoqikoqy5sjq3",
//       "balance": "1000000000000000000000000000000",
//       "link": "DA4094425E76C1A11035CE15FD2E52EFAEE25EBFD241EB7CE2648E3DF5E75DA3",
//       "link_as_account": "nano_3pk1kj37wxp3n6a5dmioznq77uxgwbhdznk3xfyg6s6g9qtygqf5eiwomnqf",
//       "signature": "E349F7926B7795F9FA9F4799031DC4B35522B00DACB3E979651EC41057D16DBEDC9D957B59D5EFF0DAEC8606B55349F58848B9C438FB160FD6BB8814C3C61403",
//       "work": "36c22af0a4ee8649"
//     }
//   }' '[68.183.110.185]:7076'
// Response
// {
//     "hash": "AB7CC19DFD23276CF56F31A3F34F2E66F216C4E6467DB7CBDCE4D86E2A8AE8D6"
// }