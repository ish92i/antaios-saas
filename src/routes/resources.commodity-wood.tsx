import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/commodity-wood")({
  component: CommodityWoodPage,
  beforeLoad: () => ({
    title: "EUDR Timber & Wood Compliance: A Complete Guide — Antaios Resources",
  }),
});

function CommodityWoodPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Timber & Wood Compliance: A Complete Guide"
        description="How the EU Deforestation Regulation applies to timber and wood products. Covers key sourcing countries, FLEGT/VPA alignment, chain-of-custody requirements, and common pitfalls for EU importers."
        path="/resources/commodity-wood"
        datePublished="2025-01-10"
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
              {t("resources.wood.category", "Commodity Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.wood.readTime", "10 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.wood.title",
              "EUDR Timber & Wood Compliance: A Complete Guide",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.wood.intro",
                "Timber and wood products are among the eight commodity categories regulated by the EU Deforestation Regulation (EU) 2023/1115. If you import wood into the EU — whether as raw logs, sawn timber, plywood, furniture, or paper — you must demonstrate that your products are deforestation-free and produced in compliance with the laws of the country of origin. This guide walks through the wood-specific requirements, the countries that matter most, and the practical steps to build a compliant supply chain.",
              )}
            </p>

            <h2>
              {t("resources.wood.scope.title", "What Counts as Wood Under EUDR")}
            </h2>
            <p>
              {t(
                "resources.wood.scope.body",
                "The regulation covers wood in all forms: raw logs, sawn wood, chipboard, plywood, veneer, furniture, pulp, and paper products. The key trigger is whether the product or its components contain wood that was harvested from land that was deforested after 31 December 2020. Even composite products — a wooden chair with metal legs, for example — fall within scope if the wood content is substantial enough to be considered a primary component.",
              )}
            </p>
            <p>
              {t(
                "resources.wood.scope.exemption",
                "Recycled products are exempt, but only if the wood has been fully processed into a finished product before 29 June 2023, or if it is demonstrably recycled material with no new forest-risk input. Packaging material is also exempt if it is integral to the product and will be discarded with it.",
              )}
            </p>

            <h2>
              {t("resources.wood.countries.title", "Key Sourcing Countries")}
            </h2>
            <p>
              {t(
                "resources.wood.countries.intro",
                "The EU sources timber from a wide range of countries, but four stand out in terms of volume and compliance risk:",
              )}
            </p>

            <h3>{t("resources.wood.countries.brazil.title", "Brazil")}</h3>
            <p>
              {t(
                "resources.wood.countries.brazil.body",
                "Brazil is one of the world's largest timber exporters, with significant volumes of tropical hardwood, eucalyptus, and pine. The Amazon basin remains a high-risk area for deforestation, and Brazilian timber has historically been subject to illegal logging concerns. Importers must verify that their Brazilian suppliers hold valid CAR (Cadastro Ambiental Rural) registration and that the timber was harvested in compliance with the Forest Code. Pay close attention to the distinction between native forest timber and plantation wood — the latter carries lower deforestation risk but still requires full traceability.",
              )}
            </p>

            <h3>{t("resources.wood.countries.indonesia.title", "Indonesia")}</h3>
            <p>
              {t(
                "resources.wood.countries.indonesia.body",
                "Indonesia is a major supplier of tropical plywood, furniture, and pulp. The country has made significant progress through its SVLK (Sistem Verifikasi Legalitas Kayu) timber legality assurance system, which aligns closely with EUDR requirements. However, enforcement gaps remain, particularly in Kalimantan and Sumatra. Importers should confirm that their Indonesian suppliers have valid SVLK certificates and that the certificates cover the specific product categories being shipped.",
              )}
            </p>

            <h3>{t("resources.wood.countries.malaysia.title", "Malaysia")}</h3>
            <p>
              {t(
                "resources.wood.countries.malaysia.body",
                "Malaysia, particularly Sarawak and Sabah, is a significant source of tropical timber. The country operates its own Timber Certification Scheme (MTCS), which is PEFC-endorsed. However, Sarawak has faced criticism for rapid deforestation rates. Importers should request MTCS certification where available and supplement with independent verification of geolocation data and concession maps.",
              )}
            </p>

            <h3>{t("resources.wood.countries.russia.title", "Russia (Pre-2022 Supply Chains)")}</h3>
            <p>
              {t(
                "resources.wood.countries.russia.body",
                "Before 2022, Russia was the EU's largest supplier of softwood, plywood, and sawn timber. While sanctions have disrupted these supply chains, importers with residual Russian-origin stock or those sourcing from countries that may re-route Russian timber must exercise extreme caution. Russian timber has been linked to illegal logging in the Russian Far East, and the risk of circumvention through third countries remains high. Due-diligence scrutiny on any timber with Russian provenance should be exceptionally thorough.",
              )}
            </p>

            <h2>
              {t("resources.wood.flegt.title", "FLEGT, VPA, and EUDR Alignment")}
            </h2>
            <p>
              {t(
                "resources.wood.flegt.body",
                "The EU's Forest Law Enforcement, Governance and Trade (FLEGT) Action Plan and its Voluntary Partnership Agreements (VPAs) with timber-producing countries predate EUDR but overlap significantly. Countries with active VPAs — such as Indonesia, Ghana, and the Republic of Congo — have established legality verification systems that can serve as a foundation for EUDR compliance. However, EUDR goes further than FLEGT: while FLEGT focuses on legality, EUDR requires both legality and deforestation-free status. A FLEGT license is strong evidence of legal compliance, but it does not automatically satisfy the deforestation-free criterion. Importers must still verify that the specific plots of land used for their timber were not deforested after December 2020.",
              )}
            </p>

            <h2>
              {t("resources.wood.coc.title", "Chain-of-Custody Requirements")}
            </h2>
            <p>
              {t(
                "resources.wood.coc.body",
                "Wood products pass through multiple hands — from forest to sawmill to exporter to importer to processor to retailer. Each transfer point is a potential gap in traceability. EUDR requires that you maintain a documented chain of custody that links every batch of wood to its plot of origin. This means:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.wood.coc.ev1",
                  "Recording the identity of each supplier and the volume purchased at each transfer",
                )}
              </li>
              <li>
                {t(
                  "resources.wood.coc.ev2",
                  "Matching incoming shipments to specific harvest permits or concession areas",
                )}
              </li>
              <li>
                {t(
                  "resources.wood.coc.ev3",
                  "Reconciling volumes at each stage to detect discrepancies that could indicate illegal sourcing",
                )}
              </li>
              <li>
                {t(
                  "resources.wood.coc.ev4",
                  "Storing geolocation coordinates for every production plot linked to your supply",
                )}
              </li>
            </ul>
            <p>
              {t(
                "resources.wood.coc.tip",
                "If you source from aggregators or trading houses, you must still trace back to the original plot. A trading-house invoice alone is not sufficient evidence under EUDR. Push your upstream suppliers for plot-level data, and build this requirement into your procurement contracts.",
              )}
            </p>

            <h2>
              {t("resources.wood.pitfalls.title", "Common Pitfalls for Wood Importers")}
            </h2>
            <ul>
              <li>
                <strong>{t("resources.wood.pitfalls.p1.title", "Mixing certified and non-certified stock:")}</strong>{" "}
                {t(
                  "resources.wood.pitfalls.p1.body",
                  "FSC or PEFC certification covers the forest management unit, but if you mix certified and non-certified wood in your warehouse, you lose the chain of custody. Maintain physical or documented separation throughout your supply chain.",
                )}
              </li>
              <li>
                <strong>{t("resources.wood.pitfalls.p2.title", "Ignoring re-exported timber:")}</strong>{" "}
                {t(
                  "resources.wood.pitfalls.p2.body",
                  "Timber that is processed in China or Vietnam before being shipped to the EU may have originated in a high-risk country. The country of final processing is not the country of origin for EUDR purposes — you must trace the wood back to where it was harvested.",
                )}
              </li>
              <li>
                <strong>{t("resources.wood.pitfalls.p3.title", "Relying solely on certificates:")}</strong>{" "}
                {t(
                  "resources.wood.pitfalls.p3.body",
                  "Certificates like FSC or SVLK are valuable, but they are not a substitute for due diligence. EUDR requires you to independently verify the information, not just collect certificates from suppliers.",
                )}
              </li>
              <li>
                <strong>{t("resources.wood.pitfalls.p4.title", "Smallplot oversight:")}</strong>{" "}
                {t(
                  "resources.wood.pitfalls.p4.body",
                  "If you source from smallholder forests or community woodlots, geolocation data may be harder to obtain. Plan ahead — smallholder engagement is essential, and last-minute data collection often fails.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.wood.checklist.title", "Wood Compliance Checklist")}
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
                    <td className="px-4 py-3 text-muted-foreground">Map your supply chain from port to plot for every wood product you import</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">2</td>
                    <td className="px-4 py-3 text-muted-foreground">Collect geolocation coordinates (polygon for plots &gt; 4 ha, point for smaller) for all production plots</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">3</td>
                    <td className="px-4 py-3 text-muted-foreground">Verify legality compliance against the Forest Code, harvest permits, and concession maps of the country of origin</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">4</td>
                    <td className="px-4 py-3 text-muted-foreground">Cross-reference FLEGT/SVLK/FSC/PEFC certificates with EUDR-specific requirements (deforestation-free, not just legal)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">5</td>
                    <td className="px-4 py-3 text-muted-foreground">Build plot-level traceability into supplier contracts and reconcile volumes at each transfer point</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">6</td>
                    <td className="px-4 py-3 text-muted-foreground">Document your risk assessment methodology and maintain an auditable evidence repository</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>
              {t("resources.wood.antaios.title", "How Antaios Fits In")}
            </h2>
            <p>
              {t(
                "resources.wood.antaios.body",
                "Antaios automates the most labour-intensive parts of wood compliance. Our platform aggregates satellite-based deforestation alerts, legal-landscape data, and supplier information into a single dashboard. You can upload your supplier list and instantly see which plots fall in high-risk zones. When regulations change or new deforestation events are detected, we notify you automatically. The result: faster risk assessments, fewer compliance gaps, and a defensible audit trail without the spreadsheet chaos.",
              )}
            </p>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.wood.cta.title",
                "Ready to assess your wood supply chain?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.wood.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.wood.cta.button", "Take the free diagnostic")}
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
