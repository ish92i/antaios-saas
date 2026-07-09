import { ChevronRight } from "lucide-react"

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
): string | null {
  if (!rings.length || !rings[0].length) return null
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const ring of rings)
    for (const [x, y] of ring) {
      if (x < minX) minX = x; if (x > maxX) maxX = x
      if (y < minY) minY = y; if (y > maxY) maxY = y
    }
  const rangeX = maxX - minX || 1, rangeY = maxY - minY || 1
  const scale = Math.min((width - pad * 2) / rangeX, (height - pad * 2) / rangeY)
  const ox = (width - rangeX * scale) / 2, oy = (height - rangeY * scale) / 2
  return rings.map((ring) => ring.map(([x, y]) => `${(x - minX) * scale + ox},${(y - minY) * scale + oy}`).join(" ")).join(" ")
}

export function GeoJsonPreview({ geoJson }: { geoJson: GeoJsonInput }) {
  const rings = extractRings(geoJson)
  const points = normalizeCoords(rings, 180, 130, 10)

  return (
    <div>
      <svg viewBox="0 0 180 130" className="w-full h-[130px] rounded-lg bg-muted/30" role="img" aria-label="Aperçu de la parcelle géolocalisée">
        {points && (
          <polygon points={points} fill="rgba(59,130,246,0.18)" stroke="#3b82f6" strokeWidth={1.5} />
        )}
      </svg>
    </div>
  )
}
