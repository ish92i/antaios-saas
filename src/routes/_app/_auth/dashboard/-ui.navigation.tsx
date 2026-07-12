import { CreditCard, Globe, Slash } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "convex/react";
import { api } from "@cvx/_generated/api";

import { OrganizationSwitcher, UserButton } from "@clerk/clerk-react";
import { Logo } from "@/components/logo";
import { Link } from "@tanstack/react-router";
import { Route as BillingSettingsRoute } from "@/routes/_app/_auth/dashboard/_layout.settings.billing";
import { User } from "~/types";

export function Navigation({ user }: { user: User }) {
  const { t, i18n } = useTranslation();
  const [localeOpen, setLocaleOpen] = useState(false);
  const currentLang = i18n.language?.split("-")[0] ?? "en";
  const updateUserLocale = useMutation(api.app.updateUserLocale);

  const switchLocale = (lang: string) => {
    localStorage.setItem("antaios:locale", lang);
    i18n.changeLanguage(lang);
    updateUserLocale({ locale: lang });
    setLocaleOpen(false);
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col border-b border-border bg-card px-6">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-3">
        <div className="flex h-10 items-center gap-2">
          <Link
            to="/dashboard"
            className="flex h-10 items-center gap-1"
          >
            <Logo width={36} height={36} />
          </Link>
          <div className="flex items-center gap-2">
            <Slash className="h-6 w-6 -rotate-12 stroke-[1.5px] text-primary/10" />
            <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: "flex items-center",
                organizationSwitcherTrigger:
                  "gap-1 !pl-1.5 !pr-3 !py-1.5 rounded-md hover:bg-primary/5 text-primary/80 font-medium",
                organizationPreview: "!gap-2",
                organizationPreviewAvatarContainer: "!h-8 !w-8",
                organizationPreviewAvatarBox: "!h-8 !w-8",
                organizationPreviewTextContainer: "",
                organizationPreviewMainIdentifier: "!text-sm hidden sm:!block",
                organizationSwitcherTriggerIcon: "text-primary/60 !h-5 !w-5",
              },
            }}
          />
          </div>
        </div>

        <div className="flex h-10 items-center gap-3">
          <Link
            to={BillingSettingsRoute.fullPath}
            className="flex h-10 w-10 items-center justify-center rounded-md text-primary/60 hover:bg-primary/5 hover:text-primary"
            title="Billing"
          >
            <CreditCard className="h-5 w-5 stroke-[1.5px]" />
          </Link>
          <div className="relative">
            <button
              onClick={() => setLocaleOpen(!localeOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-primary/60 hover:bg-primary/5 hover:text-primary"
              title={t("locale.switch")}
            >
              <Globe className="h-5 w-5 stroke-[1.5px]" />
            </button>
            {localeOpen && (
              <div className="absolute right-0 top-full mt-1 min-w-[140px] rounded-md border bg-popover p-1 shadow-md z-50">
                {["en", "fr"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => switchLocale(lang)}
                    className={`flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-sm ${
                      currentLang === lang
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-popover-foreground hover:bg-accent/50"
                    }`}
                  >
                    {lang === "en" ? "\u{1F1EC}\u{1F1E7}" : "\u{1F1EB}\u{1F1F7}"} {t(`locale.${lang}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <UserButton
            afterSignOutUrl="/login"
            appearance={{
              elements: {
                userButtonAvatarBox: "!h-11 !w-11",
                userButtonTrigger: "focus:shadow-none",
              },
            }}
          />
        </div>
      </div>
    </nav>
  );
}
