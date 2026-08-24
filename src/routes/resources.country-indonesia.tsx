import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/country-indonesia")({
  component: CountryIndonesiaPage,
  beforeLoad: () => ({
    title: "EUDR Indonesia: Palm Oil & Rubber Compliance Guide — Antaios Resources",
  }),
});



function CountryIndonesiaPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Indonesia: Palm Oil & Rubber Compliance Guide"
        description="Comprehensive guide to EUDR compliance for Indonesian palm oil and rubber supply chains. Covers ISPO certification, smallholder traceability, geolocation challenges, and how to meet EU requirements."
        path="/resources/country-indonesia"
        datePublished="2024-12-01"
        category="Country Guide"
      />
      <Nav />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-20">
          <Link
            to="/resources"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("resources.article.back", "Back to resources")}
          </Link>

          <div className="mb-8 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Tag className="h-3 w-3" />
              {t("resources.country-indonesia.category", "Country Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.country-indonesia.readTime", "10 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.country-indonesia.title",
              "EUDR Indonesia: Palm Oil & Rubber Compliance Guide",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.country-indonesia.intro",
                "Indonesia is the world's largest producer of palm oil, accounting for roughly 58 percent of global output. The country also produces significant quantities of natural rubber, much of it sourced from smallholder farms across Sumatra, Kalimantan, and Sulawesi. For EU importers, Indonesian supply chains present both opportunity and complexity under the EU Deforestation Regulation (EUDR). This guide covers what you need to know to maintain compliant supply chains from Indonesia.",
              )}
            </p>

            <h2>
              {t("resources.country-indonesia.risk.title", "EUDR Risk Classification")}
            </h2>
            <p>
              {t(
                "resources.country-indonesia.risk.body",
                "The European Commission's benchmarking system classifies countries by deforestation risk. Indonesia is classified as high risk, meaning operators importing from Indonesia must conduct enhanced due diligence. This classification reflects Indonesia's historical deforestation rates, particularly in peatland areas and rainforest conversion for palm oil expansion. High-risk classification does not prohibit trade — it mandates thorough documentation, robust traceability, and verifiable compliance with applicable legislation.",
              )}
            </p>
            <p>
              {t(
                "resources.country-indonesia.risk.body2",
                "Being classified as high risk means your due-diligence statements will face stricter scrutiny. Regulators expect detailed evidence of traceability to plot level, geolocation data for all production areas, and demonstration that the products were produced in compliance with Indonesian land-use and environmental laws.",
              )}
            </p>

            <h2>
              {t("resources.country-indonesia.legislation.title", "Key Indonesian Legislation")}
            </h2>
            <p>
              {t(
                "resources.country-indonesia.legislation.body",
                "Indonesia has developed its own sustainability frameworks that interact with EUDR requirements. Understanding these is essential for demonstrating compliance with the applicable legislation criterion of Article 10(2)(c).",
              )}
            </p>

            <h3>
              {t("resources.country-indonesia.legislation.ispo.title", "Indonesian Sustainable Palm Oil (ISPO) Certification")}
            </h3>
            <p>
              {t(
                "resources.country-indonesia.legislation.ispo.body",
                "ISPO is Indonesia's mandatory certification scheme for palm oil producers. Established by Presidential Regulation No. 44/2020, ISPO aims to improve the sustainability of Indonesian palm oil by setting standards for environmental management, social responsibility, and good agricultural practices. While ISPO certification alone does not guarantee EUDR compliance, it provides a baseline of documented practices that can support your due-diligence evidence. Importers should verify that suppliers hold valid ISPO certificates and cross-reference these with plot-level data.",
              )}
            </p>

            <h3>
              {t("resources.country-indonesia.legislation.moratorium.title", "Palm Oil Concession Moratorium")}
            </h3>
            <p>
              {t(
                "resources.country-indonesia.legislation.moratorium.body",
                "Indonesia has maintained various forms of moratorium on new palm oil concessions in primary forest and peatland areas since 2011, extended through subsequent regulations. This moratorium is a key piece of legislation for EUDR purposes, as it directly relates to land-use rights and deforestation. Importers must verify that the plots supplying their products are not within moratorium areas and that any new plantings occurred legally.",
              )}
            </p>

            <h2>
              {t("resources.country-indonesia.traceability.title", "Traceability Challenges in Indonesia")}
            </h2>
            <p>
              {t(
                "resources.country-indonesia.traceability.body",
                "Indonesian supply chains are among the most complex in the world for EUDR compliance. Millions of smallholder farmers produce palm oil and rubber, often selling through cooperatives or intermediary collectors. This fragmented landscape creates significant traceability challenges.",
              )}
            </p>

            <p>
              <strong>{t("resources.country-indonesia.traceability.smallholders", "Smallholder complexity:")}</strong>{" "}
              {t(
                "resources.country-indonesia.traceability.smallholdersBody",
                "An estimated 2.7 million smallholder families are involved in palm oil production in Indonesia. Many operate plots smaller than 4 hectares, often without formal land titles or GPS-mapped boundaries. Connecting a specific batch of palm oil back to the individual farm plot — as required by EUDR — demands either field-level data collection or a robust mass-balance system with documented allocation methodologies.",
              )}
            </p>

            <p>
              <strong>{t("resources.country-indonesia.traceability.cooperatives", "Cooperative and mill systems:")}</strong>{" "}
              {t(
                "resources.country-indonesia.traceability.cooperativesBody",
                "Palm oil is typically collected at village-level collection points before being transported to mills. At the mill, fruit from multiple smallholders is processed together, making it difficult to trace individual batches. Cooperatives can help bridge this gap, but they must maintain accurate records linking each member's production to specific delivery dates and volumes.",
              )}
            </p>

            <h2>
              {t("resources.country-indonesia.geolocation.title", "Geolocation Data Collection")}
            </h2>
            <p>
              {t(
                "resources.country-indonesia.geolocation.body",
                "Collecting geolocation data in Indonesia presents unique logistical challenges. Many production areas are in remote regions with limited mobile connectivity. Smallholders may lack GPS devices or the technical skills to collect polygon coordinates accurately.",
              )}
            </p>
            <p>
              {t(
                "resources.country-indonesia.geolocation.body2",
                "For plots larger than 4 hectares, EUDR requires polygon coordinates — not just a single point. In practice, this means mapping the boundaries of each production plot. Several approaches are emerging in Indonesia: field officer programs where trained staff visit farms with GPS devices, drone-based mapping for larger plantations, and integration with existing ISPO audit processes where auditors collect geolocation data during certification visits.",
              )}
            </p>
            <p>
              {t(
                "resources.country-indonesia.geolocation.body3",
                "Storage and collection facilities also require geolocation data. Importers must maintain a chain of coordinates from the production plot through each aggregation and storage point to the port of export. Offline-capable mobile applications are essential for remote areas where connectivity is unreliable.",
              )}
            </p>

            <h2>
              {t("resources.country-indonesia.how-antaios.title", "How Antaios Helps with Indonesian Supply Chains")}
            </h2>
            <p>
              {t(
                "resources.country-indonesia.how-antaios.body",
                "Antaios provides purpose-built tools for managing EUDR compliance in complex supply chains like Indonesia's. Our platform addresses the specific challenges of smallholder-dominated supply chains with scalable traceability solutions.",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.country-indonesia.how-antaios.feature1",
                  "Automated traceability mapping from plot to port, handling multi-tier supplier structures common in Indonesian palm oil",
                )}
              </li>
              <li>
                {t(
                  "resources.country-indonesia.how-antaios.feature2",
                  "Geolocation data collection tools designed for offline use, critical for remote Indonesian production areas",
                )}
              </li>
              <li>
                {t(
                  "resources.country-indonesia.how-antaios.feature3",
                  "Bulk upload capabilities for smallholder data, allowing cooperatives to submit geolocation and production records efficiently",
                )}
              </li>
              <li>
                {t(
                  "resources.country-indonesia.how-antaios.feature4",
                  "Continuous monitoring of deforestation alerts linked to your supply chain plots",
                )}
              </li>
              <li>
                {t(
                  "resources.country-indonesia.how-antaios.feature5",
                  "Pre-formatted due-diligence statements ready for TRACES NT submission",
                )}
              </li>
            </ul>
            <p>
              {t(
                "resources.country-indonesia.how-antaios.body2",
                "With Indonesia classified as high risk, having a systematic approach to compliance is not optional — it is a business requirement. Antaios helps you build that system without rebuilding your supply chain from scratch.",
              )}
            </p>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-xl font-bold text-foreground">Related Resources</h2>
            <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
              <li>
                <Link to="/resources/commodity-palm-oil" className="text-primary hover:underline">
                  EUDR Palm Oil Compliance
                </Link>
                {" — "}Detailed requirements for palm oil operators.
              </li>
              <li>
                <Link to="/resources/commodity-rubber" className="text-primary hover:underline">
                  EUDR Rubber Compliance
                </Link>
                {" — "}What rubber importers need to know.
              </li>
              <li>
                <Link to="/resources/eudr-checklist" className="text-primary hover:underline">
                  EUDR Compliance Checklist
                </Link>
                {" — "}Your 5-step guide to Article 10(2).
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.country-indonesia.cta.title",
                "Not sure where you stand?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.country-indonesia.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.country-indonesia.cta.button", "Take the free diagnostic")}
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
