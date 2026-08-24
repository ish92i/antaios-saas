import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";


export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
  beforeLoad: () => ({ title: "Resources — Antaios" }),
});

const articles = [
  {
    to: "/resources/eudr-checklist",
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
    to: "/resources/traceability-guide",
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
    to: "/resources/eudr-overview",
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
  {
    to: "/resources/eudr-penalties",
    title: "resources.articles.penalties.title",
    titleEn: "EUDR Penalties: Fines and Enforcement Across the EU",
    description: "resources.articles.penalties.description",
    descriptionEn: "Understand EUDR penalty frameworks, fine calculation, and enforcement across EU member states.",
    category: "resources.categories.compliance",
    categoryEn: "Compliance Guide",
    readTime: "resources.articles.penalties.readTime",
    readTimeEn: "5 min read",
  },
  {
    to: "/resources/eudr-sme-guide",
    title: "resources.articles.smeGuide.title",
    titleEn: "EUDR for Small Businesses: What Importers Need to Know",
    description: "resources.articles.smeGuide.description",
    descriptionEn: "Simplified obligations, extended deadlines, and step-by-step guidance for SME and micro enterprises.",
    category: "resources.categories.guide",
    categoryEn: "Guide",
    readTime: "resources.articles.smeGuide.readTime",
    readTimeEn: "5 min read",
  },
  {
    to: "/resources/eudr-geolocation",
    title: "resources.articles.geolocation.title",
    titleEn: "EUDR Geolocation Requirements: Complete Guide to GPS & Polygon Data",
    description: "resources.articles.geolocation.description",
    descriptionEn: "Everything you need to know about collecting, formatting, and validating geolocation data for EUDR compliance.",
    category: "resources.categories.technical",
    categoryEn: "Technical Guide",
    readTime: "resources.articles.geolocation.readTime",
    readTimeEn: "7 min read",
  },
  {
    to: "/resources/eudr-dds-filing",
    title: "resources.articles.ddsFiling.title",
    titleEn: "How to File a Due Diligence Statement (DDS) in TRACES NT",
    description: "resources.articles.ddsFiling.description",
    descriptionEn: "Step-by-step guide to submitting your DDS through the EU TRACES NT system.",
    category: "resources.categories.technical",
    categoryEn: "Technical Guide",
    readTime: "resources.articles.ddsFiling.readTime",
    readTimeEn: "6 min read",
  },
  {
    to: "/resources/eudr-vs-eutr",
    title: "resources.articles.eudrVsEutr.title",
    titleEn: "EUDR vs EUTR: What Changed and What It Means for Timber Importers",
    description: "resources.articles.eudrVsEutr.description",
    descriptionEn: "Side-by-side comparison of the old and new EU timber regulations and transition requirements.",
    category: "resources.categories.comparison",
    categoryEn: "Comparison",
    readTime: "resources.articles.eudrVsEutr.readTime",
    readTimeEn: "4 min read",
  },
  {
    to: "/resources/commodity-coffee",
    title: "resources.articles.commodityCoffee.title",
    titleEn: "EUDR Coffee Compliance: What Importers Need to Know",
    description: "resources.articles.commodityCoffee.description",
    descriptionEn: "Country-specific requirements, traceability challenges, and compliance checklist for coffee imports.",
    category: "resources.categories.commodity",
    categoryEn: "Commodity Guide",
    readTime: "resources.articles.commodityCoffee.readTime",
    readTimeEn: "6 min read",
  },
  {
    to: "/resources/commodity-cocoa",
    title: "resources.articles.commodityCocoa.title",
    titleEn: "EUDR Cocoa Compliance: Requirements for Chocolate & Cocoa Importers",
    description: "resources.articles.commodityCocoa.description",
    descriptionEn: "Navigate EUDR requirements for cocoa from West Africa and beyond.",
    category: "resources.categories.commodity",
    categoryEn: "Commodity Guide",
    readTime: "resources.articles.commodityCocoa.readTime",
    readTimeEn: "6 min read",
  },
  {
    to: "/resources/commodity-palm-oil",
    title: "resources.articles.commodityPalmOil.title",
    titleEn: "EUDR Palm Oil Compliance: Deforestation-Free Requirements",
    description: "resources.articles.commodityPalmOil.description",
    descriptionEn: "Complete guide to palm oil compliance including RSPO, mill mapping, and smallholder challenges.",
    category: "resources.categories.commodity",
    categoryEn: "Commodity Guide",
    readTime: "resources.articles.commodityPalmOil.readTime",
    readTimeEn: "7 min read",
  },
  {
    to: "/resources/commodity-wood",
    title: "resources.articles.commodityWood.title",
    titleEn: "EUDR Timber & Wood Compliance: A Complete Guide",
    description: "resources.articles.commodityWood.description",
    descriptionEn: "FLEGT, chain of custody, and country-specific requirements for wood imports.",
    category: "resources.categories.commodity",
    categoryEn: "Commodity Guide",
    readTime: "resources.articles.commodityWood.readTime",
    readTimeEn: "5 min read",
  },
  {
    to: "/resources/commodity-soy",
    title: "resources.articles.commoditySoy.title",
    titleEn: "EUDR Soy Compliance: Requirements for EU Importers",
    description: "resources.articles.commoditySoy.description",
    descriptionEn: "Soy-specific compliance including crushing and multiprocessor challenges.",
    category: "resources.categories.commodity",
    categoryEn: "Commodity Guide",
    readTime: "resources.articles.commoditySoy.readTime",
    readTimeEn: "5 min read",
  },
  {
    to: "/resources/commodity-rubber",
    title: "resources.articles.commodityRubber.title",
    titleEn: "EUDR Rubber Compliance: What Importers Should Know",
    description: "resources.articles.commodityRubber.description",
    descriptionEn: "Natural rubber requirements for tire manufacturers and industrial importers.",
    category: "resources.categories.commodity",
    categoryEn: "Commodity Guide",
    readTime: "resources.articles.commodityRubber.readTime",
    readTimeEn: "5 min read",
  },
  {
    to: "/resources/commodity-cattle",
    title: "resources.articles.commodityCattle.title",
    titleEn: "EUDR Cattle & Leather Compliance Guide",
    description: "resources.articles.commodityCattle.description",
    descriptionEn: "Cattle and leather compliance including indirect procurement challenges.",
    category: "resources.categories.commodity",
    categoryEn: "Commodity Guide",
    readTime: "resources.articles.commodityCattle.readTime",
    readTimeEn: "5 min read",
  },
];


function ResourcesPage() {
  const { t } = useTranslation();
  const matches = useRouterState({ select: s => s.matches });
  const isChildRoute = matches.some(m => m.routeId.startsWith("/resources/"));

  if (isChildRoute) {
    return <Outlet />;
  }

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
