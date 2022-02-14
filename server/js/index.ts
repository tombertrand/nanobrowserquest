import * as fs from "fs";
import * as _ from "lodash";

import DatabaseHandler from "./db_providers/redis";
import Metrics from "./metrics";
import Player from "./player";
import World from "./worldserver";
import Server from "./ws";

function main(config) {
  var WorldServer = World;
  var server = new Server(config.port);
  var metrics = config.metrics_enabled ? new Metrics(config) : null;
  var worlds = [];
  var lastTotalPlayers = 0;
  var databaseHandler = new DatabaseHandler();

  setInterval(function () {
    if (metrics && metrics.isReady) {
      metrics.getTotalPlayers(function (totalPlayers) {
        if (totalPlayers !== lastTotalPlayers) {
          lastTotalPlayers = totalPlayers;
          _.each(worlds, function (world) {
            world.updatePopulation(totalPlayers);
          });
        }
      });
    }
  }, 1000);

  console.info("Starting BrowserQuest game server...");

  server.onConnect(function (connection) {
    var world; // the one in which the player will be spawned
    var connect = function () {
      if (world) {
        world.connect_callback(new Player(connection, world, databaseHandler));
      }
    };

    if (metrics) {
      metrics.getOpenWorldCount(function () {
        world = worlds[0];
        connect();
        // world.updatePopulation();
      });
    }
    // else {
    //   // simply fill each world sequentially until they are full
    //   world = _.detect(worlds, function (world) {
    //     return world.playerCount < config.nb_players_per_world;
    //   });
    //   world.updatePopulation();
    //   connect();
    // }
  });

  server.onError(function () {
    console.error(Array.prototype.join.call(arguments, ", "));
  });

  var onPopulationChange = function () {
    metrics.updatePlayerCounters(worlds, function (totalPlayers) {
      _.each(worlds, function (world) {
        world.updatePopulation(totalPlayers);
      });
    });
    metrics.updateWorldDistribution(getWorldDistribution(worlds));
  };

  _.each(_.range(config.nb_worlds), function (i) {
    var world = new WorldServer("world" + (i + 1), config.nb_players_per_world, server, databaseHandler);
    world.run(config.map_filepath);
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
    metrics.ready(function () {
      onPopulationChange(); // initialize all counters to 0 when the server starts
    });
  }

  process.on("uncaughtException", function (e) {
    console.error("uncaughtException: " + e);
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
  console.log("~~~config", config);
  main(config);
});
