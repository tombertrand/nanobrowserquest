import * as _ from "lodash";

// import redis from "redis";
import { redisClient } from "./db_providers/client";

class Metrics {
  config: any;
  isReady: boolean;
  readyCallback: any;
  redisClient: any;

  constructor(config) {
    var self = this;

    this.config = config;
    this.redisClient = redisClient;

    this.isReady = false;

    this.redisClient.on("connect", function () {
      console.info("Metrics enabled: Redis client connected to " + config.redis_host + ":" + config.redis_port);
      self.isReady = true;
      self.readyCallback?.();
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
      this.redisClient.set("player_count_" + config.server_name, playerCount);
      var totalPlayers = 0;

      // Recalculate the total number of players and set it
      _.each(config.game_servers, function (server) {
        const result = self.redisClient.get("player_count_" + server.name);
        var count = result ? parseInt(result, 10) : 0;

        totalPlayers += count;
        numServers -= 1;
        if (numServers === 0) {
          self.redisClient.set("total_players", totalPlayers);

          updatedCallback?.(totalPlayers);
        }
      });
    } else {
      console.error("Redis client not connected");
    }
  }

  updateWorldDistribution(worlds) {
    this.redisClient.set("world_distribution_" + this.config.server_name, worlds);
  }

  updateWorldCount() {
    this.redisClient.set("world_count_" + this.config.server_name, this.config.nb_worlds);
  }

  async getOpenWorldCount(callback) {
    const result = await this.redisClient.get("world_count_" + this.config.server_name);
    callback(result);
  }

  async getTotalPlayers(callback) {
    const result = await this.redisClient.get("total_players");
    callback(result);
  }

  async getWorldPlayers(callback) {
    const result = await this.redisClient.get("world_players_" + this.config.server_name);
    callback(result);
  }
}

export default Metrics;
