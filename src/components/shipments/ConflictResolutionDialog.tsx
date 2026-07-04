import { useState, useCallback } from "react"
import { useMutation, useAction } from "convex/react"
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
import { ChevronLeft, CheckCircle2, Copy, Send, Mail, Upload, File, Loader2, Trash2 } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

interface Question {
  id: string
  field: string
  label: string
  type?: string
  options?: string[]
  geoType?: "file" | "coordinates" | null
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
  const [geoFile, setGeoFile] = useState<File | null>(null)
  const [isUploadingGeo, setIsUploadingGeo] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const answerQuestion = useMutation(api.shipments.answerQuestion)
  const flagForSupplier = useMutation(api.shipments.flagForSupplier)
  const finalizeModal = useMutation(api.shipments.finalizeModal)
  const generateUploadUrl = useMutation(api.app.generateUploadUrl)
  const processAndAnswerGeo = useAction(api.geoAnswer.processAndAnswerGeo)

  const currentQuestion = questions[step]

  const handleGeoFile = useCallback(
    async (file: File) => {
      if (!currentQuestion) return
      setIsUploadingGeo(true)
      setGeoError(null)
      try {
        const uploadUrl = await generateUploadUrl()
        const uploadResp = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })
        if (!uploadResp.ok) throw new Error("Échec du téléchargement")
        const { storageId } = (await uploadResp.json()) as { storageId: string }
        const prevVal = (shipment.extractedData as Record<string, unknown> | undefined)?.[currentQuestion.field]
        await processAndAnswerGeo({
          shipmentId: shipment._id as Id<"shipments">,
          questionId: currentQuestion.id,
          storageId: storageId as Id<"_storage">,
          fileName: file.name,
          previousValue: prevVal,
        })
        setAnswers((prev) => ({ ...prev, [currentQuestion.field]: file.name }))
        setGeoFile(null)
        setStep((s) => s + 1)
        setFlagMode(false)
      } catch (err) {
        setGeoError(err instanceof Error ? err.message : "Erreur lors du traitement du fichier")
      } finally {
        setIsUploadingGeo(false)
      }
    },
    [currentQuestion, shipment, generateUploadUrl, processAndAnswerGeo],
  )

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
              ) : currentQuestion.type === "geo_missing" ? (
                <div className="space-y-3">
                  {geoFile ? (
                    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                      <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{geoFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setGeoFile(null)}
                        className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80"
                        disabled={isUploadingGeo}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50"
                      onClick={() => document.getElementById("geo-file-input")?.click()}
                    >
                      <input
                        id="geo-file-input"
                        type="file"
                        accept=".geojson,.kml,.zip"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) setGeoFile(f)
                        }}
                      />
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        Cliquez pour sélectionner un fichier
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        GeoJSON, KML, ZIP
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {geoFile && (
                      <Button
                        onClick={() => handleGeoFile(geoFile)}
                        disabled={isUploadingGeo}
                      >
                        {isUploadingGeo ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Traitement...</>
                        ) : (
                          "Télécharger"
                        )}
                      </Button>
                    )}
                  </div>
                  {geoError && <p className="text-sm text-destructive">{geoError}</p>}
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
