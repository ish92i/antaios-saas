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
        <meta name="description" content="Antaios gets EUDR compliance data from your suppliers. Upload documents, the system extracts and cross-checks data, chases missing info via the supplier portal, and generates your DDS. Unlimited shipments, plots, and suppliers." />
        <meta property="og:description" content="Antaios gets EUDR compliance data from your suppliers. Upload documents, the system extracts and cross-checks data, chases missing info via the supplier portal, and generates your DDS. Unlimited shipments, plots, and suppliers." />
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
                "name": "How does the supplier portal work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Suppliers receive a secure link via email or WhatsApp. They open it on any device — no account, no login, no app installation. They can submit plot coordinates, upload documents, and respond to data requests directly. Works for cooperatives, brokers, and individual producers."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use Antaios if my coffee comes through a broker?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Antaios is designed for real-world supply chains where lots are consolidated. Upload your broker documents, invoices, and export certificates. The system extracts what it can, identifies what's missing, and helps you request the missing origin data from your broker or the exporting cooperative."
                }
              },
              {
                "@type": "Question",
                "name": "What documents can I upload?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PDF invoices, bills of lading, export certificates, Excel spreadsheets, images of documents, and GeoJSON files. Antaios uses OCR and data extraction to pull structured information from unstructured documents, then cross-checks data across sources."
                }
              },
              {
                "@type": "Question",
                "name": "Is there a limit on shipments or plots?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. Antaios includes unlimited shipments, unlimited production plots, unlimited suppliers, and unlimited users. One flat fee covers everything — no per-shipment charges, no per-plot fees, no module add-ons."
                }
              },
              {
                "@type": "Question",
                "name": "How is Antaios different from plot screening tools?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Plot screening tools validate geometry and check deforestation. Antaios handles the full workflow: document ingestion, data extraction, supplier communication, evidence reconciliation, risk assessment, DDS generation, and compliance reporting. It's built for importers who need end-to-end compliance, not just plot validation."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need to hire a compliance person to use Antaios?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. Antaios is designed for small teams without dedicated compliance staff. Onboarding takes an afternoon. The platform guides you through each step — from uploading documents to filing your DDS — and the supplier portal handles data collection so you don't have to chase information manually."
                }
              },
              {
                "@type": "Question",
                "name": "What about the 5-year audit trail?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Every action in Antaios is recorded automatically — document uploads, supplier requests, data changes, risk assessments, and DDS submissions. Records are retained for the full 5-year regulatory period. You can export your compliance file at any time or hand it directly to an auditor."
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
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "15"
            },
            "featureList": [
              "Supplier portal",
              "Document ingestion with OCR",
              "Unlimited shipments and plots",
              "DDS generation",
              "Deforestation scanning",
              "5-year audit trail",
              "PDF compliance report"
            ]
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
            "thumbnailUrl": "https://antaios.app/images/og-image.png",
            "uploadDate": "2024-11-01",
            "duration": "PT2M",
            "embedUrl": "https://antaios.app/antaios-final-with-vo-v5.mp4"
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
