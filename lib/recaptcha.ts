// Helper functions for reCAPTCHA verification

interface RecaptchaVerificationResult {
  success: boolean
  score?: number
  action?: string
  hostname?: string
  errorCodes?: string[]
  errorMessage?: string
}

// Verify reCAPTCHA token with Google's API
export async function verifyRecaptchaToken(
  token: string,
  expectedAction?: string,
  minScore = 0.5,
): Promise<RecaptchaVerificationResult> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!secretKey) {
      console.error("Missing RECAPTCHA_SECRET_KEY environment variable")
      return {
        success: false,
        errorMessage: "reCAPTCHA configuration error",
      }
    }

    console.log(`Verifying reCAPTCHA token (first 15 chars): ${token.substring(0, 15)}...`)

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }).toString(),
    })

    const data = await response.json()

    // Log the full response for debugging
    console.log("reCAPTCHA verification response:", JSON.stringify(data, null, 2))

    if (data.success) {
      // For v3, check the score and action
      if (data.score !== undefined) {
        const score = Number.parseFloat(data.score)
        const action = data.action

        console.log(`✅ reCAPTCHA verification successful - Score: ${score}, Action: ${action}`)

        // Check if action matches expected action (if provided)
        if (expectedAction && action !== expectedAction) {
          console.warn(`⚠️ reCAPTCHA action mismatch - Expected: ${expectedAction}, Got: ${action}`)
        }

        // Check if score meets minimum threshold
        if (score < minScore) {
          console.warn(`⚠️ reCAPTCHA score below threshold - Score: ${score}, Minimum: ${minScore}`)
          return {
            success: false,
            score,
            action,
            hostname: data.hostname,
            errorMessage: "Security verification failed due to suspicious activity",
          }
        }

        return {
          success: true,
          score,
          action,
          hostname: data.hostname,
        }
      }

      // For v2, just return success
      return {
        success: true,
        hostname: data.hostname,
      }
    } else {
      console.error("❌ reCAPTCHA verification failed", {
        "error-codes": data["error-codes"],
      })
      return {
        success: false,
        errorCodes: data["error-codes"],
        errorMessage: "Security verification failed",
      }
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA token:", error)
    return {
      success: false,
      errorMessage: "Error verifying security token",
    }
  }
}
