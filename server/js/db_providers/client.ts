import { createClient } from "redis";

export const { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD, REDIS_DB_INDEX, DEPOSIT_SEED, NODE_ENV } = process.env;

export let redisClient = null;
export async function connectRedis() {
  const REDIS_OPTIONS = {
    port: REDIS_PORT,
    host: REDIS_HOST,
    database: Number(REDIS_DB_INDEX),
    ...(NODE_ENV !== "development" && REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
  };

  // Create a Redis client with the specified configuration options
  redisClient = createClient(REDIS_OPTIONS);


  // Properly handle connection errors
  redisClient.on("error", err => console.log("Redis Client Error", err));

  redisClient.on("connect", () => {
    console.log("Connected to Redis server successfully!");
  });

  // Connect to the Redis server
  await redisClient.connect();

  return redisClient;
}

// Example usage
connectRedis()
  .then(() => {
    console.log("Connected to Redis server successfully!");
    // You can now use the client for Redis operations
    // Don't forget to close the connection when you're done
    // client.quit();

    // client.on("connect", () => {
    //   this.setDepositAccount();
    // });
  })
  .catch(err => {
    console.error("Failed to connect to Redis:", err);
  });
