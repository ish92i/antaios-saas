import { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Outlet,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import React, { Suspense, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import siteConfig from "~/site.config";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { upgradeToFullAnalytics } from "@/lib/analytics";
import { getConsent } from "@/hooks/use-consent";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

const HREFLANG_LOCALES = ["en", "fr", "es", "de", "nl", "pt", "it"];

const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
  nl: "nl_NL",
  pt: "pt_PT",
  it: "it_IT",
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => {
    const router = useRouter();
    const { pathname } = useLocation();
    const { i18n } = useTranslation();
    const currentLang = i18n.language?.split("-")[0] || "en";
    const matchWithTitle = [...router.state.matches]
      .reverse()
      .find((d) => (d as { routeContext?: { title?: string } }).routeContext?.title);
    const title = (matchWithTitle as { routeContext?: { title?: string } } | undefined)?.routeContext?.title || siteConfig.siteTitle;

    const journey = useJourneyTracking();

    useEffect(() => {
      journey.initJourney();
    }, [journey]);

    useEffect(() => {
      journey.trackPageView(pathname);
    }, [pathname, journey]);

    useEffect(() => {
      const consent = getConsent();
      if (consent?.choice === "accepted" && consent.analytics) {
        upgradeToFullAnalytics();
      }
    }, []);

    useEffect(() => {
      const lang = HREFLANG_LOCALES.includes(currentLang) ? currentLang : "en";
      document.documentElement.lang = lang;
    }, [currentLang]);

    const canonicalUrl = `${siteConfig.siteUrl}${pathname}`;

    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.siteTitle,
      url: siteConfig.siteUrl,
      description: siteConfig.siteDescription,
    };

    return (
      <>
        <Outlet />
        <CookieConsentBanner />
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={siteConfig.siteDescription} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={siteConfig.siteDescription} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={siteConfig.siteImage} />
          <meta property="og:locale" content={OG_LOCALE_MAP[currentLang] || "en_US"} />
          <meta property="og:site_name" content={siteConfig.siteTitle} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={siteConfig.siteDescription} />
          <meta name="twitter:image" content={siteConfig.siteImage} />
          <link rel="canonical" href={canonicalUrl} />
          <link rel="alternate" href={siteConfig.siteUrl} hrefLang="x-default" />
          <script type="application/ld+json">
            {JSON.stringify(orgSchema)}
          </script>
        </Helmet>
        <Suspense>
          <TanStackRouterDevtools />
        </Suspense>
      </>
    );
  },
});
