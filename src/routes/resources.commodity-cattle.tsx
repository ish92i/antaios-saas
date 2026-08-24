import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/commodity-cattle")({
  component: CommodityCattlePage,
  beforeLoad: () => ({
    title: "EUDR Cattle & Leather Compliance Guide — Antaios Resources",
  }),
});

function CommodityCattlePage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Cattle & Leather Compliance Guide"
        description="How the EU Deforestation Regulation applies to cattle products and leather. Covers key sourcing countries in South America, indirect procurement challenges, traceability requirements, and compliance strategies."
        path="/resources/commodity-cattle"
        datePublished="2025-02-15"
        category="Commodity Guide"
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
              {t("resources.cattle.category", "Commodity Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.cattle.readTime", "10 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.cattle.title",
              "EUDR Cattle & Leather Compliance Guide",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.cattle.intro",
                "Cattle products — including beef, live animals, hides, and leather — are among the most challenging commodity categories under the EU Deforestation Regulation (EU) 2023/1115. Cattle-driven deforestation is the single largest cause of tropical forest loss globally, and the EU's regulatory response reflects this. This guide covers the cattle-specific compliance requirements, the South American sourcing landscape, and the unique traceability challenges posed by indirect leather procurement and fragmented supply chains.",
              )}
            </p>

            <h2>
              {t("resources.cattle.scope.title", "What Counts as Cattle Under EUDR")}
            </h2>
            <p>
              {t(
                "resources.cattle.scope.body",
                "EUDR covers cattle in all its forms: live animals, meat (fresh, frozen, or processed), hides and skins, leather, and any product containing cattle-derived materials. This includes leather goods, footwear, automotive upholstery, and gelatin. The critical question is whether the cattle — or the land on which they were raised — was involved in deforestation after 31 December 2020. Unlike some other commodities, cattle products can be traced through the livestock supply chain: from farm to feedlot to slaughterhouse to processor to exporter. However, each step introduces potential traceability gaps, particularly in countries with fragmented farming systems.",
              )}
            </p>
            <p>
              {t(
                "resources.cattle.scope.exemption",
                "Products made entirely from recycled cattle materials are exempt. However, most cattle products in the EU supply chain are virgin, and the exemption is narrow in practice.",
              )}
            </p>

            <h2>
              {t("resources.cattle.countries.title", "Key Sourcing Countries")}
            </h2>
            <p>
              {t(
                "resources.cattle.countries.intro",
                "The EU imports cattle products primarily from South America, where cattle ranching has been a major driver of deforestation:",
              )}
            </p>

            <h3>{t("resources.cattle.countries.brazil.title", "Brazil")}</h3>
            <p>
              {t(
                "resources.cattle.countries.brazil.body",
                "Brazil is the world's largest beef exporter and the EU's primary source of imported cattle products. Deforestation risk is concentrated in the Amazon basin and, increasingly, in the Cerrado. Brazilian cattle supply chains are complex: animals may be born on one farm, raised on another, and finished on a third before reaching the slaughterhouse. The Brazilian government's DPI (Declaração do Pecuário Informatizada) system and the CAR (Cadastro Ambiental Rural) provide traceability infrastructure, but gaps remain — particularly for indirect suppliers. Importers must trace cattle back to the farm of birth, not just the farm of last ownership.",
              )}
            </p>

            <h3>{t("resources.cattle.countries.argentina.title", "Argentina")}</h3>
            <p>
              {t(
                "resources.cattle.countries.argentina.body",
                "Argentina is a significant beef exporter and a major source of hides and leather for the EU. The country's cattle industry is concentrated in the Pampas and, increasingly, in the Gran Chaco, where forest conversion for pasture has accelerated. Argentina's SENASA (Servicio Nacional de Sanidad y Calidad Agroalimentaria) provides livestock traceability through the SIGSA system, but enforcement is uneven. Importers should verify that Argentine beef and hides originate from farms outside deforestation frontiers and request SIGSA documentation for each shipment.",
              )}
            </p>

            <h3>{t("resources.cattle.countries.uruguay.title", "Uruguay")}</h3>
            <p>
              {t(
                "resources.cattle.countries.uruguay.body",
                "Uruguay is a smaller but relatively lower-risk sourcing country for cattle products. The country has a well-developed livestock traceability system (SIRA and SNI) that tracks animals from birth to slaughter. Deforestation risk in Uruguay is lower than in Brazil or Argentina, but importers should still verify that their Uruguayan suppliers are not sourcing cattle from farms that have recently cleared native forest — particularly in the northern departments near the Brazilian border.",
              )}
            </p>

            <h3>{t("resources.cattle.countries.paraguay.title", "Paraguay")}</h3>
            <p>
              {t(
                "resources.cattle.countries.paraguay.body",
                "Paraguay has experienced rapid expansion of cattle ranching into the Chaco, with significant deforestation of native dry forest. The country's livestock traceability system (SGBovina) is less developed than those of Brazil or Argentina, and supply chain transparency is limited. Paraguayan beef and hides are often exported through intermediary countries, which can obscure the original farm of origin. Importers sourcing from Paraguay should conduct heightened due diligence and require specific plot-level documentation.",
              )}
            </p>

            <h2>
              {t("resources.cattle.leather.title", "Indirect Procurement of Leather")}
            </h2>
            <p>
              {t(
                "resources.cattle.leather.body",
                "Leather is one of the most challenging cattle products for EUDR compliance because of its position in the supply chain. Leather is typically a byproduct of the meat industry — it passes through tanneries, traders, and distributors before reaching the EU importer. At each stage, the link to the original farm can weaken. A hide arriving at an EU tannery may have been sourced from cattle born in one country, raised in another, and slaughtered in a third. The tannery may purchase hides from dozens of traders, each sourcing from different regions.",
              )}
            </p>
            <p>
              {t(
                "resources.cattle.leather.solution",
                "EUDR requires that you trace leather back to the farm of birth for the cattle from which it was derived. This means requiring your tannery or hide supplier to provide: (1) the slaughterhouse of origin, (2) the farm or farms where the cattle were raised, and (3) geolocation data for those farms. This is a high bar, and not all suppliers will be able to meet it. Start engagement early, build traceability requirements into your contracts, and consider working with tanneries that have invested in livestock traceability systems.",
              )}
            </p>

            <h2>
              {t("resources.cattle.traceability.title", "Traceability Challenges")}
            </h2>
            <p>
              {t(
                "resources.cattle.traceability.body",
                "Cattle supply chains differ from crop-based commodities in fundamental ways. Cattle move — they are born on one farm, fattened on another, and slaughtered on a third. In Brazil, a single animal may pass through three or more farms before reaching the slaughterhouse. Each transfer must be documented, and the deforestation-free status of every farm in the chain must be verified. This is technically complex and data-intensive, particularly for smallholder systems where individual farm records may be incomplete.",
              )}
            </p>
            <p>
              {t(
                "resources.cattle.traceability.tip",
                "Practical strategy: Focus on the farm of birth and the farm of last ownership before slaughter. These two points provide the strongest link to the land on which the cattle were raised. If you can verify deforestation-free status for these two farms, you have a strong compliance foundation — though you should still request information on intermediate farms where available.",
              )}
            </p>

            <h2>
              {t("resources.cattle.pitfalls.title", "Common Pitfalls for Cattle Importers")}
            </h2>
            <ul>
              <li>
                <strong>{t("resources.cattle.pitfalls.p1.title", "Leather as a 'byproduct' assumption:")}</strong>{" "}
                {t(
                  "resources.cattle.pitfalls.p1.body",
                  "Many importers treat leather as a byproduct and assume it carries lower compliance obligations. Under EUDR, leather has the same traceability requirements as beef or live animals. The byproduct status does not reduce your due-diligence obligations.",
                )}
              </li>
              <li>
                <strong>{t("resources.cattle.pitfalls.p2.title", "Ignoring indirect suppliers:")}</strong>{" "}
                {t(
                  "resources.cattle.pitfalls.p2.body",
                  "If you buy leather from a trader who sources from multiple tanneries, you still need to trace back to the farm. The trader's invoice is not sufficient evidence. Push your suppliers for farm-level data, or treat the supply chain as high-risk.",
                )}
              </li>
              <li>
                <strong>{t("resources.cattle.pitfalls.p3.title", "Cross-border cattle movement:")}</strong>{" "}
                {t(
                  "resources.cattle.pitfalls.p3.body",
                  "Cattle are frequently born in one country and fattened or slaughtered in another (e.g., born in Brazil, finished in Uruguay). You must trace the cattle through each country, not just the country of slaughter. This adds complexity but is required under EUDR.",
                )}
              </li>
              <li>
                <strong>{t("resources.cattle.pitfalls.p4.title", "Feedlot verification gaps:")}</strong>{" "}
                {t(
                  "resources.cattle.pitfalls.p4.body",
                  "Cattle finishing in feedlots may consume feed sourced from deforested land. While EUDR focuses on the land where the cattle were raised, the feed source can be relevant to the legal-compliance criterion. Verify that feedlot operators comply with environmental regulations.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.cattle.checklist.title", "Cattle Compliance Checklist")}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Step</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">1</td>
                    <td className="px-4 py-3 text-muted-foreground">Identify all cattle-derived products in your portfolio (beef, hides, leather, gelatin)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">2</td>
                    <td className="px-4 py-3 text-muted-foreground">Trace supply chains back to the farm of birth and the farm of last ownership before slaughter</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">3</td>
                    <td className="px-4 py-3 text-muted-foreground">Request geolocation data for all farms in the supply chain; verify against deforestation alerts</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">4</td>
                    <td className="px-4 py-3 text-muted-foreground">Verify legality compliance against the environmental and land-use laws of the country of origin</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">5</td>
                    <td className="px-4 py-3 text-muted-foreground">Add EUDR due-diligence clauses to supplier contracts, including leather and hide suppliers</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">6</td>
                    <td className="px-4 py-3 text-muted-foreground">Document risk assessments and maintain an auditable evidence repository for each shipment</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>
              {t("resources.cattle.antaios.title", "How Antaios Fits In")}
            </h2>
            <p>
              {t(
                "resources.cattle.antaios.body",
                "Antaios automates the most complex parts of cattle compliance. Our platform maps satellite deforestation alerts against your supplier's farm geolocation data, flags high-risk municipalities in Brazil, Argentina, Paraguay, and Uruguay, and tracks changes in the legal landscape across your supply chain. For leather importers, we help trace hides back to the farm of origin by integrating slaughterhouse and farm-level data. The result: faster risk assessments, fewer compliance gaps, and a defensible audit trail — even for fragmented cattle supply chains.",
              )}
            </p>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.cattle.cta.title",
                "Struggling with cattle traceability?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.cattle.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.cattle.cta.button", "Take the free diagnostic")}
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
