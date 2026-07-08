# Conflict Resolution Dialog Redesign

## Goal
Replace the existing `ConflictResolutionDialog` with a polished stepper UI matching the provided HTML mockups. Same props, same backend mutations, same question types — new visual design and component structure.

## Component Architecture

```
ConflictResolutionDialog.tsx       ← orchestrator (state, step nav, footer)
├── ProgressStepper.tsx            ← numbered step circles with progress
├── ConflictQuestion.tsx           ← two conflicting values as selection buttons
├── TextQuestion.tsx               ← text input + supplier delegate link
└── GeoQuestion.tsx                ← file upload + manual coordinate entry
```

All components go in `src/components/shipments/`.

## ProgressStepper
- Props: `current: number`, `total: number`
- Renders "Vérification des données" header + "Question X sur N" counter
- Numbered circles: green (completed, check icon), blue (current, white number), gray border (upcoming, gray number)
- Connecting lines between circles in matching colors

## Question Components

### ConflictQuestion
- Title + description
- Two side-by-side option buttons (flex gap)
- Click selects (blue border, blue bg tint via `bg-blue-50 border-blue-600`)
- Returns `selectedValue` up to parent

### TextQuestion
- Title + description
- Single `<Input>` with placeholder
- "Vous ne l'avez pas ? Envoyer au fournisseur" inline link below
- Parent manages value state

### GeoQuestion
- Title + description
- Two-column grid:
  - Left: dashed upload zone (click hidden input, accept `.geojson,.kml,.zip`). Shows file name + remove after selection
  - Right: two `<Input>` fields (Lat, Long) + "Ajouter un point" button
- "Vous ne les avez pas ? Envoyer au fournisseur" link below grid

## Dialog Orchestrator (ConflictResolutionDialog)
- Same props: `open`, `onOpenChange`, `shipment`
- Same backend mutations: `answerQuestion`, `flagForSupplier`, `finalizeModal`, `processAndAnswerGeo`
- State: `step`, `selectedAnswer` (buffered, submitted on "Continuer"), `flagMode`, `supplierEmail`, `geoFile`, `isUploadingGeo`
- Flow:
  1. "Continuer" → submit answer via `answerQuestion` → advance step
  2. Geo upload → auto-process via `handleGeoFile` → advance
  3. Supplier link → show email input → `flagForSupplier` → advance
  4. Last step → "Terminer" → `finalizeModal` → show success state
- Footer: `← Précédent` (left, disabled on step 0) / `Continuer →` or `Terminer` (right, disabled until answer provided)
- "Continuer" is disabled when: no answer selected, flagMode active, or isUploadingGeo

## Affected Files
- **Modified**: `src/components/shipments/ConflictResolutionDialog.tsx` (full rewrite)
- **New**: `src/components/shipments/ProgressStepper.tsx`
- **New**: `src/components/shipments/ConflictQuestion.tsx`
- **New**: `src/components/shipments/TextQuestion.tsx`
- **New**: `src/components/shipments/GeoQuestion.tsx`
- **Unchanged**: `src/components/shipments/ExtractedDataGrid.tsx` (props interface same)
- **Unchanged**: All Convex backend code

## Styling
- Tailwind CSS v4 + `cn()` utility
- Colors from existing design tokens: `bg-primary`, `bg-border`, `text-muted-foreground`, `text-foreground`, `bg-green-600`, `bg-blue-50`, `border-blue-600`
- No new CSS variables needed
