import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/supplier-data-guide")({
  component: SupplierDataGuidePage,
  beforeLoad: () => ({
    title: "How to Get EUDR Data from Your Suppliers — Antaios Resources",
  }),
});

function SupplierDataGuidePage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="How to Get EUDR Data from Your Suppliers: A Practical Guide for Importers"
        description="79% of importers don't have GPS coordinates for their production plots. This guide shows how to collect EUDR compliance data from cooperatives, brokers, and smallholder suppliers."
        path="/resources/supplier-data-guide"
        datePublished="2026-08-20"
        category="Practical Guide"
        faqItems={[
          {
            question: "Do my suppliers need GPS equipment?",
            answer:
              "No. Most suppliers can use a standard smartphone. For plots under 4 hectares, a single GPS point (latitude and longitude) captured by a phone app is sufficient. Only plots larger than 4 hectares require polygon boundaries, which can also be captured on a phone by walking the plot perimeter.",
          },
          {
            question: "What if my broker can't tell me which farms the coffee came from?",
            answer:
              "Brokers who consolidate lots from multiple farms present a real challenge under EUDR. You should require, as a commercial term, that the broker provides the origin data for every lot — even if it means asking their upstream suppliers to submit it. If the broker cannot or will not provide this, you may need to find an alternative source for that origin.",
          },
          {
            question: "Can I use a spreadsheet instead of software?",
            answer:
              "You can start with a spreadsheet, but it will not scale. EUDR requires auditable records with evidence, risk assessments, and traceability for every shipment. Managing this in spreadsheets creates version-control problems, missed data, and audit failures. Compliance software automates collection, flags gaps, and maintains a centralised evidence repository.",
          },
          {
            question: "What format does the geolocation data need to be in?",
            answer:
              "Geolocation data must be in decimal degrees (e.g., 9.0054, 38.7636). For plots under 4 hectares, a single point coordinate is acceptable. For plots larger than 4 hectares, you need polygon data — a series of coordinates defining the plot boundary. The data can be submitted as GeoJSON, KML, shapefiles, or simple latitude-longitude pairs.",
          },
          {
            question: "How do I get cooperatives to provide plot data?",
            answer:
              "Start by explaining the commercial reality: without EUDR compliance data, they cannot sell to the EU market. Offer practical support — a supplier portal link they can share with members, or a simple data collection form. Cooperatives that already have sustainability certifications often have partial data that can be built upon.",
          },
        ]}
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
              {t("resources.supplierDataGuide.category", "Practical Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.supplierDataGuide.readTime", "12 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.supplierDataGuide.title",
              "How to Get EUDR Data from Your Suppliers: A Practical Guide for Importers",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.supplierDataGuide.intro",
                "Most importers think EUDR compliance is about TRACES registrations and due-diligence statements. It is not. The real bottleneck is getting the actual data from the people who grew your coffee, cacao, or rubber. Your supplier does not have GPS coordinates. Your broker consolidated lots from six farms and cannot tell you where they are. Your cooperative has 500 smallholders and no GIS system. This guide gives you a practical path forward.",
              )}
            </p>

            <h2>
              {t("resources.supplierDataGuide.section1.title", "What Data You Actually Need")}
            </h2>
            <p>
              {t(
                "resources.supplierDataGuide.section1.body",
                "EUDR requires five elements of due diligence, but the data you need from suppliers boils down to four things. First, plot-level geolocation data — the GPS coordinates of the land where your product was grown. Second, the production or harvesting period, which tells you when the crop was produced. Third, the identity of the producer — name, farm name, or cooperative membership. Fourth, supporting evidence — land-use documents, sustainability certificates, or farm records that back up the claims.",
              )}
            </p>
            <p>
              {t(
                "resources.supplierDataGuide.section1.body2",
                "You do not need a soil analysis, a pesticide report, or a photograph of every tree. Keep the scope focused. If you can collect these four data points for every lot, you are well ahead of most importers.",
              )}
            </p>

            <h2>
              {t("resources.supplierDataGuide.section2.title", "GPS Is Not as Scary as It Sounds")}
            </h2>
            <p>
              {t(
                "resources.supplierDataGuide.section2.body",
                "The word 'geolocation' makes people think of professional surveying equipment and expensive consultants. In practice, EUDR distinguishes between two requirements based on plot size. For plots of 4 hectares or less — which covers the vast majority of smallholder farms — a single GPS point is sufficient. That means one latitude and one longitude coordinate, which any smartphone can capture.",
              )}
            </p>
            <p>
              {t(
                "resources.supplierDataGuide.section2.body2",
                "For plots larger than 4 hectares, you need polygon data — a series of coordinates that trace the boundary of the land. This sounds more complex, but a farmer can walk the perimeter of their plot with a phone app and the system stitches the points into a polygon. The key insight: you do not need to send a surveyor. You need to give your suppliers a tool they can use on the phone they already have.",
              )}
            </p>

            <h2>
              {t("resources.supplierDataGuide.section3.title", "Working with Cooperatives")}
            </h2>
            <p>
              {t(
                "resources.supplierDataGuide.section3.body",
                "Cooperatives are the backbone of coffee supply chains in most producing countries. A typical cooperative might aggregate coffee from 300 to 2,000 smallholder farmers, each farming half a hectare to three hectares. The cooperative collects, processes, and often exports the coffee, but they rarely have plot-level GPS data for their members.",
              )}
            </p>
            <p>
              {t(
                "resources.supplierDataGuide.section3.body2",
                "Here is how to approach it. Start with the commercial conversation, not the technical one. Explain that without this data, the cooperative cannot sell to the EU. Then offer practical support. Provide a link to a supplier portal where cooperative staff can enter farmer data on their phones. Ask the cooperative to identify a single point of contact — often a quality manager or an administrative officer — who will be responsible for collecting and submitting the information.",
              )}
            </p>
            <p>
              {t(
                "resources.supplierDataGuide.section3.body3",
                "Cooperatives that already participate in sustainability certification programmes (UTZ, Rainforest Alliance, Fairtrade) often have partial data on their members — farm names, membership numbers, sometimes even coordinates. Build on what exists. Do not ask cooperatives to start from scratch.",
              )}
            </p>

            <h2>
              {t("resources.supplierDataGuide.section4.title", "Dealing with Brokers")}
            </h2>
            <p>
              {t(
                "resources.supplierDataGuide.section4.body",
                "Brokers present the hardest traceability problem under EUDR. A typical scenario: you buy 20 tonnes of washed Arabica from a broker in Addis Ababa or Bogotá. The broker consolidated that lot from purchases at three different washing stations, which sourced from farms across a wide area. The broker does not know the individual farm names, let alone the GPS coordinates.",
              )}
            </p>
            <p>
              {t(
                "resources.supplierDataGuide.section4.body2",
                "This is a commercial problem, not just a technical one. You need to decide what you are willing to accept. In some cases, you can reconstruct the chain by working backwards from the washing station or cooperative to identify which farms contributed to the lot. In other cases, you may need to impose a contractual requirement: any future purchases must come with traceability data from the origin.",
              )}
            </p>
            <p>
              {t(
                "resources.supplierDataGuide.section4.body3",
                "For current shipments where you cannot obtain plot-level data, document your best efforts and the risk assessment you performed. EUDR allows for 'other reliable information' when direct traceability is not possible, but you must demonstrate that you made every reasonable attempt and assessed the residual risk accordingly.",
              )}
            </p>

            <h2>
              {t("resources.supplierDataGuide.section5.title", "Using a Supplier Portal")}
            </h2>
            <p>
              {t(
                "resources.supplierDataGuide.section5.body",
                "The most effective way to collect data from suppliers is to send them a link. A supplier portal works like this: you generate a unique link for each supplier, send it via email or WhatsApp, and the supplier opens it on their phone. No account, no login, no software to install. The supplier sees a simple form — enter your name, your farm location, upload a photo of your land document if you have one.",
              )}
            </p>
            <p>
              {t(
                "resources.supplierDataGuide.section5.body2",
                "The form can capture a GPS point with one tap. If the supplier needs to provide polygon data, the app guides them through walking the plot boundary. The data flows directly into your compliance system, automatically checked for completeness and flagged if something is missing.",
              )}
            </p>
            <p>
              {t(
                "resources.supplierDataGuide.section5.body3",
                "The portal follows up automatically. If a supplier has not responded after a week, the system sends a reminder. If they uploaded a document but forgot the GPS coordinates, it prompts them for the missing piece. This eliminates the manual chasing that otherwise consumes hours of your team's time.",
              )}
            </p>

            <h2>
              {t("resources.supplierDataGuide.section6.title", "Country-Specific Tips")}
            </h2>

            <h3>
              {t("resources.supplierDataGuide.country.ethiopia", "Ethiopia")}
            </h3>
            <p>
              {t(
                "resources.supplierDataGuide.country.ethiopia.body",
                "Ethiopia's coffee supply chain runs through cooperatives and washing stations. Most washing stations aggregate cherry from hundreds of smallholders. Many cooperatives have member lists, but few have GPS data. Start by asking for the cooperative's membership roster, then work with the cooperative to match farms to members. Cooperatives in Sidama, Yirgacheffe, and Guji regions are generally more organised due to the specialty coffee market's traceability expectations.",
              )}
            </p>

            <h3>
              {t("resources.supplierDataGuide.country.colombia", "Colombia")}
            </h3>
            <p>
              {t(
                "resources.supplierDataGuide.country.colombia.body",
                "Colombia's FNC (Federación Nacional de Cafeteros) structure means many cooperatives already have structured data. The FNC maintains a coffee registry, and some cooperatives can access farm-level coordinates through existing programmes. Ask your supplier whether they are part of the FNC system and whether they can request geolocation data through that channel. Colombia is classified as low-to-moderate risk, so verification requirements may be lighter.",
              )}
            </p>

            <h3>
              {t("resources.supplierDataGuide.country.honduras", "Honduras")}
            </h3>
            <p>
              {t(
                "resources.supplierDataGuide.country.honduras.body",
                "Honduras has significant land tenure challenges. Many smallholders farm on land without formal titles, which complicates the evidence requirements. Focus on obtaining what documentation exists — community land records, cooperative membership, or utility bills that confirm residency on the land. The GPS data is still the priority. Land title issues can be addressed through risk assessment rather than blocking data collection.",
              )}
            </p>

            <h2>
              {t("resources.supplierDataGuide.section7.title", "What to Do Right Now: 5-Step Action Plan")}
            </h2>
            <ul>
              <li>
                {t(
                  "resources.supplierDataGuide.step1",
                  "List every supplier and origin country. Categorise them as direct suppliers (you buy from them) or indirect (the chain runs through a broker or aggregator). This tells you where the traceability gaps are.",
                )}
              </li>
              <li>
                {t(
                  "resources.supplierDataGuide.step2",
                  "Send data requests to direct suppliers today. Use a simple email or message explaining what you need: GPS coordinates, production period, and producer name. The sooner you start, the more time you have before the enforcement deadline.",
                )}
              </li>
              <li>
                {t(
                  "resources.supplierDataGuide.step3",
                  "Identify brokers in your supply chain and have a commercial conversation. Explain that EUDR requires traceability to the plot level. Ask what they can provide and what they cannot. Decide whether you need to find alternative sources.",
                )}
              </li>
              <li>
                {t(
                  "resources.supplierDataGuide.step4",
                  "Set up a centralised place for evidence. A shared drive is better than nothing, but compliance software is better still. The key is that every shipment's data is in one place, tagged and auditable.",
                )}
              </li>
              <li>
                {t(
                  "resources.supplierDataGuide.step5",
                  "Run a pilot with one supplier and one shipment. Collect the data, perform the risk assessment, generate the due-diligence statement. This gives you a working template you can replicate across your entire supply chain.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.supplierDataGuide.section8.title", "How Antaios Helps")}
            </h2>
            <p>
              {t(
                "resources.supplierDataGuide.section8.body",
                "Antaios is built for exactly this problem. Our supplier portal gives you a link to send to any supplier — cooperatives, washing stations, brokers, individual farmers. They open it on their phone, submit GPS data, upload documents, and the information flows directly into your compliance system. No accounts, no software installation, no training required.",
              )}
            </p>
            <p>
              {t(
                "resources.supplierDataGuide.section8.body2",
                "The platform automatically identifies missing data and chases suppliers on your behalf. When a broker uploads a PDF invoice, our document ingestion extracts the relevant information and flags conflicts. Evidence reconciliation surfaces discrepancies between what a broker claims and what the cooperative records show. You get a complete, auditable trail for every shipment — without building a compliance team from scratch.",
              )}
            </p>

            <h2>
              {t("resources.supplierDataGuide.section9.title", "Key Takeaways")}
            </h2>
            <ul>
              <li>
                {t(
                  "resources.supplierDataGuide.takeaway1",
                  "The supplier data problem is the real bottleneck of EUDR compliance — not TRACES or filing.",
                )}
              </li>
              <li>
                {t(
                  "resources.supplierDataGuide.takeaway2",
                  "GPS collection does not require professional equipment. A smartphone is enough for most smallholder plots.",
                )}
              </li>
              <li>
                {t(
                  "resources.supplierDataGuide.takeaway3",
                  "Brokers are the hardest challenge. Treat it as a commercial conversation, not just a technical one.",
                )}
              </li>
              <li>
                {t(
                  "resources.supplierDataGuide.takeaway4",
                  "Supplier portals eliminate manual chasing. Send a link, collect data on autopilot.",
                )}
              </li>
              <li>
                {t(
                  "resources.supplierDataGuide.takeaway5",
                  "Start with a pilot. Collect data for one shipment, build a template, then scale across your supply chain.",
                )}
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.supplierDataGuide.cta.title",
                "Ready to stop chasing suppliers manually?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.supplierDataGuide.cta.desc",
                "See how Antaios automates supplier data collection. Book a 15-minute demo.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.supplierDataGuide.cta.button", "Take the free diagnostic")}
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
