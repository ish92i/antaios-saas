import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/country-west-africa")({
  component: CountryWestAfricaPage,
  beforeLoad: () => ({
    title: "EUDR Ghana & Côte d'Ivoire: Cocoa Compliance Guide — Antaios Resources",
  }),
});



function CountryWestAfricaPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Ghana & Côte d'Ivoire: Cocoa Compliance Guide"
        description="Comprehensive guide to EUDR compliance for West African cocoa supply chains. Covers Ghana and Côte d'Ivoire regulations, cooperative traceability, child labor considerations, and Antaios solutions."
        path="/resources/country-west-africa"
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
              {t("resources.country-west-africa.category", "Country Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.country-west-africa.readTime", "10 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.country-west-africa.title",
              "EUDR Ghana & Côte d'Ivoire: Cocoa Compliance Guide",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.country-west-africa.intro",
                "West Africa produces approximately 70 percent of the world's cocoa, with Côte d'Ivoire and Ghana alone accounting for over 55 percent of global output. The cocoa sector is the lifeblood of millions of smallholder farmers across the region, and the commodity flows through complex networks of cooperatives, buying agents, and exporters before reaching EU chocolate manufacturers. For operators importing cocoa from West Africa, EUDR compliance requires navigating unique challenges related to smallholder traceability, cooperative structures, and child labor concerns.",
              )}
            </p>

            <h2>
              {t("resources.country-west-africa.risk.title", "EUDR Risk Classification")}
            </h2>
            <p>
              {t(
                "resources.country-west-africa.risk.body",
                "Both Ghana and Côte d'Ivoire are classified as standard-risk countries under the EU's EUDR benchmarking system. This classification reflects moderate historical deforestation rates, though the cocoa sector has been a significant driver of forest loss in both countries. The classification means operators must conduct due diligence, including traceability to plot, geolocation data collection, and verification of compliance with applicable national legislation.",
              )}
            </p>
            <p>
              {t(
                "resources.country-west-africa.risk.body2",
                "Despite the standard-risk classification, cocoa supply chains from West Africa face heightened scrutiny due to the sector's well-documented deforestation history and ongoing child labor concerns. Importers should be prepared for regulators to pay close attention to evidence of legal compliance and social due diligence.",
              )}
            </p>

            <h2>
              {t("resources.country-west-africa.legislation.title", "Key National Legislation")}
            </h2>
            <p>
              {t(
                "resources.country-west-africa.legislation.body",
                "Ghana and Côte d'Ivoire have developed national frameworks for cocoa governance that interact with EUDR requirements. Understanding these frameworks is essential for demonstrating compliance with Article 10(2)(c).",
              )}
            </p>

            <h3>
              {t("resources.country-west-africa.legislation.cocoa-board.title", "Cocoa Board Regulation")}
            </h3>
            <p>
              {t(
                "resources.country-west-africa.legislation.cocoa-board.body",
                "Both countries operate through centralized cocoa marketing systems. In Côte d'Ivoire, the Conseil du Café-Cacao (CCC) regulates the cocoa sector, setting prices, licensing buyers, and overseeing quality standards. Ghana's Cocoa Board (COCOBOD) plays a similar role, managing the purchasing and marketing of cocoa through licensed buying companies. These institutions maintain records of licensed producers and purchasing volumes, which can support traceability efforts. However, the systems were not designed for plot-level traceability, so operators must supplement national records with additional data collection.",
              )}
            </p>

            <h3>
              {t("resources.country-west-africa.legislation.child-labor.title", "Child Labor Considerations")}
            </h3>
            <p>
              {t(
                "resources.country-west-africa.legislation.child-labor.body",
                "Child labor in cocoa production is a significant concern in both Ghana and Côte d'Ivoire. While the EU Deforestation Regulation does not specifically mandate child labor due diligence, the applicable legislation criterion of Article 10(2)(c) covers labor laws. Both countries have national action plans to combat child labor in cocoa, and the EU's Corporate Sustainability Due Diligence Directive (CSDDD) — which intersects with EUDR — may require operators to address human rights due diligence alongside deforestation. Importers should verify that their supply chains comply with national child labor laws and consider integrating social due diligence into their EUDR compliance programs.",
              )}
            </p>

            <h2>
              {t("resources.country-west-africa.traceability.title", "Traceability Challenges in West Africa")}
            </h2>
            <p>
              {t(
                "resources.country-west-africa.traceability.body",
                "West African cocoa supply chains are among the most complex for EUDR compliance, given the millions of smallholder farmers and the cooperative purchasing systems that dominate the sector.",
              )}
            </p>

            <p>
              <strong>{t("resources.country-west-africa.traceability.smallholders.title", "Millions of smallholders:")}</strong>{" "}
              {t(
                "resources.country-west-africa.traceability.smallholders.body",
                "Côte d'Ivoire has approximately 600,000 cocoa farming households, while Ghana has around 800,000. Most farm plots are between 2 and 5 hectares, and farmers typically sell their cocoa to village-level purchasing agents working for cooperatives or buying companies. The sheer number of producers makes individual plot-level traceability a significant logistical undertaking. Connecting a specific bag of cocoa beans back to the farm where it was grown requires detailed records at each stage of the purchasing process.",
              )}
            </p>

            <p>
              <strong>{t("resources.country-west-africa.traceability.cooperatives.title", "Cooperative and purchasing systems:")}</strong>{" "}
              {t(
                "resources.country-west-africa.traceability.cooperatives.body",
                "Cooperatives play a central role in West African cocoa supply chains. Farmers deliver their cocoa to cooperative collection points, where it is weighed, graded, and aggregated with produce from other farmers. The aggregated cocoa is then transported to regional depots and eventually to ports. At each aggregation point, traceability information must be maintained linking the volume to its source. Cooperatives vary significantly in their record-keeping capacity, and many lack the systems needed to meet EUDR traceability requirements without external support.",
              )}
            </p>

            <h2>
              {t("resources.country-west-africa.geolocation.title", "Geolocation Data Collection")}
            </h2>
            <p>
              {t(
                "resources.country-west-africa.geolocation.body",
                "Collecting geolocation data for West African cocoa farms presents substantial challenges. Many farms are in remote areas with limited infrastructure, and smallholders typically do not have GPS-mapped boundaries.",
              )}
            </p>
            <p>
              {t(
                "resources.country-west-africa.geolocation.body2",
                "Côte d'Ivoire has made progress through its national land tenure reform and the Programmation de la Domaine Forestier, which has mapped forest boundaries. Ghana's Land Use and Spatial Planning Authority has also developed mapping capabilities. However, neither country has systematic plot-level geolocation data for cocoa farms. Operators must invest in field-level data collection, typically through mobile GPS tools used by field officers or cooperatives during farm visits.",
              )}
            </p>
            <p>
              {t(
                "resources.country-west-africa.geolocation.body3",
                "The irregular shapes of smallholder farms and the lack of formal surveys mean that polygon data collection requires dedicated field programs. Several industry initiatives, including the World Cocoa Foundation's Cocoa & Forests Initiative, are working to develop geolocation data collection methodologies for West African cocoa. Importers should coordinate with these initiatives and their suppliers to ensure systematic coverage.",
              )}
            </p>

            <h2>
              {t("resources.country-west-africa.how-antaios.title", "How Antaios Helps with West African Supply Chains")}
            </h2>
            <p>
              {t(
                "resources.country-west-africa.how-antaios.body",
                "Antaios provides tools designed for the specific challenges of West African cocoa supply chains. Our platform handles the complexity of smallholder-dominated supply chains with millions of producers.",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.country-west-africa.how-antaios.feature1",
                  "Cooperative-level data management for bulk geolocation and production data submission from thousands of farmers",
                )}
              </li>
              <li>
                {t(
                  "resources.country-west-africa.how-antaios.feature2",
                  "Mobile data collection tools optimized for low-connectivity environments common in rural West Africa",
                )}
              </li>
              <li>
                {t(
                  "resources.country-west-africa.how-antaios.feature3",
                  "Flexible traceability models that work with cooperative purchasing systems and multi-stage aggregation",
                )}
              </li>
              <li>
                {t(
                  "resources.country-west-africa.how-antaios.feature4",
                  "Social due diligence modules to complement EUDR compliance with child labor and labor law verification",
                )}
              </li>
              <li>
                {t(
                  "resources.country-west-africa.how-antaios.feature5",
                  "Automated due-diligence statement generation and TRACES NT submission support",
                )}
              </li>
            </ul>
            <p>
              {t(
                "resources.country-west-africa.how-antaios.body2",
                "The West African cocoa sector is undergoing a traceability transformation driven by EUDR. Antaios helps cooperatives, buying companies, and EU importers build the systems needed to meet these requirements while supporting the millions of smallholders who depend on cocoa for their livelihoods.",
              )}
            </p>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-xl font-bold text-foreground">Related Resources</h2>
            <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
              <li>
                <Link to="/resources/commodity-cocoa" className="text-primary hover:underline">
                  EUDR Cocoa Compliance
                </Link>
                {" — "}Detailed requirements for cocoa operators.
              </li>
              <li>
                <Link to="/resources/eudr-checklist" className="text-primary hover:underline">
                  EUDR Compliance Checklist
                </Link>
                {" — "}Your 5-step guide to Article 10(2).
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
                "resources.country-west-africa.cta.title",
                "Not sure where you stand?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.country-west-africa.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.country-west-africa.cta.button", "Take the free diagnostic")}
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
