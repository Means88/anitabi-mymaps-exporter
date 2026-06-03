import { baseHeaders, proxyJson } from "../../_shared/http";

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
