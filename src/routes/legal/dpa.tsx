import { createFileRoute, Link } from "@tanstack/react-router"
import { Helmet } from "react-helmet-async"
import siteConfig from "~/site.config"
import { Logo } from "@/components/logo"

const pageTitle = "Data Processing Addendum (DPA) — Antaios"
const pageDescription =
  "Antaios Data Processing Addendum (DPA) governing the processing of personal data under GDPR. Sub-processors, security measures, data subject rights."
const pageUrl = `${siteConfig.siteUrl}/legal/dpa`

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.siteUrl },
    { "@type": "ListItem", position: 2, name: "Legal", item: `${siteConfig.siteUrl}/legal/dpa` },
    { "@type": "ListItem", position: 3, name: "Data Processing Addendum", item: pageUrl },
  ],
}

export const Route = createFileRoute("/legal/dpa")({
  component: DPAPage,
  beforeLoad: () => ({
    title: pageTitle,
  }),
})

function DPAPage() {
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 mx-auto flex w-full max-w-screen-lg items-center justify-between p-6 py-3">
          <Link to="/" className="flex h-10 items-center gap-1">
            <Logo />
          </Link>
        </div>
        <div className="mx-auto max-w-3xl px-6 pb-24">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Data Processing Addendum
          </h1>
          <p className="mb-2 text-sm text-muted-foreground">
            Last updated: July 10, 2026
          </p>
          <p className="mb-8 text-sm italic text-muted-foreground">
            This DPA is incorporated by reference into the{' '}
            <Link to="/legal/terms" className="text-primary underline hover:no-underline">Terms of Service</Link>{' '}
            and <Link to="/legal/terms-of-sale" className="text-primary underline hover:no-underline">Terms of Sale</Link>.
            By using the Platform, Customer accepts this DPA.
          </p>

          <Section title="1. Introduction">
            <p>
              This Data Processing Addendum (hereinafter the <strong>"DPA"</strong>) forms an integral part of
              the agreement between Antaios (hereinafter <strong>"Processor"</strong>, <strong>"we"</strong>, or
              <strong>"us"</strong>) and the entity subscribing to the Antaios Platform (hereinafter
              <strong>"Customer"</strong> or <strong>"Controller"</strong>).
            </p>
            <p>
              This DPA sets out the rights and obligations of the parties regarding the processing of personal
              data in connection with the provision of the Antaios Platform, in compliance with Regulation (EU)
              2016/679 (the <strong>"GDPR"</strong>) and the French Loi Informatique et Libertés.
            </p>
            <p>
              <strong>Capitalized terms</strong> not defined in this DPA have the meanings given in the Terms of
              Service. In the event of any conflict between this DPA and the Terms of Service, this DPA shall
              prevail.
            </p>
          </Section>

          <Section title="2. Effective Date and Acceptance">
            <p>
              This DPA becomes legally binding between Customer and Processor on the earliest of:
            </p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Customer's acceptance of the Terms of Service (including click‑wrap acceptance); or</li>
              <li>Customer's first access to or use of the Platform after the "Last updated" date above.</li>
            </ol>
            <p className="mt-2">
              If Customer requires a countersigned PDF copy for its records, email{' '}
              <a href="mailto:privacy@antaios.app" className="text-primary underline hover:no-underline">privacy@antaios.app</a>
              {' '}and we will promptly return an executed copy.
            </p>
          </Section>

          <Section title="3. Definitions">
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>"Personal Data"</strong>: any information relating to an identified or identifiable natural person (data subject) as defined in Article 4(1) GDPR.</li>
              <li><strong>"Processing"</strong>: any operation or set of operations performed on Personal Data as defined in Article 4(2) GDPR.</li>
              <li><strong>"Data Subject"</strong>: an identified or identifiable natural person whose Personal Data is processed.</li>
              <li><strong>"Data Protection Law"</strong>: the GDPR, the French Loi Informatique et Libertés, and any applicable implementing legislation.</li>
              <li><strong>"Sub-processor"</strong>: any third party engaged by the Processor to process Personal Data on behalf of the Controller.</li>
              <li><strong>"Security Measures"</strong>: the technical and organizational measures described in Section 8.</li>
              <li><strong>"Platform"</strong>: the Antaios SaaS platform as described in the Terms of Service.</li>
            </ul>
          </Section>

          <Section title="4. Roles of the Parties">
            <p>
              <strong>Controller:</strong> Customer determines the purposes and means of processing personal
              data (e.g., which supplier data to collect, which documents to upload). Customer acts as the
              data controller under Article 4(7) GDPR.
            </p>
            <p>
              <strong>Processor:</strong> Antaios processes personal data on behalf of and only on documented
              instructions from Customer. Antaios acts as a data processor under Article 4(8) GDPR.
            </p>
            <p>
              <strong>Note on dual role:</strong> Antaios also acts as a separate data controller for its own
              operational data (billing information, support tickets, usage analytics). This DPA covers only
              the processor role. Antaios' controller processing is governed by our{' '}
              <Link to="/legal/privacy" className="text-primary underline hover:no-underline">Privacy Policy</Link>.
            </p>
          </Section>

          <Section title="5. Details of Processing">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-semibold text-foreground w-48">Subject matter</td>
                    <td className="py-2 text-muted-foreground">Provision of the Antaios EUDR compliance platform, including document processing, data extraction, deforestation scanning, DDS generation, and supplier portal</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-semibold text-foreground">Duration</td>
                    <td className="py-2 text-muted-foreground">The term of Customer's subscription plus the post-termination data retention period specified in the Privacy Policy</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-semibold text-foreground">Nature and purpose</td>
                    <td className="py-2 text-muted-foreground">Processing of import documents and related data to facilitate EUDR compliance, including AI-based extraction, data validation, deforestation analysis, and regulatory submission</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-semibold text-foreground">Categories of data subjects</td>
                    <td className="py-2 text-muted-foreground">Supplier representatives, farm owners, farm managers, and any other natural persons whose data is contained in documents uploaded by Customer</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-semibold text-foreground">Types of personal data</td>
                    <td className="py-2 text-muted-foreground">Name, email address, phone number, physical address, GPS coordinates (as part of geolocation data), and any other personal data contained in uploaded trade documents</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="6. Processing Instructions">
            <p>
              The Processor shall process Personal Data only on documented instructions from the Controller,
              unless required to do otherwise by applicable law (in which case the Processor shall inform the
              Controller of that legal requirement before processing, unless the law prohibits such information
              on important grounds of public interest).
            </p>
            <p>
              By using the Platform, Customer instructs the Processor to process Personal Data for the following
              purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Document storage, processing, and AI-based data extraction;</li>
              <li>Data validation, conflict resolution, and completeness assessment;</li>
              <li>Supplier communication via the supplier portal;</li>
              <li>Deforestation scan via Global Forest Watch;</li>
              <li>Generation and submission of Due Diligence Statements via TRACES;</li>
              <li>Generation of risk assessment PDFs.</li>
            </ul>
          </Section>

          <Section title="7. Confidentiality">
            <p>
              The Processor shall ensure that any person authorized to process Personal Data (including its
              staff, agents, and subcontractors) is bound by appropriate confidentiality obligations. Access
              to Personal Data is granted on a strict need-to-know basis.
            </p>
          </Section>

          <Section title="8. Security Measures">
            <p>
              The Processor shall implement and maintain appropriate technical and organizational measures to
              ensure a level of security appropriate to the risk, including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Encryption:</strong> data at rest encrypted with AES-256; data in transit encrypted with TLS 1.3;</li>
              <li><strong>Access control:</strong> role-based access control, multi-factor authentication via Clerk, least‑privilege principle;</li>
              <li><strong>Infrastructure:</strong> data hosted on servers within the European Union (OVH, France);</li>
              <li><strong>Monitoring:</strong> 24/7 system monitoring, intrusion detection, and automated alerting;</li>
              <li><strong>Backup:</strong> daily automated backups with point-in-time recovery;</li>
              <li><strong>Vulnerability management:</strong> regular security scans and third-party penetration testing at least annually;</li>
              <li><strong>Incident response:</strong> documented incident response plan with designated team and root‑cause analysis;</li>
              <li><strong>Personnel:</strong> security awareness training for all personnel, background checks, termination off-boarding procedures.</li>
            </ul>
            <p className="mt-2">
              The Processor may update these measures from time to time, provided that such updates do not
              materially reduce the level of security.
            </p>
          </Section>

          <Section title="9. Sub-processors">
            <h3 className="mt-4 font-semibold text-foreground">9.1 Authorized Sub-processors</h3>
            <p>
              Customer provides general authorization for the Processor to engage the following sub-processors:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 text-left font-semibold text-foreground">Sub-processor</th>
                    <th className="py-2 pr-4 text-left font-semibold text-foreground">Processing activity</th>
                    <th className="py-2 text-left font-semibold text-foreground">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 text-muted-foreground">Convex (convex.dev)</td>
                    <td className="py-2 pr-4 text-muted-foreground">Backend infrastructure, database, file storage</td>
                    <td className="py-2 text-muted-foreground">US (EU Data Boundary)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 text-muted-foreground">OVH Cloud</td>
                    <td className="py-2 pr-4 text-muted-foreground">LLM inference (LiteLLM proxy)</td>
                    <td className="py-2 text-muted-foreground">France (EU)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 text-muted-foreground">Mistral AI</td>
                    <td className="py-2 pr-4 text-muted-foreground">LLM inference (fallback)</td>
                    <td className="py-2 text-muted-foreground">France (EU)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 text-muted-foreground">Clerk (clerk.com)</td>
                    <td className="py-2 pr-4 text-muted-foreground">Authentication and user management</td>
                    <td className="py-2 text-muted-foreground">US (DPA in place)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 text-muted-foreground">Dodo Payments</td>
                    <td className="py-2 pr-4 text-muted-foreground">Payment processing (no personal data from Platform)</td>
                    <td className="py-2 text-muted-foreground">Global (PCI DSS)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 text-muted-foreground">Resend (resend.com)</td>
                    <td className="py-2 pr-4 text-muted-foreground">Transactional email delivery</td>
                    <td className="py-2 text-muted-foreground">US (EU Data Boundary)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 text-muted-foreground">General Translation</td>
                    <td className="py-2 pr-4 text-muted-foreground">Supplier portal i18n</td>
                    <td className="py-2 text-muted-foreground">Canada</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-4 font-semibold text-foreground">9.2 Notification and Objection</h3>
            <p>
              The Processor shall notify Customer at least 30 days before engaging any new sub-processor.
              Customer may object to the engagement by providing a written objection within 14 days of
              notification, specifying reasonable grounds. If the objection cannot be resolved, Customer may
              terminate the affected service without penalty.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">9.3 Sub-processor Agreements</h3>
            <p>
              The Processor shall impose on each sub-processor the same data protection obligations as those
              set out in this DPA, by way of a written contract. Where a sub-processor fails to fulfill its
              obligations, the Processor shall remain fully liable to the Controller for the performance of
              that sub-processor's obligations.
            </p>
          </Section>

          <Section title="10. Data Subject Rights">
            <p>
              The Processor shall assist the Controller in fulfilling its obligations to respond to data subject
              requests under Articles 15–22 GDPR (right of access, rectification, erasure, restriction,
              portability, and objection).
            </p>
            <p>
              If the Processor receives a direct request from a data subject relating to Personal Data processed
              on behalf of the Controller, the Processor shall promptly forward the request to the Controller
              and provide reasonable assistance in responding.
            </p>
          </Section>

          <Section title="11. Personal Data Breach">
            <p>
              The Processor shall notify the Controller without undue delay (and in any event within 48 hours)
              upon becoming aware of a personal data breach affecting Personal Data processed on behalf of the
              Controller. The Processor shall provide:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>A description of the nature of the breach;</li>
              <li>The categories and approximate number of data subjects and records concerned;</li>
              <li>The likely consequences of the breach;</li>
              <li>The measures taken or proposed to address the breach.</li>
            </ul>
            <p className="mt-2">
              The Processor shall cooperate fully with the Controller in notifying the supervisory authority
              (CNIL) under Article 33 GDPR and, where required, communicating the breach to data subjects
              under Article 34 GDPR.
            </p>
          </Section>

          <Section title="12. Data Protection Impact Assessment">
            <p>
              The Processor shall provide reasonable assistance to the Controller in conducting any Data
              Protection Impact Assessment (DPIA) required under Article 35 GDPR, and in any prior consultation
              with the supervisory authority under Article 36 GDPR, taking into account the nature of the
              processing and the information available to the Processor.
            </p>
          </Section>

          <Section title="13. Data Retention and Deletion">
            <p>
              The Processor shall retain Personal Data only for as long as necessary to provide the Platform
              services and as required by applicable law. Upon termination of the subscription, the Processor
              shall:
            </p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Provide Customer with 30 days to export its data from the Platform;</li>
              <li>After such period, delete all Personal Data processed on behalf of the Controller, unless EU or Member State law requires retention (e.g., tax records retained for 10 years under French law).</li>
            </ol>
          </Section>

          <Section title="14. Audit Rights">
            <p>
              Upon the Controller's reasonable request (at most once per calendar year), the Processor shall
              make available information reasonably necessary to demonstrate compliance with this DPA, including
              relevant audit reports (e.g., SOC 2 Type II or equivalent).
            </p>
            <p>
              If the Controller wishes to conduct an on-site audit, it shall provide at least 30 days' prior
              written notice. Such audits shall be conducted during normal business hours, with minimal
              disruption to the Processor's operations, and at the Controller's expense. The parties shall
              agree on the scope and timing in advance.
            </p>
          </Section>

          <Section title="15. International Data Transfers">
            <p>
              Where Personal Data is transferred from the EEA to a country not recognized by the European
              Commission as providing adequate data protection, the Processor shall ensure that such transfers
              are subject to appropriate safeguards, including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Standard Contractual Clauses (Module 2: Controller to Processor) as adopted by the European Commission;</li>
              <li>Any additional transfer impact assessment and supplementary measures required under the Schrems II ruling;</li>
              <li>Data Privacy Framework certification where applicable.</li>
            </ul>
            <p className="mt-2">
              By entering into this DPA, the parties are deemed to have signed the applicable Standard
              Contractual Clauses.
            </p>
          </Section>

          <Section title="16. Liability">
            <p>
              The liability of the Processor under this DPA shall be governed by the limitation of liability
              provisions in the Terms of Service, provided that nothing in this DPA limits the Processor's
              liability under Articles 28 and 82 GDPR.
            </p>
          </Section>

          <Section title="17. Governing Law">
            <p>
              This DPA is governed by French law. Any disputes arising from or relating to this DPA shall be
              subject to the exclusive jurisdiction of the courts of Paris, subject to any mandatory consumer
              protection provisions.
            </p>
          </Section>

          <Section title="18. Contact">
            <p>
              For any questions regarding this DPA or to request a signed copy:
            </p>
            <p className="mt-1">
              <strong>Antaios</strong><br />
              Data Protection: <a href="mailto:privacy@antaios.app" className="text-primary underline hover:no-underline">privacy@antaios.app</a><br />
              Support: <a href="mailto:hello@mail.antaios.app" className="text-primary underline hover:no-underline">hello@mail.antaios.app</a>
            </p>
          </Section>

          <div className="mt-12 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Need a signed PDF copy?</p>
            <p>
              Email <a href="mailto:privacy@antaios.app" className="text-primary underline hover:no-underline">privacy@antaios.app</a>{' '}
              with your company name and we will return a countersigned PDF within 2 business days.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_p]:mb-2">
        {children}
      </div>
    </section>
  )
}
