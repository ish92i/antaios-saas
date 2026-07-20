import { useTranslation } from "react-i18next"
import { useReducedMotion, motion } from "motion/react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
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
  )
}

export function FinalCta() {
  const { t } = useTranslation()

  return (
    <section className="bg-gradient-to-b from-background to-primary/5 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <FadeIn>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("landing.finalCta.title", "Prêt avant l'échéance ?")}
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {t(
              "landing.finalCta.subtitle",
              "2 minutes, sans email, sans engagement.",
            )}
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="mt-8 flex flex-col items-center gap-4">
          <Link to="/free-tool">
            <Button variant="default" size="lg">
              {t(
                "landing.finalCta.primaryCta",
                "Vérifiez votre conformité — c'est gratuit",
              )}
            </Button>
          </Link>
          <Link
            to="/login"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            {t("landing.finalCta.secondaryCta", "Ou créez votre compte →")}
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
