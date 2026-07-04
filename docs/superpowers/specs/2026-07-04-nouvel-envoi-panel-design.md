# CreateShipmentPanel — Nouvel envoi dans le panneau de détail

## Problem

Cliquer "Nouvel envoi" ouvre une modale (`NewShipmentDialog`). L'utilisateur veut un **grand formulaire inline** dans le panneau de droite à la place — avec un champ nom visible, une zone d'upload avec aperçu des fichiers, et un bouton envoyer.

## Solution

Ajouter un état `view` au layout des shipments qui peut être `"idle"` | `"create"` | `{ id: string }`. Quand `view = "create"`, le panneau droit affiche `CreateShipmentPanel`. Le submit crée le shipment + upload les fichiers, puis bascule vers `{ id: newId }`.

### État du layout

Remplacer `selectedId: string | undefined` et `isNewOpen: boolean` par :

```ts
type ViewState =
  | { mode: "idle" }
  | { mode: "create" }
  | { mode: "detail"; id: string }
```

### Layout (`_layout.shipments.tsx`)

```
left panel: ShipmentList
  "Nouvel envoi" → setView({ mode: "create" })

right panel:
  view.mode === "idle"    → "Sélectionnez un envoi..."
  view.mode === "create"  → <CreateShipmentPanel onCreated={...} onCancel={...} />
  view.mode === "detail"  → <ShipmentDetailPanel shipmentId={view.id} ... />
```

### Composants

#### `CreateShipmentPanel` (nouveau)

```
┌─────────────────────────────────────┐
│ ✕  Nouvel envoi                     │
├─────────────────────────────────────┤
│                                     │
│  Nom de l'envoi                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  Fichiers                           │
│  ┌── dropzone ───────────────────┐  │
│  │  Glissez-déposez ou cliquez   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ 📄   │ │ 📄   │ │ 📄   │       │
│  │ nom  │ │ nom  │ │ nom  │       │
│  │ 2MB  │ │ 5MB  │ │ 1MB  │       │
│  │ ✕    │ │ ✕    │ │ ✕    │       │
│  └──────┘ └──────┘ └──────┘       │
│  (cliquer une carte → preview)     │
│                                     │
├─────────────────────────────────────┤
│  [         Envoyer           ]      │
└─────────────────────────────────────┘
```

- Sticky header avec titre "Nouvel envoi" + bouton X (cancel → retour à idle)
- Champ "Nom de l'envoi" (input large, remplace "Référence interne")
- UploadDropzone améliorée (cartes au lieu de liste)
- Cliquer une carte → ouvre `FilePreview` (lightbox Dialog)
- Erreur sous le formulaire si échec
- Bouton "Envoyer" large, sticky en bas, désactivé si aucun fichier valide

#### `FilePreview` (nouveau)

Ouvre une `Dialog` (shadcn) avec :

- Nom du fichier
- Taille formatée
- Type MIME
- Aperçu selon le type :
  - **Image** → `<img>` avec `URL.createObjectURL`
  - **PDF** → `<iframe>` avec `URL.createObjectURL`
  - **Texte/CSV** → `<pre>` avec lecture du contenu
  - **GeoJSON** → formaté joli
  - **Autre** → icône générique + message "Aperçu non disponible"
- Bouton "Fermer"

#### `UploadDropzone` (modifié)

Passer du rendu liste (`<ul>`) à un rendu **grille de cartes** :

```tsx
<div className="grid grid-cols-2 gap-2">
  {files.map((f, i) => (
    <FileCard key={i} file={f} onClick={() => onPreview(i)} onRemove={() => removeFile(i)} />
  ))}
</div>
```

Chaque carte `FileCard` montre : icône de type, nom (truncated), taille, bouton × pour retirer. Les fichiers en erreur ont un style rouge.

### Flux submit (inchangé)

1. `createShipment({ internalRef: name })` → `shipmentId`
2. Pour chaque fichier valide : `generateUploadUrl` → `fetch(POST)` → `addDocument`
3. `onCreated(shipmentId)` → layout bascule en `{ mode: "detail", id: shipmentId }`

### Fichiers modifiés / créés

| Fichier | Action |
|---|---|
| `_layout.shipments.tsx` | Remplacer `selectedId`/`isNewOpen` par `ViewState`. Supprimer `NewShipmentDialog`. Ajouter `CreateShipmentPanel`. |
| `CreateShipmentPanel.tsx` | **Nouveau** — formulaire de création complet |
| `FilePreview.tsx` | **Nouveau** — lightbox de prévisualisation de fichier |
| `UploadDropzone.tsx` | Modifier — rendu en grille de cartes au lieu de liste |
| `ShipmentList.tsx` | Aucun changement (onCreate reste) |
| `NewShipmentDialog.tsx` | **Supprimer** — remplacé par CreateShipmentPanel |

### Tests

- CreateShipmentPanel : rendu du formulaire, validation (submit désactivé sans fichiers), submit appelle les bonnes mutations
- FilePreview : rendu selon le type de fichier
- UploadDropzone : grille de cartes avec remove
- Layout : clic "Nouvel envoi" → view = "create", submit → view = "detail"

### Non-scope

- Modification du comportement du bouton "Nouvel envoi" dans l'état vide de la liste (inchangé)
- Modification du détail des fichiers après upload (inchangé, reste dans DocumentList)
- Édition du nom après création (déjà géré par updateShipmentField si besoin)
