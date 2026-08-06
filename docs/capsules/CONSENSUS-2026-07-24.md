# Capsule Architecture — Claude/Codex Reconciliation

Date: 2026-07-24  
Inputs: `design.md`, `pilot.md`, `AUDIT-2026-07-24.md`, `REVIEW-2026-07-24.md`, `capsule-mvp.md`, and the kit's current config/scope workflow.

## Consensus verdict

Continue the capsule thesis in a narrower, cheaper form:

> Use existing module boundaries to generate position-loaded agent context, enforce selected dependency and side-effect rules, compute conservative affected scope, and allocate agents through task-specific work packets.

This is not a claim of a new module architecture. It is a distinct agent-oriented composition of established mechanisms whose practical value and novelty remain to be demonstrated.

The original design survives. Claude's review correctly trims both the design and the Codex audit:

- retain the fleet-coordination thesis;
- add shadow/observed mode as the default entry state;
- separate stable module ownership from per-task agent allocation;
- reuse `llm-workflow.config.json` and `scope.mjs`;
- remove claims that static analysis supplies security isolation;
- defer regeneration and most higher-order contract machinery;
- run a lightweight, staged pilot.

## Hard constraint: subscription usage is a reliability boundary

The workflow fails if it exhausts the user's subscription and blocks further work, even if the completed task was fast or correct. Token and usage efficiency are therefore acceptance criteria, not later optimizations.

Optimization order:

1. preserve the minimum evidence needed for correctness and high-risk safety;
2. minimize subscription usage for an accepted change;
3. reduce wall-clock time without violating the shared usage budget.

Multi-agent fan-out spends duplicated context, tool output, coordination, and review tokens. Concurrency reduces elapsed time only when packets are truly independent; it never makes usage free.

### Preserve the original workflow's cost controls

The existing workflow already established:

- a small loader/router rather than an always-loaded playbook;
- branch-loaded planning, testing, debugging, architecture, and review skills;
- repository-tested word budgets for frequently loaded instructions;
- scoped verification instead of indiscriminate full-suite repetition;
- touch-up/low self-review, medium at most one independent review, high at most two;
- one combined final review rather than implementer/reviewer pairs per slice;
- compact file handoffs and paths to large evidence instead of prompt copies;
- radius × size calibration so cheap work stays cheap.

Capsules inherit these invariants. A capsule feature that bypasses them is a regression.

### Token/usage invariants

1. **Single-agent default.** A module graph does not automatically spawn a fleet.
2. **Shared task budget.** Implementers, reviewers, retries, cold-stranger drills, and reconciliation all spend the same budget. Review agents are not outside the cost model.
3. **Fan out only to shorten a real critical path.** Require at least two substantive, low-conflict packets with stable cut edges. Otherwise keep one worker.
4. **Mechanical work stays mechanical.** Graph derivation, impact calculation, linting, report generation, and verification run as deterministic tools. Do not ask an LLM to rediscover facts a tool can compute.
5. **Progressive context disclosure.** Load the root router, normal workflow, project truth, current module's hot brief, and the task packet. Load direct-edge or foreign-module detail only when the task crosses that edge.
6. **The graph is not prompt context.** Query it and return the smallest explanation path; never inject the repository's full graph into every worker.
7. **One fact, one read.** Pass paths and digests to stable plans/reports. Do not paste the same contract, diff, or reviewer output into multiple prompts.
8. **One semantic review at the widest useful seam.** Do not review every capsule independently and then review the assembled result again. Changed public intent may receive early risk-routed review; otherwise review the converged diff.
9. **No background agent tax.** Stewards, continuous auditors, regeneration tournaments, and cold-stranger drills are explicit experiments, never always-on workflow steps.
10. **Unknown usage stays explicit.** Subscription providers may expose weighted or opaque usage rather than raw tokens. Record provider-reported usage when available; otherwise use cheap proxies and do not manufacture precision.

### Hot-context budget

The generated capsule view exists to replace searching, not to add a large fixed preamble.

- capsule `AGENTS.md`: loader only, target under 100 words;
- hot `CONTRACT.md`: target about 300 words and hard review at 500;
- list public entry paths, not every exported symbol;
- include only direct allowed/actual edges, not the consumer closure;
- keep detailed API reports, graph paths, attestations, history, and test inventories query-on-demand;
- generated volatile facts use canonical compact formatting;
- an unchanged contract is referenced by path/digest, not copied into work packets.

These are initial guardrails, not universal constants. Change them only with measured evidence that the extra hot context prevents more usage than it costs.

### Fan-out admission test

Use more than one implementation agent only when all are true:

1. deterministic scope finds independent packets;
2. each packet is large enough to amortize a fresh context;
3. public cut edges are stable or cheaply declared first;
4. expected wall-clock reduction matters to the user;
5. the user has not selected economy/single-agent operation or warned that usage is scarce.

If remaining subscription capacity is unknown, prefer the lower-usage path. A future configuration may expose an economy/balanced preference, but v1 needs no scheduling-mode framework: single-agent is the default and fan-out is an explicit task decision.

## Corrections accepted from Claude

### 1. Contract-first and generated surfaces can coexist

The audit presented an unnecessary binary choice. The public declaration can be authored first in the stack's native form:

- a TypeScript entry point/type declaration;
- a Go/Java interface;
- a Rust trait;
- a Python protocol or stub;
- OpenAPI, Protobuf, or WIT at an appropriate external/component edge.

`provides` is generated from that declaration. Provider implementation follows.

Qualification: not every local change requires a declaration-first phase. Freeze a public declaration only when a task changes a coordination cut edge or the interface is independently consumed. Do not turn ordinary implementation work into contract ceremony.

### 2. The in-file commit signature is invalid

Remove `signed.at: <commit>` from tracked `CONTRACT.md`. Hash the public surface and contract evidence, then attach verifier evidence outside the signed tree through CI artifacts, Git notes, an attestation service, or an equivalent external record.

This mechanism is deferred from the MVP.

### 3. An I/O funnel is the practical middle

Rename `channels` to **observed side effects**. It exists for impact and review routing, not security proof.

The inventory is trustworthy enough for review routing only when:

1. module code is linted against direct network, environment, storage, secret, clock, and other selected ambient primitives;
2. allowed platform wrappers carry machine-readable effect/risk categories;
3. effect and risk are computed through the transitive wrapper/module closure;
4. dynamic or unknown access becomes `unverifiable` and widens review/scope instead of being treated as absent.

This catches accidental undeclared I/O and makes evasion visible. It does not contain a malicious implementation or create runtime capability security.

Shared mutable state is a first-class side-effect class:

- record read and write separately;
- cross-module writes receive the stronger review signal;
- two owners writing the same table/store/global are presumed coupled until evidence says otherwise;
- stringly event, query, and storage keys remain explicit blind spots unless forced through typed/constants-based funnels.

### 4. Test changes are flaggable, not semantically classifiable

Contract test deletion or modification triggers:

- acknowledgment;
- identification of the intent invariant whose evidence changed;
- consumer-closure verification.

The tool does not declare semantic relaxation or choose a major version. Tests reference stable invariant IDs where that trace is useful. Do not create an elaborate evidence registry before a real change demonstrates the need.

### 5. Ownership and allocation are different

Keep stable ownership for a module's policy and public intent. Ownership means accountability for boundary changes; it does not require a permanent human or agent process.

Compute agent allocation per task:

- one work packet may contain several modules;
- one deep module may have multiple non-overlapping packets;
- changed public cut edges are coordinated explicitly;
- packet boundaries optimize cohesion and low merge conflict, not maximum agent count.

Runtime/fault isolation was not actually part of the current design and should be stated as out of scope rather than counted as a conflated boundary.

### 6. Three adoption states are enough

1. **Folder** — ordinary contained feature/module.
2. **Observed** — generated facts and agent brief; violations report but do not fail.
3. **Enforced** — selected dependency/side-effect policy fails closed and feeds affected scope.

Independent external contracts and runtime sandboxes are optional traits for boundaries that need them, not higher mandatory maturity levels.

Promotion and demotion are evidence-driven. The earlier deletion, depth, locality, and stable-test-seam checks remain the qualification gate.

### 7. Reuse the kit rather than build a parallel product

Extend the current workflow:

- add optional per-module data to `llm-workflow.config.json`;
- produce one deterministic module graph/report with a concrete first-stack analyzer;
- render a bounded generated `CONTRACT.md`;
- teach `scope.mjs` to consume the graph and explain consumer closure;
- keep the existing verify-command mapping and radius/review flow.

Do not build a separate CLI family, database, broker, daemon, general adapter framework, or duplicate repository configuration.

The first implementation uses one concrete stack. Extract a cross-stack adapter interface only after repeated implementations establish the common seam.

### 8. The audit overdesigned the corrective architecture

The five-level ladder, four-graph core model, broad human approval gates, large fixture matrix, and research-style randomized pilot add more ceremony than current evidence earns.

Keep their useful principles:

- distinguish dependency facts, observed effects, and task allocation;
- never translate “not analyzed” into “not affected”;
- fail closed on analyzer failure or stale reports;
- keep authored policy, generated facts, and external verification evidence in separate lifecycles;
- use a held-out oracle for any regeneration experiment.

Implement only the data and gates required for observed/enforced modules.

## Novelty agreement

The original prior-art dossier already says that every individual mechanism exists elsewhere. The audit was right to answer the user's broader novelty question, but wrong to frame this as a new discovery against the proposal.

Use this claim:

> We have not found a mature, named practice that assembles generated per-module agent context, enforced module facts, conservative affected scope, and task-shaped multi-agent allocation in this exact workflow.

Do not use:

- “new module architecture”;
- “unoccupied ground”;
- “no one has done this”;
- patent or freedom-to-operate claims.

The composition may become a meaningful contribution if a working implementation shows lower coordination cost or better correctness. Until then it is a hypothesis, not novelty evidence.

## Minimal architecture contract

An observed or enforced module has:

1. a qualified existing boundary;
2. one or more native public entry/declaration paths;
3. a small authored policy containing purpose, allowed module/platform edges, useful intent invariants, mode, and local verify command;
4. generated actual exports/dependencies/consumers;
5. generated observed side effects plus named blind spots;
6. a deterministic, position-loaded, hot-context-budgeted `CONTRACT.md`;
7. a conservative impact query feeding the existing scope workflow;
8. task-specific work packets when work crosses modules.

An enforced module additionally has:

- default-deny internal import enforcement;
- allowed-versus-actual dependency checks;
- selected I/O funnel rules;
- fail-closed unknown/stale analyzer behavior;
- expiring, owned exceptions;
- local verification with an honest isolation label.

Internal semantic versions, provider fakes, pending expectations, attestations, mutation thresholds, and regeneration are not core v1 requirements.

## Lean implementation path

### Stage 0 — Shadow the existing repository

Add the smallest optional module configuration that can describe one real module:

```json
{
  "modules": [
    {
      "name": "exposure",
      "root": "src/features/exposure",
      "mode": "observed",
      "publicEntries": ["src/features/exposure/public.ts"],
      "allowedDeps": ["pricing", "platform/api-client"],
      "verify": ["pnpm --filter exposure test"]
    }
  ]
}
```

Exact field names remain implementation decisions. Extend the existing config loader; do not introduce a second repository config.

Generate a deterministic graph and compact `CONTRACT.md` for that module. The first adapter may consume a selected existing analyzer's JSON output directly.

Required evidence:

- the report is useful to a cold agent;
- the hot context is smaller than the foreign reading it replaces;
- analyzer failure/empty output cannot pass as a valid empty graph;
- unknown and dynamic edges are visible;
- no production behavior or boundaries are changed.

### Stage 1 — Feed observed facts into scope

Teach `scope.mjs` to:

- map changed files to modules;
- distinguish public/unknown changes from known private changes;
- include consumer closure conservatively;
- print the reason path for widened scope;
- report stale, unmapped, or unverifiable facts.

Required evidence:

- “not analyzed” never becomes “not affected”;
- existing non-module config continues to work;
- a changed public edge widens verification;
- a known-private change remains local when the graph supports that claim.

### Stage 2 — Enforce one earned boundary

For one stable module:

- reject imports of another module's internals;
- reject undeclared module edges;
- add one or two high-value I/O funnel rules;
- support an owned, expiring exception;
- use the existing scoped verification flow.

Required evidence:

- seeded illegal edges fail with exact source, target, and rule;
- the legal path remains easy;
- natural work does not produce persistent policy churn;
- maintenance cost is lower than the review/debug cost removed.

### Stage 3 — Test task-shaped allocation

Only after Stages 0–2 pay:

- choose one genuine cross-module task;
- identify its changed cut edges;
- form cohesive work packets;
- run parallel workers with bounded write scopes;
- converge through the existing whole-goal review and gate.

Keep this an orchestration experiment, not a reason to split modules further.

The primary agent remains the default. Before spawning workers, record why the fan-out admission test passed. Use a compact generated packet per worker and one convergence review at the widest useful seam.

### Deferred research

- independent consumer-contract lifecycle;
- artifact attestation;
- change-affinity analysis;
- stronger runtime capability sandbox;
- regeneration tournament with held-out evaluation.

Each requires a separate incident, user need, or successful lower-stage result.

## Lightweight pilot agreement

The audit's randomized three-condition protocol is unnecessary for an internal go/no-go decision. The original pilot's unstructured comparison is insufficient for its strongest fleet-speed wording.

Use two cheap experiments:

### A. Brownfield shadow pilot

Run observed mode on several normal tasks in an existing repository. Count:

- provider-reported usage before/after when cheaply available;
- otherwise: agents/turns started, context words or bytes supplied, large tool-output events, and retry/review passes;
- foreign internal reads;
- missing or false graph edges;
- scope expansions and misses;
- steering caused by missing context;
- minutes spent maintaining policy/report data;
- natural boundary escapes and where they were caught.

This prices context usefulness, usage cost, and boundary fit. It does not prove fleet speed.

### B. One comparable fleet task

If the shadow pilot pays, run one representative, spec-fixed cross-module feature:

- single-worker baseline on one clean branch;
- task-packet fleet on another clean branch;
- same acceptance criteria and held-out cases;
- include provider usage or the same usage proxies, plus contract/setup/convergence time.

One comparison is not publishable science. It is the minimum evidence needed before retaining the claim that the architecture improves parallel delivery.

Regeneration remains a stretch drill and always uses held-out evaluation by a fresh model or human intent owner.

## Kill and continue decisions

- Generated brief not useful to a cold agent → stop.
- Capsule hot context does not reduce net usage for normal local tasks → stop or shrink the brief.
- Graph misses important real relationships and cannot conservatively expose them → stop or narrow the supported stack.
- Observed mode useful but enforcement cost is high → ship observed mode only.
- One boundary enforcement pays but others churn → enforce selectively.
- Task packets save wall-clock but consume enough extra subscription usage to threaten continuity → single-agent remains the default; parallelism becomes explicit opt-in.
- Task packets do not beat or clarify the single-worker path → keep module context/scope and drop the fleet-speed claim.
- Lower stages pay → retain the broader capsule thesis as documented future research.

## Agreed next edits

No implementation should start before the design artifacts agree. The next document pass should:

1. revise `design.md` for native declaration-first surfaces, external attestation, observed side effects/I/O funnels, test-change flagging, task work packets, no internal semver, and folder/observed/enforced states;
2. revise `pilot.md` to the two-part lightweight pilot;
3. correct `prior-art.md` and `research/llm-era.md` novelty, naming, Vercel, and Forge claims;
4. completed 2026-07-24: replace `capsule-mvp.md` with the lean kit-extension stages above and make net subscription usage a primary acceptance metric;
5. update `capsule-skill.md` only after the design and pilot are internally consistent.

This reconciliation is the current design decision. The two reviews remain evidence and disagreement history, not competing implementation instructions.
