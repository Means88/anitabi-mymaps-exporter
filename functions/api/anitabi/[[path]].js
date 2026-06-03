export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const upstreamPath = requestUrl.pathname.slice("/api/anitabi/".length);
  const upstream = new URL("https://api.anitabi.cn/" + upstreamPath);
  upstream.search = requestUrl.search;
  return proxyJson(upstream.toString(), context.request, "anitabi_proxy_error");
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: baseHeaders()
  });
}

async function proxyJson(upstreamUrl, request, errorCode) {
  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        accept: request.headers.get("accept") || "application/json"
      }
    });
    const body = await response.arrayBuffer();
    const headers = baseHeaders();
    headers.set("content-type", response.headers.get("content-type") || "application/json; charset=utf-8");
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    return jsonError(errorCode, error);
  }
}

function jsonError(code, error) {
  return new Response(
    JSON.stringify({
      error: code,
      message: error instanceof Error ? error.message : "Unknown proxy error"
    }),
    {
      status: 502,
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
