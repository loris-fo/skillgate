import type { AuditResponse, ErrorResponse } from "../types.js";
import { fetchWithRetry } from "./retry.js";
import { auditResponseSchema } from "./schema.js";

const DEFAULT_API_URL = "https://skillgate.sh/api";

function getApiUrl(): string {
  return process.env.SKILLGATE_API_URL || DEFAULT_API_URL;
}

export async function auditViaApi(
  body: { content: string } | { url: string },
): Promise<AuditResponse> {
  const response = await fetchWithRetry(`${getApiUrl()}/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse;
    throw new Error(error.error.message);
  }

  const json = await response.json();
  return auditResponseSchema.parse(json);
}
