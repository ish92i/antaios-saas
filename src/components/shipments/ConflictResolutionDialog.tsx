import { useState, useCallback, useEffect, useRef } from "react"
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
import { ChevronLeft, CheckCircle2, Copy, Loader2 } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"
import { cn } from "@/lib/utils"
import { ProgressStepper } from "./ProgressStepper"
import { ConflictQuestion } from "./ConflictQuestion"
import { TextQuestion } from "./TextQuestion"
import { GeoQuestion } from "./GeoQuestion"
import { resolveLabel, type BilingualLabel } from "@/lib/i18n-utils"

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

interface Question {
  id: string
  field: string
  label: string | BilingualLabel
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
  const hasCaptured = useRef(false)
  const isLoading = shipment.pendingQuestions === undefined && !hasCaptured.current
  const [questions, setQuestions] = useState<Question[]>(() => shipment.pendingQuestions ?? [])

  useEffect(() => {
    if (!open) {
      hasCaptured.current = false
    }
  }, [open])

  useEffect(() => {
    if (open && shipment.pendingQuestions !== undefined && !hasCaptured.current) {
      setQuestions(shipment.pendingQuestions)
      hasCaptured.current = true
    }
  }, [open, shipment.pendingQuestions])

  const [step, setStep] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [supplierLinkCopied, setSupplierLinkCopied] = useState(false)

  const [flagMode, setFlagMode] = useState(false)
  const [supplierEmail, setSupplierEmail] = useState(shipment.supplierEmail ?? "")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [geoFile, setGeoFile] = useState<File | null>(null)
  const [isUploadingGeo, setIsUploadingGeo] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [latValue, setLatValue] = useState("")
  const [lngValue, setLngValue] = useState("")

  const answerQuestion = useMutation(api.shipments.answerQuestion)
  const flagForSupplier = useMutation(api.shipments.flagForSupplier)
  const finalizeModal = useMutation(api.shipments.finalizeModal)
  const generateUploadUrl = useMutation(api.app.generateUploadUrl)
  const processAndAnswerGeo = useAction(api.geoAnswer.processAndAnswerGeo)

  const currentQuestion = questions[step]
  const isLastQuestion = step >= questions.length
  const showStepper = questions.length > 0

  const resetState = useCallback(() => {
    setStep(0)
    setSelectedAnswer({})
    setError(null)
    setIsSubmitting(false)
    setIsFinished(false)
    setSupplierLinkCopied(false)
    setFlagMode(false)
    setSupplierEmail(shipment.supplierEmail ?? "")
    setEmailError(null)
    setGeoFile(null)
    setIsUploadingGeo(false)
    setGeoError(null)
    setLatValue("")
    setLngValue("")
  }, [shipment.supplierEmail])

  const handleClose = () => {
    onOpenChange(false)
    resetState()
  }

  const handleContinue = useCallback(async () => {
    if (!currentQuestion) return

    setIsSubmitting(true)
    setError(null)
    try {
      let answer: string

      if (currentQuestion.type === "geo_missing" && !geoFile && latValue.trim() && lngValue.trim()) {
        answer = `${parseFloat(latValue)},${parseFloat(lngValue)}`
      } else {
        const ans = selectedAnswer[currentQuestion.field]
        if (!ans?.trim()) { setIsSubmitting(false); return }
        answer = ans
      }

      const prevVal = (shipment.extractedData as Record<string, unknown> | undefined)?.[currentQuestion.field]
      await answerQuestion({
        shipmentId: shipment._id as Id<"shipments">,
        questionId: currentQuestion.id,
        field: currentQuestion.field,
        answer,
        previousValue: prevVal,
      })

      const nextStep = step + 1
      if (nextStep >= questions.length) {
        await finalizeModal({ shipmentId: shipment._id as Id<"shipments"> })
        setIsFinished(true)
      } else {
        setStep(nextStep)
      }
      setFlagMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement")
    } finally {
      setIsSubmitting(false)
    }
  }, [currentQuestion, selectedAnswer, geoFile, latValue, lngValue, shipment, answerQuestion, finalizeModal, step, questions.length])

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
        setSelectedAnswer((prev) => ({ ...prev, [currentQuestion.field]: file.name }))
        setGeoFile(null)

        const nextStep = step + 1
        if (nextStep >= questions.length) {
          await finalizeModal({ shipmentId: shipment._id as Id<"shipments"> })
          setIsFinished(true)
        } else {
          setStep(nextStep)
        }
        setFlagMode(false)
      } catch (err) {
        setGeoError(err instanceof Error ? err.message : "Erreur lors du traitement du fichier")
      } finally {
        setIsUploadingGeo(false)
      }
    },
    [currentQuestion, shipment, generateUploadUrl, processAndAnswerGeo, finalizeModal, step, questions.length],
  )

  const handleFlagForSupplier = useCallback(async () => {
    if (!currentQuestion) return
    if (!EMAIL_RE.test(supplierEmail)) {
      setEmailError("Veuillez saisir une adresse email valide")
      return
    }
    setIsSubmitting(true)
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
      setIsSubmitting(false)
    }
  }, [currentQuestion, supplierEmail, shipment, flagForSupplier])

  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      await finalizeModal({ shipmentId: shipment._id as Id<"shipments"> })
      setIsFinished(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la finalisation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyLink = () => {
    if (shipment.supplierToken) {
      const url = `${window.location.origin}/supplier/${shipment.supplierToken}`
      navigator.clipboard.writeText(url).then(() => setSupplierLinkCopied(true)).catch(() => {})
    }
  }

  const canContinue = (() => {
    if (flagMode) {
      return EMAIL_RE.test(supplierEmail)
    }
    if (!currentQuestion) return false
    if (currentQuestion.type === "geo_missing") {
      return geoFile !== null || (latValue.trim() !== "" && lngValue.trim() !== "")
    }
    return !!selectedAnswer[currentQuestion.field]?.trim()
  })()

  const handleContinueAction = () => {
    if (flagMode) {
      handleFlagForSupplier()
    } else {
      handleContinue()
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={cn("sm:max-w-lg")}>
          <div className={cn("flex items-center justify-center py-10")}>
            <Loader2 className={cn("h-6 w-6 animate-spin text-muted-foreground")} />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (isFinished) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traitement terminé</DialogTitle>
          </DialogHeader>
          <div className={cn("flex flex-col items-center gap-3 py-6 text-center")}>
            <CheckCircle2 className={cn("h-10 w-10 text-green-600")} />
            <p className={cn("text-sm text-muted-foreground")}>
              Les questions ont été traitées.
            </p>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              className={cn("inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700")}
            >
              Fermer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn("sm:max-w-lg")}>
        <DialogHeader>
          <DialogTitle className={cn("sr-only")}>Résolution des conflits</DialogTitle>
          <DialogDescription className={cn("sr-only")}>
            Répondez aux questions ou transmettez-les à votre fournisseur.
          </DialogDescription>
        </DialogHeader>

        {showStepper && (
          <div className={cn("px-1")}>
            <ProgressStepper current={step} total={questions.length} />
          </div>
        )}

        <div className={cn("min-h-[200px]")}>
          {flagMode ? (
            <div className={cn("space-y-4")}>
              <p className={cn("text-sm font-medium text-foreground")}>Transmettre au fournisseur</p>
              <p className={cn("text-xs text-muted-foreground")}>Un lien sera envoyé au fournisseur pour répondre à cette question.</p>
              <input
                type="email"
                placeholder="fournisseur@example.com"
                value={supplierEmail}
                onChange={(e) => { setSupplierEmail(e.target.value); setEmailError(null) }}
                className={cn("block w-full rounded-lg border border-border px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20")}
              />
              {emailError && <p className={cn("text-xs text-destructive")}>{emailError}</p>}
            </div>
          ) : currentQuestion ? (
            <>
              {currentQuestion.type === "conflict" && currentQuestion.options ? (
                <ConflictQuestion
                  label={resolveLabel(currentQuestion.label)}
                  description="Deux valeurs ont été trouvées dans vos documents. Laquelle est correcte?"
                  options={currentQuestion.options}
                  selectedValue={selectedAnswer[currentQuestion.field]}
                  onSelect={(v) => setSelectedAnswer((prev) => ({ ...prev, [currentQuestion.field]: v }))}
                />
              ) : currentQuestion.type === "geo_missing" ? (
                <GeoQuestion
                  label={resolveLabel(currentQuestion.label)}
                  description="Aucune coordonnée GPS n'a été trouvée."
                  geoFile={geoFile}
                  isUploading={isUploadingGeo}
                  onFileSelect={(f) => {
                    setGeoFile(f)
                    handleGeoFile(f)
                  }}
                  onFileClear={() => setGeoFile(null)}
                  latValue={latValue}
                  lngValue={lngValue}
                  onLatChange={setLatValue}
                  onLngChange={setLngValue}
                  onSupplierClick={() => setFlagMode(true)}
                />
              ) : (
                <TextQuestion
                  label={resolveLabel(currentQuestion.label)}
                  description="Ce champ est absent de tous vos documents."
                  value={selectedAnswer[currentQuestion.field] ?? ""}
                  onChange={(v) => setSelectedAnswer((prev) => ({ ...prev, [currentQuestion.field]: v }))}
                  onSupplierClick={() => setFlagMode(true)}
                  placeholder={currentQuestion.field === "eori" ? "FR" : undefined}
                />
              )}

              {error && <p className={cn("mt-2 text-xs text-destructive")}>{error}</p>}
              {geoError && <p className={cn("mt-2 text-xs text-destructive")}>{geoError}</p>}
            </>
          ) : (
            <p className={cn("py-6 text-center text-sm text-muted-foreground")}>Aucune question à traiter.</p>
          )}
        </div>

        <DialogFooter className={cn("flex items-center justify-between sm:justify-between")}>
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || flagMode}
            className={cn("inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed")}
          >
            <ChevronLeft className={cn("h-3.5 w-3.5")} />
            Précédent
          </button>
          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className={cn("inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed")}
            >
              {isSubmitting ? <Loader2 className={cn("h-4 w-4 animate-spin")} /> : "Terminer"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinueAction}
              disabled={!canContinue || isSubmitting || isUploadingGeo}
              className={cn("inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed")}
            >
              {isSubmitting ? (
                <Loader2 className={cn("h-4 w-4 animate-spin")} />
              ) : (
                <>Continuer &rarr;</>
              )}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
