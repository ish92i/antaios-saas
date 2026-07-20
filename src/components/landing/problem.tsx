import { useTranslation } from "react-i18next"
import { FileText, FolderOpen, Clock, AlertTriangle } from "lucide-react"
import { FadeIn } from "./fade-in"

const pains = [
  {
    icon: FileText,
    key: "manual",
    title: "DDS à faire à la main",
    desc: "Des heures à assembler PDF, emails et classeurs pour un seul dossier.",
  },
  {
    icon: FolderOpen,
    key: "scattered",
    title: "Sources dispersées",
    desc: "Traçabilité, géolocalisation, légalité — chaque critère vit dans son silo.",
  },
  {
    icon: Clock,
    key: "deadlines",
    title: "Échéance dans 6 mois",
    desc: "30 déc. 2026 pour les grandes entreprises. 30 juin 2027 pour les PME.",
  },
  {
    icon: AlertTriangle,
    key: "risk",
    title: "Conformité aveugle",
    desc: "Sans audit structuré, impossible de savoir si vous êtes conforme avant le premier contrôle.",
  },
]

function monthsUntil(target: Date) {
  const now = new Date()
  const totalMonths =
    (target.getFullYear() - now.getFullYear()) * 12 +
    target.getMonth() -
    now.getMonth()
  const remainderDays = target.getDate() - now.getDate()
  if (remainderDays < -15) return totalMonths
  if (remainderDays > 15) return totalMonths + 1
  return totalMonths
}

export function Problem() {
  const { t } = useTranslation()
  const remaining = monthsUntil(new Date("2026-12-30T23:59:59"))

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--primary)/0.06,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[length:24px_24px] [background-image:radial-gradient(circle,var(--border)/0.3_0.5px,transparent_0.5px)]" />

      <div className="relative mx-auto max-w-7xl">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t(
              "landing.problem.title",
              "L'EUDR ne pardonne pas l'improvisation",
            )}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {t(
              "landing.problem.subtitle",
              "Sans outil dédié, chaque lot est une course contre la montre.",
            )}
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-6">
            {pains.slice(0, 2).map((pain, i) => {
              const Icon = pain.icon
              return (
                <FadeIn key={pain.key} delay={i * 0.1}>
                  <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md">
                    <div className="p-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background transition-colors group-hover:border-primary/30 group-hover:bg-primary/[0.03]">
                        <Icon className="h-5 w-5 text-primary/70" />
                      </div>
                      <h3 className="mt-4 font-semibold text-foreground">
                        {t(`landing.problem.${pain.key}.title`, pain.title)}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {t(`landing.problem.${pain.key}.desc`, pain.desc)}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>

          <FadeIn delay={0.2} className="flex">
            <div className="relative flex w-full flex-col overflow-hidden rounded-xl border border-red-200/70 bg-gradient-to-b from-red-50/80 to-red-50/30 shadow-sm dark:border-red-900/40 dark:from-red-950/20 dark:to-red-950/10">
              <div className="relative flex flex-1 flex-col p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-widest text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                    </span>
                    {t("landing.problem.urgent", "Urgent")}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {t(`landing.problem.${pains[2].key}.title`, pains[2].title)}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`landing.problem.${pains[2].key}.desc`, pains[2].desc)}
                </p>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center gap-2.5 rounded-lg border border-red-200/50 bg-white/60 px-3.5 py-2 dark:border-red-900/30 dark:bg-red-950/20">
                    <span className="flex h-6 w-6 items-center justify-center rounded border border-red-200/50 bg-red-50 text-[10px] font-bold text-red-600 dark:border-red-900/30 dark:bg-red-950/40 dark:text-red-400">
                      1
                    </span>
                    <span className="flex-1 text-xs text-muted-foreground">
                      {t("landing.problem.deadlines.large", "Grandes entreprises")}
                    </span>
                    <span className="font-mono text-xs font-semibold text-red-600 dark:text-red-400">
                      30 déc. 2026
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg border border-amber-200/50 bg-white/60 px-3.5 py-2 dark:border-amber-900/30 dark:bg-amber-950/20">
                    <span className="flex h-6 w-6 items-center justify-center rounded border border-amber-200/50 bg-amber-50 text-[10px] font-bold text-amber-600 dark:border-amber-900/30 dark:bg-amber-950/40 dark:text-amber-400">
                      2
                    </span>
                    <span className="flex-1 text-xs text-muted-foreground">
                      {t("landing.problem.deadlines.small", "PME & micro-entreprises")}
                    </span>
                    <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                      30 juin 2027
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-100/60 px-4 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    {t("landing.problem.deadlines.countdown", "{{count}} mois restants — préparez-vous dès maintenant", { count: remaining })}
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.15} className="mt-6">
          <div className="group relative overflow-hidden rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/60 to-transparent shadow-sm dark:border-amber-900/30 dark:from-amber-950/15">
            <div className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">
                  {t(`landing.problem.${pains[3].key}.title`, pains[3].title)}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`landing.problem.${pains[3].key}.desc`, pains[3].desc)}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
