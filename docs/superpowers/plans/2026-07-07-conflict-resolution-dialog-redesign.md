# Conflict Resolution Dialog Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the `ConflictResolutionDialog` with numbered progress stepper and redesigned question layouts matching provided HTML mockups.

**Architecture:** Extract 4 sub-components (ProgressStepper, ConflictQuestion, TextQuestion, GeoQuestion) from the current monolithic dialog. Rewrite the dialog as a thin orchestrator with buffered answer state.

**Tech Stack:** React 18, TypeScript, shadcn/ui (Dialog, Button, Input), Tailwind CSS v4, Convex (mutations/actions unchanged), Lucide icons

## Global Constraints

- All new files in `src/components/shipments/`
- Same dialog props interface: `open`, `onOpenChange`, `shipment` (with `_id`, `pendingQuestions`, `supplierToken`, `supplierEmail`, `extractedData`)
- Same Convex mutation calls: `answerQuestion`, `flagForSupplier`, `finalizeModal`, `processAndAnswerGeo`
- Use `cn()` from `@/lib/utils` for class merging
- Use existing Tailwind design tokens only (no new CSS variables)
- French UI strings
- Named exports, no default exports
- All imports via `@/` alias for components/lib, `@cvx/` for Convex code

---

### Task 1: ProgressStepper component

**Files:**
- Create: `src/components/shipments/ProgressStepper.tsx`

**Interfaces:**
- Produces: `<ProgressStepper current={number} total={number} />` — renders numbered step circles with "Vérification des données" header and "Question X sur N" counter

- [ ] **Step 1: Create ProgressStepper component**

```tsx
import { Check } from "lucide-react"

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
        <span className="text-base font-medium text-[#101828]">
          Vérification des données
        </span>
        <span className="text-xs text-[#667085]">
          Question {current + 1} sur {total}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="flex items-center gap-1.5 flex-1 last:flex-none">
            {i < current ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16A34A]">
                <Check className="h-2.5 w-2.5 text-white" />
              </span>
            ) : i === current ? (
              <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[#1570EF] text-xs font-medium text-white">
                {i + 1}
              </span>
            ) : (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#D0D5DD] text-[10px] text-[#98A2B3]">
                {i + 1}
              </span>
            )}
            {i < total - 1 && (
              <span
                className={`h-0.5 flex-1 ${
                  i < current ? "bg-[#16A34A]" : i === current ? "bg-[#1570EF]" : "bg-[#D0D5DD]"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the component compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/components/shipments/ProgressStepper.tsx
git commit -m "feat: add ProgressStepper component for dialog steps"
```

---

### Task 2: ConflictQuestion component

**Files:**
- Create: `src/components/shipments/ConflictQuestion.tsx`

**Interfaces:**
- Produces: `<ConflictQuestion field label options selectedValue onSelect />`

- [ ] **Step 1: Create ConflictQuestion component**

```tsx
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
      <p className="text-sm font-medium text-[#101828]">{label}</p>
      <p className="mt-1 text-xs text-[#667085]">{description}</p>

      <div className="mt-4 flex gap-2.5">
        {options.map((opt) => {
          const isSelected = selectedValue === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={`flex-1 rounded-lg px-4 py-3.5 text-sm text-left transition-colors ${
                isSelected
                  ? "border-2 border-[#1570EF] bg-[#EBF3FF] font-medium text-[#0E4FC2]"
                  : "border border-[#D0D5DD] bg-white text-[#101828]"
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/shipments/ConflictQuestion.tsx
git commit -m "feat: add ConflictQuestion component"
```

---

### Task 3: TextQuestion component

**Files:**
- Create: `src/components/shipments/TextQuestion.tsx`

**Interfaces:**
- Produces: `<TextQuestion label description value onChange onSupplierClick />`

- [ ] **Step 1: Create TextQuestion component**

```tsx
import { ArrowRight } from "lucide-react"

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
      <p className="text-sm font-medium text-[#101828]">{label}</p>
      <p className="mt-1 text-xs text-[#667085]">{description}</p>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-4 block w-full rounded-lg border border-[#D0D5DD] px-3.5 py-3 text-sm text-[#101828] font-mono placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1570EF]/20 focus:border-[#1570EF]"
      />

      <button
        type="button"
        onClick={onSupplierClick}
        className="mt-3 flex items-center gap-1 text-xs font-medium text-[#1570EF] hover:underline"
      >
        Vous ne l'avez pas ? Envoyer au fournisseur
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/shipments/TextQuestion.tsx
git commit -m "feat: add TextQuestion component"
```

---

### Task 4: GeoQuestion component

**Files:**
- Create: `src/components/shipments/GeoQuestion.tsx`

**Interfaces:**
- Produces: `<GeoQuestion label description geoFile isUploading onFileSelect onFileUpload onSupplierClick lat lng onLatChange onLngChange onAddPoint />`

- [ ] **Step 1: Create GeoQuestion component**

```tsx
import { Upload, Plus, Trash2, Loader2 } from "lucide-react"
import { ArrowRight } from "lucide-react"

export function GeoQuestion({
  label,
  description,
  geoFile,
  isUploading,
  onFileSelect,
  onFileClear,
  latValue,
  lngValue,
  onLatChange,
  onLngChange,
  onSupplierClick,
}: {
  label: string
  description: string
  geoFile: File | null
  isUploading: boolean
  onFileSelect: (file: File) => void
  onFileClear: () => void
  latValue: string
  lngValue: string
  onLatChange: (value: string) => void
  onLngChange: (value: string) => void
  onSupplierClick: () => void
}) {
  return (
    <div>
      <p className="text-sm font-medium text-[#101828]">{label}</p>
      <p className="mt-1 text-xs text-[#667085]">{description}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Upload zone */}
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#D0D5DD] bg-[#F7F8FA] px-3 py-5 text-center transition-colors hover:border-[#1570EF]/50"
          onClick={() => {
            if (!isUploading) document.getElementById("geo-file-input")?.click()
          }}
        >
          <input
            id="geo-file-input"
            type="file"
            accept=".geojson,.kml,.zip"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFileSelect(f)
            }}
          />
          {geoFile ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="truncate max-w-[120px]">{geoFile.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onFileClear() }}
                disabled={isUploading}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </button>
            </div>
          ) : isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#667085]" />
          ) : (
            <>
              <Upload className="h-5 w-5 text-[#667085]" />
              <p className="mt-2 text-xs font-medium text-[#101828]">Uploader un fichier</p>
              <p className="mt-0.5 text-[10px] text-[#98A2B3]">GeoJSON, KML, Shapefile</p>
            </>
          )}
        </div>

        {/* Manual entry */}
        <div className="rounded-lg border border-[#D0D5DD] px-3 py-3">
          <p className="text-xs font-medium text-[#101828]">Saisir manuellement</p>
          <div className="mt-2 flex gap-1.5">
            <input
              type="text"
              placeholder="Lat"
              value={latValue}
              onChange={(e) => onLatChange(e.target.value)}
              className="w-1/2 rounded-md border border-[#D0D5DD] px-2 py-1.5 text-[11px] font-mono text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1570EF]/20"
            />
            <input
              type="text"
              placeholder="Long"
              value={lngValue}
              onChange={(e) => onLngChange(e.target.value)}
              className="w-1/2 rounded-md border border-[#D0D5DD] px-2 py-1.5 text-[11px] font-mono text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1570EF]/20"
            />
          </div>
          <button
            type="button"
            className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#1570EF] hover:underline"
          >
            <Plus className="h-3 w-3" />
            Ajouter un point
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onSupplierClick}
        className="mt-3 flex items-center gap-1 text-xs font-medium text-[#1570EF] hover:underline"
      >
        Vous ne les avez pas ? Envoyer au fournisseur
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/shipments/GeoQuestion.tsx
git commit -m "feat: add GeoQuestion component"
```

---

### Task 5: Rewrite ConflictResolutionDialog

**Files:**
- Modify: `src/components/shipments/ConflictResolutionDialog.tsx` (full rewrite)
- Unchanged: all other files

**Interfaces:**
- Consumes: `ProgressStepper`, `ConflictQuestion`, `TextQuestion`, `GeoQuestion`
- Consumes: Convex mutations `answerQuestion`, `flagForSupplier`, `finalizeModal`, `generateUploadUrl`, `processAndAnswerGeo`
- Same exported props: `ConflictResolutionDialog({ open, onOpenChange, shipment })`

- [ ] **Step 1: Rewrite ConflictResolutionDialog**

```tsx
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
import { ChevronLeft, CheckCircle2, Copy, Loader2 } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"
import { ProgressStepper } from "./ProgressStepper"
import { ConflictQuestion } from "./ConflictQuestion"
import { TextQuestion } from "./TextQuestion"
import { GeoQuestion } from "./GeoQuestion"

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
    const answer = selectedAnswer[currentQuestion.field]
    if (!answer?.trim()) return

    setIsSubmitting(true)
    setError(null)
    try {
      const prevVal = (shipment.extractedData as Record<string, unknown> | undefined)?.[currentQuestion.field]
      await answerQuestion({
        shipmentId: shipment._id as Id<"shipments">,
        questionId: currentQuestion.id,
        field: currentQuestion.field,
        answer,
        previousValue: prevVal,
      })
      setStep((s) => s + 1)
      setFlagMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement")
    } finally {
      setIsSubmitting(false)
    }
  }, [currentQuestion, selectedAnswer, shipment, answerQuestion])

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

  // Finished state
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
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-md bg-[#1570EF] px-4 py-2 text-sm font-medium text-white hover:bg-[#1565D8]"
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Résolution des conflits</DialogTitle>
          <DialogDescription className="sr-only">
            Répondez aux questions ou transmettez-les à votre fournisseur.
          </DialogDescription>
        </DialogHeader>

        <div className="px-1">
          <ProgressStepper current={step} total={questions.length} />
        </div>

        <div className="min-h-[200px]">
          {isLastQuestion ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <p className="text-sm font-medium text-[#101828]">
                Toutes les questions ont été traitées
              </p>
              <div className="flex flex-wrap gap-2">
                {shipment.supplierToken && (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#D0D5DD] px-3 py-1.5 text-sm font-medium text-[#667085] hover:bg-[#F7F8FA]"
                  >
                    <Copy className="h-4 w-4" />
                    {supplierLinkCopied ? "Copié" : "Copier le lien fournisseur"}
                  </button>
                )}
              </div>
            </div>
          ) : flagMode ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#101828]">Transmettre au fournisseur</p>
              <p className="text-xs text-[#667085]">Un lien sera envoyé au fournisseur pour répondre à cette question.</p>
              <input
                type="email"
                placeholder="fournisseur@example.com"
                value={supplierEmail}
                onChange={(e) => { setSupplierEmail(e.target.value); setEmailError(null) }}
                className="block w-full rounded-lg border border-[#D0D5DD] px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1570EF]/20"
              />
              {emailError && <p className="text-xs text-red-500">{emailError}</p>}
            </div>
          ) : currentQuestion ? (
            <>
              {currentQuestion.type === "conflict" && currentQuestion.options ? (
                <ConflictQuestion
                  label={currentQuestion.label}
                  description="Deux valeurs ont été trouvées dans vos documents. Laquelle est correcte?"
                  options={currentQuestion.options}
                  selectedValue={selectedAnswer[currentQuestion.field]}
                  onSelect={(v) => setSelectedAnswer((prev) => ({ ...prev, [currentQuestion.field!]: v }))}
                />
              ) : currentQuestion.type === "geo_missing" ? (
                <GeoQuestion
                  label={currentQuestion.label}
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
                  label={currentQuestion.label}
                  description="Ce champ est absent de tous vos documents."
                  value={selectedAnswer[currentQuestion.field] ?? ""}
                  onChange={(v) => setSelectedAnswer((prev) => ({ ...prev, [currentQuestion.field!]: v }))}
                  onSupplierClick={() => setFlagMode(true)}
                  placeholder={currentQuestion.field === "eori" ? "FR" : undefined}
                />
              )}

              {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
              {geoError && <p className="mt-2 text-xs text-red-500">{geoError}</p>}
            </>
          ) : null}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || flagMode}
            className="inline-flex items-center gap-1 text-sm text-[#667085] hover:text-[#101828] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Précédent
          </button>
          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-[#1570EF] px-4 py-2 text-sm font-medium text-white hover:bg-[#1565D8] disabled:bg-[#EAECF0] disabled:text-[#98A2B3] disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terminer"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinueAction}
              disabled={!canContinue || isSubmitting || isUploadingGeo}
              className="inline-flex items-center justify-center rounded-md bg-[#1570EF] px-4 py-2 text-sm font-medium text-white hover:bg-[#1565D8] disabled:bg-[#EAECF0] disabled:text-[#98A2B3] disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/shipments/ConflictResolutionDialog.tsx
git commit -m "feat: rewrite ConflictResolutionDialog with new design"
```

---

### Task 6: Verification pass

**Files:** No changes — only verification

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: Build succeeds
