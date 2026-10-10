import Redis, { Redis as RedisClientType, RedisOptions } from "ioredis";

let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Builds the Redis connection options from environment variables.
 */
export function getRedisOptions(): { url?: string; options: RedisOptions } {
  let redisUrl = process.env.REDIS_URL || process.env.REDIS_URI || process.env.REDDIS_URI;
  if (redisUrl) {
    // Gracefully handle if the user pasted a redis-cli command (e.g. 'redis-cli -u redis://...')
    if (redisUrl.includes("-u ")) {
      redisUrl = redisUrl.split("-u ")[1].trim();
    }
    redisUrl = redisUrl.replace(/^["']|["']$/g, "").trim();
  }

  const options: RedisOptions = {
    // Prevent unhandled errors from crashing the process
    autoResendUnfulfilledCommands: false,
    lazyConnect: true,
    maxRetriesPerRequest: 1, // Fail fast on rate limiting so HTTP requests aren't held up
    connectTimeout: 5000,
    commandTimeout: 2000,
    retryStrategy(times) {
      // Exponential backoff with a cap: 100ms, 200ms, 400ms... max 3000ms
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
  };

  if (redisUrl) {
    return { url: redisUrl, options };
  }

  const host = process.env.REDIS_HOST || "127.0.0.1";
  const port = parseInt(process.env.REDIS_PORT || "6379", 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const username = process.env.REDIS_USERNAME || undefined;
  const useTls = process.env.REDIS_TLS === "true";

  options.host = host;
  options.port = port;
  if (password) options.password = password;
  if (username) options.username = username;
  if (useTls) options.tls = {};

  return { options };
}

/**
 * Initializes and returns the Redis client singleton.
 * If a custom client is provided (e.g. for testing), it will be used instead.
 */
export function getRedisClient(customClient?: RedisClientType): RedisClientType {
  if (customClient) {
    redisClient = customClient;
    isConnected = true;
    return redisClient;
  }

  if (redisClient) {
    return redisClient;
  }

  const { url, options } = getRedisOptions();
  redisClient = url ? new Redis(url, options) : new Redis(options);

  redisClient.on("connect", () => {
    console.log("[Redis] Connection established");
  });

  redisClient.on("ready", () => {
    isConnected = true;
    console.log("[Redis] Client is ready for commands");
  });

  redisClient.on("error", (err: Error) => {
    isConnected = false;
    // Log the error cleanly without exposing credentials
    console.error(`[Redis] Connection error: ${err.message}`);
  });

  redisClient.on("close", () => {
    isConnected = false;
    console.warn("[Redis] Connection closed");
  });

  redisClient.on("reconnecting", () => {
    console.log("[Redis] Reconnecting...");
  });

  // Initiate connection in the background if lazyConnect is enabled
  redisClient.connect().catch((err: Error) => {
    // Non-fatal on startup: rate limiting handles offline Redis via fail-open/fail-closed strategy
    console.warn(`[Redis] Initial connection could not be established immediately: ${err.message}`);
  });

  return redisClient;
}

/**
 * Checks whether Redis is currently connected and ready to process commands.
 */
export function isRedisReady(): boolean {
  return isConnected && redisClient !== null && redisClient.status === "ready";
}

/**
 * Manually sets the Redis client (useful for injecting mocks in unit tests).
 */
export function setRedisClient(client: RedisClientType | null): void {
  redisClient = client;
  isConnected = client !== null && client.status === "ready";
}

/**
 * Gracefully disconnects the Redis client.
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      redisClient.disconnect();
    } finally {
      redisClient = null;
      isConnected = false;
      console.log("[Redis] Disconnected successfully");
    }
  }
}
