import { useState } from "react"
import { useAction } from "convex/react"
import { api } from "@cvx/_generated/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, FileText, CheckCircle2, ChevronLeft } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"

interface PdfQuestion {
  id: string
  question: string
  section: number
  field: string
}

export function RiskPdfDialog({
  open,
  onOpenChange,
  shipmentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipmentId?: string
}) {
  const [questions, setQuestions] = useState<PdfQuestion[] | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const generatePdf = useAction(api.pdf.generateRiskPdf)

  const handleStart = async () => {
    if (!shipmentId) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generatePdf({
        shipmentId: shipmentId as Id<"shipments">,
      }) as { questions?: PdfQuestion[] } | undefined
      if (result?.questions && result.questions.length > 0) {
        setQuestions(result.questions)
        setCurrentStep(0)
      } else {
        setIsComplete(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswer = async () => {
    if (!shipmentId || !questions) return
    const q = questions[currentStep]
    if (!answers[q.id]?.trim()) return

    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1)
      return
    }

    setIsGenerating(true)
    setError(null)
    try {
      await generatePdf({
        shipmentId: shipmentId as Id<"shipments">,
        operatorAnswers: questions.map((q) => ({
          questionId: q.id,
          answer: answers[q.id] ?? "",
        })),
      })
      setIsComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setQuestions(null)
    setCurrentStep(0)
    setAnswers({})
    setError(null)
    setIsComplete(false)
    setIsGenerating(false)
  }

  const currentQuestion = questions?.[currentStep]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>PDF d'évaluation des risques</DialogTitle>
          <DialogDescription>
            Générez le rapport d'évaluation des risques EUDR pour cet envoi.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[120px]">
          {isComplete ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <p className="text-sm font-medium text-foreground">PDF généré avec succès</p>
              <p className="text-xs text-muted-foreground">
                Le document d'évaluation des risques est disponible dans les documents de l'envoi.
              </p>
            </div>
          ) : questions && currentQuestion ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 py-1">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i <= currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Section {currentQuestion.section}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {currentQuestion.question}
                </p>
              </div>

              <Input
                value={answers[currentQuestion.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))
                }
                placeholder="Votre réponse"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && answers[currentQuestion.id]?.trim()) {
                    handleAnswer()
                  }
                }}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2 pt-2">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(s => s - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                )}
                <Button
                  onClick={handleAnswer}
                  disabled={!answers[currentQuestion.id]?.trim() || isGenerating}
                  className="ml-auto"
                >
                  {currentStep < questions.length - 1
                    ? "Suivant"
                    : isGenerating
                      ? "Génération..."
                      : "Générer le PDF"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Générez le PDF d'évaluation des risques à partir des données extraites.
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
            Fermer
          </Button>
          {!isComplete && !questions && (
            <Button onClick={handleStart} disabled={isGenerating}>
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isGenerating ? "Génération..." : "Générer le PDF"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
