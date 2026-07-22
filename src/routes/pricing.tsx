import { createFileRoute } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { Nav } from "@/components/landing/nav";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  beforeLoad: () => ({ title: "Antaios — Pricing" }),
});

function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>Antaios — Pricing</title>
        <meta
          name="description"
          content="See Antaios pricing. EUDR compliance platform at 500 EUR/month. Unlimited shipments, DDS generation, satellite monitoring, and supplier portal."
        />
        <meta property="og:title" content="Antaios — Pricing" />
        <meta
          property="og:description"
          content="See Antaios pricing. EUDR compliance platform at 500 EUR/month. Unlimited shipments, DDS generation, satellite monitoring, and supplier portal."
        />
        <meta property="og:url" content="https://antaios.app/pricing" />
        <link rel="canonical" href="https://antaios.app/pricing" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://antaios.app",
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Pricing",
                "item": "https://antaios.app/pricing",
              },
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Antaios",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "url": "https://antaios.app/pricing",
            "offers": {
              "@type": "Offer",
              "price": "500",
              "priceCurrency": "EUR",
              "billingIncrement": "P1M",
              "description": "EUDR compliance platform - unlimited shipments, DDS generation, satellite monitoring, supplier portal"
            }
          })}
        </script>
      </Helmet>
      <Nav />
      <main className="flex-1">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
