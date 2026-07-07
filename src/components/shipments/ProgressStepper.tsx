import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProgressStepper({
  current,
  total,
}: {
  current: number
  total: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-foreground">
          Vérification des données
        </span>
        <span className="text-xs text-muted-foreground">
          Question {current + 1} sur {total}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="flex items-center gap-1.5 flex-1 last:flex-none">
            {i < current ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600">
                <Check className="h-2.5 w-2.5 text-white" />
              </span>
            ) : i === current ? (
              <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                {i + 1}
              </span>
            ) : (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground">
                {i + 1}
              </span>
            )}
            {i < total - 1 && (
              <span
                className={cn("h-0.5 flex-1", i < current ? "bg-green-600" : i === current ? "bg-blue-600" : "bg-border")}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
