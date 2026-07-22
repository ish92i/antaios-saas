import { useTranslation } from "react-i18next"
import { useReducedMotion, motion } from "motion/react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

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

const faqs = [
  {
    key: "deposit",
    q: "Est-ce que je dois quand même déposer la DDS moi-même ?",
    a: "Oui, le dépôt sur TRACES reste de votre responsabilité. Antaios génère la DDS complète et conforme que vous déposez en quelques clics.",
  },
  {
    key: "hosting",
    q: "Mes données sont-elles hébergées en Europe ?",
    a: "Oui, toutes vos données sont stockées sur des serveurs situés en Union européenne, conformément au RGPD.",
  },
  {
    key: "retention",
    q: "Que se passe-t-il après les 5 ans de rétention ?",
    a: "La réglementation exige 5 ans de conservation. Après cette période, vous pouvez exporter vos archives ou nous demander leur suppression.",
  },
  {
    key: "comparison",
    q: "Quelle est la différence avec Coolset ou osapiens ?",
    a: "Antaios est conçu pour les PME : prix forfaitaire à 500 €/mois, configuration en un après-midi, sans engagement de durée.",
  },
  {
    key: "erp",
    q: "Puis-je importer des données depuis un ERP ?",
    a: "L'import manuel par CSV/Excel est disponible. L'intégration API avec les principaux ERP est prévue.",
  },
]

export function Faq() {
  const { t } = useTranslation()

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("landing.faq.title", "Questions fréquentes")}
          </h2>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-12">
          <Accordion type="single" collapsible>
            {faqs.map((faq) => (
              <AccordionItem key={faq.key} value={faq.key}>
                <AccordionTrigger>
                  {t(`landing.faq.${faq.key}.q`, faq.q)}
                </AccordionTrigger>
                <AccordionContent>
                  {t(`landing.faq.${faq.key}.a`, faq.a)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  )
}
