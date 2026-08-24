import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/eudr-sme-guide")({
  component: EudrSmeGuidePage,
  beforeLoad: () => ({
    title: "EUDR for Small Businesses — Antaios Resources",
  }),
});

function EudrSmeGuidePage() {
  const { t } = useTranslation();

  const faqItems = [
    {
      question: "Does my small business need to comply with EUDR?",
      answer: "It depends on your company size and when you started operating. Large and medium enterprises must comply from December 30, 2026. Micro and small enterprises (fewer than 50 employees and turnover under €10 million) have until June 30, 2027. Downstream operators have their own obligations from December 2025.",
    },
    {
      question: "What is simplified due diligence for small businesses?",
      answer: "Simplified due diligence applies to operators handling products from low-risk countries (as classified by the EU benchmarking system). It requires less extensive risk assessment but still mandates basic checks including geolocation data and supplier information.",
    },
    {
      question: "What is the EUDR simplified declaration?",
      answer: "The simplified declaration is a streamlined due diligence statement available to small and micro operators. It contains fewer required fields than a full DDS but must still include essential product and supplier information submitted through TRACES NT.",
    },
    {
      question: "When is the EUDR deadline for small businesses?",
      answer: "Micro and small enterprises (non-timber) must comply by June 30, 2027. This is six months after the large/medium enterprise deadline of December 30, 2026. Products newly added to Annex I have until December 30, 2027.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR for Small Businesses: What Importers Need to Know"
        description="Small and micro enterprises get extra time and simpler rules under the EU Deforestation Regulation. Learn which SME category you fall into, what simplified due diligence covers, and how to prepare before the 2027 deadline."
        path="/resources/eudr-sme-guide"
        datePublished="2025-01-15"
        category="Compliance Guide"
        faqItems={faqItems}
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
              {t("resources.sme.category", "Compliance Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.sme.readTime", "8 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.sme.title",
              "EUDR for Small Businesses: What Importers Need to Know",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.sme.intro",
                "The EU Deforestation Regulation (EUDR) does not treat every operator the same. If you run a small or micro business that imports covered commodities into the EU, you benefit from extended deadlines and simplified due-diligence obligations. This guide explains exactly which businesses qualify, what the lighter requirements look like, and what you should be doing right now.",
              )}
            </p>

            <h2>
              {t("resources.sme.qualify.title", "1. Which Businesses Qualify as SME or Micro?")}
            </h2>
            <p>
              {t(
                "resources.sme.qualify.body",
                "The regulation does not define its own SME thresholds. Instead, it refers to the categories established by Commission Recommendation 2003/361/EC. In practice, a micro enterprise has fewer than 10 employees and annual turnover or balance sheet total below EUR 2 million. A small enterprise has fewer than 50 employees and annual turnover or balance sheet total below EUR 10 million.",
              )}
            </p>
            <p>
              {t(
                "resources.sme.qualify.detail",
                "What matters for EUDR is not just your headcount but your role in the supply chain. You must be an importer or a downstream operator placing a covered commodity or derived product on the EU market for the first time. If your annual import volumes are below certain thresholds you may still qualify for simplified obligations, but you must still register and submit a due-diligence statement.",
              )}
            </p>

            <h2>
              {t("resources.sme.deadline.title", "2. The Extended Deadline: June 30, 2027")}
            </h2>
            <p>
              {t(
                "resources.sme.deadline.body",
                "Large operators and traders were required to comply with the EUDR by December 30, 2024 for large companies and June 30, 2025 for certain transitional provisions. Micro and small enterprises received an extended deadline of June 30, 2027. This gives smaller businesses an additional 12 to 18 months beyond the standard compliance date.",
              )}
            </p>
            <p>
              {t(
                "resources.sme.deadline.warning",
                "However, this extra time is not a reason to delay preparation. Your suppliers in producing countries must already be collecting geolocation data and maintaining traceability records. If you wait until 2027 to engage your supply chain, you will find it much harder to get the information you need.",
              )}
            </p>

            <h2>
              {t("resources.sme.simplified.title", "3. Simplified Due Diligence Obligations")}
            </h2>
            <p>
              {t(
                "resources.sme.simplified.body",
                "Article 10(4) of the regulation provides that micro and small enterprises may fulfil their due-diligence obligations through a simplified procedure. Instead of conducting a full risk assessment for every shipment, small operators can rely on a simplified declaration that confirms the key information has been collected and verified.",
              )}
            </p>
            <p>
              {t(
                "resources.sme.simplified.detail",
                "The simplified procedure still requires you to collect geolocation data, verify legal compliance, and maintain traceability records. What changes is the depth of the risk-assessment process and the format of the declaration you submit to the competent authority.",
              )}
            </p>

            <h2>
              {t("resources.sme.declaration.title", '4. What "Simplified Declaration" Means')}
            </h2>
            <p>
              {t(
                "resources.sme.declaration.body",
                "A simplified declaration is a streamlined version of the standard due-diligence statement. Under the standard procedure, operators must submit detailed information covering all five criteria of Article 10(2): traceability, geolocation, applicable legislation, verifiable information, and risk assessment. For small businesses, the declaration focuses on the core elements — traceability, geolocation, and a summary risk determination.",
              )}
            </p>
            <p>
              {t(
                "resources.sme.declaration.format",
                "The declaration must still be submitted through the EU information system before goods are placed on the market. It must include a unique reference number per shipment, the operator identification details, and confirmation that the simplified procedure has been followed. Competent authorities can still audit your records, so the declaration is not a shortcut around compliance — it is a lighter reporting format.",
              )}
            </p>

            <h2>
              {t("resources.sme.downstream.title", "5. Downstream Operator Obligations (December 2025 Revision)")}
            </h2>
            <p>
              {t(
                "resources.sme.downstream.body",
                "The December 2025 revision of the EUDR implementing regulation clarified obligations for downstream operators — companies that buy from an already-compliant importer rather than importing directly. If you purchase a product that has already been subject to a due-diligence statement, your obligations as a downstream operator are lighter. You must verify that the supplier has fulfilled their obligations and maintain records of that verification.",
              )}
            </p>
            <p>
              {t(
                "resources.sme.downstream.detail",
                "For small businesses this is significant. Many SMEs do not import raw commodities directly but buy processed or semi-processed goods from EU-based wholesalers. In those cases, the downstream operator pathway means you may not need to collect geolocation data yourself — you need to confirm that your supplier has done so and retain documentation proving it.",
              )}
            </p>

            <h2>
              {t("resources.sme.differences.title", "6. Key Differences from Full Compliance")}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Area</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Full Compliance</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Simplified (SME)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Deadline</td>
                    <td className="px-4 py-3 text-muted-foreground">June 30, 2025</td>
                    <td className="px-4 py-3 text-muted-foreground">June 30, 2027</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Risk Assessment</td>
                    <td className="px-4 py-3 text-muted-foreground">Full per-shipment risk assessment</td>
                    <td className="px-4 py-3 text-muted-foreground">Summary risk determination</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Declaration</td>
                    <td className="px-4 py-3 text-muted-foreground">Standard DDS with all Article 10(2) criteria</td>
                    <td className="px-4 py-3 text-muted-foreground">Simplified declaration with core elements</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Audit Frequency</td>
                    <td className="px-4 py-3 text-muted-foreground">Risk-based, potentially annual</td>
                    <td className="px-4 py-3 text-muted-foreground">Generally lower frequency for low-risk operators</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>
              {t("resources.sme.myths.title", "7. Common Misconceptions SMEs Have About EUDR")}
            </h2>
            <ul>
              <li>
                <strong>{t("resources.sme.myth1.title", '"It does not apply to me because I am small."')}</strong>{" "}
                {t(
                  "resources.sme.myth1.body",
                  "False. If you import or place covered commodities on the EU market, you are an operator under the regulation regardless of size. The simplified procedure is a benefit, not an exemption.",
                )}
              </li>
              <li>
                <strong>{t("resources.sme.myth2.title", '"I only buy from EU-based suppliers, so I am not responsible."')}</strong>{" "}
                {t(
                  "resources.sme.myth2.body",
                  "If the original commodity was imported into the EU and you are the first to place it on the market, you may still have obligations as a downstream operator. Verify with your supplier.",
                )}
              </li>
              <li>
                <strong>{t("resources.sme.myth3.title", '"The deadline is 2027, so I have plenty of time."')}</strong>{" "}
                {t(
                  "resources.sme.myth3.body",
                  "Your upstream suppliers in producing countries are already required to collect and provide geolocation and traceability data. If you wait, getting this information becomes significantly harder and more expensive.",
                )}
              </li>
              <li>
                <strong>{t("resources.sme.myth4.title", '"Simplified means I do not need geolocation data."')}</strong>{" "}
                {t(
                  "resources.sme.myth4.body",
                  "Not true. Geolocation data is a core requirement regardless of operator size. What simplifies is the risk-assessment depth and the declaration format, not the underlying data you must collect.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.sme.steps.title", "8. Step-by-Step: What to Do Right Now")}
            </h2>
            <p>
              <strong>{t("resources.sme.step1.title", "Step 1: Determine your operator status.")}</strong>{" "}
              {t(
                "resources.sme.step1.body",
                "Are you importing directly, or are you a downstream operator? Check whether your products fall under the seven covered commodities (cattle, cocoa, coffee, oil palm, rubber, soya, wood) and their derivatives.",
              )}
            </p>
            <p>
              <strong>{t("resources.sme.step2.title", "Step 2: Map your supply chain.")}</strong>{" "}
              {t(
                "resources.sme.step2.body",
                "Identify every supplier, from the plot of origin to your warehouse. Document the chain of custody for each product line. Note where you currently lack information.",
              )}
            </p>
            <p>
              <strong>{t("resources.sme.step3.title", "Step 3: Request geolocation data.")}</strong>{" "}
              {t(
                "resources.sme.step3.body",
                "Contact your suppliers now and request GPS coordinates (point or polygon) for every production plot. Set a deadline for delivery and build this requirement into your purchase agreements.",
              )}
            </p>
            <p>
              <strong>{t("resources.sme.step4.title", "Step 4: Conduct a baseline risk assessment.")}</strong>{" "}
              {t(
                "resources.sme.step4.body",
                "Even under the simplified procedure, you need a documented risk assessment. Start with a country-level assessment using the EU benchmarking system and refine it with supplier-specific information.",
              )}
            </p>
            <p>
              <strong>{t("resources.sme.step5.title", "Step 5: Build your compliance system.")}</strong>{" "}
              {t(
                "resources.sme.step5.body",
                "Set up a centralised repository for traceability records, geolocation data, supplier attestations, and risk assessments. This does not need to be expensive — a well-structured spreadsheet is better than nothing, but a dedicated platform scales better as your import volumes grow.",
              )}
            </p>
            <p>
              <strong>{t("resources.sme.step6.title", "Step 6: Test your process.")}</strong>{" "}
              {t(
                "resources.sme.step6.body",
                "Run a mock due-diligence exercise on one shipment. Can you produce the required information for a specific batch within 24 hours? If not, identify the gaps and fix them.",
              )}
            </p>

            <h2>
              {t("resources.sme.antaios.title", "9. How Antaios Helps Small Businesses")}
            </h2>
            <p>
              {t(
                "resources.sme.antaios.body",
                "Antaios was built for operators who need compliance without complexity. Our platform automates the collection of geolocation data from suppliers, maintains a centralised evidence repository, and generates the declarations required by the EU information system. For small businesses, this means you can meet the simplified due-diligence requirements without hiring a dedicated compliance team or building manual processes from scratch.",
              )}
            </p>
            <p>
              {t(
                "resources.sme.antaios.detail",
                "We also provide country-level risk assessments, supplier scorecards, and real-time deforestation alerts so you can make informed sourcing decisions. Our free diagnostic tool gives you a compliance score in three minutes, showing exactly where your gaps are and what to prioritise.",
              )}
            </p>

            <h2>
              {t("resources.sme.takeaways.title", "10. Key Takeaways")}
            </h2>
            <ul>
              <li>
                {t(
                  "resources.sme.takeaway1",
                  "Micro and small enterprises benefit from extended deadlines (June 30, 2027) and simplified due-diligence obligations under the EUDR.",
                )}
              </li>
              <li>
                {t(
                  "resources.sme.takeaway2",
                  "Simplified does not mean exempt. You still need geolocation data, traceability records, and a documented risk assessment.",
                )}
              </li>
              <li>
                {t(
                  "resources.sme.takeaway3",
                  "Start preparing now. Your suppliers in producing countries need time to collect and provide the required information.",
                )}
              </li>
              <li>
                {t(
                  "resources.sme.takeaway4",
                  "If you buy from EU-based suppliers, check whether you are a downstream operator with lighter obligations.",
                )}
              </li>
              <li>
                {t(
                  "resources.sme.takeaway5",
                  "Use the free diagnostic to assess your current compliance status and build a step-by-step action plan.",
                )}
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.sme.cta.title",
                "Not sure where you stand?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.sme.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.sme.cta.button", "Take the free diagnostic")}
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
