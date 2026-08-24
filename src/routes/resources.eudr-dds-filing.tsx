import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/eudr-dds-filing")({
  component: EudrDdsFilingPage,
  beforeLoad: () => ({
    title: "How to File a Due Diligence Statement (DDS) in TRACES NT — Antaios Resources",
  }),
});

function EudrDdsFilingPage() {
  const { t } = useTranslation();

  const faqItems = [
    {
      question: "What is a Due Diligence Statement (DDS)?",
      answer: "A DDS is an electronic declaration submitted through TRACES NT confirming that an operator has exercised due diligence and found no or negligible risk of non-compliance with the EUDR. It includes product information, geolocation coordinates, and evidence of risk assessment.",
    },
    {
      question: "How do I register on TRACES NT?",
      answer: "TRACES NT is the EU's trade control and expert system. Register at webgate.ec.europa.eu/tracesnt. You need an EORI number (Economic Operators Registration and Identification) and a valid EU member state address. Registration is free.",
    },
    {
      question: "What information goes in a DDS?",
      answer: "A DDS must include: operator/trader identification, country of production, HS codes and product description, quantity, geolocation coordinates of production plots, description of due diligence undertaken, and risk assessment results. Supporting documents should be attached.",
    },
    {
      question: "How long must I keep EUDR records?",
      answer: "Article 12 requires operators to retain due diligence documentation for five years from the date of the transaction. Records must be readily accessible to competent authorities upon request. Digital storage is acceptable.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="How to File a Due Diligence Statement (DDS) in TRACES NT"
        description="Step-by-step guide to EUDR DDS filing in TRACES NT. What goes in a due diligence statement, registration, submission process, common errors, and how Antaios automates it."
        path="/resources/eudr-dds-filing"
        datePublished="2024-12-10"
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
              {t("resources.dds.category", "Compliance Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.dds.readTime", "10 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.dds.title",
              "How to File a Due Diligence Statement (DDS) in TRACES NT",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
              {t(
                "resources.dds.intro",
                "Under the EU Deforestation Regulation, every operator or trader placing EUDR-regulated commodities on the EU market must submit a Due Diligence Statement (DDS) through the TRACES NT platform. This guide walks you through what a DDS contains, how to register, how to file, and how to avoid the most common rejection reasons.",
              )}
            </p>

            <h2>
              {t("resources.dds.what.title", "1. What Is a Due Diligence Statement?")}
            </h2>
            <p>
              {t(
                "resources.dds.what.body",
                "A Due Diligence Statement is a formal declaration submitted by an operator or trader confirming that they have gathered and verified the information required by the EUDR before placing a regulated commodity on the EU market. It is not a passive checkbox — the DDS is the regulatory instrument that forces you to demonstrate, with verifiable evidence, that your supply chain is deforestation-free and legally compliant.",
              )}
            </p>
            <p>
              {t(
                "resources.dds.what.body2",
                "The DDS covers a specific batch of products linked to a particular operator, supplier, country of production, and set of geolocation coordinates. Each submission creates an auditable record that competent authorities can verify at any time.",
              )}
            </p>

            <h2>
              {t("resources.dds.when.title", "2. When Do You Need to Submit a DDS?")}
            </h2>
            <p>
              {t(
                "resources.dds.when.body",
                "Article 7 of the EUDR requires a DDS every time you place EUDR-relevant commodities or derived products on the EU market for the first time. This applies when you are the first operator to make the product available to end users or further processors in the EU. If you are an indirect operator (e.g., a processor or distributor) who receives products that already have a valid DDS, you do not need to submit a new one — but you must be able to retrieve the original statement.",
              )}
            </p>
            <p>
              {t(
                "resources.dds.when.body2",
                "Key triggering events include:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.dds.when.ev1",
                  "Importing regulated commodities into the EU customs territory",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.when.ev2",
                  "First making a product available on the internal EU market (e.g., selling from a warehouse to a retailer)",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.when.ev3",
                  "Releasing goods from customs supervision into free circulation under an EUDR-relevant tariff heading",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.dds.info.title", "3. What Information Goes in a DDS?")}
            </h2>
            <p>
              {t(
                "resources.dds.info.body",
                "Article 7(2) specifies the information that must accompany each DDS. This is not optional — missing any element will result in rejection by the TRACES NT system. Here is a breakdown of each required field:",
              )}
            </p>

            <h3>
              {t("resources.dds.info.operator.title", "Operator and Trader Identification")}
            </h3>
            <p>
              {t(
                "resources.dds.info.operator.body",
                "You must provide your EORI (Economic Operators Registration and Identification) number and full legal name. If you are acting as a trader on behalf of an operator, both identities must be disclosed. The system uses this to link the DDS to your compliance profile.",
              )}
            </p>

            <h3>
              {t("resources.dds.info.country.title", "Country of Production")}
            </h3>
            <p>
              {t(
                "resources.dds.info.country.body",
                "The country where the commodity was produced — not where it was processed or shipped from. For multi-origin batches, each country must be listed separately with its corresponding product quantities.",
              )}
            </p>

            <h3>
              {t("resources.dds.info.hs.title", "HS Codes and Product Description")}
            </h3>
            <p>
              {t(
                "resources.dds.info.hs.body",
                "Enter the combined nomenclature (CN) code and a clear product description. The HS code determines whether your product falls under EUDR scope. If you deal with derived products (e.g., chocolate containing palm oil), you must list both the final product code and the relevant commodity code.",
              )}
            </p>

            <h3>
              {t("resources.dds.info.quantity.title", "Quantity")}
            </h3>
            <p>
              {t(
                "resources.dds.info.quantity.body",
                "Record the quantity per country of production in the appropriate unit of measure (typically kilograms or tonnes). The TRACES NT system validates that the declared quantity is consistent with the customs data.",
              )}
            </p>

            <h3>
              {t("resources.dds.info.geo.title", "Geolocation Coordinates")}
            </h3>
            <p>
              {t(
                "resources.dds.info.geo.body",
                "For each production plot, provide the GPS coordinates. Plots larger than 4 hectares require polygon coordinates (GeoJSON or KML format). Smaller plots require at least a latitude/longitude point. The coordinates must match the production records you hold.",
              )}
            </p>

            <h3>
              {t("resources.dds.info.evidence.title", "Due Diligence Undertaken")}
            </h3>
            <p>
              {t(
                "resources.dds.info.evidence.body",
                "You must describe the due diligence measures taken under Article 10, including the five criteria: traceability, geolocation, applicable legislation compliance, adequate and verifiable information, and risk assessment. For simplified due diligence (low-risk countries), you need to demonstrate that at least the traceability and geolocation requirements are met.",
              )}
            </p>

            <h2>
              {t("resources.dds.register.title", "4. Step-by-Step: TRACES NT Registration")}
            </h2>
            <p>
              {t(
                "resources.dds.register.body",
                "Before filing a DDS, you need an active TRACES NT account. Here is how to register:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.dds.register.step1",
                  "Go to the EC TRACES NT portal and select \"Register as an economic operator.\"",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.register.step2",
                  "Provide your EORI number, legal entity name, and contact details. The system will cross-reference your EORI against the EU customs database.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.register.step3",
                  "Upload your company registration documents and proof of legal representative appointment.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.register.step4",
                  "Define user roles within your organisation (DDS submitter, reviewer, administrator). Only designated submitters can file statements.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.register.step5",
                  "Wait for validation. Processing typically takes 3-5 business days. Once approved, your account is activated for DDS submission.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.dds.submit.title", "5. Step-by-Step: DDS Submission Process")}
            </h2>
            <p>
              {t(
                "resources.dds.submit.body",
                "Once registered, follow these steps to submit a DDS for each batch:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.dds.submit.step1",
                  "Log in to TRACES NT and navigate to the \"Due Diligence\" section.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.submit.step2",
                  "Select \"New Due Diligence Statement\" and choose the commodity type (wood, palm oil, soy, coffee, cocoa, rubber, or their derivatives).",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.submit.step3",
                  "Enter operator/trader details (your EORI is auto-populated).",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.submit.step4",
                  "Add product information: HS code, description, quantity, and country of production.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.submit.step5",
                  "Upload geolocation data for each production plot. Acceptable formats include GeoJSON, KML, or CSV with latitude/longitude columns.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.submit.step6",
                  "Attach supporting documents: supplier declarations, risk assessments, certification records, and any third-party audit reports.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.submit.step7",
                  "Complete the due diligence attestation — confirm that you have verified the information and that it meets the Article 10 criteria.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.submit.step8",
                  "Review the summary, then submit. The system assigns a unique DDS reference number.",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.dds.errors.title", "6. Common TRACES NT Errors and Fixes")}
            </h2>
            <p>
              {t(
                "resources.dds.errors.body",
                "TRACES NT validates your submission in real time. Here are the most frequent rejection reasons and how to resolve them:",
              )}
            </p>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Error</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Cause & Fix</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Invalid geolocation format</td>
                    <td className="px-4 py-3 text-muted-foreground">Coordinates must be WGS84 decimal degrees. Check that polygon vertices close properly and that the GeoJSON geometry type matches the data.</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">HS code mismatch</td>
                    <td className="px-4 py-3 text-muted-foreground">The CN code you enter must correspond to an EUDR-regulated tariff heading. Verify against the Annex I commodity list.</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Quantity exceeds customs declaration</td>
                    <td className="px-4 py-3 text-muted-foreground">TRACES cross-references your DDS quantity with the import customs data. Ensure the declared amount does not exceed the customs entry.</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">Missing supporting documents</td>
                    <td className="px-4 py-3 text-muted-foreground">Attach all required evidence before submission. The system will block the DDS if mandatory attachments are absent.</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">EORI not validated</td>
                    <td className="px-4 py-3 text-muted-foreground">Your TRACES NT account must be fully activated. If your EORI is pending, contact the national competent authority.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>
              {t("resources.dds.simplified.title", "7. Simplified vs Full Due Diligence")}
            </h2>
            <p>
              {t(
                "resources.dds.simplified.body",
                "The EUDR distinguishes between simplified and full due diligence based on the risk level of the country of production. The European Commission publishes a benchmarking classification: low risk, standard risk, and high risk.",
              )}
            </p>
            <p>
              {strong(t("resources.dds.simplified.full.label", "Full due diligence"))}:{" "}
              {t(
                "resources.dds.simplified.full.body",
                "Required for standard-risk and high-risk countries. You must satisfy all five Article 10(2) criteria — traceability, geolocation, applicable legislation, verifiable information, and risk assessment — and attach comprehensive supporting evidence.",
              )}
            </p>
            <p>
              {strong(t("resources.dds.simplified.simple.label", "Simplified due diligence"))}:{" "}
              {t(
                "resources.dds.simplified.simple.body",
                "Available for low-risk countries. You still need traceability and geolocation data, but the remaining criteria are reduced. You must demonstrate that the country classification is current and that the commodity originates from the declared low-risk territory.",
              )}
            </p>
            <p>
              {t(
                "resources.dds.simplified.note",
                "Note: Even with simplified due diligence, you cannot skip geolocation data. The only difference is the depth of risk analysis and documentation required.",
              )}
            </p>

            <h2>
              {t("resources.dds.records.title", "8. Record Keeping Requirements")}
            </h2>
            <p>
              {t(
                "resources.dds.records.body",
                "Article 12 requires you to retain all information and documents related to a DDS for five years from the date of submission. This includes the submitted statement, supporting evidence, risk assessments, and any communications with competent authorities. You must make these records available to authorities upon request.",
              )}
            </p>
            <p>
              {t(
                "resources.dds.records.body2",
                "Practically, this means you need a document management system that can store, categorise, and retrieve compliance records by DDS reference number, supplier, or product. Spreadsheets and email attachments are not a sustainable approach at scale.",
              )}
            </p>

            <h2>
              {t("resources.dds.automation.title", "9. How Antaios Automates DDS Generation and Submission")}
            </h2>
            <p>
              {t(
                "resources.dds.automation.body",
                "Filing a DDS manually is time-consuming and error-prone. Antaios streamlines the entire workflow:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.dds.automation.feat1",
                  "Automated geolocation validation — coordinates are checked against EUDR format requirements before submission",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.automation.feat2",
                  "HS code mapping — Antaios links your product catalogue to the correct CN codes and flags products that fall under EUDR scope",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.automation.feat3",
                  "Evidence assembly — the platform collects and organises supplier declarations, risk assessments, and certification documents per DDS",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.automation.feat4",
                  "Batch tracking — traceability records are linked to each DDS, so you can retrieve the full chain of custody for any shipment",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.automation.feat5",
                  "Record keeping — all documents are retained in a searchable archive that meets the five-year retention requirement",
                )}
              </li>
            </ul>

            <h2>
              {t("resources.dds.takeaways.title", "10. Key Takeaways")}
            </h2>
            <ul>
              <li>
                {t(
                  "resources.dds.takeaway1",
                  "A DDS is required every time you place EUDR-regulated commodities or derived products on the EU market for the first time.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.takeaway2",
                  "You must register on TRACES NT before filing. Allow 3-5 business days for account validation.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.takeaway3",
                  "Every DDS requires operator identification, HS codes, quantities, geolocation coordinates, and evidence of due diligence under Article 10.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.takeaway4",
                  "Simplified due diligence is only available for low-risk countries — geolocation data is still mandatory.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.takeaway5",
                  "Retain all DDS-related documents for five years and make them available to authorities on request.",
                )}
              </li>
              <li>
                {t(
                  "resources.dds.takeaway6",
                  "Automation reduces filing errors and speeds up compliance — Antaios handles geolocation validation, HS code mapping, and evidence assembly for you.",
                )}
              </li>
            </ul>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.dds.cta.title",
                "Ready to simplify your DDS process?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.dds.cta.desc",
                "Take our free 3-minute diagnostic to see where your EUDR compliance stands. 8 questions, no email required.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.dds.cta.button", "Take the free diagnostic")}
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
