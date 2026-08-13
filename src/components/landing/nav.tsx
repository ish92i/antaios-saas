import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "motion/react";
import { Languages, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Route as AuthLoginRoute } from "@/routes/_app/login/_layout.index";

const NATIVE_LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  nl: "Nederlands",
  pt: "Português",
  it: "Italiano",
};

const FLAGS: Record<string, string> = {
  en: "\u{1F1EC}\u{1F1E7}",
  fr: "\u{1F1EB}\u{1F1F7}",
  es: "\u{1F1EA}\u{1F1F8}",
  de: "\u{1F1E9}\u{1F1EA}",
  nl: "\u{1F1F3}\u{1F1F1}",
  pt: "\u{1F1F5}\u{1F1F9}",
  it: "\u{1F1EE}\u{1F1F9}",
};

export function Nav() {
  const { t, i18n } = useTranslation();
  const { isLoaded, isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const localeRef = useRef<HTMLDivElement>(null);
  const currentLang = i18n.language?.split("-")[0] ?? "en";

  useEffect(() => {
    if (!localeOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (localeRef.current && !localeRef.current.contains(e.target as Node)) {
        setLocaleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [localeOpen]);

  const switchLocale = (lang: string) => {
    localStorage.setItem("antaios:locale", lang);
    i18n.changeLanguage(lang);
    setLocaleOpen(false);
  };

  return (
    <motion.div
      className="sticky top-2 z-50 mx-auto w-full px-4 pt-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        className="mx-auto max-w-7xl"
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.nav
          className="flex items-center justify-between rounded-full border border-border/60 bg-background/80 px-6 py-3 shadow-sm backdrop-blur-xl"
          animate={{
            boxShadow: "0 0 0 0 rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <Logo />
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            <Link
              to="/free-tool"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("landing.nav.freeTool", "Free Diagnostic")}
            </Link>
            <Link
              to="/resources"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("landing.nav.resources", "Resources")}
            </Link>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="relative" ref={localeRef}>
              <button
                onClick={() => setLocaleOpen(!localeOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title={t("locale.switch", "Switch language")}
              >
                <Languages className="h-4 w-4" />
              </button>
              {localeOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-[140px] rounded-lg border bg-popover p-1 shadow-md z-50">
                  {["en", "fr", "es", "de", "nl", "pt", "it"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => switchLocale(lang)}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                        currentLang === lang
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-popover-foreground hover:bg-accent/50"
                      }`}
                    >
                      {FLAGS[lang]} {NATIVE_LABELS[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isLoaded && isSignedIn ? (
              <Link to="/dashboard">
                <Button variant="default" size="sm">
                  {t("landing.nav.dashboard", "Dashboard")}
                </Button>
              </Link>
            ) : (
              <Link to={AuthLoginRoute.fullPath}>
                <Button variant="default" size="lg" className="rounded-full px-5">
                  {t("landing.nav.getStarted", "Sign Up")}
                </Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex lg:hidden"
            aria-label={t("landing.nav.toggleMenu", "Menu")}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mt-2 overflow-hidden rounded-2xl border border-border/60 bg-background/95 px-4 py-2 shadow-lg backdrop-blur-xl lg:hidden"
            >
              <div className="flex flex-col gap-1 py-2">
                <Link
                  to="/free-tool"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {t("landing.nav.freeTool", "Free Diagnostic")}
                </Link>
                <Link
                  to="/resources"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {t("landing.nav.resources", "Resources")}
                </Link>
                <div className="border-t border-border/40 my-1" />
                <div className="px-4 py-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t("locale.switch", "Language")}</p>
                  <div className="flex flex-wrap gap-1">
                    {["en", "fr", "es", "de", "nl", "pt", "it"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          switchLocale(lang);
                          setMobileOpen(false);
                        }}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${
                          currentLang === lang
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {FLAGS[lang]} {NATIVE_LABELS[lang]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border/40 pt-3">
                  {isLoaded && isSignedIn ? (
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                      <Button variant="default" size="sm" className="w-full rounded-full">
                        {t("landing.nav.dashboard", "Dashboard")}
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      to={AuthLoginRoute.fullPath}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button variant="default" size="sm" className="w-full rounded-full">
                        {t("landing.nav.getStarted", "Sign Up")}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default Nav;
