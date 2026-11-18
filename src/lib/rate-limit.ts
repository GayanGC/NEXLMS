interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store for tracking IP request counts
const ipStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired entries every 2 minutes
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipStore.entries()) {
      if (now > record.resetAt) {
        ipStore.delete(key);
      }
    }
  }, 2 * 60 * 1000);
  if (timer && typeof timer.unref === "function") {
    timer.unref();
  }
}

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 5 minutes)
  max?: number;      // Maximum allowed requests per window (default: 10)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

/**
 * Checks if a given identifier (e.g. client IP) has exceeded the rate limit.
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const windowMs = options.windowMs ?? 5 * 60 * 1000; // 5 minutes default
  const max = options.max ?? 10;                     // 10 requests default
  const now = Date.now();

  const record = ipStore.get(identifier);

  // If no record exists or previous window has expired, create fresh record
  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    ipStore.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit: max,
      remaining: max - 1,
      resetAt,
    };
  }

  // If current count is under the limit, increment
  if (record.count < max) {
    record.count += 1;
    return {
      success: true,
      limit: max,
      remaining: max - record.count,
      resetAt: record.resetAt,
    };
  }

  // Rate limit exceeded
  const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
  return {
    success: false,
    limit: max,
    remaining: 0,
    resetAt: record.resetAt,
    retryAfterSeconds: Math.max(1, retryAfterSeconds),
  };
}

/**
 * Helper to extract client IP from Next.js request headers
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
