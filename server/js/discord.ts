import fetch from "node-fetch";

import { Sentry } from "./sentry";

const postMessageToDiscordChatChannel = (content: string) => {
  if (process.env.NODE_ENV !== "production") return;

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

const postMessageToDiscordChatChannelAnvilChannel = (content: string) => {
  if (process.env.NODE_ENV !== "production") return;

  try {
    const body = JSON.stringify({
      content,
    });

    fetch(
      "https://discord.com/api/webhooks/1029352905574207519/VWeXf_oqwL3MENHwpkUqTQozlsJ6H_ui_g5m8CJtYRwSQIGQ-fVByJCUQ6q69y-cCki2",
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

export { postMessageToDiscordChatChannel, postMessageToDiscordChatChannelAnvilChannel };
