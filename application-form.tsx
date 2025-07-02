"use client"

import type React from "react"

import { useState, useTransition, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, AlertCircle, Loader2, Shield } from "lucide-react"
import { submitApplication } from "./actions/submit-application"
import { Honeypot } from "@/components/honeypot"
import { useInteractionTracker } from "@/hooks/use-interaction-tracker"
import { generateMathChallenge } from "@/lib/bot-detection"
import { RecaptchaV3 } from "@/components/recaptcha-v3"

type FieldState = {
  value: string
  valid: boolean | null
  touched: boolean
  error: string | null
}

type FormState = {
  fullName: FieldState
  email: FieldState
  twitter: FieldState
  linkedin: FieldState
  additionalInfo: FieldState
  mathChallenge: FieldState
}

// Skeleton component for form fields
const SkeletonField = ({ height = "h-10" }: { height?: string }) => (
  <div className="animate-pulse space-y-2">
    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    <div className={`${height} bg-gray-100 rounded w-full`}></div>
  </div>
)

// reCAPTCHA site key - in a real app, this would come from environment variables
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key

export default function ApplicationForm() {
  const [form, setForm] = useState<FormState>({
    fullName: { value: "", valid: null, touched: false, error: null },
    email: { value: "", valid: null, touched: false, error: null },
    twitter: { value: "", valid: null, touched: false, error: null },
    linkedin: { value: "", valid: null, touched: false, error: null },
    additionalInfo: { value: "", valid: null, touched: false, error: null },
    mathChallenge: { value: "", valid: null, touched: false, error: null },
  })

  const [isPending, startTransition] = useTransition()
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessSkeleton, setShowSuccessSkeleton] = useState(false)
  const [honeypotTriggered, setHoneypotTriggered] = useState(false)
  const [mathChallenge, setMathChallenge] = useState<{ question: string; answer: number } | null>(null)
  const [showMathChallenge, setShowMathChallenge] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [recaptchaError, setRecaptchaError] = useState<Error | null>(null)

  const { interactions, markSubmitTime } = useInteractionTracker()

  const handleRecaptchaToken = useCallback((token: string | null) => {
    setRecaptchaToken(token)
    if (token) {
      setRecaptchaError(null)
    }
  }, [])

  // Handle reCAPTCHA errors
  const handleRecaptchaError = useCallback((error: Error) => {
    console.error("reCAPTCHA error:", error)
    setRecaptchaError(error)
  }, [])

  // Generate math challenge when form becomes active
  useEffect(() => {
    if (!isLoading && !mathChallenge) {
      const challenge = generateMathChallenge()
      setMathChallenge(challenge)
    }
  }, [isLoading, mathChallenge])

  // Show math challenge after user has filled some fields
  useEffect(() => {
    const filledFields = Object.values(form).filter((field) => field.value.trim().length > 0).length
    if (filledFields >= 2 && !showMathChallenge) {
      setShowMathChallenge(true)
    }
  }, [form, showMathChallenge])

  // Simulate initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const validateField = (name: string, value: string): { valid: boolean; error: string | null } => {
    switch (name) {
      case "fullName":
        const hasAtSymbol = value.includes("@")
        return {
          valid: value.trim().length > 0 && !hasAtSymbol,
          error:
            value.trim().length === 0
              ? "Full name is required"
              : hasAtSymbol
                ? "Full name cannot contain @ symbol"
                : null,
        }
      case "email":
        // Use the same regex as the database constraint
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return {
          valid: emailRegex.test(value),
          error: !value ? "Email is required" : !emailRegex.test(value) ? "Please enter a valid email address" : null,
        }
      case "twitter":
        const cleanTwitter = value.replace(/^@/, "") // Remove @ if present
        return {
          valid: cleanTwitter.trim().length > 0,
          error: !cleanTwitter.trim() ? "X handle is required" : null,
        }
      case "linkedin":
        if (!value) return { valid: true, error: null } // Optional field
        const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/
        return {
          valid: linkedinRegex.test(value),
          error: !linkedinRegex.test(value) ? "Please enter a valid LinkedIn URL" : null,
        }
      case "additionalInfo":
        return {
          valid: value.trim().length > 0,
          error: value.trim().length === 0 ? "Please tell us about your accomplishment" : null,
        }
      case "mathChallenge":
        if (!mathChallenge) return { valid: true, error: null }
        const answer = Number.parseInt(value.trim(), 10)
        return {
          valid: !isNaN(answer) && answer === mathChallenge.answer,
          error: isNaN(answer) ? "Please enter a number" : answer !== mathChallenge.answer ? "Incorrect answer" : null,
        }
      default:
        return { valid: true, error: null }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const validation = validateField(name, value)

    setForm((prev) => ({
      ...prev,
      [name]: {
        ...prev[name as keyof FormState],
        value,
        valid: validation.valid,
        error: validation.error,
        touched: true,
      },
    }))

    // Clear submit message when user starts typing again
    if (submitMessage) {
      setSubmitMessage(null)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const validation = validateField(name, value)

    setForm((prev) => ({
      ...prev,
      [name]: {
        ...prev[name as keyof FormState],
        valid: validation.valid,
        error: validation.error,
        touched: true,
      },
    }))
  }

  const handleHoneypotTrigger = () => {
    setHoneypotTriggered(true)
    console.log("🚨 Honeypot triggered - potential bot detected")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Mark submit time for timing analysis
      markSubmitTime()

      // Check for honeypot trigger
      if (honeypotTriggered) {
        setSubmitMessage({
          type: "error",
          message: "Security check failed. Please try again.",
        })
        return
      }

      // Check for reCAPTCHA
      if (!recaptchaToken) {
        setSubmitMessage({
          type: "error",
          message: "Security verification is still loading. Please wait a moment and try again.",
        })
        return
      }

      // Get current form values directly from the form elements
      const formElement = e.target as HTMLFormElement
      const formData = new FormData(formElement)

      const currentValues = {
        fullName: (formData.get("fullName") as string)?.trim() || "",
        email: (formData.get("email") as string)?.trim() || "",
        twitter: (formData.get("twitter") as string)?.trim() || "",
        linkedin: (formData.get("linkedin") as string)?.trim() || "",
        additionalInfo: (formData.get("additionalInfo") as string)?.trim() || "",
        mathChallenge: (formData.get("mathChallenge") as string)?.trim() || "",
      }

      console.log("=== CLIENT-SIDE VALIDATION DEBUG ===")
      console.log("Form values:", currentValues)

      // Validate all fields with current values
      const updatedForm = { ...form }
      let isValid = true
      const fieldErrors: string[] = []

      // Validate each field individually
      const fieldValidations = [
        {
          name: "fullName",
          value: currentValues.fullName,
          required: true,
          test: (val: string) => val.length > 0,
          errorMsg: "Full name is required",
        },
        {
          name: "email",
          value: currentValues.email,
          required: true,
          test: (val: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
          errorMsg: "Valid email is required",
        },
        {
          name: "twitter",
          value: currentValues.twitter.replace(/^@/, ""), // Clean @ symbol
          required: true,
          test: (val: string) => val.length > 0,
          errorMsg: "X handle is required",
        },
        {
          name: "additionalInfo",
          value: currentValues.additionalInfo,
          required: true,
          test: (val: string) => val.length > 0,
          errorMsg: "Achievement description is required",
        },
        {
          name: "linkedin",
          value: currentValues.linkedin,
          required: false,
          test: (val: string) => !val || /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(val),
          errorMsg: "LinkedIn URL format is invalid",
        },
        {
          name: "mathChallenge",
          value: currentValues.mathChallenge,
          required: true,
          test: (val: string) => {
            if (!mathChallenge) return true
            const answer = Number.parseInt(val, 10)
            return !isNaN(answer) && answer === mathChallenge.answer
          },
          errorMsg: "Security question answer is incorrect",
        },
      ]

      fieldValidations.forEach((field) => {
        const testValue =
          field.name === "twitter" ? field.value : currentValues[field.name as keyof typeof currentValues]
        const isFieldValid = field.test(testValue)
        console.log(`${field.name}: "${testValue}" -> ${isFieldValid ? "✅ VALID" : "❌ INVALID"}`)

        if (field.required && !testValue) {
          fieldErrors.push(`${field.name} is empty`)
          isValid = false
        } else if (testValue && !isFieldValid) {
          fieldErrors.push(`${field.name} is invalid`)
          isValid = false
        }

        // Update form state
        const validation = validateField(field.name, currentValues[field.name as keyof typeof currentValues])
        updatedForm[field.name as keyof FormState] = {
          ...updatedForm[field.name as keyof FormState],
          value: currentValues[field.name as keyof typeof currentValues],
          valid: isFieldValid,
          error: isFieldValid ? null : field.errorMsg,
          touched: true,
        }
      })

      setForm(updatedForm)

      console.log("=== VALIDATION RESULTS ===")
      console.log("Is form valid:", isValid)
      console.log("Field errors:", fieldErrors)

      if (!isValid) {
        const errorMessage = `Validation failed: ${fieldErrors.join(", ")}`
        console.log("❌ CLIENT VALIDATION FAILED:", errorMessage)

        setSubmitMessage({
          type: "error",
          message: errorMessage,
        })
        return
      }

      console.log("✅ CLIENT VALIDATION PASSED - Submitting form...")

      // Submit form with loading state
      startTransition(async () => {
        try {
          const submitFormData = new FormData()

          submitFormData.append("fullName", currentValues.fullName)
          submitFormData.append("email", currentValues.email)
          submitFormData.append("twitter", currentValues.twitter)
          submitFormData.append("linkedin", currentValues.linkedin)
          submitFormData.append("additionalInfo", currentValues.additionalInfo)
          submitFormData.append("mathChallenge", currentValues.mathChallenge)
          submitFormData.append("recaptchaToken", recaptchaToken || "")

          // Add interaction data for bot detection
          submitFormData.append("interactionData", JSON.stringify(interactions))

          // Add math challenge answer for verification
          if (mathChallenge) {
            submitFormData.append("mathChallengeAnswer", mathChallenge.answer.toString())
          }

          // Show success skeleton during transition
          setShowSuccessSkeleton(true)

          const result = await submitApplication(submitFormData)

          if (!result) {
            throw new Error("No response from server")
          }

          if (result.success) {
            // Short delay to show the skeleton animation
            setTimeout(() => {
              setShowSuccessSkeleton(false)
              setIsSubmitted(true)
            }, 800)
          } else {
            setShowSuccessSkeleton(false)
            setSubmitMessage({
              type: "error",
              message: result.error || "Something went wrong. Please try again.",
            })
          }
        } catch (error) {
          console.error("Form submission error:", error)
          setShowSuccessSkeleton(false)
          setSubmitMessage({
            type: "error",
            message: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
          })
        }
      })
    } catch (error) {
      console.error("Error in form submission handler:", error)
      setSubmitMessage({
        type: "error",
        message: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      })
    }
  }

  const getInputClasses = (field: FieldState) => {
    const baseClasses =
      "mt-2 mb-4 border-0 border-b rounded-none px-0 py-2 transition-all duration-500 ease-in-out focus:ring-0 font-mono text-base leading-relaxed transform focus:scale-[1.01] touch-manipulation min-h-[44px] w-full"

    if (!field.touched) {
      return baseClasses + " border-gray-200 focus:border-black focus:border-b-2"
    }

    if (field.valid) {
      return baseClasses + " border-green-500 focus:border-green-500 focus:border-b-2"
    }

    return baseClasses + " border-red-400 focus:border-red-400 focus:border-b-2"
  }

  // Success skeleton screen
  if (showSuccessSkeleton) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 sm:px-8 py-12 sm:py-8 font-sans">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 text-center">
          <div className="space-y-6 animate-pulse">
            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 sm:px-8 py-12 sm:py-8 font-sans animate-in fade-in duration-1000">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 text-center animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500 delay-500">
              <CheckCircle2 className="h-8 w-8 text-green-600 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-normal text-black tracking-tight leading-tight">Thank You</h1>
              <p className="text-gray-600 text-sm font-normal leading-relaxed max-w-sm mx-auto">
                Your application has been received.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Initial loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 sm:px-8 py-12 sm:py-8 font-sans">
        <div className="w-full max-w-md space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-3 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-100 rounded w-1/3 mx-auto"></div>
          </div>

          {/* Form skeleton */}
          <div className="space-y-6">
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
            <SkeletonField height="h-24" />
            <div className="h-12 bg-gray-300 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 sm:px-8 py-12 sm:py-8 font-sans animate-in fade-in duration-700">
      {/* Invisible reCAPTCHA v3 */}
      <RecaptchaV3
        siteKey={RECAPTCHA_SITE_KEY}
        action="application_submit"
        onToken={handleRecaptchaToken}
        onError={handleRecaptchaError}
      />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-normal text-black tracking-tight leading-tight mb-2">O(n) Club</h1>
          <p className="text-gray-500 text-sm font-normal leading-relaxed">For Founders, By Founders</p>
        </div>

        <form
          className="animate-in slide-in-from-bottom-4 duration-500 delay-200 touch-manipulation"
          onSubmit={handleSubmit}
        >
          {/* Honeypot fields */}
          <Honeypot onTrigger={handleHoneypotTrigger} />

          <div className="mb-6">
            <Label htmlFor="fullName" className="block text-sm text-gray-700 mb-1 font-normal">
              Full name <span className="text-red-400 text-xs">*</span>
            </Label>
            <div className="relative">
              <Input
                id="fullName"
                name="fullName"
                value={form.fullName.value}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClasses(form.fullName)}
                disabled={isPending}
                required
              />
              {form.fullName.touched && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out transform scale-0 animate-in zoom-in">
                  {form.fullName.valid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {form.fullName.touched && form.fullName.error && (
              <p className="text-xs text-red-400 mt-1 transition-all duration-500 ease-in-out opacity-100 font-normal leading-relaxed animate-in slide-in-from-top-2">
                {form.fullName.error}
              </p>
            )}
          </div>

          <div className="mb-6">
            <Label htmlFor="email" className="block text-sm text-gray-700 mb-1 font-normal">
              Email <span className="text-red-400 text-xs">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email.value}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClasses(form.email)}
                disabled={isPending}
                required
              />
              {form.email.touched && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out transform scale-0 animate-in zoom-in">
                  {form.email.valid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {form.email.touched && form.email.error && (
              <p className="text-xs text-red-400 mt-1 transition-all duration-500 ease-in-out opacity-100 font-normal leading-relaxed animate-in slide-in-from-top-2">
                {form.email.error}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1 font-normal leading-relaxed">
              Each email address can only be used for one application
            </p>
          </div>

          <div className="mb-6">
            <Label htmlFor="twitter" className="block text-sm text-gray-700 mb-1 font-normal">
              X <span className="text-red-400 text-xs">*</span>
            </Label>
            <div className="relative">
              <Input
                id="twitter"
                name="twitter"
                value={form.twitter.value}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClasses(form.twitter)}
                disabled={isPending}
                placeholder="@username"
                required
              />
              {form.twitter.touched && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out transform scale-0 animate-in zoom-in">
                  {form.twitter.valid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {form.twitter.touched && form.twitter.error && (
              <p className="text-xs text-red-400 mt-1 transition-all duration-500 ease-in-out opacity-100 font-normal leading-relaxed animate-in slide-in-from-top-2">
                {form.twitter.error}
              </p>
            )}
          </div>

          <div className="mb-6">
            <Label htmlFor="linkedin" className="block text-sm text-gray-700 mb-1 font-normal">
              LinkedIn <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                value={form.linkedin.value}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClasses(form.linkedin)}
                disabled={isPending}
              />
              {form.linkedin.touched && form.linkedin.value && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out transform scale-0 animate-in zoom-in">
                  {form.linkedin.valid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {form.linkedin.touched && form.linkedin.error && (
              <p className="text-xs text-red-400 mt-1 transition-all duration-500 ease-in-out opacity-100 font-normal leading-relaxed animate-in slide-in-from-top-2">
                {form.linkedin.error}
              </p>
            )}
          </div>

          <div className="mb-8">
            <Label htmlFor="additionalInfo" className="block text-sm text-gray-700 mb-1 font-normal">
              What's something great you accomplished? <span className="text-red-400 text-xs">*</span>
            </Label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              value={form.additionalInfo.value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tell us about a significant achievement or accomplishment..."
              className="mt-2 mb-4 border-0 border-b border-gray-200 rounded-none px-0 py-2 resize-none min-h-[120px] focus:border-black focus:ring-0 transition-all duration-300 ease-in-out focus:border-b-2 font-mono text-base leading-relaxed w-full"
              disabled={isPending}
              required
            />
            {form.additionalInfo.touched && form.additionalInfo.error && (
              <p className="text-xs text-red-400 mt-1 transition-all duration-500 ease-in-out opacity-100 font-normal leading-relaxed animate-in slide-in-from-top-2">
                {form.additionalInfo.error}
              </p>
            )}
          </div>

          {/* Math Challenge - appears after user has filled some fields */}
          {showMathChallenge && mathChallenge && (
            <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
              <Label
                htmlFor="mathChallenge"
                className="block text-sm text-gray-700 mb-1 font-normal flex items-center gap-2"
              >
                <Shield className="h-4 w-4 text-blue-500" />
                Security Question <span className="text-red-400 text-xs">*</span>
              </Label>
              <p className="text-sm text-gray-600 mb-2">{mathChallenge.question}</p>
              <div className="relative">
                <Input
                  id="mathChallenge"
                  name="mathChallenge"
                  type="number"
                  value={form.mathChallenge.value}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClasses(form.mathChallenge)}
                  disabled={isPending}
                  placeholder="Enter your answer"
                  required
                />
                {form.mathChallenge.touched && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out transform scale-0 animate-in zoom-in">
                    {form.mathChallenge.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              {form.mathChallenge.touched && form.mathChallenge.error && (
                <p className="text-xs text-red-400 mt-1 transition-all duration-500 ease-in-out opacity-100 font-normal leading-relaxed animate-in slide-in-from-top-2">
                  {form.mathChallenge.error}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1 font-normal leading-relaxed">
                This helps us verify you're a real person
              </p>
            </div>
          )}

          {/* reCAPTCHA notice - invisible but we show a message */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-700 font-normal">Protected by reCAPTCHA</span>
            </div>
            {recaptchaError && (
              <p className="text-xs text-red-400 mt-1 font-normal leading-relaxed animate-in slide-in-from-top-2">
                Security verification failed to load. Please refresh the page.
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1 font-normal leading-relaxed">
              This site is protected by reCAPTCHA and the Google{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Terms of Service
              </a>{" "}
              apply.
            </p>
          </div>

          {/* Submit Message */}
          {submitMessage && (
            <div
              className={`text-center text-sm transition-all duration-300 ease-in-out font-normal leading-relaxed mb-4 ${
                submitMessage.type === "success" ? "text-green-600" : "text-red-500"
              }`}
            >
              {submitMessage.message}
            </div>
          )}

          {/* Conditional rendering for button - normal or skeleton */}
          {isPending ? (
            <div className="w-full h-12 relative overflow-hidden mb-4">
              <div className="absolute inset-0 bg-gray-800 rounded-none opacity-50"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span className="text-white text-sm">Submitting...</span>
                </div>
              </div>
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                style={{ backgroundSize: "200% 100%" }}
              ></div>
            </div>
          ) : (
            <Button
              type="submit"
              disabled={isPending || honeypotTriggered || !recaptchaToken || !!recaptchaError}
              className="w-full bg-black hover:bg-gray-800 active:bg-gray-900 text-white rounded-none py-4 font-normal transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-base touch-manipulation min-h-[48px] active:scale-[0.96] active:shadow-inner mb-4"
            >
              Apply
            </Button>
          )}

          <a
            href="https://cal.com/theonclub/exploratory"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-white border border-black hover:bg-gray-50 text-black py-2 px-4 font-normal transition-all duration-300 ease-in-out hover:shadow-md text-sm touch-manipulation mt-2"
          >
            Want to become a sponsor, partner or investor? →
          </a>
        </form>
      </div>
    </div>
  )
}
