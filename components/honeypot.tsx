"use client"

import { useState } from "react"

interface HoneypotProps {
  onTrigger: () => void
}

export function Honeypot({ onTrigger }: HoneypotProps) {
  const [triggered, setTriggered] = useState(false)

  const handleHoneypotChange = () => {
    if (!triggered) {
      setTriggered(true)
      onTrigger()
    }
  }

  return (
    <>
      {/* Hidden honeypot fields - bots often fill these */}
      <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}>
        <input type="text" name="website" value="" onChange={handleHoneypotChange} tabIndex={-1} autoComplete="off" />
        <input
          type="email"
          name="email_confirm"
          value=""
          onChange={handleHoneypotChange}
          tabIndex={-1}
          autoComplete="off"
        />
        <input type="text" name="phone" value="" onChange={handleHoneypotChange} tabIndex={-1} autoComplete="off" />
      </div>
    </>
  )
}
