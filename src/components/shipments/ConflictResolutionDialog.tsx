import { useState, useCallback } from "react"
import { useMutation } from "convex/react"
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
import { ChevronLeft, CheckCircle2, Copy, Send, Mail } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

interface Question {
  id: string
  field: string
  label: string
  type?: string
  options?: string[]
}

export function ConflictResolutionDialog({
  open,
  onOpenChange,
  shipment,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipment: {
    _id: string
    pendingQuestions?: Question[] | null
    supplierToken?: string | null
    supplierEmail?: string | null
    extractedData?: Record<string, unknown> | null
  }
}) {
  const questions = shipment.pendingQuestions ?? []
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [supplierLinkCopied, setSupplierLinkCopied] = useState(false)

  const [flagMode, setFlagMode] = useState(false)
  const [supplierEmail, setSupplierEmail] = useState(shipment.supplierEmail ?? "")
  const [emailError, setEmailError] = useState<string | null>(null)

  const answerQuestion = useMutation(api.shipments.answerQuestion)
  const flagForSupplier = useMutation(api.shipments.flagForSupplier)
  const finalizeModal = useMutation(api.shipments.finalizeModal)

  const currentQuestion = questions[step]

  const handleAnswer = useCallback(
    async (value: string) => {
      if (!currentQuestion) return
      setIsAdvancing(true)
      setError(null)
      try {
        const prevVal = (shipment.extractedData as Record<string, unknown> | undefined)?.[currentQuestion.field]
        await answerQuestion({
          shipmentId: shipment._id as Id<"shipments">,
          questionId: currentQuestion.id,
          field: currentQuestion.field,
          answer: value,
          previousValue: prevVal,
        })
        setAnswers((prev) => ({ ...prev, [currentQuestion.field]: value }))
        setStep((s) => s + 1)
        setFlagMode(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement")
      } finally {
        setIsAdvancing(false)
      }
    },
    [currentQuestion, step, shipment, answerQuestion],
  )

  const handleFlagForSupplier = useCallback(async () => {
    if (!currentQuestion) return
    if (!EMAIL_RE.test(supplierEmail)) {
      setEmailError("Veuillez saisir une adresse email valide")
      return
    }
    setIsAdvancing(true)
    setError(null)
    try {
      await flagForSupplier({
        shipmentId: shipment._id as Id<"shipments">,
        questionId: currentQuestion.id,
        supplierEmail,
      })
      setStep((s) => s + 1)
      setFlagMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi au fournisseur")
    } finally {
      setIsAdvancing(false)
    }
  }, [currentQuestion, supplierEmail, shipment, flagForSupplier])

  const handleFinish = async () => {
    setIsAdvancing(true)
    try {
      await finalizeModal({ shipmentId: shipment._id as Id<"shipments"> })
      setIsFinished(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la finalisation")
    } finally {
      setIsAdvancing(false)
    }
  }

  const handleCopyLink = () => {
    if (shipment.supplierToken) {
      const url = `${window.location.origin}/supplier/${shipment.supplierToken}`
      navigator.clipboard.writeText(url).then(() => setSupplierLinkCopied(true)).catch(() => {})
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setStep(0)
    setAnswers({})
    setError(null)
    setIsFinished(false)
    setSupplierLinkCopied(false)
    setFlagMode(false)
    setEmailError(null)
  }

  const isLastQuestion = step >= questions.length

  if (isFinished) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traitement terminé</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <p className="text-sm text-muted-foreground">
              Les questions ont été traitées.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleClose}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Résolution des conflits</DialogTitle>
          <DialogDescription>
            Répondez aux questions ou transmettez-les à votre fournisseur.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`h-1.5 flex-1 rounded-full ${
                i < step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <div className="min-h-[200px]">
          {isLastQuestion ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <p className="text-sm font-medium text-foreground">
                Toutes les questions ont été traitées
              </p>
              <div className="flex flex-wrap gap-2">
                {shipment.supplierToken && (
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                    {supplierLinkCopied ? "Copié" : "Copier le lien fournisseur"}
                  </Button>
                )}
              </div>
            </div>
          ) : flagMode ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Transmettre au fournisseur
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Un lien sera envoyé au fournisseur pour répondre à cette question.
                  </p>
                </div>
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="fournisseur@example.com"
                  value={supplierEmail}
                  onChange={(e) => { setSupplierEmail(e.target.value); setEmailError(null) }}
                />
                {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setFlagMode(false)}>
                  Annuler
                </Button>
                <Button onClick={handleFlagForSupplier} disabled={isAdvancing}>
                  <Send className="h-4 w-4" />
                  Envoyer au fournisseur
                </Button>
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  {currentQuestion.field}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {currentQuestion.label}
                </p>
              </div>

              {currentQuestion.type === "conflict" && currentQuestion.options ? (
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options.map((opt) => (
                    <Button
                      key={opt}
                      variant={answers[currentQuestion.field] === opt ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAnswer(opt)}
                      disabled={isAdvancing}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={answers[currentQuestion.field] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [currentQuestion.field]: e.target.value }))
                    }
                    placeholder="Votre réponse"
                  />
                  <Button
                    onClick={() => handleAnswer(answers[currentQuestion.field] ?? "")}
                    disabled={!answers[currentQuestion.field]?.trim() || isAdvancing}
                  >
                    {isAdvancing ? "..." : "Valider"}
                  </Button>
                </div>
              )}

              <div className="border-t border-border pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFlagMode(true)}
                  disabled={isAdvancing}
                >
                  <Send className="h-3.5 w-3.5" />
                  Déléguer au fournisseur
                </Button>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || flagMode}
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          {isLastQuestion && (
            <Button onClick={handleFinish} disabled={isAdvancing}>
              {isAdvancing ? "..." : "Terminer"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
