import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/country-vietnam")({
  component: CountryVietnamPage,
  beforeLoad: () => ({
    title: "EUDR Vietnam: Rubber & Coffee Compliance Guide — Antaios Resources",
  }),
});



function CountryVietnamPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Vietnam: Rubber & Coffee Compliance Guide"
        description="Guide to EUDR compliance for Vietnamese rubber and coffee supply chains. Covers the Forestry Law, smallholder traceability, geolocation collection, and how Antaios supports compliance."
        path="/resources/country-vietnam"
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
              {t("resources.country-vietnam.category", "Country Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.country-vietnam.readTime", "10 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.country-vietnam.title",
              "EUDR Vietnam: Rubber & Coffee Compliance Guide",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.country-vietnam.intro",
                "Vietnam is one of the world's largest producers and exporters of natural rubber and coffee. The country's rubber plantations span the Central Highlands and Southeast regions, while coffee — particularly robusta — is concentrated in the Central Highlands provinces of Đắk Lắk, Lâm Đồng, and Gia Lai. For EU importers, Vietnamese supply chains present specific traceability challenges, particularly given the dominance of smallholder farming. This guide covers the regulatory landscape, traceability requirements, and how to maintain EUDR-compliant supply chains from Vietnam.",
              )}
            </p>

            <h2>
              {t("resources.country-vietnam.risk.title", "EUDR Risk Classification")}
            </h2>
            <p>
              {t(
                "resources.country-vietnam.risk.body",
                "Vietnam is classified as a standard-risk country under the EU's EUDR benchmarking system. While not high risk, standard-risk classification still requires operators to conduct due diligence, including traceability to plot, geolocation data collection, and verification of compliance with Vietnamese legislation. The classification reflects Vietnam's relatively lower historical deforestation rates compared to tropical peers, but deforestation and land-use change remain concerns in certain regions.",
              )}
            </p>
            <p>
              {t(
                "resources.country-vietnam.risk.body2",
                "For rubber supply chains, the key risk area is conversion of natural forests to rubber plantations, which has occurred in parts of Laos, Cambodia, and southern Vietnam. Coffee expansion has historically driven deforestation in the Central Highlands, though recent policies have aimed to curb this. Operators must assess these risks at the supply chain level regardless of the country-wide classification.",
              )}
            </p>

            <h2>
              {t("resources.country-vietnam.legislation.title", "Key Vietnamese Legislation")}
            </h2>
            <p>
              {t(
                "resources.country-vietnam.legislation.body",
                "Vietnam has developed a legal framework for forestry and agriculture that interacts with EUDR requirements. Demonstrating compliance with these laws is necessary for meeting the applicable legislation criterion of Article 10(2)(c).",
              )}
            </p>

            <h3>
              {t("resources.country-vietnam.legislation.forestry-law.title", "Vietnam's Forestry Law")}
            </h3>
            <p>
              {t(
                "resources.country-vietnam.legislation.forestry-law.body",
                "Vietnam's Forestry Law (Law No. 16/2017/QH14) regulates forest management, use, and protection. The law establishes categories of forest — special-use, protection, and production — and sets rules for forest allocation, conversion, and harvesting. For EUDR purposes, importers must verify that rubber and wood products do not originate from illegal deforestation or forest conversion. The law also governs the issuance of forest certificates and land-use rights, which are key documents for demonstrating legal production.",
              )}
            </p>

            <h3>
              {t("resources.country-vietnam.legislation.coffee-programs.title", "Coffee Sustainability Programs")}
            </h3>
            <p>
              {t(
                "resources.country-vietnam.legislation.coffee-programs.body",
                "Vietnam has participated in various coffee sustainability initiatives, including the 4C (Common Code for the Coffee Community) and Rainforest Alliance certification programs. These programs establish environmental standards for coffee production, including restrictions on deforestation and requirements for sustainable farming practices. While not specifically designed for EUDR compliance, certified supply chains often have traceability and documentation systems that can support EUDR due diligence. Importers should verify the scope and rigor of certification programs used by their Vietnamese suppliers.",
              )}
            </p>

            <h2>
              {t("resources.country-vietnam.traceability.title", "Traceability Challenges in Vietnam")}
            </h2>
            <p>
              {t(
                "resources.country-vietnam.traceability.body",
                "Vietnamese rubber and coffee supply chains are dominated by smallholder farmers, creating traceability complexities that importers must address.",
              )}
            </p>

            <p>
              <strong>{t("resources.country-vietnam.traceability.smallholders.title", "Smallholder-dominated supply chains:")}</strong>{" "}
              {t(
                "resources.country-vietnam.traceability.smallholders.body",
                "An estimated 90 percent of Vietnam's coffee is produced by smallholder farmers, typically on plots of 1-3 hectares. Rubber production is similarly fragmented, though large state-owned and private plantations also play a significant role. Smallholders often sell to village-level collectors or cooperatives, making it challenging to trace specific batches back to individual farm plots. The aggregation points where smallholder produce is combined create natural breaks in the traceability chain that must be documented.",
              )}
            </p>

            <p>
              <strong>{t("resources.country-vietnam.traceability.rubber-specific.title", "Rubber supply chain structure:")}</strong>{" "}
              {t(
                "resources.country-vietnam.traceability.rubber-specific.body",
                "Vietnam's rubber industry involves tapping, processing, and exporting through multiple channels. Smallholder rubber is typically collected by processing factories, which aggregate latex from hundreds or thousands of individual tappers. The factory then processes this into semi-finished or finished rubber products. Traceability must account for this aggregation, requiring factories to maintain records linking input volumes to specific supply areas and collection dates.",
              )}
            </p>

            <h2>
              {t("resources.country-vietnam.geolocation.title", "Geolocation Data Collection")}
            </h2>
            <p>
              {t(
                "resources.country-vietnam.geolocation.body",
                "Collecting geolocation data in Vietnam requires navigating both logistical and administrative challenges. While Vietnam has made progress in land-use mapping and forest inventory, plot-level geolocation data for smallholder agriculture is not systematically available.",
              )}
            </p>
            <p>
              {t(
                "resources.country-vietnam.geolocation.body2",
                "For rubber plantations, geolocation is relatively straightforward — large plantations have documented boundaries, and satellite imagery can verify extent. For smallholder coffee farms, the challenge is greater. Plots are often irregularly shaped, may not have formal survey data, and are located in areas with varying terrain. Field-level data collection using mobile GPS tools is the most reliable approach, but requires coordination with farmers or cooperatives.",
              )}
            </p>
            <p>
              {t(
                "resources.country-vietnam.geolocation.body3",
                "Vietnam's digital infrastructure supports mobile data collection in most areas, though remote mountainous regions may have limited connectivity. Operators should plan for offline data collection capabilities and establish protocols for verifying and uploading geolocation data from field visits.",
              )}
            </p>

            <h2>
              {t("resources.country-vietnam.how-antaios.title", "How Antaios Helps with Vietnamese Supply Chains")}
            </h2>
            <p>
              {t(
                "resources.country-vietnam.how-antaios.body",
                "Antaios provides tools specifically designed for smallholder-dominated supply chains like Vietnam's. Our platform addresses the core challenges of traceability, geolocation, and compliance documentation.",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.country-vietnam.how-antaios.feature1",
                  "Cooperative-level data management allowing bulk submission of smallholder geolocation and production records",
                )}
              </li>
              <li>
                {t(
                  "resources.country-vietnam.how-antaios.feature2",
                  "Mobile-optimized geolocation collection tools for field use in remote coffee and rubber growing areas",
                )}
              </li>
              <li>
                {t(
                  "resources.country-vietnam.how-antaios.feature3",
                  "Flexible traceability models that accommodate aggregation at collection points and processing facilities",
                )}
              </li>
              <li>
                {t(
                  "resources.country-vietnam.how-antaios.feature4",
                  "Automated compliance checks against Vietnamese forestry legislation and land-use regulations",
                )}
              </li>
              <li>
                {t(
                  "resources.country-vietnam.how-antaios.feature5",
                  "Dashboard reporting for EUDR due-diligence statements and TRACES NT submission",
                )}
              </li>
            </ul>
            <p>
              {t(
                "resources.country-vietnam.how-antaios.body2",
                "Vietnam's supply chains are manageable with the right tools. Antaios helps you build traceability from the smallholder level through processing and export, ensuring your imports meet EUDR requirements without disrupting established supply relationships.",
              )}
            </p>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-xl font-bold text-foreground">Related Resources</h2>
            <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
              <li>
                <Link to="/resources/commodity-rubber" className="text-primary hover:underline">
                  EUDR Rubber Compliance
                </Link>
                {" — "}Requirements for rubber importers.
              </li>
              <li>
                <Link to="/resources/commodity-coffee" className="text-primary hover:underline">
                  EUDR Coffee Compliance
                </Link>
                {" — "}What coffee importers need to know.
              </li>
              <li>
                <Link to="/resources/eudr-geolocation" className="text-primary hover:underline">
                  EUDR Geolocation Requirements
                </Link>
                {" — "}GPS and polygon data requirements explained.
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.country-vietnam.cta.title",
                "Not sure where you stand?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.country-vietnam.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.country-vietnam.cta.button", "Take the free diagnostic")}
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
