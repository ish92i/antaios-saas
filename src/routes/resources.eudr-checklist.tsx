import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/eudr-checklist")({
  component: EudrChecklistPage,
  beforeLoad: () => ({
    title: "EUDR Compliance Checklist — Antaios Resources",
  }),
});



function EudrChecklistPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Compliance Checklist: Your 5-Step Guide to Article 10(2)"
        description="Walk through the 5 due-diligence criteria of Article 10(2), EU Deforestation Regulation. What each criterion requires, evidence needed, common pitfalls — plus a free compliance diagnostic."
        path="/resources/eudr-checklist"
        datePublished="2024-11-15"
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
              {t("resources.checklist.category", "Compliance Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.checklist.readTime", "5 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.checklist.title",
              "EUDR Compliance Checklist: Your 5-Step Guide to Article 10(2)",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
                {t(
                  "resources.checklist.intro",
                  "Article 10(2) of the EU Deforestation Regulation (EU) 2023/1115 defines five criteria that your due-diligence statement must address. Regulators will check each one. Here is a practical walk-through of what each criterion requires and how to prepare.",
                )}
              </p>

              <div className="overflow-x-auto rounded-lg border border-border">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border bg-muted/50">
        <th className="px-4 py-3 text-left font-medium text-foreground">Criterion</th>
        <th className="px-4 py-3 text-left font-medium text-foreground">What You Need</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-border">
        <td className="px-4 py-3 font-medium text-foreground">Traceability</td>
        <td className="px-4 py-3 text-muted-foreground">Supplier contracts, batch tracking records, chain-of-custody certifications</td>
      </tr>
      <tr className="border-b border-border">
        <td className="px-4 py-3 font-medium text-foreground">Geolocation</td>
        <td className="px-4 py-3 text-muted-foreground">GPS coordinates (point or polygon) per plot, collection proof, storage system</td>
      </tr>
      <tr className="border-b border-border">
        <td className="px-4 py-3 font-medium text-foreground">Applicable Legislation</td>
        <td className="px-4 py-3 text-muted-foreground">Country risk assessments, supplier attestations, third-party audit reports</td>
      </tr>
      <tr className="border-b border-border">
        <td className="px-4 py-3 font-medium text-foreground">Verifiable Information</td>
        <td className="px-4 py-3 text-muted-foreground">Centralised evidence repository with source, date, and verification status</td>
      </tr>
      <tr className="border-b border-border">
        <td className="px-4 py-3 font-medium text-foreground">Risk Assessment</td>
        <td className="px-4 py-3 text-muted-foreground">Documented methodology, mitigation records, rationale for low-risk determinations</td>
      </tr>
    </tbody>
  </table>
</div>

              <h2>
              {t("resources.checklist.step1.title", "1. Traceability (Article 10(2)(a))")}
            </h2>
            <p>
              {t(
                "resources.checklist.step1.body",
                "You must be able to demonstrate that every product in your shipment can be traced back to its plot of origin. This means maintaining a documented chain of custody from the farm or forest to your warehouse. For each batch, record the supplier, the intermediary, the country and region of production, and the plot identifiers.",
              )}
            </p>
            <p>
              <strong>{t("resources.checklist.step1.evidence", "What you need:")}</strong>
            </p>
            <ul>
              <li>
                {t(
                  "resources.checklist.step1.ev1",
                  "Supplier contracts and purchase orders linking products to specific plots",
                )}
              </li>
              <li>
                {t(
                  "resources.checklist.step1.ev2",
                  "Internal batch tracking records (ERP extracts, spreadsheets, or your compliance platform)",
                )}
              </li>
              <li>
                {t(
                  "resources.checklist.step1.ev3",
                  "Chain-of-custody certifications where applicable (e.g., FSC for wood, RSPO for palm oil)",
                )}
              </li>
            </ul>
            <p>
              <strong>{t("resources.checklist.step1.pitfall", "Common pitfall:")}</strong>{" "}
              {t(
                "resources.checklist.step1.pitfallBody",
                "Relying on a single supplier declaration without cross-referencing against actual shipment records. If an auditor asks to see the chain for a specific container, you need batch-level detail, not just a blanket statement.",
              )}
            </p>

            <h2>
              {t("resources.checklist.step2.title", "2. Geolocation (Article 10(2)(b) + 9(1)(d))")}
            </h2>
            <p>
              {t(
                "resources.checklist.step2.body",
                "For every plot of land where a commodity was produced, you must record the geolocation coordinates. Article 9(1)(d) specifies that for plots larger than 4 hectares, you need polygon coordinates (not just a single point). For smaller plots, a latitude/longitude point is sufficient. These coordinates must be submitted alongside your due-diligence statement.",
              )}
            </p>
            <p>
              <strong>{t("resources.checklist.step2.evidence", "What you need:")}</strong>
            </p>
            <ul>
              <li>
                {t(
                  "resources.checklist.step2.ev1",
                  "GPS coordinates (point or polygon) for each production plot",
                )}
              </li>
              <li>
                {t(
                  "resources.checklist.step2.ev2",
                  "A system that stores and retrieves geolocation data per shipment",
                )}
              </li>
              <li>
                {t(
                  "resources.checklist.step2.ev3",
                  "Proof that coordinates were collected at the time of harvest or production",
                )}
              </li>
            </ul>
            <p>
              <strong>{t("resources.checklist.step2.tip", "Practical tip:")}</strong>{" "}
              {t(
                "resources.checklist.step2.tipBody",
                "If you work with smallholder farmers, provide them with simple mobile tools or field officer support to collect coordinates. A missing or incorrect polygon is one of the most common reasons for DDS rejection.",
              )}
            </p>

            <h2>
              {t("resources.checklist.step3.title", "3. Applicable Legislation Compliance (Article 10(2)(c))")}
            </h2>
            <p>
              {t(
                "resources.checklist.step3.body",
                "You must verify that the product was produced in compliance with the applicable legislation of the country of production. This covers land-use rights, environmental regulations, labour laws, tax laws, and anti-corruption rules. The burden is on you, the importer, to obtain evidence, not on the regulator to prove non-compliance.",
              )}
            </p>
            <p>
              <strong>{t("resources.checklist.step3.evidence", "What you need:")}</strong>
            </p>
            <ul>
              <li>
                {t(
                  "resources.checklist.step3.ev1",
                  "Risk assessments by country of origin (using EU Commission benchmarking or your own analysis)",
                )}
              </li>
              <li>
                {t(
                  "resources.checklist.step3.ev2",
                  "Supplier attestations covering the relevant legal areas",
                )}
              </li>
              <li>
                {t(
                  "resources.checklist.step3.ev3",
                  "Third-party audit reports where available",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.checklist.step4.title", "4. Adequate and Verifiable Information (Article 10(2)(d))")}
            </h2>
            <p>
              {t(
                "resources.checklist.step4.body",
                "The information you collect must be adequate, meaning it covers all relevant criteria, and verifiable, meaning a third party could confirm it. Vague statements are not enough. You need specific data with clear provenance — who provided it, when, and how it was verified.",
              )}
            </p>
            <p>
              <strong>{t("resources.checklist.step4.tip", "Strategy:")}</strong>{" "}
              {t(
                "resources.checklist.step4.tipBody",
                "Maintain a centralised repository where each piece of evidence is tagged with its source, collection date, and verification status. This makes audit preparation a matter of exporting a report rather than scrambling through inboxes.",
              )}
            </p>

            <h2>
              {t("resources.checklist.step5.title", "5. Risk Assessment and Mitigation (Article 10(2)(e))")}
            </h2>
            <p>
              {t(
                "resources.checklist.step5.body",
                "The regulation requires you to assess the risk of non-compliance for each shipment and, where risk is identified, to apply mitigation measures. Your risk assessment should consider the country of origin, the complexity of the supply chain, and any red flags (such as recent deforestation alerts or sanctions). Mitigation measures can include additional documentation requests, third-party audits, or choosing alternative suppliers.",
              )}
            </p>
            <p>
              <strong>
                {t("resources.checklist.step5.evidence", "What you need:")}
              </strong>
            </p>
            <ul>
              <li>
                {t(
                  "resources.checklist.step5.ev1",
                  "A documented risk assessment methodology",
                )}
              </li>
              <li>
                {t(
                  "resources.checklist.step5.ev2",
                  "Records of mitigation actions taken and their outcomes",
                )}
              </li>
              <li>
                {t(
                  "resources.checklist.step5.ev3",
                  "A clear rationale for low-risk determinations",
                )}
              </li>
            </ul>

            <h3>
              {t("resources.checklist.final.title", "Putting It All Together")}
            </h3>
            <p>
              {t(
                "resources.checklist.final.body",
                "Compliance is not about a single document — it is about a system. Build workflows for each of the five criteria, assign responsibilities, and test your process with a mock audit. Operator status under EUDR means you are accountable for the entire chain, from the plot to the port.",
              )}
            </p>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-xl font-bold text-foreground">Related Resources</h2>
            <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
              <li>
                <Link to="/resources/eudr-dds-filing" className="text-primary hover:underline">
                  How to File a DDS in TRACES NT
                </Link>
                {" — "}Step-by-step guide to submitting your due diligence statement.
              </li>
              <li>
                <Link to="/resources/eudr-geolocation" className="text-primary hover:underline">
                  EUDR Geolocation Requirements
                </Link>
                {" — "}GPS and polygon data requirements explained.
              </li>
              <li>
                <Link to="/resources/eudr-penalties" className="text-primary hover:underline">
                  EUDR Penalties
                </Link>
                {" — "}What happens if you don't comply.
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.checklist.cta.title",
                "Not sure where you stand?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.checklist.cta.desc",
                "Take our free 3-minute diagnostic. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.checklist.cta.button", "Take the free diagnostic")}
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
