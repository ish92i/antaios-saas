import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/country-brazil")({
  component: CountryBrazilPage,
  beforeLoad: () => ({
    title: "EUDR Brazil: Soy, Cattle & Wood Compliance Guide — Antaios Resources",
  }),
});



function CountryBrazilPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Brazil: Soy, Cattle & Wood Compliance Guide"
        description="Complete guide to EUDR compliance for Brazilian soy, cattle, and wood supply chains. Covers the Forest Code, Amazon Soy Moratorium, indirect procurement challenges, and Antaios solutions."
        path="/resources/country-brazil"
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
              {t("resources.country-brazil.category", "Country Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.country-brazil.readTime", "10 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.country-brazil.title",
              "EUDR Brazil: Soy, Cattle & Wood Compliance Guide",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.country-brazil.intro",
                "Brazil is a global agricultural powerhouse and one of the world's largest producers of soy, beef, and wood products. The country supplies a significant share of EU imports across all three EUDR-regulated commodity groups. Brazilian supply chains are often multi-layered, involving producers, traders, processors, and exporters across vast geographic areas. Understanding the regulatory landscape and traceability requirements is essential for any operator sourcing from Brazil.",
              )}
            </p>

            <h2>
              {t("resources.country-brazil.risk.title", "EUDR Risk Classification")}
            </h2>
            <p>
              {t(
                "resources.country-brazil.risk.body",
                "Brazil's EUDR risk classification varies by commodity and region. While Brazil as a whole is classified as high risk, the EU benchmarking system also considers specific risk indicators at the sub-national level. The Amazon biome, in particular, has experienced significant deforestation linked to cattle ranching and soy expansion. Operators importing from Brazil must conduct enhanced due diligence regardless of the specific classification, given the scale of historical deforestation and the complexity of Brazilian supply chains.",
              )}
            </p>
            <p>
              {t(
                "resources.country-brazil.risk.body2",
                "The high-risk classification means importers must provide robust evidence of compliance with Brazilian legislation, including the Forest Code, and demonstrate traceability to the plot of origin. Regulators will pay particular attention to products sourced from areas with recent deforestation alerts.",
              )}
            </p>

            <h2>
              {t("resources.country-brazil.legislation.title", "Key Brazilian Legislation")}
            </h2>
            <p>
              {t(
                "resources.country-brazil.legislation.body",
                "Brazil has a well-developed legal framework for environmental and land-use regulation. For EUDR purposes, the following pieces of legislation are particularly relevant for demonstrating compliance with Article 10(2)(c).",
              )}
            </p>

            <h3>
              {t("resources.country-brazil.legislation.forest-code.title", "The Forest Code (Lei Florestal)")}
            </h3>
            <p>
              {t(
                "resources.country-brazil.legislation.forest-code.body",
                "Brazil's Forest Code (Law No. 12.651/2012) is the cornerstone of the country's environmental regulation for private land. It establishes rules for preserving native vegetation on private properties, including legal reserves (reserva legal) and areas of permanent protection (APPs). The Forest Code requires rural properties to maintain a minimum percentage of native vegetation — typically 80 percent in the Amazon biome and 20 percent in other regions. For EUDR compliance, importers must verify that production areas comply with Forest Code requirements and that any deforestation occurred within legal limits.",
              )}
            </p>

            <h3>
              {t("resources.country-brazil.legislation.soy-moratorium.title", "Amazon Soy Moratorium")}
            </h3>
            <p>
              {t(
                "resources.country-brazil.legislation.soy-moratorium.body",
                "Since 2006, the Amazon Soy Moratorium has prohibited the purchase of soy grown on lands deforested after July 2008 in the Amazon biome. This voluntary agreement between major traders and NGOs has been remarkably effective in reducing soy-driven deforestation in the region. For EUDR purposes, importers should verify that soy sourced from the Amazon region falls within the moratorium framework. However, soy from the Cerrado biome — where no equivalent moratorium exists — remains a higher deforestation risk.",
              )}
            </p>

            <h3>
              {t("resources.country-brazil.legislation.cattle-agreements.title", "Cattle Agreements")}
            </h3>
            <p>
              {t(
                "resources.country-brazil.legislation.cattle-agreements.body",
                "Similar to the soy moratorium, the Cattle Agreements (initiated in 2009) aim to eliminate deforestation from the beef supply chain. Major retailers and meatpackers committed to sourcing only from farms that are not on the list of properties with illegal deforestation detected by Brazil's PRODES satellite monitoring system. These agreements cover direct suppliers but have historically struggled with indirect procurement — cattle moved between farms before reaching the processing plant. This indirect supply chain challenge is a key concern for EUDR compliance.",
              )}
            </p>

            <h2>
              {t("resources.country-brazil.traceability.title", "Traceability Challenges in Brazil")}
            </h2>
            <p>
              {t(
                "resources.country-brazil.traceability.body",
                "Brazilian supply chains present distinctive traceability challenges that require careful management by EU importers.",
              )}
            </p>

            <p>
              <strong>{t("resources.country-brazil.traceability.indirect.title", "Indirect procurement and cattle movement:")}</strong>{" "}
              {t(
                "resources.country-brazil.traceability.indirect.body",
                "In the Brazilian cattle sector, animals are often moved between multiple farms — from breeding to backgrounding to finishing — before reaching the slaughterhouse. This practice, known as indirect procurement, makes it difficult to trace beef back to the specific plot where the animal was raised. The Cattle Agreements have focused on direct suppliers, but EUDR requires traceability that extends further back in the chain. Operators must establish systems to track cattle movements across the full supply chain.",
              )}
            </p>

            <p>
              <strong>{t("resources.country-brazil.traceability.soy-complexity.title", "Soy supply chain complexity:")}</strong>{" "}
              {t(
                "resources.country-brazil.traceability.soy-complexity.body",
                "Soy is often aggregated at silos and ports, mixing production from multiple farms and regions. Brazil's massive logistics infrastructure — including the Arc of Deforestation states like Mato Grosso, Pará, and Maranhão — means that soy may pass through multiple intermediaries before export. Traceability systems must be able to allocate specific volumes to specific production plots even after aggregation.",
              )}
            </p>

            <p>
              <strong>{t("resources.country-brazil.traceability.wood-challenges.title", "Wood and timber traceability:")}</strong>{" "}
              {t(
                "resources.country-brazil.traceability.wood-challenges.body",
                "Brazilian timber supply chains involve legal and illegal logging, with products moving through multiple processing stages. The country has implemented a Forest Authorization System (SAF) for legal timber, but enforcement varies by state. Importers must verify that wood products originate from legally harvested sources with proper documentation through the chain of custody.",
              )}
            </p>

            <h2>
              {t("resources.country-brazil.geolocation.title", "Geolocation Data Collection")}
            </h2>
            <p>
              {t(
                "resources.country-brazil.geolocation.body",
                "Brazil has relatively advanced geolocation infrastructure compared to some other EUDR-regulated countries. CAR (Cadastro Ambiental Rural) — the national rural environmental registry — requires property boundaries to be mapped using GPS coordinates. This provides a foundation for EUDR geolocation requirements.",
              )}
            </p>
            <p>
              {t(
                "resources.country-brazil.geolocation.body2",
                "However, challenges remain. CAR registration is not universal, and data quality varies. Many properties, particularly smaller farms, have incomplete or inaccurate boundary data. For cattle supply chains, the challenge extends beyond individual farm boundaries to tracking animal movements between properties. Soy and wood supply chains require linking geolocation data through aggregation and processing points.",
              )}
            </p>
            <p>
              {t(
                "resources.country-brazil.geolocation.body3",
                "Operators must ensure they can obtain polygon coordinates for plots larger than 4 hectares and point coordinates for smaller plots. Integration with CAR data, satellite monitoring systems, and field-level data collection programs is essential for building a complete geolocation dataset.",
              )}
            </p>

            <h2>
              {t("resources.country-brazil.how-antaios.title", "How Antaios Helps with Brazilian Supply Chains")}
            </h2>
            <p>
              {t(
                "resources.country-brazil.how-antaios.body",
                "Antaios is built to handle the complexity of Brazilian supply chains across soy, cattle, and wood. Our platform provides the tools operators need to meet EUDR requirements without rebuilding existing supply chain relationships.",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.country-brazil.how-antaios.feature1",
                  "Multi-tier traceability mapping that captures indirect procurement relationships in cattle supply chains",
                )}
              </li>
              <li>
                {t(
                  "resources.country-brazil.how-antaios.feature2",
                  "Integration with CAR data and satellite deforestation monitoring for automated compliance checks",
                )}
              </li>
              <li>
                {t(
                  "resources.country-brazil.how-antaios.feature3",
                  "Bulk geolocation data management for large-scale producers and cooperatives",
                )}
              </li>
              <li>
                {t(
                  "resources.country-brazil.how-antaios.feature4",
                  "Real-time alerts when deforestation is detected on supply chain plots",
                )}
              </li>
              <li>
                {t(
                  "resources.country-brazil.how-antaios.feature5",
                  "Automated due-diligence statement generation compliant with TRACES NT requirements",
                )}
              </li>
            </ul>
            <p>
              {t(
                "resources.country-brazil.how-antaios.body2",
                "Whether you source soy from Mato Grosso, beef from Pará, or timber from the Atlantic Forest, Antaios provides the visibility and documentation infrastructure required for EUDR compliance. Our platform scales from individual operators to enterprise-level supply chain management.",
              )}
            </p>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-xl font-bold text-foreground">Related Resources</h2>
            <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
              <li>
                <Link to="/resources/commodity-soy" className="text-primary hover:underline">
                  EUDR Soy Compliance
                </Link>
                {" — "}Requirements for soy importers.
              </li>
              <li>
                <Link to="/resources/commodity-cattle" className="text-primary hover:underline">
                  EUDR Cattle Compliance
                </Link>
                {" — "}What beef and leather importers need to know.
              </li>
              <li>
                <Link to="/resources/commodity-wood" className="text-primary hover:underline">
                  EUDR Wood Compliance
                </Link>
                {" — "}Wood product requirements explained.
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.country-brazil.cta.title",
                "Not sure where you stand?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.country-brazil.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.country-brazil.cta.button", "Take the free diagnostic")}
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
