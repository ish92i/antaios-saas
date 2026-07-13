export type BilingualLabel = Record<string, string>

export const FIELD_LABELS: Record<string, Record<string, string>> = {
  operatorName:     { de: "Name des Betreibers", en: "Operator name", es: "Nombre del operador", fr: "Nom de l'opérateur", it: "Nome dell'operatore", nl: "Naam van de operator", pt: "Nome do operador" },
  operatorAddress:  { de: "Adresse des Betreibers", en: "Operator address", es: "Dirección del operador", fr: "Adresse de l'opérateur", it: "Indirizzo dell'operatore", nl: "Adres van de operator", pt: "Endereço do operador" },
  operatorEmail:    { de: "E-Mail des Betreibers", en: "Operator email", es: "Correo electrónico del operador", fr: "Email de l'opérateur", it: "Email dell'operatore", nl: "E-mail van de operator", pt: "E-mail do operador" },
  operatorPhone:    { de: "Telefon des Betreibers", en: "Operator phone", es: "Teléfono del operador", fr: "Téléphone de l'opérateur", it: "Telefono dell'operatore", nl: "Telefoon van de operator", pt: "Telefone do operador" },
  eoriNumber:       { de: "EORI-Nummer", en: "EORI number", es: "Número EORI", fr: "Numéro EORI", it: "Numero EORI", nl: "EORI-nummer", pt: "Número EORI" },
  supplierName:     { de: "Name des Lieferanten", en: "Supplier name", es: "Nombre del proveedor", fr: "Nom du fournisseur", it: "Nome del fornitore", nl: "Naam van de leverancier", pt: "Nome do fornecedor" },
  supplierAddress:  { de: "Adresse des Lieferanten", en: "Supplier address", es: "Dirección del proveedor", fr: "Adresse du fournisseur", it: "Indirizzo del fornitore", nl: "Adres van de leverancier", pt: "Endereço do fornecedor" },
  supplierEmail:    { de: "E-Mail des Lieferanten", en: "Supplier email", es: "Correo electrónico del proveedor", fr: "Email du fournisseur", it: "Email del fornitore", nl: "E-mail van de leverancier", pt: "E-mail do fornecedor" },
  commodityName:    { de: "Ware", en: "Commodity", es: "Producto básico", fr: "Dénomination", it: "Materia prima", nl: "Grondstof", pt: "Mercadoria" },
  scientificName:   { de: "Wissenschaftlicher Name", en: "Scientific name", es: "Nombre científico", fr: "Nom scientifique", it: "Nome scientifico", nl: "Wetenschappelijke naam", pt: "Nome científico" },
  hsCode:           { de: "HS-Code", en: "HS code", es: "Código SA", fr: "Code SH", it: "Codice SA", nl: "GS-code", pt: "Código SH" },
  quantity:         { de: "Menge", en: "Quantity", es: "Cantidad", fr: "Quantité", it: "Quantità", nl: "Hoeveelheid", pt: "Quantidade" },
  quantityUnit:     { de: "Einheit", en: "Unit", es: "Unidad", fr: "Unité", it: "Unità", nl: "Eenheid", pt: "Unidade" },
  shipmentRef:      { de: "Sendungsreferenz", en: "Shipment reference", es: "Referencia del envío", fr: "Référence d'envoi", it: "Riferimento spedizione", nl: "Zendingsreferentie", pt: "Referência da remessa" },
  countryOfExport:  { de: "Ausfuhrland", en: "Country of export", es: "País de exportación", fr: "Pays d'exportation", it: "Paese di esportazione", nl: "Land van uitvoer", pt: "País de exportação" },
  countryOfProduction: { de: "Erzeugerland", en: "Country of production", es: "País de producción", fr: "Pays de production", it: "Paese di produzione", nl: "Land van productie", pt: "País de produção" },
  productionDate:   { de: "Produktionsdatum", en: "Production date", es: "Fecha de producción", fr: "Date de production", it: "Data di produzione", nl: "Productiedatum", pt: "Data de produção" },
  region:           { de: "Region", en: "Region", es: "Región", fr: "Région", it: "Regione", nl: "Regio", pt: "Região" },
  portOfLoading:    { de: "Verladehafen", en: "Port of loading", es: "Puerto de carga", fr: "Port de chargement", it: "Porto di carico", nl: "Laadhaven", pt: "Porto de carregamento" },
  portOfEntry:      { de: "Eingangshafen", en: "Port of entry", es: "Puerto de entrada", fr: "Port d'entrée", it: "Porto di entrata", nl: "Haven van binnenkomst", pt: "Porto de entrada" },
  farmName:         { de: "Name des Betriebs", en: "Farm name", es: "Nombre de la finca", fr: "Nom de l'exploitation", it: "Nome dell'azienda agricola", nl: "Naam van het bedrijf", pt: "Nome da propriedade" },
  villageName:      { de: "Name des Dorfes", en: "Village name", es: "Nombre de la aldea", fr: "Nom du village", it: "Nome del villaggio", nl: "Naam van het dorp", pt: "Nome da vila" },
  certifications:   { de: "Zertifizierungen", en: "Certifications", es: "Certificaciones", fr: "Certifications", it: "Certificazioni", nl: "Certificeringen", pt: "Certificações" },
  certificationType: { de: "Zertifizierungsart", en: "Certification type", es: "Tipo de certificación", fr: "Type de certification", it: "Tipo di certificazione", nl: "Type certificering", pt: "Tipo de certificação" },
  certificationBody: { de: "Zertifizierungsstelle", en: "Certification body", es: "Organismo certificador", fr: "Organisme certificateur", it: "Ente certificatore", nl: "Certificerende instantie", pt: "Organismo certificador" },
  geoJson:          { de: "Geodaten", en: "Geospatial data", es: "Datos geoespaciales", fr: "Données géospatiales", it: "Dati geospaziali", nl: "Geospatiale gegevens", pt: "Dados geoespaciais" },
}

export function resolveLabel(label: string | BilingualLabel, locale?: string, field?: string): string {
  if (typeof label === "string") {
    const lang = locale && ["en", "fr", "es", "de", "nl", "pt", "it"].includes(locale) ? locale : "en"
    if (field && FIELD_LABELS[field]) return FIELD_LABELS[field][lang] ?? FIELD_LABELS[field]["en"] ?? field
    return label
  }
  const lang = locale && ["en", "fr", "es", "de", "nl", "pt", "it"].includes(locale) ? locale : "en"
  return label[lang] ?? label["en"] ?? ""
}
