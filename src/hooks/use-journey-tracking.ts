import { useCallback, useRef } from "react"
import { trackEvent } from "@/lib/analytics"

const SESSION_ID_KEY = "antaios:session_id"
const SESSION_START_KEY = "antaios:session_start"
const PAGE_SEQUENCE_KEY = "antaios:page_sequence"
const SESSION_ENTRY_KEY = "antaios:session_entry"
const SESSION_REFERRER_KEY = "antaios:session_referrer"
const SESSION_UTM_KEY = "antaios:session_utm"
const PAYWALL_SHOWN_KEY = "antaios:paywall_shown_at"

function getSessionStorage(key: string): string | null {
  try { return sessionStorage.getItem(key) } catch { return null }
}

function setSessionStorage(key: string, value: string): void {
  try { sessionStorage.setItem(key, value) } catch { /* noop */ }
}

function generateUUID(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getPageCategory(path: string): string {
  if (path === "/") return "landing"
  if (path.startsWith("/free-tool")) return "free_tool"
  if (path.startsWith("/resources")) return "resources"
  if (path.startsWith("/legal")) return "legal"
  if (path.startsWith("/supplier")) return "supplier"
  if (path.startsWith("/login")) return "login"
  if (path.startsWith("/dashboard")) return "dashboard"
  if (path.startsWith("/onboarding")) return "onboarding"
  return "other"
}

export function useJourneyTracking() {
  const initialized = useRef(false)

  const initJourney = useCallback(() => {
    if (initialized.current) return
    initialized.current = true

    let sessionId = getSessionStorage(SESSION_ID_KEY)
    if (!sessionId) {
      sessionId = generateUUID()
      setSessionStorage(SESSION_ID_KEY, sessionId)
      setSessionStorage(SESSION_START_KEY, String(Date.now()))
      setSessionStorage(PAGE_SEQUENCE_KEY, "0")
      setSessionStorage(SESSION_ENTRY_KEY, window.location.pathname)
      setSessionStorage(SESSION_REFERRER_KEY, document.referrer || "")

      const params = new URLSearchParams(window.location.search)
      const utm: Record<string, string> = {}
      for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
        const val = params.get(key)
        if (val) utm[key] = val
      }
      if (Object.keys(utm).length) {
        setSessionStorage(SESSION_UTM_KEY, JSON.stringify(utm))
      }

      trackEvent("journey_started", {
        entry_page: window.location.pathname,
        referrer: document.referrer || undefined,
        session_id: sessionId,
        ...utm,
      })
    }
  }, [])

  const trackPageView = useCallback((path: string) => {
    const seq = parseInt(getSessionStorage(PAGE_SEQUENCE_KEY) || "0", 10) + 1
    setSessionStorage(PAGE_SEQUENCE_KEY, String(seq))
    const start = parseInt(getSessionStorage(SESSION_START_KEY) || "0", 10)
    const duration = start ? Date.now() - start : 0

    trackEvent("page_viewed", {
      path,
      page_category: getPageCategory(path),
      page_sequence: seq,
      session_duration: duration,
      session_id: getSessionStorage(SESSION_ID_KEY),
    })
  }, [])

  const trackPaywallEncountered = useCallback(() => {
    setSessionStorage(PAYWALL_SHOWN_KEY, String(Date.now()))
    const start = parseInt(getSessionStorage(SESSION_START_KEY) || "0", 10)
    const pagesBefore = parseInt(getSessionStorage(PAGE_SEQUENCE_KEY) || "0", 10)

    trackEvent("paywall_encountered", {
      time_on_site: start ? Date.now() - start : 0,
      pages_before_paywall: pagesBefore,
      entry_page: getSessionStorage(SESSION_ENTRY_KEY),
      session_id: getSessionStorage(SESSION_ID_KEY),
    })
  }, [])

  const trackCheckoutInitiated = useCallback((plan: string, price: number) => {
    const start = parseInt(getSessionStorage(SESSION_START_KEY) || "0", 10)
    const paywallShown = parseInt(getSessionStorage(PAYWALL_SHOWN_KEY) || "0", 10)

    trackEvent("checkout_initiated", {
      plan,
      price,
      time_to_checkout: start ? Date.now() - start : 0,
      paywall_to_checkout: paywallShown ? Date.now() - paywallShown : 0,
      session_id: getSessionStorage(SESSION_ID_KEY),
    })
  }, [])

  const trackCheckoutReturned = useCallback(() => {
    trackEvent("checkout_returned", {
      session_id: getSessionStorage(SESSION_ID_KEY),
    })
  }, [])

  const trackSubscriptionActivated = useCallback((plan: string) => {
    const start = parseInt(getSessionStorage(SESSION_START_KEY) || "0", 10)

    trackEvent("subscription_activated", {
      time_to_conversion: start ? Date.now() - start : 0,
      plan,
      session_id: getSessionStorage(SESSION_ID_KEY),
    })
  }, [])

  return {
    initJourney,
    trackPageView,
    trackPaywallEncountered,
    trackCheckoutInitiated,
    trackCheckoutReturned,
    trackSubscriptionActivated,
  }
}
