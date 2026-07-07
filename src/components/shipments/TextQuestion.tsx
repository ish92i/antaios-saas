import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function TextQuestion({
  label,
  description,
  value,
  onChange,
  onSupplierClick,
  placeholder,
}: {
  label: string
  description: string
  value: string
  onChange: (value: string) => void
  onSupplierClick: () => void
  placeholder?: string
}) {
  return (
    <div>
      <p className={cn("text-sm font-medium text-foreground")}>{label}</p>
      <p className={cn("mt-1 text-xs text-muted-foreground")}>{description}</p>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("mt-4 block w-full rounded-lg border border-border px-3.5 py-3 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600")}
      />

      <button
        type="button"
        onClick={onSupplierClick}
        className={cn("mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline")}
      >
        Vous ne l'avez pas ? Envoyer au fournisseur
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  )
}
