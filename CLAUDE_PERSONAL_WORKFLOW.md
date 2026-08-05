# Claude Personal Workflow — The Synthesis

Date: 2026-07-24. Author: Claude (Fable 5), for Luis.
Status: **superseded for operating rules by `FINAL_WORKFLOW.md` (frozen 2026-07-24, later the same day).** That document is now the canonical workflow decision and readiness call (GO at Stage 0); this one remains the synthesis and rationale layer behind it. On any conflict, FINAL_WORKFLOW wins.

## 0. Authority map — what to trust, in order

| Question | Owner | Status |
|---|---|---|
| How agents behave during work | `skills/*.md` (router: `templates/AGENTS.md`) | current |
| Converged capsule design decisions | `docs/capsules/CONSENSUS-2026-07-24.md` | current |
| Implementation stages and requirements | `MVP_PLAN.mdx` | current |
| Disagreement history and amendments | `docs/capsules/AUDIT…` / `REVIEW…` | history — read, don't follow |
| Original capsule rationale and research | `docs/capsules/design.md`, `pilot.md`, `research/` | **stale in parts** — consensus supersedes on every conflict |
| Why the whole thing works | this document | current |

An agent finding a contradiction resolves it by this table, then records the stale spot. `design.md`'s superseded rules (one-agent-per-capsule, in-file signatures, relaxation ⇒ major, internal semver, mandatory barrel) are known-stale until the reconciliation pass lands.

This document is a synthesis snapshot, deliberately subordinate on details: on any conflict it loses to the owner above, and it gets **rewritten at the next milestone** (post-doc-pass, post-Stage-2, post-pilot), never incrementally patched — a hand-maintained summary that drifts from its sources is exactly the rot this system exists to prevent.

## 1. The secret sauce

Everything in this system — the kit, the capsules, the token economy, the review discipline — is one mechanism applied at every scale:

> **Substitute cheaper attention for more expensive attention, and make every substitution safe with a certificate.**

Attention exists on a price ladder:

```
deterministic tool  <  fresh small-context agent  <  long-context agent  <  cross-model reviewer  <  Luis
```

Every artifact in the workflow is a **substitution certificate** — a thing that lets a cheaper rung safely do work that would otherwise need a more expensive rung:

- A generated `CONTRACT.md` brief lets a 300-word read replace repo exploration. Certificate: derived from code, staleness-refused.
- `scope.mjs` lets a subset of commands replace the full gate. Certificate: glob mapping + `verify-gap` + gate-equivalence flag.
- Review budgets let one reviewer replace a swarm, and self-review replace a reviewer at low radius. Certificate: blast radius bound + two-axis coverage + per-finding disposition.
- The wiki lets reading replace re-derivation. Certificate: drift lint against `sources` globs.
- Generated provides/requires lets "trust the contract" replace "search the consumers." Certificate: derived from the artifact (a manifest computed from code cannot lie).
- A work packet lets a bounded-context worker replace a whole-repo agent. Certificate: writable roots + declared cut edges + focused verify.
- A RED-first test lets an automated check replace human verification. Certificate: independent oracle + proof the test can observe the failure.
- The fixed point makes all evidence comparable — it is the settlement layer every certificate references.

Two forces keep the market honest:

**Risk reverses the direction.** Money, auth, on-chain, PII: the error cost exceeds any attention saved, so those substitutions run backward — up the ladder to Luis, deliberately. Derived risk floors exist to make that reversal mechanical instead of judgment-dependent.

**Every certificate is priced.** A certificate that costs more to maintain than the attention it frees gets revoked — demotion, deletion, and "keep the current shape" are first-class outcomes. This is why facts are derived (free to maintain), structure is earned (paid only where coordination cost is observed), and process stays small (a gate heavy enough to be skipped certifies nothing).

The context-rot research makes this a rare double arbitrage: smaller context is simultaneously **cheaper** (fewer tokens) and **more reliable** (all 18 SOTA models degrade with length; 29%→3% on LongSWE-Bench from 32K→256K). Buying less context buys more correctness. That is why the brief beats exploration even before the subscription is considered.

Three laws fall out, and every surviving mechanism in forty years of prior art obeys them:

1. **Derive, don't declare.** Generated declarations can't lie; hand-written ones rot in months (bnd, Modulith, api-extractor vs. Android permissions, Helm schemas, our own wiki incidents).
2. **Earn, don't install.** Structure follows observed cost, never anticipation (evidence-triggered seams, observed→enforced promotion, rule of three, evidence-gated contract fields — vs. JPMS's collective-action death and Spec Kit's sea of markdown).
3. **Evidence, don't confidence.** Claims are certificates only when a verifier can re-derive them (fresh-evidence completion gate, reviewer output is claims until checked, 73–81% of suite-passing patches are wrong outside the suite — which is why high-risk work keeps human review no matter how green the gates are).

And the token economy is not a new constraint bolted on — it is the same ladder with prices made explicit. Subscription exhaustion is the attention budget hitting zero; a workflow that spends the budget on ceremony has substituted in the wrong direction.

## 2. The operating loop (running today — skills own the detail)

The kit is the proven core; capsules extend it, never replace it. One line per organ; the skill owns the playbook:

- **Calibrate radius × size** before editing; radius buys review, size buys planning. Cheap work stays cheap (`workflow.md`).
- **Pin the fixed point** — the single ref all evidence diffs against (`workflow-start.mjs`).
- **Medium pins a task contract; high loads `planning.md`** — end-to-end slices with blockers, expand→migrate→contract for wide migrations.
- **Bugs get an exact-symptom loop before any fix** (`debugging.md`); behavior changes get RED-first at the highest stable seam with an independent oracle (`testing.md`).
- **Scoped verify after each coherent edit; full gate once at the end** — or gate-equivalence when the scoped run proves it (`scope.mjs`).
- **Review on budget**: touch-up/low self-review; medium ≤1 independent; high ≤2 (Intent + Engineering Risk). Every report states the disconfirming evidence it sought — an evidence-supported pass is a valid result. Reconcile findings once; never re-litigate (`review-panel.md`).
- **Close out into the wiki** — rewrite domain pages, one ledger row, compression over accumulation (`wiki.md`).
- **Completion requires fresh evidence from this turn**; unavailable review is `review-pending`, never `done`.
- **Self-improve only on evidence**, and prefer pruning to adding (`self-improve.md`).

## 3. The capsule layer (converged — to build)

A module opt-in ladder of exactly three states, configured in `llm-workflow.config.json`, consumed by `scope.mjs`:

- **Folder** — ordinary contained feature. The default; most modules stay here.
- **Observed** — generated facts (public entries, actual deps, direct consumers, side-effect inventory, blind spots) + a hot `CONTRACT.md` brief. Violations report, never fail. Zero enforcement, zero ceremony — this is where evidence to earn enforcement accumulates.
- **Enforced** — allowed-edge policy fails closed; default-deny internals; selected I/O-funnel lints; owned expiring exceptions; conservative impact feeding scoped verification.

Promotion is earned, never scheduled: a state change requires deletion-test, depth, locality, and stable-test-seam evidence plus observed recurring coordination cost (the `architecture-review.md` qualification, unchanged). Demotion, merge, and split are equally valid verdicts — a boundary is a hypothesis, not a promotion forever. Independent contracts and sandboxing are optional traits for the rare boundary that proves the need, not higher maturity levels.

Load-bearing rules (full rationale in the consensus):

- **Declaration-first, stack-native.** The authored artifact is the public surface declaration in the stack's own form (TS stub, Go/Java interface, Rust trait, Python Protocol, OpenAPI/proto at network edges). `provides` generates from it — before implementation exists. Contract diff = declaration diff. No stack is privileged; derivation is adapter work; underivable facts are authored and flagged unverifiable.
- **Hot/warm/cold context.** Hot (position-loaded): loader <100 words, brief ~300 target / 500 review-hard-stop. Warm (loaded on a demonstrated edge): the direct counterpart declaration. Cold (queried only): full graph, API reports, closures, history. The graph is machine data, never prompt preamble.
- **Hot files change only when semantics change.** Digests, tool versions, provenance live in the cold report. A churning brief re-bills cached context, invites diff-noise turns, and pollutes PRs.
- **Side effects, not capabilities.** The inventory (network, storage, shared state read/write) exists for review routing. Trustworthy only with the I/O funnel: modules never touch ambient primitives directly; platform wrappers carry effect categories; effects propagate transitively; unknown access widens review. Cross-module *writes* to shared state get the strongest signal — the spooky edge in every stack. Never security language.
- **Ownership ≠ allocation.** Ownership of a module's policy is stable (who signs boundary changes). Allocation is computed per task: work packets group or split modules for cohesion and low merge conflict. One agent per module as a permanent rule is dead — it manufactures shallow nanomodules.
- **Compatibility verdict + consumer closure, no internal semver.** Contract-test deletions are mechanically *flagged* (acknowledgment + closure run), never mechanically *classified* — semantics stay judgment.
- **"Not analyzed" never becomes "not affected."** Analyzer failure, stale reports, unknown files: fail closed or widen scope, visibly.
- **Deferred until evidence demands them:** verified fakes, pending expectations, attestations, mutation gates, regeneration, dashboards. Regeneration in particular is the least valuable, most-discussed idea in the dossier — "rewrite as a normal PR with the contract suite as guardrails" needs zero machinery and works today.

## 4. Token economy (hard constraint, not preference)

Subscription exhaustion is a reliability failure: the completed task doesn't matter if the next one can't start. Optimization order: correctness/high-risk evidence → minimum usage for an accepted change → wall-clock, in that order, never reordered.

**The lever hierarchy — spend effort where magnitude is:**

1. **Agent count.** Single-agent default. Fan-out passes the admission test (independent substantive packets, stable cut edges, wall-clock benefit that matters, no scarcity signal) or doesn't happen. One avoided agent outweighs every word budget in this document.
2. **Review passes.** One semantic review at the widest useful seam. Never reviewer-per-packet, never re-review after non-material edits.
3. **Tool-output volume.** The brief pays for itself here — replacing foreign-file reads at thousands of tokens each. Pass paths and digests, never paste contracts or diffs into prompts.
4. **Retries from missing context** — the cost of a brief that was too small or stale; why hot context exists at all.
5. **Hot-brief size** — a guardrail (~400 tokens), not the battle.

**Mechanical work stays mechanical.** Graph derivation, impact, linting, rendering, verification are deterministic tools. An LLM turn spent rediscovering a computable fact is the purest waste in the system.

**Measurement: spot-check, don't instrument.** Record only what falls out of existing artifacts free — agents spawned, verify commands run, wall-clock, accepted/rejected, provider usage when visible. Transcript-derived counts (foreign reads) are spot-checks on a handful of tasks. No telemetry tooling in v1; no LLM turn ever summarizes telemetry.

## 5. Evidence ledger — why each load-bearing belief is held

| Belief | Evidence | Where |
|---|---|---|
| Small bounded context beats large context | Context-rot (18 models), LongSWE-Bench 29%→3%, lost-in-the-middle | `research/llm-era.md` §8 |
| Context loads by position, never fetch-on-judgment | Vercel eval (~56% fetch-decision failure; small N — held because position-loading costs ~nothing) | `research/llm-era.md` §8 |
| Generated facts beat maintained claims | bnd, api-extractor, Modulith vs. Android/Helm rot; 100% vs 80% descriptor precision | `prior-art.md` law 1 |
| Boundaries need executable checks, not prose | Packwerk privacy checker deleted in 3.0; zero-violation packages crashed alone | `research/war-stories.md` §1 |
| Enforcement rides something that already runs | Modulith `verify()` as JUnit test; every degenerated effort became an unowned exception ledger | `prior-art.md` law 3 |
| Tests alone under-specify behavior | 73–81% suite-passing patches overfit; spec-grounded tests +38pp | `research/contracts.md`, `llm-era.md` |
| Cut boundaries along how code runs, not reads | Shopify: "running code, more than any metric" | `research/war-stories.md` §1 |
| Kernel must be zero-dep and evict churn | Platform Essentials; shared-kernel tragedy of the commons | `research/war-stories.md` Q2 |
| Boundary independence, not deployment independence | Micro-frontend death; Zalando's managed-runtime end state; VS Code's tree-of-depth-one | `prior-art.md` law 8 |
| All-or-nothing dies; ratchets with drains survive | JPMS stall; ArchUnit FreezingArchRule; Packwerk todo graveyards | `prior-art.md` law 6 |
| Cross-model review is variance reduction, not independence | Knight & Leveson 1986; shared plausibility bias | `open-questions.md` R5 |
| Heavy gates get routed around | Kit history (2026-07-12 audit); Obra per-task reviewer rejection | `WORKFLOW_AUDIT.md` |
| The assembled combination is unclaimed as practice, not as theory | Every mechanism exists somewhere; no named, machine-checked unit ships it assembled | audit §5 + review adjudication |

## 6. Readiness — the pet project

**Verdict: ready, gated on one half-day pass and three picks.** Nothing conceptual is open. The three review rounds converged with zero unresolved disagreements.

**Pre-Stage-0 (mechanical, half a day):**

1. Reconciliation doc pass: `design.md`, `pilot.md` to consensus; citation fixes in `prior-art.md`/`llm-era.md`; README status pointer; `open-questions.md` tombstones (Q1 JSON, Q3/Q4 deferred, Q5 external attestation, Q7 no cap, Q8 codename — Q2/Q6 stay open); fold the three review-round-2 amendments into the consensus; align stage numbering to `MVP_PLAN.mdx`; update `skills/capsule.md` last.
2. Commit the converged state on `feature/capsules` (the paper trail must be durable before code exists).

**Luis's three picks (nobody else can make them):**

1. **The pilot vehicle.** (a) Shadow-on-Register first — best evidence, zero build motivation; (b) pet project as pilot repo — best motivation, softer boundary-fit evidence; (c) recommended: **both** — pet project is the build vehicle, Register gets passive shadow mode whenever normal work touches it (the config costs minutes).
2. **What the pet project is.** Reserve-orbit tool vs. neutral app (original pilot criteria hold: 4–8 natural modules + small kernel, one genuinely high-risk module, real consumer/provider edges, something you want to exist).
3. **Confirm the analyzer.** dependency-cruiser as target-repo devDependency; the kit consumes JSON and stays dependency-free.

**Then the MVP stages, each ending in a continue/demote/kill decision:** 0 pin baseline and budget → 1 observed hot brief → 2 scope integration → 3 one enforced boundary → 4 one fan-out experiment (single-worker branch vs. task-packet branch, same held-out acceptance — the only place parallelism gets tested) → 5 consolidate or kill.

**Kill honestly:** brief not useful to a cold agent → stop. Hot context doesn't cut net usage → shrink or stop. Enforcement costs more than it saves → ship observed only. Packets don't beat one worker → keep the context layer, drop the fleet claim. A killed thesis with a written why is a successful pilot.

## 7. Roles and the reconciliation protocol

- **Luis**: strategy, diagnosis, boundary intent, the three picks, review of everything money/auth/on-chain. The human owns contract *intent* — the one measured lever against spec self-laundering (+38pp).
- **Claude**: implementation, verification, synthesis, first-line review. This document.
- **Codex**: cross-model audit. Variance reduction, not independence — mechanical gates stay the floor.

The protocol that produced this convergence, kept because it worked three rounds without a single re-litigated point: **independent written pass → adjudicate claims against sources (reviewer output is claims, not truth) → consensus doc records decisions → amendments append, never silently edit → history preserved as evidence.** Disagreement is processed exactly once, in writing, with the paper trail a cold stranger could audit.

---

*The one-line version of everything above: generate the facts, earn the structure, evidence the claims, and spend attention only where judgment lives — then the pet project is just the first market where the arbitrage runs.*
