import { useTranslation } from "react-i18next";
import { useReducedMotion, motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  { key: "unlimited", label: "Envois illimités" },
  { key: "criteria", label: "5 critères Article 10(2)" },
  { key: "export", label: "Export DDS TRACES" },
  { key: "audit", label: "Piste d'audit 5 ans" },
  { key: "scan", label: "Scan déforestation automatique" },
  { key: "supplier", label: "Portail fournisseur" },
  { key: "import", label: "Import multi-format (PDF, Excel, images, GeoJSON)" },
  { key: "report", label: "Rapport de conformité PDF" },
  { key: "support", label: "Support email" },
  { key: "onboarding", label: "Onboarding en 1 après-midi" },
];

export function Pricing() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <section
      id="pricing"
      className="relative overflow-hidden px-6 py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-primary/[0.01] to-transparent" />
      <div className="pointer-events-none absolute -left-48 top-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-48 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("landing.pricing.title", "Un prix unique, tout inclus")}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            {t("landing.pricing.sub", "Forfait mensuel unique. Sans frais cachés, sans engagement.")}
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mx-auto max-w-4xl">
          <motion.div
            className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-xl shadow-primary/5"
            whileHover={reduce ? undefined : { scale: 1.01 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative flex flex-col items-center border-b border-border/30 bg-gradient-to-b from-primary/[0.03] to-transparent p-8 md:basis-2/5 md:border-b-0 md:border-r md:p-10">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-2xl font-semibold text-foreground">
                    Antaios Direct
                  </h3>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {t("landing.pricing.forLabel", "Pour importateurs et metteurs sur le marché")}
                </p>

                <div className="mt-8 text-center">
                  <span className="text-3xl font-bold tracking-tight text-foreground">
                    {t("landing.pricing.price", "500 €/mois")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("landing.pricing.annual", "5 000 €/an — soit 2 mois offerts")}
                </p>

                <div className="mt-8 flex w-full flex-col gap-3">
                  <Link to="/free-tool" className="w-full">
                    <Button variant="default" size="lg" className="w-full rounded-full">
                      {t("landing.pricing.cta", "Commencer")}
                    </Button>
                  </Link>
                  <a href="mailto:demo@antaios.app" className="w-full">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full border-foreground/20"
                    >
                      {t("landing.pricing.demo", "Réserver une démo")}
                    </Button>
                  </a>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                  {t("landing.pricing.noCommitment", "Sans engagement. Résiliable à tout moment.")}
                </p>
              </div>

              <div className="flex flex-col p-8 md:basis-3/5 md:p-10">
                <h4 className="mb-1 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {t("landing.pricing.includes", "Tout inclus")}
                </h4>
                <p className="mb-6 text-sm text-muted-foreground">
                  {t("landing.pricing.includesDesc", "Pas de modules optionnels, pas de surprises.")}
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((f) => (
                    <div key={f.key} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">
                        {t(`landing.pricing.features.${f.key}`, f.label)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}

export default Pricing;
