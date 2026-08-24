import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleSeo } from "@/components/resources/article-seo";

export const Route = createFileRoute("/resources/eudr-geolocation")({
  component: EudrGeolocationPage,
  beforeLoad: () => ({
    title: "EUDR Geolocation Requirements — Antaios Resources",
  }),
});



function EudrGeolocationPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ArticleSeo
        title="EUDR Geolocation Requirements: Complete Guide to GPS & Polygon Data"
        description="Understand EUDR geolocation rules: GPS coordinates, polygon requirements, GeoJSON format, the 4-hectare threshold, and how to collect and validate geolocation data for compliance."
        path="/resources/eudr-geolocation"
        datePublished="2024-12-01"
        category="Compliance Guide"
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
              {t("resources.geolocation.category", "Compliance Guide")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("resources.geolocation.readTime", "8 min read")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t(
              "resources.geolocation.title",
              "EUDR Geolocation Requirements: Complete Guide to GPS & Polygon Data",
            )}
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground">
            <p>
                {t(
                  "resources.geolocation.intro",
                  "Geolocation data is one of the most scrutinised elements of an EUDR due-diligence statement. Article 9(1)(d) requires operators to provide the geolocation of every plot of land where a regulated commodity was produced. This guide covers what you need to collect, the formats expected, and how to avoid the most common errors.",
                )}
              </p>

              <h2>
              {t("resources.geolocation.section1.title", "1. What Geolocation Data EUDR Requires")}
            </h2>
            <p>
              {t(
                "resources.geolocation.section1.body",
                "The regulation distinguishes between two types of geolocation data: point coordinates and polygon coordinates. For each plot of land in your supply chain, you must record either a single latitude/longitude pair (for plots up to 4 hectares) or a full polygon (for plots larger than 4 hectares). The coordinates must be provided in WGS 84 format — the same standard used by GPS devices worldwide.",
              )}
            </p>
            <p>
              {t(
                "resources.geolocation.section1.body2",
                "The geolocation must be linked to a specific plot, not a general region or farm name. Each plot gets its own coordinates. If a single farm spans multiple plots, each plot must be identified separately.",
              )}
            </p>

              <h2>
              {t("resources.geolocation.section2.title", "2. Point vs Polygon: The 4-Hectare Threshold")}
            </h2>
            <p>
              {t(
                "resources.geolocation.section2.body",
                "The 4-hectare threshold is the key dividing line. If the production plot is 4 hectares or smaller, a single GPS point (latitude/longitude) is sufficient. If the plot exceeds 4 hectares, you must provide polygon coordinates — a series of points that trace the boundary of the plot.",
              )}
            </p>
            <p>
              <strong>{t("resources.geolocation.section2.point", "Point coordinates:")}</strong>{" "}
              {t(
                "resources.geolocation.section2.pointBody",
                "A single latitude/longitude pair, e.g., 5.6037° N, 0.1870° W. This is the minimum requirement for smallholder plots under 4 hectares.",
              )}
            </p>
            <p>
              <strong>{t("resources.geolocation.section2.polygon", "Polygon coordinates:")}</strong>{" "}
              {t(
                "resources.geolocation.section2.polygonBody",
                "A sequence of at least three latitude/longitude pairs that define the outer boundary of the plot. The first and last points must connect to close the polygon. For irregularly shaped plots, more points are needed to accurately represent the boundary.",
              )}
            </p>
            <p>
              {t(
                "resources.geolocation.section2.tip",
                "When in doubt, collect polygon data even for small plots. It provides stronger evidence of deforestation-free production and simplifies boundary verification against satellite imagery.",
              )}
            </p>

              <h2>
              {t("resources.geolocation.section3.title", "3. WGS84 Coordinate Format and Decimal Precision")}
            </h2>
            <p>
              {t(
                "resources.geolocation.section3.body",
                "All coordinates must use the World Geodetic System 1984 (WGS 84) datum. This is the global standard for GPS and is non-negotiable. Coordinates should be expressed in decimal degrees, not degrees-minutes-seconds (DMS).",
              )}
            </p>
            <p>
              {t(
                "resources.geolocation.section3.precision",
                "Decimal precision matters. Six decimal places give you accuracy to approximately 0.1 metres — more than sufficient for agricultural plots. Most GPS devices and mobile apps record to at least five decimal places (approximately 1 metre accuracy).",
              )}
            </p>

              <div className="overflow-x-auto rounded-lg border border-border">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border bg-muted/50">
        <th className="px-4 py-3 text-left font-medium text-foreground">Decimal Places</th>
        <th className="px-4 py-3 text-left font-medium text-foreground">Accuracy</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-border">
        <td className="px-4 py-3 font-medium text-foreground">2</td>
        <td className="px-4 py-3 text-muted-foreground">~1.1 km</td>
      </tr>
      <tr className="border-b border-border">
        <td className="px-4 py-3 font-medium text-foreground">3</td>
        <td className="px-4 py-3 text-muted-foreground">~111 m</td>
      </tr>
      <tr className="border-b border-border">
        <td className="px-4 py-3 font-medium text-foreground">4</td>
        <td className="px-4 py-3 text-muted-foreground">~11.1 m</td>
      </tr>
      <tr className="border-b border-border">
        <td className="px-4 py-3 font-medium text-foreground">5</td>
        <td className="px-4 py-3 text-muted-foreground">~1.11 m</td>
      </tr>
      <tr className="border-b border-border">
        <td className="px-4 py-3 font-medium text-foreground">6</td>
        <td className="px-4 py-3 text-muted-foreground">~0.11 m</td>
      </tr>
    </tbody>
  </table>
</div>

              <h2>
              {t("resources.geolocation.section4.title", "4. GeoJSON Format Requirements")}
            </h2>
            <p>
              {t(
                "resources.geolocation.section4.body",
                "The EU Information System for due diligence (the ISV) accepts GeoJSON as a standard format for geolocation data. GeoJSON is an open format that represents geographic features as JSON objects. For EUDR purposes, each plot is represented as either a Point feature (for single coordinates) or a Polygon feature (for multi-point boundaries).",
              )}
            </p>
            <p>
              {t(
                "resources.geolocation.section4.example",
                "A typical GeoJSON Point feature for a smallholder plot looks like this: a Feature object with a geometry type of Point and coordinates listed as [longitude, latitude]. Note that GeoJSON uses longitude-first ordering (East, North), which is the reverse of the common latitude/longitude convention.",
              )}
            </p>
            <p>
              {t(
                "resources.geolocation.section4.note",
                "Always verify the coordinate order in any format you submit. Reversed latitude and longitude is one of the most frequent validation errors. Antaios automatically converts and validates coordinate order when you upload geolocation data.",
              )}
            </p>

              <h2>
              {t("resources.geolocation.section5.title", "5. KML and Shapefile Formats")}
            </h2>
            <p>
              {t(
                "resources.geolocation.section5.body",
                "While GeoJSON is the preferred format for the EU Information System, many supply chain actors work with KML (Keyhole Markup Language) or shapefiles (.shp). KML is commonly used in Google Earth, and shapefiles are the standard format for GIS software like ArcGIS and QGIS.",
              )}
            </p>
            <p>
              {t(
                "resources.geolocation.section5.antaios",
                "Antaios handles the conversion for you. Upload KML, shapefiles, or GeoJSON directly through the platform and we will normalise the data into the correct format for your due-diligence statement. The platform also validates coordinate ranges, detects coordinate order issues, and flags plots that may exceed the 4-hectare polygon threshold.",
              )}
            </p>

              <h2>
              {t("resources.geolocation.section6.title", "6. Collecting GPS Data in the Field")}
            </h2>
            <p>
              {t(
                "resources.geolocation.section6.body",
                "The most reliable GPS data comes from purpose-built field collection apps or dedicated GPS devices. Smartphone GPS apps are generally accurate enough for EUDR compliance, provided they record in WGS 84 and support decimal degree output. Dedicated handheld GPS units (e.g., Garmin, Trimble) offer higher precision, which is valuable for large plots.",
              )}
            </p>
            <p>
              <strong>{t("resources.geolocation.section6.best", "Best practices for field collection:")}</strong>
            </p>
            <ul>
              <li>
                {t(
                  "resources.geolocation.section6.bp1",
                  "Record coordinates at the plot boundary, not at the centre — this is especially important for polygon data",
                )}
              </li>
              <li>
                {t(
                  "resources.geolocation.section6.bp2",
                  "Allow the GPS to settle for at least 30 seconds before capturing coordinates to reduce signal drift",
                )}
              </li>
              <li>
                {t(
                  "resources.geolocation.section6.bp3",
                  "Collect multiple points at the same location and average them for higher accuracy",
                )}
              </li>
              <li>
                {t(
                  "resources.geolocation.section6.bp4",
                  "Tag each collection with the date, collector name, and plot identifier",
                )}
              </li>
            </ul>

              <h2>
              {t("resources.geolocation.section7.title", "7. Working with Smallholders and Cooperatives")}
            </h2>
            <p>
              {t(
                "resources.geolocation.section7.body",
                "Collecting geolocation data from smallholder farmers presents practical challenges. Many farmers may not own GPS devices or have experience with digital tools. Cooperatives and field officers play a critical role as intermediaries.",
              )}
            </p>
            <p>
              {t(
                "resources.geolocation.section7.strategy",
                "A proven strategy is to train field officers on GPS collection methods and provide them with simple mobile apps (GPS Essentials, Avenza Maps, or custom solutions). Field officers visit each farmer, walk the plot boundary, and record coordinates on behalf of the farmer. This approach scales well and produces consistent, high-quality data.",
              )}
            </p>
            <p>
              {t(
                "resources.geolocation.section7.cooptip",
                "For cooperatives with many small plots, consider batch collection campaigns. Dedicate field teams to a region and collect data from all members in a single pass. This reduces per-plot cost and ensures uniform data quality across the cooperative.",
              )}
            </p>

              <h2>
              {t("resources.geolocation.section8.title", "8. Common Geolocation Errors and How to Fix Them")}
            </h2>
            <p>
              {t(
                "resources.geolocation.section8.body",
                "Auditors and the EU Information System flag the same errors repeatedly. Avoiding these pitfalls saves time and reduces the risk of DDS rejection.",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.geolocation.section8.err1",
                  "Coordinates outside the reported country of origin — this often happens when data is copied from a spreadsheet and pasted in the wrong order",
                )}
              </li>
              <li>
                {t(
                  "resources.geolocation.section8.err2",
                  "Missing closing vertex in polygon data — a polygon must have its first and last points identical to form a closed shape",
                )}
              </li>
              <li>
                {t(
                  "resources.geolocation.section8.err3",
                  "Self-intersecting polygons — when boundary lines cross each other, the polygon is invalid. Walk the boundary in one direction to avoid this",
                )}
              </li>
              <li>
                {t(
                  "resources.geolocation.section8.err4",
                  "Using latitude/longitude instead of longitude/latitude in GeoJSON — GeoJSON requires [lon, lat] order, not [lat, lon]",
                )}
              </li>
              <li>
                {t(
                  "resources.geolocation.section8.err5",
                  "Point coordinates for plots that clearly exceed 4 hectares — if a single point is provided for a large plot, the system will reject it",
                )}
              </li>
            </ul>

              <h2>
              {t("resources.geolocation.section9.title", "9. How to Validate Your Geolocation Data")}
            </h2>
            <p>
              {t(
                "resources.geolocation.section9.body",
                "Before submitting your due-diligence statement, validate your geolocation data against these criteria:",
              )}
            </p>
            <ul>
              <li>
                {t(
                  "resources.geolocation.section9.v1",
                  "All coordinates fall within the reported country's bounding box",
                )}
              </li>
              <li>
                {t(
                  "resources.geolocation.section9.v2",
                  "Polygon features have at least three vertices and a closed boundary",
                )}
              </li>
              <li>
                {t(
                  "resources.geolocation.section9.v3",
                  "Coordinate format is WGS 84 decimal degrees",
                )}
              </li>
              <li>
                {t(
                  "resources.geolocation.section9.v4",
                  "Each plot has a unique identifier linking it to supply chain records",
                )}
              </li>
              <li>
                {t(
                  "resources.geolocation.section9.v5",
                  "Polygon area calculation matches the declared plot size (within acceptable tolerance)",
                )}
              </li>
            </ul>
            <p>
              {t(
                "resources.geolocation.section9.automatic",
                "Antaios runs these validations automatically when you upload geolocation data. The platform highlights any issues before you finalise your DDS, giving you time to correct problems.",
              )}
            </p>

              <h2>
              {t("resources.geolocation.section10.title", "10. Integration with Global Forest Watch")}
            </h2>
            <p>
              {t(
                "resources.geolocation.section10.body",
                "EUDR compliance requires you to verify that no deforestation occurred on your production plots after the cut-off date (31 December 2020). Geolocation data is the link between your supply chain and satellite deforestation monitoring. Platforms like Global Forest Watch (GFW) use geolocation coordinates to run deforestation alerts against your specific plots.",
              )}
            </p>
            <p>
              {t(
                "resources.geolocation.section10.antaios",
                "Antaios integrates directly with GFW data. When you upload polygon coordinates, the platform automatically checks for deforestation alerts within your plot boundaries and flags any potential risks. This turns what would be hours of manual cross-referencing into an automated step in your compliance workflow.",
              )}
            </p>

              <h3>
              {t("resources.geolocation.conclusion.title", "Key Takeaways")}
            </h3>
            <p>
              {t(
                "resources.geolocation.conclusion.body",
                "Geolocation data is not just a checkbox — it is the foundation of EUDR deforestation-free verification. Collect coordinates in WGS 84 decimal degrees, use polygons for any plot over 4 hectares, validate before submission, and leverage automation where possible. Getting this right the first time saves significant effort during audits and avoids costly resubmissions.",
              )}
            </p>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {t(
                "resources.geolocation.cta.title",
                "Need help collecting geolocation data?",
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(
                "resources.geolocation.cta.desc",
                "Use our free tool to check your EUDR readiness. Upload your geolocation data and get instant validation.",
              )}
            </p>
            <div className="mt-6">
              <Link to="/free-tool">
                <Button variant="default" size="lg">
                  {t("resources.geolocation.cta.button", "Take the free diagnostic")}
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
