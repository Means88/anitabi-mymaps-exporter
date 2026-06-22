import { asText } from "./text.ts";

const ANITABI_ORIGIN = "https://www.anitabi.cn";
const ANITABI_IMAGE_ORIGIN = "https://img-tc.anitabi.cn";
const BGM_IMAGE_ORIGIN = "https://lain.bgm.tv";

function normalizeExternalImageOrigin(url: string): string {
  return url.replace(/^https?:\/\/bgm-api\.anitabi\.cn(?=\/|$)/i, BGM_IMAGE_ORIGIN);
}

export function toAbsoluteAnitabiUrl(url: unknown): string {
  if (url === 0) return "";
  const text = asText(url).trim();
  if (!text) return "";
  if (/^http:\/\//i.test(text)) return normalizeExternalImageOrigin(text.replace(/^http:\/\//i, "https://"));
  if (/^https?:\/\//i.test(text)) return normalizeExternalImageOrigin(text);
  if (text.startsWith("/images/points/")) return ANITABI_IMAGE_ORIGIN + "/" + text.slice("/images/".length);
  if (text.startsWith("/")) return ANITABI_ORIGIN + text;
  return text;
}

export function isCoverCandidate(value: unknown): boolean {
  const text = asText(value).trim();
  return /^https?:\/\//i.test(text) || text.startsWith("/");
}

export function chooseCover(...values: unknown[]): string {
  for (const value of values) {
    if (isCoverCandidate(value)) return toAbsoluteAnitabiUrl(value);
  }
  return "";
}

export function subjectMapUrl(workId: unknown, pointId?: unknown): string {
  const base = "https://www.anitabi.cn/map?bangumiId=" + encodeURIComponent(asText(workId));
  const pointText = asText(pointId);
  if (!pointText) return base;
  return base + "&pointId=" + encodeURIComponent(pointText);
}
