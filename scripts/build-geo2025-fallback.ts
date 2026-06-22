import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const geoInputPath = process.argv[2] || "data/geo2025.json";
const usersInputPath = process.argv[3] || "data/users.csv";
const outputDir = process.argv[4] || "public/data/geo2025";
const searchIndexOutputPath = process.argv[5] || "public/data/search-index.json";

const ANITABI_ORIGIN = "https://www.anitabi.cn";
const ANITABI_IMAGE_ORIGIN = "https://img-tc.anitabi.cn";
const BGM_IMAGE_ORIGIN = "https://lain.bgm.tv";

function asText(value: unknown): string {
  if (value === null || value === undefined || value === 0) return "";
  return String(value);
}

function normalizeExternalImageOrigin(url: string): string {
  return url.replace(/^https?:\/\/bgm-api\.anitabi\.cn(?=\/|$)/i, BGM_IMAGE_ORIGIN);
}

function toAbsoluteAnitabiUrl(url: unknown): string {
  const text = asText(url).trim();
  if (!text) return "";
  if (/^http:\/\//i.test(text)) return normalizeExternalImageOrigin(text.replace(/^http:\/\//i, "https://"));
  if (/^https?:\/\//i.test(text)) return normalizeExternalImageOrigin(text);
  if (text.startsWith("/images/points/") || text.startsWith("/images/user/")) return ANITABI_IMAGE_ORIGIN + "/" + text.slice("/images/".length);
  if (text.startsWith("/")) return ANITABI_ORIGIN + text;
  return text;
}

function isCoverCandidate(value: unknown): boolean {
  const text = asText(value).trim();
  return /^https?:\/\//i.test(text) || text.startsWith("/");
}

function chooseCover(...values: unknown[]): string {
  for (const value of values) {
    if (isCoverCandidate(value)) return toAbsoluteAnitabiUrl(value);
  }
  return "";
}

function parseUsersCsv(text: string): Map<string, string> {
  const users = new Map<string, string>();
  text.split(/\r?\n/).forEach((line) => {
    const commaIndex = line.indexOf(",");
    if (commaIndex <= 0) return;
    const id = line.slice(0, commaIndex).trim();
    const nickname = line.slice(commaIndex + 1).trim();
    if (id && nickname) users.set(id, nickname);
  });
  return users;
}

function sourceText(point: Record<string, unknown>, users: Map<string, string>): string {
  const origin = asText(point.origin);
  if (origin) return origin;
  const uid = asText(point.uid);
  if (uid) return "@" + (users.get(uid) || uid);
  if (asText(point.mid)) return "Google My Maps";
  return "";
}

function sourceLink(point: Record<string, unknown>): string {
  const explicit = asText(point.originURL || point.originLink);
  if (explicit) return explicit;
  const mid = asText(point.mid);
  const geo = point.geo;
  if (mid && Array.isArray(geo) && geo.length >= 2) {
    return "https://www.google.com/maps/d/viewer?mid=" + encodeURIComponent(mid) + "&ll=" + encodeURIComponent(asText(geo[0])) + "%2C" + encodeURIComponent(asText(geo[1]));
  }
  return "";
}

function normalizedPoint(point: Record<string, unknown>, users: Map<string, string>): Record<string, unknown> {
  return {
    ...point,
    origin: sourceText(point, users),
    originURL: sourceLink(point)
  };
}

function stringList(...values: unknown[]): string[] {
  return values.flatMap((value) => {
    if (Array.isArray(value)) return value.map(asText);
    return asText(value);
  }).map((value) => value.trim()).filter(Boolean);
}

function searchAlias(work: Record<string, unknown>): string {
  return Array.from(new Set(stringList(work.abbr, work.tAbbr, work.en, work.cat, work.tags))).join(" ");
}

function searchItem(work: Record<string, unknown>): Record<string, unknown> | null {
  const id = asText(work.id);
  if (!id) return null;
  const pointsLength = Array.isArray(work.points) ? work.points.length : Number(work.pointsLength) || 0;
  return {
    id,
    cn: asText(work.cn),
    alias: searchAlias(work),
    title: asText(work.title),
    city: asText(work.city),
    cover: chooseCover(work.icon, work.cover),
    pointsLength
  };
}

function snapshotGeneratedAt(modified: unknown): string {
  const timestamp = Number(modified);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "";
  return new Date(timestamp).toISOString();
}

const geo2025 = JSON.parse(readFileSync(geoInputPath, "utf8"));
const users = parseUsersCsv(readFileSync(usersInputPath, "utf8"));
const works = Array.isArray(geo2025.bangumis) ? geo2025.bangumis : [];
const worksDir = join(outputDir, "works");

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(worksDir, { recursive: true });

const manifestItems = works.map((work: Record<string, unknown>) => {
  const id = asText(work.id);
  const points = Array.isArray(work.points) ? work.points.map((point) => normalizedPoint(point, users)) : [];
  const payload = {
    version: 1,
    source: "indexeddb-geo2025-snapshot",
    modified: geo2025.modified,
    work: {
      ...work,
      points,
      pointsLength: points.length,
      imagesLength: points.filter((point) => asText(point.image)).length
    },
    points
  };
  writeFileSync(join(worksDir, id + ".json"), JSON.stringify(payload));
  return {
    id,
    cn: asText(work.cn),
    title: asText(work.title),
    city: asText(work.city),
    pointsLength: points.length,
    modified: work.modified || null
  };
});

writeFileSync(join(outputDir, "manifest.json"), JSON.stringify({
  version: 1,
  source: "indexeddb-geo2025-snapshot",
  modified: geo2025.modified,
  usersLength: users.size,
  worksLength: manifestItems.length,
  works: manifestItems
}));

const searchItems = works.map((work: Record<string, unknown>) => searchItem(work)).filter(Boolean);
const searchPayload = {
  version: 1,
  generatedAt: snapshotGeneratedAt(geo2025.modified),
  source: "indexeddb-geo2025-snapshot",
  modified: geo2025.modified,
  items: searchItems
};

mkdirSync(dirname(searchIndexOutputPath), { recursive: true });
writeFileSync(searchIndexOutputPath, JSON.stringify(searchPayload), "utf8");

console.log("wrote", manifestItems.length, "works to", outputDir);
console.log("search index:", searchItems.length, "items to", searchIndexOutputPath);
