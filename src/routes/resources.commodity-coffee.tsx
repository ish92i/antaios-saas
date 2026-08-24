import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/commodity-coffee")({
  component: CommodityCoffeePage,
  beforeLoad: () => ({
    title: "EUDR Coffee Compliance — Antaios Resources",
  }),
});

function CommodityCoffeePage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Coffee Compliance: What Importers Need to Know"
        description="How the EU Deforestation Regulation affects coffee imports — traceability, geolocation, risk classification, and compliance steps for importers sourcing from Ethiopia, Colombia, Vietnam, and beyond."
        path="/resources/commodity-coffee"
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
              {t("resources.commodityCoffee.category", "Commodity Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.commodityCoffee.readTime", "8 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.commodityCoffee.title",
              "EUDR Coffee Compliance: What Importers Need to Know",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.commodityCoffee.intro",
                "Coffee is one of the most widely traded agricultural commodities in the world. With over 10 million tonnes exported annually, it is also one of the products covered by the EU Deforestation Regulation (EU) 2023/1115. If you import coffee into the EU, you need to understand what the regulation demands and how to meet those demands before the enforcement date arrives.",
              )}
            </p>

            <h2>
              {t("resources.commodityCoffee.section1.title", "Why Coffee Is Regulated")}
            </h2>
            <p>
              {t(
                "resources.commodityCoffee.section1.body",
                "Coffee production has historically been linked to deforestation, particularly in tropical regions where forest cover is cleared to establish new plantations. The EU Commission identified coffee as a commodity with a significant deforestation footprint. Under EUDR, coffee is classified alongside cocoa, soy, palm oil, rubber, cattle, and wood as a regulated commodity. Any operator placing coffee on the EU market must demonstrate that it was not produced on land deforested after 31 December 2020.",
              )}
            </p>
            <p>
              {t(
                "resources.commodityCoffee.section1.body2",
                "The regulation applies to both raw and processed coffee products, including green beans, roasted beans, and soluble coffee. It covers imports from all countries, but the level of scrutiny depends on the EU's country risk classification.",
              )}
            </p>

            <h2>
              {t("resources.commodityCoffee.section2.title", "What EUDR Requires for Coffee Imports")}
            </h2>
            <p>
              {t(
                "resources.commodityCoffee.section2.body",
                "As an importer, you are classified as an operator under EUDR. This means you bear responsibility for the entire supply chain, regardless of how many intermediaries exist between the farm and your warehouse. The five due-diligence criteria — traceability, geolocation, applicable legislation compliance, verifiable information, and risk assessment — all apply to your coffee imports.",
              )}
            </p>
            <p>
              {t(
                "resources.commodityCoffee.section2.body2",
                "Practically, this means you must collect geolocation data for every plot of land where your coffee was grown, verify that production complied with local laws, and maintain auditable records. A supplier's word alone is not sufficient.",
              )}
            </p>

            <h2>
              {t("resources.commodityCoffee.section3.title", "Key Coffee-Producing Countries")}
            </h2>
            <p>
              {t(
                "resources.commodityCoffee.section3.body",
                "The EU sources coffee from dozens of countries. Each presents different compliance challenges. Here are the six largest origins and the specific issues importers should understand.",
              )}
            </p>

            <h3>
              {t("resources.commodityCoffee.country.ethiopia", "Ethiopia")}
            </h3>
            <p>
              {t(
                "resources.commodityCoffee.country.ethiopia.body",
                "Ethiopia is the birthplace of Arabica coffee and the fifth-largest producer globally. Much of its coffee is grown by smallholder farmers on plots under two hectares. Traceability at the farm level is challenging because the supply chain involves thousands of cooperatives and washing stations. Geolocation data is often incomplete, and many farmers do not have formal land titles.",
              )}
            </p>

            <h3>
              {t("resources.commodityCoffee.country.colombia", "Colombia")}
            </h3>
            <p>
              {t(
                "resources.commodityCoffee.country.colombia.body",
                "Colombia is known for high-quality washed Arabica. The Colombian Coffee Growers Federation (FNC) maintains a structured supply chain, which can simplify traceability. However, compliance still requires plot-level geolocation data that the FNC may not automatically provide to individual importers. Colombia is classified as low-to-moderate deforestation risk by the EU benchmarking methodology.",
              )}
            </p>

            <h3>
              {t("resources.commodityCoffee.country.vietnam", "Vietnam")}
            </h3>
            <p>
              {t(
                "resources.commodityCoffee.country.vietnam.body",
                "Vietnam is the world's second-largest coffee producer and the largest producer of Robusta. A significant portion of Vietnamese coffee comes from the Central Highlands, where land-use changes have been documented. The country is classified as high-risk in the EU's benchmarking system. Importers sourcing from Vietnam should expect heightened due-diligence requirements and potentially additional verification steps.",
              )}
            </p>

            <h3>
              {t("resources.commodityCoffee.country.brazil", "Brazil")}
            </h3>
            <p>
              {t(
                "resources.commodityCoffee.country.brazil.body",
                "Brazil is the world's largest coffee producer, supplying roughly a third of global output. While Brazil has well-established certification systems, deforestation in the Cerrado and Amazon biomes remains a concern. The EU benchmark classifies Brazil as high-risk. Importers must be prepared to demonstrate that their supply chains are deforestation-free, which requires detailed geolocation mapping across large estates and cooperatives.",
              )}
            </p>

            <h3>
              {t("resources.commodityCoffee.country.honduras", "Honduras")}
            </h3>
            <p>
              {t(
                "resources.commodityCoffee.country.honduras.body",
                "Honduras is a significant Central American producer. The country faces challenges with land tenure documentation and informal supply chains. Smallholder coffee farming is widespread, and many farmers lack the infrastructure to provide GPS coordinates. Importers working with Honduran cooperatives should invest in field-level data collection support.",
              )}
            </p>

            <h3>
              {t("resources.commodityCoffee.country.indonesia", "Indonesia")}
            </h3>
            <p>
              {t(
                "resources.commodityCoffee.country.indonesia.body",
                "Indonesia produces both Arabica and Robusta, with significant volumes from Sumatra and Java. The archipelago's geography and the prevalence of smallholder farming complicate traceability. Indonesia has been flagged for deforestation linked to palm oil expansion, but coffee-specific deforestation risks vary by region. Importers should focus on obtaining plot-level data from their Indonesian suppliers.",
              )}
            </p>

            <h2>
              {t("resources.commodityCoffee.section4.title", "Country Risk Classification for Coffee Producers")}
            </h2>
            <p>
              {t(
                "resources.commodityCoffee.section4.body",
                "The EU's benchmarking system classifies countries into low, standard, or high risk based on deforestation trends, forest cover changes, and production practices. The risk classification determines the level of due diligence required: low-risk countries trigger simplified checks, while high-risk countries require full due diligence with additional verification.",
              )}
            </p>
            <p>
              {t(
                "resources.commodityCoffee.section4.body2",
                "For coffee importers, this means the compliance burden varies by origin. A shipment from a low-risk country like Colombia requires less documentation than the same shipment from a high-risk country like Vietnam or Brazil. However, even low-risk classifications do not exempt you from the five due-diligence criteria — they simply reduce the frequency and intensity of verification.",
              )}
            </p>

            <h2>
              {t("resources.commodityCoffee.section5.title", "Traceability: Cooperative vs Farm-Level")}
            </h2>
            <p>
              {t(
                "resources.commodityCoffee.section5.body",
                "Many coffee supply chains operate through cooperatives that aggregate beans from hundreds or thousands of smallholders. EUDR requires traceability to the plot level, which means cooperatives must maintain records linking each batch to specific farmers and their farms. This is a significant shift from traditional cooperative operations, where beans from different farmers are often mixed without individual identification.",
              )}
            </p>
            <p>
              {t(
                "resources.commodityCoffee.section5.body2",
                "Importers should assess whether their cooperative partners have the systems in place to support plot-level traceability. Some cooperatives are already equipped through sustainability certification programs, while others will need to invest in new data collection and management processes.",
              )}
            </p>

            <h2>
              {t("resources.commodityCoffee.section6.title", "Geolocation Challenges for Smallholder Coffee Farmers")}
            </h2>
            <p>
              {t(
                "resources.commodityCoffee.section6.body",
                "An estimated 70% of the world's coffee is produced by smallholder farmers on plots smaller than five hectares. Many of these farmers operate in remote areas with limited access to technology. Collecting GPS coordinates for thousands of small plots is a logistical challenge that requires investment in mobile tools, field officers, or farmer training programs.",
              )}
            </p>
            <p>
              {t(
                "resources.commodityCoffee.section6.body2",
                "Importers who fail to invest in geolocation infrastructure risk non-compliance. A single missing or inaccurate coordinate can trigger a rejection of your due-diligence statement. The good news is that several technology providers and cooperatives are already developing scalable solutions for smallholder geolocation collection.",
              )}
            </p>

            <h2>
              {t("resources.commodityCoffee.section7.title", "Common Compliance Pitfalls for Coffee Importers")}
            </h2>
            <ul>
              <li>
                {t(
                  "resources.commodityCoffee.pitfall1",
                  "Assuming supplier declarations are enough — they are not. You must independently verify the information.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.pitfall2",
                  "Mixing batches from different origins without separating traceability records. Each batch must be individually traceable.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.pitfall3",
                  "Ignoring the processed-coffee rule. Roasted and soluble coffee products are also covered, not just green beans.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.pitfall4",
                  "Failing to update risk assessments when supplier countries change status. Country classifications are reviewed periodically.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.pitfall5",
                  "Not maintaining evidence in an auditable format. Scattered spreadsheets and email attachments are not a compliance system.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.commodityCoffee.section8.title", "Step-by-Step: Coffee Compliance Checklist")}
            </h2>
            <p>
              {t(
                "resources.commodityCoffee.section8.body",
                "Follow these steps to prepare your coffee supply chain for EUDR compliance:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.commodityCoffee.checklist1",
                  "Map your supply chain. Identify every supplier, cooperative, and origin country.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.checklist2",
                  "Request geolocation data from all suppliers. Verify coordinates match known production areas.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.checklist3",
                  "Assess country risk. Check the EU benchmarking classification for each origin.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.checklist4",
                  "Verify legal compliance. Obtain supplier attestations covering land-use, environmental, and labour laws.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.checklist5",
                  "Build a risk assessment methodology. Document your approach to evaluating each shipment.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.checklist6",
                  "Create a centralised evidence repository. Tag each document with source, date, and verification status.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.checklist7",
                  "Conduct a mock audit. Test your system with a real shipment before regulators do.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.commodityCoffee.section9.title", "How Antaios Handles Coffee Supply Chain Complexity")}
            </h2>
            <p>
              {t(
                "resources.commodityCoffee.section9.body",
                "Coffee supply chains are among the most complex in the regulated commodities. Antaios is built to handle this complexity. Our platform connects directly with cooperatives, aggregators, and technology providers to collect and verify geolocation data at scale. We automate risk assessments based on EU benchmarking data and maintain a centralised, auditable evidence repository for every shipment.",
              )}
            </p>
            <p>
              {t(
                "resources.commodityCoffee.section9.body2",
                "Whether you source from a single origin or dozens of countries, Antaios gives you the visibility and documentation you need to meet EUDR requirements without building a compliance team from scratch.",
              )}
            </p>

            <h2>
              {t("resources.commodityCoffee.section10.title", "Key Takeaways")}
            </h2>
            <ul>
              <li>
                {t(
                  "resources.commodityCoffee.takeaway1",
                  "Coffee is a regulated commodity under EUDR, covering raw and processed forms.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.takeaway2",
                  "Importers are operators and bear full supply-chain responsibility.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.takeaway3",
                  "Country risk classification affects the intensity of due diligence required.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.takeaway4",
                  "Smallholder geolocation data is a major challenge — invest in solutions early.",
                )}
              </li>
              <li>
                {t(
                  "resources.commodityCoffee.takeaway5",
                  "A centralised, auditable compliance system is non-negotiable.",
                )}
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.commodityCoffee.cta.title",
                "Not sure where you stand?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.commodityCoffee.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.commodityCoffee.cta.button", "Take the free diagnostic")}
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
