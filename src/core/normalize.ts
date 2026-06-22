import type { GeoTuple, NormalizedPoint, NormalizedWork } from "./types.ts";
import { asText, firstText } from "./text.ts";
import { toAbsoluteAnitabiUrl } from "./urls.ts";

interface LooseRecord {
  [key: string]: any;
}

function asDataText(value: unknown): string {
  if (value === 0) return "";
  return asText(value);
}

export function normalizeGeo(geo: unknown): GeoTuple | null {
  if (!Array.isArray(geo) || geo.length < 2) return null;
  if (asText(geo[0]).trim() === "" || asText(geo[1]).trim() === "") return null;
  const latitude = Number(geo[0]);
  const longitude = Number(geo[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return [latitude, longitude];
}

export function normalizeBangumiLite(raw: LooseRecord = {}): NormalizedWork {
  return {
    id: asText(raw.id),
    cn: asDataText(raw.cn),
    title: asDataText(raw.title),
    city: asDataText(raw.city),
    cover: toAbsoluteAnitabiUrl(raw.cover),
    color: asDataText(raw.color),
    geo: normalizeGeo(raw.geo),
    zoom: raw.zoom,
    modified: raw.modified,
    pointsLength: Number(raw.pointsLength) || 0,
    imagesLength: Number(raw.imagesLength) || 0,
    litePoints: Array.isArray(raw.litePoints) ? raw.litePoints : []
  };
}

export function normalizeDetailPoints(points: unknown): NormalizedPoint[] {
  if (!Array.isArray(points)) return [];
  return points
    .map((point: LooseRecord | null | undefined) => {
      const geo = normalizeGeo(point && point.geo);
      if (!point || !point.id || !geo) return null;
      return {
        id: asText(point.id),
        cn: asDataText(point.cn),
        name: asDataText(point.name),
        image: toAbsoluteAnitabiUrl(point.image),
        ep: asDataText(point.ep),
        s: asDataText(point.s),
        geo,
        origin: asDataText(point.origin),
        originURL: asDataText(point.originURL || point.originLink)
      };
    })
    .filter(Boolean) as NormalizedPoint[];
}

export function pointDisplayName(point: Pick<NormalizedPoint, "cn" | "name" | "id">): string {
  return firstText(point.cn, point.name, point.id, "Unnamed point");
}

export function workDisplayName(work: Pick<NormalizedWork, "cn" | "title" | "id">): string {
  return firstText(work.cn, work.title, work.id, "Untitled work");
}
