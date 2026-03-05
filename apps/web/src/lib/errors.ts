import type { ApiErrorCode } from "./types";

const STATUS_MAP: Record<ApiErrorCode, number> = {
  INPUT_TOO_LARGE: 413,
  API_ERROR: 502,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  NOT_FOUND: 404,
};

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status?: number,
  headers?: Record<string, string>,
): Response {
  return Response.json(
    { error: { code, message } },
    { status: status ?? STATUS_MAP[code], headers },
  );
}

export { type ApiErrorCode } from "./types";
