import * as Sentry from "@sentry/node";
import fs from "fs";

import { postMessageToModeratorDebugChannel } from "./discord";

Sentry.init({
  dsn: process.env.SENTRY_DNS,
  beforeSend: (event, hint) => {
    if (process.env.NODE_ENV === "development") {
      console.error(hint.originalException || hint.syntheticException);
      return null;
    }

    const message = (hint.originalException as Error)?.message || hint.syntheticException?.message

    postMessageToModeratorDebugChannel(message);
    return event;
  },
});

process.on("uncaughtException", err => {
  console.log("Error", err);
  fs.writeFileSync("./error.log", JSON.stringify(err, null, 2));
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
  console.log("Error", reason);
  fs.writeFileSync("./error.log", JSON.stringify(reason, null, 2));
});

export { Sentry };
