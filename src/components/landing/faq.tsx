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
    key: "supplier-portal",
    q: "How does the supplier portal work?",
    a: "Suppliers receive a secure link via email or WhatsApp. They open it on any device — no account, no login, no app installation. They can submit plot coordinates, upload documents, and respond to data requests directly. Works for cooperatives, brokers, and individual producers.",
  },
  {
    key: "broker",
    q: "Can I use Antaios if my coffee comes through a broker?",
    a: "Yes. Antaios is designed for real-world supply chains where lots are consolidated. Upload your broker documents, invoices, and export certificates. The system extracts what it can, identifies what's missing, and helps you request the missing origin data from your broker or the exporting cooperative.",
  },
  {
    key: "documents",
    q: "What documents can I upload?",
    a: "PDF invoices, bills of lading, export certificates, Excel spreadsheets, images of documents, and GeoJSON files. Antaios uses OCR and data extraction to pull structured information from unstructured documents, then cross-checks data across sources.",
  },
  {
    key: "limits",
    q: "Is there a limit on shipments or plots?",
    a: "No. Antaios includes unlimited shipments, unlimited production plots, unlimited suppliers, and unlimited users. One flat fee covers everything — no per-shipment charges, no per-plot fees, no module add-ons.",
  },
  {
    key: "vs-screening",
    q: "How is Antaios different from plot screening tools?",
    a: "Plot screening tools validate geometry and check deforestation. Antaios handles the full workflow: document ingestion, data extraction, supplier communication, evidence reconciliation, risk assessment, DDS generation, and compliance reporting. It's built for importers who need end-to-end compliance, not just plot validation.",
  },
  {
    key: "no-compliance-hire",
    q: "Do I need to hire a compliance person to use Antaios?",
    a: "No. Antaios is designed for small teams without dedicated compliance staff. Onboarding takes an afternoon. The platform guides you through each step — from uploading documents to filing your DDS — and the supplier portal handles data collection so you don't have to chase information manually.",
  },
  {
    key: "audit-trail",
    q: "What about the 5-year audit trail?",
    a: "Every action in Antaios is recorded automatically — document uploads, supplier requests, data changes, risk assessments, and DDS submissions. Records are retained for the full 5-year regulatory period. You can export your compliance file at any time or hand it directly to an auditor.",
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
