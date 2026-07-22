import { createFileRoute } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { Comparison } from "@/components/landing/comparison";
import { FreeToolConviction } from "@/components/landing/free-tool-conviction";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export const Route = createFileRoute("/")({
  component: LandingPage,
  beforeLoad: () => ({ title: "Antaios — EUDR Compliance Platform" }),
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <meta name="description" content="Antaios is an EUDR compliance platform for importers. Score your supply chain, generate due-diligence statements (DDS), and meet the EU Deforestation Regulation deadline. Start free." />
        <meta property="og:description" content="Antaios is an EUDR compliance platform for importers. Score your supply chain, generate due-diligence statements (DDS), and meet the EU Deforestation Regulation deadline. Start free." />
        <meta property="og:url" content="https://antaios.app" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://antaios.app" }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Do I still need to submit the DDS myself?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, submission to TRACES remains your responsibility. Antaios generates a complete, compliant DDS that you submit in a few clicks."
                }
              },
              {
                "@type": "Question",
                "name": "Is my data hosted in Europe?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all your data is stored on servers located in the European Union, in compliance with GDPR."
                }
              },
              {
                "@type": "Question",
                "name": "What happens after the 5-year retention period?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The regulation requires 5 years of retention. After this period, you can export your archives or request their deletion."
                }
              },
              {
                "@type": "Question",
                "name": "What is the difference between Antaios and Coolset or osapiens?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Antaios is designed for SMEs: flat rate at €500/month, setup in one afternoon, no long-term commitment."
                }
              },
              {
                "@type": "Question",
                "name": "Can I import data from an ERP?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Manual CSV/Excel import is available. API integration with major ERPs is in development."
                }
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Antaios",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "EUDR compliance platform for importers to manage due diligence statements and supply chain risk scoring",
            "url": "https://antaios.app",
            "offers": {
              "@type": "Offer",
              "price": "500",
              "priceCurrency": "EUR",
              "description": "Pro plan - flat rate monthly"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Antaios",
            "url": "https://antaios.app",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://antaios.app/resources?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": "Antaios EUDR Compliance Demo",
            "description": "See how Antaios extracts data from supplier documents, covers all 5 due-diligence criteria, and generates your DDS in minutes.",
            "thumbnailUrl": "https://picsum.photos/seed/eudr-hero/1280/720",
            "uploadDate": "2024-11-01",
            "duration": "PT2M",
            "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
          })}
        </script>
      </Helmet>
      <Nav />
      <main className="flex-1">
        <Hero />
        <ProblemSolution />
        <WorkflowSection />
        <Comparison />
        <FreeToolConviction />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
