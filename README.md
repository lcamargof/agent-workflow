# agent-workflow

A workflow kit for coding agents: a handful of skills, three small scripts, and a wiki convention for project memory. Plain markdown and one JSON config — it works with anything that reads files.

The goal is deliberately boring: code that stays easy to review and easy to replace, no matter who or what wrote it.

## Why

Getting an agent to write code was never the hard part. The hard part is the codebase three months later — duplicated logic, abstractions stacked on abstractions, diffs that pass every check while quietly bending the shape of the project.

The bet here is that codebases need to break into smaller pieces with explicit boundaries. A few pieces are load-bearing — money math, protocol logic, trust boundaries — and those earn hard boundaries, forced review, sometimes hand-written code. Everything else should be cheap to burn: verify the behavior, ship it, rewrite it when the requirements move.

This kit keeps that split honest. It doesn't chase autonomy or velocity; those tend to show up on their own once review stops being the bottleneck.

## How it thinks

- **Skills are the value; scripts are support.** Heavy gates get routed around — that's measured, not a theory — so every gate here is small enough to actually obey.
- **The dumb solution wins.** Zero dependencies, plain markdown, one JSON config.
- **Evidence over trust.** No "done" without fresh proof from this run. Reviewer output is checked before it's believed. A skipped review is recorded as skipped, not quietly passed.
- **Intent and risk are separate review axes.** Medium work gets at most one independent review; high work at most two. Reviewer count is a cost, not a confidence score.
- **Falsification lives in the output, not a ritual.** Plans state their own strongest counter-argument; reviews report the disconfirming evidence they went looking for; "I don't know" beats manufactured confidence.
- **The wiki compounds.** Project knowledge lives in `docs/wiki/` (interlinked pages, ingest/query/lint). Agents update it at every closeout, so the next agent loads less and assumes less.

## Battle-tested, not whiteboarded

This wasn't sketched on a whiteboard. It grew out of running agents against a real production codebase — five years old, hundreds of thousands of lines of TypeScript, moving real money across multiple chains and protocol versions, shipping daily. That was the first brownfield adoption, and a good share of the backlog below is scar tissue from it.

If a rule here looks arbitrary, it's probably a scar.

## Install

```bash
node install.mjs /path/to/repo          # fresh install
node install.mjs /path/to/repo --update # pull kit updates (your files untouched)
```

A fresh install scaffolds `AGENTS.md`, `CLAUDE.md`, `llm-workflow.config.json`, and `docs/wiki/`. Then you do two things:

1. Edit `llm-workflow.config.json` — the `gate` (your closeout commands) and `verify` rules (file globs → the commands that check them).
2. Fill in `docs/wiki/project.md` — product, stack, safety rules, and the UI voice.

**Ownership is clean:** the kit owns `skills/` and `scripts/llm-workflow/` and replaces them wholesale on `--update`. Everything else is yours and is never touched after the first scaffold.

**Already have agent context** (a CLAUDE.md, .cursorrules, an existing AGENTS.md)? The installer notices and points you at `skills/adopt.md` — a non-destructive merge where your existing rules win every conflict and each one ends up somewhere explicit: the wiki, the config, an override note, or a logged drop.

**Refreshing an adopted repo** to a newer kit? Run `--update`, then follow `skills/re-conciliate.md` to port new routes and config keys into your own files — again, your rules win on conflict.

(The installer also adds union-merge git attributes for the append-only wiki files, so parallel branches stop fighting over ledger rows.)

## For an agent installing this

The whole procedure:

1. `node <kit>/install.mjs <repo>` — the output tells you fresh install or brownfield.
2. **Fresh:** edit `llm-workflow.config.json`, fill `docs/wiki/project.md`, run `node scripts/llm-workflow/wiki-lint.mjs`.
3. **Brownfield:** follow `skills/adopt.md` end to end — zero information loss, repo rules win, the router migrates last.
4. **Done when** wiki-lint is green, `scope.mjs --base HEAD --dry-run` maps sensible commands for a sample diff, and the repo's single entry point is the `AGENTS.md` router.

After that the router owns every session — this README is only for installing and updating.

## The loop

```
calibrate: radius × size            # radius buys review, size buys ceremony
touch-up / low:  scoped verify + self-review through the fired lenses, done
medium:          one stage — ≤1 independent review + full gate + one ledger row
high:            multi-slice — durable contract + blockers + ≤2 orthogonal final reviews

stage mechanics (medium & high):
  workflow-start --stage "<name>"    # clean tree + ledger row + base ref
  implement the smallest unblocked slice, red → green at a real behavior seam
  scope.mjs --base <ref>             # touched files → verify commands + review lenses + red flags
  review intent + engineering risk   # within budget; verify claims before accepting them
  closeout: full gate + visual check (UI) + progress row + wiki ingest + wiki-lint
```

Blast radius and work size are independent. A one-line change in shared machinery is *small work, wide radius* — heavy review, light ceremony. A four-phase feature inside one folder is the reverse. `skills/workflow.md` owns the exact boundaries; when two profiles both look plausible, take the heavier one.

## Layout

- `skills/` — the workflow itself: workflow, planning, testing, debugging, review, pairing, architecture, wiki, code-standards, and the rest.
- `scripts/` — `scope.mjs`, `workflow-start.mjs`, `wiki-lint.mjs`, and a shared lib.
- `templates/` — the `AGENTS.md` router, a config, and the wiki skeleton.
- `tests/` — `pnpm test` covers the scope engine, the scripts, wiki-lint, the installer, skill invariants, and a purity check that keeps the kit project-agnostic.

The kit self-hosts: it carries its own config (gate: `pnpm test`), so `scope.mjs` runs on kit development exactly as it runs on an adopted repo.

## When it's "done"

Measured, not vibed: a fresh repo is productive within one install and one config edit; a complex multi-file feature ships with zero gates routed around; the wiki stays in sync without being nagged; and the kit's own tests and purity checks stay green.

## Known rough edges

- The internals still say `llm-workflow` (the config filename, the scripts folder). Renaming breaks every adopted repo, so it waits for a major version.
- `skills/` at a repo's root is a bit of a namespace grab; a `.llm-workflow/` layout would be cleaner but is a breaking change — also a major-version item.
- There's no per-page length check in wiki-lint yet. No page has needed it; it gets built the first time one actually sprawls.
