import * as Sentry from "@sentry/node";

import { postMessageToDiscordModeratorDebugChannel } from "./discord";

Sentry.init({
  dsn: process.env.SENTRY_DNS,
  beforeSend: (event, hint) => {
    if (process.env.NODE_ENV === "development") {
      console.error(hint.originalException || hint.syntheticException);
      return null;
    }

    const message = (hint.originalException as Error)?.message || hint.syntheticException?.message;

    if (typeof message === "string" && message?.includes("while still locked")) {
      return null;
    }

    postMessageToDiscordModeratorDebugChannel(message);
    return event;
  },
});

process.on("uncaughtException", err => {
  console.log("Error", err);
  Sentry.captureException(err);
});

process.on("exit", code => {
  Sentry.captureException(new Error("Exiting with code"), { extra: { code } });
  process.exit(code);
});

process.on("unhandledRejection", (reason, promise) => {
  Sentry.captureException(new Error("Unhandled promise rejection"), {
    extra: { reason, promise },
  });

  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.log("Error", reason);
});

export { Sentry };
