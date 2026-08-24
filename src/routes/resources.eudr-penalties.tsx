import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/eudr-penalties")({
  component: EudrPenaltiesPage,
  beforeLoad: () => ({
    title: "EUDR Penalties: Fines and Enforcement Across the EU — Antaios Resources",
  }),
});

function EudrPenaltiesPage() {
  const { t } = useTranslation();

  const faqItems = [
    {
      question: "What are the penalties for EUDR non-compliance?",
      answer: "Penalties are determined by each EU member state but must be effective, proportionate, and dissuasive. They include fines proportionate to environmental damage and value of goods, confiscation of products, exclusion from public procurement, and temporary prohibition from placing products on the EU market. Article 24 requires penalties to account for severity, intentional nature, and company size.",
    },
    {
      question: "How are EUDR fines calculated?",
      answer: "Fines are calculated based on the environmental damage, the value of the products concerned, the company's turnover, and any aggravating or mitigating factors. Member states must ensure fines are high enough to deter non-compliance. Repeat offenders face increased penalties.",
    },
    {
      question: "Who enforces EUDR penalties?",
      answer: "Each EU member state designates competent authorities to enforce the EUDR. These authorities conduct investigations, inspections, and impose penalties. The European Commission oversees member state implementation and can take action against states that fail to enforce the regulation adequately.",
    },
    {
      question: "Can small businesses be penalized under EUDR?",
      answer: "Yes, but penalties must be proportionate to company size. Small and micro enterprises face the same obligations but with an extended deadline (June 30, 2027). Simplified due diligence may apply to low-risk supply chains, but non-compliance still carries penalties.",
    },
    {
      question: "What happens if I import non-compliant products?",
      answer: "Non-compliant products can be seized, confiscated, or required to be returned to the country of origin at the operator's expense. You may face fines, be excluded from public procurement, and be temporarily banned from placing products on the EU market. Criminal penalties may apply in severe cases.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Penalties: Fines and Enforcement Across the EU"
        description="A comprehensive guide to EUDR penalties, fines, and enforcement. Learn about Article 24 penalty framework, fine calculation methodology, member state differences, and how to avoid non-compliance consequences."
        path="/resources/eudr-penalties"
        datePublished="2024-12-01"
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
              {t("resources.penalties.category", "Compliance Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.penalties.readTime", "7 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.penalties.title",
              "EUDR Penalties: Fines and Enforcement Across the EU",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.penalties.intro",
                "The EU Deforestation Regulation (EU) 2023/1115 does not just set compliance standards — it enforces them with significant penalties. Article 24 requires member states to impose penalties that are \"effective, proportionate, and dissuasive.\" Understanding the penalty framework is essential for any operator or trader placing covered commodities on the EU market. Non-compliance is not a theoretical risk — it carries real financial and operational consequences.",
              )}
            </p>

            <h2>
              {t("resources.penalties.framework.title", "1. The Penalty Framework: Article 24")}
            </h2>
            <p>
              {t(
                "resources.penalties.framework.body",
                "Article 24 of EUDR establishes the legal basis for penalties but deliberately leaves the specifics to individual member states. The regulation mandates that penalties must be effective, proportionate, and dissuasive — meaning they should be severe enough to discourage violations, scaled to the gravity of the offence, and designed to prevent future non-compliance. Member states must adopt these penalty frameworks by the time the regulation becomes applicable: December 30, 2026 for large and medium enterprises, and June 30, 2027 for small and micro enterprises.",
              )}
            </p>
            <p>
              {t(
                "resources.penalties.framework.body2",
                "The regulation also requires that penalties apply to any operator or trader who places a product on the EU market without a valid due-diligence statement, or whose statement does not meet the requirements of Article 10(2). This includes situations where due-diligence evidence is incomplete, inaccurate, or not properly retained for the mandatory five-year period.",
              )}
            </p>

            <h2>
              {t("resources.penalties.calculation.title", "2. Fine Calculation Methodology")}
            </h2>
            <p>
              {t(
                "resources.penalties.calculation.body",
                "While member states set their own penalty levels, EUDR Article 24(3) provides clear guidelines for how fines should be calculated. Fines must be proportionate and take into account:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.penalties.calculation.env",
                  "The gravity and duration of the infringement, including the degree of environmental damage caused or risked",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.calculation.turnover",
                  "The turnover of the undertaking concerned — larger companies face proportionally larger fines",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.calculation.benefit",
                  "Any financial benefit gained or potentially gained from the infringement",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.calculation.mitigation",
                  "Mitigating factors such as voluntary disclosure, cooperation with authorities, and prompt remedial measures",
                )}
              </li>
            </ul>
            <p>
              {t(
                "resources.penalties.calculation.body2",
                "This means that fines are not flat-rate. A large timber importer with €50 million in annual revenue who knowingly places non-compliant products on the market will face a fundamentally different penalty than a small coffee trader who fails to complete one due-diligence statement. The regulation intends for penalties to hurt enough to change behaviour.",
              )}
            </p>

            <h2>
              {t("resources.penalties.memberStates.title", "3. Member State Implementation Differences")}
            </h2>
            <p>
              {t(
                "resources.penalties.memberStates.body",
                "Each EU member state is responsible for transposing Article 24 into national law. This means the specific penalty amounts, enforcement procedures, and competent authorities will vary across the bloc. Some member states may adopt stricter penalty regimes than others, particularly those with large import volumes or strong environmental enforcement traditions. As of late 2024, most member states have not yet published their final penalty frameworks, but the direction is clear: penalties will be meaningful.",
              )}
            </p>
            <p>
              {t(
                "resources.penalties.memberStates.body2",
                "For operators trading across multiple member states, this creates a patchwork of potential liabilities. A product that enters through one member state but is sold in another may be subject to enforcement action in either jurisdiction. Operators should not assume that a lenient enforcement approach in one country will protect them elsewhere.",
              )}
            </p>

            <h2>
              {t("resources.penalties.types.title", "4. Types of Penalties")}
            </h2>
            <p>
              {t(
                "resources.penalties.types.body",
                "EUDR penalties go beyond financial fines. Article 24 specifies several categories of consequences that member states must provide for:",
              )}
            </p>

            <h3>{t("resources.penalties.types.fines.title", "Administrative Fines")}</h3>
            <p>
              {t(
                "resources.penalties.types.fines.body",
                "The most direct penalty. Fines are calculated based on the value of the products involved or a percentage of the operator's annual turnover in the relevant member state. Under Article 24(3), fines must be at least twice the value of the products gained through the infringement, where that value can be determined.",
              )}
            </p>

            <h3>{t("resources.penalties.types.confiscation.title", "Product Confiscation and Destruction")}</h3>
            <p>
              {t(
                "resources.penalties.types.confiscation.body",
                "Competent authorities can seize non-compliant products. If the products cannot be remedied or re-exported, they may be destroyed at the operator's expense. This is particularly significant for perishable commodities like cocoa, coffee, and rubber, where destruction represents a total financial loss.",
              )}
            </p>

            <h3>{t("resources.penalties.types.exclusion.title", "Market Exclusion")}</h3>
            <p>
              {t(
                "resources.penalties.types.exclusion.body",
                "For serious or repeated violations, member states may temporarily or permanently exclude operators from placing relevant products on the EU market. This is the most severe administrative penalty and can effectively end an importer's business in covered commodities.",
              )}
            </p>

            <h3>{t("resources.penalties.types.criminal.title", "Criminal Penalties")}</h3>
            <p>
              {t(
                "resources.penalties.types.criminal.body",
                "Article 24(7) specifically requires member states to provide for criminal penalties for \"serious infringements.\" While the regulation does not define exactly what constitutes a serious infringement, intentional non-compliance — such as knowingly submitting false due-diligence statements or deliberately evading traceability requirements — is likely to trigger criminal proceedings in many member states.",
              )}
            </p>

            <h2>
              {t("resources.penalties.who.title", "5. Who Gets Penalized?")}
            </h2>
            <p>
              {t(
                "resources.penalties.who.body",
                "EUDR applies penalties to both operators and traders, though their obligations differ:",
              )}
            </p>
            <ul>
              <li>
                <strong>{t("resources.penalties.who.operators.label", "Operators:")}</strong>{" "}
                {t(
                  "resources.penalties.who.operators.body",
                  "Those who first place a relevant product on the EU market carry the primary due-diligence obligations. They bear the heaviest penalty exposure, as they are responsible for the complete due-diligence statement, traceability, and risk assessment.",
                )}
              </li>
              <li>
                <strong>{t("resources.penalties.who.traders.label", "Traders:")}</strong>{" "}
                {t(
                  "resources.penalties.who.traders.body",
                  "Those who subsequently make products available on the EU market have lighter obligations — they must retain and provide information but are not required to produce a full due-diligence statement. However, traders still face penalties for failing to meet their obligations, and penalties increase significantly for non-small/micro enterprise traders.",
                )}
              </li>
              <li>
                <strong>{t("resources.penalties.who.downstream.label", "Downstream operators:")}</strong>{" "}
                {t(
                  "resources.penalties.who.downstream.body",
                  "Companies that use covered commodities as inputs in manufacturing (e.g., chocolate producers using cocoa, furniture makers using wood) are also in scope. If they place a derived product on the EU market, they must ensure due-diligence obligations are met for the relevant commodities.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.penalties.size.title", "6. How Penalties Differ by Company Size")}
            </h2>
            <p>
              {t(
                "resources.penalties.size.body",
                "EUDR distinguishes between company sizes for both deadlines and, indirectly, for penalties. Small and micro enterprises — defined as those with fewer than 250 employees and annual turnover not exceeding €50 million — have until June 30, 2027 to comply, compared to December 30, 2026 for larger enterprises.",
              )}
            </p>
            <p>
              {t(
                "resources.penalties.size.body2",
                "However, once both cohorts are within the compliance period, the penalty framework applies equally. The fine calculation methodology means that turnover-based fines will naturally be lower for smaller companies, but the proportionate principle still applies. A small trader whose non-compliance causes significant environmental damage could still face penalties that threaten its viability.",
              )}
            </p>

            <h2>
              {t("resources.penalties.timeline.title", "7. Enforcement Timeline and Competent Authorities")}
            </h2>
            <p>
              {t(
                "resources.penalties.timeline.body",
                "Each member state must designate one or more competent authorities responsible for monitoring and enforcing EUDR. These authorities will conduct audits, investigate complaints, and impose penalties. The regulation requires member states to ensure that competent authorities have sufficient resources and powers to carry out their functions effectively.",
              )}
            </p>
            <p>
              {t(
                "resources.penalties.timeline.body2",
                "Enforcement will begin as soon as the regulation becomes applicable. There will be no grace period for non-compliance. Authorities are expected to start with advisory and corrective actions but will have full enforcement powers from day one. Early enforcement actions will set precedents that shape the entire compliance landscape.",
              )}
            </p>

            <h2>
              {t("resources.penalties.avoid.title", "8. How to Avoid Penalties")}
            </h2>
            <p>
              {t(
                "resources.penalties.avoid.body",
                "The best defence against EUDR penalties is a robust compliance system. Here are the key steps:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.penalties.avoid.s1",
                  "Complete a thorough due-diligence assessment covering all five Article 10(2) criteria — traceability, geolocation, applicable legislation, verifiable information, and risk assessment",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.avoid.s2",
                  "Maintain complete, accurate, and retrievable records for the mandatory five-year retention period",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.avoid.s3",
                  "Establish supplier agreements that include traceability and compliance clauses",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.avoid.s4",
                  "Implement a system for tracking geolocation data at plot level, including polygon coordinates for plots above 4 hectares",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.avoid.s5",
                  "Conduct periodic internal audits to verify your due-diligence process is working as intended",
                )}
              </li>
            </ul>
            <p>
              {t(
                "resources.penalties.avoid.body2",
                "If you are unsure where your compliance gaps are, a diagnostic assessment can help you identify weaknesses before an auditor does.",
              )}
            </p>

            <h2>
              {t("resources.penalties.takeaways.title", "9. Key Takeaways")}
            </h2>
            <ul>
              <li>
                {t(
                  "resources.penalties.takeaways.t1",
                  "EUDR penalties must be effective, proportionate, and dissuasive — member states are required to take enforcement seriously",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.takeaways.t2",
                  "Fines are calculated based on turnover, environmental damage, and the value of non-compliant products — they are not flat-rate",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.takeaways.t3",
                  "Penalties include fines, product confiscation, market exclusion, and criminal charges for serious violations",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.takeaways.t4",
                  "Both operators and traders are subject to penalties, with operators facing the heaviest consequences",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.takeaways.t5",
                  "Enforcement begins from day one — there is no grace period for non-compliance",
                )}
              </li>
              <li>
                {t(
                  "resources.penalties.takeaways.t6",
                  "The best protection is a complete, documented due-diligence system covering all five Article 10(2) criteria",
                )}
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.penalties.cta.title",
                "Not sure where you stand?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.penalties.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.penalties.cta.button", "Take the free diagnostic")}
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
