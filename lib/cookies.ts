import { cookies } from "next/headers"
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"

// Cookie name for submission tracking
const SUBMISSION_COOKIE_NAME = "on_club_submission"

// Set a submission cookie that expires in 2 months
export function setSubmissionCookie(uniqueId: string): void {
  // Calculate expiration date (2 months from now)
  const twoMonthsFromNow = new Date()
  twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)

  const cookieOptions: Partial<ResponseCookie> = {
    name: SUBMISSION_COOKIE_NAME,
    value: uniqueId,
    expires: twoMonthsFromNow,
    httpOnly: true, // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    path: "/",
    sameSite: "strict",
  }

  cookies().set(cookieOptions)
}

// Check if submission cookie exists
export function hasSubmissionCookie(): { exists: boolean; value?: string } {
  const submissionCookie = cookies().get(SUBMISSION_COOKIE_NAME)

  if (!submissionCookie) {
    return { exists: false }
  }

  return {
    exists: true,
    value: submissionCookie.value,
  }
}

// Get the submission cookie value
export function getSubmissionCookie(): string | undefined {
  return cookies().get(SUBMISSION_COOKIE_NAME)?.value
}

// Delete the submission cookie (for admin use)
export function deleteSubmissionCookie(): void {
  cookies().delete(SUBMISSION_COOKIE_NAME)
}
