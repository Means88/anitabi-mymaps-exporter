import { asText } from "./text.ts";

const ANITABI_ORIGIN = "https://www.anitabi.cn";
const ANITABI_IMAGE_ORIGIN = "https://img-tc.anitabi.cn";
const BGM_IMAGE_ORIGIN = "https://lain.bgm.tv";
const PLAN_IMAGE_HOST_RE = /^https:\/\/(?:img-tc|image)\.anitabi\.cn\/|^https:\/\/lain\.bgm\.tv\//i;

function normalizeExternalImageOrigin(url: string): string {
  return url.replace(/^https?:\/\/bgm-api\.anitabi\.cn(?=\/|$)/i, BGM_IMAGE_ORIGIN);
}

export function toAbsoluteAnitabiUrl(url: unknown): string {
  if (url === 0) return "";
  const text = asText(url).trim();
  if (!text) return "";
  if (/^http:\/\//i.test(text)) return normalizeExternalImageOrigin(text.replace(/^http:\/\//i, "https://"));
  if (/^https?:\/\//i.test(text)) return normalizeExternalImageOrigin(text);
  if (text.startsWith("/images/points/") || text.startsWith("/images/user/")) return ANITABI_IMAGE_ORIGIN + "/" + text.slice("/images/".length);
  if (text.startsWith("/")) return ANITABI_ORIGIN + text;
  return text;
}

export function toImageThumbnailUrl(url: unknown, plan = "h160"): string {
  const text = toAbsoluteAnitabiUrl(url);
  if (!text || !PLAN_IMAGE_HOST_RE.test(text)) return text;
  const hashIndex = text.indexOf("#");
  const beforeHash = hashIndex >= 0 ? text.slice(0, hashIndex) : text;
  const hash = hashIndex >= 0 ? text.slice(hashIndex) : "";
  const queryIndex = beforeHash.indexOf("?");
  const pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : "";
  const params = new URLSearchParams(query);
  params.set("plan", plan);
  return pathname + "?" + params.toString() + hash;
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
