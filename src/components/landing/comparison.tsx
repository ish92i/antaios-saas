import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { FadeIn } from "./fade-in"

interface CellData {
  value: string
  highlight?: boolean
}

const competitors = [
  { key: "manual", label: "Manuel", isAntaios: false },
  { key: "eudrready", label: "EUDRReady", isAntaios: false },
  { key: "coolset", label: "Coolset", isAntaios: false },
  { key: "osapiens", label: "osapiens", isAntaios: false },
  { key: "antaios", label: "Antaios", isAntaios: true },
] as const

const rows = [
  { key: "price", label: "Prix" },
  { key: "setup", label: "Mise en route" },
  { key: "coverage", label: "Conformité complète" },
  { key: "access", label: "Accès" },
  { key: "transparency", label: "Transparence tarifaire" },
] as const

const cells: Record<string, Record<string, CellData>> = {
  price: {
    manual: { value: "Gratuit (coût caché : temps)" },
    eudrready: { value: "Gratuit – 79 €/mois" },
    coolset: { value: "~6 000 – 12 000+ €/an" },
    osapiens: { value: "Sur devis" },
    antaios: { value: "500 €/mois", highlight: true },
  },
  setup: {
    manual: { value: "Immédiat" },
    eudrready: { value: "~20 min" },
    coolset: { value: "4 semaines" },
    osapiens: { value: "Plusieurs semaines" },
    antaios: { value: "Un après-midi", highlight: true },
  },
  coverage: {
    manual: { value: "Non" },
    eudrready: { value: "Hors périmètre" },
    coolset: { value: "Oui" },
    osapiens: { value: "Oui" },
    antaios: { value: "Oui", highlight: true },
  },
  access: {
    manual: { value: "N/A" },
    eudrready: { value: "Self-serve" },
    coolset: { value: "Sur rendez-vous" },
    osapiens: { value: "Sur rendez-vous" },
    antaios: { value: "Self-serve", highlight: true },
  },
  transparency: {
    manual: { value: "N/A" },
    eudrready: { value: "Publié" },
    coolset: { value: "Modulaire" },
    osapiens: { value: "Non publié" },
    antaios: { value: "Publié", highlight: true },
  },
}

export function Comparison() {
  const { t } = useTranslation()

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("landing.comparison.headline", "Antaios face aux alternatives")}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            {t(
              "landing.comparison.sub",
              "Comparaison transparente. Pas de spin, pas de surprises.",
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
              "EUDRReady cible les revendeurs (obligation allégée). Antaios, Coolset et osapiens ciblent les opérateurs importateurs (due diligence complète).",
            )}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
