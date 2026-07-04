import { ChevronDown, ChevronRight } from "lucide-react"

type GeoJsonGeometry = {
  type: string
  coordinates: unknown
}

type GeoJsonFeature = {
  type: "Feature"
  geometry: GeoJsonGeometry
  properties?: Record<string, unknown>
}

type GeoJsonFeatureCollection = {
  type: "FeatureCollection"
  features: GeoJsonFeature[]
}

export type GeoJsonInput = GeoJsonFeatureCollection | GeoJsonFeature

function extractRings(geoJson: GeoJsonInput): number[][][] {
  let geometry: GeoJsonGeometry | undefined

  if (geoJson.type === "FeatureCollection") {
    geometry = geoJson.features?.[0]?.geometry
  } else if (geoJson.type === "Feature") {
    geometry = geoJson.geometry
  }

  if (geometry?.type !== "Polygon") return []

  return geometry.coordinates as number[][][]
}

function normalizeCoords(
  rings: number[][][],
  width: number,
  height: number,
  pad: number,
): { points: string; viewBox: string } | null {
  if (!rings.length || !rings[0].length) return null

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const ring of rings) {
    for (const [x, y] of ring) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const scale = Math.min((width - pad * 2) / rangeX, (height - pad * 2) / rangeY)
  const ox = (width - rangeX * scale) / 2
  const oy = (height - rangeY * scale) / 2

  const points = rings
    .map((ring) =>
      ring
        .map(([x, y]) => {
          const sx = (x - minX) * scale + ox
          const sy = (y - minY) * scale + oy
          return `${sx},${sy}`
        })
        .join(" "),
    )
    .join(" ")

  return { points, viewBox: `0 0 ${width} ${height}` }
}

export function GeoJsonPreview({ geoJson }: { geoJson: GeoJsonInput }) {
  const rings = extractRings(geoJson)
  const svg = normalizeCoords(rings, 200, 150, 10)

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">Aperçu géospatial</p>
      {svg ? (
        <svg
          viewBox={svg.viewBox}
          className="w-full max-w-[200px] rounded border bg-muted/20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points={svg.points}
            fill="rgba(59,130,246,0.15)"
            stroke="#3b82f6"
            strokeWidth={1.5}
          />
        </svg>
      ) : (
        <p className="text-xs text-muted-foreground">Format non supporté</p>
      )}
      <details className="group">
        <summary className="cursor-pointer list-none text-xs text-muted-foreground hover:text-foreground">
          <ChevronRight className="inline h-3 w-3 group-open:hidden" />
          <ChevronDown className="hidden h-3 w-3 group-open:inline" />
          <span className="ml-1">Voir les données brutes</span>
        </summary>
        <pre className="mt-1 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
          {JSON.stringify(geoJson, null, 2)}
        </pre>
      </details>
    </div>
  )
}
