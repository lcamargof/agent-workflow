# Open Questions & Honest Risks

Working doc. Add entries with evidence; resolve entries by moving the decision into `design.md` and leaving a one-line tombstone here. Don't delete the reasoning trail — cross-model reviewers need it.

## Unresolved design decisions

**Q1 — Machine-block format: YAML vs S-expressions vs JSON5.**
arXiv 2604.13108 found S-expression descriptors caught 100% of injected structural errors while YAML silently corrupted 50%. YAML wins on human/agent familiarity (training distribution!), S-exprs on verifiability. Candidate resolution: YAML frontmatter but *always* schema-validated by capsule-lint (never parsed loose), which recovers most of the gap. Undecided.

**Q2 — `channels` v1 scope.**
Settled: code surface + I/O surface (network endpoints, owned storage, shared state atoms). Undecided: events, timing/cron, env vars. Bias: leave out until an incident proves the gap (evidence-gated growth). Watch item: shared storage is the boundary-killer in general systems — two capsules on one table have no boundary regardless of imports.

**Q3 — Mutation-score threshold and cost.**
Mutation testing is expensive and gameable (equivalent mutants, score-gaming). What threshold gates regeneration? Run on contract suite only (small) or whole capsule? Frequency: per regeneration only, not per change? No data — pilot question.

**Q4 — Pending-expectation mechanics without a broker.**
Pact needs a broker (SPOF, we saw the outage reports). In-repo alternative: pending expectations live as files in the consumer's capsule, referenced by the whole-graph check, promoted into the provider's contract suite on adoption. Needs a concrete file format + lifecycle states. Undesigned.

**Q5 — Orchestrator signing: what exactly does a countersignature add?**
The verifier already signs (hashes). Is the orchestrator's countersign (a) authorization for cross-capsule contract changes, (b) a record that the consumer closure was notified, (c) both? Also: where do signatures live — in CONTRACT.md (churny) or a sidecar ledger (second file)? Undecided.

**Q6 — Capsule qualification test.**
Not everything is a capsule. Draft criteria: stable boundary (survived ≥1 design iteration), own test seam, single ownership. Features under active design churn stay normal folders — otherwise contract churn eats the benefit. Where's the line for "stable enough"? Gut says: second time a feature ships without boundary changes. Unvalidated.

**Q7 — Box depth cap: 1 or 2?**
Fleet throughput argues for shallow (critical path). the reference app's reality (a product module → overview → charts) suggests 2 meaningful levels exist. Cap at 2, lint warns at 2, refuses at 3? Undecided.

**Q8 — Naming.**
"Capsule architecture" appears unclaimed; "context capsule" is taken by unrelated products. Decide before anything public.

## Honest risks (keep these in view; they are the strongest counterarguments)

**R1 — Architecture theater.** Dozens of contracts, logs, fakes maintained by agents while runtime coupling is misunderstood anyway. Likely failure mode if capsules become documentation-first. Defense: the four invariants are all *checks*, not documents; prose is capped; every field is evidence-gated. This risk is the reason the design refuses richness.

**R2 — Contract churn under startup conditions.** Designs change weekly here. If boundaries are cut wrong, every feature fights the architecture — and *agents comply with bad boundaries forever* (humans grumble; agents don't). Defense: qualification test (Q6), churn trigger in design.md §9, and the packwerk lesson — cut along how code runs, not how it reads. Residual risk: real. Only the pilot prices it.

**R3 — Reward-hacking the gates.** Agents will weaken assertions, write vacuous properties, and game mutation scores (AlphaVerus documented verifier reward-hacking; we've seen mild local versions). Defense: mutation score + adversarial spec audit + cross-model review. This is an arms race, not a solved problem — say so out loud.

**R4 — Behavioral gap is permanent.** 73–81% of suite-passing patches overfit. "Regenerate with zero review" is only ever claimed for low-risk tiers, behind the full gate stack, and it is *still an experiment*. Anyone who quotes this project as "tests make review unnecessary" is misquoting it.

**R5 — Model-diversity is not independence.** Knight & Leveson 1986: independently-written programs share failure modes. Model families share plausibility bias and sycophancy toward existing code. Cross-model audit reduces variance; mechanical gates remain the floor.

**R6 — Overfitting the architecture to 2026-model weaknesses.** Context rot shrinks with every model generation. The design's answer: context ceremony stays thin (it may depreciate); verification, ownership, computable blast radius, and replaceability carry the value (they appreciate with fleet size). Check every proposed addition against: "does this still pay if context windows were infinite?"

**R7 — Economics unmeasured.** No data anywhere on contract-maintenance cost vs coordination savings under heavy agent usage. This is the actual bet. The pilot's primary job is pricing it; see `pilot.md` for the (deliberately lightweight) measures.

**R8 — Self-laundering specs.** The agent that writes the code also writes the tests validating its own misunderstanding. Spec grounding is the one measured lever (+38pp when tests derive from intent the agent didn't invent). Consequence: for medium+ risk, the human owns contract *intent* (the prose invariants + acceptance shape); agents implement and extend. This does not automate away.

## Ramblings / parked ideas (not commitments)

- **Permission decay** (Android hibernation model): requires-entries unused for N months get flagged for removal by the lint. Cheap, cute, later.
- **Witness artifacts**: when the surface diff claims "breaking," emit a compiling counterexample against the old surface (cargo-semver-checks study pattern). Great for cross-model audit; later.
- **Capsule steward agent**: background low-cost model auditing semantic doc staleness (the one thing lints can't catch — our improvements.md said SDK 0.2.0 while package.json said 0.5.0). Deterministic tools own structural truth; steward audits semantic truth; it proposes, never rewrites while implementation agents are live.
- **Fleet dashboard**: "which capsules changed, what risk tier, what consumer closure" — falls out of the graph + signatures once those exist. Don't build the dashboard before the data.
- **Contract-first deploys of the org**: spawn the fleet to match the capsule graph per task (programmable Conway). The orchestration skill (not yet written) owns this; keep the orchestrator thin (every hub in the research became the SPOF).
- **Cold-stranger drills**: periodically hand a capsule to a fresh foreign-model agent with zero repo context and score whether contract+docs sufficed. That's the context-boundary equivalent of a fire drill, and doubles as the acceptance test for §8 audit-chain quality.
