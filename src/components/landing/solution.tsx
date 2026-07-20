import { useTranslation } from "react-i18next"
import { Upload, BarChart3, FileCheck, ScrollText } from "lucide-react"
import { Timeline } from "@/components/ui/timeline"

const stepIcons = [Upload, BarChart3, FileCheck, ScrollText]

export function Solution() {
  const { t } = useTranslation()

  const data = [1, 2, 3, 4].map((i) => {
    const Icon = stepIcons[i - 1]
    return {
      title: t(`landing.how.step${i}.title`),
      content: (
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background">
            <Icon className="h-5 w-5 text-primary/70" />
          </div>
          <div>
            <p className="text-sm leading-relaxed text-foreground/80">
              {t(`landing.how.step${i}.desc`)}
            </p>
          </div>
        </div>
      ),
    }
  })

  return (
    <Timeline
      data={data}
      title={t("landing.how.title")}
      description=""
    />
  )
}
