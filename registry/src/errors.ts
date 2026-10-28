export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly headers: HeadersInit = {},
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function errorResponse(error: HttpError): Response {
  const headers = new Headers(error.headers);
  headers.set("Content-Type", "application/problem+json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return Response.json(
    {
      error: error.message,
      status: error.status,
    },
    { status: error.status, headers },
  );
}

export function methodNotAllowed(allowed: string): HttpError {
  return new HttpError(405, "method not allowed", { Allow: allowed });
}
