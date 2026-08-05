# Agent Workflow Re-Audit

Date: 2026-07-12

Status: implementation audit complete; production promotion pending the real-task pilot in `WORKFLOW_IMPROVEMENT_PLAN.md` Phase 5.

## Sources

- Current `agent-workflow` worktree and full diff from `8c2cdd1`.
- Provenance index of the cited production evidence: `docs/evidence/2026-07-12/` (SHA-256 hashes only — this repo is public, so raw findings stay in the owning repos).
- `dtf-sdk` workflow evidence and final uncommitted high-scope tree.
- Register adoption, calibration, review, E2E, and `kit-friction` history.
- Matt Pocock engineering skills at `391a2701dd948f94f56a39f7533f8eea9a859c87` (latest fetched `main`, MIT).
- Obra Superpowers v6.1.1 at `d884ae04edebef577e82ff7c4e143debd0bbec99` (MIT).

## Requirement Audit

| Requirement | Evidence | Status |
| --- | --- | --- |
| Keep cheap work cheap | Touch-up/low remain scoped-check + self-review; static routing test | Implemented |
| Explicit intent | Medium/high task contract; high contracts are section-validated and linked by `workflow-start`; Intent review axis | Implemented |
| High work survives context | Durable plan, slices/blockers, compact file handoff | Implemented; real resume pilot pending |
| Do not pretend mutable slices are stages | Slice/stage distinction; `workflow-start` refuses a second active stage; integration test | Implemented |
| Strong debugging | Exact-symptom loop, minimization, falsifiable hypotheses, source tracing, cleanup | Implemented |
| Strong tests without test theater | Calibrated red/green, independent oracle, correct seam, mock constraints, skip counter-scenarios | Implemented |
| Bound review cost | Low self; medium ≤1; high ≤2 orthogonal final reports; no persona-per-lens | Implemented |
| Verify reviewer claims | Per-finding disposition and material-axis re-review only | Implemented |
| Architecture improvement | Evidence-triggered diagnostic, ≤3 candidates, selection before design, safe migration | Implemented |
| Solid documentation | Wiki ownership, domain language template, compact task/decision/handoff artifacts | Implemented |
| Concurrent-tree safety | Inspect live diff/handoff before restore/reconcile; one active mutable stage | Implemented |
| Script confidence | New scope and workflow-start integration tests; 39 repository tests total | Implemented |
| Skill behavior confidence | Pressure/counter-scenario contract and static invariants | Static coverage implemented; live-agent behavior evaluation pending |
| Five real-task promotion pilot | Phase 5 criteria | Not yet proven |
| “One-shot, no hallucinations” guarantee | No system can prove this | Rejected as dishonest; replaced by inspectable evidence and explicit uncertainty |

## Resulting Workflow

The workflow now has a small always-loaded spine and branch-specific depth:

1. `workflow.md`: profile, medium task contract, operating loop, closeout, and completion states.
2. `planning.md`: loaded only after calibration selects high/multi-session; owns durable contracts, slices/blockers, stage integrity, and handoff.
3. `testing.md`: loaded only for a bug fix/non-trivial behavior with a real test seam.
4. `debugging.md`: loaded only for failures, bugs, flakes, regressions, performance, or unexpected behavior.
5. `review-panel.md`: two axes with fixed budgets and a concise output contract.
6. `architecture-review.md`: loaded only on request or concrete structural evidence.
7. Honest challenge (2026-07-12 revision): the standalone `be-honest.md` was dissolved by user decision into required slots in the owner skills — review reports must state the disconfirming evidence they sought, plan self-review must state the strongest case against the plan, architecture candidates are steelmanned before ranking, and the completion gate requires unknowns to be named as unknowns. Slots are unskippable where a stance could be silently dropped.
8. `wiki.md` and project/domain pages: durable current knowledge; history remains compressed.

`scope.mjs` now reports every changed file without a scoped command as `verify-gap`. It does not hard-fail documentation/scratch work, but prevents “no command mapped” from being silently interpreted as verified code.

This is intentionally not a universal spec → ticket → subagent → review conveyor. Radius and size determine cost.

### Context-cost pass

After the first implementation, a second ownership audit removed architecture and detailed test behavior from always-loaded code standards and removed the duplicated operating loop from the router. Result:

- router: 366 → 166 words;
- code standards: 905 → 663 words;
- default workflow: 1,009 → 812 words; high-only planning is 363 words and loads only for high work;
- planning/testing/debugging/architecture detail loads only on its trigger;
- context budgets are enforced by repository tests.

The main workflow was then split again: high-only plan/slice/handoff material moved to `planning.md`. The default workflow owns calibration, medium contracts, execution, closeout, and completion; high work pays for the additional planning context only after classification.

### Brownfield routing dry-run

The updated `scope.mjs` was run read-only against both production worktrees:

- `dtf-sdk`: high, 70 files, 13 scoped commands, all four lenses. Fourteen unmapped files were surfaced—kit/router files plus `.gitattributes` and a changeset. Earlier closeout ran the workflow repository's tests separately, but the project config does not encode that mapping; the new output makes the gap visible.
- Register: only two current untracked handoff artifacts (`CODEX_AUDIT`, `CODEX_WORK`), correctly low with no product commands, both explicitly reported as verification gaps rather than silently “verified.”

No sibling repository was modified. These are routing/config findings for their next workflow-update stage.

## Matt Pocock Re-Review

The fetched revision is unchanged from the first review, so the source conclusions did not move.

### Strongest contributions retained

- `diagnosing-bugs`: the best exact-symptom feedback-loop definition, minimization, falsifiable hypotheses, and correct-seam regression rule.
- `code-review`: clean separation of Standards and Spec; fixed-point and spec-source discovery.
- `to-tickets`: vertical tracer bullets, blocking edges, fresh-context sizing, and expand-contract exception.
- `codebase-design`: depth as leverage, locality, deletion test, interface as test surface, dependency classification.
- `domain-modeling`: canonical vocabulary, concrete scenario stress, code/language contradiction checks, sparse ADR rule.
- `wayfinder`: destination/frontier/fog prevents fake precision on genuinely uncertain work.
- `prototype`: answer one design question; keep the decision, not prototype-quality production code.

### Rejected or narrowed

- Relentless grilling is not a default; ask only when a choice changes behavior/architecture/risk/scope.
- “Extremely extensive” user stories are replaced by a compact task contract.
- Human seam approval is not required for routine engineering judgment.
- Automatic commits conflict with user authority.
- Mandatory issue-tracker configuration is outside the core loop.
- Three-plus Design-It-Twice agents are reserved for expensive public interfaces.
- `CONTEXT.md` is not added beside the existing wiki.
- “Never abort” conflict resolution is unsafe.

## Obra Superpowers Deep Review

### `brainstorming`

Strength: explores alternatives, validates design, catches ambiguity, self-reviews the written spec. Weakness: hard-gates every feature, component, behavior, config change, and “simple” task behind questions, multiple approaches, section approvals, a committed design, another user review, then a plan. This directly contradicts measured Register latency and touch-up/low calibration.

Decision: retain project exploration, alternatives for consequential choices, plan self-review, and YAGNI. Reject mandatory brainstorming and approval for routine work.

### `writing-plans`

Strength: acceptance coverage, explicit interfaces between tasks, independent deliverables, placeholder/consistency checks. Weakness: 2–5 minute steps, exact line ranges, complete implementation code, and a commit per micro-step produce long, stale plans that bias implementation and tests toward imagined code. It optimizes for a context-free junior/transcription worker, not a Staff-level agent exercising judgment.

Decision: retain task contract, slice blockers, produced/consumed interfaces, and one plan self-review. Reject complete code in plans, micro-task granularity, and automatic commits.

### `subagent-driven-development`

Strength: fresh contexts, explicit worker statuses, compact file handoffs, review packages that stay out of controller context, durable progress ledger, model selection by task, one fixer for final findings. These are excellent context/cost controls.

Weakness: implementer + reviewer for every task, review loops, commits, and a broad final reviewer make reviewer count scale with task count. The method can be fast wall-clock but expensive in model turns/tokens and assumes delegation/commit authority.

Decision: adopt compact file handoffs, statuses, durable progress, and “one final fixer.” Reject worker/reviewer-per-slice; keep our ≤1/≤2 profile budget.

### `test-driven-development`

Strength: seeing RED proves the test can observe the behavior; minimal GREEN and pristine output are strong. Weakness: “delete all code written first,” TDD for every function/refactor, and tests for every method are dogmatic and can generate test/code churn without improving behavior confidence.

Decision: require RED for bugs/non-trivial behavior when a correct seam exists; explicitly skip docs/copy/data config/generated/trivial wiring and document missing seams.

### `systematic-debugging`

Strength: root cause before fix, error reading, working comparison, one hypothesis/probe, backward tracing, condition-based waiting. Weakness: universal defense-in-depth validation at every layer duplicates checks, can change error contracts, and conflicts with trusting internal calls.

Decision: adopt tracing and condition waits. Validate at trust boundaries and invariant owners; add another layer only after a demonstrated bypass/destructive sink.

### Verification and review

`verification-before-completion` strongly confirms our existing “fresh evidence before claims.” `receiving-code-review` strongly confirms skeptical claim verification and technical pushback. `requesting-code-review` is useful but “after each task” is rejected; review is risk/profile-routed.

### Worktrees and branch finishing

Isolation is useful when requested or when concurrent work genuinely needs it. Mandatory worktrees, package installs, commits, merge/push menus, and branch cleanup are harness/project concerns and require user authority; they do not belong in the portable implementation loop.

### `writing-skills`

This is Obra's most important workflow contribution:

- skill prose must be tested as behavior, not merely linted;
- pressure scenario plus counter-scenario establishes both trigger and non-trigger;
- match guidance form to the observed failure;
- keep frequently loaded text small;
- use file references to avoid repeated context;
- label static confidence honestly when no live-agent evaluation ran.

The workflow now has static tests for routing, budgets, review caps, and counter-scenarios. A real-agent evaluation remains part of promotion, not falsely claimed by these tests.

## Comparative Assessment

| Dimension | Matt | Superpowers | Improved agent-workflow |
| --- | --- | --- | --- |
| Alignment | Excellent, interview-heavy | Excellent, mandatory/heavy | Compact contract; asks only on material choices |
| Decomposition | Excellent tracer bullets/fog | Over-detailed micro-plans | End-to-end slices + blockers + expand-contract |
| Debugging | Best exact feedback-loop construction | Best root-cause technique library | Combines both, with calibrated validation |
| Testing | Strong seam/oracle discipline | Strong RED proof, overly universal | RED where behavior/seam justify it; explicit skips |
| Architecture | Best deep-module diagnosis/design | General isolation/clarity guidance | Evidence-triggered architecture skill based mainly on Matt |
| Review | Best Spec/Standards separation | Most elaborate per-task machinery | Intent/Risk separation with hard cost budget |
| Context efficiency | Fresh tickets/contexts | Excellent file handoffs, but many agents | File handoffs + few reviewers + branch-loaded skills |
| Brownfield adoption | Setup-oriented | Plugin/worktree-oriented | Strongest: zero-information-loss adoption and project overrides |
| Repository verification | Relies on project flow | Strong fresh-verification discipline | Strongest scoped/full gate integration and wiki lint |
| Authority/shared tree | Some unsafe automatic actions | Worktree-safe but commit/branch-heavy | No automatic commit/push/destructive reconciliation |
| Cost predictability | Variable; grilling/design fan-out | High and task-count-scaled | Explicit radius × size and reviewer caps |

## Hallucination Controls

The workflow reduces—not eliminates—hallucinations by requiring:

- task intent before broad implementation;
- primary/current project sources via relevant wiki pages and live code;
- tests with independent oracles;
- exact-symptom reproduction before bug fixes;
- fixed-point Intent review;
- reviewer claim verification;
- acceptance-criterion evidence mapping;
- honest `review-pending` and `human-review-required` states;
- no completion claim from worker confidence or green commands outside their coverage.

The largest remaining hallucination risk is skill-following itself: an agent can ignore or misapply prose. Static tests prove document invariants, not model behavior. Real-task pilots and optional live-agent pressure evaluations are the correct next evidence.

## Promotion Decision

Phases 0–4 are ready for production pilot. Full “done” is not yet justified because Phase 5 requires five real tasks across profiles and domains, including UI and a trust/public-contract surface. Until then:

- implementation status: `implementation-verified`;
- review status: self-reviewed with active human feedback; no independent agent review was authorized;
- promotion status: pending real-task evidence.

This is stricter than calling the workflow one-shot trustworthy from its own tests—and therefore more trustworthy.
