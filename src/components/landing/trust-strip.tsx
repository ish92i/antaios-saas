import { useTranslation } from "react-i18next"
import { useReducedMotion, motion } from "motion/react"
import { Scale, Shield, FileCheck, Globe, BookCheck } from "lucide-react"
import { Marquee } from "@/components/ui/marquee"
import { cn } from "@/lib/utils"

const badges = [
  { icon: Scale, key: "article10", label: "Conforme Article 10(2)" },
  { icon: Shield, key: "regulation", label: "Règlement EU 2023/1115" },
  { icon: FileCheck, key: "criteria", label: "5 critères de due diligence" },
  { icon: BookCheck, key: "referential", label: "Basé sur le référentiel officiel" },
  { icon: Globe, key: "commission", label: "Commission européenne" },
]

export function TrustStrip() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <section className="border-y border-border/40 px-6 py-4">
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-7xl"
      >
        <Marquee
          repeat={reduce ? 1 : 4}
          className={cn("[--duration:60s]", reduce && "overflow-visible")}
        >
          {badges.map((badge) => {
            const Icon = badge.icon
            return (
              <div
                key={badge.key}
                className="flex shrink-0 items-center gap-2 rounded-full border border-border/50 bg-background px-4 py-1.5"
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap">
                  {t(`landing.trustStrip.${badge.key}`, badge.label)}
                </span>
              </div>
            )
          })}
        </Marquee>
      </motion.div>
    </section>
  )
}
