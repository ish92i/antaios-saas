import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/traceability-guide")({
  component: TraceabilityGuidePage,
  beforeLoad: () => ({
    title: "Traceability Guide — Antaios Resources",
  }),
});

function TraceabilityGuidePage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="Importer's Guide to Supply Chain Traceability Under EUDR"
        description="Traceability is the backbone of EUDR compliance. Learn what 'traceability throughout the supply chain' actually means, how geolocation data fits in, and how to build a traceability system from scratch."
        path="/resources/traceability-guide"
        datePublished="2024-11-20"
        category="Technical Guide"
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
              {t("resources.traceability.category", "Technical Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.traceability.readTime", "6 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.traceability.title",
              "Importer's Guide to Supply Chain Traceability Under EUDR",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.traceability.intro",
                "Traceability is not a nice-to-have under EUDR — it is a legal requirement. Article 10(2)(a) requires operators to maintain \"information, including quantity, suppliers, and supply chain, on the relevant products and associated products supplied to or by the operator.\" In practice, this means you must be able to connect every shipment back to the specific plot of land where its raw materials were produced.",
              )}
            </p>

            <h2>
              {t(
                "resources.traceability.what.title",
                "What 'Traceability Throughout the Supply Chain' Actually Means",
              )}
            </h2>
            <p>
              {t(
                "resources.traceability.what.body",
                "The regulation expects operators to know their supply chain end-to-end. This does not mean you need a single ERP system spanning from farm to warehouse — but you do need documented records at each handover point. Every time a commodity changes hands (farm to trader, trader to exporter, exporter to importer), you must record the transaction and maintain the link to the production plot.",
              )}
            </p>
            <p>
              {t(
                "resources.traceability.what.body2",
                "The key principle is that traceability data must follow the product, not exist in isolated silos. If an auditor inspects a shipment of cocoa arriving in Rotterdam, you should be able to produce a complete trail: which cooperative supplied it, which village the beans came from, and the GPS coordinates of the farms.",
              )}
            </p>

            <h2>
              {t(
                "resources.traceability.batch.title",
                "Batch-Level vs. Shipment-Level Tracking",
              )}
            </h2>
            <p>
              {t(
                "resources.traceability.batch.body",
                "A common question is whether you need to track at batch level or shipment level. The regulation does not prescribe a specific granularity, but your system must be able to demonstrate compliance for each individual product placed on the market. In practice:",
              )}
            </p>
            <ul>
              <li>
                <strong>{t("resources.traceability.batch.batch", "Batch-level:")}</strong>{" "}
                {t(
                  "resources.traceability.batch.batchBody",
                  "Each production batch is assigned a unique identifier tied to its plot of origin. This is the gold standard — it allows precise linking even when multiple origins are consolidated in a single shipment.",
                )}
              </li>
              <li>
                <strong>{t("resources.traceability.batch.shipment", "Shipment-level:")}</strong>{" "}
                {t(
                  "resources.traceability.batch.shipmentBody",
                  "The shipment as a whole is traced to a defined set of plots. Acceptable when shipments consistently come from the same verified suppliers, but riskier if origins vary between shipments.",
                )}
              </li>
            </ul>
            <p>
              {t(
                "resources.traceability.batch.recommendation",
                "If you are starting from scratch, aim for batch-level tracking. It requires more upfront setup but gives you a much stronger audit position.",
              )}
            </p>

            <h2>
              {t(
                "resources.traceability.geolocation.title",
                "How Geolocation Data Feeds Into Traceability",
              )}
            </h2>
            <p>
              {t(
                "resources.traceability.geolocation.body",
                "Geolocation (Article 9(1)(d)) is the foundation of traceability under EUDR. Without coordinates, you cannot identify which plots contributed to a shipment, and you cannot run the deforestation check required under Article 10(2)(e). Your traceability system must store these coordinates in a structured format (GeoJSON or equivalent) and link them to the relevant batches.",
              )}
            </p>
            <p>
              {t(
                "resources.traceability.geolocation.body2",
                "For plots above 4 hectares, you need polygon coordinates (not just a single point). This is important because a point coordinate in a deforestation-free area does not guarantee the entire plot is deforestation-free. Polygons are checked against satellite imagery; points are not sufficient for meaningful verification.",
              )}
            </p>

            <h2>
              {t(
                "resources.traceability.suppliers.title",
                "Working with Third-Party Suppliers and Cooperatives",
              )}
            </h2>
            <p>
              {t(
                "resources.traceability.suppliers.body",
                "If you buy from intermediaries, cooperatives, or aggregators, you face an additional challenge: they may not have traceability systems of their own. In many supply chains, smallholder farmers sell to local collectors who aggregate produce before it reaches an exporter. You need to push traceability requirements upstream.",
              )}
            </p>
            <p>
              {t(
                "resources.traceability.suppliers.body2",
                "Practical steps include:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.traceability.suppliers.s1",
                  "Adding traceability clauses to supplier contracts that require plot-level data",
                )}
              </li>
              <li>
                {t(
                  "resources.traceability.suppliers.s2",
                  "Providing simple data collection templates or mobile tools for cooperatives",
                )}
              </li>
              <li>
                {t(
                  "resources.traceability.suppliers.s3",
                  "Conducting spot checks on a sample of your suppliers' records",
                )}
              </li>
              <li>
                {t(
                  "resources.traceability.suppliers.s4",
                  "Using a supplier portal to collect and validate data before shipment",
                )}
              </li>
            </ul>

            <h2>
              {t(
                "resources.traceability.custody.title",
                "Documenting the Chain of Custody",
              )}
            </h2>
            <p>
              {t(
                "resources.traceability.custody.body",
                "Your chain-of-custody documentation should include, at minimum:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.traceability.custody.c1",
                  "Purchase orders and invoices linking each transaction to product batches",
                )}
              </li>
              <li>
                {t(
                  "resources.traceability.custody.c2",
                  "Transport documentation (bills of lading, airway bills) tied to batch IDs",
                )}
              </li>
              <li>
                {t(
                  "resources.traceability.custody.c3",
                  "Warehouse receipt records showing storage and handling between ownership transfers",
                )}
              </li>
              <li>
                {t(
                  "resources.traceability.custody.c4",
                  "A master register that maps each incoming shipment to its originating plots",
                )}
              </li>
            </ul>

            <h2>
              {t(
                "resources.traceability.building.title",
                "Building Traceability from Scratch",
              )}
            </h2>
            <p>
              {t(
                "resources.traceability.building.body",
                "If you do not have a traceability system today, start with a pilot. Pick one commodity from one country and build the full chain for a single shipment. Document everything you learn: what data is easy to collect, where the gaps are, which suppliers push back. Then scale the process to your full portfolio. A phased approach reduces risk and gives you time to train your team and suppliers before the deadline.",
              )}
            </p>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.traceability.cta.title",
                "Need help building your traceability system?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.traceability.cta.desc",
                "Our free diagnostic walks through your current setup and identifies the gaps — in under 3 minutes.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.traceability.cta.button", "Take the free diagnostic")}
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
