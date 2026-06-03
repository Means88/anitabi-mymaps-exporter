import type { ExportRow } from "./types.ts";
import { normalizeBangumiLite, normalizeDetailPoints, pointDisplayName } from "./normalize.ts";
import { asText, firstText } from "./text.ts";
import { subjectMapUrl } from "./urls.ts";

export function buildRows(work: Record<string, unknown> | undefined, points: unknown): ExportRow[] {
  const normalizedWork = normalizeBangumiLite(work || {});
  return normalizeDetailPoints(points).map((point) => {
    const name = pointDisplayName(point);
    const origin = firstText(point.origin, "Unknown");
    const originURL = point.originURL;
    const anitabiUrl = subjectMapUrl(normalizedWork.id, point.id);
    const descriptionParts = [
      firstText(normalizedWork.cn, normalizedWork.title),
      name,
      point.ep ? "Ep: " + point.ep : "",
      point.s ? "Time: " + point.s + "s" : "",
      originURL ? "Origin: " + origin + " " + originURL : "Origin: " + origin,
      "Anitabi: " + anitabiUrl
    ].filter(Boolean);

    return {
      key: normalizedWork.id + ":" + point.id,
      work_id: normalizedWork.id,
      work_cn: normalizedWork.cn,
      work_title: normalizedWork.title,
      work_cover: normalizedWork.cover,
      point_id: point.id,
      point_cn: point.cn,
      point_name: point.name,
      latitude: point.geo[0],
      longitude: point.geo[1],
      ep: point.ep,
      time_seconds: point.s,
      image_url: point.image,
      origin,
      origin_url: originURL,
      anitabi_url: anitabiUrl,
      description: descriptionParts.join("\n")
    };
  });
}

function escapeCsvField(value: unknown): string {
  const text = asText(value);
  if (/[",\r\n]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

export function generateCsv(rows: ExportRow[]): string {
  const headers: Array<keyof ExportRow> = [
    "work_id",
    "work_cn",
    "work_title",
    "point_id",
    "point_cn",
    "point_name",
    "latitude",
    "longitude",
    "ep",
    "time_seconds",
    "image_url",
    "origin",
    "origin_url",
    "anitabi_url",
    "description"
  ];
  const body = rows.map((row) => headers.map((header) => escapeCsvField(row[header])).join(","));
  return "\uFEFF" + [headers.join(","), ...body].join("\r\n");
}

function escapeXml(value: unknown): string {
  return asText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeCdata(value: unknown): string {
  return asText(value).replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function kmlDescription(row: ExportRow): string {
  const lines: string[] = [];
  if (row.image_url) {
    lines.push('<p><img src="' + escapeXml(row.image_url) + '" style="max-width:320px"></p>');
  }
  lines.push("<p><strong>Work:</strong> " + escapeXml(firstText(row.work_cn, row.work_title, row.work_id)) + "</p>");
  if (row.ep) lines.push("<p><strong>Episode:</strong> " + escapeXml(row.ep) + "</p>");
  if (row.time_seconds) lines.push("<p><strong>Time:</strong> " + escapeXml(row.time_seconds) + " seconds</p>");
  if (row.origin_url) {
    lines.push('<p><strong>Origin:</strong> <a href="' + escapeXml(row.origin_url) + '">' + escapeXml(row.origin) + "</a></p>");
  } else if (row.origin) {
    lines.push("<p><strong>Origin:</strong> " + escapeXml(row.origin) + "</p>");
  }
  lines.push('<p><a href="' + escapeXml(row.anitabi_url) + '">Open in Anitabi</a></p>');
  lines.push("<p>Data follows Anitabi source attribution guidance: CC BY-NC-SA 4.0.</p>");
  return lines.join("");
}

export function groupRowsByWork(rows: ExportRow[]): Map<string, ExportRow[]> {
  const groups = new Map<string, ExportRow[]>();
  rows.forEach((row) => {
    const key = row.work_id || "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)?.push(row);
  });
  return groups;
}

export function generateKml(rows: ExportRow[]): string {
  const folders: string[] = [];
  groupRowsByWork(rows).forEach((groupRows) => {
    const first = groupRows[0];
    const folderName = firstText(first.work_cn, first.work_title, first.work_id, "Anitabi");
    const placemarks = groupRows
      .map((row) => {
        const name = firstText(row.point_cn, row.point_name, row.point_id);
        return [
          "    <Placemark>",
          "      <name>" + escapeXml(name) + "</name>",
          "      <description><![CDATA[" + escapeCdata(kmlDescription(row)) + "]]></description>",
          "      <Point><coordinates>" + escapeXml(row.longitude) + "," + escapeXml(row.latitude) + ",0</coordinates></Point>",
          "    </Placemark>"
        ].join("\n");
      })
      .join("\n");
    folders.push(["  <Folder>", "    <name>" + escapeXml(folderName) + "</name>", placemarks, "  </Folder>"].join("\n"));
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<kml xmlns="http://www.opengis.net/kml/2.2">',
    "<Document>",
    "  <name>Anitabi My Maps Export</name>",
    folders.join("\n"),
    "</Document>",
    "</kml>"
  ].join("\n");
}

export function makeFileName(rows: ExportRow[], extension: string, now = new Date()): string {
  const ymd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("");
  const workIds = Array.from(new Set(rows.map((row) => row.work_id).filter(Boolean)));
  const suffix = workIds.length === 1 ? workIds[0] : "multi";
  return "anitabi-" + suffix + "-" + ymd + "." + extension.replace(/^\./, "");
}
