import { useTranslation } from "react-i18next"
import { Upload, FileSearch, Scale, ExternalLink, ScanLine, FileCheck2, Receipt } from "lucide-react"
import { FadeIn } from "./fade-in"

const STAGES = [
  { key: "upload", icon: Upload },
  { key: "extract", icon: FileSearch },
  { key: "resolve", icon: Scale },
  { key: "request", icon: ExternalLink },
  { key: "screen", icon: ScanLine },
  { key: "submit", icon: FileCheck2 },
] as const

export function WorkflowSection() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.05,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[length:24px_24px] [background-image:radial-gradient(circle,var(--border)/0.3_0.5px,transparent_0.5px)]" />

      <div className="relative mx-auto max-w-7xl">
        <FadeIn>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {t("landing.workflow.title", "How It Works")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("landing.workflow.subtitle", "Every shipment follows the same simple workflow.")}
            </p>
          </div>
        </FadeIn>

        <div className="relative">
          {/* Desktop: lg+ horizontal grid */}
          <div className="hidden lg:block">
            <div className="relative grid grid-cols-6 gap-6">
              <div className="absolute inset-x-0 top-[26px] h-[2px] bg-gradient-to-r from-primary/5 via-primary/25 to-primary/5" />
              {STAGES.map((stage, i) => {
                const Icon = stage.icon
                return (
                  <FadeIn key={stage.key} delay={i * 0.08}>
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-primary/20 bg-card shadow-sm">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        {t(`landing.workflow.stages.${stage.key}.label`)}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {t(`landing.workflow.stages.${stage.key}.desc`)}
                      </p>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>

          {/* Mobile: <lg vertical flow */}
          <div className="lg:hidden">
            <div className="relative">
              <div className="absolute bottom-0 left-[27px] top-0 w-[2px] bg-gradient-to-b from-primary/5 via-primary/25 to-primary/5" />
              {STAGES.map((stage, i) => {
                const Icon = stage.icon
                return (
                  <FadeIn key={stage.key} delay={i * 0.08}>
                    <div className="flex pb-12">
                      <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-card shadow-sm">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="ml-4 pt-3">
                        <p className="text-sm font-semibold text-foreground">
                          {t(`landing.workflow.stages.${stage.key}.label`)}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {t(`landing.workflow.stages.${stage.key}.desc`)}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
            <FadeIn delay={0.48}>
              <div className="mt-2 flex items-center gap-3 rounded-lg border-2 border-dashed border-primary/20 bg-card/50 px-5 py-3 shadow-sm backdrop-blur-sm">
                <Receipt className="h-4 w-4 shrink-0 text-primary/70" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("landing.workflow.audit_trail", "Audit Trail — every action recorded automatically")}
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Desktop audit trail - absolute below grid */}
          <div className="absolute -bottom-6 left-0 right-0 hidden lg:block">
            <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-primary/20 bg-card/50 px-5 py-3 shadow-sm backdrop-blur-sm">
              <Receipt className="h-4 w-4 shrink-0 text-primary/70" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("landing.workflow.audit_trail", "Audit Trail — every action recorded automatically")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
