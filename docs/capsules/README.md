# Capsule Architecture — One-Pager

> A capsule is a replaceable module whose **context boundary, code boundary, behavioral contract, and verification boundary** are all explicit and mechanically checked.

Status: **IN PROGRESS — not shipped in the kit.** This folder is the capsule's in-progress home. The binding definition is **`SPEC.md`** (with `CONSENSUS-2026-07-24.md` for rationale); `capsule-skill.md` is the working skill, `capsule-mvp.md` the MVP plan, `pilot.md` how it gets proven, and `design.md`/`prior-art.md` the fuller rationale (stale where they conflict with `SPEC.md`). Capsules are **being piloted on a pilot project** to test whether they are effective before any kit-wide adoption. This folder is the complete written state so any agent or human can pick it up cold, challenge it, and extend it.

## The thesis

Software has always been optimized for its scarcest resource. For humans that was readability within one head. For agent fleets the scarce resources are **context** and **coordination** — and coordination is the one that grows as models improve. Today an orchestrator runs ~5 subagents; tomorrow it runs N Fable-class agents. The bottleneck is never the individual agent — multi-agent failure research shows fleets fail on *specification and inter-agent misalignment*, not capability.

The capsule is the concurrency primitive for that world: **unit of parallelism = unit of ownership = unit of regeneration**. One agent per capsule, orchestrators verifying and signing contracts, humans reviewing only the high-risk surface. Context optimization (an agent works inside one capsule with near-zero foreign reads) falls out as a side effect.

Secondary claim: the implementation becomes the cheapest artifact in the system. The durable assets are the contract and its executable half (the tests). A rotten capsule is not refactored; it is regenerated against its contract and the gates adjudicate.

## The four invariants (stack-agnostic)

A module is a capsule iff all four hold and all four are machine-checked:

1. **Declared surface** — what it provides. *Generated from code; humans sign the diff.*
2. **Declared requirements** — what it consumes (imports, atoms/state, endpoints, storage). *Derived from code, diffed against declared policy.*
3. **Generated consumers** — who depends on it. *Always derived from the real graph, never hand-listed.*
4. **Local verification** — one command that proves the contract from inside the capsule, fast, with only declared dependencies present (executable isolation, not just static green).

Everything else (TS barrels, Go `internal/`, OpenAPI, WIT worlds) is a per-stack enforcement adapter for these invariants.

## Three layers, only three

- **Platform (kernel)** — the shared code every system has: auth, db client, design tokens, config. Not capsules. May be depended on; never depends on capsules. Changes are always max-radius, honestly priced.
- **Capsules** — own their data, tests, contract, and docs. Carry their own agent context (loaded by position, never fetch-on-judgment).
- **Boxes** — composition boundaries. Own exactly what no child can: integration tests across children, dependency-direction policy, shared invariants. Never repeat child contracts. Depth-capped; a box is earned by materially reducing context or governing direction, not by folder nesting.

Target graph shape: VS Code's "tree of depth one" — capsules depend on platform, rarely on each other. Graph depth and fan-in are fleet-throughput metrics, lintable.

## Trust model (the load-bearing rules)

- **Prose is never the source of truth.** CONTRACT.md is the readable projection of machine-derived facts. Hand-written capability lists rot within months (evidence: Android, Helm, our own wiki).
- **Risk is derived, never self-declared.** Capability set → minimum risk tier (money/auth/on-chain ⇒ floor). The sensitive-tier allowlist lives outside the capsule, owned by the human. No surveyed system on earth lets an author self-declare low risk while holding dangerous capabilities.
- **Auditors re-derive, don't read.** A sign-off is a generated artifact (surface hash + test-suite hash + verifier output), recorded by the verifier, not narrated by the audited agent. Cross-model audit re-runs verification; prose logs are pointers, not evidence.
- **Tests are the versioned surface.** Removing or relaxing a contract test *computes* a breaking change (Elm's model, applied to behavior).
- **Regeneration is gated, not free.** Tests alone leave 70%+ behavioral freedom (patch-overfitting literature). The regeneration gate is: property tests + characterization corpus + differential run against the old implementation + mutation score threshold. High-risk capsules keep human review regardless — the honest promise is "review the contract diff and evidence instead of the implementation, for low-risk contract-preserving changes."

## Why this survives model improvement

Better models raise N (fleet size), and coordination cost scales superlinearly with N unless interfaces are frozen and mechanical. Capsules collapse coordination from "everyone knows everything" to "everyone knows their contract." Conway's law becomes programmable: the fleet is spawned to match the capsule graph, per task. The parts of this design tied to 2026-model weaknesses (context ceremony) are kept thin on purpose; the parts that appreciate (verification, ownership, computable blast radius, replaceability) carry the design.

## Documents in this folder

- `design.md` — full design: contract format, verification stack, risk derivation, fleet/orchestration model, audit chain.
- `prior-art.md` — the ten laws distilled from forty years of module systems, with the steal-map.
- `open-questions.md` — unresolved decisions, honest risks, ramblings. Read before proposing changes.
- `pilot.md` — the pet-project plan to prove the thesis.
- `research/` — the five full research reports (boundary tools, manifests/capabilities, contract testing, architecture war stories, LLM-era patterns), preserved verbatim with sources.
- `capsule-skill.md` — the working skill (discipline-first; tooling lands later).

## Origin

Grew out of the agent-workflow kit running in production on the reference app (see kit README § In production). The kit proved the loop (review lenses catch real bugs, gates hold, wiki compounds); capsules are the next pass: make the *architecture itself* enforce what the workflow currently enforces by discipline.
