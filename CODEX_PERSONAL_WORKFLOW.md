# Codex Personal Workflow

Status: **authoritative operating decision, 2026-07-24**

Decision: **GO for the pet project at Stage 0; NO-GO for automatic capsule fleets**

Primary constraint: **the workflow must preserve subscription continuity**

This document is the final synthesis of the existing agent workflow, the capsule proposal, the Codex audit, Claude/Fable's review, the reconciliation, the MVP plan, the repository's capsule research, and a new pass over current primary evidence.

It answers four questions:

1. What should the personal coding-agent workflow actually be?
2. Which parts of capsule architecture are useful, and which are architecture theater?
3. Can multi-agent work improve delivery without consuming the subscription needed for later work?
4. Are we ready to start the pet project?

Where documents disagree, use this order:

1. this document for workflow and readiness;
2. [`MVP_PLAN.mdx`](MVP_PLAN.mdx) for implementation stages and requirements;
3. [`docs/capsules/CONSENSUS-2026-07-24.md`](docs/capsules/CONSENSUS-2026-07-24.md) for the Claude/Codex design settlement;
4. the audit and reviews as evidence and disagreement history;
5. `docs/capsules/design.md`, `docs/capsules/pilot.md`, and `skills/capsule.md` as **superseded drafts where they conflict**.

The old drafts must not authorize one-agent-per-capsule allocation, mandatory internal semantic versions, signed commits inside tracked contracts, provider fakes for every edge, regeneration without held-out evaluation, or automatic fan-out.

This is a **cold governance artifact**, not routine prompt preamble. Read it when starting the pet-project pilot, implementing capsule tooling, changing the workflow, or auditing a promotion decision. Ordinary tasks load the compact router and routed skills. Loading this entire document on every task would violate its own design.

---

## 1. Final verdict

### Would capsule architecture work?

**Partly, and only in a narrower form.**

There are really three claims:

| Claim | Verdict | Confidence |
| --- | --- | --- |
| A generated, compact module brief can reduce repository exploration | Worth building and measuring | Moderately high |
| A conservative module graph can improve affected scope and structural enforcement | Established mechanisms; integration value still needs a pilot | High on mechanics, medium on net benefit |
| One agent per capsule will make development faster and cheaper | Rejected as a default | Low |

The immediate product is not a new software architecture. It is an agent-facing layer over a good modular monolith:

> Derive trustworthy module facts, compile only the facts relevant to the current task into a small work view, use those facts to narrow verification safely, and allocate more agents only when the task—not the module diagram—earns them.

The architecture succeeds if one agent can read less, search less, rerun less, and still produce stronger evidence. It fails if it adds contracts, reviewers, handoffs, and agents merely because the repository has modules.

### Is it novel?

**The ingredients are not novel. The exact composition may be.**

Information hiding, modular monoliths, public/private module paths, dependency graphs, affected tests, contract tests, capability manifests, worktrees, and orchestrator/worker systems all predate this proposal. The defensible novelty claim is narrower:

> We have not found a mature, named practice that combines generated position-loaded module context, enforced module facts, conservative affected scope, a subscription-aware agent budget, and task-shaped multi-agent allocation as one coding workflow.

That is a product/research hypothesis, not proof of invention, patentability, or unoccupied ground. It becomes a meaningful design contribution only if the pilot shows a repeatable reduction in coordination or usage cost without a correctness loss.

### Are we ready for the pet project?

**Yes—for an instrumented Stage 0 start.**

We are ready to:

- build the pet project as a normal modular monolith with vertical slices;
- establish the non-capsule baseline first;
- add one observed capsule view without changing runtime behavior;
- measure whether that view reduces total context and irrelevant verification;
- earn enforcement one boundary at a time;
- run a multi-agent comparison only after the single-agent stages pay.

We are not ready to:

- design the pet project around one permanent agent per module;
- assume greenfield boundaries validate the thesis;
- call the architecture novel from documents alone;
- make fan-out the normal path;
- build brokers, daemons, dashboards, adapter frameworks, attestation systems, or regeneration machinery.

This is a real **GO**, but it is a go to run the experiment in the right order—not a declaration that the hypothesis has already won.

---

## 2. The secret sauce

The secret sauce is **certified attention substitution through an evidence compiler**:

> **Replace expensive attention with cheaper attention only when a re-checkable certificate makes the substitution safe; compile those certificates into the smallest task context, scope, and proof.**

The evidence compiler is the operational mechanism. The certificate is the trust condition:

| Expensive work avoided | Cheaper substitute | Required certificate |
| --- | --- | --- |
| Repository exploration | Generated hot module brief | Derived facts, provenance, freshness, visible blind spots |
| Full suite every iteration | Scoped command set | Changed-file mapping, conservative widening, `verify-gap`, final gate |
| Reviewer swarm | Self-review or one bounded review | Radius × size profile and both review axes |
| Re-reading history | Current repository knowledge | Source ownership and drift checks |
| Whole-repo worker context | Task packet | Intent path, bounded writes, public cut edges, focused verify |
| Human observation of deterministic behavior | Automated test | Independent oracle, correct seam, red/green evidence where applicable |

A certificate is not a promise that a tool cannot be wrong. It is evidence that can be regenerated, inspected, and invalidated. Generated facts can still be incomplete; this is why provenance, staleness checks, blind spots, conservative failure, and held-out tests are part of the certificate.

The design has five parts.

1. **Evidence compiler, not document pile.** Authored intent, generated code facts, task scope, and verification evidence have separate lifecycles. A deterministic tool compiles a small task view from them.
2. **Task capsule, not permanent agent capsule.** A work packet is shaped around a change. It may cover several modules, and a deep module may contain several independent packets. Module ownership does not dictate agent count.
3. **Unknown means wider, never safe.** Missing, stale, dynamic, or ambiguous analysis widens scope. “Not analyzed” can never mean “not affected.”
4. **Boundary rent.** Every hot document, rule, contract field, reviewer, agent, and verification command has a recurring cost. It stays only if observed failures or measured savings repay that cost.
5. **Continuity before throughput.** Correctness evidence comes first, then minimum subscription usage per accepted change, then wall-clock speed. Faster work that blocks the next task is not faster in the only sense that matters.

Risk can reverse the substitution. At money, authentication, privacy, persistence, public-contract, or other trust boundaries, the expected cost of a mistake may exceed the attention saved. Work then moves up to stronger verification, independent review, or human judgment. Subscription scarcity may delay that work; it does not justify silently weakening its evidence.

Three short laws summarize the result:

1. **Derive before declaring:** compute volatile facts; author only intent and policy.
2. **Earn before enforcing:** add structure in response to observed cost.
3. **Evidence before confidence:** accept a shortcut only with a re-checkable certificate.

This turns capsules into a feedback controller:

```text
repository facts + task intent
              |
              v
   deterministic evidence compiler
              |
      +-------+--------+
      |       |        |
   context   scope   verification
      |       |        |
      +-------+--------+
              |
       one agent by default
              |
     accepted evidence + usage
              |
       retain / shrink / demote
```

The design is intentionally asymmetric:

- machines derive graph facts, deduplicate commands, count context, and enforce structural rules;
- models resolve semantics, implement behavior, diagnose failures, and review intent;
- humans own material intent, risk acceptance, and permission to spend scarce subscription capacity on optional parallelism.

---

## 3. What a capsule is

A capsule is not a directory format and it is not a process boundary.

For this workflow, a capsule is:

> A qualified software module plus a generated, budgeted agent view and optional earned structural enforcement.

### Three states

#### Folder

The default.

- One cohesive feature or domain area.
- Code and tests stay locally understandable.
- No capsule contract tax.
- Ordinary project and workflow rules apply.

Fast-changing product features should usually remain here.

#### Observed

The first capsule state.

- Existing boundary; no forced redesign.
- Native public entry paths.
- Generated exports, dependencies, direct consumers, and named blind spots.
- Compact hot brief.
- Conservative affected-scope query.
- Violations report but do not block.

Observed mode exists to learn whether the boundary and brief are useful before enforcing either.

#### Enforced

Earned selectively.

- Internal imports are rejected.
- Allowed-versus-actual module edges are checked.
- Selected direct ambient I/O is forced through named platform seams.
- Analyzer failure and stale data fail closed or widen scope.
- Exceptions are owned, explained, and expire.
- Local verification has an honest isolation label.

Enforced does not mean runtime-sandboxed, independently deployable, secure against malicious code, or independently versioned.

### A module qualifies before it becomes observed

Apply the earlier architecture discipline:

1. **Deletion:** removing the module removes a coherent capability rather than scattering it.
2. **Depth:** the public seam is substantially smaller than the behavior hidden behind it.
3. **Locality:** most conceptual changes remain inside the boundary.
4. **Test seam:** important behavior is observable through a stable public seam.
5. **Cost evidence:** repeated navigation, coordination, fan-out, bug, or verification cost could plausibly repay the capsule tax.

If those conditions are absent, improve the feature shape or keep it a folder. Do not use capsule machinery to bless a weak boundary.

### Four boundaries that must remain separate

| Boundary | What it answers | Capsule v1 |
| --- | --- | --- |
| Source/module | Who may import what? | Observed or enforced |
| Task/allocation | Who should do this change? | Computed per task |
| Runtime/fault | What failure can be contained? | Out of scope |
| Security/authority | What resource can code actually access? | Observed for routing only |

Confusing these is the fastest route to architecture theater. A source module can share a process and database. An agent write scope is not a security sandbox. An I/O lint rule does not revoke network authority. An independently deployable service can still be behaviorally coupled.

---

## 4. The previous workflow: what must survive

The capsule work sits on top of a workflow that already made the most important cost decisions correctly.

### The previous architecture thesis

The existing [`skills/architecture-review.md`](skills/architecture-review.md) says architecture must follow observed cost:

- repeated change fan-out;
- recurring bug clusters;
- navigation across unrelated files;
- duplicated boundary orchestration;
- inability to test through a stable public seam.

It applies deletion, depth, locality, interface-as-test-surface, and actual variation before proposing a seam. It permits “keep the current shape.” Migration expands, moves consumers while green, and contracts last.

This is stronger than the original capsule draft because it makes a boundary earn its cost. Capsule enforcement must preserve that admission gate.

### The previous workflow economics

The current workflow already contains the right economic skeleton:

- a small root router;
- branch-loaded planning, testing, debugging, review, architecture, and wiki guidance;
- repository-tested word budgets;
- radius × size calibration;
- scoped inner-loop verification;
- command union and de-duplication;
- gate equivalence so a final full gate is not paid twice;
- self-review for touch-up/low work;
- at most one independent review for medium work;
- at most two orthogonal final reviews for high work;
- one whole-goal review instead of implementer/reviewer pairs per slice;
- paths and durable files instead of repeatedly pasted context;
- explicit `review-pending` and `human-review-required` states.

The July workflow audit reduced the always-loaded router from 366 to 166 words, code standards from 905 to 663, and the default workflow from 1,009 to 812 before moving high-only material into a separately loaded planning skill. Repository tests enforce these context budgets. Those are direct local optimizations, not theoretical capsule benefits.

### What is proven and what is not

| Existing workflow property | Evidence status |
| --- | --- |
| Small routed instructions reduce fixed context | Implemented and statically budget-tested |
| Scope maps changed files to de-duplicated commands | Implemented and repository-tested |
| Gate-equivalent runs avoid duplicate verification | Implemented |
| Reviewer count is bounded by profile | Implemented and statically tested |
| Wiki/current-state docs reduce future agent context | Plausible and operationally used; net token saving not isolated |
| Agents follow every skill under pressure | Not proven by static tests |
| The redesigned workflow reduces provider usage across real tasks | Pilot still pending |
| One-shot correctness | Impossible to guarantee and explicitly rejected |

Capsules inherit this honesty. They do not convert static document tests into behavioral proof.

### What the original capsule proposal got wrong

The initial capsule design should be treated as a productive overreach. Its most expensive mistakes were:

- prescribed capsule anatomy before boundary qualification;
- permanent one-agent-per-capsule allocation;
- mandatory public barrels even where they load unrelated code;
- internal semantic versions inside a single-version repository;
- a self-referential tracked `signed.at: <commit>`;
- provider fakes and pending expectations as generic module infrastructure;
- test-change semantics inferred mechanically;
- static dependency facts described too close to security capabilities;
- greenfield-first pilot design;
- regeneration authority before held-out intent evidence;
- a parallel framework beside the kit's existing config and scope engine.

The reconciliation keeps the useful thesis and removes those mechanisms from v1.

---

## 5. What the new evidence says

Research was weighted in this order:

1. official production experience with disclosed measurements;
2. established architecture/tool documentation;
3. controlled research with clear scope;
4. preprints and single-project evaluations;
5. local hypotheses.

No single source directly proves this complete design.

### Multi-agent systems spend performance

Anthropic's production research system found that an orchestrator with parallel research agents beat a single agent by 90.2% on an internal breadth-first research evaluation. The same report says token use alone explained 80% of BrowseComp performance variance and that multi-agent systems used about 15 times the tokens of ordinary chats. It explicitly warns that most coding work has fewer parallelizable tasks and more inter-agent dependencies, making it a weaker fit. ([Anthropic, multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system))

Anthropic's later multi-agent guidance reports 3–10 times the tokens of equivalent single-agent approaches, caused by repeated context, coordination, and handoffs. Its useful case for a subagent is context isolation: a well-defined filter consumes a large noisy result and returns a tiny answer. ([Anthropic, when to use multi-agent systems](https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them))

Google Research evaluated 180 configurations across single, independent, centralized, decentralized, and hybrid systems. Centralized coordination improved one parallelizable task by 80.9%, while every multi-agent variant degraded a sequential planning task by 39–70%. Independent agents amplified errors by up to 17.2× versus 4.4× for a centralized design, and tool-heavy tasks increased the coordination tax. ([Google Research, scaling agent systems](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/))

**Workflow consequence:** one primary agent is the default. If a fleet is admitted, use a central coordinator, independent substantive packets, minimal peer chatter, and one convergence seam. Fleet size is never derived from module count.

### Less context can improve both cost and correctness

Anthropic frames context as finite and subject to diminishing usefulness. Its recommended hybrid is a small amount of preloaded high-signal context plus just-in-time retrieval by path, query, or tool. Compaction should preserve decisions and unresolved bugs while discarding old raw tool output. ([Anthropic, effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

Its tool-use measurements show how large the fixed tax can become: loading 50+ tool definitions consumed roughly 77K tokens before work, while deferred tool discovery reduced that to about 8.7K. Programmatic tool orchestration reduced average usage from 43,588 to 27,297 tokens in the reported complex research workload because intermediate results stayed out of model context. ([Anthropic, advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use))

A 2026 preprint on a 50-task enterprise expense workflow found that keeping only the last five tool interactions improved completion from 71.0% to 79.0% while reducing tokens from about 1.48M to 535K; compact summarization improved completion further. The task is narrow and the result is not a universal coding law, but it supports selective retention over full-history accumulation. ([Less Context, Better Agents](https://arxiv.org/abs/2606.10209))

**Workflow consequence:** the graph, export inventory, consumer closure, detailed history, and raw analyzer output stay cold. Hot context contains a loader, a compact current-module brief, and the current task contract. Tools aggregate mechanically and return concise explanations.

### Repository maps are promising, not settled

The Forge preprint reports 33–44% fewer navigation steps across 24 localization tasks with architecture descriptors and a 100% versus 80% result in a separate small artifact experiment. It is a four-page, single-author preprint with one field project, and the multi-agent effect is untested. It supports the observed-brief experiment, not a universal architecture claim. ([Formal Architecture Descriptors as Navigation Primitives](https://arxiv.org/abs/2604.13108))

Vercel reported a Next.js-specific evaluation where a version-matched docs index in `AGENTS.md` reached 100% versus 53% baseline and 79% when a skill was explicitly requested. The useful idea is not “put all docs in AGENTS.md”; it is to preload a tiny routing index so retrieval does not depend on the agent remembering to invoke a skill. The result is vendor-run and narrow. ([Vercel, AGENTS.md evaluation](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals))

The widely cited FastContext repository-explorer preprint claimed up to 60% coding-agent token reduction, but arXiv marks it withdrawn. It is excluded from the evidence base and must not be used to justify a new exploration agent. ([withdrawn FastContext record](https://arxiv.org/abs/2606.14066))

**Workflow consequence:** test a tiny generated routing view. Do not preload a rich architecture encyclopedia, select a serialization fashion from one paper, or create an exploration subagent by default.

### Review and specification need different treatment

A preliminary study of 30 ChatDev tasks with a GPT-5 reasoning model attributes an average 59.4% of tokens to iterative code review and 53.9% to inputs. That dataset is too small and framework-specific to generalize, but it directly reinforces the need to cap review loops and duplicated context. ([Tokenomics](https://arxiv.org/abs/2601.14470))

A July 2026 preprint holds test budget and repair loop fixed and reports that giving the tester a specification checklist improved correct code by 38 percentage points across three Claude tiers and by 36 points on held-out tasks; ungrounded extra suites did not approach the same result. It also reports gains across GPT and Gemini models. The tasks are well-specified code problems, so the magnitude should not be generalized to an application, but the direction is important. ([Specification Grounding Drives Test Effectiveness](https://arxiv.org/abs/2607.06636))

**Workflow consequence:** human/user intent is the scarce specification input. Tests and reviews must ground themselves in that intent. More reviewers or more tests cannot compensate for a self-laundered or missing spec.

### Agent-first production supports legibility plus enforcement

OpenAI's agent-first repository report describes a short `AGENTS.md` as a table of contents, repository-local plans and docs as the system of record, progressive disclosure, mechanical architecture enforcement, strict dependency directions, and remediation-oriented linter errors. It also warns that this depended on major repository-specific investment and should not be assumed to generalize. ([OpenAI, harness engineering](https://openai.com/index/harness-engineering/))

OpenAI's Symphony separates repository-owned workflow policy from orchestration and makes issues/deliverables—not sessions—the control plane. Its specification also treats rate-limit state as observable operational data. Symphony addresses durable unattended orchestration and human attention; it does not show that a subscription-funded personal workflow should spawn agents freely. ([OpenAI, Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/))

**Workflow consequence:** keep durable policy in the repository, make environments and evidence legible, and enforce invariants mechanically. Do not copy a high-throughput organizational fleet model into a quota-constrained personal loop.

### Cross-model adjudication

The concurrent Fable synthesis, [`CLAUDE_PERSONAL_WORKFLOW.md`](CLAUDE_PERSONAL_WORKFLOW.md), independently converges on the same center: single-agent default, earned observed/enforced modules, hot/warm/cold context, one semantic review seam, deterministic mechanics, and subscription continuity.

Accepted refinements:

- model the workflow as certified substitution of expensive attention;
- keep volatile digests and tool provenance out of hot files;
- spot-check transcript-derived usage instead of building telemetry;
- treat the brief, enforcement, and fan-out as separately killable claims.

Corrections retained here:

- generated facts are more auditable than prose, but they can still be stale, incomplete, or wrong;
- a hot brief is not assumed to pay for itself before Stage 1 measures it;
- Claude, Codex, and other models do not receive permanent architecture-shaped roles;
- Stage 0 may begin now, while stale capsule behavior documents must be reconciled before Stage 1.

---

## 6. Battle-tested architecture: what to steal

Capsules should compose existing mechanisms instead of replacing them.

| Need | Use first | Capsule contribution |
| --- | --- | --- |
| Fast-moving feature | Vertical slice / contained feature | Optional observed view |
| Large in-process app | Modular monolith | Agent brief and affected scope |
| Public/private imports | Language/package visibility, build rules, lint | Compact explanation and task routing |
| Affected build/test | Bazel/Buck/Nx-style graph | Agent-readable reason path |
| External dependency variation | Ports and adapters | Side-effect/risk view |
| Independently evolving service | Native schema plus consumer contract | Changed-edge work packet |
| Language-neutral plugin ABI | WIT/component model or native plugin system | Position-loaded contract view |
| Actual authority isolation | Process/container/Wasm/Fuchsia-like capability routing | Not supplied by v1 |
| Runtime blast radius | Bulkheads, cells, actors/supervision | Separate from source capsules |

### Modular monolith

Spring Modulith derives a module model from code, rejects cycles and internal-package access, optionally enforces allowed dependencies, supports module-scoped tests, and can select transitively affected module tests. It demonstrates that derived module facts, public paths, structural verification, and affected tests belong together. ([Spring Modulith fundamentals](https://docs.spring.io/spring-modulith/reference/fundamentals.html), [verification](https://docs.spring.io/spring-modulith/reference/verification.html), [testing](https://docs.spring.io/spring-modulith/reference/testing.html))

Shopify's Packwerk history demonstrates incremental componentization and selective enforcement in a large monolith. It also warns against assuming every component will become perfectly acyclic at once. ([Shopify, state of the monolith](https://shopify.engineering/shopify-monolith))

**Steal:** derive before duplicating, enforce incrementally, keep module tests local, and let brownfield violations shrink over time.

### Build graph

Bazel visibility distinguishes public targets from implementation details and fails invalid edges during analysis. Hermetic actions make their inputs explicit, which enables caching, reproducibility, and graph-based parallel execution. ([Bazel visibility](https://bazel.build/concepts/visibility), [hermeticity](https://bazel.build/basics/hermeticity))

**Steal:** explicit inputs and outputs, default-private boundaries, deterministic affected queries, one execution per unique command, reproducible evidence.

**Reject:** rebuilding a general build system inside this kit.

### Native interface contracts

Use the language's real interface mechanism or an established external schema first: TypeScript entry points/types, Go interfaces, Rust traits, Java APIs, Python protocols, OpenAPI, Protobuf, or WIT. Generated reports can describe those surfaces, but Markdown is not the source of executable type truth.

**Steal:** declare only a changed public cut edge before independent consumers implement against it.

**Reject:** designing a universal contract language before two or more actual stacks prove a common seam.

### Ports, consumer contracts, and test doubles

Ports/adapters are appropriate when a dependency varies independently or crosses a true external boundary. Consumer-driven contracts are appropriate when provider and consumer lifecycles are genuinely independent.

**Steal:** consumer-owned intent evidence and provider-run compatibility checks where independent evolution justifies the lifecycle.

**Reject:** a fake, broker, or pending-expectation protocol for every in-process module edge.

### Security and runtime cells

Fuchsia-style capability routing, Wasm component boundaries, containers, processes, IAM, and AWS cells establish real authority or failure boundaries. AWS describes cells as independent replicas intended to reduce scope of impact; that is an operational architecture, not a source-directory convention. ([Fuchsia components](https://fuchsia.dev/fuchsia-src/concepts/components/v2/introduction), [WIT](https://component-model.bytecodealliance.org/design/wit.html), [AWS cell guidance](https://docs.aws.amazon.com/solutions/cell-based-architecture-on-aws/))

**Steal later:** actual isolation when the product has a security, tenancy, or failure-containment requirement.

**Reject now:** calling an import lint or observed side-effect list a sandbox.

---

## 7. The token and subscription economy

### The unit of optimization

Optimize **usage per accepted task**, not tokens per prompt, agent count, or wall-clock in isolation.

For a task:

```text
total usage =
  primary-agent context and generation
  + tool schemas and tool results entering model context
  + every worker's repeated context and generation
  + handoffs and reconciliation
  + reviews and review retries
  + failed attempts and restarts
  + compaction/summarization calls
```

The exact provider weighting may be opaque. Do not turn proxy counts into fake token precision.

A capsule earns its place only when:

```text
avoided exploration
+ avoided irrelevant verification
+ avoided duplicated review
+ avoided retries from missing context
>
hot brief
+ graph/query overhead
+ policy maintenance
+ extra handoffs
+ extra agents
```

Correctness is a constraint on this inequality, not a term that may be traded away silently.

### Subscription continuity is a reliability boundary

Running out of subscription capacity prevents verification, recovery, and the next task. Therefore:

- optional agents stop before correctness checks stop;
- optional reviews stop before required risk review;
- broad research stops once the decision has enough evidence;
- no background agent, steward, auditor, gardener, or tournament runs by default;
- capacity uncertainty selects the cheaper path;
- a high-risk task that cannot afford required review remains `review-pending`; it does not become “done” through self-confidence.

There is no made-up “20% reserve” because providers may not expose a stable percentage. The reserve is operational:

> Keep enough capacity to verify, repair one failed attempt, and report honestly. If that reserve cannot be estimated, do not spend it on optional fan-out.

### The lever order

Apply these levers in order:

1. **Delete unnecessary work.** No speculative abstraction, duplicated review, repeated full suite, or irrelevant research.
2. **Make facts mechanical.** Derive graphs, scope, command unions, hashes, and budgets without model turns.
3. **Reduce fixed context.** Small router, compact module loader, deferred skills and tool schemas.
4. **Retrieve just in time.** Paths, direct edges, and one explanation path instead of entire reports.
5. **Keep tool intermediates cold.** Aggregate deterministically; return only the decision-relevant result.
6. **Compact at phase boundaries.** Preserve decisions, acceptance evidence, unresolved risks, and touched paths; drop old raw output.
7. **Use one capable agent.** Avoid repeated onboarding and coordination.
8. **Add a specialist only for information compression or real parallel work.**
9. **Add independent review only when risk earns it.**

Parallelism is the last lever, not the first.

### Hot, warm, and cold context

#### Hot: loaded for the task

- root router and normal workflow;
- current project truth;
- current task contract;
- current module's compact brief;
- generated task packet only if needed.

Targets:

- module `AGENTS.md` loader: under 100 words;
- generated hot contract: about 300 words;
- mandatory size review above 500 words;
- reviewer report: under 400 words;
- no full graph, history, export list, or consumer closure.

These are guardrails, not universal constants. Increase one only after evidence shows the extra words prevent more usage than they consume.

Hot generated files change only when their task-relevant semantics change. Analyzer versions, input digests, timestamps, full provenance, and other volatile evidence stay in cold machine reports. Otherwise harmless regeneration creates review noise and repeatedly invalidates cached context.

#### Warm: loaded after a demonstrated edge

- direct provider or consumer declaration;
- changed intent invariant;
- one scope explanation path;
- one relevant domain page;
- one failure-specific skill.

#### Cold: queried for diagnosis

- full graph and analyzer output;
- complete API report;
- transitive consumer closure;
- foreign internals;
- history, audits, attestations, and experiments;
- unrelated skills and tool definitions.

### One fact, one read

Stable information is referenced by path and, where useful, digest. It is not copied into a plan, copied again into every worker prompt, copied into reviewer prompts, and copied back into reconciliation.

Workers write durable artifacts directly when the artifact is the product. Handoffs contain only:

- status;
- paths changed or produced;
- exact verification result;
- unresolved blocker or risk;
- a pointer to large evidence.

---

## 8. Personal operating modes

These are task postures, not a scheduler framework or new configuration product.

### Conserve — personal default

Use when subscription capacity is unknown, recently exhausted, or explicitly scarce.

- One implementation agent.
- No optional exploration subagent.
- No reviewer for touch-up/low.
- Medium gets at most one review only if radius/risk justifies it.
- High risk retains required review or stops pending.
- One focused research pass; stop when the decision is supported.
- Scoped commands during iteration; full gate once.
- No speculative later stage.

### Normal

Use the existing radius × size profile and review limits. It still defaults to one agent. A second worker requires the fan-out admission test.

### Burst — explicit opt-in

Use only when the user explicitly values wall-clock over usage for this task and capacity is available.

- Same acceptance criteria and safety gates.
- Central coordinator.
- Bounded, low-conflict packets.
- No per-worker reviewer.
- One convergence review.
- Record the extra usage.

Burst is never remembered as the new default from one successful task.

---

## 9. The actual workflow

### Step 0 — Protect continuity

Before broad work:

1. note Conserve, Normal, or explicit Burst;
2. identify the minimum acceptance evidence;
3. avoid optional agents if capacity is unknown;
4. reserve the final verification and one repair attempt.

Completion: the task has a usage posture and correctness evidence will not be sacrificed to exploration.

### Step 1 — Calibrate radius × size

Radius buys review and verification. Size buys planning and durable state.

| Profile | Default execution |
| --- | --- |
| Touch-up | Scoped verify and diff self-review |
| Low | Scoped verify, fired lenses, changed-surface inspection |
| Medium | Compact task contract, at most one independent review, full/gate-equivalent closeout |
| High | Durable plan and slices, whole-goal review, full closeout |

A one-line shared trust change can be small work with high radius. A multi-day isolated feature can be large work with low radius. Do not collapse these axes.

### Step 2 — Query scope mechanically

Use the existing scope engine first. With modules, extend it to:

1. map changed paths to modules;
2. distinguish supported-private changes from public/policy/unknown changes;
3. compute conservative consumer closure;
4. return one concise reason path per widened area;
5. union verification commands once;
6. surface unmapped, stale, dynamic, and ambiguous facts.

The model receives the answer, not the whole graph.

### Step 3 — Load the minimum context

Start from hot context. Load warm context only when:

- the task crosses a real public edge;
- a failure points at another module;
- a named project rule covers the changed source;
- an unknown in the brief must be resolved.

Every foreign internal read should answer a named question. If several foreign reads are needed, record that as evidence the brief or boundary may be wrong—do not automatically expand the permanent brief.

### Step 4 — Pin intent

For medium/high work, record:

- fixed point;
- current and desired behavior;
- non-goals;
- acceptance evidence;
- highest stable test seam;
- assumptions and unresolved decisions;
- changed public cut edges.

The human owns material behavioral intent. The agent owns routine implementation choices. If tests are generated by the same agent, they must be checked against this independent task intent rather than treated as proof of the agent's interpretation.

### Step 5 — Choose the agent topology

One agent is the answer unless every fan-out condition passes:

1. At least two substantive packets exist.
2. The packets can progress independently now, not after a sequential prerequisite.
3. Write overlap and shared mutable state are low.
4. Changed public cut edges are stable or can be declared cheaply first.
5. Each packet is large enough to repay fresh context.
6. The expected wall-clock reduction matters.
7. The user's usage posture permits the spend.
8. Convergence and verification are cheaper than sequential execution.

If any answer is unclear, remain single-agent.

#### Good fan-out

- two independent adapters behind an already agreed interface;
- separate migrations with disjoint files and identical acceptance shape;
- independent external research directions whose concise findings will replace large noisy corpora;
- implementation and a genuinely independent read-only investigation when both are critical-path blockers.

#### Bad fan-out

- agent per folder or module;
- planner, implementer, tester, reviewer, and fixer as permanent roles;
- sequential core logic split among workers;
- multiple workers editing the same interface;
- a small task whose onboarding exceeds implementation;
- “independence” created by splitting a cohesive change;
- review agents spawned because implementation agents exist.

### Step 6 — Implement through the shortest useful feedback loop

1. Reproduce or pin the behavior.
2. Change the smallest coherent slice.
3. Use red/green when a real behavioral seam exists.
4. Run the narrow exact-symptom check.
5. Run scoped verification after a coherent edit.
6. Inspect changed output where tests cannot establish appearance or interaction.
7. Do not ask a model to rediscover facts the scope/analyzer tool can compute.

### Step 7 — Converge once

If multiple workers were admitted:

1. workers write only their bounded scopes;
2. workers return paths and exact evidence, not narratives;
3. the coordinator inspects the actual diff and current tree;
4. changed public edges are integrated deliberately;
5. deterministic scope is recomputed;
6. conflicts are resolved once;
7. the converged result is reviewed at the widest useful seam.

Peer-to-peer agent chatter is avoided. It duplicates context and weakens central intent control.

### Step 8 — Review by risk, not by worker count

Review has two axes:

- **Intent:** did the result implement the requested behavior and only that behavior?
- **Engineering risk:** correctness, security, product, and complexity lenses fired by the actual diff.

Budgets remain:

- touch-up/low: self-review;
- medium: no more than one concise independent report;
- high: no more than two orthogonal final reports when authorized and affordable.

One changed public edge may receive an early focused review if it unlocks independent work. That replaces—not adds to—duplicated later review of the same question unless the edge materially changes.

Reviewer output is a claim. Verify each material finding before spending implementation tokens on it. Re-review only the affected axis after a material change.

### Step 9 — Close out and compact

1. Run the full gate once, unless the final scoped run is gate-equivalent.
2. Map each acceptance criterion to inspected evidence.
3. Record exact verifier evidence and honest state.
4. Update only stale durable knowledge.
5. Remove scratch output and superseded docs.
6. Compact the task to decisions, paths, evidence, risks, and next action.
7. Record cheap usage evidence without another model summary.

The workflow ends when the accepted result and evidence exist, not when agents run out of possible commentary.

---

## 10. Capsule artifacts

### One authored policy

Extend `llm-workflow.config.json`; do not add a second repository config.

Illustrative shape:

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

Authored policy contains only decisions:

- name and root;
- purpose;
- mode;
- public entry paths;
- allowed module/platform edges;
- high-value intent invariants;
- local verify command;
- owned temporary exceptions.

Do not hand-maintain actual exports, imports, consumers, or side effects.

### One generated fact report

The target repository's selected analyzer produces deterministic facts:

- actual direct module/platform dependencies;
- direct consumers;
- supported public entries/exports;
- unresolved or dynamic edges;
- observed side-effect categories;
- analyzer identity/version and input digest;
- blind spots and staleness.

The kit consumes a concrete analyzer's JSON. The analyzer may be a target-repository development dependency; the kit remains dependency-free. A universal adapter abstraction is deferred until repeated stacks expose a real common seam.

### One compact hot contract

Illustrative output:

```markdown
# exposure

Purpose: calculate and present account exposure without owning price retrieval.

Public paths:
- src/features/exposure/public.ts

Intent:
- EXP-1 totals use canonical token units.
- EXP-2 unavailable pricing is explicit, never treated as zero.

Edges:
- allowed/actual: pricing, platform/api-client
- consumers: query with `scope.mjs --module exposure --consumers`

Effects:
- network through platform/api-client
- shared state: read only
- blind spot: dynamic query keys are not resolved

Verify: pnpm --filter exposure test
Isolation: module-scoped, shared test process
```

The exact syntax is not the thesis. Determinism, size, provenance, and usefulness are.

### One task packet when needed

```markdown
Goal: add pending-price state to exposure summary
Intent: task/2026-07-24-exposure.md
Writable: src/features/exposure/**, tests/exposure/**
Public edges: pricing/public.ts (unchanged)
Read via: exposure/CONTRACT.md, pricing/CONTRACT.md
Verify: pnpm --filter exposure test
Return: changed paths, verifier result, unresolved blocker
```

It points to sources instead of copying them.

### One query interface

The scope tool should answer small questions:

- what module owns this path?
- why is this consumer affected?
- what public edge connects these modules?
- what facts are unknown or stale?
- what verification commands cover this change?

It should not print the full graph unless explicitly requested for diagnosis.

---

## 11. New workflows enabled by the corrected idea

These are new combinations to test, not battle-tested claims.

### 1. Context escrow

The agent starts with the hot brief. A foreign read is an explicit escalation:

```text
question -> requested path/edge -> finding -> keep cold or improve brief
```

This makes missing context observable without stuffing every possible answer into every prompt. Repeated identical escalations justify adding one compact fact; one-off exploration stays cold.

### 2. Boundary rent review

For each observed/enforced module, count:

- hot words loaded;
- policy edits;
- false scope expansions;
- foreign reads still required;
- escapes caught;
- irrelevant checks avoided.

If the boundary does not repay its rent, shrink its brief, demote it, merge it, or remove the capsule overlay. Architecture has no tenure.

### 3. Intent checksum

Stable intent lives in one task/spec artifact. Tests, work packets, and review refer to its path and invariant IDs. If a contract test changes, tooling flags which intent evidence moved; it does not guess whether semantics weakened.

This reduces duplicated prose and self-laundered specifications.

### 4. Unknown-driven widening

Static analysis often misses dynamic imports, string keys, reflection, shared tables, events, and ambient state. Instead of claiming completeness:

```text
known private -> local scope
known public -> consumer closure
unknown/stale/dynamic -> wider verification + named reason
```

False positives cost time. False negatives can invalidate the entire trust model. The asymmetry is intentional.

### 5. Proof-carrying handoff

A handoff is accepted only with:

- changed/produced paths;
- exact command and result;
- scope/profile;
- unresolved assumptions;
- public edge status.

The coordinator reads the artifacts and diff, not a long worker narrative. This reduces telephone-game tokens while keeping claims inspectable.

### 6. Review dividend

Mechanical facts and structural violations move out of semantic review and into tools. The saved review budget is spent on the questions tools cannot answer:

- is the intent correct?
- is the test oracle independent?
- is a trust decision acceptable?
- did the public behavior change intentionally?

The goal is not fewer safeguards; it is fewer repeated model passes over mechanically decidable material.

### 7. Usage circuit breaker

When capacity appears scarce:

1. stop optional workers/research;
2. preserve current durable state;
3. run the narrowest correctness check;
4. spend the remaining budget on final gate or one repair;
5. report `review-pending` if required evidence cannot be afforded.

This is graceful degradation for the workflow itself.

### 8. Task-shaped parallelism

The dependency graph proposes possible packets, but the current task determines them. The cut optimizes:

- cohesive intent;
- stable interface;
- low write overlap;
- independently verifiable output;
- high ratio of useful work to fresh-context cost.

This is the part of the capsule thesis most likely to be distinctive. It must be measured against one strong agent, not against a weak unstructured baseline.

---

## 12. Adversarial audit

### Failure: architecture theater

Symptoms:

- every folder gets a contract;
- generated reports are committed but never queried;
- agents update metadata more than behavior;
- public seams are shallow pass-throughs;
- no capsule is ever demoted.

Defense: qualification gate, observed-first adoption, hot-word budget, boundary rent, and deletion as a valid outcome.

### Failure: token paradox

A brief can reduce search calls but still increase total input because it is loaded on every task.

Defense: measure hot context plus foreign reads and tool output, not search count alone. Keep a brief only when net use improves or a named correctness benefit justifies the cost.

### Failure: parallelism paradox

Parallel work shortens elapsed time but repeats context, increases merge/review work, and exhausts the subscription.

Defense: single-agent default, explicit Burst, shared task budget, admission test, no per-worker reviewers, one convergence seam.

### Failure: bad boundary obedience

Agents may follow a wrong module boundary more consistently than humans, making poor architecture self-reinforcing.

Defense: boundaries are evidence hypotheses, observed before enforced, reviewed through locality/depth/deletion, and reversible.

### Failure: graph false confidence

Dynamic imports, event names, shared persistence, reflection, generated code, or analyzer bugs create missing edges.

Defense: provenance, freshness, analyzer failure checks, supported-stack statement, named blind spots, unknown-driven widening, and held-out seeded cases.

### Failure: platform/kernel sink

All modules are allowed to use `platform`, so business logic and shared state migrate there.

Defense:

- platform remains dependency-bottom and mechanically thin;
- capability-specific wrappers, not a generic “common” layer;
- cross-module shared-state writes are high-risk;
- churn or business rules trigger eviction into a real module;
- platform changes widen review.

### Failure: review explosion

Each worker gets a reviewer; reviewers disagree; another agent reconciles; the final diff receives another review.

Defense: review budget belongs to the task profile, not the task graph. Review the widest useful seam once.

### Failure: spec laundering

The implementation agent writes its interpretation, its tests, and its own passing proof.

Defense: user-owned intent, stable acceptance examples/invariants, grounded tests, held-out cases for important claims, and separate human judgment at high-risk edges.

### Failure: metric gaming

Agents reduce counted file reads while loading huge command output, or reduce tool calls by making one enormous call.

Defense: use a small basket: provider usage when available, context/tool-output size, agents/turns, foreign reads, retries, verification work, correctness, and interruption. No single proxy is the target.

### Failure: telemetry tax

Measuring tokens creates another database, dashboard, summarizer, and agent pass.

Defense: provider totals or deterministic counters only. No prompt contents, no telemetry LLM, no service in v1.

### Failure: stale authority

An old design or skill reintroduces rejected mechanics.

Defense: this document's authority order, a short compatibility pointer in future docs, and eventually rewriting `design.md`, `pilot.md`, and `skills/capsule.md` to the surviving workflow.

### Failure: research laundering

Vendor workloads, preprints, and withdrawn papers are quoted as universal proof.

Defense: evidence tier and scope accompany every claim. Withdrawn FastContext evidence is excluded. Local success remains local until replicated.

---

## 13. Pet project protocol

The pet project is both a product worth building and a workflow experiment. Product motivation matters, but the experiment must not be shaped to guarantee a capsule win.

### Architecture at birth

Use:

- a normal modular monolith;
- vertical slices for product capabilities;
- canonical public entry paths only where real consumers exist;
- one thin platform layer for true cross-cutting I/O;
- real behavior tests at stable seams;
- one repository config and the existing scope workflow.

Do not:

- create 4–8 capsules because the pilot needs samples;
- assign permanent agents to modules;
- create an event bus, broker, schema registry, or fake framework without product need;
- distribute the system into services for agent parallelism;
- freeze unstable interfaces early;
- make every test or file a capsule artifact.

### Stage 0 — Baseline before capsules

Build at least one representative end-to-end slice using the current workflow. Stage 0 does not load or follow the stale `skills/capsule.md`; there is no capsule behavior yet.

Record cheaply:

- accepted behavior and held-out evidence;
- provider-reported usage if visible;
- otherwise agents, turns, major context/tool-output reads, foreign files, review passes, retries;
- verification commands and elapsed time;
- any subscription interruption.

Exit: a usable baseline exists and measurement costs almost nothing.

### Stage 1 — One observed brief

Before capsule edits begin:

- reconcile `design.md`, `pilot.md`, the capsule README/status, open-question outcomes, and `skills/capsule.md` to this document and the MVP;
- update the capsule skill last, after rationale and implementation requirements agree;
- choose the target repository's first concrete analyzer;
- place the converged paper trail in one durable revision when the user authorizes the commit.

Choose one boundary that already passes depth, deletion, locality, and test-seam checks.

- Add optional module config.
- Consume one concrete analyzer.
- Generate one deterministic hot brief.
- Make failure, emptiness, ambiguity, and staleness visible.
- Do not enforce or move production code.

Exit:

- a cold agent can name purpose, public paths, direct edges, verification, and blind spots;
- total context on representative tasks is lower than the foreign reading it replaces;
- no correctness loss;
- hot output stays inside its budget.

If the brief is not useful, stop. Do not “improve” it by dumping the full repository graph into context.

### Stage 2 — Scope integration

- Map changed paths to the observed module.
- Keep supported-private changes local.
- Widen public, policy, unknown, stale, and dynamic changes.
- Explain each widening with a short path.
- Preserve command union and gate equivalence.

Exit:

- zero known affected false negatives in fixtures and pilot tasks;
- unknown analysis widens rather than narrows;
- irrelevant commands decrease on at least some normal tasks;
- old non-module behavior stays green.

False positives are recorded and pruned only with evidence.

### Stage 3 — One enforced boundary

Choose the most stable, valuable observed boundary.

- Reject deep/internal imports.
- Reject undeclared supported edges.
- Add the smallest valuable direct-I/O rule.
- Add owned, expiring exceptions.
- Seed legal and illegal cases.

Exit:

- all supported seeded escapes fail with useful remediation;
- the legal route remains easier than bypassing it;
- normal product work does not create persistent policy churn;
- maintenance and context cost remain below the defects/review/verification cost removed.

If observation helps and enforcement does not, observed-only is a successful final design.

### Stage 4 — One multi-agent experiment

Only after Stages 0–3 pay:

1. Choose a real cross-module feature with at least two substantive independent packets.
2. Fix the spec and held-out acceptance evidence.
3. Run a one-agent baseline on a clean branch.
4. Run a centralized task-packet version on another clean branch.
5. Use the same model class, tools, acceptance evidence, and measurement method where possible.
6. Include contract setup, worker onboarding, duplicated reads, merge work, reviews, retries, and convergence.

For the personal default, fan-out is promoted only if:

- correctness is not worse;
- provider usage, or the agreed usage proxy, is not materially higher;
- wall-clock is meaningfully lower;
- no subscription interruption or reserve breach occurs.

If fan-out is faster but materially more expensive, it remains explicit Burst only. If it is neither cheaper nor meaningfully faster, drop the fleet claim and keep the useful module context/scope work.

### Stage 5 — Consolidate or kill

- Delete unused fields and cold details from hot context.
- Demote or merge boundaries that do not pay rent.
- Keep only observed/enforced behavior proven useful.
- Reconcile or tombstone superseded capsule documents and the capsule skill.
- Run the repository gate and record the final decision.

Exit: one current source of truth and a measured answer, including a legitimate answer of “single-agent observed modules only.”

---

## 14. Measurement and decision record

Use one small row per accepted task. Do not add an agent to write it.

```markdown
| task | mode | profile | capsule state | provider usage/proxy |
| agents/turns | hot context | foreign reads | checks | reviews/retries |
| wall-clock | held-out result | interruption | decision |
```

### Primary outcomes

1. Accepted correctness against independent or held-out evidence.
2. Provider usage per accepted task when available.
3. Subscription-exhaustion interruption.

### Secondary outcomes

- hot context words/bytes;
- foreign internal reads;
- large tool-output events;
- irrelevant verification avoided;
- agents and turns;
- review and retry count;
- wall-clock;
- scope false negatives and false positives;
- boundary escapes caught and at what stage;
- policy/report maintenance time.

### Decision rules

- A normal-task feature that increases usage without a named correctness or continuity gain is removed or moved out of hot context.
- A generated fact that is not used for context, scope, enforcement, or measurement is not generated.
- An observed module with poor boundary fit is demoted.
- An analyzer with uncontainable blind spots is narrowed to a supported subset or rejected.
- An enforcement rule that repeatedly needs exceptions is redesigned or removed.
- A parallel workflow that threatens continuity is not a personal default.
- One pilot win is permission for another test, not universal promotion.

Do not optimize a proxy after seeing results. If the provider exposes no usage value, choose the proxy basket before the comparison and keep it fixed.

---

## 15. Hard invariants for implementation

1. Single agent by default.
2. Subscription continuity is an acceptance criterion.
3. Correctness evidence is protected before optional speed work.
4. Authored intent, generated facts, and verification evidence remain separate.
5. Generated facts replace hand-maintained claims; they do not duplicate them.
6. The full graph never becomes default prompt context.
7. “Not analyzed” never becomes “not affected.”
8. One changed fact is read once and referenced by path thereafter.
9. Verification commands are unioned and run once per required point.
10. Review count follows risk/profile, never worker count.
11. Public contract-first work occurs only at changed coordination cut edges.
12. Ownership is stable; agent allocation is task-specific.
13. Observed side effects route review and scope; they do not claim security.
14. New capsule machinery extends the existing config and scope engine.
15. No separate CLI family, database, broker, daemon, dashboard, or general adapter framework in v1.
16. No internal semver, universal fakes, pending expectations, attestation, mutation gate, or regeneration authority in v1.
17. Every capsule pays boundary rent and may be shrunk, merged, demoted, or deleted.
18. Every research claim carries its evidence scope.

---

## 16. First prompt for the pet project

```text
Start the pet project under CODEX_PERSONAL_WORKFLOW.md.

Operate in Conserve mode unless I explicitly authorize Burst. Use one
implementation agent. Build a normal modular monolith; do not create agents,
services, contracts, or abstractions merely to demonstrate capsules.

First:
1. Pin the product behavior and held-out acceptance evidence.
2. Calibrate radius × size.
3. Implement one representative end-to-end slice with the current workflow.
4. Record the cheap Stage 0 usage proxy and exact verification evidence.
5. Stop at the Stage 0 decision boundary.

Only after the baseline is accepted:
1. nominate one existing deep/local/stable module boundary;
2. add one observed, generated, budgeted brief;
3. compare total context and correctness with the baseline;
4. retain, shrink, or remove it from measured evidence.

Do not enable enforcement before observed mode pays. Do not run the multi-agent
experiment before Stages 0–3 pass. Never trade final verification capacity for
optional fan-out.
```

---

## 17. Final readiness checklist

### Concept

- [x] The capsule has a narrow definition.
- [x] Source, task, runtime, and security boundaries are separated.
- [x] The previous architecture qualification rules are restored.
- [x] Authored policy and generated facts have separate ownership.
- [x] The side-effect inventory is scoped to review routing, not security.
- [x] Novelty is described as an unproven composition.

### Token economy

- [x] Subscription continuity is the primary operational constraint.
- [x] One agent is the default.
- [x] Fan-out has an explicit admission test.
- [x] Review count is capped independently of module/worker count.
- [x] Hot, warm, and cold context are defined.
- [x] Graph and tool intermediates stay outside default context.
- [x] Optional work degrades before correctness evidence.
- [x] Provider opacity is recorded rather than hidden by fake precision.

### Implementation

- [x] Existing config and scope tooling are extended rather than duplicated.
- [x] One-stack-first analyzer strategy is explicit.
- [x] Folder, observed, and enforced are the only v1 states.
- [x] Stage exits and kill paths are defined.
- [x] The pet project begins with a non-capsule baseline.
- [x] Parallelism is delayed until lower stages pay.
- [x] Superseded drafts are named and cannot silently override this decision.

### Remaining uncertainty

- [ ] The generated brief has not yet demonstrated net usage savings.
- [ ] The module graph has not yet demonstrated adequate recall on a live target.
- [ ] Enforcement maintenance has not yet been priced.
- [ ] Task-shaped fan-out has not beaten a strong single-agent baseline.
- [ ] The broader composition has not earned a novelty claim through results.

Those unchecked boxes are not reasons to write more architecture documents. They are exactly what the staged pet project is designed to answer.

## Decision

> **We are ready for the pet project. Start Stage 0.**

Build the useful product first, instrument the normal single-agent path, and make each capsule feature earn promotion. The likely winning architecture is not “many agents inside many boxes.” It is a legible modular monolith with a tiny evidence compiler that gives the right agent the right facts, the right scope, and the right proof—while leaving enough subscription capacity to finish the work.
