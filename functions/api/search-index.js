export async function onRequestGet(context) {
  if (!context.env || !context.env.ASSETS) {
    return jsonError("local_search_index_unavailable", new Error("Pages ASSETS binding is unavailable"));
  }
  const assetUrl = new URL("/data/search-index.json", context.request.url);
  try {
    const response = await context.env.ASSETS.fetch(assetUrl.toString());
    if (!response.ok) {
      return jsonError("local_search_index_not_found", new Error("Static search index returned " + response.status), 500);
    }
    const body = await response.arrayBuffer();
    const headers = baseHeaders();
    headers.set("content-type", response.headers.get("content-type") || "application/json; charset=utf-8");
    return new Response(body, {
      status: 200,
      headers
    });
  } catch (error) {
    return jsonError("local_search_index_error", error);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: baseHeaders()
  });
}

function jsonError(code, error, status) {
  return new Response(
    JSON.stringify({
      error: code,
      message: error instanceof Error ? error.message : "Unknown proxy error"
    }),
    {
      status: status || 502,
      headers: baseHeaders()
    }
  );
}

function baseHeaders() {
  return new Headers({
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8"
  });
}
