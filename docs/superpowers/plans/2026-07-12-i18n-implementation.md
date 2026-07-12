# i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full i18n support to Antaios — anglais primaire, français secondaire, infrastructure extensible.

**Architecture:** `react-i18next` pour tout le texte UI statique. DeepL API + cache Convex `translationCache` pour les données dynamiques (commodities, noms de produits). Lookup table locale pour les commodities EUDR courantes avec traductions naturelles. Questions de résolution stockées bilingues dès la génération par `merge.ts`. Détection langue 3 couches (override → browser → OS → en). Sélecteur dans le header.

**Tech Stack:** react-i18next, i18next, i18next-browser-languagedetector, Convex (translationCache table), DeepL API

---

### Task 1: Setup i18n — dependencies, config, locale files, provider

**Files:**
- Install: `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- Create: `src/lib/i18n.ts`
- Create: `src/locales/en.json`
- Create: `src/locales/fr.json`
- Modify: `src/app.tsx` (wrap with i18n provider + locale initialization)

- [ ] **Step 1: Install dependencies**

Run:
```bash
pnpm add react-i18next i18next i18next-browser-languagedetector
```

- [ ] **Step 2: Create `src/lib/i18n.ts`**

```ts
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import en from "@/locales/en.json"
import fr from "@/locales/fr.json"

const SUPPORTED_LANGS = ["en", "fr"]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, fr: { translation: fr } },
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "antaios:locale",
    },
    interpolation: { escapeValue: false },
  })

export default i18n
```

- [ ] **Step 3: Create `src/locales/en.json`**

This contains all UI strings in English. Extract from current French hardcoded strings and translate.

```json
{
  "status": {
    "draft": "Draft",
    "extracting": "Extracting",
    "resolving": "Reviewing",
    "pending_scan": "Pending scan",
    "scanning": "Deforestation scan",
    "ready": "Ready",
    "pending_supplier": "Awaiting supplier",
    "submitting": "Submitting",
    "submitted": "Submitted",
    "error": "Error"
  },
  "completeness": {
    "red": "Insufficient completeness",
    "yellow": "Partial completeness",
    "green": "Complete",
    "unknown": "Not evaluated"
  },
  "shipment": {
    "title": "Shipments",
    "description": "Manage your shipments and their EUDR compliance",
    "create": "New shipment",
    "search": "Search...",
    "empty_title": "No shipments yet",
    "empty_desc": "Import your first document to create a shipment.",
    "select_hint": "Select a shipment to view details",
    "name_label": "Shipment name",
    "name_hint": "An internal name to easily identify this shipment in the list",
    "name_required": "Shipment name is required",
    "create_error": "Error creating shipment",
    "files": "Files",
    "no_files": "No files",
    "file_count": "{count} file(s)",
    "cancel": "Cancel",
    "create_cta": "Create shipment",
    "new_shipment_title": "New shipment",
    "new_shipment_subtitle": "Create a shipment and import its documents",
    "not_found": "Nouvel envoi"
  },
  "detail": {
    "return": "Back",
    "documents": "Documents",
    "extracted_data": "Extracted data",
    "resolve": "Résoudre les conflits",
    "billing_title": "Billing"
  },
  "conflict": {
    "title": "Resolve conflicts",
    "description": "Answer the questions or forward them to your supplier.",
    "send_to_supplier": "Send to supplier",
    "send_to_supplier_hint": "A link will be sent to the supplier to answer this question.",
    "conflict_prompt": "Two values were found in your documents. Which one is correct?",
    "geo_missing": "No GPS coordinates were found.",
    "missing_field": "This field is missing from all your documents.",
    "invalid_email": "Please enter a valid email address",
    "save_error": "Error saving",
    "supplier_send_error": "Error sending to supplier",
    "finalize_error": "Error finalizing",
    "file_error": "Error processing file",
    "done_title": "Processing complete",
    "done_desc": "The questions have been processed.",
    "no_questions": "No questions to process.",
    "previous": "Previous",
    "continue": "Continue →",
    "finish": "Finish",
    "close": "Close"
  },
  "question": {
    "count": "Question {n} of {total}",
    "your_answer": "Your answer",
    "click_to_select": "Click to select a file",
    "geo_formats": "GeoJSON, KML, ZIP",
    "remove": "Remove",
    "upload": "Upload",
    "processing": "Processing...",
    "upload_failed": "Upload failed",
    "submit_error": "Error submitting"
  },
  "supplier": {
    "invalid_token": "Invalid link",
    "invalid_token_desc": "This link is not valid or has expired. Contact your operator to get a new link.",
    "page_title": "Supplier questions — Antaios",
    "already_completed": "Questionnaire already completed",
    "already_completed_desc": "The information has already been sent to your operator. Thank you for your participation.",
    "questions_title": "Questions about your shipment",
    "questions_desc": "Your operator has requested the following information from you.",
    "thanks_title": "Thank you for your answers",
    "thanks_desc": "The information has been sent to the operator.",
    "no_pending": "No pending questions",
    "send_answers": "Send my answers",
    "sending": "Sending..."
  },
  "fields": {
    "operatorName": "Operator name",
    "operatorAddress": "Operator address",
    "operatorEmail": "Operator email",
    "operatorPhone": "Operator phone",
    "eoriNumber": "EORI number",
    "supplierName": "Supplier name",
    "supplierAddress": "Supplier address",
    "supplierEmail": "Supplier email",
    "commodityName": "Commodity",
    "scientificName": "Scientific name",
    "hsCode": "HS code",
    "quantity": "Quantity",
    "quantityUnit": "Unit",
    "shipmentRef": "Shipment reference",
    "countryOfExport": "Country of export",
    "countryOfProduction": "Country of production",
    "productionDate": "Production date",
    "region": "Region",
    "portOfLoading": "Port of loading",
    "portOfEntry": "Port of entry",
    "farmName": "Farm name",
    "villageName": "Village name",
    "certifications": "Certifications",
    "geoJson": "Geospatial data"
  },
  "fields_group": {
    "operator": "Operator",
    "supplier": "Supplier",
    "commodity": "Commodity",
    "geography": "Geography",
    "certifications": "Certifications",
    "geolocation": "Geolocation"
  },
  "fields_value": {
    "yes": "Yes",
    "no": "No"
  },
  "scan": {
    "title": "Deforestation scan",
    "clean": "Clean",
    "alerts_found": "Alerts found",
    "no_polygon": "No polygon"
  },
  "onboarding": {
    "create_org": "Create your organization",
    "setup_desc": "Set up your organization to get started."
  },
  "legal": {
    "login_disclaimer": "By clicking continue, you agree to our Terms of Service and Privacy Policy."
  },
  "nav": {
    "billing": "Billing"
  },
  "locale": {
    "en": "English",
    "fr": "Français"
  }
}
```

- [ ] **Step 4: Create `src/locales/fr.json`**

Same structure as `en.json` but with current French values:

```json
{
  "status": {
    "draft": "Brouillon",
    "extracting": "Extraction en cours",
    "resolving": "Vérification",
    "pending_scan": "En attente scan",
    "scanning": "Scan déforestation",
    "ready": "Prêt",
    "pending_supplier": "En attente fournisseur",
    "submitting": "Soumission en cours",
    "submitted": "Soumis",
    "error": "Erreur"
  },
  "completeness": {
    "red": "Complétude insuffisante",
    "yellow": "Complétude partielle",
    "green": "Complet",
    "unknown": "Non évalué"
  },
  "shipment": {
    "title": "Expéditions",
    "description": "Gérez vos envois et leur conformité EUDR",
    "create": "Nouvel envoi",
    "search": "Rechercher...",
    "empty_title": "Aucun envoi",
    "empty_desc": "Importez votre premier document pour créer un envoi.",
    "select_hint": "Sélectionnez un envoi pour voir les détails",
    "name_label": "Nom de l'envoi",
    "name_hint": "Un nom interne pour identifier facilement cet envoi dans la liste",
    "name_required": "Le nom de l'envoi est requis",
    "create_error": "Erreur lors de la création de l'envoi",
    "files": "Fichiers",
    "no_files": "Aucun fichier",
    "file_count": "{n} fichier(s)",
    "cancel": "Annuler",
    "create_cta": "Créer l'envoi",
    "new_shipment_title": "Nouvel envoi",
    "new_shipment_subtitle": "Créez un envoi et importez ses documents",
    "not_found": "Nouvel envoi"
  },
  "detail": {
    "return": "Retour",
    "documents": "Documents",
    "extracted_data": "Données extraites",
    "resolve": "Résoudre les conflits",
    "billing_title": "Billing"
  },
  "conflict": {
    "title": "Résolution des conflits",
    "description": "Répondez aux questions ou transmettez-les à votre fournisseur.",
    "send_to_supplier": "Transmettre au fournisseur",
    "send_to_supplier_hint": "Un lien sera envoyé au fournisseur pour répondre à cette question.",
    "conflict_prompt": "Deux valeurs ont été trouvées dans vos documents. Laquelle est correcte?",
    "geo_missing": "Aucune coordonnée GPS n'a été trouvée.",
    "missing_field": "Ce champ est absent de tous vos documents.",
    "invalid_email": "Veuillez saisir une adresse email valide",
    "save_error": "Erreur lors de l'enregistrement",
    "supplier_send_error": "Erreur lors de l'envoi au fournisseur",
    "finalize_error": "Erreur lors de la finalisation",
    "file_error": "Erreur lors du traitement du fichier",
    "done_title": "Traitement terminé",
    "done_desc": "Les questions ont été traitées.",
    "no_questions": "Aucune question à traiter.",
    "previous": "Précédent",
    "continue": "Continuer →",
    "finish": "Terminer",
    "close": "Fermer"
  },
  "question": {
    "count": "Question {n} sur {total}",
    "your_answer": "Votre réponse",
    "click_to_select": "Cliquez pour sélectionner un fichier",
    "geo_formats": "GeoJSON, KML, ZIP",
    "remove": "Retirer",
    "upload": "Télécharger",
    "processing": "Traitement...",
    "upload_failed": "Échec du téléchargement",
    "submit_error": "Erreur lors de la soumission"
  },
  "supplier": {
    "invalid_token": "Lien invalide",
    "invalid_token_desc": "Ce lien n'est pas valide ou a expiré. Contactez votre opérateur pour obtenir un nouveau lien.",
    "page_title": "Questions fournisseur — Antaios",
    "already_completed": "Questionnaire déjà complété",
    "already_completed_desc": "Les informations ont déjà été transmises à votre opérateur. Merci de votre participation.",
    "questions_title": "Questions concernant votre envoi",
    "questions_desc": "Votre opérateur vous a sollicité pour compléter les informations suivantes.",
    "thanks_title": "Merci pour vos réponses",
    "thanks_desc": "Les informations ont bien été transmises à l'opérateur.",
    "no_pending": "Aucune question en attente",
    "send_answers": "Envoyer mes réponses",
    "sending": "Envoi..."
  },
  "fields": {
    "operatorName": "Nom de l'opérateur",
    "operatorAddress": "Adresse de l'opérateur",
    "operatorEmail": "Email de l'opérateur",
    "operatorPhone": "Téléphone de l'opérateur",
    "eoriNumber": "Numéro EORI",
    "supplierName": "Nom du fournisseur",
    "supplierAddress": "Adresse du fournisseur",
    "supplierEmail": "Email du fournisseur",
    "commodityName": "Dénomination",
    "scientificName": "Nom scientifique",
    "hsCode": "Code SH",
    "quantity": "Quantité",
    "quantityUnit": "Unité",
    "shipmentRef": "Référence d'envoi",
    "countryOfExport": "Pays d'exportation",
    "countryOfProduction": "Pays de production",
    "productionDate": "Date de production",
    "region": "Région",
    "portOfLoading": "Port de chargement",
    "portOfEntry": "Port d'entrée",
    "farmName": "Nom de l'exploitation",
    "villageName": "Nom du village",
    "certifications": "Certifications",
    "geoJson": "Données géospatiales"
  },
  "fields_group": {
    "operator": "Opérateur",
    "supplier": "Fournisseur",
    "commodity": "Marchandise",
    "geography": "Géographie",
    "certifications": "Certifications",
    "geolocation": "Géolocalisation"
  },
  "fields_value": {
    "yes": "Oui",
    "no": "Non"
  },
  "scan": {
    "title": "Scan déforestation",
    "clean": "Aucune alerte",
    "alerts_found": "Alertes détectées",
    "no_polygon": "Aucun polygone"
  },
  "onboarding": {
    "create_org": "Créez votre organisation",
    "setup_desc": "Configurez votre organisation pour commencer."
  },
  "legal": {
    "login_disclaimer": "En cliquant sur continuer, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité."
  },
  "nav": {
    "billing": "Facturation"
  },
  "locale": {
    "en": "English",
    "fr": "Français"
  }
}
```

- [ ] **Step 5: Update `src/app.tsx` — import i18n and add locale initialization**

Add this import after the existing React import:
```ts
import "@/lib/i18n"
```

No wrapping needed — `react-i18next` initializes globally once imported.

- [ ] **Step 6: Run typecheck**

Run: `pnpm typecheck`
Expected: no errors (the new files don't touch any existing code yet)

- [ ] **Step 7: Commit**

```bash
git add src/lib/i18n.ts src/locales/ src/app.tsx package.json pnpm-lock.yaml
git commit -m "feat: setup i18n with react-i18next, en/fr locale files"
```

---

### Task 2: Backend translation cache — Convex schema + queries + mutations

**Files:**
- Modify: `convex/schema.ts` (add translationCache table)
- Create: `convex/translateValue.ts` (mutation to translate + cache via DeepL)
- Create: `convex/getTranslation.ts` (query to read from cache)

- [ ] **Step 1: Add `translationCache` table to `convex/schema.ts`**

Add after the existing tables, before the closing `});`:
```ts
  translationCache: defineTable({
    sourceText: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
    translatedText: v.string(),
    createdAt: v.number(),
  })
    .index("by_source_target", ["sourceText", "sourceLang", "targetLang"]),
```

- [ ] **Step 2: Create `convex/translateValue.ts`**

```ts
"use node"

import { internalMutation } from "@cvx/_generated/server"
import { v } from "convex/values"
import { translateText } from "@cvx/lib/translate"

export const translateAndCache = internalMutation({
  args: {
    sourceText: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.sourceLang === args.targetLang) return args.sourceText
    if (!args.sourceText.trim()) return args.sourceText

    const translated = await translateText(
      args.sourceText,
      args.targetLang,
      args.sourceLang,
    )

    await ctx.db.insert("translationCache", {
      sourceText: args.sourceText,
      sourceLang: args.sourceLang,
      targetLang: args.targetLang,
      translatedText: translated,
      createdAt: Date.now(),
    })

    return translated
  },
})
```

- [ ] **Step 3: Create `convex/getTranslation.ts`**

```ts
import { internalQuery } from "@cvx/_generated/server"
import { v } from "convex/values"

export const getCachedTranslation = internalQuery({
  args: {
    sourceText: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.sourceLang === args.targetLang) return args.sourceText
    if (!args.sourceText.trim()) return null

    const cached = await ctx.db
      .query("translationCache")
      .withIndex("by_source_target", (q) =>
        q
          .eq("sourceText", args.sourceText)
          .eq("sourceLang", args.sourceLang)
          .eq("targetLang", args.targetLang),
      )
      .first()

    return cached?.translatedText ?? null
  },
})
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add convex/schema.ts convex/translateValue.ts convex/getTranslation.ts
git commit -m "feat: add translationCache table, translateAndCache mutation, getCachedTranslation query"
```

---

### Task 2b: Bilingual questions in merge.ts

**Files:**
- Modify: `convex/merge.ts`

- [ ] **Step 1: Update `convex/merge.ts` — change question label to support bilingual labels**

The `buildQuestion` function and question generation must output `label` as `Record<string, string>`.

Update the pendingQuestions schema type in `convex/schema.ts` (line 60):
```ts
label: v.string(),        // avant
label: v.union(            // après
  v.string(),
  v.object({ fr: v.string(), en: v.string() }),
),
```

- [ ] **Step 2: Modify `merge.ts` — generate bilingual labels**

Change `FIELD_LABELS` to be bilingual:
```ts
const FIELD_LABELS: Record<string, { fr: string; en: string }> = {
  operatorName:     { fr: "Nom de l'opérateur",    en: "Operator name" },
  operatorAddress:  { fr: "Adresse de l'opérateur", en: "Operator address" },
  operatorEmail:    { fr: "Email de l'opérateur",   en: "Operator email" },
  operatorPhone:    { fr: "Téléphone de l'opérateur", en: "Operator phone" },
  eoriNumber:       { fr: "Numéro EORI",            en: "EORI number" },
  supplierName:     { fr: "Nom du fournisseur",     en: "Supplier name" },
  supplierAddress:  { fr: "Adresse du fournisseur", en: "Supplier address" },
  supplierEmail:    { fr: "Email du fournisseur",   en: "Supplier email" },
  commodityName:    { fr: "Dénomination",           en: "Commodity" },
  scientificName:   { fr: "Nom scientifique",       en: "Scientific name" },
  hsCode:           { fr: "Code SH",                en: "HS code" },
  quantity:         { fr: "Quantité",               en: "Quantity" },
  quantityUnit:     { fr: "Unité",                  en: "Unit" },
  shipmentRef:      { fr: "Référence d'envoi",      en: "Shipment reference" },
  countryOfExport:  { fr: "Pays d'exportation",     en: "Country of export" },
  countryOfProduction: { fr: "Pays de production",  en: "Country of production" },
  productionDate:   { fr: "Date de production",     en: "Production date" },
  region:           { fr: "Région",                 en: "Region" },
  portOfLoading:    { fr: "Port de chargement",     en: "Port of loading" },
  portOfEntry:      { fr: "Port d'entrée",          en: "Port of entry" },
  farmName:         { fr: "Nom de l'exploitation",  en: "Farm name" },
  villageName:      { fr: "Nom du village",         en: "Village name" },
  certifications:   { fr: "Certifications",         en: "Certifications" },
  geoJson:          { fr: "Données géospatiales",   en: "Geospatial data" },
}
```

Update `fieldLabel()` to return the bilingual object:
```ts
function fieldLabel(field: string): { fr: string; en: string } {
  return FIELD_LABELS[field] ?? { fr: field, en: field }
}
```

Update question generation to produce bilingual labels. For template labels:
```ts
// Before: `Veuillez fournir ${fieldLabel(field)}`
// After:
label: {
  fr: `Veuillez fournir ${fieldLabel(field).fr}`,
  en: `Please provide ${fieldLabel(field).en}`,
}
```

For conflict labels like `Quantité divergente: X vs Y`:
```ts
label: {
  fr: `Quantité divergente: ${uniqueValues.join(" vs ")}`,
  en: `Conflicting quantity: ${uniqueValues.join(" vs ")}`,
}
```

Update the LLM prompt (line 243) to ask for both languages:
```ts
const llmResult = await callLiteLLM("text-primary", [
  { role: "user", content: `Generate human-readable labels in French AND English for these missing/conflicting EUDR compliance fields:\n${conflictFields}\n\nReturn JSON array: [{ "id": "conflict-fieldName", "label": { "fr": "French label", "en": "English label" } }]\nReturn ONLY valid JSON.` },
])
```

Update `buildQuestion` to accept bilingual labels:
```ts
function buildQuestion(question: {
  id: string
  field: string
  type: string
  label: { fr: string; en: string }
  options?: string[]
  geoType?: "file" | "coordinates" | null
}) {
  return {
    id: question.id,
    field: question.field,
    type: question.type,
    label: question.label,
    ...(question.options ? { options: question.options } : {}),
    geoType: question.geoType ?? null,
  }
}
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add convex/merge.ts convex/schema.ts
git commit -m "feat: generate bilingual question labels in merge.ts (fr + en)"
```

---

### Task 3: Frontend — useTranslatedValue hook + commodity lookup table

**Files:**
- Create: `src/lib/commodity-translations.ts`
- Create: `src/hooks/use-translated-value.ts`

- [ ] **Step 1: Create `src/lib/commodity-translations.ts`**

```ts
export type SupportedLocale = "en" | "fr"

const COMMODITY_TRANSLATIONS: Record<string, Partial<Record<SupportedLocale, string>>> = {
  // Cocoa
  "Raw Cocoa Beans": { fr: "Fèves de cacao" },
  "Cocoa Beans": { fr: "Fèves de cacao" },
  "Cocoa": { fr: "Cacao" },
  // Coffee
  "Robusta Coffee": { fr: "Café Robusta" },
  "Arabica Coffee": { fr: "Café Arabica" },
  "Coffee": { fr: "Café" },
  "Green Coffee": { fr: "Café vert" },
  // Palm oil
  "Palm Oil": { fr: "Huile de palme" },
  "Crude Palm Oil": { fr: "Huile de palme brute" },
  // Soy
  "Soy": { fr: "Soja" },
  "Soybeans": { fr: "Soja" },
  "Soya": { fr: "Soja" },
  // Rubber
  "Natural Rubber": { fr: "Caoutchouc naturel" },
  "Rubber": { fr: "Caoutchouc" },
  // Timber / Wood
  "Timber": { fr: "Bois d'œuvre" },
  "Wood": { fr: "Bois" },
  "Sawn Wood": { fr: "Bois scié" },
  "Plywood": { fr: "Contreplaqué" },
  "Pulp": { fr: "Pâte à papier" },
  // Cattle / Beef
  "Beef": { fr: "Bœuf" },
  "Cattle": { fr: "Bovins" },
  "Bovine": { fr: "Bovin" },
  "Leather": { fr: "Cuir" },
  // Maize
  "Maize": { fr: "Maïs" },
  "Corn": { fr: "Maïs" },
  // Other EUDR-relevant
  "Cassava": { fr: "Manioc" },
  "Cotton": { fr: "Coton" },
  "Banana": { fr: "Banane" },
  "Sugar Cane": { fr: "Canne à sucre" },
  "Palm Kernel": { fr: "Amande de palme" },
  "Palm Kernel Oil": { fr: "Huile de palmiste" },
  // French → English reverse entries
  "Fèves de cacao": { en: "Cocoa Beans" },
  "Café Robusta": { en: "Robusta Coffee" },
  "Café Arabica": { en: "Arabica Coffee" },
  "Huile de palme": { en: "Palm Oil" },
  "Soja": { en: "Soybeans" },
  "Caoutchouc naturel": { en: "Natural Rubber" },
  "Bois": { en: "Wood" },
  "Bœuf": { en: "Beef" },
  "Maïs": { en: "Maize" },
}

export function translateCommodity(
  text: string,
  targetLang: SupportedLocale,
): string | null {
  if (targetLang === "en") return null // already English
  const entry = COMMODITY_TRANSLATIONS[text]
  if (!entry) return null
  return entry[targetLang] ?? null
}
```

- [ ] **Step 2: Create `src/hooks/use-translated-value.ts`**

```ts
import { useQuery } from "convex/react"
import { useEffect, useState } from "react"
import { api } from "@cvx/_generated/api"
import { useCurrentLocale } from "@/hooks/use-current-locale"
import { translateCommodity, type SupportedLocale } from "@/lib/commodity-translations"

const SOURCE_LANG = "en" // extracted data is in English

export function useTranslatedValue(value: string | null | undefined): string | null | undefined {
  const locale = useCurrentLocale()
  const [translated, setTranslated] = useState<string | null | undefined>(value)

  const cached = useQuery(
    api.getTranslation.getCachedTranslation,
    value && locale !== SOURCE_LANG
      ? { sourceText: value, sourceLang: SOURCE_LANG, targetLang: locale }
      : "skip",
  )

  useEffect(() => {
    if (!value) {
      setTranslated(value)
      return
    }
    if (locale === SOURCE_LANG) {
      setTranslated(value)
      return
    }

    // 1. Check lookup table
    const lookup = translateCommodity(value, locale as SupportedLocale)
    if (lookup) {
      setTranslated(lookup)
      return
    }
  }, [value, locale])

  useEffect(() => {
    if (cached !== undefined) {
      setTranslated(cached)
    }
  }, [cached])

  // If cache miss (cached === null), the component should trigger translateAndCache
  // This is handled by the parent component calling the mutation

  return translated
}
```

Also create `src/hooks/use-current-locale.ts`:
```ts
import { useTranslation } from "react-i18next"

export function useCurrentLocale(): string {
  const { i18n } = useTranslation()
  return i18n.language?.split("-")[0] ?? "en"
}
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/commodity-translations.ts src/hooks/use-translated-value.ts src/hooks/use-current-locale.ts
git commit -m "feat: add commodity translations lookup table and useTranslatedValue hook"
```

---

### Task 4: Language selector in navigation + locale initialization

**Files:**
- Modify: `src/routes/_app/_auth/dashboard/-ui.navigation.tsx`
- Create: `src/hooks/use-initialize-locale.ts`
- Modify: `src/app.tsx`

- [ ] **Step 1: Create `src/hooks/use-initialize-locale.ts`**

```ts
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

const SUPPORTED = ["en", "fr"]

export function useInitializeLocale() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const stored = localStorage.getItem("antaios:locale")
    if (stored && SUPPORTED.includes(stored)) {
      i18n.changeLanguage(stored)
      return
    }

    const browserLang = navigator.language?.split("-")[0]
    if (browserLang && SUPPORTED.includes(browserLang)) {
      i18n.changeLanguage(browserLang)
      return
    }

    const osLang = Intl.DateTimeFormat().resolvedOptions().locale?.split("-")[0]
    if (osLang && SUPPORTED.includes(osLang)) {
      i18n.changeLanguage(osLang)
      return
    }

    i18n.changeLanguage("en")
  }, [i18n])
}
```

- [ ] **Step 2: Update `src/app.tsx` — use locale initialization hook**

Add inside `InnerApp` before the RouterProvider:
```tsx
import { useInitializeLocale } from "@/hooks/use-initialize-locale"

function InnerApp() {
  useInitializeLocale()

  if (!queryClient) {
    return (
      <SetupError
        errors={[
          "React Query is unavailable because configuration is incomplete.",
        ]}
      />
    );
  }

  return <RouterProvider router={router} context={{ queryClient }} />;
}
```

- [ ] **Step 3: Update navigation to include language selector**

Modify `src/routes/_app/_auth/dashboard/-ui.navigation.tsx`:

Add to imports:
```tsx
import { useTranslation } from "react-i18next"
import { Globe } from "lucide-react"
```

Add state/locale logic inside `Navigation`:
```tsx
import { useMutation } from "convex/react"
import { api } from "@cvx/_generated/api"

export function Navigation({ user }: { user: User }) {
  const { t, i18n } = useTranslation()
  const [localeOpen, setLocaleOpen] = useState(false)
  const currentLang = i18n.language?.split("-")[0] ?? "en"
  const updateUserLocale = useMutation(api.app.updateUserLocale)

  const switchLocale = (lang: string) => {
    localStorage.setItem("antaios:locale", lang)
    i18n.changeLanguage(lang)
    updateUserLocale({ locale: lang })
    setLocaleOpen(false)
  }

  // ... rest of existing component
```

Add the language selector button after the UserButton, before the closing `</div>`:
```tsx
<div className="relative">
  <button
    onClick={() => setLocaleOpen(!localeOpen)}
    className="flex h-10 w-10 items-center justify-center rounded-md text-primary/60 hover:bg-primary/5 hover:text-primary"
    title={t("locale.select")}
  >
    <Globe className="h-5 w-5 stroke-[1.5px]" />
  </button>
  {localeOpen && (
    <div className="absolute right-0 top-full mt-1 min-w-[140px] rounded-md border bg-popover p-1 shadow-md">
      {["en", "fr"].map((lang) => (
        <button
          key={lang}
          onClick={() => switchLocale(lang)}
          className={`flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-sm ${
            currentLang === lang
              ? "bg-accent text-accent-foreground font-medium"
              : "text-popover-foreground hover:bg-accent/50"
          }`}
        >
          {lang === "en" ? "🇬🇧" : "🇫🇷"} {t(`locale.${lang}`)}
        </button>
      ))}
    </div>
  )}
</div>
```

Add `useState` to imports:
```tsx
import { useState } from "react"
```

Also, add an `updateUserLocale` mutation in `convex/app.ts`:
```ts
export const updateUserLocale = mutation({
  args: { locale: v.string() },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx)
    if (!user) return
    await ctx.db.patch(user._id, { locale: args.locale })
  },
})
```

And add `locale` field to the users schema in `convex/schema.ts`:
```ts
users: defineTable({
  clerkUserId: v.string(),
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  locale: v.optional(v.string()),  // add this
})
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-initialize-locale.ts src/app.tsx src/routes/_app/_auth/dashboard/-ui.navigation.tsx convex/app.ts convex/schema.ts
git commit -m "feat: add language selector in nav, 3-layer locale detection, user.locale storage"
```

---

### Task 5: Migration — shipment-ui.ts + formatters.ts + ExtractedDataGrid

**Files:**
- Modify: `src/lib/shipment-ui.ts`
- Modify: `src/lib/formatters.ts`
- Modify: `src/components/shipments/ExtractedDataGrid.tsx`

- [ ] **Step 1: Migrate `src/lib/shipment-ui.ts`**

Replace hardcoded French with `t()` calls:
```ts
import { useTranslation } from "react-i18next"

export function statusLabel(status?: string): string {
  const { t } = useTranslation()
  const key = status ?? ""
  const label = t(`status.${key}`, { defaultValue: "" })
  return label || status || t("completeness.unknown")
}
```

For `completenessLabel`:
```ts
export function completenessLabel(completeness?: string): string {
  const { t } = useTranslation()
  const key = completeness ?? ""
  const label = t(`completeness.${key}`, { defaultValue: "" })
  return label || t("completeness.unknown")
}
```

For `fieldGroups` — use t() keys instead of hardcoded strings:
```ts
// labels inside fieldGroups become keys
{ key: "commodityName", label: "fields.commodityName" },  // used with t()
```

Since `fieldGroups` is used outside hooks context, change to a function that accepts `t`:
```ts
export function getFieldGroups(t: (key: string) => string) {
  return [
    {
      title: t("fields_group.operator"),
      fields: [
        { key: "operatorName", label: t("fields.operatorName") },
        { key: "eoriNumber", label: t("fields.eoriNumber") },
      ],
    },
    // ... same pattern
  ]
}
```

Update `fieldLabel`:
```ts
export function fieldLabel(key: string): string {
  const { t } = useTranslation()
  for (const group of fieldGroups) {
    const field = group.fields.find((f) => f.key === key)
    if (field) return field.label
  }
  return key
}
```

Update `displayValue` — replace `"Oui"` / `"Non"`:
```ts
export function displayValue(value: unknown): string {
  const { t } = useTranslation()
  if (value === null || value === undefined) return "-"
  if (typeof value === "number") return new Intl.NumberFormat("fr-FR").format(value)
  if (typeof value === "boolean") return value ? t("fields_value.yes") : t("fields_value.no")
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}
```

Update `countryName` — keep as-is (country names stay French for now, translated versions can be added later via the same pattern).

- [ ] **Step 2: Migrate `src/lib/formatters.ts`**

No changes needed — already uses `Intl` with `fr` locale. The locale will follow the user's preference when we make it dynamic.

- [ ] **Step 3: Migrate `src/components/shipments/ExtractedDataGrid.tsx`**

Replace `"Ajouter"` with `{t("add")}`, `"Aucune donnée extraite"` with `{t("extracted_data.empty")}`, etc.

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/shipment-ui.ts src/components/shipments/ExtractedDataGrid.tsx
git commit -m "feat: migrate shipment-ui, ExtractedDataGrid to i18n keys"
```

---

### Task 6: Migration — ShipmentDetailPanel + ShipmentList + ShipmentCard + CreateShipmentPanel

**Files:**
- Modify: `src/components/shipments/ShipmentDetailPanel.tsx`
- Modify: `src/components/shipments/ShipmentList.tsx`
- Modify: `src/components/shipments/ShipmentCard.tsx`
- Modify: `src/components/shipments/CreateShipmentPanel.tsx`

- [ ] **Step 1-4: Migrate each component**

For each file:
1. Add `import { useTranslation } from "react-i18next"` and `const { t } = useTranslation()` at the top of the component
2. Replace all hardcoded French strings with `t("key")` using the keys from `en.json`/`fr.json`
3. Replace `"Raw Cocoa Beans"` fallback with the commodity value displayed through `useTranslatedValue`

Example for ShipmentDetailPanel.tsx commodity display:
```tsx
import { useTranslatedValue } from "@/hooks/use-translated-value"

// Inside component:
const commodityName = useTranslatedValue(data?.commodityName as string)
// Display:
<h2>{commodityName ?? "Raw Cocoa Beans"}</h2>
```

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/components/shipments/ShipmentDetailPanel.tsx src/components/shipments/ShipmentList.tsx src/components/shipments/ShipmentCard.tsx src/components/shipments/CreateShipmentPanel.tsx
git commit -m "feat: migrate detail panel, list, card, create panel to i18n"
```

---

### Task 7: Migration — ConflictResolutionDialog + question components

**Files:**
- Modify: `src/components/shipments/ConflictResolutionDialog.tsx`
- Modify: `src/components/shipments/ConflictQuestion.tsx`
- Modify: `src/components/shipments/TextQuestion.tsx`
- Modify: `src/components/shipments/GeoQuestion.tsx`
- Modify: `src/components/shipments/ProgressStepper.tsx`

- [ ] **Step 1: Migrate `ConflictResolutionDialog.tsx`**

Replace all French strings with `t("conflict.*")` keys. For questions, use the bilingual label stored in the question:
```tsx
const { t, i18n } = useTranslation()
const locale = i18n.language?.split("-")[0] ?? "en"

// Display question label:
question.label[locale] ?? question.label.fr ?? question.label
```

The `question.label` is `{ fr: "...", en: "..." }` from the bilingual merge. Access the right language.

- [ ] **Step 2: Migrate question components**

Same pattern — replace hardcoded French strings with `t()` calls.

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/shipments/ConflictResolutionDialog.tsx src/components/shipments/ConflictQuestion.tsx src/components/shipments/TextQuestion.tsx src/components/shipments/GeoQuestion.tsx src/components/shipments/ProgressStepper.tsx
git commit -m "feat: migrate conflict resolution and question components to i18n"
```

---

### Task 8: Migration — Supplier portal + remaining components

**Files:**
- Modify: `src/routes/supplier/$token.tsx`
- Modify: `src/components/supplier/SupplierQuestionStepper.tsx`
- Modify: `src/components/shipments/DeforestationScanSection.tsx`
- Modify: `src/components/shipments/DocumentList.tsx`
- Modify: `src/routes/_app/_auth/dashboard/_layout.shipments.tsx`
- Modify: `src/routes/_app/_auth.tsx`
- Modify: `src/routes/_app/login/_layout.index.tsx`
- Modify: `src/routes/legal/*.tsx`

- [ ] **Step 1-4: Migrate remaining components**

Same pattern as Tasks 5-7. Replace hardcoded French with `t("key")`.

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/routes/supplier/ src/components/supplier/ src/components/shipments/DeforestationScanSection.tsx src/components/shipments/DocumentList.tsx src/routes/_app/
git commit -m "feat: migrate remaining components to i18n"
```

---

### Task 9: Documentation — how to add a new language

**Files:**
- Create: `docs/how-to-add-a-language.md`

- [ ] **Step 1: Create `docs/how-to-add-a-language.md`**

```md
# How to add a new language to Antaios

This guide covers all the places that need changes when adding a new language.

## 1. Create locale file

Create `src/locales/{code}.json` (e.g., `es.json` for Spanish).

Copy `src/locales/en.json` as a starting template and translate all values.

## 2. Register in i18n config

Edit `src/lib/i18n.ts`:

- Import the new locale file
- Add it to the `resources` object
- Add the language code to `SUPPORTED_LANGS`

## 3. Add to commodity lookup table

Edit `src/lib/commodity-translations.ts`:

- Add the new language code to `SupportedLocale` type
- Add translations to `COMMODITY_TRANSLATIONS` for common commodities

Example:
```ts
export type SupportedLocale = "en" | "fr" | "es"

const COMMODITY_TRANSLATIONS = {
  "Raw Cocoa Beans": { fr: "Fèves de cacao", es: "Granos de cacao crudos" },
  // ...
}
```

## 4. Add bilingual labels to merge.ts

Edit `convex/merge.ts`:

- Add the new language to `FIELD_LABELS`:
```ts
const FIELD_LABELS: Record<string, { fr: string; en: string; es: string }> = {
  operatorName: { fr: "...", en: "...", es: "..." },
  // ...
}
```

## 5. Add language switcher option

Edit `src/routes/_app/_auth/dashboard/-ui.navigation.tsx`:

- Add the new language to the `switchLocale` dropdown

## 6. Add to locale detection

Edit `src/hooks/use-initialize-locale.ts`:

- Add the new language code to `SUPPORTED`

## 7. Add to user schema (optional)

If you want the language persisted per-user:

Edit `convex/schema.ts` — no change needed, `locale` is already `v.optional(v.string())`.

## Files checklist

| File | Change |
|---|---|
| `src/locales/{code}.json` | Create — all UI translations |
| `src/lib/i18n.ts` | Import + register locale |
| `src/lib/commodity-translations.ts` | Add commodity translations |
| `convex/merge.ts` | Add FIELD_LABELS for new language |
| `src/routes/_app/_auth/dashboard/-ui.navigation.tsx` | Add to dropdown |
| `src/hooks/use-initialize-locale.ts` | Add to detection |
```

- [ ] **Step 2: Commit**

```bash
git add docs/how-to-add-a-language.md
git commit -m "docs: add how-to-add-a-language guide"
```

---

### Task 10: Final typecheck + lint

- [ ] **Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: no errors

- [ ] **Step 3: Final commit if needed**

```bash
git add -A && git commit -m "chore: fix typecheck and lint after i18n migration"
```
