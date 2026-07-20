import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useConsent } from "@/hooks/use-consent"
import { cn } from "@/lib/utils"

export function CookieConsentBanner() {
  const { t } = useTranslation()
  const { accept, reject, customize, isShowing } = useConsent()
  const [showCustomize, setShowCustomize] = useState(false)
  const [analyticsOn, setAnalyticsOn] = useState(false)

  if (!isShowing) return null

  const handleAccept = () => accept(true)
  const handleReject = () => reject()
  const handleCustomizeSave = () => customize(analyticsOn)

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-full max-w-sm",
        "rounded-xl border bg-card p-5 shadow-lg",
        "animate-in fade-in zoom-in-95 duration-300",
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-card-foreground">
            {t("common.cookieBanner.title", "Cookie Consent")}
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t(
              "common.cookieBanner.message",
              "We use essential cookies for authentication and security. With your consent, we also use analytics cookies to improve our service.",
            )}
          </p>
          <Link
            to="/legal/privacy"
            className="text-xs text-primary underline-offset-4 hover:underline"
          >
            {t("common.cookieBanner.privacyLink", "Learn more")}
          </Link>
        </div>

        {showCustomize ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="analytics-switch"
                className="text-xs text-card-foreground"
              >
                {t(
                  "common.cookieBanner.analyticsLabel",
                  "Analytics cookies",
                )}
              </label>
              <Switch
                id="analytics-switch"
                checked={analyticsOn}
                onCheckedChange={setAnalyticsOn}
              />
            </div>
            <Button size="sm" onClick={handleCustomizeSave}>
              {t(
                "common.cookieBanner.savePreferences",
                "Save preferences",
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                onClick={handleAccept}
              >
                {t("common.cookieBanner.acceptAll", "Accept All")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={handleReject}
              >
                {t("common.cookieBanner.rejectAll", "Reject All")}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomize(true)}
            >
              {t("common.cookieBanner.customize", "Customize")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
