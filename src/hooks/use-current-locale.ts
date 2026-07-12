import { useTranslation } from "react-i18next"

export function useCurrentLocale(): string {
  const { i18n } = useTranslation()
  return i18n.language?.split("-")[0] ?? "en"
}
