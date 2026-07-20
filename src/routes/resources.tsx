import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { Route as EudrChecklistRoute } from "./resources.eudr-checklist";
import { Route as EudrOverviewRoute } from "./resources.eudr-overview";
import { Route as TraceabilityGuideRoute } from "./resources.traceability-guide";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
  beforeLoad: () => ({ title: "Resources — Antaios" }),
});

const articles = [
  {
    to: EudrChecklistRoute.fullPath,
    title: "resources.list.article1.title",
    titleEn: "EUDR Compliance Checklist: Your 5-Step Guide to Article 10(2)",
    description: "resources.list.article1.desc",
    descriptionEn:
      "A practical walk-through of the five due-diligence criteria under Article 10(2) of the EU Deforestation Regulation. Covers what each criterion requires, what evidence you need, and common pitfalls to avoid.",
    category: "resources.list.article1.category",
    categoryEn: "Compliance Guide",
    readTime: "resources.list.article1.readTime",
    readTimeEn: "5 min read",
  },
  {
    to: TraceabilityGuideRoute.fullPath,
    title: "resources.list.article2.title",
    titleEn: "Importer's Guide to Supply Chain Traceability Under EUDR",
    description: "resources.list.article2.desc",
    descriptionEn:
      "Traceability is the backbone of EUDR compliance. Learn what 'traceability throughout the supply chain' actually means, how geolocation data fits in, and how to build a traceability system from scratch.",
    category: "resources.list.article2.category",
    categoryEn: "Technical Guide",
    readTime: "resources.list.article2.readTime",
    readTimeEn: "6 min read",
  },
  {
    to: EudrOverviewRoute.fullPath,
    title: "resources.list.article3.title",
    titleEn: "Is Your Business Ready for EUDR? A Practical Overview",
    description: "resources.list.article3.desc",
    descriptionEn:
      "New to the EU Deforestation Regulation? This overview covers who it affects, key deadlines, the seven regulated commodities, and the first steps you should take to prepare.",
    category: "resources.list.article3.category",
    categoryEn: "Overview",
    readTime: "resources.list.article3.readTime",
    readTimeEn: "4 min read",
  },
];



function ResourcesPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>Resources — Antaios</title>
        <meta name="description" content="Free EUDR compliance resources for importers. Guides, checklists, and practical content on the EU Deforestation Regulation, due-diligence criteria, and supply chain traceability." />
        <meta property="og:title" content="Resources — Antaios" />
        <meta property="og:description" content="Free EUDR compliance resources for importers. Guides, checklists, and practical content on the EU Deforestation Regulation, due-diligence criteria, and supply chain traceability." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://antaios.app/resources" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://antaios.app/resources" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "EUDR Compliance Resources",
            description: "Guides, checklists, and practical resources for importers navigating the EU Deforestation Regulation.",
            publisher: {
              "@type": "Organization",
              name: "Antaios",
              url: "https://antaios.app",
            },
          })}
        </script>
      </Helmet>
      <Nav />
      <main className="flex-1">
        <section className="px-6 pb-16 pt-16 md:pb-24 md:pt-24">
          <div className="mx-auto max-w-screen-lg">
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">
              {t("resources.list.title", "EUDR Compliance Resources")}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {t(
                "resources.list.subtitle",
                "Guides, checklists, and practical resources for importers navigating the EU Deforestation Regulation.",
              )}
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, i) => (
                <Link
                  key={i}
                  to={article.to}
                  className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium uppercase tracking-wider text-primary">
                      {t(article.category, article.categoryEn)}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t(article.title, article.titleEn)}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {t(article.description, article.descriptionEn)}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {t(article.readTime, article.readTimeEn)}
                    </div>
                    <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      {t("resources.list.readMore", "Read more")}
                      <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
