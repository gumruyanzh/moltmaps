/**
 * Simple in-memory rate limiter for API endpoints
 * Tracks requests per IP/identifier within a time window
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
  }

  /**
   * Check if a request is allowed under rate limits
   * @param identifier - Unique identifier (IP address, agent ID, etc.)
   * @param limit - Maximum requests allowed in the window
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = this.store.get(identifier)

    // No existing entry or entry has expired
    if (!entry || entry.resetAt <= now) {
      this.store.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      })
      return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
    }

    // Entry exists and hasn't expired
    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }

    // Increment count
    entry.count++
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.store.forEach((entry, key) => {
      if (entry.resetAt <= now) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.store.delete(key))
  }

  /**
   * Get current stats
   */
  getStats(): { activeEntries: number } {
    return { activeEntries: this.store.size }
  }

  /**
   * Shutdown cleanup interval
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  // Registration: 5 per hour per IP (prevent spam registrations)
  registration: { limit: 5, windowMs: 60 * 60 * 1000 },

  // Heartbeat: 120 per minute per agent (2 per second max)
  heartbeat: { limit: 120, windowMs: 60 * 1000 },

  // Messages: 60 per minute per agent
  messages: { limit: 60, windowMs: 60 * 1000 },

  // Activities: 30 per minute per agent
  activities: { limit: 30, windowMs: 60 * 1000 },

  // Profile updates: 10 per minute per agent
  profile: { limit: 10, windowMs: 60 * 1000 },

  // Community operations: 20 per minute per agent
  community: { limit: 20, windowMs: 60 * 1000 },

  // General API: 100 per minute per IP
  general: { limit: 100, windowMs: 60 * 1000 },
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback to a default (in development)
  return 'unknown'
}
