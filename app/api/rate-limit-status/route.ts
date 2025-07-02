import { type NextRequest, NextResponse } from "next/server"
import { rateLimiter, getClientIP, hashIP } from "@/lib/rate-limit"
import { hasSubmissionCookie, deleteSubmissionCookie } from "@/lib/cookies"

// API endpoint to check rate limit status
export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const hashedIP = hashIP(clientIP)

    // Check for cookie
    const cookieCheck = hasSubmissionCookie()

    const status = rateLimiter.getStatus(hashedIP)
    const rateLimitResult = rateLimiter.check(hashedIP, cookieCheck.value)

    // If we have a cookie but no IP match, check if the cookie exists in the system
    let cookieMatch = { found: false, ip: null }
    if (cookieCheck.exists && cookieCheck.value) {
      const match = rateLimiter.findByCookieValue(cookieCheck.value)
      if (match.found) {
        cookieMatch = {
          found: true,
          ip: match.ip,
        }
      }
    }

    return NextResponse.json({
      ip: hashedIP,
      status: {
        hasSubmitted: status.hasSubmitted,
        submissionTime: status.submissionTime ? new Date(status.submissionTime).toISOString() : null,
        nextAllowedTime: status.nextAllowedTime ? new Date(status.nextAllowedTime).toISOString() : null,
        remainingDays: status.remainingDays || 0,
        uniqueId: status.uniqueId,
      },
      cookie: {
        exists: cookieCheck.exists,
        value: cookieCheck.value ? cookieCheck.value.substring(0, 10) + "..." : null,
        matchesOtherIP: cookieMatch.found && cookieMatch.ip !== hashedIP,
        matchedIP: cookieMatch.found ? cookieMatch.ip : null,
      },
      rateLimitCheck: {
        allowed: rateLimitResult.allowed,
        error: rateLimitResult.error,
        nextAllowedTime: rateLimitResult.nextAllowedTime
          ? new Date(rateLimitResult.nextAllowedTime).toISOString()
          : null,
      },
      storeSize: rateLimiter.getStoreSize(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to check rate limit status" }, { status: 500 })
  }
}

// Admin endpoint to reset rate limit for an IP
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetIP = searchParams.get("ip")
    const clearCookie = searchParams.get("clearCookie") === "true"

    if (!targetIP) {
      return NextResponse.json({ error: "IP parameter is required" }, { status: 400 })
    }

    // In production, you'd want to add authentication here
    const existed = rateLimiter.reset(targetIP)

    // Also clear the cookie if requested
    if (clearCookie) {
      deleteSubmissionCookie()
    }

    return NextResponse.json({
      success: true,
      message: `Rate limit ${existed ? "reset" : "was not set"} for IP: ${targetIP}`,
      cookieCleared: clearCookie,
      existed,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to reset rate limit" }, { status: 500 })
  }
}

// Admin endpoint to get all active blocks
export async function POST(request: NextRequest) {
  try {
    // In production, add authentication here
    const blocks = rateLimiter.getAllBlocks()

    return NextResponse.json({
      totalBlocks: blocks.length,
      blocks: blocks.map((block) => ({
        ip: block.ip,
        submissionTime: new Date(block.submissionTime).toISOString(),
        nextAllowedTime: new Date(block.nextAllowedTime).toISOString(),
        remainingDays: Math.ceil((block.nextAllowedTime - Date.now()) / (24 * 60 * 60 * 1000)),
        uniqueId: block.uniqueId,
      })),
      storeSize: rateLimiter.getStoreSize(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get blocks" }, { status: 500 })
  }
}
