import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import express from "express";
import request from "supertest";
import RedisMock from "ioredis-mock";
import { rateLimiter } from "../middlewares/rateLimiter";

describe("Production Rate Limiting System (Redis Sliding Window)", () => {
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = new RedisMock();
  });

  // 1. Requests below the limit
  it("allows requests below the configured limit and decrements remaining quota", async () => {
    const app = express();
    app.use(
      rateLimiter({
        windowMs: 60000,
        maxRequests: 3,
        routeIdentifier: "test:below-limit",
        redisClient: mockRedis,
      })
    );
    app.get("/test", (_req, res) => res.json({ success: true }));

    const res1 = await request(app).get("/test");
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.headers["ratelimit-remaining"], "2");

    const res2 = await request(app).get("/test");
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.headers["ratelimit-remaining"], "1");
  });

  // 2. Request exactly at the limit
  it("allows request exactly at the limit with remaining quota 0", async () => {
    const app = express();
    app.use(
      rateLimiter({
        windowMs: 60000,
        maxRequests: 3,
        routeIdentifier: "test:at-limit",
        redisClient: mockRedis,
      })
    );
    app.get("/test", (_req, res) => res.json({ success: true }));

    await request(app).get("/test");
    await request(app).get("/test");
    const res3 = await request(app).get("/test");

    assert.strictEqual(res3.status, 200);
    assert.strictEqual(res3.headers["ratelimit-remaining"], "0");
    assert.strictEqual(res3.headers["ratelimit-limit"], "3");
  });

  // 3. Request exceeding the limit
  it("blocks requests exceeding the limit with 429, Retry-After header, and clean JSON", async () => {
    const app = express();
    app.use(
      rateLimiter({
        windowMs: 60000,
        maxRequests: 2,
        routeIdentifier: "test:exceed",
        redisClient: mockRedis,
        message: "Too many requests. Please try again later.",
      })
    );
    app.get("/test", (_req, res) => res.json({ success: true }));

    await request(app).get("/test");
    await request(app).get("/test");

    const resBlocked = await request(app).get("/test");

    assert.strictEqual(resBlocked.status, 429);
    assert.strictEqual(resBlocked.body.success, false);
    assert.strictEqual(resBlocked.body.message, "Too many requests. Please try again later.");
    assert.ok(resBlocked.headers["retry-after"], "Retry-After header should be present");
    assert.strictEqual(resBlocked.headers["ratelimit-remaining"], "0");
  });

  // 4. Counter expiration
  it("resets quota after sliding window duration expires", async () => {
    const app = express();
    const shortWindowMs = 200; // 200ms window for test speed
    app.use(
      rateLimiter({
        windowMs: shortWindowMs,
        maxRequests: 1,
        routeIdentifier: "test:expiration",
        redisClient: mockRedis,
      })
    );
    app.get("/test", (_req, res) => res.json({ success: true }));

    const res1 = await request(app).get("/test");
    assert.strictEqual(res1.status, 200);

    const res2 = await request(app).get("/test");
    assert.strictEqual(res2.status, 429);

    // Wait for the sliding window to elapse
    await new Promise((resolve) => setTimeout(resolve, 250));

    const res3 = await request(app).get("/test");
    assert.strictEqual(res3.status, 200);
    assert.strictEqual(res3.body.success, true);
  });

  // 5. Different IP addresses
  it("tracks rate limits independently for different client IPs", async () => {
    const app = express();
    app.set("trust proxy", true);
    app.use(
      rateLimiter({
        windowMs: 60000,
        maxRequests: 1,
        routeIdentifier: "test:multi-ip",
        redisClient: mockRedis,
      })
    );
    app.get("/test", (_req, res) => res.json({ success: true }));

    // IP A hits limit
    const resA1 = await request(app).get("/test").set("X-Forwarded-For", "203.0.113.1");
    assert.strictEqual(resA1.status, 200);

    const resA2 = await request(app).get("/test").set("X-Forwarded-For", "203.0.113.1");
    assert.strictEqual(resA2.status, 429);

    // IP B makes a request - should NOT be blocked
    const resB = await request(app).get("/test").set("X-Forwarded-For", "203.0.113.2");
    assert.strictEqual(resB.status, 200);
    assert.strictEqual(resB.body.success, true);
  });

  // 6. Different endpoint limits
  it("maintains isolated rate limits across different routes/endpoint groups", async () => {
    const app = express();
    const loginLimiter = rateLimiter({
      windowMs: 60000,
      maxRequests: 1,
      routeIdentifier: "auth:login",
      redisClient: mockRedis,
    });
    const generalLimiter = rateLimiter({
      windowMs: 60000,
      maxRequests: 5,
      routeIdentifier: "api:general",
      redisClient: mockRedis,
    });

    app.post("/login", loginLimiter, (_req, res) => res.json({ msg: "logged in" }));
    app.get("/content", generalLimiter, (_req, res) => res.json({ msg: "content" }));

    // Exhaust login limit
    const login1 = await request(app).post("/login");
    assert.strictEqual(login1.status, 200);
    const login2 = await request(app).post("/login");
    assert.strictEqual(login2.status, 429);

    // General route remains unaffected
    const contentRes = await request(app).get("/content");
    assert.strictEqual(contentRes.status, 200);
    assert.strictEqual(contentRes.body.msg, "content");
  });

  // 7. Redis failure: Fail-Open vs Fail-Closed
  it("fails open for general endpoints and fails closed for sensitive auth endpoints when Redis errors", async () => {
    // Failing Redis mock that simulates connection drop / timeout
    const failingRedis: any = {
      eval: async () => {
        throw new Error("Redis connection timeout [SIMULATED]");
      },
    };

    const app = express();

    // General route (failClosed: false)
    app.get(
      "/api/data",
      rateLimiter({
        windowMs: 60000,
        maxRequests: 10,
        routeIdentifier: "api:data",
        failClosed: false,
        redisClient: failingRedis,
      }),
      (_req, res) => res.json({ success: true, message: "General data accessible" })
    );

    // Sensitive auth route (failClosed: true)
    app.post(
      "/api/auth/login",
      rateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        routeIdentifier: "auth:login",
        failClosed: true,
        redisClient: failingRedis,
      }),
      (_req, res) => res.json({ success: true })
    );

    // General route should FAIL OPEN to maintain service availability
    const generalRes = await request(app).get("/api/data");
    assert.strictEqual(generalRes.status, 200);
    assert.strictEqual(generalRes.body.success, true);

    // Sensitive auth route should FAIL CLOSED to prevent brute-force attacks during Redis outage
    const authRes = await request(app).post("/api/auth/login");
    assert.strictEqual(authRes.status, 503);
    assert.strictEqual(authRes.body.success, false);
    assert.match(authRes.body.message, /temporarily unavailable/i);
  });

  // 8. Concurrent requests safety (Atomic Lua execution)
  it("handles high-concurrency requests safely without race conditions or counter overshooting", async () => {
    const app = express();
    const limit = 5;
    app.use(
      rateLimiter({
        windowMs: 60000,
        maxRequests: limit,
        routeIdentifier: "test:concurrency",
        redisClient: mockRedis,
      })
    );
    app.get("/concurrent", (_req, res) => res.json({ success: true }));

    // Send 15 concurrent requests simultaneously
    const totalRequests = 15;
    const requests = Array.from({ length: totalRequests }, () =>
      request(app).get("/concurrent")
    );

    const responses = await Promise.all(requests);

    const allowedResponses = responses.filter((r) => r.status === 200);
    const blockedResponses = responses.filter((r) => r.status === 429);

    assert.strictEqual(
      allowedResponses.length,
      limit,
      `Exactly ${limit} requests should be allowed under concurrency`
    );
    assert.strictEqual(
      blockedResponses.length,
      totalRequests - limit,
      `Exactly ${totalRequests - limit} requests should be blocked (429)`
    );
  });
});
