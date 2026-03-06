# skillgate

Audit Claude skills for security risks before installing them.

## Install

```bash
npm install -g skillgate
```

Or run without installing:

```bash
npx skillgate install <url>
```

## Quick Start

```bash
# Audit and install a skill from GitHub
skillgate install https://github.com/user/repo/blob/main/.claude/skills/my-skill/SKILL.md

# Scan all skills in current project
skillgate scan
```

## Commands

### install

Audit a skill and download it on pass.

```
skillgate install <source> [options]
```

Sources: GitHub URLs, HTTP URLs, local file paths

| Option | Description |
|--------|-------------|
| `-o, --output <dir>` | Target directory (default: `.claude`) |
| `--force` | Override High/Critical block |
| `--json` | Output machine-readable JSON |

### scan

Audit all skills in the current project.

```
skillgate scan [options]
```

| Option | Description |
|--------|-------------|
| `--path <dir>` | Directory to scan |
| `--no-fail` | Always exit 0 (reporting only) |
| `--json` | Output machine-readable JSON |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All skills passed audit |
| 1 | One or more skills scored High or Critical |

## Requirements

- Node.js >= 18

## Links

- [Website](https://skillgate.sh)
- [GitHub](https://github.com/loris-fo/skillgate)

## License

MIT
