import { useTranslation } from "react-i18next"
import { AlertTriangle, ArrowRight, Check, FileCheck2, FileText, Mail, MapPin, ScanLine, ShieldCheck } from "lucide-react"
import { FadeIn } from "./fade-in"

const checklistRows = [
  { label: "Exportateur / Produit", status: "check" as const },
  { label: "Parcelle / Géolocalisation", status: "check" as const },
  { label: "Conformité / Légalité", status: "check" as const },
  { label: "Droits & Légalité", status: "current" as const },
  { label: "Traçabilité", status: "pending" as const },
]

const sourceCards = [
  { icon: FileText, label: "PDF fournisseur", detail: "Factures, BL, certificats" },
  { icon: Mail, label: "Emails", detail: "Demandes et pièces jointes" },
  { icon: MapPin, label: "Parcelles", detail: "Coordonnées et GeoJSON" },
]

export function ProblemSolution() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.05,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[length:24px_24px] [background-image:radial-gradient(circle,var(--border)/0.3_0.5px,transparent_0.5px)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 grid gap-8 md:grid-cols-2 md:gap-16">
          <FadeIn>
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200/60 bg-red-50/50 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-red-600">
                Problème
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {t("landing.problem.solution.problem_title", "Chaque expédition, une course contre la montre")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {t("landing.problem.solution.problem_desc", "Documents éparpillés, sources disparates, échéance qui approche.")}
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="text-center md:text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200/60 bg-green-50/50 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-green-600">
                Solution
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {t("landing.problem.solution.solution_title", "Un dossier, généré automatiquement")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {t("landing.problem.solution.solution_desc", "Antaios centralise, vérifie et génère votre DDS en un clic.")}
              </p>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} y={24}>
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur-sm md:p-6 lg:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,var(--primary)/0.09,transparent_34%)]" />
            <div className="relative grid items-center gap-4 lg:grid-cols-[1fr_auto_1.05fr_auto_1.2fr] lg:gap-5">
              <div className="rounded-xl border border-red-200/60 bg-red-50/50 p-4 dark:border-red-900/35 dark:bg-red-950/15">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
                    Entrées dispersées
                  </span>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <div className="mt-4 space-y-3">
                  {sourceCards.map((source) => {
                    const Icon = source.icon
                    return (
                      <div key={source.label} className="flex items-center gap-3 rounded-lg border border-red-100 bg-white/75 p-3 shadow-sm dark:border-red-900/30 dark:bg-background/40">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{source.label}</p>
                          <p className="text-xs text-muted-foreground">{source.detail}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 rounded-lg border border-red-200/70 bg-white/70 px-3 py-2 font-mono text-[11px] font-semibold text-red-600 dark:border-red-900/40 dark:bg-background/30 dark:text-red-400">
                  Échéance : 30 déc. 2026
                </div>
              </div>

              <div className="hidden items-center lg:flex">
                <ArrowRight className="h-5 w-5 text-muted-foreground/60" />
              </div>

              <div className="relative rounded-xl border border-primary/20 bg-background p-4 shadow-sm">
                <div className="absolute -top-2 left-5 rounded-full border border-primary/20 bg-background px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Antaios
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3 rounded-lg bg-primary/[0.06] p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <ScanLine className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Lit et structure</p>
                      <p className="text-xs text-muted-foreground">OCR, extraction et rapprochement des preuves.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-primary/[0.06] p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Vérifie les risques</p>
                      <p className="text-xs text-muted-foreground">Traçabilité, légalité et géolocalisation.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden items-center lg:flex">
                <ArrowRight className="h-5 w-5 text-primary/70" />
              </div>

              <div className="overflow-hidden rounded-xl border border-border/70 bg-white shadow-sm dark:bg-background">
                <div className="flex items-center justify-between border-b border-border/70 bg-primary/[0.04] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Dossier de conformité</p>
                      <p className="text-xs text-muted-foreground">Prêt pour dépôt DDS</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-green-300 bg-green-100 px-3 py-1 font-mono text-[10px] font-semibold text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
                    CONFORME
                  </span>
                </div>

                <div className="space-y-3 p-5">
                  {checklistRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          row.status === "pending"
                            ? "border border-muted-foreground/25 text-muted-foreground"
                            : row.status === "current"
                              ? "bg-primary text-primary-foreground"
                              : "bg-green-600 text-white"
                        }`}>
                          {row.status === "check" ? <Check className="h-3.5 w-3.5" /> : null}
                          {row.status === "current" ? <span className="text-[10px] font-bold">4</span> : null}
                        </div>
                        <span className="truncate text-sm text-foreground">{row.label}</span>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold ${
                        row.status === "pending"
                          ? "bg-muted text-muted-foreground"
                          : row.status === "current"
                            ? "bg-primary/10 text-primary"
                            : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                      }`}>
                        {row.status === "check" ? "OK" : row.status === "current" ? "EN COURS" : "EN ATTENTE"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-5 pb-5">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[78%] rounded-full bg-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
