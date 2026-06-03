import { asText } from "./text.ts";

const ANITABI_ORIGIN = "https://www.anitabi.cn";

export function toAbsoluteAnitabiUrl(url: unknown): string {
  const text = asText(url).trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
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
