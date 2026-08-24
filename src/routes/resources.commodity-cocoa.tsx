import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/commodity-cocoa")({
  component: CommodityCocoaPage,
  beforeLoad: () => ({
    title: "EUDR Cocoa Compliance — Antaios Resources",
  }),
});

function CommodityCocoaPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Cocoa Compliance: Requirements for Chocolate & Cocoa Importers"
        description="Complete guide to EU Deforestation Regulation compliance for cocoa and chocolate importers. Covers traceability, geolocation, country risk, and supply chain due diligence for Ghana, Côte d'Ivoire, and other cocoa-producing nations."
        path="/resources/commodity-cocoa"
        datePublished="2024-11-20"
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
              {t("resources.cocoa.category", "Commodity Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.cocoa.readTime", "8 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.cocoa.title",
              "EUDR Cocoa Compliance: Requirements for Chocolate & Cocoa Importers",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.cocoa.intro",
                "Cocoa sits squarely within the scope of the EU Deforestation Regulation (EU) 2023/1115. For chocolate manufacturers, cocoa processors, and commodity traders importing into the EU, compliance is not optional. The regulation demands full traceability to plot level, verified geolocation data, and documented risk assessments — all before a single bean enters the European market.",
              )}
            </p>
            <p>
              {t(
                "resources.cocoa.intro2",
                "This guide walks through what makes cocoa a high-priority commodity under EUDR, the specific compliance challenges it presents, and the steps importers must take to stay on the right side of the regulation.",
              )}
            </p>

            <h2>
              {t("resources.cocoa.whyCocoa.title", "Why Cocoa Is a Target Commodity")}
            </h2>
            <p>
              {t(
                "resources.cocoa.whyCocoa.body",
                "The link between cocoa cultivation and tropical deforestation is well documented. West Africa — which produces roughly 70 percent of the world's cocoa — has lost millions of hectares of forest to cocoa expansion. Côte d'Ivoire alone has seen its forest cover decline from over 16 million hectares in 1960 to under 3 million today, driven largely by cocoa farming. Ghana, Cameroon, and Nigeria face similar pressures.",
              )}
            </p>
            <p>
              {t(
                "resources.cocoa.whyCocoa.body2",
                "The EU has responded by including cocoa in the original list of seven commodities covered by the regulation. Any operator placing cocoa or chocolate products on the EU market must demonstrate that the cocoa was not produced on land that was deforested after 31 December 2020.",
              )}
            </p>

            <h2>
              {t("resources.cocoa.requirements.title", "EUDR Requirements Specific to Cocoa Imports")}
            </h2>
            <p>
              {t(
                "resources.cocoa.requirements.body",
                "While the five due-diligence criteria of Article 10(2) apply to all covered commodities, cocoa presents unique operational challenges. The commodity is typically traded through layered supply chains involving cooperatives, middlemen, and multiple aggregators before reaching export. This makes traceability harder to maintain than for commodities with fewer intermediaries.",
              )}
            </p>
            <p>
              {t(
                "resources.cocoa.requirements.body2",
                "Importers must collect and verify: geolocation coordinates for every production plot; evidence that the cocoa was grown legally under the laws of the producing country; and a documented risk assessment linking each shipment to specific sources.",
              )}
            </p>

            <h2>
              {t("resources.cocoa.countries.title", "Key Producing Countries and Risk Profiles")}
            </h2>
            <p>
              {t(
                "resources.cocoa.countries.body",
                "The EU Commission's country benchmarking system classifies producing nations into standard, high, or very high risk. The classification directly affects the level of due diligence required. For cocoa importers, these are the countries that matter most:",
              )}
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Country</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Share of Global Production</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Risk Considerations</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Côte d'Ivoire</td>
                    <td className="px-4 py-3 text-muted-foreground">~38%</td>
                    <td className="px-4 py-3 text-muted-foreground">Extensive historical deforestation, smallholder-dominated supply chains, limited plot-level data</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Ghana</td>
                    <td className="px-4 py-3 text-muted-foreground">~17%</td>
                    <td className="px-4 py-3 text-muted-foreground">Forest reserve encroachment, child labour concerns, cooperative governance gaps</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Cameroon</td>
                    <td className="px-4 py-3 text-muted-foreground">~3%</td>
                    <td className="px-4 py-3 text-muted-foreground">Mixed land-use zones, emerging regulatory framework, traceability infrastructure still developing</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Nigeria</td>
                    <td className="px-4 py-3 text-muted-foreground">~5%</td>
                    <td className="px-4 py-3 text-muted-foreground">Decentralised production, limited centralised traceability systems</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Ecuador</td>
                    <td className="px-4 py-3 text-muted-foreground">~6%</td>
                    <td className="px-4 py-3 text-muted-foreground">Amazon-adjacent cultivation areas, but generally stronger traceability infrastructure</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>
              {t("resources.cocoa.risk.title", "Country Risk Classification and Due Diligence Intensity")}
            </h2>
            <p>
              {t(
                "resources.cocoa.risk.body",
                "Under EUDR, the risk classification of the producing country determines the baseline level of scrutiny. A very-high-risk country requires the most extensive evidence collection and the most rigorous verification process. Standard-risk countries allow for a somewhat lighter touch, though the importer still bears full responsibility.",
              )}
            </p>
            <p>
              {t(
                "resources.cocoa.risk.body2",
                "For cocoa, this means importers sourcing from Côte d'Ivoire or Ghana — classified as high risk for deforestation — must go beyond supplier declarations. They need plot-level geolocation, third-party verification where possible, and documented evidence that the cocoa was produced legally.",
              )}
            </p>

            <h2>
              {t("resources.cocoa.traceability.title", "Traceability Challenges in Cocoa Supply Chains")}
            </h2>
            <p>
              {t(
                "resources.cocoa.traceability.body",
                "Cocoa supply chains are among the most complex of any covered commodity. A typical shipment may involve dozens of cooperatives, hundreds of aggregator points, and thousands of smallholder farmers. The average cocoa plot in West Africa is under two hectares, and many farmers lack formal land titles or cadastral records.",
              )}
            </p>
            <p>
              {t(
                "resources.cocoa.traceability.body2",
                "This creates a structural traceability gap. Unlike industrial-scale commodities, cocoa cannot be traced to a single large plantation. Importers must build systems that aggregate plot-level data across their entire supply chain while maintaining batch-level integrity.",
              })}
            </p>
            <p>
              <strong>{t("resources.cocoa.traceability.cooperatives", "Cooperative systems play a central role:")}</strong>{" "}
              {t(
                "resources.cocoa.traceability.cooperativesBody",
                "Many cocoa farmers sell through cooperatives that aggregate product before export. While cooperatives can simplify logistics, they also obscure the link between a specific batch and its plot of origin. Importers need to ensure cooperatives maintain accurate farmer registries and plot-level records.",
              )}
            </p>
            <p>
              {t(
                "resources.cocoa.traceability.childLabour",
                "The intersection with child labour also demands attention. While EUDR does not explicitly mandate child-labour due diligence, the applicable-legislation criterion (Article 10(2)(c)) requires verification that production complies with the laws of the producing country — which in most West African nations includes prohibitions on child labour.",
              )}
            </p>

            <h2>
              {t("resources.cocoa.geolocation.title", "Geolocation Data for Cocoa Plots")}
            </h2>
            <p>
              {t(
                "resources.cocoa.geolocation.body",
                "Article 9(1)(d) requires geolocation data for every production plot. For cocoa, this means GPS coordinates — either a point for plots under 4 hectares or a polygon for larger areas. Given that the vast majority of West African cocoa plots are smallholder, point coordinates will suffice for most, but the data must still be collected, verified, and linked to specific shipments.",
              )}
            </p>
            <p>
              <strong>{t("resources.cocoa.geolocation.challenge", "The core challenge:")}</strong>{" "}
              {t(
                "resources.cocoa.geolocation.challengeBody",
                "Many smallholder farmers do not have the technical capacity or the devices to collect GPS data. Importers and cooperatives must invest in field-level data collection — either through mobile apps, field officers, or partnerships with technology providers. Without this, geolocation data becomes the single most common point of failure in EUDR compliance.",
              )}
            </p>
            <p>
              {t(
                "resources.cocoa.geolocation.verification",
                "Verification is equally important. Coordinates must match the physical location of production. Cross-referencing against satellite imagery, land-use maps, and deforestation alerts is essential to confirm that the reported plot does not overlap with protected areas or recently deforested land.",
              )}
            </p>

            <h2>
              {t("resources.cocoa.pitfalls.title", "Common Compliance Pitfalls for Cocoa Importers")}
            </h2>
            <ul>
              <li>
                <strong>{t("resources.cocoa.pitfalls.p1.title", "Blanket supplier declarations:")}</strong>{" "}
                {t(
                  "resources.cocoa.pitfalls.p1.body",
                  "Relying on a single supplier statement without plot-level evidence. Regulators expect batch-specific documentation, not general attestations.",
                )}
              </li>
              <li>
                <strong>{t("resources.cocoa.pitfalls.p2.title", "Incomplete geolocation data:")}</strong>{" "}
                {t(
                  "resources.cocoa.pitfalls.p2.body",
                  "Submitting coordinates without verification. Coordinates that do not match the claimed production area or that overlap with deforested zones will trigger compliance failures.",
                )}
              </li>
              <li>
                <strong>{t("resources.cocoa.pitfalls.p3.title", "Ignoring cooperative governance:")}</strong>{" "}
                {t(
                  "resources.cocoa.pitfalls.p3.body",
                  "Failing to audit the internal records of cooperatives. If a cooperative cannot identify which farmer produced a specific batch, the importer inherits that traceability gap.",
                )}
              </li>
              <li>
                <strong>{t("resources.cocoa.pitfalls.p4.title", "Overlooking country risk changes:")}</strong>{" "}
                {t(
                  "resources.cocoa.pitfalls.p4.body",
                  "The EU Commission can reclassify countries at any time. An importer sourcing from a country that moves from standard to high risk must adjust their due-diligence process accordingly.",
                )}
              </li>
              <li>
                <strong>{t("resources.cocoa.pitfalls.p5.title", "Fragmented record-keeping:")}</strong>{" "}
                {t(
                  "resources.cocoa.pitfalls.p5.body",
                  "Spreading compliance evidence across emails, spreadsheets, and paper files. When an auditor asks for the full chain for a specific shipment, you need a single, organised source of truth.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.cocoa.checklist.title", "Step-by-Step: Cocoa Compliance Checklist")}
            </h2>
            <p>
              {t(
                "resources.cocoa.checklist.body",
                "The following checklist maps the compliance process to the five criteria of Article 10(2), with cocoa-specific guidance for each step.",
              )}
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Step</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Action</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Cocoa-Specific Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">1. Map your supply chain</td>
                    <td className="px-4 py-3 text-muted-foreground">Identify all actors from farmer to port</td>
                    <td className="px-4 py-3 text-muted-foreground">Map cooperatives, aggregators, and exporters — not just your direct supplier</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">2. Collect plot-level data</td>
                    <td className="px-4 py-3 text-muted-foreground">Gather GPS coordinates for every production plot</td>
                    <td className="px-4 py-3 text-muted-foreground">Invest in mobile tools or field officers for smallholder data collection</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">3. Verify compliance</td>
                    <td className="px-4 py-3 text-muted-foreground">Confirm legal production under local law</td>
                    <td className="px-4 py-3 text-muted-foreground">Check land-use rights, environmental permits, and labour-law compliance</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">4. Assess risk</td>
                    <td className="px-4 py-3 text-muted-foreground">Evaluate deforestation risk per plot and country</td>
                    <td className="px-4 py-3 text-muted-foreground">Use deforestation-alert data and satellite imagery for verification</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">5. Document and submit</td>
                    <td className="px-4 py-3 text-muted-foreground">Prepare and submit your due-diligence statement</td>
                    <td className="px-4 py-3 text-muted-foreground">Centralise all evidence in a single auditable repository</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>
              {t("resources.cocoa.antaios.title", "How Antaios Handles Cocoa Supply Chain Complexity")}
            </h2>
            <p>
              {t(
                "resources.cocoa.antaios.body",
                "Antaios is built to address exactly the kind of complexity that cocoa supply chains present. Our platform aggregates plot-level geolocation data, automates risk assessments using deforestation alerts and satellite imagery, and maintains a centralised evidence repository that maps every piece of documentation back to a specific shipment.",
              )}
            </p>
            <p>
              {t(
                "resources.cocoa.antaios.body2",
                "For cocoa importers working with cooperatives and smallholder farmers, our system supports batch-level traceability across aggregated supply chains. You can link a shipment to the cooperative, the aggregator, the individual farmers, and their respective plots — all within a single audit-ready interface.",
              )}
            </p>

            <h2>
              {t("resources.cocoa.takeaways.title", "Key Takeaways")}
            </h2>
            <ul>
              <li>
                {t(
                  "resources.cocoa.takeaways.t1",
                  "Cocoa is a covered commodity under EUDR. All chocolate and cocoa imports into the EU must comply by the applicable deadlines.",
                )}
              </li>
              <li>
                {t(
                  "resources.cocoa.takeaways.t2",
                  "West African cocoa supply chains are complex and smallholder-dominated. Traceability requires investment in field-level data collection.",
                )}
              </li>
              <li>
                {t(
                  "resources.cocoa.takeaways.t3",
                  "Geolocation data is mandatory for every production plot. Point coordinates suffice for smallholder plots, but the data must be verified.",
                )}
              </li>
              <li>
                {t(
                  "resources.cocoa.takeaways.t4",
                  "Country risk classification drives due-diligence intensity. Importers must monitor EU Commission benchmarking updates.",
                )}
              </li>
              <li>
                {t(
                  "resources.cocoa.takeaways.t5",
                  "Centralised, auditable record-keeping is non-negotiable. Fragmented documentation is a compliance failure waiting to happen.",
                )}
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.cocoa.cta.title",
                "Ready to simplify your cocoa compliance?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.cocoa.cta.desc",
                "Take our free 3-minute diagnostic to see where your supply chain stands. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.cocoa.cta.button", "Take the free diagnostic")}
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
