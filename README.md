# agent-workflow

A workflow kit for coding agents: a handful of skills, three small scripts, and a wiki convention for project memory. Works with anything that reads markdown.

The goal is boring on purpose: code that stays easy to review and easy to replace, no matter who or what wrote it.

## Why

Getting agents to write code is not the problem. The problem is the codebase three months later: duplicated business logic, abstractions on top of abstractions, diffs that pass every check while quietly changing the shape of the project.

My bet is that codebases need to break into smaller pieces with explicit boundaries. Some pieces are load-bearing (money math, protocol logic, trust boundaries). Those get hard boundaries, forced review, sometimes hand-written code. The rest should be cheap to burn: verify the behavior, ship it, rewrite it when requirements change.

This kit keeps that split honest. It doesn't chase autonomy or velocity. Those show up on their own once review stops being the bottleneck.

## Philosophy

- Skills are the value, scripts are support. Heavy gates get routed around (measured that, it's not a theory), so every gate here is small enough to obey.
- The dumb solution wins. Zero dependencies, plain markdown, one JSON config.
- Evidence over trust. No completion claims without fresh verification. Reviewer output gets checked before it's believed. A skipped review is recorded as skipped, not passed.
- Intent and risk are separate review axes. Medium work gets at most one independent review; high work gets at most two. Reviewer count is a cost, not a confidence metric.
- Falsification lives in the output contracts, not in a separate ritual: plans must state the strongest case against themselves, reviews must report the disconfirming evidence they sought, and "I don't know" beats manufactured confidence.
- The wiki compounds. Project knowledge lives in `docs/wiki/` (Karpathy LLM-Wiki style: interlinked pages, ingest/query/lint). Agents update it at every closeout so future agents load less and assume less.

## In production

This wasn't designed on a whiteboard. It's the workflow behind [Register](https://github.com/reserve-protocol/register), Reserve's main app: five years old, ~200k lines of TypeScript, moves real money across multiple chains and protocol versions. The team ships releases through it daily. Register was the first brownfield adoption, and most of the backlog below comes from that.

A working, evolving workflow. If a rule seems arbitrary, it's probably a scar.

## Install

```bash
node install.mjs /path/to/repo          # fresh install
node install.mjs /path/to/repo --update # pull kit updates (project files untouched)
```

To bring an already-adopted repo fully up to date ("refresh workflow on <repo>"), run `--update` and then follow `skills/re-conciliate.md` — it ports new routes and config keys into the project-owned files the installer deliberately never touches, with the project's own rules winning on every conflict.

Fresh install scaffolds `AGENTS.md`, `CLAUDE.md`, `llm-workflow.config.json`, and `docs/wiki/`, then you:

1. Edit `llm-workflow.config.json`: the `gate` (full closeout commands) and `verify` rules (glob groups → commands) for this repo.
2. Fill `docs/wiki/project.md` (product, stack specifics, safety, UI register).

Ownership: the kit owns `skills/` and `scripts/llm-workflow/` (replaced wholesale on `--update`). Everything else is yours and never touched after scaffolding.

The installer also idempotently adds union-merge attributes for the four append/ledger wiki files to `.gitattributes`. Existing rules for those paths win and are left untouched. This prevents parallel branches from repeatedly conflicting while leaving rewrite-in-place domain pages on normal Git merging; wiki-lint rejects duplicate merged ledger rows, index links, and decision headings.

**Existing repos**: if the repo already has agent context (CLAUDE.md, AGENTS.md, .cursorrules…), the installer detects it and points at `skills/adopt.md`, a non-destructive merge where the repo's existing rules win on conflict and every rule ends up in the wiki, the config, an override note, or an explicit drop log. Glob note: `*` stays within a path segment; use `**` to cross directories (`**/storage/**`, not `**/*storage*`).

## For agents

Told to integrate this kit into a repo? The whole procedure:

1. `node <kit>/install.mjs <repo>` — the output says whether this is a fresh install or a brownfield adoption.
2. Fresh repo: edit `llm-workflow.config.json` (gate + verify globs mapped to the repo's real commands), fill `docs/wiki/project.md`, then `node scripts/llm-workflow/wiki-lint.mjs`.
3. Brownfield (existing agent context): follow `skills/adopt.md` end to end — zero information loss, repo rules win, router migrates last.
4. Done when: wiki-lint is green, `scope.mjs --base HEAD --dry-run` maps sensible commands for a sample diff, and the repo's single agent entry point is the `AGENTS.md` router.

From then on the router owns every session — this README is only for installing and updating the kit.

## The loop

```
calibrate: radius × size            # radius buys review, size buys ceremony — scope.mjs prints the signals
touch-up / low:  scoped verify + self-review through the fired lenses, done
medium:          wide radius, modest size — ONE stage: ≤1 independent review + full gate + one row
high:            multi-slice or cross-package — durable contract + blockers + ≤2 orthogonal final reviews
stage mechanics (medium & high):
  workflow-start --stage "<name>"   # clean tree + ledger row + base ref
  implement smallest unblocked slice # red → green at a real behavior seam when applicable
  scope.mjs --base <ref>            # touched files → verify commands + review lenses + red flags + tier hint
  review intent + engineering risk  # within budget; verify claims before accepting
  closeout: full gate (or gate-equivalent final scoped run) + visual check (UI) + progress row + wiki ingest + wiki-lint
```

Blast radius and work size are independent axes: a one-line fix in shared machinery is small work with a wide radius (heavy review, light ceremony); a four-phase feature inside one domain is the reverse. `skills/workflow.md` § Calibrate: Radius × Size owns the boundaries; when debating two profiles, take the heavier one.

## Layout

- `skills/` — workflow, planning, testing, debugging, review-panel, pair/pair-reviewer, architecture-review, wiki, code-standards, self-improve, writing-great-skills, adopt, re-conciliate, ui-ux, stack, design
- `scripts/` — `scope.mjs`, `workflow-start.mjs`, `wiki-lint.mjs`, `lib/core.mjs`
- `templates/` — AGENTS.md router, CLAUDE.md shim, config, wiki skeleton
- `tests/` — `pnpm test` (scope engine, workflow scripts, wiki-lint, installer, skill invariants, kit purity)

The kit repo self-hosts: it carries its own `llm-workflow.config.json` (gate: `pnpm test`), so `scope.mjs` runs on kit development the same way it runs on adopted repos.

## S-tier bar

The kit is done when, measured not vibed: adoption of a fresh repo is one install + one config edit (<10 min to first productive loop); a complex multi-file feature ships with zero gates routed around (ledger-drift alarm proves it); the wiki stays in sync unprompted (wiki-lint green incl. domain drift); kit self-tests and purity checks are green.

## Backlog

- The internals still say `llm-workflow` (`llm-workflow.config.json`, `scripts/llm-workflow/`). Renaming them breaks every adopted repo, so it waits for a major version.
- `skills/` at target-repo root is a namespace grab in product repos; a `.llm-workflow/` layout is a breaking change (installer + router + adopted repos) — revisit at a major version.
- Page-length wiki-lint check and per-page drift overrides deliberately not built — no observed failure yet (first adoption's max page: 69 body lines); revisit if a page actually blows past ~100 lines or a drift alarm false-fires in practice.
