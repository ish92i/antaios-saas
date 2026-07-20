import { useTranslation } from "react-i18next";
import { Search, MapPin, Scale, Globe, FileText, CheckCircle2, FileCheck } from "lucide-react";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list";
import { FadeIn } from "./fade-in";
import { motion, useReducedMotion } from "motion/react";

const criteria = [
  {
    icon: Search,
    key: "tracability",
    title: "Traçabilité",
    description: "Chaque lot tracé du producteur à l'importateur.",
  },
  {
    icon: MapPin,
    key: "geolocation",
    title: "Géolocalisation",
    description: "GPS des parcelles, carte, export GeoJSON.",
  },
  {
    icon: Scale,
    key: "legality",
    title: "Légalité",
    description: "Permis d'exploitation et conformité aux lois locales.",
  },
  {
    icon: Globe,
    key: "deforestation",
    title: "Déforestation",
    description: "Scan automatique par parcelle avec analyse de risque.",
  },
  {
    icon: FileText,
    key: "attestations",
    title: "Attestations",
    description: "Certifications et déclarations fournisseurs centralisées.",
  },
];

const processSteps = [
  { icon: FileText, key: "traced", label: "Documents de traçabilité vérifiés" },
  { icon: MapPin, key: "gps", label: "Coordonnées GPS validées" },
  { icon: Scale, key: "permits", label: "Permis d'exploitation conforme" },
  { icon: Globe, key: "deforestation_risk", label: "Aucun risque de déforestation détecté" },
  { icon: FileCheck, key: "dds", label: "DDS prête pour génération" },
];

function CriteriaCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl shadow-primary/[0.04]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
      <div className="relative p-6 sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              DOSSIER — 5/5 CRITÈRES
            </span>
            <div className="h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-border">
              <div className="h-full w-full rounded-full bg-emerald-500" />
            </div>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
            conforme
          </span>
        </div>
        <div className="space-y-1.5">
          {criteria.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.key} className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-muted/40">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background shadow-sm transition-shadow group-hover:shadow-md">
                  <Icon className="h-[18px] w-[18px] text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{c.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
                </div>
                <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-emerald-500" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Features() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <section id="features" className="relative overflow-hidden px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[length:24px_24px] [background-image:radial-gradient(circle,var(--border)/0.3_0.5px,transparent_0.5px)]" />

      <div className="relative mx-auto max-w-7xl">
        <FadeIn className="mb-16 sm:mb-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("landing.features.headline", "Les 5 critères de conformité EUDR")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("landing.features.subhead", "Traités automatiquement par Antaios.")}
            </p>
          </div>
        </FadeIn>

        <div className="hidden lg:grid lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <CriteriaCard />
          </motion.div>

          <div className="flex flex-col gap-12">
            {criteria.slice(0, 4).map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.key}
                  initial={reduce ? false : { opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="group flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background shadow-sm transition-shadow group-hover:shadow-md">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="pt-0.5">
                      <h3 className="font-semibold text-foreground">
                        {t(`landing.features.${c.key}.title`, c.title)}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {t(`landing.features.${c.key}.desc`, c.description)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="lg:hidden">
          <motion.div
            className="mb-10"
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <CriteriaCard />
          </motion.div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {criteria.map((c, i) => {
              const Icon = c.icon;
              return (
                <FadeIn key={c.key} delay={i * 0.08}>
                  <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background shadow-sm">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {t(`landing.features.${c.key}.title`, c.title)}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {t(`landing.features.${c.key}.desc`, c.description)}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>

        <FadeIn className="mx-auto mt-24 max-w-lg text-center sm:mt-32">
          <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("landing.features.scoring", "Scoring risque en temps réel")}
          </h3>
          <p className="mt-2 text-muted-foreground">
            {t("landing.features.scoringSub", "Chaque document est analysé automatiquement.")}
          </p>
        </FadeIn>

        <FadeIn className="mx-auto mt-10 max-w-lg">
          <AnimatedList delay={1200}>
            {processSteps.map((step) => (
              <AnimatedListItem key={step.key}>
                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50/50 px-4 py-3 dark:border-green-900 dark:bg-green-950/20">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                  <span className="flex-1 text-sm font-medium">
                    {t(`landing.features.process.${step.key}`, step.label)}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground/60">
                    {t("landing.features.process.justNow", "à l'instant")}
                  </span>
                </div>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        </FadeIn>
      </div>
    </section>
  );
}

export default Features;
