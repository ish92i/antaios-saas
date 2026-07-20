import { Helmet } from "react-helmet-async";
import siteConfig from "~/site.config";

interface ArticleSeoProps {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  category?: string;
}

export function ArticleSeo({ title, description, path, datePublished, category }: ArticleSeoProps) {
  const url = `${siteConfig.siteUrl}${path}`;
  const fullTitle = `${title} — Antaios Resources`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished,
    author: {
      "@type": "Organization",
      name: siteConfig.siteTitle,
      url: siteConfig.siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.siteTitle,
      url: siteConfig.siteUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Resources", item: `${siteConfig.siteUrl}/resources` },
      { "@type": "ListItem", position: 2, name: title, item: url },
    ],
  };

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
      <link rel="canonical" href={url} />
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
}
