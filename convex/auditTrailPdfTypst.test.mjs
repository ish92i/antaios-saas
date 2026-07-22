import { mkdtemp, readFile, rm, stat } from "node:fs/promises"
import { constants } from "node:fs"
import { access } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { spawn } from "node:child_process"

const root = resolve(new URL("..", import.meta.url).pathname)
const templatePath = join(root, "convex", "templates", "audit-trail.typ")
const logoPath = join(root, "convex", "templates", "audit-trail-logo.png")
const actionPath = join(root, "convex", "auditTrailPdf.ts")
const locales = ["fr", "en", "de", "es", "nl", "pt"]

async function commandExists(name) {
  const paths = (process.env.PATH ?? "").split(":")
  for (const dir of paths) {
    try {
      await access(join(dir, name), constants.X_OK)
      return true
    } catch {
      // Continue probing PATH.
    }
  }
  return false
}

function run(command, args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (chunk) => { stdout += chunk })
    child.stderr.on("data", (chunk) => { stderr += chunk })
    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) resolveRun({ stdout, stderr })
      else reject(new Error(`${command} ${args.join(" ")} failed (${code})\n${stderr || stdout}`))
    })
  })
}

function basePayload(locale, overrides = {}) {
  const longRationale = "Satellite review, declared supplier documents, and chain-of-custody evidence were reviewed together. This intentionally long rationale must wrap inside the criteria table without clipping, overlapping adjacent columns, or escaping the page margins."
  return {
    locale,
    logoPath,
    title: "Audit Trail - EUDR Traceability",
    shipmentReference: `SHIP-${locale.toUpperCase()}-001`,
    generatedOn: "21/07/2026",
    labels: {
      shipment_ref: "Shipment reference",
      generated_on: "Generated on",
      company: "Company",
      eori: "EORI / SIRET number",
      commodity: "Commodity",
      hs_code: "HS code",
      country_of_production: "Country of production",
      supplier: "Supplier",
      quantity: "Quantity / Net mass",
      plot_reference: "Plot reference",
      dds_reference: "DDS reference",
      risk_assessment: "Risk assessment (Art. 10(2))",
      article10: "Article 10(2)",
      criterion: "Criterion",
      evaluation: "Evaluation",
      source: "Source",
      rationale: "Rationale",
      verdict: "Verdict",
      flagged_criteria: "Criteria that drove a non-negligible result",
      mitigation_actions: "Mitigation actions",
      mitigation_trigger: "Mitigation trigger",
      document_stamp: "Version / hash",
      retention_notice: "Retained per Art. 12 EUDR - 5 years from risk-assessment generation",
      page: "Page",
      none: "None",
    },
    shipment: {
      company: "Antaios Demo Operator",
      eori: "FR12345678900011",
      commodity: "Cocoa beans",
      hsCode: "1801",
      countryOfProduction: "Cote d'Ivoire",
      supplier: "Cooperative Koba",
      quantity: "24,000 kg",
      plotReference: "CI-AB-2026-0001",
      ddsReference: "DDS-2026-0001",
    },
    criteria: [
      {
        id: "country_risk",
        article10Criterion: "10(2)(a)",
        label: "Country / production area risk",
        evaluation: "Low",
        source: "World Bank - AG.LND.FRST.ZS (2023)",
        rationale: longRationale,
        mitigationTrigger: "If country risk changes, collect additional origin evidence before DDS.",
        flagged: false,
      },
      {
        id: "deforestation_risk",
        article10Criterion: "10(2)(b)",
        label: "Forest presence and illegal deforestation",
        evaluation: "Clear",
        source: "Global Forest Watch satellite scan",
        rationale: longRationale,
        mitigationTrigger: "If alerts appear, collect geolocation and independent verification.",
        flagged: false,
      },
    ],
    verdict: "negligible",
    verdictLabel: "Negligible risk",
    verdictRationale: "All Article 10(2) criteria reviewed are clear, low, or complete.",
    flaggedCriteria: [],
    mitigationActions: [],
    retentionNotice: "Retained per Art. 12 EUDR - 5 years from risk-assessment generation",
    retentionAnchor: "21/07/2026",
    documentVersion: "Antaios Risk Engine v2",
    documentHash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    ...overrides,
  }
}

const cases = [
  ["clear", (locale) => basePayload(locale)],
  ["flagged", (locale) => basePayload(locale, {
    verdict: "non_negligible",
    verdictLabel: "Non-negligible risk",
    verdictRationale: "Risk remains non-negligible because one criterion requires mitigation before DDS.",
    flaggedCriteria: [
      {
        id: "deforestation_risk",
        label: "Forest presence and illegal deforestation",
        mitigationTrigger: "Request complete polygon, production-date evidence, and independent satellite review.",
      },
    ],
    mitigationActions: [
      {
        action: "Collect complete polygon and independent verification before placing product on market.",
        date: "21/07/2026",
      },
    ],
  })],
  ["unknown", (locale) => basePayload(locale, {
    verdict: "non_negligible",
    verdictLabel: "Non-negligible risk",
    criteria: [
      {
        id: "documentation_risk",
        article10Criterion: "10(2)(e)",
        label: "Authority communications, complaints, and document irregularities",
        evaluation: "Unknown",
        source: "Declared documents",
        rationale: "Evaluation was missing or unknown, so conservative handling must keep text visible and wrapped in the table.",
        mitigationTrigger: "Collect corrected documents and verify before DDS.",
        flagged: true,
      },
    ],
    flaggedCriteria: [
      {
        id: "documentation_risk",
        label: "Authority communications, complaints, and document irregularities",
        mitigationTrigger: "Collect corrected documents and verify before DDS.",
      },
    ],
  })],
]

async function main() {
  const action = await readFile(actionPath, "utf8")
  if (action.includes("AUDIT_TRAIL_PDF_RENDERER")) {
    throw new Error("Audit trail action must always use Typst; remove AUDIT_TRAIL_PDF_RENDERER gate")
  }

  const template = await readFile(templatePath, "utf8")
  for (const needle of ["sys.inputs", "json(", "image(", "criteria", "verdictRationale", "mitigationTrigger", "documentHash", "retentionNotice"]) {
    if (!template.includes(needle)) throw new Error(`Template missing required token: ${needle}`)
  }
  await stat(logoPath)

  if (!await commandExists("typst")) {
    console.log("typst not found; static template checks passed, compile checks skipped")
    return
  }

  const dir = await mkdtemp(join(tmpdir(), "antaios-audit-typst-"))
  try {
    for (const locale of locales) {
      for (const [name, makePayload] of cases) {
        const dataPath = join(dir, `${locale}-${name}.json`)
        const outPath = join(dir, `${locale}-${name}.pdf`)
        await import("node:fs/promises").then(({ writeFile }) => writeFile(dataPath, JSON.stringify(makePayload(locale), null, 2)))
        await run("typst", [
          "compile",
          "--root", "/",
          "--input", `data=${dataPath}`,
          "--input", `logo=${logoPath}`,
          templatePath,
          outPath,
        ])
        const output = await stat(outPath)
        if (output.size < 1000) throw new Error(`PDF too small for ${locale}/${name}: ${output.size}`)
      }
    }
  } finally {
    // await rm(dir, { recursive: true, force: true }) // TEMP: disabled for inspection
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
