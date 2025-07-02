"use client"

import { useEffect } from "react"
import { useRecaptchaV3 } from "@/hooks/use-recaptcha-v3"

interface RecaptchaV3Props {
  siteKey: string
  action: string
  onToken: (token: string | null) => void
  onError?: (error: Error) => void
  refreshInterval?: number
}

export function RecaptchaV3({
  siteKey,
  action,
  onToken,
  onError,
  refreshInterval = 110000, // ~1.8 minutes
}: RecaptchaV3Props) {
  const { token, error, isLoaded } = useRecaptchaV3({
    siteKey,
    action,
    refreshInterval,
    onError,
  })

  // Pass token to parent component when it changes
  useEffect(() => {
    onToken(token)
  }, [token, onToken])

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  // This component doesn't render anything visible
  return null
}
