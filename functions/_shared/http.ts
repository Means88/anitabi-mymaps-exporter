export function baseHeaders(): Headers {
  return new Headers({
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8"
  });
}

export function jsonError(code: string, error: unknown, status = 502): Response {
  return new Response(
    JSON.stringify({
      error: code,
      message: error instanceof Error ? error.message : "Unknown proxy error"
    }),
    {
      status,
      headers: baseHeaders()
    }
  );
}

export async function proxyJson(upstreamUrl: string, request: Request, errorCode: string): Promise<Response> {
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
