import { useTranslation } from "react-i18next"
import { CalendarDays, AlertTriangle, Building2, Store } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { FadeIn } from "./fade-in"

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

const deadlines = [
  {
    key: "large",
    icon: Building2,
    title: "Grandes et moyennes entreprises",
    date: new Date("2026-12-30T23:59:59"),
    dateLabel: "30 décembre 2026",
    variant: "red" as const,
  },
  {
    key: "small",
    icon: Store,
    title: "Petites et micro entreprises",
    date: new Date("2027-06-30T23:59:59"),
    dateLabel: "30 juin 2027",
    variant: "amber" as const,
  },
]

export function Deadline() {
  const { t } = useTranslation()

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("landing.deadline.headline", "Les échéances qui vous concernent")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t(
              "landing.deadline.subhead",
              "Le règlement EUDR s'applique selon la taille de votre entreprise.",
            )}
          </p>
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-2">
          {deadlines.map((d) => {
            const Icon = d.icon
            const remaining = monthsUntil(d.date)
            return (
              <FadeIn key={d.key} delay={d.key === "large" ? 0 : 0.15}>
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl border bg-card p-8 shadow-lg",
                    d.variant === "red"
                      ? "border-red-200/60 dark:border-red-900/50"
                      : "border-amber-200/60 dark:border-amber-900/50",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex shrink-0 items-center justify-center rounded-xl p-3",
                        d.variant === "red"
                          ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400"
                          : "bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400",
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold">
                        {t(`landing.deadline.${d.key}.title`, d.title)}
                      </h3>
                      <p
                        className={cn(
                          "mt-1 text-3xl font-bold tracking-tight",
                          d.variant === "red"
                            ? "text-red-600 dark:text-red-400"
                            : "text-amber-600 dark:text-amber-400",
                        )}
                      >
                        {t(`landing.deadline.${d.key}.date`, d.dateLabel)}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          {t("landing.deadline.monthsRemaining", "{{count}} mois restants", {
                            count: remaining,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "mt-6 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm",
                      d.variant === "red"
                        ? "border-red-200/50 bg-red-50/30 text-red-700 dark:border-red-900/40 dark:bg-red-950/10 dark:text-red-300"
                        : "border-amber-200/50 bg-amber-50/30 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/10 dark:text-amber-300",
                    )}
                  >
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    <span>
                      {t(
                        `landing.deadline.${d.key}.note`,
                        d.variant === "red"
                          ? "Date limite pour les entreprises de plus de 250 salariés ou 50M€ de chiffre d'affaires."
                          : "Date limite pour les entreprises de moins de 250 salariés et 50M€ de chiffre d'affaires.",
                      )}
                    </span>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>

        <FadeIn delay={0.3} className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            <Link
              to="/free-tool"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {t(
                "landing.deadline.cta",
                "Vous ne savez pas si vous êtes concerné ? Faites le diagnostic gratuit →",
              )}
            </Link>
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
