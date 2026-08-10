import { createFileRoute, Link } from "@tanstack/react-router"
import { Helmet } from "react-helmet-async"
import { Logo } from "@/components/logo"

const pageTitle = "Privacy Policy — Antaios"

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyPage,
  beforeLoad: () => ({
    title: pageTitle,
  }),
})

function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — Antaios</title>
        <meta name="description" content="Antaios privacy policy for EUDR compliance platform users. Learn how we process personal data, our sub-processors, GDPR compliance, data retention policies, and your data rights." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 mx-auto flex w-full max-w-screen-lg items-center justify-between p-6 py-3">
          <Link to="/" className="flex h-10 items-center gap-1">
            <Logo />
          </Link>
        </div>
        <div className="mx-auto max-w-3xl px-6 pb-24">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Privacy Policy
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Last updated: July 10, 2026
          </p>

          <Section title="1. Who We Are">
            <p>
              <strong>Antaios</strong> is a French société par actions simplifiée (SAS) that publishes the
              Antaios Platform, a SaaS compliance solution for EU Deforestation Regulation (EUDR) due diligence.
            </p>
            <p>
              For any questions regarding this Privacy Policy or our data processing practices, please contact
              us at: <strong>support@antaios.app</strong>.
            </p>
          </Section>

          <Section title="2. What Data We Collect">
            <h3 className="mt-4 font-semibold text-foreground">2.1 Account Data</h3>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name and email address;</li>
              <li>Organization name, address, and VAT number;</li>
              <li>Phone number (optional);</li>
              <li>Authentication credentials (handled securely via Clerk);</li>
              <li>Billing information (processed through Dodo Payments — we do not store full payment card data).</li>
            </ul>

            <h3 className="mt-4 font-semibold text-foreground">2.2 Document and Shipment Data</h3>
            <p>
              When using the Platform, Operators upload import documents (PDFs, spreadsheets, geospatial files,
              images) containing data relevant to EUDR compliance. This data may include personal data relating
              to third parties (e.g., supplier representatives, farm owners). Operators are responsible for
              ensuring they have a lawful basis for processing such data.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">2.3 Supplier Data</h3>
            <p>
              When a supplier is invited via the supplier portal, we collect the supplier's email address
              and any answers provided through the portal form.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">2.4 Technical Data</h3>
            <p>
              We automatically collect certain technical information when you use the Platform, including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP address and browser/user-agent information;</li>
              <li>Usage logs (pages visited, features used, timestamps);</li>
              <li>Device type and operating system;</li>
              <li>Session duration and interaction patterns.</li>
            </ul>

            <h3 className="mt-4 font-semibold text-foreground">2.5 Cookies</h3>
            <p>
              We only use strictly necessary cookies required for the Platform's operation (authentication
              via Clerk, session management, CSRF protection). These cookies do not require prior consent.
            </p>
            <p>
              We do not use analytics, marketing, or tracking cookies. No third-party cookies are set
              on the Platform. As we do not use any analytics services or tracking scripts, no cookie
              consent banner is necessary.
            </p>
          </Section>

          <Section title="3. Legal Bases for Processing">
            <p>We process your personal data on the following legal bases:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Contractual necessity</strong> (Art. 6(1)(b) GDPR): to provide the Platform services, manage your account, and process payments;</li>
              <li><strong>Legal obligation</strong> (Art. 6(1)(c) GDPR): to retain invoices and accounting records as required by French tax law;</li>
              <li><strong>Legitimate interest</strong> (Art. 6(1)(f) GDPR): to improve the Platform, ensure security, and prevent fraud;</li>
              <li><strong>Consent</strong> (Art. 6(1)(a) GDPR): for non-essential cookies, marketing communications, and optional data processing.</li>
            </ul>
          </Section>

          <Section title="4. How We Use Your Data">
            <p>We use your data for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Providing and maintaining the Platform and its features;</li>
              <li>Processing document extraction, deforestation scanning, and DDS generation;</li>
              <li>Sending service-related communications (e.g., extraction results, supplier notifications);</li>
              <li>Billing and subscription management;</li>
              <li>Platform security, fraud detection, and abuse prevention;</li>
              <li>Improving and optimizing the Platform (using anonymized data);</li>
              <li>Complying with legal and regulatory obligations.</li>
            </ul>
          </Section>

          <Section title="5. Data Sharing and Sub-processors">
            <p>
              We share your data only with trusted service providers who act as sub-processors, under
              contractual obligations that ensure compliance with the GDPR. The processing of your data
              by us as a processor on your behalf is governed by our{' '}
              <Link to="/legal/dpa" className="text-primary underline hover:no-underline">Data Processing Addendum (DPA)</Link>.
              The following sub-processors are authorized:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 text-left font-semibold text-foreground">Provider</th>
                    <th className="py-2 pr-4 text-left font-semibold text-foreground">Purpose</th>
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
                    <td className="py-2 pr-4 text-muted-foreground">Payment processing and subscription management</td>
                    <td className="py-2 text-muted-foreground">Global (PCI DSS compliant)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 text-muted-foreground">Resend (resend.com)</td>
                    <td className="py-2 pr-4 text-muted-foreground">Transactional email delivery</td>
                    <td className="py-2 text-muted-foreground">US (EU Data Boundary)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 text-muted-foreground">Global Forest Watch</td>
                    <td className="py-2 pr-4 text-muted-foreground">Deforestation scan data (no personal data)</td>
                    <td className="py-2 text-muted-foreground">US</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 text-muted-foreground">General Translation</td>
                    <td className="py-2 pr-4 text-muted-foreground">Supplier portal translation</td>
                    <td className="py-2 text-muted-foreground">Canada</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2">
              Where data is transferred outside the European Economic Area, we rely on Standard Contractual
              Clauses (SCCs) adopted by the European Commission and/or the recipient's Data Privacy Framework
              certification.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your personal data only as long as necessary for the purposes described in this policy:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account data</strong>: retained for the duration of your account. After deletion, we retain essential data for up to 12 months for legal or audit purposes;</li>
              <li><strong>Document and shipment data</strong>: retained for the duration of your subscription plus 12 months, unless earlier deletion is requested;</li>
              <li><strong>Invoices and billing data</strong>: retained for 10 years as required by French tax and accounting law (Art. L123-22 Code de commerce);</li>
              <li><strong>Technical logs</strong>: retained for 12 months;</li>
              <li><strong>Supplier data</strong>: retained until the related shipment data is deleted, unless the supplier requests earlier deletion.</li>
            </ul>
          </Section>

          <Section title="7. Your Rights">
            <p>
              Under the GDPR and the French Data Protection Act, you have the following rights regarding your
              personal data:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Right of access</strong> (Art. 15 GDPR): obtain confirmation of whether we process your data and request a copy;</li>
              <li><strong>Right to rectification</strong> (Art. 16 GDPR): request correction of inaccurate or incomplete data;</li>
              <li><strong>Right to erasure</strong> (Art. 17 GDPR): request deletion of your data ("right to be forgotten");</li>
              <li><strong>Right to restriction</strong> (Art. 18 GDPR): restrict processing in certain circumstances;</li>
              <li><strong>Right to data portability</strong> (Art. 20 GDPR): receive your data in a structured, machine-readable format;</li>
              <li><strong>Right to object</strong> (Art. 21 GDPR): object to processing based on legitimate interest;</li>
              <li><strong>Right to withdraw consent</strong>: at any time, without affecting the lawfulness of processing before withdrawal.</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at <strong>privacy@antaios.app</strong>. We will respond within
              one month (extendable to two months for complex requests). You also have the right to lodge a
              complaint with the CNIL (Commission Nationale de l'Informatique et des Libertés), the French data
              protection authority: <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-primary underline hover:no-underline">www.cnil.fr</a>.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We implement appropriate technical and organizational measures to protect your data, including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encryption at rest (AES-256) and in transit (TLS 1.3);</li>
              <li>Access controls and authentication via Clerk with MFA support;</li>
              <li>Regular security audits and vulnerability assessments;</li>
              <li>Least-privilege access policies for our engineering team;</li>
              <li>Continuous monitoring and incident response procedures.</li>
            </ul>
          </Section>

          <Section title="9. Data Breach Notification">
            <p>
              In the event of a personal data breach that poses a risk to your rights and freedoms, we will
              notify the CNIL within 72 hours as required by Art. 33 GDPR and, where required, notify affected
              data subjects without undue delay (Art. 34 GDPR).
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material changes will be notified by email
              or through the Platform. We encourage you to review this policy periodically.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              For any questions, requests, or complaints regarding this Privacy Policy or our data processing
              practices:
            </p>
            <p className="mt-1">
              <strong>Antaios</strong><br />
              Email: <a href="mailto:privacy@antaios.app" className="text-primary underline hover:no-underline">privacy@antaios.app</a><br />
              Support: <a href="mailto:support@antaios.app" className="text-primary underline hover:no-underline">support@antaios.app</a>
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
