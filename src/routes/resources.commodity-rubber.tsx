import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/commodity-rubber")({
  component: CommodityRubberPage,
  beforeLoad: () => ({
    title: "EUDR Rubber Compliance: What Importers Should Know — Antaios Resources",
  }),
});

function CommodityRubberPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Rubber Compliance: What Importers Should Know"
        description="How the EU Deforestation Regulation applies to natural rubber. Covers key producing countries, tire industry impact, latex supply chain complexity, and compliance strategies."
        path="/resources/commodity-rubber"
        datePublished="2025-02-01"
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
              {t("resources.rubber.category", "Commodity Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.rubber.readTime", "10 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.rubber.title",
              "EUDR Rubber Compliance: What Importers Should Know",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.rubber.intro",
                "Natural rubber is one of the eight commodity categories covered by the EU Deforestation Regulation (EU) 2023/1115. While rubber may not carry the same public profile as palm oil or soy, it is deeply embedded in European supply chains — particularly in the tire, automotive, and medical device industries. This guide covers the rubber-specific compliance requirements, the Southeast Asian sourcing landscape, and the unique traceability challenges posed by smallholder-dominated supply chains.",
              )}
            </p>

            <h2>
              {t("resources.rubber.scope.title", "What Counts as Rubber Under EUDR")}
            </h2>
            <p>
              {t(
                "resources.rubber.scope.body",
                "EUDR covers natural rubber in all its forms: raw latex, crepe rubber, smoked sheet, technically specified rubber (TSR), and any product containing natural rubber as a component. This includes tires, gloves, hoses, seals, belts, adhesives, and footwear. Synthetic rubber derived from petroleum is not covered, but products that blend natural and synthetic rubber fall within scope if the natural rubber content is substantial. The key trigger is whether the natural rubber — or the land on which the rubber trees were tapped — was involved in deforestation after 31 December 2020.",
              )}
            </p>
            <p>
              {t(
                "resources.rubber.scope.exception",
                "Recycled rubber products are exempt, as are products manufactured entirely from recycled materials. However, most natural rubber in the EU supply chain is virgin material, and the exemption is narrow in practice.",
              )}
            </p>

            <h2>
              {t("resources.rubber.countries.title", "Key Producing Countries")}
            </h2>
            <p>
              {t(
                "resources.rubber.countries.intro",
                "Global natural rubber production is concentrated in Southeast Asia, with four countries dominating supply:",
              )}
            </p>

            <h3>{t("resources.rubber.countries.indonesia.title", "Indonesia")}</h3>
            <p>
              {t(
                "resources.rubber.countries.indonesia.body",
                "Indonesia is the world's second-largest natural rubber producer. Rubber cultivation is spread across Sumatra, Kalimantan, and Sulawesi, often by smallholder farmers on plots of 2-5 hectares. Deforestation risk is highest in Kalimantan, where rubber plantations have expanded into peatlands and primary forest. Indonesian rubber supply chains are fragmented and opaque, with multiple intermediaries between the tapper and the exporter. Traceability to the individual farm is challenging but essential for EUDR compliance.",
              )}
            </p>

            <h3>{t("resources.rubber.countries.thailand.title", "Thailand")}</h3>
            <p>
              {t(
                "resources.rubber.countries.thailand.body",
                "Thailand is the world's largest natural rubber producer, with cultivation concentrated in the southern provinces. The Thai rubber industry has a more structured supply chain than Indonesia, with the Rubber Authority of Thailand providing a regulatory framework. However, smallholder farmers account for over 90% of production, and geolocation data is not systematically collected. Importers should work with Thai cooperatives and the Rubber Authority to obtain farm-level coordinates.",
              )}
            </p>

            <h3>{t("resources.rubber.countries.vietnam.title", "Vietnam")}</h3>
            <p>
              {t(
                "resources.rubber.countries.vietnam.body",
                "Vietnam is a significant rubber exporter and a major processor of rubber products. The Central Highlands and southeastern provinces are the primary growing areas. Vietnam's rubber industry has been linked to land-use conflicts and, in some cases, conversion of natural forest. Vietnamese rubber is often exported as processed sheets or TSR, which can obscure the original farm of origin. Importers should require Vietnamese suppliers to provide plantation-level geolocation data and land-use documentation.",
              )}
            </p>

            <h3>{t("resources.rubber.countries.malaysia.title", "Malaysia")}</h3>
            <p>
              {t(
                "resources.rubber.countries.malaysia.body",
                "Malaysia produces a smaller volume of natural rubber than its neighbours but is a significant processor and exporter of rubber products. Peninsular Malaysia is the primary growing area. The Malaysian Rubber Board (MRB) provides quality standards and some traceability infrastructure. However, deforestation risk is lower in Malaysia than in Indonesia or Vietnam, making it a relatively lower-risk sourcing option — provided the supply chain is properly documented.",
              )}
            </p>

            <h2>
              {t("resources.rubber.tire.title", "Tire Industry Impact")}
            </h2>
            <p>
              {t(
                "resources.rubber.tire.body",
                "The tire industry is by far the largest consumer of natural rubber, accounting for approximately 70% of global demand. EU tire manufacturers and importers face a significant compliance burden under EUDR. A single car tire contains 2-4 kilograms of natural rubber, sourced from thousands of smallholder farms across Southeast Asia. Tracing this rubber back to individual plots is a formidable logistical challenge, but it is exactly what EUDR requires.",
              )}
            </p>
            <p>
              {t(
                "resources.rubber.tire.strategy",
                "Major tire manufacturers are already investing in rubber traceability programs, including satellite monitoring, farm-level GPS mapping, and blockchain-based supply chain tracking. Smaller importers can leverage industry initiatives such as the Global Platform for Sustainable Natural Rubber (GPSNR) to access shared traceability infrastructure. The key point is that EUDR compliance for tires is not optional — it applies regardless of company size.",
              )}
            </p>

            <h2>
              {t("resources.rubber.latex.title", "Latex Supply Chain Complexity")}
            </h2>
            <p>
              {t(
                "resources.rubber.latex.body",
                "Natural rubber begins as latex — a milky fluid tapped from Hevea brasiliensis trees. The latex is then processed into various forms: cup lump, crepe, smoked sheet, or technically specified rubber (TSR). Each processing step introduces new intermediaries and potential traceability gaps. A consignment of TSR arriving at an EU port may have passed through five or more hands before export. At each stage, the link to the original farm can weaken unless documentation is rigorously maintained.",
              )}
            </p>
            <p>
              {t(
                "resources.rubber.latex.tip",
                "Practical approach: Map your rubber supply chain back to the collection point — typically a village-level aggregator or cooperative. From there, trace to individual farms using GPS data. If your supplier cannot provide farm-level geolocation, treat the supply chain as high-risk and conduct enhanced due diligence.",
              )}
            </p>

            <h2>
              {t("resources.rubber.pitfalls.title", "Common Pitfalls for Rubber Importers")}
            </h2>
            <ul>
              <li>
                <strong>{t("resources.rubber.pitfalls.p1.title", "Smallholder data gaps:")}</strong>{" "}
                {t(
                  "resources.rubber.pitfalls.p1.body",
                  "Over 85% of global rubber is produced by smallholder farmers who may not have GPS-equipped phones or formal land titles. Collecting geolocation data from this segment requires proactive engagement, mobile tools, and often field officer support. Last-minute data collection rarely works.",
                )}
              </li>
              <li>
                <strong>{t("resources.rubber.pitfalls.p2.title", "Peatland conversion:")}</strong>{" "}
                {t(
                  "resources.rubber.pitfalls.p2.body",
                  "Rubber cultivation on drained peatlands is both a deforestation risk and a significant greenhouse gas source. Peatland areas in Indonesia and Malaysia are particularly high-risk. Verify that your suppliers are not cultivating on peat, or that they have valid environmental permits for peatland use.",
                )}
              </li>
              <li>
                <strong>{t("resources.rubber.pitfalls.p3.title", "Blending with synthetic rubber:")}</strong>{" "}
                {t(
                  "resources.rubber.pitfalls.p3.body",
                  "If you import blended rubber products (natural + synthetic), you need to verify the natural rubber component separately. The synthetic portion is not covered by EUDR, but the natural rubber portion triggers full due-diligence obligations.",
                )}
              </li>
              <li>
                <strong>{t("resources.rubber.pitfalls.p4.title", "Assuming rubberwood is exempt:")}</strong>{" "}
                {t(
                  "resources.rubber.pitfalls.p4.body",
                  "Rubberwood (from plantation trees past their tapping life) is a significant timber product in Southeast Asia. If you import rubberwood furniture or flooring, it falls under the wood commodity category, not rubber — and you must comply with wood-specific traceability requirements.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.rubber.checklist.title", "Rubber Compliance Checklist")}
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
                    <td className="px-4 py-3 text-muted-foreground">Identify all natural rubber in your product portfolio, including blended and composite products</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">2</td>
                    <td className="px-4 py-3 text-muted-foreground">Map your supply chain back to collection points and, where possible, individual farms</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">3</td>
                    <td className="px-4 py-3 text-muted-foreground">Request geolocation data for all production plots; deploy mobile tools for smallholder data collection if needed</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">4</td>
                    <td className="px-4 py-3 text-muted-foreground">Verify that your suppliers are not cultivating on drained peatlands without valid permits</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">5</td>
                    <td className="px-4 py-3 text-muted-foreground">Leverage industry initiatives (GPSNR) for shared traceability infrastructure</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">6</td>
                    <td className="px-4 py-3 text-muted-foreground">Document risk assessments and maintain an auditable evidence repository</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>
              {t("resources.rubber.antaios.title", "How Antaios Fits In")}
            </h2>
            <p>
              {t(
                "resources.rubber.antaios.body",
                "Antaios simplifies rubber compliance by automating the most data-intensive tasks. Our platform overlays satellite deforestation alerts with your supplier's geolocation data, flagging farms in high-risk zones across Indonesia, Thailand, Vietnam, and Malaysia. We track peatland boundaries, concession maps, and legal-landscape changes in real time. For tire manufacturers and rubber product importers, Antaios provides a single dashboard to monitor your entire Southeast Asian supply chain — reducing manual research and giving you a defensible compliance record.",
              )}
            </p>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.rubber.cta.title",
                "Need to map your rubber supply chain?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.rubber.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.rubber.cta.button", "Take the free diagnostic")}
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
