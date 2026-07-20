import { createFileRoute, Link } from "@tanstack/react-router"
import { Helmet } from "react-helmet-async"
import siteConfig from "~/site.config"
import { Logo } from "@/components/logo"

const pageTitle = "Legal Notices — Antaios"
const pageDescription =
  "Antaios legal notices (mentions légales): publisher information, publication director, hosting provider, and intellectual property."
const pageUrl = `${siteConfig.siteUrl}/legal/notices`

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.siteUrl },
    { "@type": "ListItem", position: 2, name: "Legal", item: `${siteConfig.siteUrl}/legal/notices` },
    { "@type": "ListItem", position: 3, name: "Legal Notices", item: pageUrl },
  ],
}

export const Route = createFileRoute("/legal/notices")({
  component: NoticesPage,
  beforeLoad: () => ({
    title: pageTitle,
  }),
})

function NoticesPage() {
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
            Legal Notices
          </h1>
          <p className="mb-2 text-sm text-muted-foreground">
            Mentions légales
          </p>
          <p className="mb-8 text-sm text-muted-foreground">
            Last updated: July 10, 2026
          </p>

          <Section title="Publisher (Éditeur)">
            <p>
              <strong>Company name:</strong> Antaios<br />
              <strong>Legal form:</strong> Auto-entrepreneur (EI — Entreprise Individuelle)<br />
              <strong>Share capital:</strong> N/A (auto-entrepreneur)<br />
              <strong>RCS (SIRET):</strong> — <em>see TODO</em><br />
              <strong>VAT number (TVA intracom.):</strong> — <em>see TODO</em><br />
              <strong>Registered office:</strong> 90 Rue Henry Litolff, 92270 Bois-Colombes, France<br />
              <strong>Email:</strong> <a href="mailto:support@antaios.app" className="text-primary underline hover:no-underline">support@antaios.app</a>
            </p>
          </Section>

          <Section title="Publication Director">
            <p>
              <strong>Name:</strong> Patricia Konan
            </p>
          </Section>

          <Section title="Hosting">
            <p>
              <strong>Hosting provider:</strong> Convex<br />
              <strong>Website:</strong> <a href="https://convex.dev" target="_blank" rel="noreferrer" className="text-primary underline hover:no-underline">convex.dev</a><br />
              <strong>Address:</strong> 981 Mission St, San Francisco, CA 94103, United States
            </p>
          </Section>

          <Section title="Intellectual Property">
            <p>
              All content on the Antaios platform — including code, design, text, graphics, logos, and
              interfaces — is the exclusive property of the publisher and is protected by French and
              international intellectual property laws.
            </p>
          </Section>

          <Section title="Limitation of Liability">
            <p>
              The publisher strives to ensure the accuracy of information presented on the platform but
              cannot guarantee it is free of errors or omissions. The publisher shall not be held liable
              for any damages resulting from the use of the platform or the inability to access it.
            </p>
          </Section>

          <Section title="Personal Data">
            <p>
              See our{' '}
              <Link to="/legal/privacy" className="text-primary underline hover:no-underline">Privacy Policy</Link>
              {' '}and{' '}
              <Link to="/legal/dpa" className="text-primary underline hover:no-underline">Data Processing Addendum</Link>.
            </p>
          </Section>

          <Section title="Applicable Law">
            <p>
              These legal notices are governed by French law. Any disputes shall be subject to the
              jurisdiction of the competent courts of Paris.
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
