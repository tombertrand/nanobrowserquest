import "dotenv/config";

import * as fs from "fs";
import * as _ from "lodash";

import DatabaseHandler from "./db_providers/redis";
import Metrics from "./metrics";
import Player from "./player";
import World from "./worldserver";
import Server from "./ws";

const { NODE_ENV } = process.env;

function main(config) {
  var WorldServer = World;

  var metrics = config.metrics_enabled ? new Metrics(config) : null;
  var databaseHandler = new DatabaseHandler();
  var server = new Server(config.port);

  var worlds = [];
  var lastTotalPlayers = 0;

  setInterval(async () => {
    if (metrics && metrics.isReady) {
      await metrics.getTotalPlayers(function (totalPlayers) {
        if (totalPlayers !== lastTotalPlayers) {
          lastTotalPlayers = totalPlayers;

          _.each(worlds, function (world) {
            world.updatePopulation();
          });
        }
      });
    }
  }, 1000);

  server.onConnect(async function (connection) {
    console.log("~~~~~~server.onConnected!!");
    var world; // the one in which the player will be spawned
    var connect = function () {
      if (world) {
        console.log("~~~~~~~set new player");
        world.connect_callback(new Player(connection, world, databaseHandler));
      }
    };

    if (metrics) {
      await metrics.getOpenWorldCount(function () {
        world = worlds[0];
        connect();
        world.updatePopulation();
      });
    }
  });

  // server.onError(function () {
  //   const details = Array.prototype.join.call(arguments, ", ");
  //   console.error(details);

  // });

  var onPopulationChange = async function () {
    await metrics.updatePlayerCounters(worlds, function () {
      _.each(worlds, function (world) {
        world.updatePopulation();
      });
    });
    await metrics.updateWorldDistribution(getWorldDistribution(worlds));
  };

  _.each(_.range(config.nb_worlds), function (i) {
    var world = new WorldServer("world" + (i + 1), config.nb_players_per_world, server, databaseHandler);
    world.run(config.map_filepath);
    world.runChatBans();
    worlds.push(world);
    if (metrics) {
      world.onPlayerAdded(onPopulationChange);
      world.onPlayerRemoved(onPopulationChange);
    }
  });

  server.onRequestStatus(function () {
    return JSON.stringify(getWorldDistribution(worlds));
  });

  if (config.metrics_enabled) {
    metrics.ready(async () => {
      metrics.isReady = true;

      await onPopulationChange(); // initialize all counters to 0 when the server starts
    });
  }

  process.on("uncaughtException", function (err) {
    console.error("uncaughtException: " + err);
  });
}

function getWorldDistribution(worlds) {
  var distribution = [];

  _.each(worlds, function (world) {
    distribution.push(world.playerCount);
  });
  return distribution;
}

function getConfigFile(path, callback) {
  fs.readFile(path, "utf8", function (err, json_string) {
    if (err) {
      console.error("Could not open config file:", err.path);
      callback(null);
    } else {
      callback(JSON.parse(json_string));
    }
  });
}

var configPath = "./server/config.json";

process.argv.forEach(function (val, index) {
  if (index === 2) {
    configPath = val;
  }
});

getConfigFile(configPath, function (config) {
  if (NODE_ENV === "production") {
    config.redis_port = config.port.prod_redis_port;
  }
  main(config);
});
