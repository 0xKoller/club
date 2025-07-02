"use client"

import { useEffect, useState } from "react"
import { useRecaptcha } from "@/hooks/use-recaptcha"
import { Shield } from "lucide-react"

interface RecaptchaProps {
  siteKey: string
  onChange?: (token: string | null) => void
  className?: string
  action?: string
}

export function Recaptcha({ siteKey, onChange, className = "", action = "submit" }: RecaptchaProps) {
  const [isExecuted, setIsExecuted] = useState(false)
  const { isLoaded, executeRecaptcha, token, error } = useRecaptcha({
    siteKey,
    action,
  })

  // Execute reCAPTCHA when loaded
  useEffect(() => {
    if (isLoaded && !isExecuted) {
      executeRecaptcha(action)
        .then(() => {
          setIsExecuted(true)
        })
        .catch(console.error)
    }
  }, [isLoaded, executeRecaptcha, action, isExecuted])

  // Call onChange when token changes
  useEffect(() => {
    if (onChange) {
      onChange(token)
    }
  }, [token, onChange])

  // Log errors
  useEffect(() => {
    if (error) {
      console.error("reCAPTCHA error:", error)
    }
  }, [error])

  return (
    <div className={`recaptcha-container ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4 text-blue-500" />
        <span className="text-sm text-gray-700">Protected by reCAPTCHA</span>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">Error loading reCAPTCHA. Please refresh the page and try again.</p>
      )}

      <div className="text-xs text-gray-500 mt-1">
        This site is protected by reCAPTCHA and the Google{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
          Terms of Service
        </a>{" "}
        apply.
      </div>
    </div>
  )
}
