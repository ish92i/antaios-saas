import { createFileRoute, Link } from "@tanstack/react-router"
import { Helmet } from "react-helmet-async"
import siteConfig from "~/site.config"
import { Logo } from "@/components/logo"

const pageTitle = "Terms and Conditions of Sale — Antaios"
const pageDescription =
  "Antaios Terms and Conditions of Sale for paid subscriptions to the EUDR compliance platform. Pricing, payment terms, cancellation, and service level."
const pageUrl = `${siteConfig.siteUrl}/legal/terms-of-sale`

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.siteUrl },
    { "@type": "ListItem", position: 2, name: "Legal", item: `${siteConfig.siteUrl}/legal/terms-of-sale` },
    { "@type": "ListItem", position: 3, name: "Terms and Conditions of Sale", item: pageUrl },
  ],
}

export const Route = createFileRoute("/legal/terms-of-sale")({
  component: TermsOfSalePage,
  beforeLoad: () => ({
    title: pageTitle,
  }),
})

function TermsOfSalePage() {
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
            Terms and Conditions of Sale
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Last updated: July 10, 2026
          </p>

          <Section title="1. Scope">
            <p>
              These Terms and Conditions of Sale (hereinafter the <strong>"Terms of Sale"</strong>) govern the
              commercial relationship between Antaios (hereinafter <strong>"we"</strong>, <strong>"us"</strong>,
              or <strong>"the Publisher"</strong>) and any legal entity subscribing to a paid plan of the
              Antaios Platform (hereinafter the <strong>"Client"</strong>).
            </p>
            <p>
              These Terms of Sale apply in addition to the <Link to="/legal/terms" className="text-primary underline hover:no-underline">Terms of Service</Link>.
              In the event of any conflict, these Terms of Sale shall prevail to the extent of the
              inconsistency.
            </p>
            <p>
              By subscribing to a paid plan, the Client acknowledges having read and accepted these
              Terms of Sale without reservation.
            </p>
          </Section>

          <Section title="2. Subscriptions and Pricing">
            <h3 className="mt-4 font-semibold text-foreground">2.1 Subscription Plans</h3>
            <p>
              The Platform is available on a subscription basis. The features and limits of each plan are
              described on our pricing page and may be updated from time to time.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">2.2 Price</h3>
            <p>
              The subscription price is <strong>€500 (five hundred euros) excluding tax (HT)</strong> per month,
              unless otherwise agreed in writing. All prices are exclusive of applicable taxes (VAT, and any
              other taxes or duties). The Client is responsible for all applicable taxes.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">2.3 Price Changes</h3>
            <p>
              We reserve the right to modify our prices at any time. Price changes will take effect at the
              next renewal period following at least 30 days' prior notice by email.
            </p>
          </Section>

          <Section title="3. Payment Terms">
            <h3 className="mt-4 font-semibold text-foreground">3.1 Payment Method</h3>
            <p>
              Subscriptions are payable by credit card or any other payment method accepted by our payment
              processor, Dodo Payments. Payment is processed securely by Dodo Payments; we do not store full
              payment card details.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">3.2 Billing Cycle</h3>
            <p>
              The subscription fee is billed in advance on a monthly basis. The first payment is due upon
              subscription and covers the first month of service. Subsequent payments are automatically
              charged on the same day of each subsequent month.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">3.3 Invoicing</h3>
            <p>
              Invoices are issued electronically and sent to the Client's registered email address. The
              Client is responsible for providing accurate billing information and updating it as necessary.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">3.4 Late Payment</h3>
            <p>
              In the event of late payment, we reserve the right to suspend access to the Platform after a
              grace period of 7 days following the due date. Late payments are subject to interest at the
              rate specified in Article L.441-10 of the French Commercial Code, applied to the amount overdue.
            </p>
          </Section>

          <Section title="4. Subscription Term and Renewal">
            <h3 className="mt-4 font-semibold text-foreground">4.1 Initial Term</h3>
            <p>
              The subscription is for an initial minimum term of one (1) month, commencing on the date of
              subscription.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">4.2 Automatic Renewal</h3>
            <p>
              Unless cancelled by the Client before the renewal date, the subscription will automatically
              renew on a monthly basis under the same terms.
            </p>

            <h3 className="mt-4 font-semibold text-foreground">4.3 Cancellation</h3>
            <p>
              The Client may cancel their subscription at any time from their account settings. Cancellation
              takes effect at the end of the current billing period. No refunds are provided for partial
              months of service.
            </p>
          </Section>

          <Section title="5. Service Level">
            <p>
              We use commercially reasonable efforts to make the Platform available 24/7, subject to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Scheduled maintenance (notified at least 24 hours in advance when possible);</li>
              <li>Emergency maintenance required for security or stability;</li>
              <li>Events of force majeure;</li>
              <li>Unavailability of third-party services (Global Forest Watch, TRACES, LLM providers).</li>
            </ul>
            <p className="mt-2">
              Our target availability is 99.5% uptime per calendar month. This does not apply to the public
              supplier portal, which is provided on a best-effort basis.
            </p>
          </Section>

          <Section title="6. Client Obligations">
            <p>The Client agrees to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate and complete information for account and billing setup;</li>
              <li>Not exceed usage limits applicable to their subscription plan;</li>
              <li>Not resell, sublicense, or otherwise make the Platform available to third parties without our written consent;</li>
              <li>Not use the Platform in a manner that violates applicable laws or regulations;</li>
              <li>Maintain the confidentiality of their account credentials.</li>
            </ul>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, our aggregate liability arising out of or
              related to these Terms of Sale shall not exceed the amount paid by the Client during the twelve
              (12) months preceding the event giving rise to the liability. This limitation does not apply
              to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fraud or wilful misconduct (dol ou faute lourde);</li>
              <li>Personal injury or death;</li>
              <li>Breach of data protection obligations under the GDPR (see our <Link to="/legal/dpa" className="text-primary underline hover:no-underline">Data Processing Addendum</Link>);</li>
              <li>Any liability that cannot be excluded or limited by applicable law.</li>
            </ul>
          </Section>

          <Section title="8. Warranties">
            <p>
              We warrant that the Platform will substantially conform to its documentation under normal use.
              The Client's sole remedy for a breach of this warranty is a refund of the fees paid for the
              period during which the non-conformance occurred.
            </p>
            <p>
              <strong>Except as expressly stated in these Terms of Sale, the Platform is provided "as is"</strong>{' '}
              and we disclaim all other warranties, express or implied, including merchantability, fitness
              for a particular purpose, and non-infringement. We do not warrant that the Platform will be
              error-free, uninterrupted, or that the AI extraction results will be accurate or complete.
            </p>
          </Section>

          <Section title="9. Confidentiality">
            <p>
              Both parties agree to maintain the confidentiality of any non-public information disclosed
              during the course of the commercial relationship, including but not limited to business
              processes, technical data, and financial information. This obligation survives the termination
              of the subscription for a period of three (3) years.
            </p>
          </Section>

          <Section title="10. Termination for Convenience">
            <p>
              Either party may terminate the subscription at any time by providing at least 30 days' written
              notice. The Client may terminate via their account settings. Upon termination, the Client's
              access to the Platform will continue until the end of the current billing period.
            </p>
          </Section>

          <Section title="11. Termination for Cause">
            <p>
              Either party may terminate the subscription immediately by written notice if:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The other party commits a material breach of these Terms of Sale and fails to remedy it within 15 days of notice;</li>
              <li>The other party becomes insolvent, is subject to bankruptcy proceedings, or ceases operations.</li>
            </ul>
            <p className="mt-2">
              In the event of termination for cause by the Client, fees paid for the remainder of the
              billing period will be refunded on a pro-rata basis.
            </p>
          </Section>

          <Section title="12. Effects of Termination">
            <p>
              Upon termination of the subscription, the Client's access to the Platform will be deactivated.
              We will provide a 30-day period during which the Client may export their data. After this
              period, data will be deleted in accordance with our Privacy Policy, except for data we are
              legally required to retain.
            </p>
          </Section>

          <Section title="13. Governing Law and Disputes">
            <p>
              These Terms of Sale are governed by French law. Any disputes arising from or relating to these
              Terms of Sale shall be submitted to the exclusive jurisdiction of the courts of Paris.
            </p>
            <p>
              For Clients qualifying as consumers (micro-enterprises under Article L.441-1 of the French
              Commercial Code may also benefit), prior to any court proceedings, the parties agree to attempt
              an amicable resolution by contacting support@antaios.app.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              For any questions regarding these Terms of Sale or your subscription:
            </p>
            <p className="mt-1">
              <strong>Antaios</strong><br />
              Email: <a href="mailto:support@antaios.app" className="text-primary underline hover:no-underline">support@antaios.app</a>
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
