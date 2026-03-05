import type { AuditResult } from "@skillgate/audit-engine";

export type AuditMeta = {
  slug: string;
  url: string;
  badge_url: string;
  created_at: string;
  cached: boolean;
};

export type AuditResponse = {
  result: AuditResult;
  meta: AuditMeta;
};

export type ApiErrorCode =
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "INPUT_TOO_LARGE"
  | "API_ERROR"
  | "VALIDATION_ERROR";

export type ErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};
