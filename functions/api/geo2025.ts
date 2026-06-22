import { baseHeaders, jsonError } from "../_shared/http";

function assetPathForRequest(request: Request): string {
  const url = new URL(request.url);
  const bangumiId = url.searchParams.get("bangumiId") || "";
  if (/^\d+$/.test(bangumiId)) return "/data/geo2025/works/" + bangumiId + ".json";
  return "/data/geo2025/manifest.json";
}

export async function onRequestGet(context) {
  if (!context.env || !context.env.ASSETS) {
    return jsonError("geo2025_snapshot_unavailable", new Error("Pages ASSETS binding is unavailable"));
  }
  const assetUrl = new URL(assetPathForRequest(context.request), context.request.url);
  try {
    const response = await context.env.ASSETS.fetch(assetUrl.toString());
    if (!response.ok) {
      return jsonError("geo2025_snapshot_not_found", new Error("Static geo2025 snapshot returned " + response.status), response.status === 404 ? 404 : 500);
    }
    const body = await response.arrayBuffer();
    const headers = baseHeaders();
    headers.set("content-type", response.headers.get("content-type") || "application/json; charset=utf-8");
    headers.set("cache-control", "public, max-age=86400");
    return new Response(body, {
      status: 200,
      headers
    });
  } catch (error) {
    return jsonError("geo2025_snapshot_error", error);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: baseHeaders()
  });
}
