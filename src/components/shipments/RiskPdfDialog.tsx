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
import { Loader2, FileText, CheckCircle2 } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"

interface PdfQuestion {
  id: string
  question: string
  section: number
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
      } else {
        setIsComplete(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitAnswers = async () => {
    if (!shipmentId || !questions) return
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
    setAnswers({})
    setError(null)
    setIsComplete(false)
    setIsGenerating(false)
  }

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
          ) : questions ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Veuillez répondre aux questions suivantes pour compléter l'évaluation des risques.
              </p>
              {questions.map((q) => (
                <div key={q.id}>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    {q.question}
                  </label>
                  <Input
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder="Votre réponse"
                  />
                </div>
              ))}
              {error && <p className="text-sm text-destructive">{error}</p>}
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
          {!isComplete && questions && (
            <Button onClick={handleSubmitAnswers} disabled={isGenerating}>
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isGenerating ? "Génération..." : "Valider et générer"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
