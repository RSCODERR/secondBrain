/**
 * Configuration for distributed API rate limiting across the Second Brain backend.
 * All limits and window durations can be overridden via environment variables.
 */

function parseNumber(envVar: string | undefined, defaultValue: number): number {
  if (!envVar) return defaultValue;
  const parsed = parseInt(envVar, 10);
  return isNaN(parsed) || parsed <= 0 ? defaultValue : parsed;
}

function parseBoolean(envVar: string | undefined, defaultValue: boolean): boolean {
  if (envVar === undefined) return defaultValue;
  return envVar.toLowerCase() === "true" || envVar === "1";
}

export const rateLimitConfig = {
  // Global Redis key namespace prefix
  keyPrefix: process.env.RATE_LIMIT_PREFIX || "rl",

  // 1. Login (POST /api/v1/signin): 10 requests / minute / IP
  login: {
    routeIdentifier: "auth:signin",
    windowMs: parseNumber(process.env.RATE_LIMIT_LOGIN_WINDOW_MS, 60 * 1000), // 1 minute
    maxRequests: parseNumber(process.env.RATE_LIMIT_LOGIN_MAX, 10),
    failClosed: parseBoolean(process.env.RATE_LIMIT_AUTH_FAIL_CLOSED, true),
    message: "Too many sign-in attempts. Please wait a minute and try again.",
  },

  // 2. Signup (POST /api/v1/signup): 5 requests / 10 minutes / IP
  signup: {
    routeIdentifier: "auth:signup",
    windowMs: parseNumber(process.env.RATE_LIMIT_SIGNUP_WINDOW_MS, 10 * 60 * 1000), // 10 minutes
    maxRequests: parseNumber(process.env.RATE_LIMIT_SIGNUP_MAX, 5),
    failClosed: parseBoolean(process.env.RATE_LIMIT_AUTH_FAIL_CLOSED, true),
    message: "Too many account creation attempts. Please wait 10 minutes before trying again.",
  },

  // 3. Forgot Password (POST /api/v1/forgot-password): 5 requests / 10 minutes / IP
  forgotPassword: {
    routeIdentifier: "auth:forgot-password",
    windowMs: parseNumber(process.env.RATE_LIMIT_FORGOT_PW_WINDOW_MS, 10 * 60 * 1000), // 10 minutes
    maxRequests: parseNumber(process.env.RATE_LIMIT_FORGOT_PW_MAX, 5),
    failClosed: parseBoolean(process.env.RATE_LIMIT_AUTH_FAIL_CLOSED, true),
    message: "Too many password reset requests. Please wait 10 minutes before trying again.",
  },

  // 4. Reset Password (POST /api/v1/reset-password): 5 requests / 10 minutes / IP
  resetPassword: {
    routeIdentifier: "auth:reset-password",
    windowMs: parseNumber(process.env.RATE_LIMIT_RESET_PW_WINDOW_MS, 10 * 60 * 1000), // 10 minutes
    maxRequests: parseNumber(process.env.RATE_LIMIT_RESET_PW_MAX, 5),
    failClosed: parseBoolean(process.env.RATE_LIMIT_AUTH_FAIL_CLOSED, true),
    message: "Too many password reset attempts. Please wait 10 minutes before trying again.",
  },

  // 5. AI Endpoints (chat, summarize, suggest-tags, semantic-search): 30 requests / minute / IP
  ai: {
    routeIdentifier: "ai",
    windowMs: parseNumber(process.env.RATE_LIMIT_AI_WINDOW_MS, 60 * 1000), // 1 minute
    maxRequests: parseNumber(process.env.RATE_LIMIT_AI_MAX, 30),
    failClosed: false, // Availability preferred for AI operations
    message: "AI request rate limit reached. Please wait a moment before sending another prompt.",
  },

  // 6. General authenticated API: 100 requests / minute / IP
  general: {
    routeIdentifier: "api:general",
    windowMs: parseNumber(process.env.RATE_LIMIT_GENERAL_WINDOW_MS, 60 * 1000), // 1 minute
    maxRequests: parseNumber(process.env.RATE_LIMIT_GENERAL_MAX, 100),
    failClosed: false, // Availability preferred for standard API operations
    message: "Too many requests. Please try again later.",
  },
};
