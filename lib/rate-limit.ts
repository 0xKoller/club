// Strict rate limiting: 1 submission per IP, 2-month cooldown
// No retries allowed, with additional cookie-based verification

interface RateLimitEntry {
  submissionTime: number
  blocked: boolean
  uniqueId?: string // Store a unique ID that matches the cookie
}

class StrictRateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private readonly cooldownMs: number

  constructor(cooldownMs = 60 * 24 * 60 * 60 * 1000) {
    // 60 days in milliseconds
    this.cooldownMs = cooldownMs

    // Clean up old entries every 24 hours
    setInterval(() => this.cleanup(), 24 * 60 * 60 * 1000)
  }

  check(identifier: string, cookieValue?: string): { allowed: boolean; error?: string; nextAllowedTime?: number } {
    const now = Date.now()
    const entry = this.store.get(identifier)

    // If no entry exists, submission is allowed
    if (!entry) {
      // But first check if the cookie exists and matches another IP
      if (cookieValue) {
        // Look for any entry with this cookie value
        for (const [storedIp, storedEntry] of this.store.entries()) {
          if (storedEntry.uniqueId === cookieValue) {
            // Found a match - this user has submitted from another IP
            const nextAllowedTime = storedEntry.submissionTime + this.cooldownMs
            if (now < nextAllowedTime) {
              const remainingTime = nextAllowedTime - now
              const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000))
              const nextAllowedDate = new Date(nextAllowedTime).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })

              return {
                allowed: false,
                error: `Only one application is allowed per person. You can submit another application after ${nextAllowedDate} (${remainingDays} day${remainingDays !== 1 ? "s" : ""} remaining).`,
                nextAllowedTime,
              }
            }
          }
        }
      }

      return {
        allowed: true,
      }
    }

    // Check if cooldown period has passed
    const nextAllowedTime = entry.submissionTime + this.cooldownMs
    if (now >= nextAllowedTime) {
      // Cooldown has expired, remove the entry and allow submission
      this.store.delete(identifier)
      return {
        allowed: true,
      }
    }

    // Still in cooldown period
    const remainingTime = nextAllowedTime - now
    const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000))
    const nextAllowedDate = new Date(nextAllowedTime).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return {
      allowed: false,
      error: `Only one application is allowed per person. You can submit another application after ${nextAllowedDate} (${remainingDays} day${remainingDays !== 1 ? "s" : ""} remaining).`,
      nextAllowedTime,
    }
  }

  // Record a submission (call this after successful submission)
  recordSubmission(identifier: string): string {
    const now = Date.now()
    // Generate a unique ID for this submission (for cookie tracking)
    const uniqueId = `${identifier}_${now}_${Math.random().toString(36).substring(2, 15)}`

    this.store.set(identifier, {
      submissionTime: now,
      blocked: true,
      uniqueId,
    })

    console.log(
      `Recorded submission for IP: ${identifier}, next allowed: ${new Date(now + this.cooldownMs).toISOString()}, uniqueId: ${uniqueId}`,
    )

    return uniqueId
  }

  // Clean up entries that are past their cooldown period
  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.submissionTime + this.cooldownMs) {
        this.store.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired rate limit entries`)
    }
  }

  // Get current status for an identifier (useful for debugging)
  getStatus(identifier: string): {
    hasSubmitted: boolean
    submissionTime?: number
    nextAllowedTime?: number
    remainingDays?: number
    uniqueId?: string
  } {
    const entry = this.store.get(identifier)

    if (!entry) {
      return { hasSubmitted: false }
    }

    const now = Date.now()
    const nextAllowedTime = entry.submissionTime + this.cooldownMs
    const remainingTime = Math.max(0, nextAllowedTime - now)
    const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000))

    return {
      hasSubmitted: true,
      submissionTime: entry.submissionTime,
      nextAllowedTime,
      remainingDays: remainingTime > 0 ? remainingDays : 0,
      uniqueId: entry.uniqueId,
    }
  }

  // Reset rate limit for a specific identifier (admin use only)
  reset(identifier: string): boolean {
    const existed = this.store.has(identifier)
    this.store.delete(identifier)
    return existed
  }

  // Get store size (useful for monitoring)
  getStoreSize(): number {
    return this.store.size
  }

  // Get all active blocks (admin use)
  getAllBlocks(): Array<{ ip: string; submissionTime: number; nextAllowedTime: number; uniqueId?: string }> {
    const now = Date.now()
    const blocks: Array<{ ip: string; submissionTime: number; nextAllowedTime: number; uniqueId?: string }> = []

    for (const [ip, entry] of this.store.entries()) {
      const nextAllowedTime = entry.submissionTime + this.cooldownMs
      if (now < nextAllowedTime) {
        blocks.push({
          ip,
          submissionTime: entry.submissionTime,
          nextAllowedTime,
          uniqueId: entry.uniqueId,
        })
      }
    }

    return blocks.sort((a, b) => a.nextAllowedTime - b.nextAllowedTime)
  }

  // Find entry by cookie value
  findByCookieValue(cookieValue: string): { found: boolean; ip?: string; entry?: RateLimitEntry } {
    for (const [ip, entry] of this.store.entries()) {
      if (entry.uniqueId === cookieValue) {
        return { found: true, ip, entry }
      }
    }
    return { found: false }
  }
}

// Create a singleton instance with 2-month (60 days) cooldown
export const rateLimiter = new StrictRateLimiter(
  60 * 24 * 60 * 60 * 1000, // 60 days in milliseconds
)

// Helper function to get client IP from request headers
export function getClientIP(request: Request): string {
  // Try to get IP from various headers (for different hosting environments)
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfConnectingIP = request.headers.get("cf-connecting-ip") // Cloudflare
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for") // Vercel

  // Parse forwarded-for header (can contain multiple IPs)
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim())
    return ips[0] // Return the first (original client) IP
  }

  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim()
  }

  if (cfConnectingIP) {
    return cfConnectingIP
  }

  if (realIP) {
    return realIP
  }

  // Fallback (though this shouldn't happen in production)
  return "unknown"
}

// Helper function to hash IP for privacy (optional)
export function hashIP(ip: string): string {
  // Simple hash function for IP privacy
  // In production, you might want to use a proper hashing library
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}
