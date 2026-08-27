import { createFileRoute, Link } from "@tanstack/react-router"
import { Helmet } from "react-helmet-async"
import { Logo } from "@/components/logo"

const pageTitle = "Terms of Service — Antaios"

export const Route = createFileRoute("/legal/terms")({
  component: TermsPage,
  beforeLoad: () => ({
    title: pageTitle,
  }),
})

function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms of Service — Antaios</title>
        <meta name="description" content="Antaios terms of service governing use of the EUDR compliance platform. Covers account registration, services description, user obligations, intellectual property, and liability." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 mx-auto flex w-full max-w-screen-lg items-center justify-between p-6 py-3">
          <Link to="/" className="flex h-10 items-center gap-1">
            <Logo />
          </Link>
        </div>
        <div className="mx-auto max-w-3xl px-6 pb-24">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Terms of Service
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Last updated: July 10, 2026
          </p>

          <Section title="1. Purpose">
            <p>
              These Terms of Service (hereinafter the <strong>"Terms"</strong>) govern access to and use of
              the Antaios platform (hereinafter the <strong>"Platform"</strong>), published by Antaios
              (hereinafter <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"the Publisher"</strong>).
            </p>
            <p>
              The Platform is a SaaS service designed for operators and traders subject to EU Regulation
              2023/1115 (EUDR). It enables users to manage their Due Diligence Statements (DDS), extract
              document data via artificial intelligence, run deforestation scans via Global Forest Watch,
              generate risk assessment reports, and submit declarations through the TRACES system.
            </p>
            <p>
              By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree,
              you must not use the Platform.
            </p>
          </Section>

          <Section title="2. Definitions">
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>"Terms"</strong>: these Terms of Service.</li>
              <li><strong>"Terms of Sale"</strong>: the General Terms and Conditions of Sale applicable to paid subscriptions.</li>
              <li><strong>"Publisher"</strong>: Antaios, the publisher of the Platform.</li>
              <li><strong>"User"</strong>: any individual or legal entity accessing the Platform, whether registered or not.</li>
              <li><strong>"Operator"</strong>: a registered User representing a client organization (as defined in Article 2 of the EUDR).</li>
              <li><strong>"Supplier"</strong>: any individual contacted via the public supplier portal to provide additional data.</li>
              <li><strong>"DDS"</strong>: Due Diligence Statement, as defined under the EUDR.</li>
              <li><strong>"Personal Data"</strong>: any information relating to an identified or identifiable natural person.</li>
            </ul>
          </Section>

          <Section title="3. Access to the Platform">
            <h3 className="mt-4 font-semibold text-foreground">3.1 Registration</h3>
            <p>
              Access to the Platform's features requires prior registration. Users agree to provide accurate,
              complete, and up-to-date information during registration and to maintain it throughout their use.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">3.2 Credentials and Security</h3>
            <p>
              Users are responsible for maintaining the confidentiality of their login credentials. Any use
              of an account after authentication is deemed to have been made by the User. In the event of
              loss, theft, or unauthorized use, the User must immediately notify us at hello@mail.antaios.app.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">3.3 Supplier Portal</h3>
            <p>
              The supplier portal (accessible via a unique, secure link) does not require prior registration.
              It is provided for suppliers contacted by an Operator to complete traceability data for a shipment.
              Access is limited to a single submission per link.
            </p>
          </Section>

          <Section title="4. Services Description">
            <p>The Platform enables Operators to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Upload import documents (PDF, DOCX, XLSX, CSV, GeoJSON, KML, ZIP, images) — up to 10 files per shipment;</li>
              <li>Automatically extract structured EUDR compliance data via large language models (LLMs) hosted in the European Union;</li>
              <li>Resolve conflicts and fill in missing data through an interactive assistant;</li>
              <li>Request data from suppliers via the supplier portal;</li>
              <li>Trigger deforestation scans via the Global Forest Watch API;</li>
              <li>Generate Due Diligence Statements (DDS) and submit them via the European Commission's TRACES API;</li>
              <li>Generate risk assessment reports in PDF format.</li>
            </ul>
            <p className="mt-2">
              AI extraction results are provided for informational purposes and do not relieve the Operator
              of their responsibility to verify the accuracy of their declarations. We do not guarantee the
              complete accuracy of extracted data.
            </p>
          </Section>

          <Section title="5. User Obligations">
            <p>Users agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Platform in accordance with its intended purpose and applicable laws;</li>
              <li>Not transmit files containing malware, viruses, or any harmful code;</li>
              <li>Not attempt to access other Users' data or bypass security measures;</li>
              <li>Not use the Platform for fraudulent or illegal purposes;</li>
              <li>Ensure the accuracy of data and documents they submit;</li>
              <li>Respect the intellectual property rights related to the Platform.</li>
            </ul>
            <p className="mt-2">
              Operators are solely responsible for the content of the data and documents they import, as well
              as the accuracy of declarations submitted via TRACES.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              The Platform, its code, design, interfaces, trademarks, and all its components are the exclusive
              property of the Publisher and are protected by copyright, trademark law, and other intellectual
              property rights.
            </p>
            <p>
              We grant Users a non-exclusive, personal, non-transferable right to use the Platform for the
              duration of their subscription, strictly limited to what is necessary for using the Platform
              in accordance with these Terms.
            </p>
            <p>
              Data imported by Operators remains their property. We acquire no ownership rights over this data,
              except for anonymized data used for service improvement.
            </p>
          </Section>

          <Section title="7. Personal Data">
            <p>
              The processing of Personal Data is governed by our Privacy Policy, available at{' '}
              <Link to="/legal/privacy" className="text-primary underline hover:no-underline">/legal/privacy</Link>.
              Users acknowledge having read this policy.
            </p>
            <p>
              In accordance with the General Data Protection Regulation (GDPR) and the French Data Protection
              Act (Loi Informatique et Libertés), Users have rights of access, rectification, erasure, and
              data portability.
            </p>
          </Section>

          <Section title="8. Data Processing and Sub-processing">
            <p>
              When using the Platform, we act as a data processor (Article 28 GDPR) on behalf of the Operator,
              who acts as the data controller for the personal data they import. The terms of this processing
              relationship are detailed in our{' '}
              <Link to="/legal/dpa" className="text-primary underline hover:no-underline">Data Processing Addendum (DPA)</Link>,
              which is incorporated into these Terms by reference.
            </p>
            <p>
              Data is hosted on servers located in the European Union (OVH, France). Sub-processors are listed
              in our{' '}
               <Link to="/legal/privacy" className="text-primary underline hover:no-underline">Privacy Policy</Link>.
            </p>
          </Section>

          <Section title="9. Availability and Maintenance">
            <p>
              We strive to ensure Platform availability of 99.5% per calendar month, excluding scheduled
              maintenance and force majeure events.
            </p>
            <p>
              We reserve the right to perform necessary maintenance operations, prioritizing off-peak hours
              and notifying Users where reasonably possible.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              The Platform uses large language models (LLMs) and third-party services (Global Forest Watch,
              TRACES) whose results may contain inaccuracies, errors, or delays. We shall not be held liable for:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Errors in AI extraction or interpretation of documents;</li>
              <li>Results of deforestation scans provided by Global Forest Watch;</li>
              <li>Rejections, refusals, or processing delays of DDS by the TRACES system;</li>
              <li>Indirect damages, data loss, loss of revenue, or loss of profits;</li>
              <li>The Operator's failure to comply with their legal obligations under the EUDR.</li>
            </ul>
            <p className="mt-2">
              The Platform is a compliance assistance tool. Operators remain solely responsible for the
              compliance of their declarations with applicable regulations.
            </p>
          </Section>

          <Section title="11. Suspension and Termination">
            <p>
              We reserve the right to suspend or terminate a User's access to the Platform in the event of a
              serious breach of these Terms, including fraudulent use, non-payment, or violation of intellectual
              property rights.
            </p>
            <p>
              Users may terminate their account at any time from their account settings. Termination is effective
              immediately. Data will be retained in accordance with our Privacy Policy.
            </p>
          </Section>

          <Section title="12. Force Majeure">
            <p>
              Our liability shall not be engaged in the event of non-performance of our obligations due to a
              force majeure event as defined by Article 1218 of the French Civil Code and applicable case law.
            </p>
          </Section>

          <Section title="13. Changes to These Terms">
            <p>
              We reserve the right to modify these Terms at any time. Users will be notified of material changes
              by email or through the Platform. Continued use of the Platform after changes take effect constitutes
              acceptance of the new Terms.
            </p>
          </Section>

          <Section title="14. Governing Law and Jurisdiction">
            <p>
              These Terms are governed by French law. Any dispute relating to their interpretation or execution
              shall be subject to the exclusive jurisdiction of the courts of Paris, subject to any mandatory
              consumer protection provisions.
            </p>
          </Section>

          <Section title="15. Contact">
            <p>
              For any questions regarding these Terms, please contact us at:
            </p>
            <p className="mt-1">
              <strong>Antaios</strong><br />
              Email: hello@mail.antaios.app
            </p>
          </Section>
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
