import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/eudr-vs-eutr")({
  component: EudrVsEutrPage,
  beforeLoad: () => ({
    title: "EUDR vs EUTR: What Changed — Antaios Resources",
  }),
});

function EudrVsEutrPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR vs EUTR: What Changed and What It Means for Timber Importers"
        description="Compare EUTR (533/2010) and EUDR (2023/1115) side by side. See what stayed the same, what changed, and how timber importers can prepare for the transition."
        path="/resources/eudr-vs-eutr"
        datePublished="2025-06-10"
        category="Compliance Guide"
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
              {t("resources.eudr-vs-eutr.category", "Compliance Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.eudr-vs-eutr.readTime", "8 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.eudr-vs-eutr.title",
              "EUDR vs EUTR: What Changed and What It Means for Timber Importers",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.eudr-vs-eutr.intro",
                "The EU Deforestation Regulation (EUDR, 2023/1115) replaces the EU Timber Regulation (EUTR, 533/2010). If you import timber into the EU, understanding the differences between these two frameworks is critical. Here is a clear breakdown of what changed, what stayed the same, and what you need to do now.",
              )}
            </p>

            <h2>{t("resources.eudr-vs-eutr.table.title", "EUTR vs EUDR: Side by Side")}</h2>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Feature</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">EUTR (533/2010)</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">EUDR (2023/1115)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Scope</td>
                    <td className="px-4 py-3 text-muted-foreground">Illegal timber only</td>
                    <td className="px-4 py-3 text-muted-foreground">Legal and illegal — covers deforestation and forest degradation</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Commodities</td>
                    <td className="px-4 py-3 text-muted-foreground">Wood and wood products</td>
                    <td className="px-4 py-3 text-muted-foreground">Wood, palm oil, soy, cattle, coffee, rubber, and derived products</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Due Diligence</td>
                    <td className="px-4 py-3 text-muted-foreground">Three-step: information, risk assessment, risk mitigation</td>
                    <td className="px-4 py-3 text-muted-foreground">Five-criteria under Article 10(2): traceability, geolocation, applicable legislation, verifiable information, risk assessment</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Geolocation</td>
                    <td className="px-4 py-3 text-muted-foreground">Not required</td>
                    <td className="px-4 py-3 text-muted-foreground">Mandatory — polygon or point coordinates per production plot</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Country Benchmarking</td>
                    <td className="px-4 py-3 text-muted-foreground">Not included</td>
                    <td className="px-4 py-3 text-muted-foreground">EU classifies countries as low, standard, or high risk — affects due-diligence obligations</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Penalties</td>
                    <td className="px-4 py-3 text-muted-foreground">Up to 3 years imprisonment; fines defined by member states</td>
                    <td className="px-4 py-3 text-muted-foreground">Fines up to 4% of EU-wide annual turnover; confiscation of goods and revenue</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Enforcement</td>
                    <td className="px-4 py-3 text-muted-foreground">Member state competent authorities</td>
                    <td className="px-4 py-3 text-muted-foreground">Centralised Information System for Enforcement and Markets (CIS); member state authorities</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-foreground">Application Date</td>
                    <td className="px-4 py-3 text-muted-foreground">3 March 2013</td>
                    <td className="px-4 py-3 text-muted-foreground">30 December 2024 (large operators); 30 June 2026 (SMEs)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>{t("resources.eudr-vs-eutr.same.title", "What Stayed the Same")}</h2>
            <p>
              {t(
                "resources.eudr-vs-eutr.same.body",
                "The core principle has not changed: operators placing timber on the EU market must conduct due diligence before a single board crosses the border. The EUDR keeps the operator liability model intact — if you are the first to place the product on the EU market, you are responsible for the entire supply chain up to the plot of land. The obligation to assess risk and take mitigating action also carries over from EUTR.",
              )}
            </p>
            <p>
              {t(
                "resources.eudr-vs-eutr.same.body2",
                "Both regulations apply regardless of where the timber was harvested. Whether the logs come from Romania, Brazil, or Indonesia, the same rules apply at the EU border.",
              )}
            </p>

            <h2>{t("resources.eudr-vs-eutr.changed.title", "What Changed")}</h2>

            <h3>{t("resources.eudr-vs-eutr.changed.scope.title", "Expanded Scope")}</h3>
            <p>
              {t(
                "resources.eudr-vs-eutr.changed.scope.body",
                "The EUTR only targeted illegally harvested timber. The EUDR goes further — it covers all timber linked to deforestation or forest degradation, even if the harvest was legal under local law. This means products that were perfectly compliant under EUTR may now fail under EUDR.",
              )}
            </p>

            <h3>{t("resources.eudr-vs-eutr.changed.commodities.title", "More Commodities")}</h3>
            <p>
              {t(
                "resources.eudr-vs-eutr.changed.commodities.body",
                "The EUDR extends beyond timber to palm oil, soy, cattle, coffee, and rubber. For timber importers specifically, this means the regulation now covers a wider range of derived products. If your supply chain touches any of these commodity streams, the EUDR applies.",
              )}
            </p>

            <h3>{t("resources.eudr-vs-eutr.changed.geo.title", "Geolocation Requirement")}</h3>
            <p>
              {t(
                "resources.eudr-vs-eutr.changed.geo.body",
                "This is the most significant operational change. Under EUTR, you did not need to identify the exact plot where timber was harvested. Under EUDR, you must provide geolocation coordinates for every plot of land in your supply chain. For plots larger than 4 hectares, you need polygon coordinates. For smaller plots, a latitude/longitude point suffices. This data must be submitted through the EU Information System.",
              )}
            </p>

            <h3>{t("resources.eudr-vs-eutr.changed.benchmarking.title", "Country Benchmarking")}</h3>
            <p>
              {t(
                "resources.eudr-vs-eutr.changed.benchmarking.body",
                "The European Commission classifies exporting countries into three risk categories: low, standard, and high risk. Countries rated as low risk trigger simplified due-diligence obligations. High-risk countries require additional scrutiny. This benchmarking system did not exist under EUTR and fundamentally changes how you allocate compliance resources across your supply base.",
              )}
            </p>

            <h3>{t("resources.eudr-vs-eutr.changed.penalties.title", "Stronger Penalties")}</h3>
            <p>
              {t(
                "resources.eudr-vs-eutr.changed.penalties.body",
                "EUTR penalties were left to member states and varied widely. The EUDR sets a minimum floor: fines up to 4% of your total EU-wide annual turnover, confiscation of the relevant products and revenue, exclusion from public procurement and public funding, and temporary prohibition from placing products on the EU market. These penalties apply uniformly across all member states.",
              )}
            </p>

            <h2>{t("resources.eudr-vs-eutr.dates.title", "Key Transition Dates")}</h2>
            <ul>
              <li>
                <strong>30 December 2024:</strong>{" "}
                {t(
                  "resources.eudr-vs-eutr.dates.largeOperators",
                  "EUDR application date for large operators and groups (non-SMEs).",
                )}
              </li>
              <li>
                <strong>30 June 2026:</strong>{" "}
                {t(
                  "resources.eudr-vs-eutr.dates.smes",
                  "EUDR application date for micro and small enterprises (SMEs).",
                )}
              </li>
              <li>
                <strong>30 December 2024:</strong>{" "}
                {t(
                  "resources.eudr-vs-eutr.dates.cis",
                  "European Commission publishes country benchmarking lists and opens the Information System for registration.",
                )}
              </li>
              <li>
                <strong>30 December 2025:</strong>{" "}
                {t(
                  "resources.eudr-vs-eutr.dates.prohibitions",
                  "Prohibitions on deforestation-linked products enter force — no new products linked to post-2020 deforestation may be placed on the EU market.",
                )}
              </li>
            </ul>

            <h2>{t("resources.eudr-vs-eutr.action.title", "What Timber Importers Need to Do Now")}</h2>
            <p>
              {t(
                "resources.eudr-vs-eutr.action.body",
                "If you are still operating under an EUTR-era compliance framework, here are the priority actions:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.eudr-vs-eutr.action.item1",
                  "Map your full supply chain down to the plot level. You need geolocation data that did not exist before.",
                )}
              </li>
              <li>
                {t(
                  "resources.eudr-vs-eutr.action.item2",
                  "Collect and verify the new five-criteria due-diligence evidence required under Article 10(2).",
                )}
              </li>
              <li>
                {t(
                  "resources.eudr-vs-eutr.action.item3",
                  "Register on the EU Information System and prepare to submit due-diligence statements electronically.",
                )}
              </li>
              <li>
                {t(
                  "resources.eudr-vs-eutr.action.item4",
                  "Review the country benchmarking lists. If you source from high-risk countries, you will need additional mitigation measures.",
                )}
              </li>
              <li>
                {t(
                  "resources.eudr-vs-eutr.action.item5",
                  "Train your supply chain teams on the new requirements. The EUDR is not an incremental update — it is a fundamentally different compliance standard.",
                )}
              </li>
            </ul>

            <h2>{t("resources.eudr-vs-eutr.help.title", "How Antaios Helps with the Transition")}</h2>
            <p>
              {t(
                "resources.eudr-vs-eutr.help.body",
                "Antaios was built for the EUDR, not retrofitted from an EUTR tool. Our platform helps you collect geolocation data from suppliers, verify compliance evidence against the five Article 10(2) criteria, and generate due-diligence statements ready for submission to the EU Information System. If you are transitioning from EUTR, we can help you identify gaps in your current data and build a roadmap to full EUDR compliance.",
              )}
            </p>

            <h2>{t("resources.eudr-vs-eutr.takeaways.title", "Key Takeaways")}</h2>
            <ul>
              <li>
                {t(
                  "resources.eudr-vs-eutr.takeaway1",
                  "The EUDR is not just an update — it is a new regulation with broader scope, stricter evidence requirements, and stronger penalties.",
                )}
              </li>
              <li>
                {t(
                  "resources.eudr-vs-eutr.takeaway2",
                  "Geolocation data is now mandatory. If you do not have plot-level coordinates, you cannot comply.",
                )}
              </li>
              <li>
                {t(
                  "resources.eudr-vs-eutr.takeaway3",
                  "Country benchmarking changes the compliance equation — where you source now matters more than ever.",
                )}
              </li>
              <li>
                {t(
                  "resources.eudr-vs-eutr.takeaway4",
                  "Act now. The application dates are here or approaching, and building a compliant supply chain takes time.",
                )}
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.eudr-vs-eutr.cta.title",
                "Ready to make the transition?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.eudr-vs-eutr.cta.desc",
                "Take our free 3-minute diagnostic to find out how prepared you are for EUDR. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.eudr-vs-eutr.cta.button", "Take the free diagnostic")}
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
