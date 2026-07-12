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

## 4. Add bilingual labels to merge.ts

Edit `convex/merge.ts`:
- Add the new language to `FIELD_LABELS` for all fields
- The existing languages serve as a template

## 5. Add language switcher option

Edit `src/routes/_app/_auth/dashboard/-ui.navigation.tsx`:
- Add the language to the `["en", "fr"]` array in `switchLocale`

## 6. Add to locale detection

Edit `src/hooks/use-initialize-locale.ts`:
- Add the new language code to the `SUPPORTED` array

## 7. Add to user schema (optional)

No change needed — `locale` is already `v.optional(v.string())` in the Convex schema.

## Files checklist

| # | File | Action |
|---|------|--------|
| 1 | `src/locales/{code}.json` | Create — translate all UI strings |
| 2 | `src/lib/i18n.ts` | Import + register locale |
| 3 | `src/lib/commodity-translations.ts` | Add commodity translations |
| 4 | `convex/merge.ts` | Add FIELD_LABELS for new language |
| 5 | `src/routes/_app/_auth/dashboard/-ui.navigation.tsx` | Add to dropdown options |
| 6 | `src/hooks/use-initialize-locale.ts` | Add to SUPPORTED array |
