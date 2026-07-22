import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { Check, Clock, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "./fade-in";

const benefits = [
  { key: "legal", icon: Shield },
  { key: "instant", icon: Clock },
  { key: "free", icon: Check },
] as const;

export function FreeToolConviction() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.04,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[length:24px_24px] [background-image:radial-gradient(circle,var(--border)/0.3_0.5px,transparent_0.5px)]" />
      <div className="pointer-events-none absolute -left-48 top-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-48 top-2/3 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-5 flex justify-center">
            <Badge
              variant="secondary"
              className="border-amber-500/30 bg-amber-50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-amber-700 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-300"
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              {t("landing.freeTool.badge", "Diagnostic gratuit — 2 minutes")}
            </Badge>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t(
              "landing.freeTool.headline",
              "La deadline EUDR approche. Savez-vous où vous en êtes ?",
            )}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            {t(
              "landing.freeTool.sub",
              "Répondez à 8 questions basées sur les 5 critères Article 10(2) et obtenez votre niveau de risque personnalisé, vos lacunes, et les actions prioritaires — en 2 minutes, sans inscription.",
            )}
          </p>
        </FadeIn>

        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <FadeIn className="flex flex-col gap-8">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={b.key} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card shadow-sm">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t(`landing.freeTool.benefits.${b.key}.title`)}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {t(`landing.freeTool.benefits.${b.key}.desc`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </FadeIn>

          <FadeIn delay={0.15}>
            <motion.div
              className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl shadow-amber-500/5"
              whileHover={reduce ? undefined : { scale: 1.02, y: -2 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="border-b border-border/40 bg-gradient-to-r from-amber-50/50 to-transparent px-6 py-3 dark:from-amber-950/20">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("landing.freeTool.mock.badge", "Votre résultat")}
                </p>
              </div>
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t("landing.freeTool.mock.deadlineLabel", "Deadline applicable")}
                  </p>
                  <Badge
                    variant="outline"
                    className="border-red-200 bg-red-50 px-2 py-0.5 font-mono text-[11px] text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                  >
                    {t("landing.freeTool.mock.deadline", "30 Déc 2026")}
                  </Badge>
                </div>

                <div className="mb-5 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((dot) => (
                      <div
                        key={dot}
                        className={`h-2.5 w-2.5 rounded-full ${
                          dot < 3
                            ? "bg-amber-500"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                    {t("landing.freeTool.mock.tier", "Risque moyen")}
                  </span>
                </div>

                <div className="mb-5 space-y-2">
                  {[
                    { key: "traceability", label: t("landing.freeTool.mock.criteria.traceability", "Traçabilité"), pass: false },
                    { key: "geolocation", label: t("landing.freeTool.mock.criteria.geolocation", "Géolocalisation"), pass: false },
                    { key: "dueDiligence", label: t("landing.freeTool.mock.criteria.dueDiligence", "Documentation due diligence"), pass: true },
                    { key: "attestations", label: t("landing.freeTool.mock.criteria.attestations", "Attestations fournisseur"), pass: false },
                    { key: "legality", label: t("landing.freeTool.mock.criteria.legality", "Conformité légale pays d'origine"), pass: true },
                  ].map((c) => (
                    <div key={c.key} className="flex items-center gap-2">
                      {c.pass ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-amber-400/60" />
                      )}
                      <span className={`text-xs ${c.pass ? "text-emerald-600" : "text-amber-700"}`}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-950/20">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    {t(
                      "landing.freeTool.mock.nextAction",
                      "3 critères à traiter en priorité avant la deadline.",
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          </FadeIn>
        </div>

        <FadeIn delay={0.25} className="mt-12 flex flex-col items-center gap-4">
          <Link to="/free-tool">
            <Button
              variant="default"
              size="lg"
              className="w-full gap-2 rounded-full px-8 py-4 text-base sm:w-auto"
            >
              {t("landing.freeTool.cta", "Vérifier ma conformité — c'est gratuit")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            {t("landing.freeTool.socialProof", "Conforme à l'Article 10(2), Règlement UE 2023/1115")}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
