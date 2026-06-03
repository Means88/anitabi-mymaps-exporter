import type { SearchIndexItem } from "./types.ts";
import { asText } from "./text.ts";
import { chooseCover, toAbsoluteAnitabiUrl } from "./urls.ts";

interface SlimSearchItem {
  id?: unknown;
  cn?: unknown;
  alias?: unknown;
  title?: unknown;
  city?: unknown;
  cover?: unknown;
  pointsLength?: unknown;
}

interface SearchIndexPayload {
  items?: SlimSearchItem[];
}

export function parseSearchIndex(raw: SearchIndexPayload | unknown): SearchIndexItem[] {
  const payload = raw as SearchIndexPayload | unknown[];
  const source = Array.isArray((payload as SearchIndexPayload)?.items)
    ? (payload as SearchIndexPayload).items
    : Array.isArray((payload as unknown[])?.[0])
      ? (payload as unknown[])[0]
      : payload;
  if (!Array.isArray(source)) return [];
  return source
    .map((item: SlimSearchItem | unknown[]) => {
      const isArrayItem = Array.isArray(item);
      const id = asText(isArrayItem ? item[0] : item && item.id);
      const cn = asText(isArrayItem ? item[1] : item && item.cn);
      const alias = asText(isArrayItem ? item[2] : item && item.alias);
      const title = asText(isArrayItem ? item[3] : item && item.title);
      const city = asText(isArrayItem ? item[4] : item && item.city);
      const cover = isArrayItem ? chooseCover(item[15], item[6]) : toAbsoluteAnitabiUrl(item && item.cover);
      const pointsLength = isArrayItem
        ? Array.isArray(item[12]) ? Math.floor(item[12].length / 4) : Number(item[13]) || 0
        : Number(item && item.pointsLength) || 0;
      const haystack = [id, cn, alias, title, city].join(" ").toLowerCase();
      return { id, cn, alias, title, city, cover, pointsLength, haystack };
    })
    .filter((item) => item.id);
}

export function searchWorks(index: SearchIndexItem[], query: unknown, limit = 20): SearchIndexItem[] {
  const normalizedQuery = asText(query).trim().toLowerCase();
  if (!normalizedQuery) return [];
  const max = Number(limit) || 20;
  const scored: Array<{ item: SearchIndexItem; score: number }> = [];
  index.forEach((item) => {
    let score = 0;
    if (item.id === normalizedQuery) score += 100;
    if (item.cn.toLowerCase() === normalizedQuery || item.title.toLowerCase() === normalizedQuery) score += 80;
    if (item.id.startsWith(normalizedQuery)) score += 50;
    if (item.cn.toLowerCase().includes(normalizedQuery)) score += 35;
    if (item.title.toLowerCase().includes(normalizedQuery)) score += 30;
    if (item.alias.toLowerCase().includes(normalizedQuery)) score += 20;
    if (item.city.toLowerCase().includes(normalizedQuery)) score += 10;
    if (score > 0 || item.haystack.includes(normalizedQuery)) scored.push({ item, score });
  });
  return scored
    .sort((left, right) => right.score - left.score || Number(right.item.pointsLength) - Number(left.item.pointsLength))
    .slice(0, max)
    .map((entry) => entry.item);
}
