# Final Personal Agent Workflow

Status: **canonical workflow decision, 2026-07-24**

Readiness: **GO for the pet project at Stage 0; NO-GO for automatic agent fleets**

Primary constraint: **an accepted change must not consume the subscription capacity needed to verify, repair, or start the next change**

This document is the final operating synthesis of:

- the production-derived agent workflow and its July audit;
- the original capsule proposal and prior-art research;
- the Codex audit;
- the Claude/Fable review and reconciliation;
- `MVP_PLAN.mdx`;
- `CODEX_PERSONAL_WORKFLOW.md` and `CLAUDE_PERSONAL_WORKFLOW.md`;
- the final alternating Claude/Codex review.

This is a **cold governance artifact**, not default prompt context. Routine work loads the small root router and only the skills and module view selected for the task. Read this file when starting the capsule pilot, changing the workflow, or deciding whether a capsule feature has earned promotion.

## 1. Authority

Use this order when sources disagree:

0. The user's explicit instruction for the current task — no document outranks Luis live.
1. `FINAL_WORKFLOW.md` — final workflow, economics, and readiness.
2. `MVP_PLAN.mdx` — implementation requirements and stage exits.
3. `docs/capsules/CONSENSUS-2026-07-24.md` — reconciled capsule design rationale.
4. Current non-capsule `skills/*.md` — detailed execution mechanics.
5. Audits and reviews — evidence and disagreement history.
6. `docs/capsules/design.md`, `pilot.md`, and `skills/capsule.md` — superseded where they conflict, until reconciled before Stage 1.

Stage 0 uses the current workflow and does not load the stale capsule skill. Before Stage 1, reconcile the capsule design, pilot, README/status, open questions, and skill to this decision; update the skill last.

## 2. The decision in one sentence

> Build a legible modular monolith, derive trustworthy module facts, compile only the facts relevant to the current task into a tiny context/scope/proof package, use one capable agent by default, and add enforcement or agents only after measured evidence shows they repay their cost.

The capsule idea is worth testing as a context and verification optimization. It is not permission to create one agent per module, more documents per folder, a new build system, or a universal module framework.

## 3. The secret sauce: certified attention substitution

The workflow replaces expensive attention with cheaper attention only when a re-checkable certificate makes the shortcut safe.

| Expensive work | Cheaper substitute | Certificate |
| --- | --- | --- |
| Whole-repository exploration | Small generated module brief | Provenance, freshness, visible blind spots |
| Full suite during every iteration | Scoped command set | Changed-file mapping, conservative widening, `verify-gap`, final gate |
| Reviewer swarm | Self-review or one bounded review | Radius × size profile and both review axes |
| Re-deriving history | Current repository knowledge | Clear source ownership and drift checks |
| Whole-repository worker context | Compact task packet | Intent path, bounded writes, stable cut edges, focused verify |
| Manual observation of deterministic behavior | Automated check | Independent oracle and correct behavioral seam |

The implementation mechanism is a small **evidence compiler**:

```text
authored intent + generated repository facts + current diff
                             |
                             v
                     evidence compiler
                             |
              +--------------+---------------+
              |              |               |
          task context   affected scope   required proof
              |              |               |
              +--------------+---------------+
                             |
                    one agent by default
                             |
                 accepted evidence + usage
                             |
                  retain / shrink / demote
```

A certificate is not a guarantee that a tool cannot be wrong. It must be inspectable, regenerable, scoped, and invalidatable. Stale, missing, dynamic, or ambiguous facts invalidate narrow claims and widen scope.

Three laws govern every addition:

1. **Derive before declaring.** Generate volatile facts; author only intent and policy.
2. **Earn before enforcing.** Add a boundary or process step only in response to observed cost.
3. **Evidence before confidence.** A shortcut is accepted only with a re-checkable certificate.

Risk reverses the substitution. Money, authentication, privacy, persistence, public contracts, shared state, and other trust boundaries may require stronger verification, independent review, or human judgment. Scarce usage may delay that work; it never silently weakens its evidence.

## 4. Optimization order

Optimize in this order:

1. preserve the minimum evidence needed for correctness and high-risk safety;
2. minimize subscription usage per accepted task;
3. reduce wall-clock time without violating the shared usage budget.

Faster wall-clock with enough extra usage to block later work is a workflow failure.

### Total task usage

Count the whole task:

```text
primary context and generation
+ tool schemas and results entering model context
+ every worker's repeated context and generation
+ handoffs and reconciliation
+ reviews and review retries
+ failed attempts, restarts, and compaction
```

Provider weighting may be opaque. Prefer provider-reported usage when cheaply visible. Otherwise use the same preselected proxy basket before and after; never translate proxies into invented token precision.

### Lever order

1. Delete unnecessary work.
2. Make computable facts deterministic.
3. Reduce fixed instructions and tool schemas.
4. Retrieve only demonstrated context.
5. Keep raw tool intermediates outside model context.
6. Compact at phase boundaries.
7. Use one capable agent.
8. Add a specialist only when it compresses a large noisy context or removes a real critical-path blocker.
9. Add independent review only when risk earns it.

Parallelism is the last lever.

### Usage postures

These are task decisions, not a scheduling product.

**Conserve — personal default**

- One implementation agent.
- No optional explorer, background agent, or review agent.
- Touch-up/low self-review.
- Medium gets at most one independent review only when radius/risk earns it.
- High-risk required review remains required or the task stops `review-pending`.
- Scoped iteration, one final full or gate-equivalent run.
- Stop at the current stage; no speculative later work.

**Normal**

- Existing radius × size workflow.
- Still one agent unless every fan-out condition passes.
- Existing review caps remain.

**Burst — explicit user opt-in for one task**

- Wall-clock may be prioritized within unchanged correctness gates.
- Central coordinator and bounded packets.
- No reviewer per worker.
- One convergence review.
- Record the additional usage.

One successful Burst task never changes the default.

## 5. Context architecture

### Hot

Loaded for the task:

- root router and normal workflow;
- current project truth;
- task contract;
- current module's compact brief;
- task packet only when needed.

Initial guardrails:

- module `AGENTS.md` loader under 100 words;
- hot contract target about 300 words;
- mandatory size review above 500 words;
- reviewer report under 400 words.

Hot generated files change only when task-relevant semantics change. Analyzer versions, input digests, timestamps, full provenance, export inventories, histories, and closures stay in cold reports.

### Warm

Loaded only after a demonstrated edge:

- direct provider or consumer declaration;
- changed intent invariant;
- one scope explanation path;
- one covering domain page;
- one failure-triggered skill.

### Cold

Queried only for diagnosis:

- full dependency graph;
- analyzer output and API report;
- transitive consumer closure;
- foreign internals;
- history, audits, attestations, and experiments;
- unrelated skills and tool definitions.

The full graph is machine data, never routine prompt preamble.

### One fact, one read

Plans, packets, workers, reviewers, and reconciliation refer to stable facts by path and, where useful, digest. They do not repeatedly paste contracts, diffs, reports, or raw session history.

## 6. The operating loop

### 0 — Protect continuity

- Select Conserve, Normal, or explicit Burst.
- Identify the minimum acceptance evidence.
- Preserve capacity for final verification and one repair attempt.
- Stop optional research or workers before correctness checks.

### 1 — Calibrate radius × size

Radius buys review and verification. Size buys planning and durable state.

| Profile | Default |
| --- | --- |
| Touch-up | Scoped verify and diff self-review |
| Low | Scoped verify, fired lenses, changed-surface inspection |
| Medium | Compact task contract, at most one independent review, full/gate-equivalent closeout |
| High | Durable plan and slices, whole-goal review, full closeout |

Mechanical signals inform the profile; semantics decide. A small diff at a trust/public/shared boundary can be medium. A large isolated feature can require planning without multiple reviewers.

### 2 — Pin the fixed point and intent

For medium/high work, record:

- the fixed point used by every diff and verifier;
- current and desired behavior;
- non-goals;
- acceptance and held-out evidence;
- highest stable test seam;
- assumptions and unresolved decisions;
- changed public cut edges.

The user owns material behavioral intent and risk acceptance. The agent owns routine implementation choices. Tests written by the implementation agent must be checked against independent intent rather than used to certify its own interpretation.

### 3 — Query scope mechanically

- Map changed files to commands, review lenses, and modules.
- Keep supported-private changes local.
- Widen public, policy, unknown, stale, dynamic, or unmapped changes.
- Return one short reason path for each widening.
- Union each required command once.
- Preserve gate equivalence.

“Not analyzed” never means “not affected.”

### 4 — Load the minimum context

Start hot. Load warm information only when the task crosses an edge, a failure points there, or a named rule covers the source.

A foreign internal read answers a named question. Repeated identical questions may justify one compact generated fact; a one-off investigation remains cold.

### 5 — Choose topology

One implementation agent is the default. Multiple workers require every condition:

1. at least two substantive packets;
2. both can progress now without a sequential prerequisite;
3. low write overlap and low shared-state coupling;
4. stable or cheaply declared public cut edges;
5. enough work to repay fresh context;
6. meaningful wall-clock benefit;
7. usage posture permits the spend;
8. convergence and verification are cheaper than sequential execution.

If one answer is unclear, remain single-agent.

### 6 — Implement through the shortest useful loop

1. Reproduce or pin behavior.
2. Change the smallest coherent slice.
3. Use red/green when a real behavioral seam exists.
4. Run the narrow exact-symptom check.
5. Run scoped verification after a coherent edit.
6. Inspect real output when automated checks cannot establish it.
7. Ask a model only for semantic work that tools cannot compute.

### 7 — Converge once

When fan-out was admitted:

- one central coordinator preserves intent;
- workers have bounded writes and use public paths;
- workers return paths, exact evidence, and unresolved blockers—not narratives;
- the coordinator inspects the actual tree and diff;
- changed cut edges integrate deliberately;
- deterministic scope is recomputed;
- conflicts reconcile once;
- the converged diff receives one review at the widest useful seam.

Avoid peer-to-peer agent chatter and permanent model roles.

### 8 — Review by risk

Review answers two questions:

- **Intent:** did the result implement the requested behavior and only it?
- **Engineering risk:** what correctness, security, product, or complexity risk survives?

Budgets:

- touch-up/low: self-review;
- medium: no more than one concise independent report;
- high: no more than two orthogonal final reports when authorized and affordable.

Review count follows task risk, not module or worker count. Reviewer output is a claim until its evidence is checked. Re-review only an affected axis after a material change.

### 9 — Close out and compact

- Run the full gate once unless the final scoped run is gate-equivalent.
- Map every acceptance criterion to inspected evidence.
- Record exact verifier evidence and honest state.
- Update only stale durable knowledge.
- Remove scratch and superseded artifacts.
- Compact to decisions, paths, proof, remaining risks, and next action.
- Record cheap usage evidence without another model summary.

Valid incomplete states remain explicit: `implementation-verified`, `review-pending`, and `human-review-required`.

## 7. Capsule architecture

A capsule is:

> A qualified software module plus a generated, budgeted agent view and optional earned structural enforcement.

It is not automatically a process, service, security sandbox, fault domain, deployment unit, version, work packet, or agent.

### Qualification

A module must pass:

1. **Deletion:** removing it removes a coherent capability.
2. **Depth:** its seam is smaller than the behavior hidden.
3. **Locality:** most conceptual changes remain inside.
4. **Test seam:** important behavior is observable through a stable public seam.
5. **Economic case:** recurring navigation, coordination, defect, or verification cost could repay the capsule tax.

### Three states

**Folder**

- Default for new and fast-changing features.
- Ordinary local code and tests.
- No capsule context or policy tax.

**Observed**

- Existing qualified boundary.
- Native public entry paths.
- Generated direct dependencies, consumers, side-effect observations, and blind spots.
- Compact hot brief and conservative impact query.
- Violations report; they do not block.

**Enforced**

- Reject internal/deep imports.
- Check allowed versus actual edges.
- Route selected direct ambient I/O through named platform seams.
- Propagate supported effect categories through module/platform edges; distinguish shared-state reads from writes and route cross-module writes to stronger review.
- Fail closed or widen on analyzer failure/staleness.
- Own and expire exceptions.
- Provide honest local-verification isolation.

Promotion is evidence-driven and reversible. Demotion, merge, split, or removal are valid.

### Separate boundary axes

| Axis | Question | v1 |
| --- | --- | --- |
| Source/module | Who may import what? | Observed/enforced |
| Task/allocation | Who should do this change? | Computed per task |
| Runtime/fault | What failure is contained? | Out of scope |
| Security/authority | What can code actually access? | Observation/routing only |

Observed side effects are review and scope signals, never security claims.

Changing or deleting contract-test evidence flags the affected intent and widens consumer verification. Tooling does not infer that the semantic change is breaking, safe, major, or minor.

### Artifacts

**Authored policy in the existing config**

- name/root/mode;
- purpose and high-value intent invariants;
- public entry paths;
- allowed module/platform edges;
- local verify command;
- owned temporary exceptions.

**Generated cold report**

- actual direct dependencies and consumers;
- supported public surface facts;
- unresolved/dynamic edges;
- observed effects and blind spots;
- analyzer provenance, freshness, and input digest.

**Generated hot brief**

- purpose and intent;
- public entry paths;
- direct allowed/actual edges;
- verify command and honest isolation;
- observed effects and blind spots;
- query path for detail.

**Task packet, only when needed**

- goal and intent path;
- bounded writable roots;
- allowed public paths;
- changed cut edges;
- focused verifier;
- compact handoff contract.

Use native interface declarations at independently consumed or changed public cut edges. Markdown describes; the language/schema mechanism enforces.

### Not in v1

- one agent per capsule;
- separate capsule CLI/config/database/service;
- general cross-stack adapter framework;
- internal semantic versions;
- universal provider fakes or pending expectations;
- artifact attestation;
- mutation thresholds;
- regeneration authority;
- runtime security or fault isolation;
- dashboards or telemetry services.

## 8. Boundary rent

Every capsule feature has recurring rent:

- hot words loaded;
- policy changes;
- false scope expansions;
- maintenance time;
- verification work;
- review noise;
- remaining foreign reads.

It pays rent through:

- avoided exploration/tool output;
- avoided irrelevant verification;
- earlier boundary escape detection;
- fewer retries from missing context;
- safer independent work.

If it does not pay, shrink the brief, move detail cold, remove a field/rule, demote the module, merge the boundary, or delete the capsule overlay. Architecture has no tenure.

## 9. Pet-project protocol

### Architecture at birth

Use a normal modular monolith with vertical product slices, real behavioral tests, canonical public paths only where consumers exist, one thin platform layer for real I/O, one config, and the existing scope workflow.

Do not manufacture capsule count, services, brokers, fakes, events, registries, or early frozen interfaces to make the pilot look successful.

### Stage 0 — Baseline

- Build one representative end-to-end slice with the current workflow.
- Record accepted/held-out behavior.
- Record provider usage when visible, otherwise the preselected cheap proxies.
- Record agents/turns, large context/tool-output reads, checks, reviews/retries, wall-clock, and interruption.

Exit: the product slice works and the baseline measurement is nearly free.

### Before Stage 1

- Reconcile stale capsule documents and update `skills/capsule.md` last.
- Choose one target-repository analyzer; the kit consumes its output and remains dependency-free.
- Put the converged paper trail in a durable revision when the user authorizes a commit.

### Stage 1 — One observed brief

- Choose one already-qualified boundary.
- Generate one deterministic budgeted brief.
- Expose analyzer failure, emptiness, ambiguity, staleness, and blind spots.
- Do not enforce or move production code.

Exit: a cold agent can state purpose, public paths, edges, verify, and blind spots with lower total context than the foreign reading replaced and no correctness loss.

### Stage 2 — Scope integration

- Map changed files to modules.
- Keep supported-private changes local.
- Widen public/unknown/stale/dynamic changes through explained consumer closure.
- Preserve command de-duplication and gate equivalence.

Exit: no known affected false negative; unknown widens; old behavior stays green; some irrelevant verification is removed.

### Stage 3 — One enforced boundary

- Enforce public paths and allowed edges.
- Add the smallest valuable I/O-funnel rule.
- Add owned expiring exceptions.
- Seed legal and illegal cases.

Exit: all supported seeded escapes fail with useful remediation, legal work stays easy, and maintenance/context cost is below the cost removed.

Observed-only is a successful result if enforcement does not pay.

### Stage 4 — One fan-out comparison

Only after Stages 0–3 pay:

- choose one genuinely parallel cross-module feature;
- freeze the same spec and held-out evidence;
- pre-register what “materially higher usage” and “meaningfully lower wall-clock” mean for the available provider measurement and task class;
- compare one strong agent with a centralized task-packet run on clean branches;
- use the same model class/tools where possible;
- include onboarding, duplicated context, handoffs, merge, review, retry, and convergence.

For the personal default, fan-out advances only when correctness is not worse, comparable usage is not materially higher, wall-clock is meaningfully lower, and continuity is not threatened.

Faster but materially more expensive fan-out remains explicit Burst only. If it does not beat or clarify the single-agent path, retain useful module context/scope and drop the fleet claim.

### Stage 5 — Consolidate or kill

- Delete unused fields and hot detail.
- Demote boundaries that do not pay.
- Keep only measured observed/enforced behavior.
- Reconcile the final docs/skill.
- Run the full repository gate.

Exit: one source of truth and a measured decision, including “single-agent observed modules only.”

## 10. Measurement

Use one deterministic row per accepted pilot task. Do not add an agent, database, or dashboard to produce it.

Primary:

1. accepted correctness against independent or held-out evidence;
2. provider usage per accepted task when available;
3. subscription-exhaustion interruption.

Secondary:

- hot context size;
- foreign internal reads and large tool-output events;
- agents and turns;
- checks avoided or added;
- reviews and retries;
- wall-clock;
- scope false negatives/positives;
- boundary escapes and detection stage;
- policy/report maintenance time.

Transcript-derived counts are spot-checks on a small sample, not continuous instrumentation. Choose proxy definitions before comparison and do not optimize a different metric after seeing results.

Never persist prompt contents, secrets, or proprietary source for telemetry. Count sizes and events mechanically; do not spend a model turn summarizing usage.

Decision rules:

- A normal-path feature that raises usage without a named correctness or continuity gain is removed or moved cold.
- A generated fact unused by context, scope, enforcement, or measurement is not generated.
- An analyzer with unsafe blind spots is narrowed or rejected.
- A rule with persistent exceptions is redesigned or removed.
- A parallel path that threatens continuity is never default.
- One win permits another experiment, not a universal claim.

## 11. Prior art and novelty

Use battle-tested mechanisms for their actual jobs:

- vertical slices and modular monoliths for product locality;
- Spring Modulith/ArchUnit/Packwerk-style checks for in-process boundaries;
- Bazel/Buck/Nx-style graphs for visibility and affected work;
- native types, OpenAPI, Protobuf, or WIT for real interfaces;
- ports/adapters and consumer contracts only at independently varying boundaries;
- processes, containers, Wasm/Fuchsia capabilities, actors, bulkheads, or cells for real authority/fault isolation.

The ingredients are established. The defensible hypothesis is the composition:

> generated position-loaded module context + enforced module facts + conservative affected scope + subscription-aware task-shaped agent allocation.

Do not claim a new universal module architecture, that no one has done it, patentability, or proven novelty. The composition earns a contribution claim only through repeatable pilot results.

Current external evidence supports the direction but not the full composition:

- multi-agent breadth can improve results by spending substantially more tokens, while coding/sequential tasks often fit poorly;
- selective, just-in-time context can outperform full-history accumulation;
- small repository maps and position-loaded routing are promising but narrowly evaluated;
- specification-grounded tests outperform more ungrounded tests in recent controlled tasks;
- agent-first production reports favor repository legibility plus mechanical enforcement.

See `CODEX_PERSONAL_WORKFLOW.md` §5–6 and `docs/capsules/research/` for scoped sources and limitations. The withdrawn FastContext paper is excluded as proof.

## 12. Hard invariants

1. Single agent by default.
2. Subscription continuity is an acceptance criterion.
3. Correctness evidence is protected before optional speed work.
4. Authored intent, generated facts, and verification evidence stay separate.
5. Generated facts replace maintained claims but remain fallible and provenance-scoped.
6. The full graph never becomes default context.
7. “Not analyzed” always widens.
8. Stable facts are referenced, not repeatedly pasted.
9. Commands are unioned and run once per required point.
10. Review count follows risk, not worker/module count.
11. Contract-first work occurs only at changed independent cut edges.
12. Module ownership is stable; agent allocation is task-specific.
13. Side-effect observation is not security isolation.
14. Capsule work extends the existing config and scope engine.
15. Every capsule pays rent and can be deleted.
16. Every completion claim maps to fresh inspected evidence.
17. Background agents and recurring agent audits are explicit experiments, never routine tax.

## 13. Initial pet-project prompt

```text
Start the pet project under FINAL_WORKFLOW.md.

Operate in Conserve mode unless I explicitly authorize Burst. Use one
implementation agent. Build a normal modular monolith; do not create agents,
services, contracts, or abstractions merely to demonstrate capsules.

For Stage 0:
1. Pin product behavior, non-goals, and held-out acceptance evidence.
2. Calibrate radius × size and pin the fixed point.
3. Implement one representative end-to-end slice with the current workflow.
4. Run focused checks, scoped verification, and the final gate once.
5. Record the cheap usage baseline and exact evidence.
6. Stop at the Stage 0 decision boundary.

Before Stage 1, reconcile the stale capsule documents and skill. Then nominate
one qualified module, add one observed generated brief, and compare total
context and correctness. Retain, shrink, or remove it from evidence.

Do not enforce before observation pays. Do not fan out before Stages 0–3 pay.
Never spend final verification or repair capacity on optional parallelism.
```

## 14. Final readiness

We are ready to start the pet project at Stage 0.

We have not yet proven:

- that the hot brief reduces net usage;
- that the analyzer has adequate recall on a live target;
- that enforcement repays its maintenance;
- that task-shaped fan-out beats one strong agent;
- that the composition deserves a novelty claim.

Those are experiment outputs, not reasons for another speculative architecture layer.

> The likely winning shape is not many agents inside many boxes. It is a legible modular monolith plus a tiny evidence compiler that gives the right agent the right context, scope, and proof while preserving enough subscription capacity to finish the work.
