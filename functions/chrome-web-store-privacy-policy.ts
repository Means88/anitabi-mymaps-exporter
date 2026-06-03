import { baseHeaders, jsonError } from "./_shared/http";

const PRIVACY_POLICY_URL = "https://means88.github.io/anitabi-mymaps-exporter/chrome-web-store-privacy-policy";

export async function onRequestGet(context) {
  try {
    const response = await fetch(PRIVACY_POLICY_URL, {
      headers: {
        accept: context.request.headers.get("accept") || "text/html, text/plain;q=0.9, */*;q=0.8"
      }
    });
    const body = await response.arrayBuffer();
    const headers = baseHeaders();
    headers.set("cache-control", "public, max-age=600");
    headers.set("content-type", response.headers.get("content-type") || "text/html; charset=utf-8");
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    return jsonError("privacy_policy_proxy_error", error);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: baseHeaders()
  });
}
