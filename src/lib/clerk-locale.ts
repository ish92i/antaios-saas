import { enUS, frFR, deDE, esES, nlNL, ptPT, itIT } from "@clerk/localizations"

export const clerkLocaleMap: Record<string, typeof enUS> = {
  en: enUS,
  fr: frFR,
  de: deDE,
  es: esES,
  nl: nlNL,
  pt: ptPT,
  it: itIT,
}

export function getClerkLocale(lang: string) {
  const base = lang.split("-")[0]
  return clerkLocaleMap[base] ?? enUS
}

export function getInitialClerkLocale() {
  const stored = localStorage.getItem("antaios:locale")
  if (stored) return getClerkLocale(stored)
  const browser = navigator.language?.split("-")[0]
  if (browser) return getClerkLocale(browser)
  const os = Intl.DateTimeFormat().resolvedOptions().locale?.split("-")[0]
  if (os) return getClerkLocale(os)
  return enUS
}
