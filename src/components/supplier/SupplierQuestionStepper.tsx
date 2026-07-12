import { useState } from "react"
import { useMutation, useAction } from "convex/react"
import { api } from "@cvx/_generated/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronLeft, ChevronRight, Upload, File, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Id } from "@cvx/_generated/dataModel"
import { resolveLabel, type BilingualLabel } from "@/lib/i18n-utils"

interface Question {
  id: string
  field: string
  label: string | BilingualLabel
  type?: string
  geoType?: "file" | "coordinates" | null
}

export function SupplierQuestionStepper({
  token,
  questions,
}: {
  token: string
  questions: Question[]
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [geoFile, setGeoFile] = useState<File | null>(null)
  const [isUploadingGeo, setIsUploadingGeo] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const submitAnswers = useMutation(api.supplier.submitSupplierAnswers)
  const generateSupplierUploadUrl = useMutation(api.app.generateSupplierUploadUrl)
  const processGeoFile = useAction(api.geoAnswer.processGeoFile)

  const current = questions[step]

  const handleNext = () => {
    const ans = answers[current.field]
    const hasAnswer = typeof ans === "string" ? ans.trim() : !!ans
    if (hasAnswer) {
      setStep((s) => Math.min(s + 1, questions.length - 1))
    }
  }

  const handleBack = () => setStep((s) => Math.max(0, s - 1))

  const handleGeoFile = async (file: File) => {
    setIsUploadingGeo(true)
    setGeoError(null)
    try {
      const uploadUrl = await generateSupplierUploadUrl({ token })
      const uploadResp = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!uploadResp.ok) throw new Error("Échec du téléchargement")
      const { storageId } = (await uploadResp.json()) as { storageId: string }
      const geoJson = await processGeoFile({
        storageId: storageId as Id<"_storage">,
        fileName: file.name,
      })
      setAnswers((prev) => ({ ...prev, [current.field]: geoJson }))
      setGeoFile(null)
    } catch (err) {
      setGeoError(err instanceof Error ? err.message : "Erreur lors du traitement du fichier")
    } finally {
      setIsUploadingGeo(false)
    }
  }

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
          <p className="text-base font-medium text-foreground">{resolveLabel(current.label)}</p>
        </div>

        <div>
          {current.type === "geo_missing" ? (
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
              {geoFile && (
                <Button
                  size="sm"
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
              {geoError && <p className="text-sm text-destructive">{geoError}</p>}
            </div>
          ) : (
            <Input
              value={typeof answers[current.field] === "string" ? (answers[current.field] as string) : ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [current.field]: e.target.value }))}
              placeholder="Votre réponse"
            />
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>
        {step < questions.length - 1 ? (
          <Button size="sm" onClick={handleNext} disabled={!answers[current.field]}>
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
