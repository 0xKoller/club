// Bot detection utilities
export interface BotDetectionResult {
  isBot: boolean
  confidence: number // 0-1, higher means more likely to be a bot
  reasons: string[]
}

export interface FormTimingData {
  pageLoadTime: number
  firstInteractionTime: number
  submitTime: number
  totalTimeOnPage: number
  timeToFirstInput: number
  timeToSubmit: number
}

export interface InteractionData {
  mouseMovements: number
  keystrokes: number
  focusEvents: number
  pasteEvents: number
  formChanges: number
}

// Analyze form submission timing for bot-like behavior
export function analyzeFormTiming(timing: FormTimingData): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = []
  let suspicious = false

  // Too fast submission (less than 10 seconds)
  if (timing.timeToSubmit < 10000) {
    suspicious = true
    reasons.push("Form submitted too quickly")
  }

  // No time between page load and first interaction (immediate automation)
  if (timing.timeToFirstInput < 1000) {
    suspicious = true
    reasons.push("Immediate form interaction")
  }

  // Suspiciously consistent timing patterns
  if (timing.timeToSubmit > 0 && timing.timeToSubmit < 5000) {
    suspicious = true
    reasons.push("Suspiciously fast completion")
  }

  // Too long without interaction (over 30 minutes)
  if (timing.totalTimeOnPage > 30 * 60 * 1000) {
    suspicious = true
    reasons.push("Excessive time on page")
  }

  return { suspicious, reasons }
}

// Analyze user interactions for human-like behavior
export function analyzeInteractions(interactions: InteractionData): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = []
  let suspicious = false

  // No mouse movements (bots often don't simulate mouse movement)
  if (interactions.mouseMovements === 0) {
    suspicious = true
    reasons.push("No mouse movement detected")
  }

  // Too many paste events (copy-paste automation)
  if (interactions.pasteEvents > 2) {
    suspicious = true
    reasons.push("Excessive paste operations")
  }

  // No focus events (bots might not trigger focus properly)
  if (interactions.focusEvents < 3) {
    suspicious = true
    reasons.push("Insufficient focus events")
  }

  // Suspiciously low keystroke count for the amount of text
  if (interactions.keystrokes < 10) {
    suspicious = true
    reasons.push("Insufficient keystroke activity")
  }

  return { suspicious, reasons }
}

// Server-side user agent analysis
export function analyzeUserAgent(userAgent: string): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = []
  let suspicious = false

  if (!userAgent) {
    suspicious = true
    reasons.push("Missing user agent")
    return { suspicious, reasons }
  }

  const ua = userAgent.toLowerCase()

  // Common bot indicators
  const botIndicators = [
    "bot",
    "crawler",
    "spider",
    "scraper",
    "curl",
    "wget",
    "python",
    "requests",
    "automation",
    "selenium",
    "phantomjs",
    "headless",
    "puppeteer",
    "playwright",
  ]

  for (const indicator of botIndicators) {
    if (ua.includes(indicator)) {
      suspicious = true
      reasons.push(`Bot indicator in user agent: ${indicator}`)
    }
  }

  // Suspicious patterns
  if (ua.length < 20) {
    suspicious = true
    reasons.push("User agent too short")
  }

  if (!ua.includes("mozilla") && !ua.includes("webkit")) {
    suspicious = true
    reasons.push("Non-standard user agent")
  }

  return { suspicious, reasons }
}

// Generate a simple math challenge
export function generateMathChallenge(): { question: string; answer: number } {
  const operations = ["+", "-", "*"]
  const operation = operations[Math.floor(Math.random() * operations.length)]

  let num1: number, num2: number, answer: number, question: string

  switch (operation) {
    case "+":
      num1 = Math.floor(Math.random() * 20) + 1
      num2 = Math.floor(Math.random() * 20) + 1
      answer = num1 + num2
      question = `What is ${num1} + ${num2}?`
      break
    case "-":
      num1 = Math.floor(Math.random() * 30) + 10
      num2 = Math.floor(Math.random() * 10) + 1
      answer = num1 - num2
      question = `What is ${num1} - ${num2}?`
      break
    case "*":
      num1 = Math.floor(Math.random() * 10) + 1
      num2 = Math.floor(Math.random() * 10) + 1
      answer = num1 * num2
      question = `What is ${num1} × ${num2}?`
      break
    default:
      num1 = 5
      num2 = 3
      answer = 8
      question = "What is 5 + 3?"
  }

  return { question, answer }
}

// Validate math challenge answer
export function validateMathChallenge(userAnswer: string, correctAnswer: number): boolean {
  const parsed = Number.parseInt(userAnswer.trim(), 10)
  return !isNaN(parsed) && parsed === correctAnswer
}
