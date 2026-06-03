export async function onRequestGet(context) {
  const upstream = new URL("https://www.anitabi.cn/d/g.json");
  upstream.search = new URL(context.request.url).search;
  const response = await fetch(upstream, {
    headers: {
      accept: context.request.headers.get("accept") || "application/json"
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
