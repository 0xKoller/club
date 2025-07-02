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

interface UseRecaptchaV3Options {
  siteKey: string
  action: string
  refreshInterval?: number // in milliseconds
  onError?: (error: Error) => void
}

export function useRecaptchaV3({
  siteKey,
  action,
  refreshInterval = 110000, // ~1.8 minutes (tokens expire after 2 minutes)
  onError,
}: UseRecaptchaV3Options) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Load the reCAPTCHA script
  useEffect(() => {
    if (!siteKey) {
      const noKeyError = new Error("No reCAPTCHA site key provided")
      setError(noKeyError)
      if (onError) onError(noKeyError)
      return
    }

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
      const scriptError = new Error("Failed to load reCAPTCHA")
      setError(scriptError)
      console.error("reCAPTCHA script failed to load", e)
      if (onError) onError(scriptError)
    }

    document.head.appendChild(script)

    return () => {
      // No need to remove the script as it should persist
    }
  }, [siteKey, onError])

  // Execute reCAPTCHA
  const executeRecaptcha = useCallback(
    async (actionName: string = action): Promise<string | null> => {
      if (!isLoaded || !window.grecaptcha?.enterprise) {
        const notLoadedError = new Error("reCAPTCHA not loaded yet")
        setError(notLoadedError)
        if (onError) onError(notLoadedError)
        return null
      }

      try {
        setIsExecuting(true)
        setError(null)

        return new Promise<string>((resolve, reject) => {
          try {
            window.grecaptcha.enterprise.ready(async () => {
              try {
                console.log(`Executing reCAPTCHA for action: ${actionName}`)
                const token = await window.grecaptcha.enterprise.execute(siteKey, {
                  action: actionName,
                })
                setToken(token)
                setIsExecuting(false)
                resolve(token)
              } catch (e) {
                const executeError = e instanceof Error ? e : new Error("Unknown reCAPTCHA execution error")
                console.error("Error executing reCAPTCHA:", e)
                setError(executeError)
                setIsExecuting(false)
                if (onError) onError(executeError)
                reject(executeError)
              }
            })
          } catch (readyError) {
            const wrapperError =
              readyError instanceof Error ? readyError : new Error("Error in reCAPTCHA ready function")
            setError(wrapperError)
            setIsExecuting(false)
            if (onError) onError(wrapperError)
            reject(wrapperError)
          }
        })
      } catch (e) {
        const wrapperError = e instanceof Error ? e : new Error("Unknown reCAPTCHA execution error")
        console.error("Error in reCAPTCHA execution:", e)
        setError(wrapperError)
        setIsExecuting(false)
        if (onError) onError(wrapperError)
        return null
      }
    },
    [isLoaded, siteKey, action, onError],
  )

  // Auto-refresh token before it expires
  useEffect(() => {
    if (!isLoaded || !refreshInterval) return

    let intervalId: NodeJS.Timeout | null = null

    // Initial execution
    executeRecaptcha(action)
      .catch((err) => {
        console.error("Initial reCAPTCHA execution failed:", err)
        // Don't set up interval if initial execution fails
      })
      .then((token) => {
        if (token) {
          // Set up refresh interval only if initial execution succeeds
          intervalId = setInterval(() => {
            executeRecaptcha(action).catch((err) => console.error("reCAPTCHA refresh failed:", err))
          }, refreshInterval)
        }
      })

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isLoaded, executeRecaptcha, action, refreshInterval])

  return {
    isLoaded,
    isExecuting,
    executeRecaptcha,
    token,
    error,
  }
}
