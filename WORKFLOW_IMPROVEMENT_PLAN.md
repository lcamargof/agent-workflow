# Workflow Improvement Goal

Date: 2026-07-12

Status: phases 0–4 implemented on 2026-07-12; final production pilot/promotion remains open.

## Goal

Make the workflow faster and more token-efficient without weakening its strongest property: completion claims are backed by fresh, relevant evidence. The next workflow should align intent before implementation, keep large work reviewable when commits are not authorized, use tight feedback loops, and spend independent-review budget only where it changes the result.

The goal is achieved only after the changes below are implemented and piloted on real work. Passing the workflow repository's tests is necessary, but not sufficient.

## Evidence reviewed

Key cited documents are recorded (hashes only, no content — this repo is public) in `docs/evidence/2026-07-12/`; the live repos remain authoritative.

- `dtf-sdk`: the complete uncommitted tree relative to `4bcda6a`, its workflow config, wiki, audit, plans, tests, and a fresh full gate run on 2026-07-12.
- `register`: adoption history, decisions, progress ledger, `kit-friction` entries, E2E handoff, commits from the E2E program, and the current uncommitted scope.
- This workflow repository: skills, scripts, templates, tests, commit history, and the pending union-merge/duplicate-lint work.
- Matt Pocock's engineering skills cloned at commit `391a2701dd948f94f56a39f7533f8eea9a859c87` (2026-07-10, MIT).
- Obra Superpowers cloned at commit `d884ae04edebef577e82ff7c4e143debd0bbec99` (v6.1.1, 2026-07-02, MIT).

## Current state

### What works

1. **Risk calibration is directionally right.** Radius and size are separate. Register measured its mechanical gate at about 32 seconds and correctly found that latency came mostly from LLM ceremony, not commands. The touch-up/low/medium/high model is an evidence-based correction.
2. **Scoped verification is useful.** `scope.mjs` maps changed files to commands and review lenses, detects broad changes, avoids duplicate gate runs with `gate-equivalent`, and reports red flags. It classified the `dtf-sdk` tree as high (70 files, security and shared-machinery radius) and the active Register tree as high (15 files, shared E2E machinery).
3. **Fresh gates catch real failures.** In `dtf-sdk`, the workflow caught stale Turbo/codegen/build-output risks, formatting, a broad `any`, documentation routes, and bundle bloat. The final fresh gate is green: forced builds, bundle assertion, types, lint, format, 340 passing tests, 17 opt-in live tests skipped, 93 documentation files checked, and catalog invariants.
4. **Review has found defects automation missed.** Register reviews found unsafe Safari storage, a stale-data latch hole, weekly-bucket corruption of a seven-day statistic, an unguarded API parse, stale trust-boundary comments, an iframe XSS path, phantom governance calldata, and an interaction race misdiagnosed as slowness.
5. **Review findings are reconciled rather than trusted.** Both projects record rejected and corrected reviewer claims. This prevented speculative findings from becoming unnecessary refactors.
6. **The wiki compounds local knowledge.** Brownfield rules survived adoption, domain facts stopped being rediscovered, and project-specific review context became reusable. The pending duplicate detection is a direct response to real union-merge failures.
7. **The kit remains small.** It has no runtime dependencies, a narrow installer, a readable router, and 24 passing tests.

### What does not work well enough

1. **A stage is not an isolated checkpoint.** `dtf-sdk` records three completed stages with the same base commit while all 70 files remain in one uncommitted tree. The checks are real, but per-stage diffs, rollback, blame, and fresh-context handoffs are not. Calling each row a completed stage overstates isolation.
2. **Intent is not a first-class review axis.** The workflow reviews correctness/security/product/complexity, but it has no required, durable comparison between the final diff and the originating task, spec, or acceptance criteria. Good code can still solve the wrong problem.
3. **The stage contract is stated but not captured.** `workflow-start` tells the agent to define exit criteria and non-goals, but creates only a ledger row. On long work, the criteria can drift or disappear in compaction.
4. **Reviewer fan-out can dominate cost.** Register has useful Dark/Light pairs, but also a recorded 15-agent review and repeated multi-agent passes. Independent review found real bugs, yet the number of reviewers is not a quality metric. The current workflow says not to fan out, but does not impose a concrete budget or separate independent axes cleanly.
5. **The debugging protocol is too compressed.** Register's hardest flake was solved by reading the failing screenshot and building the right interaction loop. The workflow says reproduce and hypothesize, but does not require a red-capable command, minimization, ranked falsifiable hypotheses, or instrumentation cleanup.
6. **Test guidance lacks an explicit red-green seam discipline.** It asks for one runnable check and behavioral tests, but does not say how to choose the highest useful seam, prove a test can fail, avoid tautological expected values, or mock only at system boundaries.
7. **High-work decomposition is vague.** “Plan into stages” does not require vertical tracer bullets, blocking edges, one-context sizing, or an expand-contract exception for wide refactors. This contributed to conceptual stages accumulating in one tree.
8. **Environment setup can weaken evidence, but it is project/toolchain-owned.** The fresh `dtf-sdk` gate ran under Node 22 after `nvm` reset between terminals, despite earlier Node 24 runs. Adding a partial engine evaluator to the portable workflow would be more code than value; projects that require a runtime should enforce it in their existing gate or persistent shell/toolchain setup.
9. **Concurrent-work safety is documented after damage, not encoded in the core loop.** Register lost a completed CI rewrite when a stale coordinator instruction reverted a file. The lesson exists in its log, but the kit does not yet require re-reading the live diff before destructive restoration or reconciliation.
10. **Measurement is anecdotal.** We know Register's command time and can count reviewers, but the workflow does not record wall time, command time, review calls, confirmed/rejected findings, reruns, or user corrections consistently. Token-efficiency claims cannot be validated without a proxy or telemetry.

## Assessment by project

### `dtf-sdk`

Overall: **effective on correctness and knowledge capture; weak on work isolation.**

- Adoption was strong: existing rules were preserved, the router is concise, the config maps the monorepo sensibly, and the wiki records decisions that materially change future implementation.
- The workflow improved the product result. It drove forced builds, GraphQL freshness, route checks, consumer bundle checks, current-DTF aggregation, SDK-owned liquidity logic, and focused React query surfaces.
- The final result is presently healthy under the commands actually run. The full gate is fresh and green.
- The largest weakness is structural: workflow adoption, SDK audit, and current-DTF integration are all “done” against the same base and live in one uncommitted tree. This is one high workload with three slices, not three independently closed stages.
- The review record is honest about an unavailable external reviewer, but a high-risk public SDK/API change should not read as fully reviewed when independent review was skipped. It should read “implementation verified; independent/human review pending.”
- Node persistence was an environment-management issue, not a portable workflow feature. The project gate may enforce it; the kit should not grow a semver/runtime subsystem.

### `register`

Overall: **highly effective at finding real product and trust-boundary defects; historically too expensive and occasionally unsafe under coordination.**

- Brownfield adoption exposed real workflow gaps immediately: dirty-tree adoption, duplicate tool-generated agent directories, rules-blind reviewers, unrealistic UI fixtures, and breakpoint-band omissions. Those corrections improved the kit.
- The wiki is valuable enough to have prevented repeated domain mistakes and preserved product decisions, but union merges produced duplicate progress rows. The pending installer and lint changes are justified by observed failures.
- Risk-routed reviews repeatedly paid for themselves, especially on state latches, derived statistics, unsafe parsing, storage, governance calldata, and XSS. Independent review should remain.
- The former default was too slow: any `.tsx` or shared file could trigger reviewer pairs, the gate could run twice, and trivial work paid visual/wiki ceremony. Radius × size and `gate-equivalent` are the right correction.
- A 15-agent review is evidence of missing review budgeting. The workflow needs at most two independent review axes, not a population of personas.
- The co-work revert incident proves that shared-tree commands must be based on the current tree, not stale authorship assumptions. Unexpected changes should be reported and reconciled, never discarded from an old instruction.
- The E2E program demonstrates the best version of the workflow: deterministic boundary mocks, default-deny behavior, exact payload assertions, realistic failures, repeated flake runs, and human escalation on governance/issuance/compliance. It also demonstrates the cost risk: repeated whole-suite runs and adversarial swarms should be selected by evidence, not used as ritual.

## Upstream engineering workflows

Matt Pocock's collection is a set of composable flows rather than one enforced loop:

1. **Idea to ship:** grill the idea, maintain domain language, optionally prototype, synthesize a spec, split multi-session work into tracer-bullet tickets with blocking edges, implement each ticket in a fresh context with TDD, then review against standards and spec.
2. **Hard bug:** build a tight red-capable loop, reproduce, minimize, rank falsifiable hypotheses, instrument one variable at a time, add a regression test at the correct seam, then clean up and record the cause.
3. **Large/foggy work:** name a destination, map only the visible frontier, keep unknown work as fog, resolve one decision ticket per session, and update the map as knowledge appears.
4. **Architecture:** use shared “deep module” vocabulary, find shallow interfaces, design multiple alternatives, and test through the public seam.
5. **Triage:** move incoming issues through explicit states, verify claims before grilling, and publish durable behavioral briefs.
6. **Prototype/research:** answer one uncertain question with a disposable artifact or primary-source report, then carry only the learned decision into production work.

The collection's main strengths are early alignment, precise vocabulary, context-window-sized work, explicit dependency edges, and tight feedback loops. Its main costs are prompt-heavy setup, issue-tracker coupling, mandatory user checkpoints, frequent subagent assumptions, and some unsafe defaults for this kit (automatic commits; always resolving conflicts; “use grilling every time”).

### Specific mechanics worth understanding

#### Alignment and decomposition

- **`grill-with-docs`** delegates to relentless one-question-at-a-time grilling while `domain-modeling` updates terminology and ADRs inline. Its benefit is resolving ambiguity before code; its cost is mandatory human interaction and potentially long conversations. Our adaptation should trigger only when an unresolved choice would materially change behavior, architecture, or scope.
- **`to-spec`** synthesizes the existing conversation into problem, solution, extensive user stories, implementation decisions, testing decisions, and out-of-scope work. Before publishing, it asks the user to approve the test seams. The valuable part is the explicit behavioral contract and seam decision. The “extremely extensive” user-story list is not token-efficient for most engineering changes.
- **`to-tickets`** turns the spec into vertical tracer bullets, each independently demonstrable, sized for a fresh context, and annotated with blocking edges. It has an important exception for wide refactors: expand the new form beside the old, migrate callers in green batches, then contract the old form. This is materially stronger than our current “plan → stages” sentence.
- **`wayfinder`** is for work too uncertain to spec. It names a destination, creates only questions visible at the current frontier, leaves not-yet-formulable work in “fog,” and resolves one decision per session. It prevents false precision, but its issue-tracker state machine is too heavy for ordinary high work.

#### Implementation and feedback

- **`implement`** is intentionally tiny: use TDD, run narrow checks regularly, run the full suite once, code-review, then commit. Its check cadence is good; automatic commit and its lack of our risk/visual/wiki closeout make it unsuitable as our main loop.
- **`tdd`** requires a preselected public seam, one vertical red-green slice at a time, behavior assertions, independent expected values, and mocks only at system boundaries. Its strongest rule is not “write more tests”; it is “prove this test observes the behavior through a stable interface.” Its weakest fit is requiring explicit user confirmation for every seam and excluding refactoring from the loop entirely.
- **`diagnosing-bugs`** spends most effort constructing one fast, deterministic, agent-runnable command that goes red on the exact symptom. Only then does it minimize, rank 3–5 falsifiable hypotheses, instrument one variable at a time, fix, regression-test, and clean tagged diagnostics. This is the clearest immediately transferable skill.
- **`prototype`** separates logic prototypes from UI prototypes. Logic gets a small pure model behind a disposable terminal interface; UI gets 3–5 structurally different variants behind `?variant=` on a realistic existing page. Production keeps the learned decision, not prototype-quality code. Useful when uncertainty is visual or behavioral; wasteful when normal tests can answer the question.

#### Review and intake

- **`code-review`** pins a three-dot fixed-point diff, finds the originating spec, and runs two independent reports: Standards and Spec. Standards includes repo rules plus a Fowler smell baseline; Spec checks omissions, scope creep, and wrong implementations. It deliberately does not merge or rerank the axes. We should preserve that separation while routing our security/product/complexity lenses under Engineering Risk.
- **`triage`** verifies incoming claims before making them agent-ready, distinguishes waiting-for-information from ready-for-agent/human and wontfix, and writes behavioral briefs without fragile file paths. This is a useful maintainer workflow, but it does not improve the core implementation loop unless issue intake is actually a project bottleneck.
- **`resolving-merge-conflicts`** correctly says to recover both intents from commits/issues before resolving. Its unconditional “never abort,” stage-everything, and commit behavior are unacceptable in a shared dirty tree or when commit authority was not granted.

#### Knowledge and architecture

- **`domain-modeling`** maintains a canonical project vocabulary and challenges contradictions between language and code. ADRs are offered only for decisions that are hard to reverse, surprising, and based on a real trade-off. The discipline is valuable; creating `CONTEXT.md` beside our wiki would create two authorities, so the behavior should live in existing project/domain pages.
- **`research`** requires primary sources and a cited repository artifact, performed in the background. The behavior is good but already available through task-specific research and delegation; it does not need another always-installed skill.
- **`codebase-design`** defines depth as caller leverage rather than line-count ratio. It contributes four strong tests: the deletion test; the interface is the test surface; dependencies should be accepted, not constructed; and a seam should correspond to real variation rather than hypothetical indirection.
- **`improve-codebase-architecture`** explores for shallow modules, concept-spanning navigation, leaked seams, and code that can only be tested through extracted internals. It then creates ranked before/after candidates, asks the user to choose, and only then designs a change. This separation of diagnosis from refactoring is strong.
- **`DESIGN-IT-TWICE`** asks 3+ independent designers to optimize the same interface for different constraints—minimal surface, flexibility, common-case ergonomics, and ports/adapters—then compares depth, locality, and seam placement. It is valuable for expensive public interfaces, but too costly as a default refactoring step.

## Capability map and transfer decision

| Upstream skill | What we have | Decision |
| --- | --- | --- |
| `diagnosing-bugs` | A short debugging paragraph | **Absorb now.** Add tight-loop, minimization, falsifiable hypotheses, tagged instrumentation, correct-seam regression, cleanup. |
| `tdd` | Behavioral test rules + one runnable check | **Absorb now, selectively.** Red-before-green for fixes/non-trivial behavior, highest useful seam, independent oracle, system-boundary mocks. Do not require human confirmation for every seam. |
| `code-review` | Risk-routed review lenses and claim verification | **Absorb now.** Add a separate Intent/Spec axis and fixed-point validation. Keep our risk routing and reconciliation. Cap independent reviews. |
| `to-tickets` | High work says “plan → stages” | **Absorb now.** Vertical tracer bullets, blocking edges, one-context sizing, and expand-contract for wide refactors. Keep tracker integration optional. |
| `domain-modeling` | Wiki project/domain pages | **Absorb now, without new files.** Add a concise canonical-language section and active contradiction checks to existing wiki owners. Do not create parallel `CONTEXT.md` truth. |
| `codebase-design` | Containment, domain gates, laziness ladder | **Absorb now.** Interface/seam/depth/locality, dependency categories, interface-as-test-surface, and the deletion test sharpen existing rules. Keep project vocabulary authoritative when terms conflict. |
| `wayfinder` | No explicit fog/frontier model | **Pilot for only huge, uncertain goals.** Destination/frontier/fog is useful; mandatory tracker maps are not yet justified. |
| `prototype` | No dedicated skill; UI and browser verification exist | **Pilot on demand.** Useful for genuinely uncertain state/UI questions, but not part of normal implementation. Keep prototypes disposable and non-production. |
| `to-spec` | Stage criteria and plans, but no durable contract | **Take the contract, not the template.** Extensive user-story lists are expensive and often stale. Use current/desired behavior, non-goals, evidence, seams, and unresolved decisions. |
| `grill-with-docs` | Normal clarification + brainstorm capability | **Do not move into the default loop.** Relentless interviewing on every change conflicts with calibrated autonomy. Use only when ambiguity materially changes the solution. |
| `implement` | Our workflow is substantially richer | **Do not move.** Its automatic commit conflicts with project authority rules, and its closeout is less precise. |
| `setup-matt-pocock-skills` | Installer + brownfield `adopt` | **Do not move.** Our ownership and zero-information-loss adoption are stronger and less tracker-coupled. |
| `triage` | No issue-triage workflow | **Leave optional/outside the core.** Valuable for maintainers, but no evidence that it improves the coding loop. |
| `research` | Primary-source research can be done with native tools | **Do not add a core skill.** Use a background worker when available; keep the behavior in task-specific instructions. |
| `improve-codebase-architecture` | Self-improve requires observed evidence | **Adapt as an optional skill.** Keep evidence-driven candidate discovery, ranking, user selection, and design-after-selection. Drop mandatory HTML/CDN output, automatic subagent exploration, parallel `CONTEXT.md`, and any recurring cadence. |
| `resolving-merge-conflicts` | General safety/verification rules | **Reject as written.** “Never abort” and automatic commit are unsafe. Preserve primary-source intent as a short rule only. |
| `ask-matt` | Router already selects skills by task | **Do not move.** A second router adds context and indirection. |

### Architecture improvement: what was rejected and what should move

The architecture capability should **not** be discarded. The earlier decision rejected a wholesale copy, for six specific reasons:

1. **The trigger is too broad outside the skill body.** Upstream recommends running the scan every few days. Our production evidence says process work must follow observed friction—repeated change fan-out, bugs without a good test seam, cross-feature coupling, or repeated navigation—not a calendar.
2. **The report format is presentation-heavy.** A Tailwind/Mermaid HTML file loaded from CDNs and opened in a GUI is useful for a design workshop, but adds network, rendering, portability, and token costs that do not improve candidate correctness. Markdown plus a diagram only when relationships need one should be the default.
3. **The evidence model is subjective.** “Where the explorer experienced friction” is a good lead, not enough evidence to recommend a refactor. Candidates should cite concrete change history, caller fan-out, duplicated setup, bug clusters, cross-domain imports, or inability to test behavior at a stable seam.
4. **Its vocabulary is deliberately dogmatic.** Banning words like service, API, component, or boundary can fight a project's established language. The concepts are useful, but project terminology must win.
5. **Some refactoring rules are too absolute.** Deleting old shallow-module tests is safe only after replacement interface tests prove equivalent behavior. “One adapter means a hypothetical seam” is a useful smell, not a universal prohibition at trust boundaries.
6. **Design-It-Twice is expensive.** Three or more parallel designers are justified for a public SDK interface, persistence seam, or other hard-to-reverse shape—not for every local extraction.

The adapted architecture skill should be user-invoked or triggered by concrete workload evidence and follow this flow:

1. **Collect evidence:** name the bug cluster, repeated multi-file change, hard-to-test behavior, or navigation/coupling cost.
2. **Map the current module:** callers, interface including invariants/errors/performance, implementation, dependencies, test surface, and ownership seam.
3. **Apply diagnostic tests:** deletion test, interface-as-test-surface, caller leverage, locality, and whether variation justifies an adapter.
4. **Classify dependencies:** in-process, local-substitutable, remote-owned, or true external; this determines the testing strategy.
5. **Rank at most three candidates:** Strong / Worth exploring / Speculative, each with evidence, expected benefit, migration risk, and why doing nothing is or is not acceptable.
6. **Stop for selection:** do not design or refactor every candidate. The user selects one.
7. **Design the selected interface:** use one primary design by default; invoke Design-It-Twice only for hard-to-reverse or broad public interfaces.
8. **Implement through the normal workflow:** behavior-preserving characterization where needed, expand-contract migration, tests at the new interface, and deletion only after all callers and replacement evidence are green.

Its completion criterion is not “an architecture report exists.” It is either:

- no justified candidate, with evidence saying why the current shape earns its complexity; or
- one selected candidate with a concrete interface proposal, migration path, verification seam, expected caller/test simplification, and explicit human approval before implementation.

## Next state

The next workflow keeps the current radius × size calibration and adds five properties:

1. **A task contract:** current behavior, desired behavior, non-goals, acceptance evidence, test seams, and unresolved decisions. Durable only for high/multi-session work.
2. **Slices versus stages:** slices can accumulate in one uncommitted tree; a stage is complete only at an immutable checkpoint or as the final worktree closeout. No automatic commits.
3. **Two review axes:** Intent/Spec and Engineering Risk. Risk remains routed into correctness/security/product/complexity. One combined reviewer for medium; at most two independent reviewers for high, when authorized and useful.
4. **Tight feedback loops:** a bug cannot leave diagnosis without a command capable of reproducing the exact symptom; non-trivial behavior proceeds in vertical red-green slices at an agreed-in-plan seam.
5. **Measured calibration:** record enough timing and review data to decide whether a rule is earning its cost.

## Phased implementation plan

### Phase 0 — Lock the baseline and current fixes

Objective: start from a trustworthy kit and make the evaluation repeatable.

Work:

- Finish and land the already-written union-merge installer behavior and duplicate wiki-lint checks without mixing them with later redesign.
- Add tests for `workflow-start.mjs` and `scope.mjs`, currently the two untested workflow scripts.
- Add a compact evaluation schema to `self-improve.md`: profile, changed-file count, command wall time, review calls, confirmed/rejected findings by severity, reruns/flakes, user corrections, and whether the task crossed a context boundary.

Exit criteria:

- All kit tests pass, including new script coverage.
- Fresh install, brownfield install, and update remain idempotent.
- A fixture proves duplicate union-merge artifacts fail.
- No new required ceremony is added to touch-up or low work.

### Phase 1 — Add intent and honest completion states

Objective: make “done” mean the final diff satisfies the task, not merely that commands pass.

Work:

- Add a compact task-contract section to `workflow.md`: current behavior, desired behavior, non-goals, acceptance evidence, test seams, unresolved decisions, fixed point.
- For medium work, the contract may live in the active conversation/progress row. For high or multi-session work, require one durable project-owned plan document.
- Update review to two axes:
  - **Intent/Spec:** missing requirements, scope creep, wrong behavior.
  - **Engineering Risk:** current routed lenses plus relevant project rules and a small smell baseline.
- Validate the fixed point before review and fail early on an empty or unresolved diff.
- Define explicit states: active, implementation-verified, review-pending, human-review-required, done. An unavailable required reviewer cannot silently become “done.”

Exit criteria:

- A test/fixture shows a green implementation that misses an acceptance criterion is not complete.
- A high-risk task with unavailable independent review ends in `review-pending` or `human-review-required`, not an unqualified `done`.
- Review prompts receive only the diff, task contract, and relevant wiki/rules—not raw session history.
- Touch-up and low work still require no durable plan.

### Phase 2 — Tighten feedback loops

Objective: improve correctness while reducing blind code-reading and repeated broad test runs.

Work:

- Expand the debugging branch: exact-symptom feedback loop → reproduce → minimize → 3–5 falsifiable hypotheses → targeted instrumentation → regression at the correct seam → cleanup.
- Add red-green guidance for bug fixes and non-trivial behavior. Require proof that a new test can fail before trusting it.
- Add concise test rules: highest useful public seam, expected values from an independent source, mocks only at true system boundaries, no tests that assert implementation choreography.
- Teach `scope.mjs` or the workflow to print the narrowest mapped command first and reserve the full gate for final evidence.
- Preserve the existing “three failed attempts” stop condition.

Exit criteria:

- A debugging fixture/harness demonstrates a red-capable exact-symptom command before the fix and green after it.
- Test guidance catches a tautological oracle and an internal-collaborator mock in review fixtures.
- No workflow path requires the full gate during every red-green iteration.
- Debug instrumentation has a mechanically checkable cleanup convention.

### Phase 3 — Make high work sliceable without pretending it is committed

Objective: keep large work understandable across contexts and collaborators.

Work:

- Replace vague high-work stages with tracer-bullet slices: each is end-to-end, independently demonstrable, sized for one fresh context, and names blockers.
- Add the expand–migrate–contract exception for wide mechanical refactors.
- Distinguish a **slice** from a **stage**:
  - A slice is a planned unit inside the current worktree.
  - A stage is complete only at an immutable checkpoint (a user-authorized commit or an explicit snapshot artifact) or when it is the final closeout before handoff.
- If commits are not authorized, keep one stage active, close slices inside it, and run one whole-tree review at the end. Never write multiple “done” rows against the same mutable base as if they were independent checkpoints.
- Add a short handoff format: goal, fixed point, completed slices, evidence, decisions, current diff, next frontier, unresolved risk.
- Add the shared-tree safety rule: before restoring/reverting/reconciling a file, inspect its current diff and handoff; report unexpected authorship instead of discarding it.

Exit criteria:

- A simulated high task with no commit permission produces one active stage, multiple completed slices, and one final reviewable closeout.
- A plan fixture represents blockers and an expand-contract migration.
- A fresh context can resume from the plan/handoff without raw conversation history.
- A stale revert instruction cannot pass the workflow's documented safety check.

### Phase 4 — Cap review cost and improve signal

Objective: retain the defects independent review catches while eliminating persona swarms.

Work:

- Set an explicit budget:
  - Touch-up/low: self-review only.
  - Medium: one concise combined independent review when required by radius; self may satisfy correctness-only work.
  - High: at most two independent reports—Intent/Spec and Engineering Risk—run in parallel when supported and authorized; whole-feature review once at the end.
- Keep each report under a fixed output budget and require file/hunk, severity, claim, evidence, and violated requirement/rule.
- Reconcile once. Record confirmed, rejected, and deferred counts; do not rerun a reviewer after non-material edits.
- Add the small design vocabulary to code standards: interface, seam, depth, locality, deletion test. Use it only when a change introduces or alters an abstraction.
- Add canonical domain terminology to existing wiki pages rather than introducing a parallel `CONTEXT.md` hierarchy.
- Add an optional `architecture-review` skill using the evidence → map → diagnose → rank → select flow above. Default to concise Markdown; visual output and Design-It-Twice are opt-in when the relationship or decision warrants their cost.

Exit criteria:

- No standard high task invokes more than two review workers without an explicit user-requested exception.
- Review fixtures demonstrate that spec failure and standards/risk failure remain separate.
- Review output is shorter than the diff context and every blocking finding is verified before adoption.
- Architecture review fixtures reject an unsupported “cleaner code” recommendation and accept a candidate backed by repeated change fan-out plus a missing behavioral seam.
- The next three medium/high pilots show no increase in escaped Critical/Important findings relative to the current process.

### Phase 5 — Pilot, measure, and promote

Objective: prove the next state is faster and at least as correct on real workloads.

Pilot on at least five tasks spanning: one touch-up/low, two medium wide-radius fixes, and two high/multi-session changes. Include at least one UI task and one trust-boundary or public-API task.

Measure:

- Total elapsed time and command time.
- Review worker count and approximate review input/output size when available.
- Confirmed/rejected/deferred findings by severity.
- Gate reruns and flaky reruns.
- User corrections, scope changes, and escaped defects.
- Whether a fresh context resumed successfully from durable state.

Promotion criteria:

- Median review-worker count is at least 50% lower than comparable pre-change medium/high work, or never exceeds the new budget when no comparable baseline exists.
- Touch-up and low work pay only scoped verification plus self-review.
- No completion claim is made with a stale gate, missing acceptance evidence, or pending required review.
- No confirmed Critical/Important defect is attributable to the reduced review fan-out.
- At least two high tasks resume cleanly in a fresh context from the plan/handoff.
- The kit remains dependency-free unless a dependency demonstrates a smaller total maintenance burden than a local implementation.

If promotion criteria fail, revert the specific phase that caused the regression; do not add another compensating layer of ceremony.

## Expected effect

- **Faster:** narrow feedback loops during implementation, one final gate, no duplicate gate, and bounded review fan-out.
- **More token-efficient:** task contract + relevant wiki pages replace raw history; one or two orthogonal reviews replace persona swarms; high slices start in fresh contexts.
- **Better structured:** vertical slices and blockers replace broad phase labels; mutable slices are not confused with immutable stages.
- **More correct:** explicit intent review, red-capable debugging, independent test oracles, and honest pending-review states close gaps that green automation cannot.

## Non-goals

- No mandatory issue tracker.
- No automatic commits, pushes, conflict resolution, or destructive reconciliation.
- No grilling session for routine work.
- No recurring architecture audit without observed friction.
- No second project-memory hierarchy alongside `docs/wiki/`.
- No token-heavy review swarm as a proxy for confidence.

## Confidence

Confidence in the diagnosis is high because the same patterns appear in two different production repositories and in the workflow's own history. Confidence in the exact next-state mechanics is medium until Phase 5: stage isolation without commit permission and the two-review budget need real-task validation. The plan is deliberately phased so those mechanics are proven before they become defaults.
