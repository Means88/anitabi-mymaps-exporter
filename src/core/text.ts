export function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = asText(value).trim();
    if (text) return text;
  }
  return "";
}
