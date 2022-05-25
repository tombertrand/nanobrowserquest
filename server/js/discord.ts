import fetch from "node-fetch";

import { Sentry } from "./sentry";

const postMessageToDiscord = (content: string) => {
  try {
    const body = JSON.stringify({
      content,
    });

    fetch(
      "https://discord.com/api/webhooks/979056276589908008/yeov0D7OSvqNp7o6G6Kb6qbm7hB1EnegcnwKRRmr9y-zpe9O_YRb77jS6Fe0URRaJ3NC",
      {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    Sentry.captureException(err);
  }
};

export { postMessageToDiscord };
