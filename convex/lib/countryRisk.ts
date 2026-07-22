// EC EUDR country benchmarking — Article 29, published May 2025.
// Source: https://green-forum.ec.europa.eu/nature-and-biodiversity/deforestation-regulation-implementation/eudr-cooperation-and-partnerships/country-classification-list_en
// EC benchmarking is reviewed periodically; recheck the URL above for updates around mid-2027.

const HIGH_RISK_COUNTRIES = new Set(["BY", "KP", "MM", "RU"])

const STANDARD_RISK_COUNTRIES = new Set([
  "AO", "AR", "BZ", "BJ", "BO", "BW", "BR", "BF",
  "KH", "CM", "TD", "CO", "CI", "CD", "EC", "SV",
  "GQ", "ER", "ET", "GM", "GT", "GN", "GW", "HT",
  "HN", "ID", "IL", "LR", "MY", "MW", "MR", "MX",
  "MZ", "NA", "NI", "NE", "NG", "PK", "PA", "PY",
  "PE", "SN", "SL", "SO", "SD", "TZ", "UG", "VE",
  "ZM", "ZW",
])

// All countries in the EC classification (high + standard + low). Used to reject
// unrecognized codes rather than silently defaulting to low risk.
const EC_CLASSIFIED_COUNTRIES = new Set([
  ...HIGH_RISK_COUNTRIES,
  ...STANDARD_RISK_COUNTRIES,
  // Low risk
  "AF", "AL", "AD", "AG", "AM", "AT", "AU", "AZ",
  "BS", "BH", "BD", "BB", "BE", "BT", "BA", "BG", "BI", "BN",
  "CA", "CV", "CF", "CL", "KM", "CG", "CR", "HR", "CU", "CY", "CZ",
  "DK", "DJ", "DM", "DO",
  "EE", "EG", "SZ", "FJ", "FI", "FR",
  "GA", "DE", "GR", "GD", "GY",
  "HU",
  "IS", "IN", "IQ", "IR", "IE", "IT",
  "JM", "JP", "JO",
  "KZ", "KE", "KI", "KW", "KG",
  "LA", "LV", "LB", "LS", "LI", "LT", "LU",
  "MG", "MV", "MT", "MH", "MU", "MC", "MN", "ME", "MA",
  "NR", "NP", "NL", "NZ", "MK", "NO",
  "OM",
  "PW", "PS", "PG", "PH", "PL", "PT",
  "QA",
  "KR", "MD", "RO", "RW",
  "KN", "LC", "VC", "WS", "SM", "ST", "SA", "RS", "SC", "SG", "SK", "SI", "SB", "ZA", "SS", "ES", "LK", "SR", "SE", "CH", "SY",
  "TJ", "TH", "TL", "TG", "TO", "TT", "TN", "TR", "TM", "TV",
  "UA", "AE", "GB", "US", "UY", "UZ",
  "VU", "VN",
  "YE",
])

export function classifyCountryRisk(iso: string | undefined): "low" | "standard" | "high" | null {
  if (!iso) return null
  const code = iso.toUpperCase().trim()
  if (!EC_CLASSIFIED_COUNTRIES.has(code)) return null
  if (HIGH_RISK_COUNTRIES.has(code)) return "high"
  if (STANDARD_RISK_COUNTRIES.has(code)) return "standard"
  return "low"
}
