"use node"

import JSZip from "jszip"
import { parseStringPromise } from "xml2js"
import { kml as togeojsonKml } from "@tmcw/togeojson"
import proj4 from "proj4"

export async function parseGeometry(buffer: ArrayBuffer, fileName: string): Promise<unknown> {
  const buf = Buffer.from(buffer)
  if (fileName.endsWith(".geojson")) {
    const text = buf.toString("utf-8")
    return JSON.parse(text)
  }
  if (fileName.endsWith(".kml") || fileName.endsWith(".kmz")) {
    const text = buf.toString("utf-8")
    const kml = await parseStringPromise(text)
    return togeojsonKml(kml)
  }
  if (fileName.endsWith(".zip")) {
    const zip = await JSZip.loadAsync(buf)
    const shpFile = Object.keys(zip.files).find(f => f.endsWith(".shp"))
    if (!shpFile) throw new Error("No .shp file found in ZIP")
    const geojsonFile = Object.keys(zip.files).find(f => f.endsWith(".geojson"))
    if (geojsonFile) {
      const text = await zip.files[geojsonFile].async("text")
      return JSON.parse(text)
    }
    const shpData = await zip.files[shpFile].async("nodebuffer")
    const view = new DataView(shpData.buffer, shpData.byteOffset, shpData.byteLength)
    const fileCode = view.getInt32(0, false)
    if (fileCode !== 9994) throw new Error("Invalid shapefile header")
    const xmin = view.getFloat64(36, true)
    const ymin = view.getFloat64(44, true)
    const xmax = view.getFloat64(52, true)
    const ymax = view.getFloat64(60, true)
    let coords: [number, number][] = [[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]
    const prjFile = Object.keys(zip.files).find(f => f.endsWith(".prj"))
    if (prjFile) {
      const prjText = await zip.files[prjFile].async("text")
      try {
        const wgs84 = "+proj=longlat +datum=WGS84 +no_defs"
        const project = proj4(prjText, wgs84)
        coords = coords.map(([x, y]) => {
          const [lng, lat] = project.forward([x, y])
          return [lng, lat]
        }) as [number, number][]
      } catch {
        // reprojection failed, use original coords
      }
    }
    return {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: { source: shpFile, note: "Approximate polygon from shapefile bounds — verify accuracy" },
        geometry: { type: "Polygon", coordinates: [coords] },
      }],
    }
  }
  return null
}
