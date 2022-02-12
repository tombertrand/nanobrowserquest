const build = require("../config/config_build.json");
const local = require("../config/config_local.json");

var config = {
  dev: { host: "localhost", port: 8000, dispatcher: false },
  build: JSON.parse(build),
  local: null,
};

try {
  config.local = JSON.parse(local);
} catch (e) {
  // Exception triggered when config_local.json does not exist. Nothing to do here.
}

export default config;
