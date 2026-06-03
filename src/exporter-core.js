(function attachCore(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }
  root.AnitabiExporterCore = factory();
})(typeof self !== "undefined" ? self : this, function buildCore() {
  const API_BASE = "https://api.anitabi.cn";
  const SEARCH_INDEX_URL = "https://www.anitabi.cn/d/g.json";

  function asText(value) {
    if (value === null || value === undefined) return "";
    return String(value);
  }

  function firstText() {
    for (let index = 0; index < arguments.length; index += 1) {
      const value = asText(arguments[index]).trim();
      if (value) return value;
    }
    return "";
  }

  function normalizeGeo(geo) {
    if (!Array.isArray(geo) || geo.length < 2) return null;
    if (asText(geo[0]).trim() === "" || asText(geo[1]).trim() === "") return null;
    const latitude = Number(geo[0]);
    const longitude = Number(geo[1]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return [latitude, longitude];
  }

  function toAbsoluteAnitabiUrl(url) {
    const text = asText(url).trim();
    if (!text) return "";
    if (/^https?:\/\//i.test(text)) return text;
    if (text.startsWith("/")) return "https://www.anitabi.cn" + text;
    return text;
  }

  function isCoverCandidate(value) {
    const text = asText(value).trim();
    return /^https?:\/\//i.test(text) || text.startsWith("/");
  }

  function chooseCover() {
    for (let index = 0; index < arguments.length; index += 1) {
      if (isCoverCandidate(arguments[index])) return toAbsoluteAnitabiUrl(arguments[index]);
    }
    return "";
  }

  function subjectMapUrl(workId, pointId) {
    const base = "https://www.anitabi.cn/map?bangumiId=" + encodeURIComponent(workId);
    if (!pointId) return base;
    return base + "&pointId=" + encodeURIComponent(pointId);
  }

  function pointDisplayName(point) {
    return firstText(point.cn, point.name, point.id, "Unnamed point");
  }

  function workDisplayName(work) {
    return firstText(work.cn, work.title, work.id, "Untitled work");
  }

  function normalizeBangumiLite(raw) {
    const geo = normalizeGeo(raw && raw.geo);
    return {
      id: asText(raw && raw.id),
      cn: asText(raw && raw.cn),
      title: asText(raw && raw.title),
      city: asText(raw && raw.city),
      cover: toAbsoluteAnitabiUrl(raw && raw.cover),
      color: asText(raw && raw.color),
      geo,
      zoom: raw && raw.zoom,
      modified: raw && raw.modified,
      pointsLength: Number(raw && raw.pointsLength) || 0,
      imagesLength: Number(raw && raw.imagesLength) || 0,
      litePoints: Array.isArray(raw && raw.litePoints) ? raw.litePoints : []
    };
  }

  function normalizeDetailPoints(points) {
    if (!Array.isArray(points)) return [];
    return points
      .map((point) => {
        const geo = normalizeGeo(point && point.geo);
        if (!point || !point.id || !geo) return null;
        return {
          id: asText(point.id),
          cn: asText(point.cn),
          name: asText(point.name),
          image: toAbsoluteAnitabiUrl(point.image),
          ep: asText(point.ep),
          s: asText(point.s),
          geo,
          origin: asText(point.origin),
          originURL: asText(point.originURL || point.originLink)
        };
      })
      .filter(Boolean);
  }

  function buildRows(work, points) {
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

  function escapeCsvField(value) {
    const text = asText(value);
    if (/[",\r\n]/.test(text)) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }

  function generateCsv(rows) {
    const headers = [
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

  function escapeXml(value) {
    return asText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function escapeCdata(value) {
    return asText(value).replace(/\]\]>/g, "]]]]><![CDATA[>");
  }

  function kmlDescription(row) {
    const lines = [];
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

  function groupRowsByWork(rows) {
    const groups = new Map();
    rows.forEach((row) => {
      const key = row.work_id || "unknown";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    });
    return groups;
  }

  function generateKml(rows) {
    const folders = [];
    groupRowsByWork(rows).forEach((groupRows) => {
      const first = groupRows[0] || {};
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

  function parseSearchIndex(raw) {
    const source = Array.isArray(raw && raw.items) ? raw.items : Array.isArray(raw && raw[0]) ? raw[0] : raw;
    if (!Array.isArray(source)) return [];
    return source
      .map((item) => {
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

  function searchWorks(index, query, limit) {
    const normalizedQuery = asText(query).trim().toLowerCase();
    if (!normalizedQuery) return [];
    const max = Number(limit) || 20;
    const scored = [];
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

  function makeFileName(rows, extension, now) {
    const date = now || new Date();
    const ymd = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("");
    const workIds = Array.from(new Set(rows.map((row) => row.work_id).filter(Boolean)));
    const suffix = workIds.length === 1 ? workIds[0] : "multi";
    return "anitabi-" + suffix + "-" + ymd + "." + extension.replace(/^\./, "");
  }

  return {
    API_BASE,
    SEARCH_INDEX_URL,
    asText,
    firstText,
    normalizeBangumiLite,
    normalizeDetailPoints,
    buildRows,
    generateCsv,
    generateKml,
    groupRowsByWork,
    parseSearchIndex,
    searchWorks,
    makeFileName,
    subjectMapUrl,
    workDisplayName,
    pointDisplayName
  };
});
