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
  if (targetLang === "en") return null
  const entry = COMMODITY_TRANSLATIONS[text]
  if (!entry) return null
  return entry[targetLang] ?? null
}
