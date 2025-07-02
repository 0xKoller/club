"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { rateLimiter, getClientIP, hashIP } from "@/lib/rate-limit"
import { headers } from "next/headers"
import { hasSubmissionCookie, setSubmissionCookie } from "@/lib/cookies"
import {
  analyzeFormTiming,
  analyzeInteractions,
  analyzeUserAgent,
  validateMathChallenge,
  type FormTimingData,
  type InteractionData,
} from "@/lib/bot-detection"
import { verifyRecaptchaToken } from "@/lib/recaptcha"

export async function submitApplication(formData: FormData) {
  try {
    console.log("=== Starting application submission ===")

    // Get client IP for rate limiting
    const headersList = headers()
    const request = new Request("http://localhost", {
      headers: headersList,
    })

    const clientIP = getClientIP(request)
    const hashedIP = hashIP(clientIP) // Hash IP for privacy
    const userAgent = headersList.get("user-agent") || ""

    console.log("Client IP (hashed):", hashedIP)

    // Verify reCAPTCHA token
    const recaptchaToken = formData.get("recaptchaToken") as string
    if (!recaptchaToken) {
      console.log("❌ Missing reCAPTCHA token")
      return {
        success: false,
        error: "Security verification failed. Please ensure JavaScript is enabled and try again.",
      }
    }

    console.log("Verifying reCAPTCHA token...")
    const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, "application_submit", 0.5)

    if (!recaptchaResult.success) {
      console.log(`❌ reCAPTCHA verification failed: ${recaptchaResult.errorMessage}`)

      // If we have a score, it means verification worked but score was too low
      if (recaptchaResult.score !== undefined) {
        console.log(`reCAPTCHA score: ${recaptchaResult.score} (below threshold)`)

        // For low scores, we might want to show a different message or require additional verification
        if (recaptchaResult.score < 0.3) {
          return {
            success: false,
            error: "Our systems have detected unusual activity. Please try again later or contact support.",
            botDetected: true,
          }
        } else {
          // For borderline scores, we might want to proceed but with additional verification
          console.log("Borderline reCAPTCHA score - proceeding with additional verification")
          // Continue with additional verification steps below
        }
      } else {
        // Technical failure in verification
        return {
          success: false,
          error: recaptchaResult.errorMessage || "Security verification failed. Please try again.",
        }
      }
    } else {
      console.log(`✅ reCAPTCHA verification successful with score: ${recaptchaResult.score}`)

      // For high scores, we might want to skip some additional verification
      if (recaptchaResult.score && recaptchaResult.score > 0.8) {
        console.log("High reCAPTCHA score - skipping some additional verification")
        // Could skip math challenge or other verification steps
      }
    }

    // Bot detection analysis
    console.log("=== BOT DETECTION ANALYSIS ===")

    // 1. User Agent Analysis
    const userAgentAnalysis = analyzeUserAgent(userAgent)
    console.log("User Agent Analysis:", userAgentAnalysis)

    // 2. Interaction Data Analysis
    const interactionDataStr = formData.get("interactionData") as string
    let interactionAnalysis = { suspicious: false, reasons: [] as string[] }

    if (interactionDataStr) {
      try {
        const interactionData: InteractionData = JSON.parse(interactionDataStr)
        interactionAnalysis = analyzeInteractions(interactionData)
        console.log("Interaction Analysis:", interactionAnalysis)

        // 3. Timing Analysis
        const now = Date.now()
        const timingData: FormTimingData = {
          pageLoadTime: interactionData.pageLoadTime,
          firstInteractionTime: interactionData.firstInteractionTime || now,
          submitTime: interactionData.submitTime || now,
          totalTimeOnPage: now - interactionData.pageLoadTime,
          timeToFirstInput: (interactionData.firstInteractionTime || now) - interactionData.pageLoadTime,
          timeToSubmit: (interactionData.submitTime || now) - interactionData.pageLoadTime,
        }

        const timingAnalysis = analyzeFormTiming(timingData)
        console.log("Timing Analysis:", timingAnalysis)

        // Combine all bot detection results
        const allReasons = [...userAgentAnalysis.reasons, ...interactionAnalysis.reasons, ...timingAnalysis.reasons]

        if (allReasons.length > 0) {
          console.log("🚨 Bot detection triggered:", allReasons)

          // For now, just log but don't block (you can change this behavior)
          if (userAgentAnalysis.suspicious || (interactionAnalysis.suspicious && timingAnalysis.suspicious)) {
            // If reCAPTCHA score is also low, this is a strong signal of bot activity
            if (recaptchaResult.score && recaptchaResult.score < 0.4) {
              return {
                success: false,
                error: "Security verification failed. Please try again with a standard web browser.",
                botDetected: true,
              }
            }
          }
        }
      } catch (error) {
        console.error("Error parsing interaction data:", error)
      }
    }

    // 4. Math Challenge Validation
    const mathChallengeAnswer = formData.get("mathChallenge") as string
    const correctAnswer = formData.get("mathChallengeAnswer") as string

    if (correctAnswer) {
      const isValidMath = validateMathChallenge(mathChallengeAnswer, Number.parseInt(correctAnswer, 10))
      if (!isValidMath) {
        console.log("❌ Math challenge failed")
        return {
          success: false,
          error: "Security question answer is incorrect. Please try again.",
        }
      }
      console.log("✅ Math challenge passed")
    }

    // Check for existing submission cookie
    const cookieCheck = hasSubmissionCookie()
    console.log("Submission cookie check:", cookieCheck.exists ? "Found" : "Not found")

    // Check rate limit before processing the form
    // Pass the cookie value if it exists for cross-IP checking
    const rateLimitResult = rateLimiter.check(hashedIP, cookieCheck.value)

    console.log("Rate limit check:", {
      allowed: rateLimitResult.allowed,
      nextAllowedTime: rateLimitResult.nextAllowedTime ? new Date(rateLimitResult.nextAllowedTime).toISOString() : null,
    })

    if (!rateLimitResult.allowed) {
      console.log("❌ Rate limit detected for IP:", hashedIP)
      // Instead of returning an error, return success to show the success screen
      return {
        success: true,
        alreadySubmitted: true,
      }
    }

    // Extract and validate form data with detailed logging
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const twitter = formData.get("twitter") as string
    const linkedin = formData.get("linkedin") as string
    const additionalInfo = formData.get("additionalInfo") as string

    console.log("=== DETAILED FIELD VALIDATION ===")
    console.log("Raw form data:")
    console.log("- fullName:", `"${fullName}"`, "length:", fullName?.length || 0)
    console.log("- email:", `"${email}"`, "length:", email?.length || 0)
    console.log("- twitter:", `"${twitter}"`, "length:", twitter?.length || 0)
    console.log("- linkedin:", `"${linkedin}"`, "length:", linkedin?.length || 0)
    console.log("- additionalInfo:", `"${additionalInfo}"`, "length:", additionalInfo?.length || 0)

    // Detailed field validation with specific error messages
    const validationErrors: string[] = []

    // Full name validation
    if (!fullName || fullName.trim().length === 0) {
      validationErrors.push("Full name is missing or empty")
      console.log("❌ Full name validation failed")
    } else {
      console.log("✅ Full name validation passed")
    }

    // Email validation - use a more permissive regex that matches the database constraint
    if (!email || email.trim().length === 0) {
      validationErrors.push("Email is missing or empty")
      console.log("❌ Email validation failed - missing")
    } else {
      // More permissive email regex that matches the database constraint
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(email.trim())) {
        validationErrors.push("Email format is invalid")
        console.log("❌ Email validation failed - invalid format:", email)
        console.log("Email regex test result:", emailRegex.test(email.trim()))
      } else {
        console.log("✅ Email validation passed")
      }
    }

    // Twitter validation
    if (!twitter || twitter.trim().length === 0) {
      validationErrors.push("X handle is missing or empty")
      console.log("❌ Twitter validation failed")
    } else {
      console.log("✅ Twitter validation passed")
    }

    // Additional info validation
    if (!additionalInfo || additionalInfo.trim().length === 0) {
      validationErrors.push("Achievement description is missing or empty")
      console.log("❌ Additional info validation failed")
    } else {
      console.log("✅ Additional info validation passed")
    }

    console.log("=== VALIDATION SUMMARY ===")
    console.log("Total validation errors:", validationErrors.length)
    if (validationErrors.length > 0) {
      console.log("Specific errors:", validationErrors)
      return {
        success: false,
        error: `Validation failed: ${validationErrors.join(", ")}`,
      }
    }

    console.log("All validations passed, proceeding with submission...")

    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables")
      return {
        success: false,
        error: "Server configuration error. Please contact support.",
      }
    }

    console.log("Environment variables present:", {
      url: supabaseUrl ? "✓" : "✗",
      key: supabaseKey ? "✓" : "✗",
    })

    try {
      // Initialize Supabase client
      console.log("Creating Supabase client...")
      const supabase = createServerSupabaseClient()

      if (!supabase) {
        throw new Error("Failed to create Supabase client")
      }

      console.log("Supabase client created successfully")

      // Test connection by checking if table exists
      console.log("Testing database connection...")
      const { data: tableCheck, error: tableError } = await supabase.from("applications").select("count").limit(1)

      if (tableError) {
        console.error("Table check failed:", {
          code: tableError.code,
          message: tableError.message,
          details: tableError.details,
          hint: tableError.hint,
        })

        if (tableError.code === "42P01") {
          return {
            success: false,
            error: "Database table not found. Please run the setup script first.",
          }
        }

        throw tableError
      }

      console.log("Database connection successful")

      // Clean and prepare application data
      const cleanEmail = email.trim().toLowerCase()
      const cleanTwitter = twitter.trim().replace(/^@/, "") // Remove @ if present
      const cleanLinkedin = linkedin?.trim() || null

      // Prepare application data with exact column names
      const applicationData = {
        full_name: fullName.trim(),
        email: cleanEmail,
        twitter_handle: cleanTwitter,
        linkedin_url: cleanLinkedin,
        additional_info: additionalInfo.trim(),
        status: "pending" as const,
      }

      console.log("Prepared application data:", {
        full_name: applicationData.full_name,
        email: applicationData.email.substring(0, 3) + "***", // Mask email for logging
        twitter_handle: applicationData.twitter_handle,
        linkedin_url: applicationData.linkedin_url ? "provided" : "null",
        additional_info: applicationData.additional_info.substring(0, 50) + "...",
        status: applicationData.status,
      })

      // Validate email format one more time before database insertion
      const dbEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!dbEmailRegex.test(cleanEmail)) {
        console.error("Email failed final validation:", cleanEmail)
        return {
          success: false,
          error: "Email format is not valid. Please check your email address.",
        }
      }

      // Check for existing email with more detailed logging
      console.log("Checking for duplicate email...")
      const { data: existingApp, error: checkError } = await supabase
        .from("applications")
        .select("id, email, created_at, status")
        .eq("email", cleanEmail)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows found (which is good)
        console.error("Error checking for duplicate email:", checkError)
        throw checkError
      }

      if (existingApp) {
        console.log("Duplicate email found:", {
          id: existingApp.id,
          email: existingApp.email?.substring(0, 3) + "***",
          created_at: existingApp.created_at,
          status: existingApp.status,
        })
        return {
          success: false,
          error:
            "This email address has already been used to submit an application. Each person can only submit one application.",
        }
      }

      console.log("✅ No duplicate email found, proceeding with insert...")

      // Insert application into Supabase
      const { data, error } = await supabase.from("applications").insert(applicationData).select()

      if (error) {
        console.error("Insert error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error,
        })

        // Handle specific error codes
        if (error.code === "23505") {
          // Unique constraint violation - likely duplicate email
          if (error.message.includes("email")) {
            return {
              success: false,
              error:
                "This email address has already been used to submit an application. Each person can only submit one application.",
            }
          }
          return {
            success: false,
            error: "An application with this information already exists.",
          }
        }

        if (error.code === "23514") {
          // Check constraint violation
          if (error.message.includes("email")) {
            return {
              success: false,
              error: "Email format is not valid. Please use a standard email format like user@domain.com",
            }
          }
          return {
            success: false,
            error: "Invalid data format. Please check your inputs and try again.",
          }
        }

        if (error.code === "42501") {
          return {
            success: false,
            error: "Database permission error. Please contact support.",
          }
        }

        // Generic error with more helpful message
        return {
          success: false,
          error: `Database error: ${error.message}. Please check your inputs and try again.`,
        }
      }

      if (!data || data.length === 0) {
        console.error("No data returned from insert operation")
        return {
          success: false,
          error: "Failed to save application. Please try again.",
        }
      }

      console.log("Application inserted successfully:", {
        id: data[0].id,
        email: data[0].email?.substring(0, 3) + "***",
        created_at: data[0].created_at,
      })

      // Verify the data was actually saved by reading it back
      console.log("Verifying data was saved...")
      const { data: initialVerifyData, error: initialVerifyError } = await supabase
        .from("applications")
        .select("*")
        .eq("id", data[0].id)
        .single()

      if (initialVerifyError) {
        console.error("Verification failed:", initialVerifyError)
      } else {
        console.log("Data verification successful:", {
          id: initialVerifyData.id,
          email: initialVerifyData.email?.substring(0, 3) + "***",
        })
      }

      // Send data to n8n webhook after successful Supabase insertion
      console.log("=== WEBHOOK INTEGRATION ===")
      try {
        const webhookUrl =
          "https://primary-production-6d624.up.railway.app/webhook/23afb99c-536e-4b31-8a32-2aaf551247f8"

        // Prepare webhook payload with the saved data
        const webhookPayload = {
          id: data[0].id,
          created_at: data[0].created_at,
          full_name: data[0].full_name,
          email: data[0].email,
          twitter_handle: data[0].twitter_handle,
          linkedin_url: data[0].linkedin_url || "", // Always send linkedin_url, empty string if null
          additional_info: data[0].additional_info,
          status: data[0].status,
          // Additional metadata
          submission_source: "on_club_application",
          timestamp: new Date().toISOString(),
          client_ip: hashedIP,
        }

        console.log("Sending data to n8n webhook:", {
          url: webhookUrl,
          payload: {
            ...webhookPayload,
            email: webhookPayload.email?.substring(0, 3) + "***", // Mask email for logging
            full_name: webhookPayload.full_name?.substring(0, 3) + "***", // Mask name for logging
          },
        })

        // Create URL with query parameters for GET request
        const webhookUrlWithParams = new URL(webhookUrl)

        // Add all payload data as query parameters
        Object.entries(webhookPayload).forEach(([key, value]) => {
          // Always add the parameter, even if value is null, undefined, or empty string
          webhookUrlWithParams.searchParams.append(key, value !== null && value !== undefined ? String(value) : "")
        })

        // Send GET request to n8n webhook with timeout and retry logic
        const webhookResponse = await fetch(webhookUrlWithParams.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "ON-Club-Application/1.0",
            "X-Source": "supabase-integration",
          },
          // Add timeout (10 seconds)
          signal: AbortSignal.timeout(10000),
        })

        if (webhookResponse.ok) {
          const responseText = await webhookResponse.text()
          console.log("✅ Webhook sent successfully:", {
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
            response: responseText?.substring(0, 200) + (responseText?.length > 200 ? "..." : ""),
          })
        } else {
          console.warn("⚠️ Webhook request failed:", {
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
            url: webhookUrl,
          })

          // Try to get error response
          try {
            const errorText = await webhookResponse.text()
            console.warn("Webhook error response:", errorText?.substring(0, 500))
          } catch (textError) {
            console.warn("Could not read webhook error response:", textError)
          }
        }
      } catch (webhookError: any) {
        // Log webhook errors but don't fail the application submission
        console.error("❌ Webhook integration failed:", {
          name: webhookError?.name,
          message: webhookError?.message,
          code: webhookError?.code,
          cause: webhookError?.cause,
        })

        // Handle specific error types
        if (webhookError.name === "TimeoutError") {
          console.error("Webhook request timed out after 10 seconds")
        } else if (webhookError.name === "TypeError" && webhookError.message.includes("fetch")) {
          console.error("Network error during webhook request - possibly offline or DNS issues")
        } else if (webhookError.code === "ENOTFOUND") {
          console.error("Webhook endpoint not found - DNS resolution failed")
        } else if (webhookError.code === "ECONNREFUSED") {
          console.error("Webhook endpoint refused connection")
        }

        // Note: We don't return an error here because the main application submission was successful
        // The webhook is supplementary functionality
      }

      console.log("=== WEBHOOK INTEGRATION COMPLETE ===")

      // IMPORTANT: Record the submission in rate limiter AFTER successful database insert
      const uniqueId = rateLimiter.recordSubmission(hashedIP)
      console.log("✅ Rate limit recorded for IP:", hashedIP)

      // Set a cookie with the same uniqueId and expiration as the rate limit
      setSubmissionCookie(uniqueId)
      console.log("✅ Submission cookie set with ID:", uniqueId)

      // Verify the data was actually saved by reading it back
      console.log("Verifying data was saved...")
      const { data: verifyData, error: verifyError } = await supabase
        .from("applications")
        .select("*")
        .eq("id", data[0].id)
        .single()

      if (verifyError) {
        console.error("Verification failed:", verifyError)
      } else {
        console.log("Data verification successful:", {
          id: verifyData.id,
          email: verifyData.email?.substring(0, 3) + "***",
        })
      }

      return {
        success: true,
        message: "Application submitted successfully! We'll be in touch soon.",
      }
    } catch (supabaseError: any) {
      console.error("Supabase operation failed:", {
        name: supabaseError?.name,
        message: supabaseError?.message,
        code: supabaseError?.code,
        stack: supabaseError?.stack,
      })

      return {
        success: false,
        error: `Database error: ${supabaseError?.message || "Unknown error occurred"}`,
      }
    }
  } catch (error: any) {
    console.error("Unexpected error in submitApplication:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    })

    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    }
  }
}
