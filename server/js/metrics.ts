import * as _ from "lodash";
import redis from "redis";

const { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD, NODE_ENV } = process.env;

class Metrics {
  config: any;
  client: any;
  isReady: boolean;
  readyCallback: any;

  constructor(config) {
    var self = this;

    this.config = config;

    this.client = redis.createClient(REDIS_PORT, REDIS_HOST, {
      socket_nodelay: true,

      ...(NODE_ENV !== "development" && REDIS_PASSWORD ? { password: REDIS_PASSWORD } : null),
    });

    this.isReady = false;

    this.client.on("connect", function () {
      console.info("Metrics enabled: Redis client connected to " + config.redis_host + ":" + config.redis_port);
      self.isReady = true;
      if (self.readyCallback) {
        self.readyCallback();
      }
    });
  }

  ready(callback) {
    this.readyCallback = callback;
  }

  updatePlayerCounters(worlds, updatedCallback) {
    var self = this;
    var config = this.config;
    var numServers = _.size(config.game_servers);
    var playerCount = _.reduce(
      worlds,
      function (sum, world) {
        return sum + world.playerCount;
      },
      0,
    );

    if (this.isReady) {
      // Set the number of players on this server
      this.client.set("player_count_" + config.server_name, playerCount, function () {
        var totalPlayers = 0;

        // Recalculate the total number of players and set it
        _.each(config.game_servers, function (server) {
          self.client.get("player_count_" + server.name, function (error, result) {
            var count = result ? parseInt(result, 10) : 0;

            totalPlayers += count;
            numServers -= 1;
            if (numServers === 0) {
              self.client.set("total_players", totalPlayers, function () {
                if (updatedCallback) {
                  updatedCallback(totalPlayers);
                }
              });
            }
          });
        });
      });
    } else {
      console.error("Redis client not connected");
    }
  }

  updateWorldDistribution(worlds) {
    this.client.set("world_distribution_" + this.config.server_name, worlds);
  }

  updateWorldCount() {
    this.client.set("world_count_" + this.config.server_name, this.config.nb_worlds);
  }

  getOpenWorldCount(callback) {
    this.client.get("world_count_" + this.config.server_name, function (error, result) {
      callback(result);
    });
  }

  getTotalPlayers(callback) {
    this.client.get("total_players", function (error, result) {
      callback(result);
    });
  }

  getWorldPlayers(callback) {
    this.client.get("world_players_" + this.config.server_name, function (error, result) {
      callback(result);
    });
  }
}

export default Metrics;
