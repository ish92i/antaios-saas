import { GFW_API_KEY } from "@cvx/env"

const GFW_URL = "https://data-api.globalforestwatch.org"

interface GeoJsonGeometry {
  type: string
  coordinates: unknown
}

interface GeoJsonFeature {
  type: "Feature"
  geometry: GeoJsonGeometry
  properties?: Record<string, unknown>
}

interface GeoJsonFeatureCollection {
  type: "FeatureCollection"
  features: GeoJsonFeature[]
}

export interface GfwAlertResult {
  alert_count: number
}

function normalizeGeometry(input: unknown): GeoJsonGeometry | null {
  if (!input || typeof input !== "object") return null

  const obj = input as Record<string, unknown>

  if (obj.type === "FeatureCollection") {
    const features = (obj as unknown as GeoJsonFeatureCollection).features
    if (!features || features.length === 0) return null
    return features[0]?.geometry ?? null
  }

  if (obj.type === "Feature") {
    return (obj as unknown as GeoJsonFeature).geometry ?? null
  }

  if (obj.type && obj.coordinates) {
    return obj as unknown as GeoJsonGeometry
  }

  return null
}

export async function queryGfwAlerts(
  geoJson: unknown,
  dateCutoff?: string,
): Promise<GfwAlertResult> {
  if (!GFW_API_KEY) throw new Error("GFW_API_KEY not set")

  const geometry = normalizeGeometry(geoJson)
  if (!geometry) return { alert_count: 0 }

  const response = await fetch(
    `${GFW_URL}/dataset/gfw_integrated_alerts/latest/query/json`,
    {
      method: "POST",
      headers: {
        "x-api-key": GFW_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: `SELECT COUNT(*) as alert_count FROM results WHERE gfw_integrated_alerts__date >= '${dateCutoff ?? "2020-12-31"}'`,
        geometry,
      }),
    },
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GFW API error ${response.status}: ${text}`)
  }

  const data = (await response.json()) as GfwAlertResult[]
  return data[0] ?? { alert_count: 0 }
}
