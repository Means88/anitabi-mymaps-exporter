export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const upstreamPath = requestUrl.pathname.slice("/api/anitabi/".length);
  const upstream = new URL("https://api.anitabi.cn/" + upstreamPath);
  upstream.search = requestUrl.search;
  return proxyJson(upstream, context.request);
}

async function proxyJson(upstream, request) {
  const response = await fetch(upstream, {
    headers: {
      accept: request.headers.get("accept") || "application/json"
    }
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "cache-control": "no-store",
      "content-type": response.headers.get("content-type") || "application/json; charset=utf-8"
    }
  });
}
