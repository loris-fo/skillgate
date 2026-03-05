export type {
  Score,
  Verdict,
  AuditResult,
  Categories,
  CategoryResult,
} from "@skillgate/audit-engine";

export type AuditMeta = {
  slug: string;
  url: string;
  badge_url: string;
  created_at: string;
  cached: boolean;
};

export type AuditResponse = {
  result: import("@skillgate/audit-engine").AuditResult;
  meta: AuditMeta;
};

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};
