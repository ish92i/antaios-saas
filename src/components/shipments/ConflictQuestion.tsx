import { cn } from "@/lib/utils"

export function ConflictQuestion({
  label,
  description,
  options,
  selectedValue,
  onSelect,
}: {
  label: string
  description: string
  options: string[]
  selectedValue?: string
  onSelect: (value: string) => void
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>

      <div className="mt-4 flex gap-2.5">
        {options.map((opt) => {
          const isSelected = selectedValue === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={cn(
                "flex-1 rounded-lg px-4 py-3.5 text-sm text-left transition-colors",
                isSelected
                  ? "border-2 border-blue-600 bg-blue-50 font-medium text-blue-700"
                  : "border border-border bg-white text-foreground",
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
