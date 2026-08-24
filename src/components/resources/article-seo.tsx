import { Helmet } from "react-helmet-async";
import siteConfig from "~/site.config";

interface ArticleSeoProps {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  category?: string;
  faqItems?: Array<{ question: string; answer: string }>;
}

export function ArticleSeo({ title, description, path, datePublished, dateModified, category, faqItems }: ArticleSeoProps) {
  const url = `${siteConfig.siteUrl}${path}`;
  const fullTitle = `${title} — Antaios Resources`;

  const articleSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished,
    dateModified: dateModified ?? datePublished,
    image: `${siteConfig.siteUrl}${siteConfig.siteImage}`,
    author: {
      "@type": "Person",
      name: "Patricia Konan",
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.siteTitle,
      url: siteConfig.siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.siteUrl}${siteConfig.siteImage}`,
      },
    },
  };

  if (category) {
    articleSchema.articleSection = category;
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Resources", item: `${siteConfig.siteUrl}/resources` },
      { "@type": "ListItem", position: 2, name: title, item: url },
    ],
  };

  const faqSchema = faqItems
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      <meta property="og:image" content={`${siteConfig.siteUrl}${siteConfig.siteImage}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteConfig.siteUrl}${siteConfig.siteImage}`} />
      <link rel="canonical" href={url} />
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
    </Helmet>
  );
}
