import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/eudr-overview")({
  component: EudrOverviewPage,
  beforeLoad: () => ({
    title: "EUDR Overview — Antaios Resources",
  }),
});

function EudrOverviewPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="Is Your Business Ready for EUDR? A Practical Overview"
        description="New to the EU Deforestation Regulation (EUDR)? This overview covers who it affects, key deadlines, the 7 regulated commodities, and first steps to prepare your business for compliance."
        path="/resources/eudr-overview"
        datePublished="2024-11-10"
        category="Overview"
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
              {t("resources.overview.category", "Overview")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.overview.readTime", "4 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.overview.title",
              "Is Your Business Ready for EUDR? A Practical Overview",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.overview.intro",
                "The EU Deforestation Regulation (EU) 2023/1115 — commonly called EUDR — is the most significant regulatory change for importers of forest-risk commodities in decades. If your business imports cattle, cocoa, coffee, oil palm, rubber, soya, or wood into the EU, this regulation applies to you. Here is a practical overview of what you need to know.",
              )}
            </p>

            <h2>
              {t("resources.overview.what.title", "What Is EUDR?")}
            </h2>
            <p>
              {t(
                "resources.overview.what.body",
                "EUDR replaces the EU Timber Regulation (EUTR) and significantly expands its scope. The regulation requires operators and traders placing covered commodities on the EU market to conduct due diligence demonstrating that their products are deforestation-free and produced in compliance with the applicable legislation of the country of origin. The core obligation is the due-diligence statement (DDS), which must be submitted to the competent authority before each shipment enters the EU.",
              )}
            </p>

            <h2>
              {t("resources.overview.who.title", "Who Does It Affect?")}
            </h2>
            <p>
              {t(
                "resources.overview.who.body",
                "The regulation distinguishes between operators (those who first place a relevant product on the EU market) and traders (those who subsequently make it available). Both have obligations, though traders' obligations are lighter. If you are an importer bringing in finished goods that contain covered commodities, or a downstream operator using them in manufacturing, you are in scope. The regulation also applies to traders who are not small or micro enterprises.",
              )}
            </p>

            <h2>
              {t("resources.overview.deadlines.title", "Key Deadlines")}
            </h2>
            <p>
              {t(
                "resources.overview.deadlines.body",
                "The original enforcement date of December 30, 2024 was deferred. Under the revised timeline:",
              )}
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{t("resources.overview.deadlines.large", "Large and medium enterprises")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t("resources.overview.deadlines.largeDate", "December 30, 2026")}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{t("resources.overview.deadlines.small", "Small and micro enterprises")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t("resources.overview.deadlines.smallDate", "June 30, 2027")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              {t(
                "resources.overview.deadlines.note",
                "These deadlines are fixed. Even if you are in the later cohort, starting preparations now is strongly advised — building traceability systems and supplier relationships takes time.",
              )}
            </p>

            <h2>
              {t("resources.overview.commodities.title", "The 7 Regulated Commodities")}
            </h2>
            <p>
              {t(
                "resources.overview.commodities.body",
                "EUDR applies to the following commodities and their derived products:",
              )}
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Commodity</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Scope</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border"><td className="px-4 py-3 font-medium text-foreground">{t("resources.overview.commodities.cattle", "Cattle")}</td><td className="px-4 py-3 text-muted-foreground">{t("resources.overview.commodities.cattleDesc", "Live animals, meat, hides, leather, and tallow")}</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3 font-medium text-foreground">{t("resources.overview.commodities.cocoa", "Cocoa")}</td><td className="px-4 py-3 text-muted-foreground">{t("resources.overview.commodities.cocoaDesc", "Beans, paste, butter, powder, and chocolate products")}</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3 font-medium text-foreground">{t("resources.overview.commodities.coffee", "Coffee")}</td><td className="px-4 py-3 text-muted-foreground">{t("resources.overview.commodities.coffeeDesc", "Green coffee beans, roasted coffee, and extracts")}</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3 font-medium text-foreground">{t("resources.overview.commodities.oilPalm", "Oil palm")}</td><td className="px-4 py-3 text-muted-foreground">{t("resources.overview.commodities.oilPalmDesc", "Crude and refined palm oil, palm kernel oil, and derivatives")}</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3 font-medium text-foreground">{t("resources.overview.commodities.rubber", "Rubber")}</td><td className="px-4 py-3 text-muted-foreground">{t("resources.overview.commodities.rubberDesc", "Natural rubber, latex, and rubber products")}</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3 font-medium text-foreground">{t("resources.overview.commodities.soya", "Soya")}</td><td className="px-4 py-3 text-muted-foreground">{t("resources.overview.commodities.soyaDesc", "Soya beans, meal, oil, and lecithin")}</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-3 font-medium text-foreground">{t("resources.overview.commodities.wood", "Wood")}</td><td className="px-4 py-3 text-muted-foreground">{t("resources.overview.commodities.woodDesc", "Timber, pulp and paper, furniture, and wood-based panels")}</td></tr>
                </tbody>
              </table>
            </div>

            <h2>
              {t("resources.overview.noncompliance.title", "What Happens If You Are Not Compliant?")}
            </h2>
            <p>
              {t(
                "resources.overview.noncompliance.body",
                "Non-compliance carries serious consequences. Products placed on the market without a valid due-diligence statement are considered illegal. Competent authorities in each member state can seize products, issue fines proportional to the environmental damage, and ban operators from placing products on the EU market for repeat or serious violations. The regulation also includes provisions for public disclosure of non-compliant operators.",
              )}
            </p>

            <h2>
              {t("resources.overview.firstSteps.title", "First Steps to Take")} 
            </h2>
            <p>
              {t(
                "resources.overview.firstSteps.body",
                "If you are new to EUDR, here is where to start:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.overview.firstSteps.s1",
                  "Identify which of the 7 commodities your business handles and whether they are in scope under the regulation's product annexes",
                )}
              </li>
              <li>
                {t(
                  "resources.overview.firstSteps.s2",
                  "Map your supply chains — for each commodity, identify the country of production, the suppliers, and the plots of origin",
                )}
              </li>
              <li>
                {t(
                  "resources.overview.firstSteps.s3",
                  "Assess your current data coverage: do you have geolocation coordinates for your production plots?",
                )}
              </li>
              <li>
                {t(
                  "resources.overview.firstSteps.s4",
                  "Begin collecting due-diligence documentation for your next shipments — do not wait for the deadline",
                )}
              </li>
              <li>
                {t(
                  "resources.overview.firstSteps.s5",
                  "Run a diagnostic to identify gaps in your compliance posture before they become audit findings",
                )}
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.overview.cta.title",
                "Not sure where your biggest gaps are?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.overview.cta.desc",
                "Get a clear picture in under 3 minutes — no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.overview.cta.button", "Take the free diagnostic")}
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
