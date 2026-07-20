import { useState, useCallback } from "react"

export type ConsentChoice = "accepted" | "rejected" | null

const CONSENT_KEY = "antaios:consent"
const CONSENT_EXPIRY_MS = 6 * 30 * 24 * 60 * 60 * 1000

export interface ConsentData {
  choice: ConsentChoice
  timestamp: number
  analytics: boolean
}

export function getConsent(): ConsentData | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null

    const data: ConsentData = JSON.parse(raw)
    if (!data.timestamp || !data.choice) return null

    const age = Date.now() - data.timestamp
    if (age > CONSENT_EXPIRY_MS) {
      localStorage.removeItem(CONSENT_KEY)
      return null
    }

    return data
  } catch {
    return null
  }
}

export function setConsent(
  choice: ConsentChoice,
  analytics: boolean = false,
): void {
  const data: ConsentData = {
    choice,
    timestamp: Date.now(),
    analytics,
  }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(data))
}

export function clearConsent(): void {
  localStorage.removeItem(CONSENT_KEY)
}

export function useConsent(): {
  consent: ConsentData | null
  accept: (analytics?: boolean) => void
  reject: () => void
  customize: (analytics: boolean) => void
  isShowing: boolean
} {
  const [consent, setConsentState] = useState<ConsentData | null>(() =>
    getConsent(),
  )

  const accept = useCallback((analytics: boolean = true) => {
    setConsent("accepted", analytics)
    setConsentState({ choice: "accepted", timestamp: Date.now(), analytics })
  }, [])

  const reject = useCallback(() => {
    setConsent("rejected", false)
    setConsentState({
      choice: "rejected",
      timestamp: Date.now(),
      analytics: false,
    })
  }, [])

  const customize = useCallback((analytics: boolean) => {
    setConsent("accepted", analytics)
    setConsentState({ choice: "accepted", timestamp: Date.now(), analytics })
  }, [])

  return {
    consent,
    accept,
    reject,
    customize,
    isShowing: consent === null,
  }
}
