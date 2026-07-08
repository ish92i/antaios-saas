import { useState, useEffect, useCallback } from "react"
import { useMutation, useQuery } from "convex/react"
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
import { Key, User, Loader2 } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"

export function TracesCredentialsModal({
  open,
  onOpenChange,
  shipmentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipmentId?: string
}) {
  const [username, setUsername] = useState("")
  const [authKey, setAuthKey] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAutoLoading, setIsAutoLoading] = useState(false)

  const initiateDds = useMutation(api.shipments.initiateDdsGeneration)
  const hasCredentials = useQuery(
    api.shipments.hasTracesCredentials,
    open ? {} : "skip",
  )

  const resetStates = useCallback(() => {
    setUsername("")
    setAuthKey("")
    setRememberMe(true)
    setError(null)
    setIsSubmitting(false)
    setIsAutoLoading(false)
  }, [])

  useEffect(() => {
    if (!open) {
      resetStates()
      return
    }
    if (hasCredentials === true) {
      setIsAutoLoading(true)
      initiateDds({ shipmentId: shipmentId as Id<"shipments"> })
        .then(() => {
          onOpenChange(false)
        })
        .catch((err: Error) => {
          setError(err instanceof Error ? err.message : "Erreur d'authentification automatique")
          setIsAutoLoading(false)
        })
    }
  }, [open, hasCredentials])

  const handleSubmit = async () => {
    if (!shipmentId) return
    if (!username.trim()) {
      setError("Veuillez saisir votre nom d'utilisateur TRACES")
      return
    }
    if (!authKey.trim()) {
      setError("Veuillez saisir votre clé d'authentification TRACES")
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await initiateDds({
        shipmentId: shipmentId as Id<"shipments">,
        tracesUsername: username.trim(),
        authKey: authKey.trim(),
        rememberMe,
      })
      onOpenChange(false)
      setUsername("")
      setAuthKey("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la soumission DDS")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAutoLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Connexion automatique à TRACES...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Identification TRACES</DialogTitle>
          <DialogDescription>
            Saisissez vos identifiants TRACES pour initier la génération du DDS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Nom d'utilisateur
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Identifiant TRACES"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null) }}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Clé d'authentification
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                type="password"
                placeholder="Clé API TRACES"
                value={authKey}
                onChange={(e) => { setAuthKey(e.target.value); setError(null) }}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Se souvenir de mes identifiants
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Génération en cours..." : "Générer le DDS"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
