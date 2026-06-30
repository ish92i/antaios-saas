import { GFW_API_KEY } from "@cvx/env"

const GFW_URL = "https://data-api.globalforestwatch.org"

export interface GfwAlertResult {
  alert_count: number
}

export async function queryGfwAlerts(
  geoJson: unknown,
  dateCutoff?: string,
): Promise<GfwAlertResult> {
  if (!GFW_API_KEY) throw new Error("GFW_API_KEY not set")

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
        geometry: geoJson,
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
