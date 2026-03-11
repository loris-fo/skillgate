import type { AuditResult } from "@skillgate/audit-engine";
import type { AuditResponse } from "@/lib/types";

export const MOCK_SLUGS = [
  "mock-safe-skill",
  "mock-caution-skill",
  "mock-danger-skill",
];

function buildMeta(slug: string) {
  return {
    slug,
    url: `/api/report/${slug}`,
    badge_url: `/api/badge/${slug}.svg`,
    created_at: "2025-01-15T10:00:00Z",
    cached: true,
  };
}

const mockSafeResult: AuditResult = {
  overall_score: "safe",
  verdict: "install",
  summary:
    "This skill follows security best practices with no concerning patterns detected.",
  intent:
    "A well-structured coding assistant that provides formatting and style guidance.",
  categories: {
    hidden_logic: {
      score: "safe",
      finding: "No hidden logic detected",
      detail:
        "The skill operates transparently with no obfuscated code paths or concealed behaviors.",
      by_design: false,
    },
    data_access: {
      score: "safe",
      finding: "No external data access",
      detail:
        "The skill does not attempt to read, write, or transmit data outside the current project scope.",
      by_design: false,
    },
    action_risk: {
      score: "safe",
      finding: "No risky actions performed",
      detail:
        "All actions are limited to code formatting and style suggestions within the editor context.",
      by_design: false,
    },
    permission_scope: {
      score: "safe",
      finding: "Minimal permissions requested",
      detail:
        "The skill only requests read access to the current file, which is appropriate for its stated purpose.",
      by_design: false,
    },
    override_attempts: {
      score: "safe",
      finding: "No override attempts detected",
      detail:
        "The skill does not attempt to modify system prompts, bypass restrictions, or alter its own instructions.",
      by_design: false,
    },
  },
  utility_analysis: {
    what_it_does: "Provides structured code formatting and style guidance",
    use_cases: ["Code formatting", "Style consistency"],
    not_for: ["Security auditing"],
    trigger_behavior: "Activates on code editing tasks",
    dependencies: [],
  },
  recommendation: {
    verdict: "install",
    for_who:
      "Any developer looking for a well-structured coding assistant.",
    caveats: ["Always review skill updates for changes in behavior"],
    alternatives: [],
  },
};

const mockCautionResult: AuditResult = {
  overall_score: "moderate",
  verdict: "install_with_caution",
  summary:
    "This skill has some elevated permissions that warrant review before installation.",
  intent:
    "An advanced file manipulation tool for project scaffolding and bulk operations.",
  categories: {
    hidden_logic: {
      score: "safe",
      finding: "No hidden logic detected",
      detail:
        "Code paths are transparent and well-documented with no obfuscation.",
      by_design: false,
    },
    data_access: {
      score: "moderate",
      finding: "Reads project configuration files",
      detail:
        "Accesses package.json, tsconfig, and other config files to determine project structure. This is expected for scaffolding but grants broad read access.",
      by_design: true,
    },
    action_risk: {
      score: "low",
      finding: "Creates and modifies files",
      detail:
        "Generates new files and directories as part of scaffolding operations. File creation is its core purpose.",
      by_design: true,
    },
    permission_scope: {
      score: "high",
      finding: "Broad file system access requested",
      detail:
        "Requests read/write access beyond the current project directory, which exceeds what is necessary for most scaffolding tasks.",
      by_design: false,
    },
    override_attempts: {
      score: "safe",
      finding: "No override attempts detected",
      detail:
        "The skill respects system boundaries and does not attempt to modify its own instructions.",
      by_design: false,
    },
  },
  utility_analysis: {
    what_it_does: "Advanced file manipulation and project scaffolding",
    use_cases: [
      "Project scaffolding",
      "Bulk file operations",
      "Template generation",
    ],
    not_for: ["Simple text editing"],
    trigger_behavior:
      "Activates on file creation and modification requests",
    dependencies: ["fs", "path"],
  },
  recommendation: {
    verdict: "install_with_caution",
    for_who:
      "Developers who need advanced file manipulation capabilities.",
    caveats: [
      "Requests broad file system access",
      "May modify files outside project directory",
    ],
    alternatives: [
      "Consider sandboxed-editor for safer file operations",
    ],
  },
};

const mockDangerResult: AuditResult = {
  overall_score: "critical",
  verdict: "avoid",
  summary:
    "This skill exhibits multiple high-risk patterns including hidden network requests and instruction override attempts.",
  intent:
    "Claims to provide code optimization and refactoring but contains obfuscated side effects.",
  categories: {
    hidden_logic: {
      score: "critical",
      finding: "Obfuscated code execution detected",
      detail:
        "Contains base64-encoded payloads that are decoded and executed at runtime, concealing the true behavior of several core functions.",
      by_design: false,
    },
    data_access: {
      score: "high",
      finding: "Undisclosed network requests",
      detail:
        "Makes HTTP requests to external endpoints that are not documented or disclosed to the user. Data payloads include project file contents.",
      by_design: false,
    },
    action_risk: {
      score: "critical",
      finding: "Executes arbitrary shell commands",
      detail:
        "Constructs and runs shell commands from dynamically generated strings, enabling arbitrary code execution on the host system.",
      by_design: false,
    },
    permission_scope: {
      score: "critical",
      finding: "Requests root-level access",
      detail:
        "Attempts to escalate permissions beyond what is needed, requesting access to system directories, environment variables, and credential stores.",
      by_design: false,
    },
    override_attempts: {
      score: "high",
      finding: "System prompt manipulation detected",
      detail:
        "Includes instructions designed to override safety guidelines and modify its own behavioral constraints during conversation.",
      by_design: false,
    },
  },
  utility_analysis: {
    what_it_does:
      "Claims to provide code optimization and refactoring",
    use_cases: ["Code refactoring"],
    not_for: ["Any production environment"],
    trigger_behavior:
      "Activates broadly on most prompts with hidden side effects",
    dependencies: ["undisclosed"],
  },
  recommendation: {
    verdict: "avoid",
    for_who: "Not recommended for any developer.",
    caveats: [
      "Contains obfuscated network calls",
      "Attempts to override system instructions",
      "Requests unnecessary elevated permissions",
    ],
    alternatives: [
      "Use verified-assistant for similar functionality",
      "Consider audited-helper as a safer option",
    ],
  },
};

const MOCK_REPORTS: Record<string, AuditResponse> = {
  "mock-safe-skill": { result: mockSafeResult, meta: buildMeta("mock-safe-skill") },
  "mock-caution-skill": { result: mockCautionResult, meta: buildMeta("mock-caution-skill") },
  "mock-danger-skill": { result: mockDangerResult, meta: buildMeta("mock-danger-skill") },
};

export function getMockReport(slug: string): AuditResponse | null {
  return MOCK_REPORTS[slug] ?? null;
}
