"use client"

import { useEffect, useRef, useState } from "react"

export interface InteractionData {
  mouseMovements: number
  keystrokes: number
  focusEvents: number
  pasteEvents: number
  formChanges: number
  pageLoadTime: number
  firstInteractionTime: number | null
  submitTime: number | null
}

export function useInteractionTracker() {
  const [interactions, setInteractions] = useState<InteractionData>({
    mouseMovements: 0,
    keystrokes: 0,
    focusEvents: 0,
    pasteEvents: 0,
    formChanges: 0,
    pageLoadTime: Date.now(),
    firstInteractionTime: null,
    submitTime: null,
  })

  const hasFirstInteraction = useRef(false)

  useEffect(() => {
    const recordFirstInteraction = () => {
      if (!hasFirstInteraction.current) {
        hasFirstInteraction.current = true
        setInteractions((prev) => ({
          ...prev,
          firstInteractionTime: Date.now(),
        }))
      }
    }

    const handleMouseMove = () => {
      recordFirstInteraction()
      setInteractions((prev) => ({
        ...prev,
        mouseMovements: prev.mouseMovements + 1,
      }))
    }

    const handleKeyDown = () => {
      recordFirstInteraction()
      setInteractions((prev) => ({
        ...prev,
        keystrokes: prev.keystrokes + 1,
      }))
    }

    const handleFocus = () => {
      recordFirstInteraction()
      setInteractions((prev) => ({
        ...prev,
        focusEvents: prev.focusEvents + 1,
      }))
    }

    const handlePaste = () => {
      recordFirstInteraction()
      setInteractions((prev) => ({
        ...prev,
        pasteEvents: prev.pasteEvents + 1,
      }))
    }

    const handleInput = () => {
      recordFirstInteraction()
      setInteractions((prev) => ({
        ...prev,
        formChanges: prev.formChanges + 1,
      }))
    }

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("keydown", handleKeyDown, { passive: true })
    document.addEventListener("focusin", handleFocus, { passive: true })
    document.addEventListener("paste", handlePaste, { passive: true })
    document.addEventListener("input", handleInput, { passive: true })

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("focusin", handleFocus)
      document.removeEventListener("paste", handlePaste)
      document.removeEventListener("input", handleInput)
    }
  }, [])

  const markSubmitTime = () => {
    setInteractions((prev) => ({
      ...prev,
      submitTime: Date.now(),
    }))
  }

  return { interactions, markSubmitTime }
}
