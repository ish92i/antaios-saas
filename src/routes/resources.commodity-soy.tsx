import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/commodity-soy")({
  component: CommoditySoyPage,
  beforeLoad: () => ({
    title: "EUDR Soy Compliance: Requirements for EU Importers — Antaios Resources",
  }),
});

function CommoditySoyPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Soy Compliance: Requirements for EU Importers"
        description="How the EU Deforestation Regulation applies to soy imports. Covers sourcing countries, crushing and processing challenges, indirect procurement risks, and practical compliance steps."
        path="/resources/commodity-soy"
        datePublished="2025-01-15"
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
              {t("resources.soy.category", "Commodity Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.soy.readTime", "10 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.soy.title",
              "EUDR Soy Compliance: Requirements for EU Importers",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.soy.intro",
                "Soy is one of the most widely traded agricultural commodities in the world, and the EU is among its largest importers. Under the EU Deforestation Regulation (EU) 2023/1115, soy — whether imported as whole beans, meal, oil, or embedded in animal feed — triggers full due-diligence obligations. This guide covers the soy-specific requirements, the South American sourcing landscape, and the unique compliance challenges posed by crushing, processing, and indirect procurement.",
              )}
            </p>

            <h2>
              {t("resources.soy.scope.title", "What Counts as Soy Under EUDR")}
            </h2>
            <p>
              {t(
                "resources.soy.scope.body",
                "EUDR covers soy in all its forms: raw soybeans, soybean meal, soybean oil, soy flour, soy lecithin, and any product containing soy as an ingredient. The critical question is whether the soy — or any component of a composite product — was produced on land that was deforested after 31 December 2020. For food and feed manufacturers, this means that even trace amounts of soy in a product ingredient list can trigger compliance obligations. Soy-derived additives such as lecithin (E322) fall within scope, as do soy-based biofuels under the Renewable Energy Directive alignment.",
              )}
            </p>
            <p>
              {t(
                "resources.soy.scope.exemption",
                "Recycled soy products and products manufactured entirely from recycled materials are exempt. However, the exemption is narrow — most soy in the EU supply chain is virgin material and falls squarely within the regulation.",
              )}
            </p>

            <h2>
              {t("resources.soy.countries.title", "Key Sourcing Countries")}
            </h2>
            <p>
              {t(
                "resources.soy.countries.intro",
                "The vast majority of EU soy imports originate in South America, where the Cerrado and Amazon biomes have experienced significant deforestation pressure:",
              )}
            </p>

            <h3>{t("resources.soy.countries.brazil.title", "Brazil")}</h3>
            <p>
              {t(
                "resources.soy.countries.brazil.body",
                "Brazil is the world's largest soy exporter and the EU's primary source. The Cerrado savanna, which accounts for roughly half of Brazil's soy production, has been a major deforestation frontier. Importers must trace soy back to the municipality and, ideally, the specific farm (CAR registration). The Brazilian Soy Moratorium, which prohibits soy from newly deforested Amazon land, provides some assurance but does not cover the Cerrado. EUDR compliance requires going beyond the Moratorium and verifying deforestation-free status for all plots in the supply chain.",
              )}
            </p>

            <h3>{t("resources.soy.countries.argentina.title", "Argentina")}</h3>
            <p>
              {t(
                "resources.soy.countries.argentina.body",
                "Argentina is a major soy producer and the world's leading exporter of soybean oil and meal. Deforestation risk is concentrated in the Gran Chaco region, where native forest has been cleared for agriculture. Argentina's林业 law (Ley de Bosques) provides a zoning framework, but enforcement varies by province. Importers should verify that their Argentine soy was produced in合规 zones and request RENAFOR (National Forestry Registry) documentation where applicable.",
              )}
            </p>

            <h3>{t("resources.soy.countries.paraguay.title", "Paraguay")}</h3>
            <p>
              {t(
                "resources.soy.countries.paraguay.body",
                "Paraguay has experienced rapid expansion of soy cultivation into the Chaco and eastern forest regions. The country has a relatively small land area but high deforestation rates relative to its size. Paraguayan soy supply chains can be less transparent than those in Brazil or Argentina, and traceability data may be harder to obtain. Importers should engage early with Paraguayan suppliers and request specific plot-level geolocation data.",
              )}
            </p>

            <h3>{t("resources.soy.countries.bolivia.title", "Bolivia")}</h3>
            <p>
              {t(
                "resources.soy.countries.bolivia.body",
                "Bolivia is a smaller but growing soy exporter. Deforestation risk is concentrated in the Santa Cruz department, where native Chiquitano dry forest and Beni savanna are being converted. Bolivia's regulatory framework for land use is less developed than its neighbours, and supply chain transparency is limited. Importers sourcing from Bolivia should conduct heightened due diligence and, where possible, obtain satellite-verified deforestation-free evidence.",
              )}
            </p>

            <h2>
              {t("resources.soy.crushing.title", "Crushing and Multiprocessor Challenges")}
            </h2>
            <p>
              {t(
                "resources.soy.crushing.body",
                "One of the most complex compliance challenges for soy is the crushing stage. Soybeans are typically crushed into meal and oil at large industrial facilities that receive beans from hundreds or thousands of farms. Once beans are commingled at the crush plant, individual farm-level traceability is lost unless the facility maintains rigorous segregation protocols. This creates a traceability gap: the crusher can verify the origin of the beans it receives, but the meal or oil it produces is a blend of inputs from many sources.",
              )}
            </p>
            <p>
              {t(
                "resources.soy.crushing.solution",
                "EUDR addresses this through the concept of batch-level traceability. Crushers must be able to identify which farms contributed to each batch of processed output, or implement a mass-balance system that maintains a documented link between input volumes and output products. For EU importers of soy meal or oil, this means requiring your crusher supplier to provide batch-level traceability data — and verifying that their system is robust enough to satisfy an auditor.",
              )}
            </p>

            <h2>
              {t("resources.soy.indirect.title", "Indirect Procurement Issues")}
            </h2>
            <p>
              {t(
                "resources.soy.indirect.body",
                "Many EU companies do not import soy directly. Instead, they purchase soy-based ingredients — lecithin, protein isolates, texturised soy protein — from food ingredient suppliers who in turn source from crushers or further processors. Each intermediary in the chain can obscure the origin of the soy. Under EUDR, every operator in the chain must conduct due diligence, but the depth of information available diminishes with each step. If you are a food manufacturer buying soy lecithin from a distributor, you need to trace that lecithin back through the distributor to the crusher to the farm — and you need documented evidence at each stage.",
              )}
            </p>
            <p>
              {t(
                "resources.soy.indirect.tip",
                "Practical step: Add EUDR due-diligence clauses to your supplier contracts. Require your ingredient suppliers to provide plot-level origin data, batch traceability records, and their own risk assessments. If a supplier cannot or will not provide this information, that is a red flag.",
              )}
            </p>

            <h2>
              {t("resources.soy.pitfalls.title", "Common Pitfalls for Soy Importers")}
            </h2>
            <ul>
              <li>
                <strong>{t("resources.soy.pitfalls.p1.title", "Assuming the Soy Moratorium covers you:")}</strong>{" "}
                {t(
                  "resources.soy.pitfalls.p1.body",
                  "The Moratorium only covers Amazon-origin soy and only addresses deforestation — it does not cover legal compliance or the Cerrado. EUDR compliance requires a broader verification scope.",
                )}
              </li>
              <li>
                <strong>{t("resources.soy.pitfalls.p2.title", "Ignoring soy in compound products:")}</strong>{" "}
                {t(
                  "resources.soy.pitfalls.p2.body",
                  "A product with 2% soy lecithin still triggers EUDR obligations. Food and feed manufacturers often overlook soy when it appears as a minor ingredient, but the regulation applies regardless of proportion.",
                )}
              </li>
              <li>
                <strong>{t("resources.soy.pitfalls.p3.title", "Crush plant commingling:")}</strong>{" "}
                {t(
                  "resources.soy.pitfalls.p3.body",
                  "If your crusher mixes beans from compliant and non-compliant farms in a single batch, the entire batch is non-compliant. Verify that your crusher has segregation or mass-balance systems in place.",
                )}
              </li>
              <li>
                <strong>{t("resources.soy.pitfalls.p4.title", "Late engagement with suppliers:")}</strong>{" "}
                {t(
                  "resources.soy.pitfalls.p4.body",
                  "Geolocation data and plot-level traceability take time to collect. If you wait until the regulation is enforced, your suppliers may not have the data ready. Start engagement now.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.soy.checklist.title", "Soy Compliance Checklist")}
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
                    <td className="px-4 py-3 text-muted-foreground">Identify all soy in your product portfolio, including minor ingredients and additives</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">2</td>
                    <td className="px-4 py-3 text-muted-foreground">Trace soy back to the country and municipality of origin for every supplier</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">3</td>
                    <td className="px-4 py-3 text-muted-foreground">Request plot-level geolocation data and CAR/RENAFOR documentation from South American suppliers</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">4</td>
                    <td className="px-4 py-3 text-muted-foreground">Verify that your crusher or processor maintains batch-level traceability or a compliant mass-balance system</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">5</td>
                    <td className="px-4 py-3 text-muted-foreground">Add EUDR due-diligence clauses to all supplier contracts</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">6</td>
                    <td className="px-4 py-3 text-muted-foreground">Build an auditable evidence repository with source, date, and verification status for each data point</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>
              {t("resources.soy.antaios.title", "How Antaios Fits In")}
            </h2>
            <p>
              {t(
                "resources.soy.antaios.body",
                "Antaios automates soy compliance from farm to port. Our platform maps deforestation alerts against your supplier's geolocation data, flags high-risk municipalities in the Cerrado and Chaco, and tracks legal-landscape changes across Brazil, Argentina, Paraguay, and Bolivia. You can upload your supplier list and receive an instant risk profile. When new deforestation events are detected in your supply zone, we alert you in real time — so you can act before a shipment is flagged at the EU border.",
              )}
            </p>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.soy.cta.title",
                "Not sure where your soy comes from?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.soy.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.soy.cta.button", "Take the free diagnostic")}
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
