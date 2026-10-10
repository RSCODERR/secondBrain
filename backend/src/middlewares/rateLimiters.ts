import { rateLimiter } from "./rateLimiter";
import { rateLimitConfig } from "../config/rateLimit.config";

/**
 * Rate limiter for user login / signin.
 * Limit: 10 requests / minute / IP (Fail-closed on Redis outage)
 */
export const loginRateLimiter = rateLimiter({
  routeIdentifier: rateLimitConfig.login.routeIdentifier,
  windowMs: rateLimitConfig.login.windowMs,
  maxRequests: rateLimitConfig.login.maxRequests,
  failClosed: rateLimitConfig.login.failClosed,
  message: rateLimitConfig.login.message,
});

/**
 * Rate limiter for user signup / registration.
 * Limit: 5 requests / 10 minutes / IP (Fail-closed on Redis outage)
 */
export const signupRateLimiter = rateLimiter({
  routeIdentifier: rateLimitConfig.signup.routeIdentifier,
  windowMs: rateLimitConfig.signup.windowMs,
  maxRequests: rateLimitConfig.signup.maxRequests,
  failClosed: rateLimitConfig.signup.failClosed,
  message: rateLimitConfig.signup.message,
});

/**
 * Rate limiter for requesting a password reset OTP.
 * Limit: 5 requests / 10 minutes / IP (Fail-closed on Redis outage)
 */
export const forgotPasswordRateLimiter = rateLimiter({
  routeIdentifier: rateLimitConfig.forgotPassword.routeIdentifier,
  windowMs: rateLimitConfig.forgotPassword.windowMs,
  maxRequests: rateLimitConfig.forgotPassword.maxRequests,
  failClosed: rateLimitConfig.forgotPassword.failClosed,
  message: rateLimitConfig.forgotPassword.message,
});

/**
 * Rate limiter for completing a password reset OTP validation.
 * Limit: 5 requests / 10 minutes / IP (Fail-closed on Redis outage)
 */
export const resetPasswordRateLimiter = rateLimiter({
  routeIdentifier: rateLimitConfig.resetPassword.routeIdentifier,
  windowMs: rateLimitConfig.resetPassword.windowMs,
  maxRequests: rateLimitConfig.resetPassword.maxRequests,
  failClosed: rateLimitConfig.resetPassword.failClosed,
  message: rateLimitConfig.resetPassword.message,
});

/**
 * Rate limiter for resource-intensive AI operations:
 * (POST /api/v1/ai/chat, /summarize, /suggest-tags, /semantic-search)
 * Limit: 30 requests / minute / IP (Fail-open on Redis outage)
 */
export const aiRateLimiter = rateLimiter({
  routeIdentifier: rateLimitConfig.ai.routeIdentifier,
  windowMs: rateLimitConfig.ai.windowMs,
  maxRequests: rateLimitConfig.ai.maxRequests,
  failClosed: rateLimitConfig.ai.failClosed,
  message: rateLimitConfig.ai.message,
});

/**
 * General rate limiter for standard authenticated API endpoints.
 * Limit: 100 requests / minute / IP (Fail-open on Redis outage)
 */
export const generalRateLimiter = rateLimiter({
  routeIdentifier: rateLimitConfig.general.routeIdentifier,
  windowMs: rateLimitConfig.general.windowMs,
  maxRequests: rateLimitConfig.general.maxRequests,
  failClosed: rateLimitConfig.general.failClosed,
  message: rateLimitConfig.general.message,
});
