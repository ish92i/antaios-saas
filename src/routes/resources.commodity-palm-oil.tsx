import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/commodity-palm-oil")({
  component: CommodityPalmOilPage,
  beforeLoad: () => ({
    title: "EUDR Palm Oil Compliance: Deforestation-Free Requirements — Antaios Resources",
  }),
});

function CommodityPalmOilPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Palm Oil Compliance: Deforestation-Free Requirements"
        description="Complete guide to EUDR compliance for palm oil imports: geolocation requirements, RSPO certification, smallholder traceability, and country risk classification for Indonesia, Malaysia, Thailand, and Colombia."
        path="/resources/commodity-palm-oil"
        datePublished="2024-12-01"
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
              {t("resources.palmOil.category", "Commodity Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.palmOil.readTime", "10 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.palmOil.title",
              "EUDR Palm Oil Compliance: Deforestation-Free Requirements",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.palmOil.intro",
                "Palm oil is the world's most consumed vegetable oil and the single largest commodity covered by the EU Deforestation Regulation. Its supply chain spans millions of smallholders, thousands of mills, and complex refining networks — making EUDR compliance uniquely challenging. This guide walks through what palm oil importers need to know, from geolocation requirements to certification gaps.",
              )}
            </p>

            <h2>
              {t("resources.palmOil.why.title", "Why Palm Oil Is the Most Scrutinised Commodity")}
            </h2>
            <p>
              {t(
                "resources.palmOil.why.body",
                "Palm oil accounts for roughly 40% of global vegetable oil production and appears in an estimated 50% of consumer products — from food and cosmetics to biofuels. The EU imports approximately 6.5 million tonnes of palm oil annually, making it one of the largest single-commodity trade flows subject to EUDR. Indonesia and Malaysia together produce over 85% of global supply, but significant volumes also come from Thailand, Colombia, and West Africa.",
              )}
            </p>
            <p>
              {t(
                "resources.palmOil.why.body2",
                "The commodity's association with tropical deforestation — particularly in Borneo and Sumatra — was a primary driver behind the regulation. Palm oil plantations have historically been one of the leading causes of forest loss in Southeast Asia, and the EU has signalled that this commodity will face intense regulatory scrutiny.",
              )}
            </p>

            <h2>
              {t("resources.palmOil.requirements.title", "EUDR Requirements Specific to Palm Oil")}
            </h2>
            <p>
              {t(
                "resources.palmOil.requirements.body",
                "While the EUDR applies uniformly across all covered commodities, palm oil importers face several unique compliance challenges. The regulation requires that palm oil imported into the EU must be proven deforestation-free (produced on land that was not deforested after 31 December 2020) and legally produced under the laws of the country of origin.",
              )}
            </p>
            <p>
              {t(
                "resources.palmOil.requirements.body2",
                "For palm oil specifically, the due-diligence obligations extend through the supply chain to the plantation level. Unlike soy or cattle, where supply chains may be shorter, palm oil often passes through multiple intermediaries — from smallholder farmers to collection centres, mills, refineries, and traders — before reaching the EU importer. Each link must be documented.",
              )}
            </p>

            <h2>
              {t("resources.palmOil.countries.title", "Key Producing Countries and Their Risk Profiles")}
            </h2>
            <p>
              {t(
                "resources.palmOil.countries.body",
                "The EU Commission will benchmark producing countries based on their deforestation risk. The risk classification directly affects the level of due diligence required from importers. Here is how the major palm oil producers are expected to be categorised:",
              )}
            </p>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Country</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Expected Risk Level</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Key Considerations</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Indonesia</td>
                    <td className="px-4 py-3 text-muted-foreground">High</td>
                    <td className="px-4 py-3 text-muted-foreground">Largest producer. Significant deforestation history. Complex smallholder landscape.</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Malaysia</td>
                    <td className="px-4 py-3 text-muted-foreground">High</td>
                    <td className="px-4 py-3 text-muted-foreground">Second-largest producer. Ongoing forest conversion in Sabah and Sarawak.</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Thailand</td>
                    <td className="px-4 py-3 text-muted-foreground">Medium</td>
                    <td className="px-4 py-3 text-muted-foreground">Domestic-focused supply chain. Moderate deforestation pressure in southern provinces.</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Colombia</td>
                    <td className="px-4 py-3 text-muted-foreground">Medium</td>
                    <td className="px-4 py-3 text-muted-foreground">Fastest-growing producer. Linked to broader land-use issues in the Amazon and Orinoco regions.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              {t(
                "resources.palmOil.countries.note",
                "High-risk countries trigger stricter due-diligence requirements, including more frequent third-party audits and additional documentation. Importers sourcing from high-risk origins should plan for significantly higher compliance costs.",
              )}
            </p>

            <h2>
              {t("resources.palmOil.rspo.title", "RSPO Certification and Its Relationship to EUDR")}
            </h2>
            <p>
              {t(
                "resources.palmOil.rspo.body",
                "The Roundtable on Sustainable Palm Oil (RSPO) is the most widely adopted sustainability certification for palm oil. However, RSPO certification alone does not guarantee EUDR compliance. The two frameworks overlap but are not equivalent.",
              )}
            </p>
            <p>
              {t(
                "resources.palmOil.rspo.body2",
                "RSPO addresses deforestation as part of its principles and criteria, but EUDR requires specific evidence — particularly geolocation data at the plot level — that RSPO certification does not always provide. Importers cannot rely on an RSPO certificate as a substitute for their own due-diligence obligations.",
              )}
            </p>
            <p>
              <strong>{t("resources.palmOil.rspo.tip", "What this means in practice:")}</strong>{" "}
              {t(
                "resources.palmOil.rspo.tipBody",
                "Use RSPO certification as a starting point, not an endpoint. RSPO-certified suppliers are more likely to have the documentation infrastructure you need, but you must still verify that geolocation data, traceability records, and legal-compliance evidence meet EUDR standards.",
              )}
            </p>

            <h2>
              {t("resources.palmOil.traceability.title", "Traceability: Mill to Plantation Mapping")}
            </h2>
            <p>
              {t(
                "resources.palmOil.traceability.body",
                "Palm oil traceability is uniquely complex because fresh fruit bunches (FFBs) are typically processed at a mill before the crude palm oil (CPO) enters the broader supply chain. Each mill may source from dozens or even hundreds of plantations, and those plantations may include both large estates and smallholder farms.",
              )}
            </p>
            <p>
              {t(
                "resources.palmOil.traceability.body2",
                "EUDR compliance requires that you can trace your palm oil back through the mill to the individual plantation or smallholder plot. This means your suppliers must provide mill-to-plantation mapping — a record of which plantations supplied each mill during a given period.",
              )}
            </p>
            <p>
              <strong>{t("resources.palmOil.traceability.tip", "Practical approach:")}</strong>{" "}
              {t(
                "resources.palmOil.traceability.tipBody",
                "Request supplier declarations that include the mill name, mill location, and the list of supplying plantations (with their geolocation coordinates). If your supplier cannot provide this, ask for the RSPO traceability documentation or third-party audit reports that cover the same data.",
              )}
            </p>

            <h2>
              {t("resources.palmOil.geolocation.title", "Geolocation: Estates and Smallholders")}
            </h2>
            <p>
              {t(
                "resources.palmOil.geolocation.body",
                "The geolocation requirement is one of the most demanding aspects of palm oil compliance. For plantations larger than 4 hectares, you need polygon coordinates — the full boundary of the plot. For smaller plots, a single latitude/longitude point is acceptable. This applies equally to large corporate estates and smallholder farms.",
              )}
            </p>
            <p>
              {t(
                "resources.palmOil.geolocation.body2",
                "The challenge is that an estimated 40% of global palm oil is produced by smallholder farmers, many of whom do not have formal land titles or GPS-capable devices. Collecting and verifying geolocation data from thousands of smallholders across remote areas of Indonesia and Malaysia is one of the hardest operational problems in EUDR compliance.",
              )}
            </p>
            <p>
              <strong>{t("resources.palmOil.geolocation.tip", "Strategy:")}</strong>{" "}
              {t(
                "resources.palmOil.geolocation.tipBody",
                "Work with cooperatives and farmer organisations that can aggregate geolocation data. Mobile data-collection tools designed for smallholder contexts — such as offline-capable apps with guided workflows — can dramatically reduce the cost and time of plot-level GPS collection.",
              )}
            </p>

            <h2>
              {t("resources.palmOil.pitfalls.title", "Common Compliance Pitfalls for Palm Oil Importers")}
            </h2>
            <ul>
              <li>
                {t(
                  "resources.palmOil.pitfalls.p1",
                  "Assuming RSPO certification covers EUDR obligations — it does not. You still need geolocation data and legal-compliance evidence.",
                )}
              </li>
              <li>
                {t(
                  "resources.palmOil.pitfalls.p2",
                  "Failing to request mill-to-plantation mapping from suppliers. Without this, you cannot demonstrate traceability to the plot level.",
                )}
              </li>
              <li>
                {t(
                  "resources.palmOil.pitfalls.p3",
                  "Treating geolocation as a one-time collection. Coordinates must be current and linked to the specific batch or shipment you are importing.",
                )}
              </li>
              <li>
                {t(
                  "resources.palmOil.pitfalls.p4",
                  "Ignoring smallholder complexity. If your supply chain includes smallholders, you need a plan for collecting and verifying their data — not just a contractual requirement.",
                )}
              </li>
              <li>
                {t(
                  "resources.palmOil.pitfalls.p5",
                  "Underestimating the compliance cost from high-risk countries. Indonesia and Malaysia will require significantly more documentation and verification than lower-risk origins.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.palmOil.checklist.title", "Step-by-Step: Palm Oil Compliance Checklist")}
            </h2>
            <p>
              {t(
                "resources.palmOil.checklist.body",
                "Use this checklist to assess your current state of readiness for EUDR palm oil compliance:",
              )}
            </p>
            <ul>
              <li>
                <strong>{t("resources.palmOil.checklist.s1", "Map your supply chain:")}</strong>{" "}
                {t(
                  "resources.palmOil.checklist.s1Body",
                  "Identify every supplier, mill, and plantation source. Document the flow from origin to your facility.",
                )}
              </li>
              <li>
                <strong>{t("resources.palmOil.checklist.s2", "Collect geolocation data:")}</strong>{" "}
                {t(
                  "resources.palmOil.checklist.s2Body",
                  "Request polygon or point coordinates for every plantation. Verify that coordinates match the production period.",
                )}
              </li>
              <li>
                <strong>{t("resources.palmOil.checklist.s3", "Verify legal compliance:")}</strong>{" "}
                {t(
                  "resources.palmOil.checklist.s3Body",
                  "Obtain supplier attestations and third-party evidence covering land-use rights, environmental laws, and labour regulations.",
                )}
              </li>
              <li>
                <strong>{t("resources.palmOil.checklist.s4", "Conduct risk assessment:")}</strong>{" "}
                {t(
                  "resources.palmOil.checklist.s4Body",
                  "Evaluate deforestation risk by country, region, and supplier. Document your methodology and findings.",
                )}
              </li>
              <li>
                <strong>{t("resources.palmOil.checklist.s5", "Prepare due-diligence statement:")}</strong>{" "}
                {t(
                  "resources.palmOil.checklist.s5Body",
                  "Compile all evidence into a DDS-ready format. Submit before placing products on the EU market.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.palmOil.antaios.title", "How Antaios Handles Palm Oil Supply Chain Complexity")}
            </h2>
            <p>
              {t(
                "resources.palmOil.antaios.body",
                "Antaios is designed to handle the specific complexity of palm oil supply chains. Our platform connects directly to your suppliers to automate the collection of geolocation data, mill-to-plantation mapping, and legal-compliance evidence. We maintain a centralised evidence repository where every document is tagged, dated, and verified — making audit preparation straightforward.",
              )}
            </p>
            <p>
              {t(
                "resources.palmOil.antaios.body2",
                "For importers working with smallholders, our mobile data-collection tools enable field officers to gather plot-level GPS coordinates even in areas with limited connectivity. The platform automatically flags gaps in your documentation and guides you through remediation steps before they become compliance issues.",
              )}
            </p>

            <h3>
              {t("resources.palmOil.takeaways.title", "Key Takeaways")}
            </h3>
            <ul>
              <li>
                {t(
                  "resources.palmOil.takeaways.t1",
                  "Palm oil is the highest-volume commodity under EUDR and will face intense regulatory scrutiny.",
                )}
              </li>
              <li>
                {t(
                  "resources.palmOil.takeaways.t2",
                  "RSPO certification is helpful but does not replace EUDR due-diligence obligations.",
                )}
              </li>
              <li>
                {t(
                  "resources.palmOil.takeaways.t3",
                  "Mill-to-plantation traceability and plot-level geolocation are non-negotiable requirements.",
                )}
              </li>
              <li>
                {t(
                  "resources.palmOil.takeaways.t4",
                  "Smallholder data collection is the biggest operational challenge — plan for it early.",
                )}
              </li>
              <li>
                {t(
                  "resources.palmOil.takeaways.t5",
                  "Country risk classification will determine the intensity of your due-diligence obligations.",
                )}
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.palmOil.cta.title",
                "Not sure where you stand?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.palmOil.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.palmOil.cta.button", "Take the free diagnostic")}
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
