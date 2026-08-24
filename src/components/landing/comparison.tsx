import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { FadeIn } from "./fade-in"

interface CellData {
  value: string
  highlight?: boolean
}

const competitors = [
  { key: "plotvera", label: "plotvera", isAntaios: false },
  { key: "traceplot", label: "TracePlot", isAntaios: false },
  { key: "clearlane", label: "clearlane", isAntaios: false },
  { key: "eudrready", label: "EUDRReady", isAntaios: false },
  { key: "antaios", label: "Antaios", isAntaios: true },
] as const

const rows = [
  { key: "price", label: "Monthly cost" },
  { key: "setup", label: "Time to get started" },
  { key: "supplier_portal", label: "Supplier self-service portal" },
  { key: "doc_ingestion", label: "Document upload & auto-extraction" },
  { key: "plots", label: "Plot / farm limit" },
  { key: "full_compliance", label: "Full operator due diligence" },
  { key: "pdf_report", label: "PDF compliance report" },
  { key: "access", label: "Self-serve vs sales call" },
] as const

const cells: Record<string, Record<string, CellData>> = {
  price: {
    plotvera: { value: "€99/mo (Pro)" },
    traceplot: { value: "from €59/mo" },
    clearlane: { value: "€149/mo" },
    eudrready: { value: "Free – €79/mo" },
    antaios: { value: "€500/mo", highlight: true },
  },
  setup: {
    plotvera: { value: "Self-serve" },
    traceplot: { value: "Self-serve" },
    clearlane: { value: "Self-serve" },
    eudrready: { value: "Self-serve" },
    antaios: { value: "Self-serve", highlight: true },
  },
  supplier_portal: {
    plotvera: { value: "Yes" },
    traceplot: { value: "Yes" },
    clearlane: { value: "Yes" },
    eudrready: { value: "No" },
    antaios: { value: "Yes — no account needed", highlight: true },
  },
  doc_ingestion: {
    plotvera: { value: "No" },
    traceplot: { value: "Limited" },
    clearlane: { value: "GeoJSON only" },
    eudrready: { value: "No" },
    antaios: { value: "PDF, Excel, images, GeoJSON", highlight: true },
  },
  plots: {
    plotvera: { value: "500 (fair use)" },
    traceplot: { value: "Included" },
    clearlane: { value: "Included" },
    eudrready: { value: "N/A" },
    antaios: { value: "Unlimited", highlight: true },
  },
  full_compliance: {
    plotvera: { value: "No — plot screening only" },
    traceplot: { value: "Partial" },
    clearlane: { value: "No — evidence only" },
    eudrready: { value: "No — traders only" },
    antaios: { value: "Yes — full operator DDS", highlight: true },
  },
  pdf_report: {
    plotvera: { value: "No" },
    traceplot: { value: "No" },
    clearlane: { value: "No" },
    eudrready: { value: "No" },
    antaios: { value: "Yes", highlight: true },
  },
  access: {
    plotvera: { value: "Self-serve" },
    traceplot: { value: "Self-serve" },
    clearlane: { value: "Self-serve" },
    eudrready: { value: "Self-serve" },
    antaios: { value: "Self-serve", highlight: true },
  },
}

export function Comparison() {
  const { t } = useTranslation()

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("landing.comparison.headline", "Antaios vs the alternatives")}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            {t(
              "landing.comparison.sub",
              "Transparent comparison. No spin, no surprises.",
            )}
          </p>
        </FadeIn>

        <FadeIn>
          <div className="overflow-x-auto rounded-xl border shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-[160px] border-r px-5 py-4 font-semibold text-muted-foreground">
                    {t("landing.comparison.col.solution", "Solution")}
                  </th>
                  {competitors.map((c, i) => (
                    <th
                      key={c.key}
                      className={cn(
                        "px-5 py-4 font-semibold",
                        i < competitors.length - 1 && "border-r",
                        c.isAntaios
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {t(`landing.comparison.col.${c.key}`, c.label)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className="border-b last:border-b-0 transition-colors"
                  >
                    <td className="border-r px-5 py-4 font-medium text-muted-foreground">
                      {t(`landing.comparison.row.${row.key}`, row.label)}
                    </td>
                    {competitors.map((c, i) => {
                      const cell = cells[row.key][c.key]
                      return (
                        <td
                          key={c.key}
                          className={cn(
                            "px-5 py-4",
                            i < competitors.length - 1 && "border-r",
                            c.isAntaios && "bg-primary/[0.03]",
                            cell.highlight && "font-semibold text-foreground",
                            !cell.highlight && "text-muted-foreground",
                          )}
                        >
                          {t(
                            `landing.comparison.cell.${row.key}.${c.key}`,
                            cell.value,
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t(
              "landing.comparison.note",
              "EUDRReady targets traders (lighter obligations). Plotvera and TracePlot focus on plot screening and supplier intake. Clearlane handles evidence. Antaios covers the full operator workflow — from document ingestion through supplier data collection to DDS filing.",
            )}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
