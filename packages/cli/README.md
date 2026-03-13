# skillgate

**Audit AI agent skills before you install them.**

AI agent skills and rules files can do a lot — that's the point. But before you drop one into your project, it's worth knowing what it actually does. Skillgate runs a structured security audit and tells you if a skill is safe to install, needs a closer look, or should be avoided entirely.

Works with **Claude**, **Cursor**, **Windsurf**, **GitHub Copilot**, **Cline**, and **Aider**.

```sh
npx skillgate install https://github.com/user/repo/blob/main/.claude/skills/my-skill.md
```

---

## The problem

The AI agent skills ecosystem is growing fast. Skills, rules, and instruction files from GitHub and community repos are easy to share and easy to install. Most are genuinely useful. But a skill is executable context — it runs inside your agent sessions and can shape how the agent behaves, what it accesses, and what it does on your behalf.

There's currently no standard way to know if a skill is safe before you install it.

Skillgate fills that gap.

---

## How it works

When you run `skillgate install <url>`, it:

1. Fetches the skill content from the URL or local file
2. Sends it to the Skillgate API, which runs a structured audit
3. Detects which agent the file belongs to (from URL patterns or content analysis)
4. Scores the skill across five security categories
5. Blocks the install if the risk is too high — or installs it if it passes

The audit checks five categories:

| Category | What it looks for |
|---|---|
| **Hidden Logic** | Obfuscated instructions, encoded payloads, logic that only activates in certain conditions |
| **Data Access** | Attempts to read, write, or exfiltrate files, environment variables, or sensitive data |
| **Action Risk** | Destructive or irreversible commands — deleting files, running scripts, network calls |
| **Permission Scope** | Requests for capabilities beyond what the skill's stated purpose requires |
| **Override Attempts** | Instructions to override agent safety guidelines, hijack system prompts, or perform social engineering |

Each category gets a score: `safe`, `warn`, or `critical`. The overall verdict is one of three:

- ✅ **Install** — No significant risks found
- ⚠️ **Caution** — Risks present but potentially by design (e.g. a deploy script that runs commands)
- ❌ **Avoid** — Injection attempts, exfiltration, or override logic detected

---

## Install

```sh
npm install -g skillgate
```

Or run without installing:

```sh
npx skillgate install <url>
```

Requires Node.js >= 18.

---

## Commands

### `install`

Audit a skill and install it on pass. Sources can be GitHub URLs, any HTTP URL, or local file paths.

```sh
skillgate install <source> [options]
```

| Option | Description |
|--------|-------------|
| `--agent <name>` | Install into target agent directory (claude, cursor, etc.) |
| `-o, --output <dir>` | Custom target directory (mutually exclusive with `--agent`) |
| `--force` | Install despite High or Critical verdict |
| `--json` | Machine-readable JSON output |

Default install directory is `.claude/skills/`. Use `--agent cursor` to install into `.cursor/rules/` instead.

### `scan`

Audit all agent skill files in your project. Automatically discovers files across all supported agent directories.

```sh
skillgate scan [options]
```

| Option | Description |
|--------|-------------|
| `--agent <name>` | Scan only a specific agent's files |
| `--path <dir>` | Add a custom directory to scan (additive to auto-discovery) |
| `--no-fail` | Always exit 0, reporting only |
| `--json` | Machine-readable JSON output |

Auto-discovers files in: `.claude/skills/`, `.cursor/rules/`, `.cursorrules`, `.windsurfrules`, `.github/copilot-instructions.md`, `.clinerules`, and `.aider/`.

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | All skills passed |
| `1` | One or more skills scored High or Critical |

---

## Supported agents

| Agent | Scanned paths |
|-------|---------------|
| Claude | `.claude/`, `.claude/skills/` |
| Cursor | `.cursor/rules/`, `.cursorrules` |
| Windsurf | `.windsurfrules` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cline | `.clinerules` |
| Aider | `.aider/` |

---

## Report & badge

Every audit generates a permanent report at `skillgate.sh/report/<slug>`. You can add a badge to your skill's README:

```md
[![Skillgate Audit](https://skillgate.sh/badge/<slug>.svg)](https://skillgate.sh/report/<slug>)
```

If you're publishing a skill, the badge signals that you've audited it — and lets anyone verify the result.

---

## Why skills need auditing

Skills and rules files run inside agent sessions. A malicious or poorly written skill can:

- Instruct the agent to read files it shouldn't
- Exfiltrate data through generated content
- Override agent safety guidelines
- Perform actions outside the stated purpose of the skill

Most skills are fine. Skillgate is fast (a few seconds per audit) and runs before anything is installed, so the cost of checking is low and the downside of not checking can be high.

---

## Limitations

- Skillgate catches detectable patterns — obfuscated or deeply nested logic may not be caught
- The `--force` flag bypasses the gate entirely; use it only if you've reviewed the skill yourself
- Audits reflect AI analysis, not a formal security review
- Caching means repeated audits of the same content return instantly; force a fresh audit by modifying the skill

---

## Built with

- [Anthropic API](https://anthropic.com) — audit engine
- [Upstash Redis](https://upstash.com) — content-hash caching
- [skillgate.sh](https://skillgate.sh) — web reports and badge hosting

---

## Contributing

Issues and PRs welcome at [github.com/loris-fo/skillgate](https://github.com/loris-fo/skillgate).

If you find a skill that Skillgate misses or mislabels, open an issue with the skill URL — that's the most useful contribution you can make right now.

## License

MIT
