import * as Sentry from "@sentry/node";
import fs from "fs";

Sentry.init({
  dsn: process.env.SENTRY_DNS,
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
});

export { Sentry };
