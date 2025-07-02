"use client"

import { useState, useEffect, useCallback } from "react"

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void
        execute: (siteKey: string, options: { action: string }) => Promise<string>
      }
    }
  }
}

interface UseRecaptchaOptions {
  siteKey: string
  action?: string
}

export function useRecaptcha({ siteKey, action = "submit" }: UseRecaptchaOptions) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Load the reCAPTCHA script
  useEffect(() => {
    if (!siteKey) return

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="recaptcha/enterprise.js"]`)
    if (existingScript) {
      if (window.grecaptcha?.enterprise) {
        setIsLoaded(true)
      }
      return
    }

    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`
    script.async = true
    script.defer = true

    script.onload = () => {
      setIsLoaded(true)
    }

    script.onerror = (e) => {
      setError(new Error("Failed to load reCAPTCHA"))
      console.error("reCAPTCHA script failed to load", e)
    }

    document.head.appendChild(script)

    return () => {
      // No need to remove the script as it should persist
    }
  }, [siteKey])

  // Execute reCAPTCHA
  const executeRecaptcha = useCallback(
    async (actionName?: string) => {
      if (!isLoaded || !window.grecaptcha?.enterprise) {
        return null
      }

      try {
        setError(null)
        return new Promise<string>((resolve, reject) => {
          window.grecaptcha.enterprise.ready(async () => {
            try {
              const token = await window.grecaptcha.enterprise.execute(siteKey, {
                action: actionName || action,
              })
              setToken(token)
              resolve(token)
            } catch (e) {
              console.error("Error executing reCAPTCHA:", e)
              setError(e instanceof Error ? e : new Error("Unknown reCAPTCHA execution error"))
              reject(e)
            }
          })
        })
      } catch (e) {
        console.error("Error in reCAPTCHA execution:", e)
        setError(e instanceof Error ? e : new Error("Unknown reCAPTCHA execution error"))
        return null
      }
    },
    [isLoaded, siteKey, action],
  )

  return {
    isLoaded,
    executeRecaptcha,
    token,
    error,
  }
}
