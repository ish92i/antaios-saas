import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@cvx/_generated/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  field: string
  label: string
  type?: string
}

export function SupplierQuestionStepper({
  token,
  questions,
}: {
  token: string
  questions: Question[]
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitAnswers = useMutation(api.supplier.submitSupplierAnswers)

  const current = questions[step]

  const handleNext = () => {
    if (answers[current.field]?.trim()) {
      setStep((s) => Math.min(s + 1, questions.length - 1))
    }
  }

  const handleBack = () => setStep((s) => Math.max(0, s - 1))

  const handleSubmitAll = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await submitAnswers({
        token,
        answers: questions.map((q) => ({
          questionId: q.id,
          field: q.field,
          answer: answers[q.field] ?? "",
        })),
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la soumission")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
        <h2 className="text-lg font-semibold text-foreground">Merci pour vos réponses</h2>
        <p className="text-sm text-muted-foreground">
          Les informations ont bien été transmises à l'opérateur.
        </p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
        <h2 className="text-lg font-semibold text-foreground">Aucune question en attente</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i <= step ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Question {step + 1} sur {questions.length}
      </p>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">{current.field}</p>
          <p className="text-base font-medium text-foreground">{current.label}</p>
        </div>

        <div>
          <Input
            value={answers[current.field] ?? ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [current.field]: e.target.value }))}
            placeholder="Votre réponse"
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>
        {step < questions.length - 1 ? (
          <Button size="sm" onClick={handleNext} disabled={!answers[current.field]?.trim()}>
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmitAll} disabled={isSubmitting}>
            {isSubmitting ? "Envoi..." : "Envoyer mes réponses"}
          </Button>
        )}
      </div>
    </div>
  )
}
