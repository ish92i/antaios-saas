import { useEffect } from "react"
import { useTranslation } from "react-i18next"

const SUPPORTED = ["en", "fr", "es", "de", "nl", "pt", "it"]

export function useInitializeLocale() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const stored = localStorage.getItem("antaios:locale")
    if (stored && SUPPORTED.includes(stored)) {
      i18n.changeLanguage(stored)
      return
    }

    const browserLang = navigator.language?.split("-")[0]
    if (browserLang && SUPPORTED.includes(browserLang)) {
      i18n.changeLanguage(browserLang)
      return
    }

    const osLang = Intl.DateTimeFormat().resolvedOptions().locale?.split("-")[0]
    if (osLang && SUPPORTED.includes(osLang)) {
      i18n.changeLanguage(osLang)
      return
    }

    i18n.changeLanguage("en")
  }, [i18n])
}
