import fetch from "node-fetch";

import { Sentry } from "./sentry";

const ChatChannel =
  process.env.NODE_ENV === "production"
    ? "https://discord.com/api/webhooks/979056276589908008/yeov0D7OSvqNp7o6G6Kb6qbm7hB1EnegcnwKRRmr9y-zpe9O_YRb77jS6Fe0URRaJ3NC"
    : "https://discord.com/api/webhooks/1058467103939760168/hXXbrpz6TvRtwDe7Zaa7F5S6f-8adAtzRUMKc0OVqLTO_wV-OdbfSLLVb_CQeeeY09et";

const AnvilChannel =
  process.env.NODE_ENV === "production"
    ? "https://discord.com/api/webhooks/1029352905574207519/VWeXf_oqwL3MENHwpkUqTQozlsJ6H_ui_g5m8CJtYRwSQIGQ-fVByJCUQ6q69y-cCki2"
    : "https://discord.com/api/webhooks/1058468070852657222/Opp46s9XNyUUyzUyZpm3Npi5kVh_EBldd1iRDNv7Ibkwr3TafAkpqnEmKnuz5jGgjF6p";

const postMessageToDiscordChatChannel = (content: string) => {
  try {
    const body = JSON.stringify({
      content,
    });

    fetch(ChatChannel, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    Sentry.captureException(err);
  }
};

const postMessageToDiscordAnvilChannel = (content: string) => {
  try {
    const body = JSON.stringify({
      content,
    });

    fetch(AnvilChannel, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    Sentry.captureException(err);
  }
};

export { postMessageToDiscordChatChannel, postMessageToDiscordAnvilChannel };
