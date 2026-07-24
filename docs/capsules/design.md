# Capsule Architecture — Detailed Design

Status: draft for multi-agent + human review. Every section states what is settled vs open. Cross-check claims against `prior-art.md` and `research/` before re-litigating; if you disagree, add to `open-questions.md` with evidence, don't silently edit settled sections.

## 1. Capsule anatomy

```
capsules/<name>/
  AGENTS.md          # tiny loader: read CONTRACT.md, load relevant local doc, follow global spine, run local verify
  CONTRACT.md        # frontmatter (machine) + short prose invariants (human) — see §2
  public.<ext>       # the barrel / only legal import surface
  src/               # implementation — disposable
  tests/
    contract/        # the executable half of the spec; versioned surface (§4)
    internal/        # implementation tests — regenerated with src/, carry no authority
  fake/              # owner-shipped verified fake (§5), where the capsule has consumers that test against it
  docs/              # architecture note, how-to-test, decisions — local context only, never weakens global rules
```

- `AGENTS.md` is a loader, not a playbook (same rule as the kit router). Context is loaded **by position** — the agent working in the directory gets it automatically. Never rely on the agent deciding to fetch context (measured: agents fail ~half the time at the fetch decision; see research/llm-era.md §8).
- `internal/`-style default-deny by placement: anything not exported via `public.<ext>` is private, zero manifest entries needed (Go's lesson: the cheapest declaration is a directory name).

## 2. CONTRACT.md format

One file, two audiences. Machine-readable frontmatter + bounded prose. **v1 fields only** — every additional field must pay its way with a real incident (evidence-gated growth, same as the kit's self-improve rule).

```yaml
---
capsule: exposure-panel
version: 1.2.0            # computed, not chosen — see §4
provides:                  # GENERATED from public.<ext> by capsule-lint; humans sign the diff
  - fn: getExposure(dtf: Address): ExposureReport
  - component: ExposurePanel
requires:                  # DERIVED from code; the *policy* below is what's authored
  platform: [design-tokens, api-client]
  capsules: [pricing]      # each edge may carry a relationship type, see §7
  channels:                # I/O surface: network, storage, shared state
    - net: reserve-api /dtf/exposure
    - state: chainIdAtom (read)
risk: high                 # DERIVED from channels (money/auth/on-chain/PII ⇒ floor); author can only raise
verify: pnpm --filter exposure-panel verify   # the local gate, must run in isolation
signed:                    # written by the verifier, never by hand — see §8
  surface: <hash> tests: <hash> at: <commit> by: <verifier-version>
---
# Invariants (prose, ≤ ~20 lines)
Consumers may rely on: report rows sorted by weight desc; amounts are bigint;
loading state exposed before first fetch resolves. …
```

Settled rules:
- **provides is generated** (api-extractor model: committed report, CI fails on unacknowledged diff — you don't write the surface, you approve its evolution).
- **requires actuals are derived** from imports/usage (bnd model: a manifest computed from the artifact cannot lie). What humans author is *policy*: which platform pieces and capsule edges are allowed (Buck2 `within_view`). capsule-lint diffs actual vs policy; mismatch is a hard fail with an error that names the exact broken edge (Fuchsia-quality messages are part of enforcement, not polish).
- **consumers are never listed in the file.** They are a graph query. Any hand-written consumer list is a bug.
- **No shadow config.** One contract file; anything that needs a second machine format is generated from this one (Stainless/Fern lesson: a config layer between spec and output drifts).

Open (see open-questions.md): exact frontmatter schema; whether `channels` v1 includes events; S-expression vs YAML for the machine block (research found YAML silently corrupted 50% of injected structural errors vs 0% for S-exprs — worth a decision, not a default).

## 3. Verification stack (per capsule)

Layered; each layer rides something that already runs (a test or a lint), never a separate ritual:

1. **Boundary lint** (per change): no deep imports in or out; actual requires ⊆ declared policy; platform never imports capsules. Standard tooling per stack (dependency-cruiser / import-linter / deptrac / ArchUnit) — we configure, we don't build.
2. **Surface check** (per change): regenerate provides; diff against signed report; unacknowledged change fails.
3. **Contract tests** (per change): `tests/contract/` runs green **in isolation** — capsule + platform + declared deps' *fakes* only. Static green ≠ isolated-runnable (packwerk's zero-violation packages still crashed); isolation is executable, or it's theater.
4. **Whole-graph route check** (per assembly/CI): every `requires` edge has a provider through an explicit chain; no orphan expectations (Fuchsia scrutiny model). This is the check that makes "trust the contract, don't search" literally safe.
5. **Regeneration gate** (only when replacing an implementation wholesale): differential run against the old implementation over a characterization corpus + mutation score ≥ threshold on the contract suite. See §6.

`scope.mjs` integration: when a capsule manifest exists, radius stops being glob-heuristic and becomes a graph query — contract unchanged + lint green → local radius; surface changed → consumer closure enters scope; undeclared dependency → hard fail, never a warning.

## 4. Versioning: computed, tests included

Elm's registry computes the version from the API diff and refuses uploads that understate it. We extend the diffed surface to include the contract tests:

- surface addition → minor; surface change/removal → major (classified mechanically, cargo-semver-checks style).
- **removing or relaxing a contract test → major**, mechanically. Tests are the behavioral half of the surface; weakening them is a breaking change to what consumers may rely on.
- A version bump is a *derived artifact*. The author never chooses it; the author acknowledges it.

This is the novel composition (no surveyed system does it) — flagged as such; the pilot must exercise it.

## 5. Cross-capsule testing: verified fakes + pending expectations

- **Verified fakes** (Google SWE-book pattern): the capsule owner ships `fake/` next to the real implementation; **one shared contract suite runs against both**. Consumers test against the fake and get provider-fidelity for free. A fake without the shared suite is a mock, and mocks drift.
- **Pending expectations** (Pact's best idea, minus the broker): a consumer may record a new expectation that fails against the provider *without blocking the provider* — it blocks only its author's merge. This is what lets two agents work both sides of a boundary in parallel. Expectation lifecycle: pending → provider adopts (test moves into provider's contract suite) → binding.
- Integration across capsules is the **box's** suite, with the box named as owner. Cross-capsule seams without a named owner are where fleet bugs will live (Shopify's composition crashes, at fleet speed).

## 6. Regeneration gate

Claim to keep honest: tests alone leave 70%+ behavioral freedom (73–81% of suite-passing patches overfit — research/contracts.md §Q2). Regeneration without review is permitted only when ALL hold:

1. risk tier ≤ medium (derived, §2);
2. contract tests green in isolation;
3. differential run vs old implementation over the characterization corpus: no unexplained divergence;
4. mutation score on `tests/contract/` ≥ threshold (a surviving mutant is a degree of freedom the new implementation may silently exercise);
5. adversarial spec audit has run at least once for this capsule (any gate an LLM optimizes against gets reward-hacked — AlphaVerus; mutation testing is the mechanical audit, Dark-review the semantic one).

High-risk capsules: regeneration produces a normal PR for human review, full stop.

## 7. Fleet / orchestration model

The capsule is the coordination protocol; the orchestrator is thin.

- **One agent per capsule** (worktree per agent — the ecosystem convention, now with enforcement). Ownership is the directory; the contract is the interface freeze that makes N agents not-Brooks's-law.
- **Contracts before parallelism**: a task fanning out across capsules first lands the contract diffs (fast, reviewable), then implementation agents run in parallel against frozen contracts. Pending expectations (§5) handle mid-flight boundary changes.
- **Orchestrator duties**: route tasks to capsules; run the whole-graph check; countersign contract changes (see §8); own nothing the capsules can't reconstruct (every hub in the research became the SPOF — Pact Broker, Zalando's router).
- **Graph shape is throughput**: wall-clock = critical path through the contract graph. Depth/fan-in metrics belong in the lint output. Deep chains are a performance bug, not a style issue.
- **Edge types** (from DDD context mapping, machine-readable on `requires.capsules` edges): `conformist` (consumer absorbs provider changes) vs `acl` (consumer wraps provider behind its own adapter) vs `customer` (consumer's pending expectations carry negotiating weight). Tells an agent how defensively to code a boundary without asking anyone.

## 8. Audit chain (cross-model review is a first-class consumer)

Design constraint: **every artifact passes the cold-stranger test** — auditable by a reviewer with zero session context, human or foreign model. Practical rules:

- Sign-offs are generated: `signed:` block written by the verifier tool (surface hash, contract-suite hash, verifier output digest, commit). An agent narrating "all green" is testimony, not evidence.
- The auditor **re-derives**: re-runs local verify + graph check, compares hashes. Prose logs/docs are pointers to where to look, never the thing trusted.
- Model diversity is variance reduction, not independence (Knight & Leveson: independently-written programs share failure modes; model families share plausibility bias and sycophancy toward existing code). Mechanical gates are the floor; cross-model review layers on top.
- Capsule `docs/` + LOG entries exist to make the *pointer* trail cheap for a foreign model — decisions with why, evidence locations, known traps. Logs are an index, capped and pruned like the kit's wiki ledgers (append-only logs that grow unbounded are their own rot).

## 9. Brownfield path (Register et al.)

- Shrink-only ratchet (ArchUnit FreezingArchRule design): tool-generated violations file committed adjacent to the capsule; new violations fail; fixed ones auto-removed. **A ratchet without a drain plan is permanent amnesty** (packwerk) — every baseline entry gets an owner or a deletion date.
- Boundaries are cut along how code *runs*, not how it reads (packwerk's aspirational-graph failure). The diagnostic step is generating the real dependency graph first and letting it argue.
- Per-capsule day-one value is mandatory (JPMS's collective-action death): a single capsule in an un-capsuled repo must already pay — scoped context, scoped verify, computable local radius.
- Agents comply with bad boundaries forever (humans grumble; agents don't). Every capsule contract carries a review-by date or a churn trigger ("3 contract changes in a month ⇒ boundary review") so "is this boundary still right?" fires mechanically.
