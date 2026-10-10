import { Request, Response, NextFunction } from "express";
import { Redis as RedisClientType } from "ioredis";
import crypto from "crypto";
import { getRedisClient } from "../database/redis";
import { rateLimitConfig } from "../config/rateLimit.config";

/**
 * Lua script for atomic sliding-window rate limiting in Redis.
 *
 * Algorithm:
 * 1. Uses a Redis Sorted Set (ZSET) per key (client IP + route identifier).
 * 2. Prunes any records older than (now - windowMs) with ZREMRANGEBYSCORE.
 * 3. Counts the surviving records in the window with ZCARD.
 * 4. If current count < limit:
 *      - Adds current request timestamp with ZADD.
 *      - Sets TTL (PEXPIRE) to windowMs so inactive keys automatically self-destruct.
 *      - Returns [1, remaining, retryAfterSeconds].
 * 5. If current count >= limit:
 *      - Finds the timestamp of the oldest request in the window with ZRANGE WITHSCORES.
 *      - Calculates exact millisecond duration until that oldest request expires.
 *      - Returns [0, 0, retryAfterSeconds].
 *
 * Atomicity:
 * Because this script executes atomically within Redis, there are zero race conditions
 * even under massive concurrent distributed requests.
 */
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]
local clearBefore = now - window

-- Prune requests outside the current sliding window
redis.call('zremrangebyscore', key, '-inf', clearBefore)

-- Count current requests in the sliding window
local currentRequests = redis.call('zcard', key)

if currentRequests < limit then
    -- Record this request
    redis.call('zadd', key, now, member)
    -- Ensure key self-destructs after the window duration has elapsed
    redis.call('pexpire', key, window)
    local remaining = limit - currentRequests - 1
    local resetInSec = math.ceil(window / 1000)
    return {1, remaining, resetInSec}
else
    -- Limit exceeded: look up oldest request in current window to calculate exact retry duration
    local oldest = redis.call('zrange', key, 0, 0, 'WITHSCORES')
    local oldestScore = tonumber(oldest[2]) or (now - window)
    local retryAfterMs = (oldestScore + window) - now
    if retryAfterMs < 0 then
        retryAfterMs = 0
    end
    local retryAfterSec = math.max(1, math.ceil(retryAfterMs / 1000))
    return {0, 0, retryAfterSec}
end
`;

export interface RateLimiterOptions {
  /**
   * The duration of the sliding window in milliseconds.
   */
  windowMs: number;

  /**
   * The maximum number of requests allowed within the window.
   */
  maxRequests: number;

  /**
   * Logical route identifier / group used as part of the Redis key (e.g., "auth:signin").
   */
  routeIdentifier?: string;

  /**
   * Failure behavior when Redis is unavailable:
   * - true (fail-closed): Rejects requests with HTTP 503 to protect sensitive endpoints from brute-force.
   * - false (fail-open): Allows requests to proceed to preserve service availability for general operations.
   */
  failClosed?: boolean;

  /**
   * Custom error message returned in the 429 response body.
   */
  message?: string;

  /**
   * Optional custom function to determine the client identifier. Defaults to client IP.
   */
  keyGenerator?: (req: Request) => string;

  /**
   * Optional function to skip rate limiting for certain requests (e.g. internal health checks).
   */
  skip?: (req: Request) => boolean;

  /**
   * Optional custom Redis client instance (e.g., for unit/integration tests).
   */
  redisClient?: RedisClientType;
}

/**
 * Safely extracts the real client IP address, honoring Express trust proxy settings
 * and normalizing IPv6 representations.
 */
export function getClientIp(req: Request): string {
  // req.ip is populated by Express when "trust proxy" is properly configured
  let ip = req.ip || req.socket.remoteAddress || "127.0.0.1";

  // Normalize IPv4-mapped IPv6 address (e.g., "::ffff:192.168.1.1" -> "192.168.1.1")
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  // Normalize localhost IPv6
  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  return ip;
}

/**
 * Factory creating an Express middleware for Redis sliding-window rate limiting.
 */
export function rateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    maxRequests,
    routeIdentifier = "general",
    failClosed = false,
    message = "Too many requests. Please try again later.",
    keyGenerator = getClientIp,
    skip,
    redisClient: injectedClient,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check if request should bypass rate limiting
    if (skip && skip(req)) {
      return next();
    }

    const clientIp = keyGenerator(req);
    // Sanitize client identifier to prevent Redis key injection
    const sanitizedClientId = clientIp.replace(/[^a-zA-Z0-9.:_-]/g, "_");
    const redisKey = `${rateLimitConfig.keyPrefix}:${routeIdentifier}:${sanitizedClientId}`;

    const now = Date.now();
    // Unique member token: timestamp + random suffix to prevent collisions on same-ms requests
    const memberId = `${now}:${crypto.randomBytes(4).toString("hex")}`;

    try {
      const client = injectedClient || getRedisClient();

      // Execute atomic sliding window script in Redis
      const result = (await client.eval(
        SLIDING_WINDOW_LUA,
        1,
        redisKey,
        now.toString(),
        windowMs.toString(),
        maxRequests.toString(),
        memberId
      )) as [number, number, number];

      const [allowed, remaining, retryAfterSec] = result;
      const resetTimeSeconds = Math.ceil((now + retryAfterSec * 1000) / 1000);

      // Set standard and legacy rate limit headers
      res.setHeader("RateLimit-Limit", maxRequests);
      res.setHeader("RateLimit-Remaining", remaining);
      res.setHeader("RateLimit-Reset", retryAfterSec);

      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", resetTimeSeconds);

      if (allowed === 1) {
        return next();
      }

      // Client exceeded rate limit
      res.setHeader("Retry-After", retryAfterSec);

      // Secure logging: log client IP, route group, and window. Never log request body, tokens, or credentials.
      console.warn(
        `[RateLimit] Exceeded: IP=${clientIp}, route=${routeIdentifier}, limit=${maxRequests}, window=${windowMs}ms, retryAfter=${retryAfterSec}s`
      );

      res.status(429).json({
        success: false,
        message,
      });
      return;
    } catch (error: any) {
      // Non-sensitive Redis failure logging
      console.error(
        `[RateLimit] Redis error on route="${routeIdentifier}": ${error?.message || error}`
      );

      if (failClosed) {
        // Sensitive route (e.g. auth): fail-closed to prevent credential brute-forcing during outages
        console.warn(
          `[RateLimit] Fail-closed strategy activated for route="${routeIdentifier}". Rejecting request.`
        );
        res.status(503).json({
          success: false,
          message: "Authentication service is temporarily unavailable. Please try again shortly.",
        });
        return;
      }

      // General / AI route: fail-open to preserve API availability
      console.warn(
        `[RateLimit] Fail-open strategy activated for route="${routeIdentifier}". Allowing request.`
      );
      return next();
    }
  };
}
